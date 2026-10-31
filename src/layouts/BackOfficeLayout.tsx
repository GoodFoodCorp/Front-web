import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { ExternalLink, LogOut, Menu, X, type LucideIcon } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useLogout } from '../features/auth/hooks/useAuth';
import logo from '../assets/logo.svg';
import { NotificationBell } from '../features/notifications/NotificationBell';

export interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  end: boolean;
}

/**
 * Back-office shell shared by head office and franchisees: sidebar on a
 * desktop, a drawer behind a menu button on a phone.
 */
export function BackOfficeLayout({ subtitle, nav }: { subtitle: string; nav: NavItem[] }) {
  const navigate = useNavigate();
  const logout = useLogout();
  const email = useAuthStore((s) => s.email);
  const [menuOpen, setMenuOpen] = useState(false);
  const { pathname } = useLocation();

  // The drawer closes once a destination is chosen.
  useEffect(() => setMenuOpen(false), [pathname]);

  return (
    <div className="flex min-h-screen bg-neutral-50">
      {menuOpen && (
        <button
          aria-label="Fermer le menu"
          className="fixed inset-0 z-[60] bg-black/40 lg:hidden"
          onClick={() => setMenuOpen(false)}
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-[70] flex w-64 flex-col overflow-y-auto bg-brand text-white transition-transform duration-200 lg:static lg:translate-x-0 ${
          menuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center gap-2.5 px-6 py-6">
          <img src={logo} alt="Good Food" className="h-11 w-11" />
          <div>
            <p className="font-display text-lg font-extrabold leading-tight">Good Food</p>
            <p className="text-xs text-white/60">{subtitle}</p>
          </div>
          <button
            aria-label="Fermer le menu"
            className="ml-auto grid h-9 w-9 place-items-center rounded-lg text-white/70 hover:bg-white/10 lg:hidden"
            onClick={() => setMenuOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        <nav className="mt-4 flex flex-1 flex-col gap-1 px-3">
          {nav.map(({ to, label, icon: Icon, end }) => (
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

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between gap-3 border-b border-neutral-200 bg-white px-4 py-3 sm:px-6 lg:px-8 lg:py-4">
          <button
            aria-label="Ouvrir le menu"
            className="grid h-10 w-10 shrink-0 place-items-center rounded-lg text-brand hover:bg-brand-pale lg:hidden"
            onClick={() => setMenuOpen(true)}
          >
            <Menu size={22} />
          </button>
          <Link
            to="/"
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold text-brand transition hover:bg-brand-pale"
          >
            <ExternalLink size={15} /> <span className="hidden sm:inline">Voir le site</span>
          </Link>
          <span className="ml-auto truncate text-sm text-neutral-500">{email}</span>
          <NotificationBell tone="dark" />
        </header>
        <main className="min-w-0 flex-1 overflow-x-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
