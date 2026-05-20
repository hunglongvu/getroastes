import { ImageResponse } from 'next/og';
import { getRoast } from '@/lib/store';

// 2x output — 1600px renders sharp at 800px display size
const S = 2;
const W = 800 * S;
const H = 680 * S;

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const roast = await getRoast(id);
  if (!roast) return new Response('Not found', { status: 404 });

  const screenshotSrc = roast.screenshotBase64
    ? `data:image/jpeg;base64,${roast.screenshotBase64}`
    : null;

  return new ImageResponse(
    (
      <div
        style={{
          background: '#0a0a0a',
          width: W,
          height: H,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        {/* 1. BROWSER FRAME */}
        <div style={{
          width: W,
          display: 'flex',
          flexDirection: 'column',
          flexShrink: 0,
        }}>
          {/* URL bar */}
          <div style={{
            width: W,
            background: '#161616',
            borderBottomWidth: 1 * S,
            borderBottomStyle: 'solid',
            borderBottomColor: '#222',
            paddingTop: 9 * S,
            paddingBottom: 9 * S,
            paddingLeft: 14 * S,
            paddingRight: 14 * S,
            display: 'flex',
            alignItems: 'center',
            gap: 10 * S,
          }}>
            {/* traffic light dots */}
            <div style={{ display: 'flex', gap: 5 * S, flexShrink: 0 }}>
              <div style={{ width: 6 * S, height: 6 * S, borderRadius: 6 * S, background: '#ff5f57' }} />
              <div style={{ width: 6 * S, height: 6 * S, borderRadius: 6 * S, background: '#ffbd2e' }} />
              <div style={{ width: 6 * S, height: 6 * S, borderRadius: 6 * S, background: '#28c840' }} />
            </div>
            {/* address pill */}
            <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
              <div style={{
                background: '#111',
                borderRadius: 4 * S,
                paddingTop: 4 * S,
                paddingBottom: 4 * S,
                paddingLeft: 14 * S,
                paddingRight: 14 * S,
                display: 'flex',
                alignItems: 'center',
              }}>
                <span style={{ color: '#555', fontSize: 10 * S, fontFamily: 'monospace' }}>
                  {roast.url.replace(/^https?:\/\//, '')}
                </span>
              </div>
            </div>
          </div>

          {/* screenshot */}
          {screenshotSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={screenshotSrc}
              alt={roast.domain}
              width={W}
              height={100 * S}
              style={{ objectFit: 'cover', objectPosition: 'top' }}
            />
          ) : (
            <div style={{ width: W, height: 100 * S, background: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: '#333', fontSize: 11 * S }}>no screenshot</span>
            </div>
          )}
        </div>

        {/* 2. DOMAIN */}
        <div style={{ display: 'flex', marginTop: 18 * S, marginBottom: 4 * S }}>
          <span style={{ fontSize: 28 * S, fontWeight: 700, color: '#ffffff', fontFamily: 'monospace' }}>
            {roast.domain}
          </span>
        </div>

        {/* 3. SCORE + COOKED — stacked tight, same color */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <span style={{
            fontSize: 160 * S,
            fontWeight: 900,
            color: '#ff3a1f',
            lineHeight: 1,
            display: 'flex',
          }}>
            {roast.score}%
          </span>
          <span style={{
            fontSize: 80 * S,
            fontWeight: 900,
            color: '#ff3a1f',
            letterSpacing: 4 * S,
            lineHeight: 0.85,
            display: 'flex',
          }}>
            COOKED
          </span>
        </div>

        {/* 4. PROGRESS BAR */}
        <div style={{ display: 'flex', marginTop: 18 * S, marginBottom: 14 * S }}>
          <div style={{
            width: 120 * S,
            height: 3 * S,
            background: '#ff3a1f',
            borderRadius: 3 * S,
            display: 'flex',
          }} />
        </div>

        {/* 5. ROAST QUOTE */}
        <div style={{ display: 'flex', width: W * 0.8, justifyContent: 'center' }}>
          <span style={{
            fontSize: 24 * S,
            color: '#888888',
            textAlign: 'center',
            lineHeight: 1.5,
            fontWeight: 500,
          }}>
            {roast.roast}
          </span>
        </div>

        {/* spacer */}
        <div style={{ flex: 1, display: 'flex' }} />

        {/* 6. FOOTER */}
        <div style={{ display: 'flex', marginBottom: 16 * S }}>
          <span style={{ fontSize: 16 * S, color: '#222222', fontFamily: 'monospace' }}>
            getroasted.wtf
          </span>
        </div>
      </div>
    ),
    { width: W, height: H },
  );
}
