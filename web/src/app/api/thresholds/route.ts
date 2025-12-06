import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

// GET /api/thresholds - Fetch user's thresholds
export async function GET() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data, error } = await supabase
    .from('thresholds')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (error) {
    // If no thresholds exist, return defaults
    if (error.code === 'PGRST116') {
      return NextResponse.json({
        temp_min: 75,
        temp_max: 81,
        salinity_min: 33,
        salinity_max: 36,
        alk_min: 7,
        alk_max: 10,
        ph_min: 8.0,
        ph_max: 8.4,
        cal_min: 400,
        cal_max: 450,
        mag_min: 1250,
        mag_max: 1400,
        po4_min: 0,
        po4_max: 0.1,
        no3_min: 0,
        no3_max: 10,
      });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

// PUT /api/thresholds - Update user's thresholds
export async function PUT(request: Request) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  
  // Try to update first
  const { data, error } = await supabase
    .from('thresholds')
    .upsert({
      user_id: user.id,
      temp_min: body.temp_min,
      temp_max: body.temp_max,
      salinity_min: body.salinity_min,
      salinity_max: body.salinity_max,
      alk_min: body.alk_min,
      alk_max: body.alk_max,
      ph_min: body.ph_min,
      ph_max: body.ph_max,
      cal_min: body.cal_min,
      cal_max: body.cal_max,
      mag_min: body.mag_min,
      mag_max: body.mag_max,
      po4_min: body.po4_min,
      po4_max: body.po4_max,
      no3_min: body.no3_min,
      no3_max: body.no3_max,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
