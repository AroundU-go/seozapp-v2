import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  BarChart3,
  TrendingUp,
  ArrowUpRight,
  RefreshCw,
  Sparkles,
  Search,
  Lock,
} from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { CitationTrendChart, EngineVisibilityChart } from '@/components/dashboard/OverviewCharts';
import { PricingModal } from '@/components/pricing/PricingModal';
import { useAuth } from '@/contexts/AuthContext';

export default function DashboardOverview() {
  const router = useRouter();
  const { user, isAdmin } = useAuth();

  const [activeDomain, setActiveDomain] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [auditData, setAuditData] = useState<any>(null);
  const [showPricingModal, setShowPricingModal] = useState(false);

  useEffect(() => {
    // Load free initial audit result if available from onboarding
    if (typeof window !== 'undefined') {
      const storedDomain = localStorage.getItem('tracked_domain');
      if (storedDomain) {
        setActiveDomain(storedDomain);
      }

      const storedFreeAudit = localStorage.getItem('free_audit_result');
      if (storedFreeAudit) {
        try {
          const parsed = JSON.parse(storedFreeAudit);
          setAuditData(parsed);
          if (parsed.domain) {
            setActiveDomain(parsed.domain);
            localStorage.setItem('tracked_domain', parsed.domain);
          }
        } catch (e) {
          console.error(e);
        }
      }
    }
  }, []);

  const runAuditForUrl = async (targetUrl: string) => {
    if (!targetUrl.trim()) return;

    // Check if user is admin (go.aroundu@gmail.com)
    if (!isAdmin) {
      setShowPricingModal(true);
      return;
    }

    setAnalyzing(true);
    try {
      const res = await fetch('/api/v2/analyze-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: targetUrl, brandName: targetUrl.replace(/https?:\/\//, '').split('/')[0], includeAi: true }),
      });
      const data = await res.json();
      if (data.success) {
        setAuditData(data);
        setActiveDomain(data.domain);
        if (typeof window !== 'undefined') {
          localStorage.setItem('tracked_domain', data.domain);
        }
      }
    } catch (err: any) {
      console.error('Audit failed:', err);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleRunAudit = (e: React.FormEvent) => {
    e.preventDefault();
    runAuditForUrl(urlInput);
  };

  return (
    <DashboardLayout activeDomain={activeDomain}>
      <Head>
        <title>Overview — SEOzapp v2</title>
      </Head>

      <main className="max-w-[1250px] mx-auto px-8 py-8 space-y-8">
        {/* Header Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-[26px] font-semibold text-[#17191c]">Dashboard Overview</h1>
            <p className="text-[14px] text-[#777b86]">
              Real-time SEO health, AI citation trends, and competitive visibility for <strong className="text-[#17191c] font-semibold">{activeDomain}</strong>.
            </p>
          </div>

          <button
            onClick={() => (isAdmin ? router.push('/dashboard/aeo') : setShowPricingModal(true))}
            className="bg-[#17191c] text-[#ffffff] rounded-xl px-5 py-2.5 text-sm font-medium hover:bg-[#17191c]/90 flex items-center gap-2 shadow-sm whitespace-nowrap self-start md:self-auto"
          >
            <Sparkles className="w-4 h-4 text-[#fbe1d1]" />
            <span>Open AI Citation</span>
          </button>
        </div>



        {/* Top 4 Key Metric Cards (Displays Scraped Free Values or '-') */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-[#ffffff] rounded-2xl p-5 border border-[#17191c]/10 shadow-sm">
            <span className="text-[12px] text-[#777b86]">Technical SEO Health</span>
            <div className="text-[32px] font-bold text-[#17191c] mt-1">
              {auditData?.seoHealth?.score !== undefined ? auditData.seoHealth.score : '-'}
              <span className="text-[13px] text-[#777b86] font-normal"> / 100</span>
            </div>
            <div className="text-[11px] text-[#17191c] bg-[#f2f2f3] px-2 py-0.5 rounded-full inline-block mt-2 font-medium">
              {auditData?.seoHealth?.score !== undefined ? 'Scraped Free Scan' : '-'}
            </div>
          </div>

          <div className="bg-[#ffffff] rounded-2xl p-5 border border-[#17191c]/10 shadow-sm">
            <span className="text-[12px] text-[#777b86]">AI Readiness Score</span>
            <div className="text-[32px] font-bold text-[#17191c] mt-1">
              {auditData?.aiReadiness?.overallScore !== undefined ? auditData.aiReadiness.overallScore : '-'}
              <span className="text-[13px] text-[#777b86] font-normal"> / 100</span>
            </div>
            <div className="text-[11px] text-[#5d2a1a] bg-[#fbe1d1] px-2 py-0.5 rounded-full inline-block mt-2 font-medium">
              {auditData?.aiReadiness?.overallScore !== undefined ? 'Scraped Free Scan' : '-'}
            </div>
          </div>

          <div className="bg-[#ffffff] rounded-2xl p-5 border border-[#17191c]/10 shadow-sm">
            <span className="text-[12px] text-[#777b86]">AI Citation Rate</span>
            <div className="text-[32px] font-bold text-[#17191c] mt-1">
              {auditData?.citationSample?.cited !== undefined ? (auditData.citationSample.cited ? '100%' : '0%') : '-'}
            </div>
            <div className="text-[11px] text-[#777b86] bg-[#fafafb] px-2 py-0.5 rounded-full inline-block mt-2 font-medium border border-[#17191c]/10">
              {auditData?.citationSample?.cited !== undefined ? `Position: ${auditData.citationSample.position}` : '-'}
            </div>
          </div>

          <div className="bg-[#ffffff] rounded-2xl p-5 border border-[#17191c]/10 shadow-sm">
            <span className="text-[12px] text-[#777b86]">Scraped Page Count</span>
            <div className="text-[32px] font-bold text-[#17191c] mt-1">
              {auditData?.metadata?.wordCount !== undefined ? auditData.metadata.wordCount : '-'}
            </div>
            <div className="text-[11px] text-[#777b86] bg-[#fafafb] px-2 py-0.5 rounded-full inline-block mt-2 font-medium border border-[#17191c]/10">
              {auditData?.metadata?.h1Count !== undefined ? `${auditData.metadata.h1Count} H1 Headings` : '-'}
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 bg-[#ffffff] rounded-2xl p-6 border border-[#17191c]/10 shadow-sm relative overflow-hidden">
            <CitationTrendChart />
          </div>

          <div className="lg:col-span-5 bg-[#ffffff] rounded-2xl p-6 border border-[#17191c]/10 shadow-sm relative overflow-hidden">
            <EngineVisibilityChart />
          </div>
        </div>

        {/* Free Scraped Audit Results Detail Card if present */}
        {auditData && (
          <div className="bg-[#ffffff] rounded-2xl p-6 border border-[#17191c]/10 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-[#17191c]/10 pb-4">
              <h3 className="text-lg font-semibold text-[#17191c]">Free Scraped Audit for {auditData.domain}</h3>
              <span className="text-xs font-semibold text-[#10a37f] bg-[#10a37f]/10 px-3 py-1 rounded-full">
                Scraped Free Teaser Scan
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-[#17191c]">Initial Page Metadata</h4>
                <div className="bg-[#fafafb] p-4 rounded-xl border border-[#17191c]/10 space-y-2 text-xs">
                  <div><strong className="text-[#17191c]">Title:</strong> {auditData.metadata?.title || '-'}</div>
                  <div><strong className="text-[#17191c]">Description:</strong> {auditData.metadata?.description || '-'}</div>
                  <div><strong className="text-[#17191c]">Word Count:</strong> {auditData.metadata?.wordCount ?? '-'}</div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-[#17191c]">Locked Features Status</h4>
                <div className="bg-[#fafafb] p-4 rounded-xl border border-[#17191c]/10 space-y-2 text-xs">
                  <div><strong className="text-[#17191c]">Bulk Crawl (2,000+ Pages):</strong> - (Locked)</div>
                  <div><strong className="text-[#17191c]">Competitor Benchmark:</strong> - (Locked)</div>
                  <div><strong className="text-[#17191c]">Source Intelligence Link Graph:</strong> - (Locked)</div>
                  <button
                    onClick={() => setShowPricingModal(true)}
                    className="mt-2 text-[#5d2a1a] font-semibold underline hover:text-[#17191c]"
                  >
                    Upgrade plan to unlock all features →
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Pricing Modal Screen */}
      <PricingModal isOpen={showPricingModal} onClose={() => setShowPricingModal(false)} />
    </DashboardLayout>
  );
}
