import { ImageResponse } from 'next/og';
import { getRoast } from '@/lib/store';
import fs from 'fs';
import path from 'path';

export const maxDuration = 30;
export const dynamic = 'force-dynamic';

const S = 2;
const W = 800 * S;
const H = 520 * S;
const TITLE_H = 40;

const interBoldData = (() => {
  try {
    const buf = fs.readFileSync(path.join(process.cwd(), 'public/fonts/inter-bold.ttf'));
    return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
  } catch {
    return null;
  }
})();

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
            background: '#1e1e1e',
            display: 'flex',
            flexDirection: 'column',
            borderRadius: 12,
            border: '1px solid rgba(255,255,255,0.1)',
            overflow: 'hidden',
          }}
        >
          {/* macOS title bar */}
          <div
            style={{
              width: W,
              height: TITLE_H,
              background: '#2d2d2d',
              display: 'flex',
              alignItems: 'center',
              paddingLeft: 16,
              flexShrink: 0,
            }}
          >
            <div style={{ width: 14, height: 14, borderRadius: 7, background: '#FF5F57', display: 'flex' }} />
            <div style={{ width: 14, height: 14, borderRadius: 7, background: '#FEBC2E', display: 'flex', marginLeft: 8 }} />
            <div style={{ width: 14, height: 14, borderRadius: 7, background: '#28C840', display: 'flex', marginLeft: 8 }} />
          </div>

          {/* Content area */}
          <div
            style={{
              width: W,
              height: H - TITLE_H,
              display: 'flex',
              position: 'relative',
            }}
          >
            {/* LAYER 1 — screenshot */}
            {screenshotSrc && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={screenshotSrc}
                alt=""
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  objectPosition: 'top',
                  position: 'absolute',
                  top: 0,
                  left: 0,
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
                height: H - TITLE_H,
                background: 'rgba(0,0,0,0.72)',
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
                height: H - TITLE_H,
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
                    fontWeight: 700,
                    fontFamily: 'Inter',
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
                    fontWeight: 700,
                    fontFamily: 'Inter',
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
                    fontSize: 28,
                    fontFamily: 'Inter',
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
                left: 0,
                right: 0,
                display: 'flex',
                justifyContent: 'center',
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
