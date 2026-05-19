import type { ScrapedData } from './scraper';

const IDEAL_HERO_WORDS: Record<string, { min: number; max: number }> = {
  DEVELOPER_TOOL: { min: 15, max: 40 },
  CONSUMER_APP:   { min: 10, max: 30 },
  AI_TOOL:        { min: 15, max: 35 },
  B2B_ENTERPRISE: { min: 40, max: 90 },
  B2B_SMB:        { min: 25, max: 65 },
  MARKETPLACE:    { min: 20, max: 55 },
  UNKNOWN:        { min: 20, max: 60 },
};

const IDEAL_TOTAL_WORDS: Record<string, { min: number; max: number }> = {
  DEVELOPER_TOOL: { min: 150, max: 400 },
  CONSUMER_APP:   { min: 100, max: 300 },
  AI_TOOL:        { min: 200, max: 500 },
  B2B_ENTERPRISE: { min: 500, max: 1200 },
  B2B_SMB:        { min: 300, max: 800 },
  MARKETPLACE:    { min: 350, max: 700 },
  UNKNOWN:        { min: 200, max: 600 },
};

export function calculateScore(data: ScrapedData): number {
  let score = 0;
  const type = data.saasType;
  const idealHero = IDEAL_HERO_WORDS[type];
  const idealTotal = IDEAL_TOTAL_WORDS[type];

  // ── HERO WORD COUNT (15 pts) ──────────────────────────
  const heroWords = data.hero.wordCount;
  if (heroWords >= idealHero.min && heroWords <= idealHero.max) {
    score += 15;
  } else if (heroWords < idealHero.min * 0.5) {
    score += 3;
  } else if (heroWords > idealHero.max * 2) {
    score += 2;
  } else {
    score += 8;
  }

  // ── TOTAL WORD COUNT (8 pts) ──────────────────────────
  const totalWords = data.copy.totalWordCount;
  if (totalWords >= idealTotal.min && totalWords <= idealTotal.max) {
    score += 8;
  } else if (totalWords > idealTotal.max * 1.5) {
    score -= 5;
  } else {
    score += 3;
  }

  // ── BUZZWORD PENALTY ──────────────────────────────────
  const buzzwordPenalty = type === 'DEVELOPER_TOOL' ? 4 : 2;
  score -= data.copy.buzzwordsFound.length * buzzwordPenalty;

  // ── VALUE PROPOSITION (20 pts) ────────────────────────
  if (data.copy.valuePropositionClarity === 'clear') score += 20;
  else if (data.copy.valuePropositionClarity === 'vague') score += 5;
  else score -= 10;

  // ── TARGET AUDIENCE (8 pts) ───────────────────────────
  if (data.copy.targetAudienceClear) score += 8;
  else score -= 5;

  // ── PAIN POINT + DIFFERENTIATOR (12 pts) ──────────────
  if (data.copy.painPointAddressed) score += 6;
  if (data.copy.differentiatorPresent) score += 6;

  // ── CTA QUALITY (15 pts) ──────────────────────────────
  if (data.structure.ctaAboveFold) score += 8;
  if (data.structure.ctaCount === 1) score += 7;
  else if (data.structure.ctaCount === 2) score += 4;
  else if (data.structure.ctaCount > 3) score -= 8;

  // ── PRICING TRANSPARENCY (10 pts) ────────────────────
  if (data.structure.showsActualPrices) score += 10;
  else if (data.structure.hasPricing) score += 4;
  else if (type !== 'B2B_ENTERPRISE') score -= 6;

  // ── SOCIAL PROOF (15 pts) ────────────────────────────
  if (data.socialProof.hasCompanyLogos) score += 4;
  if (data.socialProof.hasNumbers) score += 5;
  if (data.socialProof.hasFaces) score += 3;
  if (data.socialProof.hasReviewBadges) score += 3;
  if (data.socialProof.testimonialCount === 0) score -= 8;

  // ── TYPE-SPECIFIC BONUSES ─────────────────────────────
  if (type === 'DEVELOPER_TOOL') {
    if (data.structure.hasScreenshots) score += 8;
    if (data.structure.hasDemo) score += 5;
    if (data.copy.totalWordCount > 500) score -= 8;
  }
  if (type === 'CONSUMER_APP') {
    if (data.structure.hasVideo) score += 10;
    if (data.copy.totalWordCount > 600) score -= 6;
  }
  if (type === 'AI_TOOL') {
    if (data.structure.hasScreenshots || data.structure.hasDemo) score += 8;
  }

  return Math.max(0, Math.min(100, score));
}

export function getScoreContext(data: ScrapedData): string {
  const issues: string[] = [];
  const wins: string[] = [];
  const type = data.saasType;

  if (data.copy.buzzwordsFound.length > 0) {
    issues.push(`buzzwords detected: ${data.copy.buzzwordsFound.slice(0, 3).join(', ')}`);
  }
  if (data.copy.valuePropositionClarity === 'missing') {
    issues.push('value proposition is completely missing');
  }
  if (data.copy.valuePropositionClarity === 'vague') {
    issues.push('value proposition is vague and generic');
  }
  if (data.structure.ctaCount > 3) {
    issues.push(`${data.structure.ctaCount} CTAs detected — panic mode`);
  }
  if (!data.structure.showsActualPrices && type !== 'B2B_ENTERPRISE') {
    issues.push('pricing is hidden — sus');
  }
  if (data.socialProof.testimonialCount === 0) {
    issues.push('zero social proof');
  }
  if (!data.socialProof.hasFaces) {
    issues.push('testimonials have no faces');
  }
  if (data.hero.wordCount > IDEAL_HERO_WORDS[type].max * 1.5) {
    issues.push('hero section is a wall of text');
  }
  if (data.copy.totalWordCount < IDEAL_TOTAL_WORDS[type].min * 0.5) {
    issues.push('page is almost empty — not enough content');
  }
  if (!data.copy.differentiatorPresent) {
    issues.push('no differentiator — why not use a competitor?');
  }

  if (data.structure.ctaAboveFold) wins.push('CTA is above fold');
  if (data.structure.showsActualPrices) wins.push('shows actual prices');
  if (data.socialProof.hasNumbers) wins.push('has social proof numbers');

  return `
SAAS TYPE: ${type}
HERO HEADLINE: "${data.hero.headline}"
HERO SUBHEADLINE: "${data.hero.subheadline}"
HERO CTA: "${data.hero.ctaText}"
HERO WORD COUNT: ${data.hero.wordCount} (ideal: ${IDEAL_HERO_WORDS[type].min}-${IDEAL_HERO_WORDS[type].max})
TOTAL WORDS: ${data.copy.totalWordCount}
BUZZWORDS FOUND: ${data.copy.buzzwordsFound.join(', ') || 'none'}
CTA COUNT: ${data.structure.ctaCount}
ISSUES: ${issues.join(' | ')}
WINS: ${wins.join(' | ') || 'none'}
  `.trim();
}
