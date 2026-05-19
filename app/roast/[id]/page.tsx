import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getRoast } from '@/lib/store';
import { supabase } from '@/lib/supabase';
import { RoastCard } from '@/app/components/RoastCard';
import { Embers } from '@/app/components/Embers';
import { RARITY_STYLES } from '@/lib/rarity';

function survivalColor(score: number): string {
  if (score >= 80) return '#ff4444';
  if (score >= 60) return '#ff8c00';
  if (score >= 40) return '#eab308';
  if (score >= 20) return '#3b82f6';
  return '#22c55e';
}

function exitCode(score: number): string {
  if (score >= 85) return 'SEGFAULT: NO_VALUE_PROP';
  if (score >= 70) return 'exit code: COOKED';
  if (score >= 50) return 'WARNING: NEEDS_REFACTOR';
  if (score >= 30) return 'status: ships but barely';
  if (score >= 15) return 'build: passing';
  return 'merge approved';
}

function diagnosis(score: number): string {
  if (score >= 80) return 'BUILDING IN PUBLIC, DYING IN PRIVATE';
  if (score >= 60) return 'THE WAITLIST WAS JUST FRIENDS';
  if (score >= 40) return 'BUILT FOR A MARKET OF ONE (YOU)';
  if (score >= 20) return 'YOUR MOM IS YOUR ONLY USER';
  return 'ALIVE ON CRUNCHBASE, NOWHERE ELSE';
}

export default async function RoastPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const roast = await getRoast(id);
  if (!roast) notFound();

  const [{ count: lessCooked }, { count: total }] = await Promise.all([
    supabase.from('roasts').select('*', { count: 'exact', head: true }).lt('score', roast.score),
    supabase.from('roasts').select('*', { count: 'exact', head: true }),
  ]);

  // rank #1 = highest cooked score; lessCooked = pages with lower (better) score
  const rank = (total ?? 0) - (lessCooked ?? 0);
  const percentileCooked = Math.round(((lessCooked ?? 0) / (total ?? 1)) * 100);

  const rarityStyle = RARITY_STYLES[roast.rarity];
  const borderColor = rarityStyle.border;
  const color = survivalColor(roast.score);
  const code = exitCode(roast.score);
  const diag = diagnosis(roast.score);

  return (
    <main
      className="relative min-h-screen text-white"
      style={{ background: 'radial-gradient(ellipse at top, #0f0000 0%, #000000 60%)' }}
    >
      <Embers />

      {/* Rarity glow — top left */}
      <div style={{
        position: 'fixed', top: -300, left: -300,
        width: 700, height: 700, borderRadius: '50%',
        background: `radial-gradient(circle, ${borderColor}20 0%, transparent 65%)`,
        pointerEvents: 'none', zIndex: 0,
      }} />
      {/* Rarity glow — bottom right */}
      <div style={{
        position: 'fixed', bottom: -200, right: -200,
        width: 500, height: 500, borderRadius: '50%',
        background: `radial-gradient(circle, ${borderColor}12 0%, transparent 65%)`,
        pointerEvents: 'none', zIndex: 0,
      }} />

      <div className="relative" style={{ zIndex: 1, maxWidth: 1000, margin: '0 auto', padding: '40px 24px' }}>

        {/* Top bar */}
        <div className="flex items-center justify-between mb-10">
          <Link href="/" className="font-mono text-sm text-zinc-500 hover:text-white transition-colors">
            ← getroasted.wtf
          </Link>
          <Link
            href="/"
            className="font-mono text-xs text-zinc-500 hover:text-white transition-colors"
            style={{ border: '1px solid #333', padding: '6px 14px', borderRadius: 6 }}
          >
            roast another →
          </Link>
        </div>

        {/* Two column layout */}
        <div className="flex flex-col md:flex-row gap-10" style={{ alignItems: 'flex-start' }}>

          {/* LEFT COLUMN — meme card */}
          <div className="flex-1 flex justify-center md:justify-start">
            <div className="w-full max-w-[400px] md:max-w-none">
              <RoastCard data={roast} rank={rank} />
            </div>
          </div>

          {/* RIGHT COLUMN — stats */}
          <div className="flex-1 flex flex-col gap-7">

            {/* Diagnosis badge */}
            <div>
              <p className="font-mono font-bold" style={{ fontSize: 11, color: borderColor, letterSpacing: '0.15em' }}>
                ✦ {roast.rarity}
              </p>
              <p className="font-mono" style={{ fontSize: 11, color: borderColor, opacity: 0.6, marginTop: 4, letterSpacing: '0.1em' }}>
                {diag}
              </p>
            </div>

            {/* Score + exit code + roast quote */}
            <div className="fade-in">
              <div
                className="font-mono leading-none"
                style={{
                  fontSize: 160, fontWeight: 900, color,
                  letterSpacing: -8, lineHeight: 1, marginBottom: 8,
                  textShadow: `0 0 60px ${color}60, 0 0 120px ${color}30`,
                }}
              >
                {roast.score}
              </div>
              <div
                className="font-mono uppercase"
                style={{ fontSize: 12, letterSpacing: '0.2em', color: '#444', marginBottom: 6 }}
              >
                COOKED SCORE
              </div>
              <div
                className="font-mono uppercase"
                style={{ fontSize: 11, letterSpacing: '0.15em', color, marginBottom: 20 }}
              >
                {code}
              </div>
            </div>

            <div className="fade-in-delay-1">
              <p
                className="font-sans"
                style={{
                  fontSize: 28, fontWeight: 700, color: '#ffffff', lineHeight: 1.35,
                  borderLeft: `3px solid ${borderColor}`, paddingLeft: 20,
                }}
              >
                &ldquo;{roast.roast}&rdquo;
              </p>
            </div>

            {/* Real talk */}
            <div
              className="fade-in-delay-2"
              style={{ backgroundColor: '#0d0d0d', border: '1px solid #2a2a2a', borderRadius: 10, padding: '24px 28px' }}
            >
              <p className="font-mono" style={{ fontSize: 13, color: '#E24B4A', marginBottom: 10 }}>
                // real talk
              </p>
              <p style={{ fontSize: 16, color: '#999', lineHeight: 1.8 }}>
                {roast.stderr.replace(/\*\*/g, '')}
              </p>
            </div>

            {/* Hall of Shame rank */}
            <div
              className="fade-in-delay-3"
              style={{ backgroundColor: '#0d0d0d', border: '1px solid #FFB800', borderRadius: 10, padding: '20px 24px' }}
            >
              <p className="font-mono" style={{ fontSize: 11, color: '#FFB800', marginBottom: 12 }}>
                🏆 your rank
              </p>

              {rank != null && total ? (
                <>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 4 }}>
                    <span style={{ fontSize: 56, fontWeight: 900, color: '#FFB800', lineHeight: 1 }}>
                      #{rank}
                    </span>
                    <span className="font-mono text-zinc-400" style={{ fontSize: 16 }}>
                      on Hall of Shame
                    </span>
                  </div>
                  <p className="font-mono" style={{ fontSize: 13, color: '#52525b', marginBottom: 12 }}>
                    out of {total.toLocaleString()} roasted pages
                  </p>

                  {roast.score >= 70 ? (
                    <p className="font-mono" style={{ fontSize: 15, color: '#E24B4A' }}>
                      🔥 top {100 - percentileCooked}% most cooked pages ever
                    </p>
                  ) : roast.score >= 50 ? (
                    <p className="font-mono" style={{ fontSize: 15, color: '#EF9F27' }}>
                      your page is worse than {percentileCooked}% of all roasts
                    </p>
                  ) : (
                    <p className="font-mono" style={{ fontSize: 15, color: '#52525b' }}>
                      not the worst we&apos;ve seen. barely.
                    </p>
                  )}
                </>
              ) : (
                <p className="font-mono text-zinc-600" style={{ fontSize: 13 }}>calculating rank...</p>
              )}

              <Link
                href="/hall-of-shame"
                className="font-mono text-zinc-500 hover:text-white transition-colors"
                style={{ fontSize: 13, display: 'block', marginTop: 16 }}
              >
                view Hall of Shame →
              </Link>
            </div>

          </div>
        </div>
      </div>
    </main>
  );
}
