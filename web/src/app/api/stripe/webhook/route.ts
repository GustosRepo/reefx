import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/utils/stripe';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

// Disable body parsing for webhook signature verification
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  // Use service role key to bypass RLS for webhook operations
  const supabase = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        
        if (session.mode === 'subscription' && session.subscription) {
          const userId = session.metadata?.user_id;
          const tier = session.metadata?.tier;
          const promoCode = session.metadata?.promo_code;

          if (!userId || !tier) {
            console.error('Missing user_id or tier in session metadata:', session.metadata);
            break;
          }

          // Get subscription details
          const subscriptionResponse = await stripe.subscriptions.retrieve(
            session.subscription as string
          );
          const subscription = subscriptionResponse as unknown as Stripe.Subscription;

          // If promo code was used, look up the promo_code_id for affiliate tracking
          let promoCodeId = null;
          if (promoCode) {
            const { data: promoData } = await supabase
              .from('promo_codes')
              .select('id')
              .eq('code', promoCode.toUpperCase())
              .single();
            
            if (promoData) {
              promoCodeId = promoData.id;
            }
          }

          // Upsert subscription in database
          const { error } = await supabase
            .from('subscriptions')
            .upsert({
              user_id: userId,
              tier,
              status: subscription.status,
              stripe_subscription_id: subscription.id,
              stripe_customer_id: session.customer as string,
              start_date: new Date((subscription as any).current_period_start * 1000).toISOString(),
              end_date: new Date((subscription as any).current_period_end * 1000).toISOString(),
              referred_by_promo_code_id: promoCodeId,
            }, {
              onConflict: 'user_id'
            });

          if (error) {
            console.error('Database update error:', error);
          }
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        
        // Find user by customer ID
        const { data: subscriptionData } = await supabase
          .from('subscriptions')
          .select('user_id')
          .eq('stripe_customer_id', subscription.customer as string)
          .single();

        if (subscriptionData) {
          await supabase
            .from('subscriptions')
            .update({
              status: subscription.status,
              start_date: new Date((subscription as any).current_period_start * 1000).toISOString(),
              end_date: new Date((subscription as any).current_period_end * 1000).toISOString(),
            })
            .eq('user_id', subscriptionData.user_id);
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        
        // Find user by customer ID
        const { data: subscriptionData } = await supabase
          .from('subscriptions')
          .select('user_id, tier, end_date')
          .eq('stripe_customer_id', subscription.customer as string)
          .single();

        if (subscriptionData) {
          const hasEnded = subscriptionData.end_date && new Date(subscriptionData.end_date) < new Date();
          
          if (hasEnded) {
            await supabase
              .from('subscriptions')
              .update({
                tier: 'free',
                status: 'canceled',
                stripe_subscription_id: null,
                start_date: null,
                end_date: null,
              })
              .eq('user_id', subscriptionData.user_id);
          } else {
            await supabase
              .from('subscriptions')
              .update({
                status: 'canceled',
                stripe_subscription_id: null,
              })
              .eq('user_id', subscriptionData.user_id);
          }
        }
        break;
      }

      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice;
        
        // Track affiliate earnings if this subscription was referred
        if (invoice.subscription && invoice.amount_paid > 0) {
          const { data: subData } = await supabase
            .from('subscriptions')
            .select('user_id, tier, referred_by_promo_code_id')
            .eq('stripe_subscription_id', invoice.subscription as string)
            .single();
          
          if (subData?.referred_by_promo_code_id) {
            const commissionRate = 0.05;
            const commissionAmount = Math.round(invoice.amount_paid * commissionRate);
            
            const { error: earningError } = await supabase
              .from('affiliate_earnings')
              .insert({
                promo_code_id: subData.referred_by_promo_code_id,
                user_id: subData.user_id,
                stripe_invoice_id: invoice.id,
                stripe_payment_intent_id: invoice.payment_intent as string,
                payment_amount_cents: invoice.amount_paid,
                commission_rate: commissionRate,
                commission_amount_cents: commissionAmount,
                subscription_tier: subData.tier,
                status: 'pending',
              });
            
            if (earningError && earningError.code !== '23505') {
              console.error('Error recording affiliate earning:', earningError);
            }
          }
        }
        break;
      }

      case 'invoice.payment_failed': {
        // Payment failed - Stripe will retry automatically
        break;
      }

      default:
        // Unhandled event type - ignore silently
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
