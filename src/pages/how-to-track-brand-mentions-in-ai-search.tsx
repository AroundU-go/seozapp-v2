import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Footer } from '@/components/ui/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';

export default function HowToTrackBrandMentionsInAiSearch() {
  const router = useRouter();
  const { user } = useAuth();

  return (
    <>
      <Head>
        <title>How to Track Brand Mentions in AI Search | SEOzapp</title>
        <meta
          name="description"
          content="A practical guide to monitoring how ChatGPT, Perplexity, Gemini, and Google mention your brand — and how to grow your citation share with SEOzapp."
        />
        <meta
          name="keywords"
          content="how to track brand mentions in ai search, ai brand mentions, prompt monitoring, chatgpt brand tracking, perplexity citations, seozapp"
        />
        <link rel="canonical" href="https://www.seozapp.com/how-to-track-brand-mentions-in-ai-search" />
        <meta property="og:title" content="How to Track Brand Mentions in AI Search" />
        <meta
          property="og:description"
          content="Learn how to monitor brand mentions across ChatGPT, Perplexity, Gemini, and Google AI Overviews."
        />
        <meta property="og:url" content="https://www.seozapp.com/how-to-track-brand-mentions-in-ai-search" />
        <meta property="og:type" content="article" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Article',
              headline: 'How to Track Brand Mentions in AI Search',
              description: 'A practical guide to monitoring how ChatGPT, Perplexity, Gemini, and Google mention your brand — and how to grow your citation share.',
              datePublished: '2026-08-07',
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
                '@id': 'https://www.seozapp.com/how-to-track-brand-mentions-in-ai-search',
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
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Brand Intelligence</span>
          </div>

          <h1 className="font-signifier text-4xl sm:text-5xl font-normal mb-6 text-[#17191c] leading-tight">
            How to Track Brand Mentions in AI Search
          </h1>

          <p className="text-[#777b86] text-xl font-normal leading-relaxed mb-8">
            Search is splitting into two channels. One is the Google results page you&apos;ve optimized for a decade. The other is a conversation — a person asking ChatGPT &quot;what&apos;s the best project management tool for a 5-person team&quot; and getting three names back, no blue links, no scrolling.
          </p>

          <div className="bg-[#fafafb] border border-[#17191c]/10 rounded-2xl p-6 mb-10 space-y-3">
            <p className="text-[#17191c] text-base font-semibold">
              If your brand isn&apos;t one of those three names, you don&apos;t just lose a click. You lose the entire interaction.
            </p>
            <p className="text-[#777b86] text-sm leading-relaxed">
              That shift is why &quot;brand mention tracking&quot; now means knowing, continuously, whether ChatGPT, Perplexity, Gemini, and Claude are naming you when someone asks a question you should be the answer to.
            </p>
          </div>

          <hr className="my-10 border-[#17191c]/10" />

          {/* Section: Why traditional mention tracking fails */}
          <h2 className="font-signifier text-3xl font-normal mt-12 mb-6 text-[#17191c]">
            Why Traditional Mention Tracking Doesn&apos;t Cover AI Search
          </h2>
          <p className="mb-6 text-[#777b86] text-lg leading-relaxed">
            Tools like Google Alerts, Mention, or Brand24 were built for a web made of static pages: news articles, forum posts, blog comments. They tell you when your brand name shows up in indexed content.
          </p>
          <p className="mb-8 text-[#777b86] text-lg leading-relaxed">
            AI search answers work differently. A model can recommend your product or compare you favorably to a competitor without any new page being published anywhere. To track it, you have to do what the buyer does: <strong>send the prompt, and parse the generated answer.</strong>
          </p>

          <hr className="my-10 border-[#17191c]/10" />

          {/* Section: What tracking requires */}
          <h2 className="font-signifier text-3xl font-normal mt-12 mb-6 text-[#17191c]">
            What Tracking Brand Mentions in AI Search Requires
          </h2>
          <div className="space-y-6 text-[#777b86] text-lg leading-relaxed mb-8">
            <div className="bg-[#fafafb] border border-[#17191c]/10 rounded-2xl p-5 space-y-1.5">
              <h3 className="text-base font-bold text-[#17191c]">1. Run the actual prompts your buyers type</h3>
              <p className="text-sm">Not your brand name — the core problem your buyers are solving (e.g. &quot;Best CRM for solo consultant&quot;, &quot;AI SEO tool for small agencies&quot;).</p>
            </div>
            <div className="bg-[#fafafb] border border-[#17191c]/10 rounded-2xl p-5 space-y-1.5">
              <h3 className="text-base font-bold text-[#17191c]">2. Run them across engines, not just one</h3>
              <p className="text-sm">ChatGPT, Perplexity, Gemini, Claude, and Google AI Overviews pull from different sources. Single-engine tracking gives a partial picture.</p>
            </div>
            <div className="bg-[#fafafb] border border-[#17191c]/10 rounded-2xl p-5 space-y-1.5">
              <h3 className="text-base font-bold text-[#17191c]">3. Capture position and sentiment</h3>
              <p className="text-sm">Being named first in the direct answer is worth far more than a secondary bullet point. Sentiment and context matter just as much.</p>
            </div>
            <div className="bg-[#fafafb] border border-[#17191c]/10 rounded-2xl p-5 space-y-1.5">
              <h3 className="text-base font-bold text-[#17191c]">4. Track trends and benchmark competitors</h3>
              <p className="text-sm">Model outputs shift as training weights update. A trend line comparing your citation share against top competitors is essential.</p>
            </div>
          </div>

          <hr className="my-10 border-[#17191c]/10" />

          {/* Section: Automated Tracking with SEOzapp */}
          <h2 className="font-signifier text-3xl font-normal mt-12 mb-6 text-[#17191c]">
            What Automated Brand Mention Tracking Looks Like
          </h2>
          <p className="mb-6 text-[#777b86] text-lg leading-relaxed">
            This is the exact workflow{' '}
            <a href="https://www.seozapp.com" className="font-semibold text-[#17191c] underline hover:text-[#5d2a1a] transition-colors">
              SEOzapp
            </a>&apos;s prompt monitoring is built for. Instead of running queries by hand, you set up buyer questions plus competitors once, and{' '}
            <a href="https://www.seozapp.com" className="font-semibold text-[#17191c] underline hover:text-[#5d2a1a] transition-colors">
              SEOzapp
            </a>{' '}
            runs them on a recurring schedule across ChatGPT, Perplexity, Gemini, Claude, and Google AI Overviews.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
            {[
              'Citation position (Direct, Top 3, Uncited)',
              'Competitor citation benchmarking',
              'Response sentiment analysis',
              'AI Bot access & crawlability check',
            ].map((feature, idx) => (
              <div key={idx} className="flex items-center gap-2 text-sm text-[#17191c] bg-[#fafafb] border border-[#17191c]/10 rounded-xl p-3.5 font-medium">
                <CheckCircle2 className="w-4 h-4 text-[#5d2a1a] flex-shrink-0" />
                <span>{feature}</span>
              </div>
            ))}
          </div>

          <hr className="my-10 border-[#17191c]/10" />

          {/* Section: Simple Start */}
          <h2 className="font-signifier text-3xl font-normal mt-12 mb-6 text-[#17191c]">
            A Simple Checklist to Start This Week
          </h2>
          <ol className="ml-6 mb-8 list-decimal list-outside space-y-3 text-[#777b86] text-lg leading-relaxed">
            <li><strong>List 10–15 problem-based buyer prompts.</strong></li>
            <li><strong>Run prompts in ChatGPT, Perplexity, and Gemini</strong> and log position and sentiment.</li>
            <li><strong>Run the same prompts for your top competitors.</strong></li>
            <li><strong>Audit crawlability</strong> to confirm AI bots aren&apos;t blocked in <code>robots.txt</code>.</li>
            <li><strong>Fix structural gaps</strong> with FAQ schema and direct-answer paragraphs.</li>
            <li><strong>Automate with <a href="https://www.seozapp.com" className="underline font-semibold text-[#17191c]">SEOzapp</a></strong> to track trend lines automatically.</li>
          </ol>

          {/* CTA Banner */}
          <div className="bg-[#17191c] text-[#ffffff] rounded-3xl p-8 sm:p-10 my-12 text-center space-y-6 shadow-xl relative overflow-hidden">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#fbe1d1] bg-white/10 px-3.5 py-1 rounded-full inline-block">
              AI Brand Mention Tracking
            </span>
            <h3 className="font-signifier text-3xl sm:text-4xl font-normal tracking-tight">
              Track Your Brand Mentions Across LLMs
            </h3>
            <p className="text-white/70 text-base max-w-xl mx-auto font-normal">
              Stop guessing if ChatGPT or Perplexity is recommending your brand.{' '}
              <a href="https://www.seozapp.com" className="font-semibold text-[#fbe1d1] underline hover:text-white transition-colors">
                SEOzapp
              </a>{' '}
              monitors prompt citations, rank coordinates, and competitor mentions automatically.
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
