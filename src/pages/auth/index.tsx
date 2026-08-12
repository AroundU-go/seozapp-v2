import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowRight, Mail, Lock, Globe, Building2, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

export default function AuthPage() {
  const router = useRouter();
  const { user, signUp, signIn, signInWithGoogle } = useAuth();

  const [mode, setMode] = useState<'signup' | 'signin'>('signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [brandName, setBrandName] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [verificationSent, setVerificationSent] = useState(false);

  // If already logged in, redirect straight to dashboard
  useEffect(() => {
    if (user) {
      router.replace('/dashboard');
    }
  }, [user, router]);

  const handleGoogleAuth = async () => {
    setGoogleLoading(true);
    setErrorMsg(null);
    try {
      const { error } = await signInWithGoogle();
      if (error) {
        setErrorMsg(error.message);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Google Sign-In failed');
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setErrorMsg('Please fill in all required fields.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      if (mode === 'signup') {
        if (!websiteUrl.trim() || !brandName.trim()) {
          setErrorMsg('Please enter your website URL and brand name.');
          setLoading(false);
          return;
        }

        const cleanDomain = websiteUrl.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '').replace(/^www\./, '');
        const cleanBrand = brandName.trim();

        // 1. Save workspace to Supabase
        await fetch('/api/v2/workspace', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ownerEmail: email,
            brandName: cleanBrand,
            websiteUrl: cleanDomain,
          }),
        });

        if (typeof window !== 'undefined') {
          localStorage.setItem('tracked_domain', cleanDomain);
          localStorage.setItem('user_tracked_sites', JSON.stringify([{ domain: cleanDomain, competitor: '' }]));
          localStorage.setItem('pending_brand_name', cleanBrand);
        }

        // 2. Trigger Supabase Sign Up (sends verification email)
        const { error } = await signUp(email, password, cleanBrand);

        if (error) {
          setErrorMsg(error.message);
        } else {
          setVerificationSent(true);
        }
      } else {
        // Sign In
        const { error } = await signIn(email, password);
        if (error) {
          setErrorMsg(error.message);
        } else {
          // Fetch workspace domain from Supabase for this user
          try {
            const res = await fetch(`/api/v2/workspace?ownerEmail=${encodeURIComponent(email.toLowerCase().trim())}`);
            const data = await res.json();
            if (data.success && data.domain) {
              const cleanDom = data.domain.toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '').replace(/^www\./, '');
              if (typeof window !== 'undefined') {
                localStorage.setItem('tracked_domain', cleanDom);
                localStorage.setItem('user_tracked_sites', JSON.stringify([{ domain: cleanDom, competitor: '' }]));
              }
            }
          } catch (wsErr) {
            console.warn('Sign-in workspace check failed:', wsErr);
          }
          router.replace('/dashboard');
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>{mode === 'signup' ? 'Create Your Account' : 'Log In'} — SEOzapp</title>
      </Head>

      <div className="min-h-screen bg-[#fafafb] flex flex-col justify-center py-12 px-6 font-sohne">
        <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
          <Link href="/" className="inline-flex items-center gap-2.5 justify-center mb-3">
            <img src="/seozapp-logo.jpeg" alt="SEOzapp Logo" className="w-8 h-8 rounded-lg object-cover shadow-sm" />
            <span className="font-signifier text-3xl font-normal text-[#17191c] tracking-tight">
              SEOzapp
            </span>
          </Link>
          <h2 className="text-2xl font-semibold text-[#17191c]">
            {verificationSent ? 'Check Your Email' : mode === 'signup' ? 'Start your free trial' : 'Welcome back'}
          </h2>
          <p className="text-[#777b86] text-sm mt-1">
            {verificationSent
              ? 'We sent a verification link to confirm your account.'
              : mode === 'signup'
              ? 'Enter your domain & brand details to access the dashboard'
              : 'Sign in to access your SEO & AI search visibility suite'}
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-[#ffffff] py-8 px-8 border border-[#17191c]/10 rounded-2xl shadow-xl space-y-6">
            {verificationSent ? (
              <div className="text-center space-y-4 py-4">
                <div className="w-16 h-16 bg-[#10a37f]/10 rounded-full flex items-center justify-center mx-auto text-[#10a37f]">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-[#17191c]">Verification email sent!</h3>
                  <p className="text-xs text-[#777b86] max-w-xs mx-auto">
                    We sent a confirmation link to <span className="font-semibold text-[#17191c]">{email}</span>. Please click the link in your email to activate your account and proceed to the dashboard.
                  </p>
                </div>
                <button
                  onClick={() => setVerificationSent(false)}
                  className="text-xs text-[#17191c] underline hover:opacity-80 pt-2"
                >
                  Need to change your email address?
                </button>
              </div>
            ) : (
              <>
                {/* Google OAuth Button */}
                <button
                  type="button"
                  onClick={handleGoogleAuth}
                  disabled={googleLoading}
                  className="w-full bg-[#ffffff] border border-[#17191c]/15 text-[#17191c] font-medium py-3 rounded-xl hover:bg-[#fafafb] transition-all flex items-center justify-center gap-3 shadow-xs text-sm"
                >
                  {googleLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin text-[#17191c]" />
                  ) : (
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                  )}
                  <span>Continue with Google</span>
                </button>

                <div className="relative flex items-center justify-center">
                  <div className="border-t border-[#17191c]/10 w-full" />
                  <span className="bg-[#ffffff] px-3 text-xs text-[#777b86] uppercase tracking-wider">or</span>
                  <div className="border-t border-[#17191c]/10 w-full" />
                </div>

                {/* Tabs: Sign Up vs Sign In */}
                <div className="flex bg-[#fafafb] p-1 rounded-xl border border-[#17191c]/5">
                  <button
                    type="button"
                    onClick={() => { setMode('signup'); setErrorMsg(null); }}
                    className={`flex-1 text-xs font-semibold py-2 rounded-lg transition-all ${
                      mode === 'signup' ? 'bg-[#ffffff] text-[#17191c] shadow-xs' : 'text-[#777b86] hover:text-[#17191c]'
                    }`}
                  >
                    Sign Up
                  </button>
                  <button
                    type="button"
                    onClick={() => { setMode('signin'); setErrorMsg(null); }}
                    className={`flex-1 text-xs font-semibold py-2 rounded-lg transition-all ${
                      mode === 'signin' ? 'bg-[#ffffff] text-[#17191c] shadow-xs' : 'text-[#777b86] hover:text-[#17191c]'
                    }`}
                  >
                    Sign In
                  </button>
                </div>

                {/* Error Banner */}
                {errorMsg && (
                  <div className="p-3 bg-[#ef4444]/10 border border-[#ef4444]/20 rounded-xl text-xs text-[#ef4444] flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-[#17191c] mb-1">Work Email</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-[#777b86] absolute left-3.5 top-3" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@company.com"
                        className="w-full bg-[#ffffff] border border-[#17191c]/15 rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#17191c] focus:outline-none focus:border-[#17191c]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#17191c] mb-1">Password</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-[#777b86] absolute left-3.5 top-3" />
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-[#ffffff] border border-[#17191c]/15 rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#17191c] focus:outline-none focus:border-[#17191c]"
                      />
                    </div>
                  </div>

                  {mode === 'signup' && (
                    <>
                      <div>
                        <label className="block text-xs font-medium text-[#17191c] mb-1">Website URL</label>
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
                        <label className="block text-xs font-medium text-[#17191c] mb-1">Brand Name</label>
                        <div className="relative">
                          <Building2 className="w-4 h-4 text-[#777b86] absolute left-3.5 top-3" />
                          <input
                            type="text"
                            required
                            value={brandName}
                            onChange={(e) => setBrandName(e.target.value)}
                            placeholder="e.g. Acme Corp"
                            className="w-full bg-[#ffffff] border border-[#17191c]/15 rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#17191c] focus:outline-none focus:border-[#17191c]"
                          />
                        </div>
                      </div>
                    </>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#17191c] text-[#ffffff] font-medium py-3 rounded-xl hover:bg-[#17191c]/90 transition-all flex items-center justify-center gap-2 shadow-sm text-sm disabled:opacity-60"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <span>{mode === 'signup' ? 'Create Account & Verify Email' : 'Sign In'}</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
