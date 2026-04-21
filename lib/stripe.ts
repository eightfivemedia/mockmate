import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY environment variable is not set');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2026-03-25.dahlia' as const,
});

export const PLANS = {
  pro: {
    name: 'Job Seeker',
    monthly: { priceId: process.env.STRIPE_PRO_PRICE_ID!, price: 19 },
    yearly:  { priceId: process.env.STRIPE_PRO_YEARLY_PRICE_ID!, price: 192 },
    monthlyLimit: 500,
  },
  student: {
    name: 'Student',
    monthly: { priceId: process.env.STRIPE_STUDENT_PRICE_ID!, price: 11 },
    yearly:  { priceId: process.env.STRIPE_STUDENT_YEARLY_PRICE_ID!, price: 108 },
    monthlyLimit: 20,
  },
} as const;

export type PlanKey = keyof typeof PLANS;
export type BillingInterval = 'monthly' | 'yearly';
