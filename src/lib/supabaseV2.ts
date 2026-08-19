import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ilmmqkfcotrmjjqbawhg.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlsbW1xa2Zjb3RybWpqcWJhd2hnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEyMTYwODQsImV4cCI6MjA4Njc5MjA4NH0.WiC981b2OZghhJ4Wj7rBSSN4k2dpGla-mG8EfQwqteE';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Public client for client-side standard ops
export const supabaseV2 = createClient(supabaseUrl, supabaseAnonKey);

// Admin service role client for background crawl jobs & prompt runners
export const supabaseV2Admin = serviceRoleKey
  ? createClient(supabaseUrl, serviceRoleKey)
  : supabaseV2;

// Table name constants enforcing v2 prefix separation
export const V2_TABLES = {
  WORKSPACES: 'v2_workspaces',
  DOMAINS: 'v2_domains',
  CRAWL_RUNS: 'v2_crawl_runs',
  PAGES: 'v2_pages',
  PAGE_SCORES: 'v2_page_scores',
  MONITORING_PROMPTS: 'v2_monitoring_prompts',
  PROMPT_RUNS: 'v2_prompt_runs',
  ALERTS: 'v2_alerts',
  SEO_SNAPSHOTS: 'v2_seo_snapshots',
  COMPETITORS: 'v2_competitor_analyses',
  AEO_AUDITS: 'v2_aeo_audits',
  SOURCE_INTELLIGENCE: 'v2_source_intelligence',
  AI_BOT_AUDITS: 'v2_ai_bot_audits',
  BRAND_MENTIONS: 'v2_brand_mentions',
  CONTENT_GAPS: 'v2_content_gaps',
  COMPETITOR_KEYWORDS: 'v2_competitor_keywords',
} as const;
