import { tavilyClient, TavilySearchResultItem } from './tavilyClient';
import { firecrawlClient } from './firecrawlClient';
import { kimiClient } from './kimiClient';

export interface CitationProxyResult {
  brandMentioned: boolean;
  competitorsMentioned: string[];
  citedSources: { url: string; title: string }[];
  rawAnswer: string;
  positionEstimate: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  status: 'completed' | 'failed';
  error?: string;
}

export function domainMatches(url: string, targetDomain: string): boolean {
  if (!url || !targetDomain) return false;
  try {
    const cleanTarget = targetDomain.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
    const hostname = new URL(url.startsWith('http') ? url : `https://${url}`).hostname.toLowerCase().replace(/^www\./, '');
    return hostname === cleanTarget || hostname.endsWith(`.${cleanTarget}`);
  } catch {
    const cleanTarget = targetDomain.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
    return url.toLowerCase().includes(cleanTarget);
  }
}

export function extractCitedSources(
  answer: string,
  sources: TavilySearchResultItem[]
): TavilySearchResultItem[] {
  const citedIndices = new Set<number>();
  const matches = answer.matchAll(/\[(\d+)\]/g);
  for (const match of matches) {
    citedIndices.add(parseInt(match[1], 10));
  }
  return sources.filter((_, i) => citedIndices.has(i + 1));
}

export async function checkCitationProxy(
  trackedPrompt: string,
  siteDomain: string,
  competitorDomains: string[] = []
): Promise<CitationProxyResult> {
  let searchSources: TavilySearchResultItem[] = [];

  // Step 1: Search call (Tavily primary, Firecrawl search fallback if Tavily returns < 3 results)
  try {
    const tavilyRes = await tavilyClient.search(trackedPrompt, 8);
    if (tavilyRes.success && tavilyRes.results.length >= 3) {
      searchSources = tavilyRes.results;
    } else {
      console.log('Tavily returned < 3 results, attempting Firecrawl search fallback...');
      const fcRes = await firecrawlClient.search(trackedPrompt, 8);
      if (fcRes.success && fcRes.data && fcRes.data.length > 0) {
        searchSources = fcRes.data.map((item) => ({
          title: item.title || item.url,
          url: item.url,
          snippet: item.description || item.markdown?.slice(0, 300) || '',
        }));
      }
    }
  } catch (searchErr: any) {
    console.warn('Search step failed in checkCitationProxy:', searchErr.message);
  }

  // If search completely fails to find sources, return failed status per PRD
  if (searchSources.length === 0) {
    return {
      brandMentioned: false,
      competitorsMentioned: [],
      citedSources: [],
      rawAnswer: 'Search query returned no sources.',
      positionEstimate: 'Uncited',
      sentiment: 'neutral',
      status: 'failed',
      error: 'No search sources retrieved',
    };
  }

  // Step 2: Answer generation step with strict Kimi prompt
  const sourcesFormatted = searchSources
    .map((s, i) => `[${i + 1}] ${s.title} — ${s.url}\n${s.snippet}`)
    .join('\n\n');

  const systemPrompt = `You are answering a user's question using ONLY the sources provided below. Do not use any outside knowledge. If the sources don't contain enough information to answer, say so.`;

  const prompt = `
Question: ${trackedPrompt}

Sources:
${sourcesFormatted}

Instructions:
- Write a natural, direct answer to the question, 3-5 sentences.
- Every factual claim must be followed by the bracket number of the source it came from, e.g. "X is a good option for this [2]."
- Only cite sources that you actually used to support a specific claim — do not cite a source just because it appeared in the list.
- Do not fabricate sources or claims not supported by the text above.
`;

  try {
    const llmRes = await kimiClient.complete(prompt, systemPrompt);
    const rawAnswer = llmRes.content || '';

    // Step 3: Parse step — extract sources actually cited in bracket numbers
    let citedSources = extractCitedSources(rawAnswer, searchSources);
    
    // Fallback: If answer generated without bracket numbers, check if sources are mentioned by URL/title
    if (citedSources.length === 0 && rawAnswer.length > 30) {
      citedSources = searchSources.filter((s) =>
        domainMatches(s.url, siteDomain) || rawAnswer.toLowerCase().includes(s.title.toLowerCase())
      );
    }

    // Step 4: Match step — check if siteDomain or competitors appear among cited sources
    const brandMentioned = citedSources.some((s) => domainMatches(s.url, siteDomain)) || domainMatches(rawAnswer, siteDomain);

    const competitorsMentioned: string[] = [];
    competitorDomains.forEach((compDomain) => {
      const matchFound = citedSources.some((s) => domainMatches(s.url, compDomain));
      if (matchFound) {
        competitorsMentioned.push(compDomain);
      }
    });

    // Estimate position placement
    let positionEstimate = 'Uncited';
    if (brandMentioned) {
      const brandIndex = citedSources.findIndex((s) => domainMatches(s.url, siteDomain));
      if (brandIndex === 0) {
        positionEstimate = '#1 position';
      } else if (brandIndex > 0 && brandIndex < 3) {
        positionEstimate = `Top 3 (#${brandIndex + 1})`;
      } else {
        positionEstimate = 'Cited in sources';
      }
    }

    return {
      brandMentioned,
      competitorsMentioned,
      citedSources: citedSources.map((s) => ({ url: s.url, title: s.title })),
      rawAnswer,
      positionEstimate,
      sentiment: brandMentioned ? 'positive' : 'neutral',
      status: 'completed',
    };
  } catch (llmErr: any) {
    console.error('Kimi answer generation error in checkCitationProxy:', llmErr.message);
    return {
      brandMentioned: false,
      competitorsMentioned: [],
      citedSources: [],
      rawAnswer: `LLM generation failed: ${llmErr.message}`,
      positionEstimate: 'Uncited',
      sentiment: 'neutral',
      status: 'failed',
      error: llmErr.message,
    };
  }
}
