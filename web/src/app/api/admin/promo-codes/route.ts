import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/utils/supabase/server';
import { isRequestAdmin } from '@/utils/admin';

// GET - List all promo codes
export async function GET() {
  try {
    if (!await isRequestAdmin()) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Use service role client to bypass RLS
    const supabase = createServiceRoleClient();

    const { data: codes, error } = await supabase
      .from('promo_codes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ codes });
  } catch (error) {
    console.error('Error fetching promo codes:', error);
    return NextResponse.json({ error: 'Failed to fetch promo codes' }, { status: 500 });
  }
}

// POST - Create a new promo code
export async function POST(request: NextRequest) {
  try {
    if (!await isRequestAdmin()) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Use service role client to bypass RLS
    const supabase = createServiceRoleClient();

    const { 
      code, 
      partnerName, 
      partnerEmail, 
      discountType, 
      discountValue, 
      appliesTo,
      maxUses,
      expiresInDays,
    } = await request.json();

    if (!code || !partnerName) {
      return NextResponse.json({ error: 'Code and partner name are required' }, { status: 400 });
    }

    // Calculate expiration date if provided
    let expiresAt = null;
    if (expiresInDays) {
      const expDate = new Date();
      expDate.setDate(expDate.getDate() + expiresInDays);
      expiresAt = expDate.toISOString();
    }

    const { data, error } = await supabase
      .from('promo_codes')
      .insert({
        code: code.toUpperCase().trim(),
        partner_name: partnerName,
        partner_email: partnerEmail || null,
        discount_type: discountType || 'free_trial',
        discount_value: discountValue || 30,
        applies_to: appliesTo || 'premium',
        max_uses: maxUses || null,
        expires_at: expiresAt,
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ error: 'This code already exists' }, { status: 400 });
      }
      throw error;
    }

    return NextResponse.json({ code: data });
  } catch (error) {
    console.error('Error creating promo code:', error);
    return NextResponse.json({ error: 'Failed to create promo code' }, { status: 500 });
  }
}

// PATCH - Update a promo code (toggle active, etc.)
export async function PATCH(request: NextRequest) {
  try {
    if (!await isRequestAdmin()) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Use service role client to bypass RLS
    const supabase = createServiceRoleClient();

    const { id, isActive } = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('promo_codes')
      .update({ is_active: isActive })
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating promo code:', error);
    return NextResponse.json({ error: 'Failed to update promo code' }, { status: 500 });
  }
}

// DELETE - Delete a promo code
export async function DELETE(request: NextRequest) {
  try {
    if (!await isRequestAdmin()) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Use service role client to bypass RLS
    const supabase = createServiceRoleClient();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('promo_codes')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting promo code:', error);
    return NextResponse.json({ error: 'Failed to delete promo code' }, { status: 500 });
  }
}
