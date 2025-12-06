import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

// PUT /api/logs/[id] - Update existing log
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
    .from('reef_logs')
    .update({
      log_date: body.date,
      temp: body.temp,
      salinity: body.salinity,
      alk: body.alk,
      ph: body.ph,
      cal: body.cal,
      mag: body.mag,
      po4: body.po4,
      no3: body.no3,
    })
    .eq('id', params.id)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Map log_date to date for frontend compatibility
  const mapped = { ...data, date: data.log_date };
  return NextResponse.json(mapped);
}

// DELETE /api/logs/[id] - Delete log
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
    .from('reef_logs')
    .delete()
    .eq('id', params.id)
    .eq('user_id', user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
