import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/utils/supabase/server';
import { isRequestAdmin } from '@/utils/admin';

// GET - Get affiliate earnings summary for all partners
export async function GET(request: NextRequest) {
  try {
    if (!await isRequestAdmin()) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const supabase = createServiceRoleClient();
    const { searchParams } = new URL(request.url);
    const partnerId = searchParams.get('partnerId');

    if (partnerId) {
      // Get detailed earnings for a specific partner
      const { data: earnings, error } = await supabase
        .from('affiliate_earnings')
        .select(`
          id,
          user_id,
          stripe_invoice_id,
          payment_amount_cents,
          commission_rate,
          commission_amount_cents,
          subscription_tier,
          status,
          paid_at,
          created_at
        `)
        .eq('promo_code_id', partnerId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get partner info
      const { data: partner } = await supabase
        .from('promo_codes')
        .select('id, code, partner_name, partner_email, uses_count')
        .eq('id', partnerId)
        .single();

      // Calculate totals
      const totalRevenue = earnings?.reduce((sum, e) => sum + e.payment_amount_cents, 0) || 0;
      const totalCommission = earnings?.reduce((sum, e) => sum + e.commission_amount_cents, 0) || 0;
      const pendingCommission = earnings?.filter(e => e.status === 'pending').reduce((sum, e) => sum + e.commission_amount_cents, 0) || 0;
      const paidCommission = earnings?.filter(e => e.status === 'paid').reduce((sum, e) => sum + e.commission_amount_cents, 0) || 0;

      return NextResponse.json({
        partner,
        earnings,
        summary: {
          totalRevenue,
          totalCommission,
          pendingCommission,
          paidCommission,
          payingCustomers: new Set(earnings?.map(e => e.user_id)).size,
        }
      });
    }

    // Get summary for all partners
    const { data: partners, error: partnersError } = await supabase
      .from('promo_codes')
      .select('id, code, partner_name, partner_email, uses_count, is_active')
      .order('partner_name');

    if (partnersError) throw partnersError;

    // Get earnings summary per partner (may fail if table doesn't exist yet)
    let allEarnings: Array<{
      promo_code_id: string;
      payment_amount_cents: number;
      commission_amount_cents: number;
      status: string;
      user_id: string;
    }> = [];
    
    const { data: earningsData, error: earningsError } = await supabase
      .from('affiliate_earnings')
      .select('promo_code_id, payment_amount_cents, commission_amount_cents, status, user_id');

    // If table doesn't exist, just use empty array
    if (!earningsError) {
      allEarnings = earningsData || [];
    } else {
      console.log('affiliate_earnings table may not exist yet:', earningsError.message);
    }

    // Aggregate earnings by partner
    const partnerSummaries = partners?.map(partner => {
      const partnerEarnings = allEarnings.filter(e => e.promo_code_id === partner.id);
      const totalRevenue = partnerEarnings.reduce((sum, e) => sum + e.payment_amount_cents, 0);
      const totalCommission = partnerEarnings.reduce((sum, e) => sum + e.commission_amount_cents, 0);
      const pendingCommission = partnerEarnings.filter(e => e.status === 'pending').reduce((sum, e) => sum + e.commission_amount_cents, 0);
      const paidCommission = partnerEarnings.filter(e => e.status === 'paid').reduce((sum, e) => sum + e.commission_amount_cents, 0);
      const payingCustomers = new Set(partnerEarnings.map(e => e.user_id)).size;

      return {
        ...partner,
        totalRevenue,
        totalCommission,
        pendingCommission,
        paidCommission,
        payingCustomers,
        conversionRate: partner.uses_count > 0 ? (payingCustomers / partner.uses_count * 100).toFixed(1) : '0',
      };
    });

    // Calculate overall totals
    const overallTotals = {
      totalPartners: partners?.length || 0,
      totalRedemptions: partners?.reduce((sum, p) => sum + p.uses_count, 0) || 0,
      totalRevenue: allEarnings.reduce((sum, e) => sum + e.payment_amount_cents, 0),
      totalCommission: allEarnings.reduce((sum, e) => sum + e.commission_amount_cents, 0),
      pendingPayouts: allEarnings.filter(e => e.status === 'pending').reduce((sum, e) => sum + e.commission_amount_cents, 0),
    };

    return NextResponse.json({
      partners: partnerSummaries,
      totals: overallTotals,
    });
  } catch (error) {
    console.error('Error fetching affiliate data:', error);
    return NextResponse.json({ error: 'Failed to fetch affiliate data' }, { status: 500 });
  }
}

// POST - Mark earnings as paid (create a payout record)
export async function POST(request: NextRequest) {
  try {
    if (!await isRequestAdmin()) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const supabase = createServiceRoleClient();
    const { partnerId, paymentMethod, paymentReference, notes } = await request.json();

    if (!partnerId) {
      return NextResponse.json({ error: 'Partner ID is required' }, { status: 400 });
    }

    // Get all pending earnings for this partner
    const { data: pendingEarnings, error: fetchError } = await supabase
      .from('affiliate_earnings')
      .select('id, commission_amount_cents, created_at')
      .eq('promo_code_id', partnerId)
      .eq('status', 'pending');

    if (fetchError) throw fetchError;

    if (!pendingEarnings || pendingEarnings.length === 0) {
      return NextResponse.json({ error: 'No pending earnings to pay out' }, { status: 400 });
    }

    const totalAmount = pendingEarnings.reduce((sum, e) => sum + e.commission_amount_cents, 0);
    const earningIds = pendingEarnings.map(e => e.id);
    
    // Find date range
    const dates = pendingEarnings.map(e => new Date(e.created_at));
    const periodStart = new Date(Math.min(...dates.map(d => d.getTime()))).toISOString().split('T')[0];
    const periodEnd = new Date().toISOString().split('T')[0];

    // Create payout record
    const { error: payoutError } = await supabase
      .from('affiliate_payouts')
      .insert({
        promo_code_id: partnerId,
        amount_cents: totalAmount,
        payment_method: paymentMethod || 'manual',
        payment_reference: paymentReference || null,
        notes: notes || null,
        period_start: periodStart,
        period_end: periodEnd,
      });

    if (payoutError) throw payoutError;

    // Mark all pending earnings as paid
    const { error: updateError } = await supabase
      .from('affiliate_earnings')
      .update({ 
        status: 'paid',
        paid_at: new Date().toISOString(),
      })
      .in('id', earningIds);

    if (updateError) throw updateError;

    return NextResponse.json({
      success: true,
      paidAmount: totalAmount,
      earningsCount: earningIds.length,
    });
  } catch (error) {
    console.error('Error processing payout:', error);
    return NextResponse.json({ error: 'Failed to process payout' }, { status: 500 });
  }
}
