'use client';

import { useState } from 'react';
import type { RoastResult } from '@/lib/types';
import { RARITY_STYLES } from '@/lib/rarity';

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

function survivalColor(score: number): string {
  if (score >= 80) return '#ff4444';
  if (score >= 60) return '#ff8c00';
  if (score >= 40) return '#eab308';
  if (score >= 20) return '#3b82f6';
  return '#22c55e';
}

function diagnosis(score: number): string {
  if (score >= 80) return 'BUILDING IN PUBLIC, DYING IN PRIVATE';
  if (score >= 60) return 'THE WAITLIST WAS JUST FRIENDS';
  if (score >= 40) return 'BUILT FOR A MARKET OF ONE (YOU)';
  if (score >= 20) return 'YOUR MOM IS YOUR ONLY USER';
  return 'ALIVE ON CRUNCHBASE, NOWHERE ELSE';
}

export function RoastCard({ data, rank }: { data: RoastResult; rank?: number }) {
  const [buttonState, setButtonState] = useState<'default' | 'capturing' | 'done'>('default');

  const sColor = survivalColor(data.score);
  const rarityStyle = RARITY_STYLES[data.rarity];
  const borderColor = rarityStyle.border;
  const diag = diagnosis(data.score);

  async function handleShareAndDownload() {
    if (buttonState !== 'default') return;
    setButtonState('capturing');

    try {
      const response = await fetch(`/api/card-image/${data.id}`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.style.display = 'none';
      link.href = url;
      link.download = `roast-${data.domain}.png`;
      document.body.appendChild(link);
      link.click();

      setTimeout(() => {
        window.URL.revokeObjectURL(url);
        document.body.removeChild(link);
      }, 100);

      setButtonState('done');
    } catch (err) {
      console.error('Download failed:', err);
      window.open(`/api/card-image/${data.id}`, '_blank');
      setButtonState('done');
    }

    setTimeout(() => {
      const tweetText = encodeURIComponent(
        `just got my landing page roasted by AI 💀\n\n${data.domain} — cooked score: ${data.score}\n\n"${data.roast}"\n\ngetroasted.wtf 🔥`
      );
      window.open(`https://twitter.com/intent/tweet?text=${tweetText}`, '_blank');
      setTimeout(() => setButtonState('default'), 2000);
    }, 1500);
  }

  return (
    <div className="w-full" style={{ maxWidth: 340 }}>
      {/* Meme card */}
      <div
        id="roast-card"
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
          <div style={{ height: 44, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 14px' }}>
            <span style={{ fontFamily: 'monospace', fontSize: 12, color: '#fff', fontWeight: 600 }}>
              {data.domain}
            </span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 3 }}>
              <span style={{ fontFamily: 'monospace', fontSize: 20, fontWeight: 800, color: sColor, lineHeight: 1 }}>
                {data.score}%
              </span>
              <span style={{ fontFamily: 'monospace', fontSize: 10, color: '#555' }}>cooked</span>
            </div>
          </div>
          <div style={{ padding: '4px 14px 8px' }}>
            <span style={{ fontFamily: 'monospace', fontSize: 9, color: borderColor, letterSpacing: '0.08em' }}>
              {diag}
            </span>
          </div>
        </div>

        {/* SCORE BLOCK */}
        <div style={{ padding: '20px 14px 16px', backgroundColor: '#080808' }}>
          <div style={{ fontFamily: 'monospace', fontSize: 72, fontWeight: 900, color: sColor, lineHeight: 1, letterSpacing: -3 }}>
            {data.score}
          </div>
          <div style={{ fontFamily: 'monospace', fontSize: 10, color: '#444', letterSpacing: '0.2em', marginTop: 4 }}>
            COOKED SCORE
          </div>
        </div>

        {/* DIVIDER */}
        <div style={{ height: 1, backgroundColor: '#1a1a1a', margin: '0 14px' }} />

        {/* ROAST */}
        <div style={{ padding: '14px 14px 10px', backgroundColor: '#080808' }}>
          <p style={{ fontSize: 15, fontWeight: 700, color: '#ffffff', lineHeight: 1.4, margin: 0 }}>
            &ldquo;{data.roast}&rdquo;
          </p>
        </div>

        {/* FOOTER */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 14px', borderTop: '1px solid #111' }}>
          <span style={{ fontFamily: 'monospace', fontSize: 9, color: '#222' }}>getroasted.wtf</span>
          {rank != null && (
            <span style={{ fontFamily: 'monospace', fontSize: 9, color: '#333' }}>#{rank} Hall of Shame</span>
          )}
          <span style={{ fontFamily: 'monospace', fontSize: 9, color: hexToRgba(borderColor, 0.5) }}>
            {data.rarity}
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
            ? '✓ saved! opening X...'
            : 'share on X 𝕏 + download card'}
      </button>

      <p className="font-mono text-xs text-zinc-600 text-center" style={{ marginTop: 8 }}>
        // card downloads automatically · attach to tweet
      </p>
    </div>
  );
}
