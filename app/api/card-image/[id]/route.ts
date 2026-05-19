import { type NextRequest } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { getRoast } from '@/lib/store';
import { RARITY_STYLES } from '@/lib/rarity';

function scoreColor(score: number): string {
  if (score <= 40) return '#E24B4A';
  if (score <= 70) return '#EF9F27';
  return '#639922';
}

function getExitCode(score: number): string {
  if (score <= 15) return 'SEGFAULT: NO_VALUE_PROP';
  if (score <= 30) return 'exit code: COOKED';
  if (score <= 50) return 'WARNING: NEEDS_REFACTOR';
  if (score <= 70) return 'status: ships but barely';
  if (score <= 85) return 'build: passing';
  return 'merge approved';
}

// Module-level font cache — one load per process lifetime
let fontPromise: Promise<{ normal: ArrayBuffer; bold: ArrayBuffer }> | null = null;

function getFonts() {
  if (!fontPromise) {
    fontPromise = (async () => {
      const base = path.join(process.cwd(), 'node_modules/@fontsource/inter/files');
      const [n, b] = await Promise.all([
        fs.readFile(path.join(base, 'inter-latin-400-normal.woff')),
        fs.readFile(path.join(base, 'inter-latin-700-normal.woff')),
      ]);
      const normal = n.buffer.slice(n.byteOffset, n.byteOffset + n.byteLength);
      const bold = b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength);
      return { normal, bold };
    })();
  }
  return fontPromise;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type El = any;

function box(style: Record<string, unknown>, children: El[]): El {
  const filtered = children.filter(Boolean);
  return {
    type: 'div',
    props: {
      style: { display: 'flex', ...style },
      children: filtered.length === 1 ? filtered[0] : filtered,
    },
  };
}

function span(style: Record<string, unknown>, text: string): El {
  return { type: 'span', props: { style: { display: 'flex', ...style }, children: text } };
}

function dot(color: string, size = 14): El {
  return {
    type: 'div',
    props: {
      style: {
        display: 'flex',
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: color,
      },
    },
  };
}

function divider(): El {
  return {
    type: 'div',
    props: { style: { display: 'flex', height: 1, backgroundColor: '#1e1e1e', marginBottom: 32 } },
  };
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const roast = await getRoast(id);
  if (!roast) return new Response('Not found', { status: 404 });

  const fonts = await getFonts();

  const rarityStyle = RARITY_STYLES[roast.rarity];
  const borderColor = rarityStyle.border;
  const scoreCol = scoreColor(roast.score);
  const code = getExitCode(roast.score);

  // Cat image → data URI
  let catSrc = '';
  try {
    const buf = await fs.readFile(
      path.join(process.cwd(), 'public', 'cats', `${roast.rarity.toLowerCase()}.jpg`),
    );
    catSrc = `data:image/jpeg;base64,${buf.toString('base64')}`;
  } catch {}

  const screenshotSrc = roast.screenshotBase64
    ? `data:image/jpeg;base64,${roast.screenshotBase64}`
    : '';

  const W = 800;
  const PAD = 56;
  const INNER = W - PAD * 2; // 688

  const card = box(
    {
      flexDirection: 'column',
      width: W,
      backgroundColor: '#080808',
      border: `2px solid ${borderColor}`,
      borderRadius: 12,
      padding: PAD,
    },
    [
      // ── Rarity badge ──────────────────────────────────────────────────
      box({ fontSize: 16, fontWeight: 700, color: borderColor, marginBottom: 6 }, [
        `✦ ${roast.rarity} · ${roast.characterName} ${roast.characterEmoji}`,
      ]),

      // ── Character description ─────────────────────────────────────────
      box(
        { fontSize: 14, fontStyle: 'italic', color: borderColor, opacity: 0.55, marginBottom: 28 },
        [`"${roast.characterDescription}"`],
      ),

      // ── Cat image ─────────────────────────────────────────────────────
      catSrc &&
        box({ flexDirection: 'column', alignItems: 'center', marginBottom: 32 }, [
          {
            type: 'img',
            props: {
              src: catSrc,
              width: 160,
              height: 160,
              style: {
                borderRadius: 12,
                border: `3px solid ${borderColor}`,
                objectFit: 'cover',
              },
            },
          },
          box({ fontSize: 15, color: borderColor, marginTop: 12 }, [
            `${roast.characterName} ${roast.characterEmoji}`,
          ]),
        ]),

      // ── Screenshot ────────────────────────────────────────────────────
      screenshotSrc &&
        box({ flexDirection: 'column', marginBottom: 32 }, [
          {
            type: 'img',
            props: {
              src: screenshotSrc,
              style: {
                width: INNER,
                height: 260,
                objectFit: 'cover',
                objectPosition: 'top',
                borderRadius: 10,
                border: '1px solid #222',
              },
            },
          },
          box(
            { justifyContent: 'center', fontSize: 12, color: '#444', marginTop: 10 },
            ['// above: the crime scene'],
          ),
        ]),

      // ── Divider ───────────────────────────────────────────────────────
      divider(),

      // ── Terminal dots + brand ─────────────────────────────────────────
      box({ alignItems: 'center', gap: 10, marginBottom: 20 }, [
        box({ gap: 8 }, [dot('#E24B4A'), dot('#EF9F27'), dot('#639922')]),
        box({ fontSize: 14, color: '#52525b' }, ['getroasted.wtf — v2.0.0']),
      ]),

      // ── Command line ──────────────────────────────────────────────────
      box({ flexDirection: 'row', fontSize: 15, marginBottom: 40 }, [
        span({ color: '#639922' }, '$ '),
        span({ color: '#52525b' }, 'roast --url '),
        span({ color: '#d4d4d8' }, roast.domain),
        span({ color: '#52525b' }, ' --no-mercy'),
      ]),

      // ── Score ─────────────────────────────────────────────────────────
      box({ flexDirection: 'column', alignItems: 'center', marginBottom: 40 }, [
        box(
          {
            fontSize: 160,
            fontWeight: 700,
            color: scoreCol,
            lineHeight: 1,
            letterSpacing: -6,
          },
          [String(roast.score)],
        ),
        box(
          {
            fontSize: 13,
            color: scoreCol,
            letterSpacing: 2,
            marginTop: 8,
          },
          [code.toUpperCase()],
        ),
      ]),

      // ── Roast quote ───────────────────────────────────────────────────
      box(
        { justifyContent: 'center', marginBottom: 40 },
        [
          box(
            {
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              fontSize: 26,
              color: '#ffffff',
              lineHeight: 1.4,
              maxWidth: 640,
              flexWrap: 'wrap',
            },
            [`"${roast.roast}"`],
          ),
        ],
      ),

      // ── Real talk box ─────────────────────────────────────────────────
      box(
        {
          flexDirection: 'column',
          backgroundColor: '#0d0d0d',
          border: '1px solid #1e1e1e',
          borderRadius: 10,
          paddingTop: 24,
          paddingBottom: 24,
          paddingLeft: 28,
          paddingRight: 28,
          marginBottom: 40,
        },
        [
          box({ fontSize: 12, color: '#E24B4A', marginBottom: 12 }, ['// real talk']),
          box(
            { fontSize: 15, color: '#888', lineHeight: 1.7, flexWrap: 'wrap' },
            [roast.stderr.replace(/\*\*/g, '')],
          ),
        ],
      ),

      // ── Footer ────────────────────────────────────────────────────────
      box({ justifyContent: 'center', fontSize: 13, color: '#333' }, ['getroasted.wtf']),
    ],
  );

  try {
    const svg = await satori(card, {
      width: W,
      fonts: [
        { name: 'Inter', data: fonts.normal, weight: 400, style: 'normal' },
        { name: 'Inter', data: fonts.bold, weight: 700, style: 'normal' },
      ],
    });

    const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: W } });
    const png = resvg.render().asPng();

    return new Response(new Uint8Array(png), {
      headers: {
        'Content-Type': 'image/png',
        'Content-Disposition': `attachment; filename="roast-${roast.domain}.png"`,
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (err) {
    console.error('card-image error:', err);
    return new Response('Failed to generate image', { status: 500 });
  }
}
