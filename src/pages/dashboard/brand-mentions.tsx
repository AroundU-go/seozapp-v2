import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import {
  Link2,
  RefreshCw,
  Sparkles,
  ExternalLink,
  Globe,
  Tag,
  Search,
  AlertCircle,
  TrendingUp,
  Mail,
  Copy,
  Check,
  ShieldCheck,
  Award,
  Filter,
  Layers,
  ThumbsUp,
  MessageSquare,
  Flame,
} from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';

import { Clock } from 'lucide-react';
import { HistoryModal, HistoryItem } from '@/components/dashboard/HistoryModal';

import { PricingModal } from '@/components/pricing/PricingModal';

export default function BrandMentionsPage() {
  const { user, isAdmin, isPro } = useAuth();
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [brandName, setBrandName] = useState('');
  const [domain, setDomain] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [report, setReport] = useState<any>(null);

  // Supabase History Modal state
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
      const res = await fetch(`/api/v2/brand-mentions?userEmail=${encodeURIComponent(user?.email || '')}`);
      const data = await res.json();
      if (data.success && data.mentions) {
        const formatted = data.mentions.map((item: any) => ({
          id: item.id,
          title: item.brand_name || item.domain,
          subtitle: `Domain: ${item.domain || 'N/A'} • Total Mentions: ${item.total_mentions || 0}`,
          timestamp: item.created_at || new Date().toISOString(),
          badge: `${item.total_mentions || 0} Mentions`,
          data: item.mentions_data || item,
        }));
        setHistoryItems(formatted);
      }
    } catch (err) {
      console.warn('Failed to load brand mention history:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  // Filter & Search states
  const [filterType, setFilterType] = useState<'ALL' | 'LINKED' | 'UNLINKED' | 'HIGH_PRIORITY'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('tracked_domain');
      if (stored) {
        setDomain(stored);
        setBrandName(stored.replace(/^https?:\/\//, '').replace(/^www\./, '').split('.')[0]);
      }
    }
  }, []);

  // Load latest brand mentions report from Supabase on mount
  useEffect(() => {
    if (!user?.email) return;
    (async () => {
      try {
        const res = await fetch(`/api/v2/brand-mentions?userEmail=${encodeURIComponent(user?.email || '')}`);
        const data = await res.json();
        if (data.success && data.mentions && data.mentions.length > 0) {
          const latest = data.mentions[0];
          setReport(latest.mentions_data || latest);
          if (latest.brand_name) setBrandName(latest.brand_name);
          if (latest.domain) setDomain(latest.domain);
        }
      } catch (err) {
        console.warn('Failed to load latest brand mentions on mount:', err);
      }
    })();
  }, [user?.email]);

  const handleSearchMentions = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!brandName.trim()) return;

    if (!isAdmin && !isPro) {
      setShowPricingModal(true);
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/v2/brand-mentions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brandName: brandName.trim(),
          domain: domain.trim(),
          userEmail: user?.email || null,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        setErrorMsg(data.error || `HTTP ${res.status}`);
        return;
      }

      if (data.success && data.data) {
        setReport(data.data);
      }
    } catch (err: any) {
      console.error('Brand mentions error:', err);
      setErrorMsg(err.message || 'Failed to discover brand mentions');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyPitch = (id: string, pitchText: string) => {
    navigator.clipboard.writeText(pitchText);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filtered mentions
  const allMentions = report?.mentions || [];
  const filteredMentions = allMentions.filter((m: any) => {
    // Type filter
    if (filterType === 'LINKED' && m.mentionType !== 'Linked Backlink') return false;
    if (filterType === 'UNLINKED' && m.mentionType !== 'Unlinked Brand Mention') return false;
    if (filterType === 'HIGH_PRIORITY' && m.outreachPriority !== 'HIGH') return false;

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = m.title?.toLowerCase().includes(q);
      const matchDomain = m.domain?.toLowerCase().includes(q);
      const matchSnippet = m.snippet?.toLowerCase().includes(q);
      const matchAuthor = m.author?.toLowerCase().includes(q);
      return matchTitle || matchDomain || matchSnippet || matchAuthor;
    }

    return true;
  });

  return (
    <DashboardLayout activeDomain={domain || ''}>
      <Head>
        <title>Brand Mention &amp; Backlink Intelligence — SEOzapp v2</title>
      </Head>

      <PricingModal isOpen={showPricingModal} onClose={() => setShowPricingModal(false)} />

      <main className="max-w-[1250px] mx-auto px-8 py-8 space-y-8">
        {/* Module Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[12px] font-semibold text-[#17191c] bg-[#f2f2f3] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Module 07 • Deep Web Intelligence
              </span>
              <span className="text-[12px] text-[#777b86]">Neural Web Search Index</span>
            </div>
            <h1 className="text-[28px] font-semibold text-[#17191c] mt-1">
              Brand Mention &amp; Backlink Intelligence
            </h1>
            <p className="text-[15px] text-[#777b86]">
              Surface unlinked brand mentions, high-authority backlink leads, and live neural web references.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setShowHistoryModal(true);
              fetchHistory();
            }}
            className="bg-[#ffffff] hover:bg-[#17191c] text-[#17191c] hover:text-[#ffffff] border border-[#17191c]/15 rounded-xl px-4 py-2.5 text-sm font-semibold flex items-center gap-2 transition-all shadow-sm flex-shrink-0 self-start md:self-auto"
          >
            <Clock className="w-4 h-4 text-[#5d2a1a]" />
            <span>History</span>
          </button>
        </div>

        <HistoryModal
          isOpen={showHistoryModal}
          onClose={() => setShowHistoryModal(false)}
          title="Previous Brand Mention Scans"
          featureName="Module 07 • Deep Web Intelligence"
          items={historyItems}
          loading={loadingHistory}
          onRefresh={fetchHistory}
          onSelect={(item) => {
            if (item.data) {
              setReport(item.data);
              if (item.data.brandName) setBrandName(item.data.brandName);
              if (item.data.domain) setDomain(item.data.domain);
            }
          }}
        />

        {/* Input Form Card */}
        <div className="bg-[#ffffff] rounded-2xl p-6 border border-[#17191c]/10 shadow-sm space-y-4">
          <form onSubmit={handleSearchMentions} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="relative">
              <Tag className="w-4 h-4 text-[#777b86] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                placeholder="Brand Name (e.g. SEOzapp)"
                className="bg-[#fafafb] border border-[#17191c]/15 rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#17191c] focus:outline-none w-full shadow-inner"
              />
            </div>
            <div className="relative">
              <Globe className="w-4 h-4 text-[#777b86] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                placeholder="Domain (e.g. seozapp.com)"
                className="bg-[#fafafb] border border-[#17191c]/15 rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#17191c] focus:outline-none w-full shadow-inner"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !brandName.trim()}
              className="bg-[#17191c] text-[#ffffff] rounded-xl px-6 py-2.5 text-sm font-medium hover:bg-[#17191c]/90 disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4 text-[#fbe1d1]" />}
              <span>{loading ? 'Scanning Deep Index...' : 'Discover Brand Mentions'}</span>
            </button>
          </form>

          {errorMsg && (
            <div className="p-3 bg-[#ef4444]/10 border border-[#ef4444]/20 rounded-xl text-xs text-[#ef4444] font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>

        {/* Results Panel */}
        {report ? (
          <div className="space-y-8">
            {/* Top Metrics Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-[#ffffff] rounded-2xl p-5 border border-[#17191c]/10 shadow-sm">
                <span className="text-xs text-[#777b86]">Total Web Mentions</span>
                <div className="text-3xl font-bold text-[#17191c] mt-1">{report.totalMentions}</div>
                <span className="text-xs text-[#777b86] mt-1 block">Neural Web Search Index</span>
              </div>

              <div className="bg-[#ffffff] rounded-2xl p-5 border border-[#17191c]/10 shadow-sm">
                <span className="text-xs text-[#777b86]">Active Backlinks</span>
                <div className="text-3xl font-bold text-[#10a37f] mt-1">{report.totalBacklinks}</div>
                <span className="text-xs text-[#10a37f] font-medium mt-1 block">✓ Hyperlinked Pages</span>
              </div>

              <div className="bg-[#ffffff] rounded-2xl p-5 border border-[#17191c]/10 shadow-sm">
                <span className="text-xs text-[#777b86]">Unlinked Outreach Leads</span>
                <div className="text-3xl font-bold text-[#5d2a1a] mt-1">{report.totalUnlinkedMentions}</div>
                <span className="text-xs text-[#5d2a1a] font-medium mt-1 block flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5" />
                  High Conversion Potential
                </span>
              </div>

              <div className="bg-[#ffffff] rounded-2xl p-5 border border-[#17191c]/10 shadow-sm">
                <span className="text-xs text-[#777b86]">Avg Relevance Score</span>
                <div className="text-3xl font-bold text-[#17191c] mt-1">{report.avgRelevanceScore}%</div>
                <span className="text-xs text-[#10a37f] font-medium mt-1 block">Neural Match Quality</span>
              </div>
            </div>

            {/* Filter & Search Toolbar */}
            <div className="bg-[#ffffff] rounded-2xl p-4 border border-[#17191c]/10 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              {/* Filter Tabs */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setFilterType('ALL')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${filterType === 'ALL' ? 'bg-[#17191c] text-[#ffffff]' : 'bg-[#fafafb] text-[#777b86] hover:text-[#17191c]'}`}
                >
                  All Mentions ({report.totalMentions})
                </button>
                <button
                  onClick={() => setFilterType('LINKED')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${filterType === 'LINKED' ? 'bg-[#10a37f] text-[#ffffff]' : 'bg-[#fafafb] text-[#777b86] hover:text-[#10a37f]'}`}
                >
                  Backlinks ({report.totalBacklinks})
                </button>
                <button
                  onClick={() => setFilterType('UNLINKED')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${filterType === 'UNLINKED' ? 'bg-[#5d2a1a] text-[#ffffff]' : 'bg-[#fafafb] text-[#777b86] hover:text-[#5d2a1a]'}`}
                >
                  Unlinked Leads ({report.totalUnlinkedMentions})
                </button>
                <button
                  onClick={() => setFilterType('HIGH_PRIORITY')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${filterType === 'HIGH_PRIORITY' ? 'bg-[#ef4444] text-[#ffffff]' : 'bg-[#fafafb] text-[#777b86] hover:text-[#ef4444]'}`}
                >
                  High Priority
                </button>
              </div>

              {/* Dynamic Filter Search */}
              <div className="relative w-full md:w-64">
                <Filter className="w-3.5 h-3.5 text-[#777b86] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter mentions..."
                  className="bg-[#fafafb] border border-[#17191c]/15 rounded-xl pl-8 pr-3 py-1.5 text-xs text-[#17191c] focus:outline-none w-full shadow-inner"
                />
              </div>
            </div>

            {/* Mentions List Grid */}
            <div className="bg-[#ffffff] rounded-2xl p-6 border border-[#17191c]/10 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#f2f2f3]">
                <h3 className="font-semibold text-[16px] text-[#17191c]">
                  Detailed Web Mentions &amp; Neural References ({filteredMentions.length})
                </h3>
                <span className="text-xs text-[#777b86]">Sorted by Neural Match Score</span>
              </div>

              <div className="space-y-4">
                {filteredMentions.map((m: any) => (
                  <div key={m.id} className="p-5 bg-[#fafafb] rounded-2xl border border-[#17191c]/8 space-y-3 hover:border-[#17191c]/20 transition-all">
                    {/* Header Row */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                      <a
                        href={m.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-semibold text-[#17191c] hover:underline text-[15px] flex items-center gap-1.5 truncate max-w-2xl"
                      >
                        <span>{m.title}</span>
                        <ExternalLink className="w-4 h-4 text-[#777b86] flex-shrink-0" />
                      </a>

                      <div className="flex flex-wrap items-center gap-2">
                        {/* Domain Tier Badge */}
                        <span className="text-[11px] font-medium bg-[#f2f2f3] text-[#17191c] px-2.5 py-0.5 rounded-full border border-[#17191c]/10 flex items-center gap-1">
                          <Award className="w-3 h-3 text-[#777b86]" />
                          <span>{m.domainAuthorityTier}</span>
                        </span>

                        {/* Relevance Score Badge */}
                        <span className="text-[11px] font-bold bg-[#17191c] text-[#fbe1d1] px-2.5 py-0.5 rounded-full">
                          {m.score}% Relevance
                        </span>

                        {/* Mention Type Badge */}
                        <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${m.mentionType === 'Linked Backlink' ? 'bg-[#10a37f]/10 text-[#10a37f] border border-[#10a37f]/20' : 'bg-[#fbe1d1] text-[#5d2a1a] border border-[#5d2a1a]/20'}`}>
                          {m.mentionType}
                        </span>
                      </div>
                    </div>

                    {/* Excerpt / Highlight */}
                    <div className="p-3 bg-[#ffffff] rounded-xl border border-[#17191c]/5 text-xs text-[#17191c] leading-relaxed font-sohne italic">
                      &quot;{m.snippet}&quot;
                    </div>

                    {/* Metadata & Pitch Bar */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-2 border-t border-[#17191c]/5 text-xs">
                      <div className="flex flex-wrap items-center gap-3 text-[#777b86]">
                        <span>Domain: <strong className="text-[#17191c]">{m.domain}</strong></span>
                        <span>Author: <strong className="text-[#17191c]">{m.author}</strong></span>
                        <span>Date: {m.publishedDate}</span>
                        <span className={`font-semibold capitalize px-2 py-0.5 rounded ${m.sentiment === 'positive' ? 'bg-[#10a37f]/10 text-[#10a37f]' : 'bg-[#f2f2f3] text-[#777b86]'}`}>
                          {m.sentiment} Sentiment
                        </span>
                      </div>

                      {/* Outreach Pitch Angle */}
                      <div className="flex items-center gap-2 bg-[#fafafb] border border-[#17191c]/10 px-3 py-1.5 rounded-xl max-w-md">
                        <Mail className="w-3.5 h-3.5 text-[#5d2a1a] flex-shrink-0" />
                        <span className="text-[11px] text-[#5d2a1a] font-medium truncate">{m.pitchAngle}</span>
                        <button
                          onClick={() => handleCopyPitch(m.id, `Hi ${m.author},\n\nI noticed your article "${m.title}" mentions ${brandName}. Thanks for including us!\n\nWould you be open to adding a direct link to https://${domain || 'our website'} so your readers can easily find out more?\n\nBest regards,`)}
                          className="text-[10px] bg-[#ffffff] hover:bg-[#17191c] hover:text-[#ffffff] text-[#17191c] border border-[#17191c]/15 px-2 py-0.5 rounded-md font-semibold flex items-center gap-1 transition-all flex-shrink-0"
                        >
                          {copiedId === m.id ? <Check className="w-3 h-3 text-[#10a37f]" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedId === m.id ? 'Copied' : 'Copy Pitch'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {filteredMentions.length === 0 && (
                  <div className="py-8 text-center text-xs text-[#777b86]">
                    No mentions match the selected filter. Try selecting &quot;All Mentions&quot; or clearing your search.
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-[#ffffff] rounded-2xl p-12 border border-[#17191c]/10 text-center space-y-3">
            <Link2 className="w-10 h-10 text-[#777b86]/40 mx-auto" />
            <p className="text-base font-semibold text-[#17191c]">No brand mention search run yet</p>
            <p className="text-xs text-[#777b86] max-w-md mx-auto">
              Enter your brand name above to discover unlinked web references, active backlinks, and neural intelligence leads across the web.
            </p>
          </div>
        )}
      </main>
    </DashboardLayout>
  );
}
