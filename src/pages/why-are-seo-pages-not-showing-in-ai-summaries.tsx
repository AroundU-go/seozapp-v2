import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Footer } from '@/components/ui/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowRight } from 'lucide-react';

export default function WhyAreSeoPagesNotShowingInAiSummaries() {
  const router = useRouter();
  const { user } = useAuth();

  return (
    <>
      <Head>
        <title>Why Are SEO Pages Not Showing in AI Summaries? | SEOzapp</title>
        <meta
          name="description"
          content="Nine real reasons a well-ranked page gets skipped by ChatGPT, Perplexity, and Google AI Overviews — and how to check which one is actually happening to yours."
        />
        <meta
          name="keywords"
          content="why are seo pages not showing in ai summaries, pages not cited in chatgpt, ai overview missing pages, aeo audit, seozapp"
        />
        <link rel="canonical" href="https://www.seozapp.com/why-are-seo-pages-not-showing-in-ai-summaries" />
        <meta property="og:title" content="Why Are SEO Pages Not Showing in AI Summaries? | SEOzapp" />
        <meta
          property="og:description"
          content="Nine real reasons a well-ranked page gets skipped by ChatGPT, Perplexity, and Google AI Overviews."
        />
        <meta property="og:url" content="https://www.seozapp.com/why-are-seo-pages-not-showing-in-ai-summaries" />
        <meta property="og:type" content="article" />
        <meta
          property="og:image"
          content="https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?auto=format&fit=crop&w=1200&q=80"
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

        {/* Article Main */}
        <main className="max-w-[800px] mx-auto px-6 pt-36 pb-24 w-full">
          <article className="space-y-8">
            <div className="space-y-4">
              <span className="text-xs font-semibold text-[#5d2a1a] bg-[#fbe1d1] px-3 py-1 rounded-full uppercase tracking-wider">
                SEO &amp; AEO Diagnostics
              </span>
              <h1 className="font-signifier text-4xl sm:text-5xl font-normal tracking-tight text-[#17191c] leading-tight">
                Why Are SEO Pages Not Showing in AI Summaries?
              </h1>
              <p className="text-sm text-[#777b86]">
                By Uddipan • Published Aug 2026 • 9 min read
              </p>
            </div>

            <div className="rounded-2xl overflow-hidden border border-[#17191c]/10 bg-[#fafafb]">
              <img
                src="https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?auto=format&fit=crop&w=1200&q=80"
                alt="Why Are SEO Pages Not Showing in AI Summaries?"
                className="w-full h-auto object-cover max-h-[420px]"
              />
            </div>

            <div className="prose prose-neutral max-w-none text-[#777b86] text-base leading-relaxed space-y-6">
              <p className="lead text-lg text-[#777b86] mb-6">
                You&apos;ve got a page that ranks. Maybe it&apos;s on page one of Google, maybe it&apos;s even sitting in a featured snippet. And when you ask ChatGPT or Perplexity the exact question that page answers, your brand doesn&apos;t show up at all. Something else does — sometimes a competitor with a noticeably weaker page, sometimes a Reddit thread, sometimes a source you&apos;ve never heard of.
              </p>

              <p>
                That gap is confusing the first time you notice it, because everything you were taught about SEO says a well-ranked page should be a well-cited one. It isn&apos;t automatically, and the reasons why come down to a handful of specific, checkable things — some technical, some structural, some just about how AI models decide what&apos;s worth repeating. Here&apos;s what&apos;s actually going on, and how to check which one applies to you.
              </p>

              <hr className="my-8 border-[#17191c]/10" />

              <h2 className="text-2xl font-bold text-[#17191c] mt-8 mb-4">Ranking and being cited are answering different questions</h2>

              <p>
                Start with the actual mechanical difference, because it explains almost everything else on this list. A Google ranking is the output of a retrieval system optimized to surface the best matching page for a query, full stop. An AI-generated summary is the output of a model deciding, sentence by sentence, what&apos;s worth stating as fact and attributing to a source. Those are related tasks, but they&apos;re not the same task, and a page can win at one while losing at the other.
              </p>

              <p>
                Ranking rewards relevance and authority signals accumulated over time — backlinks, engagement, topical depth across your site. Being cited in a summary rewards something narrower: whether a specific passage on your page states a clear, extractable, confidently-worded fact that directly answers the exact question being asked. A page can have all the ranking signals in the world and still never contain a passage clean enough for a model to lift and repeat.
              </p>

              <hr className="my-8 border-[#17191c]/10" />

              <h2 className="text-2xl font-bold text-[#17191c] mt-8 mb-4">Reason 1: Your content answers the topic but not the specific question</h2>

              <p>
                This is the single most common gap. A page can be genuinely comprehensive on a topic — thorough, well-researched, ranking well — and still not contain a single sentence that directly answers &quot;what&apos;s the best X for Y,&quot; because the content is written to build understanding gradually rather than to state a direct answer early.
              </p>

              <p>
                AI models pull passages that read as self-contained answers. If your page builds toward its point across three paragraphs of context before actually saying the thing, a model summarizing quickly is more likely to lift a competitor&apos;s page that states the same conclusion in the first two sentences.
              </p>

              <p>
                <strong>Check it:</strong> Read the first 100 words of the page as if you were skimming for the answer to the exact prompt someone would type. If you can&apos;t find a direct, confident answer in that window, that&apos;s very likely part of the problem.
              </p>

              <hr className="my-8 border-[#17191c]/10" />

              <h2 className="text-2xl font-bold text-[#17191c] mt-8 mb-4">Reason 2: AI crawlers can&apos;t actually reach the page</h2>

              <p>
                This one is purely technical, and it&apos;s more common than most teams expect, because it can happen silently through a robots.txt rule, a bot-protection service, or a CDN configuration that was never specifically checked against AI crawlers.
              </p>

              <p>
                If GPTBot, ClaudeBot, PerplexityBot, or Google-Extended is blocked — even unintentionally, even just on a subset of your site — the model simply cannot see the page, regardless of how well it&apos;s written or how well it ranks in Google. This is worth checking first, before you spend time rewriting content the model was never going to read in the first place.
              </p>

              <p>
                <strong>Check it:</strong> Look at your robots.txt file directly and search for disallow rules that might be catching AI bots, either by name or through a broader wildcard rule. Also check any bot-protection or CDN service you use — some default configurations block AI crawlers without it being obvious from the dashboard.
              </p>

              <hr className="my-8 border-[#17191c]/10" />

              <h2 className="text-2xl font-bold text-[#17191c] mt-8 mb-4">Reason 3: Your page lacks structured, extractable formatting</h2>

              <p>
                Models tend to favor content that&apos;s already organized into clearly separable chunks — headers that state a question, short paragraphs or bullet points that each answer one thing, FAQ sections, comparison tables. A wall of unbroken prose, even if it&apos;s well-written and accurate, is harder for a model to extract a clean citable passage from than the same information broken into a clearly labeled structure.
              </p>

              <p>
                <strong>Check it:</strong> Scroll through the page and count how many individual sections could stand alone as a complete answer to a specific sub-question. If most of the content only makes sense in the context of the paragraph before it, that&apos;s a structural issue worth fixing.
              </p>

              <hr className="my-8 border-[#17191c]/10" />

              <h2 className="text-2xl font-bold text-[#17191c] mt-8 mb-4">Reason 4: A competitor&apos;s page is simply more current</h2>

              <p>
                AI models weight recency more heavily than a lot of SEO content accounts for, particularly for topics where facts change — pricing, feature sets, &quot;best of&quot; comparisons, anything time-sensitive. A page you wrote eighteen months ago and haven&apos;t touched since is competing against a competitor&apos;s page updated last month, and freshness signals can outweigh your accumulated domain authority for citation purposes even when they don&apos;t move your Google ranking much.
              </p>

              <p>
                <strong>Check it:</strong> Look at the last-modified date on your page versus the pages currently being cited for the same prompt. If yours is meaningfully older, that&apos;s a real factor, not a coincidence.
              </p>

              <hr className="my-8 border-[#17191c]/10" />

              <h2 className="text-2xl font-bold text-[#17191c] mt-8 mb-4">Reason 5: Your brand is mentioned elsewhere, but not accurately or favorably</h2>

              <p>
                Sometimes the issue isn&apos;t your own page at all — it&apos;s that the sources a model is actually drawing from for this specific question are third-party: a comparison article, a review site, a forum thread. If those sources describe you inaccurately, unfavorably, or not at all, your own page being well-optimized doesn&apos;t fully compensate, because the model may be weighting the third-party consensus more heavily than a single brand&apos;s own claims about itself.
              </p>

              <p>
                <strong>Check it:</strong> Search for your brand alongside your core category terms and look at what third-party content is actually ranking and getting cited elsewhere. If it&apos;s outdated or unflattering, that&apos;s a PR and outreach problem more than a content problem.
              </p>

              <hr className="my-8 border-[#17191c]/10" />

              <h2 className="text-2xl font-bold text-[#17191c] mt-8 mb-4">Reason 6: The page is too promotional to read as a neutral answer</h2>

              <p>
                Models are noticeably cautious about lifting language that reads as marketing copy rather than a neutral statement of fact. A sentence like &quot;our industry-leading, best-in-class solution&quot; is much less likely to get quoted than a plainly stated fact like &quot;the tool supports integrations with Slack, HubSpot, and Salesforce.&quot; This is a real, if slightly frustrating, dynamic — the more your page sounds like an ad, the more a model treats it as one, and a model summarizing a neutral answer generally prefers content that already sounds neutral.
              </p>

              <p>
                <strong>Check it:</strong> Read your key passages out loud. If they&apos;d sound out of place in a Wikipedia article, that&apos;s likely reducing how often they get lifted directly.
              </p>

              <hr className="my-8 border-[#17191c]/10" />

              <h2 className="text-2xl font-bold text-[#17191c] mt-8 mb-4">Reason 7: You&apos;re missing schema markup that helps models parse the page</h2>

              <p>
                Structured data — FAQ schema, Product schema, Article schema — doesn&apos;t just help traditional search engines understand a page, it gives AI systems a clearer, machine-readable signal about what specific question a given section is answering. A page without it isn&apos;t invisible, but it&apos;s making the model do more inference work to figure out what&apos;s actually being claimed, which makes it a slightly less attractive source to pull from when a cleaner alternative exists.
              </p>

              <p>
                <strong>Check it:</strong> Run the page through a schema validation tool and see what, if anything, is actually being detected. Missing or broken schema is a common, quick fix.
              </p>

              <hr className="my-8 border-[#17191c]/10" />

              <h2 className="text-2xl font-bold text-[#17191c] mt-8 mb-4">Reason 8: The engine you&apos;re checking doesn&apos;t weight your usual sources</h2>

              <p>
                Different AI engines pull from meaningfully different source mixes. Perplexity leans heavily on live, recently indexed web content. Some other engines lean more on a broader training corpus that updates less frequently and may weight long-standing authority differently. A page that&apos;s well-optimized for one engine&apos;s retrieval style can genuinely be invisible to another&apos;s, which is why checking only one engine gives you an incomplete, sometimes misleading picture.
              </p>

              <p>
                <strong>Check it:</strong> Run the same prompt across at least three engines before concluding your content is the problem. If you&apos;re cited in one and not another, the issue is more likely engine-specific retrieval behavior than your content itself.
              </p>

              <hr className="my-8 border-[#17191c]/10" />

              <h2 className="text-2xl font-bold text-[#17191c] mt-8 mb-4">Reason 9: The prompt itself doesn&apos;t match how your page is framed</h2>

              <p>
                Sometimes the actual gap is a mismatch between how you&apos;ve optimized your page and how real people phrase the question. You might have a page thoroughly optimized around &quot;project management software comparison,&quot; while actual buyers are asking &quot;what should a 5-person team use instead of Asana&quot; — a specific, conversational framing your page never directly addresses even though it covers the same underlying topic.
              </p>

              <p>
                <strong>Check it:</strong> Pull 5-10 real prompts, not keywords, and read your page specifically looking for whether it answers that exact phrasing. If it only addresses the topic broadly, that&apos;s a content gap worth closing directly.
              </p>

              <hr className="my-8 border-[#17191c]/10" />

              <h2 className="text-2xl font-bold text-[#17191c] mt-8 mb-4">How to actually diagnose which one applies to you</h2>

              <p>Work through these roughly in order, since some are quick eliminations before you invest time in a content rewrite:</p>

              <ol className="space-y-2 my-4 list-decimal pl-5">
                <li><strong>Check crawlability first.</strong> It&apos;s the fastest thing to rule out and, if it&apos;s the actual cause, no amount of content work fixes it.</li>
                <li><strong>Check schema.</strong> Also fast, also worth ruling out before assuming the content itself is the problem.</li>
                <li><strong>Read your key passage against the exact prompt.</strong> Does it directly answer the question in the first few sentences, or does it build up to the point gradually?</li>
                <li><strong>Check the date.</strong> Is your content current, and does it read as current?</li>
                <li><strong>Check tone.</strong> Does the key passage read as a neutral fact or as marketing copy?</li>
                <li><strong>Check what&apos;s being cited instead.</strong> Look at the page(s) that are getting cited for the same prompt and compare structure, freshness, and tone directly against yours.</li>
                <li><strong>Check across multiple engines</strong>, not just one, before concluding anything about your content specifically.</li>
              </ol>

              <hr className="my-8 border-[#17191c]/10" />

              <h2 className="text-2xl font-bold text-[#17191c] mt-8 mb-4">Where this becomes worth systematizing</h2>

              <p>
                Working through this checklist manually for one or two important pages is genuinely useful, and worth doing as a first exercise. It gets a lot less practical once you&apos;re trying to diagnose this across a full site, a full competitor set, and multiple AI engines on an ongoing basis, because the checklist above has to be repeated for every important page, every time something changes.
              </p>

              <p>
                This is the specific gap SEOzapp&apos;s audit layer is built to close — running the crawlability check, the schema check, and the content and structure analysis automatically across your site, alongside the citation tracking that tells you whether a fix actually worked. Instead of manually working through nine possible causes every time a page underperforms, you get a report that&apos;s already narrowed down which of these is actually happening on a given page, so the fix is the next thing you do, not the thing you spend an afternoon investigating first.
              </p>

              <hr className="my-8 border-[#17191c]/10" />

              <h2 className="text-2xl font-bold text-[#17191c] mt-8 mb-4">The bottom line</h2>

              <p>
                A page not showing up in AI summaries almost never means &quot;your SEO is bad.&quot; It usually means one specific, checkable thing — a crawlability block, a structural gap, a tone mismatch, or a freshness problem — is standing between a page that already ranks well and a page a model is actually willing to quote from. Work through the checklist in order, starting with the fastest checks, and you&apos;ll usually find the actual cause faster than a full content rewrite would have taken.
              </p>

              <div className="mt-10 p-6 bg-[#fafafb] rounded-2xl border border-[#17191c]/10 text-center">
                <p className="text-base font-semibold text-[#17191c] mb-2">Want to see why your pages aren&apos;t being cited by AI models?</p>
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-2 bg-[#17191c] text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-[#17191c]/90 transition-all"
                >
                  Run a free audit to see exactly why your pages aren&apos;t being cited →
                </Link>
              </div>

              <div className="mt-8 pt-6 border-t border-[#17191c]/10 text-sm text-[#777b86]">
                Also read: <Link href="/blog/ai-citation-tracking-tool-for-agencies" className="text-[#17191c] font-semibold underline hover:opacity-80">AI Citation Tracking Tool for Agencies</Link>
              </div>
            </div>
          </article>
        </main>

        <Footer />
      </div>
    </>
  );
}
