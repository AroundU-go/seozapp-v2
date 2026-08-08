import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import {
  Bot,
  RefreshCw,
  Sparkles,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Globe,
  FileCode,
  ShieldCheck,
  ShieldAlert,
} from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';

import { Clock } from 'lucide-react';
import { HistoryModal, HistoryItem } from '@/components/dashboard/HistoryModal';

import { PricingModal } from '@/components/pricing/PricingModal';

export default function AiBotAccessPage() {
  const { user, isAdmin, isPro } = useAuth();
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [targetUrl, setTargetUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [audit, setAudit] = useState<any>(null);

  // Supabase History Modal state
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
      const res = await fetch(`/api/v2/ai-bot-audit?userEmail=${encodeURIComponent(user?.email || '')}`);
      const data = await res.json();
      if (data.success && data.audits) {
        const formatted = data.audits.map((item: any) => ({
          id: item.id,
          title: item.domain || item.target_url,
          subtitle: `URL: ${item.target_url || item.domain}`,
          timestamp: item.created_at || new Date().toISOString(),
          badge: `${item.bot_score || 0} Bot Score`,
          data: item.audit_data || item,
        }));
        setHistoryItems(formatted);
      }
    } catch (err) {
      console.warn('Failed to load bot audit history:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  // Load target domain from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('tracked_domain');
      if (stored) {
        setTargetUrl(stored.startsWith('http') ? stored : `https://${stored}`);
      }
    }
  }, []);

  // Load latest audit from Supabase on mount
  useEffect(() => {
    if (!user?.email) return;
    (async () => {
      try {
        const res = await fetch(`/api/v2/ai-bot-audit?userEmail=${encodeURIComponent(user?.email || '')}`);
        const data = await res.json();
        if (data.success && data.audits && data.audits.length > 0) {
          const latest = data.audits[0];
          setAudit(latest.audit_data || latest);
          if (latest.target_url) setTargetUrl(latest.target_url);
        }
      } catch (err) {
        console.warn('Failed to load latest bot audit on mount:', err);
      }
    })();
  }, [user?.email]);

  const handleRunAudit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetUrl.trim()) return;

    if (!isAdmin && !isPro) {
      setShowPricingModal(true);
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/v2/ai-bot-audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetUrl: targetUrl.trim(),
          userEmail: user?.email || null,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        setErrorMsg(data.error || `HTTP ${res.status}`);
        return;
      }

      if (data.success && data.audit) {
        setAudit(data.audit);
      }
    } catch (err: any) {
      console.error('AI Bot Audit error:', err);
      setErrorMsg(err.message || 'Failed to run AI Bot Access Audit');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout activeDomain={audit?.domain || ''}>
      <Head>
        <title>AI Crawlability &amp; Bot Access Audit — SEOzapp v2</title>
      </Head>

      <PricingModal isOpen={showPricingModal} onClose={() => setShowPricingModal(false)} />

      <main className="max-w-[1250px] mx-auto px-8 py-8 space-y-8">
        {/* Module Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[12px] font-semibold text-[#17191c] bg-[#f2f2f3] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Module 06 • AI Crawlability
              </span>
              <span className="text-[12px] text-[#777b86]">Robots.txt &amp; Bot Inspection</span>
            </div>
            <h1 className="text-[28px] font-semibold text-[#17191c] mt-1">
              AI Crawlability &amp; Bot Access Audit
            </h1>
            <p className="text-[15px] text-[#777b86]">
              Inspect whether GPTBot, ClaudeBot, PerplexityBot, and Google-Extended can crawl your site.
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
          title="Previous AI Bot Access Audits"
          featureName="Module 06 • AI Crawlability"
          items={historyItems}
          loading={loadingHistory}
          onRefresh={fetchHistory}
          onSelect={(item) => {
            if (item.data) {
              setAudit(item.data);
              if (item.data.targetUrl || item.title) setTargetUrl(item.data.targetUrl || `https://${item.title}`);
            }
          }}
        />

        {/* Audit Form Card */}
        <div className="bg-[#ffffff] rounded-2xl p-6 border border-[#17191c]/10 shadow-sm space-y-4">
          <form onSubmit={handleRunAudit} className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Globe className="w-4 h-4 text-[#777b86] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={targetUrl}
                onChange={(e) => setTargetUrl(e.target.value)}
                placeholder="https://yourdomain.com"
                className="bg-[#fafafb] border border-[#17191c]/15 rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#17191c] focus:outline-none w-full shadow-inner"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !targetUrl.trim()}
              className="bg-[#17191c] text-[#ffffff] rounded-xl px-6 py-2.5 text-sm font-medium hover:bg-[#17191c]/90 disabled:opacity-50 flex items-center gap-2 shadow-sm"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Bot className="w-4 h-4 text-[#fbe1d1]" />}
              <span>{loading ? 'Inspecting Bot Rules...' : 'Run Bot Access Audit'}</span>
            </button>
          </form>

          {errorMsg && (
            <div className="p-3 bg-[#ef4444]/10 border border-[#ef4444]/20 rounded-xl text-xs text-[#ef4444] font-medium flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>

        {/* Results Panel */}
        {audit ? (
          <div className="space-y-8">
            {/* Score Banner */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-[#ffffff] rounded-2xl p-6 border border-[#17191c]/10 shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-xs text-[#777b86]">AI Bot Access Score</span>
                  <div className="text-3xl font-bold text-[#17191c] mt-1">{audit.botScore} / 100</div>
                  <span className="text-xs text-[#10a37f] font-medium mt-1 inline-block">
                    {audit.allowedCount} of {audit.totalBots} AI Bots Allowed
                  </span>
                </div>
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-xl ${audit.botScore >= 80 ? 'bg-[#10a37f]/10 text-[#10a37f]' : 'bg-[#fbe1d1] text-[#5d2a1a]'}`}>
                  {audit.botScore >= 80 ? <ShieldCheck className="w-8 h-8" /> : <ShieldAlert className="w-8 h-8" />}
                </div>
              </div>

              <div className="bg-[#ffffff] rounded-2xl p-6 border border-[#17191c]/10 shadow-sm">
                <span className="text-xs text-[#777b86]">robots.txt Status</span>
                <div className="text-lg font-semibold text-[#17191c] mt-1 flex items-center gap-2">
                  <FileCode className="w-4 h-4 text-[#777b86]" />
                  <span>{audit.robotsTxtFound ? 'Found & Active' : 'Not Found / Restricted'}</span>
                </div>
                <span className="text-xs text-[#777b86] mt-2 block truncate">Target: {audit.domain}</span>
              </div>

              <div className="bg-[#ffffff] rounded-2xl p-6 border border-[#17191c]/10 shadow-sm">
                <span className="text-xs text-[#777b86]">Content Extraction Status</span>
                <div className="text-lg font-semibold text-[#17191c] mt-1 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#10a37f]" />
                  <span>{audit.contentAccessible ? 'Extraction Ready' : 'Blocked'}</span>
                </div>
                <span className="text-xs text-[#777b86] mt-2 block">{audit.wordCount} words detected</span>
              </div>
            </div>

            {/* Crawler Access Table */}
            <div className="bg-[#ffffff] rounded-2xl p-6 border border-[#17191c]/10 shadow-sm space-y-4">
              <h3 className="font-semibold text-[16px] text-[#17191c]">Major AI Crawler Inspection Matrix</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-[13px]">
                  <thead>
                    <tr className="border-b border-[#f2f2f3] text-[#979799] text-[12px]">
                      <th className="pb-3 font-medium">AI Bot Name</th>
                      <th className="pb-3 font-medium">User-Agent Header</th>
                      <th className="pb-3 font-medium">robots.txt Rule</th>
                      <th className="pb-3 font-medium text-right">Access Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f2f2f3]">
                    {audit.botStatuses?.map((b: any, i: number) => (
                      <tr key={i} className="hover:bg-[#fafafb] transition-colors">
                        <td className="py-3.5 font-semibold text-[#17191c] flex items-center gap-2">
                          <Bot className="w-4 h-4 text-[#777b86]" />
                          <span>{b.botName}</span>
                        </td>
                        <td className="py-3.5 font-mono text-xs text-[#777b86]">{b.userAgent}</td>
                        <td className="py-3.5">
                          {b.robotsTxtAllowed ? (
                            <span className="text-[#10a37f] font-medium">✓ Allowed</span>
                          ) : (
                            <span className="text-[#ef4444] font-medium">✕ Disallowed</span>
                          )}
                        </td>
                        <td className="py-3.5 text-right font-medium">
                          {b.accessible ? (
                            <span className="bg-[#10a37f]/10 text-[#10a37f] border border-[#10a37f]/20 px-2.5 py-0.5 rounded-full text-xs">
                              ✓ {b.statusText}
                            </span>
                          ) : (
                            <span className="bg-[#ef4444]/10 text-[#ef4444] border border-[#ef4444]/20 px-2.5 py-0.5 rounded-full text-xs">
                              ✕ {b.statusText}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-[#ffffff] rounded-2xl p-12 border border-[#17191c]/10 text-center space-y-3">
            <Bot className="w-10 h-10 text-[#777b86]/40 mx-auto" />
            <p className="text-base font-semibold text-[#17191c]">No bot access audit run yet</p>
            <p className="text-xs text-[#777b86] max-w-md mx-auto">
              Enter your website URL above to inspect whether ChatGPT, Claude, and Gemini bots can crawl your pages.
            </p>
          </div>
        )}
      </main>
    </DashboardLayout>
  );
}
