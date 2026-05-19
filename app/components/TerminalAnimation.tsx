'use client';

import { useEffect, useRef, useState, useCallback, useMemo } from 'react';

function pick<T>(arr: T[], n: number): T[] {
  return [...arr].sort(() => Math.random() - 0.5).slice(0, n);
}

function lineColor(text: string): string {
  if (text.startsWith('> ERROR')) return '#E24B4A';
  if (text.startsWith('> WARNING')) return '#EF9F27';
  if (text.startsWith('> ')) return '#EF9F27';
  if (text.startsWith('$')) return '#639922';
  return '#71717a';
}

function buildLines(domain: string): string[] {
  const green = [
    '$ npm install brutal-honesty...',
    '$ running git blame on the value prop...',
    '$ asking my dog to review the CTA...',
    '$ checking if your mom would understand this...',
    '$ consulting a fortune cookie for the value prop...',
    '$ measuring distance between CTA and human comprehension...',
    '$ checking if anyone has scrolled past the fold...',
    '$ asking your therapist about this landing page...',
    '$ showing this to my goldfish...',
    '$ calculating founder tears...',
    '$ checking if this was written by a human...',
    '$ scanning for buzzwords...',
  ];

  const errors = [
    '> ERROR: not even my dog would click this CTA',
    '> ERROR: value prop: undefined. literally.',
    '> ERROR: even the 404 page is more memorable',
    "> ERROR: bro wrote 'revolutionary' and went to sleep",
    '> ERROR: social proof: null',
    '> ERROR: my goldfish has a longer attention span',
    '> WARNING: copy written by committee at 5pm friday',
    '> WARNING: ChatGPT fingerprints detected in copy',
    '> WARNING: Figma template shipped to production',
    "> WARNING: 'seamless' is deprecated since 2019",
    '> WARNING: O(n) buzzwords detected',
  ];

  return [
    '$ initializing roast engine v2.0...',
    `$ fetching target: ${domain}...`,
    ...pick(green, 4),
    ...pick(errors, 3),
    '$ compiling roast...',
    '$ deploying brutality --no-mercy --no-chill...',
    '> roast ready. this is going to hurt.',
  ];
}

interface Props {
  domain: string;
  apiReady: boolean;
  onDone: () => void;
}

export function TerminalAnimation({ domain, apiReady, onDone }: Props) {
  const lines = useMemo(() => buildLines(domain), [domain]);

  const [completedLines, setCompletedLines] = useState<string[]>([]);
  const [currentText, setCurrentText] = useState('');
  const [phase, setPhase] = useState<'typing' | 'waiting' | 'done'>('typing');
  const [visible, setVisible] = useState(true);

  const lineIdxRef = useRef(0);
  const charIdxRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const apiReadyRef = useRef(apiReady);
  const onDoneRef = useRef(onDone);

  useEffect(() => { apiReadyRef.current = apiReady; }, [apiReady]);
  useEffect(() => { onDoneRef.current = onDone; }, [onDone]);

  const finish = useCallback(() => {
    setPhase('done');
    setTimeout(() => {
      setVisible(false);
      setTimeout(() => onDoneRef.current(), 150);
    }, 400);
  }, []);

  useEffect(() => {
    if (apiReady && phase === 'waiting') finish();
  }, [apiReady, phase, finish]);

  useEffect(() => {
    const CHAR_MS = 35;
    const LINE_MS = 120;

    function tick() {
      const idx = lineIdxRef.current;
      if (idx >= lines.length) {
        if (apiReadyRef.current) {
          finish();
        } else {
          setPhase('waiting');
        }
        return;
      }

      const line = lines[idx];
      const charIdx = charIdxRef.current;

      if (charIdx < line.length) {
        charIdxRef.current = charIdx + 1;
        setCurrentText(line.slice(0, charIdx + 1));
        timerRef.current = setTimeout(tick, CHAR_MS);
      } else {
        setCompletedLines((prev) => [...prev, line]);
        setCurrentText('');
        lineIdxRef.current = idx + 1;
        charIdxRef.current = 0;
        timerRef.current = setTimeout(tick, LINE_MS);
      }
    }

    timerRef.current = setTimeout(tick, 200);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const currentColor =
    lineIdxRef.current < lines.length
      ? lineColor(lines[lineIdxRef.current])
      : '#639922';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{
        background: 'rgba(0,0,0,0.88)',
        backdropFilter: 'blur(5px)',
        transition: 'opacity 0.15s',
        opacity: visible ? 1 : 0,
      }}
    >
      {/* Terminal window */}
      <div
        style={{
          width: 'min(640px, 92vw)',
          backgroundColor: '#0d0d0d',
          borderRadius: 10,
          border: '1px solid #2a2a2a',
          boxShadow: '0 30px 100px rgba(0,0,0,0.9), 0 0 0 1px rgba(255,255,255,0.05)',
          overflow: 'hidden',
        }}
      >
        {/* Title bar */}
        <div
          style={{
            height: 38,
            backgroundColor: '#1c1c1c',
            borderBottom: '1px solid #2a2a2a',
            display: 'flex',
            alignItems: 'center',
            padding: '0 16px',
            position: 'relative',
          }}
        >
          <div style={{ display: 'flex', gap: 8 }}>
            {(['#E24B4A', '#EF9F27', '#639922'] as const).map((c) => (
              <div
                key={c}
                style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: c }}
              />
            ))}
          </div>
          <span
            style={{
              position: 'absolute',
              left: '50%',
              transform: 'translateX(-50%)',
              fontFamily: 'monospace',
              fontSize: 12,
              color: '#555',
            }}
          >
            roast-engine — zsh — 80×24
          </span>
        </div>

        {/* Terminal body */}
        <div
          style={{
            padding: '20px 24px 28px',
            minHeight: 260,
            fontFamily: 'monospace',
            fontSize: 13,
            lineHeight: 1.9,
          }}
        >
          {completedLines.map((line, i) => (
            <div key={i} style={{ color: lineColor(line) }}>
              {line}
            </div>
          ))}

          {/* Currently typing */}
          {phase === 'typing' && (
            <div style={{ color: currentColor }}>
              {currentText}
              <span style={{ animation: 'cur-blink 530ms step-start infinite' }}>▋</span>
            </div>
          )}

          {/* Waiting for API */}
          {phase === 'waiting' && (
            <div style={{ color: '#639922' }}>
              {'$ waiting for AI to stop laughing...'}
              <span style={{ animation: 'cur-blink 530ms step-start infinite' }}>▋</span>
            </div>
          )}

          {/* Done */}
          {phase === 'done' && (
            <div style={{ color: '#E24B4A' }}>
              {'// roast ready. this is going to hurt.'}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes cur-blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}
