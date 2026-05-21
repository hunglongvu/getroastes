import type { Rarity } from './rarity';

export type TagType = 'err' | 'warn' | 'ok';

export interface Tag {
  label: string;
  type: TagType;
}

export interface RoastResult {
  id: string;
  url: string;
  domain: string;
  score: number;
  roast: string;
  stderr: string;
  tags: Tag[];
  rarity: Rarity;
  characterName: string;
  characterEmoji: string;
  characterDescription: string;
  createdAt: number;
  screenshotBase64?: string;
  screenshotFailed?: boolean;
}
