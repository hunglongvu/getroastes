'use client';

// TODO: Re-enable Turnstile after debugging Cloudflare domain setup.
// Rate limiting (3/IP/day) provides interim bot protection.

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createPortal } from 'react-dom';
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

function LegalModal({ onClose }: { onClose: () => void }) {
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') { onClose(); return; }
    if (e.key === 'Tab' && modalRef.current) {
      const focusable = Array.from(
        modalRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, [tabindex]:not([tabindex="-1"])',
        ),
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault(); last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault(); first.focus();
      }
    }
  }, [onClose]);

  useEffect(() => {
    closeButtonRef.current?.focus();
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const listItem: React.CSSProperties = {
    fontFamily: 'monospace', fontSize: 13,
    color: 'rgba(255,255,255,0.6)', lineHeight: 1.9,
    listStyle: 'none', marginBottom: 4,
  };

  return createPortal(
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 99999,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(4px)',
      }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="legal-modal-title"
    >
      <div
        ref={modalRef}
        style={{
          background: '#000000', border: '1px solid #FF3B30',
          borderRadius: 12, padding: '40px 36px',
          maxWidth: 500, width: '90%', position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* × close */}
        <button
          ref={closeButtonRef}
          onClick={onClose}
          aria-label="Close modal"
          style={{
            position: 'absolute', top: 14, right: 16,
            background: 'none', border: 'none',
            color: 'rgba(255,255,255,0.35)', fontSize: 22,
            cursor: 'pointer', fontFamily: 'monospace', lineHeight: 1,
            padding: '2px 6px',
          }}
        >
          ×
        </button>

        <h2
          id="legal-modal-title"
          style={{ fontFamily: 'monospace', fontSize: 18, fontWeight: 700, color: '#FF3B30', marginBottom: 24 }}
        >
          legal disclaimer
        </h2>

        <p style={{ fontFamily: 'monospace', fontSize: 13, color: 'rgba(255,255,255,0.7)', lineHeight: 1.9, marginBottom: 12 }}>
          by checking this box, you confirm that:
        </p>
        <ul style={{ paddingLeft: 0, marginBottom: 20 }}>
          <li style={listItem}>— you are the owner of the submitted landing page, or</li>
          <li style={listItem}>— you have explicit permission from the owner to submit it for roasting</li>
        </ul>

        <p style={{ fontFamily: 'monospace', fontSize: 13, color: 'rgba(255,255,255,0.7)', lineHeight: 1.9, marginBottom: 12 }}>
          you accept that the generated roast will be:
        </p>
        <ul style={{ paddingLeft: 0, marginBottom: 20 }}>
          <li style={listItem}>— AI-generated and may be harsh or satirical</li>
          <li style={listItem}>— publicly visible on getroasted.wtf</li>
          <li style={listItem}>— shareable on social media platforms</li>
        </ul>

        <p style={{ fontFamily: 'monospace', fontSize: 12, color: 'rgba(255,255,255,0.4)', lineHeight: 1.9, marginBottom: 28 }}>
          getroasted.wtf assumes good faith based on this confirmation. if a URL is submitted
          without authorization, contact{' '}
          <a href="mailto:info@hunglongvu.com" style={{ color: '#FF3B30' }}>
            info@hunglongvu.com
          </a>
          {' '}for immediate removal within 48 hours.
          <br /><br />
          this is a satirical tool. roasts do not represent factual claims about any company,
          product, or person.
        </p>

        <button
          onClick={onClose}
          style={{
            width: '100%', padding: '13px 0',
            background: '#FF3B30', border: 'none', borderRadius: 8,
            fontFamily: 'monospace', fontSize: 14, fontWeight: 700,
            color: '#ffffff', cursor: 'pointer',
          }}
        >
          i understand
        </button>
      </div>
    </div>,
    document.body,
  );
}

export function RoastForm() {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');
  const [animating, setAnimating] = useState(false);
  const [domain, setDomain] = useState('');
  const [apiReady, setApiReady] = useState(false);
  const [rateLimited, setRateLimited] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [shaking, setShaking] = useState(false);

  const router = useRouter();
  const resultRef = useRef<RoastResult | null>(null);
  const navigatedRef = useRef(false);

  function triggerShake() {
    setShaking(true);
    setTimeout(() => setShaking(false), 600);
  }

  function navigate(result: RoastResult) {
    if (navigatedRef.current) return;
    navigatedRef.current = true;
    router.push(`/roast/${result.id}`);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (animating) return;
    if (!url.trim()) return;
    if (!agreed) { triggerShake(); return; }

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
        body: JSON.stringify({ url: url.trim(), ownershipConfirmed: true }),
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
    if (resultRef.current) navigate(resultRef.current);
  }

  const canSubmit = agreed && !!url.trim() && !animating;

  if (rateLimited) {
    return (
      <div
        className="w-full max-w-xl mx-auto"
        style={{
          border: '1px solid rgba(255,59,48,0.3)', borderRadius: 10,
          padding: '28px 32px', background: 'rgba(255,59,48,0.05)', textAlign: 'center',
        }}
      >
        <p className="font-mono font-bold mb-3" style={{ fontSize: 16, color: '#ffffff' }}>
          you&apos;ve been roasted enough today.
        </p>
        <p className="font-mono text-sm" style={{ color: 'rgba(255,255,255,0.4)', marginBottom: 20 }}>
          come back tomorrow or →
        </p>
        <a
          href="#waitlist"
          className="font-mono text-sm"
          style={{
            display: 'inline-block', padding: '10px 20px',
            border: '1px solid rgba(255,59,48,0.5)', borderRadius: 6,
            color: '#FF3B30', textDecoration: 'none',
          }}
        >
          join waitlist for unlimited
        </a>
      </div>
    );
  }

  return (
    <>
      {showModal && <LegalModal onClose={() => setShowModal(false)} />}

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
            disabled={animating}
            className="px-6 py-3 rounded-lg text-white font-mono text-sm whitespace-nowrap cursor-pointer transition-all"
            style={{
              backgroundColor: canSubmit ? '#ff3a1f' : '#333',
              fontWeight: 700,
              boxShadow: canSubmit ? '0 0 30px rgba(255,58,31,0.4)' : 'none',
              cursor: animating ? 'not-allowed' : 'pointer',
              opacity: animating ? 0.4 : 1,
            }}
            onMouseEnter={(e) => { if (canSubmit) e.currentTarget.style.backgroundColor = '#ff5438'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = canSubmit ? '#ff3a1f' : '#333'; }}
          >
            Roast it →
          </button>
        </div>

        {/* Ownership checkbox */}
        <div className="flex items-center justify-center gap-2 mt-4">
          <div
            className={shaking ? 'checkbox-shake' : ''}
            style={{
              display: 'flex',
              boxShadow: shaking ? '0 0 14px rgba(255,59,48,0.7)' : 'none',
              borderRadius: 3,
              transition: 'box-shadow 0.3s',
            }}
          >
            <input
              type="checkbox"
              id="ownership-checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              disabled={animating}
              aria-label="Confirm I own or have permission to roast this page"
              style={{ accentColor: '#FF3B30', cursor: 'pointer', width: 15, height: 15 }}
            />
          </div>

          <span
            className="legal-link font-mono"
            style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', cursor: 'pointer' }}
            role="button"
            tabIndex={0}
            onClick={() => setShowModal(true)}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setShowModal(true); }}
            aria-label="View legal disclaimer"
          >
            i built this page. i can handle it.
          </span>

          <button
            type="button"
            onClick={() => setShowModal(true)}
            aria-label="View legal disclaimer"
            style={{
              background: 'none', border: 'none', padding: 0,
              color: 'rgba(255,255,255,0.3)', cursor: 'pointer',
              fontFamily: 'monospace', fontSize: 14, lineHeight: 1,
            }}
          >
            ⓘ
          </button>
        </div>

        {error && (
          <p className="mt-3 text-[#E24B4A] text-sm font-mono text-center">{error}</p>
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
