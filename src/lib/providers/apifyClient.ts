import { ApifyClient } from 'apify-client';
import { domainMatches } from './citationProxy';

const APIFY_TOKEN = process.env.APIFY_API_KEY || '';
const ACTOR_ID = 'K9nkp1RHB33aYVBtm';

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

export async function runApifyLlmPrompt(
  provider: string,
  prompt: string,
  brandName: string,
  competitors: string[] = []
): Promise<ApifyLlmRunResult> {
  const token = APIFY_TOKEN || process.env.APIFY_API_KEY || '';
  if (!token) {
    throw new Error('APIFY_API_KEY is missing in environment variables');
  }

  const client = new ApifyClient({ token });

  const input = {
    prompts: [prompt],
    provider: provider.toLowerCase(),
    screenshots: false,
    captureDom: false,
  };

  try {
    const run = await client.actor(ACTOR_ID).call(input);
    const { items } = await client.dataset(run.defaultDatasetId).listItems();

    let rawAnswer = '';
    const citedSources: { url: string; title: string }[] = [];

    if (Array.isArray(items) && items.length > 0) {
      for (const item of items) {
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
      rawAnswer = `AI Search Engine executed for ${provider}. ${items.length} item(s) processed.`;
    }

    const uniqueSources = citedSources.filter(
      (s, i, self) => i === self.findIndex((t) => t.url === s.url)
    );

    const cleanBrand = brandName.trim().toLowerCase();
    const brandMentioned =
      uniqueSources.some((s) => domainMatches(s.url, cleanBrand)) ||
      domainMatches(rawAnswer, cleanBrand);

    const competitorsMentioned: string[] = [];
    competitors.forEach((comp) => {
      if (
        uniqueSources.some((s) => domainMatches(s.url, comp)) ||
        domainMatches(rawAnswer, comp)
      ) {
        competitorsMentioned.push(comp);
      }
    });

    let positionEstimate = 'Uncited';
    if (brandMentioned) {
      const idx = uniqueSources.findIndex((s) => domainMatches(s.url, cleanBrand));
      if (idx === 0) positionEstimate = '#1 position';
      else if (idx > 0 && idx < 3) positionEstimate = `Top 3 (#${idx + 1})`;
      else positionEstimate = 'Cited in sources';
    }

    return {
      engineId: provider.toLowerCase(),
      brandMentioned,
      competitorsMentioned,
      citedSources: uniqueSources,
      rawAnswer,
      positionEstimate,
      sentiment: brandMentioned ? 'positive' : 'neutral',
      status: 'completed',
      apifyRunId: run.id,
    };
  } catch (err: any) {
    console.error(`[Apify] Actor call failed for ${provider}:`, err.message);
    throw err;
  }
}
