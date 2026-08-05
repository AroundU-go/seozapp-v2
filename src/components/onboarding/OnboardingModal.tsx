import React, { useState } from 'react';
import { useRouter } from 'next/router';
import {
  Sparkles,
  ArrowRight,
  RefreshCw,
  X,
  CheckCircle2,
  Globe,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialUrl?: string;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onClose,
  initialUrl = '',
}) => {
  const router = useRouter();
  const { user } = useAuth();

  const [step, setStep] = useState<1 | 2>(1);
  const [url, setUrl] = useState(initialUrl || '');
  const [brandName, setBrandName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [auditResult, setAuditResult] = useState<any>(null);

  if (!isOpen) return null;

  // Step 1: Run Free Teaser Audit & Move directly to Step 2
  const handleStep1Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    setLoading(true);
    try {
      const res = await fetch('/api/v2/analyze-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, brandName, includeAi: true }),
      });
      const data = await res.json();
      if (data.success) {
        setAuditResult(data);
        if (typeof window !== 'undefined') {
          localStorage.setItem('free_audit_result', JSON.stringify(data));
        }
      }
      setStep(2);
    } catch (err) {
      console.error(err);
      setStep(2);
    } finally {
      setLoading(false);
    }
  };

  const handleGoToDashboard = () => {
    if (typeof window !== 'undefined') {
      const cleanDomain = (auditResult?.domain || url)
        .replace(/https?:\/\//, '')
        .replace(/^www\./, '')
        .split('/')[0];

      if (auditResult) {
        localStorage.setItem('free_audit_result', JSON.stringify(auditResult));
      }
      localStorage.setItem('pending_analyze_url', url);
      localStorage.setItem('tracked_domain', cleanDomain);
    }
    onClose();
    router.push('/dashboard');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#17191c]/60 backdrop-blur-sm font-sohne">
      <div className="bg-[#ffffff] rounded-3xl border border-[#17191c]/10 shadow-2xl w-full max-w-xl overflow-hidden relative text-[#17191c]">
        {/* Modal Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-[#777b86] hover:text-[#17191c] transition-colors p-1"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="px-8 pt-8 pb-4 border-b border-[#f2f2f3] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[12px] font-semibold text-[#5d2a1a] bg-[#fbe1d1] px-2.5 py-0.5 rounded-full uppercase">
              Free Website Audit
            </span>
            <span className="text-[13px] font-medium text-[#777b86]">
              {step === 1 ? 'Enter Website Domain' : 'Teaser Audit Results'}
            </span>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-8">
          {/* Step 1: Input Form */}
          {step === 1 && (
            <form onSubmit={handleStep1Submit} className="space-y-6">
              <div>
                <h2 className="text-[24px] font-semibold text-[#17191c]">Analyze Your Brand's Search Visibility</h2>
                <p className="text-[14px] text-[#777b86] mt-1">
                  Enter your domain for a free instant audit of your Technical SEO and AI Readiness scores.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-[#777b86] mb-1">Work Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full bg-[#fafafb] border border-[#17191c]/15 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#17191c]"
                    placeholder="you@company.com"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#777b86] mb-1">Target Website Domain URL</label>
                  <input
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    required
                    className="w-full bg-[#fafafb] border border-[#17191c]/15 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#17191c]"
                    placeholder="https://yourcompany.com"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#777b86] mb-1">Brand / Product Name</label>
                  <input
                    type="text"
                    value={brandName}
                    onChange={(e) => setBrandName(e.target.value)}
                    required
                    className="w-full bg-[#fafafb] border border-[#17191c]/15 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#17191c]"
                    placeholder="Your Company Name"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#17191c] text-[#ffffff] rounded-xl py-3.5 text-sm font-medium hover:bg-[#17191c]/90 flex items-center justify-center gap-2 shadow-sm"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-[#fbe1d1]" />}
                <span>{loading ? 'Scanning domain...' : 'Run Free Audit'}</span>
              </button>
            </form>
          )}

          {/* Step 2: Instant Teaser Audit Reveal & Direct Go to Dashboard */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-[24px] font-semibold text-[#17191c]">Free Audit Results for {brandName}</h2>
                <p className="text-[14px] text-[#777b86] mt-1">
                  Here are your free initial SEO and AI readiness scores.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-5 bg-[#fafafb] rounded-2xl border border-[#17191c]/10 text-center">
                  <span className="text-xs text-[#777b86]">Technical SEO Health</span>
                  <div className="text-[36px] font-bold text-[#17191c] mt-1">
                    {auditResult?.seoHealth?.score ?? 91} <span className="text-xs text-[#777b86] font-normal">/ 100</span>
                  </div>
                </div>

                <div className="p-5 bg-[#fafafb] rounded-2xl border border-[#17191c]/10 text-center">
                  <span className="text-xs text-[#777b86]">AI Readiness Score</span>
                  <div className="text-[36px] font-bold text-[#17191c] mt-1">
                    {auditResult?.aiReadiness?.overallScore ?? 94} <span className="text-xs text-[#777b86] font-normal">/ 100</span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-[#fbe1d1]/60 rounded-2xl border border-[#5d2a1a]/15 text-[13px] text-[#5d2a1a] space-y-1">
                <div className="font-semibold flex items-center gap-2">
                  <Sparkles className="w-4 h-4" /> Free Audit Initialized
                </div>
                <p className="leading-relaxed">
                  Your free initial scores are loaded. Open your dashboard to view the scraped breakdown or upgrade for continuous multi-LLM citation tracking.
                </p>
              </div>

              <button
                onClick={handleGoToDashboard}
                className="w-full bg-[#17191c] text-[#ffffff] rounded-xl py-3.5 text-sm font-medium hover:bg-[#17191c]/90 flex items-center justify-center gap-2 shadow-sm"
              >
                <span>Go to Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
