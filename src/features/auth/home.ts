/** Each account's own space: head office, franchisee portal, courier app or the shop. */
export function homeFor(roles: string[]): string {
  if (roles.includes('admin')) return '/admin';
  if (roles.includes('manager')) return '/portal';
  if (roles.includes('livreur')) return '/courier';
  return '/';
}

const STAFF_AREAS: [prefix: string, role: string][] = [
  ['/admin', 'admin'],
  ['/portal', 'manager'],
  ['/courier', 'livreur'],
];

/** Whether these roles may open this page (the same rule as the route guards). */
export function mayOpen(path: string, roles: string[]): boolean {
  const area = STAFF_AREAS.find(([prefix]) => path === prefix || path.startsWith(`${prefix}/`));
  return !area || roles.includes(area[1]);
}

/**
 * Where to go once signed in. A page the user was sent away from is reopened
 * only if it belongs to their own space: never the page the previous
 * account was on, and staff land on their portal rather than the shop.
 */
export function landingAfterLogin(roles: string[], from?: string | null): string {
  const home = homeFor(roles);
  if (!from || from === '/login' || !mayOpen(from, roles)) return home;
  if (home !== '/' && !from.startsWith(home)) return home;
  return from;
}
