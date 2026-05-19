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

function scoreColor(score: number): string {
  if (score <= 40) return '#E24B4A';
  if (score <= 70) return '#EF9F27';
  return '#639922';
}

function exitCode(score: number): string {
  if (score <= 15) return 'SEGFAULT: NO_VALUE_PROP';
  if (score <= 30) return 'exit code: COOKED';
  if (score <= 50) return 'WARNING: NEEDS_REFACTOR';
  if (score <= 70) return 'status: ships but barely';
  if (score <= 85) return 'build: passing';
  return 'merge approved';
}

const PAD = 56;
const W = 800;

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const roast = await getRoast(id);
  if (!roast) return new Response('Not found', { status: 404 });

  const rColor = rarityColor(roast.rarity);
  const sColor = scoreColor(roast.score);
  const code = exitCode(roast.score);
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
        {/* TOP ROW */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: 4, background: rColor, display: 'flex' }} />
            <span style={{ color: rColor, fontSize: 13 }}>
              {roast.rarity} · {roast.characterName} {roast.characterEmoji}
            </span>
          </div>
          <span style={{ color: '#555', fontSize: 13 }}>{roast.domain}</span>
        </div>

        {/* SCREENSHOT */}
        {screenshotSrc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={screenshotSrc}
            alt={roast.domain}
            width={W - PAD * 2}
            height={220}
            style={{
              objectFit: 'cover',
              objectPosition: 'top',
              borderRadius: 8,
              border: '1px solid #1e1e1e',
              marginBottom: 28,
            }}
          />
        ) : (
          <div
            style={{
              width: W - PAD * 2,
              height: 220,
              background: '#111',
              borderRadius: 8,
              border: '1px solid #1e1e1e',
              marginBottom: 28,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span style={{ color: '#333', fontSize: 12 }}>no screenshot</span>
          </div>
        )}

        {/* SCORE */}
        <div style={{ fontSize: 120, fontWeight: 900, letterSpacing: -5, lineHeight: 1, color: sColor, display: 'flex' }}>
          {roast.score}
        </div>

        {/* EXIT CODE */}
        <div style={{ fontSize: 12, letterSpacing: '0.15em', color: '#444', marginTop: 6, marginBottom: 24, display: 'flex' }}>
          {code.toUpperCase()}
        </div>

        {/* DIVIDER */}
        <div style={{ width: '100%', height: 1, background: '#1a1a1a', marginBottom: 24, display: 'flex' }} />

        {/* ROAST QUOTE */}
        <div style={{ fontSize: 22, lineHeight: 1.45, color: '#e5e5e5', display: 'flex', flexWrap: 'wrap' }}>
          &ldquo;{roast.roast}&rdquo;
        </div>

        {/* BOTTOM BAR */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 36 }}>
          <span style={{ color: '#333', fontSize: 12 }}>getroasted.wtf</span>
          <span style={{ color: rColor, fontSize: 12 }}>{roast.rarity}</span>
        </div>
      </div>
    ),
    { width: W },
  );
}
