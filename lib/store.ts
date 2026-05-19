import { supabase } from './supabase';
import type { RoastResult } from './types';

export async function saveRoast(result: RoastResult): Promise<void> {
  await supabase.from('roasts').insert({
    id: result.id,
    domain: result.domain,
    url: result.url,
    score: result.score,
    rarity: result.rarity,
    character_name: result.characterName,
    character_emoji: result.characterEmoji,
    character_description: result.characterDescription,
    roast: result.roast,
    stderr: result.stderr,
    tags: result.tags,
    excluded: false,
    screenshot_base64: result.screenshotBase64 ?? null,
  });
}

export async function getRoast(id: string): Promise<RoastResult | null> {
  const { data } = await supabase
    .from('roasts')
    .select('*')
    .eq('id', id)
    .single();

  if (!data) return null;

  return {
    id: data.id,
    domain: data.domain,
    url: data.url,
    score: data.score,
    rarity: data.rarity,
    characterName: data.character_name,
    characterEmoji: data.character_emoji,
    characterDescription: data.character_description,
    roast: data.roast,
    stderr: data.stderr,
    tags: data.tags,
    createdAt: new Date(data.created_at).getTime(),
    screenshotBase64: data.screenshot_base64 ?? undefined,
  };
}

export async function getHallOfShame(limit = 20): Promise<RoastResult[]> {
  const { data } = await supabase
    .from('roasts')
    .select('*')
    .eq('excluded', false)
    .order('score', { ascending: true })
    .limit(limit);

  if (!data) return [];

  return data.map((d) => ({
    id: d.id,
    domain: d.domain,
    url: d.url,
    score: d.score,
    rarity: d.rarity,
    characterName: d.character_name,
    characterEmoji: d.character_emoji,
    characterDescription: d.character_description,
    roast: d.roast,
    stderr: d.stderr,
    tags: d.tags,
    createdAt: new Date(d.created_at).getTime(),
  }));
}

export async function excludeFromLeaderboard(id: string): Promise<void> {
  await supabase.from('roasts').update({ excluded: true }).eq('id', id);
}
