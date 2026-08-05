import { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { ArrowLeft, Calendar, ArrowRight } from 'lucide-react';
import { getBlogBySlug, BlogRecord } from '@/services/supabaseClient';
import { Footer } from '@/components/ui/Footer';
import { useAuth } from '@/contexts/AuthContext';

export default function BlogPostPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { slug } = router.query as { slug: string };
  const [blog, setBlog] = useState<BlogRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;
    getBlogBySlug(slug).then((data) => {
      if (data) {
        setBlog(data);
      } else {
        setNotFound(true);
      }
      setLoading(false);
    });
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#ffffff] flex items-center justify-center font-sohne">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-[#17191c]/20 border-t-[#17191c] rounded-full animate-spin mx-auto" />
          <p className="text-[#777b86] text-sm">Loading article...</p>
        </div>
      </div>
    );
  }

  if (notFound || !blog) {
    return (
      <div className="min-h-screen bg-[#ffffff] flex items-center justify-center font-sohne">
        <div className="text-center space-y-4">
          <h1 className="font-signifier text-3xl font-normal text-[#17191c]">Article not found</h1>
          <p className="text-[#777b86] text-sm">The article you&apos;re looking for doesn&apos;t exist or was removed.</p>
          <button
            onClick={() => router.push('/blog')}
            className="text-[#17191c] font-medium underline hover:opacity-80 transition-opacity text-sm"
          >
            ← Back to Blog Index
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{blog.title} — SEOzapp Blog</title>
        <meta name="description" content={blog.excerpt} />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href={`https://www.seozapp.com/blog/${blog.slug}`} />
        <meta property="og:title" content={`${blog.title} — SEOzapp Blog`} />
        <meta property="og:description" content={blog.excerpt} />
        <meta property="og:url" content={`https://www.seozapp.com/blog/${blog.slug}`} />
        <meta property="og:type" content="article" />
        {blog.image_url && <meta property="og:image" content={blog.image_url} />}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Article',
              headline: blog.title,
              description: blog.excerpt,
              datePublished: blog.created_at,
              dateModified: blog.updated_at || blog.created_at,
              author: {
                '@type': 'Organization',
                name: 'SEOzapp',
              },
              publisher: {
                '@type': 'Organization',
                name: 'SEOzapp',
                url: 'https://www.seozapp.com',
              },
              mainEntityOfPage: {
                '@type': 'WebPage',
                '@id': `https://www.seozapp.com/blog/${blog.slug}`,
              },
            }),
          }}
        />
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

        {/* Article Container */}
        <main className="max-w-[800px] mx-auto px-6 pt-36 pb-24 w-full">
          <button
            onClick={() => router.push('/blog')}
            className="flex items-center gap-2 text-xs font-semibold text-[#777b86] hover:text-[#17191c] transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Blog</span>
          </button>

          <article className="space-y-8">
            <div className="space-y-4">
              <h1 className="font-signifier text-4xl sm:text-5xl font-normal tracking-tight text-[#17191c] leading-tight">
                {blog.title}
              </h1>
              <div className="flex items-center gap-2 text-xs text-[#979799]">
                <Calendar className="w-3.5 h-3.5" />
                <span>
                  {new Date(blog.created_at || '').toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              </div>
            </div>

            {blog.image_url && (
              <div className="rounded-2xl overflow-hidden border border-[#17191c]/10 bg-[#fafafb]">
                <img src={blog.image_url} alt={blog.title} className="w-full h-auto object-cover max-h-[420px]" />
              </div>
            )}

            <div
              className="prose prose-neutral max-w-none text-[#777b86] text-base leading-relaxed space-y-6"
              dangerouslySetInnerHTML={{ __html: blog.content }}
            />
          </article>
        </main>

        {/* Standard v2 Footer */}
        <Footer />
      </div>
    </>
  );
}
