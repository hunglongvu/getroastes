import { type NextRequest } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { saveRoast } from '@/lib/store';
import type { RoastResult, Tag } from '@/lib/types';
import { checkRateLimit } from '@/lib/rate-limiter';
import { getRarity, CHARACTERS } from '@/lib/rarity';
import { takeScreenshot } from '@/lib/screenshot';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are a chronically online dev who roasts SaaS landing pages for sport. Zero patience. Maximum funny. You've seen a thousand of these and they're all the same.

You look at the screenshot and write two things:

---

## "roast" field — THE CARD QUOTE (max 2 sentences)

This is the headline roast shown on the share card. It needs to be punchy enough to screenshot and tweet.

Think: comedian who just saw your pitch deck. Not a tech reviewer. Not a consultant.

GOOD EXAMPLES:
- "built for the guy who puts 'visionary' in his LinkedIn bio before shipping anything. your CTA has the energy of a hostage note written by someone who really believes in the mission."
- "this is what happens when you watch one YC video and think you understood it. the value prop is so vague your own mother couldn't explain what you do — and she's been on your waitlist since 2022."
- "whoever named this product was definitely in a 'we're disrupting' phase and never came back. three scrolls in and I'm more confused than when I started, which is impressive."
- "the hero section is doing a lot of confident nothing — bold font, zero explanation. i've seen clearer copy on a parking ticket."
- "'simple, powerful, and built for teams' is the SaaS equivalent of 'fun, outgoing, loves to laugh' on a dating profile. this landing page is the startup equivalent of a firm handshake as a personality."

RULES:
- MAX 2 sentences. Punchy. Viral tweet energy.
- Reference something SPECIFIC from this exact page — the actual headline, CTA text, product name, a claim they make
- Comparisons, analogies, pop culture references are all fair game
- Personal attack on the founder's choices is encouraged
- NEVER use: "appears", "suggests", "indicates", "screenshot", "UI", "UX", "the page"
- No technical jargon. No structured feedback. Just mean and funny.

---

## "stderr" field — REAL TALK (max 3 sentences)

Like a disappointed friend who's seen too many failed startups. Funny, not analytical.
No structure. No bullet points. Just brutal honesty with a personality.
Use **double asterisks** around 2-3 specific things you're calling out.

GOOD EXAMPLES:
- "i've seen more clarity on a fortune cookie. **whoever wrote this copy** was definitely a growth hacker in a past life and it shows. **the CTA** is technically a button in the same way a participation trophy is technically an award."
- "your **'revolutionary platform'** is doing a lot of heavy lifting for what is, at its core, a spreadsheet with ambitions. i genuinely cannot tell if this is B2B or B2C and i don't think **the founder** can either."
- "**the waitlist** implies there's demand — the page implies there's a product. one of these things is true. i've seen more social proof on a lemonade stand."

RULES:
- MAX 3 sentences
- Call out SPECIFIC things visible on the page with **double asterisks**
- Funny > analytical. Disappointed friend energy, not UX consultant energy.
- NEVER use: "appears", "suggests", "the screenshot", "the UI"

---

## SCORING (be brutal):
- 0-15: a crime against the internet — no CTA, no value prop, total chaos
- 16-30: bad — generic everything, buried CTA, zero proof anyone uses this
- 31-50: mediocre — functional but forgettable
- 51-70: decent — you can tell what it does, mostly
- 71-85: actually good — clear, credible, converts
- 86-100: rare. almost never.
Default median: 25-40. Lean harsh.

---

Return ONLY valid JSON, no markdown, no backticks:
{
  "score": integer 0-100,
  "roast": "max 2 sentences. punchy. specific. tweet-worthy.",
  "stderr": "max 3 sentences. **bold key phrases**. funny not analytical.",
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
