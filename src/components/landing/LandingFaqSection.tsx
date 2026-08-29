import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export interface FAQItem {
  question: string;
  answer: string;
}

export const LANDING_FAQS: FAQItem[] = [
  {
    question: 'What is SEOzapp and how does it work?',
    answer:
      'SEOzapp is an all-in-one AI search visibility and technical SEO platform (SEO + AEO/GEO). It combines continuous website audits, 25+ ranking signal checks, multi-LLM citation monitoring across ChatGPT, Perplexity, Claude, Gemini, and Google AI Overviews, competitor share-of-voice benchmarking, and automated /llms.txt generation.',
  },
  {
    question: 'What is the difference between traditional SEO and AEO/GEO?',
    answer:
      'Traditional SEO focuses on optimizing web pages to rank in classic search engine result pages (SERPs). Answer Engine Optimization (AEO) and Generative Engine Optimization (GEO) focus on structuring your content, schema markup, and entity signals so generative AI engines recommend, cite, and link to your brand as an authoritative primary source.',
  },
  {
    question: 'Which AI engines does SEOzapp monitor?',
    answer:
      'SEOzapp tracks all major generative answer engines: ChatGPT (OpenAI), Perplexity AI, Claude (Anthropic), Gemini (Google), and Google AI Overviews. Starter plans monitor 3 core LLMs, while Pro and Enterprise plans provide comprehensive 5-engine tracking.',
  },
  {
    question: 'How does SEOzapp track brand citations and detect AI hallucinations?',
    answer:
      'SEOzapp runs automated prompt queries simulating buyer journeys, capturing citation frequency, cited URLs, sentiment, and competitor presence. It also flags AI hallucinations—such as outdated pricing, deprecated features, or false competitor claims—so you can quickly update source pages and third-party listings.',
  },
  {
    question: 'What is an /llms.txt file and why does SEOzapp generate it?',
    answer:
      '/llms.txt is an emerging web standard that provides structured, clean markdown summaries of your product, documentation, and key URLs for AI web crawlers. SEOzapp automatically generates and verifies your /llms.txt manifest to improve passage quoteability by LLMs.',
  },
  {
    question: 'How does SEOzapp inspect AI crawler bot access?',
    answer:
      'SEOzapp audits your robots.txt directives, meta tags, and server response headers for key AI bot user-agents (GPTBot, ClaudeBot, PerplexityBot, Google-Extended, ByteSpider, and CCBot) to ensure your high-value pages are crawlable without firewall or CDN blocks.',
  },
  {
    question: 'What are the pricing tiers and are there hidden credit costs?',
    answer:
      'SEOzapp operates on predictable, flat-rate monthly SaaS pricing with zero hidden token fees. Starter is $49/month (2 sites, 25 prompts, 5 competitors), Pro is $99/month (5 sites, 50 prompts, 10 competitors, 5 LLM engines), and Enterprise/Scale is $249/month (unlimited sites, competitors, and white-label reports).',
  },
];

export function LandingFaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleIndex = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="py-24 px-6 bg-[#ffffff] border-t border-[#17191c]/10 scroll-mt-20">
      <div className="max-w-[1000px] mx-auto space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <span className="text-xs font-semibold text-[#5d2a1a] bg-[#fbe1d1] px-3 py-1 rounded-full uppercase tracking-wider">
            Frequently Asked Questions
          </span>
          <h2 className="font-signifier font-normal text-4xl sm:text-5xl tracking-tight text-[#17191c]">
            Everything you need to know about SEOzapp
          </h2>
          <p className="text-[#777b86] text-base sm:text-lg">
            Answers to common questions about AI search tracking, AEO/GEO audits, and crawler optimization.
          </p>
        </div>

        <div className="space-y-4">
          {LANDING_FAQS.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className="bg-[#fafafb] rounded-2xl border border-[#17191c]/10 overflow-hidden transition-all hover:border-[#17191c]/25"
              >
                <button
                  type="button"
                  onClick={() => toggleIndex(index)}
                  className="w-full p-6 text-left flex items-center justify-between gap-4 font-semibold text-[#17191c] text-lg focus:outline-hidden"
                  aria-expanded={isOpen}
                >
                  <span>{faq.question}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-[#777b86] transition-transform duration-200 flex-shrink-0 ${
                      isOpen ? 'rotate-180 text-[#17191c]' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-6 pb-6 text-[#777b86] text-sm sm:text-base leading-relaxed border-t border-[#17191c]/5 pt-4">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
