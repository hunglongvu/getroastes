'use client';

import { useState, useRef, useEffect } from 'react';
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

function tagStyle(type: 'err' | 'warn' | 'ok'): string {
  if (type === 'err')
    return 'border border-[#E24B4A]/40 bg-[#E24B4A]/10 text-[#E24B4A]';
  if (type === 'warn')
    return 'border border-[#EF9F27]/40 bg-[#EF9F27]/10 text-[#EF9F27]';
  return 'border border-[#639922]/40 bg-[#639922]/10 text-[#639922]';
}

function tagIcon(type: 'err' | 'warn' | 'ok'): string {
  if (type === 'err') return '✗';
  if (type === 'warn') return '⚠';
  return '✓';
}

function parseStderr(text: string): React.ReactNode {
  const parts = text.split(/\*\*(.*?)\*\*/g);
  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <span key={i} className="text-[#E24B4A] font-semibold">
        {part}
      </span>
    ) : (
      <span key={i}>{part}</span>
    )
  );
}

// Pure display component — can be rendered with or without a ref
function CardDisplay({
  data,
  innerRef,
}: {
  data: RoastResult;
  innerRef?: React.RefObject<HTMLDivElement | null>;
}) {
  const [imgError, setImgError] = useState(false);
  const color = scoreColor(data.score);
  const code = exitCode(data.score);
  const rarityStyle = RARITY_STYLES[data.rarity];

  return (
    <div
      ref={innerRef}
      id={innerRef ? 'roast-card' : undefined}
      className="relative w-full rounded-lg overflow-hidden"
      style={{
        backgroundColor: '#080808',
        border: `1px solid ${rarityStyle.border}`,
        boxShadow: rarityStyle.glow,
      }}
    >
      {/* Rarity background tint */}
      <div
        className="absolute inset-0 pointer-events-none z-0"
        style={{ backgroundColor: rarityStyle.bg }}
      />

      {/* Diagonal watermark */}
      <div className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center overflow-hidden">
        <span
          className="text-white font-mono font-bold text-5xl whitespace-nowrap select-none"
          style={{
            opacity: 0.035,
            transform: 'rotate(-30deg) scaleX(1.6)',
            letterSpacing: '0.08em',
          }}
        >
          getroasted.wtf &nbsp; getroasted.wtf &nbsp; getroasted.wtf
        </span>
      </div>

      {/* Main content */}
      <div className="relative z-20 p-6 sm:p-8">
        {/* Rarity badge */}
        <div className={`font-mono mb-1 ${rarityStyle.badge}`}>
          <span className="text-sm font-bold tracking-wider">
            ✦ {data.rarity}
          </span>
          <span className="text-sm mx-2 opacity-50">·</span>
          <span className="text-sm">
            {data.characterName} {data.characterEmoji}
          </span>
        </div>
        <p className={`text-xs font-sans mb-5 opacity-70 ${rarityStyle.badge}`}>
          &ldquo;{data.characterDescription}&rdquo;
        </p>

        {/* Cat image */}
        {!imgError && (
          <div className="flex flex-col items-center mb-6">
            <Image
              src={CAT_IMAGES[data.rarity]}
              alt={data.characterName}
              width={120}
              height={120}
              onError={() => setImgError(true)}
              style={{
                borderRadius: 8,
                border: `2px solid ${rarityStyle.border}`,
                objectFit: 'cover',
              }}
              unoptimized
              crossOrigin="anonymous"
            />
            <div className={`mt-2 text-xs font-mono ${rarityStyle.badge}`}>
              {data.characterName} {data.characterEmoji}
            </div>
            <div
              className={`text-xs font-sans italic opacity-60 ${rarityStyle.badge}`}
            >
              {data.characterDescription}
            </div>
          </div>
        )}

        {/* Screenshot */}
        {data.screenshotBase64 && (
          <div className="mb-6">
            <img
              src={`data:image/jpeg;base64,${data.screenshotBase64}`}
              alt="screenshot of roasted page"
              crossOrigin="anonymous"
              style={{
                width: '100%',
                borderRadius: '8px',
                border: '1px solid #1a1a1a',
                maxHeight: '200px',
                objectFit: 'cover',
                objectPosition: 'top',
              }}
            />
            <p className="text-zinc-600 text-xs font-mono mt-2 text-center">
              // above: the crime scene
            </p>
          </div>
        )}

        {/* Title bar */}
        <div className="flex items-center gap-3 mb-8">
          <div className="flex gap-1.5">
            <span className="block w-3 h-3 rounded-full bg-[#E24B4A]" />
            <span className="block w-3 h-3 rounded-full bg-[#EF9F27]" />
            <span className="block w-3 h-3 rounded-full bg-[#639922]" />
          </div>
          <span className="text-zinc-500 text-xs font-mono">
            getroasted.wtf — v2.0.0
          </span>
        </div>

        {/* Command */}
        <div className="font-mono text-sm mb-10 text-zinc-500">
          <span className="text-[#639922]">$</span> roast --url{' '}
          <span className="text-zinc-300">{data.domain}</span> --no-mercy
        </div>

        {/* Score */}
        <div className="text-center mb-2">
          <div
            className="text-8xl sm:text-9xl font-bold font-mono leading-none"
            style={{ color }}
          >
            {data.score}
          </div>
          <div
            className="mt-2 text-sm font-mono tracking-wider uppercase"
            style={{ color }}
          >
            {code}
          </div>
        </div>

        {/* Roast line */}
        <div className="mt-10 mb-8 text-center px-4">
          <p className="text-white text-xl sm:text-2xl leading-snug font-sans">
            &ldquo;{data.roast}&rdquo;
          </p>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 justify-center mb-8">
          {data.tags.map((tag, i) => (
            <span
              key={i}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-mono ${tagStyle(tag.type)}`}
            >
              <span>{tagIcon(tag.type)}</span>
              <span>{tag.label}</span>
            </span>
          ))}
        </div>

        {/* STDERR box */}
        <div
          className="rounded border border-zinc-800 p-4 mb-8"
          style={{ backgroundColor: '#0d0d0d' }}
        >
          <div className="text-[#E24B4A] text-xs font-mono mb-2">stderr:</div>
          <p className="text-zinc-400 text-sm font-sans leading-relaxed">
            {parseStderr(data.stderr)}
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center">
          <span className="text-zinc-600 text-xs font-mono">getroasted.wtf</span>
        </div>
      </div>

      {/* Bottom watermark banner */}
      <div
        className="relative z-20 flex items-center justify-center py-2 border-t border-zinc-800"
        style={{ backgroundColor: '#0a0a0a' }}
      >
        <span className="text-zinc-600 text-xs font-mono">
          🔒 clean card — coming soon
        </span>
      </div>
    </div>
  );
}

export function RoastCard({ data }: { data: RoastResult }) {
  const [fullscreen, setFullscreen] = useState(false);
  const [buttonState, setButtonState] = useState<'default' | 'capturing' | 'done'>('default');
  const cardRef = useRef<HTMLDivElement>(null);

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

      {/* Card — ref is here for html2canvas */}
      <CardDisplay data={data} innerRef={cardRef} />

      {/* Share button */}
      <div className="mt-4">
        <button
          onClick={handleShareAndDownload}
          disabled={buttonState !== 'default'}
          className="w-full font-mono font-medium"
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
            if (buttonState === 'default')
              e.currentTarget.style.backgroundColor = '#111';
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

        <p className="font-mono text-zinc-600 text-xs text-center mt-2">
          // downloads card + opens tweet · attach the image for maximum roast impact
        </p>
      </div>

      {/* Fullscreen modal */}
      {fullscreen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.95)' }}
          onClick={() => setFullscreen(false)}
        >
          <div
            className="w-full max-w-2xl overflow-y-auto"
            style={{ maxHeight: '90vh' }}
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
