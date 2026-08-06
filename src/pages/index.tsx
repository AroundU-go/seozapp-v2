import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Check, Search, Sparkles, Globe, ChevronRight, BarChart3, TrendingUp, Layers, Users, Share2, SearchIcon, Cpu, LineChart } from 'lucide-react';
import {
  AIReadinessCard,
  CitationTrendCard,
  CompetitorTableCard,
  ComposerCard,
} from '@/components/landing/HeroArtifacts';
import {
  PromptMonitoringArtifact,
  BulkCrawlArtifact,
  CompetitorAnalysisArtifact,
} from '@/components/landing/FeatureArtifacts';
import { PricingSection } from '@/components/landing/PricingSection';
import { Footer } from '@/components/ui/Footer';
import { useAuth } from '@/contexts/AuthContext';

const HERO_AI_ENGINES = [
  {
    name: 'ChatGPT',
    provider: 'OpenAI',
    icon: '/icon2.png',
    textColor: 'text-[#10a37f]',
  },
  {
    name: 'Perplexity',
    provider: 'Perplexity AI',
    icon: '/icon3.png',
    textColor: 'text-[#17191c]',
  },
  {
    name: 'Claude',
    provider: 'Anthropic',
    icon: '/icon1.png',
    textColor: 'text-[#d97706]',
  },
  {
    name: 'Gemini',
    provider: 'Google AI',
    icon: '/icon4.png',
    textColor: 'text-[#4285f4]',
  },
  {
    name: 'AI Overviews',
    provider: 'Google AI',
    icon: '/google-logo.png',
    textColor: 'text-[#ea4335]',
  },
];

export default function SteepLandingPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [currentEngineIndex, setCurrentEngineIndex] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showAlertBanner, setShowAlertBanner] = useState(true);

  useEffect(() => {
    const alertTimer = setTimeout(() => {
      setShowAlertBanner(false);
    }, 10000);
    return () => clearTimeout(alertTimer);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 80);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentEngineIndex((prev) => (prev + 1) % HERO_AI_ENGINES.length);
    }, 2200);
    return () => clearInterval(timer);
  }, []);

  const activeEngine = HERO_AI_ENGINES[currentEngineIndex];

  return (
    <>
      <Head>
        <title>SEOzapp — AI-Search Visibility Platform (SEO + AEO/GEO)</title>
        <meta
          name="description"
          content="Continuous SEO health tracking, LLM citation monitoring, Competitor strategy analysis and Source intelligence - built for modern search visibility."
        />
      </Head>

      <div className="min-h-screen bg-[#ffffff] text-[#17191c] font-sohne selection:bg-[#fbe1d1] selection:text-[#5d2a1a]">
        {/* Extreme Top 10-Second Alert Banner */}
        <AnimatePresence>
          {showAlertBanner && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-[#17191c] text-[#ffffff] text-xs sm:text-sm py-2.5 px-4 text-center fixed top-0 left-0 right-0 z-[60] font-normal border-b border-[#ffffff]/10 flex items-center justify-center gap-1.5 shadow-sm"
            >
              <span>
                This is the new version of seozapp. If you're an existing customer of our on-page seo analysis tool visit -{' '}
                <a
                  href="https://v1.seozapp.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline font-medium text-[#fbe1d1] hover:text-[#ffffff] transition-colors"
                >
                  v1.seozapp.com
                </a>
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 1. Dynamic Navigation Bar */}
        <nav
          className={`fixed left-0 right-0 z-50 transition-all duration-300 ${
            showAlertBanner ? 'top-[41px]' : 'top-0'
          } ${
            isScrolled
              ? 'bg-[#ffffff]/85 backdrop-blur-md border-b border-[#17191c]/10 shadow-sm py-4'
              : 'bg-transparent border-b border-transparent py-5'
          }`}
        >
          <div className="max-w-[1200px] mx-auto px-6 flex items-center justify-between">
            {/* Logo Left */}
            <Link href="/" className="flex items-center gap-2.5">
              <img src="/seozapp-logo.jpeg" alt="SEOzapp Logo" className="w-8 h-8 rounded-lg object-cover shadow-sm" />
              <span className="font-signifier text-2xl font-normal text-[#17191c] tracking-tight">
                SEOzapp
              </span>
            </Link>

            {/* Links Center */}
            <div className="hidden md:flex items-center gap-8 text-[15px] font-normal text-[#17191c]">
              <Link href="/" className="hover:text-[#777b86] transition-colors">
                Home
              </Link>
              <a href="#features" className="hover:text-[#777b86] transition-colors">
                Features
              </a>
              <a href="#how-it-works" className="hover:text-[#777b86] transition-colors">
                How it works
              </a>
              <a href="#pricing" className="hover:text-[#777b86] transition-colors">
                Pricing
              </a>
              <Link href="/blog" className="hover:text-[#777b86] transition-colors">
                Blog
              </Link>
            </div>

            {/* CTAs Right */}
            <div className="flex items-center gap-3">
              <a
                href="https://cal.com/uddipan"
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:inline-flex text-[14px] font-medium text-[#17191c] hover:bg-[#fafafb] transition-colors border border-[#17191c]/20 px-4 py-2 rounded-full"
              >
                Book a demo
              </a>
              {user ? (
                <button
                  onClick={() => router.push('/dashboard')}
                  className="bg-[#17191c] text-[#ffffff] rounded-full px-6 py-2.5 text-[15px] font-normal hover:bg-[#17191c]/90 transition-all shadow-sm flex items-center gap-2"
                >
                  <span>Go to Dashboard</span>
                  <ArrowRight className="w-4 h-4 text-[#fbe1d1]" />
                </button>
              ) : (
                <>
                  <button
                    onClick={() => router.push('/auth')}
                    className="text-[15px] font-normal text-[#17191c] hover:text-[#777b86] transition-colors px-3 py-2"
                  >
                    Log in
                  </button>
                  <button
                    onClick={() => router.push('/auth')}
                    className="bg-[#17191c] text-[#ffffff] rounded-full px-5 py-2.5 text-[15px] font-normal hover:bg-[#17191c]/90 transition-all shadow-sm"
                  >
                    Get started
                  </button>
                </>
              )}
            </div>
          </div>
        </nav>

        {/* 2. Hero Section */}
        <section className={`${showAlertBanner ? 'pt-44 sm:pt-44' : 'pt-36'} pb-24 px-6 overflow-hidden relative bg-[#ffffff] transition-all duration-300`}>
          {/* Subtle Ambient Mesh Layer */}
          <div
            className="absolute inset-0 pointer-events-none z-0"
            style={{
              background: `
                radial-gradient(circle at 15% 20%, rgba(252, 231, 243, 0.65) 0%, rgba(252, 231, 243, 0) 55%),
                radial-gradient(circle at 85% 25%, rgba(224, 242, 254, 0.75) 0%, rgba(224, 242, 254, 0) 60%),
                radial-gradient(circle at 50% 65%, rgba(255, 255, 255, 0.9) 0%, rgba(250, 250, 251, 0.4) 100%),
                #ffffff
              `,
            }}
          />

          <div className="max-w-[1200px] mx-auto text-center relative z-10">
            {/* Main Headline with Box-Less Changing Badges */}
            <div className="max-w-4xl mx-auto mb-6 pt-4 px-2 sm:px-0">
              <h1 className="font-signifier font-normal text-3xl sm:text-5xl lg:text-7xl tracking-tight text-[#17191c] leading-[1.25] sm:leading-[1.2]">
                <span className="inline sm:whitespace-nowrap">Get your brand recommended by</span>{' '}
                <span className="inline-flex items-center relative min-w-[150px] sm:min-w-[280px] text-left align-middle mt-1 sm:mt-0">
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={activeEngine.name}
                      initial={{ y: 12, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: -12, opacity: 0 }}
                      transition={{ duration: 0.3, ease: 'easeOut' }}
                      className={`inline-flex items-center gap-2 sm:gap-3 ${activeEngine.textColor} font-sans font-semibold text-[26px] sm:text-[44px] lg:text-[54px] whitespace-nowrap`}
                    >
                      <img
                        src={activeEngine.icon}
                        alt={activeEngine.name}
                        className="w-7 h-7 sm:w-10 sm:h-10 lg:w-11 lg:h-11 rounded-lg sm:rounded-xl object-contain flex-shrink-0 shadow-sm"
                      />
                      <span>{activeEngine.name}</span>
                    </motion.span>
                  </AnimatePresence>
                </span>
              </h1>

              <p className="text-[17px] sm:text-[20px] text-[#777b86] leading-[1.4] max-w-3xl mx-auto mb-8 font-normal mt-4">
                Continuous SEO health tracking, LLM citation monitoring, Competitor strategy analysis and Source intelligence - built for modern search visibility.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
                {user ? (
                  <button
                    onClick={() => router.push('/dashboard')}
                    className="bg-[#17191c] text-[#ffffff] rounded-full px-9 py-4 text-[16px] font-medium hover:bg-[#17191c]/90 transition-all shadow-md flex items-center gap-2.5"
                  >
                    <span>Go to Dashboard</span>
                    <ArrowRight className="w-5 h-5 text-[#fbe1d1]" />
                  </button>
                ) : (
                  <button
                    onClick={() => router.push('/auth')}
                    className="bg-[#17191c] text-[#ffffff] rounded-full px-8 py-3.5 text-[16px] font-normal hover:bg-[#17191c]/90 transition-all w-full sm:w-auto"
                  >
                    Start free audit
                  </button>
                )}
                <a
                  href="https://cal.com/uddipan"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[#ffffff] text-[#17191c] border border-[#17191c]/20 hover:border-[#17191c] rounded-full px-8 py-3.5 text-[16px] font-normal transition-all w-full sm:w-auto inline-flex items-center justify-center gap-2 shadow-sm"
                >
                  <span>Book a demo</span>
                  <ArrowRight className="w-4 h-4 text-[#17191c]" />
                </a>
              </div>
            </div>

            {/* 4 Product UI Cards Grid */}
            <div className="relative mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-20">
              <AIReadinessCard />
              <CitationTrendCard />
              <CompetitorTableCard />
              <ComposerCard />
            </div>

            {/* Dashboard Image */}
            <div className="pt-4 max-w-6xl sm:max-w-[1180px] mx-auto">
              <div className="relative rounded-2xl overflow-hidden border border-[#17191c]/12 shadow-[0_30px_90px_-15px_rgba(0,0,0,0.2)] bg-[#ffffff] hover:shadow-[0_35px_100px_-15px_rgba(0,0,0,0.25)] transition-shadow duration-500">
                <img
                  src="/seozapp-v2-dashboard.png"
                  alt="SEOzapp v2 Enterprise Dashboard"
                  className="w-full h-auto object-cover object-top block"
                />
              </div>
            </div>
          </div>
        </section>

        {/* 3. Product Artifact Showcase Features Section */}
        <section id="features" className="py-24 px-6 bg-[#fafafb] border-t border-[#17191c]/10">
          <div className="max-w-[1200px] mx-auto space-y-24">
            <div className="text-center max-w-3xl mx-auto space-y-4">
              <span className="text-xs font-semibold text-[#5d2a1a] bg-[#fbe1d1] px-3 py-1 rounded-full uppercase tracking-wider">
                Full-Stack Search Visibility
              </span>
              <h2 className="font-signifier font-normal text-4xl sm:text-5xl tracking-tight text-[#17191c]">
                Everything you need to rank on Google &amp; dominate AI Search
              </h2>
            </div>

            {/* Feature 1: Technical SEO Tracking */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              <div className="lg:col-span-5 space-y-4">
                <span className="text-xs font-semibold uppercase text-[#979799]">Feature 01</span>
                <h3 className="text-3xl font-semibold text-[#17191c]">Technical SEO Tracking</h3>
                <p className="text-[#777b86] text-base leading-relaxed">
                  Continuous automated snapshot audits evaluating 25+ critical technical &amp; semantic ranking signals. Advanced AI algorithms analyze DOM hierarchy, meta structures, indexability rules, and heading flow in real time. Track historical score drifts, receive instant anomaly alerts, and fix broken link vectors before search engine crawlers impact your organic visibility.
                </p>
              </div>
              <div className="lg:col-span-7">
                <img
                  src="/seo-tracking-dashboard.jpeg"
                  alt="SEOzapp Technical SEO Tracking Dashboard"
                  className="w-full rounded-2xl border border-[#fbe1d1] shadow-[0_20px_60px_-10px_rgba(251,225,209,0.9)] hover:shadow-[0_30px_70px_rgba(251,225,209,1)] transition-shadow duration-300"
                />
              </div>
            </div>

            {/* Feature 2: Multi LLM Prompt Monitoring */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              <div className="lg:col-span-7 order-2 lg:order-1">
                <img
                  src="/prompt-tracking.jpeg"
                  alt="Multi LLM Prompt Monitoring Dashboard"
                  className="w-full rounded-2xl border border-[#fbe1d1] shadow-[0_20px_60px_-10px_rgba(251,225,209,0.9)] hover:shadow-[0_30px_70px_rgba(251,225,209,1)] transition-shadow duration-300"
                />
              </div>
              <div className="lg:col-span-5 order-1 lg:order-2 space-y-4">
                <div className="flex items-center gap-2.5">
                  <span className="text-xs font-semibold uppercase text-[#979799]">Feature 02</span>
                </div>
                <h3 className="text-3xl font-semibold text-[#17191c]">Multi LLM Prompt Monitoring</h3>
                <p className="text-[#777b86] text-base leading-relaxed">
                  Scheduled high-intent search query prompts automated across ChatGPT, Perplexity, Claude, Gemini, and Google AI Overviews powered by live Apify Actor execution. Extract real-time <strong className="text-[#17191c] font-semibold">Competitor Benchmarking</strong>, pinpoint <strong className="text-[#17191c] font-semibold">Rank &amp; Citation Placement Coordinates</strong> (#1 position, Top 3, or cited source), and perform <strong className="text-[#17191c] font-semibold">AI Response Sentiment Analysis</strong> (positive, neutral, critical) to dominate generative answer engines.
                </p>
              </div>
            </div>

            {/* Feature 3: Competitor Intelligence */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              <div className="lg:col-span-7 order-2 lg:order-1">
                <img
                  src="/competitor-tracking.jpeg"
                  alt="Competitor Intelligence Benchmarking Dashboard"
                  className="w-full rounded-2xl border border-[#fbe1d1] shadow-[0_20px_60px_-10px_rgba(251,225,209,0.9)] hover:shadow-[0_30px_70px_rgba(251,225,209,1)] transition-shadow duration-300"
                />
              </div>
              <div className="lg:col-span-5 order-1 lg:order-2 space-y-4">
                <span className="text-xs font-semibold uppercase text-[#979799]">Feature 03</span>
                <h3 className="text-3xl font-semibold text-[#17191c]">Competitor Intelligence</h3>
                <p className="text-[#777b86] text-base leading-relaxed">
                  Side-by-side domain benchmarking driven by competitive AI analytics. Compare your site against market rivals to analyze AI Readiness scores, structural health, semantic topic coverage gaps, and structured schema adoption rates to strategically steal share of voice across generative answer engines.
                </p>
              </div>
            </div>

            {/* Feature 4: AI Citation and GEO */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              <div className="lg:col-span-5 space-y-4">
                <span className="text-xs font-semibold uppercase text-[#979799]">Feature 04</span>
                <h3 className="text-3xl font-semibold text-[#17191c]">AI Citation and GEO</h3>
                <p className="text-[#777b86] text-base leading-relaxed">
                  Comprehensive Generative Engine Optimization (GEO) suite built to maximize LLM citations. AI-powered semantic scoring measures direct answer clarity, evaluates passage quoteability, generates optimized <code className="bg-[#17191c]/5 px-1.5 py-0.5 rounded text-sm font-mono text-[#17191c]">/llms.txt</code> context manifests, and delivers targeted prompt trigger strategies to position your brand as the primary reference.
                </p>
              </div>
              <div className="lg:col-span-7">
                <img
                  src="/aeo-dashboard.jpeg"
                  alt="AI Citation and GEO Optimization Dashboard"
                  className="w-full rounded-2xl border border-[#fbe1d1] shadow-[0_20px_60px_-10px_rgba(251,225,209,0.9)] hover:shadow-[0_30px_70px_rgba(251,225,209,1)] transition-shadow duration-300"
                />
              </div>
            </div>

            {/* Feature 5: AI Crawlability & Bot Access Audit */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              <div className="lg:col-span-7 order-2 lg:order-1">
                <div className="bg-[#ffffff] rounded-2xl p-8 border border-[#17191c]/10 shadow-[0_20px_60px_-10px_rgba(0,0,0,0.05)] space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#17191c] bg-[#fafafb] border border-[#17191c]/10 px-3 py-1 rounded-full uppercase">
                      Robots &amp; Meta Crawler Inspection
                    </span>
                    <span className="text-xs font-semibold text-[#10a37f] bg-[#10a37f]/10 border border-[#10a37f]/20 px-2.5 py-0.5 rounded-full">
                      Zero Cost • High Speed
                    </span>
                  </div>
                  <h4 className="text-xl font-semibold text-[#17191c]">GPTBot, ClaudeBot &amp; PerplexityBot Access Matrix</h4>
                  <p className="text-sm text-[#777b86] leading-relaxed">
                    Inspect whether major AI web crawlers (GPTBot, ClaudeBot, PerplexityBot, Google-Extended, ByteSpider, and CCBot) can access and extract content from your domain without robots.txt or meta tag restrictions.
                  </p>
                </div>
              </div>
              <div className="lg:col-span-5 order-1 lg:order-2 space-y-4">
                <span className="text-xs font-semibold uppercase text-[#979799]">Feature 05</span>
                <h3 className="text-3xl font-semibold text-[#17191c]">AI Crawlability &amp; Bot Access Audit</h3>
                <p className="text-[#777b86] text-base leading-relaxed">
                  Real-time crawler inspection ensuring AI bots can reach your site. Audit <code className="bg-[#17191c]/5 px-1.5 py-0.5 rounded text-sm font-mono text-[#17191c]">robots.txt</code> user-agent rules, meta robots tags, and content extraction pipelines ahead of LLM citation tracking.
                </p>
              </div>
            </div>

            {/* Feature 6: Brand Mention & Backlink Intelligence */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              <div className="lg:col-span-5 space-y-4">
                <span className="text-xs font-semibold uppercase text-[#979799]">Feature 06</span>
                <h3 className="text-3xl font-semibold text-[#17191c]">Brand Mention &amp; Backlink Intelligence</h3>
                <p className="text-[#777b86] text-base leading-relaxed">
                  Deep web neural search discovering unlinked brand references, active backlinks, domain authority signals, and sentiment scores. Automatically surfaces high-priority outreach leads and generates tailored 1-click pitch templates.
                </p>
              </div>
              <div className="lg:col-span-7">
                <img
                  src="/brand-mention-feature.jpeg"
                  alt="Brand Mention &amp; Backlink Intelligence Dashboard"
                  className="w-full rounded-2xl border border-[#fbe1d1] shadow-[0_20px_60px_-10px_rgba(251,225,209,0.9)] hover:shadow-[0_30px_70px_rgba(251,225,209,1)] transition-shadow duration-300"
                />
              </div>
            </div>
          </div>
        </section>

        {/* 4. Standalone "How It Works" Section */}
        <section id="how-it-works" className="py-24 px-6 bg-[#ffffff] border-t border-[#17191c]/10 scroll-mt-20">
          <div className="max-w-[1200px] mx-auto space-y-16">
            <div className="text-center max-w-3xl mx-auto space-y-4">
              <span className="text-xs font-semibold text-[#5d2a1a] bg-[#fbe1d1] px-3 py-1 rounded-full uppercase tracking-wider">
                Automated 3-Step Workflow
              </span>
              <h2 className="font-signifier font-normal text-4xl sm:text-5xl tracking-tight text-[#17191c]">
                How SEOzapp drives AI Search &amp; Google visibility
              </h2>
              <p className="text-[#777b86] text-lg font-normal">
                From deep page parsing to live prompt testing across 6 AI engines.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Step 1 */}
              <div className="bg-[#fafafb] rounded-3xl p-8 border border-[#17191c]/10 space-y-4 relative overflow-hidden group hover:border-[#17191c]/30 transition-all">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#5d2a1a] bg-[#fbe1d1] px-2.5 py-1 rounded-full uppercase">
                    Step 01
                  </span>
                  <SearchIcon className="w-5 h-5 text-[#777b86]" />
                </div>
                <h3 className="text-xl font-semibold text-[#17191c]">Deep Web Scrape &amp; Audit</h3>
                <p className="text-sm text-[#777b86] leading-relaxed">
                  Our high-speed ingestion pipeline extracts clean markdown, JSON-LD schema tags, and heading hierarchy across 25+ ranking factors.
                </p>
              </div>

              {/* Step 2 */}
              <div className="bg-[#fafafb] rounded-3xl p-8 border border-[#17191c]/10 space-y-4 relative overflow-hidden group hover:border-[#17191c]/30 transition-all">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#5d2a1a] bg-[#fbe1d1] px-2.5 py-1 rounded-full uppercase">
                    Step 02
                  </span>
                  <Cpu className="w-5 h-5 text-[#777b86]" />
                </div>
                <h3 className="text-xl font-semibold text-[#17191c]">Multi-LLM Prompt Execution</h3>
                <p className="text-sm text-[#777b86] leading-relaxed">
                  Scheduled query prompts run against ChatGPT, Perplexity, Claude, Grok AI, and Gemini to calculate citation frequency and mention position.
                </p>
              </div>

              {/* Step 3 */}
              <div className="bg-[#fafafb] rounded-3xl p-8 border border-[#17191c]/10 space-y-4 relative overflow-hidden group hover:border-[#17191c]/30 transition-all">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#5d2a1a] bg-[#fbe1d1] px-2.5 py-1 rounded-full uppercase">
                    Step 03
                  </span>
                  <LineChart className="w-5 h-5 text-[#777b86]" />
                </div>
                <h3 className="text-xl font-semibold text-[#17191c]">Generate `/llms.txt` &amp; Outrank</h3>
                <p className="text-sm text-[#777b86] leading-relaxed">
                  Deploy standardized <code className="bg-white px-1 py-0.5 rounded font-mono">/llms.txt</code> files, add Q&amp;A schema, and monitor your AI citation share vs competitors.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 5. Pricing Section */}
        <PricingSection />

        {/* 6. Footer Section */}
        <Footer />
      </div>
    </>
  );
}
