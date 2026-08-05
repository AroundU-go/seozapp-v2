import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '@/services/supabaseClient';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

export default function AuthCallback() {
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let authListener: any = null;

    const handleCallback = async () => {
      try {
        // Check for error in URL hash (Supabase puts errors there for OAuth)
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const hashError = hashParams.get('error_description') || hashParams.get('error');
        if (hashError) {
          setStatus('error');
          setErrorMessage(hashError.replace(/\+/g, ' '));
          return;
        }

        // Check for PKCE code in query params
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');

        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) {
            const { data: { session: existingSession } } = await supabase.auth.getSession();
            if (!existingSession) {
              setStatus('error');
              setErrorMessage(error.message);
              return;
            }
          }
        }

        const { data: { session } } = await supabase.auth.getSession();

        const redirectWithUrl = async (userEmail?: string) => {
          if (userEmail) {
            try {
              // Check if workspace already exists
              const res = await fetch(`/api/v2/workspace?ownerEmail=${encodeURIComponent(userEmail)}`);
              const data = await res.json();
              if (data.success && data.domain) {
                if (typeof window !== 'undefined') {
                  localStorage.setItem('tracked_domain', data.domain);
                }
              }
            } catch (e) {
              console.warn('Callback workspace check failed:', e);
            }
          }

          router.replace('/dashboard');
        };

        if (session) {
          setStatus('success');
          setTimeout(() => redirectWithUrl(session.user.email), 1000);
        } else {
          const { data } = supabase.auth.onAuthStateChange((event, newSession) => {
            if (event === 'SIGNED_IN' && newSession) {
              setStatus('success');
              setTimeout(() => redirectWithUrl(newSession.user.email), 1000);
            }
          });

          authListener = data.subscription;

          setTimeout(async () => {
            const { data: { session: retrySession } } = await supabase.auth.getSession();
            if (retrySession) {
              setStatus('success');
              setTimeout(() => redirectWithUrl(retrySession.user.email), 500);
            } else {
              setStatus((current) => {
                if (current !== 'success') {
                  setErrorMessage('Could not establish a session. Please try signing in again.');
                  return 'error';
                }
                return current;
              });
            }
          }, 4000);
        }
      } catch (err) {
        setStatus('error');
        setErrorMessage('An unexpected error occurred during authentication.');
        console.error('Auth callback error:', err);
      }
    };

    handleCallback();

    return () => {
      if (authListener) {
        authListener.unsubscribe();
      }
    };
  }, [router]);

  return (
    <div className="min-h-screen bg-[#fafafb] flex items-center justify-center px-4 font-sohne">
      <div className="max-w-md w-full bg-[#ffffff] border border-[#17191c]/10 rounded-2xl p-8 text-center shadow-xl">
        {status === 'loading' && (
          <>
            <Loader2 className="w-12 h-12 text-[#17191c] animate-spin mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-[#17191c] mb-3">Signing you in…</h2>
            <p className="text-[#777b86] text-sm">
              Please wait while we verify your Google account.
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-16 h-16 bg-[#10a37f]/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-8 h-8 text-[#10a37f]" />
            </div>
            <h2 className="text-2xl font-bold text-[#17191c] mb-3">You&apos;re in!</h2>
            <p className="text-[#777b86] text-sm">
              Redirecting you to the dashboard…
            </p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-16 h-16 bg-[#ef4444]/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-8 h-8 text-[#ef4444]" />
            </div>
            <h2 className="text-2xl font-bold text-[#17191c] mb-3">Sign in failed</h2>
            <p className="text-[#777b86] text-sm mb-6">
              {errorMessage || 'Something went wrong. Please try again.'}
            </p>
            <button
              onClick={() => router.replace('/auth')}
              className="px-6 py-3 bg-[#17191c] text-[#ffffff] font-medium rounded-xl shadow-md hover:bg-[#17191c]/90 transition-all text-sm"
            >
              Back to Sign In
            </button>
          </>
        )}
      </div>
    </div>
  );
}
