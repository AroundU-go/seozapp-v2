import { ApifyClient } from 'apify-client';

// ── Constants ──────────────────────────────────────────────────────────
const ACTOR_ID = 'K9nkp1RHB33aYVBtm';

// Provider name mapping: frontend engine IDs → Apify actor provider strings
const PROVIDER_MAP: Record<string, string> = {
  chatgpt: 'chatgpt',
  perplexity: 'perplexity',
  gemini: 'gemini',
  ai_overview: 'google',
  google: 'google',
  claude: 'claude',
};

// ── Types ──────────────────────────────────────────────────────────────
export interface ApifyLlmRunResult {
  engineId: string;
  brandMentioned: boolean;
  competitorsMentioned: string[];
  citedSources: { url: string; title: string }[];
  rawAnswer: string;
  positionEstimate: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  status: 'completed' | 'failed';
  error?: string;
  apifyRunId?: string;
}

// ── Helpers ────────────────────────────────────────────────────────────

/** Check if a URL or text block contains/matches a given domain or brand name */
function brandMatchesText(text: string, brand: string): boolean {
  if (!text || !brand) return false;
  const cleanBrand = brand.trim().toLowerCase();
  const lowerText = text.toLowerCase();

  // Direct text mention check
  if (lowerText.includes(cleanBrand)) return true;

  // Try URL hostname matching
  try {
    const testUrl = text.startsWith('http') ? text : `https://${text}`;
    const hostname = new URL(testUrl).hostname.toLowerCase().replace(/^www\./, '');
    return hostname === cleanBrand || hostname.endsWith(`.${cleanBrand}`) || hostname.includes(cleanBrand);
  } catch {
    return false;
  }
}

// ── Main Function ──────────────────────────────────────────────────────

/**
 * Run an Apify LLM actor for a single prompt against a single AI provider.
 * Follows the exact API call format from: https://apify.com/K9nkp1RHB33aYVBtm
 *
 * Input format:
 *   { prompts: ["..."], provider: "perplexity", screenshots: false, captureDom: false }
 *
 * Returns parsed results with brand mention detection, source extraction, and sentiment.
 */
export async function runApifyLlmPrompt(
  provider: string,
  prompt: string,
  brandName: string,
  competitors: string[] = []
): Promise<ApifyLlmRunResult> {
  const token = process.env.APIFY_API_KEY || '';
  if (!token) {
    throw new Error('APIFY_API_KEY is missing in environment variables');
  }

  // Initialize the ApifyClient with API token
  const client = new ApifyClient({ token });

  // Normalize provider name for the actor
  const normalizedProvider = PROVIDER_MAP[provider.toLowerCase()] || provider.toLowerCase();

  // Prepare Actor input — exact format from the API docs
  const input = {
    prompts: [prompt],
    provider: normalizedProvider,
    screenshots: false,
    captureDom: false,
  };

  try {
    // Run the Actor and wait for it to finish
    const run = await client.actor(ACTOR_ID).call(input);

    // Fetch Actor results from the run's dataset
    const { items } = await client.dataset(run.defaultDatasetId).listItems();

    // ── Parse the response items ───────────────────────────────────────
    let rawAnswer = '';
    const citedSources: { url: string; title: string }[] = [];

    if (Array.isArray(items) && items.length > 0) {
      for (const item of items) {
        // Extract the text answer (actor may use different field names)
        const textContent =
          item.answer ||
          item.response ||
          item.content ||
          item.output ||
          item.text ||
          (typeof item === 'string' ? item : '');

        if (textContent) {
          rawAnswer += (rawAnswer ? '\n\n' : '') + String(textContent);
        }

        // Extract cited sources/URLs
        const sources = item.sources || item.citations || item.urls || item.links || [];
        if (Array.isArray(sources)) {
          for (const s of sources) {
            if (typeof s === 'string') {
              citedSources.push({ url: s, title: s });
            } else if (s && typeof s === 'object' && s.url) {
              citedSources.push({ url: s.url, title: s.title || s.name || s.url });
            }
          }
        }
      }
    }

    if (!rawAnswer) {
      rawAnswer = `AI engine "${normalizedProvider}" returned ${items.length} item(s) but no text content was found.`;
    }

    // Deduplicate sources by URL
    const uniqueSources = citedSources.filter(
      (s, i, self) => i === self.findIndex((t) => t.url === s.url)
    );

    // ── Brand mention detection ────────────────────────────────────────
    const cleanBrand = brandName.trim().toLowerCase();
    const brandMentioned =
      uniqueSources.some((s) => brandMatchesText(s.url, cleanBrand)) ||
      brandMatchesText(rawAnswer, cleanBrand);

    // ── Competitor mention detection ───────────────────────────────────
    const competitorsMentioned: string[] = [];
    competitors.forEach((comp) => {
      const compClean = comp.trim().toLowerCase();
      if (
        uniqueSources.some((s) => brandMatchesText(s.url, compClean)) ||
        brandMatchesText(rawAnswer, compClean)
      ) {
        competitorsMentioned.push(comp);
      }
    });

    // ── Position estimate ──────────────────────────────────────────────
    let positionEstimate = 'Uncited';
    if (brandMentioned) {
      const idx = uniqueSources.findIndex((s) => brandMatchesText(s.url, cleanBrand));
      if (idx === 0) positionEstimate = '#1 position';
      else if (idx > 0 && idx < 3) positionEstimate = `Top 3 (#${idx + 1})`;
      else if (idx >= 3) positionEstimate = `Position #${idx + 1}`;
      else positionEstimate = 'Mentioned in answer';
    }

    // ── Sentiment analysis (simple heuristic) ──────────────────────────
    let sentiment: 'positive' | 'neutral' | 'negative' = 'neutral';
    if (brandMentioned) {
      const lower = rawAnswer.toLowerCase();
      const positiveWords = ['best', 'top', 'excellent', 'great', 'recommended', 'leading', 'powerful', 'popular', 'outstanding', 'trusted'];
      const negativeWords = ['worst', 'avoid', 'poor', 'bad', 'weak', 'lacking', 'disappointing', 'limited'];
      const posCount = positiveWords.filter((w) => lower.includes(w)).length;
      const negCount = negativeWords.filter((w) => lower.includes(w)).length;
      if (posCount > negCount) sentiment = 'positive';
      else if (negCount > posCount) sentiment = 'negative';
    }

    return {
      engineId: provider.toLowerCase(),
      brandMentioned,
      competitorsMentioned,
      citedSources: uniqueSources,
      rawAnswer,
      positionEstimate,
      sentiment,
      status: 'completed',
      apifyRunId: run.id,
    };
  } catch (err: any) {
    console.error(`[Apify] Actor call failed for provider="${normalizedProvider}":`, err.message);
    throw err;
  }
}
