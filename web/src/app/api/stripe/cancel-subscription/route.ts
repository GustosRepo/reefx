import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/utils/stripe';
import { createClient } from '@/utils/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's subscription
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .select('stripe_subscription_id, tier, status, end_date')
      .eq('user_id', user.id)
      .single();

    if (subError || !subscription) {
      return NextResponse.json({ error: 'No subscription found' }, { status: 404 });
    }

    if (!subscription.stripe_subscription_id) {
      return NextResponse.json({ error: 'No active Stripe subscription' }, { status: 400 });
    }

    if (subscription.tier === 'free') {
      return NextResponse.json({ error: 'Already on free tier' }, { status: 400 });
    }

    // Check if already canceled
    if (subscription.status === 'canceled') {
      const endDate = subscription.end_date ? new Date(subscription.end_date).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }) : 'the end of your billing period';
      
      return NextResponse.json({ 
        success: true,
        alreadyCanceled: true,
        message: `Your subscription is already canceled. You'll have access until ${endDate}.`,
        end_date: subscription.end_date
      });
    }

    console.log('Canceling subscription:', subscription.stripe_subscription_id);

    // Cancel the subscription at period end (user keeps access until end of billing period)
    const canceledSubscription = await stripe.subscriptions.update(
      subscription.stripe_subscription_id,
      {
        cancel_at_period_end: true,
      }
    );

    console.log('Subscription canceled:', canceledSubscription.id);

    // Update subscription status in database
    await supabase
      .from('subscriptions')
      .update({
        status: 'canceled',
      })
      .eq('user_id', user.id);

    return NextResponse.json({ 
      success: true,
      message: 'Subscription canceled. You will have access until the end of your billing period.',
      cancel_at: canceledSubscription.cancel_at 
    });
  } catch (error) {
    console.error('Error canceling subscription:', error);
    return NextResponse.json(
      { error: 'Failed to cancel subscription' },
      { status: 500 }
    );
  }
}
