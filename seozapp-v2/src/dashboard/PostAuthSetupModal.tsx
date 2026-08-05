import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Globe, Building2, ArrowRight, Loader2, Sparkles } from 'lucide-react';

interface PostAuthSetupModalProps {
  onComplete: (domain: string, brandName: string) => void;
}

export const PostAuthSetupModal: React.FC<PostAuthSetupModalProps> = ({ onComplete }) => {
  const { user } = useAuth();
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [brandName, setBrandName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!websiteUrl.trim()) {
      setErrorMsg('Please enter your website URL.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      let cleanUrl = websiteUrl.trim();
      if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
        cleanUrl = `https://${cleanUrl}`;
      }
      const domainHost = new URL(cleanUrl).hostname.replace('www.', '');
      const brand = brandName.trim() || domainHost.split('.')[0];

      if (user?.email) {
        await fetch('/api/v2/workspace', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ownerEmail: user.email,
            brandName: brand,
            websiteUrl: domainHost,
          }),
        });
      }

      if (typeof window !== 'undefined') {
        localStorage.setItem('tracked_domain', domainHost);
        localStorage.setItem('pending_brand_name', brand);
      }

      onComplete(domainHost, brand);
    } catch (err: any) {
      console.error('Setup failed:', err);
      setErrorMsg(err.message || 'Failed to save setup');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#17191c]/70 backdrop-blur-sm flex items-center justify-center p-4 font-sohne">
      <div className="bg-[#ffffff] rounded-2xl border border-[#17191c]/15 shadow-2xl max-w-md w-full p-8 space-y-6 animate-in fade-in zoom-in duration-200">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-[#17191c] text-[#ffffff] rounded-2xl flex items-center justify-center mx-auto shadow-md">
            <Sparkles className="w-6 h-6 text-[#fbe1d1]" />
          </div>
          <h2 className="text-2xl font-semibold text-[#17191c]">Complete Your Setup</h2>
          <p className="text-sm text-[#777b86]">
            Enter your website URL and brand name to start tracking SEO &amp; AI search visibility.
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 bg-[#ef4444]/10 border border-[#ef4444]/20 rounded-xl text-xs text-[#ef4444] font-medium">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#17191c] mb-1">Website URL *</label>
            <div className="relative">
              <Globe className="w-4 h-4 text-[#777b86] absolute left-3.5 top-3" />
              <input
                type="text"
                required
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                placeholder="e.g. stripe.com"
                className="w-full bg-[#ffffff] border border-[#17191c]/15 rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#17191c] focus:outline-none focus:border-[#17191c]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#17191c] mb-1">Brand Name (Optional)</label>
            <div className="relative">
              <Building2 className="w-4 h-4 text-[#777b86] absolute left-3.5 top-3" />
              <input
                type="text"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                placeholder="e.g. Stripe"
                className="w-full bg-[#ffffff] border border-[#17191c]/15 rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#17191c] focus:outline-none focus:border-[#17191c]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#17191c] text-[#ffffff] font-medium py-3 rounded-xl hover:bg-[#17191c]/90 transition-all flex items-center justify-center gap-2 shadow-sm text-sm disabled:opacity-60"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>Save &amp; Go to Dashboard</span>
                <ArrowRight className="w-4 h-4 text-[#fbe1d1]" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
