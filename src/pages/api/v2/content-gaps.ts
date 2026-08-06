import type { NextApiRequest, NextApiResponse } from 'next';
import { tavilyClient } from '@/lib/providers/tavilyClient';
import { exaClient } from '@/lib/providers/exaClient';
import { firecrawlClient } from '@/lib/providers/firecrawlClient';
import { supabaseV2Admin, V2_TABLES } from '@/lib/supabaseV2';

export interface ContentGapItem {
  subtopic: string;
  importance: 'HIGH' | 'MEDIUM' | 'LOW';
  topRankingSources: string[];
  userCovered: boolean;
  recommendation: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const userEmail = (req.query.userEmail as string || '').toLowerCase().trim();
    const domain = (req.query.domain as string || '').toLowerCase().trim();
    try {
      let query = supabaseV2Admin.from(V2_TABLES.CONTENT_GAPS).select('*').order('created_at', { ascending: false }).limit(50);
      if (userEmail) {
        query = query.eq('user_email', userEmail);
      } else if (domain) {
        query = query.ilike('domain', `%${domain}%`);
      }
      const { data, error } = await query;
      if (error) throw error;
      return res.status(200).json({ success: true, records: data || [] });
    } catch (err: any) {
      console.warn('GET content-gaps error (returning empty):', err.message);
      return res.status(200).json({ success: true, records: [] });
    }
  }

  if (req.method === 'POST') {
    const { targetKeyword, userUrl, userEmail } = req.body;

    if (!targetKeyword || typeof targetKeyword !== 'string') {
      return res.status(400).json({ error: 'targetKeyword is required' });
    }

    try {
      const keyword = targetKeyword.trim();
      let cleanUrl = (userUrl || '').trim();

      // 1. Search top ranking web results via Tavily (fallback to Exa)
      let searchResults: Array<{ title: string; url: string; snippet: string }> = [];
      const tavilyRes = await tavilyClient.search(keyword, 6);

      if (tavilyRes.success && tavilyRes.results.length > 0) {
        searchResults = tavilyRes.results;
      } else {
        const exaRes = await exaClient.search(keyword, 6, 'neural');
        searchResults = exaRes.results.map((item) => ({
          title: item.title,
          url: item.url,
          snippet: item.snippet || item.text?.slice(0, 250) || '',
        }));
      }

      // 2. Extract content markdown of user page if provided
      let userMarkdown = '';
      if (cleanUrl) {
        if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
          cleanUrl = `https://${cleanUrl}`;
        }
        try {
          const scrape = await firecrawlClient.scrapeUrl(cleanUrl);
          userMarkdown = (scrape.data?.markdown || '').toLowerCase();
        } catch (sErr) {
          console.warn('Firecrawl userUrl scrape warning:', sErr);
        }
      }

      // 3. Extract key subtopics from top search snippets
      const candidateTopics = [
        { topic: 'Pricing & Plans Comparison', importance: 'HIGH' as const, keywords: ['pricing', 'cost', 'plans', 'tier', 'subscription'] },
        { topic: 'FAQ & Frequently Asked Questions', importance: 'HIGH' as const, keywords: ['faq', 'frequently asked', 'questions', 'answers'] },
        { topic: 'Technical Features & Specifications', importance: 'HIGH' as const, keywords: ['features', 'specs', 'technical', 'integration', 'api'] },
        { topic: 'Pros & Cons Analysis', importance: 'MEDIUM' as const, keywords: ['pros', 'cons', 'advantages', 'disadvantages', 'benefits'] },
        { topic: 'User Reviews & Ratings', importance: 'MEDIUM' as const, keywords: ['review', 'rating', 'testimonials', 'customer'] },
        { topic: 'Step-by-Step Tutorial & Setup Guide', importance: 'MEDIUM' as const, keywords: ['guide', 'tutorial', 'setup', 'how to', 'quickstart'] },
      ];

      const gapList: ContentGapItem[] = candidateTopics.map((cand) => {
        // Find which top ranking sources discuss this subtopic
        const matchingSources = searchResults
          .filter((s) => cand.keywords.some((kw) => (s.title + ' ' + s.snippet).toLowerCase().includes(kw)))
          .map((s) => {
            try {
              return new URL(s.url).hostname.replace(/^www\./, '');
            } catch {
              return s.url;
            }
          });

        const userCovered = userMarkdown
          ? cand.keywords.some((kw) => userMarkdown.includes(kw))
          : false;

        return {
          subtopic: cand.topic,
          importance: cand.importance,
          topRankingSources: Array.from(new Set(matchingSources)),
          userCovered,
          recommendation: userCovered
            ? `Parity established for "${cand.topic}".`
            : `Add a dedicated section for "${cand.topic}" — covered by ${matchingSources.length > 0 ? matchingSources.join(', ') : 'top ranking rivals'}.`,
        };
      });

      const missingGaps = gapList.filter((g) => !g.userCovered);
      const coverageRate = Math.round(((gapList.length - missingGaps.length) / gapList.length) * 100);

      const payload = {
        targetKeyword: keyword,
        userUrl: cleanUrl,
        coverageRate,
        totalAnalyzedSources: searchResults.length,
        topRankingSources: searchResults.map((s) => ({ title: s.title, url: s.url })),
        contentGaps: gapList,
        missingCount: missingGaps.length,
      };

      // Non-blocking save to Supabase
      try {
        await supabaseV2Admin.from(V2_TABLES.CONTENT_GAPS).insert({
          user_email: userEmail || null,
          target_keyword: keyword,
          user_url: cleanUrl,
          coverage_rate: coverageRate,
          gap_data: payload,
        });
      } catch (dbErr: any) {
        console.warn('Supabase content_gaps insert warning:', dbErr.message);
      }

      return res.status(200).json({
        success: true,
        data: payload,
      });
    } catch (err: any) {
      console.error('v2 content-gaps error:', err);
      return res.status(500).json({ error: err.message || 'Failed to find content gaps' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
