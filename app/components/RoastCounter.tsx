'use client';
import { useEffect, useState } from 'react';

export function RoastCounter() {
  const [count, setCount] = useState<number | null>(null);

  async function fetchCount() {
    try {
      const res = await fetch('/api/roast-count');
      const data = await res.json();
      setCount(data.count);
    } catch {}
  }

  useEffect(() => {
    fetchCount();
    const interval = setInterval(fetchCount, 30000);
    return () => clearInterval(interval);
  }, []);

  if (count === null) return null;

  return (
    <div className="flex items-center justify-center gap-2 mt-6 mb-2">
      <span style={{ fontSize: 22, fontWeight: 600, fontFamily: 'monospace', color: 'rgba(255,255,255,0.5)' }}>
        <span style={{ color: '#ff8c00', fontWeight: 700, fontSize: 26 }}>
          {count.toLocaleString()}
        </span>
        {' '}landing pages roasted
      </span>
    </div>
  );
}
