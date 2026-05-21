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

const TEXT_SHADOW = '0 0 20px rgba(0,0,0,0.9), 0 0 40px rgba(0,0,0,0.7), 0 2px 8px rgba(0,0,0,1)';

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

    const MAX_SCREENSHOT_BYTES = 2 * 1024 * 1024;
    const screenshotSrc =
      roast.screenshotBase64 && roast.screenshotBase64.length < MAX_SCREENSHOT_BYTES
        ? `data:image/jpeg;base64,${roast.screenshotBase64}`
        : null;

    // Strip any leading/trailing quote characters the model may have added
    const roastText = roast.roast.replace(/^[“”‘’"']+|[“”‘’"']+$/g, '').trim();

    const PAD_H = 80;
    const PAD_V = 44;
    const CAT_MAX_H = 640;

    const img = new ImageResponse(
      (
        <div
          style={{
            width: W,
            height: H,
            display: 'flex',
            position: 'relative',
            fontFamily: 'Inter',
            overflow: 'hidden',
          }}
        >
          {/* LAYER 1 — website screenshot */}
          {screenshotSrc && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={screenshotSrc}
              alt=""
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: 'top',
                display: 'flex',
              }}
            />
          )}

          {/* LAYER 2 — dark overlay */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: W,
              height: H,
              background: screenshotSrc ? 'rgba(0,0,0,0.65)' : '#000000',
              display: 'flex',
            }}
          />

          {/* LAYER 3 — content */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: W,
              height: H,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              paddingTop: PAD_V,
              paddingBottom: PAD_V,
              paddingLeft: PAD_H,
              paddingRight: PAD_H,
              overflow: 'hidden',
            }}
          >
            {/* Cat — grows to fill space above text section */}
            <div
              style={{
                display: 'flex',
                flexGrow: 1,
                width: '100%',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: 0,
                marginBottom: 40,
              }}
            >
              {catSrc && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={catSrc}
                  alt=""
                  style={{
                    maxHeight: CAT_MAX_H,
                    maxWidth: '100%',
                    objectFit: 'contain',
                    display: 'flex',
                    filter: 'drop-shadow(0 0 50px rgba(0,0,0,0.8)) drop-shadow(0 0 20px rgba(0,0,0,1))',
                  }}
                />
              )}
            </div>

            {/* Text section */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                width: '100%',
                flexShrink: 0,
                alignItems: 'center',
              }}
            >
              {/* Tier · Score% COOKED — centered */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-end',
                  justifyContent: 'center',
                  marginBottom: 14,
                  width: '100%',
                }}
              >
                <span
                  style={{
                    fontSize: 78,
                    fontWeight: 700,
                    color: '#FF3B30',
                    letterSpacing: 4,
                    lineHeight: 1,
                    textShadow: TEXT_SHADOW,
                  }}
                >
                  {tier.name}
                </span>
                <span
                  style={{
                    fontSize: 78,
                    fontWeight: 700,
                    color: '#ffffff',
                    letterSpacing: 2,
                    lineHeight: 1,
                    marginLeft: 20,
                    textShadow: TEXT_SHADOW,
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
                  background: 'rgba(255,255,255,0.2)',
                  marginBottom: 60,
                  display: 'flex',
                  flexShrink: 0,
                }}
              />

              {/* Roast text — centered */}
              <div
                style={{
                  display: 'flex',
                  width: '100%',
                  justifyContent: 'center',
                  marginBottom: 28,
                }}
              >
                <span
                  style={{
                    fontSize: 44,
                    fontWeight: 600,
                    color: '#ffffff',
                    lineHeight: 1.5,
                    textAlign: 'center',
                    textShadow: TEXT_SHADOW,
                  }}
                >
                  &ldquo;{roastText}&rdquo;
                </span>
              </div>

              {/* Footer — domain left, brand right */}
              <div
                style={{
                  display: 'flex',
                  width: '100%',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span
                  style={{
                    fontSize: 22,
                    fontWeight: 600,
                    color: 'rgba(255,255,255,0.3)',
                    textShadow: TEXT_SHADOW,
                  }}
                >
                  {roast.domain}
                </span>
                <span
                  style={{
                    fontSize: 22,
                    fontWeight: 600,
                    color: 'rgba(255,255,255,0.3)',
                    textShadow: TEXT_SHADOW,
                  }}
                >
                  getroasted.wtf
                </span>
              </div>
            </div>
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
