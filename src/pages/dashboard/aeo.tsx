import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import {
  Sparkles,
  RefreshCw,
  Copy,
  Check,
  FileText,
  Code,
  Zap,
  Bot,
  AlertTriangle,
  Globe,
  Search,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { PricingModal } from '@/components/pricing/PricingModal';
import {
  AiEngineBadge,
  AiEngineSelector,
  AiEngineId,
  AI_ENGINES,
} from '@/components/dashboard/AiEngineBadges';

import { Clock } from 'lucide-react';
import { HistoryModal, HistoryItem } from '@/components/dashboard/HistoryModal';

export default function AiCitationPage() {
  const { user, isAdmin, isPro } = useAuth();
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [url, setUrl] = useState('');
  const [brandName, setBrandName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copiedLlms, setCopiedLlms] = useState(false);

  // Supabase History Modal state
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
      const res = await fetch(`/api/v2/aeo-audit?userEmail=${encodeURIComponent(user?.email || '')}`);
      const data = await res.json();
      if (data.success && data.audits) {
        const formatted = data.audits.map((item: any) => ({
          id: item.id,
          title: item.domain || item.url,
          subtitle: `Brand: ${item.brand_name || 'N/A'} • URL: ${item.url}`,
          timestamp: item.created_at || new Date().toISOString(),
          badge: `${item.aeo_score || 0} AEO Score`,
          data: item.audit_data || item,
        }));
        setHistoryItems(formatted);
      }
    } catch (err) {
      console.warn('Failed to load AEO history:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const [selectedEngines, setSelectedEngines] = useState<AiEngineId[]>([
    'chatgpt',
    'perplexity',
    'grok',
    'gemini',
  ]);
  const [activeEngineTab, setActiveEngineTab] = useState<AiEngineId>('chatgpt');
  const [activeTab, setActiveTab] = useState<'overview' | 'llms' | 'schema' | 'triggers'>('overview');

  const [aeoData, setAeoData] = useState<any>(null);

  // Load tracked domain & cached AEO data on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedDomain = localStorage.getItem('tracked_domain');
      const storedBrand = localStorage.getItem('pending_brand_name');

      if (storedDomain) {
        setUrl(storedDomain.startsWith('http') ? storedDomain : `https://${storedDomain}`);
      }
      if (storedBrand) {
        setBrandName(storedBrand);
      } else if (storedDomain) {
        setBrandName(storedDomain.split('.')[0]);
      }

      const cachedData = localStorage.getItem('aeo_audit_cache');
      if (cachedData) {
        try {
          setAeoData(JSON.parse(cachedData));
        } catch (e) {}
      }
    }
  }, []);

  // Load latest audit from Supabase DB
  useEffect(() => {
    async function loadDbAudit() {
      if (!user?.email) return;
      try {
        const res = await fetch(`/api/v2/aeo-audit?userEmail=${encodeURIComponent(user.email)}`);
        const data = await res.json();
        if (data.success && Array.isArray(data.audits) && data.audits.length > 0) {
          const latestAudit = data.audits[0].audit_data;
          if (latestAudit) {
            setAeoData(latestAudit);
            if (typeof window !== 'undefined') {
              localStorage.setItem('aeo_audit_cache', JSON.stringify(latestAudit));
            }
          }
        }
      } catch (err) {
        console.warn('Failed to load DB AEO audits:', err);
      }
    }

    loadDbAudit();
  }, [user]);

  const handleToggleEngine = (id: AiEngineId) => {
    setSelectedEngines((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleRunAudit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    if (!isAdmin && !isPro) {
      setShowPricingModal(true);
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/v2/aeo-audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: url.trim(),
          brandName: brandName.trim() || undefined,
          userEmail: user?.email || null,
        }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        setErrorMsg(data.error || `HTTP ${res.status}`);
        return;
      }

      if (data.success) {
        setAeoData(data);
        if (typeof window !== 'undefined') {
          localStorage.setItem('aeo_audit_cache', JSON.stringify(data));
        }
      }
    } catch (err: any) {
      console.error('AEO Audit failed:', err);
      setErrorMsg(err.message || 'Failed to run AEO audit');
    } finally {
      setLoading(false);
    }
  };

  const copyLlmsTxt = () => {
    if (aeoData?.llmsTxtStatus?.generatedSnippet) {
      navigator.clipboard.writeText(aeoData.llmsTxtStatus.generatedSnippet);
      setCopiedLlms(true);
      setTimeout(() => setCopiedLlms(false), 2000);
    }
  };

  return (
    <DashboardLayout activeDomain={aeoData?.domain || (url ? new URL(url.startsWith('http') ? url : `https://${url}`).hostname : 'AI Citation Engine')}>
      <Head>
        <title>AI Citation Optimization Engine (AEO/GEO) — SEOzapp v2</title>
      </Head>

      <PricingModal isOpen={showPricingModal} onClose={() => setShowPricingModal(false)} />

      <main className="max-w-[1250px] mx-auto px-8 py-8 space-y-8">
        {/* Module Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[12px] font-semibold text-[#5d2a1a] bg-[#fbe1d1] px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-[#5d2a1a]" />
                Module 05 • Generative Engine Optimization
              </span>
            </div>
            <h1 className="text-[28px] font-semibold text-[#17191c] mt-1">
              AI Citation &amp; GEO Optimization Engine
            </h1>
            <p className="text-[15px] text-[#777b86]">
              Maximize LLM citation frequency, passage quoteability, and generate optimized <code className="bg-[#17191c]/5 px-1 py-0.5 rounded text-xs font-mono text-[#17191c]">/llms.txt</code> manifests.
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
          title="Previous AEO & GEO Audits"
          featureName="Module 05 • Generative Engine Optimization"
          items={historyItems}
          loading={loadingHistory}
          onRefresh={fetchHistory}
          onSelect={(item) => {
            if (item.data) {
              setAeoData(item.data);
              if (item.data.url) setUrl(item.data.url);
            }
          }}
        />

        {/* Live URL Audit Form */}
        <div className="bg-[#ffffff] rounded-2xl p-6 border border-[#17191c]/10 shadow-sm space-y-4">
          <h2 className="text-[18px] font-semibold text-[#17191c] flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#17191c]" />
            Audit &amp; Optimize URL for AI Search Engines
          </h2>

          <form onSubmit={handleRunAudit} className="flex flex-col sm:flex-row items-center gap-3">
            <input
              type="text"
              required
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Enter URL (e.g. https://yourcompany.com)"
              className="bg-[#fafafb] border border-[#17191c]/15 rounded-xl px-4 py-2.5 text-sm text-[#17191c] focus:outline-none w-full sm:w-96 shadow-inner"
            />
            <input
              type="text"
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
              placeholder="Brand Name (Optional)"
              className="bg-[#fafafb] border border-[#17191c]/15 rounded-xl px-4 py-2.5 text-sm text-[#17191c] focus:outline-none w-full sm:w-56 shadow-inner"
            />
            <button
              type="submit"
              disabled={loading || !url.trim()}
              className="bg-[#17191c] text-[#ffffff] rounded-xl px-6 py-2.5 text-sm font-medium hover:bg-[#17191c]/90 disabled:opacity-50 whitespace-nowrap flex items-center gap-2"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-[#fbe1d1]" />}
              Analyze AI Citation
            </button>
          </form>

          {errorMsg && (
            <div className="p-3 bg-[#ef4444]/10 border border-[#ef4444]/20 rounded-xl text-xs text-[#ef4444] font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>

        {/* Audit Results Dashboard */}
        {aeoData ? (
          <div className="space-y-8">
            {/* Top Score Banner */}
            <div className="bg-[#ffffff] rounded-2xl p-6 border border-[#17191c]/10 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                <div className="w-20 h-20 bg-[#17191c] text-white rounded-2xl flex flex-col items-center justify-center font-bold text-2xl shadow-md">
                  <span>{aeoData.aeoScore}</span>
                  <span className="text-[10px] text-[#fbe1d1] font-normal uppercase">AEO Score</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-[#17191c]">{aeoData.domain}</h3>
                  <p className="text-xs text-[#777b86] mt-0.5">
                    {aeoData.breakdown?.directAnswerPresent ? '✓ Direct answer structure detected' : '✕ Lacks explicit direct answer paragraph'}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[11px] bg-[#fbe1d1] text-[#5d2a1a] px-2.5 py-0.5 rounded-full font-semibold">
                      Fluff Level: {aeoData.breakdown?.fluffLevel || 'Low'}
                    </span>
                    <span className="text-[11px] bg-[#f2f2f3] text-[#17191c] px-2.5 py-0.5 rounded-full font-medium">
                      Quoteability: {aeoData.breakdown?.quoteabilityScore || 85}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Sub Score Grid */}
              <div className="grid grid-cols-3 gap-4 w-full md:w-auto">
                <div className="p-3 bg-[#fafafb] rounded-xl border border-[#17191c]/5 text-center">
                  <div className="text-[10px] text-[#777b86] uppercase font-semibold">Schema Score</div>
                  <div className="text-lg font-bold text-[#17191c] mt-0.5">{aeoData.breakdown?.schemaScore || 0}%</div>
                </div>
                <div className="p-3 bg-[#fafafb] rounded-xl border border-[#17191c]/5 text-center">
                  <div className="text-[10px] text-[#777b86] uppercase font-semibold">Semantic Score</div>
                  <div className="text-lg font-bold text-[#17191c] mt-0.5">{aeoData.breakdown?.semanticScore || 0}%</div>
                </div>
                <div className="p-3 bg-[#fafafb] rounded-xl border border-[#17191c]/5 text-center">
                  <div className="text-[10px] text-[#777b86] uppercase font-semibold">Density Score</div>
                  <div className="text-lg font-bold text-[#17191c] mt-0.5">{aeoData.breakdown?.densityScore || 0}%</div>
                </div>
              </div>
            </div>

            {/* AI Engine Breakdown Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {(Object.keys(AI_ENGINES) as AiEngineId[]).map((id) => {
                const engine = AI_ENGINES[id];
                const scoreInfo = aeoData.engineScores?.[id] || { score: aeoData.aeoScore, status: 'Analyzed' };
                return (
                  <div key={id} className="bg-[#ffffff] rounded-2xl p-4 border border-[#17191c]/10 shadow-sm space-y-2">
                    <div className="flex items-center gap-2">
                      {engine.iconPath ? (
                        <img src={engine.iconPath} alt={engine.name} className="w-4 h-4 object-contain rounded-full" />
                      ) : (
                        engine.svgIcon
                      )}
                      <span className="text-[13px] font-semibold text-[#17191c]">{engine.name}</span>
                    </div>
                    <div className="text-[20px] font-bold text-[#17191c]">{scoreInfo.score}%</div>
                    <div className="text-[10px] text-[#777b86]">{scoreInfo.status}</div>
                  </div>
                );
              })}
            </div>

            {/* llms.txt & Recommendations Tab Container */}
            <div className="bg-[#ffffff] rounded-2xl p-6 border border-[#17191c]/10 shadow-sm space-y-6">
              <div className="flex border-b border-[#f2f2f3] gap-6 text-sm font-medium">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`pb-3 border-b-2 transition-colors ${activeTab === 'overview' ? 'border-[#17191c] text-[#17191c]' : 'border-transparent text-[#777b86] hover:text-[#17191c]'}`}
                >
                  GEO Action Plan
                </button>
                <button
                  onClick={() => setActiveTab('llms')}
                  className={`pb-3 border-b-2 transition-colors ${activeTab === 'llms' ? 'border-[#17191c] text-[#17191c]' : 'border-transparent text-[#777b86] hover:text-[#17191c]'}`}
                >
                  llms.txt Generator
                </button>
                <button
                  onClick={() => setActiveTab('triggers')}
                  className={`pb-3 border-b-2 transition-colors ${activeTab === 'triggers' ? 'border-[#17191c] text-[#17191c]' : 'border-transparent text-[#777b86] hover:text-[#17191c]'}`}
                >
                  Recommended Prompt Triggers
                </button>
              </div>

              {/* Tab 1: GEO Action Plan */}
              {activeTab === 'overview' && (
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-[#17191c]">Prioritized Recommendations for Answer Engine Optimization</h4>
                  <div className="space-y-3">
                    {aeoData.geoActionPlan?.map((plan: any, idx: number) => (
                      <div key={idx} className="p-4 bg-[#fafafb] rounded-xl border border-[#17191c]/5 flex items-start gap-3">
                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase mt-0.5 ${
                          plan.priority === 'CRITICAL' ? 'bg-[#ef4444]/10 text-[#ef4444]' : 'bg-[#fbe1d1] text-[#5d2a1a]'
                        }`}>
                          {plan.priority}
                        </span>
                        <div>
                          <div className="font-semibold text-sm text-[#17191c]">{plan.title}</div>
                          <div className="text-xs text-[#777b86] mt-0.5">{plan.desc}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab 2: llms.txt Generator */}
              {activeTab === 'llms' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-semibold text-[#17191c]">Generated /llms.txt Standard Specification</h4>
                      <p className="text-xs text-[#777b86]">Add this file to your root web directory so LLM crawlers can easily ingest your site context.</p>
                    </div>
                    <button
                      onClick={copyLlmsTxt}
                      className="bg-[#17191c] text-white px-3.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 hover:bg-[#17191c]/90 transition-colors"
                    >
                      {copiedLlms ? <Check className="w-3.5 h-3.5 text-[#10a37f]" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedLlms ? 'Copied!' : 'Copy /llms.txt'}</span>
                    </button>
                  </div>
                  <pre className="p-4 bg-[#17191c] text-[#fbe1d1] rounded-xl text-xs overflow-x-auto font-mono leading-relaxed">
                    {aeoData.llmsTxtStatus?.generatedSnippet || '# No llms.txt generated yet'}
                  </pre>
                </div>
              )}

              {/* Tab 3: Recommended Prompt Triggers */}
              {activeTab === 'triggers' && (
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-[#17191c]">High-Intent Search Prompts to Target</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {aeoData.recommendedTriggers?.map((trig: any, idx: number) => (
                      <div key={idx} className="p-3.5 bg-[#fafafb] rounded-xl border border-[#17191c]/5 flex items-center justify-between">
                        <div className="space-y-1">
                          <div className="text-xs font-semibold text-[#17191c]">&quot;{trig.prompt}&quot;</div>
                          <div className="text-[10px] text-[#777b86] uppercase tracking-wider">{trig.intent} Intent</div>
                        </div>
                        <AiEngineBadge engineId={trig.engineId || 'kimi'} />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-[#ffffff] rounded-2xl p-12 border border-[#17191c]/10 text-center space-y-3">
            <Sparkles className="w-10 h-10 text-[#777b86]/40 mx-auto" />
            <p className="text-base font-semibold text-[#17191c]">No AI Citation Audit Run Yet</p>
            <p className="text-xs text-[#777b86] max-w-md mx-auto">
              Enter your website URL above to analyze AEO readiness, generate `/llms.txt`, and discover GEO action plan steps.
            </p>
          </div>
        )}
      </main>
    </DashboardLayout>
  );
}
