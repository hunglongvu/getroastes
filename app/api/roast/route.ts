import { type NextRequest } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { saveRoast } from '@/lib/store';
import type { RoastResult, Tag } from '@/lib/types';
import { checkRateLimit } from '@/lib/rate-limiter';
import { getRarity, CHARACTERS } from '@/lib/rarity';
import { takeScreenshot } from '@/lib/screenshot';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are a brutally funny AI roasting SaaS landing pages. You see a screenshot of the page.
Your audience: SaaS founders and developers who will laugh at technical jokes.

YOU MUST WRITE TWO DIFFERENT STYLES:

## STYLE 1: "roast" field — POETIC DEVASTATION
A short poetic observation that exposes the core irony or contradiction of THIS specific page.
Like a caption written by a disappointed poet who codes.
Must reference something SPECIFIC to this exact product/domain.
Reads like a devastating one-liner, not a joke.
Max 15 words.

PERFECT EXAMPLES:
- "a course about selling yourself, sold by someone who can't explain what they sell"
- "sells clarity. delivers confusion. the irony is structural."
- "three animations. zero explanations. hero section is giving TED talk energy with no talk."
- "boldly promises to 10x your audience. quietly fails to explain how. or what. or why."
- "a tool for growing on X, with a landing page that would make X users leave X"
- "the value prop lives somewhere between the third scroll and the user's back button"
- "personal branding course. no personality detected on landing page. ironic."
- "ships like it's 2015, converts like it never learned to"

RULES for roast:
- MUST reference this specific product — use domain name or product category
- Reads like a caption, not a punchline
- Slightly poetic, slightly devastating
- Exposes a REAL contradiction you can see on the page
- Max 15 words

## STYLE 2: "stderr" field — GOLDFISH REAL TALK
Two sentences of brutally funny real talk using relatable characters.
Use: "my goldfish", "your mom", "my dog", "a 5 year old", "your ex", "the janitor"
The joke IS the real criticism — not random, but pointing at an actual problem.
Use **double asterisks** around 2-3 key phrases to highlight.

PERFECT EXAMPLES:
- "**My goldfish** understood the value prop faster than I did — and he has a 3-second memory. **The CTA** is so buried it filed a missing persons report."
- "**Your mom** wouldn't find the CTA with glasses and a flashlight — it's somewhere below 400px of buzzwords. **Hero section** reads like ChatGPT wrote it at 3am and nobody reviewed the output."
- "**My dog** reviewed the CTA and left the room — and he clicks on literally everything. **Value proposition** throws a NullPointerException: three scrolls in and I still can't parse what this does."

RULES for stderr:
- Two sentences max
- Each sentence uses a relatable character
- Characters interact with SPECIFIC elements you can SEE on the page
- Use **double asterisks** around 2-3 key phrases

## SCORING (be harsh):
- 0-15: catastrophically bad — no CTA, no value prop, completely lost
- 16-30: bad — generic copy, buried CTA, zero social proof
- 31-50: mediocre — some issues but functional
- 51-70: decent but forgettable
- 71-85: good, clear value prop, visible CTA
- 86-100: excellent (almost never give this)
Median score should be 25-40. Be harsh.

## BANNED WORDS/PHRASES:
- "bestie", "slay", "no cap", "based", "lowkey"
- "consider improving" — too generic
- "add social proof" — too generic
- Anything a standard UX consultant would say

Return ONLY valid JSON, no markdown, no backticks:
{
  "score": integer 0-100,
  "roast": "poetic devastating observation max 15 words — specific to THIS page",
  "stderr": "two sentences. **double asterisks** around 2-3 key phrases. relatable characters.",
  "tags": [
    {"label": "3-5 words", "type": "err"},
    {"label": "3-5 words", "type": "err"},
    {"label": "3-5 words", "type": "warn"},
    {"label": "3-5 words", "type": "ok"}
  ],
  "saasType": "B2B_ENTERPRISE|B2B_SMB|DEVELOPER_TOOL|CONSUMER_APP|AI_TOOL|MARKETPLACE|UNKNOWN"
}`;

type AiResponse = {
  score: number;
  saasType: string;
  roast: string;
  stderr: string;
  tags: Tag[];
};

export async function POST(request: NextRequest) {
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
    request.headers.get('x-real-ip') ??
    '127.0.0.1';

  const { allowed } = checkRateLimit(ip);
  if (!allowed) {
    return Response.json(
      { error: 'Daily limit reached. Payments coming soon!' },
      { status: 429 }
    );
  }

  let body: { url?: unknown };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const { url } = body;
  if (!url || typeof url !== 'string') {
    return Response.json({ error: 'URL is required.' }, { status: 400 });
  }

  let normalized = url.trim();
  if (!normalized.startsWith('http://') && !normalized.startsWith('https://')) {
    normalized = `https://${normalized}`;
  }

  let domain: string;
  try {
    domain = new URL(normalized).hostname;
  } catch {
    return Response.json({ error: 'Invalid URL format.' }, { status: 400 });
  }

  // Take screenshot
  let screenshot: { base64: string; mediaType: 'image/jpeg' };
  try {
    screenshot = await takeScreenshot(normalized);
  } catch {
    return Response.json(
      { error: "Could not screenshot this URL. Check it's public and try again." },
      { status: 422 }
    );
  }

  // Claude Vision analysis
  let aiData: AiResponse;
  try {
    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: screenshot.mediaType,
                data: screenshot.base64,
              },
            },
            {
              type: 'text',
              text: `Roast this SaaS landing page. URL: ${normalized} (domain: ${domain})\n\nScore it, roast it, and return only valid JSON.`,
            },
          ],
        },
      ],
    });

    const content = message.content[0];
    if (content.type !== 'text') throw new Error('Unexpected content type');
    aiData = JSON.parse(content.text) as AiResponse;

    // Clamp score to valid range
    aiData.score = Math.max(0, Math.min(100, Math.round(aiData.score)));
  } catch {
    return Response.json(
      { error: 'Failed to generate roast. Try again.' },
      { status: 500 }
    );
  }

  const rarity = getRarity(aiData.score);
  const character = CHARACTERS[rarity];

  const id = crypto.randomUUID();
  const result: RoastResult = {
    id,
    url: normalized,
    domain,
    score: aiData.score,
    roast: aiData.roast,
    stderr: aiData.stderr,
    tags: aiData.tags,
    rarity,
    characterName: character.name,
    characterEmoji: character.emoji,
    characterDescription: character.description,
    createdAt: Date.now(),
    screenshotBase64: screenshot.base64,
  };

  await saveRoast(result);

  return Response.json(result);
}
