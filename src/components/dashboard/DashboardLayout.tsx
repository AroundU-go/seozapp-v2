import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  LayoutDashboard,
  BarChart3,
  TrendingUp,
  Users,
  Globe,
  Sparkles,
  Share2,
  LogOut,
  ShieldCheck,
  Bot,
  Link2,
  Target,
  Plus,
  ChevronDown,
  Check,
  Lock,
  X,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { PostAuthSetupModal } from '@/components/dashboard/PostAuthSetupModal';
import { PricingModal } from '@/components/pricing/PricingModal';

export interface TrackedSite {
  domain: string;
  competitor: string;
}

interface DashboardLayoutProps {
  children: React.ReactNode;
  activeDomain?: string;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  activeDomain = 'Enter Domain',
}) => {
  const router = useRouter();
  const { user, signOut, isAdmin, isPro, paymentType, refreshProStatus } = useAuth();
  const [displayDomain, setDisplayDomain] = useState(activeDomain);
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [paymentSuccessToast, setPaymentSuccessToast] = useState(false);

  // Handle post-payment redirect
  useEffect(() => {
    if (router.query.payment === 'success') {
      refreshProStatus();
      setPaymentSuccessToast(true);
      router.replace(router.pathname, undefined, { shallow: true });
      const timer = setTimeout(() => setPaymentSuccessToast(false), 6000);
      return () => clearTimeout(timer);
    }
  }, [router.query.payment, refreshProStatus, router]);

  // Multi-domain management according to pricing tiers ($49 Starter: 2 sites, $99 Pro: 5 sites)
  const maxSites = (isAdmin || paymentType === 'enterprise') ? 999 : (paymentType === 'pro' ? 5 : 2);
  const [sites, setSites] = useState<TrackedSite[]>([]);
  const [activeSiteIndex, setActiveSiteIndex] = useState<number>(0);
  const [showAddSiteModal, setShowAddSiteModal] = useState<boolean>(false);
  const [newDomain, setNewDomain] = useState<string>('');
  const [newCompetitor, setNewCompetitor] = useState<string>('');
  const [addError, setAddError] = useState<string | null>(null);
  const [showDomainDropdown, setShowDomainDropdown] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedDomain = localStorage.getItem('tracked_domain');
      const validStoredDomain = (storedDomain && storedDomain !== 'acme-software.com') ? storedDomain : null;
      const validActiveDomain = (activeDomain && activeDomain !== 'acme-software.com' && activeDomain !== 'Enter Domain') ? activeDomain : null;

      if (validStoredDomain) {
        setDisplayDomain(validStoredDomain);
      } else if (validActiveDomain) {
        setDisplayDomain(validActiveDomain);
      }

      // Load tracked sites list
      const rawSites = localStorage.getItem('user_tracked_sites');
      if (rawSites) {
        try {
          const parsed = JSON.parse(rawSites);
          const cleanedSites = Array.isArray(parsed)
            ? parsed.filter((s: TrackedSite) => s.domain && s.domain.toLowerCase() !== 'acme-software.com')
            : [];

          if (cleanedSites.length > 0) {
            setSites(cleanedSites);
            const activeDom = validStoredDomain || validActiveDomain;
            const idx = cleanedSites.findIndex((s: TrackedSite) => s.domain.toLowerCase() === activeDom?.toLowerCase());
            if (idx !== -1) {
              setActiveSiteIndex(idx);
            } else {
              setActiveSiteIndex(0);
              setDisplayDomain(cleanedSites[0].domain);
            }
            return;
          }
        } catch (e) {}
      }

      // Initial fallback list if empty
      const initDom = validStoredDomain || validActiveDomain || '';
      if (initDom) {
        const initComp = localStorage.getItem('tracked_competitor') || '';
        const initialSites = [{ domain: initDom, competitor: initComp }];
        setSites(initialSites);
        localStorage.setItem('user_tracked_sites', JSON.stringify(initialSites));
      } else {
        setSites([]);
      }
    }
  }, [activeDomain]);

  const handleSelectSite = (index: number) => {
    setActiveSiteIndex(index);
    const site = sites[index];
    if (site) {
      setDisplayDomain(site.domain);
      if (typeof window !== 'undefined') {
        localStorage.setItem('tracked_domain', site.domain);
        if (site.competitor) {
          localStorage.setItem('tracked_competitor', site.competitor);
        } else {
          localStorage.removeItem('tracked_competitor');
        }
      }
    }
    setShowDomainDropdown(false);
  };

  const handleAddSite = (e: React.FormEvent) => {
    e.preventDefault();
    setAddError(null);

    const cleanDom = newDomain.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/$/, '');
    const cleanComp = newCompetitor.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/$/, '');

    if (!cleanDom) {
      setAddError('Please enter a valid site domain.');
      return;
    }

    if (sites.length >= maxSites) {
      setAddError(`Your plan allows a maximum of ${maxSites} site${maxSites > 1 ? 's' : ''}. Upgrade your plan to add more sites.`);
      return;
    }

    if (sites.some((s) => s.domain.toLowerCase() === cleanDom)) {
      setAddError('This site domain is already in your domain list.');
      return;
    }

    const updatedSites = [...sites, { domain: cleanDom, competitor: cleanComp }];
    setSites(updatedSites);
    setActiveSiteIndex(updatedSites.length - 1);
    setDisplayDomain(cleanDom);

    if (typeof window !== 'undefined') {
      localStorage.setItem('user_tracked_sites', JSON.stringify(updatedSites));
      localStorage.setItem('tracked_domain', cleanDom);
      if (cleanComp) {
        localStorage.setItem('tracked_competitor', cleanComp);
      }
    }

    setNewDomain('');
    setNewCompetitor('');
    setShowAddSiteModal(false);
  };

  // Check if logged-in user needs post-auth brand/website setup modal
  useEffect(() => {
    async function checkUserSetup() {
      if (!user?.email) return;

      const userKey = `setup_dismissed_${user.email.toLowerCase()}`;
      const isDismissed = typeof window !== 'undefined' ? localStorage.getItem(userKey) === 'true' : false;
      const storedDomain = typeof window !== 'undefined' ? localStorage.getItem('tracked_domain') : null;
      const validStored = (storedDomain && storedDomain !== 'acme-software.com') ? storedDomain : null;

      if (validStored) {
        setDisplayDomain(validStored);
        const rawSites = typeof window !== 'undefined' ? localStorage.getItem('user_tracked_sites') : null;
        if (!rawSites || rawSites.includes('acme-software.com')) {
          const initComp = localStorage.getItem('tracked_competitor') || '';
          const cleanSites = [{ domain: validStored, competitor: initComp }];
          localStorage.setItem('user_tracked_sites', JSON.stringify(cleanSites));
          setSites(cleanSites);
        }
      }

      if (isDismissed && validStored) return;

      try {
        const res = await fetch(`/api/v2/workspace?ownerEmail=${encodeURIComponent(user.email)}`);
        const data = await res.json();

        if (data.success && data.domain && data.domain !== 'acme-software.com') {
          const cleanDom = data.domain.toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '').replace(/^www\./, '');
          setDisplayDomain(cleanDom);
          if (typeof window !== 'undefined') {
            localStorage.setItem('tracked_domain', cleanDom);
            const initComp = localStorage.getItem('tracked_competitor') || '';
            const newSites = [{ domain: cleanDom, competitor: initComp }];
            localStorage.setItem('user_tracked_sites', JSON.stringify(newSites));
            localStorage.setItem(userKey, 'true');
            setSites(newSites);
          }
        } else if (data.success && data.workspace && data.workspace.name) {
          const domain = `${data.workspace.name.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '')}.com`;
          setDisplayDomain(domain);
          if (typeof window !== 'undefined') {
            localStorage.setItem('tracked_domain', domain);
            const newSites = [{ domain, competitor: '' }];
            localStorage.setItem('user_tracked_sites', JSON.stringify(newSites));
            localStorage.setItem(userKey, 'true');
            setSites(newSites);
          }
        } else if (!validStored) {
          const hasExistingActivity = isAdmin || paymentType === 'pro' || paymentType === 'enterprise';
          if (hasExistingActivity) {
            if (typeof window !== 'undefined') {
              localStorage.setItem(userKey, 'true');
            }
          } else {
            setShowSetupModal(true);
          }
        }
      } catch (err) {
        console.warn('Failed to check workspace setup:', err);
      }
    }

    checkUserSetup();
  }, [user, isAdmin, paymentType]);

  const navItems = [
    { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
    { name: 'SEO Tracking', href: '/dashboard/seo-tracking', icon: BarChart3 },
    { name: 'Prompt Monitoring', href: '/dashboard/citation-monitoring', icon: TrendingUp },
    { name: 'Competitor Intelligence', href: '/dashboard/competitors', icon: Users },
    { name: 'AI Citation', href: '/dashboard/aeo', icon: Sparkles, highlight: true },
    { name: 'Source Intelligence', href: '/dashboard/source-intelligence', icon: Share2, isBeta: true },
    { name: 'AI Bot Access', href: '/dashboard/ai-bot-access', icon: Bot },
    { name: 'Brand Mentions', href: '/dashboard/brand-mentions', icon: Link2 },
    { name: 'Content Gap Finder', href: '/dashboard/content-gaps', icon: Target, isBeta: true },
  ];

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  const handleSetupComplete = (domain: string) => {
    setDisplayDomain(domain);
    if (user?.email && typeof window !== 'undefined') {
      localStorage.setItem(`setup_dismissed_${user.email.toLowerCase()}`, 'true');
    }
    setShowSetupModal(false);
  };

  return (
    <div className="min-h-screen bg-[#fafafb] text-[#17191c] font-sohne flex">
      {/* Post Auth Setup Modal */}
      {showSetupModal && (
        <PostAuthSetupModal onComplete={handleSetupComplete} />
      )}

      {/* Pricing Upgrade Modal */}
      {showPricingModal && (
        <PricingModal isOpen={showPricingModal} onClose={() => setShowPricingModal(false)} />
      )}

      {/* Modal to Add New Site Domain + 1 Competitor */}
      {showAddSiteModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#17191c]/15 shadow-2xl max-w-md w-full p-6 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-[#17191c]/10 pb-3">
              <div>
                <h3 className="text-lg font-bold text-[#17191c]">Add Site to Your Domains</h3>
                <p className="text-xs text-[#777b86] mt-0.5">
                  Your plan allows {maxSites} site{maxSites > 1 ? 's' : ''}.
                </p>
              </div>
              <button
                onClick={() => setShowAddSiteModal(false)}
                className="text-[#777b86] hover:text-[#17191c] p-1 rounded-lg hover:bg-[#fafafb]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSite} className="space-y-4">
              {addError && (
                <div className="p-3 bg-[#ef4444]/10 border border-[#ef4444]/20 rounded-xl text-xs text-[#ef4444] font-medium">
                  {addError}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#17191c]">Site Domain *</label>
                <input
                  type="text"
                  placeholder="e.g. mybrand.com"
                  value={newDomain}
                  onChange={(e) => setNewDomain(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#fafafb] border border-[#17191c]/15 rounded-xl text-sm text-[#17191c] focus:outline-none focus:border-[#17191c]"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#17191c]">Corresponding Competitor (1 Allowed)</label>
                <input
                  type="text"
                  placeholder="e.g. rivaldomain.com"
                  value={newCompetitor}
                  onChange={(e) => setNewCompetitor(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#fafafb] border border-[#17191c]/15 rounded-xl text-sm text-[#17191c] focus:outline-none focus:border-[#17191c]"
                />
                <p className="text-[11px] text-[#777b86]">
                  Mapped 1:1 with your site for competitor intelligence benchmarking.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddSiteModal(false)}
                  className="px-4 py-2 text-xs font-medium text-[#777b86] hover:text-[#17191c]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#17191c] text-white rounded-xl text-xs font-semibold hover:bg-[#17191c]/90 transition-all shadow-sm"
                >
                  Add Site ({sites.length + 1}/{maxSites})
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Vertical Left Sidebar Panel */}
      <aside className="w-64 bg-[#ffffff] border-r border-[#17191c]/10 flex flex-col justify-between p-6 flex-shrink-0 sticky top-0 h-screen overflow-y-auto z-40">
        <div>
          {/* Logo */}
          <div className="mb-8 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5">
              <img src="/seozapp-logo.jpeg" alt="SEOzapp Logo" className="w-7 h-7 rounded-lg object-cover shadow-sm" />
              <div className="flex items-center gap-1.5">
                <span className="font-signifier text-2xl font-normal text-[#17191c] tracking-tight">
                  SEOzapp
                </span>
                {(isPro || isAdmin) && (
                  <span className="text-[10px] font-bold tracking-wider bg-[#17191c] text-[#fbe1d1] px-2 py-0.5 rounded-md uppercase shadow-xs">
                    PRO
                  </span>
                )}
              </div>
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
                  {item.isBeta && (
                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                      isActive ? 'bg-white/20 text-white' : 'text-[#5d2a1a] bg-[#fbe1d1]'
                    }`}>
                      BETA
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Bottom / Your Domains + User Account Section */}
        <div className="pt-5 border-t border-[#17191c]/10 space-y-4">
          {/* Your Domains Section */}
          <div className="bg-[#fafafb] border border-[#17191c]/10 rounded-xl p-3 relative">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] text-[#979799] uppercase font-bold tracking-wider">
                Your Domains ({sites.length}/{maxSites})
              </span>
              {sites.length < maxSites ? (
                <button
                  onClick={() => {
                    setAddError(null);
                    setShowAddSiteModal(true);
                  }}
                  className="text-[10px] font-semibold text-[#5d2a1a] bg-[#fbe1d1] hover:bg-[#5d2a1a] hover:text-white px-2 py-0.5 rounded-md transition-colors flex items-center gap-0.5"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add</span>
                </button>
              ) : (
                <button
                  onClick={() => setShowPricingModal(true)}
                  className="text-[10px] font-semibold text-[#777b86] hover:text-[#17191c] flex items-center gap-1"
                >
                  <Lock className="w-3 h-3 text-[#777b86]" />
                  <span>Max ({maxSites})</span>
                </button>
              )}
            </div>

            {/* Active Domain Selector */}
            <button
              onClick={() => setShowDomainDropdown(!showDomainDropdown)}
              className="w-full bg-white border border-[#17191c]/10 hover:border-[#17191c]/30 rounded-lg p-2 flex items-center justify-between text-left transition-all shadow-2xs"
            >
              <div className="flex items-center gap-2 min-w-0">
                <Globe className="w-4 h-4 text-[#17191c] flex-shrink-0" />
                <div className="min-w-0">
                  <div className="text-[12px] font-semibold text-[#17191c] truncate">
                    {sites[activeSiteIndex]?.domain || displayDomain}
                  </div>
                  <div className="text-[10px] text-[#777b86] truncate">
                    {sites[activeSiteIndex]?.competitor ? `Competitor: ${sites[activeSiteIndex].competitor}` : '1 competitor allowed'}
                  </div>
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-[#777b86] flex-shrink-0 ml-1" />
            </button>

            {/* Dropdown Menu */}
            {showDomainDropdown && (
              <div className="absolute left-0 right-0 bottom-full mb-1 bg-white border border-[#17191c]/15 rounded-xl shadow-lg z-50 p-1.5 space-y-1">
                {sites.map((site, i) => (
                  <button
                    key={site.domain}
                    onClick={() => handleSelectSite(i)}
                    className={`w-full text-left p-2 rounded-lg text-xs flex items-center justify-between transition-colors ${
                      i === activeSiteIndex ? 'bg-[#17191c] text-white font-medium' : 'hover:bg-[#fafafb] text-[#17191c]'
                    }`}
                  >
                    <div className="truncate pr-1">
                      <div className="font-semibold truncate">{site.domain}</div>
                      <div className={`text-[10px] truncate ${i === activeSiteIndex ? 'text-white/70' : 'text-[#777b86]'}`}>
                        {site.competitor ? `Competitor: ${site.competitor}` : 'No competitor set'}
                      </div>
                    </div>
                    {i === activeSiteIndex && <Check className="w-3.5 h-3.5 text-[#fbe1d1] flex-shrink-0" />}
                  </button>
                ))}

                {sites.length < maxSites && (
                  <button
                    onClick={() => {
                      setShowDomainDropdown(false);
                      setAddError(null);
                      setShowAddSiteModal(true);
                    }}
                    className="w-full text-left p-2 rounded-lg text-xs font-semibold text-[#5d2a1a] bg-[#fbe1d1]/50 hover:bg-[#fbe1d1] flex items-center gap-1.5 transition-colors mt-1 border-t border-[#17191c]/5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add New Site ({sites.length}/{maxSites})</span>
                  </button>
                )}
              </div>
            )}
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
                  <span>{isAdmin ? 'Super Admin (Unlimited)' : paymentType || 'Starter Plan ($49/mo)'}</span>
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
      <div className="flex-1 min-w-0 overflow-y-auto relative">
        {paymentSuccessToast && (
          <div className="bg-[#10a37f] text-white px-6 py-3 text-xs font-semibold flex items-center justify-between shadow-md animate-in slide-in-from-top duration-300 sticky top-0 z-50">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#fbe1d1]" />
              <span>🎉 Payment successful! Welcome to SEOzapp Pro — your account has been upgraded with full access.</span>
            </div>
            <button onClick={() => setPaymentSuccessToast(false)} className="text-white/80 hover:text-white ml-4">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
        {children}
      </div>
    </div>
  );
};
