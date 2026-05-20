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

          {/* LAYER 2 — dark overlay */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: W,
              height: H,
              background: 'rgba(0,0,0,0.82)',
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
              justifyContent: 'center',
              paddingTop: 40,
              paddingBottom: 40,
            }}
          >
            <div style={{ display: 'flex', marginBottom: 16 }}>
              <span
                style={{
                  fontSize: 22,
                  fontWeight: 600,
                  color: 'rgba(255,255,255,0.35)',
                  letterSpacing: 8,
                  fontFamily: 'monospace',
                }}
              >
                {roast.domain.toUpperCase()}
              </span>
            </div>

            <div style={{ display: 'flex' }}>
              <span
                style={{
                  fontSize: 300,
                  fontWeight: 900,
                  color: '#ff4520',
                  lineHeight: 1,
                }}
              >
                {roast.score}%
              </span>
            </div>

            <div style={{ display: 'flex' }}>
              <span
                style={{
                  fontSize: 152,
                  fontWeight: 900,
                  color: '#ff4520',
                  lineHeight: 0.9,
                  letterSpacing: 12,
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
                  background: '#ff3a1f',
                  borderRadius: 4,
                  display: 'flex',
                }}
              />
            </div>

            <div style={{ display: 'flex', width: 800, justifyContent: 'center' }}>
              <span
                style={{
                  fontSize: 30,
                  color: 'rgba(255,255,255,0.9)',
                  textAlign: 'center',
                  lineHeight: 1.55,
                  fontWeight: 500,
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
                fontSize: 22,
                color: 'rgba(255,255,255,0.18)',
                fontFamily: 'monospace',
                letterSpacing: 4,
              }}
            >
              getroasted.wtf
            </span>
          </div>
        </div>
      ),
      { width: W, height: H },
    );

    // Await the full buffer so any Satori error throws here (where try/catch works),
    // not mid-stream where it would corrupt the response body.
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
