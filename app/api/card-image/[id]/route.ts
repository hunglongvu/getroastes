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

// Module-level font cache — one fetch per process lifetime
let fontPromise: Promise<{ normal: ArrayBuffer; bold: ArrayBuffer }> | null = null;

function getFonts() {
  if (!fontPromise) {
    fontPromise = (async () => {
      const base = path.join(
        process.cwd(),
        'node_modules/@fontsource/inter/files',
      );
      const [n, b] = await Promise.all([
        fs.readFile(path.join(base, 'inter-latin-400-normal.woff')),
        fs.readFile(path.join(base, 'inter-latin-700-normal.woff')),
      ]);
      // Slice to own ArrayBuffer (Node Buffer.buffer may be shared)
      const normal = n.buffer.slice(n.byteOffset, n.byteOffset + n.byteLength);
      const bold = b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength);
      return { normal, bold };
    })();
  }
  return fontPromise;
}

// Satori element helpers — satori accepts React-like plain objects
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

function dot(color: string): El {
  return {
    type: 'div',
    props: { style: { display: 'flex', width: 12, height: 12, borderRadius: 6, backgroundColor: color } },
  };
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const roast = await getRoast(id);
  if (!roast) return new Response('Not found', { status: 404 });

  const [fonts] = await Promise.all([getFonts()]);

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
  const PAD = 48;
  const INNER = W - PAD * 2; // 704

  const card = box(
    {
      flexDirection: 'column',
      width: W,
      backgroundColor: '#080808',
      border: `2px solid ${borderColor}`,
      borderRadius: 8,
      padding: PAD,
    },
    [
      // ── Rarity badge ──────────────────────────────────────────
      box({ fontSize: 14, fontWeight: 700, color: borderColor, marginBottom: 4 }, [
        `✦ ${roast.rarity} · ${roast.characterName} ${roast.characterEmoji}`,
      ]),

      // ── Character description ─────────────────────────────────
      box(
        { fontSize: 12, color: borderColor, opacity: 0.6, marginBottom: 24 },
        [`"${roast.characterDescription}"`],
      ),

      // ── Cat image ─────────────────────────────────────────────
      catSrc &&
        box({ flexDirection: 'column', alignItems: 'center', marginBottom: 24 }, [
          {
            type: 'img',
            props: {
              src: catSrc,
              width: 120,
              height: 120,
              style: {
                borderRadius: 8,
                border: `2px solid ${borderColor}`,
                objectFit: 'cover',
              },
            },
          },
          box({ fontSize: 12, color: borderColor, marginTop: 8 }, [
            `${roast.characterName} ${roast.characterEmoji}`,
          ]),
        ]),

      // ── Screenshot ────────────────────────────────────────────
      screenshotSrc &&
        box({ flexDirection: 'column', marginBottom: 24 }, [
          {
            type: 'img',
            props: {
              src: screenshotSrc,
              style: {
                width: INNER,
                height: 180,
                objectFit: 'cover',
                objectPosition: 'top',
                borderRadius: 8,
                border: '1px solid #1a1a1a',
              },
            },
          },
          box(
            { justifyContent: 'center', fontSize: 11, color: '#3f3f46', marginTop: 8 },
            ['// above: the crime scene'],
          ),
        ]),

      // ── Terminal dots + title bar ─────────────────────────────
      box({ alignItems: 'center', gap: 12, marginBottom: 20 }, [
        box({ gap: 6 }, [dot('#E24B4A'), dot('#EF9F27'), dot('#639922')]),
        box({ fontSize: 12, color: '#52525b' }, ['getroasted.wtf — v2.0.0']),
      ]),

      // ── Command line ──────────────────────────────────────────
      box({ flexDirection: 'row', fontSize: 13, marginBottom: 36 }, [
        span({ color: '#639922' }, '$ '),
        span({ color: '#52525b' }, 'roast --url '),
        span({ color: '#d4d4d8' }, roast.domain),
        span({ color: '#52525b' }, ' --no-mercy'),
      ]),

      // ── Score ─────────────────────────────────────────────────
      box({ flexDirection: 'column', alignItems: 'center', marginBottom: 8 }, [
        box({ fontSize: 128, fontWeight: 700, color: scoreCol, lineHeight: 1 }, [
          String(roast.score),
        ]),
        box({ fontSize: 12, color: scoreCol, letterSpacing: 3, marginTop: 8 }, [
          code.toUpperCase(),
        ]),
      ]),

      // ── Roast quote ───────────────────────────────────────────
      box(
        {
          justifyContent: 'center',
          textAlign: 'center',
          fontSize: 22,
          color: '#ffffff',
          marginTop: 36,
          marginBottom: 36,
          paddingLeft: 16,
          paddingRight: 16,
        },
        [`"${roast.roast}"`],
      ),

      // ── Stderr box ────────────────────────────────────────────
      box(
        {
          flexDirection: 'column',
          backgroundColor: '#0d0d0d',
          border: '1px solid #27272a',
          borderRadius: 6,
          padding: 16,
          marginBottom: 28,
        },
        [
          box({ fontSize: 11, color: '#E24B4A', marginBottom: 8 }, ['// real talk']),
          box({ fontSize: 13, color: '#a1a1aa', lineHeight: 1.6, flexWrap: 'wrap' }, [
            roast.stderr.replace(/\*\*/g, ''),
          ]),
        ],
      ),

      // ── Footer ────────────────────────────────────────────────
      box({ justifyContent: 'center', fontSize: 12, color: '#3f3f46' }, ['getroasted.wtf']),
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
