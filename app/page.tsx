import Link from 'next/link';
import { RoastForm } from './components/RoastForm';
import { Embers } from './components/Embers';
import { RoastCounter } from './components/RoastCounter';
import { getHallOfShame } from '@/lib/store';

function scoreColor(score: number): string {
  if (score <= 40) return '#E24B4A';
  if (score <= 70) return '#EF9F27';
  return '#639922';
}

export default async function HomePage() {
  const topShame = await getHallOfShame(5);

  return (
    <main className="relative min-h-screen bg-black text-white">
      <Embers />

      {/* 1 · Hero */}
      <section id="hero" className="relative z-10 flex flex-col items-center justify-center px-4 pt-14 pb-12 text-center">
        <h1 className="text-5xl sm:text-6xl font-bold mb-4 tracking-tight leading-tight">
          <span className="text-white fade-in">First the AI <span className="fire-text">roasts</span> you.</span>
          <br />
          <span className="text-[#E24B4A] fade-in-delay-1">Then the internet does.</span>
        </h1>

        <p className="text-zinc-400 font-mono text-[13px] sm:text-[15px] mb-8 whitespace-nowrap fade-in-delay-2">
          Paste URL. Get roasted. Share on X. Go viral.
        </p>

        <div className="fade-in-delay-3 w-full flex justify-center">
          <RoastForm />
        </div>

        <p className="mt-5 text-zinc-600 text-xs font-mono fade-in-delay-4">
          3 free roasts/day · no signup · no mercy
        </p>
        <RoastCounter />
      </section>

      {/* 2 · Hall of Shame preview */}
      <section className="relative z-10 border-t border-zinc-900 py-12 px-4 max-w-2xl mx-auto w-full fade-in-delay-4">
        <div className="mb-6">
          <p className="font-mono font-bold text-sm" style={{ color: '#FFB800' }}>
            🏆 Hall of Shame
          </p>
          <p className="text-zinc-600 font-mono text-xs mt-1">
            the worst landing pages the internet has to offer
          </p>
        </div>

        {topShame.length === 0 ? (
          <p className="text-zinc-600 font-mono text-xs py-6">
            // no victims yet. be the first.
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {topShame.map((roast, i) => {
              const color = scoreColor(roast.score);
              return (
                <Link
                  key={roast.id}
                  href={`/roast/${roast.id}`}
                  className="shame-row flex items-center gap-4 rounded-lg p-4 transition-colors"
                  style={{
                    backgroundColor: '#0d0d0d',
                    border: '1px solid #1a1a1a',
                    ['--score-color' as string]: color,
                  }}
                >
                  {/* Rank */}
                  <div
                    className="font-mono text-sm w-6 flex-none text-right"
                    style={{ color: '#444' }}
                  >
                    #{i + 1}
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
                    <div className="font-mono text-sm mb-0.5" style={{ color: '#e5e5e5' }}>
                      {roast.domain}
                    </div>
                    <p className="text-xs italic truncate" style={{ color: '#666' }}>
                      &ldquo;{roast.roast}&rdquo;
                    </p>
                  </div>

                  {/* Arrow */}
                  <div className="font-mono text-xs flex-none" style={{ color: '#333' }}>→</div>
                </Link>
              );
            })}
          </div>
        )}

        <div className="mt-5">
          <Link
            href="/hall-of-shame"
            className="font-mono text-zinc-500 text-xs hover:text-zinc-300 transition-colors"
          >
            view full hall of shame →
          </Link>
        </div>
      </section>
    </main>
  );
}
