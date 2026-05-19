import Link from 'next/link';
import { getHallOfShame } from '@/lib/store';
import { RARITY_STYLES } from '@/lib/rarity';

export const revalidate = 60;

function scoreColor(score: number): string {
  if (score >= 80) return '#ff4444';
  if (score >= 60) return '#ff8c00';
  if (score >= 40) return '#eab308';
  if (score >= 20) return '#3b82f6';
  return '#22c55e';
}


export default async function HallOfShamePage() {
  const roasts = await getHallOfShame(20);

  return (
    <main className="min-h-screen bg-black text-white px-4 py-16">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <Link
            href="/"
            className="text-zinc-600 font-mono text-xs hover:text-zinc-400 transition-colors"
          >
            ← getroasted.wtf
          </Link>
          <h1 className="mt-6 font-mono text-3xl font-bold" style={{ color: '#FFB800' }}>
            🏆 Hall of Shame
          </h1>
          <p className="text-zinc-500 font-mono text-sm mt-2">
            the worst landing pages the internet has to offer
          </p>
          <p className="text-zinc-700 font-mono text-xs mt-1">
            sorted by score · refreshes every 60s
          </p>
        </div>

        {/* Empty state */}
        {roasts.length === 0 && (
          <div className="text-center py-24">
            <p className="text-zinc-600 font-mono text-sm">
              no victims yet. be the first.
            </p>
            <Link
              href="/"
              className="mt-4 inline-block text-[#E24B4A] font-mono text-xs hover:underline"
            >
              roast a page →
            </Link>
          </div>
        )}

        {/* Leaderboard */}
        {roasts.length > 0 && (
          <div className="flex flex-col gap-3">
            {roasts.map((roast, i) => {
              const rarityStyle = RARITY_STYLES[roast.rarity];
              const color = scoreColor(roast.score);
              return (
                <Link
                  key={roast.id}
                  href={`/roast/${roast.id}`}
                  className="flex items-center gap-4 rounded-lg p-4 hover:opacity-80 transition-opacity"
                  style={{
                    backgroundColor: '#080808',
                    border: `1px solid ${rarityStyle.border}`,
                  }}
                >
                  {/* Rank */}
                  <div
                    className="font-mono text-sm w-8 flex-none text-right font-bold"
                    style={{
                      color: i === 0 ? '#FFB800' : i === 1 ? '#C0C0C0' : i === 2 ? '#CD7F32' : undefined,
                    }}
                  >
                    <span className={i >= 3 ? 'text-zinc-500' : ''}>#{i + 1}</span>
                  </div>

                  {/* Score */}
                  <div
                    className="font-mono text-2xl font-bold flex-none w-12 text-center leading-none"
                    style={{ color }}
                  >
                    {roast.score}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-mono text-zinc-200 text-sm truncate">
                        {roast.domain}
                      </span>
                    </div>
                    <p className="text-zinc-500 text-xs font-sans truncate">
                      &ldquo;{roast.roast}&rdquo;
                    </p>
                  </div>

                  {/* Arrow */}
                  <div className="text-zinc-700 text-xs font-mono flex-none">→</div>
                </Link>
              );
            })}
          </div>
        )}

        <p className="text-center text-zinc-700 font-mono text-xs mt-12">
          $ getroasted.wtf — roast your own page
        </p>
      </div>
    </main>
  );
}
