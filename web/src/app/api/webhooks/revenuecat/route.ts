/**
 * RevenueCat Webhook Handler
 * 
 * This endpoint receives webhooks from RevenueCat when subscription events occur.
 * Configure this URL in RevenueCat Dashboard: Project Settings > Webhooks
 * 
 * Webhook URL: https://your-domain.com/api/webhooks/revenuecat
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Use service role key for webhook - bypasses RLS
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// RevenueCat event types we care about
type RevenueCatEventType = 
  | 'INITIAL_PURCHASE'
  | 'RENEWAL'
  | 'CANCELLATION'
  | 'UNCANCELLATION'
  | 'NON_RENEWING_PURCHASE'
  | 'SUBSCRIPTION_PAUSED'
  | 'EXPIRATION'
  | 'BILLING_ISSUE'
  | 'PRODUCT_CHANGE';

interface RevenueCatWebhookEvent {
  api_version: string;
  event: {
    type: RevenueCatEventType;
    id: string;
    app_id: string;
    app_user_id: string; // This is the Supabase user ID we set during login
    original_app_user_id: string;
    product_id: string;
    entitlement_ids: string[];
    period_type: 'TRIAL' | 'INTRO' | 'NORMAL';
    purchased_at_ms: number;
    expiration_at_ms: number | null;
    store: 'APP_STORE' | 'PLAY_STORE' | 'STRIPE' | 'PROMOTIONAL';
    environment: 'SANDBOX' | 'PRODUCTION';
    is_family_share: boolean;
    price_in_purchased_currency: number;
    currency: string;
    cancel_reason?: string;
    subscriber_attributes?: Record<string, { value: string; updated_at_ms: number }>;
  };
}

// Map RevenueCat entitlements to your tier names
const ENTITLEMENT_TO_TIER: Record<string, 'free' | 'premium' | 'super-premium'> = {
  'premium': 'premium',
  'super_premium': 'super-premium',
};

export async function POST(request: NextRequest) {
  try {
    // Verify webhook authenticity (optional but recommended)
    const authHeader = request.headers.get('Authorization');
    const webhookSecret = process.env.REVENUECAT_WEBHOOK_SECRET;
    
    if (webhookSecret && authHeader !== `Bearer ${webhookSecret}`) {
      console.error('Invalid webhook authorization');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: RevenueCatWebhookEvent = await request.json();
    const event = body.event;

    console.log(`RevenueCat webhook: ${event.type} for user ${event.app_user_id}`);

    // Skip sandbox events in production if desired
    // if (event.environment === 'SANDBOX' && process.env.NODE_ENV === 'production') {
    //   return NextResponse.json({ received: true, skipped: 'sandbox' });
    // }

    // Get user ID (this is the Supabase user ID we set when initializing RevenueCat)
    const userId = event.app_user_id;
    
    // Skip if no valid user ID (anonymous users start with $RCAnonymousID)
    if (!userId || userId.startsWith('$RCAnonymousID')) {
      console.log('Skipping anonymous user event');
      return NextResponse.json({ received: true, skipped: 'anonymous' });
    }

    // Determine the tier from entitlements
    let tier: 'free' | 'premium' | 'super-premium' = 'free';
    for (const entitlementId of event.entitlement_ids || []) {
      if (ENTITLEMENT_TO_TIER[entitlementId]) {
        const mappedTier = ENTITLEMENT_TO_TIER[entitlementId];
        // Use higher tier if multiple entitlements
        if (mappedTier === 'super-premium' || (mappedTier === 'premium' && tier === 'free')) {
          tier = mappedTier;
        }
      }
    }

    // Determine status based on event type
    let status: 'active' | 'canceled' | 'past_due' | 'expired' = 'active';
    let cancelAtPeriodEnd = false;

    switch (event.type) {
      case 'INITIAL_PURCHASE':
      case 'RENEWAL':
      case 'UNCANCELLATION':
        status = 'active';
        break;
      
      case 'CANCELLATION':
        status = 'active'; // Still active until expiration
        cancelAtPeriodEnd = true;
        break;
      
      case 'EXPIRATION':
        status = 'expired';
        tier = 'free'; // Downgrade to free
        break;
      
      case 'BILLING_ISSUE':
        status = 'past_due';
        break;
      
      case 'SUBSCRIPTION_PAUSED':
        status = 'canceled';
        break;
    }

    // Calculate expiration date
    const expirationDate = event.expiration_at_ms 
      ? new Date(event.expiration_at_ms).toISOString()
      : null;

    // Upsert subscription record
    const { error: upsertError } = await supabase
      .from('subscriptions')
      .upsert({
        user_id: userId,
        tier,
        status,
        platform: 'app', // Mark as app subscription
        current_period_end: expirationDate,
        cancel_at_period_end: cancelAtPeriodEnd,
        // Store RevenueCat-specific data
        revenuecat_product_id: event.product_id,
        revenuecat_store: event.store,
        revenuecat_environment: event.environment,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id',
      });

    if (upsertError) {
      console.error('Error updating subscription:', upsertError);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    console.log(`Updated subscription for ${userId}: tier=${tier}, status=${status}`);

    return NextResponse.json({ 
      received: true,
      user_id: userId,
      tier,
      status,
    });

  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Handle GET requests (for webhook verification if needed)
export async function GET() {
  return NextResponse.json({ status: 'RevenueCat webhook endpoint active' });
}
