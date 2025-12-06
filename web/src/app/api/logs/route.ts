import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

// GET /api/logs - Fetch all logs for authenticated user
export async function GET() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data, error } = await supabase
    .from('reef_logs')
    .select('*')
    .eq('user_id', user.id)
    .order('log_date', { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Map log_date to date for frontend compatibility
  const mapped = data?.map(log => ({ ...log, date: log.log_date })) || [];
  return NextResponse.json(mapped);
}

// POST /api/logs - Create new log entry
export async function POST(request: Request) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  
  // Get user's first tank (created by trigger on signup)
  const { data: tanks } = await supabase
    .from('tanks')
    .select('id')
    .eq('user_id', user.id)
    .limit(1);
  
  if (!tanks || tanks.length === 0) {
    return NextResponse.json({ error: 'No tank found. Please create a tank first.' }, { status: 400 });
  }
  
  const { data, error } = await supabase
    .from('reef_logs')
    .insert({
      user_id: user.id,
      tank_id: tanks[0].id,
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
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Map log_date to date for frontend compatibility
  const mapped = { ...data, date: data.log_date };
  return NextResponse.json(mapped);
}
