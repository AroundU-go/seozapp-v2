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
  Target,
  Award,
  ShieldCheck,
  Layers,
  Globe,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Flame,
  ArrowUpRight,
  BarChart3,
  Bot,
  Lightbulb,
  Zap,
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
          const citationRate = totalCount > 0 ? Math.round((citedCount / totalCount) * 100) : 0;

          // Score status tier
          const scoreTier = displayScore >= 75
            ? { label: 'Dominant Exposure', color: 'text-[#10a37f]', bg: 'bg-[#10a37f]/10', border: 'border-[#10a37f]/20', badge: 'Tier 1 • High AI Visibility' }
            : displayScore >= 50
            ? { label: 'Moderate Visibility', color: 'text-[#d97706]', bg: 'bg-[#f59e0b]/10', border: 'border-[#d97706]/20', badge: 'Tier 2 • Growing Exposure' }
            : { label: 'Action Required', color: 'text-[#5d2a1a]', bg: 'bg-[#fbe1d1]', border: 'border-[#5d2a1a]/20', badge: 'Tier 3 • Under-Indexed' };

          const auditedQueries = (parsedReport?.answersShowedUp && parsedReport.answersShowedUp.length > 0)
            ? parsedReport.answersShowedUp
            : promptResults.map((r) => ({
                prompt: r.prompt,
                engineAndCountry: `${r.engineId.toUpperCase()} (${r.region || 'US'})`,
                mentionStatus: r.cited ? `✓ Cited (${r.position || 'Top 3'})` : '✕ Not Cited',
                snippet: r.responseSnippet || 'Mention verified in AI answer stream.',
                fullAnswer: r.responseSnippet || '',
              }));

          return (
            <div className="bg-[#ffffff] rounded-3xl p-6 sm:p-8 border border-[#17191c]/10 shadow-sm space-y-8 relative overflow-hidden">
              {/* Decorative Ambient Top Bar */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#17191c] via-[#5d2a1a] to-[#10a37f]" />

              {/* 1. Report Header & Action Toolbar */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-[#f2f2f3]">
                {/* Score & Title Group */}
                <div className="flex items-start sm:items-center gap-4 sm:gap-5">
                  {/* Circular Radial Score Badge */}
                  <div className="flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-[#17191c] to-[#2c3036] text-[#ffffff] flex flex-col items-center justify-center font-bold shadow-md border border-[#17191c]/20 relative">
                    <span className="text-2xl sm:text-3xl font-black text-[#fbe1d1] leading-none tracking-tight">
                      {displayScore}
                    </span>
                    <span className="text-[9px] uppercase tracking-widest text-[#777b86] font-semibold mt-0.5">
                      / 100
                    </span>
                    <div className="absolute -bottom-2 bg-[#fbe1d1] text-[#5d2a1a] text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full shadow-xs">
                      SCORE
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-signifier text-2xl sm:text-3xl font-normal text-[#17191c] tracking-tight flex items-center gap-2">
                        <span>AI Brand Visibility Audit Report</span>
                      </h3>
                      <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${scoreTier.bg} ${scoreTier.color} ${scoreTier.border} flex items-center gap-1`}>
                        <Sparkles className="w-3 h-3" />
                        <span>{scoreTier.badge}</span>
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5 text-xs text-[#777b86]">
                      <span className="bg-[#10a37f]/10 text-[#10a37f] border border-[#10a37f]/20 px-2.5 py-0.5 rounded-full font-medium flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#10a37f] animate-pulse" />
                        Live Multi-LLM Audit
                      </span>
                      <span>Target Brand: <strong className="text-[#17191c] font-semibold">{brandName || 'Target Brand'}</strong> {brandDomain ? `(${brandDomain})` : ''}</span>
                      <span>•</span>
                      <span>Region: <strong className="text-[#17191c] font-medium">{REGIONS[selectedRegion]?.flag || '🌍'} {selectedRegion}</strong></span>
                      <span>•</span>
                      <span>{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>

                    <p className="text-xs sm:text-sm text-[#777b86] leading-relaxed max-w-2xl pt-1">
                      {parsedReport?.summaryText || `${brandName || 'Brand'} appeared in ${citedCount} of ${totalCount} tested queries (${citationRate}% citation rate across active AI models).`}
                    </p>
                  </div>
                </div>

                {/* Report Action Buttons */}
                <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 self-start lg:self-center">
                  <button
                    type="button"
                    onClick={handleDownloadPdf}
                    className="bg-[#17191c] hover:bg-[#2c3036] text-[#ffffff] px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all shadow-sm hover:scale-[1.01] active:scale-[0.99]"
                  >
                    <Download className="w-4 h-4 text-[#fbe1d1]" />
                    <span>Download PDF Report</span>
                  </button>

                  {latestReportMarkdown && (
                    <button
                      type="button"
                      onClick={handleCopyMarkdown}
                      className="bg-[#fafafb] hover:bg-[#f2f2f3] text-[#17191c] border border-[#17191c]/15 px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs"
                    >
                      {copiedMd ? <Check className="w-4 h-4 text-[#10a37f]" /> : <Copy className="w-4 h-4 text-[#777b86]" />}
                      <span>{copiedMd ? 'Copied Markdown' : 'Copy Markdown'}</span>
                    </button>
                  )}
                </div>
              </div>

              {/* 2. Executive 4-Bento KPI Summary Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Metric 1: Overall Visibility Score */}
                <div className="bg-[#fafafb] border border-[#17191c]/10 rounded-2xl p-4.5 space-y-2 relative overflow-hidden">
                  <div className="flex items-center justify-between text-xs text-[#777b86] font-medium">
                    <span className="flex items-center gap-1.5">
                      <TrendingUp className="w-4 h-4 text-[#17191c]" />
                      <span>AI Visibility Score</span>
                    </span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${scoreTier.bg} ${scoreTier.color}`}>
                      {displayScore >= 70 ? 'Optimal' : 'Needs Focus'}
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-[#17191c] tracking-tight">{displayScore}</span>
                    <span className="text-xs text-[#777b86] font-medium">/ 100</span>
                  </div>
                  <div className="w-full bg-[#17191c]/10 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${
                        displayScore >= 75 ? 'bg-[#10a37f]' : displayScore >= 50 ? 'bg-[#d97706]' : 'bg-[#5d2a1a]'
                      }`}
                      style={{ width: `${Math.min(displayScore, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Metric 2: Citation Conversion Rate */}
                <div className="bg-[#fafafb] border border-[#17191c]/10 rounded-2xl p-4.5 space-y-2">
                  <div className="flex items-center justify-between text-xs text-[#777b86] font-medium">
                    <span className="flex items-center gap-1.5">
                      <Target className="w-4 h-4 text-[#10a37f]" />
                      <span>Citation Rate</span>
                    </span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#10a37f]/10 text-[#10a37f]">
                      {citedCount}/{totalCount} Cited
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-[#17191c] tracking-tight">{citationRate}%</span>
                    <span className="text-xs text-[#777b86] font-medium">in AI answers</span>
                  </div>
                  <div className="w-full bg-[#17191c]/10 rounded-full h-2 overflow-hidden flex">
                    <div className="bg-[#10a37f] h-2 transition-all duration-500" style={{ width: `${citationRate}%` }} />
                    <div className="bg-[#fbe1d1] h-2 transition-all duration-500" style={{ width: `${100 - citationRate}%` }} />
                  </div>
                </div>

                {/* Metric 3: Multi-Model Audit Coverage */}
                <div className="bg-[#fafafb] border border-[#17191c]/10 rounded-2xl p-4.5 space-y-2">
                  <div className="flex items-center justify-between text-xs text-[#777b86] font-medium">
                    <span className="flex items-center gap-1.5">
                      <Bot className="w-4 h-4 text-[#17191c]" />
                      <span>Engines Tested</span>
                    </span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#17191c]/10 text-[#17191c]">
                      {selectedEngines.length} Models
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 pt-1">
                    {selectedEngines.map((id) => {
                      const eng = AI_ENGINES[id];
                      return (
                        <div key={id} className="w-7 h-7 rounded-lg bg-[#ffffff] border border-[#17191c]/10 flex items-center justify-center shadow-xs" title={eng?.name}>
                          {eng?.iconPath ? (
                            <img src={eng.iconPath} alt={eng.name} className="w-4 h-4 object-contain rounded-full" />
                          ) : (
                            <span className="text-xs">{eng?.svgIcon}</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <p className="text-[11px] text-[#777b86] truncate">
                    {selectedEngines.map((id) => AI_ENGINES[id]?.name).join(', ')}
                  </p>
                </div>

                {/* Metric 4: Brand Share of Voice / Status */}
                <div className="bg-[#fafafb] border border-[#17191c]/10 rounded-2xl p-4.5 space-y-2">
                  <div className="flex items-center justify-between text-xs text-[#777b86] font-medium">
                    <span className="flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-[#5d2a1a]" />
                      <span>Share of Voice</span>
                    </span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#fbe1d1] text-[#5d2a1a]">
                      Verified
                    </span>
                  </div>
                  <div className="text-lg font-bold text-[#17191c] truncate pt-0.5">
                    {parsedReport?.shareOfVoice && parsedReport.shareOfVoice.length > 0
                      ? parsedReport.shareOfVoice[0]
                      : `${citationRate}% Presence`}
                  </div>
                  <p className="text-[11px] text-[#777b86] flex items-center gap-1">
                    <Globe className="w-3 h-3 text-[#777b86]" />
                    <span>{brandDomain || `${brandName}.com`} verified</span>
                  </p>
                </div>
              </div>

              {/* 3. Priority Action Plan / What to Fix Next */}
              {(parsedReport?.recommendation || (parsedReport?.promptsNeedingWork && parsedReport.promptsNeedingWork.length > 0)) && (
                <div className="bg-gradient-to-br from-[#fff9f6] via-[#ffffff] to-[#fbe1d1]/25 border-2 border-[#fbe1d1] rounded-2xl p-6 shadow-xs space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#fbe1d1]/60 pb-3">
                    <div className="flex items-center gap-2.5 text-[#5d2a1a]">
                      <div className="w-7 h-7 rounded-lg bg-[#fbe1d1] flex items-center justify-center text-[#5d2a1a]">
                        <Lightbulb className="w-4 h-4" />
                      </div>
                      <h4 className="text-sm font-bold uppercase tracking-wider text-[#5d2a1a]">
                        Priority Action Directive (What To Fix Next)
                      </h4>
                    </div>
                    <span className="text-[11px] font-semibold bg-[#5d2a1a] text-[#ffffff] px-2.5 py-0.5 rounded-full self-start sm:self-auto">
                      High Impact
                    </span>
                  </div>

                  {parsedReport.recommendation && (
                    <div className="bg-[#ffffff] p-4 rounded-xl border border-[#fbe1d1] shadow-xs space-y-1">
                      <div className="text-[11px] font-bold uppercase tracking-wider text-[#5d2a1a] flex items-center gap-1.5">
                        <Flame className="w-3.5 h-3.5 text-[#d97706]" />
                        <span>Recommended Focus:</span>
                      </div>
                      <p className="text-xs sm:text-sm font-medium text-[#17191c] leading-relaxed">
                        {parsedReport.recommendation}
                      </p>
                    </div>
                  )}

                  {parsedReport.promptsNeedingWork && parsedReport.promptsNeedingWork.length > 0 && (
                    <div className="space-y-2.5 pt-1">
                      <div className="text-[11px] font-bold text-[#5d2a1a] uppercase tracking-wider flex items-center gap-1.5">
                        <span>Uncited Queries Needing Optimization ({parsedReport.promptsNeedingWork.length}):</span>
                      </div>
                      <div className="grid grid-cols-1 gap-2.5">
                        {parsedReport.promptsNeedingWork.map((promptItem, idx) => (
                          <div key={idx} className="text-xs text-[#17191c] bg-[#ffffff] p-3.5 rounded-xl border border-[#17191c]/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-xs hover:border-[#fbe1d1] transition-colors">
                            <div className="flex items-start gap-2.5 min-w-0">
                              <span className="w-5 h-5 rounded-full bg-[#fbe1d1] text-[#5d2a1a] font-bold text-[11px] flex items-center justify-center flex-shrink-0 mt-0.5">
                                {idx + 1}
                              </span>
                              <span className="font-medium text-[13px] leading-relaxed text-[#17191c]">&quot;{promptItem}&quot;</span>
                            </div>
                            <span className="text-[10px] font-semibold bg-[#fafafb] text-[#777b86] border border-[#17191c]/10 px-2.5 py-1 rounded-lg self-start sm:self-auto flex items-center gap-1 flex-shrink-0">
                              <Zap className="w-3 h-3 text-[#d97706]" />
                              <span>Add comparison / FAQ schema</span>
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* 4. New Wins & Verified Placements */}
              {parsedReport?.wins && parsedReport.wins.length > 0 && (
                <div className="bg-gradient-to-br from-[#f0fdf4] via-[#ffffff] to-[#10a37f]/5 border border-[#10a37f]/30 rounded-2xl p-6 shadow-xs space-y-4">
                  <div className="flex items-center justify-between border-b border-[#10a37f]/20 pb-3">
                    <div className="flex items-center gap-2.5 text-[#10a37f]">
                      <div className="w-7 h-7 rounded-lg bg-[#10a37f]/10 flex items-center justify-center text-[#10a37f]">
                        <Award className="w-4 h-4" />
                      </div>
                      <h4 className="text-sm font-bold uppercase tracking-wider text-[#10a37f]">
                        Verified Placements &amp; Citation Wins
                      </h4>
                    </div>
                    <span className="text-[11px] font-semibold bg-[#10a37f]/10 text-[#10a37f] border border-[#10a37f]/20 px-2.5 py-0.5 rounded-full">
                      {parsedReport.wins.length} Active {parsedReport.wins.length === 1 ? 'Win' : 'Wins'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {parsedReport.wins.map((win, idx) => (
                      <div key={idx} className="text-xs text-[#17191c] bg-[#ffffff] p-3.5 rounded-xl border border-[#10a37f]/20 flex items-start gap-2.5 shadow-xs">
                        <CheckCircle2 className="w-4 h-4 text-[#10a37f] flex-shrink-0 mt-0.5" />
                        <span className="font-medium leading-relaxed">{win}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 5. Engine Breakdown & Cited Authority Sources (2-Column Bento) */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* By Engine Breakdown */}
                <div className="bg-[#fafafb] rounded-2xl p-5 border border-[#17191c]/10 space-y-4">
                  <div className="flex items-center justify-between border-b border-[#17191c]/5 pb-3">
                    <h4 className="text-xs font-bold text-[#17191c] uppercase tracking-wider flex items-center gap-2">
                      <Bot className="w-4 h-4 text-[#17191c]" />
                      <span>By AI Engine Performance</span>
                    </h4>
                    <span className="text-[11px] text-[#777b86]">Citation Rate</span>
                  </div>

                  {parsedReport?.engineBreakdown && parsedReport.engineBreakdown.length > 0 ? (
                    <div className="space-y-2.5">
                      {parsedReport.engineBreakdown.map((item, idx) => {
                        const parts = item.split(':');
                        const engineLabel = parts[0] || item;
                        const valueText = parts.slice(1).join(':').trim();
                        const percentMatch = valueText.match(/(\d+)%/);
                        const pct = percentMatch ? parseInt(percentMatch[1], 10) : 50;

                        return (
                          <div key={idx} className="bg-[#ffffff] p-3 rounded-xl border border-[#17191c]/5 space-y-1.5 shadow-xs">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-semibold text-[#17191c]">{engineLabel}</span>
                              <span className="font-mono font-bold text-[#17191c]">{valueText || `${pct}%`}</span>
                            </div>
                            <div className="w-full bg-[#17191c]/10 rounded-full h-1.5 overflow-hidden">
                              <div
                                className={`h-1.5 rounded-full ${
                                  pct >= 70 ? 'bg-[#10a37f]' : pct >= 40 ? 'bg-[#d97706]' : 'bg-[#5d2a1a]'
                                }`}
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {selectedEngines.map((id) => {
                        const eng = AI_ENGINES[id];
                        const count = promptResults.filter((r) => r.engineId === id).length;
                        const cited = promptResults.filter((r) => r.engineId === id && r.cited).length;
                        const pct = count > 0 ? Math.round((cited / count) * 100) : 0;

                        return (
                          <div key={id} className="bg-[#ffffff] p-3 rounded-xl border border-[#17191c]/5 flex items-center justify-between text-xs shadow-xs">
                            <div className="flex items-center gap-2">
                              <AiEngineBadge engineId={id} />
                            </div>
                            <span className="font-bold text-[#17191c]">{cited}/{count} ({pct}%)</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Share of Voice & Cited Authority Domains */}
                <div className="bg-[#fafafb] rounded-2xl p-5 border border-[#17191c]/10 space-y-4">
                  <div className="flex items-center justify-between border-b border-[#17191c]/5 pb-3">
                    <h4 className="text-xs font-bold text-[#17191c] uppercase tracking-wider flex items-center gap-2">
                      <Layers className="w-4 h-4 text-[#5d2a1a]" />
                      <span>Authority Sources &amp; Domain Citations</span>
                    </h4>
                    <span className="text-[11px] text-[#777b86]">Verified Placements</span>
                  </div>

                  {parsedReport?.citedOn && parsedReport.citedOn.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {parsedReport.citedOn.map((item, idx) => (
                        <div key={idx} className="text-xs text-[#5d2a1a] bg-[#fbe1d1]/40 border border-[#fbe1d1] px-3 py-1.5 rounded-xl font-medium flex items-center gap-1.5 shadow-xs">
                          <Globe className="w-3.5 h-3.5 text-[#5d2a1a]" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-[#ffffff] p-4 rounded-xl border border-[#17191c]/5 text-xs text-[#777b86] leading-relaxed shadow-xs">
                      <p className="font-medium text-[#17191c] mb-1">
                        Domain Authority Verified
                      </p>
                      <p>
                        {brandDomain || `${brandName || 'Brand'}.com`} is indexed across active AI search intelligence datasets.
                      </p>
                    </div>
                  )}

                  {parsedReport?.shareOfVoice && parsedReport.shareOfVoice.length > 0 && (
                    <div className="bg-[#ffffff] p-3 rounded-xl border border-[#17191c]/5 text-xs text-[#17191c] font-medium space-y-1 shadow-xs">
                      <div className="text-[10px] font-bold text-[#777b86] uppercase tracking-wider">Share of Voice Breakdown:</div>
                      <div className="text-xs text-[#17191c] leading-relaxed">
                        {parsedReport.shareOfVoice.join(' • ')}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* 6. Audited Questions & Live AI Answers Stream */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between border-b border-[#f2f2f3] pb-3">
                  <h4 className="text-sm font-bold text-[#17191c] uppercase tracking-wider flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-[#17191c]" />
                    <span>Audited Questions &amp; Live AI Answers ({auditedQueries.length})</span>
                  </h4>
                  <span className="text-xs text-[#777b86] font-medium">
                    Click to inspect full AI context
                  </span>
                </div>

                <div className="space-y-3.5">
                  {auditedQueries.map((item, idx) => {
                    const isExpanded = expandedAnswerIndices.includes(idx);
                    const matchingPromptResult = promptResults[idx] || promptResults[0];
                    const isCited = item.mentionStatus.includes('Named') || item.mentionStatus.includes('Cited') || !item.mentionStatus.includes('Not');

                    return (
                      <div
                        key={idx}
                        className={`p-5 rounded-2xl border transition-all duration-200 space-y-3.5 ${
                          isCited
                            ? 'bg-[#ffffff] border-[#10a37f]/25 shadow-xs hover:border-[#10a37f]/40'
                            : 'bg-[#fafafb] border-[#17191c]/10 hover:border-[#17191c]/25'
                        }`}
                      >
                        {/* Header: Prompt & Meta Badges */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex flex-wrap items-center gap-2">
                            <AiEngineBadge engineId={matchingPromptResult?.engineId || 'chatgpt'} />
                            <span className="font-semibold text-sm sm:text-base text-[#17191c]">
                              &quot;{item.prompt}&quot;
                            </span>
                            <span className="text-xs text-[#777b86] font-mono">
                              — {item.engineAndCountry}
                            </span>
                          </div>

                          <span
                            className={`text-xs font-semibold px-3 py-1 rounded-full whitespace-nowrap self-start sm:self-auto flex items-center gap-1.5 ${
                              isCited
                                ? 'bg-[#10a37f]/10 text-[#10a37f] border border-[#10a37f]/20'
                                : 'bg-[#fbe1d1] text-[#5d2a1a] border border-[#5d2a1a]/20'
                            }`}
                          >
                            {isCited ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                            <span>{item.mentionStatus}</span>
                          </span>
                        </div>

                        {/* Mention Context Snippet Quote */}
                        {item.snippet && (
                          <div className="bg-[#fafafb] p-3.5 rounded-xl border border-[#17191c]/5 space-y-1">
                            <div className="text-[10px] font-bold text-[#777b86] uppercase tracking-wider flex items-center gap-1">
                              <Sparkles className="w-3 h-3 text-[#10a37f]" />
                              <span>Live AI Mention Context:</span>
                            </div>
                            <p className="text-xs sm:text-sm text-[#17191c] leading-relaxed font-sans italic border-l-2 border-[#10a37f] pl-3 py-0.5">
                              &ldquo;{item.snippet}&rdquo;
                            </p>
                          </div>
                        )}

                        {/* Full Answer Collapsible */}
                        {item.fullAnswer && item.fullAnswer !== item.snippet && (
                          <div className="pt-1">
                            <button
                              type="button"
                              onClick={() =>
                                setExpandedAnswerIndices((prev) =>
                                  prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
                                )
                              }
                              className="text-xs font-semibold text-[#17191c] hover:text-[#5d2a1a] flex items-center gap-1.5 transition-colors"
                            >
                              <span>{isExpanded ? '▲ Hide Full AI Answer' : '▼ View Full AI Answer'}</span>
                              {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                            </button>

                            {isExpanded && (
                              <div className="mt-2.5 p-4 rounded-xl bg-[#ffffff] border border-[#17191c]/10 text-xs text-[#777b86] font-mono leading-relaxed whitespace-pre-wrap max-h-96 overflow-y-auto">
                                {item.fullAnswer}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Cited URLs / Source Chips */}
                        {matchingPromptResult?.citedUrls && matchingPromptResult.citedUrls.length > 0 && (
                          <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-[#17191c]/5">
                            <span className="text-[10px] font-bold text-[#5d2a1a] uppercase tracking-wider flex items-center gap-1">
                              <ExternalLink className="w-3 h-3" />
                              <span>Cited Sources:</span>
                            </span>
                            {matchingPromptResult.citedUrls.map((url, uIdx) => (
                              <a
                                key={uIdx}
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[10px] bg-[#fbe1d1]/50 text-[#5d2a1a] hover:bg-[#5d2a1a] hover:text-[#ffffff] transition-colors px-2.5 py-1 rounded-md font-mono flex items-center gap-1 truncate max-w-[240px]"
                              >
                                <span>{url.replace(/^https?:\/\//, '').replace(/\/$/, '')}</span>
                                <ArrowUpRight className="w-2.5 h-2.5" />
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
