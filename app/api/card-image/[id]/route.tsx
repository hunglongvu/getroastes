import { ImageResponse } from 'next/og';
import { getRoast } from '@/lib/store';

function rarityColor(rarity: string): string {
  const map: Record<string, string> = {
    MYTHIC: '#d946ef',
    LEGENDARY: '#FFB800',
    EPIC: '#8b5cf6',
    RARE: '#3b82f6',
    COMMON: '#71717a',
  };
  return map[rarity] ?? '#71717a';
}

function survivalColor(score: number): string {
  if (score >= 80) return '#ff4444';
  if (score >= 60) return '#ff8c00';
  if (score >= 40) return '#eab308';
  if (score >= 20) return '#3b82f6';
  return '#22c55e';
}

function diagnosis(score: number): string {
  if (score >= 80) return 'BUILDING IN PUBLIC, DYING IN PRIVATE';
  if (score >= 60) return 'THE WAITLIST WAS JUST FRIENDS';
  if (score >= 40) return 'BUILT FOR A MARKET OF ONE (YOU)';
  if (score >= 20) return 'YOUR MOM IS YOUR ONLY USER';
  return 'ALIVE ON CRUNCHBASE, NOWHERE ELSE';
}

// 2x — render at 1600px so it's retina-sharp when displayed at 800px
const S = 2;
const W = 800 * S;
const H = 900 * S;
const PAD = 32 * S;

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const roast = await getRoast(id);
  if (!roast) return new Response('Not found', { status: 404 });

  const rColor = rarityColor(roast.rarity);
  const sColor = survivalColor(roast.score);
  const diag = diagnosis(roast.score);
  const screenshotSrc = roast.screenshotBase64
    ? `data:image/jpeg;base64,${roast.screenshotBase64}`
    : null;

  return new ImageResponse(
    (
      <div
        style={{
          background: '#080808',
          width: `${W}px`,
          height: `${H}px`,
          display: 'flex',
          flexDirection: 'column',
          color: '#e5e5e5',
        }}
      >
        {/* 1. HEADER */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: `${20 * S}px ${PAD}px ${16 * S}px ${PAD}px`,
          flexShrink: 0,
        }}>
          <span style={{ color: '#666', fontSize: 13 * S, fontFamily: 'monospace', letterSpacing: '0.05em' }}>
            {roast.domain}
          </span>
          <span style={{ color: rColor, fontSize: 11 * S, fontFamily: 'monospace', letterSpacing: '0.2em', fontWeight: 700 }}>
            {diag}
          </span>
        </div>

        {/* 2. SCREENSHOT — full bleed */}
        {screenshotSrc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={screenshotSrc}
            alt={roast.domain}
            width={W}
            height={220 * S}
            style={{ objectFit: 'cover', objectPosition: 'top', flexShrink: 0 }}
          />
        ) : (
          <div style={{ width: W, height: 220 * S, background: '#111', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: '#333', fontSize: 12 * S }}>no screenshot</span>
          </div>
        )}

        {/* 3. SCORE BLOCK — centered */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: `${32 * S}px ${PAD}px 0 ${PAD}px`, flexShrink: 0 }}>
          <div style={{ fontSize: 140 * S, fontWeight: 900, letterSpacing: `${-6 * S}px`, lineHeight: 1, color: sColor, display: 'flex' }}>
            {roast.score}%
          </div>
          <div style={{ fontSize: 22 * S, fontWeight: 700, letterSpacing: '0.3em', color: '#777', marginTop: 8 * S, display: 'flex', fontFamily: 'monospace' }}>
            COOKED SCORE
          </div>
        </div>

        {/* 4. DIVIDER */}
        <div style={{ height: 1 * S, background: '#1a1a1a', margin: `${24 * S}px ${PAD}px`, flexShrink: 0, display: 'flex' }} />

        {/* 5. ROAST QUOTE */}
        <div style={{
          margin: `0 ${PAD}px 0 ${28 * S}px`,
          borderLeft: `${4 * S}px solid ${rColor}`,
          padding: `0 ${28 * S}px ${28 * S}px ${16 * S}px`,
          display: 'flex',
          flexWrap: 'wrap',
          flexShrink: 0,
        }}>
          <span style={{ fontSize: 22 * S, fontWeight: 900, color: '#ffffff', lineHeight: 1.4 }}>
            &ldquo;{roast.roast}&rdquo;
          </span>
        </div>

        {/* spacer — pushes bottom bar down (marginTop: auto not supported by Satori) */}
        <div style={{ flex: 1, display: 'flex' }} />

        {/* 6. BOTTOM BAR */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: `${16 * S}px ${PAD}px ${24 * S}px ${PAD}px`,
          flexShrink: 0,
        }}>
          <span style={{ color: '#555', fontSize: 13 * S, fontFamily: 'monospace' }}>getroasted.wtf</span>
          <span style={{ color: rColor, fontSize: 11 * S, fontFamily: 'monospace', letterSpacing: '0.15em' }}>{diag}</span>
        </div>
      </div>
    ),
    { width: W, height: H },
  );
}
