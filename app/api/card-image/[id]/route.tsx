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
          display: 'flex',
          flexDirection: 'column',
          padding: `${PAD}px`,
          color: '#e5e5e5',
        }}
      >
        {/* TOP ROW: domain left · diagnosis right */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <span style={{ color: '#555', fontSize: 13, fontFamily: 'monospace' }}>{roast.domain}</span>
          <span style={{ color: rColor, fontSize: 12, fontFamily: 'monospace', letterSpacing: '0.15em' }}>{diag}</span>
        </div>

        {/* SCREENSHOT */}
        {screenshotSrc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={screenshotSrc}
            alt={roast.domain}
            width={W - PAD * 2}
            height={220}
            style={{ objectFit: 'cover', objectPosition: 'top', borderRadius: 8, border: '1px solid #1e1e1e', marginBottom: 32 }}
          />
        ) : (
          <div style={{ width: W - PAD * 2, height: 220, background: '#111', borderRadius: 8, border: '1px solid #1e1e1e', marginBottom: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: '#333', fontSize: 12 }}>no screenshot</span>
          </div>
        )}

        {/* SURVIVAL RATE NUMBER */}
        <div style={{ fontSize: 120, fontWeight: 900, letterSpacing: -5, lineHeight: 1, color: sColor, display: 'flex' }}>
          {roast.score}%
        </div>

        {/* SURVIVAL RATE LABEL */}
        <div style={{ fontSize: 12, letterSpacing: '0.2em', color: '#444', marginTop: 8, marginBottom: 24, display: 'flex', fontFamily: 'monospace' }}>
          COOKED SCORE
        </div>

        {/* DIVIDER */}
        <div style={{ width: '100%', height: 1, background: '#1a1a1a', marginBottom: 24, display: 'flex' }} />

        {/* ROAST QUOTE */}
        <div style={{ fontSize: 24, lineHeight: 1.4, color: '#e5e5e5', display: 'flex', flexWrap: 'wrap' }}>
          &ldquo;{roast.roast}&rdquo;
        </div>

        {/* BOTTOM BAR */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 36 }}>
          <span style={{ color: '#333', fontSize: 11, fontFamily: 'monospace' }}>getroasted.wtf</span>
          <span style={{ color: rColor, fontSize: 11, fontFamily: 'monospace' }}>{diag}</span>
        </div>
      </div>
    ),
    { width: W },
  );
}
