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
} from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { supabaseV2, V2_TABLES } from '@/lib/supabaseV2';
import { PricingModal } from '@/components/pricing/PricingModal';

interface SnapshotVersion {
  id: string;
  date: string;
  score: number;
  diff: string;
  changes: string;
  domain: string;
}

import { HistoryModal, HistoryItem } from '@/components/dashboard/HistoryModal';

export default function SeoTrackingPage() {
  const { user, isAdmin, isPro } = useAuth();
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'error' | 'warning'>('success');
  const [snapshotHistory, setSnapshotHistory] = useState<SnapshotVersion[]>([]);
  const [showPricingModal, setShowPricingModal] = useState(false);

  // Supabase History Modal state
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

  // Load history silently (without displaying "Supabase" text)
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
              changes: `Scraped ${row.domain} — ${row.word_count || 0} words, ${row.h1_count || 0} H1, title ${row.title?.length || 0} chars`,
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

    // PAYWALL ENFORCEMENT FOR FREE USERS:
    // If not admin and not pro, allow only 1 audit total.
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
        showToast(`❌ Scan Failed: ${data.error || `HTTP ${res.status}`}`, 'error');
        return;
      }

      if (data.success && data.seoHealth) {
        const newScore = data.seoHealth.score;
        const prevScore = result?.seoHealth?.score;
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
          changes: `Live technical snapshot for ${domain} — ${data.metadata?.wordCount || 0} words, ${data.metadata?.h1Count || 0} H1, title ${data.metadata?.title?.length || 0} chars`,
          domain,
        };

        const updatedHistory = [newVersion, ...snapshotHistory].slice(0, 50);
        setSnapshotHistory(updatedHistory);

        setResult(data);
        showToast(
          `✅ Technical SEO snapshot completed for ${domain} — Score: ${newScore}/100`,
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
      console.error('Snapshot failed:', err);
      showToast(`❌ Network error: ${err.message || 'Unable to reach scanner'}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const hasData = result?.seoHealth != null;
  const seoHealth = result?.seoHealth;
  const metadata = result?.metadata;
  const domain = result?.domain || '';

  const toastColors = {
    success: { bg: 'bg-[#10a37f]/10', border: 'border-[#10a37f]/20', text: 'text-[#10a37f]' },
    error: { bg: 'bg-[#ef4444]/10', border: 'border-[#ef4444]/20', text: 'text-[#ef4444]' },
    warning: { bg: 'bg-[#f59e0b]/10', border: 'border-[#f59e0b]/20', text: 'text-[#92400e]' },
  };
  const tc = toastColors[toastType];

  return (
    <DashboardLayout activeDomain={domain || 'Enter a URL above'}>
      <Head>
        <title>Technical SEO Snapshot Engine — SEOzapp v2</title>
      </Head>

      <PricingModal isOpen={showPricingModal} onClose={() => setShowPricingModal(false)} />

      <main className="max-w-[1250px] mx-auto px-8 py-8 space-y-8">
        {/* Module Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-[12px] font-semibold text-[#17191c] bg-[#f2f2f3] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              Module 01 • Technical SEO
            </span>
            <h1 className="text-[28px] font-semibold text-[#17191c] mt-1">
              Technical &amp; On-Page SEO Snapshot Engine
            </h1>
            <p className="text-[15px] text-[#777b86]">
              Continuous technical SEO monitoring with rule-based scoring and score diff history.
            </p>
          </div>

          <form onSubmit={handleAudit} className="flex items-center gap-2">
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="bg-[#ffffff] border border-[#17191c]/15 rounded-xl px-4 py-2.5 text-sm text-[#17191c] focus:outline-none w-72 shadow-sm"
              placeholder="Enter any URL (e.g. stripe.com)..."
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-[#17191c] text-[#ffffff] rounded-xl px-5 py-2.5 text-sm font-medium hover:bg-[#17191c]/90 flex items-center gap-2 whitespace-nowrap disabled:opacity-60"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Scanning...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-[#fbe1d1]" />
                  <span>Run Technical Audit</span>
                </>
              )}
            </button>

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
          </form>
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

        {/* Clean Notification Toast (No technical Supabase mentions) */}
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
          <div className="bg-[#ffffff] rounded-2xl p-8 border border-[#17191c]/10 shadow-sm flex flex-col items-center justify-center gap-3">
            <RefreshCw className="w-8 h-8 animate-spin text-[#17191c]" />
            <div className="text-[15px] font-medium text-[#17191c]">Scanning URL &amp; calculating technical SEO health score...</div>
            <div className="text-[12px] text-[#777b86]">Extracting title, meta descriptions, headings, word count, schema markup, and structural signals</div>
          </div>
        )}

        {/* Empty / No Data State */}
        {!hasData && !loading && (
          <div className="bg-[#ffffff] rounded-2xl p-10 border border-[#17191c]/10 shadow-sm flex flex-col items-center justify-center gap-3 text-center">
            <Sparkles className="w-10 h-10 text-[#777b86]" />
            <div className="text-[18px] font-semibold text-[#17191c]">Enter a URL and click &quot;Run Snapshot&quot;</div>
            <div className="text-[14px] text-[#777b86] max-w-md">
              Run technical SEO snapshot audits to track your SEO health score, metadata factors, schema markup, and version history.
            </div>
          </div>
        )}

        {/* Live Data Panels */}
        {hasData && !loading && (
          <>
            {/* Top Summary Gauge & Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-[#ffffff] rounded-2xl p-6 border border-[#17191c]/10 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="text-[13px] text-[#777b86]">Technical SEO Health Score</div>
                  <div className="text-[52px] font-semibold text-[#17191c] mt-2">
                    {seoHealth.score} <span className="text-[18px] text-[#777b86] font-normal">/ 100</span>
                  </div>
                  <div className="flex items-center gap-2 mt-3">
                    <div className="text-[12px] text-[#5d2a1a] bg-[#fbe1d1] px-3 py-1 rounded-full inline-block font-medium">
                      Live Snapshot for {domain}
                    </div>
                  </div>
                </div>
                <div className="text-[12px] text-[#777b86] mt-4 pt-3 border-t border-[#f2f2f3] flex items-center gap-1.5">
                  <Clock className="w-3 h-3" />
                  Scraped at {result.scrapedAt ? new Date(result.scrapedAt).toLocaleTimeString() : 'just now'}
                </div>
              </div>

              <div className="bg-[#ffffff] rounded-2xl p-6 border border-[#17191c]/10 shadow-sm md:col-span-2 space-y-4">
                <h3 className="font-semibold text-[16px] text-[#17191c]">Score Breakdown by Signal Layer</h3>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-[13px]">
                  {[
                    { label: 'Title Tag', score: seoHealth.breakdown.titleScore, max: 20, detail: metadata.title ? `${metadata.title.length} chars` : 'Missing' },
                    { label: 'Meta Description', score: seoHealth.breakdown.metaScore, max: 20, detail: metadata.description ? `${metadata.description.length} chars` : 'Missing' },
                    { label: 'H1 Hierarchy', score: seoHealth.breakdown.h1Score, max: 20, detail: `${metadata.h1Count} H1 tag${metadata.h1Count !== 1 ? 's' : ''} found` },
                    { label: 'Word Count', score: seoHealth.breakdown.wordCountScore, max: 15, detail: `${metadata.wordCount.toLocaleString()} words` },
                    { label: 'Schema Markup', score: seoHealth.breakdown.schemaScore, max: 15, detail: metadata.schemaTypes?.join(', ') || 'None' },
                    { label: 'Link & Canonical', score: seoHealth.breakdown.linkScore, max: 10, detail: metadata.canonicalUrl ? 'Canonical set' : 'No canonical' },
                  ].map((factor) => (
                    <div key={factor.label} className="p-3.5 bg-[#fafafb] rounded-xl border border-[#17191c]/5">
                      <div className="text-[#777b86] text-[12px]">{factor.label}</div>
                      <div className={`font-bold text-[16px] mt-1 ${factor.score === factor.max ? 'text-[#10a37f]' : factor.score >= factor.max * 0.7 ? 'text-[#17191c]' : 'text-[#d97706]'}`}>
                        {factor.score} / {factor.max}
                      </div>
                      <div className="text-[11px] text-[#777b86] truncate">{factor.detail}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Live Detected Issues */}
            {seoHealth.issues && seoHealth.issues.length > 0 && (
              <div className="bg-[#ffffff] rounded-2xl p-6 border border-[#17191c]/10 shadow-sm space-y-4">
                <h3 className="font-semibold text-[16px] text-[#17191c] flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-[#d97706]" />
                  <span>Detected On-Page Issues ({seoHealth.issues.length})</span>
                </h3>
                <div className="space-y-2.5">
                  {seoHealth.issues.map((issue: string, idx: number) => (
                    <div key={idx} className="p-3.5 bg-[#fffbeb] border border-[#fde68a] rounded-xl text-xs text-[#92400e] flex items-start gap-2.5">
                      <AlertCircle className="w-4 h-4 text-[#d97706] flex-shrink-0 mt-0.5" />
                      <span className="font-medium">{issue}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Technical Factors Inspection Table */}
            <div className="bg-[#ffffff] rounded-2xl p-6 border border-[#17191c]/10 shadow-sm space-y-4">
              <h3 className="font-semibold text-[16px] text-[#17191c] pb-3 border-b border-[#f2f2f3] flex items-center gap-2">
                Technical Factor Inspection Log
                <a href={result.url} target="_blank" rel="noopener noreferrer" className="text-[12px] text-[#777b86] hover:text-[#17191c] flex items-center gap-1 font-normal ml-2">
                  {domain} <ExternalLink className="w-3 h-3" />
                </a>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[13px]">
                <div className="p-4 bg-[#fafafb] rounded-xl space-y-3 border border-[#17191c]/5">
                  <div className="font-semibold text-[#17191c] text-[14px]">On-Page Metadata</div>
                  <div className="space-y-2">
                    <div className="flex justify-between py-1 border-b border-[#17191c]/5">
                      <span className="text-[#777b86]">Title Tag</span>
                      <span className="text-[#17191c] font-medium max-w-[220px] truncate" title={metadata.title}>{metadata.title || '—'}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-[#17191c]/5">
                      <span className="text-[#777b86]">Meta Description</span>
                      <span className="text-[#17191c] font-medium max-w-[220px] truncate" title={metadata.description}>{metadata.description || '—'}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-[#17191c]/5">
                      <span className="text-[#777b86]">Word Count</span>
                      <span className="text-[#17191c] font-medium">{metadata.wordCount.toLocaleString()} words</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-[#777b86]">H1 Heading Count</span>
                      <span className="text-[#17191c] font-medium">{metadata.h1Count} H1</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-[#fafafb] rounded-xl space-y-3 border border-[#17191c]/5">
                  <div className="font-semibold text-[#17191c] text-[14px]">Structured Data &amp; HTTP Status</div>
                  <div className="space-y-2">
                    <div className="flex justify-between py-1 border-b border-[#17191c]/5">
                      <span className="text-[#777b86]">Schema.org Types</span>
                      <span className="text-[#17191c] font-medium max-w-[200px] truncate">
                        {metadata.schemaTypes?.join(', ') || 'None'}
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-[#17191c]/5">
                      <span className="text-[#777b86]">HTTP Status Code</span>
                      <span className={`font-semibold ${metadata.statusCode === 200 ? 'text-[#10a37f]' : 'text-[#d97706]'}`}>
                        {metadata.statusCode} {metadata.statusCode === 200 ? 'OK' : ''}
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-[#17191c]/5">
                      <span className="text-[#777b86]">Language</span>
                      <span className="text-[#17191c] font-medium">{metadata.language || 'en'}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-[#777b86]">Canonical URL</span>
                      <span className={`font-semibold max-w-[200px] truncate ${metadata.canonicalUrl ? 'text-[#10a37f]' : 'text-[#d97706]'}`} title={metadata.canonicalUrl}>
                        {metadata.canonicalUrl ? 'Verified' : 'Missing'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Snapshot Version History */}
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
              No snapshots recorded yet. Enter a URL above and click &quot;Run Snapshot&quot; to begin tracking.
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
      </main>
    </DashboardLayout>
  );
}
