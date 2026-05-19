import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { getRoast } from '@/lib/store';
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

  const rarityStyle = RARITY_STYLES[roast.rarity];
  const borderColor = rarityStyle.border;
  const color = scoreColor(roast.score);
  const code = exitCode(roast.score);

  return (
    <main className="min-h-screen bg-black text-white">
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 24px' }}>

        {/* Top bar */}
        <div className="flex items-center justify-between mb-10">
          <Link
            href="/"
            className="font-mono text-sm text-zinc-500 hover:text-white transition-colors"
          >
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
        <div className="flex flex-col md:flex-row gap-12">

          {/* LEFT COLUMN — stats */}
          <div className="md:flex-[1.4]">

            {/* 1 · Rarity badge */}
            <div
              style={{
                backgroundColor: hexToRgba(borderColor, 0.18),
                border: `2px solid ${borderColor}`,
                borderRadius: 10,
                padding: '18px 22px',
                marginBottom: 32,
              }}
            >
              <p className="font-mono font-bold" style={{ fontSize: 20, color: borderColor }}>
                ✦ {roast.rarity}
              </p>
              <p className="font-sans font-semibold" style={{ fontSize: 18, color: borderColor, opacity: 0.9, marginTop: 4 }}>
                {roast.characterName} {roast.characterEmoji}
              </p>
              <p
                className="font-sans italic"
                style={{ fontSize: 14, color: borderColor, opacity: 0.65, marginTop: 6 }}
              >
                &ldquo;{roast.characterDescription}&rdquo;
              </p>
            </div>

            {/* 2 · Cat image */}
            <div style={{ marginBottom: 32 }}>
              <Image
                src={CAT_IMAGES[roast.rarity]}
                alt={roast.characterName}
                width={200}
                height={200}
                unoptimized
                style={{
                  borderRadius: 16,
                  border: `3px solid ${borderColor}`,
                  objectFit: 'cover',
                  boxShadow: `0 0 30px ${hexToRgba(borderColor, 0.25)}`,
                  display: 'block',
                }}
              />
              <p className="font-mono" style={{ fontSize: 14, color: borderColor, marginTop: 10 }}>
                {roast.characterName}
              </p>
            </div>

            {/* 3 · Score */}
            <div style={{ marginBottom: 32 }}>
              <div
                className="font-mono leading-none"
                style={{ fontSize: 160, fontWeight: 800, color, letterSpacing: -6 }}
              >
                {roast.score}
              </div>
              <div
                className="font-mono uppercase"
                style={{ fontSize: 13, letterSpacing: '0.2em', color, marginTop: 8 }}
              >
                {code}
              </div>
            </div>

            {/* 4 · Roast quote */}
            <div style={{ marginBottom: 32 }}>
              <p
                className="font-sans"
                style={{ fontSize: 28, fontWeight: 700, color: '#ffffff', lineHeight: 1.35 }}
              >
                &ldquo;{roast.roast}&rdquo;
              </p>
            </div>

            {/* 5 · Real talk box */}
            <div
              style={{
                backgroundColor: '#0d0d0d',
                border: '1px solid #2a2a2a',
                borderRadius: 10,
                padding: '24px 28px',
              }}
            >
              <p className="font-mono font-medium" style={{ fontSize: 13, color: '#E24B4A', marginBottom: 10 }}>
                // real talk
              </p>
              <p style={{ fontSize: 16, color: '#999', lineHeight: 1.75 }}>
                {roast.stderr.replace(/\*\*/g, '')}
              </p>
            </div>
          </div>

          {/* RIGHT COLUMN — meme card */}
          <div className="md:flex-1 flex justify-center md:justify-start">
            <div className="w-full max-w-[360px] md:max-w-none">
              <RoastCard data={roast} />
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}
