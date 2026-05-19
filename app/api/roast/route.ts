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

## STYLE 1: "roast" field — BRUTAL MULTI-SENTENCE ROAST
2-4 sentences of specific, devastating commentary on THIS exact page.
Written by a senior dev who is chronically online — dry, technical, insider humor.
Reference specific things visible on the page: the headline, CTA text, value prop, design choices, screenshots shown.
Makes a SaaS founder laugh and cry at the same time.

PERFECT EXAMPLES:
- "your hero section says 'grow faster' but forgot to mention grow to what — the waitlist has more personality than the product, and the CTA button is doing more work than your entire value prop."
- "the value prop is so vague it could be a crypto project from 2021, the screenshots look like they were taken on a Nokia, and whoever wrote 'revolutionary' in the headline has never seen a competitor."
- "three scrolls deep and I still don't know what this does — the FAQ answers questions nobody asked, the pricing page has one tier called 'Pro' which is doing a lot of heavy lifting for something with zero social proof."
- "the hero headline is a masterclass in saying nothing confidently, there's a testimonial from someone named 'Sarah, Founder' with no company attached, and the demo video is just a screen recording with no audio."
- "built for 'teams of all sizes' which means it's been optimized for no one in particular — the CTA says 'Get Started' which I assume means started on finding a better landing page."

RULES for roast:
- MINIMUM 2 sentences, MAXIMUM 4 sentences.
- MUST reference something SPECIFIC visible on this exact page — actual headline text, CTA wording, design patterns, what they're selling
- Dry, technical, chronically online humor — not slapstick
- Every sentence should add a new specific observation
- End with something that stings

## STYLE 2: "stderr" field — GOLDFISH REAL TALK
4-6 sentences of brutally funny real talk using relatable characters.
Use: "my goldfish", "your mom", "my dog", "a 5 year old", "your ex", "the janitor", "my cat"
The joke IS the real criticism — not random, but pointing at actual problems visible on the page.
Use **double asterisks** around 2-3 key phrases to highlight.

PERFECT EXAMPLES:
- "**My goldfish** understood the value prop faster than I did — and he has a 3-second memory. **The CTA** is so buried it filed a missing persons report. **Your mom** wouldn't find the pricing without a flashlight and three clicks. The hero section reads like ChatGPT wrote it at 3am and nobody checked the output."
- "**Your ex** could explain this product better than the homepage can — and they never used it. **The CTA button** has 'Get Started' energy when the real question is 'started on what exactly.' **My dog** reviewed the testimonials and left the room — and he clicks on literally everything. Four scrolls in and the use case is still a mystery."

RULES for stderr:
- MINIMUM 4 sentences, MAXIMUM 6 sentences
- Characters interact with SPECIFIC elements you can SEE on the page
- Use **double asterisks** around 2-3 key phrases
- Each sentence punches at a different specific flaw

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
  "roast": "2-4 sentences. specific to THIS page. dry humor. ends with a sting.",
  "stderr": "4-6 sentences. **double asterisks** around 2-3 key phrases. relatable characters. specific flaws.",
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
