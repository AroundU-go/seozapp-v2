import React, { useState } from 'react';
import Head from 'next/head';
import {
  Layers,
  RefreshCw,
  Sparkles,
  ArrowUpRight,
  CheckCircle2,
  AlertTriangle,
  FileText,
  DollarSign,
  ListFilter,
  BarChart2,
} from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { PricingModal } from '@/components/pricing/PricingModal';

import { Clock } from 'lucide-react';
import { HistoryModal, HistoryItem } from '@/components/dashboard/HistoryModal';

export default function BulkCrawlPage() {
  const { user, isAdmin, isPro } = useAuth();
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [domainUrl, setDomainUrl] = useState('');
  const [loading, setLoading] = useState(false);

  // Supabase History Modal state
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
      const res = await fetch(`/api/v2/workspace`);
      const data = await res.json();
      if (data.success && data.workspaces) {
        const formatted = data.workspaces.map((item: any) => ({
          id: item.id,
          title: item.name || 'Workspace Domain',
          subtitle: `Plan Tier: ${item.plan_tier || 'starter'} • Owner: ${item.owner_user_id || 'User'}`,
          timestamp: item.created_at || new Date().toISOString(),
          badge: item.plan_tier || 'Crawl Run',
          data: item,
        }));
        setHistoryItems(formatted);
      }
    } catch (err) {
      console.warn('Failed to load crawl history:', err);
    } finally {
      setLoadingHistory(false);
    }
  };
  const [crawlJob, setCrawlJob] = useState<any>({
    jobId: 'job_fc_994102',
    status: 'completed',
    pagesDiscovered: 148,
    pagesCrawled: 148,
    creditsUsed: 148,
    semanticSampleRate: '20% (30 LLM calls)',
  });

  const [pagesList, setPagesList] = useState([
    {
      url: '/pricing/enterprise',
      status: 200,
      wordCount: 320,
      structScore: 42,
      semanticScore: 38,
      overallScore: 40,
      issues: ['Missing FAQ schema', 'Thin content (<500w)', 'No direct definition sentence'],
      grade: 'CRITICAL',
    },
    {
      url: '/features/workflow-automation',
      status: 200,
      wordCount: 1250,
      structScore: 78,
      semanticScore: 82,
      overallScore: 80,
      issues: ['No HTML comparison table'],
      grade: 'GOOD',
    },
    {
      url: '/blog/ai-search-optimization-guide',
      status: 200,
      wordCount: 2100,
      structScore: 92,
      semanticScore: 96,
      overallScore: 94,
      issues: [],
      grade: 'EXCELLENT',
    },
    {
      url: '/docs/api-reference',
      status: 200,
      wordCount: 1800,
      structScore: 88,
      semanticScore: 90,
      overallScore: 89,
      issues: ['Missing /llms.txt link'],
      grade: 'GOOD',
    },
  ]);

  const handleStartCrawl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!domainUrl.trim()) return;

    if (!isAdmin && !isPro) {
      setShowPricingModal(true);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/v2/crawl', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: domainUrl, limit: 50 }),
      });
      const data = await res.json();
      if (data.success) {
        setCrawlJob({
          jobId: data.jobId,
          status: 'crawling',
          pagesDiscovered: 50,
          pagesCrawled: 12,
          creditsUsed: 12,
          semanticSampleRate: '20% cap active',
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout activeDomain="acme-software.com">
      <Head>
        <title>Bulk AI Readiness Crawl Engine — SEOzapp v2</title>
      </Head>

      <PricingModal isOpen={showPricingModal} onClose={() => setShowPricingModal(false)} />

      <main className="max-w-[1250px] mx-auto px-8 py-8 space-y-8">
        {/* Module Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[12px] font-semibold text-[#17191c] bg-[#f2f2f3] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Module 03 • Bulk Crawl Engine
              </span>
              <span className="text-[12px] text-[#777b86]">High-Speed Batch Engine</span>
            </div>
            <h1 className="text-[28px] font-semibold text-[#17191c] mt-1">
              Bulk Crawl &amp; AI Readiness at Scale
            </h1>
            <p className="text-[15px] text-[#777b86]">
              Asynchronous background jobs crawling thousands of URLs to compute dual structural &amp; semantic scores.
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
          title="Previous Bulk Crawl Jobs"
          featureName="Module 03 • Bulk Crawl Engine"
          items={historyItems}
          loading={loadingHistory}
          onRefresh={fetchHistory}
          onSelect={(item) => {
            if (item.title) setDomainUrl(`https://${item.title}`);
          }}
        />

        {/* Crawl Control Panel Card */}
        <div className="bg-[#ffffff] rounded-2xl p-6 border border-[#17191c]/10 shadow-sm space-y-4">
          <h2 className="text-[18px] font-semibold text-[#17191c] flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#17191c]" />
            Initiate Async Domain Crawl Job
          </h2>

          <form onSubmit={handleStartCrawl} className="flex flex-col sm:flex-row items-center gap-3">
            <input
              type="text"
              value={domainUrl}
              onChange={(e) => setDomainUrl(e.target.value)}
              className="bg-[#fafafb] border border-[#17191c]/15 rounded-xl px-4 py-2.5 text-sm text-[#17191c] focus:outline-none w-full sm:w-80 shadow-inner"
              placeholder="Enter domain URL..."
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-[#17191c] text-[#ffffff] rounded-xl px-6 py-2.5 text-sm font-medium hover:bg-[#17191c]/90 disabled:opacity-50 whitespace-nowrap flex items-center gap-2"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Layers className="w-4 h-4" />}
              Start Background Crawl
            </button>
          </form>
        </div>

        {/* Crawl Job Status & Cost Visibility Panel */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-[#ffffff] rounded-2xl p-5 border border-[#17191c]/10 shadow-sm">
            <div className="text-[13px] text-[#777b86]">Crawl Job ID</div>
            <div className="text-[18px] font-mono font-semibold text-[#17191c] mt-1 truncate">{crawlJob.jobId}</div>
            <div className="text-[11px] font-semibold text-[#17191c] bg-[#f2f2f3] px-2 py-0.5 rounded-full inline-block mt-2 uppercase">
              Status: {crawlJob.status}
            </div>
          </div>

          <div className="bg-[#ffffff] rounded-2xl p-5 border border-[#17191c]/10 shadow-sm">
            <div className="text-[13px] text-[#777b86]">Pages Discovered / Crawled</div>
            <div className="text-[36px] font-semibold text-[#17191c] mt-1">
              {crawlJob.pagesCrawled} <span className="text-[14px] text-[#777b86] font-normal">/ {crawlJob.pagesDiscovered}</span>
            </div>
            <div className="text-[12px] text-[#777b86] mt-1">100% crawl completed</div>
          </div>

          <div className="bg-[#ffffff] rounded-2xl p-5 border border-[#17191c]/10 shadow-sm">
            <div className="text-[13px] text-[#777b86]">Scrape Credits Used</div>
            <div className="text-[36px] font-semibold text-[#17191c] mt-1">{crawlJob.creditsUsed} Credits</div>
            <div className="text-[12px] text-[#777b86] mt-1">1 credit per scraped page</div>
          </div>

          <div className="bg-[#ffffff] rounded-2xl p-5 border border-[#17191c]/10 shadow-sm">
            <div className="text-[13px] text-[#777b86]">AI Audit Rate Limit</div>
            <div className="text-[18px] font-semibold text-[#17191c] mt-1">{crawlJob.semanticSampleRate}</div>
            <div className="text-[12px] text-[#5d2a1a] bg-[#fbe1d1] px-2 py-0.5 rounded-full inline-block mt-2 font-medium">
              Cost visibility active
            </div>
          </div>
        </div>

        {/* Priority Worst-Scoring Pages Table */}
        <div className="bg-[#ffffff] rounded-2xl p-6 border border-[#17191c]/10 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#f2f2f3]">
            <h3 className="font-semibold text-[16px] text-[#17191c]">Prioritized Page AI Readiness Table</h3>
            <span className="text-[12px] text-[#777b86]">Sorted worst-scoring first</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-[13px]">
              <thead>
                <tr className="border-b border-[#f2f2f3] text-[#979799] text-[12px]">
                  <th className="pb-3 font-medium">Page URL</th>
                  <th className="pb-3 font-medium">Word Count</th>
                  <th className="pb-3 font-medium">Struct Score</th>
                  <th className="pb-3 font-medium">Semantic Score</th>
                  <th className="pb-3 font-medium">Overall Score</th>
                  <th className="pb-3 font-medium text-right">Primary Issue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f2f2f3]">
                {pagesList.map((p, idx) => (
                  <tr key={idx} className="hover:bg-[#fafafb] transition-colors">
                    <td className="py-3.5 font-medium text-[#17191c]">{p.url}</td>
                    <td className="py-3.5 text-[#777b86]">{p.wordCount} words</td>
                    <td className="py-3.5 text-[#777b86]">{p.structScore} / 100</td>
                    <td className="py-3.5 text-[#777b86]">{p.semanticScore} / 100</td>
                    <td className="py-3.5 font-bold text-[#17191c]">
                      <span className={`px-2.5 py-1 rounded-full text-[12px] ${p.overallScore < 50 ? 'bg-[#fbe1d1] text-[#5d2a1a]' : 'bg-[#f2f2f3] text-[#17191c]'}`}>
                        {p.overallScore} / 100
                      </span>
                    </td>
                    <td className="py-3.5 text-right text-[12px] text-[#777b86]">
                      {p.issues[0] || 'No critical issues'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </DashboardLayout>
  );
}
