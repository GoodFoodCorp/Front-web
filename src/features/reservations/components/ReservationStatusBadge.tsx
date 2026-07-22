import { Badge, type BadgeTone } from '../../../components/Badge';
import type { ReservationStatus } from '../types/reservation.types';

const LABELS: Record<ReservationStatus, { text: string; tone: BadgeTone }> = {
  PENDING: { text: 'En attente', tone: 'yellow' },
  CONFIRMED: { text: 'Confirmée', tone: 'blue' },
  SEATED: { text: 'Installée', tone: 'green' },
  CANCELLED: { text: 'Annulée', tone: 'red' },
  NO_SHOW: { text: 'Non honorée', tone: 'gray' },
};

export function ReservationStatusBadge({ status }: { status: ReservationStatus }) {
  const { text, tone } = LABELS[status];
  return <Badge tone={tone}>{text}</Badge>;
}
