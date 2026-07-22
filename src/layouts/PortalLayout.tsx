import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Boxes, CalendarDays, LayoutDashboard, LogOut, ScrollText, Truck, UtensilsCrossed, Users } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useLogout } from '../features/auth/hooks/useAuth';

const NAV = [
  { to: '/portal', label: 'Tableau de bord', icon: LayoutDashboard, end: true },
  { to: '/portal/menu', label: 'Gestion des menus', icon: UtensilsCrossed, end: false },
  { to: '/portal/stock', label: 'Gestion des stocks', icon: Boxes, end: false },
  { to: '/portal/replenishments', label: 'Réapprovisionnement', icon: Truck, end: false },
  { to: '/portal/orders', label: 'Commandes', icon: ScrollText, end: false },
  { to: '/portal/reservations', label: 'Réservations', icon: CalendarDays, end: false },
  { to: '/portal/suppliers', label: 'Fournisseurs', icon: Users, end: false },
];

export function PortalLayout() {
  const navigate = useNavigate();
  const logout = useLogout();
  const email = useAuthStore((s) => s.email);

  return (
    <div className="flex min-h-screen bg-neutral-50">
      <aside className="flex w-64 flex-col bg-brand text-white">
        <div className="flex items-center gap-2.5 px-6 py-6">
          <span className="grid h-10 w-10 place-items-center rounded-full bg-accent text-lg">🍔</span>
          <div>
            <p className="font-display text-lg font-extrabold leading-tight">Good Food</p>
            <p className="text-xs text-white/60">Portail Franchisé</p>
          </div>
        </div>

        <nav className="mt-4 flex flex-1 flex-col gap-1 px-3">
          {NAV.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition ${
                  isActive ? 'bg-accent text-brand-dark' : 'text-white/70 hover:bg-white/10 hover:text-white'
                }`
              }
            >
              <Icon size={18} /> {label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-white/10 px-3 py-4">
          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-white/70 transition hover:bg-white/10 hover:text-white"
          >
            <LogOut size={18} /> Déconnexion
          </button>
        </div>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-neutral-200 bg-white px-8 py-4">
          <div />
          <span className="text-sm text-neutral-500">{email}</span>
        </header>
        <main className="flex-1 overflow-auto p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
