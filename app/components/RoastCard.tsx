'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import type { RoastResult, Tag } from '@/lib/types';
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

function getStatFromTags(tags: Tag[], keyword: string, seed: number): number {
  const tag = tags.find(t => t.label.toLowerCase().includes(keyword));
  const pseudo = ((seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
  if (!tag) return 35 + pseudo * 15;
  if (tag.type === 'err') return 10 + pseudo * 20;
  if (tag.type === 'warn') return 30 + pseudo * 25;
  return 60 + pseudo * 25;
}

export function RoastCard({ data, rank }: { data: RoastResult; rank?: number }) {
  const [imgError, setImgError] = useState(false);
  const [buttonState, setButtonState] = useState<'default' | 'capturing' | 'done'>('default');

  const color = scoreColor(data.score);
  const code = exitCode(data.score);
  const rarityStyle = RARITY_STYLES[data.rarity];
  const borderColor = rarityStyle.border;

  const stats = useMemo(() => ({
    score: data.score,
    cta: getStatFromTags(data.tags, 'cta', data.score * 7),
    copy: getStatFromTags(data.tags, 'copy', data.score * 13),
    proof: getStatFromTags(data.tags, 'proof', data.score * 17),
  }), [data.tags, data.score]);

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

  const rarityClass = `pokemon-card pokemon-card-${data.rarity.toLowerCase()}`;

  return (
    <div className="w-full">
      {/* Pokemon-style card */}
      <div
        className={rarityClass}
        style={{
          backgroundColor: '#080808',
          borderRadius: 16,
          border: `2px solid ${borderColor}`,
          boxShadow: `0 0 30px ${hexToRgba(borderColor, 0.2)}, 0 0 60px ${hexToRgba(borderColor, 0.1)}`,
        }}
      >
        {/* HEADER BAR */}
        <div style={{
          backgroundColor: hexToRgba(borderColor, 0.2),
          borderBottom: `1px solid ${hexToRgba(borderColor, 0.4)}`,
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '10px 16px 4px',
          }}>
            <span style={{ fontFamily: 'monospace', fontSize: 13, color: '#fff', fontWeight: 600 }}>
              {data.domain}
            </span>
            {rank != null && (
              <span style={{ fontFamily: 'monospace', fontSize: 12, color: borderColor }}>
                #{rank} Hall of Shame
              </span>
            )}
          </div>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '0 16px 10px',
          }}>
            <span style={{ fontFamily: 'monospace', fontSize: 11, color: borderColor }}>
              ⬡ {data.rarity}
            </span>
            <span style={{ fontFamily: 'monospace', fontSize: 11, color: borderColor }}>
              {data.characterEmoji} {data.characterName}
            </span>
          </div>
        </div>

        {/* SCREENSHOT BANNER */}
        <div style={{
          width: '100%',
          height: 180,
          position: 'relative',
          borderTop: `1px solid ${hexToRgba(borderColor, 0.3)}`,
          borderBottom: `1px solid ${hexToRgba(borderColor, 0.3)}`,
          overflow: 'hidden',
          backgroundColor: '#0d0d0d',
        }}>
          {data.screenshotBase64 ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={`data:image/jpeg;base64,${data.screenshotBase64}`}
              alt={data.domain}
              style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top', display: 'block' }}
            />
          ) : (
            <div style={{
              width: '100%', height: '100%',
              background: `linear-gradient(180deg, ${hexToRgba(borderColor, 0.05)} 0%, transparent 100%)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ fontFamily: 'monospace', fontSize: 11, color: '#333' }}>no screenshot</span>
            </div>
          )}
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0, height: '30%',
            background: `linear-gradient(0deg, ${hexToRgba(borderColor, 0.25)} 0%, transparent 100%)`,
            pointerEvents: 'none',
          }} />
        </div>

        {/* CHARACTER ROW */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '12px 16px',
          backgroundColor: hexToRgba(borderColor, 0.08),
        }}>
          {!imgError ? (
            <Image
              src={CAT_IMAGES[data.rarity]}
              alt={data.characterName}
              width={56}
              height={56}
              unoptimized
              crossOrigin="anonymous"
              onError={() => setImgError(true)}
              style={{
                borderRadius: 8,
                border: `2px solid ${borderColor}`,
                objectFit: 'cover',
                flexShrink: 0,
              }}
            />
          ) : (
            <div style={{ width: 56, height: 56, borderRadius: 8, backgroundColor: '#1a1a1a', flexShrink: 0 }} />
          )}
          <div>
            <div style={{ fontFamily: 'sans-serif', fontSize: 14, fontWeight: 600, color: borderColor }}>
              {data.characterName}
            </div>
            <div style={{ fontFamily: 'sans-serif', fontSize: 11, fontStyle: 'italic', color: borderColor, opacity: 0.6, marginTop: 2, lineHeight: 1.4 }}>
              &ldquo;{data.characterDescription}&rdquo;
            </div>
          </div>
        </div>

        {/* STATS SECTION */}
        <div style={{ padding: '14px 16px', borderTop: '1px solid #1a1a1a' }}>
          <div style={{ fontFamily: 'monospace', fontSize: 10, color: '#555', letterSpacing: '0.15em', marginBottom: 10 }}>
            DAMAGE REPORT
          </div>
          {[
            { label: 'SCORE', value: `${data.score}/100`, fill: stats.score / 100 },
            { label: 'CTA', value: stats.cta < 25 ? 'weak' : stats.cta < 55 ? 'meh' : 'ok', fill: stats.cta / 100 },
            { label: 'COPY', value: stats.copy < 25 ? 'vague' : stats.copy < 55 ? 'generic' : 'clear', fill: stats.copy / 100 },
            { label: 'PROOF', value: stats.proof < 25 ? 'none' : stats.proof < 55 ? 'weak' : 'solid', fill: stats.proof / 100 },
          ].map(({ label, value, fill }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <span style={{ fontFamily: 'monospace', fontSize: 10, color: '#555', width: 48, flexShrink: 0 }}>{label}</span>
              <div style={{ flex: 1, height: 4, backgroundColor: '#1a1a1a', borderRadius: 2, overflow: 'hidden' }}>
                <div style={{ width: `${Math.round(fill * 100)}%`, height: '100%', backgroundColor: color, borderRadius: 2 }} />
              </div>
              <span style={{ fontFamily: 'monospace', fontSize: 10, color, width: 56, textAlign: 'right', flexShrink: 0 }}>{value}</span>
            </div>
          ))}
        </div>

        {/* EXIT CODE BAR */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 16px',
          backgroundColor: hexToRgba(borderColor, 0.12),
          borderTop: `1px solid ${hexToRgba(borderColor, 0.2)}`,
          borderBottom: `1px solid ${hexToRgba(borderColor, 0.2)}`,
        }}>
          <span style={{ fontFamily: 'monospace', fontSize: 11, color: borderColor }}>
            ⚡ {code}
          </span>
          <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: color, flexShrink: 0 }} />
        </div>

        {/* ROAST SECTION */}
        <div style={{ padding: '14px 16px' }}>
          <p style={{ fontSize: 16, fontWeight: 700, color: '#ffffff', lineHeight: 1.4, margin: '0 0 10px' }}>
            &ldquo;{data.roast}&rdquo;
          </p>
          <div style={{ borderTop: '1px solid #1a1a1a', marginBottom: 10 }} />
          <p style={{ fontFamily: 'monospace', fontSize: 10, color: '#E24B4A', marginBottom: 6 }}>
            // real talk
          </p>
          <p style={{ fontSize: 12, color: '#666', lineHeight: 1.6, margin: 0 }}>
            {data.stderr.replace(/\*\*/g, '')}
          </p>
        </div>

        {/* FOOTER */}
        <div style={{ padding: '8px', borderTop: '1px solid #1a1a1a', textAlign: 'center' }}>
          <span style={{ fontFamily: 'monospace', fontSize: 10, color: '#222' }}>getroasted.wtf</span>
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
