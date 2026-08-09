import type { NextApiRequest, NextApiResponse } from 'next';
import { runApifyBrandTracker, BrandTrackerResult } from '@/lib/providers/apifyClient';
import { supabaseV2Admin, V2_TABLES } from '@/lib/supabaseV2';
import { REGIONS, RegionCode } from '@/components/dashboard/RegionSelector';

export const maxDuration = 60;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // ─── GET: Fetch saved prompt runs from Supabase ───
  if (req.method === 'GET') {
    const userEmail = (req.query.userEmail as string || '').toLowerCase().trim();
    const brandName = (req.query.brandName as string || '').toLowerCase().trim();

    try {
      let query = supabaseV2Admin
        .from(V2_TABLES.PROMPT_RUNS)
        .select('*')
        .order('run_at', { ascending: false })
        .limit(100);

      if (userEmail) {
        query = query.ilike('user_email', userEmail);
      }
      if (brandName) {
        query = query.ilike('brand_name', `%${brandName}%`);
      }

      const { data, error } = await query;
      if (error) throw error;

      if (!data || data.length === 0) {
        // Fallback: return latest 100 runs without filters
        const fallback = await supabaseV2Admin
          .from(V2_TABLES.PROMPT_RUNS)
          .select('*')
          .order('run_at', { ascending: false })
          .limit(100);
        return res.status(200).json({ success: true, runs: fallback.data || [] });
      }

      return res.status(200).json({ success: true, runs: data });
    } catch (err: any) {
      console.warn('GET prompt-runs error:', err.message);
      try {
        const fallback = await supabaseV2Admin
          .from(V2_TABLES.PROMPT_RUNS)
          .select('*')
          .order('run_at', { ascending: false })
          .limit(100);
        return res.status(200).json({ success: true, runs: fallback.data || [] });
      } catch {
        return res.status(200).json({ success: true, runs: [] });
      }
    }
  }

  // ─── POST: Run Apify AI Brand Tracker and save results ───
  if (req.method === 'POST') {
    const {
      brandName,
      brandDomain,
      prompts,
      promptText,
      platforms,
      engines,
      engine,
      competitors = [],
      userEmail,
      region = 'US',
      locationCode,
      languageCode,
    } = req.body;

    const targetRegion: RegionCode = (region as RegionCode) in REGIONS ? (region as RegionCode) : 'US';
    const regionInfo = REGIONS[targetRegion] || REGIONS.US;
    const targetLocationCode = locationCode || regionInfo.locationCode || '2840';
    const targetLanguageCode = languageCode || regionInfo.languageCode || 'en';

    // Build prompts list
    const promptList: string[] = [];
    if (Array.isArray(prompts)) {
      prompts.forEach((p: string) => {
        if (typeof p === 'string' && p.trim()) promptList.push(p.trim());
      });
    }
    if (promptText && typeof promptText === 'string' && promptText.trim() && !promptList.includes(promptText.trim())) {
      promptList.push(promptText.trim());
    }

    if (promptList.length === 0 || !brandName) {
      return res.status(400).json({ error: 'At least one prompt and brandName are required' });
    }

    // Build platforms list from various input formats
    let platformList: string[] = [];
    if (Array.isArray(platforms) && platforms.length > 0) {
      platformList = platforms;
    } else if (Array.isArray(engines) && engines.length > 0) {
      platformList = engines;
    } else if (engine) {
      platformList = [engine];
    } else {
      platformList = ['chatgpt', 'gemini', 'perplexity', 'ai_overview', 'claude'];
    }

    try {
      // Single Apify actor call with all queries + all platforms
      const trackerResults: BrandTrackerResult[] = await runApifyBrandTracker({
        brandName: brandName.trim(),
        brandDomain: brandDomain || '',
        queries: promptList,
        platforms: platformList,
        competitors: Array.isArray(competitors) ? competitors : [],
        locationCode: targetLocationCode,
        languageCode: targetLanguageCode,
      });

      const nowIso = new Date().toISOString();
      const results: any[] = [];

      for (const r of trackerResults) {
        const runItem = {
          id: `pr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          prompt: r.query,
          brandName: brandName.trim(),
          region: targetRegion,
          engineId: r.platform,
          cited: r.brandMentioned,
          position: r.position,
          sentiment: r.sentiment,
          responseSnippet: r.responseSnippet,
          citedUrls: r.citedUrls,
          competitorsMentioned: r.competitorsMentioned,
          visibilityScore: r.visibilityScore,
          aiSearchVolume: r.aiSearchVolume,
          isLiveSearch: true,
          createdAt: nowIso,
          runAt: nowIso,
        };

        // Save to Supabase (non-blocking)
        try {
          await supabaseV2Admin.from(V2_TABLES.PROMPT_RUNS).insert({
            user_email: userEmail || null,
            prompt_text: r.query,
            brand_name: brandName.trim(),
            region: targetRegion,
            llm_provider: r.platform,
            cited: r.brandMentioned,
            position: r.position,
            sentiment: r.sentiment,
            response_snippet: r.responseSnippet,
            run_at: nowIso,
          });
        } catch (dbErr: any) {
          console.warn('Supabase prompt_run insert failed (non-blocking):', dbErr?.message || dbErr);
        }

        results.push(runItem);
      }

      return res.status(200).json({
        success: true,
        results,
      });
    } catch (err: any) {
      console.error('v2 prompt-monitor POST error:', err);
      return res.status(500).json({ error: err.message || 'Failed to run prompt monitoring' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
