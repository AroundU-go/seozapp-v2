import type { NextApiRequest, NextApiResponse } from 'next';

export const maxDuration = 120;
import { runKeywordGapAnalysis } from '@/lib/providers/apifyKeywordClient';
import { supabaseV2Admin, V2_TABLES } from '@/lib/supabaseV2';
import { getServerPlanLimits } from '@/lib/planLimits';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // GET: Fetch keyword gap history
  if (req.method === 'GET') {
    const userEmail = (req.query.userEmail as string || '').toLowerCase().trim();
    try {
      let query = supabaseV2Admin
        .from(V2_TABLES.COMPETITOR_KEYWORDS)
        .select('*')
        .order('created_at', { ascending: false })
        .limit(30);
      if (userEmail) {
        query = query.eq('user_email', userEmail);
      }
      const { data, error } = await query;
      if (error) throw error;
      return res.status(200).json({ success: true, analyses: data || [] });
    } catch (err: any) {
      console.warn('GET competitor-keywords error:', err.message);
      return res.status(200).json({ success: true, analyses: [] });
    }
  }

  // POST: Run keyword gap analysis
  if (req.method === 'POST') {
    const { ownDomain, competitorDomain, userEmail, location, language } = req.body;

    if (!ownDomain || !competitorDomain) {
      return res.status(400).json({ error: 'Both ownDomain and competitorDomain are required' });
    }

    // Server-side Plan Gate
    const planLimits = await getServerPlanLimits(userEmail);
    if (!planLimits.isPro) {
      return res.status(403).json({
        error: 'Active subscription required for Competitor Keyword Analysis. Please upgrade your plan.',
      });
    }

    try {
      const keywords = await runKeywordGapAnalysis({
        targetDomain: competitorDomain,
        compareToDomain: ownDomain,
        location: location || 'United States',
        language: language || 'English',
      });

      const cleanOwn = ownDomain.replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/.*$/, '');
      const cleanComp = competitorDomain.replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/.*$/, '');

      // Non-blocking persist to Supabase
      try {
        await supabaseV2Admin.from(V2_TABLES.COMPETITOR_KEYWORDS).insert({
          user_email: userEmail || null,
          own_domain: cleanOwn,
          competitor_domain: cleanComp,
          keywords_data: keywords,
        });
      } catch (dbErr: any) {
        console.warn('Supabase competitor-keywords insert failed (non-blocking):', dbErr.message);
      }

      return res.status(200).json({
        success: true,
        ownDomain: cleanOwn,
        competitorDomain: cleanComp,
        keywords,
        totalKeywords: keywords.length,
      });
    } catch (err: any) {
      console.error('v2 competitor-keywords error:', err);
      return res.status(500).json({ error: err.message || 'Failed to run keyword gap analysis' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
