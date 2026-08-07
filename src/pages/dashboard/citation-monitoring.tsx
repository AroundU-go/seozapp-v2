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
  isLiveSearch?: boolean;
}

import { HistoryModal, HistoryItem } from '@/components/dashboard/HistoryModal';

export default function CitationMonitoringPage() {
  const { user } = useAuth();
  
  // History Modal State
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [showPricingModal, setShowPricingModal] = useState(false);

  const isAdmin = user?.email?.endsWith('@aroundu.com') || user?.email === 'go.aroundu@gmail.com';
  const isPro = true;

  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
      const emailParam = user?.email ? `userEmail=${encodeURIComponent(user.email)}` : '';
      const brandParam = brandName ? `brandName=${encodeURIComponent(brandName)}` : '';
      const queryStr = [emailParam, brandParam].filter(Boolean).join('&');

      const res = await fetch(`/api/v2/prompt-monitor?${queryStr}`);
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
  
  // Multi-prompt inputs array
  const [promptInputs, setPromptInputs] = useState<string[]>(['']);
  const [brandName, setBrandName] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState<RegionCode>('US');
  const [selectedEngines, setSelectedEngines] = useState<AiEngineId[]>(['chatgpt', 'gemini', 'perplexity', 'ai_overview']);
  const [filterEngine, setFilterEngine] = useState<string>('all');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Persistent prompt results stream
  const [promptResults, setPromptResults] = useState<PromptResult[]>([]);

  // Load domain/brand & history on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedBrand = localStorage.getItem('pending_brand_name');
      const storedDomain = localStorage.getItem('tracked_domain');
      if (storedBrand) {
        setBrandName(storedBrand);
      } else if (storedDomain) {
        setBrandName(storedDomain.split('.')[0]);
      }

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
        const brandParam = brandName ? `brandName=${encodeURIComponent(brandName)}` : '';
        const queryStr = [emailParam, brandParam].filter(Boolean).join('&');

        const res = await fetch(`/api/v2/prompt-monitor?${queryStr}`);
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
  }, [user, brandName]);

  const handleToggleEngine = (id: AiEngineId) => {
    setSelectedEngines((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
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

    if (validPrompts.length === 0 || !brandName.trim()) {
      setErrorMsg('Please enter at least one prompt and a brand name.');
      return;
    }

    if (!isAdmin && !isPro) {
      setShowPricingModal(true);
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/v2/prompt-monitor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompts: validPrompts,
          brandName: brandName.trim(),
          region: selectedRegion,
          engines: selectedEngines,
          userEmail: user?.email || null,
        }),
      });

      const rawText = await res.text();
      let data: any = {};
      try {
        data = JSON.parse(rawText);
      } catch {
        setErrorMsg(`Server returned non-JSON response (${res.status}): ${rawText.slice(0, 100)}`);
        return;
      }

      if (!res.ok || data.error) {
        setErrorMsg(data.error || `HTTP ${res.status}`);
        return;
      }

      if (data.success && Array.isArray(data.results)) {
        const newItems: PromptResult[] = data.results.map((r: any) => ({
          id: r.id || `pr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          prompt: r.prompt,
          brandName: r.brandName,
          engineId: r.engineId || 'kimi',
          region: r.region || selectedRegion,
          cited: r.cited,
          position: r.position,
          sentiment: r.sentiment || 'neutral',
          responseSnippet: r.responseSnippet || '',
          citedUrls: r.citedUrls || [],
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

        // Reset prompt inputs back to one empty row
        setPromptInputs(['']);
      }
    } catch (err: any) {
      console.error('Prompt monitor error:', err);
      setErrorMsg(err.message || 'Failed to run prompt test');
    } finally {
      setLoading(false);
    }
  };

  const handleClearResults = () => {
    setPromptResults([]);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('monitored_prompts_history');
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
                  engineId: (r.llm_provider || 'kimi') as AiEngineId,
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
            <AiEngineSelector selectedEngines={selectedEngines} onToggle={handleToggleEngine} />
          </div>

          <form onSubmit={handleTestPrompts} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[#777b86] mb-1">Target Brand Name *</label>
              <input
                type="text"
                required
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                placeholder="e.g. SEOzapp"
                className="bg-[#fafafb] border border-[#17191c]/15 rounded-xl px-4 py-2.5 text-sm w-full md:w-80 focus:outline-none"
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-medium text-[#777b86]">
                  Monitoring Query Prompts ({promptInputs.length})
                </label>
                <button
                  type="button"
                  onClick={handleAddPromptInput}
                  className="text-xs font-semibold text-[#17191c] bg-[#fafafb] border border-[#17191c]/15 px-3 py-1 rounded-lg hover:bg-[#f2f2f3] transition-colors flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Prompt</span>
                </button>
              </div>

              {promptInputs.map((val, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={val}
                    onChange={(e) => handlePromptInputChange(idx, e.target.value)}
                    placeholder={idx === 0 ? "e.g. Best SEO tools for agencies in 2026" : "e.g. Top AI search optimization platforms"}
                    className="bg-[#fafafb] border border-[#17191c]/15 rounded-xl px-4 py-2.5 text-sm flex-1 focus:outline-none"
                  />
                  {promptInputs.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemovePromptInput(idx)}
                      className="p-2 text-[#777b86] hover:text-[#ef4444] hover:bg-[#ef4444]/10 rounded-lg transition-colors"
                      title="Remove prompt"
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
                disabled={loading || promptInputs.every((p) => !p.trim()) || !brandName.trim()}
                className="bg-[#17191c] text-[#ffffff] rounded-xl px-6 py-2.5 text-sm font-medium hover:bg-[#17191c]/90 disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Analyzing {promptInputs.filter((p) => p.trim()).length} Prompts...</span>
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
            <div className="p-3 bg-[#ef4444]/10 border border-[#ef4444]/20 rounded-xl text-xs text-[#ef4444] font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="p-4 bg-[#fafafb] rounded-xl border border-[#17191c]/10 flex items-center justify-center gap-3">
              <RefreshCw className="w-5 h-5 animate-spin text-[#17191c]" />
              <span className="text-sm text-[#777b86]">Querying AI Search Engines (DataForSEO) across active prompts and analyzing citation visibility...</span>
            </div>
          )}

          {/* Latest Result Display */}
          {!loading && promptResults.length > 0 && (
            <div className="p-4 bg-[#fafafb] rounded-xl border border-[#17191c]/10 space-y-3 mt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AiEngineBadge engineId={promptResults[0].engineId} />
                  <span className="text-xs font-semibold text-[#17191c]">Region: {REGIONS[promptResults[0].region]?.flag || '🇺🇸'} {REGIONS[promptResults[0].region]?.name || 'US'}</span>
                  <span className="font-semibold text-sm text-[#17191c] ml-2">Latest: &quot;{promptResults[0].prompt}&quot;</span>
                </div>
                <span className={`text-xs font-medium px-3 py-1 rounded-full ${promptResults[0].cited ? 'bg-[#10a37f] text-white' : 'bg-[#fbe1d1] text-[#5d2a1a]'}`}>
                  {promptResults[0].cited ? `✓ Cited (${promptResults[0].position})` : '✕ Not Cited'}
                </span>
              </div>
              <p className="text-xs text-[#777b86] leading-relaxed bg-[#ffffff] p-3 rounded-lg border border-[#17191c]/5 font-mono">
                {promptResults[0].responseSnippet}
              </p>
            </div>
          )}
        </div>

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
                        {REGIONS[p.region || 'US']?.flag || '🇺🇸'} {REGIONS[p.region || 'US']?.code || 'US'}
                      </span>
                      <span className="text-[#777b86]">Brand: <strong className="text-[#17191c]">{p.brandName}</strong></span>
                      <span className="bg-[#17191c]/5 text-[#17191c] border border-[#17191c]/10 px-2 py-0.5 rounded-full font-medium">
                        Rank Placement: {p.position || 'Uncited'}
                      </span>
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
