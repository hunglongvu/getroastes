'use client';

import { useEffect, useRef, useState, useCallback, useMemo } from 'react';

const CAUSES = [
  'undefined value proposition',
  'CTA buried beyond human reach',
  'hero section: 0 humans understood it',
  'copy last updated: never',
  'seamless detected 4 times. nothing was seamless.',
];

const LAST_WORDS = [
  '"we are revolutionizing the industry"',
  '"seamless integration"',
  '"game-changing solution"',
  '"schedule a call to learn more"',
  '"streamline your workflow"',
];

interface LineSpec {
  label: string;
  value: string;
  valueColor: 'white' | 'red' | 'green';
  bold?: boolean;
  empty?: boolean;
}

function buildLines(domain: string): LineSpec[] {
  const date = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const cause = CAUSES[Math.floor(Math.random() * CAUSES.length)];
  const lastWords = LAST_WORDS[Math.floor(Math.random() * LAST_WORDS.length)];

  return [
    { label: 'PATIENT:', value: domain, valueColor: 'white' },
    { label: 'DATE OF ADMISSION:', value: date, valueColor: 'white' },
    { label: 'PROGNOSIS:', value: 'critical', valueColor: 'red' },
    { label: '', value: '', valueColor: 'white', empty: true },
    { label: 'CAUSE OF DEATH:', value: cause, valueColor: 'white' },
    { label: 'TIME OF DEATH:', value: 'the moment the hero section loaded', valueColor: 'white' },
    { label: 'LAST WORDS:', value: lastWords, valueColor: 'white' },
    { label: '', value: '', valueColor: 'white', empty: true },
    { label: 'EXAMINING PHYSICIAN:', value: 'getroasted.wtf AI', valueColor: 'white' },
    { label: 'VERDICT:', value: 'roast incoming. brace yourself.', valueColor: 'red', bold: true },
    { label: '', value: '', valueColor: 'white', empty: true },
    { label: '', value: 'compiling damage report...', valueColor: 'green' },
  ];
}

const VALUE_COLORS = {
  white: '#ffffff',
  red: '#E24B4A',
  green: '#639922',
} as const;

interface Props {
  domain: string;
  apiReady: boolean;
  onDone: () => void;
}

export function TerminalAnimation({ domain, apiReady, onDone }: Props) {
  const caseNum = useMemo(() => String(Math.floor(1000 + Math.random() * 9000)), []);
  const lines = useMemo(() => buildLines(domain), [domain]);

  const [completedLines, setCompletedLines] = useState<LineSpec[]>([]);
  const [currentValue, setCurrentValue] = useState('');
  const [stamp, setStamp] = useState(false);
  const [phase, setPhase] = useState<'typing' | 'waiting' | 'done'>('typing');

  const lineIdxRef = useRef(0);
  const charIdxRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const apiReadyRef = useRef(apiReady);
  const onDoneRef = useRef(onDone);

  useEffect(() => { apiReadyRef.current = apiReady; }, [apiReady]);
  useEffect(() => { onDoneRef.current = onDone; }, [onDone]);

  const finish = useCallback(() => {
    setPhase('done');
    setTimeout(() => onDoneRef.current(), 500);
  }, []);

  useEffect(() => {
    if (apiReady && phase === 'waiting') {
      finish();
    }
  }, [apiReady, phase, finish]);

  useEffect(() => {
    const CHAR_MS = 35;
    const LINE_PAUSE = 160;
    const EMPTY_PAUSE = 80;

    function tick() {
      const idx = lineIdxRef.current;

      if (idx >= lines.length) {
        setStamp(true);
        if (apiReadyRef.current) {
          finish();
        } else {
          setPhase('waiting');
        }
        return;
      }

      const line = lines[idx];

      if (line.empty) {
        setCompletedLines((prev) => [...prev, line]);
        lineIdxRef.current = idx + 1;
        charIdxRef.current = 0;
        timerRef.current = setTimeout(tick, EMPTY_PAUSE);
        return;
      }

      const target = line.value;
      const charIdx = charIdxRef.current;

      if (charIdx < target.length) {
        charIdxRef.current = charIdx + 1;
        setCurrentValue(target.slice(0, charIdx + 1));
        timerRef.current = setTimeout(tick, CHAR_MS);
      } else {
        setCompletedLines((prev) => [...prev, line]);
        setCurrentValue('');
        lineIdxRef.current = idx + 1;
        charIdxRef.current = 0;
        timerRef.current = setTimeout(tick, LINE_PAUSE);
      }
    }

    timerRef.current = setTimeout(tick, 400);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Current line being typed (derived from completedLines count)
  const currentLineSpec =
    completedLines.length < lines.length ? lines[completedLines.length] : null;

  const cursorColor =
    currentLineSpec ? VALUE_COLORS[currentLineSpec.valueColor] : VALUE_COLORS.green;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(6px)' }}
    >
      <div
        style={{
          width: 'min(600px, 90vw)',
          backgroundColor: '#080808',
          border: '1px solid #333',
          borderRadius: 8,
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {/* Diagonal COOKED stamp */}
        {stamp && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              pointerEvents: 'none',
              zIndex: 1,
            }}
          >
            <span
              style={{
                fontSize: 72,
                fontWeight: 900,
                color: '#E24B4A',
                opacity: 0.08,
                transform: 'rotate(-20deg)',
                letterSpacing: '0.1em',
                fontFamily: 'monospace',
                userSelect: 'none',
              }}
            >
              COOKED
            </span>
          </div>
        )}

        {/* Document header */}
        <div
          style={{
            backgroundColor: '#0f0f0f',
            borderBottom: '1px solid #222',
            padding: '16px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span
            style={{
              fontFamily: 'monospace',
              fontSize: 11,
              color: '#E24B4A',
              letterSpacing: '0.2em',
            }}
          >
            ● CLASSIFIED
          </span>
          <span style={{ fontFamily: 'monospace', fontSize: 13, color: '#666' }}>
            AUTOPSY REPORT
          </span>
          <span style={{ fontFamily: 'monospace', fontSize: 11, color: '#444' }}>
            CASE #{caseNum}
          </span>
        </div>

        {/* Document body */}
        <div
          style={{
            padding: '28px 32px',
            fontFamily: 'monospace',
            fontSize: 13,
            lineHeight: 2,
          }}
        >
          {completedLines.map((line, i) =>
            line.empty ? (
              <div key={i} style={{ height: '0.5em' }} />
            ) : (
              <div key={i}>
                {line.label && (
                  <span
                    style={{
                      color: '#555',
                      marginRight: 12,
                      minWidth: 200,
                      display: 'inline-block',
                    }}
                  >
                    {line.label}
                  </span>
                )}
                <span
                  style={{
                    color: VALUE_COLORS[line.valueColor],
                    fontWeight: line.bold ? 700 : 400,
                  }}
                >
                  {line.value}
                </span>
              </div>
            )
          )}

          {/* Currently typing line */}
          {phase === 'typing' && currentLineSpec && !currentLineSpec.empty && (
            <div>
              {currentLineSpec.label && (
                <span
                  style={{
                    color: '#555',
                    marginRight: 12,
                    minWidth: 200,
                    display: 'inline-block',
                  }}
                >
                  {currentLineSpec.label}
                </span>
              )}
              <span
                style={{
                  color: VALUE_COLORS[currentLineSpec.valueColor],
                  fontWeight: currentLineSpec.bold ? 700 : 400,
                }}
              >
                {currentValue}
              </span>
              <span
                style={{
                  display: 'inline-block',
                  width: 7,
                  height: 13,
                  backgroundColor: cursorColor,
                  marginLeft: 2,
                  verticalAlign: 'middle',
                  animation: 'blink 1s step-start infinite',
                }}
              />
            </div>
          )}

          {/* Waiting for API */}
          {phase === 'waiting' && (
            <div style={{ color: '#EF9F27' }}>
              // analyzing cause of death...
              <span
                style={{
                  display: 'inline-block',
                  width: 7,
                  height: 13,
                  backgroundColor: '#EF9F27',
                  marginLeft: 4,
                  verticalAlign: 'middle',
                  animation: 'blink 1s step-start infinite',
                }}
              />
            </div>
          )}

          {/* Confirmed — navigating */}
          {phase === 'done' && (
            <div style={{ color: '#639922' }}>
              // cause of death confirmed. loading roast...
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}
