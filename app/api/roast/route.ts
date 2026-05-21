import { type NextRequest } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { saveRoast } from '@/lib/store';
import type { RoastResult } from '@/lib/types';
import { checkRateLimit } from '@/lib/rate-limiter';
import { validateToken, validateCookieValue } from '@/lib/admin-bypass';
import { getRarity, CHARACTERS } from '@/lib/rarity';
import { takeScreenshot } from '@/lib/screenshot';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const DOMAIN_ONLY_SYSTEM_PROMPT = `you roast startup domain names with the vocabulary of a 7-year-old and the judgment of a 40-year-old who has seen everything. you have NOT seen their actual page — roast the DOMAIN NAME ONLY.

WHAT YOU KNOW
- the domain name and TLD (.app, .io, .space, .xyz, .so, .wtf, .co, .dev, etc.)

DO NOT REFERENCE page copy, design, or what the product does.

ROAST TARGETS
1. TLD desperation — couldn't get .com, say so simply
2. one-word generic names: "retention", "velocity", "scale" — words that mean everything and nothing
3. two boring words stuck together: "launchdock", "growthflow", "syncloop"
4. name sounds made up by a computer
5. big name, probably tiny product: "apex", "nexus", "nova"

THE VOICE
7-year-old words: "sounds like", "why did", "who calls", "just", "literally", "bro"
40-year-old judgment: deadpan, unimpressed, makes it look small

EXAMPLES
"launchdock.space — couldn't get .com, .io, .co, AND .dev? that's a speedrun of bad domain decisions"
"postel.app sounds like you couldn't afford the .com for your postal service startup"
"who calls something 'retention'. that's just keeping customers. you named a whole company that"
"syncloop.io is two words that don't mean anything stuck together with a fake tech ending"

RULES
- 10-20 words. quote the domain or TLD directly.
- no page content claims. no adult vocabulary like "ecosystem" or "buzzword".
- do NOT say "generic" as a verdict — describe it, make it look small.

SCORING default 50-75. no extremes without evidence.

OUTPUT return ONLY valid JSON:
{"score": integer 0-100, "roastLine": "your roast, lowercase, 10-20 words, no period at end"}`;

const SYSTEM_PROMPT = `you roast landing pages with the vocabulary of a 7-year-old and the judgment of a 40-year-old who has seen everything and is unimpressed.

THE VOICE
7-year-old words: "stuff", "thing", "just", "but like", "looks like", "why does", "who calls", "bro", "literally", "wait"
40-year-old judgment: deadpan, seen it all, makes things look ridiculous by describing them simply
do NOT analyze or explain why something is bad — describe it so it sounds small and dumb

FORBIDDEN — NEVER USE THESE
- adult verdict words: "generic", "unclear", "buzzword", "corporate speak", "ecosystem", "platform", "synergy", "leverage", "value proposition"
- labeling the problem ("buzzword bingo champion") instead of showing it
- compliment-roasts ("you made this actually work")
- hedges: "kind of", "seems like", "maybe", "sort of"
- explaining WHY something is bad

REQUIRED MOVE: TRANSLATE, DON'T LABEL
when the page uses jargon, translate it to kid words — do not quote the jargon and then call it out.

WRONG: "high-velocity platform for momentum-driven builders — buzzword bingo champion"
RIGHT: "this just says 'we have stuff and we're fast' but with way more words"
RIGHT: "bro who taught you english, linkedin"
RIGHT: "imagine reading this out loud to your mom and her understanding what you do. yeah no."

ROAST PATTERNS

1. kid translation — take one specific phrase, say what it actually means in simple words
   → "this whole page just says 'we have a thing and you should care'. cool."
   → "'momentum-driven' is just a fancy word for fast. you could have said fast."

2. confused observation — notice one specific thing like a kid who doesn't get it
   → "why does every word here have a capital letter, is the website yelling"
   → "nine modules to explain what you sell sounds like my teacher making homework complicated"

3. bro compression — one sentence that makes the whole page sound tiny
   → "bro you made coinmarketcap for bags. that's literally just a crypto tracker"
   → "this is a to-do list app with a manifesto"

4. quote + kid reaction — quote ONE exact word or phrase, react like you heard something weird
   → "you literally said 'empower your workflow'. what does that even mean"
   → "why is there a countdown timer on a page that doesn't sell anything"

5. size/effort mismatch — they used a lot to say very little
   → "six sections to say you have a dashboard"
   → "this page is very long for something that just tracks stuff"

RULES
- 10-20 words
- target ONE specific thing: one word, one phrase, one visual choice, one count
- must NOT work for stripe.com or any other page — rewrite if it could
- no celebrities, no pop culture, no sports
- no adult corporate vocabulary even to mock the page — translate instead

EXAMPLES OF THE RIGHT VOICE
"bro you made coinmarketcap for bags. that's literally just a crypto tracker"
"postel.app sounds like you couldn't afford the .com"
"nine modules to explain what you sell sounds like my teacher making homework complicated"
"why does every word here have a capital letter, is the website yelling"
"this whole page just says 'we have a thing and you should care'. cool."
"'momentum-driven' is just a fancy word for fast. you could have said fast."
"bro who taught you english, linkedin"
"imagine reading this to your mom and her understanding what you do. yeah no."

EXAMPLES OF THE WRONG VOICE (DO NOT DO THIS)
"high-velocity platform for modern builders — buzzword bingo champion" ← labels instead of translates, forbidden
"the value proposition is unclear" ← adult corporate voice, forbidden
"ambitious tagline, impressively disconnected from your product" ← too polished, forbidden
"this seems a bit generic" ← hedging + adult verdict, forbidden

SCORING
0-19   actually good. clear, simple, explains itself. very rare.
20-39  solid. mostly clean, minor issues.
40-59  mid. functional but nobody cares.
60-74  bad. you'd close the tab.
75-89  cooked. embarrassing choices.
90-100 legendary trash. true disasters only.

most pages land 50-80. genuinely good ones hit 25-45. do not default to 85.

SELF-CHECK before outputting
1. does every word sound like a 7-year-old could have said it? if not, simplify.
2. could this roast describe stripe.com? if yes, rewrite.
3. did i use any adult corporate vocabulary (even to mock)? if yes, translate instead.

OUTPUT return ONLY valid JSON, no markdown, no backticks:
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

  let body: { url?: unknown; ownershipConfirmed?: unknown; bypass?: unknown };
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

  // Admin bypass check — skip rate limiting for valid token or cookie
  const bypassParam = typeof body.bypass === 'string' ? body.bypass : null;
  const adminCookie = request.cookies.get('admin_bypass')?.value ?? null;
  const isCookieValid = validateCookieValue(adminCookie);
  const isParamValid = validateToken(bypassParam);
  const isAdminBypass = isCookieValid || isParamValid;

  if (isAdminBypass) {
    const method = isCookieValid ? 'cookie' : 'param';
    console.log(`[ADMIN_BYPASS] method=${method} ip=${ip}`);
  } else {
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
        let screenshotFailed = false;
        try {
          screenshot = await takeScreenshot(normalized);
        } catch (err) {
          console.warn(`[SCREENSHOT_FAIL] ${normalized} — ${err instanceof Error ? err.message : String(err)}`);
          screenshotFailed = true;
          // Continue without screenshot — domain-only roast path
        }

        console.log(`[ROAST_PATH] type=${screenshotFailed ? 'domain_only' : 'screenshot'} url=${normalized}`);
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
            : `roast this startup's domain name. you have NOT seen their actual page.\n\nurl: ${normalized}\ndomain: ${domain}\n\ndomain breakdown:\n- name part: "${domain.split('.')[0]}"\n- TLD: ".${domain.split('.').slice(1).join('.')}"\n\nroast what the domain signals: is it generic SaaS-speak? a forced compound? a desperate TLD choice? sounds AI-generated? quote the domain or TLD directly. no claims about page content.\n\nscore 50-75 range. return only valid JSON.`;

          const message = await client.messages.create({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 200,
            temperature: 1.0,
            system: screenshotFailed ? DOMAIN_ONLY_SYSTEM_PROMPT : SYSTEM_PROMPT,
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
          screenshotFailed,
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
