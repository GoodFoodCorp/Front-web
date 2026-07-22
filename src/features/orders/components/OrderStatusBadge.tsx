import { Badge, type BadgeTone } from '../../../components/Badge';
import type { OrderStatus } from '../types/order.types';

const LABELS: Record<OrderStatus, { text: string; tone: BadgeTone }> = {
  PLACED: { text: 'Passée', tone: 'gray' },
  PAYMENT_PENDING: { text: 'Paiement en attente', tone: 'yellow' },
  CONFIRMED: { text: 'Confirmée', tone: 'blue' },
  IN_PREPARATION: { text: 'En préparation', tone: 'yellow' },
  READY_FOR_PICKUP: { text: 'Prête', tone: 'green' },
  IN_DELIVERY: { text: 'En livraison', tone: 'blue' },
  DELIVERED: { text: 'Livrée', tone: 'green' },
  CANCELLED: { text: 'Annulée', tone: 'red' },
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const { text, tone } = LABELS[status];
  return <Badge tone={tone}>{text}</Badge>;
}
