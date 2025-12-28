import { NextRequest, NextResponse } from 'next/server';
import { createClient, createServiceRoleClient } from '@/utils/supabase/server';

// Redeem a promo code for a card-free trial
// This gives the user direct database access without going through Stripe
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const serviceSupabase = createServiceRoleClient();

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { code } = await request.json();

    if (!code) {
      return NextResponse.json({ error: 'Promo code is required' }, { status: 400 });
    }

    // Fetch and validate promo code (use service role to see all codes)
    const { data: promoCode, error: codeError } = await serviceSupabase
      .from('promo_codes')
      .select('*')
      .eq('code', code.toUpperCase().trim())
      .single();

    if (codeError || !promoCode) {
      return NextResponse.json({ error: 'Invalid promo code' }, { status: 400 });
    }

    // Validate code is active
    if (!promoCode.is_active) {
      return NextResponse.json({ error: 'This promo code is no longer active' }, { status: 400 });
    }

    // Check expiration
    if (promoCode.expires_at && new Date(promoCode.expires_at) < new Date()) {
      return NextResponse.json({ error: 'This promo code has expired' }, { status: 400 });
    }

    // Check max uses
    if (promoCode.max_uses && promoCode.uses_count >= promoCode.max_uses) {
      return NextResponse.json({ error: 'This promo code has reached its maximum uses' }, { status: 400 });
    }

    // Check if user already redeemed this code
    const { data: existingRedemption } = await supabase
      .from('promo_code_redemptions')
      .select('id')
      .eq('user_id', user.id)
      .eq('promo_code_id', promoCode.id)
      .single();

    if (existingRedemption) {
      return NextResponse.json({ error: 'You have already used this promo code' }, { status: 400 });
    }

    // Check current subscription - don't allow if already on paid tier
    const { data: currentSub } = await supabase
      .from('subscriptions')
      .select('tier, status')
      .eq('user_id', user.id)
      .single();

    if (currentSub && currentSub.tier !== 'free' && currentSub.status === 'active') {
      return NextResponse.json({ 
        error: 'You already have an active subscription. Promo codes are for new subscribers.' 
      }, { status: 400 });
    }

    // Calculate trial end date
    const trialDays = promoCode.discount_value; // For free_trial, this is days
    const trialEndDate = new Date();
    trialEndDate.setDate(trialEndDate.getDate() + trialDays);

    // Determine tier from promo code
    let tier: 'premium' | 'super-premium' = 'premium';
    if (promoCode.applies_to === 'super-premium') {
      tier = 'super-premium';
    }
    // If 'both', default to premium

    // Update subscription to grant trial access
    const { error: updateError } = await supabase
      .from('subscriptions')
      .upsert({
        user_id: user.id,
        tier,
        status: 'active',
        start_date: new Date().toISOString(),
        end_date: trialEndDate.toISOString(),
        stripe_customer_id: null,
        stripe_subscription_id: null, // No Stripe subscription - this is a direct trial
        storage_limit_mb: tier === 'super-premium' ? 5120 : 500, // 5GB or 500MB
      }, {
        onConflict: 'user_id',
      });

    if (updateError) {
      console.error('Error updating subscription:', updateError);
      return NextResponse.json({ error: 'Failed to apply promo code' }, { status: 500 });
    }

    // Record the redemption
    await supabase
      .from('promo_code_redemptions')
      .insert({
        user_id: user.id,
        promo_code_id: promoCode.id,
      });

    // Increment uses count (use service role to bypass RLS)
    await serviceSupabase
      .from('promo_codes')
      .update({ uses_count: promoCode.uses_count + 1 })
      .eq('id', promoCode.id);

    return NextResponse.json({ 
      success: true,
      tier,
      trialDays,
      trialEndDate: trialEndDate.toISOString(),
      message: `Congrats! You now have ${trialDays} days of ${tier === 'super-premium' ? 'Super Premium' : 'Premium'} access!`
    });
  } catch (error) {
    console.error('Error redeeming promo code:', error);
    return NextResponse.json({ error: 'Failed to redeem promo code' }, { status: 500 });
  }
}
