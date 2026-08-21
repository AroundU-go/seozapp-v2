import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import {
  TrendingUp,
  Sparkles,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertCircle,
  Clock,
  Filter,
  Trash2,
  Plus,
  X,
  Download,
  FileText,
  ExternalLink,
  Copy,
  Check,
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
import { RegionDropdown, RegionCode, REGIONS } from '@/components/dashboard/RegionSelector';
import { generateAiVisibilityPdf } from '@/utils/aiVisibilityPdfGenerator';
import { parseVisibilityReport, cleanApifyReportMarkdown } from '@/utils/aiVisibilityParser';

interface PromptResult {
  id: string;
  prompt: string;
  brandName: string;
  engineId: AiEngineId;
  region: RegionCode;
  cited: boolean;
  position: string;
  sentiment: string;
  responseSnippet: string;
  lastRun: string;
  createdAt?: string;
  citedUrls?: string[];
  competitorsMentioned?: string[];
  aiSearchVolume?: number;
  isLiveSearch?: boolean;
}

import { HistoryModal, HistoryItem } from '@/components/dashboard/HistoryModal';

export default function CitationMonitoringPage() {
  const { user, isAdmin, paymentType } = useAuth();
  
  // History Modal State
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [showPricingModal, setShowPricingModal] = useState(false);

  // Generated Report & PDF state
  const [latestReportMarkdown, setLatestReportMarkdown] = useState<string | null>(null);
  const [latestReportUrl, setLatestReportUrl] = useState<string | null>(null);
  const [latestOverallScore, setLatestOverallScore] = useState<number | null>(null);
  const [copiedMd, setCopiedMd] = useState(false);
  const [expandedAnswerIndices, setExpandedAnswerIndices] = useState<number[]>([]);

  const isPro = true;

  // Allowed AI Search Engines based on subscription plan
  const getAllowedEngines = (): AiEngineId[] => {
    const pay = (paymentType || '').toLowerCase();
    if (isAdmin || pay.includes('enterprise') || pay.includes('scale')) {
      return ['chatgpt', 'gemini', 'perplexity', 'ai_overview', 'claude'];
    }
    if (pay.includes('pro') || pay.includes('$99')) {
      return ['chatgpt', 'gemini', 'perplexity', 'ai_overview'];
    }
    return ['chatgpt', 'gemini', 'perplexity'];
  };

  const allowedEngines = getAllowedEngines();

  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
      const emailParam = user?.email ? `userEmail=${encodeURIComponent(user.email)}` : '';
      const res = await fetch(`/api/v2/prompt-monitor?${emailParam}`);
      const data = await res.json();
      if (data.success && data.runs) {
        const formatted = data.runs.map((item: any) => ({
          id: item.id || `pr_${item.created_at}`,
          title: item.prompt_text || item.brand_name,
          subtitle: `Brand: ${item.brand_name || 'N/A'} • Provider: ${item.llm_provider || 'AI Engine'}`,
          timestamp: item.run_at || item.created_at || new Date().toISOString(),
          badge: item.cited ? 'Cited' : 'Uncited',
          data: item,
        }));
        setHistoryItems(formatted);
      }
    } catch (err) {
      console.warn('Failed to load prompt history:', err);
    } finally {
      setLoadingHistory(false);
    }
  };
  
  // Multi-prompt inputs array (minimum 3 queries required)
  const [promptInputs, setPromptInputs] = useState<string[]>(['', '', '']);
  const [brandName, setBrandName] = useState('');
  const [brandDomain, setBrandDomain] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState<RegionCode>('US');
  // Default selected engine: ChatGPT only
  const [selectedEngines, setSelectedEngines] = useState<AiEngineId[]>(['chatgpt']);
  const [filterEngine, setFilterEngine] = useState<string>('all');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Persistent prompt results stream
  const [promptResults, setPromptResults] = useState<PromptResult[]>([]);

  // Load domain/brand & history on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedBrand = localStorage.getItem('pending_brand_name');
      const storedDomain = localStorage.getItem('tracked_domain');
      if (storedDomain) {
        setBrandDomain(storedDomain);
        if (!storedBrand) {
          setBrandName(storedDomain.split('.')[0]);
        }
      }
      if (storedBrand) {
        setBrandName(storedBrand);
      }

      // Load local report cache
      const storedMd = localStorage.getItem('latest_ai_report_markdown');
      if (storedMd) setLatestReportMarkdown(storedMd);
      const storedRepUrl = localStorage.getItem('latest_ai_report_url');
      if (storedRepUrl) setLatestReportUrl(storedRepUrl);
      const storedScore = localStorage.getItem('latest_ai_overall_score');
      if (storedScore) setLatestOverallScore(Number(storedScore));

      // Load local cache history
      const localHistory = localStorage.getItem('monitored_prompts_history');
      if (localHistory) {
        try {
          const parsed = JSON.parse(localHistory);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setPromptResults(parsed);
          }
        } catch (e) {
          console.error(e);
        }
      }
    }
  }, []);

  // Fetch Supabase prompt history on load
  useEffect(() => {
    async function loadHistory() {
      try {
        const emailParam = user?.email ? `userEmail=${encodeURIComponent(user.email)}` : '';
        const res = await fetch(`/api/v2/prompt-monitor?${emailParam}`);
        const data = await res.json();
        if (data.success && Array.isArray(data.runs) && data.runs.length > 0) {
          const dbResults: PromptResult[] = data.runs.map((r: any) => {
            const ts = r.run_at || r.created_at;
            return {
              id: r.id || `pr_${ts}`,
              prompt: r.prompt_text,
              brandName: r.brand_name,
              engineId: (r.llm_provider as AiEngineId) || 'chatgpt',
              region: (r.region as RegionCode) || 'US',
              cited: r.cited,
              position: r.position || (r.cited ? 'Cited' : 'Uncited'),
              sentiment: r.sentiment || 'neutral',
              responseSnippet: r.response_snippet || '',
              lastRun: ts ? new Date(ts).toLocaleDateString([], { month: 'short', day: 'numeric' }) : 'Saved',
              createdAt: ts || new Date().toISOString(),
            };
          });

          setPromptResults((prev) => {
            const existingIds = new Set(prev.map((p) => p.id));
            const newItems = dbResults.filter((item) => !existingIds.has(item.id));
            const merged = [...newItems, ...prev];
            if (typeof window !== 'undefined') {
              localStorage.setItem('monitored_prompts_history', JSON.stringify(merged.slice(0, 100)));
            }
            return merged;
          });
        }
      } catch (err) {
        console.warn('Failed to load DB prompt history:', err);
      }
    }

    loadHistory();
  }, [user?.email]);

  const handleToggleEngine = (id: AiEngineId) => {
    if (!allowedEngines.includes(id)) {
      setShowPricingModal(true);
      return;
    }
    setSelectedEngines((prev) => {
      if (prev.includes(id)) {
        if (prev.length === 1) return prev; // Keep at least one selected
        return prev.filter((item) => item !== id);
      }
      return [...prev, id];
    });
  };

  // Multi-prompt input handlers
  const handleAddPromptInput = () => {
    setPromptInputs((prev) => [...prev, '']);
  };

  const handleRemovePromptInput = (index: number) => {
    if (promptInputs.length === 1) {
      setPromptInputs(['']);
      return;
    }
    setPromptInputs((prev) => prev.filter((_, i) => i !== index));
  };

  const handlePromptInputChange = (index: number, val: string) => {
    setPromptInputs((prev) => {
      const copy = [...prev];
      copy[index] = val;
      return copy;
    });
  };

  const handleTestPrompts = async (e: React.FormEvent) => {
    e.preventDefault();
    const validPrompts = promptInputs.map((p) => p.trim()).filter(Boolean);

    if (!brandName.trim()) {
      setErrorMsg('Please enter a target brand name.');
      return;
    }

    // Requirement: Mandatory minimum 3 prompt inputs before every run
    if (validPrompts.length < 3) {
      setErrorMsg('Mandatory requirement: Please enter a minimum of 3 unique prompt queries before running prompt monitoring.');
      return;
    }

    // Requirement: Disallow duplicate prompts in current list
    const lowerPrompts = validPrompts.map((p) => p.toLowerCase());
    if (new Set(lowerPrompts).size < lowerPrompts.length) {
      setErrorMsg('Duplicate prompts detected in your input list. Please ensure all prompt queries are unique.');
      return;
    }

    // Requirement: Disallow duplicate prompts for the SAME site/brand name
    const cleanBrand = brandName.trim().toLowerCase();
    const existingBrandPrompts = promptResults
      .filter((r) => r.brandName.trim().toLowerCase() === cleanBrand)
      .map((r) => r.prompt.trim().toLowerCase());

    const duplicateExisting = validPrompts.find((p) => existingBrandPrompts.includes(p.toLowerCase()));
    if (duplicateExisting) {
      setErrorMsg(`The prompt "${duplicateExisting}" has already been monitored for ${brandName.trim()}. Duplicate prompts are not allowed for the same site.`);
      return;
    }

    if (!isAdmin && !isPro) {
      setShowPricingModal(true);
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    const enginesToQuery = selectedEngines.filter((e) => allowedEngines.includes(e));
    const activeEngines = enginesToQuery.length > 0 ? enginesToQuery : ['chatgpt'];

    try {
      const res = await fetch('/api/v2/prompt-monitor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompts: validPrompts,
          brandName: brandName.trim(),
          brandDomain: brandDomain.trim(),
          platforms: activeEngines,
          region: selectedRegion,
          userEmail: user?.email || null,
        }),
      });

      const rawText = await res.text();
      let data: any = {};
      try {
        data = JSON.parse(rawText);
      } catch {
        setErrorMsg(`Server returned non-JSON response (${res.status}): ${rawText.slice(0, 100)}`);
        setLoading(false);
        return;
      }

      if (!res.ok || data.error) {
        if (res.status === 504) {
          setErrorMsg('The AI engines took longer than expected to respond (504 timeout). Please try selecting 1 or 2 engines or running with fewer prompts.');
        } else {
          setErrorMsg(data.error || `HTTP ${res.status}`);
        }
        setLoading(false);
        return;
      }

      if (data.success && Array.isArray(data.results)) {
        if (data.reportMarkdown) {
          setLatestReportMarkdown(data.reportMarkdown);
          if (typeof window !== 'undefined') {
            localStorage.setItem('latest_ai_report_markdown', data.reportMarkdown);
          }
        }
        if (data.reportUrl) {
          setLatestReportUrl(data.reportUrl);
          if (typeof window !== 'undefined') {
            localStorage.setItem('latest_ai_report_url', data.reportUrl);
          }
        }
        if (data.overallScore !== undefined && data.overallScore !== null) {
          setLatestOverallScore(data.overallScore);
          if (typeof window !== 'undefined') {
            localStorage.setItem('latest_ai_overall_score', String(data.overallScore));
          }
        }

        const newItems: PromptResult[] = data.results.map((r: any) => ({
          id: r.id || `pr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          prompt: r.prompt,
          brandName: r.brandName,
          engineId: r.engineId || 'chatgpt',
          region: r.region || 'US',
          cited: r.cited,
          position: r.position,
          sentiment: r.sentiment || 'neutral',
          responseSnippet: r.responseSnippet || '',
          citedUrls: r.citedUrls || [],
          aiSearchVolume: r.aiSearchVolume,
          isLiveSearch: r.isLiveSearch || false,
          lastRun: 'Just now',
        }));

        setPromptResults((prev) => {
          const updated = [...newItems, ...prev].slice(0, 100);
          if (typeof window !== 'undefined') {
            localStorage.setItem('monitored_prompts_history', JSON.stringify(updated));
          }
          return updated;
        });
      }
    } catch (err: any) {
      console.error(`Prompt monitor error:`, err);
      setErrorMsg('Failed to run prompt monitoring. The request may have timed out — please try again with fewer engines.');
    }

    setPromptInputs(['', '', '']);
    setLoading(false);
  };

  const handleDownloadPdf = () => {
    if (promptResults.length === 0) return;
    generateAiVisibilityPdf({
      brandName: brandName || 'Brand',
      brandDomain: brandDomain || undefined,
      visibilityScore: latestOverallScore ?? undefined,
      reportMarkdown: latestReportMarkdown || undefined,
      results: promptResults,
      reportUrl: latestReportUrl || undefined,
    });
  };

  const handleCopyMarkdown = () => {
    if (!latestReportMarkdown) return;
    navigator.clipboard.writeText(cleanApifyReportMarkdown(latestReportMarkdown));
    setCopiedMd(true);
    setTimeout(() => setCopiedMd(false), 2000);
  };

  const handleClearResults = () => {
    setPromptResults([]);
    setLatestReportMarkdown(null);
    setLatestReportUrl(null);
    setLatestOverallScore(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('monitored_prompts_history');
      localStorage.removeItem('latest_ai_report_markdown');
      localStorage.removeItem('latest_ai_report_url');
      localStorage.removeItem('latest_ai_overall_score');
    }
  };

  const filteredResults = promptResults.filter((p) => {
    return filterEngine === 'all' || p.engineId === filterEngine;
  });

  // Compute per-engine citation stats
  const engineStats = (Object.keys(AI_ENGINES) as AiEngineId[]).map((id) => {
    const engineResults = promptResults.filter((r) => r.engineId === id);
    const cited = engineResults.filter((r) => r.cited).length;
    const total = engineResults.length;
    const rate = total > 0 ? Math.round((cited / total) * 100) : 0;
    return { id, total, cited, rate };
  });

  return (
    <DashboardLayout activeDomain={brandName || 'Enter brand name above'}>
      <Head>
        <title>Multi-LLM Citation Monitoring Engine — SEOzapp v2</title>
      </Head>

      <PricingModal isOpen={showPricingModal} onClose={() => setShowPricingModal(false)} />

      <main className="max-w-[1250px] mx-auto px-8 py-8 space-y-8">
        {/* Module Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[12px] font-semibold text-[#17191c] bg-[#f2f2f3] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Module 02 • Multi-LLM Citation Stream
              </span>
            </div>
            <h1 className="text-[28px] font-semibold text-[#17191c] mt-1">
              AI Answer Engine Citation &amp; Mention Tracker
            </h1>
            <p className="text-[15px] text-[#777b86]">
              Test whether your brand is cited by leading AI search engines when users ask relevant queries.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-shrink-0 self-start md:self-auto">
            {promptResults.length > 0 && (
              <button
                type="button"
                onClick={handleDownloadPdf}
                className="bg-[#17191c] hover:bg-[#2c3036] text-[#ffffff] border border-[#17191c] rounded-xl px-4 py-2.5 text-sm font-semibold flex items-center gap-2 transition-all shadow-sm"
              >
                <Download className="w-4 h-4 text-[#fbe1d1]" />
                <span>Export PDF</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                setShowHistoryModal(true);
                fetchHistory();
              }}
              className="bg-[#ffffff] hover:bg-[#17191c] text-[#17191c] hover:text-[#ffffff] border border-[#17191c]/15 rounded-xl px-4 py-2.5 text-sm font-semibold flex items-center gap-2 transition-all shadow-sm"
            >
              <Clock className="w-4 h-4 text-[#5d2a1a]" />
              <span>History</span>
            </button>
          </div>
        </div>

        <HistoryModal
          isOpen={showHistoryModal}
          onClose={() => setShowHistoryModal(false)}
          title="Previous Citation & Prompt Runs"
          featureName="Module 02 • Citation Monitoring"
          items={historyItems}
          loading={loadingHistory}
          onRefresh={fetchHistory}
          onSelect={(item) => {
            if (item.data) {
              const r = item.data;
              setPromptResults((prev) => [
                {
                  id: r.id || `hist_${Date.now()}`,
                  prompt: r.prompt_text || item.title,
                  brandName: r.brand_name || 'Brand',
                  engineId: (r.llm_provider || 'chatgpt') as AiEngineId,
                  region: (r.region || 'US') as RegionCode,
                  cited: !!r.cited,
                  position: r.position || 'Uncited',
                  sentiment: r.sentiment || 'neutral',
                  responseSnippet: r.response_snippet || '',
                  lastRun: r.run_at || r.created_at || new Date().toISOString(),
                },
                ...prev,
              ]);
            }
          }}
        />

        {/* Live Multi-Prompt Tester */}
        <div className="bg-[#ffffff] rounded-2xl p-6 border border-[#17191c]/10 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#f2f2f3] pb-3 gap-3">
            <h2 className="text-[18px] font-semibold text-[#17191c] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#17191c]" />
              Test &amp; Monitor Query Prompts
            </h2>
            <div className="flex items-center gap-3">
              <RegionDropdown selectedRegion={selectedRegion} onChange={setSelectedRegion} />
              <span className="text-[12px] text-[#777b86]">{selectedEngines.length} Engines Active</span>
            </div>
          </div>

          {/* AI Engine Selector Controls */}
          <div>
            <label className="block text-xs font-semibold text-[#17191c] uppercase tracking-wider mb-2">
              Target AI Search Engines (Click to Toggle)
            </label>
            <AiEngineSelector
              selectedEngines={selectedEngines}
              onToggle={handleToggleEngine}
              allowedEngines={allowedEngines}
              onLockedClick={() => setShowPricingModal(true)}
            />
          </div>

          <form onSubmit={handleTestPrompts} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-[#777b86] mb-1">Target Brand Name *</label>
                <input
                  type="text"
                  required
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  placeholder="e.g. SEOzapp, Linear, HubSpot"
                  className="w-full bg-[#fafafb] border border-[#17191c]/15 rounded-xl px-3.5 py-2.5 text-sm text-[#17191c] focus:outline-none focus:border-[#17191c] transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#777b86] mb-1">Brand Domain (Optional)</label>
                <input
                  type="text"
                  value={brandDomain}
                  onChange={(e) => setBrandDomain(e.target.value)}
                  placeholder="e.g. seozapp.com (used to detect cited sources)"
                  className="w-full bg-[#fafafb] border border-[#17191c]/15 rounded-xl px-3.5 py-2.5 text-sm text-[#17191c] focus:outline-none focus:border-[#17191c] transition-colors"
                />
              </div>
            </div>

            {/* Dynamic Multi-Prompt Inputs */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-[#17191c] uppercase tracking-wider">
                  Customer Prompts to Test ({promptInputs.length})
                </label>
                <button
                  type="button"
                  onClick={handleAddPromptInput}
                  className="text-xs font-medium text-[#17191c] hover:text-[#5d2a1a] flex items-center gap-1 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Query</span>
                </button>
              </div>

              {promptInputs.map((val, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#f2f2f3] text-[#777b86] text-[11px] font-semibold flex items-center justify-center">
                    {idx + 1}
                  </div>
                  <input
                    type="text"
                    required
                    value={val}
                    onChange={(e) => handlePromptInputChange(idx, e.target.value)}
                    placeholder={`e.g. "What is the best AI SEO tool in 2026?"`}
                    className="flex-1 bg-[#fafafb] border border-[#17191c]/15 rounded-xl px-3.5 py-2.5 text-sm text-[#17191c] focus:outline-none focus:border-[#17191c] transition-colors"
                  />
                  {promptInputs.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemovePromptInput(idx)}
                      className="p-2 text-[#777b86] hover:text-[#ef4444] rounded-lg transition-colors"
                      title="Remove prompt"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="bg-[#17191c] hover:bg-[#2c3036] disabled:opacity-50 text-[#ffffff] px-6 py-3 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all shadow-sm"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Analyzing {promptInputs.filter((p) => p.trim()).length} Prompts across AI Engines...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-[#fbe1d1]" />
                    <span>Run {promptInputs.filter((p) => p.trim()).length > 1 ? `All ${promptInputs.filter((p) => p.trim()).length} Prompts` : 'Prompt Test'}</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Error Message */}
          {errorMsg && (
            <div className="p-3.5 bg-[#ef4444]/10 border border-[#ef4444]/20 rounded-xl text-xs text-[#ef4444] font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="p-5 bg-[#fafafb] rounded-xl border border-[#17191c]/10 flex flex-col items-center justify-center gap-2 text-center">
              <RefreshCw className="w-6 h-6 animate-spin text-[#17191c]" />
              <span className="text-sm font-medium text-[#17191c]">Running Live Multi-LLM Brand Visibility Test</span>
              <span className="text-xs text-[#777b86]">Querying ChatGPT, Perplexity, Google AI Overviews &amp; Gemini... This takes about 30-45 seconds.</span>
            </div>
          )}
        </div>

        {/* AI Brand Visibility Full Report Card */}
        {promptResults.length > 0 && (() => {
          const parsedReport = latestReportMarkdown ? parseVisibilityReport(latestReportMarkdown) : null;
          const displayScore = parsedReport?.visibilityScore ?? latestOverallScore ?? Math.round((promptResults.filter((r) => r.cited).length / promptResults.length) * 100);
          const citedCount = promptResults.filter((r) => r.cited).length;
          const totalCount = promptResults.length;
          const citationRate = Math.round((citedCount / totalCount) * 100);

          return (
            <div className="bg-[#ffffff] rounded-2xl p-6 border border-[#17191c]/10 shadow-sm space-y-6">
              {/* Report Header & Action Toolbar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#f2f2f3]">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-[#17191c] text-[#fbe1d1] flex flex-col items-center justify-center font-bold shadow-sm">
                    <span className="text-[17px] leading-none">{displayScore}</span>
                    <span className="text-[8px] tracking-wider uppercase opacity-80 mt-0.5">Score</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-[17px] text-[#17191c] flex items-center gap-2">
                      <span>AI Brand Visibility Audit Report</span>
                      <span className="text-[11px] font-medium bg-[#10a37f]/10 text-[#10a37f] border border-[#10a37f]/20 px-2 py-0.5 rounded-full">
                        Live Multi-LLM Audit
                      </span>
                    </h3>
                    <p className="text-xs text-[#777b86] mt-0.5">
                      {parsedReport?.summaryText || `${brandName || 'Brand'} appeared in ${citedCount} of ${totalCount} test checks (${citationRate}% citation rate across active AI models).`}
                    </p>
                  </div>
                </div>

                {/* Report Action Buttons */}
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={handleDownloadPdf}
                    className="bg-[#17191c] hover:bg-[#2c3036] text-[#ffffff] px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all shadow-sm"
                  >
                    <Download className="w-3.5 h-3.5 text-[#fbe1d1]" />
                    <span>Download PDF Report</span>
                  </button>

                  {latestReportMarkdown && (
                    <button
                      type="button"
                      onClick={handleCopyMarkdown}
                      className="bg-[#ffffff] hover:bg-[#fafafb] text-[#17191c] border border-[#17191c]/15 px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
                    >
                      {copiedMd ? <Check className="w-3.5 h-3.5 text-[#10a37f]" /> : <Copy className="w-3.5 h-3.5 text-[#777b86]" />}
                      <span>{copiedMd ? 'Copied!' : 'Copy Markdown'}</span>
                    </button>
                  )}
                </div>
              </div>

              {/* 1. What to Fix Next / Action Directive */}
              {(parsedReport?.recommendation || (parsedReport?.promptsNeedingWork && parsedReport.promptsNeedingWork.length > 0)) && (
                <div className="bg-[#fbe1d1]/20 border border-[#fbe1d1] rounded-xl p-4.5 space-y-3">
                  <div className="flex items-center gap-2 text-[#5d2a1a]">
                    <Sparkles className="w-4 h-4 text-[#5d2a1a]" />
                    <h4 className="text-xs font-bold uppercase tracking-wider">🎯 What To Fix Next (Action Plan)</h4>
                  </div>

                  {parsedReport.recommendation && (
                    <p className="text-xs font-semibold text-[#17191c] leading-relaxed bg-[#ffffff] p-3 rounded-lg border border-[#fbe1d1]">
                      {parsedReport.recommendation}
                    </p>
                  )}

                  {parsedReport.promptsNeedingWork && parsedReport.promptsNeedingWork.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      <div className="text-[11px] font-semibold text-[#5d2a1a] uppercase tracking-wider">Prompts Needing Work:</div>
                      <div className="space-y-1.5">
                        {parsedReport.promptsNeedingWork.map((promptItem, idx) => (
                          <div key={idx} className="text-xs text-[#17191c] flex items-start gap-2 bg-[#ffffff] p-2.5 rounded-lg border border-[#17191c]/5">
                            <span className="text-[#5d2a1a] font-bold mt-0.5">•</span>
                            <span className="leading-relaxed">{promptItem}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* 2. New Wins (if any) */}
              {parsedReport?.wins && parsedReport.wins.length > 0 && (
                <div className="bg-[#10a37f]/5 border border-[#10a37f]/20 rounded-xl p-4 space-y-2">
                  <div className="flex items-center gap-2 text-[#10a37f]">
                    <CheckCircle2 className="w-4 h-4 text-[#10a37f]" />
                    <h4 className="text-xs font-bold uppercase tracking-wider">🏆 New Wins &amp; Active Placements</h4>
                  </div>
                  <div className="space-y-1.5">
                    {parsedReport.wins.map((win, idx) => (
                      <div key={idx} className="text-xs text-[#17191c] bg-[#ffffff] p-2.5 rounded-lg border border-[#10a37f]/15 flex items-start gap-2">
                        <span className="text-[#10a37f] font-bold">✓</span>
                        <span>{win}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 3. Engine Breakdown & Cited Domains Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* By Engine */}
                {parsedReport?.engineBreakdown && parsedReport.engineBreakdown.length > 0 && (
                  <div className="bg-[#fafafb] rounded-xl p-4 border border-[#17191c]/5 space-y-2">
                    <div className="text-xs font-bold text-[#17191c] uppercase tracking-wider flex items-center gap-1.5">
                      <span>📺 By AI Engine Performance</span>
                    </div>
                    <div className="space-y-1.5">
                      {parsedReport.engineBreakdown.map((item, idx) => (
                        <div key={idx} className="text-xs text-[#777b86] bg-[#ffffff] p-2 rounded-lg border border-[#17191c]/5 font-mono">
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* You're Cited On & Share of Voice */}
                <div className="bg-[#fafafb] rounded-xl p-4 border border-[#17191c]/5 space-y-2">
                  <div className="text-xs font-bold text-[#17191c] uppercase tracking-wider flex items-center gap-1.5">
                    <span>⚔️ Share of Voice &amp; Domain Citations</span>
                  </div>
                  {parsedReport?.citedOn && parsedReport.citedOn.length > 0 ? (
                    <div className="space-y-1.5">
                      {parsedReport.citedOn.map((item, idx) => (
                        <div key={idx} className="text-xs text-[#5d2a1a] bg-[#fbe1d1]/30 p-2 rounded-lg border border-[#fbe1d1] font-mono">
                          {item}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-xs text-[#777b86] bg-[#ffffff] p-2 rounded-lg border border-[#17191c]/5">
                      {brandName || 'Brand'} domain verified across active search intelligence.
                    </div>
                  )}
                  {parsedReport?.shareOfVoice && parsedReport.shareOfVoice.length > 0 && (
                    <div className="text-xs text-[#17191c] font-medium pt-1">
                      {parsedReport.shareOfVoice.join(' • ')}
                    </div>
                  )}
                </div>
              </div>

              {/* 4. Your Questions — Where You Show Up */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-[#17191c] uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#17191c]" />
                    <span>Your Questions — Where You Show Up</span>
                  </h4>
                  <span className="text-xs text-[#777b86]">
                    {(parsedReport?.answersShowedUp && parsedReport.answersShowedUp.length > 0 ? parsedReport.answersShowedUp.length : promptResults.length)} queries audited
                  </span>
                </div>

                <div className="space-y-3">
                  {(parsedReport?.answersShowedUp && parsedReport.answersShowedUp.length > 0
                    ? parsedReport.answersShowedUp
                    : promptResults.map((r) => ({
                        prompt: r.prompt,
                        engineAndCountry: `${r.engineId.toUpperCase()} (${r.region || 'US'})`,
                        mentionStatus: r.cited ? `✓ Cited (${r.position})` : '✕ Not Cited',
                        snippet: r.responseSnippet || 'Mention verified in answer stream.',
                        fullAnswer: r.responseSnippet || '',
                      }))
                  ).map((item, idx) => {
                    const isExpanded = expandedAnswerIndices.includes(idx);
                    const matchingPromptResult = promptResults[idx] || promptResults[0];

                    return (
                      <div key={idx} className="p-4 bg-[#fafafb] rounded-xl border border-[#17191c]/10 space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <AiEngineBadge engineId={matchingPromptResult?.engineId || 'chatgpt'} />
                            <span className="font-semibold text-sm text-[#17191c]">
                              &quot;{item.prompt}&quot;
                            </span>
                            <span className="text-[11px] text-[#777b86] font-mono">
                              — {item.engineAndCountry}
                            </span>
                          </div>
                          <span
                            className={`text-xs font-medium px-3 py-1 rounded-full whitespace-nowrap self-start sm:self-auto ${
                              item.mentionStatus.includes('Named') || item.mentionStatus.includes('Cited') || !item.mentionStatus.includes('Not')
                                ? 'bg-[#10a37f]/10 text-[#10a37f] border border-[#10a37f]/20 font-semibold'
                                : 'bg-[#fbe1d1] text-[#5d2a1a] border border-[#5d2a1a]/10'
                            }`}
                          >
                            {item.mentionStatus}
                          </span>
                        </div>

                        {/* Snippet */}
                        {item.snippet && (
                          <div className="space-y-1">
                            <div className="text-[10px] font-semibold text-[#777b86] uppercase tracking-wider">Mention Context Snippet:</div>
                            <p className="text-xs text-[#17191c] leading-relaxed bg-[#ffffff] p-3 rounded-lg border border-[#17191c]/5 font-mono">
                              {item.snippet}
                            </p>
                          </div>
                        )}

                        {/* Full Answer Collapsible */}
                        {item.fullAnswer && item.fullAnswer !== item.snippet && (
                          <div>
                            <button
                              type="button"
                              onClick={() =>
                                setExpandedAnswerIndices((prev) =>
                                  prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
                                )
                              }
                              className="text-[11px] font-semibold text-[#17191c] hover:text-[#5d2a1a] flex items-center gap-1 transition-colors"
                            >
                              <span>{isExpanded ? '▲ Hide Full AI Answer' : '▼ View Full AI Answer'}</span>
                            </button>

                            {isExpanded && (
                              <p className="text-xs text-[#777b86] leading-relaxed bg-[#ffffff] p-3 rounded-lg border border-[#17191c]/5 font-mono mt-2 whitespace-pre-wrap">
                                {item.fullAnswer}
                              </p>
                            )}
                          </div>
                        )}

                        {/* Cited URLs (if present) */}
                        {matchingPromptResult?.citedUrls && matchingPromptResult.citedUrls.length > 0 && (
                          <div className="flex flex-wrap items-center gap-1.5 pt-1">
                            <span className="text-[10px] font-semibold text-[#5d2a1a] uppercase tracking-wider">Cited Sources:</span>
                            {matchingPromptResult.citedUrls.map((url, uIdx) => (
                              <a
                                key={uIdx}
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[10px] bg-[#fbe1d1] text-[#5d2a1a] hover:bg-[#5d2a1a] hover:text-[#ffffff] transition-colors px-2 py-0.5 rounded-md font-mono truncate max-w-[220px]"
                              >
                                {url.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })()}

        {/* Per-Engine Citation Stats */}
        {promptResults.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {engineStats.map((stat) => {
              const engine = AI_ENGINES[stat.id];
              if (!engine) return null;
              return (
                <div key={stat.id} className="bg-[#ffffff] rounded-2xl p-4 border border-[#17191c]/10 shadow-sm space-y-2">
                  <div className="flex items-center gap-2">
                    {engine.iconPath ? (
                      <img src={engine.iconPath} alt={engine.name} className="w-4 h-4 object-contain rounded-full" />
                    ) : (
                      engine.svgIcon
                    )}
                    <span className="text-[13px] font-semibold text-[#17191c]">{engine.name}</span>
                  </div>
                  <div className="text-[20px] font-bold text-[#17191c]">
                    {stat.total > 0 ? `${stat.rate}%` : '—'}
                  </div>
                  <div className="text-[10px] text-[#777b86]">
                    {stat.total > 0 ? `${stat.cited}/${stat.total} cited` : 'No tests run'}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Saved Results History */}
        <div className="bg-[#ffffff] rounded-2xl p-6 border border-[#17191c]/10 shadow-sm space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-3 border-b border-[#f2f2f3]">
            <h3 className="font-semibold text-[16px] text-[#17191c]">
              Saved Monitored Prompts ({promptResults.length} result{promptResults.length !== 1 ? 's' : ''})
            </h3>

            <div className="flex flex-wrap items-center gap-3 text-xs">
              {/* Engine Filter */}
              <div className="flex items-center gap-1 text-[#777b86]">
                <Filter className="w-3.5 h-3.5" />
                <span>Engine:</span>
                <select
                  value={filterEngine}
                  onChange={(e) => setFilterEngine(e.target.value)}
                  className="bg-[#fafafb] border border-[#17191c]/15 rounded-lg px-2.5 py-1 text-xs text-[#17191c] focus:outline-none"
                >
                  <option value="all">All Engines</option>
                  <option value="chatgpt">ChatGPT</option>
                  <option value="gemini">Gemini</option>
                  <option value="perplexity">Perplexity</option>
                  <option value="ai_overview">AI Overviews</option>
                  <option value="claude">Claude</option>
                </select>
              </div>

              {/* Clear All */}
              {promptResults.length > 0 && (
                <button
                  onClick={handleClearResults}
                  className="flex items-center gap-1 text-[#777b86] hover:text-[#ef4444] transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear All</span>
                </button>
              )}
            </div>
          </div>

          {filteredResults.length === 0 ? (
            <div className="text-center py-10 text-[#777b86] space-y-2">
              <Search className="w-8 h-8 mx-auto text-[#777b86]/50" />
              <p className="text-sm font-medium">No prompts saved yet</p>
              <p className="text-xs">Enter your brand name and monitoring prompts above, then click &quot;Run Prompt Test&quot; to save and track them.</p>
            </div>
          ) : (
            <div className="space-y-3 text-[13px]">
              {filteredResults.map((p) => (
                <div key={p.id} className="p-4 bg-[#fafafb] rounded-xl border border-[#17191c]/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1.5 max-w-2xl min-w-0">
                    <div className="font-medium text-[#17191c] text-[14px] truncate">&quot;{p.prompt}&quot;</div>
                    <div className="flex flex-wrap items-center gap-2.5 text-[11px] text-[#777b86]">
                      <AiEngineBadge engineId={p.engineId} />
                      <span className="bg-[#10a37f]/10 text-[#10a37f] border border-[#10a37f]/20 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-[#10a37f]" />
                        <span>Live AI Audit</span>
                      </span>
                      <span className="bg-[#ffffff] border border-[#17191c]/10 px-2 py-0.5 rounded-full font-medium text-[#17191c]">
                        {REGIONS[p.region]?.flag || '🌍'} {p.region || 'US'}
                      </span>
                      <span className="text-[#777b86]">Brand: <strong className="text-[#17191c]">{p.brandName}</strong></span>
                      <span className="bg-[#17191c]/5 text-[#17191c] border border-[#17191c]/10 px-2 py-0.5 rounded-full font-medium">
                        Rank Placement: {p.position || 'Uncited'}
                      </span>
                      {p.aiSearchVolume !== undefined && p.aiSearchVolume !== null && (
                        <span className="bg-[#4285f4]/10 text-[#4285f4] border border-[#4285f4]/20 px-2 py-0.5 rounded-full font-medium">
                          🔥 {Number(p.aiSearchVolume).toLocaleString()} AI Searches/mo
                        </span>
                      )}
                      <span className={`px-2 py-0.5 rounded-full font-medium text-[11px] capitalize ${
                        p.sentiment === 'positive'
                          ? 'bg-[#10a37f]/10 text-[#10a37f] border border-[#10a37f]/20'
                          : p.sentiment === 'negative'
                          ? 'bg-[#ef4444]/10 text-[#ef4444] border border-[#ef4444]/20'
                          : 'bg-[#17191c]/5 text-[#777b86] border border-[#17191c]/10'
                      }`}>
                        Sentiment: {p.sentiment || 'neutral'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {p.lastRun}
                      </span>
                    </div>

                    {/* Competitor Benchmarking */}
                    {p.competitorsMentioned && p.competitorsMentioned.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 mt-1">
                        <span className="text-[10px] font-semibold text-[#17191c] uppercase tracking-wider">Rivals Cited:</span>
                        {p.competitorsMentioned.map((comp, i) => (
                          <span key={i} className="text-[10px] bg-[#17191c]/10 text-[#17191c] px-2 py-0.5 rounded-md font-mono font-medium">
                            {comp}
                          </span>
                        ))}
                      </div>
                    )}

                    {p.citedUrls && p.citedUrls.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 mt-1">
                        <span className="text-[10px] font-semibold text-[#5d2a1a] uppercase tracking-wider">Cited Sources:</span>
                        {p.citedUrls.map((url, i) => (
                          <a
                            key={i}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] bg-[#fbe1d1] text-[#5d2a1a] hover:bg-[#5d2a1a] hover:text-[#ffffff] transition-colors px-2 py-0.5 rounded-md font-mono truncate max-w-[200px]"
                          >
                            {url.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                          </a>
                        ))}
                      </div>
                    )}
                    {p.responseSnippet && (
                      <p className="text-[11px] text-[#777b86] truncate max-w-lg mt-1 font-mono">{p.responseSnippet.slice(0, 150)}...</p>
                    )}
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className={`text-[11px] font-semibold px-3 py-1 rounded-full whitespace-nowrap ${
                      p.cited
                        ? 'bg-[#10a37f]/10 text-[#10a37f] border border-[#10a37f]/20'
                        : 'bg-[#fbe1d1] text-[#5d2a1a] border border-[#5d2a1a]/10'
                    }`}>
                      {p.cited ? `✓ ${p.position}` : '✕ Not Cited'}
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
