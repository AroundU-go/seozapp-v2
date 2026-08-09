import type { NextApiRequest, NextApiResponse } from 'next';
import { runApifyLlmPrompt } from '@/lib/providers/apifyClient';
import { supabaseV2Admin, V2_TABLES } from '@/lib/supabaseV2';

export const maxDuration = 60;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const userEmail = (req.query.userEmail as string || '').toLowerCase().trim();
    const brandName = (req.query.brandName as string || '').toLowerCase().trim();

    try {
      let query = supabaseV2Admin
        .from(V2_TABLES.PROMPT_RUNS)
        .select('*')
        .order('created_at', { ascending: false })
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
        const fallback = await supabaseV2Admin
          .from(V2_TABLES.PROMPT_RUNS)
          .select('*')
          .order('created_at', { ascending: false })
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
          .order('created_at', { ascending: false })
          .limit(100);
        return res.status(200).json({ success: true, runs: fallback.data || [] });
      } catch {
        return res.status(200).json({ success: true, runs: [] });
      }
    }
  }

  if (req.method === 'POST') {
    const { promptText, prompts, brandName, userEmail, competitors = [], engines = [], engine } = req.body;
    const region = 'US';

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

    // Accept a single engine per request to avoid Vercel timeout.
    // The frontend sends one request per engine sequentially.
    const singleEngine: string = engine || (Array.isArray(engines) && engines.length > 0 ? engines[0] : 'chatgpt');

    try {
      const results = [];

      for (const singlePrompt of promptList) {
        try {
          const resItem = await runApifyLlmPrompt(singleEngine, singlePrompt, brandName.trim(), competitors);

          const citedUrls = (resItem.citedSources || []).map((s: any) => s.url);
          const snippet = (resItem.rawAnswer || '').slice(0, 500);
          const nowIso = new Date().toISOString();

          const runItem = {
            id: `pr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            prompt: singlePrompt,
            brandName: brandName.trim(),
            region,
            engineId: resItem.engineId || singleEngine,
            cited: resItem.brandMentioned,
            position: resItem.positionEstimate,
            sentiment: resItem.sentiment,
            responseSnippet: snippet,
            citedUrls,
            isLiveSearch: true,
            providerType: 'live_engine',
            competitorsMentioned: resItem.competitorsMentioned || [],
            createdAt: nowIso,
            runAt: nowIso,
          };

          // Save to Supabase
          try {
            await supabaseV2Admin.from(V2_TABLES.PROMPT_RUNS).insert({
              user_email: userEmail || null,
              prompt_text: singlePrompt,
              brand_name: brandName.trim(),
              region,
              llm_provider: resItem.engineId || singleEngine,
              cited: resItem.brandMentioned,
              position: runItem.position,
              sentiment: runItem.sentiment,
              response_snippet: snippet,
              created_at: nowIso,
            });
          } catch (dbErr: any) {
            console.warn('Supabase prompt_run insert failed (non-blocking):', dbErr?.message || dbErr);
          }

          results.push(runItem);
        } catch (taskErr: any) {
          console.warn(`Prompt task failed for ${singleEngine} / "${singlePrompt}":`, taskErr.message);
        }
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
