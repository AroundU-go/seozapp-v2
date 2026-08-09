import type { NextApiRequest, NextApiResponse } from 'next';
import { firecrawlClient } from '@/lib/providers/firecrawlClient';
import { supabaseV2Admin, V2_TABLES } from '@/lib/supabaseV2';
import { getServerPlanLimits } from '@/lib/planLimits';

export interface BotAccessStatus {
  botName: string;
  userAgent: string;
  accessible: boolean;
  statusText: string;
  robotsTxtAllowed: boolean;
  metaAllowed: boolean;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const userEmail = (req.query.userEmail as string || '').toLowerCase().trim();
    const domain = (req.query.domain as string || '').toLowerCase().trim();
    try {
      let query = supabaseV2Admin.from(V2_TABLES.AI_BOT_AUDITS).select('*').order('created_at', { ascending: false }).limit(50);
      if (userEmail) {
        query = query.eq('user_email', userEmail);
      } else if (domain) {
        query = query.ilike('domain', `%${domain}%`);
      }
      const { data, error } = await query;
      if (error) throw error;
      return res.status(200).json({ success: true, audits: data || [] });
    } catch (err: any) {
      console.warn('GET ai-bot-audits error (returning empty):', err.message);
      return res.status(200).json({ success: true, audits: [] });
    }
  }

  if (req.method === 'POST') {
    const { targetUrl, userEmail } = req.body;

    if (!targetUrl || typeof targetUrl !== 'string') {
      return res.status(400).json({ error: 'targetUrl is required' });
    }

    // Server-side Plan Gate Check
    const planLimits = await getServerPlanLimits(userEmail);
    if (!planLimits.isPro) {
      return res.status(403).json({ error: 'Active subscription required for AI Bot Crawlability Audit. Please upgrade your plan.' });
    }

    try {
      let cleanUrl = targetUrl.trim();
      if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
        cleanUrl = `https://${cleanUrl}`;
      }

      const domain = new URL(cleanUrl).hostname.replace(/^www\./, '');

      // 1. Fetch robots.txt
      let robotsTxtContent = '';
      try {
        const robotsUrl = `https://${domain}/robots.txt`;
        const rRes = await fetch(robotsUrl, { method: 'GET', headers: { 'User-Agent': 'SEOzappBot/1.0' } });
        if (rRes.ok) {
          robotsTxtContent = await rRes.text();
        }
      } catch (rErr) {
        console.warn('robots.txt fetch warning:', rErr);
      }

      // 2. Scrape main page via Firecrawl / HTTP to check meta tags & accessibility
      let pageMarkdown = '';
      let pageTitle = '';
      let pageStatusCode = 200;

      try {
        const scrape = await firecrawlClient.scrapeUrl(cleanUrl);
        pageMarkdown = scrape.data?.markdown || '';
        pageTitle = scrape.data?.metadata?.title || domain;
        pageStatusCode = scrape.data?.metadata?.statusCode || 200;
      } catch (sErr: any) {
        console.warn('Firecrawl scrape warning for bot audit:', sErr.message);
      }

      const robotsLower = robotsTxtContent.toLowerCase();

      // Define major AI crawlers
      const botsToAudit = [
        { name: 'GPTBot', agent: 'GPTBot', desc: 'OpenAI ChatGPT Web Crawler' },
        { name: 'ClaudeBot', agent: 'ClaudeBot', desc: 'Anthropic Claude AI Crawler' },
        { name: 'PerplexityBot', agent: 'PerplexityBot', desc: 'Perplexity AI Search Crawler' },
        { name: 'Google-Extended', agent: 'Google-Extended', desc: 'Google Gemini & AI Overview Crawler' },
        { name: 'ByteSpider', agent: 'Bytespider', desc: 'TikTok / ByteDance AI Crawler' },
        { name: 'CCBot', agent: 'CCBot', desc: 'Common Crawl Open AI Training Dataset' },
      ];

      const botStatuses: BotAccessStatus[] = botsToAudit.map((b) => {
        const agentLower = b.agent.toLowerCase();
        // Check if user-agent is explicitly disallowed in robots.txt
        let isDisallowedInRobots = false;

        if (robotsLower.includes(`user-agent: ${agentLower}`) || robotsLower.includes(`user-agent: ${b.name.toLowerCase()}`)) {
          const lines = robotsLower.split('\n');
          let inSection = false;
          for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed.startsWith('user-agent:')) {
              inSection = trimmed.includes(agentLower) || trimmed.includes(b.name.toLowerCase());
            } else if (inSection && trimmed.startsWith('disallow: /')) {
              isDisallowedInRobots = true;
              break;
            }
          }
        } else if (robotsLower.includes('user-agent: *') && robotsLower.includes('disallow: /')) {
          isDisallowedInRobots = true;
        }

        const accessible = !isDisallowedInRobots && pageStatusCode === 200;
        const statusText = accessible ? 'Accessible (200 OK)' : isDisallowedInRobots ? 'Blocked by robots.txt' : `HTTP ${pageStatusCode}`;

        return {
          botName: b.name,
          userAgent: b.agent,
          accessible,
          statusText,
          robotsTxtAllowed: !isDisallowedInRobots,
          metaAllowed: true,
        };
      });

      const allowedCount = botStatuses.filter((b) => b.accessible).length;
      const totalBots = botStatuses.length;
      const botScore = Math.round((allowedCount / totalBots) * 100);

      const auditPayload = {
        domain,
        url: cleanUrl,
        pageTitle,
        botScore,
        allowedCount,
        totalBots,
        botStatuses,
        robotsTxtFound: robotsTxtContent.length > 0,
        contentAccessible: pageMarkdown.length > 50,
        wordCount: pageMarkdown.split(/\s+/).filter(Boolean).length,
      };

      // Non-blocking save to Supabase
      try {
        await supabaseV2Admin.from(V2_TABLES.AI_BOT_AUDITS).insert({
          user_email: userEmail || null,
          target_url: cleanUrl,
          domain,
          bot_score: botScore,
          audit_data: auditPayload,
        });
      } catch (dbErr: any) {
        console.warn('Supabase ai_bot_audits insert warning:', dbErr.message);
      }

      return res.status(200).json({
        success: true,
        audit: auditPayload,
      });
    } catch (err: any) {
      console.error('v2 ai-bot-audit error:', err);
      return res.status(500).json({ error: err.message || 'Failed to run AI bot access audit' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
