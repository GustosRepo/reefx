import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

// Validate a promo code
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code')?.toUpperCase().trim();

    if (!code) {
      return NextResponse.json({ error: 'Code is required' }, { status: 400 });
    }

    const supabase = await createClient();

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Look up the promo code
    const { data: promoCode, error: codeError } = await supabase
      .from('promo_codes')
      .select('*')
      .eq('code', code)
      .eq('is_active', true)
      .single();

    if (codeError || !promoCode) {
      return NextResponse.json({ error: 'Invalid promo code' }, { status: 404 });
    }

    // Check if expired
    if (promoCode.expires_at && new Date(promoCode.expires_at) < new Date()) {
      return NextResponse.json({ error: 'This promo code has expired' }, { status: 400 });
    }

    // Check if not yet active
    if (new Date(promoCode.starts_at) > new Date()) {
      return NextResponse.json({ error: 'This promo code is not yet active' }, { status: 400 });
    }

    // Check if max uses reached
    if (promoCode.max_uses && promoCode.uses_count >= promoCode.max_uses) {
      return NextResponse.json({ error: 'This promo code has reached its usage limit' }, { status: 400 });
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

    // Format the discount description
    let discountDescription = '';
    if (promoCode.discount_type === 'free_trial') {
      discountDescription = `${promoCode.discount_value} days free`;
    } else if (promoCode.discount_type === 'percent_off') {
      discountDescription = `${promoCode.discount_value}% off`;
    } else if (promoCode.discount_type === 'amount_off') {
      discountDescription = `$${(promoCode.discount_value / 100).toFixed(2)} off`;
    }

    return NextResponse.json({
      valid: true,
      code: promoCode.code,
      partner: promoCode.partner_name,
      discountType: promoCode.discount_type,
      discountValue: promoCode.discount_value,
      discountDescription,
      appliesTo: promoCode.applies_to,
    });
  } catch (error) {
    console.error('Promo code validation error:', error);
    return NextResponse.json({ error: 'Failed to validate promo code' }, { status: 500 });
  }
}

// Apply a promo code (called after successful checkout)
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { code, subscriptionId } = await request.json();

    if (!code) {
      return NextResponse.json({ error: 'Code is required' }, { status: 400 });
    }

    // Get the promo code
    const { data: promoCode, error: codeError } = await supabase
      .from('promo_codes')
      .select('*')
      .eq('code', code.toUpperCase().trim())
      .eq('is_active', true)
      .single();

    if (codeError || !promoCode) {
      return NextResponse.json({ error: 'Invalid promo code' }, { status: 404 });
    }

    // Record the redemption
    const { error: redemptionError } = await supabase
      .from('promo_code_redemptions')
      .insert({
        user_id: user.id,
        promo_code_id: promoCode.id,
        subscription_id: subscriptionId || null,
      });

    if (redemptionError) {
      // If duplicate, user already redeemed
      if (redemptionError.code === '23505') {
        return NextResponse.json({ error: 'You have already used this promo code' }, { status: 400 });
      }
      throw redemptionError;
    }

    // Increment uses count
    await supabase
      .from('promo_codes')
      .update({ uses_count: promoCode.uses_count + 1 })
      .eq('id', promoCode.id);

    return NextResponse.json({
      success: true,
      message: 'Promo code applied successfully!',
    });
  } catch (error) {
    console.error('Promo code application error:', error);
    return NextResponse.json({ error: 'Failed to apply promo code' }, { status: 500 });
  }
}
