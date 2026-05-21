'use client';

import { useState } from 'react';
import { createPortal } from 'react-dom';
import type { RoastResult } from '@/lib/types';

function ShareModal({ tweetUrl, onClose }: { tweetUrl: string; onClose: () => void }) {
  function openTweet() {
    window.open(tweetUrl, '_blank');
    onClose();
  }

  return createPortal(
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 99999,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.8)',
        backdropFilter: 'blur(4px)',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#111', border: '1px solid #222',
          borderRadius: 12, padding: 40, maxWidth: 420, width: '90%',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <p style={{ fontSize: 20, fontWeight: 700, color: '#ffffff', margin: '0 0 8px' }}>
          card downloaded 🔥
        </p>
        <p style={{ fontFamily: 'monospace', fontSize: 13, color: '#ff4444', margin: '0 0 16px' }}>
          // attach the image or it&apos;s just words
        </p>
        <p style={{ fontSize: 15, color: '#888', lineHeight: 1.6, margin: '0 0 28px' }}>
          tweet is pre-filled with your url + score. attach the card so they can see exactly how cooked you are.
        </p>
        <button
          onClick={openTweet}
          style={{
            width: '100%', padding: 14, borderRadius: 8,
            backgroundColor: '#ff4444', color: '#ffffff',
            fontSize: 15, fontWeight: 600, border: 'none',
            cursor: 'pointer', marginBottom: 12, fontFamily: 'monospace',
          }}
        >
          continue to X →
        </button>
        <button
          onClick={openTweet}
          style={{
            width: '100%', background: 'none', border: 'none',
            color: '#444', fontSize: 14, cursor: 'pointer',
            fontFamily: 'monospace', padding: '6px 0',
          }}
        >
          skip
        </button>
      </div>
    </div>,
    document.body,
  );
}

export function ShareButton({ data }: { data: RoastResult }) {
  const [buttonState, setButtonState] = useState<'default' | 'capturing' | 'done'>('default');
  const [showModal, setShowModal] = useState(false);
  const [tweetUrl, setTweetUrl] = useState('');

  async function handleClick() {
    if (buttonState !== 'default') return;
    setButtonState('capturing');

    // Strip any quote chars the model may have wrapped the roast in
    const roastClean = data.roast.replace(/^[""''"']+|[""''"']+$/g, '').trim();
    // Twitter counts any URL-like token in text as 23 chars, and the url= param as 23 chars.
    // Fixed tokens: domain(23) + " got roasted at "(16) + score(≤3) + "% cooked\n\n\""(12) + "\""(1) = ~55
    // url param = 23. Budget for roast quote ≈ 280 - 55 - 23 = 202 chars.
    const MAX_ROAST = 200;
    const roastSnippet = roastClean.length > MAX_ROAST
      ? roastClean.slice(0, MAX_ROAST).replace(/\s\S*$/, '') + '…'
      : roastClean;
    const tweetText = `${data.domain} got roasted at ${data.score}% cooked\n\n"${roastSnippet}"`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}&url=${encodeURIComponent('https://getroasted.wtf')}`;

    try {
      const response = await fetch(`/api/card-image/${data.id}`);
      if (!response.ok) throw new Error(`Card generation failed: ${response.status}`);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = `roast-${data.domain}.png`;
      a.click();
      URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error('Download failed:', err);
      window.open(`/api/card-image/${data.id}`, '_blank');
    }

    setButtonState('done');
    setTweetUrl(url);
    setShowModal(true);
  }

  function handleClose() {
    setShowModal(false);
    setTimeout(() => setButtonState('default'), 300);
  }

  return (
    <>
      {showModal && <ShareModal tweetUrl={tweetUrl} onClose={handleClose} />}
      <button
        onClick={handleClick}
        disabled={buttonState !== 'default'}
        style={{
          width: '100%',
          padding: '16px',
          borderRadius: 10,
          fontSize: 16,
          fontWeight: 600,
          fontFamily: 'inherit',
          backgroundColor: buttonState === 'done' ? '#639922' : '#E24B4A',
          color: '#ffffff',
          border: 'none',
          cursor: buttonState !== 'default' ? 'not-allowed' : 'pointer',
          opacity: buttonState === 'capturing' ? 0.6 : 1,
          transition: 'background-color 0.15s, opacity 0.15s',
        }}
      >
        {buttonState === 'capturing'
          ? 'capturing card...'
          : buttonState === 'done'
            ? '✓ saved!'
            : 'share on X 𝕏 + download card'}
      </button>
    </>
  );
}
