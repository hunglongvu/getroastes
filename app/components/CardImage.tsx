'use client';

import { useEffect, useRef, useState } from 'react';

const ALL_LINES = [
  'rendering your shame...',
  'summoning the right cat...',
  'adjusting cook temperature...',
  'compiling your regret...',
  'downloading the truth...',
  'preparing meme format...',
  'cropping your dignity...',
  'saving evidence...',
  'burning the file in...',
  'calibrating cat judgment...',
  'warming up the oven...',
];

type LoadState = 'loading' | 'exiting' | 'loaded' | 'error';

export default function CardImage({ src, alt }: { src: string; alt: string }) {
  const [state, setState] = useState<LoadState>('loading');
  const [retryKey, setRetryKey] = useState(0);
  const linesRef = useRef<string[]>(
    [...ALL_LINES].sort(() => Math.random() - 0.5).slice(0, 4),
  );

  // 10s timeout fallback
  useEffect(() => {
    const timeout = setTimeout(() => {
      setState((s) => (s === 'loading' ? 'error' : s));
    }, 10000);
    return () => clearTimeout(timeout);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [retryKey]);

  const handleLoad = () => {
    setState('exiting');
    setTimeout(() => setState('loaded'), 300);
  };

  const handleError = () => setState('error');

  const handleRetry = () => {
    linesRef.current = [...ALL_LINES].sort(() => Math.random() - 0.5).slice(0, 4);
    setRetryKey((k) => k + 1);
    setState('loading');
  };

  const showTerminal = state === 'loading' || state === 'exiting';

  return (
    <div className="card-preview-wrapper">
      {/* Terminal loading / error */}
      {(showTerminal || state === 'error') && (
        <div className={`card-loading-terminal${state === 'exiting' ? ' exiting' : ''}`}>
          <div className="terminal-header">
            <span className="terminal-dot red" />
            <span className="terminal-dot yellow" />
            <span className="terminal-dot green" />
            <span className="terminal-title">card-renderer — zsh</span>
          </div>

          {state === 'error' ? (
            <div className="terminal-body">
              <div className="terminal-line" style={{ opacity: 1 }}>
                <span className="prompt warning">&gt;</span>
                <span className="text warning">card failed to render.</span>
              </div>
              <div className="terminal-line" style={{ opacity: 1, animationDelay: '0.1s' }}>
                <span className="prompt">$</span>
                <span className="text">
                  <button
                    onClick={handleRetry}
                    style={{
                      fontFamily: 'inherit',
                      fontSize: 'inherit',
                      color: '#00FF41',
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      padding: 0,
                    }}
                  >
                    try again →
                  </button>
                </span>
              </div>
            </div>
          ) : (
            <div className="terminal-body">
              {linesRef.current.map((line, i) => (
                <div key={i} className="terminal-line">
                  <span className="prompt">$</span>
                  <span className="text">{line}</span>
                </div>
              ))}
              <div className="terminal-line">
                <span className="prompt warning">&gt;</span>
                <span className="text warning">
                  almost ready
                  <span className="terminal-cursor">█</span>
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Actual image — always in DOM while not errored so onLoad fires */}
      {state !== 'error' && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={retryKey}
          src={src}
          alt={alt}
          onLoad={handleLoad}
          onError={handleError}
          className={state === 'loaded' ? 'card-image loaded' : 'card-image loading'}
          style={{ borderRadius: 8 }}
        />
      )}
    </div>
  );
}
