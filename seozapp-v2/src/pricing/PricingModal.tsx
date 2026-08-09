import React from 'react';
import { X, Check } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface PricingTier {
  name: string;
  price: string;
  period?: string;
  description: string;
  quota: string;
  features: string[];
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
    quota: '2,000 pages & 200 LLM checks',
    features: [
      '1 Primary Domain + 2 Competitors',
      'Competitor Intelligence (2 competitors)',
      '2,000 Firecrawl scraped pages/mo',
      '200 LLM prompt citation checks/mo',
      'SEO Tracking & Version Diffs',
      'AI Citation Engine (/llms.txt)',
      'Source Intelligence Link Graph',
    ],
    cta: 'Select Starter ($49/mo)',
  },
  {
    name: 'Pro Agency',
    price: '$99',
    period: '/month',
    description: 'Ideal for professionals and agencies',
    quota: '8,000 pages & 800 LLM checks',
    features: [
      '1 Primary Domain + 5 Competitors',
      'Competitor Intelligence (5 competitors)',
      '8,000 Firecrawl scraped pages/mo',
      '800 LLM prompt citation checks/mo',
      'Multi-Region Proxies (US, EU, UK, JP, IN)',
      'Bulk AI Readiness Crawl Engine',
      'Exportable White-Label PDF Reports',
    ],
    highlight: true,
    badge: 'Most Popular',
    cta: 'Select Pro Agency ($99/mo)',
  },
  {
    name: 'Scale / Enterprise',
    price: '$249',
    period: '/month',
    description: 'Best for large teams and enterprise-level organizations',
    quota: '30,000 pages & 3,000 LLM checks',
    features: [
      'Unlimited Domains & Competitors',
      '30,000 Firecrawl scraped pages/mo',
      '3,000 LLM prompt citation checks/mo',
      'Priority Queue Execution',
      'Dedicated Account Support',
      'Custom Webhooks & API Access',
    ],
    cta: 'Select Scale ($249/mo)',
  },
];

export const PricingModal: React.FC<PricingModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const handleSelectPlan = (planName: string) => {
    alert(`Thank you for selecting the ${planName}! Payment integration modal redirect...`);
    onClose();
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
                  {tier.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <Check className={`w-3.5 h-3.5 flex-shrink-0 ${tier.highlight ? 'text-[#fbe1d1]' : 'text-[#17191c]'}`} />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={() => handleSelectPlan(tier.name)}
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
      </div>
    </div>
  );
};
