import { Boxes, Building2, LayoutDashboard, Settings, Tag, UtensilsCrossed, Users, Wallet } from 'lucide-react';
import { BackOfficeLayout, type NavItem } from './BackOfficeLayout';

const NAV: NavItem[] = [
  { to: '/admin', label: 'Tableau de bord', icon: LayoutDashboard, end: true },
  { to: '/admin/stock', label: 'Gestion des stocks', icon: Boxes, end: false },
  { to: '/admin/menu', label: 'Menus & Plats', icon: UtensilsCrossed, end: false },
  { to: '/admin/promotions', label: 'Promotions', icon: Tag, end: false },
  { to: '/admin/personnel', label: 'Personnel', icon: Users, end: false },
  { to: '/admin/payouts', label: 'Paiements livreurs', icon: Wallet, end: false },
  { to: '/admin/franchises', label: 'Franchisés', icon: Building2, end: false },
  { to: '/admin/settings', label: 'Paramètres', icon: Settings, end: false },
];

export function AdminLayout() {
  return <BackOfficeLayout subtitle="Portail Siège" nav={NAV} />;
}
