import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return NextResponse.json({ error: 'Not logged in' }, { status: 401 });
  }

  // Check what data exists for this user
  const { data: tanks } = await supabase
    .from('tanks')
    .select('*')
    .eq('user_id', user.id);

  const { data: logs } = await supabase
    .from('reef_logs')
    .select('*')
    .eq('user_id', user.id);

  const { data: maintenance } = await supabase
    .from('maintenance')
    .select('*')
    .eq('user_id', user.id);

  const { data: equipment } = await supabase
    .from('equipment')
    .select('*')
    .eq('user_id', user.id);

  const { data: livestock } = await supabase
    .from('livestock')
    .select('*')
    .eq('user_id', user.id);

  return NextResponse.json({
    currentUserId: user.id,
    currentUserEmail: user.email,
    tanks: tanks?.length || 0,
    logs: logs?.length || 0,
    maintenance: maintenance?.length || 0,
    equipment: equipment?.length || 0,
    livestock: livestock?.length || 0,
    details: {
      tanks,
      logs,
      maintenance,
      equipment,
      livestock,
    }
  });
}
