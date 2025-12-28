import { createClient } from '@/utils/supabase/server';
import { NextResponse, NextRequest } from 'next/server';

// GET /api/equipment - Fetch all equipment for authenticated user
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Get tank_id from query params for filtering
  const { searchParams } = new URL(request.url);
  const tankId = searchParams.get('tank_id');

  // Join with tanks to get tank name
  let query = supabase
    .from('equipment')
    .select('*, tanks(name)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  // Filter by tank if specified
  if (tankId) {
    query = query.eq('tank_id', tankId);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Map to include tank_name
  const mapped = data?.map(item => ({
    ...item,
    tank_name: item.tanks?.name || 'Unknown Tank',
  })) || [];

  return NextResponse.json(mapped);
}

// POST /api/equipment - Create new equipment entry
export async function POST(request: Request) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  
  const { data, error } = await supabase
    .from('equipment')
    .insert({
      user_id: user.id,
      tank_id: body.tank_id,
      name: body.name,
      category: body.category,
      brand: body.brand,
      model: body.model,
      purchase_date: body.purchase_date,
      purchase_price: body.purchase_price,
      warranty_expires: body.warranty_until,
      notes: body.notes,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
