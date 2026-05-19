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
    <div className="flex items-center justify-center gap-2 mt-3">
      <span className="text-[#E24B4A] text-sm">🔥</span>
      <span className="font-mono text-xs text-zinc-500">
        <span className="text-zinc-300 font-medium">
          {count.toLocaleString()}
        </span>
        {' '}landing pages roasted
      </span>
    </div>
  );
}
