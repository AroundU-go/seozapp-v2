import { ApifyClient } from 'apify-client';

const ACTOR_ID = 'pNYuPdLEYhbx0NAK9';

export interface KeywordGapResult {
  keyword: string;
  volume: number;
  difficulty: number;
  intent: string;
  targetPosition: number | null;
  comparePosition: number | null;
  trafficValue: number;
  cpc: number;
  url?: string;
  competitorUrl?: string;
}

export interface KeywordGapInput {
  targetDomain: string;
  compareToDomain: string;
  location?: string;
  language?: string;
}

/**
 * Runs the Apify Competitor Keyword Research actor in 'gap' mode.
 * Returns up to 10 keyword gap results comparing target vs own domain.
 */
export async function runKeywordGapAnalysis(
  params: KeywordGapInput
): Promise<KeywordGapResult[]> {
  const token = process.env.APIFY_API_KEY || '';
  if (!token) {
    throw new Error('APIFY_API_KEY is missing in environment variables');
  }

  const client = new ApifyClient({ token });

  const input = {
    target: params.targetDomain.replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/.*$/, ''),
    compareToDomain: params.compareToDomain.replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/.*$/, ''),
    mode: 'gap',
    maxKeywords: 10,
    location: params.location || 'United States',
    language: params.language || 'English',
    minVolume: 10,
    maxKeywordDifficulty: 100,
    positionFrom: 1,
    positionTo: 10,
  };

  try {
    const run = await client.actor(ACTOR_ID).call(input, {
      timeout: 120,
      memory: 256,
    });

    const { items } = await client.dataset(run.defaultDatasetId).listItems();

    if (!items || items.length === 0) {
      console.warn('[ApifyKeyword] No keyword items returned from actor run');
      return [];
    }

    return items.map((item: any) => ({
      keyword: item.keyword || item.Keyword || '',
      volume: Number(item.volume ?? item.Volume ?? item.search_volume ?? 0),
      difficulty: Number(item.difficulty ?? item.Difficulty ?? item.keyword_difficulty ?? 0),
      intent: item.intent || item.Intent || item.search_intent || 'informational',
      targetPosition: item.position != null ? Number(item.position) : (item.target_position != null ? Number(item.target_position) : null),
      comparePosition: item.compare_position != null ? Number(item.compare_position) : (item.your_position != null ? Number(item.your_position) : null),
      trafficValue: Number(item.traffic_value ?? item.trafficValue ?? 0),
      cpc: Number(item.cpc ?? item.CPC ?? 0),
      url: item.url || item.target_url || '',
      competitorUrl: item.competitor_url || item.compare_url || '',
    }));
  } catch (err: any) {
    console.error(`[ApifyKeyword] Actor call failed:`, err.message);
    throw new Error(`Keyword gap analysis failed: ${err.message}`);
  }
}
