import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  Boxes,
  Building2,
  LayoutDashboard,
  LogOut,
  Settings,
  Tag,
  UtensilsCrossed,
  Users,
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useLogout } from '../features/auth/hooks/useAuth';
import logo from '../assets/logo.svg';

const NAV = [
  { to: '/admin', label: 'Tableau de bord', icon: LayoutDashboard, end: true },
  { to: '/admin/stock', label: 'Gestion des stocks', icon: Boxes, end: false },
  { to: '/admin/menu', label: 'Gestion des Plats', icon: UtensilsCrossed, end: false },
  { to: '/admin/promotions', label: 'Promotions', icon: Tag, end: false },
  { to: '/admin/personnel', label: 'Personnel', icon: Users, end: false },
  { to: '/admin/franchises', label: 'Franchisés', icon: Building2, end: false },
  { to: '/admin/settings', label: 'Paramètres', icon: Settings, end: false },
];

export function AdminLayout() {
  const navigate = useNavigate();
  const logout = useLogout();
  const email = useAuthStore((s) => s.email);

  return (
    <div className="flex min-h-screen bg-neutral-50">
      <aside className="flex w-64 flex-col bg-brand text-white">
        <div className="flex items-center gap-2.5 px-6 py-6">
          <img src={logo} alt="Good Food" className="h-11 w-11" />
          <div>
            <p className="font-display text-lg font-extrabold leading-tight">Good Food</p>
            <p className="text-xs text-white/60">Portail Siège</p>
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
