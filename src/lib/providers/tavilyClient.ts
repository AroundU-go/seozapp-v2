export interface TavilySearchResultItem {
  title: string;
  url: string;
  snippet: string;
  score?: number;
}

export interface TavilySearchResponse {
  success: boolean;
  results: TavilySearchResultItem[];
  error?: string;
}

export class TavilyClient {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = process.env.TAVILY_API_KEY || '';
    this.baseUrl = 'https://api.tavily.com';
  }

  async search(query: string, limit: number = 8): Promise<TavilySearchResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          api_key: this.apiKey,
          query,
          max_results: limit,
          search_depth: 'basic',
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Tavily API error [${response.status}]: ${errText}`);
      }

      const data = await response.json();
      const rawResults = Array.isArray(data.results) ? data.results : [];

      const normalized: TavilySearchResultItem[] = rawResults.map((item: any) => ({
        title: item.title || '',
        url: item.url || '',
        snippet: item.content || item.snippet || '',
        score: item.score,
      }));

      return {
        success: true,
        results: normalized,
      };
    } catch (err: any) {
      console.warn(`Tavily search warning for query "${query}":`, err.message);
      return {
        success: false,
        results: [],
        error: err.message,
      };
    }
  }
}

export const tavilyClient = new TavilyClient();
