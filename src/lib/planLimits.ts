import { supabaseV2Admin } from './supabaseV2';

export const ADMIN_EMAILS = ['go.aroundu@gmail.com'];

export interface PlanLimits {
  tier: 'free' | 'starter' | 'pro' | 'enterprise';
  isPro: boolean;
  maxPrompts: number;
  maxCompetitors: number;
  maxSites: number;
  allowedEngines: string[];
}

export const FREE_LIMITS: PlanLimits = {
  tier: 'free',
  isPro: false,
  maxPrompts: 0,
  maxCompetitors: 0,
  maxSites: 0,
  allowedEngines: [],
};

export const STARTER_LIMITS: PlanLimits = {
  tier: 'starter',
  isPro: true,
  maxPrompts: 25,
  maxCompetitors: 5,
  maxSites: 2,
  allowedEngines: ['chatgpt', 'gemini', 'perplexity'],
};

export const PRO_LIMITS: PlanLimits = {
  tier: 'pro',
  isPro: true,
  maxPrompts: 50,
  maxCompetitors: 10,
  maxSites: 5,
  allowedEngines: ['chatgpt', 'gemini', 'perplexity', 'ai_overview'],
};

export const ENTERPRISE_LIMITS: PlanLimits = {
  tier: 'enterprise',
  isPro: true,
  maxPrompts: 9999,
  maxCompetitors: 999,
  maxSites: 999,
  allowedEngines: ['chatgpt', 'gemini', 'perplexity', 'ai_overview', 'claude'],
};

/**
 * Server-side helper to fetch and compute a user's subscription plan & feature limits
 */
export async function getServerPlanLimits(userEmail?: string | null): Promise<PlanLimits> {
  const cleanEmail = (userEmail || '').toLowerCase().trim();
  if (!cleanEmail) {
    return FREE_LIMITS;
  }

  // Admin Override
  if (ADMIN_EMAILS.includes(cleanEmail)) {
    return ENTERPRISE_LIMITS;
  }

  try {
    const { data: profile, error } = await supabaseV2Admin
      .from('profiles')
      .select('is_pro, pro_since, payment_type, plan_tier')
      .eq('email', cleanEmail)
      .maybeSingle();

    if (error || !profile) {
      return FREE_LIMITS;
    }

    const isProFlag = profile.is_pro === true;
    const paymentType = profile.payment_type || 'one_time';
    const planTier = (profile.plan_tier || '').toLowerCase();

    if (!isProFlag) {
      return FREE_LIMITS;
    }

    // Check expiry for subscription users (30 days)
    if (paymentType === 'subscription' && profile.pro_since) {
      const proSince = new Date(profile.pro_since);
      const now = new Date();
      const diffDays = (now.getTime() - proSince.getTime()) / (1000 * 60 * 60 * 24);
      if (diffDays > 30) {
        return FREE_LIMITS;
      }
    }

    // Resolve tier limits
    if (planTier.includes('starter')) {
      return STARTER_LIMITS;
    } else if (planTier.includes('enterprise') || planTier.includes('scale')) {
      return ENTERPRISE_LIMITS;
    } else {
      // Default existing paying users to Pro tier ($99/mo)
      return PRO_LIMITS;
    }
  } catch (err) {
    console.warn('[getServerPlanLimits] Error resolving limits for:', cleanEmail, err);
    return FREE_LIMITS;
  }
}
