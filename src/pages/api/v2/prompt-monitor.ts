import type { NextApiRequest, NextApiResponse } from 'next';
import { queryDataForSeoLlm } from '@/lib/providers/dataForSeoClient';
import { supabaseV2Admin, V2_TABLES } from '@/lib/supabaseV2';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const userEmail = (req.query.userEmail as string || '').toLowerCase().trim();
    try {
      let query = supabaseV2Admin.from(V2_TABLES.PROMPT_RUNS).select('*').order('created_at', { ascending: false }).limit(50);
      if (userEmail) {
        query = query.eq('user_email', userEmail);
      }
      const { data, error } = await query;
      if (error) throw error;
      return res.status(200).json({ success: true, runs: data || [] });
    } catch (err: any) {
      console.warn('GET prompt-runs error (returning empty array):', err.message);
      return res.status(200).json({ success: true, runs: [] });
    }
  }

  if (req.method === 'POST') {
    const { promptText, prompts, brandName, userEmail, region = 'US', competitors = [], engines = [] } = req.body;

    // Collect list of prompt texts
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

    // Determine target engines (default to chatgpt, perplexity, claude, gemini if none supplied)
    const targetEngines: string[] = Array.isArray(engines) && engines.length > 0 
      ? engines 
      : ['chatgpt', 'perplexity', 'claude', 'gemini'];

    try {
      const results = [];

      for (const singlePrompt of promptList) {
        for (const engineId of targetEngines) {
          const resItem = await queryDataForSeoLlm(engineId, singlePrompt, brandName.trim(), region, competitors);

          const citedUrls = resItem.citedSources.map((s) => s.url);
          const snippet = resItem.rawAnswer.slice(0, 500);

          const runItem = {
            id: `pr_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
            prompt: singlePrompt,
            brandName: brandName.trim(),
            region: region || 'US',
            engineId: resItem.engineId,
            cited: resItem.brandMentioned,
            position: resItem.positionEstimate,
            sentiment: resItem.sentiment,
            responseSnippet: snippet,
            citedUrls,
            isLiveSearch: true,
            competitorsMentioned: resItem.competitorsMentioned,
            createdAt: new Date().toISOString(),
          };

          // Attempt non-blocking save to Supabase
          try {
            await supabaseV2Admin.from(V2_TABLES.PROMPT_RUNS).insert({
              user_email: userEmail || null,
              prompt_text: singlePrompt,
              brand_name: brandName.trim(),
              region: region || 'US',
              llm_provider: resItem.engineId,
              cited: resItem.brandMentioned,
              position: runItem.position,
              sentiment: runItem.sentiment,
              response_snippet: snippet,
            });
          } catch (dbErr: any) {
            console.warn('Supabase prompt_run insert failed (non-blocking):', dbErr.message);
          }

          results.push(runItem);
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
