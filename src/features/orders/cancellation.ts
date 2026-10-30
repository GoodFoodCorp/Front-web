/** Cancellation reasons, as order-service accepts them for each author. */
export type CancelledBy = 'CUSTOMER' | 'RESTAURANT' | 'HEAD_OFFICE';

export interface CancellationReasonOption {
  code: string;
  label: string;
}

export const CUSTOMER_REASONS: CancellationReasonOption[] = [
  { code: 'ORDERED_BY_MISTAKE', label: 'J’ai commandé par erreur' },
  { code: 'CHANGED_MIND', label: 'J’ai changé d’avis' },
  { code: 'WAIT_TOO_LONG', label: 'Le délai est trop long' },
  { code: 'WRONG_ADDRESS', label: 'L’adresse de livraison est erronée' },
  { code: 'OTHER', label: 'Autre raison' },
];

export const STAFF_REASONS: CancellationReasonOption[] = [
  { code: 'ITEM_UNAVAILABLE', label: 'Produit en rupture' },
  { code: 'RESTAURANT_TOO_BUSY', label: 'Restaurant débordé' },
  { code: 'RESTAURANT_CLOSING', label: 'Fermeture du restaurant' },
  { code: 'NO_COURIER_AVAILABLE', label: 'Aucun livreur disponible' },
  { code: 'TECHNICAL_ISSUE', label: 'Problème technique' },
  { code: 'CUSTOMER_REQUEST', label: 'À la demande du client' },
  { code: 'OTHER', label: 'Autre raison' },
];

const LABELS = new Map([...CUSTOMER_REASONS, ...STAFF_REASONS].map((r) => [r.code, r.label]));

export function reasonLabel(code: string): string {
  return LABELS.get(code) ?? code;
}

export const CANCELLED_BY: Record<CancelledBy, string> = {
  CUSTOMER: 'par le client',
  RESTAURANT: 'par le restaurant',
  HEAD_OFFICE: 'par GoodFood',
};

export const MAX_COMMENT_LENGTH = 300;
