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
        console.log('🔔 checkout.session.completed received');
        console.log('Session mode:', session.mode);
        console.log('Session subscription:', session.subscription);
        console.log('Session metadata:', session.metadata);
        
        if (session.mode === 'subscription' && session.subscription) {
          const userId = session.metadata?.user_id;
          const tier = session.metadata?.tier;
          const promoCode = session.metadata?.promo_code; // Track which promo code was used

          if (!userId || !tier) {
            console.error('❌ Missing user_id or tier in session metadata');
            console.error('Metadata:', session.metadata);
            break;
          }

          console.log(`✅ Processing subscription for user ${userId}, tier: ${tier}, promo: ${promoCode || 'none'}`);

          // Get subscription details
          const subscriptionResponse = await stripe.subscriptions.retrieve(
            session.subscription as string
          );
          const subscription = subscriptionResponse as unknown as Stripe.Subscription;

          console.log('Subscription details:', {
            id: subscription.id,
            status: subscription.status,
            customer: session.customer,
            start: (subscription as any).current_period_start,
            end: (subscription as any).current_period_end
          });

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
              console.log(`✅ Found promo code ID: ${promoCodeId} for code: ${promoCode}`);
            }
          }

          // Upsert subscription in database (create if doesn't exist, update if does)
          const { data, error } = await supabase
            .from('subscriptions')
            .upsert({
              user_id: userId,
              tier,
              status: subscription.status,
              stripe_subscription_id: subscription.id,
              stripe_customer_id: session.customer as string,
              start_date: new Date((subscription as any).current_period_start * 1000).toISOString(),
              end_date: new Date((subscription as any).current_period_end * 1000).toISOString(),
              referred_by_promo_code_id: promoCodeId, // Track affiliate referral
            }, {
              onConflict: 'user_id'
            })
            .select();

          if (error) {
            console.error('❌ Database update error:', error);
          } else {
            console.log('✅ Database updated successfully:', data);
          }

          console.log(`✅ Subscription created for user ${userId}: ${tier}`);
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

          console.log(`Subscription updated for user ${subscriptionData.user_id}`);
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
          // Check if subscription has already ended
          const hasEnded = subscriptionData.end_date && new Date(subscriptionData.end_date) < new Date();
          
          if (hasEnded) {
            // Period already ended, downgrade immediately
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
            
            console.log(`✅ Subscription ended and downgraded to free for user ${subscriptionData.user_id}`);
          } else {
            // Keep tier until end_date, just mark as canceled
            await supabase
              .from('subscriptions')
              .update({
                status: 'canceled',
                stripe_subscription_id: null,
              })
              .eq('user_id', subscriptionData.user_id);
            
            console.log(`✅ Subscription canceled but keeping ${subscriptionData.tier} access until ${subscriptionData.end_date} for user ${subscriptionData.user_id}`);
          }
        }
        break;
      }

      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice;
        console.log(`💰 Invoice paid: ${invoice.id}, amount: ${invoice.amount_paid} cents`);
        
        // Track affiliate earnings if this subscription was referred
        if (invoice.subscription && invoice.amount_paid > 0) {
          // Find the subscription and check if it was referred by a promo code
          const { data: subData } = await supabase
            .from('subscriptions')
            .select('user_id, tier, referred_by_promo_code_id')
            .eq('stripe_subscription_id', invoice.subscription as string)
            .single();
          
          if (subData?.referred_by_promo_code_id) {
            // Calculate 5% commission
            const commissionRate = 0.05;
            const commissionAmount = Math.round(invoice.amount_paid * commissionRate);
            
            // Record the affiliate earning
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
            
            if (earningError) {
              // Might fail if duplicate - that's OK
              if (earningError.code !== '23505') { // Not a duplicate
                console.error('❌ Error recording affiliate earning:', earningError);
              }
            } else {
              console.log(`✅ Affiliate earning recorded: $${(commissionAmount / 100).toFixed(2)} for promo code ${subData.referred_by_promo_code_id}`);
            }
          }
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        console.log(`Invoice payment failed: ${invoice.id}`);
        
        // Optionally notify user or mark subscription as past_due
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
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
