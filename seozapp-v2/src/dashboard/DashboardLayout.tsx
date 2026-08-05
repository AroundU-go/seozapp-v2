import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  LayoutDashboard,
  BarChart3,
  TrendingUp,
  Layers,
  Users,
  Globe,
  Sparkles,
  Share2,
  LogOut,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { PostAuthSetupModal } from '@/components/dashboard/PostAuthSetupModal';

interface DashboardLayoutProps {
  children: React.ReactNode;
  activeDomain?: string;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  activeDomain = 'acme-software.com',
}) => {
  const router = useRouter();
  const { user, signOut, isAdmin, paymentType } = useAuth();
  const [displayDomain, setDisplayDomain] = useState(activeDomain);
  const [showSetupModal, setShowSetupModal] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedDomain = localStorage.getItem('tracked_domain');
      if (storedDomain) {
        setDisplayDomain(storedDomain);
      } else if (activeDomain && activeDomain !== 'acme-software.com') {
        setDisplayDomain(activeDomain);
      }
    }
  }, [activeDomain]);

  // Check if logged-in user needs post-auth brand/website setup modal
  useEffect(() => {
    async function checkUserSetup() {
      if (!user?.email) return;

      const storedDomain = typeof window !== 'undefined' ? localStorage.getItem('tracked_domain') : null;
      if (storedDomain) return;

      try {
        const res = await fetch(`/api/v2/workspace?ownerEmail=${encodeURIComponent(user.email)}`);
        const data = await res.json();

        if (data.success && data.domain) {
          setDisplayDomain(data.domain);
          if (typeof window !== 'undefined') {
            localStorage.setItem('tracked_domain', data.domain);
          }
        } else {
          // Domain missing in Supabase & localStorage -> Show setup modal
          setShowSetupModal(true);
        }
      } catch (err) {
        console.warn('Failed to check workspace setup:', err);
      }
    }

    checkUserSetup();
  }, [user]);

  const navItems = [
    { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
    { name: 'SEO Tracking', href: '/dashboard/seo-tracking', icon: BarChart3 },
    { name: 'Prompt Monitoring', href: '/dashboard/citation-monitoring', icon: TrendingUp },
    { name: 'Bulk AI Readiness', href: '/dashboard/bulk-crawl', icon: Layers },
    { name: 'Competitor Intelligence', href: '/dashboard/competitors', icon: Users },
    { name: 'AI Citation', href: '/dashboard/aeo', icon: Sparkles, highlight: true },
    { name: 'Source Intelligence', href: '/dashboard/source-intelligence', icon: Share2 },
  ];

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  const handleSetupComplete = (domain: string) => {
    setDisplayDomain(domain);
    setShowSetupModal(false);
  };

  return (
    <div className="min-h-screen bg-[#fafafb] text-[#17191c] font-sohne flex">
      {/* Post Auth Setup Modal if domain missing */}
      {showSetupModal && (
        <PostAuthSetupModal onComplete={handleSetupComplete} />
      )}

      {/* Vertical Left Sidebar Panel */}
      <aside className="w-64 bg-[#ffffff] border-r border-[#17191c]/10 flex flex-col justify-between p-6 flex-shrink-0 sticky top-0 h-screen overflow-y-auto z-40">
        <div>
          {/* Logo */}
          <div className="mb-8 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5">
              <img src="/seozapp-logo.jpeg" alt="SEOzapp Logo" className="w-7 h-7 rounded-lg object-cover shadow-sm" />
              <span className="font-signifier text-2xl font-normal text-[#17191c] tracking-tight">
                SEOzapp
              </span>
            </Link>
          </div>

          {/* Navigation Links List */}
          <nav className="space-y-1">
            <div className="text-[11px] font-normal uppercase tracking-wider text-[#979799] px-3 mb-2">
              Dashboard Navigation
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = router.pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-[14px] font-medium transition-all ${
                    isActive
                      ? 'bg-[#17191c] text-[#ffffff] shadow-sm'
                      : 'text-[#777b86] hover:text-[#17191c] hover:bg-[#f2f2f3]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-[#ffffff]' : item.highlight ? 'text-[#5d2a1a]' : 'text-[#777b86]'}`} />
                    <span>{item.name}</span>
                  </div>
                  {item.highlight && !isActive && (
                    <span className="text-[10px] font-semibold text-[#5d2a1a] bg-[#fbe1d1] px-1.5 py-0.5 rounded-full">
                      NEW
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Bottom / Active Domain + User Account Section */}
        <div className="pt-5 border-t border-[#17191c]/10 space-y-4">
          {/* Active Domain Info */}
          <div className="bg-[#fafafb] border border-[#17191c]/10 rounded-xl p-2.5 flex items-center gap-2.5 text-[13px]">
            <Globe className="w-4 h-4 text-[#777b86] flex-shrink-0" />
            <div className="truncate">
              <div className="text-[10px] text-[#979799] uppercase font-normal">Tracked Domain</div>
              <div className="text-[#17191c] font-semibold truncate">{displayDomain}</div>
            </div>
          </div>

          {/* Account Profile & Sign Out Section */}
          <div className="bg-[#fafafb] border border-[#17191c]/10 rounded-xl p-3 space-y-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-[#17191c] text-white flex items-center justify-center text-xs font-semibold flex-shrink-0 shadow-sm">
                {user?.email ? user.email[0].toUpperCase() : 'A'}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[12px] font-semibold text-[#17191c] truncate">
                  {user?.email || 'go.aroundu@gmail.com'}
                </div>
                <div className="text-[10px] text-[#5d2a1a] font-medium truncate flex items-center gap-1">
                  {isAdmin && <ShieldCheck className="w-3 h-3 text-[#5d2a1a] inline" />}
                  <span>{isAdmin ? 'Super Admin (Unlimited)' : paymentType || 'Starter Plan'}</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleSignOut}
              className="w-full flex items-center justify-center gap-2 bg-[#ffffff] border border-[#ef4444]/30 text-[#ef4444] hover:bg-[#ef4444]/10 rounded-lg py-1.5 px-3 text-[12px] font-medium transition-all shadow-2xs"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content View Right */}
      <div className="flex-1 min-w-0 overflow-y-auto">
        {children}
      </div>
    </div>
  );
};
