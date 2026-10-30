export type PayoutStatus = 'PENDING' | 'PAID';

/** A courier's withdrawal request, as head office sees it (full IBAN). */
export interface Payout {
  id: string;
  livreurId: string;
  amount: number;
  iban: string;
  ibanMasked: string;
  status: PayoutStatus;
  requestedAt: string;
  paidAt: string | null;
}
