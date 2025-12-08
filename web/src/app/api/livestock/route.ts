import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

// GET /api/livestock - Fetch all livestock for authenticated user
export async function GET() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data, error } = await supabase
    .from('livestock')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

// POST /api/livestock - Create new livestock entry
export async function POST(request: Request) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  
  const { data, error } = await supabase
    .from('livestock')
    .insert({
      user_id: user.id,
      tank_id: body.tank_id,
      type: body.type,
      name: body.name,
      species: body.species,
      date_added: body.added_date,
      status: body.health_status || 'healthy',
      notes: body.notes,
      cost: body.purchase_price,
      source: body.vendor,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
