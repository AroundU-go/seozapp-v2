import type { NextApiRequest, NextApiResponse } from 'next';
import { firecrawlClient } from '@/lib/providers/firecrawlClient';
import { supabaseV2Admin, V2_TABLES } from '@/lib/supabaseV2';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { url, domainId, limit = 50 } = req.body;

    if (!url || typeof url !== 'string') {
      return res.status(400).json({ error: 'URL is required' });
    }

    try {
      let cleanUrl = url.trim();
      if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
        cleanUrl = `https://${cleanUrl}`;
      }

      // Initiate async crawl with Firecrawl
      const crawlResp = await firecrawlClient.crawlDomain(cleanUrl, limit);

      if (!crawlResp.success || !crawlResp.id) {
        throw new Error(crawlResp.error || 'Failed to start Firecrawl crawl job');
      }

      // Store versioned snapshot in v2_crawl_runs table if domainId provided
      if (domainId) {
        await supabaseV2Admin.from(V2_TABLES.CRAWL_RUNS).insert({
          domain_id: domainId,
          status: 'crawling',
          pages_discovered: limit,
          pages_crawled: 0,
          source: 'manual',
        });
      }

      return res.status(200).json({
        success: true,
        jobId: crawlResp.id,
        url: cleanUrl,
        message: 'Crawl job initiated asynchronously',
      });
    } catch (err: any) {
      console.error('v2 crawl error:', err);
      return res.status(500).json({ error: err.message || 'Failed to start crawl' });
    }
  }

  if (req.method === 'GET') {
    const { jobId } = req.query;

    if (!jobId || typeof jobId !== 'string') {
      return res.status(400).json({ error: 'jobId parameter is required' });
    }

    try {
      const statusResp = await firecrawlClient.getCrawlStatus(jobId);
      return res.status(200).json(statusResp);
    } catch (err: any) {
      console.error('v2 crawl status error:', err);
      return res.status(500).json({ error: err.message || 'Failed to get crawl status' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
