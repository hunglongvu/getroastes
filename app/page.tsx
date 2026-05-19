import Link from 'next/link';
import { RoastForm } from './components/RoastForm';
import { Embers } from './components/Embers';
import { RoastCounter } from './components/RoastCounter';
import { getRecentRoasts } from '@/lib/store';

function survivalColor(score: number): string {
  if (score <= 20) return '#ff4444';
  if (score <= 40) return '#ff8c00';
  if (score <= 60) return '#eab308';
  if (score <= 80) return '#3b82f6';
  return '#22c55e';
}

function diagnosis(score: number): string {
  if (score <= 20) return 'BUILDING IN PUBLIC, DYING IN PRIVATE';
  if (score <= 40) return 'THE WAITLIST WAS JUST FRIENDS';
  if (score <= 60) return 'BUILT FOR A MARKET OF ONE (YOU)';
  if (score <= 80) return 'YOUR MOM IS YOUR ONLY USER';
  return 'ALIVE ON CRUNCHBASE, NOWHERE ELSE';
}

export default async function HomePage() {
  const recentRoasts = await getRecentRoasts(5);

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

      {/* 2 · Recent victims */}
      <section className="relative z-10 border-t border-zinc-900 py-12 px-4 max-w-2xl mx-auto w-full fade-in-delay-4">
        <div className="mb-6">
          <p className="font-mono font-bold text-sm" style={{ color: '#E24B4A' }}>
            // hall of shame — recent victims
          </p>
          <p className="text-zinc-600 font-mono text-xs mt-1">
            real startups. real pain.
          </p>
        </div>

        {recentRoasts.length === 0 ? (
          <p className="text-zinc-600 font-mono text-xs py-6">
            // no victims yet. be the first.
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {recentRoasts.map((roast) => {
              const color = survivalColor(roast.score);
              const diag = diagnosis(roast.score);
              return (
                <Link
                  key={roast.id}
                  href={`/roast/${roast.id}`}
                  className="block rounded-lg px-5 py-4 hover:opacity-80 transition-opacity"
                  style={{
                    backgroundColor: '#0d0d0d',
                    border: '1px solid #1a1a1a',
                    borderLeft: `3px solid ${color}`,
                  }}
                >
                  <div className="flex items-center justify-between gap-4 mb-1">
                    <span className="font-mono text-sm truncate" style={{ color: '#888' }}>
                      {roast.domain}
                    </span>
                    <span className="font-mono font-bold text-lg flex-none" style={{ color }}>
                      {roast.score}%
                    </span>
                  </div>
                  <div
                    className="font-mono mb-2"
                    style={{ fontSize: 11, color: '#444', letterSpacing: '0.15em' }}
                  >
                    {diag}
                  </div>
                  <p className="font-sans text-sm italic" style={{ color: '#e5e5e5' }}>
                    &ldquo;{roast.roast}&rdquo;
                  </p>
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
