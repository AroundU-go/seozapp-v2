import { useEffect, useState } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Calendar, ArrowRight, BookOpen, GitCompareArrows } from 'lucide-react';
import { getPublishedBlogsByCategory, BlogRecord } from '@/services/supabaseClient';
import { Footer } from '@/components/ui/Footer';
import { useAuth } from '@/contexts/AuthContext';

export default function AlternativesPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [blogs, setBlogs] = useState<BlogRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPublishedBlogsByCategory('alternative').then((data) => {
      setBlogs(data || []);
      setLoading(false);
    });
  }, []);

  return (
    <>
      <Head>
        <title>Best SEO &amp; AEO Tool Alternatives — Compare &amp; Switch | SEOzapp</title>
        <meta name="description" content="Discover the best alternatives to popular SEO tools. Compare features, pricing, and capabilities to find the right SEO and AEO tool for your needs." />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://www.seozapp.com/alternatives" />
        <meta property="og:title" content="Best SEO & AEO Tool Alternatives — Compare & Switch | SEOzapp" />
        <meta property="og:description" content="Discover the best alternatives to popular SEO tools. Compare features, pricing, and capabilities to find the right SEO and AEO tool for your needs." />
        <meta property="og:url" content="https://www.seozapp.com/alternatives" />
        <meta property="og:type" content="website" />
      </Head>

      <div className="min-h-screen bg-[#ffffff] text-[#17191c] font-sohne selection:bg-[#fbe1d1] selection:text-[#5d2a1a] flex flex-col justify-between">
        {/* Navigation Bar */}
        <nav className="fixed top-0 left-0 right-0 z-50 bg-[#ffffff]/90 backdrop-blur-md border-b border-[#17191c]/10 py-4">
          <div className="max-w-[1200px] mx-auto px-6 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5">
              <img src="/seozapp-logo.jpeg" alt="SEOzapp Logo" className="w-8 h-8 rounded-lg object-cover shadow-sm" />
              <span className="font-signifier text-2xl font-normal text-[#17191c] tracking-tight">
                SEOzapp
              </span>
            </Link>
            <div className="flex items-center gap-4">
              {user ? (
                <button
                  onClick={() => router.push('/dashboard')}
                  className="bg-[#17191c] text-[#ffffff] rounded-full px-5 py-2 text-[14px] font-normal hover:bg-[#17191c]/90 transition-all flex items-center gap-1.5"
                >
                  <span>Go to Dashboard</span>
                  <ArrowRight className="w-4 h-4 text-[#fbe1d1]" />
                </button>
              ) : (
                <button
                  onClick={() => router.push('/auth')}
                  className="bg-[#17191c] text-[#ffffff] rounded-full px-5 py-2 text-[14px] font-normal hover:bg-[#17191c]/90 transition-all"
                >
                  Log in
                </button>
              )}
            </div>
          </div>
        </nav>

        {/* Content View */}
        <main className="max-w-4xl mx-auto px-6 pt-36 pb-24 w-full">
          <div className="text-center mb-10 space-y-3">
            <div className="w-14 h-14 bg-[#fafafb] border border-[#17191c]/10 rounded-2xl flex items-center justify-center mx-auto shadow-xs">
              <GitCompareArrows className="w-7 h-7 text-[#17191c]" />
            </div>
            <h1 className="font-signifier text-4xl sm:text-5xl font-normal tracking-tight text-[#17191c]">
              Software Alternatives
            </h1>
            <p className="text-[#777b86] text-lg font-normal max-w-xl mx-auto">
              Compare popular SEO software vs SEOzapp for speed, clarity, and cost.
            </p>
          </div>

          {/* Tab Buttons */}
          <div className="flex items-center justify-center gap-3 mb-12">
            <button
              onClick={() => router.push('/blog')}
              className="flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-semibold bg-[#fafafb] text-[#777b86] border border-[#17191c]/10 hover:text-[#17191c] transition-colors"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Blog Articles</span>
            </button>
            <button
              className="flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-semibold bg-[#17191c] text-[#ffffff] shadow-xs"
            >
              <GitCompareArrows className="w-3.5 h-3.5" />
              <span>Software Alternatives</span>
            </button>
          </div>

          {loading ? (
            <div className="text-center py-16">
              <div className="w-8 h-8 border-2 border-[#17191c]/20 border-t-[#17191c] rounded-full animate-spin mx-auto mb-4" />
              <p className="text-[#777b86] text-sm font-normal">Loading comparison guides...</p>
            </div>
          ) : blogs.length > 0 ? (
            <div className="space-y-6">
              <h2 className="sr-only">Software Alternatives Guides</h2>
              {blogs.map((blog) => (
                <Link
                  key={blog.id}
                  href={`/alternatives/${blog.slug}`}
                  className="block bg-[#ffffff] rounded-2xl p-6 border border-[#17191c]/10 shadow-xs hover:shadow-md hover:border-[#17191c]/30 transition-all group"
                >
                  <div className="flex flex-col sm:flex-row items-start gap-6">
                    {blog.image_url && (
                      <div className="w-full sm:w-48 h-48 sm:h-32 flex-shrink-0 rounded-xl overflow-hidden bg-[#fafafb] border border-[#17191c]/5">
                        <img
                          src={blog.image_url}
                          alt={blog.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0 flex flex-col justify-center h-full pt-1 space-y-2">
                      <div className="flex items-start justify-between gap-4">
                        <h3 className="font-signifier text-xl font-normal text-[#17191c] group-hover:text-[#5d2a1a] transition-colors line-clamp-2">
                          {blog.title}
                        </h3>
                        <ArrowRight className="w-5 h-5 text-[#979799] group-hover:text-[#17191c] transition-colors flex-shrink-0 mt-1 hidden sm:block" />
                      </div>
                      <p className="text-[#777b86] text-sm line-clamp-2 font-normal leading-relaxed">{blog.excerpt}</p>
                      <div className="flex items-center gap-3 text-xs text-[#979799] pt-2">
                        <span className="flex items-center gap-1.5 font-normal">
                          <Calendar className="w-3.5 h-3.5" />
                          {new Date(blog.created_at || '').toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-[#fafafb] rounded-2xl border border-[#17191c]/10 border-dashed space-y-3">
              <GitCompareArrows className="w-10 h-10 text-[#777b86] mx-auto" />
              <h3 className="text-base font-semibold text-[#17191c]">No comparison guides yet</h3>
              <p className="text-[#777b86] text-sm">Check back soon for alternative software comparisons.</p>
            </div>
          )}
        </main>

        {/* Standard v2 Footer */}
        <Footer />
      </div>
    </>
  );
}
