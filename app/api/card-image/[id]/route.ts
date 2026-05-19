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

  let catSrc = '';
  try {
    const buf = await fs.readFile(
      path.join(process.cwd(), 'public', 'cats', `${roast.rarity.toLowerCase()}.jpg`),
    );
    catSrc = `data:image/jpeg;base64,${buf.toString('base64')}`;
  } catch {}

  const W = 800;
  const PAD = 60;

  const card = box(
    {
      flexDirection: 'column',
      justifyContent: 'space-between',
      width: W,
      height: W,
      backgroundColor: '#080808',
      border: `2px solid ${borderColor}`,
      borderRadius: 16,
      padding: PAD,
    },
    [
      // 1 · Rarity badge + character description
      box({ flexDirection: 'column' }, [
        box(
          { fontSize: 18, fontWeight: 700, color: borderColor },
          [`✦ ${roast.rarity} · ${roast.characterName} ${roast.characterEmoji}`],
        ),
        box(
          { fontSize: 15, fontStyle: 'italic', color: borderColor, opacity: 0.7, marginTop: 6 },
          [`"${roast.characterDescription}"`],
        ),
      ]),

      // 2 · Cat image
      catSrc &&
        box({ justifyContent: 'center' }, [
          {
            type: 'img',
            props: {
              src: catSrc,
              width: 180,
              height: 180,
              style: {
                borderRadius: 14,
                border: `3px solid ${borderColor}`,
                objectFit: 'cover',
              },
            },
          },
        ]),

      // 3 · Score
      box({ flexDirection: 'column', alignItems: 'center' }, [
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
            fontSize: 14,
            color: scoreCol,
            letterSpacing: 3,
            marginTop: 10,
          },
          [code.toUpperCase()],
        ),
      ]),

      // 4 · Roast quote
      box({ justifyContent: 'center' }, [
        box(
          {
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            fontSize: 28,
            color: '#ffffff',
            lineHeight: 1.4,
            maxWidth: 620,
            flexWrap: 'wrap',
          },
          [`"${roast.roast}"`],
        ),
      ]),

      // 5 · Footer
      box({ justifyContent: 'center', fontSize: 18, color: '#333' }, ['getroasted.wtf']),
    ],
  );

  try {
    const svg = await satori(card, {
      width: W,
      height: W,
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
