-- SQL Migration for 3 New Features (v2)
-- Paste this into Supabase SQL Editor: https://supabase.com/dashboard/project/ilmmqkfcotrmjjqbawhg/sql

-- 1. AI Bot Access Audits Table
CREATE TABLE IF NOT EXISTS public.v2_ai_bot_audits (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_email TEXT,
    target_url TEXT NOT NULL,
    domain TEXT NOT NULL,
    bot_score INT DEFAULT 0,
    audit_data JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Brand Mentions & Backlinks Table
CREATE TABLE IF NOT EXISTS public.v2_brand_mentions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_email TEXT,
    brand_name TEXT NOT NULL,
    domain TEXT,
    total_mentions INT DEFAULT 0,
    mentions_data JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Content Gaps Table
CREATE TABLE IF NOT EXISTS public.v2_content_gaps (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_email TEXT,
    target_keyword TEXT NOT NULL,
    user_url TEXT,
    coverage_rate INT DEFAULT 0,
    gap_data JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS and set public policies
ALTER TABLE public.v2_ai_bot_audits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.v2_brand_mentions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.v2_content_gaps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public all v2_ai_bot_audits" ON public.v2_ai_bot_audits FOR ALL USING (true);
CREATE POLICY "Allow public all v2_brand_mentions" ON public.v2_brand_mentions FOR ALL USING (true);
CREATE POLICY "Allow public all v2_content_gaps" ON public.v2_content_gaps FOR ALL USING (true);
