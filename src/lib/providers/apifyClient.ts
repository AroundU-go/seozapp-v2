import { ApifyClient } from 'apify-client';

const APIFY_TOKEN = process.env.APIFY_API_KEY || '';
const ACTOR_ID = 'XY6nIlojvN5ySDhSk';

/**
 * Maps our internal engine IDs to the Apify actor's platform identifiers.
 */
const PLATFORM_MAP: Record<string, string> = {
  chatgpt: 'chatgpt',
  perplexity: 'perplexity',
  gemini: 'gemini',
  ai_overview: 'google_aio',
  google_aio: 'google_aio',
  claude: 'claude',
};

/**
 * Reverse map: actor platform ID → our internal engine ID.
 */
const REVERSE_PLATFORM_MAP: Record<string, string> = {
  chatgpt: 'chatgpt',
  perplexity: 'perplexity',
  gemini: 'gemini',
  google_aio: 'ai_overview',
  claude: 'claude',
};

/** A single per-query, per-platform result from the brand tracker. */
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
  rawData?: any;
}

/** Input params for the brand tracker actor call. */
export interface BrandTrackerInput {
  brandName: string;
  brandDomain?: string;
  queries: string[];
  platforms: string[];      // our internal engine IDs
  competitors?: string[];
  locationCode?: string;
  languageCode?: string;
}

/**
 * Runs the Apify AI Brand Tracker actor with all queries and platforms in a single call.
 * Returns a flat array of per-query, per-platform results.
 */
export async function runApifyBrandTracker(
  params: BrandTrackerInput
): Promise<BrandTrackerResult[]> {
  const token = APIFY_TOKEN || process.env.APIFY_API_KEY || '';
  if (!token) {
    throw new Error('APIFY_API_KEY is missing in environment variables');
  }

  const client = new ApifyClient({ token });

  // Convert our engine IDs to the actor's platform identifiers
  const actorPlatforms = params.platforms
    .map((p) => PLATFORM_MAP[p] || p)
    .filter((v, i, a) => a.indexOf(v) === i); // dedupe

  const input = {
    brandName: params.brandName,
    brandDomain: params.brandDomain || '',
    brandAliases: [] as string[],
    queries: params.queries,
    platforms: actorPlatforms,
    competitors: params.competitors || [],
    competitorDomains: [] as string[],
    locationCode: params.locationCode || '2840',
    languageCode: params.languageCode || 'en',
    includeAggregatedMetrics: false,
    enableQueryFanout: false,
    fanoutVariantsPerQuery: 4,
    responseFormat: 'detailed',
    demoMode: false,
  };

  try {
    const run = await client.actor(ACTOR_ID).call(input);
    const { items } = await client.dataset(run.defaultDatasetId).listItems();

    if (!Array.isArray(items) || items.length === 0) {
      console.warn('[Apify BrandTracker] No items returned from actor run');
      return [];
    }

    const results: BrandTrackerResult[] = [];

    for (const item of items) {
      // The detailed response format may have different structures.
      // We handle both flat items and nested per-query/per-platform items.

      // Case 1: Item has explicit query + platform fields (flat structure)
      if (item.query && item.platform) {
        results.push(parseResultItem(item, params.brandName));
        continue;
      }

      // Case 2: Item has queryResults array (nested structure)
      if (Array.isArray(item.queryResults)) {
        for (const qr of item.queryResults) {
          if (Array.isArray(qr.platformResults)) {
            for (const pr of qr.platformResults) {
              results.push(parseResultItem(
                { ...pr, query: qr.query || qr.prompt || item.query },
                params.brandName
              ));
            }
          } else {
            // Single platform result per query
            results.push(parseResultItem(
              { ...qr, query: qr.query || qr.prompt },
              params.brandName
            ));
          }
        }
        continue;
      }

      // Case 3: Item has results array (alternative nesting)
      if (Array.isArray(item.results)) {
        for (const r of item.results) {
          results.push(parseResultItem(r, params.brandName));
        }
        continue;
      }

      // Case 4: Item has platformResults directly (single query)
      if (Array.isArray(item.platformResults)) {
        for (const pr of item.platformResults) {
          results.push(parseResultItem(
            { ...pr, query: item.query || item.prompt || params.queries[0] || '' },
            params.brandName
          ));
        }
        continue;
      }

      // Fallback: treat the item itself as a result
      results.push(parseResultItem(item, params.brandName));
    }

    return results;
  } catch (err: any) {
    console.error(`[Apify BrandTracker] Actor call failed:`, err.message);
    throw err;
  }
}

/**
 * Parses a single result item from the actor's dataset into our standardized format.
 */
function parseResultItem(item: any, brandName: string): BrandTrackerResult {
  // Extract platform, converting back to our internal ID
  const rawPlatform = item.platform || item.engine || item.provider || item.source || 'unknown';
  const platform = REVERSE_PLATFORM_MAP[rawPlatform] || rawPlatform;

  // Extract query/prompt text
  const query = item.query || item.prompt || item.searchQuery || '';

  // Brand mention detection
  const brandMentioned =
    item.brandMentioned ??
    item.brand_mentioned ??
    item.isBrandMentioned ??
    item.mentioned ??
    item.cited ??
    false;

  // Position / rank
  const position =
    item.position ??
    item.rank ??
    item.brandPosition ??
    item.positionEstimate ??
    (brandMentioned ? 'Cited' : 'Uncited');

  // Sentiment
  const sentiment =
    item.sentiment ??
    item.brandSentiment ??
    (brandMentioned ? 'positive' : 'neutral');

  // Response snippet
  const responseSnippet =
    item.answer ??
    item.response ??
    item.responseSnippet ??
    item.content ??
    item.text ??
    item.output ??
    '';

  // Cited URLs
  let citedUrls: string[] = [];
  const sources = item.sources || item.citations || item.citedUrls || item.urls || item.links || [];
  if (Array.isArray(sources)) {
    citedUrls = sources.map((s: any) => {
      if (typeof s === 'string') return s;
      if (s && typeof s === 'object') return s.url || s.link || '';
      return '';
    }).filter(Boolean);
  }

  // Competitors mentioned
  let competitorsMentioned: string[] = [];
  const comps = item.competitorsMentioned || item.competitors_mentioned || item.competitorsFound || [];
  if (Array.isArray(comps)) {
    competitorsMentioned = comps.map((c: any) => (typeof c === 'string' ? c : c.name || '')).filter(Boolean);
  }

  // Visibility score
  const visibilityScore = item.visibilityScore ?? item.visibility_score ?? item.score ?? undefined;
  const shareOfVoice = item.shareOfVoice ?? item.share_of_voice ?? undefined;

  return {
    query,
    platform,
    brandMentioned: Boolean(brandMentioned),
    position: String(position),
    sentiment: String(sentiment),
    responseSnippet: String(responseSnippet).slice(0, 500),
    citedUrls,
    competitorsMentioned,
    visibilityScore,
    shareOfVoice,
    rawData: item,
  };
}
