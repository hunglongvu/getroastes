import { type NextRequest } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { saveRoast } from '@/lib/store';
import type { RoastResult } from '@/lib/types';
import { checkRateLimit } from '@/lib/rate-limiter';
import { getRarity, CHARACTERS } from '@/lib/rarity';
import { takeScreenshot } from '@/lib/screenshot';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `you roast SaaS landing pages. find the single most embarrassing thing on this specific page and make it the punchline.

---

## WHAT TO LOOK FOR:
scan for something SPECIFIC and VISUAL — something you can SEE on the page:
- a weird design choice (glowing orb, stock photo, 3D blob, gradient abuse)
- a specific word or phrase in a headline or CTA
- a bold claim with zero proof directly below it
- a product name that sounds like something else
- a section that contradicts another section

## HOW TO FORMAT THE ROAST:

use ONE of these two templates:

TEMPLATE A — observation + exaggerated label:
"bro [specific visual thing you saw] and called it [what they're pretending it is]"
example: "bro put a glowing ball behind his headline and called it branding. my little sister does that in powerpoint."

TEMPLATE B — quote + translation:
"[exact quote from the page] bro just say [what it actually means]"
example: "'frictionless onboarding' bro just say you have a signup form."

## HARD RULES:
- NEVER explain the joke or comment on how you feel about it ("this is sad", "i can't believe", "unfortunately")
- NEVER use: appears, suggests, indicates, seems, looks like, UI, UX, screenshot
- the observation IS the punchline — no setup needed
- 1-2 sentences max, 30 words max
- all lowercase
- must reference something SPECIFIC to THIS page — if it could describe any startup, rewrite it

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
  "roastLine": "1-2 sentences. 30 words max. lowercase. specific to this page."
}`;

type AiResponse = {
  score: number;
  roastLine: string;
};

function sse(data: object): Uint8Array {
  return new TextEncoder().encode(`data: ${JSON.stringify(data)}\n\n`);
}

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

  const stream = new ReadableStream({
    async start(controller) {
      try {
        controller.enqueue(sse({ type: 'progress', message: 'taking screenshot...' }));

        let screenshot: { base64: string; mediaType: 'image/jpeg' };
        try {
          screenshot = await takeScreenshot(normalized);
        } catch {
          controller.enqueue(sse({ type: 'error', error: "Could not screenshot this URL. Check it's public and try again." }));
          controller.close();
          return;
        }

        controller.enqueue(sse({ type: 'progress', message: 'roasting your page...' }));

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
          aiData.score = Math.max(0, Math.min(100, Math.round(aiData.score)));
        } catch {
          controller.enqueue(sse({ type: 'error', error: 'Failed to generate roast. Try again.' }));
          controller.close();
          return;
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

        controller.enqueue(sse({ type: 'done', result }));
        controller.close();
      } catch (err) {
        controller.enqueue(sse({ type: 'error', error: String(err) }));
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
