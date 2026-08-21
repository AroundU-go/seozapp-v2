import type { NextApiRequest, NextApiResponse } from 'next';
import { runApifyBrandTracker, BrandTrackerResult } from '@/lib/providers/apifyClient';
import { supabaseV2Admin, V2_TABLES } from '@/lib/supabaseV2';
import { REGIONS, RegionCode } from '@/components/dashboard/RegionSelector';
import { getServerPlanLimits } from '@/lib/planLimits';

export const maxDuration = 120;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // ─── GET: Fetch saved prompt runs from Supabase ───
  if (req.method === 'GET') {
    const userEmail = (req.query.userEmail as string || '').toLowerCase().trim();
    const brandName = (req.query.brandName as string || '').toLowerCase().trim();

    // Require userEmail to prevent leaking other users' data
    if (!userEmail) {
      return res.status(200).json({ success: true, runs: [] });
    }

    try {
      let query = supabaseV2Admin
        .from(V2_TABLES.PROMPT_RUNS)
        .select('*')
        .ilike('user_email', userEmail)
        .order('run_at', { ascending: false })
        .limit(100);

      if (brandName) {
        query = query.ilike('brand_name', `%${brandName}%`);
      }

      const { data, error } = await query;
      if (error) throw error;

      return res.status(200).json({ success: true, runs: data || [] });
    } catch (err: any) {
      console.warn('GET prompt-runs error:', err.message);
      return res.status(200).json({ success: true, runs: [] });
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
    const targetCountryCode = regionInfo.firecrawlCountry || targetRegion;

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

    // Server-side Plan Gate Check
    const planLimits = await getServerPlanLimits(userEmail);
    if (!planLimits.isPro) {
      return res.status(403).json({ error: 'Active subscription required for prompt monitoring. Please upgrade your plan.' });
    }

    // Build platforms list from various input formats and filter by user plan allowed engines
    let requestedPlatforms: string[] = [];
    if (Array.isArray(platforms) && platforms.length > 0) {
      requestedPlatforms = platforms;
    } else if (Array.isArray(engines) && engines.length > 0) {
      requestedPlatforms = engines;
    } else if (engine) {
      requestedPlatforms = [engine];
    } else {
      requestedPlatforms = ['chatgpt', 'gemini', 'perplexity', 'ai_overview', 'claude'];
    }

    const platformList = requestedPlatforms.filter((p) => planLimits.allowedEngines.includes(p));
    if (platformList.length === 0) {
      platformList.push(planLimits.allowedEngines[0] || 'chatgpt');
    }

    // Enforce total prompt quota check
    if (planLimits.maxPrompts < 999 && userEmail) {
      try {
        const { count } = await supabaseV2Admin
          .from(V2_TABLES.PROMPT_RUNS)
          .select('id', { count: 'exact', head: true })
          .ilike('user_email', userEmail.trim().toLowerCase());

        const currentCount = count || 0;
        if (currentCount + promptList.length > planLimits.maxPrompts) {
          return res.status(403).json({
            error: `Your ${planLimits.tier} plan limit of ${planLimits.maxPrompts} prompts has been reached (${currentCount}/${planLimits.maxPrompts} used). Please upgrade your plan.`,
          });
        }
      } catch (countErr) {
        console.warn('[prompt-monitor] Prompt count check skipped:', countErr);
      }
    }

    try {
      // Single Apify actor call with all queries + allowed platforms
      const trackerResults: BrandTrackerResult[] = await runApifyBrandTracker({
        brandName: brandName.trim(),
        brandDomain: brandDomain || '',
        queries: promptList,
        platforms: platformList,
        country: targetCountryCode,
        competitors: [], // Skipped for now
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
