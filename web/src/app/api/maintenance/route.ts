import { createClient } from '@/utils/supabase/server';
import { NextResponse, NextRequest } from 'next/server';

// GET /api/maintenance - Fetch all maintenance entries for authenticated user
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Get tank_id from query params
  const { searchParams } = new URL(request.url);
  const tankId = searchParams.get('tank_id');

  let query = supabase
    .from('maintenance')
    .select('*')
    .eq('user_id', user.id)
    .order('due_date', { ascending: false });

  // Filter by tank if specified
  if (tankId) {
    query = query.eq('tank_id', tankId);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Map database fields to frontend format
  const mapped = data?.map(entry => ({
    ...entry,
    date: entry.due_date,
    type: entry.task,
    notes: entry.description,
    repeatInterval: entry.repeat_interval,
  })) || [];

  return NextResponse.json(mapped);
}

// POST /api/maintenance - Create new maintenance entry
export async function POST(request: Request) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  
  const { data, error } = await supabase
    .from('maintenance')
    .insert({
      user_id: user.id,
      tank_id: body.tank_id,
      task: body.task,
      due_date: body.date,
      status: body.status || 'pending',
      repeat_interval: body.repeat_interval,
      description: body.notes,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Map database fields to frontend format
  const mapped = {
    ...data,
    date: data.due_date,
    type: data.task,
    notes: data.description,
    repeatInterval: data.repeat_interval,
  };

  return NextResponse.json(mapped);
}
