export type Rarity = 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY' | 'MYTHIC';

export interface CardCharacter {
  name: string;
  emoji: string;
  description: string;
}

export function getRarity(score: number): Rarity {
  const roll = Math.random() * 100;
  if (score <= 10) return 'MYTHIC';
  if (score <= 20 && roll < 60) return 'LEGENDARY';
  if (score <= 20) return 'EPIC';
  if (score <= 35 && roll < 50) return 'LEGENDARY';
  if (score <= 35) return 'EPIC';
  if (score <= 50 && roll < 40) return 'EPIC';
  if (score <= 50) return 'RARE';
  if (score <= 70) return roll < 20 ? 'RARE' : 'COMMON';
  return 'COMMON';
}

export const CHARACTERS: Record<Rarity, CardCharacter> = {
  MYTHIC: {
    name: '404 Cat',
    emoji: '🐱💀',
    description: 'So bad it achieved enlightenment through failure',
  },
  LEGENDARY: {
    name: 'Giga Cooked Cat',
    emoji: '😿🔥',
    description: 'Burned beyond recognition. Even the dev tools are crying.',
  },
  EPIC: {
    name: 'Burnout Founder Cat',
    emoji: '😾💸',
    description: 'Has seen too many failed A/B tests. Knows your pain.',
  },
  RARE: {
    name: 'Senior Dev Cat',
    emoji: '🐈‍⬛👀',
    description: 'Dark circles. Infinite scrolls. Zero conversions.',
  },
  COMMON: {
    name: 'Confused Intern Cat',
    emoji: '🐱❓',
    description: 'First day. Already questioning your value prop.',
  },
};

export const RARITY_STYLES: Record<
  Rarity,
  { border: string; glow: string; badge: string; bg: string }
> = {
  MYTHIC: {
    border: '#d946ef',
    glow: '0 0 30px rgba(217,70,239,0.4)',
    badge: 'text-fuchsia-400',
    bg: 'rgba(217,70,239,0.04)',
  },
  LEGENDARY: {
    border: '#FFB800',
    glow: '0 0 30px rgba(255,184,0,0.2)',
    badge: 'text-yellow-400',
    bg: 'rgba(255,184,0,0.04)',
  },
  EPIC: {
    border: '#8b5cf6',
    glow: '0 0 30px rgba(139,92,246,0.4)',
    badge: 'text-violet-400',
    bg: 'rgba(139,92,246,0.04)',
  },
  RARE: {
    border: '#3b82f6',
    glow: '0 0 30px rgba(59,130,246,0.4)',
    badge: 'text-blue-400',
    bg: 'rgba(59,130,246,0.04)',
  },
  COMMON: {
    border: '#3f3f46',
    glow: 'none',
    badge: 'text-zinc-500',
    bg: 'transparent',
  },
};
