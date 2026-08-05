-- Supabase Migration for SEOzapp v2 (Separated v2_ tables)

CREATE TABLE IF NOT EXISTS v2_workspaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  owner_user_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS v2_domains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES v2_workspaces(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  is_competitor BOOLEAN DEFAULT FALSE,
  added_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS v2_crawl_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  domain_id UUID REFERENCES v2_domains(id) ON DELETE CASCADE,
  firecrawl_job_id TEXT,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  finished_at TIMESTAMPTZ,
  status TEXT DEFAULT 'pending', -- pending, crawling, completed, failed
  pages_discovered INT DEFAULT 0,
  pages_crawled INT DEFAULT 0,
  sample_rate INT,
  source TEXT DEFAULT 'manual' -- manual, scheduled
);

CREATE TABLE IF NOT EXISTS v2_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  crawl_run_id UUID REFERENCES v2_crawl_runs(id) ON DELETE CASCADE,
  domain_id UUID REFERENCES v2_domains(id) ON DELETE CASCADE,
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

CREATE TABLE IF NOT EXISTS v2_page_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id UUID REFERENCES v2_pages(id) ON DELETE CASCADE,
  structural_score INT DEFAULT 0,
  semantic_score INT DEFAULT 0,
  overall_score INT DEFAULT 0,
  issues_json JSONB DEFAULT '[]'::jsonb,
  scored_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS v2_monitoring_prompts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES v2_workspaces(id) ON DELETE CASCADE,
  prompt_text TEXT NOT NULL,
  intent_tag TEXT DEFAULT 'general',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS v2_prompt_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt_id UUID REFERENCES v2_monitoring_prompts(id) ON DELETE CASCADE,
  run_at TIMESTAMPTZ DEFAULT NOW(),
  llm_provider TEXT DEFAULT 'kimi',
  raw_response_text TEXT,
  brand_mentioned BOOLEAN DEFAULT FALSE,
  competitor_mentions_json JSONB DEFAULT '{}'::jsonb,
  position_estimate TEXT,
  sentiment TEXT DEFAULT 'neutral'
);

CREATE TABLE IF NOT EXISTS v2_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES v2_workspaces(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  payload_json JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  read_at TIMESTAMPTZ
);

-- SEO Snapshots: stores per-URL technical SEO audit results
CREATE TABLE IF NOT EXISTS v2_seo_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  domain TEXT NOT NULL,
  url TEXT NOT NULL,
  user_email TEXT,
  seo_score INT DEFAULT 0,
  ai_readiness_score INT,
  title TEXT,
  meta_description TEXT,
  word_count INT DEFAULT 0,
  h1_count INT DEFAULT 0,
  schema_types_json JSONB DEFAULT '[]'::jsonb,
  canonical_url TEXT,
  status_code INT DEFAULT 200,
  language TEXT DEFAULT 'en',
  citation_data JSONB,
  full_result_json JSONB,
  scraped_at TIMESTAMPTZ DEFAULT NOW()
);

-- Competitor Analyses: stores benchmark comparison results
CREATE TABLE IF NOT EXISTS v2_competitor_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email TEXT,
  own_url TEXT NOT NULL,
  own_site_data JSONB,
  competitors_data JSONB,
  gaps_summary JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- AEO Audits: AI Engine Optimization audit results
CREATE TABLE IF NOT EXISTS v2_aeo_audits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email TEXT,
  url TEXT NOT NULL,
  domain TEXT,
  audit_result JSONB,
  overall_score INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Source Intelligence: outbound link authority analysis
CREATE TABLE IF NOT EXISTS v2_source_intelligence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email TEXT,
  url TEXT NOT NULL,
  domain TEXT,
  scan_result JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
