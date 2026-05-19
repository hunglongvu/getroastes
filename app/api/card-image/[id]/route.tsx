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

const W = 800;
const H = 900;
const PAD = 56;

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
        {/* 1. HEADER ROW */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: `${PAD}px ${PAD}px 16px ${PAD}px`,
        }}>
          <span style={{ color: '#cccccc', fontSize: 17, fontFamily: 'monospace' }}>{roast.domain}</span>
          <span style={{ color: rColor, fontSize: 17, fontFamily: 'monospace', letterSpacing: '0.15em', fontWeight: 900 }}>{diag}</span>
        </div>

        {/* 2. SCREENSHOT — full bleed */}
        {screenshotSrc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={screenshotSrc}
            alt={roast.domain}
            width={W}
            height={300}
            style={{ objectFit: 'cover', objectPosition: 'top' }}
          />
        ) : (
          <div style={{ width: W, height: 300, background: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: '#333', fontSize: 12 }}>no screenshot</span>
          </div>
        )}

        {/* 3. SCORE BLOCK */}
        <div style={{ display: 'flex', flexDirection: 'column', padding: `40px ${PAD}px 0 ${PAD}px` }}>
          <div style={{ fontSize: 180, fontWeight: 900, letterSpacing: -8, lineHeight: 1, color: sColor, display: 'flex' }}>
            {roast.score}%
          </div>
          <div style={{ fontSize: 20, letterSpacing: '0.3em', color: '#999', marginTop: 8, display: 'flex', fontFamily: 'monospace', fontWeight: 700 }}>
            COOKED SCORE
          </div>
        </div>

        {/* 4. DIVIDER */}
        <div style={{ height: 1, background: '#1a1a1a', margin: `24px ${PAD}px`, display: 'flex' }} />

        {/* 5. ROAST QUOTE */}
        <div style={{
          fontSize: 38, fontWeight: 900, lineHeight: 1.4, color: '#ffffff',
          padding: `0 ${PAD}px 48px ${PAD}px`,
          display: 'flex', flexWrap: 'wrap',
          borderLeft: `4px solid ${rColor}`,
          marginLeft: PAD,
          paddingLeft: 24,
          paddingRight: PAD,
        }}>
          &ldquo;{roast.roast}&rdquo;
        </div>

        {/* 6. BOTTOM BAR */}
        <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', padding: `0 ${PAD}px 40px ${PAD}px`, marginTop: 'auto' }}>
          <span style={{ color: '#888', fontSize: 16, fontFamily: 'monospace' }}>getroasted.wtf</span>
        </div>
      </div>
    ),
    { width: W, height: H },
  );
}
