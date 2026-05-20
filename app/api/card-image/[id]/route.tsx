import { ImageResponse } from 'next/og';
import { getRoast } from '@/lib/store';

// 2x — render at 1600px, retina-sharp at 800px display size
const S = 2;
const W = 800 * S;
const H = 660 * S;
const PAD = 36 * S;
const RED = '#ff3a1f';

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

  const barWidth = W - PAD * 2;
  const filledWidth = Math.round((roast.score / 100) * barWidth);

  return new ImageResponse(
    (
      <div
        style={{
          background: '#0a0a0a',
          width: `${W}px`,
          height: `${H}px`,
          display: 'flex',
          flexDirection: 'column',
          color: '#e5e5e5',
        }}
      >
        {/* 1. BROWSER FRAME */}
        <div style={{
          margin: `${PAD}px ${PAD}px 0 ${PAD}px`,
          border: `${1 * S}px solid #222`,
          borderRadius: 8 * S,
          overflow: 'hidden',
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column',
        }}>
          {/* URL bar */}
          <div style={{
            background: '#161616',
            borderBottom: `${1 * S}px solid #222`,
            padding: `${10 * S}px ${14 * S}px`,
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
            {/* address bar */}
            <div style={{
              flex: 1,
              display: 'flex',
              justifyContent: 'center',
            }}>
              <div style={{
                background: '#111',
                borderRadius: 4 * S,
                padding: `${4 * S}px ${16 * S}px`,
                display: 'flex',
                alignItems: 'center',
                maxWidth: '70%',
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
              width={W - PAD * 2}
              height={180 * S}
              style={{ objectFit: 'cover', objectPosition: 'top' }}
            />
          ) : (
            <div style={{ width: W - PAD * 2, height: 180 * S, background: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: '#333', fontSize: 11 * S }}>no screenshot</span>
            </div>
          )}
        </div>

        {/* 2. DOMAIN */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: `${20 * S}px ${PAD}px ${8 * S}px`, flexShrink: 0 }}>
          <span style={{ fontSize: 18 * S, fontWeight: 700, color: '#ffffff', fontFamily: 'monospace', letterSpacing: '0.04em' }}>
            {roast.domain}
          </span>
        </div>

        {/* 3. SCORE + COOKED — stacked tight */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
          <span style={{ fontSize: 72 * S, fontWeight: 900, color: RED, lineHeight: 0.85, display: 'flex', letterSpacing: `${-3 * S}px` }}>
            {roast.score}
          </span>
          <span style={{ fontSize: 72 * S, fontWeight: 900, color: RED, lineHeight: 0.85, display: 'flex', letterSpacing: `${-3 * S}px` }}>
            COOKED
          </span>
        </div>

        {/* 4. PROGRESS BAR */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: `${16 * S}px ${PAD}px`, flexShrink: 0 }}>
          <div style={{ width: barWidth, height: 3 * S, background: '#1e1e1e', borderRadius: 3 * S, display: 'flex' }}>
            <div style={{ width: filledWidth, height: 3 * S, background: RED, borderRadius: 3 * S, display: 'flex' }} />
          </div>
        </div>

        {/* 5. ROAST QUOTE */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: `${4 * S}px ${PAD}px ${12 * S}px`, flexShrink: 0 }}>
          <span style={{ fontSize: 16 * S, color: '#aaaaaa', textAlign: 'center', lineHeight: 1.5, fontWeight: 500 }}>
            {roast.roast}
          </span>
        </div>

        {/* 6. FOOTER */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: `${8 * S}px ${PAD}px ${PAD}px`, flexShrink: 0 }}>
          <span style={{ fontSize: 10 * S, color: '#222', fontFamily: 'monospace', letterSpacing: '0.1em' }}>
            getroasted.wtf
          </span>
        </div>
      </div>
    ),
    { width: W, height: H },
  );
}
