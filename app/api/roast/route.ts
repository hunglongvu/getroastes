import { type NextRequest } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { saveRoast } from '@/lib/store';
import type { RoastResult } from '@/lib/types';
import { checkRateLimit } from '@/lib/rate-limiter';
import { getRarity, CHARACTERS } from '@/lib/rarity';
import { takeScreenshot } from '@/lib/screenshot';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `you are a 7-year-old kid roasting a landing page. you say exactly what you see in the simplest, most brutal way possible.

VOICE
simple words only. lowercase. no period at the end.
you would NOT say: "value proposition", "scalability", "user acquisition", "frictionless", "leverage", "synergy"
you WOULD say: "this doesn't make sense", "why are there so many buttons", "i don't know what this does", "that looks weird", "why did they do that"

kids compare things to: mom's powerpoint, homework, a school project, lunch, cartoons, their teacher, their little sister's drawing

ROAST RULES
- max 15 words
- must quote or name something SPECIFIC from this page: the exact headline, a button label, a weird visual, the domain name, a color choice
- must NOT work for any other website — if it could describe stripe.com too, rewrite it
- mean but innocent — not trying to be mean, just saying the obvious thing out loud
- no celebrities, no sports references, no pop culture
- no first person ("i think" is banned) — just state the observation as fact

BAD ROASTS (too generic or too adult):
"this is giving template energy" — too vague, no specifics
"like lebron playing pickup at the ymca" — celebrity reference, too adult
"the value proposition is unclear" — SaaS jargon

GOOD ROASTS (specific, simple, cruel):
"streamline your workflow doesn't mean anything my dad just nods when he hears it" — quotes their headline, uses kid comparison
"why are there 47 things on this page just pick one" — counts actual elements
"those people smiling are not real and they are not your customers" — calls out stock photos
"i looked at this for 10 seconds and still don't know what you sell"
"6 buttons. pick one. that's how the internet works"

SCORING
use the full 0-100 range honestly:
0-19   actually good. clear product, looks intentional. rare.
20-39  solid. mostly works, minor weak spots.
40-59  mid. functional but forgettable.
60-74  bad. multiple obvious problems.
75-89  cooked. embarrassing. ai slop.
90-100 legendary trash. save for true disasters.

most pages land 50-80. genuinely good ones drop to 30-45. do not default to 85.

SELF-CHECK
1. did i quote or name something visible on THIS specific page? if no, rewrite.
2. would this roast fit stripe.com or notion.so too? if yes, rewrite.
3. are the words simple enough that a 7-year-old would actually say them? if no, rewrite.

OUTPUT
return ONLY valid JSON, no markdown, no backticks:
{"score": integer 0-100, "roastLine": "your roast, lowercase, max 15 words, no period"}`;

type AiResponse = {
  score: number;
  roastLine: string;
};

function sse(data: object): Uint8Array {
  return new TextEncoder().encode(`data: ${JSON.stringify(data)}\n\n`);
}

async function validateTurnstile(token: string, ip: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true; // disabled in dev when key not set
  try {
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ secret, response: token, remoteip: ip }),
    });
    const data = await res.json() as { success: boolean };
    return data.success;
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  // TODO: Re-enable Turnstile after debugging Cloudflare domain setup.
  // Rate limiting (3/IP/day) provides interim bot protection.

  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
    request.headers.get('x-real-ip') ??
    'unknown';

  let body: { url?: unknown; ownershipConfirmed?: unknown };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  // Ownership confirmation
  if (body.ownershipConfirmed !== true) {
    console.warn(`[OWNERSHIP_FAIL] ${ip}`);
    return Response.json(
      { error: 'ownership_required', message: 'Please confirm ownership before roasting.' },
      { status: 400 },
    );
  }

  // Rate limiting
  const { allowed, resetAt } = await checkRateLimit(ip);
  if (!allowed) {
    console.warn(`[ABUSE] rate_limit_exceeded from ${ip}`);
    return Response.json(
      {
        error: 'limit_reached',
        message: "You've used your 3 free roasts today. Come back tomorrow for 3 more.",
        resetAt,
      },
      { status: 429 },
    );
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

        let screenshot: { base64: string; mediaType: 'image/jpeg' } | null = null;
        try {
          screenshot = await takeScreenshot(normalized);
        } catch {
          // Continue without screenshot — card uses solid dark background
        }

        controller.enqueue(sse({ type: 'progress', message: 'roasting your page...' }));

        let aiData: AiResponse;
        try {
          const userContent = screenshot
            ? [
                {
                  type: 'image' as const,
                  source: {
                    type: 'base64' as const,
                    media_type: screenshot.mediaType,
                    data: screenshot.base64,
                  },
                },
                {
                  type: 'text' as const,
                  text: `roast this landing page as a 7-year-old kid.\n\nurl: ${normalized}\ndomain: ${domain}\n\nlook at the screenshot and find:\n- the EXACT words in the main headline (you will reference these)\n- what the CTA button says\n- anything weird: too many features listed, confusing layout, stock photos of fake-smiling people, vague taglines, buzzwords\n- whether you can tell what this product does in 3 seconds\n\nwrite ONE roast (max 15 words) using simple kid language that references something specific you see. quote their actual headline or name something specific on the page.\n\nscore honestly (full 0-100 range). return only valid JSON.`,
                },
              ]
            : `roast this landing page as a 7-year-old kid using ONLY the domain name — no screenshot available.\n\nurl: ${normalized}\ndomain: ${domain}\n\nroast the domain name itself: what it sounds like, what the extension (.so/.ai/.xyz) says about the founder's choices, what kind of product a name like this implies. simple kid language, max 15 words, quote the domain name directly.\n\nscore harshly since they didn't even let us see the page (70-95 range). return only valid JSON.`;

          const message = await client.messages.create({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 200,
            temperature: 0.9,
            system: SYSTEM_PROMPT,
            messages: [{ role: 'user', content: userContent }],
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
          screenshotBase64: screenshot?.base64,
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
