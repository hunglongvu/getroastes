import { ImageResponse } from 'next/og';
import { getRoast } from '@/lib/store';

export const maxDuration = 30;
export const dynamic = 'force-dynamic';

const S = 2;
const W = 800 * S;
const H = 520 * S;

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const roast = await getRoast(id);
    if (!roast) return new Response('Not found', { status: 404 });

    const screenshotSrc =
      roast.screenshotBase64 && roast.screenshotBase64.length < 200 * 1024
        ? `data:image/jpeg;base64,${roast.screenshotBase64}`
        : null;

    const img = new ImageResponse(
      (
        <div
          style={{
            width: W,
            height: H,
            background: '#000',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            border: '1px solid rgba(255,255,255,0.12)',
          }}
        >
          {/* LAYER 1 — screenshot */}
          {screenshotSrc && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={screenshotSrc}
              alt=""
              width={W}
              height={H}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                objectFit: 'cover',
                display: 'flex',
              }}
            />
          )}

          {/* LAYER 2 — gradient overlay: lighter top, darker bottom */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: W,
              height: H,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div style={{ width: W, height: H / 2, background: 'rgba(0,0,0,0.55)', display: 'flex' }} />
            <div style={{ width: W, height: H / 2, background: 'rgba(0,0,0,0.88)', display: 'flex' }} />
          </div>

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
              justifyContent: 'center',
              paddingTop: 40,
              paddingBottom: 40,
            }}
          >
            {/* Browser dots */}
            <div
              style={{
                position: 'absolute',
                top: 32,
                left: 40,
                display: 'flex',
                flexDirection: 'row',
              }}
            >
              <div style={{ width: 14, height: 14, borderRadius: 7, background: '#FF5F57', display: 'flex' }} />
              <div style={{ width: 14, height: 14, borderRadius: 7, background: '#FEBC2E', display: 'flex', marginLeft: 8 }} />
              <div style={{ width: 14, height: 14, borderRadius: 7, background: '#28C840', display: 'flex', marginLeft: 8 }} />
            </div>

            <div style={{ display: 'flex', marginBottom: 16 }}>
              <span
                style={{
                  fontSize: 28,
                  fontWeight: 600,
                  color: 'rgba(255,255,255,0.35)',
                  letterSpacing: 8,
                }}
              >
                {roast.domain.toUpperCase()}
              </span>
            </div>

            <div style={{ display: 'flex' }}>
              <span
                style={{
                  fontSize: 240,
                  fontWeight: 900,
                  color: '#ff8c00',
                  lineHeight: 1,
                  textShadow: '0 0 40px rgba(255,140,0,0.6)',
                }}
              >
                {roast.score}%
              </span>
            </div>

            <div style={{ display: 'flex' }}>
              <span
                style={{
                  fontSize: 140,
                  fontWeight: 900,
                  color: '#ff8c00',
                  lineHeight: 0.9,
                  letterSpacing: 12,
                  textShadow: '0 0 40px rgba(255,140,0,0.6)',
                }}
              >
                COOKED
              </span>
            </div>

            <div style={{ display: 'flex', marginTop: 40, marginBottom: 40 }}>
              <div
                style={{
                  width: 200,
                  height: 4,
                  background: '#ff8c00',
                  borderRadius: 4,
                  display: 'flex',
                }}
              />
            </div>

            <div style={{ display: 'flex', width: 800, justifyContent: 'center' }}>
              <span
                style={{
                  fontSize: 44,
                  color: 'rgba(255,255,255,0.95)',
                  textAlign: 'center',
                  lineHeight: 1.55,
                  fontWeight: 600,
                }}
              >
                {roast.roast}
              </span>
            </div>
          </div>

          {/* Footer */}
          <div
            style={{
              position: 'absolute',
              bottom: 32,
              display: 'flex',
            }}
          >
            <span
              style={{
                fontSize: 18,
                fontWeight: 600,
                color: 'rgba(255,255,255,0.6)',
                letterSpacing: 2,
              }}
            >
              getroasted.wtf
            </span>
          </div>
        </div>
      ),
      { width: W, height: H },
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
