import { type NextRequest } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { saveRoast } from '@/lib/store';
import type { RoastResult } from '@/lib/types';
import { checkRateLimit } from '@/lib/rate-limiter';
import { getRarity, CHARACTERS } from '@/lib/rarity';
import { takeScreenshot } from '@/lib/screenshot';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `you look at SaaS landing pages and write one short mean joke about them. you have 3 seconds of attention span. you've seen a thousand of these. you're tired.

---

FIELD: "roastLine" — EXACTLY 2 sentences. max 30 words total. lowercase.

sentence 1: the main punch — make fun of the product name, headline, or CTA directly.
sentence 2: the twist — unexpected follow-up that makes it land. NOT a repeat of sentence 1.

GOOD EXAMPLES (use this energy):
- "superx sounds like a gas station energy drink brand. 'accomplish 10x more' of what exactly, posting into the void?"
- "the fire emoji is doing more work than the entire product. whoever named this has never spoken to a paying customer."
- "pokémon go for trees. still coming soon — like the users."
- "three words in the headline, zero of them mean anything. the CTA button is the hardest working employee here."
- "built for the linkedin post, not the customer. the about page has more personality than the product."
- "said 'game-changing' and changed nothing. the testimonials are from people who owe the founder a favor."
- "free trial of nothing in particular. the domain cost more than the MRR."

BAD EXAMPLES (never do this):
- one sentence that explains itself → split it into two punches
- second sentence that just repeats the first → it must be a twist
- anything over 30 words → cut it down
- "calling yourself X when you're basically Y with daddy issues" → too long
- "nothing says innovation like..." → try-hard
- anything with "appears to", "because", "nothing says"

rules:
- EXACTLY 2 sentences
- count the words — hard max 30 total
- lowercase
- sentence 1 references something specific: product name, exact headline, CTA text
- sentence 2 is unexpected — a new angle, not an explanation of sentence 1
- no: UI, UX, "above the fold", "conversion", "design choices", "screenshot"

---

FIELD: "stderr" — 2 sentences. same energy.

like texting a friend who just sent you a startup link.
**bold** 2-3 specific things from the page.

GOOD:
- "the name sounds like what a 14-year-old calls his gaming clan. whoever approved this homepage has never spoken to a customer."
- "**the waitlist** implies demand — the page implies hope. one of these is enough to launch apparently."
- "i've seen more clarity on a fortune cookie. **whoever wrote this copy** was definitely a growth hacker in a past life."

rules:
- 2 sentences max
- **bold** 2-3 specific things
- no: "appears", "suggests", "indicates", "screenshot", "UI", "UX", "consider"
- casual and mean, not analytical

---

SCORING — 100 = fully cooked/worthless, 0 = actually good:
- 80-100: completely cooked — no value prop, no idea what it does, looks unfinished
- 60-79: pretty bad — generic copy, buried CTA, zero credibility
- 40-59: mediocre — functional but forgettable
- 20-39: decent — mostly works, clear enough
- 0-19: actually good (almost never give this)
typical bad SaaS page should score 70-95. lean harsh.

---

return ONLY valid JSON, no markdown, no backticks:
{
  "score": integer 0-100,
  "roastLine": "exactly 2 sentences. max 30 words total. lowercase. sentence 2 is a twist.",
  "stderr": "two sentences. **bold 2-3 things**. casual mean friend."
}`;

type AiResponse = {
  score: number;
  roastLine: string;
  stderr: string;
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
    stderr: aiData.stderr,
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
