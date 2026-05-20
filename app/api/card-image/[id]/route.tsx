import { ImageResponse } from 'next/og';
import { getRoast } from '@/lib/store';

export const maxDuration = 30;
export const dynamic = 'force-dynamic';

const S = 2;
const W = 800 * S;
const H = 520 * S;

async function loadOswald(): Promise<ArrayBuffer | null> {
  try {
    return fetch(
      'https://fonts.gstatic.com/s/oswald/v53/TK3_WkUHHAIjg75cFRf3bXL8LICs13NvgUFoZAaRliE.ttf',
      { signal: AbortSignal.timeout(5000) },
    ).then((r) => r.arrayBuffer());
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
    const [roast, oswaldData] = await Promise.all([getRoast(id), loadOswald()]);
    if (!roast) return new Response('Not found', { status: 404 });

    const screenshotSrc =
      roast.screenshotBase64 && roast.screenshotBase64.length < 200 * 1024
        ? `data:image/jpeg;base64,${roast.screenshotBase64}`
        : null;

    const fonts = oswaldData
      ? [{ name: 'Oswald', data: oswaldData, weight: 700 as const, style: 'normal' as const }]
      : [];

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
                  fontSize: 160,
                  fontWeight: 700,
                  fontFamily: 'Oswald',
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
                  fontSize: 80,
                  fontWeight: 700,
                  fontFamily: 'Oswald',
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
                  fontSize: 22,
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
      { width: W, height: H, fonts },
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
