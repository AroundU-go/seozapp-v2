import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Footer } from '@/components/ui/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowRight, Sparkles, CheckCircle2, Building2 } from 'lucide-react';

export default function AiCitationTrackingToolForAgencies() {
  const router = useRouter();
  const { user } = useAuth();

  return (
    <>
      <Head>
        <title>AI Citation Tracking Tool for Agencies | SEOzapp</title>
        <meta
          name="description"
          content="What agencies actually need from an AI citation tracking tool — multi-client reporting, competitor benchmarking, and a workflow that scales past client three with SEOzapp."
        />
        <meta
          name="keywords"
          content="ai citation tracking tool for agencies, agency ai seo tool, multi client llm tracking, chatgpt tracking for agencies, seozapp"
        />
        <link rel="canonical" href="https://www.seozapp.com/ai-citation-tracking-tool-for-agencies" />
        <meta property="og:title" content="AI Citation Tracking Tool for Agencies" />
        <meta
          property="og:description"
          content="Multi-client reporting, competitor benchmarking, and automated LLM prompt monitoring built for digital marketing agencies."
        />
        <meta property="og:url" content="https://www.seozapp.com/ai-citation-tracking-tool-for-agencies" />
        <meta property="og:type" content="article" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Article',
              headline: 'AI Citation Tracking Tool for Agencies',
              description: 'What agencies actually need from an AI citation tracking tool — multi-client reporting, competitor benchmarking, and a workflow that scales past client three.',
              datePublished: '2026-08-08',
              author: {
                '@type': 'Organization',
                name: 'SEOzapp',
              },
              publisher: {
                '@type': 'Organization',
                name: 'SEOzapp',
                url: 'https://www.seozapp.com',
              },
              mainEntityOfPage: {
                '@type': 'WebPage',
                '@id': 'https://www.seozapp.com/ai-citation-tracking-tool-for-agencies',
              },
            }),
          }}
        />
      </Head>

      <div className="min-h-screen bg-[#ffffff] text-[#17191c] font-sohne selection:bg-[#fbe1d1] selection:text-[#5d2a1a] flex flex-col justify-between">
        {/* Navigation Bar */}
        <nav className="fixed top-0 left-0 right-0 z-50 bg-[#ffffff]/90 backdrop-blur-md border-b border-[#17191c]/10 py-4">
          <div className="max-w-[1200px] mx-auto px-6 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5">
              <img src="/seozapp-logo.jpeg" alt="SEOzapp Logo" className="w-8 h-8 rounded-lg object-cover shadow-sm" />
              <span className="font-signifier text-2xl font-normal text-[#17191c] tracking-tight">
                SEOzapp
              </span>
            </Link>
            <div className="flex items-center gap-4">
              <Link
                href="https://cal.com/uddipan"
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:inline-flex text-[14px] font-medium text-[#17191c] hover:bg-[#fafafb] transition-colors border border-[#17191c]/20 px-4 py-2 rounded-full"
              >
                Book a demo
              </Link>
              {user ? (
                <button
                  onClick={() => router.push('/dashboard')}
                  className="bg-[#17191c] text-[#ffffff] rounded-full px-5 py-2 text-[14px] font-normal hover:bg-[#17191c]/90 transition-all flex items-center gap-1.5"
                >
                  <span>Go to Dashboard</span>
                  <ArrowRight className="w-4 h-4 text-[#fbe1d1]" />
                </button>
              ) : (
                <button
                  onClick={() => router.push('/auth')}
                  className="bg-[#17191c] text-[#ffffff] rounded-full px-5 py-2 text-[14px] font-normal hover:bg-[#17191c]/90 transition-all"
                >
                  Log in
                </button>
              )}
            </div>
          </div>
        </nav>

        {/* Article Body */}
        <main className="max-w-[800px] mx-auto px-6 pt-36 pb-24 w-full">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#fbe1d1] text-[#5d2a1a] text-xs font-semibold uppercase tracking-wider mb-6">
            <Building2 className="w-3.5 h-3.5" />
            <span>Agency Workflows</span>
          </div>

          <h1 className="font-signifier text-4xl sm:text-5xl font-normal mb-6 text-[#17191c] leading-tight">
            AI Citation Tracking Tool for Agencies
          </h1>

          <p className="text-[#777b86] text-xl font-normal leading-relaxed mb-8">
            Somewhere in the last year, &quot;how are we doing in AI search&quot; turned from a question one curious client asked into a question every client asks. If you&apos;re running an agency, typing category prompts by hand into ChatGPT for 12 clients before a weekly call doesn&apos;t scale past client three.
          </p>

          <div className="bg-[#fafafb] border border-[#17191c]/10 rounded-2xl p-6 mb-10 space-y-3">
            <p className="text-[#17191c] text-base font-semibold">
              Agencies don&apos;t just need AI mention checking — they need multi-client automation.
            </p>
            <p className="text-[#777b86] text-sm leading-relaxed">
              Every client expects their own site profiles, competitor sets, automated schedules, and clean reporting without seeing other accounts&apos; data mixed in.
            </p>
          </div>

          <hr className="my-10 border-[#17191c]/10" />

          {/* Section: Why agencies feel this differently */}
          <h2 className="font-signifier text-3xl font-normal mt-12 mb-6 text-[#17191c]">
            Why Agencies Need a Purpose-Built Citation Tracker
          </h2>
          <div className="space-y-4 text-[#777b86] text-lg leading-relaxed mb-8">
            <div className="bg-[#fafafb] border border-[#17191c]/10 rounded-2xl p-5 space-y-1">
              <h3 className="text-base font-bold text-[#17191c]">1. Multi-Site &amp; Competitor Mapping</h3>
              <p className="text-sm">Clean separation for every domain in your agency portfolio, enforcing 1:1 competitor mapping per site.</p>
            </div>
            <div className="bg-[#fafafb] border border-[#17191c]/10 rounded-2xl p-5 space-y-1">
              <h3 className="text-base font-bold text-[#17191c]">2. Cross-Engine AI Coverage</h3>
              <p className="text-sm">Checking only ChatGPT leaves huge blind spots in Perplexity, Gemini, Claude, and Google AI Overviews.</p>
            </div>
            <div className="bg-[#fafafb] border border-[#17191c]/10 rounded-2xl p-5 space-y-1">
              <h3 className="text-base font-bold text-[#17191c]">3. Position Coordinates &amp; Sentiment Analysis</h3>
              <p className="text-sm">Distinguishes #1 direct answer citations from footnote mentions and evaluates brand tone (positive, neutral, critical).</p>
            </div>
          </div>

          <hr className="my-10 border-[#17191c]/10" />

          {/* Section: How SEOzapp fits */}
          <h2 className="font-signifier text-3xl font-normal mt-12 mb-6 text-[#17191c]">
            How SEOzapp Powers Agency Workflows
          </h2>
          <p className="mb-6 text-[#777b86] text-lg leading-relaxed">
            Set up a client&apos;s buyer prompts and named competitors once in{' '}
            <a href="https://www.seozapp.com" className="font-semibold text-[#17191c] underline hover:text-[#5d2a1a] transition-colors">
              SEOzapp
            </a>
            , and the platform runs them on a recurring schedule across ChatGPT, Perplexity, Gemini, Claude, and Google AI Overviews.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
            {[
              'Multi-site management (Starter: 2, Pro: 5)',
              '1:1 competitor mapping per domain',
              'Citation position & sentiment scoring',
              'AI bot access & crawlability auditing',
            ].map((feature, idx) => (
              <div key={idx} className="flex items-center gap-2 text-sm text-[#17191c] bg-[#fafafb] border border-[#17191c]/10 rounded-xl p-3.5 font-medium">
                <CheckCircle2 className="w-4 h-4 text-[#5d2a1a] flex-shrink-0" />
                <span>{feature}</span>
              </div>
            ))}
          </div>

          {/* CTA Banner */}
          <div className="bg-[#17191c] text-[#ffffff] rounded-3xl p-8 sm:p-10 my-12 text-center space-y-6 shadow-xl relative overflow-hidden">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#fbe1d1] bg-white/10 px-3.5 py-1 rounded-full inline-block">
              Built for Agencies &amp; Growth Teams
            </span>
            <h3 className="font-signifier text-3xl sm:text-4xl font-normal tracking-tight">
              Scale AI Citation Tracking Across All Your Clients
            </h3>
            <p className="text-white/70 text-base max-w-xl mx-auto font-normal">
              Stop running manual prompt checks.{' '}
              <a href="https://www.seozapp.com" className="font-semibold text-[#fbe1d1] underline hover:text-white transition-colors">
                SEOzapp
              </a>{' '}
              automates LLM citation monitoring, competitor benchmarks, and crawlability checks for client portfolios.
            </p>
            <div className="pt-2">
              <button
                onClick={() => router.push('/auth')}
                className="bg-[#ffffff] text-[#17191c] hover:bg-[#fafafb] rounded-full px-8 py-3.5 text-sm font-semibold transition-all shadow-md inline-flex items-center gap-2"
              >
                <span>Start Free Audit</span>
                <ArrowRight className="w-4 h-4 text-[#17191c]" />
              </button>
            </div>
          </div>
        </main>

        {/* Standard v2 Footer */}
        <Footer />
      </div>
    </>
  );
}
