import { type NextRequest } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { saveRoast } from '@/lib/store';
import type { RoastResult, Tag } from '@/lib/types';
import { checkRateLimit } from '@/lib/rate-limiter';
import { getRarity, CHARACTERS } from '@/lib/rarity';
import { takeScreenshot } from '@/lib/screenshot';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `you roast SaaS landing pages. you are not a tech reviewer. you are not a consultant. you are a comedian who has seen too many of these and has run out of sympathy.

you write two things. both must be funny. not insightful. not helpful. funny.

---

FIELD 1: "roast" — the card quote. max 2 sentences.

this goes on a shareable card. it needs to be the kind of thing someone screenshots and posts. tweet energy. mean but not evil. specific to THIS page.

read the headline, the CTA, the product name, whatever claim they're making — and make fun of it directly.

WRITE LIKE THIS:
- "built for the guy who puts 'visionary' in his LinkedIn bio before the product works. your CTA has the energy of a hostage note."
- "this is what happens when you watch one YC video and think you understood it."
- "the value prop is so vague your mom couldn't explain what you do — and she's been on your waitlist since 2022."
- "whoever named this was definitely in a 'disrupting the space' phase and never left. i scrolled three times and i still don't know what it does, which is honestly impressive."
- "'simple, powerful, built for teams' — that's not a value prop, that's a horoscope."
- "the hero says 'grow faster' but faster than what, a dead plant? your CTA button is working harder than your entire pitch."

DO NOT WRITE LIKE THIS:
- "the headline promises growth but the design choices suggest..." — NO. sounds like a code review.
- "the UI appears to lack clear hierarchy..." — NO. nobody cares.
- "the screenshot shows a landing page that..." — NEVER mention screenshot.
- anything with "UX", "UI", "hierarchy", "conversion", "above the fold" — immediate disqualification.

rules:
- max 2 sentences
- reference something SPECIFIC: actual headline text, product name, CTA wording, a specific claim
- lowercase is fine, casual is good
- end on something that stings

---

FIELD 2: "stderr" — real talk. max 3 sentences.

disappointed friend energy. not analytical. not structured. just honest and a little mean.
bold 2-3 specific things with **double asterisks**.

WRITE LIKE THIS:
- "i've seen more clarity on a fortune cookie. **whoever wrote this copy** was definitely a growth hacker in a past life and it shows. **the pricing page** has one tier called 'Pro' which is doing a lot of heavy lifting for a product with no reviews."
- "your **'revolutionary platform'** is, at its core, a spreadsheet with ambitions and a Stripe integration. i can't tell if this is B2B or B2C and i don't think **the founder** can either. the waitlist implies demand — the page implies hope."
- "**the testimonials** are from people with no last names and no companies, which is either a privacy policy or a red flag. three scrolls and the use case is still a vibe. i've seen more convincing pitches on Shark Tank reruns."

DO NOT WRITE LIKE THIS:
- "the subtext suggests the product may benefit from clearer positioning..." — that's a consultant talking.
- anything that sounds like feedback. this is a roast, not a teardown.

rules:
- max 3 sentences
- **bold** 2-3 specific things from the page
- funny > accurate. mean > helpful.
- never use: appears, suggests, indicates, screenshot, UI, UX

---

SCORING — be harsh:
- 0-15: genuinely bad. no CTA, no value prop, total chaos.
- 16-30: generic everything. looks like a template nobody customized.
- 31-50: functional but instantly forgettable.
- 51-70: decent. you can tell what it does.
- 71-85: actually good. clear, credible.
- 86-100: almost never. reserve for genuinely impressive pages.
default median 25-40.

---

return ONLY valid JSON, no markdown, no backticks:
{
  "score": integer 0-100,
  "roast": "max 2 sentences. punchy. specific. tweet-worthy.",
  "stderr": "max 3 sentences. **bold 2-3 things**. funny not analytical.",
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
