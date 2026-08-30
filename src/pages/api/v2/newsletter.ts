import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseV2Admin } from '@/lib/supabaseV2';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, source } = req.body;

    if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
      return res.status(400).json({ error: 'Please provide a valid email address.' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const subSource = (typeof source === 'string' && source.trim()) ? source.trim() : 'blog_newsletter';

    // 1. Try inserting into `newsletter_subscribers`
    const { data: nData, error: nError } = await supabaseV2Admin
      .from('newsletter_subscribers')
      .insert({
        email: cleanEmail,
        source: subSource,
        created_at: new Date().toISOString(),
      })
      .select();

    if (!nError) {
      return res.status(200).json({
        success: true,
        message: 'Successfully subscribed to the weekly newsletter!',
        data: nData,
      });
    }

    // 2. If table doesn't exist in Supabase (PGRST205 / 404), fallback to storing in `free_audits`
    const { data: fData, error: fError } = await supabaseV2Admin
      .from('free_audits')
      .insert({
        email: cleanEmail,
        url: `newsletter:${subSource}`,
      })
      .select();

    if (fError) {
      console.error('Failed to record newsletter subscription in Supabase:', fError);
      return res.status(500).json({
        error: 'Failed to record subscription. Please try again.',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Successfully subscribed to the weekly newsletter!',
      data: fData,
    });
  } catch (err: any) {
    console.error('Newsletter API error:', err);
    return res.status(500).json({
      error: 'An unexpected error occurred. Please try again later.',
    });
  }
}
