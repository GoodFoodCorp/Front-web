import { describe, expect, it } from 'vitest';
import type { StripeError } from '@stripe/stripe-js';
import { stripeErrorMessage } from './stripe';

const declined = (fields: Partial<StripeError>) => ({ type: 'card_error', ...fields }) as StripeError;

describe('stripeErrorMessage', () => {
  it('says why the bank refused, in French', () => {
    expect(stripeErrorMessage(declined({ code: 'card_declined', decline_code: 'insufficient_funds' }))).toBe(
      'Fonds insuffisants sur cette carte. Utilisez une autre carte.',
    );
    expect(stripeErrorMessage(declined({ code: 'expired_card' }))).toMatch(/expiré/);
    expect(stripeErrorMessage(declined({ code: 'payment_intent_authentication_failure' }))).toMatch(/3-D Secure/);
  });

  it("keeps Stripe's own message otherwise, and has a fallback", () => {
    expect(stripeErrorMessage(declined({ code: 'other', message: 'Numéro incomplet.' }))).toBe('Numéro incomplet.');
    expect(stripeErrorMessage(undefined, 'Carte refusée.')).toBe('Carte refusée.');
  });
});
