'use client';

import { useState } from 'react';
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

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

export function RoastCard({ data }: { data: RoastResult }) {
  const [imgError, setImgError] = useState(false);
  const [buttonState, setButtonState] = useState<'default' | 'capturing' | 'done'>('default');

  const color = scoreColor(data.score);
  const code = exitCode(data.score);
  const rarityStyle = RARITY_STYLES[data.rarity];
  const borderColor = rarityStyle.border;
  const shortRoast = data.roast.length > 60 ? data.roast.slice(0, 57) + '...' : data.roast;

  async function handleShareAndDownload() {
    if (buttonState !== 'default') return;
    setButtonState('capturing');

    const tweetRoast = data.roast.length > 80 ? data.roast.slice(0, 77) + '...' : data.roast;
    const tweetText = encodeURIComponent(
      `just got my landing page roasted by AI 💀\n\n${data.domain} scored ${data.score}/100\n${exitCode(data.score)}\n\n"${tweetRoast}"\n\n📎 attach pic for full roast\n\ngetroasted.wtf`
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
      setButtonState('default');
      window.open(tweetUrl, '_blank');
    }
  }

  return (
    <div className="w-full">
      {/* 1:1 meme card */}
      <div
        className="relative overflow-hidden"
        style={{
          aspectRatio: '1 / 1',
          backgroundColor: '#080808',
          border: `1px solid ${hexToRgba(borderColor, 0.4)}`,
          borderRadius: 16,
          boxShadow: `0 0 40px ${hexToRgba(borderColor, 0.1)}`,
          padding: 24,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        {/* Watermark */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-center">
          <span
            className="font-mono font-bold whitespace-nowrap select-none text-white"
            style={{
              fontSize: '2rem',
              opacity: 0.015,
              transform: 'rotate(-30deg) scaleX(1.6)',
              letterSpacing: '0.08em',
            }}
          >
            getroasted.wtf &nbsp; getroasted.wtf &nbsp; getroasted.wtf
          </span>
        </div>

        {/* Rarity + character */}
        <div className="relative text-center w-full">
          <p className="font-mono" style={{ fontSize: 12, color: borderColor }}>
            ✦ {data.rarity}
          </p>
          <p className="font-mono" style={{ fontSize: 13, color: borderColor }}>
            {data.characterName} {data.characterEmoji}
          </p>
        </div>

        {/* Cat image */}
        <div className="relative flex justify-center">
          {!imgError ? (
            <Image
              src={CAT_IMAGES[data.rarity]}
              alt={data.characterName}
              width={100}
              height={100}
              unoptimized
              crossOrigin="anonymous"
              onError={() => setImgError(true)}
              style={{
                borderRadius: 8,
                border: `2px solid ${borderColor}`,
                objectFit: 'cover',
              }}
            />
          ) : (
            <div style={{ width: 100, height: 100 }} />
          )}
        </div>

        {/* Score */}
        <div className="relative text-center">
          <div
            className="font-mono leading-none"
            style={{ fontSize: 72, fontWeight: 800, color, letterSpacing: -3 }}
          >
            {data.score}
          </div>
          <div
            className="font-mono uppercase"
            style={{ fontSize: 10, letterSpacing: '0.2em', color, marginTop: 4 }}
          >
            {code}
          </div>
        </div>

        {/* Roast quote */}
        <div className="relative text-center" style={{ padding: '0 8px' }}>
          <p className="font-sans italic" style={{ fontSize: 14, color: '#ffffff', lineHeight: 1.4 }}>
            &ldquo;{shortRoast}&rdquo;
          </p>
        </div>

        {/* Footer */}
        <div className="relative text-center">
          <span className="font-mono" style={{ fontSize: 10, color: '#333' }}>
            getroasted.wtf
          </span>
        </div>
      </div>

      {/* Share button */}
      <button
        onClick={handleShareAndDownload}
        disabled={buttonState !== 'default'}
        className="w-full font-mono font-medium"
        style={{
          marginTop: 12,
          padding: '14px',
          borderRadius: 8,
          fontSize: 14,
          backgroundColor: buttonState === 'done' ? '#639922' : '#E24B4A',
          border: 'none',
          cursor: buttonState !== 'default' ? 'not-allowed' : 'pointer',
          color: '#ffffff',
          opacity: buttonState === 'capturing' ? 0.6 : 1,
          transition: 'background-color 0.15s, opacity 0.15s',
        }}
        onMouseEnter={(e) => {
          if (buttonState === 'default') e.currentTarget.style.backgroundColor = '#c73a39';
        }}
        onMouseLeave={(e) => {
          if (buttonState !== 'done') e.currentTarget.style.backgroundColor = '#E24B4A';
        }}
      >
        {buttonState === 'capturing'
          ? 'capturing card...'
          : buttonState === 'done'
            ? '✓ card saved — opening X...'
            : 'share on X 𝕏 + download card'}
      </button>

      {/* Helper text */}
      <p className="font-mono text-xs text-zinc-600 text-center" style={{ marginTop: 8 }}>
        // card downloads automatically · attach to tweet
      </p>
    </div>
  );
}
