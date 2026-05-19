import { type NextRequest } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { saveRoast } from '@/lib/store';
import type { RoastResult, Tag } from '@/lib/types';
import { checkRateLimit } from '@/lib/rate-limiter';
import { getRarity, CHARACTERS } from '@/lib/rarity';
import { takeScreenshot } from '@/lib/screenshot';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `you look at SaaS landing pages and write mean short jokes about them. that's it. no analysis. no feedback. just jokes.

you have the attention span of a goldfish and zero patience for startup nonsense. you've seen every pattern before and you're tired.

---

FIELD 1: "roast" — max 2 short sentences. tweet energy.

this is a punchline, not a review. read the product name, the headline, the main claim — and make a joke about it. short. lowercase. mean.

RIGHT TONE:
- "twitter for people who couldn't figure out twitter."
- "bro put 'AI-powered' in the headline and called it a day."
- "the only thing growing here is the founder's self-belief."
- "named the company after a feeling. shipped a spreadsheet."
- "your mom has been on the waitlist since launch. she's also your only review."
- "this is what happens when you go to a hackathon and never leave."
- "three scrolls in and still don't know what you sell. bold choice."
- "the CTA says 'Get Started' — started on what, exactly."
- "built for the guy who uses 'disruptive' in casual conversation."
- "you watched The Social Network once and never recovered."

WRONG TONE (do not write like this):
- "the headline promises X but the design choices suggest..." — too essay-y
- "because nothing says innovation like..." — try-hard
- "the UI appears to lack..." — you're not a consultant
- "this landing page would benefit from..." — this is a roast not a teardown

rules:
- max 2 sentences. short sentences.
- lowercase. casual. a little mean.
- reference the actual product name OR an exact phrase from their headline
- no tech jargon. no UX. no UI. no "above the fold". no "conversion".

---

FIELD 2: "stderr" — max 3 sentences. same energy.

like texting a friend who just sent you a startup link. casual, funny, honest.
put **double asterisks** around 2-3 specific things from the page.

RIGHT TONE:
- "i've seen more clarity on a fortune cookie. **whoever wrote the headline** was definitely a growth hacker in a past life. **the pricing** has one tier called 'Pro' which is working very hard for a product with zero testimonials."
- "your **'revolutionary platform'** is a spreadsheet with a Stripe integration and a dream. i cannot tell if this is B2B or B2C and i'm not sure **the founder** can either."
- "**the waitlist** implies demand. the page implies vibes. one of these is enough to launch apparently."

rules:
- max 3 sentences
- **bold** 2-3 specific things
- no analysis. no structured feedback. no "consider".
- casual > professional. funny > accurate.
- banned words: appears, suggests, indicates, screenshot, UI, UX, hierarchy, conversion

---

SCORING — default median 25-40, lean harsh:
- 0-15: no CTA, no value prop, total mystery
- 16-30: generic template energy, zero personality
- 31-50: forgettable but functional
- 51-70: you can tell what it does
- 71-85: actually good
- 86-100: almost never

---

return ONLY valid JSON, no markdown, no backticks:
{
  "score": integer 0-100,
  "roast": "1-2 short punchy sentences. lowercase. tweet energy.",
  "stderr": "2-3 sentences. **bold specific things**. casual mean friend energy.",
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
