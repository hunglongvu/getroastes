'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ShareButton } from '@/app/components/ShareButton';
import CardImage from '@/app/components/CardImage';
import type { RoastResult } from '@/lib/types';

type AnimationStage = 'init' | 'score' | 'tier' | 'roast' | 'card' | 'done';

function getTierName(score: number): string {
  if (score <= 19) return 'BARELY COOKED';
  if (score <= 39) return 'LIGHTLY TOASTED';
  if (score <= 59) return 'DEEP FRIED';
  if (score <= 79) return 'CRISPY';
  return 'BURNED';
}

export default function RoastResult({
  roast,
  rank,
  total,
}: {
  roast: RoastResult;
  rank: number;
  total: number;
}) {
  const [stage, setStage] = useState<AnimationStage>('init');
  const [typedText, setTypedText] = useState('');
  const [animationPlayed, setAnimationPlayed] = useState(false);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const roastText = roast.roast;
  const tierName = getTierName(roast.score);

  const skipToEnd = useCallback(() => {
    if (stage === 'done') return;
    timeoutsRef.current.forEach(clearTimeout);
    setStage('done');
    setTypedText(roastText);
  }, [stage, roastText]);

  useEffect(() => {
    const key = `roast-animated-${roast.id}`;
    if (sessionStorage.getItem(key)) {
      setStage('done');
      setTypedText(roastText);
      return;
    }
    sessionStorage.setItem(key, 'true');
    setAnimationPlayed(true);

    const t = [
      setTimeout(() => setStage('score'), 300),
      setTimeout(() => setStage('tier'),  1000),
      setTimeout(() => setStage('roast'), 1400),
      setTimeout(() => setStage('card'),  1800),
      setTimeout(() => setStage('done'),  2800),
    ];
    timeoutsRef.current = t;
    return () => t.forEach(clearTimeout);
  }, [roast.id, roastText]);

  // Typewriter
  useEffect(() => {
    if (stage !== 'roast' && stage !== 'card' && stage !== 'done') return;
    if (typedText.length >= roastText.length) return;
    const t = setTimeout(() => {
      setTypedText(roastText.slice(0, typedText.length + 1));
    }, 28);
    return () => clearTimeout(t);
  }, [typedText, stage, roastText]);

  const showScore = stage !== 'init';
  const showTier  = stage === 'tier'  || stage === 'roast' || stage === 'card' || stage === 'done';
  const showRoast = stage === 'roast' || stage === 'card'  || stage === 'done';
  const showCard  = stage === 'card'  || stage === 'done';
  const typingDone = typedText.length >= roastText.length;

  return (
    <div
      className="flex flex-col md:flex-row"
      style={{ gap: 48, alignItems: 'flex-start', cursor: stage !== 'done' ? 'pointer' : 'default' }}
      onClick={skipToEnd}
    >
      {/* LEFT */}
      <div
        className="order-2 md:order-1"
        style={{ flex: '1 1 0', minWidth: 0, display: 'flex', flexDirection: 'column' }}
      >
        {/* Domain */}
        <p
          style={{
            fontFamily: 'monospace',
            fontSize: 12,
            fontWeight: 600,
            color: 'rgba(255,255,255,0.3)',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            marginBottom: 24,
            opacity: showScore ? 1 : 0,
            transition: 'opacity 0.4s ease',
          }}
        >
          {roast.domain}
        </p>

        {/* Score */}
        {showScore && (
          <div
            className={animationPlayed ? 'score-reveal' : undefined}
            style={{
              display: 'flex',
              alignItems: 'baseline',
              gap: 20,
              flexWrap: 'wrap',
              marginBottom: 24,
              // only set color when not animating — animation owns the color transition
              ...(animationPlayed ? {} : { color: '#ff8c00' }),
            }}
          >
            <span
              style={{
                fontSize: 96,
                fontWeight: 900,
                lineHeight: 1,
                letterSpacing: -2,
                textShadow: '0 0 40px rgba(255,140,0,0.5)',
              }}
            >
              {roast.score}%
            </span>
            <span style={{ fontSize: 40, fontWeight: 700, letterSpacing: 4 }}>
              COOKED
            </span>
          </div>
        )}

        {/* Tier */}
        {showTier && (
          <p
            className={animationPlayed ? 'tier-reveal' : undefined}
            style={{
              fontFamily: 'monospace',
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: '0.25em',
              marginBottom: 16,
              color: '#FF3B30',
              textShadow: '0 0 20px rgba(255,59,48,0.4)',
            }}
          >
            {tierName}
          </p>
        )}

        {/* Divider */}
        {showTier && (
          <div
            style={{
              width: '100%',
              height: 1,
              background: 'rgba(255,140,0,0.35)',
              marginBottom: 28,
              ...(animationPlayed
                ? { opacity: 0, animation: 'fadeIn 0.4s ease 0.2s forwards' }
                : {}),
            }}
          />
        )}

        {/* Roast text */}
        {showRoast && (
          <p
            style={{
              fontSize: 22,
              fontWeight: 600,
              color: '#ffffff',
              lineHeight: 1.5,
              marginBottom: 32,
              minHeight: 88,
            }}
          >
            {typedText}
            {!typingDone && <span className="roast-cursor">_</span>}
          </p>
        )}

        {/* Share + rank — visible once card appears */}
        {showCard && (
          <>
            <div style={{ marginBottom: 12 }} onClick={(e) => e.stopPropagation()}>
              <ShareButton data={roast} />
            </div>
            <p
              style={{
                fontFamily: 'monospace',
                fontSize: 12,
                color: 'rgba(255,255,255,0.2)',
                textAlign: 'center',
                marginBottom: 20,
              }}
            >
              // don&apos;t forget to attach the image
            </p>
            <p style={{ fontFamily: 'monospace', fontSize: 11, color: '#666' }}>
              🏆 #{rank} of {total.toLocaleString()} roasted
            </p>
          </>
        )}
      </div>

      {/* RIGHT — card image */}
      {showCard && (
        <div
          className={`order-1 md:order-2${animationPlayed ? ' card-slide-in' : ''}`}
          style={{ flex: '1 1 0', minWidth: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="md:sticky" style={{ top: 24 }}>
            <CardImage
              src={`/api/card-image/${roast.id}`}
              alt={`roast card for ${roast.domain}`}
            />
          </div>
        </div>
      )}
    </div>
  );
}
