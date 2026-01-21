import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

// DEV ONLY - Manually expire subscription for testing
export async function POST() {
  // Block in production
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 });
  }

  try {
    const supabase = await createClient();
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Downgrade to free tier
    const { data, error } = await supabase
      .from('subscriptions')
      .update({
        tier: 'free',
        status: 'expired',
        stripe_subscription_id: null,
        start_date: null,
        end_date: null,
      })
      .eq('user_id', user.id)
      .select();

    if (error) {
      console.error('Error expiring subscription:', error);
      return NextResponse.json({ error: 'Failed to expire subscription' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Subscription expired and downgraded to free tier',
      data 
    });
  } catch (error) {
    console.error('Error expiring subscription:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
