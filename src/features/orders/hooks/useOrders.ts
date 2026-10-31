import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ordersApi } from '../api/ordersApi';
import { ApiError } from '../../../services/http';
import { getStripe, stripeEnabled, stripeErrorMessage } from '../../../services/stripe';
import type { CheckoutRequest, Order, OrderStatus } from '../types/order.types';
import { BACKOFFICE_REFETCH_MS } from '../../../config/app.config';
import { useCartStore } from '../../../store/cartStore';
import { paymentsApi } from '../../payments/api/paymentsApi';
import type { StripeCardElement } from '@stripe/stripe-js';

/** Orders are listed a page at a time: a regular customer or a busy kitchen has thousands. */
export const ORDERS_PAGE = 20;

function nextOffset(last: Order[], pages: Order[][]) {
  return last.length === ORDERS_PAGE ? pages.length * ORDERS_PAGE : undefined;
}

export function useMyOrders() {
  return useInfiniteQuery({
    queryKey: ['orders', 'mine'],
    queryFn: ({ pageParam }) => ordersApi.listMine(ORDERS_PAGE, pageParam),
    initialPageParam: 0,
    getNextPageParam: nextOffset,
  });
}

export function useOrder(id: string | undefined) {
  return useQuery({
    queryKey: ['orders', id],
    queryFn: () => ordersApi.get(id!),
    enabled: !!id,
  });
}

export function useRestaurantOrders(restaurantId: string | null, statuses: OrderStatus[] = []) {
  return useInfiniteQuery({
    queryKey: ['orders', 'restaurant', restaurantId, statuses],
    queryFn: ({ pageParam }) => ordersApi.listByRestaurant(restaurantId!, statuses, ORDERS_PAGE, pageParam),
    initialPageParam: 0,
    getNextPageParam: nextOffset,
    enabled: !!restaurantId,
    refetchInterval: BACKOFFICE_REFETCH_MS,
  });
}

/**
 * Full checkout flow: create order → payment intent (Stripe test) → confirm.
 * Kept in the hook so the checkout page stays presentational.
 */
/** The confirmation may arrive a moment before payment-service sees the
 *  charge (or after its webhook confirmed the order): a few spaced retries. */
async function confirmWhenPaid(orderId: string, attempts = 4): Promise<Order> {
  for (let i = 1; ; i++) {
    try {
      return await ordersApi.confirm(orderId);
    } catch (err) {
      if (i >= attempts || !(err instanceof ApiError) || err.status !== 502) throw err;
      await new Promise((resolve) => setTimeout(resolve, 1500 * i));
    }
  }
}

/**
 * Places, pays and confirms an order. The amount is computed by the server;
 * with Stripe, the browser completes the payment (3-D Secure included) on
 * the intent created for the chosen saved card.
 */
export interface PaymentChoice {
  paymentMethodId?: string;
  newCard?: StripeCardElement;
  /** The customer agreed to keep the typed card for next time. */
  saveCard?: boolean;
}

/**
 * Pays an order (new, or one left awaiting payment) and confirms it. A typed
 * card is given to Stripe in the browser: the intent is created without one.
 * Once paid, a typed card the customer chose to keep is saved; that step
 * never fails the payment, it only reports itself.
 */
export async function payOrder(orderId: string, { paymentMethodId, newCard, saveCard }: PaymentChoice) {
  const intent = await ordersApi.createPaymentIntent(orderId, newCard ? undefined : paymentMethodId);
  if (stripeEnabled) {
    const stripe = await getStripe();
    if (!stripe || !intent.client_secret) throw new Error('Paiement indisponible pour le moment.');
    const result = newCard
      ? await stripe.confirmCardPayment(intent.client_secret, { payment_method: { card: newCard } })
      : await stripe.confirmCardPayment(intent.client_secret);
    if (result.error) throw new Error(stripeErrorMessage(result.error));
  }
  const order = await confirmWhenPaid(orderId);
  let cardSaved: boolean | undefined;
  if (stripeEnabled && newCard && saveCard) cardSaved = await saveTypedCard(newCard);
  return { order, cardSaved };
}

async function saveTypedCard(card: StripeCardElement): Promise<boolean> {
  try {
    const stripe = await getStripe();
    if (!stripe) return false;
    const { client_secret } = await paymentsApi.createCardSetup();
    const setup = await stripe.confirmCardSetup(client_secret, { payment_method: { card } });
    if (setup.error || !setup.setupIntent?.payment_method) return false;
    await paymentsApi.addMethod({ payment_method_id: String(setup.setupIntent.payment_method), is_default: false });
    return true;
  } catch {
    return false;
  }
}

export function useCheckout() {
  const queryClient = useQueryClient();
  const clearCart = useCartStore((s) => s.clear);

  return useMutation({
    mutationFn: async ({ order: payload, idempotencyKey, ...payment }: CheckoutRequest) => {
      const order = await ordersApi.create(payload, idempotencyKey);
      return payOrder(order.id, payment);
    },
    onSuccess: () => {
      clearCart();
      void queryClient.invalidateQueries({ queryKey: ['orders'] });
      void queryClient.invalidateQueries({ queryKey: ['payments', 'methods'] });
    },
  });
}

/** Pays an order left awaiting payment, from its page. */
export function usePayOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ orderId, ...payment }: PaymentChoice & { orderId: string }) => payOrder(orderId, payment),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['orders'] });
      void queryClient.invalidateQueries({ queryKey: ['payments', 'methods'] });
    },
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      ordersApi.updateStatus(id, status),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['orders'] }),
  });
}

export function useCancelOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason, comment }: { id: string; reason: string; comment: string }) =>
      ordersApi.cancel(id, reason, comment),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['orders'] }),
  });
}
