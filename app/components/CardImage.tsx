'use client';

import { useEffect, useRef, useState } from 'react';

const LOADING_MESSAGES = [
  'cooking your card...',
  'summoning the cat...',
  'preparing your shame...',
  'loading your trauma...',
  'compiling regret...',
  'downloading the truth...',
  'rendering disappointment...',
];

export default function CardImage({ src, alt }: { src: string; alt: string }) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const messageRef = useRef(
    LOADING_MESSAGES[Math.floor(Math.random() * LOADING_MESSAGES.length)],
  );

  useEffect(() => {
    if (loaded) return;
    const timeout = setTimeout(() => {
      setError(true);
    }, 10000);
    return () => clearTimeout(timeout);
  }, [loaded]);

  return (
    <div className="card-preview-wrapper">
      {!loaded && !error && (
        <div className="card-loading">
          <div className="card-loading-content">
            <div className="card-loading-icon">🔥</div>
            <div className="card-loading-text">{messageRef.current}</div>
            <div className="card-loading-progress">
              <span className="card-loading-dot" />
              <span className="card-loading-dot" />
              <span className="card-loading-dot" />
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="card-loading">
          <div className="card-loading-content">
            <div className="card-loading-icon">⚠️</div>
            <div className="card-loading-text">card failed to load.</div>
            <button
              onClick={() => { setError(false); setLoaded(false); }}
              style={{
                fontFamily: 'monospace',
                fontSize: 13,
                color: '#FF3B30',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                marginTop: 8,
              }}
            >
              try again →
            </button>
          </div>
        </div>
      )}

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
        className={loaded ? 'card-image loaded' : 'card-image loading'}
        style={{ borderRadius: 8 }}
      />
    </div>
  );
}
