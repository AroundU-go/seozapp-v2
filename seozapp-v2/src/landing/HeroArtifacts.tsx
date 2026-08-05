import React from 'react';
import { ArrowUpRight, Check, TrendingUp, Search, Sparkles } from 'lucide-react';

export const AIReadinessCard: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`bg-[#ffffff] rounded-2xl shadow-floating-artifact p-5 border border-[#17191c]/5 ${className}`}>
      <div className="flex items-center justify-between gap-4 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-[#17191c]/5 flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 text-[#17191c]" />
          </div>
          <div>
            <div className="text-[13px] font-medium text-[#17191c]">AI Readiness Score</div>
            <div className="text-[11px] text-[#777b86]">Direct Answer Parsing</div>
          </div>
        </div>
        <span className="text-[11px] font-medium text-[#5d2a1a] bg-[#fbe1d1] px-2 py-0.5 rounded-full">
          Grade A
        </span>
      </div>

      <div className="flex items-center gap-4 my-3 bg-[#fafafb] p-3 rounded-xl">
        <div className="relative w-14 h-14 flex items-center justify-center flex-shrink-0">
          <svg className="w-14 h-14 transform -rotate-90">
            <circle cx="28" cy="28" r="22" stroke="#f2f2f3" strokeWidth="4" fill="transparent" />
            <circle
              cx="28"
              cy="28"
              r="22"
              stroke="#17191c"
              strokeWidth="4"
              fill="transparent"
              strokeDasharray="138"
              strokeDashoffset="8"
              strokeLinecap="round"
            />
          </svg>
          <span className="absolute text-sm font-semibold text-[#17191c]">94</span>
        </div>
        <div className="space-y-1 text-[12px]">
          <div className="flex items-center gap-1.5 text-[#17191c]">
            <Check className="w-3.5 h-3.5 text-[#17191c]" />
            <span>H1–H3 Q&A hierarchy valid</span>
          </div>
          <div className="flex items-center gap-1.5 text-[#17191c]">
            <Check className="w-3.5 h-3.5 text-[#17191c]" />
            <span>FAQ Schema detected</span>
          </div>
          <div className="flex items-center gap-1.5 text-[#777b86]">
            <Check className="w-3.5 h-3.5 text-[#979799]" />
            <span>Content density &gt; 850w</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export const CitationTrendCard: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`bg-[#ffffff] rounded-2xl shadow-floating-artifact p-5 border border-[#17191c]/5 ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="text-[13px] font-medium text-[#17191c] flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-[#17191c]" />
          <span>LLM Citation Frequency</span>
        </div>
        <div className="flex items-center text-[11px] font-semibold text-[#17191c] bg-[#f2f2f3] px-2 py-0.5 rounded-full">
          <span>↑ 62% cited</span>
        </div>
      </div>

      <div className="text-[22px] font-semibold text-[#17191c] mb-1">
        62.4% <span className="text-[12px] font-normal text-[#777b86]">vs 28% competitor avg</span>
      </div>

      {/* Gestural Line Chart SVG */}
      <div className="h-14 w-full mt-2 relative">
        <svg className="w-full h-full overflow-visible" viewBox="0 0 200 50">
          <defs>
            <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#17191c" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#17191c" stopOpacity="0.0" />
            </linearGradient>
          </defs>
          <path
            d="M 0 40 Q 30 35, 60 28 T 120 18 T 160 12 T 200 6 L 200 50 L 0 50 Z"
            fill="url(#chartGrad)"
          />
          <path
            d="M 0 40 Q 30 35, 60 28 T 120 18 T 160 12 T 200 6"
            fill="none"
            stroke="#17191c"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <circle cx="200" cy="6" r="4" fill="#17191c" />
        </svg>
      </div>

      <div className="flex items-center justify-between text-[11px] text-[#979799] mt-2 pt-2 border-t border-[#f2f2f3]">
        <span>30-day tracking snapshot</span>
        <span className="text-[#5d2a1a] font-medium">+18.2% this week</span>
      </div>
    </div>
  );
};

export const CompetitorTableCard: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`bg-[#ffffff] rounded-2xl shadow-floating-artifact p-4 border border-[#17191c]/5 ${className}`}>
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#f2f2f3]">
        <div className="text-[12px] font-semibold text-[#17191c] uppercase tracking-wider">
          AEO Gap Analysis
        </div>
        <span className="text-[11px] text-[#777b86]">3 domains tracked</span>
      </div>

      <div className="space-y-2 text-[12px]">
        {/* Row 1 - User */}
        <div className="flex items-center justify-between p-2 rounded-xl bg-[#fafafb] font-medium border border-[#17191c]/10">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#17191c]"></span>
            <span className="text-[#17191c] font-semibold">Your Site (acme.com)</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[#17191c] font-bold">94 AI</span>
            <span className="text-[#777b86]">62% Cited</span>
          </div>
        </div>

        {/* Row 2 - Competitor A */}
        <div className="flex items-center justify-between p-2 rounded-xl text-[#777b86]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#979799]"></span>
            <span>rival-product.io</span>
          </div>
          <div className="flex items-center gap-3">
            <span>68 AI</span>
            <span>24% Cited</span>
          </div>
        </div>

        {/* Row 3 - Competitor B */}
        <div className="flex items-center justify-between p-2 rounded-xl text-[#777b86]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#a3a6af]"></span>
            <span>legacy-app.com</span>
          </div>
          <div className="flex items-center gap-3">
            <span>52 AI</span>
            <span>12% Cited</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export const ComposerCard: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`bg-[#ffffff] rounded-2xl shadow-floating-artifact p-4 border border-[#17191c]/5 ${className}`}>
      <div className="flex items-center gap-2 text-[12px] text-[#777b86] mb-2">
        <Search className="w-3.5 h-3.5 text-[#17191c]" />
        <span>Prompt Monitor</span>
      </div>
      <div className="bg-[#fafafb] border border-[#17191c]/10 rounded-xl p-3 text-[13px] text-[#17191c] font-medium flex items-center justify-between gap-2">
        <span className="truncate">"What is the best SEO and AEO platform for small agencies?"</span>
        <ArrowUpRight className="w-4 h-4 text-[#777b86] flex-shrink-0" />
      </div>
      <div className="flex items-center justify-between text-[11px] text-[#777b86] mt-2 px-1">
        <span className="text-[#5d2a1a] font-medium bg-[#fbe1d1] px-2 py-0.5 rounded-full">
          Cited in #1 position by Kimi
        </span>
        <span>Daily auto-run</span>
      </div>
    </div>
  );
};
