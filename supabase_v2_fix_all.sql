-- ==========================================================
-- Supabase v2 Full Schema & RLS Policy Migration
-- Paste and Run in Supabase SQL Editor:
-- https://supabase.com/dashboard/project/ilmmqkfcotrmjjqbawhg/sql
-- ==========================================================

-- 1. v2_workspaces
CREATE TABLE IF NOT EXISTS public.v2_workspaces (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    owner_user_id TEXT NOT NULL,
    plan_tier TEXT DEFAULT 'starter',
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.v2_workspaces ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all v2_workspaces" ON public.v2_workspaces;
CREATE POLICY "Allow all v2_workspaces" ON public.v2_workspaces FOR ALL USING (true) WITH CHECK (true);

-- 2. v2_domains
CREATE TABLE IF NOT EXISTS public.v2_domains (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID REFERENCES public.v2_workspaces(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    is_competitor BOOLEAN DEFAULT FALSE,
    added_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.v2_domains ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all v2_domains" ON public.v2_domains;
CREATE POLICY "Allow all v2_domains" ON public.v2_domains FOR ALL USING (true) WITH CHECK (true);

-- 3. v2_prompt_runs
CREATE TABLE IF NOT EXISTS public.v2_prompt_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_email TEXT,
    prompt_text TEXT,
    brand_name TEXT,
    region TEXT DEFAULT 'US',
    llm_provider TEXT DEFAULT 'proxy',
    cited BOOLEAN DEFAULT FALSE,
    position TEXT DEFAULT 'Uncited',
    sentiment TEXT DEFAULT 'neutral',
    response_snippet TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.v2_prompt_runs ADD COLUMN IF NOT EXISTS user_email TEXT;
ALTER TABLE public.v2_prompt_runs ADD COLUMN IF NOT EXISTS prompt_text TEXT;
ALTER TABLE public.v2_prompt_runs ADD COLUMN IF NOT EXISTS brand_name TEXT;
ALTER TABLE public.v2_prompt_runs ADD COLUMN IF NOT EXISTS region TEXT;
ALTER TABLE public.v2_prompt_runs ADD COLUMN IF NOT EXISTS llm_provider TEXT;
ALTER TABLE public.v2_prompt_runs ADD COLUMN IF NOT EXISTS cited BOOLEAN;
ALTER TABLE public.v2_prompt_runs ADD COLUMN IF NOT EXISTS position TEXT;
ALTER TABLE public.v2_prompt_runs ADD COLUMN IF NOT EXISTS sentiment TEXT;
ALTER TABLE public.v2_prompt_runs ADD COLUMN IF NOT EXISTS response_snippet TEXT;
ALTER TABLE public.v2_prompt_runs ADD COLUMN IF NOT EXISTS run_at TIMESTAMPTZ;
ALTER TABLE public.v2_prompt_runs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all v2_prompt_runs" ON public.v2_prompt_runs;
CREATE POLICY "Allow all v2_prompt_runs" ON public.v2_prompt_runs FOR ALL USING (true) WITH CHECK (true);

-- 4. v2_competitor_analyses
CREATE TABLE IF NOT EXISTS public.v2_competitor_analyses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_email TEXT,
    own_url TEXT,
    own_domain TEXT,
    competitor_urls JSONB DEFAULT '[]'::jsonb,
    own_site_data JSONB DEFAULT '{}'::jsonb,
    competitors_data JSONB DEFAULT '{}'::jsonb,
    gaps_summary TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.v2_competitor_analyses ADD COLUMN IF NOT EXISTS user_email TEXT;
ALTER TABLE public.v2_competitor_analyses ADD COLUMN IF NOT EXISTS own_url TEXT;
ALTER TABLE public.v2_competitor_analyses ADD COLUMN IF NOT EXISTS own_domain TEXT;
ALTER TABLE public.v2_competitor_analyses ADD COLUMN IF NOT EXISTS own_site_data JSONB;
ALTER TABLE public.v2_competitor_analyses ADD COLUMN IF NOT EXISTS competitors_data JSONB;
ALTER TABLE public.v2_competitor_analyses ADD COLUMN IF NOT EXISTS gaps_summary TEXT;
ALTER TABLE public.v2_competitor_analyses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all v2_competitor_analyses" ON public.v2_competitor_analyses;
CREATE POLICY "Allow all v2_competitor_analyses" ON public.v2_competitor_analyses FOR ALL USING (true) WITH CHECK (true);

-- 5. v2_aeo_audits
CREATE TABLE IF NOT EXISTS public.v2_aeo_audits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_email TEXT,
    domain TEXT,
    url TEXT,
    brand_name TEXT,
    aeo_score INT DEFAULT 0,
    audit_data JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.v2_aeo_audits ADD COLUMN IF NOT EXISTS user_email TEXT;
ALTER TABLE public.v2_aeo_audits ADD COLUMN IF NOT EXISTS domain TEXT;
ALTER TABLE public.v2_aeo_audits ADD COLUMN IF NOT EXISTS url TEXT;
ALTER TABLE public.v2_aeo_audits ADD COLUMN IF NOT EXISTS brand_name TEXT;
ALTER TABLE public.v2_aeo_audits ADD COLUMN IF NOT EXISTS aeo_score INT;
ALTER TABLE public.v2_aeo_audits ADD COLUMN IF NOT EXISTS audit_data JSONB;
ALTER TABLE public.v2_aeo_audits ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all v2_aeo_audits" ON public.v2_aeo_audits;
CREATE POLICY "Allow all v2_aeo_audits" ON public.v2_aeo_audits FOR ALL USING (true) WITH CHECK (true);

-- 6. v2_source_intelligence
CREATE TABLE IF NOT EXISTS public.v2_source_intelligence (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_email TEXT,
    domain TEXT,
    url TEXT,
    brand_name TEXT,
    scan_data JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.v2_source_intelligence ADD COLUMN IF NOT EXISTS user_email TEXT;
ALTER TABLE public.v2_source_intelligence ADD COLUMN IF NOT EXISTS domain TEXT;
ALTER TABLE public.v2_source_intelligence ADD COLUMN IF NOT EXISTS url TEXT;
ALTER TABLE public.v2_source_intelligence ADD COLUMN IF NOT EXISTS brand_name TEXT;
ALTER TABLE public.v2_source_intelligence ADD COLUMN IF NOT EXISTS scan_data JSONB;
ALTER TABLE public.v2_source_intelligence ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all v2_source_intelligence" ON public.v2_source_intelligence;
CREATE POLICY "Allow all v2_source_intelligence" ON public.v2_source_intelligence FOR ALL USING (true) WITH CHECK (true);

-- 7. v2_seo_snapshots
CREATE TABLE IF NOT EXISTS public.v2_seo_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_email TEXT,
    domain TEXT,
    url TEXT,
    region TEXT DEFAULT 'GLOBAL',
    seo_score INT DEFAULT 0,
    score_breakdown JSONB DEFAULT '{}'::jsonb,
    issues JSONB DEFAULT '[]'::jsonb,
    ai_readiness_score INT DEFAULT 0,
    title TEXT,
    meta_description TEXT,
    word_count INT DEFAULT 0,
    h1_count INT DEFAULT 0,
    status_code INT DEFAULT 200,
    canonical_url TEXT,
    language TEXT DEFAULT 'en',
    schema_types JSONB DEFAULT '[]'::jsonb,
    full_result JSONB DEFAULT '{}'::jsonb,
    scraped_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.v2_seo_snapshots ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all v2_seo_snapshots" ON public.v2_seo_snapshots;
CREATE POLICY "Allow all v2_seo_snapshots" ON public.v2_seo_snapshots FOR ALL USING (true) WITH CHECK (true);

-- 8. v2_ai_bot_audits
CREATE TABLE IF NOT EXISTS public.v2_ai_bot_audits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_email TEXT,
    target_url TEXT,
    domain TEXT,
    bot_score INT DEFAULT 0,
    audit_data JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.v2_ai_bot_audits ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all v2_ai_bot_audits" ON public.v2_ai_bot_audits;
CREATE POLICY "Allow all v2_ai_bot_audits" ON public.v2_ai_bot_audits FOR ALL USING (true) WITH CHECK (true);

-- 9. v2_brand_mentions
CREATE TABLE IF NOT EXISTS public.v2_brand_mentions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_email TEXT,
    brand_name TEXT,
    domain TEXT,
    total_mentions INT DEFAULT 0,
    mentions_data JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.v2_brand_mentions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all v2_brand_mentions" ON public.v2_brand_mentions;
CREATE POLICY "Allow all v2_brand_mentions" ON public.v2_brand_mentions FOR ALL USING (true) WITH CHECK (true);

-- 10. v2_content_gaps
CREATE TABLE IF NOT EXISTS public.v2_content_gaps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_email TEXT,
    target_keyword TEXT,
    user_url TEXT,
    coverage_rate INT DEFAULT 0,
    gap_data JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.v2_content_gaps ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all v2_content_gaps" ON public.v2_content_gaps;
CREATE POLICY "Allow all v2_content_gaps" ON public.v2_content_gaps FOR ALL USING (true) WITH CHECK (true);

-- 11. v2_crawl_runs
CREATE TABLE IF NOT EXISTS public.v2_crawl_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    domain_id UUID REFERENCES public.v2_domains(id) ON DELETE CASCADE,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    finished_at TIMESTAMPTZ,
    status TEXT DEFAULT 'pending',
    pages_discovered INT DEFAULT 0,
    pages_crawled INT DEFAULT 0,
    source TEXT DEFAULT 'manual'
);
ALTER TABLE public.v2_crawl_runs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all v2_crawl_runs" ON public.v2_crawl_runs;
CREATE POLICY "Allow all v2_crawl_runs" ON public.v2_crawl_runs FOR ALL USING (true) WITH CHECK (true);

-- 12. v2_pages
CREATE TABLE IF NOT EXISTS public.v2_pages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    crawl_run_id UUID REFERENCES public.v2_crawl_runs(id) ON DELETE CASCADE,
    domain_id UUID REFERENCES public.v2_domains(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    status_code INT DEFAULT 200,
    title TEXT,
    meta_description TEXT,
    h1_count INT DEFAULT 0,
    heading_structure_json JSONB DEFAULT '[]'::jsonb,
    word_count INT DEFAULT 0,
    schema_types_json JSONB DEFAULT '[]'::jsonb,
    internal_links_count INT DEFAULT 0,
    broken_links_json JSONB DEFAULT '[]'::jsonb,
    raw_markdown_ref TEXT,
    extracted_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.v2_pages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all v2_pages" ON public.v2_pages;
CREATE POLICY "Allow all v2_pages" ON public.v2_pages FOR ALL USING (true) WITH CHECK (true);

-- 13. v2_page_scores
CREATE TABLE IF NOT EXISTS public.v2_page_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    page_id UUID REFERENCES public.v2_pages(id) ON DELETE CASCADE,
    structural_score INT DEFAULT 0,
    semantic_score INT DEFAULT 0,
    overall_score INT DEFAULT 0,
    issues_json JSONB DEFAULT '[]'::jsonb,
    scored_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.v2_page_scores ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all v2_page_scores" ON public.v2_page_scores;
CREATE POLICY "Allow all v2_page_scores" ON public.v2_page_scores FOR ALL USING (true) WITH CHECK (true);

-- 14. v2_monitoring_prompts
CREATE TABLE IF NOT EXISTS public.v2_monitoring_prompts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID REFERENCES public.v2_workspaces(id) ON DELETE CASCADE,
    prompt_text TEXT NOT NULL,
    intent_tag TEXT DEFAULT 'general',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.v2_monitoring_prompts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all v2_monitoring_prompts" ON public.v2_monitoring_prompts;
CREATE POLICY "Allow all v2_monitoring_prompts" ON public.v2_monitoring_prompts FOR ALL USING (true) WITH CHECK (true);

-- 15. v2_alerts
CREATE TABLE IF NOT EXISTS public.v2_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID REFERENCES public.v2_workspaces(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    payload_json JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    read_at TIMESTAMPTZ
);
ALTER TABLE public.v2_alerts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all v2_alerts" ON public.v2_alerts;
CREATE POLICY "Allow all v2_alerts" ON public.v2_alerts FOR ALL USING (true) WITH CHECK (true);
