import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

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
