import { Badge, type BadgeTone } from '../../../components/Badge';
import type { DeliveryStatus } from '../types/delivery.types';

const LABELS: Record<DeliveryStatus, { text: string; tone: BadgeTone }> = {
  UNASSIGNED: { text: 'En attente de livreur', tone: 'yellow' },
  ASSIGNED: { text: 'Livreur en route vers le restaurant', tone: 'blue' },
  PICKED_UP: { text: 'Récupérée par le livreur', tone: 'blue' },
  IN_TRANSIT: { text: 'En cours de livraison', tone: 'blue' },
  DELIVERED: { text: 'Livrée', tone: 'green' },
  CANCELLED: { text: 'Annulée', tone: 'red' },
};

export function DeliveryStatusBadge({ status }: { status: DeliveryStatus }) {
  const { text, tone } = LABELS[status];
  return <Badge tone={tone}>{text}</Badge>;
}
