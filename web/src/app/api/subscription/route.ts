import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get subscription
    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .select('tier, status, end_date')
      .eq('user_id', user.id)
      .single();

    console.log('📊 Subscription query result for user', user.id);
    console.log('Data:', subscription);
    console.log('Error:', error);

    if (error) {
      console.error('❌ Error fetching subscription:', error);
      return NextResponse.json({ error: 'Failed to fetch subscription' }, { status: 500 });
    }

    let result = subscription || { tier: 'free', status: 'active', end_date: null };
    
    // If subscription has ended, downgrade to free tier
    if (result.end_date && new Date(result.end_date) < new Date()) {
      console.log('⏰ Subscription expired, downgrading to free tier');
      
      // Update database to free tier
      await supabase
        .from('subscriptions')
        .update({
          tier: 'free',
          status: 'expired',
          stripe_subscription_id: null,
          start_date: null,
          end_date: null,
        })
        .eq('user_id', user.id);
      
      result = { tier: 'free', status: 'expired', end_date: null };
    }
    
    console.log('✅ Returning subscription:', result);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in subscription API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
