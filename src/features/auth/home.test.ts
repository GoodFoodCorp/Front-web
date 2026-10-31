import { describe, expect, it } from 'vitest';
import { homeFor, landingAfterLogin, mayOpen } from './home';

describe('landingAfterLogin', () => {
  it('sends each account to its own space', () => {
    expect(landingAfterLogin(['admin'])).toBe('/admin');
    expect(landingAfterLogin(['manager'])).toBe('/portal');
    expect(landingAfterLogin(['livreur'])).toBe('/courier');
    expect(landingAfterLogin(['user'])).toBe('/');
  });

  it('never reopens the previous account’s page', () => {
    expect(landingAfterLogin(['user'], '/admin/personnel')).toBe('/');
    expect(landingAfterLogin(['manager'], '/admin/franchises')).toBe('/portal');
    expect(landingAfterLogin(['admin'], '/portal/orders')).toBe('/admin');
    expect(landingAfterLogin(['livreur'], '/orders/abc')).toBe('/courier');
  });

  it('reopens a page of the account’s own space', () => {
    expect(landingAfterLogin(['admin'], '/admin/promotions')).toBe('/admin/promotions');
    expect(landingAfterLogin(['manager'], '/portal/stock')).toBe('/portal/stock');
    expect(landingAfterLogin(['user'], '/orders/abc')).toBe('/orders/abc');
    expect(landingAfterLogin(['user'], '/login')).toBe('/');
  });
});

describe('mayOpen / homeFor', () => {
  it('follows the route guards', () => {
    expect(mayOpen('/portal', ['user'])).toBe(false);
    expect(mayOpen('/portalx', ['user'])).toBe(true);
    expect(mayOpen('/cart', ['user'])).toBe(true);
    expect(homeFor([])).toBe('/');
  });
});
