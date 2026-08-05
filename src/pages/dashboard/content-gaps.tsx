import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import {
  Target,
  RefreshCw,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Globe,
  Search,
  AlertCircle,
  TrendingUp,
  FileText,
} from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';

import { Clock } from 'lucide-react';
import { HistoryModal, HistoryItem } from '@/components/dashboard/HistoryModal';

import { PricingModal } from '@/components/pricing/PricingModal';

export default function ContentGapsPage() {
  const { user, isAdmin, isPro } = useAuth();
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [targetKeyword, setTargetKeyword] = useState('');
  const [userUrl, setUserUrl] = useState('');
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
      const res = await fetch(`/api/v2/content-gaps?userEmail=${encodeURIComponent(user?.email || '')}`);
      const data = await res.json();
      if (data.success && data.records) {
        const formatted = data.records.map((item: any) => ({
          id: item.id,
          title: item.target_keyword || item.user_url,
          subtitle: `Target Keyword: ${item.target_keyword} • Coverage: ${item.coverage_rate || 0}%`,
          timestamp: item.created_at || new Date().toISOString(),
          badge: `${item.coverage_rate || 0}% Coverage`,
          data: item.gap_data || item,
        }));
        setHistoryItems(formatted);
      }
    } catch (err) {
      console.warn('Failed to load content gap history:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('tracked_domain');
      if (stored) {
        setUserUrl(stored.startsWith('http') ? stored : `https://${stored}`);
      }
    }
  }, []);

  const handleFindGaps = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetKeyword.trim()) return;

    if (!isAdmin && !isPro) {
      setShowPricingModal(true);
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/v2/content-gaps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetKeyword: targetKeyword.trim(),
          userUrl: userUrl.trim(),
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
      console.error('Content gaps error:', err);
      setErrorMsg(err.message || 'Failed to find content gaps');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout activeDomain={userUrl ? new URL(userUrl.startsWith('http') ? userUrl : `https://${userUrl}`).hostname : ''}>
      <Head>
        <title>Content Gap Finder — SEOzapp v2</title>
      </Head>

      <PricingModal isOpen={showPricingModal} onClose={() => setShowPricingModal(false)} />

      <main className="max-w-[1250px] mx-auto px-8 py-8 space-y-8">
        {/* Module Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[12px] font-semibold text-[#17191c] bg-[#f2f2f3] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Module 08 • Content Gaps
              </span>
              <span className="text-[12px] text-[#777b86]">Live Search &amp; Content Parity Engine</span>
            </div>
            <h1 className="text-[28px] font-semibold text-[#17191c] mt-1">
              Content Gap Finder
            </h1>
            <p className="text-[15px] text-[#777b86]">
              Discover subtopics top-ranking search results cover that your site is missing.
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
          title="Previous Content Gap Audits"
          featureName="Module 08 • Content Gaps"
          items={historyItems}
          loading={loadingHistory}
          onRefresh={fetchHistory}
          onSelect={(item) => {
            if (item.data) {
              setReport(item.data);
              if (item.data.targetKeyword) setTargetKeyword(item.data.targetKeyword);
              if (item.data.userUrl) setUserUrl(item.data.userUrl);
            }
          }}
        />

        {/* Input Form */}
        <div className="bg-[#ffffff] rounded-2xl p-6 border border-[#17191c]/10 shadow-sm space-y-4">
          <form onSubmit={handleFindGaps} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-[#777b86] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={targetKeyword}
                onChange={(e) => setTargetKeyword(e.target.value)}
                placeholder="Target Keyword / Query"
                className="bg-[#fafafb] border border-[#17191c]/15 rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#17191c] focus:outline-none w-full shadow-inner"
              />
            </div>
            <div className="relative">
              <Globe className="w-4 h-4 text-[#777b86] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={userUrl}
                onChange={(e) => setUserUrl(e.target.value)}
                placeholder="Your Page URL (e.g. https://yourdomain.com/blog/guide)"
                className="bg-[#fafafb] border border-[#17191c]/15 rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#17191c] focus:outline-none w-full shadow-inner"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !targetKeyword.trim()}
              className="bg-[#17191c] text-[#ffffff] rounded-xl px-6 py-2.5 text-sm font-medium hover:bg-[#17191c]/90 disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Target className="w-4 h-4 text-[#fbe1d1]" />}
              <span>{loading ? 'Analyzing Content Gaps...' : 'Find Content Gaps'}</span>
            </button>
          </form>

          {errorMsg && (
            <div className="p-3 bg-[#ef4444]/10 border border-[#ef4444]/20 rounded-xl text-xs text-[#ef4444] font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>

        {/* Results */}
        {report ? (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-[#ffffff] rounded-2xl p-5 border border-[#17191c]/10 shadow-sm">
                <span className="text-xs text-[#777b86]">Content Coverage Rate</span>
                <div className="text-3xl font-bold text-[#17191c] mt-1">{report.coverageRate}%</div>
                <span className="text-xs text-[#777b86] mt-1 block">Subtopic parity score</span>
              </div>

              <div className="bg-[#ffffff] rounded-2xl p-5 border border-[#17191c]/10 shadow-sm">
                <span className="text-xs text-[#777b86]">Missing Subtopics</span>
                <div className="text-3xl font-bold text-[#ef4444] mt-1">{report.missingCount}</div>
                <span className="text-xs text-[#ef4444] font-medium mt-1 block">Actionable optimization gaps</span>
              </div>

              <div className="bg-[#ffffff] rounded-2xl p-5 border border-[#17191c]/10 shadow-sm">
                <span className="text-xs text-[#777b86]">Top Ranking Competitor Sources</span>
                <div className="text-3xl font-bold text-[#10a37f] mt-1">{report.totalAnalyzedSources}</div>
                <span className="text-xs text-[#10a37f] font-medium mt-1 block">Live search index sources</span>
              </div>
            </div>

            {/* Gap List Table */}
            <div className="bg-[#ffffff] rounded-2xl p-6 border border-[#17191c]/10 shadow-sm space-y-4">
              <h3 className="font-semibold text-[16px] text-[#17191c]">Subtopic Coverage &amp; Gap Matrix</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-[13px]">
                  <thead>
                    <tr className="border-b border-[#f2f2f3] text-[#979799] text-[12px]">
                      <th className="pb-3 font-medium">Subtopic / Intent</th>
                      <th className="pb-3 font-medium">Importance</th>
                      <th className="pb-3 font-medium">Top Ranking Competitor Parity</th>
                      <th className="pb-3 font-medium text-right">Your Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f2f2f3]">
                    {report.contentGaps?.map((gap: any, i: number) => (
                      <tr key={i} className="hover:bg-[#fafafb] transition-colors">
                        <td className="py-3.5 font-semibold text-[#17191c]">{gap.subtopic}</td>
                        <td className="py-3.5">
                          <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${gap.importance === 'HIGH' ? 'bg-[#ef4444]/10 text-[#ef4444]' : 'bg-[#f2f2f3] text-[#17191c]'}`}>
                            {gap.importance}
                          </span>
                        </td>
                        <td className="py-3.5 text-xs text-[#777b86]">
                          {gap.topRankingSources.length > 0 ? gap.topRankingSources.join(', ') : 'Covered in search results'}
                        </td>
                        <td className="py-3.5 text-right font-medium">
                          {gap.userCovered ? (
                            <span className="bg-[#10a37f]/10 text-[#10a37f] border border-[#10a37f]/20 px-2.5 py-0.5 rounded-full text-xs">
                              ✓ Covered
                            </span>
                          ) : (
                            <span className="bg-[#ef4444]/10 text-[#ef4444] border border-[#ef4444]/20 px-2.5 py-0.5 rounded-full text-xs">
                              ✕ Missing Section
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
            <Target className="w-10 h-10 text-[#777b86]/40 mx-auto" />
            <p className="text-base font-semibold text-[#17191c]">No content gap analysis run yet</p>
            <p className="text-xs text-[#777b86] max-w-md mx-auto">
              Enter a target keyword and your page URL above to find missing subtopics that top ranking search results cover.
            </p>
          </div>
        )}
      </main>
    </DashboardLayout>
  );
}
