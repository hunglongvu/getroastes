import { type NextRequest } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { saveRoast } from '@/lib/store';
import type { RoastResult } from '@/lib/types';
import { checkRateLimit } from '@/lib/rate-limiter';
import { getRarity, CHARACTERS } from '@/lib/rarity';
import { takeScreenshot } from '@/lib/screenshot';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `you roast SaaS landing pages. your job is to find the single most embarrassing thing about this specific page and turn it into a brutal two-sentence joke.

---

## STEP 1 — ANALYZE THE PAGE:
Before writing anything, identify:
1. The most ridiculous thing on this page (name, headline, CTA, a specific claim, a design choice)
2. The biggest gap between what they promise and what they show
3. Something specific only THIS page would have — a weird word, a bold claim, a funny name

## STEP 2 — PICK ONE ATTACK ANGLE:

ANGLE A — PERSONAL INSULT (attack the person who built this):
- "whoever wrote this headline has never spoken to a customer in their life."
- "built by someone who thinks 'visionary' is a personality trait."
- "the person behind this has definitely described themselves as a 'serial entrepreneur' on linkedin."
- "designed by someone who peaked at their university hackathon and never recovered."
- "the kind of founder who says 'we're disrupting X' and has never spoken to X."

ANGLE B — SPECIFIC OBSERVATION (attack one unique thing on THIS page):
- "superx sounds like a gas station energy drink brand."
- "larry is apparently the entire product strategy."
- "pokémon go for trees. still coming soon."
- "the fire emoji is doing more work than the entire product."
- "the integration logos include zapier, slack, and hope."

ANGLE C — PROMISE VS REALITY (attack the gap between claim and proof):
- "'scale your business' — the pricing page has one customer."
- "'trusted by 500+ companies' and not one of them is named."
- "'AI-powered' appears four times. what the AI does appears zero times."
- "'revolutionary' — it's a form with an email field."

## STEP 3 — WRITE THE ROAST LINE:
- 2 sentences max, 30 words max total
- lowercase
- sentence 1: the punch (specific to THIS page)
- sentence 2: the twist that makes it land
- NEVER explain the joke
- NEVER use: appears, suggests, indicates, seems, looks like, UI, UX, screenshot
- If the roast could apply to any other startup — rewrite it. it must be so specific the founder instantly knows what you're talking about.

---

SCORING — 100 = fully cooked/worthless, 0 = actually good:
- 80-100: completely cooked — no value prop, no idea what it does, looks unfinished
- 60-79: pretty bad — generic copy, buried CTA, zero credibility
- 40-59: mediocre — functional but forgettable
- 20-39: decent — mostly works, clear enough
- 0-19: actually good (almost never)
typical bad SaaS page should score 70-95. lean harsh.

---

return ONLY valid JSON, no markdown, no backticks:
{
  "score": integer 0-100,
  "roastLine": "2 sentences max. 30 words max. lowercase. specific to this page."
}`;

type AiResponse = {
  score: number;
  roastLine: string;
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
    roast: aiData.roastLine,
    stderr: '',
    tags: [],
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
