import type { NextApiRequest, NextApiResponse } from 'next';
import { exaClient, ExaSearchResultItem } from '@/lib/providers/exaClient';
import { supabaseV2Admin, V2_TABLES } from '@/lib/supabaseV2';
import { getServerPlanLimits } from '@/lib/planLimits';

export interface ProcessedMention {
  id: string;
  title: string;
  url: string;
  domain: string;
  snippet: string;
  highlights: string[];
  mentionType: 'Linked Backlink' | 'Unlinked Brand Mention';
  outreachPriority: 'HIGH' | 'MEDIUM' | 'LOW';
  sentiment: 'positive' | 'neutral' | 'critical';
  pitchAngle: string;
  publishedDate?: string;
  author?: string;
  score?: number;
  domainAuthorityTier: 'Authority Site' | 'Industry Blog' | 'Web Publication';
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const userEmail = (req.query.userEmail as string || '').toLowerCase().trim();
    const brandName = (req.query.brandName as string || '').toLowerCase().trim();
    try {
      let query = supabaseV2Admin.from(V2_TABLES.BRAND_MENTIONS).select('*').order('created_at', { ascending: false }).limit(50);
      if (userEmail) {
        query = query.eq('user_email', userEmail);
      } else if (brandName) {
        query = query.ilike('brand_name', `%${brandName}%`);
      }
      const { data, error } = await query;
      if (error) throw error;
      return res.status(200).json({ success: true, mentions: data || [] });
    } catch (err: any) {
      console.warn('GET brand-mentions error (returning empty):', err.message);
      return res.status(200).json({ success: true, mentions: [] });
    }
  }

  if (req.method === 'POST') {
    const { brandName, domain = '', userEmail } = req.body;

    if (!brandName || typeof brandName !== 'string') {
      return res.status(400).json({ error: 'brandName is required' });
    }

    // Server-side Plan Gate Check
    const planLimits = await getServerPlanLimits(userEmail);
    if (!planLimits.isPro) {
      return res.status(403).json({ error: 'Active subscription required for Brand Mentions Radar. Please upgrade your plan.' });
    }

    try {
      const cleanBrand = brandName.trim();
      const cleanDomain = domain.trim().replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];

      // 1. Neural Search via Exa API (multi-query up to 25-35 results)
      const exaRes = await exaClient.findBrandMentions(cleanBrand, cleanDomain);

      const rawResults = exaRes.results || [];
      const mentionsList: ProcessedMention[] = [];

      let totalBacklinks = 0;
      let totalUnlinkedMentions = 0;

      rawResults.forEach((item: ExaSearchResultItem) => {
        let mentionDomain = '';
        try {
          mentionDomain = new URL(item.url.startsWith('http') ? item.url : `https://${item.url}`).hostname.replace(/^www\./, '');
        } catch {
          mentionDomain = item.url;
        }

        // Filter out self-mentions
        if (cleanDomain && mentionDomain === cleanDomain) return;

        const textContent = (item.text || item.snippet || '').toLowerCase();
        const hasHyperlink = cleanDomain ? textContent.includes(cleanDomain) || textContent.includes(`href=`) : false;

        const mentionType: 'Linked Backlink' | 'Unlinked Brand Mention' = hasHyperlink ? 'Linked Backlink' : 'Unlinked Brand Mention';

        if (mentionType === 'Linked Backlink') totalBacklinks++;
        else totalUnlinkedMentions++;

        const outreachPriority: 'HIGH' | 'MEDIUM' | 'LOW' = mentionType === 'Unlinked Brand Mention' ? 'HIGH' : 'LOW';

        // Simple sentiment heuristic
        let sentiment: 'positive' | 'neutral' | 'critical' = 'neutral';
        if (textContent.includes('best') || textContent.includes('great') || textContent.includes('recommend') || textContent.includes('top')) {
          sentiment = 'positive';
        } else if (textContent.includes('worst') || textContent.includes('avoid') || textContent.includes('slow')) {
          sentiment = 'critical';
        }

        // Pitch Angle Recommendation
        const pitchAngle = mentionType === 'Unlinked Brand Mention'
          ? `Request live hyperlink to https://${cleanDomain || 'yourdomain.com'} for existing mention on ${mentionDomain}.`
          : `Anchor link established. Maintain relationship with ${item.author || 'editorial team'}.`;

        // Domain Authority Tier
        const domainAuthorityTier: 'Authority Site' | 'Industry Blog' | 'Web Publication' =
          mentionDomain.endsWith('.org') || mentionDomain.endsWith('.edu') || item.score! >= 90
            ? 'Authority Site'
            : item.score! >= 80
            ? 'Industry Blog'
            : 'Web Publication';

        mentionsList.push({
          id: item.id || `m_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          title: item.title,
          url: item.url,
          domain: mentionDomain,
          snippet: item.snippet || item.text?.slice(0, 250) || '',
          highlights: item.highlights && item.highlights.length > 0 ? item.highlights : [item.snippet || ''],
          mentionType,
          outreachPriority,
          sentiment,
          pitchAngle,
          publishedDate: item.publishedDate || 'Recently',
          author: item.author || 'Editorial Team',
          score: item.score || 85,
          domainAuthorityTier,
        });
      });

      const mentionsPayload = {
        brandName: cleanBrand,
        domain: cleanDomain,
        totalMentions: mentionsList.length,
        totalBacklinks,
        totalUnlinkedMentions,
        avgRelevanceScore: mentionsList.length > 0 ? Math.round(mentionsList.reduce((acc, m) => acc + (m.score || 85), 0) / mentionsList.length) : 0,
        mentions: mentionsList,
        provider: 'Neural Web Search Index',
      };

      // Non-blocking save to Supabase
      try {
        await supabaseV2Admin.from(V2_TABLES.BRAND_MENTIONS).insert({
          user_email: userEmail || null,
          brand_name: cleanBrand,
          domain: cleanDomain,
          total_mentions: mentionsList.length,
          mentions_data: mentionsPayload,
        });
      } catch (dbErr: any) {
        console.warn('Supabase brand_mentions insert warning:', dbErr.message);
      }

      return res.status(200).json({
        success: true,
        data: mentionsPayload,
      });
    } catch (err: any) {
      console.error('v2 brand-mentions error:', err);
      return res.status(500).json({ error: err.message || 'Failed to discover brand mentions' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
