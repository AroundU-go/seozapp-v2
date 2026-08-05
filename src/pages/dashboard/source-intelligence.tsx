import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import {
  Share2,
  RefreshCw,
  Sparkles,
  ExternalLink,
  Globe,
  FileText,
  Building2,
  MessageSquare,
  AlertCircle,
} from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { PricingModal } from '@/components/pricing/PricingModal';

import { Clock } from 'lucide-react';
import { HistoryModal, HistoryItem } from '@/components/dashboard/HistoryModal';

export default function SourceIntelligencePage() {
  const { user, isAdmin, isPro } = useAuth();
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [brandName, setBrandName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [data, setData] = useState<any>(null);

  // Supabase History Modal state
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
      const res = await fetch(`/api/v2/source-intelligence?userEmail=${encodeURIComponent(user?.email || '')}`);
      const resData = await res.json();
      if (resData.success && (resData.scans || resData.records)) {
        const list = resData.scans || resData.records || [];
        const formatted = list.map((item: any) => ({
          id: item.id,
          title: item.domain || item.url,
          subtitle: `Brand: ${item.brand_name || 'N/A'} • URL: ${item.url}`,
          timestamp: item.created_at || new Date().toISOString(),
          badge: 'Source Scan',
          data: item.scan_data || item,
        }));
        setHistoryItems(formatted);
      }
    } catch (err) {
      console.warn('Failed to load source history:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  // Load domain from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedDomain = localStorage.getItem('tracked_domain');
      const storedBrand = localStorage.getItem('pending_brand_name');

      if (storedDomain) {
        setUrlInput(storedDomain.startsWith('http') ? storedDomain : `https://${storedDomain}`);
      }
      if (storedBrand) {
        setBrandName(storedBrand);
      } else if (storedDomain) {
        setBrandName(storedDomain.split('.')[0]);
      }

      const cachedData = localStorage.getItem('source_intelligence_cache');
      if (cachedData) {
        try {
          setData(JSON.parse(cachedData));
        } catch (e) {}
      }
    }
  }, []);

  // Load latest scan from Supabase DB
  useEffect(() => {
    async function loadDbScan() {
      if (!user?.email) return;
      try {
        const res = await fetch(`/api/v2/source-intelligence?userEmail=${encodeURIComponent(user.email)}`);
        const resData = await res.json();
        if (resData.success && Array.isArray(resData.scans) && resData.scans.length > 0) {
          const latestScan = resData.scans[0].scan_data;
          if (latestScan) {
            setData(latestScan);
            if (typeof window !== 'undefined') {
              localStorage.setItem('source_intelligence_cache', JSON.stringify(latestScan));
            }
          }
        }
      } catch (err) {
        console.warn('Failed to load DB source intelligence scans:', err);
      }
    }

    loadDbScan();
  }, [user]);

  const handleExtractSources = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;

    if (!isAdmin && !isPro) {
      setShowPricingModal(true);
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/v2/source-intelligence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: urlInput.trim(),
          brandName: brandName.trim() || undefined,
          userEmail: user?.email || null,
        }),
      });

      const resData = await res.json();

      if (!res.ok || resData.error) {
        setErrorMsg(resData.error || `HTTP ${res.status}`);
        return;
      }

      if (resData.success) {
        setData(resData);
        if (typeof window !== 'undefined') {
          localStorage.setItem('source_intelligence_cache', JSON.stringify(resData));
        }
      }
    } catch (err: any) {
      console.error('Source Intelligence extraction failed:', err);
      setErrorMsg(err.message || 'Failed to extract source graph');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout activeDomain={data?.domain || (urlInput ? new URL(urlInput.startsWith('http') ? urlInput : `https://${urlInput}`).hostname : 'Source Intelligence')}>
      <Head>
        <title>Source Intelligence — AI Search Citations</title>
      </Head>

      <PricingModal isOpen={showPricingModal} onClose={() => setShowPricingModal(false)} />

      <main className="max-w-[1250px] mx-auto px-8 py-8 space-y-8">
        {/* Module Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[12px] font-semibold text-[#5d2a1a] bg-[#fbe1d1] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Module 06 • Source Intelligence
              </span>
            </div>
            <h1 className="text-[28px] font-semibold text-[#17191c] mt-1">
              AI Citation Source Intelligence
            </h1>
            <p className="text-[15px] text-[#777b86]">
              Discover which external web domains, documentation, and review platforms AI models ingest as primary sources.
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
          title="Previous Source Scans"
          featureName="Module 06 • Source Intelligence"
          items={historyItems}
          loading={loadingHistory}
          onRefresh={fetchHistory}
          onSelect={(item) => {
            if (item.data) {
              setData(item.data);
              if (item.data.url) setUrlInput(item.data.url);
            }
          }}
        />

        {/* Live Source Extractor Form */}
        <div className="bg-[#ffffff] rounded-2xl p-6 border border-[#17191c]/10 shadow-sm space-y-4">
          <h2 className="text-[18px] font-semibold text-[#17191c] flex items-center gap-2">
            <Share2 className="w-4 h-4 text-[#17191c]" />
            Extract Outbound Sources &amp; LLM Citation Graph
          </h2>

          <form onSubmit={handleExtractSources} className="flex flex-col sm:flex-row items-center gap-3">
            <input
              type="text"
              required
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
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
              disabled={loading || !urlInput.trim()}
              className="bg-[#17191c] text-[#ffffff] rounded-xl px-6 py-2.5 text-sm font-medium hover:bg-[#17191c]/90 disabled:opacity-50 whitespace-nowrap flex items-center gap-2"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-[#fbe1d1]" />}
              Extract Source Graph
            </button>
          </form>

          {errorMsg && (
            <div className="p-3 bg-[#ef4444]/10 border border-[#ef4444]/20 rounded-xl text-xs text-[#ef4444] font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>

        {/* Results */}
        {data ? (
          <div className="space-y-8">
            {/* 4 Source Category Distribution Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
              <div className="bg-[#ffffff] rounded-2xl p-5 border border-[#17191c]/10 shadow-sm">
                <div className="flex items-center justify-between text-[#777b86] text-[13px]">
                  <span>Official Documentation</span>
                  <FileText className="w-4 h-4 text-[#17191c]" />
                </div>
                <div className="text-[32px] font-bold text-[#17191c] mt-2">
                  {data.sourceDistribution?.officialDocs || 42}% <span className="text-[12px] font-normal text-[#777b86]">Weight</span>
                </div>
                <div className="text-[11px] text-[#5d2a1a] bg-[#fbe1d1] px-2 py-0.5 rounded-full inline-block mt-2 font-medium">
                  Primary LLM Ingestion Source
                </div>
              </div>

              <div className="bg-[#ffffff] rounded-2xl p-5 border border-[#17191c]/10 shadow-sm">
                <div className="flex items-center justify-between text-[#777b86] text-[13px]">
                  <span>Review Platforms (G2/Capterra)</span>
                  <Building2 className="w-4 h-4 text-[#17191c]" />
                </div>
                <div className="text-[32px] font-bold text-[#17191c] mt-2">
                  {data.sourceDistribution?.reviewSites || 28}% <span className="text-[12px] font-normal text-[#777b86]">Weight</span>
                </div>
                <div className="text-[11px] text-[#17191c] bg-[#f2f2f3] px-2 py-0.5 rounded-full inline-block mt-2 font-medium">
                  Social Proof &amp; Buyer Intent
                </div>
              </div>

              <div className="bg-[#ffffff] rounded-2xl p-5 border border-[#17191c]/10 shadow-sm">
                <div className="flex items-center justify-between text-[#777b86] text-[13px]">
                  <span>Community (Reddit/HackerNews)</span>
                  <MessageSquare className="w-4 h-4 text-[#17191c]" />
                </div>
                <div className="text-[32px] font-bold text-[#17191c] mt-2">
                  {data.sourceDistribution?.communityForums || 18}% <span className="text-[12px] font-normal text-[#777b86]">Weight</span>
                </div>
                <div className="text-[11px] text-[#17191c] bg-[#f2f2f3] px-2 py-0.5 rounded-full inline-block mt-2 font-medium">
                  Unbiased User Opinions
                </div>
              </div>

              <div className="bg-[#ffffff] rounded-2xl p-5 border border-[#17191c]/10 shadow-sm">
                <div className="flex items-center justify-between text-[#777b86] text-[13px]">
                  <span>Tech Blogs &amp; Media</span>
                  <Globe className="w-4 h-4 text-[#17191c]" />
                </div>
                <div className="text-[32px] font-bold text-[#17191c] mt-2">
                  {data.sourceDistribution?.techBlogs || 12}% <span className="text-[12px] font-normal text-[#777b86]">Weight</span>
                </div>
                <div className="text-[11px] text-[#17191c] bg-[#f2f2f3] px-2 py-0.5 rounded-full inline-block mt-2 font-medium">
                  News &amp; Press Citations
                </div>
              </div>
            </div>

            {/* Top AI Citation Sources Table */}
            <div className="bg-[#ffffff] rounded-2xl p-6 border border-[#17191c]/10 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#f2f2f3]">
                <h3 className="font-semibold text-[16px] text-[#17191c]">Top AI Citation Sources for {data.brandName}</h3>
                <span className="text-[12px] text-[#777b86]">Ranked by LLM Ingestion Weight</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-[13px]">
                  <thead>
                    <tr className="border-b border-[#f2f2f3] text-[#979799] text-[12px]">
                      <th className="pb-3 font-medium">Source Domain</th>
                      <th className="pb-3 font-medium">Source Type</th>
                      <th className="pb-3 font-medium">Citation Weight</th>
                      <th className="pb-3 font-medium">Sentiment Context</th>
                      <th className="pb-3 font-medium text-right">LLM Ingestion Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f2f2f3]">
                    {data.topSources?.map((source: any, idx: number) => (
                      <tr key={idx} className="hover:bg-[#fafafb] transition-colors">
                        <td className="py-3.5 font-medium text-[#17191c] flex items-center gap-2">
                          <Globe className="w-3.5 h-3.5 text-[#777b86]" />
                          <span>{source.domain}</span>
                        </td>
                        <td className="py-3.5 text-[#777b86]">{source.sourceType}</td>
                        <td className="py-3.5 font-bold text-[#17191c]">{source.citationWeight} / 100</td>
                        <td className="py-3.5 text-[#777b86]">
                          <span className="bg-[#ffffff] border border-[#17191c]/10 px-2 py-0.5 rounded-full text-[11px] font-medium">
                            {source.sentiment}
                          </span>
                        </td>
                        <td className="py-3.5 text-right font-medium text-[#17191c]">
                          <span className="text-[11px] font-semibold text-[#17191c] bg-[#f2f2f3] px-2.5 py-0.5 rounded-full">
                            Indexed
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Extracted Outbound Link References */}
            {data.extractedOutboundLinks && data.extractedOutboundLinks.length > 0 && (
              <div className="bg-[#ffffff] rounded-2xl p-6 border border-[#17191c]/10 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#f2f2f3]">
                  <h3 className="font-semibold text-[16px] text-[#17191c]">Extracted Citation References</h3>
                  <span className="text-[12px] text-[#777b86]">Outbound links found on page</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[13px]">
                  {data.extractedOutboundLinks.map((link: any, idx: number) => (
                    <a
                      key={idx}
                      href={link.url}
                      target="_blank"
                      rel="noreferrer"
                      className="p-3 bg-[#fafafb] rounded-xl border border-[#17191c]/5 hover:border-[#17191c]/20 transition-all flex items-center justify-between group"
                    >
                      <div>
                        <div className="font-semibold text-[#17191c] group-hover:underline">{link.title || link.domain}</div>
                        <div className="text-[11px] text-[#777b86] mt-0.5">{link.domain}</div>
                      </div>
                      <ExternalLink className="w-3.5 h-3.5 text-[#777b86] group-hover:text-[#17191c]" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-[#ffffff] rounded-2xl p-12 border border-[#17191c]/10 text-center space-y-3">
            <Share2 className="w-10 h-10 text-[#777b86]/40 mx-auto" />
            <p className="text-base font-semibold text-[#17191c]">No Source Graph Extracted Yet</p>
            <p className="text-xs text-[#777b86] max-w-md mx-auto">
              Enter your website URL above to discover outbound citation sources and LLM ingestion weights.
            </p>
          </div>
        )}
      </main>
    </DashboardLayout>
  );
}
