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

function getQuoteFontSize(text: string): number {
  const length = text.length;
  if (length < 60)  return 60;
  if (length < 120) return 50;
  if (length < 180) return 42;
  return 36;
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

    const MAX_SCREENSHOT_BYTES = 2 * 1024 * 1024;
    const screenshotSrc =
      roast.screenshotBase64 && roast.screenshotBase64.length < MAX_SCREENSHOT_BYTES
        ? `data:image/jpeg;base64,${roast.screenshotBase64}`
        : null;

    // Strip any leading/trailing quote characters the model may have added
    const roastText = roast.roast.replace(/^[“”‘’"']+|[“”‘’"']+$/g, '').trim();

    const PAD_H = 80;
    const PAD_V_TOP = 120;    // larger top pad places cat center at ~32% (optical balance)
    const PAD_V_BOTTOM = 40;
    const CAT_H = 420;
    const CAT_MAX_H = 420;

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
          {screenshotSrc ? (
            <>
              {/* LAYER 1a — website screenshot */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
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
              {/* LAYER 1b — dark overlay */}
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: W,
                  height: H,
                  background: 'rgba(0,0,0,0.65)',
                  display: 'flex',
                }}
              />
            </>
          ) : (
            <>
              {/* LAYER 1a — fallback: deep dark base */}
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: W,
                  height: H,
                  background: 'linear-gradient(160deg, #0f0f0f 0%, #080808 55%, #0c0a0a 100%)',
                  display: 'flex',
                }}
              />
              {/* LAYER 1b — fallback: subtle red glow at cat position */}
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: W,
                  height: H,
                  background: 'radial-gradient(ellipse 1000px 700px at 50% 35%, rgba(255,59,48,0.06) 0%, transparent 65%)',
                  display: 'flex',
                }}
              />
            </>
          )}

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
              paddingTop: PAD_V_TOP,
              paddingBottom: PAD_V_BOTTOM,
              paddingLeft: PAD_H,
              paddingRight: PAD_H,
              overflow: 'hidden',
            }}
          >
            {/* Cat — fixed-height container, image anchors to bottom so extra
                space goes above (fills the screenshot area), not below */}
            <div
              style={{
                display: 'flex',
                flexShrink: 0,
                width: '100%',
                height: CAT_H,
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 20,
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
                  }}
                />
              )}
            </div>

            {/* Tier · Score% COOKED */}
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'center',
                marginBottom: 12,
                width: '100%',
                flexShrink: 0,
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
                marginBottom: 16,
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
                flexShrink: 0,
              }}
            >
              <span
                style={{
                  fontSize: getQuoteFontSize(roastText),
                  fontWeight: 600,
                  color: '#ffffff',
                  lineHeight: 1.25,
                  textAlign: 'center',
                  textShadow: TEXT_SHADOW,
                }}
              >
                <span style={{ color: '#FF3B30' }}>&ldquo;</span>
                {roastText}
                <span style={{ color: '#FF3B30' }}>&rdquo;</span>
              </span>
            </div>

            {/* Spacer — pushes footer to bottom */}
            <div style={{ flexGrow: 1 }} />

            {/* Footer */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                width: '100%',
                alignItems: 'center',
                gap: 8,
                flexShrink: 0,
              }}
            >
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
              {roast.screenshotFailed && (
                <span
                  style={{
                    fontSize: 18,
                    fontWeight: 400,
                    color: 'rgba(255,255,255,0.15)',
                    letterSpacing: 1,
                  }}
                >
                  // domain roast only — site was unreachable
                </span>
              )}
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
