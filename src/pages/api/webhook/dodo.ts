import { NextApiRequest, NextApiResponse } from 'next';
import DodoPayments from 'dodopayments';
import { createClient } from '@supabase/supabase-js';

// Disable standard body parser to receive raw body for webhook verification
export const config = {
    api: {
        bodyParser: false,
    },
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 
                           process.env.SUPABASE_SERVICE_KEY || 
                           process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''; // fallback
                           
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function getRawBody(req: NextApiRequest): Promise<Buffer> {
    const chunks: Buffer[] = [];
    for await (const chunk of req) {
        chunks.push(chunk instanceof Buffer ? chunk : Buffer.from(chunk));
    }
    return Buffer.concat(chunks);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const rawBody = await getRawBody(req);
        
        const client = new DodoPayments({
            bearerToken: process.env.DODO_PAYMENTS_API_KEY || '',
            environment: process.env.DODO_PAYMENTS_API_KEY?.startsWith('test_') ? 'test_mode' : 'live_mode',
            webhookKey: process.env.DODO_PAYMENTS_WEBHOOK_KEY || '',
        });

        const webhookHeaders = {
            'webhook-id': req.headers['webhook-id'] as string,
            'webhook-signature': req.headers['webhook-signature'] as string,
            'webhook-timestamp': req.headers['webhook-timestamp'] as string,
        };

        // Unwrap checks signature and returns parsed JSON data payload
        const event = client.webhooks.unwrap(rawBody.toString('utf8'), { headers: webhookHeaders });

        const eventType = event.type;
        const payloadData = (event.data as any) || {};
        const metadata = payloadData.metadata || {};

        let userId = metadata.user_id || metadata.userId;
        const customerEmail = (payloadData.customer?.email || payloadData.customer_email || payloadData.email || metadata.email || '').toLowerCase().trim();

        // If user_id is not in metadata, look up user ID from Supabase auth / profiles by email
        if (!userId && customerEmail) {
            console.log(`[Webhook] Looking up user by email: ${customerEmail}`);
            const { data: profile } = await supabaseAdmin
                .from('profiles')
                .select('id')
                .eq('email', customerEmail)
                .maybeSingle();

            if (profile?.id) {
                userId = profile.id;
            } else {
                // Fallback: search auth.users via admin API
                try {
                    const { data: authUsers } = await supabaseAdmin.auth.admin.listUsers();
                    const matchedUser = authUsers?.users?.find((u) => u.email?.toLowerCase() === customerEmail);
                    if (matchedUser?.id) {
                        userId = matchedUser.id;
                    }
                } catch (err: any) {
                    console.warn('[Webhook] Auth user search failed:', err.message);
                }
            }
        }

        if (!userId && !customerEmail) {
            console.warn(`[Webhook] Ignored event ${eventType} - missing user identification (no metadata.user_id or customer email)`);
            return res.status(200).json({ received: true, status: 'skipped_no_user' });
        }

        console.log(`[Webhook] Processing event ${eventType} for user ${userId || customerEmail}`);

        if (eventType === 'payment.succeeded' || eventType === 'subscription.active' || eventType === 'subscription.renewed') {
            const isSub = eventType === 'subscription.active' || eventType === 'subscription.renewed' || payloadData.subscription_id;
            const paymentType = isSub ? 'subscription' : 'one_time';
            
            const updatePayload = {
                is_pro: true,
                pro_since: new Date().toISOString(),
                payment_type: paymentType,
                pro_audit_count: 0
            };

            let profileError = null;

            if (userId) {
                const { error } = await supabaseAdmin
                    .from('profiles')
                    .update(updatePayload)
                    .eq('id', userId);
                profileError = error;
            } else if (customerEmail) {
                const { error } = await supabaseAdmin
                    .from('profiles')
                    .update(updatePayload)
                    .eq('email', customerEmail);
                profileError = error;
            }

            if (profileError) {
                console.error(`[Webhook] Error updating profile for ${userId || customerEmail}:`, profileError);
                return res.status(500).json({ error: 'Database update failed' });
            }

            console.log(`[Webhook] Successfully updated profile for ${userId || customerEmail} to ${paymentType}`);
            return res.status(200).json({ received: true });
        }

        if (eventType === 'subscription.on_hold' || eventType === 'subscription.cancelled' || eventType === 'subscription.failed') {
            const revokePayload = {
                is_pro: false,
                payment_type: null
            };

            let profileError = null;

            if (userId) {
                const { error } = await supabaseAdmin
                    .from('profiles')
                    .update(revokePayload)
                    .eq('id', userId);
                profileError = error;
            } else if (customerEmail) {
                const { error } = await supabaseAdmin
                    .from('profiles')
                    .update(revokePayload)
                    .eq('email', customerEmail);
                profileError = error;
            }

            if (profileError) {
                console.error(`[Webhook] Error revoking profile for ${userId || customerEmail}:`, profileError);
                return res.status(500).json({ error: 'Database update failed' });
            }

            console.log(`[Webhook] Successfully revoked profile for ${userId || customerEmail} on ${eventType}`);
            return res.status(200).json({ received: true });
        }

        return res.status(200).json({ received: true });
    } catch (error: any) {
        console.error('[Webhook] Error:', error.message || error);
        return res.status(401).json({ error: 'Webhook verification or processing failed' });
    }
}
