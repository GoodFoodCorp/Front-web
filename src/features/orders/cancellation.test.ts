import { describe, expect, it } from 'vitest';
import { CUSTOMER_REASONS, reasonLabel, STAFF_REASONS } from './cancellation';

describe('cancellation reasons', () => {
  it('match the codes order-service accepts for each author', () => {
    expect(CUSTOMER_REASONS.map((r) => r.code)).toEqual([
      'ORDERED_BY_MISTAKE', 'CHANGED_MIND', 'WAIT_TOO_LONG', 'WRONG_ADDRESS', 'OTHER',
    ]);
    expect(STAFF_REASONS.map((r) => r.code)).toEqual([
      'ITEM_UNAVAILABLE', 'RESTAURANT_TOO_BUSY', 'RESTAURANT_CLOSING', 'NO_COURIER_AVAILABLE',
      'TECHNICAL_ISSUE', 'CUSTOMER_REQUEST', 'OTHER',
    ]);
  });

  it('labels a known reason and shows an unknown one as is', () => {
    expect(reasonLabel('ITEM_UNAVAILABLE')).toBe('Produit en rupture');
    expect(reasonLabel('SOMETHING_NEW')).toBe('SOMETHING_NEW');
  });
});
