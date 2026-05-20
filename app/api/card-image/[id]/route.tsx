import { ImageResponse } from 'next/og';
import { getRoast } from '@/lib/store';

export const maxDuration = 30;
export const dynamic = 'force-dynamic';

// 2x — 1600px output, sharp at 800px display
const S = 2;
const W = 800 * S;
const H = 520 * S;

async function loadInterBlack(): Promise<ArrayBuffer | null> {
  try {
    const css = await fetch(
      'https://fonts.googleapis.com/css2?family=Inter:wght@900&display=swap',
      {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1)' },
        signal: AbortSignal.timeout(5000),
      },
    ).then((r) => r.text());
    const url = css.match(/src: url\(([^)]+)\) format\('woff2'\)/)?.[1];
    if (!url) return null;
    return fetch(url).then((r) => r.arrayBuffer());
  } catch {
    return null;
  }
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const [roast, fontData] = await Promise.all([getRoast(id), loadInterBlack()]);
  if (!roast) return new Response('Not found', { status: 404 });

  // Skip screenshot if base64 is too large — Satori crashes mid-stream on big images
  const screenshotSrc =
    roast.screenshotBase64 && roast.screenshotBase64.length < 200 * 1024
      ? `data:image/jpeg;base64,${roast.screenshotBase64}`
      : null;

  const fonts = fontData
    ? [{ name: 'Inter', data: fontData, weight: 900 as const, style: 'normal' as const }]
    : [];

  try { return new ImageResponse(
    (
      <div
        style={{
          width: W,
          height: H,
          position: 'relative',
          background: '#000',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* LAYER 1 — screenshot fills entire card */}
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

        {/* LAYER 3 — all content */}
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
          }}
        >
          {/* Browser chrome bar */}
          <div
            style={{
              width: W,
              background: 'rgba(0,0,0,0.45)',
              paddingTop: 10 * S,
              paddingBottom: 10 * S,
              paddingLeft: 14 * S,
              paddingRight: 14 * S,
              display: 'flex',
              alignItems: 'center',
              gap: 10 * S,
              flexShrink: 0,
              borderBottomWidth: 1 * S,
              borderBottomStyle: 'solid',
              borderBottomColor: 'rgba(255,255,255,0.1)',
            }}
          >
            {/* traffic light dots */}
            <div style={{ display: 'flex', gap: 5 * S, flexShrink: 0 }}>
              <div style={{ width: 6 * S, height: 6 * S, borderRadius: 6 * S, background: '#ff5f57' }} />
              <div style={{ width: 6 * S, height: 6 * S, borderRadius: 6 * S, background: '#ffbd2e' }} />
              <div style={{ width: 6 * S, height: 6 * S, borderRadius: 6 * S, background: '#28c840' }} />
            </div>
            {/* address pill */}
            <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
              <div
                style={{
                  background: 'rgba(0,0,0,0.4)',
                  borderRadius: 4 * S,
                  paddingTop: 4 * S,
                  paddingBottom: 4 * S,
                  paddingLeft: 14 * S,
                  paddingRight: 14 * S,
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 10 * S, fontFamily: 'monospace' }}>
                  {roast.url.replace(/^https?:\/\//, '')}
                </span>
              </div>
            </div>
          </div>

          {/* Centered main content */}
          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {/* Domain */}
            <div style={{ display: 'flex', marginBottom: 14 * S }}>
              <span
                style={{
                  fontSize: 13 * S,
                  fontWeight: 600,
                  color: 'rgba(255,255,255,0.35)',
                  letterSpacing: 4 * S,
                  fontFamily: 'monospace',
                }}
              >
                {roast.domain.toUpperCase()}
              </span>
            </div>

            {/* Score */}
            <div style={{ display: 'flex' }}>
              <span
                style={{
                  fontSize: 150 * S,
                  fontWeight: 900,
                  fontFamily: 'Inter',
                  color: '#ff4520',
                  lineHeight: 1,
                  textShadow: '0 0 20px rgba(255,58,31,0.9)',
                }}
              >
                {roast.score}%
              </span>
            </div>

            {/* COOKED */}
            <div style={{ display: 'flex' }}>
              <span
                style={{
                  fontSize: 76 * S,
                  fontWeight: 900,
                  fontFamily: 'Inter',
                  color: '#ff4520',
                  letterSpacing: 6 * S,
                  lineHeight: 0.9,
                  textShadow: '0 0 20px rgba(255,58,31,0.9)',
                }}
              >
                COOKED
              </span>
            </div>

            {/* Progress bar */}
            <div style={{ display: 'flex', marginTop: 20 * S, marginBottom: 20 * S }}>
              <div
                style={{
                  width: 100 * S,
                  height: 2 * S,
                  background: '#ff3a1f',
                  borderRadius: 2 * S,
                  display: 'flex',
                }}
              />
            </div>

            {/* Quote */}
            <div style={{ display: 'flex', width: 400 * S, justifyContent: 'center' }}>
              <span
                style={{
                  fontSize: 15 * S,
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
          <div style={{ display: 'flex', marginBottom: 16 * S }}>
            <span
              style={{
                fontSize: 11 * S,
                color: 'rgba(255,255,255,0.18)',
                fontFamily: 'monospace',
                letterSpacing: 2 * S,
              }}
            >
              getroasted.wtf
            </span>
          </div>
        </div>
      </div>
    ),
    { width: W, height: H, fonts },
  ); } catch (err) {
    console.error('Card generation error:', err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
