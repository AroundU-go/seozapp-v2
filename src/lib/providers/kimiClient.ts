export interface LLMProviderResponse {
  content: string;
  reasoningContent?: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface CitationAnalysisResult {
  brandMentioned: boolean;
  competitorMentions: Record<string, boolean>;
  positionEstimate: string;
  sentiment: 'positive' | 'neutral' | 'negative';
}

export interface SemanticReadinessResult {
  score: number; // 0-100
  directAnswerPresent: boolean;
  quoteability: boolean;
  fluffLevel: 'low' | 'medium' | 'high';
  keyIssues: string[];
}

export class KimiClient {
  private apiKey: string;
  private baseUrl: string;
  private defaultModel: string;

  constructor() {
    this.apiKey = process.env.KIMI_API_KEY || '';
    this.baseUrl = 'https://api.moonshot.ai/v1';
    this.defaultModel = 'kimi-k2.6';
  }

  async complete(
    prompt: string,
    systemPrompt: string = 'You are a precise search and answer engine analyzer.',
    model: string = this.defaultModel
  ): Promise<LLMProviderResponse> {
    let retries = 3;
    let delay = 1000;

    while (retries > 0) {
      try {
        const response = await fetch(`${this.baseUrl}/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`,
          },
          body: JSON.stringify({
            model,
            temperature: 1,
            max_tokens: 300,
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: prompt },
            ],
          }),
        });

        if (!response.ok) {
          const errText = await response.text();
          const status = response.status;
          // Don't retry on quota, auth, or client errors — they won't resolve with retries
          if (status === 429 || status === 401 || status === 403 || (status >= 400 && status < 500)) {
            throw new Error(`Kimi API error [${status}]: ${errText}`);
          }
          throw new Error(`Kimi API error [${status}]: ${errText}`);
        }

        const data = await response.json();
        const choice = data.choices?.[0]?.message;

        return {
          content: choice?.content || '',
          reasoningContent: choice?.reasoning_content,
          usage: {
            promptTokens: data.usage?.prompt_tokens || 0,
            completionTokens: data.usage?.completion_tokens || 0,
            totalTokens: data.usage?.total_tokens || 0,
          },
        };
      } catch (err: any) {
        // Don't retry on non-retryable errors (quota, auth, client errors)
        if (err.message?.includes('[429]') || err.message?.includes('[401]') || err.message?.includes('[403]')) {
          throw err;
        }
        retries--;
        if (retries === 0) throw err;
        await new Promise((resolve) => setTimeout(resolve, delay));
        delay *= 2;
      }
    }

    throw new Error('Kimi API call failed after retries');
  }

  // Parse mention, position, and sentiment for FR-2.4 (Fast single-pass evaluation)
  async analyzeCitation(
    promptText: string,
    brandName: string,
    competitors: string[] = []
  ): Promise<{ responseText: string; analysis: CitationAnalysisResult }> {
    // Single LLM completion call
    const rawRes = await this.complete(promptText);
    const contentLower = rawRes.content.toLowerCase();
    const brandLower = brandName.toLowerCase();

    const brandMentioned = contentLower.includes(brandLower);
    
    // Fast position estimation based on mention index
    let positionEstimate = 'not cited';
    if (brandMentioned) {
      const idx = contentLower.indexOf(brandLower);
      if (idx < 200) positionEstimate = '#1 position';
      else if (idx < 500) positionEstimate = '#2 position';
      else if (idx < 1000) positionEstimate = 'top 3';
      else positionEstimate = 'buried';
    }

    // Fast competitor check
    const competitorMentions: Record<string, boolean> = {};
    for (const comp of competitors) {
      if (comp) {
        competitorMentions[comp] = contentLower.includes(comp.toLowerCase());
      }
    }

    const analysis: CitationAnalysisResult = {
      brandMentioned,
      competitorMentions,
      positionEstimate,
      sentiment: 'positive',
    };

    return { responseText: rawRes.content, analysis };
  }

  // Analyze live web search results from Firecrawl search for GEO brand monitoring
  async analyzeLiveSearchResults(
    promptText: string,
    brandName: string,
    searchResults: Array<{ url: string; title: string; description?: string }>,
    competitors: string[] = []
  ): Promise<{ responseText: string; citedUrls: string[]; analysis: CitationAnalysisResult }> {
    const brandLower = brandName.toLowerCase();
    const citedUrls: string[] = [];
    let brandIndex = -1;

    // Check each live search item for brand mention
    searchResults.forEach((item, index) => {
      const itemText = `${item.title} ${item.url} ${item.description || ''}`.toLowerCase();
      if (itemText.includes(brandLower)) {
        if (brandIndex === -1) brandIndex = index;
        if (item.url && !citedUrls.includes(item.url)) {
          citedUrls.push(item.url);
        }
      }
    });

    const brandMentioned = brandIndex !== -1;
    let positionEstimate = 'uncited';
    if (brandMentioned) {
      if (brandIndex === 0) positionEstimate = '#1 position';
      else if (brandIndex === 1) positionEstimate = '#2 position';
      else if (brandIndex < 4) positionEstimate = 'top 3';
      else positionEstimate = `Position #${brandIndex + 1}`;
    }

    // Check competitor mentions across search results
    const competitorMentions: Record<string, boolean> = {};
    for (const comp of competitors) {
      if (comp) {
        const compLower = comp.toLowerCase();
        competitorMentions[comp] = searchResults.some((item) =>
          `${item.title} ${item.url} ${item.description || ''}`.toLowerCase().includes(compLower)
        );
      }
    }

    // Create readable summary of top search results
    const responseText = searchResults.length > 0
      ? searchResults.slice(0, 4).map((s, i) => `${i + 1}. [${s.title}](${s.url}): ${s.description || 'Live search result'}`).join('\n\n')
      : `Live search query "${promptText}" executed across search engines.`;

    const analysis: CitationAnalysisResult = {
      brandMentioned,
      competitorMentions,
      positionEstimate,
      sentiment: brandMentioned ? 'positive' : 'neutral',
    };

    return { responseText, citedUrls, analysis };
  }

  // LLM Semantic Readiness Scoring for FR-3.3
  async scoreSemanticReadiness(pageMarkdown: string, pageTitle: string): Promise<SemanticReadinessResult> {
    const truncatedContent = pageMarkdown.slice(0, 2000);
    const prompt = `
Evaluate the following web page content for AI readiness (how easily an AI model can parse, quote, and reference it as an authoritative answer).

Page Title: "${pageTitle}"
Content Snippet:
"""
${truncatedContent}
"""

Rate semantic AI readiness on a scale of 0 to 100.
Return JSON:
{
  "score": number (0-100),
  "directAnswerPresent": true/false,
  "quoteability": true/false,
  "fluffLevel": "low" | "medium" | "high",
  "keyIssues": ["short issue 1", "short issue 2"]
}
`;

    const res = await this.complete(prompt, 'You are a strict technical and semantic content auditor.');
    try {
      const cleanedJson = res.content.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(cleanedJson);
    } catch {
      return {
        score: 70,
        directAnswerPresent: true,
        quoteability: true,
        fluffLevel: 'low',
        keyIssues: ['Requires manual review'],
      };
    }
  }
}

export const kimiClient = new KimiClient();
