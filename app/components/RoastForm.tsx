'use client';

// TODO: Re-enable Turnstile after debugging Cloudflare domain setup.
// Rate limiting (3/IP/day) provides interim bot protection.

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { TerminalAnimation } from './TerminalAnimation';
import type { RoastResult } from '@/lib/types';

function extractDomain(raw: string): string {
  let normalized = raw.trim();
  if (!normalized.startsWith('http://') && !normalized.startsWith('https://')) {
    normalized = `https://${normalized}`;
  }
  try {
    return new URL(normalized).hostname;
  } catch {
    return raw.trim();
  }
}

export function RoastForm() {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');
  const [animating, setAnimating] = useState(false);
  const [domain, setDomain] = useState('');
  const [apiReady, setApiReady] = useState(false);
  const [rateLimited, setRateLimited] = useState(false);

  const router = useRouter();
  const resultRef = useRef<RoastResult | null>(null);
  const navigatedRef = useRef(false);

  function navigate(result: RoastResult) {
    if (navigatedRef.current) return;
    navigatedRef.current = true;
    router.push(`/roast/${result.id}`);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!url.trim() || animating) return;

    const d = extractDomain(url);
    setDomain(d);
    setError('');
    setRateLimited(false);
    setApiReady(false);
    setAnimating(true);
    resultRef.current = null;
    navigatedRef.current = false;

    try {
      const res = await fetch('/api/roast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() }),
      });

      if (!res.ok) {
        const data: { error?: string; message?: string } = await res.json();
        setAnimating(false);
        if (data.error === 'limit_reached') {
          setRateLimited(true);
        } else {
          setError(data.message ?? data.error ?? 'Something went wrong. Try again.');
        }
        return;
      }

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        const events = buffer.split('\n\n');
        buffer = events.pop() ?? '';

        for (const event of events) {
          const line = event.split('\n').find((l) => l.startsWith('data:'));
          if (!line) continue;

          const json = JSON.parse(line.slice('data:'.length).trim()) as {
            type: string;
            result?: RoastResult;
            error?: string;
          };

          if (json.type === 'done' && json.result) {
            resultRef.current = json.result;
            setApiReady(true);
          } else if (json.type === 'error') {
            setAnimating(false);
            setError(json.error ?? 'Something went wrong. Try again.');
            return;
          }
        }
      }
    } catch {
      setAnimating(false);
      setError('Network error. Try again.');
    }
  }

  function handleAnimationDone() {
    if (resultRef.current) {
      navigate(resultRef.current);
    }
  }

  if (rateLimited) {
    return (
      <div
        className="w-full max-w-xl mx-auto"
        style={{
          border: '1px solid rgba(255,59,48,0.3)',
          borderRadius: 10,
          padding: '28px 32px',
          background: 'rgba(255,59,48,0.05)',
          textAlign: 'center',
        }}
      >
        <p
          className="font-mono font-bold mb-3"
          style={{ fontSize: 16, color: '#ffffff' }}
        >
          you&apos;ve been roasted enough today.
        </p>
        <p className="font-mono text-sm" style={{ color: 'rgba(255,255,255,0.4)', marginBottom: 20 }}>
          come back tomorrow or →
        </p>
        <a
          href="#waitlist"
          className="font-mono text-sm"
          style={{
            display: 'inline-block',
            padding: '10px 20px',
            border: '1px solid rgba(255,59,48,0.5)',
            borderRadius: 6,
            color: '#FF3B30',
            textDecoration: 'none',
          }}
        >
          join waitlist for unlimited
        </a>
      </div>
    );
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="w-full max-w-xl mx-auto">
        <div className="flex gap-2">
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="yoursite.com"
            disabled={animating}
            className="flex-1 px-4 py-3 rounded-lg bg-zinc-900 border border-zinc-700 text-white placeholder-zinc-500 font-mono text-sm focus:outline-none focus:border-zinc-500 disabled:opacity-50 transition-colors"
            autoComplete="off"
            spellCheck={false}
          />
          <button
            type="submit"
            disabled={animating || !url.trim()}
            className="px-6 py-3 rounded-lg text-white font-mono text-sm disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap cursor-pointer transition-colors"
            style={{
              backgroundColor: '#ff3a1f',
              fontWeight: 700,
              boxShadow: '0 0 30px rgba(255,58,31,0.4)',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#ff5438'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#ff3a1f'; }}
          >
            Roast it →
          </button>
        </div>
        {error && (
          <p className="mt-3 text-[#E24B4A] text-sm font-mono">{error}</p>
        )}
      </form>

      {animating && (
        <TerminalAnimation
          domain={domain}
          apiReady={apiReady}
          onDone={handleAnimationDone}
        />
      )}
    </>
  );
}
