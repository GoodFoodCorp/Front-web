import { loadStripe, type Stripe } from '@stripe/stripe-js';

/**
 * Stripe.js, loaded only when a publishable key is configured. Card numbers
 * are typed into Stripe's own iframe and sent to Stripe directly: they never
 * reach GoodFood's servers (PCI-DSS SAQ A). Without a key the platform runs
 * in demo mode against payment-service's fake gateway, with Stripe's public
 * test payment methods.
 */
const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY as string | undefined;

export const stripeEnabled = Boolean(publishableKey);

let stripePromise: Promise<Stripe | null> | null = null;

export function getStripe(): Promise<Stripe | null> {
  if (!publishableKey) return Promise.resolve(null);
  stripePromise ??= loadStripe(publishableKey);
  return stripePromise;
}

/** Stripe's public test cards, usable in demo mode (fake gateway) and in
 *  Stripe test mode alike. */
export const DEMO_TEST_CARDS = [
  { id: 'pm_card_visa', label: 'Visa •••• 4242' },
  { id: 'pm_card_mastercard', label: 'Mastercard •••• 4444' },
  { id: 'pm_card_amex', label: 'American Express •••• 8431' },
] as const;
