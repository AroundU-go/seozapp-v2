import React from 'react';
import { X, Check } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

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

export const PricingModal: React.FC<PricingModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  if (!isOpen) return null;

  const handleSelectPlan = (tier: PricingTier) => {
    if (tier.name.toLowerCase().includes('scale') || tier.name.toLowerCase().includes('enterprise') || tier.cta.includes('Book Demo')) {
      window.open('https://cal.com/uddipan', '_blank');
      return;
    }

    let baseUrl = '';
    if (tier.price.includes('49')) {
      baseUrl = 'https://checkout.dodopayments.com/buy/pdt_0NkT2xUGJmZm5ZO1kC5TV?quantity=1';
    } else {
      baseUrl = 'https://checkout.dodopayments.com/buy/pdt_0NkT37fYUyTYNIOPjOF10?quantity=1';
    }

    const userEmail = user?.email || '';
    if (userEmail) {
      baseUrl += `&email=${encodeURIComponent(userEmail)}&customer_email=${encodeURIComponent(userEmail)}`;
    }
    if (user?.id) {
      baseUrl += `&metadata[user_id]=${encodeURIComponent(user.id)}`;
    }

    const redirectUrl = typeof window !== 'undefined' ? `${window.location.origin}/analyze?payment=success` : 'https://www.seozapp.com/analyze?payment=success';
    baseUrl += `&redirect_url=${encodeURIComponent(redirectUrl)}`;

    if (typeof window !== 'undefined') {
      window.location.href = baseUrl;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#17191c]/70 backdrop-blur-md overflow-y-auto">
      <div className="relative bg-[#ffffff] text-[#17191c] rounded-3xl max-w-5xl w-full p-6 sm:p-8 shadow-2xl border border-[#17191c]/10 my-8 max-h-[90vh] overflow-y-auto font-sohne">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full text-[#777b86] hover:text-[#17191c] hover:bg-[#f2f2f3] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-3">
          <span className="text-xs font-semibold text-[#5d2a1a] bg-[#fbe1d1] px-3 py-1 rounded-full uppercase tracking-wider">
            Unlock Full AI &amp; SEO Suite
          </span>
          <h2 className="font-signifier font-normal text-3xl sm:text-4xl tracking-tight">
            Upgrade to unlock deep audits &amp; multi-LLM tracking
          </h2>
          <p className="text-sm text-[#777b86]">
            You reached the free teaser audit limit. Select a plan below to run unlimited deep domain crawls, competitor benchmarks, and live citation monitoring.
          </p>
        </div>

        {/* 3 Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {v2Tiers.map((tier) => (
            <div
              key={tier.name}
              className={`rounded-2xl p-6 transition-all flex flex-col justify-between relative ${
                tier.highlight
                  ? 'bg-[#17191c] text-[#ffffff] shadow-xl border-2 border-[#17191c]'
                  : 'bg-[#fafafb] text-[#17191c] border border-[#17191c]/10 shadow-sm hover:border-[#17191c]/30'
              }`}
            >
              {tier.badge && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#5d2a1a] text-[#ffffff] text-[10px] font-bold px-3 py-0.5 rounded-full uppercase">
                  {tier.badge}
                </span>
              )}

              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold">{tier.name}</h3>
                  <p className={`text-xs mt-1 leading-relaxed ${tier.highlight ? 'text-white/70' : 'text-[#777b86]'}`}>
                    {tier.description}
                  </p>
                </div>

                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold">{tier.price}</span>
                  <span className={`text-xs ${tier.highlight ? 'text-white/70' : 'text-[#777b86]'}`}>
                    {tier.period}
                  </span>
                </div>

                <div className={`text-[11px] font-medium py-1 px-2.5 rounded-lg inline-block ${tier.highlight ? 'bg-white/10 text-white' : 'bg-[#ffffff] text-[#17191c] border border-[#17191c]/10'}`}>
                  {tier.quota}
                </div>

                <ul className="space-y-2.5 text-xs pt-3 border-t border-[#17191c]/10">
                  {tier.features.map((feature, i) => {
                    const isObj = typeof feature !== 'string';
                    const text = isObj ? feature.text : feature;
                    const logos = isObj ? feature.logos : undefined;

                    return (
                      <li key={i} className="flex items-center gap-2">
                        <Check className={`w-3.5 h-3.5 flex-shrink-0 ${tier.highlight ? 'text-[#fbe1d1]' : 'text-[#17191c]'}`} />
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
                onClick={() => handleSelectPlan(tier)}
                className={`w-full rounded-xl py-2.5 text-xs font-semibold transition-all mt-6 ${
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

        {/* Contact Sales / Book Demo Callout */}
        <div className="mt-8 text-center pt-6 border-t border-[#17191c]/10 text-xs text-[#777b86]">
          Need a custom enterprise setup, custom API limits, or team walkthrough?{' '}
          <a
            href="https://cal.com/uddipan"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-[#17191c] underline hover:text-[#5d2a1a] transition-colors"
          >
            Book a Demo / Contact Sales
          </a>
        </div>
      </div>
    </div>
  );
};
