import React, { useState } from 'react';
import { Mail, Sparkles, Check, ArrowRight, Loader2, ShieldCheck } from 'lucide-react';

interface NewsletterSubscribeBoxProps {
  source?: string;
  className?: string;
}

export function NewsletterSubscribeBox({ source = 'blog', className = '' }: NewsletterSubscribeBoxProps) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setStatus('error');
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    setStatus('loading');
    setErrorMessage('');

    try {
      const res = await fetch('/api/v2/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        setStatus('error');
        setErrorMessage(data.error || 'Something went wrong. Please try again.');
      } else {
        setStatus('success');
        setEmail('');
      }
    } catch (err: any) {
      console.error('Newsletter signup error:', err);
      setStatus('error');
      setErrorMessage('Failed to connect. Please check your connection and try again.');
    }
  };

  return (
    <div
      className={`my-12 relative overflow-hidden rounded-3xl border border-[#17191c]/10 bg-gradient-to-br from-[#fafafb] via-[#ffffff] to-[#fbe1d1]/30 p-8 sm:p-10 shadow-[0_15px_40px_-15px_rgba(0,0,0,0.05)] ${className}`}
    >
      {/* Decorative top-right accent glow */}
      <div className="absolute top-0 right-0 -mt-8 -mr-8 w-40 h-40 rounded-full bg-[#fbe1d1]/50 blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-2xl mx-auto text-center space-y-6">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-[#fbe1d1] text-[#5d2a1a] px-3.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-[#5d2a1a]" />
          <span>SEOzapp Weekly Dispatch</span>
        </div>

        {/* Heading & Subtitle */}
        <div className="space-y-2.5">
          <h3 className="font-signifier text-2xl sm:text-3xl font-normal text-[#17191c] tracking-tight">
            Subscribe to our weekly newsletter
          </h3>
          <p className="text-[#777b86] text-sm sm:text-base leading-relaxed max-w-lg mx-auto">
            Get actionable breakdowns on AI search visibility, LLM citation tracking, Google AI Overviews, and modern GEO strategies delivered every Tuesday.
          </p>
        </div>

        {/* Form or Success State */}
        {status === 'success' ? (
          <div className="bg-[#10a37f]/10 border border-[#10a37f]/30 rounded-2xl p-6 text-center space-y-2 animate-in fade-in zoom-in duration-300">
            <div className="w-10 h-10 rounded-full bg-[#10a37f] text-white flex items-center justify-center mx-auto shadow-sm">
              <Check className="w-5 h-5" />
            </div>
            <h4 className="text-base font-semibold text-[#17191c]">You&apos;re officially subscribed!</h4>
            <p className="text-xs sm:text-sm text-[#777b86]">
              Thanks for joining. Check your inbox every Tuesday for the latest issue of our weekly dispatch.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-3">
            <div className="flex flex-col sm:flex-row items-center gap-2.5 bg-[#ffffff] p-1.5 rounded-2xl border border-[#17191c]/15 shadow-inner focus-within:border-[#17191c] focus-within:ring-2 focus-within:ring-[#17191c]/5 transition-all">
              <div className="flex items-center gap-2.5 pl-3.5 w-full">
                <Mail className="w-4 h-4 text-[#777b86] flex-shrink-0" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your work email..."
                  required
                  disabled={status === 'loading'}
                  className="w-full bg-transparent text-sm text-[#17191c] placeholder:text-[#979799] focus:outline-hidden py-2"
                />
              </div>

              <button
                type="submit"
                disabled={status === 'loading'}
                className="w-full sm:w-auto flex-shrink-0 bg-[#17191c] hover:bg-[#17191c]/90 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-60 shadow-sm"
              >
                {status === 'loading' ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-[#fbe1d1]" />
                    <span>Subscribing...</span>
                  </>
                ) : (
                  <>
                    <span>Subscribe</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#fbe1d1]" />
                  </>
                )}
              </button>
            </div>

            {status === 'error' && (
              <p className="text-xs text-red-600 font-medium">{errorMessage}</p>
            )}

            {/* Social proof & privacy */}
            <div className="flex items-center justify-center gap-4 text-[11px] text-[#979799] pt-1">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-[#10a37f]" />
                Zero spam • Unsubscribe anytime
              </span>
              <span>•</span>
              <span>Read by 3,500+ SEO leaders</span>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
