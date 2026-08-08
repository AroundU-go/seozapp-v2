export interface ExaSearchResultItem {
  id: string;
  url: string;
  title: string;
  score?: number;
  publishedDate?: string;
  author?: string;
  text?: string;
  highlights?: string[];
  snippet?: string;
}

export interface ExaSearchResponse {
  success: boolean;
  results: ExaSearchResultItem[];
  error?: string;
}

export class ExaClient {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = process.env.EXA_API_KEY || '';
    this.baseUrl = 'https://api.exa.ai';
  }

  async search(
    query: string,
    numResults: number = 25,
    type: 'neural' | 'keyword' = 'neural'
  ): Promise<ExaSearchResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
        },
        body: JSON.stringify({
          query,
          numResults,
          type,
          contents: {
            text: { maxCharacters: 1500 },
            highlights: { numSentences: 3 },
          },
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Exa API error [${response.status}]: ${errText}`);
      }

      const data = await response.json();
      const rawResults = Array.isArray(data.results) ? data.results : [];

      const normalized: ExaSearchResultItem[] = rawResults.map((item: any) => ({
        id: item.id || `exa_${Math.random().toString(36).substring(2, 8)}`,
        url: item.url || '',
        title: item.title || item.url || 'Web Source',
        score: typeof item.score === 'number' ? Math.round(item.score * 100) : 85,
        publishedDate: item.publishedDate ? new Date(item.publishedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recently',
        author: item.author || 'Editorial Team',
        text: item.text || '',
        highlights: Array.isArray(item.highlights) && item.highlights.length > 0 ? item.highlights : [item.text?.slice(0, 250) || ''],
        snippet: (Array.isArray(item.highlights) && item.highlights[0]) || item.text?.slice(0, 250) || '',
      }));

      return {
        success: true,
        results: normalized,
      };
    } catch (err: any) {
      console.warn(`Exa search warning for query "${query}":`, err.message);
      return {
        success: false,
        results: [],
        error: err.message,
      };
    }
  }

  async findBrandMentions(brandName: string, domain?: string): Promise<ExaSearchResponse> {
    const cleanBrand = brandName.trim();
    const cleanDomain = domain ? domain.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0] : '';
    
    // Primary & secondary queries to discover max coverage
    const primaryQuery = cleanDomain ? `"${cleanBrand}" OR "${cleanDomain}"` : `"${cleanBrand}"`;
    const secondaryQuery = `"${cleanBrand}" review OR "${cleanBrand}" software OR "${cleanBrand}" comparison`;

    try {
      const [res1, res2] = await Promise.all([
        this.search(primaryQuery, 20, 'neural'),
        this.search(secondaryQuery, 15, 'neural'),
      ]);

      const map = new Map<string, ExaSearchResultItem>();
      [...(res1.results || []), ...(res2.results || [])].forEach((item) => {
        if (item.url && !map.has(item.url)) {
          map.set(item.url, item);
        }
      });

      return {
        success: true,
        results: Array.from(map.values()),
      };
    } catch {
      return this.search(primaryQuery, 25, 'neural');
    }
  }
}

export const exaClient = new ExaClient();
