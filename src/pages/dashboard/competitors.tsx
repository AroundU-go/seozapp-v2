import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import {
  Users,
  RefreshCw,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  TrendingUp,
  Layers,
  Globe,
  Plus,
  X,
  AlertCircle,
} from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { PricingModal } from '@/components/pricing/PricingModal';

import { Clock } from 'lucide-react';
import { HistoryModal, HistoryItem } from '@/components/dashboard/HistoryModal';

export default function CompetitorsPage() {
  const { user, isAdmin, isPro, paymentType } = useAuth();
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [ownUrl, setOwnUrl] = useState('');
  const [competitorInputs, setCompetitorInputs] = useState<string[]>(['']);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [report, setReport] = useState<any>(null);

  // Competitor limit per plan: Starter ($49) = 5, Pro ($99) = 10, Enterprise/Admin = Unlimited
  const getMaxCompetitors = (): number => {
    if (isAdmin || paymentType.toLowerCase().includes('enterprise') || paymentType.toLowerCase().includes('scale')) {
      return 999;
    }
    if (paymentType.toLowerCase().includes('pro') || paymentType.includes('$99')) {
      return 10;
    }
    return 5;
  };

  // Supabase History Modal state
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
      const res = await fetch(`/api/v2/competitors?userEmail=${encodeURIComponent(user?.email || '')}`);
      const data = await res.json();
      if (data.success && data.analyses) {
        const formatted = data.analyses.map((item: any) => ({
          id: item.id,
          title: `${item.own_domain || 'Domain'} vs Competitors`,
          subtitle: `Competitors: ${Array.isArray(item.competitor_urls) ? item.competitor_urls.join(', ') : item.competitor_urls || 'N/A'}`,
          timestamp: item.created_at || new Date().toISOString(),
          badge: 'Competitor Analysis',
          data: {
            ownSite: item.own_site_data,
            competitors: item.competitors_data,
            gapsSummary: typeof item.gaps_summary === 'string' ? item.gaps_summary.split('\n') : item.gaps_summary || [],
            groqSynthesis: item.own_site_data?.groqSynthesis,
          },
        }));
        setHistoryItems(formatted);
      }
    } catch (err) {
      console.warn('Failed to load competitor history:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  // Load user domain from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedDomain = localStorage.getItem('tracked_domain');
      if (storedDomain) {
        setOwnUrl(storedDomain.startsWith('http') ? storedDomain : `https://${storedDomain}`);
      }

      // Load cached report
      const localReport = localStorage.getItem('competitor_report_cache');
      if (localReport) {
        try {
          setReport(JSON.parse(localReport));
        } catch (e) {}
      }
    }
  }, []);

  // Load latest report from Supabase DB
  useEffect(() => {
    async function loadHistory() {
      if (!user?.email) return;
      try {
        const res = await fetch(`/api/v2/competitors?userEmail=${encodeURIComponent(user.email)}`);
        const data = await res.json();
        if (data.success && Array.isArray(data.analyses) && data.analyses.length > 0) {
          const latest = data.analyses[0];
          const loadedReport = {
            ownSite: latest.own_site_data,
            competitors: latest.competitors_data,
            gapsSummary: latest.gaps_summary,
            groqSynthesis: latest.own_site_data?.groqSynthesis || latest.groq_synthesis,
          };
          setReport(loadedReport);
          if (typeof window !== 'undefined') {
            localStorage.setItem('competitor_report_cache', JSON.stringify(loadedReport));
          }
        }
      } catch (err) {
        console.warn('Failed to load DB competitor analyses:', err);
      }
    }

    loadHistory();
  }, [user]);

  const handleAddCompetitor = () => {
    const maxComp = getMaxCompetitors();
    if (competitorInputs.length >= maxComp) {
      setErrorMsg(`Your plan allows up to ${maxComp} competitors. Upgrade your plan to analyze more competitors.`);
      return;
    }
    setErrorMsg(null);
    setCompetitorInputs((prev) => [...prev, '']);
  };

  const handleRemoveCompetitor = (idx: number) => {
    if (competitorInputs.length === 1) {
      setCompetitorInputs(['']);
      return;
    }
    setCompetitorInputs((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleCompetitorChange = (idx: number, val: string) => {
    setCompetitorInputs((prev) => {
      const copy = [...prev];
      copy[idx] = val;
      return copy;
    });
  };

  const handleRunComparison = async (e: React.FormEvent) => {
    e.preventDefault();
    const validCompetitors = competitorInputs.map((c) => c.trim()).filter(Boolean);

    if (!ownUrl.trim() || validCompetitors.length === 0) {
      setErrorMsg('Please enter your website URL and at least one competitor URL.');
      return;
    }

    const maxComp = getMaxCompetitors();
    if (validCompetitors.length > maxComp) {
      setErrorMsg(`Your plan allows up to ${maxComp} competitors. Please remove ${validCompetitors.length - maxComp} competitor(s) or upgrade your plan.`);
      return;
    }

    if (!isAdmin && !isPro) {
      setShowPricingModal(true);
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/v2/competitors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ownUrl: ownUrl.trim(),
          competitorUrls: validCompetitors,
          userEmail: user?.email || null,
        }),
      });
      const data = await res.json();

      if (!res.ok || data.error) {
        setErrorMsg(data.error || `HTTP ${res.status}`);
        return;
      }

      if (data.success && data.ownSite) {
        const newReport = {
          ownSite: data.ownSite,
          competitors: data.competitors,
          gapsSummary: data.gapsSummary,
          groqSynthesis: data.groqSynthesis,
          engine: data.engine,
        };
        setReport(newReport);
        if (typeof window !== 'undefined') {
          localStorage.setItem('competitor_report_cache', JSON.stringify(newReport));
        }
      }
    } catch (err: any) {
      console.error('Competitor comparison error:', err);
      setErrorMsg(err.message || 'Failed to run competitor analysis');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout activeDomain={ownUrl ? new URL(ownUrl.startsWith('http') ? ownUrl : `https://${ownUrl}`).hostname : 'Competitor Intelligence'}>
      <Head>
        <title>Competitor Intelligence — SEOzapp v2</title>
      </Head>

      <PricingModal isOpen={showPricingModal} onClose={() => setShowPricingModal(false)} />

      <main className="max-w-[1250px] mx-auto px-8 py-8 space-y-8">
        {/* Module Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[12px] font-semibold text-[#17191c] bg-[#f2f2f3] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Module 04 • Competitor Benchmarking
              </span>
            </div>
            <h1 className="text-[28px] font-semibold text-[#17191c] mt-1">
              AI &amp; SEO Competitor Intelligence
            </h1>
            <p className="text-[15px] text-[#777b86]">
              Benchmark your domain against direct competitors in SEO scoring, AI readiness, and schema coverage.
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
          title="Previous Competitor Analyses"
          featureName="Module 04 • Competitor Intelligence"
          items={historyItems}
          loading={loadingHistory}
          onRefresh={fetchHistory}
          onSelect={(item) => {
            if (item.data) {
              setReport(item.data);
            }
          }}
        />

        {/* Input Form */}
        <div className="bg-[#ffffff] rounded-2xl p-6 border border-[#17191c]/10 shadow-sm space-y-6">
          <h2 className="text-[18px] font-semibold text-[#17191c] flex items-center gap-2">
            <Users className="w-4 h-4 text-[#17191c]" />
            Compare Your Site vs Competitors
          </h2>

          <form onSubmit={handleRunComparison} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[#777b86] mb-1">Your Website URL *</label>
              <input
                type="text"
                required
                value={ownUrl}
                onChange={(e) => setOwnUrl(e.target.value)}
                placeholder="e.g. https://yourcompany.com"
                className="bg-[#fafafb] border border-[#17191c]/15 rounded-xl px-4 py-2.5 text-sm w-full md:w-96 focus:outline-none"
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-medium text-[#777b86]">
                  Competitor URLs ({competitorInputs.length})
                </label>
                <button
                  type="button"
                  onClick={handleAddCompetitor}
                  className="text-xs font-semibold text-[#17191c] bg-[#fafafb] border border-[#17191c]/15 px-3 py-1 rounded-lg hover:bg-[#f2f2f3] transition-colors flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Competitor</span>
                </button>
              </div>

              {competitorInputs.map((val, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={val}
                    onChange={(e) => handleCompetitorChange(idx, e.target.value)}
                    placeholder={idx === 0 ? "e.g. https://competitor.com" : "e.g. https://another-rival.io"}
                    className="bg-[#fafafb] border border-[#17191c]/15 rounded-xl px-4 py-2.5 text-sm flex-1 focus:outline-none"
                  />
                  {competitorInputs.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveCompetitor(idx)}
                      className="p-2 text-[#777b86] hover:text-[#ef4444] hover:bg-[#ef4444]/10 rounded-lg transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={loading || !ownUrl.trim() || competitorInputs.every((c) => !c.trim())}
                className="bg-[#17191c] text-[#ffffff] rounded-xl px-6 py-2.5 text-sm font-medium hover:bg-[#17191c]/90 disabled:opacity-50 flex items-center gap-2 shadow-sm"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-[#fbe1d1]" />}
                <span>{loading ? 'Analyzing Competitors...' : 'Run Benchmark Comparison'}</span>
              </button>
            </div>
          </form>

          {errorMsg && (
            <div className="p-3 bg-[#ef4444]/10 border border-[#ef4444]/20 rounded-xl text-xs text-[#ef4444] font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>

        {/* Comparison Table & Results */}
        {report ? (
          <div className="space-y-8">
            <div className="bg-[#ffffff] rounded-2xl p-6 border border-[#17191c]/10 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#f2f2f3]">
                <h3 className="font-semibold text-[16px] text-[#17191c]">Domain Benchmark Scoreboard</h3>
                <span className="text-xs text-[#777b86]">Comparing {1 + (report.competitors?.length || 0)} domains</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-[13px]">
                  <thead>
                    <tr className="border-b border-[#f2f2f3] text-[#979799] text-[12px]">
                      <th className="pb-3 font-medium">Domain</th>
                      <th className="pb-3 font-medium">SEO Score</th>
                      <th className="pb-3 font-medium">AI Readiness Score</th>
                      <th className="pb-3 font-medium">Word Count</th>
                      <th className="pb-3 font-medium">FAQ Schema</th>
                      <th className="pb-3 font-medium text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f2f2f3]">
                    {/* Own Site Row */}
                    {report.ownSite && (
                      <tr className="bg-[#fafafb] font-semibold">
                        <td className="py-3.5 text-[#17191c] flex items-center gap-2">
                          <Globe className="w-4 h-4 text-[#17191c]" />
                          <span>{report.ownSite.domain}</span>
                          <span className="text-[10px] bg-[#17191c] text-white px-2 py-0.5 rounded-full font-normal">Your Site</span>
                        </td>
                        <td className="py-3.5 text-[#17191c]">{report.ownSite.seoScore} / 100</td>
                        <td className="py-3.5 text-[#17191c]">{report.ownSite.aiStructuralScore} / 100</td>
                        <td className="py-3.5 text-[#777b86] font-normal">{report.ownSite.wordCount} words</td>
                        <td className="py-3.5">
                          {report.ownSite.hasFaqSchema ? (
                            <span className="text-[#10a37f] font-medium">✓ Active</span>
                          ) : (
                            <span className="text-[#777b86] font-normal">✕ Missing</span>
                          )}
                        </td>
                        <td className="py-3.5 text-right font-medium text-[#10a37f]">Analyzed</td>
                      </tr>
                    )}

                    {/* Competitor Rows */}
                    {report.competitors?.map((comp: any, idx: number) => (
                      <tr key={idx} className="hover:bg-[#fafafb] transition-colors">
                        <td className="py-3.5 text-[#17191c] font-medium flex items-center gap-2">
                          <Globe className="w-3.5 h-3.5 text-[#777b86]" />
                          <span>{comp.domain}</span>
                        </td>
                        <td className="py-3.5 text-[#17191c] font-medium">{comp.seoScore} / 100</td>
                        <td className="py-3.5 text-[#17191c] font-medium">{comp.aiStructuralScore} / 100</td>
                        <td className="py-3.5 text-[#777b86]">{comp.wordCount} words</td>
                        <td className="py-3.5">
                          {comp.hasFaqSchema ? (
                            <span className="text-[#10a37f] font-medium">✓ Active</span>
                          ) : (
                            <span className="text-[#777b86]">✕ Missing</span>
                          )}
                        </td>
                        <td className="py-3.5 text-right text-[#777b86]">Competitor</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Competitive AI Intelligence Synthesis */}
            {report.groqSynthesis && (
              <div className="bg-[#17191c] text-[#ffffff] rounded-2xl p-6 border border-[#17191c]/20 shadow-md space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#ffffff]/10">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-[#fbe1d1] text-[#5d2a1a] flex items-center justify-center font-bold text-sm shadow-sm">
                      ⚡
                    </div>
                    <div>
                      <h3 className="font-semibold text-[17px] text-[#ffffff]">Competitive AI Search Intelligence</h3>
                      <p className="text-xs text-[#979799]">Ultra-fast deep synthesis powered by Multi-LLM Engine &amp; Live Search Analysis</p>
                    </div>
                  </div>
                  <span className="text-xs font-semibold bg-[#fbe1d1] text-[#5d2a1a] px-3 py-1 rounded-full w-fit">
                    AI Deep Synthesis
                  </span>
                </div>

                {/* Executive Summary */}
                {report.groqSynthesis.aiSummary && (
                  <div className="bg-[#ffffff]/5 rounded-xl p-4 border border-[#ffffff]/10 space-y-1">
                    <span className="text-[11px] uppercase tracking-wider font-semibold text-[#fbe1d1]">Executive Summary</span>
                    <p className="text-sm text-[#ffffff]/90 leading-relaxed">{report.groqSynthesis.aiSummary}</p>
                  </div>
                )}

                {/* Feature Comparison Matrix */}
                {report.groqSynthesis.featureMatrix && report.groqSynthesis.featureMatrix.length > 0 && (
                  <div className="space-y-3">
                    <span className="text-[12px] uppercase tracking-wider font-semibold text-[#fbe1d1]">Feature &amp; Schema Parity Matrix</span>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="border-b border-[#ffffff]/10 text-[#979799]">
                            <th className="pb-2 font-medium">Capability / Feature</th>
                            <th className="pb-2 font-medium">Your Site Status</th>
                            <th className="pb-2 font-medium">Competitor Parity</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#ffffff]/10">
                          {report.groqSynthesis.featureMatrix.map((item: any, i: number) => (
                            <tr key={i}>
                              <td className="py-2.5 font-medium text-white">{item.feature}</td>
                              <td className="py-2.5 text-[#fbe1d1]">{item.ownSiteStatus}</td>
                              <td className="py-2.5 text-[#979799]">{item.competitorParity}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Topic Gaps & Strategic Plan */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                  {/* Topic Gaps */}
                  {report.groqSynthesis.topicGaps && report.groqSynthesis.topicGaps.length > 0 && (
                    <div className="bg-[#ffffff]/5 rounded-xl p-4 border border-[#ffffff]/10 space-y-3">
                      <span className="text-[11px] uppercase tracking-wider font-semibold text-[#fbe1d1] flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-[#fbe1d1]" />
                        <span>Topic &amp; Keyword Coverage Gaps</span>
                      </span>
                      <div className="space-y-2">
                        {report.groqSynthesis.topicGaps.map((gap: any, i: number) => (
                          <div key={i} className="text-xs space-y-1">
                            <div className="font-semibold text-white flex items-center gap-2">
                              <span>{gap.topic}</span>
                              <span className="text-[10px] bg-[#ef4444]/20 text-[#ef4444] px-2 py-0.5 rounded font-mono">{gap.impact || 'HIGH'}</span>
                            </div>
                            <p className="text-[#979799] text-[11px] leading-relaxed">{gap.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action Plan */}
                  {report.groqSynthesis.strategicActionPlan && report.groqSynthesis.strategicActionPlan.length > 0 && (
                    <div className="bg-[#ffffff]/5 rounded-xl p-4 border border-[#ffffff]/10 space-y-3">
                      <span className="text-[11px] uppercase tracking-wider font-semibold text-[#fbe1d1] flex items-center gap-1.5">
                        <TrendingUp className="w-3.5 h-3.5 text-[#fbe1d1]" />
                        <span>Strategic Action Plan</span>
                      </span>
                      <ul className="space-y-2 text-xs text-[#ffffff]/90">
                        {report.groqSynthesis.strategicActionPlan.map((action: string, i: number) => (
                          <li key={i} className="flex items-start gap-2">
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#10a37f] flex-shrink-0 mt-0.5" />
                            <span>{action}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Content & Structural Gaps */}
            {report.gapsSummary && report.gapsSummary.length > 0 && (
              <div className="bg-[#ffffff] rounded-2xl p-6 border border-[#17191c]/10 shadow-sm space-y-4">
                <h3 className="font-semibold text-[16px] text-[#17191c] flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-[#5d2a1a]" />
                  Identified Structural Gaps
                </h3>
                <div className="space-y-3">
                  {report.gapsSummary.map((gap: string, idx: number) => (
                    <div key={idx} className="p-3.5 bg-[#fafafb] rounded-xl border border-[#17191c]/5 text-xs text-[#17191c] font-medium flex items-start gap-2.5">
                      <Sparkles className="w-4 h-4 text-[#5d2a1a] flex-shrink-0 mt-0.5" />
                      <span>{gap}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-[#ffffff] rounded-2xl p-12 border border-[#17191c]/10 text-center space-y-3">
            <Users className="w-10 h-10 text-[#777b86]/40 mx-auto" />
            <p className="text-base font-semibold text-[#17191c]">No competitor benchmark run yet</p>
            <p className="text-xs text-[#777b86] max-w-md mx-auto">
              Enter your domain and target competitors above to discover SEO &amp; AI readiness score gaps.
            </p>
          </div>
        )}
      </main>
    </DashboardLayout>
  );
}
