import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import { TANK_LIMITS, SubscriptionTier } from '@/utils/subscription';

// GET /api/tanks - Fetch all tanks for authenticated user
export async function GET() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data, error } = await supabase
    .from('tanks')
    .select('*')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .order('created_at', { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // If no tanks exist, create a default one
  if (!data || data.length === 0) {
    const { data: newTank, error: createError } = await supabase
      .from('tanks')
      .insert({
        user_id: user.id,
        name: 'Main Tank',
        is_active: true,
      })
      .select()
      .single();

    if (createError) {
      return NextResponse.json({ error: createError.message }, { status: 500 });
    }

    return NextResponse.json([newTank]);
  }

  return NextResponse.json(data);
}

// POST /api/tanks - Create a new tank (checks tier limit)
export async function POST(request: Request) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Get user's subscription tier
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('tier')
    .eq('user_id', user.id)
    .single();

  const tier: SubscriptionTier = subscription?.tier || 'free';
  const tankLimit = TANK_LIMITS[tier];

  // Count existing tanks
  const { count } = await supabase
    .from('tanks')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('is_active', true);

  if ((count || 0) >= tankLimit) {
    const upgradeMessage = tier === 'free' || tier === 'premium'
      ? 'Upgrade to Super Premium to manage up to 10 tanks!'
      : 'You have reached the maximum number of tanks.';
    return NextResponse.json({ 
      error: `Tank limit reached (${tankLimit}). ${upgradeMessage}` 
    }, { status: 403 });
  }

  const body = await request.json();
  
  const { data, error } = await supabase
    .from('tanks')
    .insert({
      user_id: user.id,
      name: body.name || 'New Tank',
      size_gallons: body.size_gallons || null,
      type: body.type || null,
      setup_date: body.setup_date || null,
      notes: body.notes || null,
      is_active: true,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

// PUT /api/tanks - Update a tank
export async function PUT(request: Request) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  
  if (!body.id) {
    return NextResponse.json({ error: 'Tank ID is required' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('tanks')
    .update({
      name: body.name,
      size_gallons: body.size_gallons,
      type: body.type,
      setup_date: body.setup_date,
      notes: body.notes,
      updated_at: new Date().toISOString(),
    })
    .eq('id', body.id)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

// DELETE /api/tanks - Soft delete a tank
export async function DELETE(request: Request) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const tankId = searchParams.get('id');

  if (!tankId) {
    return NextResponse.json({ error: 'Tank ID is required' }, { status: 400 });
  }

  // Check if this is the user's only active tank
  const { count } = await supabase
    .from('tanks')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('is_active', true);

  if ((count || 0) <= 1) {
    return NextResponse.json({ error: 'Cannot delete your only tank' }, { status: 400 });
  }

  // Soft delete - set is_active to false
  const { error } = await supabase
    .from('tanks')
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .eq('id', tankId)
    .eq('user_id', user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
