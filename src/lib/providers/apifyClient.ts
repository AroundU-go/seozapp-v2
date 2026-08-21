import { ApifyClient } from 'apify-client';

const APIFY_TOKEN = process.env.APIFY_API_KEY || process.env.APIFY_TOKEN || '';
const ACTOR_ID = 'inovaflow/ai-brand-monitoring';

/**
 * Maps our internal engine IDs to inovaflow/ai-brand-monitoring surface identifiers.
 */
const PLATFORM_MAP: Record<string, string> = {
  chatgpt: 'chatgpt',
  perplexity: 'perplexity',
  gemini: 'gemini',
  ai_overview: 'aio',
  google_aio: 'aio',
  aio: 'aio',
  claude: 'copilot',
  copilot: 'copilot',
  ai_mode: 'ai_mode',
};

/**
 * Reverse map: actor surface identifier → our internal engine ID.
 */
const REVERSE_PLATFORM_MAP: Record<string, string> = {
  chatgpt: 'chatgpt',
  perplexity: 'perplexity',
  gemini: 'gemini',
  aio: 'ai_overview',
  google_aio: 'ai_overview',
  ai_overview: 'ai_overview',
  ai_mode: 'ai_overview',
  copilot: 'claude',
  claude: 'claude',
};

/** A single per-query, per-surface result from the brand tracker. */
export interface BrandTrackerResult {
  query: string;
  platform: string;        // our internal engine ID (e.g. 'chatgpt', 'ai_overview')
  brandMentioned: boolean;
  position: string;
  sentiment: string;
  responseSnippet: string;
  citedUrls: string[];
  competitorsMentioned: string[];
  visibilityScore?: number;
  shareOfVoice?: number;
  aiSearchVolume?: number;
  rawData?: any;
}

/** Input params for the brand tracker actor call. */
export interface BrandTrackerInput {
  brandName: string;
  brandDomain?: string;
  brandAliases?: string[];
  queries: string[];
  platforms: string[];      // our internal engine IDs
  country?: string;         // e.g. 'US', 'GB', 'CA', 'DE', or 2-letter ISO code
  competitors?: string[];
  locationCode?: string;
  languageCode?: string;
}

/**
 * Converts a region code (e.g. 'US', 'UK', 'CA', 'GLOBAL') to lowercase 2-letter ISO code.
 */
function resolveCountryCode(country?: string): string {
  if (!country) return 'us';
  const c = country.trim().toLowerCase();
  if (c === 'uk') return 'gb';
  if (c === 'global') return 'us';
  if (c.length === 2) return c;
  return 'us';
}

/**
 * Runs the inovaflow/ai-brand-monitoring Apify actor with all queries and surfaces.
 * Returns a flat array of standardized per-query, per-surface results.
 */
export async function runApifyBrandTracker(
  params: BrandTrackerInput
): Promise<BrandTrackerResult[]> {
  const token = APIFY_TOKEN || process.env.APIFY_API_KEY || process.env.APIFY_TOKEN || '';
  if (!token) {
    throw new Error('APIFY_API_KEY is missing in environment variables');
  }

  const client = new ApifyClient({ token });

  // Convert our engine IDs to the actor's surface identifiers
  const actorSurfaces = (params.platforms || ['chatgpt', 'gemini', 'perplexity', 'ai_overview'])
    .map((p) => PLATFORM_MAP[p] || p)
    .filter((v, i, a) => a.indexOf(v) === i); // dedupe

  const countryCode = resolveCountryCode(params.country);

  // Clean brand domains
  const cleanBrandDomains: string[] = [];
  if (params.brandDomain) {
    const d = params.brandDomain
      .trim()
      .replace(/^https?:\/\//i, '')
      .replace(/\/.*$/, '')
      .replace(/^www\./i, '')
      .toLowerCase();
    if (d) cleanBrandDomains.push(d);
  }

  // Format valid prompt queries
  const cleanPrompts = (params.queries || [])
    .map((q) => (typeof q === 'string' ? q.trim() : ''))
    .filter(Boolean);

  if (cleanPrompts.length === 0) {
    cleanPrompts.push(`${params.brandName} software reviews`);
  }

  const input = {
    prompts: cleanPrompts,
    brand: params.brandName.trim(),
    brandAliases: Array.isArray(params.brandAliases) ? params.brandAliases : [],
    brandDomains: cleanBrandDomains,
    competitors: [], // Skipped competitor feature for now as requested
    country: [countryCode],
    surfaces: actorSurfaces.length > 0 ? actorSurfaces : ['aio', 'perplexity', 'chatgpt', 'gemini'],
    publishVisibilityPage: true,
    watchCompetitors: false,
    deepDiveModel: 'haiku',
  };

  try {
    console.log(`[Apify BrandTracker] Calling ${ACTOR_ID} with ${cleanPrompts.length} prompts across surfaces: ${input.surfaces.join(', ')} (country: ${countryCode})`);
    
    const run = await client.actor(ACTOR_ID).call(input);
    const { items } = await client.dataset(run.defaultDatasetId).listItems();

    if (!Array.isArray(items) || items.length === 0) {
      console.warn('[Apify BrandTracker] No items returned from dataset run');
      return [];
    }

    const results: BrandTrackerResult[] = [];

    for (const item of items) {
      // The dataset may contain flat items or nested query/surface items
      if (Array.isArray(item.queryResults)) {
        for (const qr of item.queryResults) {
          if (Array.isArray(qr.platformResults || qr.surfaceResults)) {
            const list = qr.platformResults || qr.surfaceResults;
            for (const pr of list) {
              results.push(parseResultItem(
                { ...pr, prompt: qr.prompt || qr.query || item.prompt },
                params.brandName,
                cleanBrandDomains
              ));
            }
          } else {
            results.push(parseResultItem(
              { ...qr, prompt: qr.prompt || qr.query },
              params.brandName,
              cleanBrandDomains
            ));
          }
        }
        continue;
      }

      if (Array.isArray(item.results)) {
        for (const r of item.results) {
          results.push(parseResultItem(r, params.brandName, cleanBrandDomains));
        }
        continue;
      }

      // Default: flat item in dataset
      results.push(parseResultItem(item, params.brandName, cleanBrandDomains));
    }

    return results;
  } catch (err: any) {
    console.error(`[Apify BrandTracker] Actor call failed for ${ACTOR_ID}:`, err.message);
    throw err;
  }
}

/**
 * Parses a single result item from the actor's dataset into our standardized format.
 */
function parseResultItem(item: any, brandName: string, brandDomains: string[] = []): BrandTrackerResult {
  // Extract surface / engine ID
  const rawSurface =
    item.surface ||
    item.platform ||
    item.engine ||
    item.provider ||
    item.source ||
    'chatgpt';
  const platform = REVERSE_PLATFORM_MAP[rawSurface] || rawSurface;

  // Extract prompt text
  const query = item.prompt || item.query || item.question || item.searchQuery || '';

  // Extract cited URLs
  let citedUrls: string[] = [];
  const sources =
    item.cited_urls ||
    item.citations ||
    item.sources ||
    item.citedUrls ||
    item.urls ||
    item.links ||
    [];
  if (Array.isArray(sources)) {
    citedUrls = sources.map((s: any) => {
      if (typeof s === 'string') return s;
      if (s && typeof s === 'object') return s.url || s.link || s.href || '';
      return '';
    }).filter(Boolean);
  }

  // Brand mention detection
  const cleanBrand = brandName.trim().toLowerCase();
  const explicitMention =
    item.brand_mentioned ??
    item.brandMentioned ??
    item.is_mentioned ??
    item.mentioned ??
    item.cited ??
    null;

  let brandMentioned = false;
  if (explicitMention !== null && explicitMention !== undefined) {
    brandMentioned = Boolean(explicitMention);
  } else {
    // Fallback: check if brand name or domain is mentioned in snippet/answer
    const textToCheck = `${item.snippet || ''} ${item.answer || ''} ${item.full_answer || ''} ${item.response || ''}`.toLowerCase();
    brandMentioned = cleanBrand ? textToCheck.includes(cleanBrand) : false;
  }

  // Citation detection
  const explicitCited =
    item.cited ??
    item.is_cited ??
    item.brand_cited ??
    item.isCited ??
    null;

  let isCited = false;
  if (explicitCited !== null && explicitCited !== undefined) {
    isCited = Boolean(explicitCited);
  } else if (brandDomains.length > 0) {
    isCited = citedUrls.some((u) => brandDomains.some((d) => u.toLowerCase().includes(d)));
  } else {
    isCited = brandMentioned;
  }

  // Sentiment
  const sentiment =
    item.sentiment ??
    item.brand_sentiment ??
    item.brandSentiment ??
    (brandMentioned ? 'positive' : 'neutral');

  // AI Response snippet / full answer
  const responseSnippet =
    item.snippet ??
    item.ai_response_summary ??
    item.mention_context ??
    item.answer ??
    item.full_answer ??
    item.ai_response ??
    item.response ??
    item.responseSnippet ??
    item.content ??
    item.text ??
    item.output ??
    '';

  // Position / Rank
  const rawPosScore =
    item.position ??
    item.rank ??
    item.mention_position ??
    item.mention_position_score ??
    item.position_score ??
    item.brandPosition ??
    item.positionEstimate ??
    null;

  let position = 'Uncited';

  if (rawPosScore !== undefined && rawPosScore !== null && rawPosScore !== '') {
    if (typeof rawPosScore === 'number') {
      position = `#${rawPosScore} Position`;
    } else {
      position = String(rawPosScore);
    }
  } else if (!brandMentioned && !isCited) {
    position = 'Uncited';
  } else {
    // Check index in cited source URLs
    const urlIdx = brandDomains.length > 0
      ? citedUrls.findIndex((u) => brandDomains.some((d) => u.toLowerCase().includes(d)))
      : citedUrls.findIndex((u) => u.toLowerCase().includes(cleanBrand));

    if (urlIdx === 0) {
      position = '#1 Position';
    } else if (urlIdx > 0 && urlIdx < 3) {
      position = `Top 3 (#${urlIdx + 1})`;
    } else if (urlIdx >= 3) {
      position = `Top 5 (#${urlIdx + 1})`;
    } else {
      const snippetLower = String(responseSnippet).toLowerCase();
      const mentionIdx = snippetLower.indexOf(cleanBrand);
      if (mentionIdx >= 0 && mentionIdx < 150) {
        position = '#1 Mention';
      } else if (mentionIdx >= 150 && mentionIdx < 400) {
        position = 'Top 3 Mention';
      } else if (mentionIdx >= 0) {
        position = 'Cited in AI response';
      } else {
        position = isCited ? 'Cited' : 'Uncited';
      }
    }
  }

  // Competitor mentions
  let competitorsMentioned: string[] = [];
  const comps =
    item.competitor_mentions ??
    item.competitors_mentioned ??
    item.competitorsMentioned ??
    item.competitorsFound ??
    item.competitors ??
    [];
  if (Array.isArray(comps)) {
    competitorsMentioned = comps.map((c: any) => (typeof c === 'string' ? c : c.name || c.brand || '')).filter(Boolean);
  }

  // Metrics
  const aiSearchVolume = item.ai_search_volume ?? item.monthly_searches ?? item.search_volume ?? undefined;
  const shareOfVoice = item.brand_share_of_voice ?? item.shareOfVoice ?? item.share_of_voice ?? undefined;
  const visibilityScore = item.visibility_score ?? item.visibilityScore ?? item.score ?? undefined;

  return {
    query,
    platform,
    brandMentioned: Boolean(brandMentioned),
    position: String(position),
    sentiment: String(sentiment),
    responseSnippet: String(responseSnippet).slice(0, 1000),
    citedUrls,
    competitorsMentioned,
    visibilityScore,
    shareOfVoice,
    aiSearchVolume,
    rawData: item,
  };
}
