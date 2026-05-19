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

  async function handleShareAndDownload() {
    if (buttonState !== 'default') return;
    setButtonState('capturing');

    const cleanStderr = data.stderr.replace(/\*\*(.*?)\*\*/g, '$1').slice(0, 120);
    const tweetText = encodeURIComponent(
      `just got my landing page roasted by AI 💀\n\n${data.domain} scored ${data.score}/100\n${exitCode(data.score)}\n\n"${data.roast}"\n\nreal talk: ${cleanStderr}\n\n📎 attach the pic!\n\ngetroasted.wtf`
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
    <div className="w-full" style={{ maxWidth: 420, margin: '0 auto' }}>
      {/* Card */}
      <div
        className="relative overflow-hidden"
        style={{
          backgroundColor: '#080808',
          border: `1px solid ${hexToRgba(borderColor, 0.4)}`,
          borderRadius: 16,
          padding: '28px 24px',
          boxShadow: `0 0 40px ${hexToRgba(borderColor, 0.1)}`,
        }}
      >
        {/* Watermark */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-center">
          <span
            className="text-white font-mono font-bold whitespace-nowrap select-none"
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

        <div className="relative flex flex-col">
          {/* 1 · Rarity badge */}
          <div
            style={{
              backgroundColor: hexToRgba(borderColor, 0.15),
              border: `1px solid ${borderColor}`,
              borderRadius: 8,
              padding: '10px 16px',
              marginBottom: 24,
            }}
          >
            <p className="font-mono font-medium" style={{ fontSize: 14, color: borderColor }}>
              ✦ {data.rarity} · {data.characterName} {data.characterEmoji}
            </p>
            <p
              className="font-sans italic"
              style={{ fontSize: 12, color: borderColor, opacity: 0.7, marginTop: 4 }}
            >
              &ldquo;{data.characterDescription}&rdquo;
            </p>
          </div>

          {/* 2 · Cat image */}
          {!imgError && (
            <div className="flex flex-col items-center" style={{ marginBottom: 24 }}>
              <Image
                src={CAT_IMAGES[data.rarity]}
                alt={data.characterName}
                width={180}
                height={180}
                unoptimized
                crossOrigin="anonymous"
                onError={() => setImgError(true)}
                style={{
                  borderRadius: 12,
                  border: `3px solid ${borderColor}`,
                  objectFit: 'cover',
                  boxShadow: `0 0 20px ${hexToRgba(borderColor, 0.3)}`,
                }}
              />
              <p
                className="font-mono"
                style={{ fontSize: 13, color: borderColor, marginTop: 10 }}
              >
                {data.characterName}
              </p>
            </div>
          )}

          {/* 3 · Score */}
          <div className="text-center" style={{ marginBottom: 4 }}>
            <div
              className="font-mono leading-none"
              style={{ fontSize: 120, fontWeight: 800, letterSpacing: -4, color }}
            >
              {data.score}
            </div>
          </div>

          {/* 4 · Exit code */}
          <div
            className="font-mono uppercase text-center"
            style={{ fontSize: 12, letterSpacing: '0.2em', color, marginBottom: 0 }}
          >
            {code}
          </div>

          {/* 5 · Roast quote */}
          <div className="text-center" style={{ marginTop: 24, marginBottom: 24 }}>
            <p
              className="font-sans"
              style={{
                fontSize: 28,
                fontWeight: 700,
                lineHeight: 1.35,
                color: '#ffffff',
                maxWidth: '95%',
                margin: '0 auto',
              }}
            >
              &ldquo;{data.roast}&rdquo;
            </p>
          </div>

          {/* 6 · Real talk box */}
          <div
            style={{
              backgroundColor: '#0d0d0d',
              border: '1px solid #1e1e1e',
              borderRadius: 8,
              padding: '16px 20px',
              marginBottom: 24,
            }}
          >
            <p className="font-mono" style={{ fontSize: 11, color: '#E24B4A', marginBottom: 8 }}>
              // real talk
            </p>
            <p style={{ fontSize: 13, color: '#666', lineHeight: 1.55 }}>
              {data.stderr.replace(/\*\*/g, '')}
            </p>
          </div>

          {/* 7 · Footer */}
          <div className="text-center">
            <span className="font-mono" style={{ fontSize: 11, color: '#222' }}>
              getroasted.wtf
            </span>
          </div>
        </div>
      </div>

      {/* Share button */}
      <button
        onClick={handleShareAndDownload}
        disabled={buttonState !== 'default'}
        className="w-full font-mono font-medium mt-4"
        style={{
          padding: '14px 24px',
          borderRadius: 8,
          fontSize: 14,
          backgroundColor:
            buttonState === 'done' ? '#639922' : '#E24B4A',
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
    </div>
  );
}
