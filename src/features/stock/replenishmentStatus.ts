import type { BadgeTone } from '../../components/Badge';
import type { ReplenishmentStatus } from './types/stock.types';

export const STATUS_META: Record<ReplenishmentStatus, { label: string; tone: BadgeTone }> = {
  PENDING: { label: 'En attente', tone: 'yellow' },
  APPROVED: { label: 'Approuvée', tone: 'blue' },
  ORDERED: { label: 'Commandée', tone: 'blue' },
  RECEIVED: { label: 'Reçue', tone: 'green' },
  CANCELLED: { label: 'Annulée', tone: 'red' },
};

/** Only head office (admin) may advance a request. */
export const NEXT_STATUS: Partial<Record<ReplenishmentStatus, ReplenishmentStatus>> = {
  PENDING: 'APPROVED',
  APPROVED: 'ORDERED',
  ORDERED: 'RECEIVED',
};
