import { useEffect, useRef, useState } from 'react';
import type { StripeCardElement } from '@stripe/stripe-js';
import { Button } from '../../../components/Button';
import { CARD_OPTIONS, DEMO_TEST_CARDS, getStripe, stripeEnabled, stripeErrorMessage } from '../../../services/stripe';
import { paymentsApi } from '../api/paymentsApi';
import { useAddPaymentMethod } from '../hooks/usePayments';

/**
 * Registers a card. With Stripe configured, the card is typed into Stripe's
 * iframe and confirmed through a SetupIntent; only the resulting payment
 * method id is sent to GoodFood. In demo mode, one of Stripe's test cards is
 * picked instead.
 */
export function AddCardForm({ onDone, onCancel }: { onDone: () => void; onCancel: () => void }) {
  const addMethod = useAddPaymentMethod();
  const [isDefault, setIsDefault] = useState(false);
  const [demoCard, setDemoCard] = useState<string>(DEMO_TEST_CARDS[0].id);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const mountRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<StripeCardElement | null>(null);

  useEffect(() => {
    if (!stripeEnabled) return;
    let card: StripeCardElement | null = null;
    void getStripe().then((stripe) => {
      if (!stripe || !mountRef.current) return;
      card = stripe.elements({ locale: 'fr' }).create('card', CARD_OPTIONS);
      card.mount(mountRef.current);
      cardRef.current = card;
    });
    return () => card?.destroy();
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      let paymentMethodId = demoCard;
      if (stripeEnabled) {
        const stripe = await getStripe();
        if (!stripe || !cardRef.current) throw new Error('Le formulaire de carte n’est pas prêt.');
        const { client_secret } = await paymentsApi.createCardSetup();
        const result = await stripe.confirmCardSetup(client_secret, { payment_method: { card: cardRef.current } });
        if (result.error || !result.setupIntent?.payment_method) {
          throw new Error(stripeErrorMessage(result.error, 'Carte refusée.'));
        }
        paymentMethodId = String(result.setupIntent.payment_method);
      }
      await addMethod.mutateAsync({ payment_method_id: paymentMethodId, is_default: isDefault });
      onDone();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      {stripeEnabled ? (
        <div>
          <p className="mb-1.5 text-sm font-semibold text-neutral-700">Carte bancaire</p>
          <div ref={mountRef} className="rounded-xl border border-brand/15 bg-white px-4 py-3" />
          <p className="mt-1.5 text-xs text-neutral-400">
            Saisie sécurisée par Stripe : le numéro de carte ne transite jamais par nos serveurs.
          </p>
        </div>
      ) : (
        <fieldset className="space-y-2">
          <legend className="mb-1.5 text-sm font-semibold text-neutral-700">Carte de test (mode démonstration)</legend>
          {DEMO_TEST_CARDS.map((c) => (
            <label key={c.id} className="flex items-center gap-2 text-sm text-neutral-600">
              <input type="radio" name="demo-card" checked={demoCard === c.id} onChange={() => setDemoCard(c.id)} />
              {c.label}
            </label>
          ))}
        </fieldset>
      )}
      <label className="flex items-center gap-2 text-sm font-semibold text-neutral-600">
        <input type="checkbox" checked={isDefault} onChange={(e) => setIsDefault(e.target.checked)} />
        Définir comme moyen de paiement par défaut
      </label>
      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
      <div className="flex gap-2">
        <Button type="submit" disabled={busy}>
          {busy ? 'Ajout…' : 'Ajouter la carte'}
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel}>
          Annuler
        </Button>
      </div>
    </form>
  );
}
