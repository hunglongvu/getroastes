import { type NextRequest } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { getRoast } from '@/lib/store';
import { RARITY_STYLES, CHARACTERS } from '@/lib/rarity';

function scoreColor(score: number): string {
  if (score <= 40) return '#E24B4A';
  if (score <= 70) return '#EF9F27';
  return '#639922';
}

function exitCode(score: number): string {
  if (score <= 15) return 'SEGFAULT: NO_VALUE_PROP';
  if (score <= 30) return 'exit code: COOKED';
  if (score <= 50) return 'WARNING: NEEDS_REFACTOR';
  if (score <= 70) return 'status: ships but barely';
  if (score <= 85) return 'build: passing';
  return 'merge approved';
}

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

const RARITY_SYMBOLS: Record<string, string> = {
  MYTHIC: '◈',
  LEGENDARY: '▲',
  EPIC: '⬡',
  RARE: '◆',
  COMMON: '○',
};

let fontPromise: Promise<{ r400: ArrayBuffer; r700: ArrayBuffer; r800: ArrayBuffer }> | null = null;

function getFonts() {
  if (!fontPromise) {
    const base = path.join(process.cwd(), 'node_modules/@fontsource/inter/files');
    fontPromise = Promise.all([
      fs.readFile(path.join(base, 'inter-latin-400-normal.woff')),
      fs.readFile(path.join(base, 'inter-latin-700-normal.woff')),
      fs.readFile(path.join(base, 'inter-latin-800-normal.woff')),
    ]).then(([n, b, h]) => ({
      r400: n.buffer.slice(n.byteOffset, n.byteOffset + n.byteLength),
      r700: b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength),
      r800: h.buffer.slice(h.byteOffset, h.byteOffset + h.byteLength),
    }));
  }
  return fontPromise;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type El = any;

function flex(style: Record<string, unknown>, children: El | El[]): El {
  return {
    type: 'div',
    props: {
      style: { display: 'flex', ...style },
      children,
    },
  };
}

function text(content: string, style: Record<string, unknown>): El {
  return { type: 'span', props: { style, children: content } };
}

const W = 680;
const CAT_H = 340;

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const roast = await getRoast(id);
  if (!roast) return new Response('Not found', { status: 404 });

  const [fonts] = await Promise.all([getFonts()]);

  const rarityStyle = RARITY_STYLES[roast.rarity];
  const character = CHARACTERS[roast.rarity];
  const borderColor = rarityStyle.border;
  const sColor = scoreColor(roast.score);
  const code = exitCode(roast.score);
  const symbol = RARITY_SYMBOLS[roast.rarity] ?? '○';
  const cleanStderr = roast.stderr.replace(/\*\*(.*?)\*\*/g, '$1');
  const stderrSnippet = cleanStderr.length > 160 ? cleanStderr.slice(0, 157) + '...' : cleanStderr;

  let catSrc = '';
  try {
    const buf = await fs.readFile(
      path.join(process.cwd(), 'public', 'cats', `${roast.rarity.toLowerCase()}.jpg`),
    );
    catSrc = `data:image/jpeg;base64,${buf.toString('base64')}`;
  } catch { /* no cat image — skip */ }

  const card = flex(
    {
      flexDirection: 'column',
      width: W,
      backgroundColor: '#080808',
      border: `3px solid ${borderColor}`,
      borderRadius: 16,
      overflow: 'hidden',
    },
    [
      // ── HEADER ──
      flex(
        {
          flexDirection: 'column',
          backgroundColor: hexToRgba(borderColor, 0.2),
          borderBottom: `1px solid ${hexToRgba(borderColor, 0.3)}`,
          padding: '12px 20px 10px',
        },
        [
          // Row 1: domain + score HP
          flex({ justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }, [
            text(roast.domain, { color: '#ffffff', fontSize: 14, fontWeight: 600 }),
            flex({ alignItems: 'baseline', gap: 4 }, [
              text(String(roast.score), { color: sColor, fontSize: 26, fontWeight: 800, lineHeight: 1 }),
              text('HP', { color: '#555', fontSize: 11 }),
            ]),
          ]),
          // Row 2: rarity badge + character
          flex({ justifyContent: 'space-between', alignItems: 'center' }, [
            text(`⬡ ${roast.rarity}`, { color: borderColor, fontSize: 11 }),
            text(`${character.emoji} ${character.name}`, { color: borderColor, fontSize: 11 }),
          ]),
        ],
      ),

      // ── ILLUSTRATION: screenshot background + cat foreground ──
      {
        type: 'div',
        props: {
          style: { position: 'relative', width: W, height: CAT_H, overflow: 'hidden', backgroundColor: '#0d0d0d', display: 'flex' },
          children: [
            // Layer 1: screenshot background
            roast.screenshotBase64
              ? {
                  type: 'img',
                  props: {
                    src: `data:image/jpeg;base64,${roast.screenshotBase64}`,
                    style: {
                      position: 'absolute', top: 0, left: 0,
                      width: W, height: CAT_H,
                      objectFit: 'cover', objectPosition: 'top',
                      opacity: 0.4,
                    },
                  },
                }
              : null,
            // Layer 2: gradient overlay
            {
              type: 'div',
              props: {
                style: {
                  position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                  background: 'linear-gradient(to bottom, rgba(0,0,0,0.2), rgba(8,8,8,0.7))',
                  display: 'flex',
                },
              },
            },
            // Layer 3: cat foreground centered
            catSrc
              ? {
                  type: 'img',
                  props: {
                    src: catSrc,
                    style: {
                      position: 'absolute', bottom: 0,
                      left: (W - 200) / 2,
                      width: 200, height: 240,
                      objectFit: 'cover', objectPosition: 'top',
                    },
                  },
                }
              : null,
          ].filter(Boolean),
        },
      },

      // ── MOVE BAR ──
      flex(
        {
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '10px 20px',
          backgroundColor: hexToRgba(borderColor, 0.1),
          borderTop: `1px solid ${hexToRgba(borderColor, 0.2)}`,
          borderBottom: `1px solid ${hexToRgba(borderColor, 0.2)}`,
        },
        [
          text(`⚡ ${code}`, { color: borderColor, fontSize: 11, letterSpacing: 1 }),
          flex(
            { width: 8, height: 8, borderRadius: 4, backgroundColor: sColor },
            [],
          ),
        ],
      ),

      // ── ROAST TEXT ──
      flex(
        { flexDirection: 'column', padding: '20px 20px 16px', gap: 12 },
        [
          text(`"${roast.roast}"`, { color: '#ffffff', fontSize: 18, fontWeight: 700, lineHeight: 1.4 }),
          flex({ height: 1, backgroundColor: '#1a1a1a' }, []),
          text('// real talk', { color: '#E24B4A', fontSize: 10, letterSpacing: 1 }),
          text(stderrSnippet, { color: '#666', fontSize: 12, lineHeight: 1.6 }),
        ],
      ),

      // ── FOOTER ──
      flex(
        {
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '10px 20px',
          borderTop: '1px solid #111',
        },
        [
          text('getroasted.wtf', { color: '#222', fontSize: 10 }),
          text(`${symbol} ${roast.rarity}`, { color: hexToRgba(borderColor, 0.5), fontSize: 10 }),
        ],
      ),
    ],
  );

  // Wrap in a sized container so satori knows total height
  const root = flex(
    { width: W, flexDirection: 'column' },
    [card],
  );

  try {
    const svg = await satori(root, {
      width: W,
      height: 950,
      fonts: [
        { name: 'Inter', data: fonts.r400, weight: 400, style: 'normal' },
        { name: 'Inter', data: fonts.r700, weight: 700, style: 'normal' },
        { name: 'Inter', data: fonts.r800, weight: 800, style: 'normal' },
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
