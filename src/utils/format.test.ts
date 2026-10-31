import { describe, expect, it } from 'vitest';
import { formatCancellationRate, formatPhone, formatPrice, mergeDishes, plural } from './format';

describe('format', () => {
  it('writes amounts and counts the French way', () => {
    expect(formatPrice(1858569).replace(/\s/g, ' ')).toBe('18 585,69 €');
    expect(plural(1, 'vendu')).toBe('1 vendu');
    expect(plural(1427, 'vendu').replace(/\s/g, ' ')).toBe('1 427 vendus');
  });

  it('keeps a decimal for small cancellation rates', () => {
    expect(formatCancellationRate(7, 1431)).toBe('0,5 % des commandes');
    expect(formatCancellationRate(30, 100)).toBe('30 % des commandes');
  });

  it('merges a dish sold by several restaurants', () => {
    expect(mergeDishes([{ name: 'Burger', quantity: 3 }, { name: 'Pizza', quantity: 4 }, { name: 'Burger', quantity: 2 }])).toEqual([
      { name: 'Burger', quantity: 5 },
      { name: 'Pizza', quantity: 4 },
    ]);
  });
});

describe('formatPhone', () => {
  it('groups a French number by two digits', () => {
    expect(formatPhone('0140000000')).toBe('01 40 00 00 00');
    expect(formatPhone('01.40.00.00.00')).toBe('01 40 00 00 00');
    expect(formatPhone('+33 1 23 45 67 89')).toBe('+33 1 23 45 67 89');
  });
});
