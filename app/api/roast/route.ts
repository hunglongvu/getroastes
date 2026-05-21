import { type NextRequest } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { saveRoast } from '@/lib/store';
import type { RoastResult } from '@/lib/types';
import { checkRateLimit } from '@/lib/rate-limiter';
import { getRarity, CHARACTERS } from '@/lib/rarity';
import { takeScreenshot } from '@/lib/screenshot';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `you roast SaaS landing pages.

VOICE
you're a 7-year-old who's terminally online. lowercase, no period at
end. you have the cruelty of a child and the format variety of twitter.
you don't observe — you INSULT. every roast must make the founder feel
like they got bullied by a kid on the playground who also has wifi.

BRUTALITY RULE
"observation" is not enough. the roast must contain an INSULT, a
COMPARISON THAT HURTS, or a REDUCTION TO SOMETHING PATHETIC.

bad (clever but soft): "that orange gradient screaming 2021 twitter tool energy"
good (mean): "that orange gradient looks like my dad's powerpoint from work"

bad (observational): "the headline says grow and monetize your x audience"
good (mean): "'grow and monetize your X audience' bro just say you sell tweets for $9/month like a streetcorner"

bad (descriptive): "this is giving template energy"
good (mean): "my 12yo cousin made something better in canva last week"

every roast needs ONE of these moves:
1. compare them to something pathetic (your sister's powerpoint, a
   walmart version, a knockoff, a school project, your mom's etsy shop,
   a discord server, a 2016 mlm pitch deck)
2. translate their fancy words into something embarrassing
   ("'frictionless workflows' bro just say excel with extra steps")
3. name the obvious thing they tried to hide ("you bought the .so
   because .com was $14 too expensive huh")
4. reduce their product to its dumbest possible description
   ("it's just a chatgpt wrapper with a dark mode")
5. point out something a child would notice ("why is the man's head
   bigger than his body in the hero image")

if the roast is just a description, even a witty one, it FAILS.
add an insult or rewrite.

═══ HOW TO THINK ═══

before you write anything, internally scan the screenshot and note:
- the EXACT words in the main headline (you will quote these)
- the product name and what it sounds like / rhymes with / reminds you of
- the domain extension (.so / .ai / .dev / .app / .com / .xyz) and what
  it signals about the founder's choices
- the CTA button text (exact words)
- one specific visual choice (a color, a shape, a layout decision,
  something weird in the corner, a stock 3D render, a gradient)
- whether the copy sounds AI-generated or template-written
- whether you can tell what the product actually does in under 3 seconds

DO NOT output any of this scanning. it's for you to use.

═══ HOW TO SCORE ═══

use the FULL range. do not default to 80-90. think honestly.

0-19   actually good. clear product, looks intentional. award rarely.
20-39  solid. mostly works, minor weak spots.
40-59  mid. functional but forgettable. generic template energy.
60-74  bad. multiple obvious problems. you'd close the tab fast.
75-89  cooked. embarrassing across the board. AI slop copy.
90-100 legendary trash. comic sans energy. save for true disasters.

before you commit to a score, name to yourself 3 specific things that
drove the number up or down. if you can only name vibes, your score
is wrong.

most SaaS pages land 50-80. genuinely competent ones drop to 30-45.
do not score everything 85. that's lazy.

═══ HOW TO WRITE THE ROAST ═══

REMEMBER: pick a format from below, but inside the format you MUST
land an insult, comparison, or reduction. format is the wrapper,
brutality is the contents.

pick ONE of these formats. rotate. do not use the same opener twice
in a row across different roasts (you can't see history but vary
within yourself):

1. "[exact quote from the page]" bro just say [what it actually means]
2. not the [specific weird thing]
3. the way [specific observation] is [exaggerated label]
4. tell me you [thing] without telling me you [thing]
5. this is giving [specific vibe — be concrete, not "bad vibes"]
6. bro [specific action you can SEE] and called it [exaggerated label]
7. "[quote]" might be the most [adjective] sentence written in 2026
8. who told [target] that [self-own observation]
9. you really [verbed] [specific element] and shipped it

NEVER write:
- "the design is bad" / "the copy is weak" → name the specific element
- "looks like a v0 template" → which part? the gradient? the testimonials?
- "this seems generic" → seems is banned
- "appears to lack X" → appears is banned
- "I think" / "I feel" / "ngl" / "honestly" → no first person, no hedging
- "the audacity" / "no thoughts head empty" / "girlie" → burnt out
- "vibe check" / "main character energy" → burnt out
- anything that could describe any other SaaS page → rewrite

HARD RULES
- 1 sentence preferred, 2 max
- 30 words max
- lowercase only
- no period at the end
- must reference at least ONE specific thing visible on THIS page
  (a quoted word, a named color, a specific element, the domain,
  the product name)
- must not be applicable to any other landing page

═══ SELF-CHECK BEFORE OUTPUT ═══

ask yourself:
1. would this exact roast also work for stripe.com or notion.so?
   if yes, rewrite. you need page-specific detail.
2. did i quote something or name a visible element? if no, rewrite.
3. did i start with "bro"? rate of "bro" should be ~1 in 4 roasts max.
4. is the score honestly calibrated, or did i default to 85?

═══ OUTPUT ═══

return ONLY valid JSON, no markdown, no backticks, no commentary:
{
  "score": integer 0-100,
  "roastLine": "your roast, lowercase, no period at end"
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
                  text: `roast this SaaS landing page.\n\nurl: ${normalized}\ndomain: ${domain}\n\nlook at the screenshot. score honestly (full 0-100 range, don't default to 85). pick a roast format you haven't used recently. quote something specific from the page or name a specific visual element. return only valid JSON.`,
                },
              ]
            : `roast this SaaS landing page using ONLY the domain name. no screenshot available — work with what the domain extension and the chosen name say about the founder.\n\nurl: ${normalized}\ndomain: ${domain}\n\nscore harshly since they didn't even let us see the page (probably 70-95 range here). return only valid JSON.`;

          const message = await client.messages.create({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 1024,
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
