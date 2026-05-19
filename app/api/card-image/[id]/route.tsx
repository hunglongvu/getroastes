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

function getBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_BASE_URL) return process.env.NEXT_PUBLIC_BASE_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return 'http://localhost:3000';
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const roast = await getRoast(id);
  if (!roast) return new Response('Not found', { status: 404 });

  const baseUrl = getBaseUrl();
  const rColor = rarityColor(roast.rarity);
  const sColor = scoreColor(roast.score);
  const code = exitCode(roast.score);
  const catUrl = `${baseUrl}/cats/${roast.rarity.toLowerCase()}.jpg`;

  return new ImageResponse(
    (
      <div
        style={{
          background: '#080808',
          width: '800px',
          display: 'flex',
          flexDirection: 'column',
          padding: '56px',
          color: '#e5e5e5',
        }}
      >
        {/* RARITY BADGE */}
        <div style={{ display: 'flex', color: rColor, fontSize: 14, marginBottom: 24 }}>
          ▲ {roast.rarity} · {roast.characterDescription}
        </div>

        {/* CAT IMAGE */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={catUrl}
          width={160}
          height={160}
          alt={roast.characterName}
          style={{ borderRadius: 12, border: `3px solid ${rColor}`, marginBottom: 12, objectFit: 'cover' }}
        />

        {/* CHARACTER NAME */}
        <div style={{ fontSize: 13, color: rColor, marginBottom: 32, display: 'flex' }}>
          {roast.characterName} {roast.characterEmoji}
        </div>

        {/* DIVIDER */}
        <div style={{ width: '100%', height: 1, background: '#1e1e1e', marginBottom: 32, display: 'flex' }} />

        {/* SCORE */}
        <div style={{ fontSize: 160, fontWeight: 900, letterSpacing: -6, lineHeight: 1, color: sColor, display: 'flex' }}>
          {roast.score}
        </div>
        <div style={{ fontSize: 13, letterSpacing: '0.15em', color: '#555', marginBottom: 40, display: 'flex' }}>
          {code.toUpperCase()}
        </div>

        {/* ROAST QUOTE */}
        <div style={{ fontSize: 26, lineHeight: 1.4, color: '#e5e5e5', display: 'flex', flexWrap: 'wrap' }}>
          &ldquo;{roast.roast}&rdquo;
        </div>

        {/* BRAND */}
        <div style={{ marginTop: 40, fontSize: 12, color: '#333', display: 'flex' }}>
          getroasted.wtf
        </div>
      </div>
    ),
    { width: 800 },
  );
}
