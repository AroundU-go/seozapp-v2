import { Check, Sparkles, Building2, Zap, ShieldCheck } from 'lucide-react';
import React, { useState } from 'react';
import { OnboardingModal } from '@/components/onboarding/OnboardingModal';

interface FeatureLogo {
  src?: string;
  alt: string;
  text?: string;
}

interface PricingFeatureItem {
  text: string;
  logos?: FeatureLogo[];
}

interface PricingTier {
  name: string;
  price: string;
  period?: string;
  description: string;
  quota: string;
  features: (string | PricingFeatureItem)[];
  highlight?: boolean;
  badge?: string;
  cta: string;
}

const v2Tiers: PricingTier[] = [
  {
    name: 'Starter',
    price: '$49',
    period: '/month',
    description: 'For founders and small teams',
    quota: '2 sites (up to 5 competitors)',
    features: [
      '25 prompts',
      '2 sites',
      '5 competitors',
      'Weekly monitoring',
      {
        text: 'Track 2 LLMs',
        logos: [
          { src: '/icon2.png', alt: 'ChatGPT' },
          { src: '/icon4.png', alt: 'Gemini' },
        ],
      },
      'AI traffic analytics',
      'Competitor intelligence',
      'Unlimited technical SEO audits',
      'GEO (Generative Engine Optimization)',
      'AI Crawlability and bot access audit',
    ],
    cta: 'Get started free',
  },
  {
    name: 'Pro',
    price: '$99',
    period: '/month',
    description: 'Ideal for professionals and agencies',
    quota: '5 sites (up to 10 competitors)',
    features: [
      '50 prompts',
      '5 sites',
      '10 competitors',
      {
        text: 'Track 5 LLMs',
        logos: [
          { src: '/icon2.png', alt: 'ChatGPT' },
          { src: '/icon4.png', alt: 'Gemini' },
          { src: '/icon3.png', alt: 'Perplexity' },
          { src: '/google-logo.png', alt: 'AI Overviews' },
          { src: '/icon1.png', alt: 'Claude' },
        ],
      },
      'AI traffic analytics',
      'Competitor intelligence',
      'Unlimited technical SEO audits',
      'GEO (Generative Engine Optimization)',
      'AI Crawlability and bot access audit',
      'Weekly reports',
    ],
    highlight: true,
    badge: 'Most Popular',
    cta: 'Get started free',
  },
  {
    name: 'Enterprise / Scale',
    price: '$249',
    period: '/month',
    description: 'Best for large teams and enterprise-level organizations',
    quota: 'Unlimited sites + competitors',
    features: [
      'Unlimited sites + Competitors',
      'White label PDF export',
      'Weekly crawl updates',
      'Everything in Pro but unlimited',
    ],
    cta: 'Contact Sales ($249)',
  },
];

export function PricingSection() {
  const [showOnboarding, setShowOnboarding] = useState(false);

  return (
    <section id="pricing" className="py-24 px-6 bg-[#fafafb] relative border-t border-[#17191c]/10">
      <div className="max-w-[1200px] mx-auto text-[#17191c]">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <span className="text-xs font-semibold text-[#5d2a1a] bg-[#fbe1d1] px-3 py-1 rounded-full uppercase tracking-wider">
            Predictable SaaS Pricing
          </span>
          <h2 className="font-signifier font-normal text-4xl sm:text-5xl tracking-tight">
            Transparent plans for modern AI Search &amp; SEO teams
          </h2>
          <p className="text-[#777b86] text-lg font-normal">
            No surprise credits. Scale your AI search citation frequency and competitor benchmark coverage.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {v2Tiers.map((tier) => (
            <div
              key={tier.name}
              className={`rounded-3xl p-8 transition-all flex flex-col justify-between relative ${
                tier.highlight
                  ? 'bg-[#17191c] text-[#ffffff] shadow-xl border-2 border-[#17191c] scale-105'
                  : 'bg-[#ffffff] text-[#17191c] border border-[#17191c]/10 shadow-sm hover:border-[#17191c]/30'
              }`}
            >
              {tier.badge && (
                <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#5d2a1a] text-[#ffffff] text-[11px] font-bold px-3 py-0.5 rounded-full uppercase">
                  {tier.badge}
                </span>
              )}

              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold">{tier.name}</h3>
                  <p className={`text-xs mt-1 leading-relaxed ${tier.highlight ? 'text-white/70' : 'text-[#777b86]'}`}>
                    {tier.description}
                  </p>
                </div>

                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold">{tier.price}</span>
                  <span className={`text-sm ${tier.highlight ? 'text-white/70' : 'text-[#777b86]'}`}>
                    {tier.period}
                  </span>
                </div>

                <div className={`text-xs font-medium py-1.5 px-3 rounded-lg inline-block ${tier.highlight ? 'bg-white/10 text-white' : 'bg-[#fafafb] text-[#17191c] border border-[#17191c]/10'}`}>
                  {tier.quota}
                </div>

                <ul className="space-y-3 text-xs pt-4 border-t border-[#17191c]/10">
                  {tier.features.map((feature, i) => {
                    const isObj = typeof feature !== 'string';
                    const text = isObj ? feature.text : feature;
                    const logos = isObj ? feature.logos : undefined;

                    return (
                      <li key={i} className="flex items-center gap-2.5">
                        <Check className={`w-4 h-4 flex-shrink-0 ${tier.highlight ? 'text-[#fbe1d1]' : 'text-[#17191c]'}`} />
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span>{text}</span>
                          {logos && (
                            <span className="inline-flex items-center gap-1.5 ml-1">
                              {logos.map((logo, idx) => (
                                logo.src ? (
                                  <img key={idx} src={logo.src} alt={logo.alt} className="w-5 h-5 object-contain rounded-full shadow-2xs" />
                                ) : (
                                  <span key={idx} className={`text-[11px] font-bold px-0.5 leading-none ${tier.highlight ? 'text-white' : 'text-[#17191c]'}`}>{logo.text}</span>
                                )
                              ))}
                            </span>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>

              <button
                onClick={() => {
                  if (tier.name.toLowerCase().includes('scale') || tier.name.toLowerCase().includes('enterprise') || tier.cta.includes('Book')) {
                    window.open('https://cal.com/uddipan', '_blank');
                  } else {
                    setShowOnboarding(true);
                  }
                }}
                className={`w-full rounded-xl py-3 text-sm font-medium transition-all mt-8 ${
                  tier.highlight
                    ? 'bg-[#ffffff] text-[#17191c] hover:bg-[#fafafb]'
                    : 'bg-[#17191c] text-[#ffffff] hover:bg-[#17191c]/90'
                }`}
              >
                {tier.cta}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Onboarding Modal Trigger */}
      <OnboardingModal isOpen={showOnboarding} onClose={() => setShowOnboarding(false)} />
    </section>
  );
}
