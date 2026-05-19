'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import type { RoastResult } from '@/lib/types';
import type { Rarity } from '@/lib/rarity';
import { RARITY_STYLES } from '@/lib/rarity';

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

function CardDisplay({ data }: { data: RoastResult }) {
  const [imgError, setImgError] = useState(false);
  const color = scoreColor(data.score);
  const code = exitCode(data.score);
  const rarityStyle = RARITY_STYLES[data.rarity];

  return (
    <div
      className="relative w-full overflow-hidden"
      style={{
        aspectRatio: '1 / 1',
        backgroundColor: '#080808',
        border: `1px solid ${rarityStyle.border}`,
        boxShadow: rarityStyle.glow,
        borderRadius: 12,
      }}
    >
      {/* Subtle diagonal watermark */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-center">
        <span
          className="text-white font-mono font-bold whitespace-nowrap select-none"
          style={{
            fontSize: '3rem',
            opacity: 0.025,
            transform: 'rotate(-30deg) scaleX(1.6)',
            letterSpacing: '0.08em',
          }}
        >
          getroasted.wtf &nbsp; getroasted.wtf &nbsp; getroasted.wtf
        </span>
      </div>

      {/* Content — 5 sections distributed vertically */}
      <div
        className="relative flex flex-col"
        style={{ height: '100%', padding: '24px', justifyContent: 'space-between' }}
      >
        {/* 1 · Rarity badge */}
        <div>
          <p
            className="font-mono font-bold"
            style={{ fontSize: 13, color: rarityStyle.border }}
          >
            ✦ {data.rarity} · {data.characterName} {data.characterEmoji}
          </p>
          <p
            className="font-sans italic"
            style={{ fontSize: 12, color: rarityStyle.border, opacity: 0.7, marginTop: 3 }}
          >
            &ldquo;{data.characterDescription}&rdquo;
          </p>
        </div>

        {/* 2 · Cat image */}
        {!imgError && (
          <div className="flex justify-center">
            <Image
              src={CAT_IMAGES[data.rarity]}
              alt={data.characterName}
              width={140}
              height={140}
              unoptimized
              crossOrigin="anonymous"
              onError={() => setImgError(true)}
              style={{
                borderRadius: 10,
                border: `2px solid ${rarityStyle.border}`,
                objectFit: 'cover',
              }}
            />
          </div>
        )}

        {/* 3 · Score */}
        <div className="text-center">
          <div
            className="font-mono font-bold leading-none"
            style={{ fontSize: 96, color }}
          >
            {data.score}
          </div>
          <div
            className="font-mono uppercase"
            style={{ fontSize: 11, letterSpacing: '0.15em', color, marginTop: 6 }}
          >
            {code}
          </div>
        </div>

        {/* 4 · Roast quote */}
        <div className="text-center" style={{ padding: '0 5%' }}>
          <p
            className="font-sans italic"
            style={{ fontSize: 17, color: '#ffffff', lineHeight: 1.4 }}
          >
            &ldquo;{data.roast}&rdquo;
          </p>
        </div>

        {/* 5 · Footer */}
        <div className="text-center">
          <span className="font-mono" style={{ fontSize: 11, color: '#333' }}>
            getroasted.wtf
          </span>
        </div>
      </div>
    </div>
  );
}

export function RoastCard({ data }: { data: RoastResult }) {
  const [fullscreen, setFullscreen] = useState(false);
  const [buttonState, setButtonState] = useState<'default' | 'capturing' | 'done'>('default');

  useEffect(() => {
    if (!fullscreen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setFullscreen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [fullscreen]);

  async function handleShareAndDownload() {
    if (buttonState !== 'default') return;
    setButtonState('capturing');

    const code = exitCode(data.score);
    const tweetText = encodeURIComponent(
      `just got my landing page roasted by AI 💀\n\n${data.domain} scored ${data.score}/100\n${code}\n\n"${data.roast}"\n\n📎 attach the downloaded pic to this tweet\n\ngetroasted.wtf`
    );
    const tweetUrl = `https://twitter.com/intent/tweet?text=${tweetText}`;

    try {
      const res = await fetch(`/api/card-image/${data.id}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `roast-${data.domain}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setButtonState('done');
      setTimeout(() => window.open(tweetUrl, '_blank'), 800);
      setTimeout(() => setButtonState('default'), 3000);
    } catch (err) {
      console.error('Download failed:', err);
      alert('Download error: ' + String(err));
      setButtonState('default');
      window.open(tweetUrl, '_blank');
    }
  }

  return (
    <>
      {/* Fullscreen toggle */}
      <div className="flex justify-end mb-2">
        <button
          onClick={() => setFullscreen(true)}
          className="font-mono text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          ⛶ fullscreen
        </button>
      </div>

      <CardDisplay data={data} />

      {/* Share button */}
      <button
        onClick={handleShareAndDownload}
        disabled={buttonState !== 'default'}
        className="w-full font-mono font-medium mt-4"
        style={{
          padding: '14px 20px',
          borderRadius: 8,
          fontSize: 15,
          backgroundColor: '#000',
          border: '1.5px solid #ffffff',
          cursor: buttonState !== 'default' ? 'not-allowed' : 'pointer',
          color:
            buttonState === 'capturing'
              ? '#a1a1aa'
              : buttonState === 'done'
                ? '#639922'
                : '#ffffff',
          transition: 'background-color 0.15s, color 0.15s',
        }}
        onMouseEnter={(e) => {
          if (buttonState === 'default') e.currentTarget.style.backgroundColor = '#111';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = '#000';
        }}
      >
        {buttonState === 'capturing'
          ? 'capturing card...'
          : buttonState === 'done'
            ? '✓ card saved — opening X...'
            : 'share on X 𝕏'}
      </button>

      {/* Fullscreen modal */}
      {fullscreen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.95)' }}
          onClick={() => setFullscreen(false)}
        >
          <div
            className="w-full max-w-[480px]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-end mb-2">
              <button
                onClick={() => setFullscreen(false)}
                className="font-mono text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                ✕ close
              </button>
            </div>
            <CardDisplay data={data} />
          </div>
        </div>
      )}
    </>
  );
}
