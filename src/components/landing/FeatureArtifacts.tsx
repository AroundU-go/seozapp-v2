import React from 'react';
import { Check, ArrowUpRight, Search, Zap, Layers, RefreshCw, BarChart2, ShieldCheck, Sparkles } from 'lucide-react';

// Feature 1 Artifact: SEO Snapshot & Diff View
export const SeoTrackingArtifact: React.FC = () => {
  return (
    <div className="bg-[#ffffff] rounded-2xl shadow-floating-artifact p-6 border border-[#17191c]/5">
      <div className="flex items-center justify-between pb-4 border-b border-[#f2f2f3]">
        <div>
          <div className="text-[14px] font-semibold text-[#17191c]">Domain SEO Health</div>
          <div className="text-[12px] text-[#777b86]">acme-software.com • Version 3 Snapshot</div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[12px] font-medium text-[#17191c] bg-[#f2f2f3] px-2.5 py-1 rounded-full">
            +4.2 pts diff
          </span>
          <span className="text-[16px] font-bold text-[#17191c] bg-[#fafafb] border border-[#17191c]/10 px-3 py-1 rounded-xl">
            91 / 100
          </span>
        </div>
      </div>

      <div className="space-y-3 mt-4">
        <div className="p-3 bg-[#fafafb] rounded-xl flex items-center justify-between text-[13px]">
          <div className="flex items-center gap-2 text-[#17191c]">
            <Check className="w-4 h-4 text-[#17191c]" />
            <span>Title Tag &amp; Meta Description</span>
          </div>
          <span className="text-[11px] font-medium text-[#777b86]">Optimal Length</span>
        </div>

        <div className="p-3 bg-[#fafafb] rounded-xl flex items-center justify-between text-[13px]">
          <div className="flex items-center gap-2 text-[#17191c]">
            <Check className="w-4 h-4 text-[#17191c]" />
            <span>H1–H3 Heading Hierarchy</span>
          </div>
          <span className="text-[11px] font-medium text-[#777b86]">1 H1, 8 H2s</span>
        </div>

        <div className="p-3 bg-[#fafafb] rounded-xl flex items-center justify-between text-[13px]">
          <div className="flex items-center gap-2 text-[#17191c]">
            <Check className="w-4 h-4 text-[#17191c]" />
            <span>JSON-LD Schema Markup</span>
          </div>
          <span className="text-[11px] font-medium text-[#777b86]">SoftwareApplication</span>
        </div>

        <div className="p-3 bg-[#fafafb] rounded-xl flex items-center justify-between text-[13px]">
          <div className="flex items-center gap-2 text-[#17191c]">
            <RefreshCw className="w-3.5 h-3.5 text-[#777b86]" />
            <span>Broken Links &amp; Redirect Chains</span>
          </div>
          <span className="text-[11px] font-medium text-[#5d2a1a] bg-[#fbe1d1] px-2 py-0.5 rounded-full">
            0 Broken Links
          </span>
        </div>
      </div>
    </div>
  );
};

// Feature 2 Artifact: Prompt Monitoring List
export const PromptMonitoringArtifact: React.FC = () => {
  return (
    <div className="bg-[#ffffff] rounded-2xl shadow-floating-artifact p-6 border border-[#17191c]/5">
      <div className="flex items-center justify-between pb-4 border-b border-[#f2f2f3]">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#17191c]" />
          <span className="text-[14px] font-semibold text-[#17191c]">Kimi LLM Citation Stream</span>
        </div>
        <span className="text-[12px] text-[#777b86]">Updated 2h ago</span>
      </div>

      <div className="space-y-3 mt-4">
        {[
          { prompt: 'Best project management tools for tech startups 2026', cited: true, position: '#1 cited', sentiment: 'Positive' },
          { prompt: 'How to automate sprint planning with AI', cited: true, position: '#2 cited', sentiment: 'Positive' },
          { prompt: 'Cheaper Jira alternative for small remote teams', cited: true, position: '#1 cited', sentiment: 'Neutral' },
          { prompt: 'Top software for engineering roadmap tracking', cited: false, position: 'Not cited', sentiment: 'N/A' },
        ].map((item, idx) => (
          <div key={idx} className="p-3 bg-[#fafafb] rounded-xl flex items-center justify-between text-[12px] gap-2">
            <div className="truncate text-[#17191c] font-medium flex-1">
              "{item.prompt}"
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {item.cited ? (
                <span className="text-[11px] font-semibold text-[#17191c] bg-[#ffffff] border border-[#17191c]/15 px-2 py-0.5 rounded-full">
                  {item.position}
                </span>
              ) : (
                <span className="text-[11px] text-[#979799] bg-[#f2f2f3] px-2 py-0.5 rounded-full">
                  Uncited
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Feature 3 Artifact: Bulk Crawl & AI Readiness Table
export const BulkCrawlArtifact: React.FC = () => {
  return (
    <div className="bg-[#ffffff] rounded-2xl shadow-floating-artifact p-6 border border-[#17191c]/5">
      <div className="flex items-center justify-between pb-4 border-b border-[#f2f2f3]">
        <div>
          <div className="text-[14px] font-semibold text-[#17191c]">Bulk Crawl Priority Table</div>
          <div className="text-[12px] text-[#777b86]">148 pages scanned via Firecrawl</div>
        </div>
        <span className="text-[12px] font-medium text-[#17191c] bg-[#f2f2f3] px-2.5 py-1 rounded-full">
          Worst-scoring first
        </span>
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-[12px] text-left">
          <thead>
            <tr className="border-b border-[#f2f2f3] text-[#979799]">
              <th className="pb-2 font-medium">Page URL</th>
              <th className="pb-2 font-medium">Struct</th>
              <th className="pb-2 font-medium">Semantic</th>
              <th className="pb-2 font-medium text-right">Overall</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#f2f2f3]">
            <tr>
              <td className="py-2.5 text-[#17191c] font-medium truncate max-w-[160px]">/pricing/enterprise</td>
              <td className="py-2.5 text-[#777b86]">42/100</td>
              <td className="py-2.5 text-[#777b86]">38/100</td>
              <td className="py-2.5 text-right font-bold text-[#5d2a1a]">
                <span className="bg-[#fbe1d1] px-2 py-0.5 rounded-full text-[11px]">40 / 100</span>
              </td>
            </tr>
            <tr>
              <td className="py-2.5 text-[#17191c] font-medium truncate max-w-[160px]">/blog/ai-search-trends</td>
              <td className="py-2.5 text-[#777b86]">88/100</td>
              <td className="py-2.5 text-[#777b86]">92/100</td>
              <td className="py-2.5 text-right font-bold text-[#17191c]">90 / 100</td>
            </tr>
            <tr>
              <td className="py-2.5 text-[#17191c] font-medium truncate max-w-[160px]">/features/workflow</td>
              <td className="py-2.5 text-[#777b86]">76/100</td>
              <td className="py-2.5 text-[#777b86]">81/100</td>
              <td className="py-2.5 text-right font-bold text-[#17191c]">78 / 100</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Feature 4 Artifact: Competitor Gap Comparison
export const CompetitorAnalysisArtifact: React.FC = () => {
  return (
    <div className="bg-[#ffffff] rounded-2xl shadow-floating-artifact p-6 border border-[#17191c]/5">
      <div className="flex items-center justify-between pb-4 border-b border-[#f2f2f3]">
        <div className="text-[14px] font-semibold text-[#17191c]">Competitor Benchmark Dashboard</div>
        <span className="text-[12px] text-[#777b86]">Quarterly comparison</span>
      </div>

      <div className="space-y-4 mt-4 text-[13px]">
        {/* Metric 1 */}
        <div>
          <div className="flex justify-between text-[12px] font-medium mb-1">
            <span className="text-[#17191c]">Your Site (acme.com)</span>
            <span className="text-[#17191c] font-bold">94 / 100 AI Score</span>
          </div>
          <div className="w-full h-2 bg-[#f2f2f3] rounded-full overflow-hidden">
            <div className="h-full bg-[#17191c] rounded-full" style={{ width: '94%' }}></div>
          </div>
        </div>

        {/* Metric 2 */}
        <div>
          <div className="flex justify-between text-[12px] font-medium mb-1">
            <span className="text-[#777b86]">Competitor A (rival-a.io)</span>
            <span className="text-[#777b86]">68 / 100 AI Score</span>
          </div>
          <div className="w-full h-2 bg-[#f2f2f3] rounded-full overflow-hidden">
            <div className="h-full bg-[#979799] rounded-full" style={{ width: '68%' }}></div>
          </div>
        </div>

        {/* Metric 3 */}
        <div>
          <div className="flex justify-between text-[12px] font-medium mb-1">
            <span className="text-[#777b86]">Competitor B (rival-b.com)</span>
            <span className="text-[#777b86]">52 / 100 AI Score</span>
          </div>
          <div className="w-full h-2 bg-[#f2f2f3] rounded-full overflow-hidden">
            <div className="h-full bg-[#a3a6af] rounded-full" style={{ width: '52%' }}></div>
          </div>
        </div>

        <div className="p-3 bg-[#fafafb] rounded-xl text-[12px] text-[#17191c] border border-[#17191c]/5 flex items-center justify-between">
          <span>Structural Gap Alert: Competitor A uses FAQ Schema on 82% of posts</span>
          <span className="text-[11px] font-medium text-[#5d2a1a] bg-[#fbe1d1] px-2 py-0.5 rounded-full flex-shrink-0">
            Action needed
          </span>
        </div>
      </div>
    </div>
  );
};
