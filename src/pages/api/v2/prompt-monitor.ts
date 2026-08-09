import type { NextApiRequest, NextApiResponse } from 'next';
import { runApifyLlmPrompt } from '@/lib/providers/apifyClient';
import { supabaseV2Admin, V2_TABLES } from '@/lib/supabaseV2';

export const maxDuration = 60;

/**
 * Prompt Monitoring API — Powered by Apify LLM Actor
 *
 * GET  /api/v2/prompt-monitor  → Fetch history from Supabase v2_prompt_runs
 * POST /api/v2/prompt-monitor  → Run a prompt against an AI engine via Apify, save result to Supabase
 */

// Cache for which timestamp column exists in the table
let timestampColumn: 'created_at' | 'run_at' | null = null;

/** Detect whether the v2_prompt_runs table uses 'created_at' or 'run_at' */
async function getTimestampColumn(): Promise<'created_at' | 'run_at'> {
  if (timestampColumn) return timestampColumn;

  // Try created_at first
  const { error: err1 } = await supabaseV2Admin
    .from(V2_TABLES.PROMPT_RUNS)
    .select('created_at')
    .limit(1);

  if (!err1) {
    timestampColumn = 'created_at';
    return 'created_at';
  }

  // Fallback to run_at
  const { error: err2 } = await supabaseV2Admin
    .from(V2_TABLES.PROMPT_RUNS)
    .select('run_at')
    .limit(1);

  if (!err2) {
    timestampColumn = 'run_at';
    return 'run_at';
  }

  // Default
  timestampColumn = 'created_at';
  return 'created_at';
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const tsCol = await getTimestampColumn();

  // ═══════════════════════════════════════════════════════════════════════
  // GET — Fetch prompt run history from Supabase
  // ═══════════════════════════════════════════════════════════════════════
  if (req.method === 'GET') {
    const userEmail = (req.query.userEmail as string || '').toLowerCase().trim();
    const brandName = (req.query.brandName as string || '').toLowerCase().trim();

    try {
      let query = supabaseV2Admin
        .from(V2_TABLES.PROMPT_RUNS)
        .select('*')
        .order(tsCol, { ascending: false })
        .limit(100);

      if (userEmail) {
        query = query.ilike('user_email', userEmail);
      }
      if (brandName) {
        query = query.ilike('brand_name', `%${brandName}%`);
      }

      const { data, error } = await query;

      if (error) {
        console.warn('Supabase GET prompt_runs error:', error.message);
        return res.status(200).json({ success: true, runs: [] });
      }

      return res.status(200).json({ success: true, runs: data || [] });
    } catch (err: any) {
      console.warn('GET prompt-runs unexpected error:', err.message);
      return res.status(200).json({ success: true, runs: [] });
    }
  }

  // ═══════════════════════════════════════════════════════════════════════
  // POST — Run prompt(s) against an AI engine via Apify and save to Supabase
  // ═══════════════════════════════════════════════════════════════════════
  if (req.method === 'POST') {
    const { promptText, prompts, brandName, userEmail, competitors = [], engine } = req.body;

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

    const targetEngine: string = engine || 'chatgpt';
    const region = 'US';

    try {
      const results = [];

      for (const singlePrompt of promptList) {
        try {
          // ── Call Apify Actor ──────────────────────────────────────────
          const apifyResult = await runApifyLlmPrompt(
            targetEngine,
            singlePrompt,
            brandName.trim(),
            Array.isArray(competitors) ? competitors : []
          );

          const citedUrls = (apifyResult.citedSources || []).map((s) => s.url);
          const snippet = (apifyResult.rawAnswer || '').slice(0, 500);
          const nowIso = new Date().toISOString();

          const runItem = {
            id: `pr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            prompt: singlePrompt,
            brandName: brandName.trim(),
            region,
            engineId: apifyResult.engineId || targetEngine,
            cited: apifyResult.brandMentioned,
            position: apifyResult.positionEstimate,
            sentiment: apifyResult.sentiment,
            responseSnippet: snippet,
            citedUrls,
            isLiveSearch: true,
            providerType: 'apify_actor',
            competitorsMentioned: apifyResult.competitorsMentioned || [],
            createdAt: nowIso,
          };

          // ── Persist to Supabase (non-blocking) ───────────────────────
          try {
            const insertRow: Record<string, any> = {
              user_email: userEmail || null,
              prompt_text: singlePrompt,
              brand_name: brandName.trim(),
              region,
              llm_provider: apifyResult.engineId || targetEngine,
              cited: apifyResult.brandMentioned,
              position: apifyResult.positionEstimate,
              sentiment: apifyResult.sentiment,
              response_snippet: snippet,
            };
            // Use the correct timestamp column for this database
            insertRow[tsCol] = nowIso;

            await supabaseV2Admin.from(V2_TABLES.PROMPT_RUNS).insert(insertRow);
          } catch (dbErr: any) {
            console.warn('Supabase insert failed (non-blocking):', dbErr?.message || dbErr);
          }

          results.push(runItem);
        } catch (taskErr: any) {
          console.warn(`Apify failed for engine="${targetEngine}" prompt="${singlePrompt}":`, taskErr.message);
          results.push({
            id: `pr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            prompt: singlePrompt,
            brandName: brandName.trim(),
            region,
            engineId: targetEngine,
            cited: false,
            position: 'Error',
            sentiment: 'neutral',
            responseSnippet: `Engine error: ${taskErr.message}`,
            citedUrls: [],
            isLiveSearch: false,
            providerType: 'apify_actor',
            competitorsMentioned: [],
            createdAt: new Date().toISOString(),
            error: taskErr.message,
          });
        }
      }

      return res.status(200).json({ success: true, results });
    } catch (err: any) {
      console.error('v2 prompt-monitor POST error:', err);
      return res.status(500).json({ error: err.message || 'Failed to run prompt monitoring' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
