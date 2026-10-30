import { useEffect, useRef } from 'react';
import type { StripeCardElement } from '@stripe/stripe-js';
import { CARD_STYLE, getStripe } from '../../../services/stripe';

/**
 * A card typed for this payment only (not saved). The number is typed into
 * Stripe's iframe and never reaches Good Food's servers.
 */
export function NewCardField({
  onReady,
  onComplete,
}: {
  onReady: (card: StripeCardElement | null) => void;
  onComplete: (complete: boolean) => void;
}) {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let card: StripeCardElement | null = null;
    let cancelled = false;
    void getStripe().then((stripe) => {
      if (cancelled || !stripe || !mountRef.current) return;
      card = stripe.elements({ locale: 'fr' }).create('card', { hidePostalCode: true, style: CARD_STYLE });
      card.on('change', (e) => onComplete(e.complete));
      card.mount(mountRef.current);
      onReady(card);
    });
    return () => {
      cancelled = true;
      card?.destroy();
      onReady(null);
      onComplete(false);
    };
    // Mounted once: the callbacks are state setters.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <div ref={mountRef} className="rounded-xl border border-brand/15 bg-white px-4 py-3" />;
}
