import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseV2, V2_TABLES } from '@/lib/supabaseV2';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const ownerEmail = (req.query.ownerEmail as string || '').toLowerCase().trim();
    if (!ownerEmail) {
      return res.status(400).json({ error: 'ownerEmail parameter is required' });
    }

    try {
      // Find workspace by owner_user_id (email)
      const { data: workspaces, error: wsError } = await supabaseV2
        .from(V2_TABLES.WORKSPACES)
        .select('*')
        .eq('owner_user_id', ownerEmail)
        .order('created_at', { ascending: false });

      if (wsError) throw wsError;

      if (!workspaces || workspaces.length === 0) {
        return res.status(200).json({ success: true, workspace: null, domain: null });
      }

      const activeWorkspace = workspaces[0];

      // Fetch primary domain for this workspace
      const { data: domains, error: domError } = await supabaseV2
        .from(V2_TABLES.DOMAINS)
        .select('*')
        .eq('workspace_id', activeWorkspace.id)
        .eq('is_competitor', false)
        .order('added_at', { ascending: false });

      if (domError) throw domError;

      const primaryDomain = domains && domains.length > 0 ? domains[0] : null;

      return res.status(200).json({
        success: true,
        workspace: activeWorkspace,
        domain: primaryDomain ? primaryDomain.url : null,
      });
    } catch (err: any) {
      console.error('v2 workspace GET error:', err);
      return res.status(500).json({ error: err.message || 'Failed to fetch workspace' });
    }
  }

  if (req.method === 'POST') {
    const { ownerEmail, brandName, websiteUrl } = req.body;

    if (!ownerEmail || !websiteUrl) {
      return res.status(400).json({ error: 'ownerEmail and websiteUrl are required' });
    }

    try {
      const cleanEmail = ownerEmail.toLowerCase().trim();
      let cleanUrl = websiteUrl.trim();
      if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
        cleanUrl = `https://${cleanUrl}`;
      }
      const domainHost = new URL(cleanUrl).hostname.replace('www.', '');
      const brand = brandName?.trim() || domainHost.split('.')[0];
      const isAdmin = cleanEmail === 'go.aroundu@gmail.com';

      // 1. Check if workspace already exists
      const { data: existingWorkspaces } = await supabaseV2
        .from(V2_TABLES.WORKSPACES)
        .select('*')
        .eq('owner_user_id', cleanEmail);

      let workspaceId: string;

      if (existingWorkspaces && existingWorkspaces.length > 0) {
        workspaceId = existingWorkspaces[0].id;
        // Update brand name
        await supabaseV2
          .from(V2_TABLES.WORKSPACES)
          .update({ name: brand, plan_tier: isAdmin ? 'enterprise' : 'starter', is_admin: isAdmin })
          .eq('id', workspaceId);
      } else {
        // Insert new workspace
        const { data: newWs, error: insertWsError } = await supabaseV2
          .from(V2_TABLES.WORKSPACES)
          .insert({
            name: brand,
            owner_user_id: cleanEmail,
            plan_tier: isAdmin ? 'enterprise' : 'starter',
            is_admin: isAdmin,
          })
          .select()
          .single();

        if (insertWsError) throw insertWsError;
        workspaceId = newWs.id;
      }

      // 2. Insert or update primary domain
      const { data: existingDomains } = await supabaseV2
        .from(V2_TABLES.DOMAINS)
        .select('*')
        .eq('workspace_id', workspaceId)
        .eq('is_competitor', false);

      if (existingDomains && existingDomains.length > 0) {
        await supabaseV2
          .from(V2_TABLES.DOMAINS)
          .update({ url: domainHost })
          .eq('id', existingDomains[0].id);
      } else {
        await supabaseV2
          .from(V2_TABLES.DOMAINS)
          .insert({
            workspace_id: workspaceId,
            url: domainHost,
            is_competitor: false,
          });
      }

      return res.status(200).json({
        success: true,
        workspaceId,
        brandName: brand,
        domain: domainHost,
      });
    } catch (err: any) {
      console.error('v2 workspace POST error:', err);
      return res.status(500).json({ error: err.message || 'Failed to save workspace' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
