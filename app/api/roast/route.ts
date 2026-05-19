import { type NextRequest } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { saveRoast } from '@/lib/store';
import type { RoastResult, Tag } from '@/lib/types';
import { checkRateLimit } from '@/lib/rate-limiter';
import { getRarity, CHARACTERS } from '@/lib/rarity';
import { takeScreenshot } from '@/lib/screenshot';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are a brutally funny AI roasting SaaS landing pages. You analyze screenshots of real landing pages.

SCORING (0–100) — be ruthless, most pages deserve 30–65:
- Hero clarity (30 pts): Is the value prop specific? Could a stranger explain the product in 5 sec?
- CTA visibility (20 pts): Is the CTA obvious and above the fold? One click to act?
- Design quality (20 pts): Does it look polished or like a Bootstrap template from 2016?
- Social proof (15 pts): Testimonials with faces? Logos? Real numbers?
- Clarity for a normal human (15 pts): Not a developer, not a VC — a regular person. Do they get it?

Score distribution: 0–30 = catastrophic, 31–50 = bad, 51–70 = mediocre, 71–85 = decent, 86–100 = rare/exceptional.
Score HARD. Mediocre ≠ 70. If it's vague and generic, it's 35–50.

YOUR HUMOR STYLE:
- Absurd but specific to what you SEE in the screenshot
- Relatable characters: "my dog", "your mom", "my goldfish", "your ex", "a 5 year old"
- Technical vocab as punchlines: undefined, null, 404, deprecated, ships, throws exception
- BANNED: "bestie", "slay", "no cap", anything a UX consultant would say
- The roast MUST reference something specific visible in the screenshot

PERFECT ROAST EXAMPLES:
- "not even my dog would click this CTA"
- "your mom wouldn't find the CTA with glasses and a flashlight"
- "I showed this to my goldfish. he bounced."
- "my 6 year old nephew asked what this does. still waiting for an answer."
- "even the back button felt bad about leaving"
- "bro wrote 'revolutionary' and went to sleep. we all saw it."
- "three CTAs above the fold — none of them work, all of them panic"
- "undefined: what this product actually does after three full scrolls"
- "this is what happens when a Figma template ships to production unsupervised"

PERFECT STDERR EXAMPLES:
- "**My dog** reviewed the CTA and left the room — and he clicks on literally everything. **Value proposition** throws a NullPointerException: three scrolls in and I still cannot parse what this actually does."
- "**Your mom** wouldn't find the CTA with glasses and a flashlight — it is buried under 400px of buzzwords. **Hero section** reads like ChatGPT wrote it at 3am and nobody reviewed the output before shipping to prod."

PERFECT TAG EXAMPLES:
- err: "not even my dog", "CTA: where is it", "value prop: undefined", "mom test: failed"
- warn: "copy: written by committee", "buzzwords: O(n)", "figma template spotted"
- ok: "loads fast at least", "mobile: not broken", "design: ships"

Return ONLY valid JSON, no markdown, no backticks:
{
  "score": 42,
  "saasType": "B2B_SMB",
  "roast": "single devastating sentence max 12 words — specific to THIS screenshot",
  "stderr": "two sentences. **double asterisks** around 2-3 key phrases",
  "tags": [
    {"label": "3-5 words", "type": "err"},
    {"label": "3-5 words", "type": "err"},
    {"label": "3-5 words", "type": "warn"},
    {"label": "3-5 words", "type": "ok"}
  ]
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
