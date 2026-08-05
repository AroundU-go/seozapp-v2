export interface SeoScoreInput {
  title?: string;
  metaDescription?: string;
  h1Count?: number;
  wordCount?: number;
  schemaTypes?: string[];
  brokenLinksCount?: number;
  hasCanonical?: boolean;
}

export interface SeoScoreResult {
  score: number; // 0-100
  breakdown: {
    titleScore: number; // max 20
    metaScore: number; // max 20
    h1Score: number; // max 20
    wordCountScore: number; // max 15
    schemaScore: number; // max 15
    linkScore: number; // max 10
  };
  issues: string[];
}

export function computeSeoScore(input: SeoScoreInput): SeoScoreResult {
  let titleScore = 0;
  let metaScore = 0;
  let h1Score = 0;
  let wordCountScore = 0;
  let schemaScore = 0;
  let linkScore = 5;
  const issues: string[] = [];

  // 1. Granular Title Tag Scoring (max 20)
  if (input.title && input.title.trim()) {
    const len = input.title.trim().length;
    if (len >= 45 && len <= 60) {
      titleScore = 20;
    } else if ((len >= 30 && len < 45) || (len > 60 && len <= 70)) {
      titleScore = 15;
      issues.push(`Title tag length (${len} chars) is sub-optimal (ideal is 45-60 characters)`);
    } else if (len > 0) {
      titleScore = 8;
      issues.push(`Title tag length (${len} chars) is either too short or too long for search SERPs`);
    }
  } else {
    titleScore = 0;
    issues.push('Missing Title tag — Critical SEO factor');
  }

  // 2. Granular Meta Description Scoring (max 20)
  if (input.metaDescription && input.metaDescription.trim()) {
    const len = input.metaDescription.trim().length;
    if (len >= 120 && len <= 155) {
      metaScore = 20;
    } else if ((len >= 70 && len < 120) || (len > 155 && len <= 175)) {
      metaScore = 14;
      issues.push(`Meta description length (${len} chars) is sub-optimal (ideal is 120-155 characters)`);
    } else if (len > 0) {
      metaScore = 7;
      issues.push(`Meta description length (${len} chars) may be truncated in Google snippet previews`);
    }
  } else {
    metaScore = 0;
    issues.push('Missing Meta description — High impact on CTR');
  }

  // 3. Granular Heading Structure Scoring (max 20)
  const h1 = input.h1Count ?? 0;
  if (h1 === 1) {
    h1Score = 20;
  } else if (h1 === 2 || h1 === 3) {
    h1Score = 12;
    issues.push(`Multiple H1 tags (${h1} H1s) detected. Recommend exactly 1 primary H1 per page`);
  } else if (h1 > 3) {
    h1Score = 5;
    issues.push(`Excessive H1 tags (${h1} H1s) dilute main keyword topical focus`);
  } else {
    h1Score = 0;
    issues.push('Missing H1 heading — H1 tag is required for clear topic hierarchy');
  }

  // 4. Granular Word Count & Content Density Scoring (max 15)
  const wc = input.wordCount || 0;
  if (wc >= 1200) {
    wordCountScore = 15;
  } else if (wc >= 600) {
    wordCountScore = 11;
    issues.push(`Word count is ${wc} words (recommended >1,200 words for competitive terms)`);
  } else if (wc >= 300) {
    wordCountScore = 6;
    issues.push(`Thin content: page contains only ${wc} words`);
  } else if (wc > 0) {
    wordCountScore = 2;
    issues.push(`Very thin content (${wc} words) — high risk of low indexation`);
  } else {
    wordCountScore = 0;
    issues.push('Page content appears empty or non-indexable');
  }

  // 5. Schema Markup Scoring (max 15)
  if (input.schemaTypes && input.schemaTypes.length > 0) {
    schemaScore = 15;
  } else {
    schemaScore = 0;
    issues.push('No JSON-LD structured schema detected — Recommend adding FAQPage or Organization schema');
  }

  // 6. Link & Canonical Health (max 10)
  if (input.hasCanonical) {
    linkScore += 5;
  } else {
    issues.push('Missing rel="canonical" link tag');
  }

  if (!input.brokenLinksCount || input.brokenLinksCount === 0) {
    // 5 pts for 0 broken links
  } else {
    linkScore = Math.max(0, linkScore - input.brokenLinksCount * 2);
    issues.push(`Detected ${input.brokenLinksCount} broken internal link(s)`);
  }

  const score = Math.min(100, Math.max(0, titleScore + metaScore + h1Score + wordCountScore + schemaScore + linkScore));

  return {
    score,
    breakdown: {
      titleScore,
      metaScore,
      h1Score,
      wordCountScore,
      schemaScore,
      linkScore,
    },
    issues,
  };
}
