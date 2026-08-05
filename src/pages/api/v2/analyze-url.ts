import type { NextApiRequest, NextApiResponse } from 'next';
import { firecrawlClient } from '@/lib/providers/firecrawlClient';
import { kimiClient } from '@/lib/providers/kimiClient';
import { computeSeoScore } from '@/lib/scoring/seo-score';
import { computeStructuralScore, combineAiReadinessScore } from '@/lib/scoring/ai-readiness';
import { supabaseV2Admin, V2_TABLES } from '@/lib/supabaseV2';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const userEmail = (req.query.userEmail as string || '').toLowerCase().trim();
    try {
      let query = supabaseV2Admin.from(V2_TABLES.SEO_SNAPSHOTS).select('*').order('scraped_at', { ascending: false }).limit(20);
      if (userEmail) {
        query = query.eq('user_email', userEmail);
      }
      const { data, error } = await query;
      if (error) throw error;
      return res.status(200).json({ success: true, snapshots: data || [] });
    } catch (err: any) {
      console.warn('GET seo_snapshots error (returning empty):', err.message);
      return res.status(200).json({ success: true, snapshots: [] });
    }
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { url, brandName, region = 'GLOBAL', includeAi = false, userEmail } = req.body;

  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'URL is required' });
  }

  try {
    let cleanUrl = url.trim();
    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
      cleanUrl = `https://${cleanUrl}`;
    }

    const domainHost = new URL(cleanUrl).hostname.replace('www.', '');

    // Step 1: Scrape page via Firecrawl API (~2-3s)
    const scrapeResult = await firecrawlClient.scrapeUrl(cleanUrl, region);
    const markdown = scrapeResult.data?.markdown || '';
    const metadata = scrapeResult.data?.metadata || {};

    // Extract structure signals from live scraped content
    const title = (metadata.title || metadata.ogTitle || '').trim();
    const description = (metadata.description || metadata.ogDescription || '').trim();
    const wordCount = markdown.split(/\s+/).filter(Boolean).length;

    const mdH1s = (markdown.match(/^#\s+.+/gm) || []).length;
    const htmlH1s = (markdown.match(/<h1[^>]*>.*?<\/h1>/gi) || []).length;
    const h1Count = Math.max(mdH1s, htmlH1s, title ? 1 : 0);

    const hasFaqSchema = markdown.toLowerCase().includes('faqschema') || markdown.toLowerCase().includes('frequently asked questions');
    const hasQnaFormat = markdown.toLowerCase().includes('q:') || markdown.toLowerCase().includes('q&a');
    const hasListsOrTables = /^\s*[-*+]\s+/m.test(markdown) || /\|.+\|/.test(markdown);

    const schemaTypes: string[] = [];
    if (hasFaqSchema) schemaTypes.push('FAQPage');
    if (markdown.toLowerCase().includes('schema.org') || markdown.toLowerCase().includes('json-ld') || markdown.includes('application/ld+json')) {
      schemaTypes.push('Organization');
      schemaTypes.push('WebSite');
    }

    // Step 2: Calculate Rule-based SEO Health Score (instant, local — no API call)
    const seoResult = computeSeoScore({
      title,
      metaDescription: description,
      h1Count,
      wordCount,
      schemaTypes,
      brokenLinksCount: 0,
      hasCanonical: !!metadata.canonicalUrl,
    });

    // Step 3: Calculate Structural AI Readiness (instant, local — no API call)
    const structResult = computeStructuralScore({
      h1Count,
      hasFaqSchema,
      hasQnaFormat,
      hasListsOrTables,
      wordCount,
      hasDirectAnswerHeader: h1Count > 0,
    });

    // Build base response (Firecrawl + local scoring only — fast)
    const scrapedAt = new Date().toISOString();
    const response: any = {
      success: true,
      domain: domainHost,
      url: cleanUrl,
      region,
      scrapedAt,
      seoHealth: {
        score: seoResult.score,
        breakdown: seoResult.breakdown,
        issues: seoResult.issues,
      },
      aiReadiness: {
        overallScore: structResult.score,
        structuralScore: structResult.score,
        semanticScore: 0,
        issues: structResult.issues,
      },
      metadata: {
        title,
        description,
        wordCount,
        h1Count,
        statusCode: metadata.statusCode || 200,
        canonicalUrl: metadata.canonicalUrl || cleanUrl,
        language: metadata.language || 'en',
        schemaTypes: schemaTypes.length > 0 ? schemaTypes : ['WebPage'],
      },
    };

    // Step 4 (OPTIONAL): Kimi LLM calls — only when `includeAi: true` is passed
    if (includeAi) {
      const targetBrand = brandName || domainHost;
      const testPrompt = `What is ${targetBrand} and how does it help businesses?`;

      try {
        const [semanticResult, citationData] = await Promise.all([
          kimiClient.scoreSemanticReadiness(markdown, title || targetBrand),
          kimiClient.analyzeCitation(testPrompt, targetBrand, []),
        ]);

        const aiReadiness = combineAiReadinessScore(
          structResult.score,
          semanticResult.score,
          structResult.issues,
          semanticResult.keyIssues
        );

        response.aiReadiness = {
          overallScore: aiReadiness.overallScore,
          structuralScore: aiReadiness.structuralScore,
          semanticScore: aiReadiness.semanticScore,
          issues: aiReadiness.issues,
          fluffLevel: semanticResult.fluffLevel,
          directAnswerPresent: semanticResult.directAnswerPresent,
        };

        response.citationSample = {
          prompt: testPrompt,
          cited: citationData.analysis.brandMentioned,
          position: citationData.analysis.positionEstimate,
          sentiment: citationData.analysis.sentiment,
          responseText: citationData.responseText ? citationData.responseText.slice(0, 300) + '...' : '',
        };
      } catch (kimiErr: any) {
        console.warn('Kimi API unavailable, returning SEO-only results:', kimiErr.message);
      }
    }

    // Step 5: Persist snapshot to Supabase (fire-and-forget, don't block the response)
    try {
      await supabaseV2Admin.from(V2_TABLES.SEO_SNAPSHOTS).insert({
        user_email: userEmail || null,
        domain: domainHost,
        url: cleanUrl,
        region,
        seo_score: seoResult.score,
        score_breakdown: seoResult.breakdown,
        issues: seoResult.issues,
        ai_readiness_score: response.aiReadiness?.overallScore || structResult.score,
        title,
        meta_description: description,
        word_count: wordCount,
        h1_count: h1Count,
        status_code: metadata.statusCode || 200,
        canonical_url: metadata.canonicalUrl || cleanUrl,
        language: metadata.language || 'en',
        schema_types: schemaTypes.length > 0 ? schemaTypes : ['WebPage'],
        full_result: response,
        scraped_at: scrapedAt,
      });
    } catch (dbErr: any) {
      console.warn('Supabase snapshot insert failed (non-blocking):', dbErr.message);
    }

    return res.status(200).json(response);
  } catch (err: any) {
    console.error('v2 analyze-url error:', err);
    return res.status(500).json({
      success: false,
      error: err.message || 'Failed to analyze URL',
    });
  }
}
