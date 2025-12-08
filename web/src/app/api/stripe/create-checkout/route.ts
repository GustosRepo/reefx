import { NextRequest, NextResponse } from 'next/server';
import { stripe, STRIPE_PRICES } from '@/utils/stripe';
import { createClient } from '@/utils/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { priceId, tier } = await request.json();

    console.log('🛒 Creating checkout for user:', user.id);
    console.log('Price ID:', priceId);
    console.log('Tier:', tier);

    // Validate price ID
    if (!priceId || !priceId.startsWith('price_')) {
      console.error('❌ Invalid price ID:', priceId);
      return NextResponse.json({ error: 'Invalid price ID' }, { status: 400 });
    }

    // Validate tier
    if (!tier || !['premium', 'super-premium'].includes(tier)) {
      console.error('❌ Invalid tier:', tier);
      return NextResponse.json({ error: 'Invalid tier' }, { status: 400 });
    }

    // Get user's email
    const email = user.email;
    if (!email) {
      return NextResponse.json({ error: 'User email not found' }, { status: 400 });
    }

    // Create or retrieve Stripe customer
    let customerId: string;
    
    // Check if user already has a Stripe customer ID
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .single();

    if (subscription?.stripe_customer_id) {
      customerId = subscription.stripe_customer_id;
    } else {
      // Create new Stripe customer
      const customer = await stripe.customers.create({
        email,
        metadata: {
          supabase_user_id: user.id,
        },
      });
      customerId = customer.id;

      // Update subscription record with customer ID
      await supabase
        .from('subscriptions')
        .update({ stripe_customer_id: customerId })
        .eq('user_id', user.id);
    }

    // Create Checkout Session
    console.log('Creating Stripe checkout session with metadata:', { user_id: user.id, tier });
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/subscription?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/subscription?canceled=true`,
      metadata: {
        user_id: user.id,
        tier,
      },
    });

    console.log('✅ Checkout session created:', session.id);
    console.log('Session metadata:', session.metadata);
    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
