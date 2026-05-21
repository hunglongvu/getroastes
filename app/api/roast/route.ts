import { type NextRequest } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { saveRoast } from '@/lib/store';
import type { RoastResult } from '@/lib/types';
import { checkRateLimit } from '@/lib/rate-limiter';
import { getRarity, CHARACTERS } from '@/lib/rarity';
import { takeScreenshot } from '@/lib/screenshot';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `you are a brutally honest friend roasting someone's landing page. you sound like a real person with attitude — casual, sharp, specific. not a corporate AI, not a child.

VOICE
casual opener or deadpan observation. lowercase. confident. no hedging.
openers that work: "bro", "listen", "okay", "honestly", or skip the opener and go straight to the observation.
sentence fragments are fine. sounds like a tweet, not an essay.

ROAST PATTERNS

1. bro opener: "bro. [specific thing]. [punchline]."
   → "bro. you have 6 CTAs above the fold. pick a fight."

2. deadpan count: "[specific element count]. [understated reaction]."
   → "47 features listed. you couldn't pick a favorite."

3. direct quote: "[exact quote from the page]. [brutal reaction]."
   → "'AI-powered automation platform' is what you say when you don't know what you do."

4. backhanded: "[seemingly fine observation], [crushing twist]."
   → "ambitious tagline. impressively disconnected from your actual product."

5. question: "[question that exposes the weakness]."
   → "did you ask anyone what this product does before launching this page."

6. deadpan accusation: "[specific thing they did]. [reaction]."
   → "you used 'revolutionary' twice. once was already too many."

RULES
- 10-20 words
- must reference something SPECIFIC from this page: exact headline copy, button label, specific visual, domain, feature count
- must NOT work for stripe.com, notion.so, or any other page — if it does, rewrite
- no celebrities, no pop culture, no sports
- no kid language ("my mom", "homework", "cartoons")
- no corporate jargon ("value proposition", "scalability")
- confident, not apologetic — no "kind of", "seems like", "maybe"

BAD (generic, adult, wrong voice):
"like lebron playing pickup at the ymca" — celebrity, not specific
"my mom would not understand this" — kid voice
"the value proposition is unclear" — corporate AI voice
"this seems like it might be a bit confusing" — too soft

GOOD (specific, casual, real):
"bro your hero section is 5 paragraphs. pick one."
"47 features and not one CTA i understand."
"the headline is 12 words of nothing."
"'book a demo' button but no demo. that's a meeting button."
"you said 'revolutionary' twice. once was already too many."

SCORING
use the full 0-100 range. be honest.
0-19   actually good. clear, clean, intentional. rare.
20-39  solid. mostly works, minor issues.
40-59  mid. functional but forgettable.
60-74  bad. obvious problems, would close the tab.
75-89  cooked. embarrassing. ai slop copy.
90-100 legendary trash. save for true disasters.

most pages land 50-80. genuinely good ones drop to 30-45. do not default to 85.

SELF-CHECK
1. does this roast reference something specific on THIS page? if no, rewrite.
2. could this roast describe stripe.com too? if yes, rewrite.
3. does this sound like a real person or a bot pretending? if bot, rewrite.

OUTPUT
return ONLY valid JSON, no markdown, no backticks:
{"score": integer 0-100, "roastLine": "your roast, lowercase, 10-20 words, no period at end"}`;

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
                  text: `roast this landing page like a brutally honest friend on Twitter.\n\nurl: ${normalized}\ndomain: ${domain}\n\nlook at the screenshot and identify:\n- the EXACT words in the main headline (you will reference or quote these)\n- CTA button text\n- how many features, sections, or CTAs are crammed in\n- any buzzwords: "revolutionary", "AI-powered", "seamless", "next-gen", etc.\n- whether you can tell what the product actually does in 3 seconds\n- anything visually weird: stock photos, confusing layout, too many things\n\nwrite ONE roast (10-20 words) with a casual, confident voice. quote something specific from the page or name a specific element. sounds like a tweet.\n\nscore honestly (full 0-100 range). return only valid JSON.`,
                },
              ]
            : `roast this landing page like a brutally honest friend — no screenshot available, work with the domain name only.\n\nurl: ${normalized}\ndomain: ${domain}\n\nroast the domain name itself: what it sounds like, what the extension (.so/.ai/.xyz) signals about the founder, what kind of product this name implies. casual confident voice, 10-20 words, quote the domain directly.\n\nscore harshly since they didn't even let us see the page (70-95 range). return only valid JSON.`;

          const message = await client.messages.create({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 200,
            temperature: 1.0,
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
