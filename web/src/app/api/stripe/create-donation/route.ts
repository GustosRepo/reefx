import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/utils/stripe';
import { createClient } from '@/utils/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get current user (optional for donations)
    const { data: { user } } = await supabase.auth.getUser();

    const { amount } = await request.json();

    // Validate amount (in dollars)
    const validAmounts = [3, 5, 10, 25];
    if (!validAmounts.includes(amount)) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    }

    // Create a one-time payment checkout session
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `☕ Support REEFXONE`,
              description: `Thank you for supporting the reef community! 🐠`,
            },
            unit_amount: amount * 100, // Convert to cents
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/subscription?donation=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/subscription?donation=cancelled`,
      metadata: {
        type: 'donation',
        user_id: user?.id || 'anonymous',
        amount: amount.toString(),
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Donation checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to create donation checkout' },
      { status: 500 }
    );
  }
}
