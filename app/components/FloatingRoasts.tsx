'use client';
import { useEffect, useState } from 'react';

const ROASTS = [
  '"my goldfish understood this better"',
  '"value prop: undefined"',
  '"not even my dog would click this CTA"',
  '"ships like 2015, converts like never"',
  '"your mom wouldn\'t find the CTA with glasses"',
  '"social proof: null"',
  '"bro deployed to prod without testing"',
  '"exit code: COOKED"',
  '"CTA buried under 400px of buzzwords"',
  '"even the 404 page converts better"',
  '"I asked my goldfish. still waiting."',
  '"undefined: what this product does"',
  '"copy written by committee at 5pm friday"',
  '"my ex understood this. that\'s one person."',
  '"hero animation loads. value prop doesn\'t."',
  '"three CTAs. none of them agree."',
  '"seamless. nothing about this is seamless."',
  '"revolutionary. it is not."',
  '"get started → waitlist. you played yourself."',
  '"STATUS: SHIPS BUT BARELY"',
  '"SEGFAULT: NO_VALUE_PROP"',
  '"merge conflict between design and copy"',
  '"O(n) buzzwords detected"',
  '"this reads like ChatGPT wrote it"',
  '"even the janitor had notes on this copy"',
];

interface FloatingItem {
  id: number;
  text: string;
  x: number;
  y: number;
  duration: number;
  delay: number;
  size: number;
  opacity: number;
  rotate: number;
}

export function FloatingRoasts() {
  const [items, setItems] = useState<FloatingItem[]>([]);

  useEffect(() => {
    const generated = Array.from({ length: 15 }, (_, i) => ({
      id: i,
      text: ROASTS[Math.floor(Math.random() * ROASTS.length)],
      x: Math.random() * 100,
      y: Math.random() * 100,
      duration: 20 + Math.random() * 30,
      delay: Math.random() * 20,
      size: 10 + Math.random() * 4,
      opacity: 0.03 + Math.random() * 0.07,
      rotate: -15 + Math.random() * 30,
    }));
    setItems(generated);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {items.map((item) => (
        <div
          key={item.id}
          className="absolute font-mono whitespace-nowrap"
          style={{
            left: `${item.x}%`,
            top: `${item.y}%`,
            fontSize: `${item.size}px`,
            opacity: item.opacity,
            color: '#E24B4A',
            animation: `float-${item.id % 3} ${item.duration}s ${item.delay}s infinite linear`,
            transform: `rotate(${item.rotate}deg)`,
          }}
        >
          {item.text}
        </div>
      ))}
    </div>
  );
}
