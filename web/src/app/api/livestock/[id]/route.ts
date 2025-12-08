import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

// PUT /api/livestock/[id] - Update livestock entry
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  
  const { data, error } = await supabase
    .from('livestock')
    .update({
      type: body.type,
      name: body.name,
      species: body.species,
      date_added: body.added_date,
      status: body.health_status,
      notes: body.notes,
      cost: body.purchase_price,
      source: body.vendor,
    })
    .eq('id', params.id)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

// DELETE /api/livestock/[id] - Delete livestock entry
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { error } = await supabase
    .from('livestock')
    .delete()
    .eq('id', params.id)
    .eq('user_id', user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
