import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

// GET /api/equipment - Fetch all equipment for authenticated user
export async function GET() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data, error } = await supabase
    .from('equipment')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
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
      warranty_until: body.warranty_until,
      notes: body.notes,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
