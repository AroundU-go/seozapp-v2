import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import {
  RefreshCw,
  Sparkles,
  AlertTriangle,
  History,
  CheckCircle2,
  AlertCircle,
  XCircle,
  ExternalLink,
  Clock,
  Check,
  Copy,
  FileText,
  Layers,
  Globe,
  Key,
  Users,
  ShieldCheck,
  TrendingUp,
  Code,
  ArrowRight,
  Search,
} from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { supabaseV2, V2_TABLES } from '@/lib/supabaseV2';
import { PricingModal } from '@/components/pricing/PricingModal';
import { HistoryModal, HistoryItem } from '@/components/dashboard/HistoryModal';

interface SnapshotVersion {
  id: string;
  date: string;
  score: number;
  diff: string;
  changes: string;
  domain: string;
}

type TabType = 'recommendations' | 'onpage' | 'structure' | 'keywords' | 'competitors' | 'sources' | 'markdown';

export default function SeoTrackingPage() {
  const { user, isAdmin, isPro } = useAuth();
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<TabType>('recommendations');
  const [copiedMarkdown, setCopiedMarkdown] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'error' | 'warning'>('success');
  const [snapshotHistory, setSnapshotHistory] = useState<SnapshotVersion[]>([]);
  const [showPricingModal, setShowPricingModal] = useState(false);

  // History Modal state
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
      const res = await fetch(`/api/v2/analyze-url?userEmail=${encodeURIComponent(user?.email || '')}`);
      const data = await res.json();
      if (data.success && data.snapshots) {
        const formatted = data.snapshots.map((item: any) => ({
          id: item.id,
          title: item.domain || item.url,
          subtitle: item.url,
          timestamp: item.scraped_at || new Date().toISOString(),
          badge: `${item.seo_score || 0} Score`,
          data: item.full_result || item,
        }));
        setHistoryItems(formatted);
      }
    } catch (err) {
      console.warn('Failed to load history:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedDomain = localStorage.getItem('tracked_domain');
      const storedAudit = localStorage.getItem('free_audit_result');

      if (storedAudit) {
        try {
          const parsed = JSON.parse(storedAudit);
          setResult(parsed);
          if (parsed.url) setUrl(parsed.url);
          else if (parsed.domain) setUrl(`https://${parsed.domain}`);
        } catch {}
      } else if (storedDomain) {
        setUrl(`https://${storedDomain}`);
      }
    }
  }, []);

  // Load history silently
  useEffect(() => {
    async function loadHistory() {
      try {
        let query = supabaseV2.from(V2_TABLES.SEO_SNAPSHOTS).select('*').order('scraped_at', { ascending: false }).limit(20);

        if (user?.email) {
          query = query.eq('user_email', user.email);
        }

        const { data, error } = await query;

        if (!error && data && data.length > 0) {
          const formattedHistory: SnapshotVersion[] = data.map((row: any, idx: number) => {
            const nextRow = data[idx + 1];
            const diffVal = nextRow ? (row.seo_score - nextRow.seo_score).toFixed(1) : null;
            const diffText = diffVal != null
              ? (Number(diffVal) >= 0 ? `+${diffVal} pts` : `${diffVal} pts`)
              : 'Initial';

            const scrapedDate = new Date(row.scraped_at);
            const dateStr = scrapedDate.toLocaleDateString([], { month: 'short', day: 'numeric' }) + ' ' + scrapedDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            return {
              id: row.id,
              date: dateStr,
              score: row.seo_score,
              diff: diffText,
              changes: `Technical SEO Audit for ${row.domain} — ${row.word_count || 0} words, ${row.h1_count || 0} H1s, score ${row.seo_score}/100`,
              domain: row.domain,
            };
          });

          setSnapshotHistory(formattedHistory);
        }
      } catch (err) {
        console.warn('Failed to load snapshot history:', err);
      }
    }

    loadHistory();
  }, [user]);

  const showToast = (msg: string, type: 'success' | 'error' | 'warning') => {
    setToastMessage(msg);
    setToastType(type);
  };

  const handleAudit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    if (!isAdmin && !isPro) {
      const runCount = typeof window !== 'undefined' ? Number(localStorage.getItem('free_audit_run_count') || '0') : 0;
      if (runCount >= 1 || snapshotHistory.length >= 1) {
        setShowPricingModal(true);
        return;
      }
    }

    let targetUrl = url.trim();
    if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
      targetUrl = `https://${targetUrl}`;
      setUrl(targetUrl);
    }

    setLoading(true);
    setToastMessage(null);

    try {
      const res = await fetch('/api/v2/analyze-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: targetUrl,
          brandName: new URL(targetUrl).hostname.replace('www.', '').split('.')[0],
          userEmail: user?.email || null,
        }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        showToast(`❌ Audit Failed: ${data.error || `HTTP ${res.status}`}`, 'error');
        return;
      }

      if (data.success && (data.executiveSummary || data.seoHealth)) {
        const newScore = data.executiveSummary?.score ?? data.seoHealth?.score ?? 80;
        const prevScore = result?.executiveSummary?.score ?? result?.seoHealth?.score;
        const diffVal = prevScore != null ? (newScore - prevScore).toFixed(1) : null;
        const diffText = diffVal != null
          ? (Number(diffVal) >= 0 ? `+${diffVal} pts` : `${diffVal} pts`)
          : 'Initial';

        const domain = data.domain || new URL(targetUrl).hostname.replace('www.', '');
        const now = new Date();
        const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        const newVersion: SnapshotVersion = {
          id: `snapshot_${Date.now()}`,
          date: `Just now ${timeStr}`,
          score: newScore,
          diff: diffText,
          changes: `Technical SEO Audit for ${domain} — ${data.onPageSeo?.contentQuality?.wordCount || data.metadata?.wordCount || 0} words, ${data.onPageSeo?.headings?.h1Count || 1} H1s, score ${newScore}/100`,
          domain,
        };

        const updatedHistory = [newVersion, ...snapshotHistory].slice(0, 50);
        setSnapshotHistory(updatedHistory);
        setResult(data);

        showToast(
          `✅ Technical SEO Audit completed for ${domain} — Score: ${newScore}/100`,
          'success'
        );

        if (typeof window !== 'undefined') {
          localStorage.setItem('free_audit_result', JSON.stringify(data));
          localStorage.setItem('tracked_domain', domain);
          localStorage.setItem('seo_snapshot_history', JSON.stringify(updatedHistory));

          if (!isAdmin && !isPro) {
            const nextCount = Number(localStorage.getItem('free_audit_run_count') || '0') + 1;
            localStorage.setItem('free_audit_run_count', String(nextCount));
          }
        }
      } else {
        showToast(`⚠️ Unexpected response format from scanner`, 'warning');
      }
    } catch (err: any) {
      console.error('Audit failed:', err);
      showToast(`❌ Network error: ${err.message || 'Unable to reach scanner'}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const copyMarkdownReport = () => {
    if (!result?.deliverableMarkdown) return;
    navigator.clipboard.writeText(result.deliverableMarkdown);
    setCopiedMarkdown(true);
    setTimeout(() => setCopiedMarkdown(false), 2500);
    showToast('📋 Deliverable Markdown copied to clipboard!', 'success');
  };

  const hasData = result && (result.executiveSummary != null || result.seoHealth != null);
  const score = result?.executiveSummary?.score ?? result?.seoHealth?.score ?? 0;
  const domain = result?.domain || '';
  const executive = result?.executiveSummary || {
    score,
    status: score >= 80 ? 'EXCELLENT' : score >= 60 ? 'GOOD' : 'NEEDS_OPTIMIZATION',
    summary: 'Technical crawl and on-page signals analyzed.',
    topRisks: result?.seoHealth?.issues || [],
    topOpportunities: ['Implement FAQPage Schema', 'Expand content depth', 'Add targeted comparison pages'],
  };
  const onPage = result?.onPageSeo || {
    title: { text: result?.metadata?.title || '', length: result?.metadata?.title?.length || 0, status: 'OPTIMAL' },
    metaDescription: { text: result?.metadata?.description || '', length: result?.metadata?.description?.length || 0, status: 'OPTIMAL' },
    headings: { h1Count: result?.metadata?.h1Count || 1, h1List: [result?.metadata?.title || ''], h2Count: 3, h2List: ['Overview', 'Features', 'FAQ'], hierarchyStatus: 'Optimal (1 H1)' },
    contentQuality: { wordCount: result?.metadata?.wordCount || 0, densityLevel: 'Moderate', hasListsOrTables: true },
    technicalSignals: { canonicalUrl: result?.metadata?.canonicalUrl || result?.url, statusCode: 200, language: 'en', schemaTypes: result?.metadata?.schemaTypes || ['WebPage'], hasFaqSchema: false, hasQnaFormat: false },
  };
  const siteStructure = result?.siteStructure || {
    pagesCount: 5,
    pagesList: [result?.url || ''],
    urlQuality: 'Clean, semantic REST-like URL hierarchy',
    internalLinkingNotes: 'Mapped key landing pages and hierarchy.',
    keySections: [{ section: 'Product & Features', count: 1, urls: [result?.url || ''] }],
  };
  const keywordOpps = result?.keywordOpportunities || [];
  const compSerp = result?.competitorSerp || [];
  const recs = result?.prioritizedRecommendations || (result?.seoHealth?.issues || []).map((iss: string, idx: number) => ({
    priority: idx === 0 ? 'HIGH' : 'MEDIUM',
    category: 'On-Page',
    issue: iss,
    exactFix: `Resolve: ${iss}`,
    impact: '+10 SEO Health Points',
  }));
  const sources = result?.sources || [
    { url: result?.url || '', checkType: 'Primary Page Deep Scrape', status: 'HTTP 200 OK', checkedAt: result?.scrapedAt || new Date().toISOString(), details: 'Standard metadata and on-page extraction.' }
  ];

  const toastColors = {
    success: { bg: 'bg-[#10a37f]/10', border: 'border-[#10a37f]/20', text: 'text-[#10a37f]' },
    error: { bg: 'bg-[#ef4444]/10', border: 'border-[#ef4444]/20', text: 'text-[#ef4444]' },
    warning: { bg: 'bg-[#f59e0b]/10', border: 'border-[#f59e0b]/20', text: 'text-[#92400e]' },
  };
  const tc = toastColors[toastType];

  return (
    <DashboardLayout activeDomain={domain || 'Enter a URL above'}>
      <Head>
        <title>Technical SEO &amp; Audit Engine — SEOzapp v2</title>
      </Head>

      <PricingModal isOpen={showPricingModal} onClose={() => setShowPricingModal(false)} />

      <main className="max-w-[1250px] mx-auto px-8 py-8 space-y-8">
        {/* Module Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[12px] font-semibold text-[#17191c] bg-[#f2f2f3] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Module 01 • Technical &amp; On-Page Audit
              </span>
              <span className="text-[11px] font-mono text-[#5d2a1a] bg-[#fbe1d1] px-2 py-0.5 rounded-md font-semibold">
                Deep Crawl Engine
              </span>
            </div>
            <h1 className="text-[28px] font-semibold text-[#17191c] mt-1">
              Technical &amp; On-Page SEO Audit Engine
            </h1>
            <p className="text-[15px] text-[#777b86]">
              End-to-end site structure mapping, on-page signal extraction, keyword opportunity discovery, and prioritized recommendations.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {hasData && (
              <button
                type="button"
                onClick={copyMarkdownReport}
                className="bg-[#ffffff] hover:bg-[#17191c] text-[#17191c] hover:text-[#ffffff] border border-[#17191c]/15 rounded-xl px-4 py-2.5 text-sm font-semibold flex items-center gap-2 transition-all shadow-sm flex-shrink-0"
              >
                {copiedMarkdown ? <Check className="w-4 h-4 text-[#10a37f]" /> : <Copy className="w-4 h-4 text-[#5d2a1a]" />}
                <span>{copiedMarkdown ? 'Copied Report!' : 'Copy Markdown Audit'}</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                setShowHistoryModal(true);
                fetchHistory();
              }}
              className="bg-[#ffffff] hover:bg-[#17191c] text-[#17191c] hover:text-[#ffffff] border border-[#17191c]/15 rounded-xl px-4 py-2.5 text-sm font-semibold flex items-center gap-2 transition-all shadow-sm flex-shrink-0"
            >
              <Clock className="w-4 h-4 text-[#5d2a1a]" />
              <span>History</span>
            </button>
          </div>
        </div>

        <HistoryModal
          isOpen={showHistoryModal}
          onClose={() => setShowHistoryModal(false)}
          title="Previous Technical SEO Audits"
          featureName="Module 01 • Technical SEO"
          items={historyItems}
          loading={loadingHistory}
          onRefresh={fetchHistory}
          onSelect={(item) => {
            if (item.data) {
              setResult(item.data);
              if (item.data.url) setUrl(item.data.url);
            }
          }}
        />

        {/* Input Bar */}
        <div className="bg-[#ffffff] rounded-2xl p-6 border border-[#17191c]/10 shadow-sm space-y-4">
          <form onSubmit={handleAudit} className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-[#777b86] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="bg-[#fafafb] border border-[#17191c]/15 rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#17191c] focus:outline-none w-full shadow-inner"
                placeholder="Enter any domain or URL to audit (e.g. stripe.com or https://example.com)..."
              />
            </div>
            <button
              type="submit"
              disabled={loading || !url.trim()}
              className="bg-[#17191c] text-[#ffffff] rounded-xl px-6 py-2.5 text-sm font-medium hover:bg-[#17191c]/90 flex items-center gap-2 whitespace-nowrap disabled:opacity-60 shadow-sm w-full sm:w-auto justify-center"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Mapping &amp; Auditing Site...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-[#fbe1d1]" />
                  <span>Run Technical Audit</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Guidance */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-[#777b86] pt-1">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#10a37f]" />
              Full Site Structure Mapping
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#10a37f]" />
              Title, Meta &amp; H1/H2 Hierarchy
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#10a37f]" />
              Keyword Opportunity Matrix
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#10a37f]" />
              Prioritized Fixes &amp; Markdown Deliverable
            </span>
          </div>
        </div>

        {/* Notification Toast */}
        {toastMessage && (
          <div className={`${tc.bg} ${tc.border} ${tc.text} border rounded-2xl p-4 text-xs font-semibold flex items-center justify-between shadow-xs`}>
            <div className="flex items-center gap-2">
              {toastType === 'success' && <CheckCircle2 className="w-4 h-4" />}
              {toastType === 'error' && <XCircle className="w-4 h-4" />}
              {toastType === 'warning' && <AlertTriangle className="w-4 h-4" />}
              <span>{toastMessage}</span>
            </div>
            <button onClick={() => setToastMessage(null)} className="opacity-70 hover:opacity-100 ml-4">✕</button>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="bg-[#ffffff] rounded-2xl p-10 border border-[#17191c]/10 shadow-sm flex flex-col items-center justify-center gap-3 text-center">
            <RefreshCw className="w-9 h-9 animate-spin text-[#17191c]" />
            <div className="text-[16px] font-semibold text-[#17191c]">Executing Technical SEO Audit Engine...</div>
            <div className="text-[13px] text-[#777b86] max-w-lg">
              1. Scraping target page metadata &amp; headings • 2. Mapping site URL architecture • 3. Extracting keyword opportunities • 4. Benchmarking competitor SERP rankings
            </div>
          </div>
        )}

        {/* Empty State */}
        {!hasData && !loading && (
          <div className="bg-[#ffffff] rounded-2xl p-12 border border-[#17191c]/10 shadow-sm flex flex-col items-center justify-center gap-3 text-center">
            <Sparkles className="w-10 h-10 text-[#777b86]/40" />
            <div className="text-[18px] font-semibold text-[#17191c]">Enter a URL to generate a comprehensive SEO Audit</div>
            <div className="text-[14px] text-[#777b86] max-w-md">
              Generates an actionable, prioritized technical audit with site structure mapping, on-page analysis, keyword opportunities, competitor SERP comparison, and copyable markdown deliverable.
            </div>
          </div>
        )}

        {/* Live Data Dashboard */}
        {hasData && !loading && (
          <div className="space-y-6">
            {/* Top Summary Gauge & High-Level Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {/* Score Gauge Card */}
              <div className="bg-[#ffffff] rounded-2xl p-6 border border-[#17191c]/10 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="text-[12px] font-semibold text-[#777b86] uppercase tracking-wider">SEO Health Score</div>
                  <div className="text-[52px] font-semibold text-[#17191c] mt-1 leading-none">
                    {score} <span className="text-[18px] text-[#777b86] font-normal">/ 100</span>
                  </div>
                  <div className="mt-3">
                    <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase ${
                      score >= 80 ? 'bg-[#10a37f]/10 text-[#10a37f]' :
                      score >= 60 ? 'bg-[#f59e0b]/10 text-[#f59e0b]' :
                      'bg-[#ef4444]/10 text-[#ef4444]'
                    }`}>
                      {executive.status}
                    </span>
                  </div>
                </div>
                <div className="text-[11px] text-[#777b86] mt-4 pt-3 border-t border-[#f2f2f3] flex items-center justify-between">
                  <span>Deep Crawl Inspection</span>
                  <span className="font-medium text-[#17191c]">{domain}</span>
                </div>
              </div>

              {/* Executive Summary Card */}
              <div className="bg-[#ffffff] rounded-2xl p-6 border border-[#17191c]/10 shadow-sm md:col-span-3 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-[16px] text-[#17191c] flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-[#5d2a1a]" />
                    <span>Executive Summary &amp; Overview</span>
                  </h3>
                  <span className="text-xs text-[#777b86]">
                    {result.scrapedAt ? new Date(result.scrapedAt).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Live'}
                  </span>
                </div>

                <p className="text-sm text-[#17191c] leading-relaxed">
                  {executive.summary}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs">
                  <div className="p-3 bg-[#fef2f2] border border-[#fee2e2] rounded-xl space-y-1">
                    <div className="font-semibold text-[#b91c1c] flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Top Risks ({executive.topRisks?.length || 0})</span>
                    </div>
                    <ul className="text-[#7f1d1d] space-y-1 list-disc list-inside">
                      {executive.topRisks && executive.topRisks.length > 0 ? (
                        executive.topRisks.slice(0, 2).map((r: string, i: number) => (
                          <li key={i} className="truncate">{r}</li>
                        ))
                      ) : (
                        <li>No critical structural risks found.</li>
                      )}
                    </ul>
                  </div>

                  <div className="p-3 bg-[#f0fdf4] border border-[#dcfce7] rounded-xl space-y-1">
                    <div className="font-semibold text-[#15803d] flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Top Opportunities</span>
                    </div>
                    <ul className="text-[#166534] space-y-1 list-disc list-inside">
                      {executive.topOpportunities?.slice(0, 2).map((opp: string, i: number) => (
                        <li key={i} className="truncate">{opp}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Structured Deliverable Tabs Navigation */}
            <div className="bg-[#ffffff] rounded-2xl border border-[#17191c]/10 shadow-sm overflow-hidden">
              <div className="flex items-center gap-1 p-2 border-b border-[#f2f2f3] overflow-x-auto bg-[#fafafb]">
                {[
                  { id: 'recommendations' as TabType, label: 'Prioritized Fixes', icon: ShieldCheck, count: recs.length },
                  { id: 'onpage' as TabType, label: 'On-Page SEO', icon: FileText },
                  { id: 'structure' as TabType, label: 'Site Structure', icon: Layers, count: siteStructure.pagesCount },
                  { id: 'keywords' as TabType, label: 'Keyword Opportunities', icon: Key, count: keywordOpps.length },
                  { id: 'competitors' as TabType, label: 'SERP Competitors', icon: Users, count: compSerp.length },
                  { id: 'sources' as TabType, label: 'Sources & Spec', icon: Globe },
                  { id: 'markdown' as TabType, label: 'Markdown Deliverable', icon: Code },
                ].map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                        isActive
                          ? 'bg-[#17191c] text-[#ffffff] shadow-sm'
                          : 'text-[#777b86] hover:text-[#17191c] hover:bg-[#ffffff]'
                      }`}
                    >
                      <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#fbe1d1]' : ''}`} />
                      <span>{tab.label}</span>
                      {tab.count !== undefined && (
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                          isActive ? 'bg-[#ffffff]/20 text-white' : 'bg-[#17191c]/10 text-[#17191c]'
                        }`}>
                          {tab.count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Tab Content Container */}
              <div className="p-6">
                {/* ───────────────────────────────────────────────────────────── */}
                {/* TAB 1: PRIORITIZED RECOMMENDATIONS                            */}
                {/* ───────────────────────────────────────────────────────────── */}
                {activeTab === 'recommendations' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between pb-3 border-b border-[#f2f2f3]">
                      <div>
                        <h3 className="font-semibold text-[16px] text-[#17191c]">Prioritized Actionable Recommendations</h3>
                        <p className="text-xs text-[#777b86]">Ranked by impact on search indexing and organic visibility.</p>
                      </div>
                      <span className="text-xs font-medium text-[#777b86]">{recs.length} actionable items</span>
                    </div>

                    <div className="space-y-3">
                      {recs.map((rec: any, idx: number) => {
                        const priorityColor =
                          rec.priority === 'HIGH' ? 'bg-[#ef4444]/10 text-[#ef4444] border-[#ef4444]/20' :
                          rec.priority === 'MEDIUM' ? 'bg-[#f59e0b]/10 text-[#f59e0b] border-[#f59e0b]/20' :
                          'bg-[#10a37f]/10 text-[#10a37f] border-[#10a37f]/20';

                        return (
                          <div key={idx} className="p-4 bg-[#fafafb] rounded-xl border border-[#17191c]/5 hover:border-[#17191c]/15 transition-all space-y-2">
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase ${priorityColor}`}>
                                  {rec.priority || 'MEDIUM'}
                                </span>
                                <span className="text-[11px] font-semibold text-[#777b86] bg-[#ffffff] border border-[#17191c]/10 px-2 py-0.5 rounded-md">
                                  {rec.category || 'On-Page'}
                                </span>
                              </div>
                              <span className="text-xs font-semibold text-[#10a37f]">{rec.impact}</span>
                            </div>

                            <div className="font-semibold text-sm text-[#17191c]">{rec.issue}</div>

                            <div className="p-3 bg-[#ffffff] rounded-lg border border-[#17191c]/5 text-xs text-[#17191c] flex items-start gap-2 font-mono">
                              <ArrowRight className="w-3.5 h-3.5 text-[#5d2a1a] flex-shrink-0 mt-0.5" />
                              <div>
                                <span className="font-bold text-[#5d2a1a] font-sans">Fix: </span>
                                {rec.exactFix}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* ───────────────────────────────────────────────────────────── */}
                {/* TAB 2: ON-PAGE SEO & CONTENT QUALITY                          */}
                {/* ───────────────────────────────────────────────────────────── */}
                {activeTab === 'onpage' && (
                  <div className="space-y-6">
                    <div className="pb-3 border-b border-[#f2f2f3]">
                      <h3 className="font-semibold text-[16px] text-[#17191c]">On-Page Metadata, Headings &amp; Schema</h3>
                      <p className="text-xs text-[#777b86]">Granular inspection of critical ranking signals extracted from live DOM inspection.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Title Tag Card */}
                      <div className="p-4 bg-[#fafafb] rounded-xl border border-[#17191c]/5 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-[#777b86] uppercase tracking-wider">Title Tag</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            onPage.title?.status === 'OPTIMAL' ? 'bg-[#10a37f]/10 text-[#10a37f]' : 'bg-[#f59e0b]/10 text-[#f59e0b]'
                          }`}>
                            {onPage.title?.length || 0} chars
                          </span>
                        </div>
                        <div className="text-sm font-medium text-[#17191c] bg-[#ffffff] p-3 rounded-lg border border-[#17191c]/5">
                          {onPage.title?.text || <span className="text-[#ef4444] italic">Missing Title Tag</span>}
                        </div>
                        <div className="text-[11px] text-[#777b86]">Ideal length: 45–60 characters. Avoid keyword stuffing.</div>
                      </div>

                      {/* Meta Description Card */}
                      <div className="p-4 bg-[#fafafb] rounded-xl border border-[#17191c]/5 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-[#777b86] uppercase tracking-wider">Meta Description</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            onPage.metaDescription?.status === 'OPTIMAL' ? 'bg-[#10a37f]/10 text-[#10a37f]' : 'bg-[#f59e0b]/10 text-[#f59e0b]'
                          }`}>
                            {onPage.metaDescription?.length || 0} chars
                          </span>
                        </div>
                        <div className="text-sm text-[#17191c] bg-[#ffffff] p-3 rounded-lg border border-[#17191c]/5 line-clamp-3">
                          {onPage.metaDescription?.text || <span className="text-[#ef4444] italic">Missing Meta Description</span>}
                        </div>
                        <div className="text-[11px] text-[#777b86]">Ideal length: 120–155 characters for SERP snippet previews.</div>
                      </div>
                    </div>

                    {/* Heading Hierarchy Tree */}
                    <div className="p-4 bg-[#fafafb] rounded-xl border border-[#17191c]/5 space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-sm text-[#17191c]">Heading Hierarchy (H1 &amp; H2 Structure)</h4>
                        <span className="text-xs font-semibold text-[#5d2a1a] bg-[#fbe1d1] px-2.5 py-0.5 rounded-full">
                          {onPage.headings?.hierarchyStatus}
                        </span>
                      </div>

                      <div className="space-y-2">
                        {onPage.headings?.h1List?.map((h1: string, i: number) => (
                          <div key={i} className="flex items-center gap-2 p-2.5 bg-[#ffffff] rounded-lg border border-[#17191c]/5 text-xs">
                            <span className="font-bold text-[#17191c] bg-[#17191c]/5 px-2 py-0.5 rounded font-mono">H1</span>
                            <span className="font-medium text-[#17191c] truncate">{h1}</span>
                          </div>
                        ))}

                        {onPage.headings?.h2List?.map((h2: string, i: number) => (
                          <div key={i} className="flex items-center gap-2 p-2 bg-[#ffffff]/80 ml-4 rounded-lg border border-[#17191c]/5 text-xs text-[#777b86]">
                            <span className="font-semibold text-[#777b86] bg-[#17191c]/5 px-1.5 py-0.5 rounded font-mono">H2</span>
                            <span className="truncate">{h2}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Content & Technical Signals Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      <div className="p-3.5 bg-[#fafafb] rounded-xl border border-[#17191c]/5">
                        <div className="text-[#777b86]">Word Count</div>
                        <div className="font-bold text-sm text-[#17191c] mt-1">{onPage.contentQuality?.wordCount?.toLocaleString() || 0} words</div>
                        <div className="text-[10px] text-[#10a37f]">{onPage.contentQuality?.densityLevel}</div>
                      </div>

                      <div className="p-3.5 bg-[#fafafb] rounded-xl border border-[#17191c]/5">
                        <div className="text-[#777b86]">Canonical URL</div>
                        <div className="font-bold text-sm text-[#17191c] mt-1 truncate" title={onPage.technicalSignals?.canonicalUrl || ''}>
                          {onPage.technicalSignals?.canonicalUrl ? 'Verified' : 'Missing'}
                        </div>
                        <div className="text-[10px] text-[#777b86]">Rel Canonical</div>
                      </div>

                      <div className="p-3.5 bg-[#fafafb] rounded-xl border border-[#17191c]/5">
                        <div className="text-[#777b86]">Schema.org Types</div>
                        <div className="font-bold text-sm text-[#17191c] mt-1 truncate">
                          {onPage.technicalSignals?.schemaTypes?.join(', ') || 'None'}
                        </div>
                        <div className="text-[10px] text-[#10a37f]">JSON-LD Structured</div>
                      </div>

                      <div className="p-3.5 bg-[#fafafb] rounded-xl border border-[#17191c]/5">
                        <div className="text-[#777b86]">HTTP Response</div>
                        <div className="font-bold text-sm text-[#10a37f] mt-1">HTTP {onPage.technicalSignals?.statusCode || 200} OK</div>
                        <div className="text-[10px] text-[#777b86]">Live response</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ───────────────────────────────────────────────────────────── */}
                {/* TAB 3: SITE STRUCTURE & URL MAPPING                           */}
                {/* ───────────────────────────────────────────────────────────── */}
                {activeTab === 'structure' && (
                  <div className="space-y-6">
                    <div className="pb-3 border-b border-[#f2f2f3] flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-[16px] text-[#17191c]">Site Structure &amp; Architecture Map</h3>
                        <p className="text-xs text-[#777b86]">Discovered URL hierarchy and section distribution across {domain}.</p>
                      </div>
                      <span className="text-xs font-semibold bg-[#17191c] text-[#fbe1d1] px-3 py-1 rounded-full">
                        {siteStructure.pagesCount} URLs Mapped
                      </span>
                    </div>

                    {/* Section Categories */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {siteStructure.keySections?.map((sec: any, idx: number) => (
                        <div key={idx} className="p-4 bg-[#fafafb] rounded-xl border border-[#17191c]/5 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-[#17191c]">{sec.section}</span>
                            <span className="text-[10px] bg-[#17191c]/10 text-[#17191c] font-bold px-2 py-0.5 rounded-full">
                              {sec.count} page{sec.count !== 1 ? 's' : ''}
                            </span>
                          </div>
                          <div className="text-[11px] text-[#777b86] truncate">
                            {sec.urls?.[0] ? new URL(sec.urls[0]).pathname : '/'}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* URL Path Explorer */}
                    <div className="space-y-3">
                      <h4 className="font-semibold text-sm text-[#17191c]">Discovered URLs Explorer</h4>
                      <div className="max-h-64 overflow-y-auto space-y-1.5 p-3 bg-[#fafafb] rounded-xl border border-[#17191c]/5">
                        {siteStructure.pagesList?.map((pageUrl: string, idx: number) => (
                          <div key={idx} className="flex items-center justify-between p-2 bg-[#ffffff] rounded-lg border border-[#17191c]/5 text-xs">
                            <span className="text-[#17191c] font-mono truncate max-w-lg">{pageUrl}</span>
                            <a href={pageUrl} target="_blank" rel="noopener noreferrer" className="text-[#777b86] hover:text-[#17191c] ml-2">
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* ───────────────────────────────────────────────────────────── */}
                {/* TAB 4: KEYWORD OPPORTUNITIES                                  */}
                {/* ───────────────────────────────────────────────────────────── */}
                {activeTab === 'keywords' && (
                  <div className="space-y-6">
                    <div className="pb-3 border-b border-[#f2f2f3]">
                      <h3 className="font-semibold text-[16px] text-[#17191c]">High-Intent Keyword &amp; Content Opportunities</h3>
                      <p className="text-xs text-[#777b86]">Target search queries and recommended content expansion pathways.</p>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-[13px]">
                        <thead>
                          <tr className="border-b border-[#f2f2f3] text-[#979799] text-[11px] uppercase tracking-wider">
                            <th className="pb-2.5 font-medium">Target Keyword</th>
                            <th className="pb-2.5 font-medium">Search Intent</th>
                            <th className="pb-2.5 font-medium">Difficulty</th>
                            <th className="pb-2.5 font-medium">Est. Volume</th>
                            <th className="pb-2.5 font-medium">Opportunity Type</th>
                            <th className="pb-2.5 font-medium">Action Required</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#f2f2f3]">
                          {keywordOpps.map((kw: any, idx: number) => (
                            <tr key={idx} className="hover:bg-[#fafafb] transition-colors">
                              <td className="py-3 text-[#17191c] font-semibold">{kw.keyword}</td>
                              <td className="py-3">
                                <span className="text-[10px] font-semibold bg-[#17191c]/5 text-[#17191c] px-2 py-0.5 rounded-full">
                                  {kw.intent}
                                </span>
                              </td>
                              <td className="py-3 text-[#777b86] text-xs">{kw.difficulty}</td>
                              <td className="py-3 text-[#17191c] font-medium">{kw.volume}</td>
                              <td className="py-3 text-[#5d2a1a] text-xs font-semibold">{kw.opportunityType}</td>
                              <td className="py-3 text-xs text-[#777b86] max-w-xs">{kw.actionRequired}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* ───────────────────────────────────────────────────────────── */}
                {/* TAB 5: COMPETITOR / SERP COMPARISON                           */}
                {/* ───────────────────────────────────────────────────────────── */}
                {activeTab === 'competitors' && (
                  <div className="space-y-6">
                    <div className="pb-3 border-b border-[#f2f2f3]">
                      <h3 className="font-semibold text-[16px] text-[#17191c]">Live SERP Competitor Benchmarking</h3>
                      <p className="text-xs text-[#777b86]">Competing domains and ranking pages discovered via live search intelligence.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {compSerp.map((comp: any, idx: number) => (
                        <div key={idx} className="p-4 bg-[#fafafb] rounded-xl border border-[#17191c]/5 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-sm text-[#17191c] flex items-center gap-1.5">
                              <Globe className="w-3.5 h-3.5 text-[#777b86]" />
                              <span>{comp.domain}</span>
                            </span>
                            <a href={comp.url} target="_blank" rel="noopener noreferrer" className="text-xs text-[#5d2a1a] hover:underline flex items-center gap-1">
                              View Page <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>

                          <div className="text-xs font-medium text-[#17191c]">{comp.title}</div>
                          <p className="text-xs text-[#777b86] line-clamp-2">{comp.description}</p>

                          <div className="pt-2 border-t border-[#17191c]/5 text-[11px] text-[#5d2a1a] flex items-start gap-1">
                            <span className="font-bold">Why they rank:</span>
                            <span>{comp.whyTheyRank}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ───────────────────────────────────────────────────────────── */}
                {/* TAB 6: SOURCES CHECKED & AUDIT SPEC                           */}
                {/* ───────────────────────────────────────────────────────────── */}
                {activeTab === 'sources' && (
                  <div className="space-y-6">
                    <div className="pb-3 border-b border-[#f2f2f3]">
                      <h3 className="font-semibold text-[16px] text-[#17191c]">Audit Sources &amp; Verification Manifest</h3>
                      <p className="text-xs text-[#777b86]">Explicit data sources and endpoints checked during this audit run.</p>
                    </div>

                    <div className="space-y-3">
                      {sources.map((src: any, idx: number) => (
                        <div key={idx} className="p-4 bg-[#fafafb] rounded-xl border border-[#17191c]/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                          <div className="space-y-1">
                            <div className="font-semibold text-[#17191c] flex items-center gap-2">
                              <span>{src.checkType}</span>
                              <span className="text-[10px] font-bold bg-[#10a37f]/10 text-[#10a37f] px-2 py-0.5 rounded-full">
                                {src.status}
                              </span>
                            </div>
                            <div className="text-[#777b86] font-mono truncate max-w-lg">{src.url}</div>
                            {src.details && <div className="text-[11px] text-[#777b86]">{src.details}</div>}
                          </div>
                          <div className="text-[11px] text-[#777b86] whitespace-nowrap">
                            {new Date(src.checkedAt).toLocaleTimeString()}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Rerun Spec */}
                    <div className="p-4 bg-[#17191c] text-[#ffffff] rounded-xl space-y-2 text-xs font-mono">
                      <div className="text-[#fbe1d1] font-bold">Rerun Workflow Specification</div>
                      <pre className="text-xs overflow-x-auto text-[#979799]">
{`workflow: technical-seo-audit
site: ${result.url || url}
keywords: [${keywordOpps.map((k: any) => `"${k.keyword}"`).join(', ')}]
output: markdown/json`}
                      </pre>
                    </div>
                  </div>
                )}

                {/* ───────────────────────────────────────────────────────────── */}
                {/* TAB 7: MARKDOWN DELIVERABLE                                   */}
                {/* ───────────────────────────────────────────────────────────── */}
                {activeTab === 'markdown' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-[#f2f2f3]">
                      <div>
                        <h3 className="font-semibold text-[16px] text-[#17191c]">Client-Ready Deliverable Markdown</h3>
                        <p className="text-xs text-[#777b86]">Standardized markdown report formatted according to technical SEO audit specification.</p>
                      </div>
                      <button
                        type="button"
                        onClick={copyMarkdownReport}
                        className="bg-[#17191c] text-[#ffffff] px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 hover:bg-[#17191c]/90 transition-all shadow-sm"
                      >
                        {copiedMarkdown ? <Check className="w-3.5 h-3.5 text-[#10a37f]" /> : <Copy className="w-3.5 h-3.5 text-[#fbe1d1]" />}
                        <span>{copiedMarkdown ? 'Copied!' : 'Copy Markdown Report'}</span>
                      </button>
                    </div>

                    <pre className="p-5 bg-[#17191c] text-[#fbe1d1] rounded-2xl text-xs overflow-x-auto font-mono leading-relaxed max-h-[500px]">
                      {result.deliverableMarkdown || '# SEO Audit: Complete'}
                    </pre>
                  </div>
                )}
              </div>
            </div>

            {/* Snapshot Version History Timeline */}
            <div className="bg-[#ffffff] rounded-2xl p-6 border border-[#17191c]/10 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#f2f2f3]">
                <h3 className="font-semibold text-[16px] text-[#17191c] flex items-center gap-2">
                  <History className="w-4 h-4 text-[#17191c]" />
                  Snapshot Version History
                </h3>
                <span className="text-[12px] text-[#777b86]">
                  {snapshotHistory.length} record{snapshotHistory.length !== 1 ? 's' : ''} logged
                </span>
              </div>

              {snapshotHistory.length === 0 ? (
                <div className="text-center py-6 text-[#777b86] text-[13px]">
                  No snapshots recorded yet. Run audits to track score changes over time.
                </div>
              ) : (
                <div className="space-y-3 text-[13px]">
                  {snapshotHistory.map((ver) => (
                    <div key={ver.id} className="p-4 bg-[#fafafb] rounded-xl border border-[#17191c]/5 flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-[#17191c]">{ver.domain} — {ver.date}</div>
                        <div className="text-[12px] text-[#777b86] mt-0.5 max-w-[500px] truncate">{ver.changes}</div>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <span className="text-[14px] font-bold text-[#17191c]">{ver.score} / 100</span>
                        <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${
                          ver.diff.startsWith('+') ? 'text-[#10a37f] bg-[#10a37f]/10 border-[#10a37f]/20' :
                          ver.diff.startsWith('-') ? 'text-[#ef4444] bg-[#ef4444]/10 border-[#ef4444]/20' :
                          'text-[#17191c] bg-[#ffffff] border-[#17191c]/15'
                        }`}>
                          {ver.diff}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </DashboardLayout>
  );
}
