import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  Sparkles,
  ArrowRight,
  Percent,
  Clock,
  CreditCard,
  TrendingUp,
  DollarSign,
  BarChart3,
  Zap,
  Award,
  Layers,
  Users,
  Share2,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Mail,
} from 'lucide-react';
import { Footer } from '@/components/ui/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { generateFAQPageSchema } from '@/lib/seo/schema';

export default function AffiliatesPage() {
  const router = useRouter();
  const { user } = useAuth();

  // Interactive Calculator State
  const [referralsCount, setReferralsCount] = useState<number>(30);
  const commissionPerUser = 24.75; // 25% of $99/mo Pro plan
  const monthlyEarnings = Math.round(referralsCount * commissionPerUser);
  const annualEarnings = Math.round(monthlyEarnings * 12);

  // FAQ Accordion State
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const AFFILIATE_FORM_URL = 'https://forms.gle/kKUF5H38Vo3qBvoE9';

  const faqs = [
    {
      q: 'How much commission can I earn?',
      a: 'You earn a 25% recurring monthly commission on all subscriptions (Starter $49/mo, Pro $99/mo, Enterprise $249/mo) for the entire lifetime of the active customer. There is no cap on how much you can earn.',
    },
    {
      q: 'How and when do I get paid?',
      a: 'Commissions are paid out monthly with a minimum payout threshold of just $50 via PayPal, Stripe, or direct bank transfer.',
    },
    {
      q: 'How long does the tracking cookie last?',
      a: 'Our affiliate tracking cookie lasts for 60 days. If someone clicks your link and signs up within 60 days, you will receive full credit for the referral.',
    },
    {
      q: 'Who can join the affiliate program?',
      a: 'Anyone with an audience interested in SEO, AEO/GEO, digital marketing, AI search visibility, SaaS growth, or agency workflows can join! Bloggers, YouTubers, newsletter creators, agency owners, and developers are all welcome.',
    },
    {
      q: 'Are paid ads (PPC) allowed?',
      a: 'You may run ads to your own content (e.g. review articles, comparison landing pages, or video reviews), but direct bidding on branded terms like "SEOzapp" or misleading ads is strictly prohibited.',
    },
    {
      q: 'How do I track my referrals and earnings?',
      a: 'Once approved, you will have access to a real-time affiliate portal where you can monitor link clicks, trial signups, paid conversions, pending payouts, and historical earnings.',
    },
  ];

  return (
    <>
      <Head>
        <title>Affiliate Program — Earn 25% Recurring Commission | SEOzapp</title>
        <meta
          name="description"
          content="Join the SEOzapp Affiliate Program. Earn 25% recurring monthly commissions by recommending the all-in-one SEO & AEO audit toolkit to your audience."
        />
        <link rel="canonical" href="https://www.seozapp.com/affiliates" />
        <meta property="og:title" content="SEOzapp Affiliate Program — 25% Lifetime Recurring Commission" />
        <meta
          property="og:description"
          content="Partner with SEOzapp. Earn 25% lifetime monthly recurring revenue with 60-day cookie tracking and monthly payouts."
        />
        <meta property="og:url" content="https://www.seozapp.com/affiliates" />
        <meta property="og:type" content="website" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(
              generateFAQPageSchema(
                faqs.map((f) => ({
                  question: f.q,
                  answer: f.a,
                }))
              )
            ),
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

        {/* Main Content */}
        <main className="flex-1 w-full pt-36 pb-24">
          {/* Hero Section */}
          <section className="max-w-4xl mx-auto px-6 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#fbe1d1] text-[#5d2a1a] text-xs font-semibold uppercase tracking-wider mb-6">
              <Sparkles className="w-3.5 h-3.5" />
              <span>SEOzapp Partner &amp; Affiliate Program</span>
            </div>

            <h1 className="font-signifier text-4xl sm:text-5xl md:text-6xl font-normal tracking-tight text-[#17191c] mb-6 leading-tight">
              Earn <span className="underline decoration-[#fbe1d1] decoration-4 underline-offset-4">25% Recurring</span> Commission Every Month
            </h1>

            <p className="text-lg sm:text-xl text-[#777b86] max-w-2xl mx-auto leading-relaxed mb-10">
              Help founders, marketers, and agencies audit and optimize for Google and modern AI search engines — and get rewarded with lifetime monthly revenue.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <a
                href={AFFILIATE_FORM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 bg-[#17191c] text-[#ffffff] font-medium rounded-full hover:bg-[#17191c]/90 transition-all text-sm shadow-xs"
              >
                <Sparkles className="w-4 h-4 text-[#fbe1d1]" />
                <span>Become an Affiliate</span>
                <ArrowRight className="w-4 h-4" />
              </a>
              <a
                href="#calculator"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-[#fafafb] border border-[#17191c]/10 text-[#17191c] hover:bg-[#17191c]/5 font-medium rounded-full transition-all text-sm"
              >
                <BarChart3 className="w-4 h-4 text-[#777b86]" />
                <span>Calculate Earnings</span>
              </a>
            </div>

            {/* Highlight Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 text-left">
              <div className="bg-[#fafafb] border border-[#17191c]/10 rounded-2xl p-6">
                <div className="w-10 h-10 rounded-xl bg-[#ffffff] border border-[#17191c]/10 flex items-center justify-center mb-4 text-[#17191c] shadow-xs">
                  <Percent className="w-5 h-5" />
                </div>
                <h3 className="text-base font-semibold text-[#17191c] mb-1">25% Lifetime</h3>
                <p className="text-xs text-[#777b86] leading-relaxed">
                  Continuous recurring revenue for the full lifecycle of each paying customer.
                </p>
              </div>

              <div className="bg-[#fafafb] border border-[#17191c]/10 rounded-2xl p-6">
                <div className="w-10 h-10 rounded-xl bg-[#ffffff] border border-[#17191c]/10 flex items-center justify-center mb-4 text-[#17191c] shadow-xs">
                  <Clock className="w-5 h-5" />
                </div>
                <h3 className="text-base font-semibold text-[#17191c] mb-1">60-Day Cookie</h3>
                <p className="text-xs text-[#777b86] leading-relaxed">
                  Generous 60-day tracking window ensures you never miss a referral credit.
                </p>
              </div>

              <div className="bg-[#fafafb] border border-[#17191c]/10 rounded-2xl p-6">
                <div className="w-10 h-10 rounded-xl bg-[#ffffff] border border-[#17191c]/10 flex items-center justify-center mb-4 text-[#17191c] shadow-xs">
                  <CreditCard className="w-5 h-5" />
                </div>
                <h3 className="text-base font-semibold text-[#17191c] mb-1">Monthly Payouts</h3>
                <p className="text-xs text-[#777b86] leading-relaxed">
                  Reliable monthly payouts via PayPal, Stripe, or direct bank transfer.
                </p>
              </div>

              <div className="bg-[#fafafb] border border-[#17191c]/10 rounded-2xl p-6">
                <div className="w-10 h-10 rounded-xl bg-[#ffffff] border border-[#17191c]/10 flex items-center justify-center mb-4 text-[#17191c] shadow-xs">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <h3 className="text-base font-semibold text-[#17191c] mb-1">High Conversion</h3>
                <p className="text-xs text-[#777b86] leading-relaxed">
                  Instant AI audits and accessible pricing convert traffic quickly into subscribers.
                </p>
              </div>
            </div>
          </section>

          {/* Interactive Calculator Section */}
          <section id="calculator" className="max-w-3xl mx-auto px-6 mt-28">
            <div className="bg-[#fafafb] border border-[#17191c]/10 rounded-3xl p-8 sm:p-12">
              <div className="text-center max-w-xl mx-auto mb-10">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#17191c]/5 text-[#17191c] text-xs font-medium uppercase tracking-wider mb-3">
                  <DollarSign className="w-3.5 h-3.5" />
                  <span>Earnings Estimator</span>
                </div>
                <h2 className="font-signifier text-3xl sm:text-4xl font-normal text-[#17191c] mb-3">
                  How Much Can You Earn?
                </h2>
                <p className="text-[#777b86] text-sm sm:text-base">
                  Drag the slider to estimate your recurring income based on active Pro plan ($99/mo) referrals.
                </p>
              </div>

              {/* Slider Controller */}
              <div className="mb-10">
                <div className="flex justify-between items-center mb-3">
                  <label htmlFor="referral-slider" className="text-sm font-medium text-[#17191c]">
                    Number of Active Pro Referrals:
                  </label>
                  <span className="text-2xl font-bold text-[#17191c]">{referralsCount}</span>
                </div>
                <input
                  id="referral-slider"
                  type="range"
                  min="5"
                  max="150"
                  step="5"
                  value={referralsCount}
                  onChange={(e) => setReferralsCount(Number(e.target.value))}
                  className="w-full h-2.5 bg-[#17191c]/10 rounded-lg appearance-none cursor-pointer accent-[#17191c]"
                />
                <div className="flex justify-between text-xs text-[#777b86] mt-2 font-mono">
                  <span>5 referrals</span>
                  <span>50 referrals</span>
                  <span>100 referrals</span>
                  <span>150 referrals</span>
                </div>
              </div>

              {/* Earnings Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-[#ffffff] rounded-2xl p-6 border border-[#17191c]/10 text-center">
                <div className="p-4">
                  <span className="text-xs font-semibold uppercase tracking-widest text-[#777b86]">
                    Monthly Recurring Income
                  </span>
                  <div className="text-4xl font-bold text-[#17191c] mt-2 tracking-tight">
                    ${monthlyEarnings.toLocaleString()}
                    <span className="text-sm font-normal text-[#777b86]">/mo</span>
                  </div>
                  <p className="text-xs text-[#777b86] mt-1">Paid out every month</p>
                </div>

                <div className="p-4 sm:border-l sm:border-[#17191c]/10">
                  <span className="text-xs font-semibold uppercase tracking-widest text-[#777b86]">
                    Annual Passive Revenue
                  </span>
                  <div className="text-4xl font-bold text-[#17191c] mt-2 tracking-tight">
                    ${annualEarnings.toLocaleString()}
                    <span className="text-sm font-normal text-[#777b86]">/yr</span>
                  </div>
                  <p className="text-xs text-[#777b86] mt-1">Projected annual recurring earnings</p>
                </div>
              </div>

              <div className="mt-8 text-center">
                <a
                  href={AFFILIATE_FORM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-8 py-3 bg-[#17191c] text-[#ffffff] font-medium rounded-full hover:bg-[#17191c]/90 transition-all text-sm"
                >
                  <span>Join &amp; Start Earning</span>
                  <ArrowRight className="w-4 h-4 text-[#fbe1d1]" />
                </a>
              </div>
            </div>
          </section>

          {/* How It Works (3 Steps) */}
          <section className="max-w-4xl mx-auto px-6 mt-32">
            <div className="text-center mb-16">
              <h2 className="font-signifier text-3xl sm:text-4xl font-normal text-[#17191c] mb-4">
                How the Program Works
              </h2>
              <p className="text-base text-[#777b86] max-w-xl mx-auto">
                Start earning in three simple steps with zero upfront costs or technical setup.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-[#fafafb] border border-[#17191c]/10 rounded-2xl p-8 flex flex-col">
                <div className="w-10 h-10 rounded-xl bg-[#ffffff] border border-[#17191c]/10 text-[#17191c] font-bold text-base flex items-center justify-center mb-6 shadow-xs">
                  1
                </div>
                <h3 className="text-lg font-semibold text-[#17191c] mb-2">Join &amp; Get Your Link</h3>
                <p className="text-[#777b86] text-sm leading-relaxed flex-1">
                  Apply in under 2 minutes. Once approved, you get access to your personalized affiliate portal and tracking link.
                </p>
              </div>

              <div className="bg-[#fafafb] border border-[#17191c]/10 rounded-2xl p-8 flex flex-col">
                <div className="w-10 h-10 rounded-xl bg-[#ffffff] border border-[#17191c]/10 text-[#17191c] font-bold text-base flex items-center justify-center mb-6 shadow-xs">
                  2
                </div>
                <h3 className="text-lg font-semibold text-[#17191c] mb-2">Share with Your Audience</h3>
                <p className="text-[#777b86] text-sm leading-relaxed flex-1">
                  Promote SEOzapp through your blog, YouTube reviews, newsletter, client audits, or social media using our pre-built assets.
                </p>
              </div>

              <div className="bg-[#fafafb] border border-[#17191c]/10 rounded-2xl p-8 flex flex-col">
                <div className="w-10 h-10 rounded-xl bg-[#ffffff] border border-[#17191c]/10 text-[#17191c] font-bold text-base flex items-center justify-center mb-6 shadow-xs">
                  3
                </div>
                <h3 className="text-lg font-semibold text-[#17191c] mb-2">Earn Recurring Payouts</h3>
                <p className="text-[#777b86] text-sm leading-relaxed flex-1">
                  Receive 25% every month for each active customer. Track clicks, conversions, and payouts in real-time.
                </p>
              </div>
            </div>
          </section>

          {/* Why Promote SEOzapp */}
          <section className="max-w-5xl mx-auto px-6 mt-32">
            <div className="text-center mb-16">
              <h2 className="font-signifier text-3xl sm:text-4xl font-normal text-[#17191c] mb-4">
                Why Your Audience Will Love SEOzapp
              </h2>
              <p className="text-base text-[#777b86] max-w-xl mx-auto">
                Built to solve the modern gap between classic Google SEO and Answer Engine Optimization (AEO/GEO).
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-[#fafafb] border border-[#17191c]/10 rounded-2xl p-6">
                <div className="w-10 h-10 rounded-xl bg-[#ffffff] border border-[#17191c]/10 flex items-center justify-center mb-4 text-[#17191c]">
                  <Zap className="w-5 h-5" />
                </div>
                <h3 className="text-base font-semibold text-[#17191c] mb-1">Next-Gen AEO &amp; GEO</h3>
                <p className="text-xs text-[#777b86] leading-relaxed">
                  Track brand visibility and citation performance across ChatGPT, Perplexity, Claude, Gemini, and Google AI Overviews.
                </p>
              </div>

              <div className="bg-[#fafafb] border border-[#17191c]/10 rounded-2xl p-6">
                <div className="w-10 h-10 rounded-xl bg-[#ffffff] border border-[#17191c]/10 flex items-center justify-center mb-4 text-[#17191c]">
                  <Award className="w-5 h-5" />
                </div>
                <h3 className="text-base font-semibold text-[#17191c] mb-1">Instant Technical Audits</h3>
                <p className="text-xs text-[#777b86] leading-relaxed">
                  25+ technical and ranking signals, heading hierarchy, AI bot accessibility checks, and one-click fix recommendations.
                </p>
              </div>

              <div className="bg-[#fafafb] border border-[#17191c]/10 rounded-2xl p-6">
                <div className="w-10 h-10 rounded-xl bg-[#ffffff] border border-[#17191c]/10 flex items-center justify-center mb-4 text-[#17191c]">
                  <Layers className="w-5 h-5" />
                </div>
                <h3 className="text-base font-semibold text-[#17191c] mb-1">Client-Ready PDF Exports</h3>
                <p className="text-xs text-[#777b86] leading-relaxed">
                  Agencies and freelancers can generate beautiful, exportable audit reports for their clients with a single click.
                </p>
              </div>

              <div className="bg-[#fafafb] border border-[#17191c]/10 rounded-2xl p-6">
                <div className="w-10 h-10 rounded-xl bg-[#ffffff] border border-[#17191c]/10 flex items-center justify-center mb-4 text-[#17191c]">
                  <Users className="w-5 h-5" />
                </div>
                <h3 className="text-base font-semibold text-[#17191c] mb-1">Agency-Friendly Pricing</h3>
                <p className="text-xs text-[#777b86] leading-relaxed">
                  Flat monthly pricing without per-seat charges or hidden add-on costs makes referral traffic convert smoothly.
                </p>
              </div>

              <div className="bg-[#fafafb] border border-[#17191c]/10 rounded-2xl p-6">
                <div className="w-10 h-10 rounded-xl bg-[#ffffff] border border-[#17191c]/10 flex items-center justify-center mb-4 text-[#17191c]">
                  <Share2 className="w-5 h-5" />
                </div>
                <h3 className="text-base font-semibold text-[#17191c] mb-1">Marketing Assets Provided</h3>
                <p className="text-xs text-[#777b86] leading-relaxed">
                  Get access to high-converting banners, product screenshots, email copy, and feature briefs to make sharing effortless.
                </p>
              </div>

              <div className="bg-[#fafafb] border border-[#17191c]/10 rounded-2xl p-6">
                <div className="w-10 h-10 rounded-xl bg-[#ffffff] border border-[#17191c]/10 flex items-center justify-center mb-4 text-[#17191c]">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="text-base font-semibold text-[#17191c] mb-1">Dedicated Partner Support</h3>
                <p className="text-xs text-[#777b86] leading-relaxed">
                  Have special campaign ideas or custom discount codes for your audience? We are always here to collaborate.
                </p>
              </div>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="max-w-3xl mx-auto px-6 mt-32">
            <div className="text-center mb-12">
              <h2 className="font-signifier text-3xl sm:text-4xl font-normal text-[#17191c] mb-3">
                Frequently Asked Questions
              </h2>
              <p className="text-sm text-[#777b86]">
                Got questions about the affiliate program? Find quick answers below.
              </p>
            </div>

            <div className="space-y-3">
              {faqs.map((faq, index) => {
                const isOpen = openFaq === index;
                return (
                  <div
                    key={index}
                    className="bg-[#fafafb] border border-[#17191c]/10 rounded-2xl overflow-hidden transition-colors"
                  >
                    <button
                      onClick={() => toggleFaq(index)}
                      className="w-full px-6 py-4 text-left flex items-center justify-between gap-4 font-semibold text-sm sm:text-base text-[#17191c] focus:outline-none"
                    >
                      <span>{faq.q}</span>
                      {isOpen ? (
                        <ChevronUp className="w-4 h-4 text-[#17191c] shrink-0" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-[#777b86] shrink-0" />
                      )}
                    </button>
                    {isOpen && (
                      <div className="px-6 pb-5 text-[#777b86] text-sm leading-relaxed border-t border-[#17191c]/5 pt-3">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          {/* Bottom CTA Banner */}
          <section className="max-w-4xl mx-auto px-6 mt-32">
            <div className="rounded-3xl bg-[#fafafb] border border-[#17191c]/10 p-10 sm:p-14 text-center">
              <div className="max-w-xl mx-auto">
                <h2 className="font-signifier text-3xl sm:text-4xl font-normal text-[#17191c] mb-4">
                  Ready to Start Earning with SEOzapp?
                </h2>
                <p className="text-[#777b86] text-base mb-8">
                  Apply today, get your link in minutes, and start earning 25% recurring commission on every customer you refer.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <a
                    href={AFFILIATE_FORM_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-[#17191c] text-[#ffffff] font-medium rounded-full hover:bg-[#17191c]/90 transition-all text-sm"
                  >
                    <Sparkles className="w-4 h-4 text-[#fbe1d1]" />
                    <span>Apply for Affiliate Program</span>
                  </a>
                  <a
                    href="mailto:partners@seozapp.com?subject=SEOzapp%20Affiliate%20Inquiry"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-[#ffffff] border border-[#17191c]/10 text-[#17191c] hover:bg-[#17191c]/5 font-medium rounded-full transition-all text-sm"
                  >
                    <Mail className="w-4 h-4 text-[#777b86]" />
                    <span>Contact Partner Support</span>
                  </a>
                </div>
              </div>
            </div>
          </section>
        </main>

        {/* Footer */}
        <Footer />
      </div>
    </>
  );
}
