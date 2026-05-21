export const revalidate = 0;

import Link from 'next/link';
import { RoastForm } from './components/RoastForm';
import { getHallOfShame } from '@/lib/store';
import { supabase } from '@/lib/supabase';

function scoreColor(score: number): string {
  if (score >= 80) return '#ff4444';
  if (score >= 60) return '#ff8c00';
  if (score >= 40) return '#eab308';
  if (score >= 20) return '#3b82f6';
  return '#22c55e';
}

export default async function HomePage() {
  const [topShame, { count: roastCount }] = await Promise.all([
    getHallOfShame(5),
    supabase.from('roasts').select('*', { count: 'exact', head: true }),
  ]);
  const spotsTaken = Math.min(roastCount ?? 0, 100);

  return (
    <main className="relative min-h-screen bg-black text-white">

      {/* 1 · Hero */}
      <section id="hero" className="relative z-10 flex flex-col items-center justify-center px-4 pt-14 pb-6 text-center">
        <h1 className="text-4xl sm:text-5xl font-bold mb-4 tracking-tight leading-tight" style={{ fontFamily: 'monospace' }}>
          <span style={{ color: '#ffffff' }} className="fade-in">I think your landing page sucks.</span>
          <br />
          <span style={{ color: '#FF3B30' }} className="fade-in-delay-1">
            Prove me wrong.<span className="cursor-blink">_</span>
          </span>
        </h1>

        <p className="text-zinc-400 font-mono text-[13px] sm:text-[15px] mb-8 fade-in-delay-2">
          $ first the AI cooks you. then twitter finishes the job.
        </p>

        <div className="fade-in-delay-3 w-full flex justify-center">
          <RoastForm />
        </div>

        <p className="mt-5 text-zinc-600 text-xs font-mono fade-in-delay-4">
          warning: this will hurt your feelings.
        </p>
        <p className="font-mono text-sm mt-4 fade-in-delay-4" style={{ color: 'rgba(255,255,255,0.5)' }}>
          <span style={{ color: '#ff8c00', fontWeight: 700 }}>{spotsTaken}</span>
          {' '}founders already crying
        </p>
      </section>

      {/* 2 · Hall of Shame preview */}
      <section className="relative z-10 pt-6 pb-12 px-4 max-w-2xl mx-auto w-full fade-in-delay-4">
        <div style={{ width: '100%', height: 1, background: 'rgba(255,140,0,0.2)', marginBottom: 32 }} />
        <div className="mb-6">
          <p
            className="font-mono font-bold"
            style={{
              fontSize: 32,
              fontWeight: 800,
              color: '#ff8c00',
              textShadow: '0 0 20px rgba(255,140,0,0.3)',
              marginBottom: 8,
            }}
          >
            HALL OF SHAME
          </p>
          <p className="font-mono text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>
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
