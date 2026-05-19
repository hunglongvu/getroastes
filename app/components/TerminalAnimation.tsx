'use client';

import { useEffect, useRef, useState, useCallback, useMemo } from 'react';

interface Line {
  text: string;
  color: 'green' | 'red' | 'amber' | 'dim';
}

function pick<T>(arr: T[], n: number): T[] {
  return [...arr].sort(() => Math.random() - 0.5).slice(0, n);
}

function buildLines(domain: string): Line[] {
  const greenPool = [
    '$ asking my dog to review the CTA... he left the room',
    '$ showing this to a 5 year old... still waiting for an answer',
    '$ consulting a fortune cookie for the value prop...',
    '$ asking ChatGPT to explain the hero section... it also gave up',
    "$ checking if your mom would understand this... she doesn't",
    '$ showing this to my goldfish... he bounced',
    '$ asking a random person on the street... they walked faster',
    '$ checking if anyone has scrolled past the fold... logs say no',
    '$ asking your ex if the value prop makes sense... no response',
    '$ consulting the magic 8-ball for conversion rate...',
    '$ running npm install common-sense...',
    '$ checking if the pricing page makes sense... calculator crashed',
    '$ asking your therapist about this landing page... new session booked',
    "$ showing this to your investor... he's on another call now",
    '$ checking if a goldfish has longer attention span than this hero section...',
    '$ asking the janitor if the copy makes sense... he quit',
    '$ running git blame on the value prop...',
    '$ checking if this was written by a human... jury still out',
    '$ measuring distance between CTA and human comprehension...',
  ];

  const redPool = [
    '> ERROR: not even my dog would click this CTA',
    "> ERROR: your mom wouldn't find the CTA with glasses and a flashlight",
    '> ERROR: value prop: undefined. literally.',
    '> ERROR: even the 404 page is more memorable than this',
    "> ERROR: bro wrote 'revolutionary' and went to sleep",
    "> ERROR: 'game-changing' detected. throwing exception.",
    '> ERROR: scroll depth: 0.2. everyone left at the hero.',
    '> ERROR: my goldfish has a longer attention span than this page',
    '> ERROR: even the back button felt bad about leaving',
    '> ERROR: CTA button leads to a waitlist. you played yourself.',
    '> ERROR: I asked 3 people what this does. 3 different answers.',
    '> ERROR: your ex understood the value prop. that\'s the only person.',
    '> ERROR: social proof: null. three testimonials with no faces.',
    '> ERROR: hero image is stock photo of people laughing at laptops. classic.',
    "> ERROR: 'streamline' is deprecated since 2019. still here tho.",
  ];

  const amberPool = [
    '> WARNING: copy was definitely written by committee at 5pm on Friday',
    '> WARNING: even ChatGPT would be embarrassed by this copy',
    '> WARNING: O(n) buzzwords detected. performance critical.',
    '> WARNING: Figma template shipped to production unsupervised',
    "> WARNING: 'seamless' detected 4 times. nothing is seamless.",
    '> WARNING: pricing tiers named Basic/Pro/Enterprise. groundbreaking.',
    "> WARNING: the CTA says 'Get Started'. started what exactly?",
    '> WARNING: your designer friend already closed this tab',
    '> WARNING: last 3 churned customers cited this page as reason',
    '> WARNING: even the janitor had notes on the copy',
  ];

  const domain_line: Line = { text: `$ fetching target: ${domain}...`, color: 'green' };

  const midLines: Line[] = [
    ...pick(greenPool, 4).map((t) => ({ text: t, color: 'green' as const })),
    ...pick(redPool, 3).map((t) => ({ text: t, color: 'red' as const })),
    ...pick(amberPool, 2).map((t) => ({ text: t, color: 'amber' as const })),
  ].sort(() => Math.random() - 0.5);

  const finalLines: Line[] = [
    { text: '$ compiling roast...', color: 'green' },
    { text: '$ deploying brutality --no-mercy --no-chill...', color: 'green' },
    { text: '> roast ready. this is going to hurt. a lot.', color: 'red' },
  ];

  return [domain_line, ...midLines, ...finalLines];
}

const C = {
  green: '#639922',
  red: '#E24B4A',
  amber: '#EF9F27',
  dim: '#71717a',
} as const;

interface Props {
  domain: string;
  apiReady: boolean;
  onDone: () => void;
}

export function TerminalAnimation({ domain, apiReady, onDone }: Props) {
  const lines = useMemo(() => buildLines(domain), [domain]);

  const [completedLines, setCompletedLines] = useState<Line[]>([]);
  const [currentText, setCurrentText] = useState('');
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
    onDoneRef.current();
  }, []);

  useEffect(() => {
    if (apiReady && phase === 'waiting') {
      finish();
    }
  }, [apiReady, phase, finish]);

  useEffect(() => {
    const CHAR_MS = 40;
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

      if (charIdx < line.text.length) {
        charIdxRef.current = charIdx + 1;
        setCurrentText(line.text.slice(0, charIdx + 1));
        timerRef.current = setTimeout(tick, CHAR_MS);
      } else {
        setCompletedLines((prev) => [...prev, line]);
        setCurrentText('');
        lineIdxRef.current = idx + 1;
        charIdxRef.current = 0;
        timerRef.current = setTimeout(tick, LINE_MS);
      }
    }

    timerRef.current = setTimeout(tick, 150);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const activeColor =
    lineIdxRef.current < lines.length
      ? C[lines[lineIdxRef.current].color]
      : C.green;

  return (
    <div className="fixed inset-0 z-50 bg-black overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.08) 2px, rgba(0,0,0,0.08) 4px)',
        }}
      />

      <div className="relative w-full max-w-2xl mx-auto px-8 pt-20 font-mono text-sm leading-7">
        {completedLines.map((line, i) => (
          <div key={i} style={{ color: C[line.color] }}>
            {line.text || ' '}
          </div>
        ))}

        {phase === 'typing' && (
          <div style={{ color: activeColor }}>
            {currentText}
            <span
              className="inline-block w-2 h-4 ml-0.5 align-middle"
              style={{
                backgroundColor: activeColor,
                animation: 'blink 1s step-start infinite',
              }}
            />
          </div>
        )}

        {phase === 'waiting' && (
          <div style={{ color: C.amber }}>
            {'$ waiting for AI to stop laughing...'}
            <span
              className="inline-block w-2 h-4 ml-0.5 align-middle"
              style={{
                backgroundColor: C.amber,
                animation: 'blink 1s step-start infinite',
              }}
            />
          </div>
        )}
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
