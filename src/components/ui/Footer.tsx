import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getPublishedBlogsByCategory, BlogRecord } from '@/services/supabaseClient';

export function Footer() {
  const [alternatives, setAlternatives] = useState<BlogRecord[]>([]);

  useEffect(() => {
    getPublishedBlogsByCategory('alternative').then((data) => {
      setAlternatives(data || []);
    });
  }, []);

  return (
    <footer className="pt-16 pb-12 px-6 border-t border-[#17191c]/10 bg-[#ffffff] text-[#17191c] font-sohne">
      <div className="max-w-[1200px] mx-auto">
        {/* Top Section — Brand + Link Columns */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10 md:gap-12 mb-14">
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-1 space-y-4">
            <Link href="/" className="flex items-center gap-2.5 inline-flex">
              <img src="/seozapp-logo.jpeg" alt="SEOzapp Logo" className="w-7 h-7 rounded-lg object-cover shadow-sm" />
              <span className="font-signifier text-2xl font-normal text-[#17191c] tracking-tight">
                SEOzapp
              </span>
            </Link>
            <p className="text-xs text-[#777b86] leading-relaxed max-w-xs font-normal">
              The all-in-one audit toolkit for Google search — and for the AI engines replacing it.
            </p>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#17191c] mb-4">Company</h4>
            <ul className="space-y-2.5">
              <li>
                <Link href="/blog" className="text-xs text-[#777b86] hover:text-[#17191c] transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-xs text-[#777b86] hover:text-[#17191c] transition-colors font-medium">
                  Book a Demo
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#17191c] mb-4">Legal</h4>
            <ul className="space-y-2.5">
              <li>
                <Link href="/privacy" className="text-xs text-[#777b86] hover:text-[#17191c] transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-xs text-[#777b86] hover:text-[#17191c] transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#17191c] mb-4">Resources</h4>
            <ul className="space-y-2.5">
              <li>
                <Link href="/best-seo-tool-for-agencies" className="text-xs text-[#777b86] hover:text-[#17191c] transition-colors">
                  Best SEO Tool for Agencies
                </Link>
              </li>
              <li>
                <Link href="/Best-SEO-Agency-Software-in-2026" className="text-xs text-[#777b86] hover:text-[#17191c] transition-colors">
                  Best SEO Agency Software 2026
                </Link>
              </li>
              <li>
                <Link href="/seo-audit-tool-for-agencies-2026" className="text-xs text-[#777b86] hover:text-[#17191c] transition-colors">
                  SEO Audit Tool for Agencies
                </Link>
              </li>
            </ul>
          </div>

          {/* Compare — Auto-populated from alternatives */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#17191c] mb-4">Compare</h4>
            <ul className="space-y-2.5">
              {alternatives.length > 0 ? (
                alternatives.map((alt) => (
                  <li key={alt.id}>
                    <Link
                      href={`/alternatives/${alt.slug}`}
                      className="text-xs text-[#777b86] hover:text-[#17191c] transition-colors"
                    >
                      {(() => {
                        const match = alt.title.match(/best\s+(\S+)/i);
                        return match ? `vs ${match[1]}` : alt.title;
                      })()}
                    </Link>
                  </li>
                ))
              ) : (
                <li>
                  <span className="text-xs text-[#777b86]/50 italic">Coming soon</span>
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-[#17191c]/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[#777b86]">
            © {new Date().getFullYear()} SEOzapp. All rights reserved.
          </p>
          <a href="https://startupfa.me/s/seozapp?utm_source=www.seozapp.com" target="_blank" rel="noreferrer">
            <img
              src="https://startupfa.me/badges/featured-badge-small.webp"
              alt="SEOzapp - Featured on Startup Fame"
              width="224"
              height="36"
              className="w-[140px] h-auto opacity-90 hover:opacity-100 transition-opacity"
            />
          </a>
        </div>
      </div>
    </footer>
  );
}
