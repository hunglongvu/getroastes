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

const W = 680;
const CAT_H = 300;

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const roast = await getRoast(id);
  if (!roast) return new Response('Not found', { status: 404 });

  const fonts = await getFonts();

  const rarityStyle = RARITY_STYLES[roast.rarity];
  const character = CHARACTERS[roast.rarity];
  const border = rarityStyle.border;
  const sColor = scoreColor(roast.score);
  const eCode = exitCode(roast.score);
  const symbol = RARITY_SYMBOLS[roast.rarity] ?? '○';
  const cleanStderr = roast.stderr.replace(/\*\*(.*?)\*\*/g, '$1');
  const stderrSnippet = cleanStderr.length > 180 ? cleanStderr.slice(0, 177) + '...' : cleanStderr;

  let catSrc = '';
  try {
    const buf = await fs.readFile(
      path.join(process.cwd(), 'public', 'cats', `${roast.rarity.toLowerCase()}.jpg`),
    );
    catSrc = `data:image/jpeg;base64,${buf.toString('base64')}`;
  } catch { /* skip */ }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const card: any = {
    type: 'div',
    props: {
      style: {
        width: W,
        backgroundColor: '#080808',
        border: `2px solid ${border}`,
        borderRadius: 16,
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'Inter',
      },
      children: [

        // ── HEADER ──
        {
          type: 'div',
          props: {
            style: {
              backgroundColor: hexToRgba(border, 0.2),
              borderBottom: `1px solid ${hexToRgba(border, 0.33)}`,
              padding: '12px 20px 10px',
              display: 'flex',
              flexDirection: 'column',
              gap: 4,
            },
            children: [
              // domain + score HP
              {
                type: 'div',
                props: {
                  style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
                  children: [
                    { type: 'span', props: { style: { color: '#ffffff', fontSize: 15, fontWeight: 600 }, children: roast.domain } },
                    {
                      type: 'div',
                      props: {
                        style: { display: 'flex', alignItems: 'baseline', gap: 4 },
                        children: [
                          { type: 'span', props: { style: { color: sColor, fontSize: 26, fontWeight: 800, lineHeight: 1 }, children: String(roast.score) } },
                          { type: 'span', props: { style: { color: '#555', fontSize: 11 }, children: 'HP' } },
                        ],
                      },
                    },
                  ],
                },
              },
              // rarity + character
              {
                type: 'div',
                props: {
                  style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
                  children: [
                    { type: 'span', props: { style: { color: border, fontSize: 12 }, children: `⬡ ${roast.rarity}` } },
                    { type: 'span', props: { style: { color: border, fontSize: 12 }, children: `${character.emoji} ${character.name}` } },
                  ],
                },
              },
            ],
          },
        },

        // ── CAT IMAGE ──
        {
          type: 'div',
          props: {
            style: {
              width: W,
              height: CAT_H,
              backgroundColor: '#0d0d0d',
              display: 'flex',
            },
            children: catSrc
              ? [{
                  type: 'img',
                  props: {
                    src: catSrc,
                    width: W,
                    height: CAT_H,
                    style: { objectFit: 'cover', objectPosition: 'center top' },
                  },
                }]
              : [{ type: 'div', props: { style: { width: W, height: CAT_H, backgroundColor: '#111', display: 'flex' } } }],
          },
        },

        // ── MOVE BAR ──
        {
          type: 'div',
          props: {
            style: {
              backgroundColor: hexToRgba(border, 0.1),
              borderTop: `1px solid ${hexToRgba(border, 0.2)}`,
              borderBottom: `1px solid ${hexToRgba(border, 0.2)}`,
              padding: '10px 20px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            },
            children: [
              { type: 'span', props: { style: { color: border, fontSize: 12, letterSpacing: 1 }, children: `⚡ ${eCode}` } },
              { type: 'div', props: { style: { width: 8, height: 8, borderRadius: 4, backgroundColor: sColor, display: 'flex' } } },
            ],
          },
        },

        // ── ROAST TEXT ──
        {
          type: 'div',
          props: {
            style: {
              backgroundColor: '#080808',
              padding: '20px 20px 16px',
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
            },
            children: [
              { type: 'span', props: { style: { color: '#ffffff', fontSize: 20, fontWeight: 700, lineHeight: 1.4 }, children: `"${roast.roast}"` } },
              { type: 'div', props: { style: { height: 1, backgroundColor: '#1a1a1a', display: 'flex' } } },
              { type: 'span', props: { style: { color: '#E24B4A', fontSize: 11, letterSpacing: 1 }, children: '// real talk' } },
              { type: 'span', props: { style: { color: '#666', fontSize: 13, lineHeight: 1.6 }, children: stderrSnippet } },
            ],
          },
        },

        // ── FOOTER ──
        {
          type: 'div',
          props: {
            style: {
              backgroundColor: '#080808',
              borderTop: '1px solid #111',
              padding: '10px 20px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            },
            children: [
              { type: 'span', props: { style: { color: '#222', fontSize: 11 }, children: 'getroasted.wtf' } },
              { type: 'span', props: { style: { color: hexToRgba(border, 0.5), fontSize: 11 }, children: `${symbol} ${roast.rarity}` } },
            ],
          },
        },

      ],
    },
  };

  // Full-page background wrapper so satori viewport has no white edges
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const root: any = {
    type: 'div',
    props: {
      style: {
        width: W,
        minHeight: '100%',
        backgroundColor: '#080808',
        display: 'flex',
        flexDirection: 'column',
      },
      children: [card],
    },
  };

  try {
    const svg = await satori(root, {
      width: W,
      height: 720,
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
