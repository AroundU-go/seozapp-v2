export interface FAQItem {
  question: string;
  answer: string;
}

/**
 * Generates Google-compliant schema.org/FAQPage JSON-LD structured data.
 */
export function generateFAQPageSchema(items: FAQItem[]) {
  if (!items || items.length === 0) return null;

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question.replace(/<[^>]*>?/gm, '').trim(),
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer.replace(/<[^>]*>?/gm, '').trim(),
      },
    })),
  };
}

/**
 * Extracts FAQ questions and answers from formatted HTML or markdown text.
 */
export function extractFaqsFromContent(htmlContent: string): FAQItem[] {
  if (!htmlContent) return [];
  const faqs: FAQItem[] = [];

  // Match <h3>/<h4> questions followed by <p> answers
  const qnaRegex = /<(?:h[34]|strong|b)[^>]*>(?:Q:?\s*|\d+\.\s*)?([^<]+)<\/(?:h[34]|strong|b)>\s*<p[^>]*>([\s\S]*?)<\/p>/gi;
  let match;

  while ((match = qnaRegex.exec(htmlContent)) !== null) {
    const q = match[1].replace(/^[Q0-9.:\s-]+/i, '').trim();
    const a = match[2].replace(/<[^>]*>?/gm, '').trim();
    if (q.endsWith('?') && a.length > 15 && q.length > 10 && q.length < 180) {
      faqs.push({ question: q, answer: a });
    }
  }

  return faqs;
}
