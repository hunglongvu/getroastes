import Image from 'next/image';
import Link from 'next/link';
import { RoastForm } from './components/RoastForm';
import { getHallOfShame } from '@/lib/store';
import { RARITY_STYLES } from '@/lib/rarity';

const RARITY_CARDS = [
  {
    rarity: 'MYTHIC',
    name: '404 Cat',
    emoji: '🐱💀',
    color: '#d946ef',
    dropRate: '2% drop rate',
    meme: 'your page is so bad it broke the internet',
    flavor: 'only 2 founders have ever achieved this. they are not okay.',
    image: '/cats/mythic.jpg',
  },
  {
    rarity: 'LEGENDARY',
    name: 'Giga Cooked Cat',
    emoji: '😿🔥',
    color: '#f97316',
    dropRate: '8% drop rate',
    meme: 'burned beyond recognition',
    flavor: 'your landing page made the AI feel emotions. bad ones.',
    image: '/cats/legendary.jpg',
  },
  {
    rarity: 'EPIC',
    name: 'Burnout Founder Cat',
    emoji: '😾💸',
    color: '#8b5cf6',
    dropRate: '15% drop rate',
    meme: 'sent investors to a competitor',
    flavor: 'your value prop is so vague it could be a crypto project.',
    image: '/cats/epic.jpg',
  },
  {
    rarity: 'RARE',
    name: 'Senior Dev Cat',
    emoji: '🐈‍⬛👀',
    color: '#3b82f6',
    dropRate: '25% drop rate',
    meme: 'technically ships. barely.',
    flavor: 'not broken. just... deeply disappointing.',
    image: '/cats/rare.jpg',
  },
  {
    rarity: 'COMMON',
    name: 'Confused Intern Cat',
    emoji: '🐱❓',
    color: '#71717a',
    dropRate: '50% drop rate',
    meme: "we've seen worse. not many. but some.",
    flavor: 'first day energy. asked 3 questions about the value prop. got no answers.',
    image: '/cats/common.jpg',
  },
] as const;

function scoreColor(score: number): string {
  if (score <= 40) return '#E24B4A';
  if (score <= 70) return '#EF9F27';
  return '#639922';
}

export default async function HomePage() {
  const topShame = await getHallOfShame(5);

  return (
    <main className="min-h-screen bg-black text-white">
      {/* Hero */}
      <section className="flex flex-col items-center justify-center px-4 pt-24 pb-16 text-center">
        <div className="font-mono text-zinc-500 text-xs mb-5 tracking-widest uppercase">
          v2.0.0 — open beta
        </div>

        <h1 className="text-5xl sm:text-6xl font-bold mb-4 tracking-tight leading-tight">
          <span className="text-white">First the AI roasts you.</span>
          <br />
          <span className="text-[#E24B4A]">Then the internet does.</span>
        </h1>

        <p className="text-zinc-400 font-mono text-lg sm:text-xl mb-12 max-w-lg">
          Paste URL. Get roasted. Share on X. Go viral.
        </p>

        <RoastForm />

        <p className="mt-5 text-zinc-600 text-xs font-mono">
          3 free roasts/day · no signup · no mercy
        </p>
      </section>

      {/* Rarity showcase */}
      <section className="pb-20">
        <div className="text-center mb-4 px-4">
          <p className="text-zinc-400 font-mono text-sm">
            {'// rarity system — what card will you get?'}
          </p>
          <p className="text-zinc-600 font-mono text-xs mt-1">
            lower score = rarer card. chase the 404 Cat.
          </p>
        </div>

        {/* Mobile scroll hint */}
        <p className="text-zinc-700 font-mono text-xs text-center mb-4 sm:hidden">
          ← scroll →
        </p>

        {/* Cards row */}
        <div className="overflow-x-auto scrollbar-hide">
          <div
            className="flex gap-4 pb-2"
            style={{
              paddingLeft: 'max(24px, calc((100vw - 1060px) / 2))',
              paddingRight: 'max(24px, calc((100vw - 1060px) / 2))',
              width: 'max-content',
              margin: '0 auto',
            }}
          >
            {RARITY_CARDS.map((card) => (
              <div
                key={card.rarity}
                className="flex flex-col items-center text-center rounded-xl p-4"
                style={{
                  width: 200,
                  flexShrink: 0,
                  backgroundColor: '#080808',
                  border: `1px solid ${card.color}`,
                  boxShadow: `0 0 15px ${card.color}33`,
                }}
              >
                <div
                  className="font-mono text-xs font-bold tracking-wider mb-3"
                  style={{ color: card.color }}
                >
                  ✦ {card.rarity}
                </div>
                <Image
                  src={card.image}
                  alt={card.name}
                  width={100}
                  height={100}
                  unoptimized
                  style={{
                    borderRadius: 8,
                    border: `2px solid ${card.color}`,
                    objectFit: 'cover',
                    marginBottom: 10,
                  }}
                />
                <div
                  className="font-mono text-xs font-medium mb-1"
                  style={{ color: card.color }}
                >
                  {card.name} {card.emoji}
                </div>
                <div className="font-mono text-[10px] text-zinc-600 mb-3">
                  {card.dropRate}
                </div>
                <div className="text-white text-xs font-mono font-medium mb-2 leading-snug">
                  &ldquo;{card.meme}&rdquo;
                </div>
                <div className="text-zinc-500 text-[10px] font-sans italic leading-relaxed">
                  {card.flavor}
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-zinc-600 font-mono text-xs text-center mt-8 px-4">
          $ roast --your-page to find out which cat you deserve
        </p>
      </section>

      {/* Hall of Shame preview */}
      <section className="px-4 pb-28 max-w-2xl mx-auto">
        <div className="text-center mb-5">
          <p className="text-zinc-500 font-mono text-sm">
            {'// hall of shame — the worst landing pages on the internet'}
          </p>
          <p className="text-zinc-600 font-mono text-xs mt-1">
            updated in real time. opt out anytime from your roast result.
          </p>
        </div>

        {topShame.length === 0 ? (
          <p className="text-zinc-600 font-mono text-sm text-center italic py-8">
            // no victims yet. be the first.
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {topShame.map((roast, i) => {
              const rarityStyle = RARITY_STYLES[roast.rarity];
              const color = scoreColor(roast.score);
              const snippet =
                roast.roast.length > 50
                  ? roast.roast.slice(0, 50) + '...'
                  : roast.roast;

              return (
                <div
                  key={roast.id}
                  className="flex items-center gap-3 rounded-lg px-4 py-3"
                  style={{
                    backgroundColor: '#080808',
                    border: '1px solid #1a1a1a',
                  }}
                >
                  {/* Rank */}
                  <span className="font-mono text-zinc-600 text-xs w-6 flex-none">
                    #{i + 1}
                  </span>

                  {/* Emoji + rarity */}
                  <span
                    className="font-mono text-xs flex-none"
                    style={{ color: rarityStyle.border }}
                  >
                    {roast.characterEmoji}
                  </span>

                  {/* Domain */}
                  <span className="font-mono text-white text-xs flex-none max-w-[100px] truncate">
                    {roast.domain}
                  </span>

                  {/* Score */}
                  <span
                    className="font-mono text-xs font-bold flex-none"
                    style={{ color }}
                  >
                    {roast.score}/100
                  </span>

                  {/* Roast snippet */}
                  <span className="font-mono text-zinc-400 text-xs flex-1 min-w-0 truncate hidden sm:block">
                    &ldquo;{snippet}&rdquo;
                  </span>

                  {/* View link */}
                  <Link
                    href={`/roast/${roast.id}`}
                    className="font-mono text-zinc-600 text-xs flex-none hover:text-white transition-colors"
                  >
                    view →
                  </Link>
                </div>
              );
            })}
          </div>
        )}

        <div className="text-center mt-6">
          <Link
            href="/hall-of-shame"
            className="font-mono text-zinc-500 text-xs hover:text-zinc-300 transition-colors"
          >
            view full leaderboard →
          </Link>
        </div>
      </section>
    </main>
  );
}
