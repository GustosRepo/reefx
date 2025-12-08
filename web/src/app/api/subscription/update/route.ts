import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

// Manual subscription update endpoint (for testing)
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { tier } = await request.json();

    if (!tier || !['free', 'premium', 'super-premium'].includes(tier)) {
      return NextResponse.json({ error: 'Invalid tier' }, { status: 400 });
    }

    // Update subscription
    const { error: updateError } = await supabase
      .from('subscriptions')
      .update({
        tier,
        status: 'active',
        start_date: new Date().toISOString(),
        end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
      })
      .eq('user_id', user.id);

    if (updateError) {
      console.error('Error updating subscription:', updateError);
      return NextResponse.json({ error: 'Failed to update subscription' }, { status: 500 });
    }

    return NextResponse.json({ success: true, tier });
  } catch (error) {
    console.error('Error in manual update:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
