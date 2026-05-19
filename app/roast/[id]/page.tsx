import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { getRoast } from '@/lib/store';
import { supabase } from '@/lib/supabase';
import { RoastCard } from '@/app/components/RoastCard';
import { RARITY_STYLES } from '@/lib/rarity';
import type { Rarity } from '@/lib/rarity';

const CAT_IMAGES: Record<Rarity, string> = {
  MYTHIC: '/cats/mythic.jpg',
  LEGENDARY: '/cats/legendary.jpg',
  EPIC: '/cats/epic.jpg',
  RARE: '/cats/rare.jpg',
  COMMON: '/cats/common.jpg',
};

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

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

export default async function RoastPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const roast = await getRoast(id);
  if (!roast) notFound();

  // Fetch rank data server-side
  const [{ count: worseCount }, { count: total }] = await Promise.all([
    supabase
      .from('roasts')
      .select('*', { count: 'exact', head: true })
      .lt('score', roast.score),
    supabase
      .from('roasts')
      .select('*', { count: 'exact', head: true }),
  ]);

  const rank = (total ?? 0) - (worseCount ?? 0);
  const percentileCooked = Math.round(((worseCount ?? 0) / (total ?? 1)) * 100);

  const rarityStyle = RARITY_STYLES[roast.rarity];
  const borderColor = rarityStyle.border;
  const color = scoreColor(roast.score);
  const code = exitCode(roast.score);

  return (
    <main className="min-h-screen bg-black text-white">
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '40px 24px' }}>

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

            {/* Section 1: Rarity + cat compact */}
            <div>
              <div className="flex items-start gap-4" style={{ marginBottom: 10 }}>
                <Image
                  src={CAT_IMAGES[roast.rarity]}
                  alt={roast.characterName}
                  width={80}
                  height={80}
                  unoptimized
                  style={{
                    borderRadius: 10,
                    border: `2px solid ${borderColor}`,
                    objectFit: 'cover',
                    flexShrink: 0,
                  }}
                />
                <div>
                  <p className="font-mono font-medium" style={{ fontSize: 14, color: borderColor }}>
                    ✦ {roast.rarity} · {roast.characterName} {roast.characterEmoji}
                  </p>
                  <p
                    className="font-sans italic"
                    style={{ fontSize: 13, color: borderColor, opacity: 0.6, marginTop: 4, lineHeight: 1.4 }}
                  >
                    &ldquo;{roast.characterDescription}&rdquo;
                  </p>
                </div>
              </div>
            </div>

            {/* Section 2: Score + exit code + roast quote */}
            <div>
              <div
                className="font-mono leading-none"
                style={{ fontSize: 96, fontWeight: 800, color, letterSpacing: -4 }}
              >
                {roast.score}
              </div>
              <div
                className="font-mono uppercase"
                style={{ fontSize: 12, letterSpacing: '0.2em', color, marginTop: 6, marginBottom: 16 }}
              >
                {code}
              </div>
              <p
                className="font-sans"
                style={{ fontSize: 22, fontWeight: 600, color: '#ffffff', lineHeight: 1.4 }}
              >
                &ldquo;{roast.roast}&rdquo;
              </p>
            </div>

            {/* Section 3: Real talk */}
            <div
              style={{
                backgroundColor: '#0d0d0d',
                border: '1px solid #1e1e1e',
                borderRadius: 10,
                padding: '20px 24px',
              }}
            >
              <p className="font-mono" style={{ fontSize: 12, color: '#E24B4A', marginBottom: 10 }}>
                // real talk
              </p>
              <p style={{ fontSize: 15, color: '#888', lineHeight: 1.75 }}>
                {roast.stderr.replace(/\*\*/g, '')}
              </p>
            </div>

            {/* Section 4: Hall of Shame rank */}
            <div
              style={{
                backgroundColor: '#0d0d0d',
                border: '1px solid #FFB800',
                borderRadius: 10,
                padding: '20px 24px',
              }}
            >
              <p className="font-mono" style={{ fontSize: 11, color: '#FFB800', marginBottom: 12 }}>
                🏆 your rank
              </p>

              {rank != null && total ? (
                <>
                  <div style={{ fontSize: 36, fontWeight: 700, color: '#FFB800', lineHeight: 1 }}>
                    #{rank}
                    <span className="font-mono text-zinc-500" style={{ fontSize: 13, fontWeight: 400, marginLeft: 10 }}>
                      on Hall of Shame
                    </span>
                  </div>
                  <p className="font-mono" style={{ fontSize: 13, color: '#52525b', marginTop: 4, marginBottom: 12 }}>
                    out of {total.toLocaleString()} roasted pages
                  </p>

                  {roast.score < 30 ? (
                    <p className="font-mono" style={{ fontSize: 13, color: '#E24B4A' }}>
                      🔥 top {100 - percentileCooked}% most cooked pages ever
                    </p>
                  ) : roast.score < 50 ? (
                    <p className="font-mono" style={{ fontSize: 13, color: '#EF9F27' }}>
                      your page is worse than {percentileCooked}% of all roasts
                    </p>
                  ) : (
                    <p className="font-mono" style={{ fontSize: 13, color: '#52525b' }}>
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
