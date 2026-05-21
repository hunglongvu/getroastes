import { ImageResponse } from 'next/og';
import { getRoast } from '@/lib/store';
import fs from 'fs';
import path from 'path';

export const maxDuration = 30;
export const dynamic = 'force-dynamic';

const W = 1600;
const H = 1040;

const interBoldData = (() => {
  try {
    const buf = fs.readFileSync(path.join(process.cwd(), 'public/fonts/inter-bold.ttf'));
    return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
  } catch {
    return null;
  }
})();

function getCatTier(score: number): { name: string; file: string } {
  if (score <= 19) return { name: 'BARELY COOKED', file: 'barely-cooked.png' };
  if (score <= 39) return { name: 'LIGHTLY TOASTED', file: 'lightly-toasted.png' };
  if (score <= 59) return { name: 'DEEP FRIED', file: 'deep-fried.png' };
  if (score <= 79) return { name: 'CRISPY', file: 'crispy.png' };
  return { name: 'BURNED', file: 'burned.png' };
}

function loadCatImage(file: string): string | null {
  try {
    const buf = fs.readFileSync(path.join(process.cwd(), 'public/cats', file));
    return `data:image/png;base64,${buf.toString('base64')}`;
  } catch {
    return null;
  }
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const roast = await getRoast(id);
    if (!roast) return new Response('Not found', { status: 404 });

    const tier = getCatTier(roast.score);
    const catSrc = loadCatImage(tier.file);

    const PAD_H = 80;
    const PAD_V = 56;
    const CAT_H = 460;

    const img = new ImageResponse(
      (
        <div
          style={{
            width: W,
            height: H,
            background: '#000000',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            paddingTop: PAD_V,
            paddingBottom: PAD_V,
            paddingLeft: PAD_H,
            paddingRight: PAD_H,
            fontFamily: 'Inter',
          }}
        >
          {/* Cat image */}
          <div
            style={{
              display: 'flex',
              height: CAT_H,
              width: '100%',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 36,
              flexShrink: 0,
            }}
          >
            {catSrc ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={catSrc}
                alt=""
                style={{
                  height: CAT_H,
                  maxWidth: '100%',
                  objectFit: 'contain',
                  display: 'flex',
                }}
              />
            ) : (
              <div style={{ height: CAT_H, display: 'flex' }} />
            )}
          </div>

          {/* Tier name · Score% COOKED */}
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-end',
              marginBottom: 20,
              flexShrink: 0,
            }}
          >
            <span
              style={{
                fontSize: 60,
                fontWeight: 700,
                color: '#FF3B30',
                letterSpacing: 4,
                lineHeight: 1,
              }}
            >
              {tier.name}
            </span>
            <span
              style={{
                fontSize: 60,
                fontWeight: 700,
                color: '#ffffff',
                letterSpacing: 2,
                lineHeight: 1,
                marginLeft: 20,
              }}
            >
              · {roast.score}% COOKED
            </span>
          </div>

          {/* Divider */}
          <div
            style={{
              width: '100%',
              height: 1,
              background: 'rgba(255,255,255,0.15)',
              marginBottom: 24,
              display: 'flex',
              flexShrink: 0,
            }}
          />

          {/* Roast text */}
          <div
            style={{
              display: 'flex',
              width: '100%',
              justifyContent: 'center',
              marginBottom: 32,
              flexGrow: 1,
            }}
          >
            <span
              style={{
                fontSize: 36,
                fontWeight: 600,
                color: '#ffffff',
                textAlign: 'center',
                lineHeight: 1.55,
              }}
            >
              &ldquo;{roast.roast}&rdquo;
            </span>
          </div>

          {/* Footer */}
          <div
            style={{
              display: 'flex',
              width: '100%',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexShrink: 0,
            }}
          >
            <span style={{ fontSize: 22, fontWeight: 600, color: 'rgba(255,255,255,0.25)' }}>
              {roast.domain}
            </span>
            <span style={{ fontSize: 22, fontWeight: 600, color: 'rgba(255,255,255,0.25)' }}>
              getroasted.wtf
            </span>
          </div>
        </div>
      ),
      {
        width: W,
        height: H,
        fonts: interBoldData
          ? [{ name: 'Inter', data: interBoldData, weight: 700 as const, style: 'normal' as const }]
          : [],
      },
    );

    const buffer = await img.arrayBuffer();
    return new Response(buffer, {
      headers: { 'Content-Type': 'image/png' },
    });
  } catch (err) {
    console.error('Card generation error:', err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
