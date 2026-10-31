import { Boxes, CalendarDays, LayoutDashboard, ScrollText, Settings, Truck, UtensilsCrossed, Users } from 'lucide-react';
import { BackOfficeLayout, type NavItem } from './BackOfficeLayout';

const NAV: NavItem[] = [
  { to: '/portal', label: 'Tableau de bord', icon: LayoutDashboard, end: true },
  { to: '/portal/menu', label: 'Menus & Plats', icon: UtensilsCrossed, end: false },
  { to: '/portal/stock', label: 'Gestion des stocks', icon: Boxes, end: false },
  { to: '/portal/replenishments', label: 'Réapprovisionnement', icon: Truck, end: false },
  { to: '/portal/orders', label: 'Commandes', icon: ScrollText, end: false },
  { to: '/portal/reservations', label: 'Réservations', icon: CalendarDays, end: false },
  { to: '/portal/suppliers', label: 'Fournisseurs', icon: Users, end: false },
  { to: '/portal/settings', label: 'Réglages du restaurant', icon: Settings, end: false },
];

export function PortalLayout() {
  return <BackOfficeLayout subtitle="Portail Franchisé" nav={NAV} />;
}
