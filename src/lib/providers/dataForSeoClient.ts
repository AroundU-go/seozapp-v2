import { checkCitationProxy, CitationProxyResult, domainMatches } from './citationProxy';

const AUTH_HEADER = process.env.DATAFORSEO_AUTH_HEADER || '';

export interface DataForSeoLlmResult {
  engineId: string;
  modelName: string;
  brandMentioned: boolean;
  competitorsMentioned: string[];
  citedSources: { url: string; title: string }[];
  rawAnswer: string;
  positionEstimate: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  status: 'completed' | 'failed';
  error?: string;
  cost?: number;
}

const ENGINE_CONFIG: Record<string, { se: string; model: string }> = {
  chatgpt: { se: 'chat_gpt', model: 'gpt-4.1-mini' },
  claude: { se: 'claude', model: 'claude-sonnet-4-6' },
  gemini: { se: 'gemini', model: 'gemini-3.5-flash' },
  perplexity: { se: 'perplexity', model: 'sonar' },
  grok: { se: 'perplexity', model: 'sonar-pro' },
};

export async function queryDataForSeoLlm(
  engineId: string,
  prompt: string,
  brandName: string,
  region: string = 'US',
  competitors: string[] = []
): Promise<DataForSeoLlmResult> {
  const config = ENGINE_CONFIG[engineId] || ENGINE_CONFIG.chatgpt;
  const url = `https://api.dataforseo.com/v3/ai_optimization/${config.se}/llm_responses/live`;

  try {
    const payload = [
      {
        user_prompt: prompt,
        model_name: config.model,
        web_search: true,
        web_search_country_iso_code: region.toUpperCase(),
      },
    ];

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: AUTH_HEADER,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      console.warn(`[DataForSEO] HTTP ${response.status} for ${engineId}, using fallback proxy`);
      return await fallbackProxy(engineId, prompt, brandName, competitors);
    }

    const rawText = await response.text();
    let json: any;
    try {
      json = JSON.parse(rawText);
    } catch {
      console.warn(`[DataForSEO] Non-JSON response for ${engineId} ("${rawText.slice(0, 100)}"), using fallback proxy`);
      return await fallbackProxy(engineId, prompt, brandName, competitors);
    }
    const task = json.tasks?.[0];

    if (!task || task.status_code !== 20000 || !task.result?.[0]) {
      const msg = task?.status_message || json.status_message || 'API call failed';
      console.warn(`[DataForSEO] ${engineId} failed (${task?.status_code || json.status_code}): ${msg}. Using fallback proxy.`);
      return await fallbackProxy(engineId, prompt, brandName, competitors);
    }

    const resItem = task.result[0];
    let answerText = '';
    const citedSources: { url: string; title: string }[] = [];

    if (Array.isArray(resItem.items)) {
      for (const item of resItem.items) {
        if (Array.isArray(item.sections)) {
          for (const sec of item.sections) {
            if (sec.text) {
              answerText += (answerText ? '\n' : '') + sec.text;
            }
            if (Array.isArray(sec.annotations)) {
              for (const ann of sec.annotations) {
                if (ann.url) {
                  citedSources.push({
                    url: ann.url,
                    title: ann.title || ann.url,
                  });
                }
              }
            }
          }
        }
      }
    }

    // Deduplicate cited sources by URL
    const uniqueSources = citedSources.filter(
      (s, i, self) => i === self.findIndex((t) => t.url === s.url)
    );

    // Evaluate brand mention
    const brandMentioned =
      uniqueSources.some((s) => domainMatches(s.url, brandName)) ||
      domainMatches(answerText, brandName);

    // Evaluate competitor mentions
    const competitorsMentioned: string[] = [];
    competitors.forEach((comp) => {
      if (
        uniqueSources.some((s) => domainMatches(s.url, comp)) ||
        domainMatches(answerText, comp)
      ) {
        competitorsMentioned.push(comp);
      }
    });

    // Position estimate
    let positionEstimate = 'Uncited';
    if (brandMentioned) {
      const idx = uniqueSources.findIndex((s) => domainMatches(s.url, brandName));
      if (idx === 0) positionEstimate = '#1 position';
      else if (idx > 0 && idx < 3) positionEstimate = `Top 3 (#${idx + 1})`;
      else positionEstimate = 'Cited in sources';
    }

    return {
      engineId,
      modelName: resItem.model_name || config.model,
      brandMentioned,
      competitorsMentioned,
      citedSources: uniqueSources,
      rawAnswer: answerText || 'Response received.',
      positionEstimate,
      sentiment: brandMentioned ? 'positive' : 'neutral',
      status: 'completed',
      cost: task.cost || 0,
    };
  } catch (err: any) {
    console.error(`[DataForSEO] Error querying ${engineId}:`, err.message);
    return await fallbackProxy(engineId, prompt, brandName, competitors);
  }
}

async function fallbackProxy(
  engineId: string,
  prompt: string,
  brandName: string,
  competitors: string[]
): Promise<DataForSeoLlmResult> {
  const proxyRes: CitationProxyResult = await checkCitationProxy(prompt, brandName, competitors);
  return {
    engineId,
    modelName: `${engineId}-proxy`,
    brandMentioned: proxyRes.brandMentioned,
    competitorsMentioned: proxyRes.competitorsMentioned,
    citedSources: proxyRes.citedSources,
    rawAnswer: proxyRes.rawAnswer,
    positionEstimate: proxyRes.positionEstimate,
    sentiment: proxyRes.sentiment,
    status: proxyRes.status,
    error: proxyRes.error,
  };
}
