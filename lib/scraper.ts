export interface ScrapedData {
  url: string;
  domain: string;
  saasType: 'B2B_ENTERPRISE' | 'B2B_SMB' | 'DEVELOPER_TOOL' | 'CONSUMER_APP' | 'AI_TOOL' | 'MARKETPLACE' | 'UNKNOWN';
  hero: {
    headline: string;
    subheadline: string;
    ctaText: string;
    ctaSecondary: string;
    wordCount: number;
  };
  copy: {
    totalWordCount: number;
    buzzwordsFound: string[];
    valuePropositionClarity: 'clear' | 'vague' | 'missing';
    targetAudienceClear: boolean;
    painPointAddressed: boolean;
    differentiatorPresent: boolean;
  };
  structure: {
    ctaCount: number;
    ctaAboveFold: boolean;
    hasPricing: boolean;
    showsActualPrices: boolean;
    pricingTiers: string[];
    hasVideo: boolean;
    hasScreenshots: boolean;
    hasDemo: boolean;
  };
  socialProof: {
    testimonialCount: number;
    hasFaces: boolean;
    hasCompanyLogos: boolean;
    hasNumbers: boolean;
    hasReviewBadges: boolean;
    exampleTestimonial: string;
  };
  rawText: string;
}

const BUZZWORDS = [
  'revolutionary', 'game-changing', 'seamless', 'streamline', 'innovative',
  'cutting-edge', 'best-in-class', 'world-class', 'next-generation', 'state-of-the-art',
  'disruptive', 'paradigm', 'synergy', 'leverage', 'holistic', 'robust', 'scalable',
  'empower', 'transform', 'unlock', 'supercharge',
];

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&mdash;/g, '—')
    .replace(/&ndash;/g, '–')
    .replace(/&#\d+;/g, '')
    .replace(/&[a-z]+;/g, '');
}

function stripTags(html: string): string {
  return decodeHtmlEntities(html.replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();
}

function extractAttr(html: string, attr: string): string {
  const m = html.match(new RegExp(`${attr}=["']([^"']*)`, 'i'));
  return m ? decodeHtmlEntities(m[1]).trim() : '';
}

function detectSaasType(text: string): ScrapedData['saasType'] {
  const lower = text.toLowerCase();
  const has = (...words: string[]) => words.some(w => lower.includes(w));

  if (has('api', 'sdk', 'cli', 'npm', 'github', 'open source', 'docs', 'webhook', 'integration'))
    return 'DEVELOPER_TOOL';
  if (has('ai', 'gpt', 'generate', 'automate', 'machine learning', 'llm', 'prompt'))
    return 'AI_TOOL';
  if (has('enterprise', 'compliance', 'sso', 'sla', 'security', 'teams', 'organization'))
    return 'B2B_ENTERPRISE';
  if (has('download', 'app store', 'google play', 'free forever', 'personal'))
    return 'CONSUMER_APP';
  if (has('buy', 'sell', 'creators', 'commission', 'vendors', 'listings'))
    return 'MARKETPLACE';
  return 'B2B_SMB';
}

function detectValuePropClarity(
  headline: string,
  subheadline: string,
): ScrapedData['copy']['valuePropositionClarity'] {
  const combined = `${headline} ${subheadline}`.toLowerCase();

  // Clear: mentions specific outcome, time, number, or "for [audience]"
  const clearSignals = [
    /\d+%/, /\d+x/, /\bin \d+/, /for (teams|developers|startups|founders|engineers|designers|marketers)/,
    /\bwithout\b/, /\binstead of\b/, /\breplace\b/, /\bno more\b/,
  ];
  if (clearSignals.some(r => r.test(combined))) return 'clear';

  // Missing: only buzzwords, or too short to mean anything
  const buzzwordOnly = BUZZWORDS.filter(b => combined.includes(b));
  if (buzzwordOnly.length >= 2 || combined.split(' ').length < 5) return 'missing';

  return 'vague';
}

export async function scrapeUrl(url: string): Promise<ScrapedData> {
  const domain = new URL(url).hostname;

  const response = await fetch(url, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
    },
    signal: AbortSignal.timeout(12000),
  });

  if (!response.ok) throw new Error(`HTTP ${response.status}`);

  const html = await response.text();
  return parseHtml(html, url, domain);
}

function parseHtml(html: string, url: string, domain: string): ScrapedData {
  // Strip scripts and styles first
  const clean = html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '');

  // ── HERO SECTION ────────────────────────────────────────
  // Best h1 = headline
  const h1Match = clean.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  const headline = h1Match ? stripTags(h1Match[1]) : '';

  // First h2 or a <p> near the top = subheadline
  const h2Match = clean.match(/<h2[^>]*>([\s\S]*?)<\/h2>/i);
  const subheadline = h2Match ? stripTags(h2Match[1]) : '';

  // Buttons for CTA text
  const buttonMatches = [...clean.matchAll(/<button[^>]*>([\s\S]*?)<\/button>/gi)];
  const anchorBtnMatches = [...clean.matchAll(/<a[^>]*(?:class|role)=["'][^"']*(?:btn|button|cta)[^"']*["'][^>]*>([\s\S]*?)<\/a>/gi)];
  const allCtaTexts = [...buttonMatches, ...anchorBtnMatches]
    .map(m => stripTags(m[1]))
    .filter(t => t && t.length > 1 && t.length < 60);

  const ctaText = allCtaTexts[0] ?? '';
  const ctaSecondary = allCtaTexts[1] ?? '';

  const heroText = `${headline} ${subheadline} ${ctaText}`;
  const heroWordCount = heroText.split(/\s+/).filter(Boolean).length;

  // ── ALL VISIBLE TEXT ─────────────────────────────────────
  const bodyMatch = clean.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  const bodyHtml = bodyMatch ? bodyMatch[1] : clean;

  // Remove nav/footer/header for cleaner body
  const bodyStripped = bodyHtml
    .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, '')
    .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, '')
    .replace(/<header[^>]*>[\s\S]*?<\/header>/gi, '');

  const allTextRaw = stripTags(bodyStripped);
  const totalWordCount = allTextRaw.split(/\s+/).filter(Boolean).length;

  const rawText = allTextRaw.slice(0, 2000);

  // ── SAAS TYPE ───────────────────────────────────────────
  const saasType = detectSaasType(allTextRaw);

  // ── BUZZWORDS ───────────────────────────────────────────
  const lowerText = allTextRaw.toLowerCase();
  const buzzwordsFound = BUZZWORDS.filter(b => lowerText.includes(b));

  // ── VALUE PROP CLARITY ──────────────────────────────────
  const valuePropositionClarity = detectValuePropClarity(headline, subheadline);

  // ── TARGET AUDIENCE ─────────────────────────────────────
  const audienceKeywords = ['for teams', 'for developers', 'for startups', 'for founders',
    'for designers', 'for marketers', 'for businesses', 'for engineers', 'for agencies',
    'for freelancers', 'for companies'];
  const targetAudienceClear = audienceKeywords.some(k => lowerText.includes(k))
    || /\bfor\s+\w+s\b/.test(lowerText);

  // ── PAIN POINT ───────────────────────────────────────────
  const painKeywords = ['tired of', 'stop wasting', "don't waste", 'without the', 'no more',
    'instead of', 'replace', 'eliminate', 'never again', 'say goodbye', 'struggle',
    'frustrating', 'painful', 'time-consuming'];
  const painPointAddressed = painKeywords.some(k => lowerText.includes(k));

  // ── DIFFERENTIATOR ──────────────────────────────────────
  const diffKeywords = ['unlike', 'the only', "the first", 'different from', 'better than',
    'vs ', 'compared to', "what makes us", "why us", "what's different", 'unique'];
  const differentiatorPresent = diffKeywords.some(k => lowerText.includes(k));

  // ── CTA STRUCTURE ───────────────────────────────────────
  const ctaCount = allCtaTexts.length;

  // "above fold" heuristic: CTA in first 20% of HTML
  const ctaPosition = html.indexOf(ctaText.slice(0, 20));
  const ctaAboveFold = ctaText.length > 0 && ctaPosition > -1 && ctaPosition < html.length * 0.2;

  // ── PRICING ─────────────────────────────────────────────
  const hasPricing = /pricing|plans|subscribe|per month|per year|\/mo|\/yr/.test(lowerText);
  const showsActualPrices = /\$\d|\€\d|£\d|\d+\s*\/\s*mo|\d+\s*\/\s*month/.test(allTextRaw);

  // Extract tier names from pricing area
  const tierRe = /\b(free|starter|basic|pro|growth|business|team|enterprise|scale|plus|premium)\b/gi;
  const tierMatches = [...allTextRaw.matchAll(tierRe)].map(m => m[1]);
  const pricingTiers = [...new Set(tierMatches)].slice(0, 5);

  // ── MEDIA ───────────────────────────────────────────────
  const hasVideo = /<video|youtube\.com|vimeo\.com|loom\.com|wistia\.com/.test(html);
  const hasScreenshots = /screenshot|demo\s*(image|gif|png|jpg)|product\s*image/.test(lowerText)
    || (clean.match(/<img[^>]+/gi) ?? []).length > 2;
  const hasDemo = /\b(demo|playground|try it|live demo|interactive)\b/.test(lowerText);

  // ── SOCIAL PROOF ────────────────────────────────────────
  // Testimonial containers
  const testimonialCount = Math.min(
    (clean.match(/testimonial|blockquote|review-card|quote-card/gi) ?? []).length,
    20,
  );

  // Faces: avatar/headshot images
  const hasFaces = /avatar|headshot|photo|face|profile-image/.test(lowerText);

  // Company logos section
  const hasCompanyLogos = /trusted by|our customers|used by|logo|as seen in|featured in/.test(lowerText);

  // Numbers as proof
  const hasNumbers = /\d{2,}[k+\s]*(users|customers|companies|teams|installs|downloads|reviews|stars|rating)/i.test(allTextRaw)
    || /\d+%\s*(uptime|faster|increase|reduction|customers)/i.test(allTextRaw);

  // Review badges
  const hasReviewBadges = /g2|capterra|product\s*hunt|trustpilot|getapp|appsumo/i.test(allTextRaw);

  // Example testimonial
  const bqMatch = clean.match(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/i);
  const exampleTestimonial = bqMatch ? stripTags(bqMatch[1]).slice(0, 150) : '';

  return {
    url,
    domain,
    saasType,
    hero: { headline, subheadline, ctaText, ctaSecondary, wordCount: heroWordCount },
    copy: {
      totalWordCount,
      buzzwordsFound,
      valuePropositionClarity,
      targetAudienceClear,
      painPointAddressed,
      differentiatorPresent,
    },
    structure: {
      ctaCount,
      ctaAboveFold,
      hasPricing,
      showsActualPrices,
      pricingTiers,
      hasVideo,
      hasScreenshots,
      hasDemo,
    },
    socialProof: {
      testimonialCount,
      hasFaces,
      hasCompanyLogos,
      hasNumbers,
      hasReviewBadges,
      exampleTestimonial,
    },
    rawText,
  };
}
