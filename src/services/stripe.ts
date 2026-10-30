import { loadStripe, type Stripe, type StripeError } from '@stripe/stripe-js';

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
  // French: Stripe's own field and error messages follow this locale.
  stripePromise ??= loadStripe(publishableKey, { locale: 'fr' });
  return stripePromise;
}

/** Stripe's public test cards, usable in demo mode (fake gateway) and in
 *  Stripe test mode alike. */
export const DEMO_TEST_CARDS = [
  { id: 'pm_card_visa', label: 'Visa •••• 4242' },
  { id: 'pm_card_mastercard', label: 'Mastercard •••• 4444' },
  { id: 'pm_card_amex', label: 'American Express •••• 8431' },
] as const;

/** Why the bank refused, in the customer's words (Stripe's own message is
 *  kept for what is not listed: it is already in French, see locale). */
const DECLINES: Record<string, string> = {
  insufficient_funds: 'Fonds insuffisants sur cette carte. Utilisez une autre carte.',
  card_declined: 'Votre banque a refusé cette carte. Utilisez une autre carte.',
  generic_decline: 'Votre banque a refusé cette carte. Utilisez une autre carte.',
  do_not_honor: 'Votre banque a refusé cette carte. Contactez-la ou utilisez une autre carte.',
  lost_card: 'Cette carte a été déclarée perdue. Utilisez une autre carte.',
  stolen_card: 'Cette carte a été déclarée volée. Utilisez une autre carte.',
  expired_card: 'Cette carte a expiré. Utilisez une autre carte.',
  incorrect_cvc: 'Le code de sécurité (CVC) est incorrect.',
  invalid_cvc: 'Le code de sécurité (CVC) est incorrect.',
  incorrect_number: 'Le numéro de carte est incorrect.',
  processing_error: 'Erreur de traitement chez la banque. Réessayez dans un instant.',
  card_velocity_exceeded: 'Cette carte a atteint sa limite. Utilisez une autre carte.',
  payment_intent_authentication_failure: "L'authentification 3-D Secure a échoué ou a été annulée.",
  setup_intent_authentication_failure: "L'authentification 3-D Secure a échoué ou a été annulée.",
};

export function stripeErrorMessage(error: StripeError | undefined, fallback = 'Paiement refusé.'): string {
  if (!error) return fallback;
  return (
    (error.decline_code && DECLINES[error.decline_code]) ||
    (error.code && DECLINES[error.code]) ||
    error.message ||
    fallback
  );
}

/** Stripe's card field, in the site's font and colours. */
export const CARD_STYLE = {
  base: {
    fontSize: '15px',
    color: '#1c2321',
    fontFamily: '"Open Sans", sans-serif',
    '::placeholder': { color: '#a3a3a3' },
  },
  invalid: { color: '#dc2626' },
};
