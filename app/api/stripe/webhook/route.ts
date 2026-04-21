import { NextRequest, NextResponse } from 'next/server';
import { stripe, PLANS, PlanKey } from '@/lib/stripe';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const PLAN_LIMITS: Record<PlanKey, { monthly_session_limit: number; session_hard_cap: number; api_cost_limit: number }> = {
  pro:     { monthly_session_limit: 500, session_hard_cap: 9999, api_cost_limit: 100.00 },
  student: { monthly_session_limit: 20,  session_hard_cap: 20,   api_cost_limit: 6.00   },
};

export async function POST(request: NextRequest) {
  const body = await request.text();
  const sig = request.headers.get('stripe-signature');

  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Missing signature or webhook secret' }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.supabase_user_id;
        const plan = session.metadata?.plan as PlanKey | undefined;

        const interval = session.metadata?.interval ?? 'monthly';

        if (userId && plan && PLAN_LIMITS[plan]) {
          const { error: updateError } = await supabase.from('users').update({
            plan,
            billing_interval: interval,
            stripe_customer_id: session.customer as string,
            stripe_subscription_id: session.subscription as string,
            monthly_session_limit: PLAN_LIMITS[plan].monthly_session_limit,
            session_hard_cap: PLAN_LIMITS[plan].session_hard_cap,
            api_cost_limit: PLAN_LIMITS[plan].api_cost_limit,
          }).eq('id', userId);
          if (updateError) console.error('DB update error:', updateError);
        }
        break;
      }

      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription;
        const customerId = sub.customer as string;

        const { data: user } = await supabase
          .from('users')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .single();

        if (user) {
          const status = sub.status;
          // If subscription becomes past_due or canceled, revert to free
          if (status === 'past_due' || status === 'canceled' || status === 'unpaid') {
            await supabase.from('users').update({
              plan: 'free',
              monthly_session_limit: 5,
              stripe_subscription_id: null,
            }).eq('id', user.id);
          }
        }
        break;
      }

      case 'invoice.paid': {
        // Reset session count on each billing cycle for paid users
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;

        const { data: user } = await supabase
          .from('users')
          .select('id, plan')
          .eq('stripe_customer_id', customerId)
          .single();

        if (user && (user.plan === 'pro' || user.plan === 'student')) {
          await supabase.from('users').update({
            sessions_used_this_month: 0,
            sessions_reset_at: new Date().toISOString(),
          }).eq('id', user.id);
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription;
        const customerId = sub.customer as string;

        const { data: user } = await supabase
          .from('users')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .single();

        if (user) {
          await supabase.from('users').update({
            plan: 'free',
            monthly_session_limit: 5,
            stripe_subscription_id: null,
          }).eq('id', user.id);
        }
        break;
      }

      default:
        // Unhandled event — ignore silently
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}
