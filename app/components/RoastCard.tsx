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

const RARITY_SYMBOLS: Record<Rarity, string> = {
  MYTHIC: '◈',
  LEGENDARY: '▲',
  EPIC: '⬡',
  RARE: '◆',
  COMMON: '○',
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

export function RoastCard({ data, rank }: { data: RoastResult; rank?: number }) {
  const [imgError, setImgError] = useState(false);
  const [buttonState, setButtonState] = useState<'default' | 'capturing' | 'done'>('default');

  const color = scoreColor(data.score);
  const code = exitCode(data.score);
  const rarityStyle = RARITY_STYLES[data.rarity];
  const borderColor = rarityStyle.border;
  const symbol = RARITY_SYMBOLS[data.rarity];

  async function handleShareAndDownload() {
    if (buttonState !== 'default') return;
    setButtonState('capturing');

    const tweetRoast = data.roast.length > 80 ? data.roast.slice(0, 77) + '...' : data.roast;
    const tweetText = encodeURIComponent(
      `just got my landing page roasted by AI 💀\n\n${data.domain} scored ${data.score}/100\n${exitCode(data.score)}\n\n"${tweetRoast}"\n\n📎 attach pic for full roast\n\ngetroasted.wtf`
    );
    const tweetUrl = `https://twitter.com/intent/tweet?text=${tweetText}`;

    const link = document.createElement('a');
    link.href = `/api/card-image/${data.id}`;
    link.download = `roast-${data.domain}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setButtonState('done');
    setTimeout(() => window.open(tweetUrl, '_blank'), 1000);
    setTimeout(() => setButtonState('default'), 3000);
  }

  return (
    <div className="w-full" style={{ maxWidth: 340 }}>
      {/* Pokemon card */}
      <div
        className="pokemon-card"
        style={{
          backgroundColor: '#080808',
          borderRadius: 16,
          border: `2px solid ${borderColor}`,
          boxShadow: `0 0 40px ${hexToRgba(borderColor, 0.25)}`,
          overflow: 'hidden',
        }}
      >
        {/* HEADER */}
        <div style={{ backgroundColor: hexToRgba(borderColor, 0.2), borderBottom: `1px solid ${hexToRgba(borderColor, 0.3)}` }}>
          {/* Row 1: domain + score HP */}
          <div style={{
            height: 44,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 14px',
          }}>
            <span style={{ fontFamily: 'monospace', fontSize: 12, color: '#fff', fontWeight: 600 }}>
              {data.domain}
            </span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 3 }}>
              <span style={{ fontFamily: 'monospace', fontSize: 20, fontWeight: 800, color, lineHeight: 1 }}>
                {data.score}
              </span>
              <span style={{ fontFamily: 'monospace', fontSize: 10, color: '#555' }}>HP</span>
            </div>
          </div>
          {/* Row 2: rarity + character */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '4px 14px 8px',
          }}>
            <span style={{ fontFamily: 'monospace', fontSize: 10, color: borderColor }}>
              ⬡ {data.rarity}
            </span>
            <span style={{ fontFamily: 'monospace', fontSize: 10, color: borderColor }}>
              {data.characterEmoji} {data.characterName}
            </span>
          </div>
        </div>

        {/* ILLUSTRATION — screenshot background + cat foreground */}
        <div style={{ height: 220, width: '100%', overflow: 'hidden', position: 'relative', backgroundColor: '#0d0d0d' }}>
          {/* Layer 1: screenshot background */}
          {data.screenshotBase64 && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={`data:image/jpeg;base64,${data.screenshotBase64}`}
              alt=""
              style={{
                position: 'absolute', inset: 0,
                width: '100%', height: '100%',
                objectFit: 'cover', objectPosition: 'top',
                opacity: 0.5,
              }}
            />
          )}
          {/* Layer 2: gradient overlay */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(to bottom, rgba(0,0,0,0.2), rgba(8,8,8,0.6))',
            pointerEvents: 'none',
          }} />
          {/* Layer 3: cat foreground */}
          {!imgError ? (
            <Image
              src={CAT_IMAGES[data.rarity]}
              alt={data.characterName}
              width={140}
              height={160}
              unoptimized
              crossOrigin="anonymous"
              onError={() => setImgError(true)}
              style={{
                position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)',
                objectFit: 'cover', objectPosition: 'top',
                borderRadius: '8px 8px 0 0',
                filter: 'drop-shadow(0 -4px 20px rgba(0,0,0,0.8))',
              }}
            />
          ) : null}
        </div>

        {/* MOVE BAR */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 14px',
          backgroundColor: hexToRgba(borderColor, 0.1),
          borderTop: `1px solid ${hexToRgba(borderColor, 0.2)}`,
          borderBottom: `1px solid ${hexToRgba(borderColor, 0.2)}`,
        }}>
          <span style={{ fontFamily: 'monospace', fontSize: 10, color: borderColor, letterSpacing: '0.1em' }}>
            ⚡ {code}
          </span>
          <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: color, flexShrink: 0 }} />
        </div>

        {/* ROAST */}
        <div style={{ padding: '14px 14px 10px', backgroundColor: '#080808' }}>
          <p style={{ fontSize: 15, fontWeight: 700, color: '#ffffff', lineHeight: 1.4, margin: 0 }}>
            &ldquo;{data.roast}&rdquo;
          </p>
        </div>

        {/* FOOTER */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '8px 14px',
          borderTop: '1px solid #111',
        }}>
          <span style={{ fontFamily: 'monospace', fontSize: 9, color: '#222' }}>getroasted.wtf</span>
          {rank != null && (
            <span style={{ fontFamily: 'monospace', fontSize: 9, color: '#333' }}>#{rank} Hall of Shame</span>
          )}
          <span style={{ fontFamily: 'monospace', fontSize: 9, color: hexToRgba(borderColor, 0.5) }}>
            {symbol} {data.rarity}
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

      <p className="font-mono text-xs text-zinc-600 text-center" style={{ marginTop: 8 }}>
        // card downloads automatically · attach to tweet
      </p>
    </div>
  );
}
