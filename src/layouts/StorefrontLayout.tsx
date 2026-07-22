import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { CalendarDays, Home, LogOut, Package, ShoppingCart, Store, User } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';
import { useLogout } from '../features/auth/hooks/useAuth';

const NAV = [
  { to: '/', label: 'Accueil', icon: Home, end: true },
  { to: '/orders', label: 'Commandes', icon: Package, end: false },
  { to: '/reservations', label: 'Réservations', icon: CalendarDays, end: false },
];

export function StorefrontLayout() {
  const navigate = useNavigate();
  const logout = useLogout();
  const count = useCartStore((s) => s.count());
  const { accessToken, email, roles } = useAuthStore();

  return (
    <div className="min-h-screen bg-cream">
      <header className="sticky top-0 z-20 border-b border-brand/10 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-6 px-4 py-3">
          <Link to="/" className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-brand text-lg">🍔</span>
            <span className="font-display text-xl font-extrabold text-brand">Good Food</span>
          </Link>

          <nav className="hidden gap-1 md:flex">
            {NAV.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold transition ${
                    isActive ? 'bg-brand-pale text-brand' : 'text-neutral-500 hover:text-brand'
                  }`
                }
              >
                <Icon size={16} /> {label}
              </NavLink>
            ))}
            {roles.includes('manager') && (
              <NavLink
                to="/portal"
                className={({ isActive }) =>
                  `flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold transition ${
                    isActive ? 'bg-brand-pale text-brand' : 'text-neutral-500 hover:text-brand'
                  }`
                }
              >
                <Store size={16} /> Portail franchisé
              </NavLink>
            )}
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={() => navigate('/cart')}
              className="relative grid h-10 w-10 place-items-center rounded-full text-brand transition hover:bg-brand-pale"
              aria-label="Panier"
            >
              <ShoppingCart size={20} />
              {count > 0 && (
                <span className="absolute -right-0.5 -top-0.5 grid h-5 w-5 animate-[pop_0.35s] place-items-center rounded-full bg-accent text-xs font-bold text-brand-dark">
                  {count}
                </span>
              )}
            </button>

            {accessToken ? (
              <div className="flex items-center gap-2">
                <Link
                  to="/profile"
                  className="hidden items-center gap-1.5 text-sm text-neutral-500 transition hover:text-brand sm:flex"
                >
                  <User size={16} /> {email}
                </Link>
                <button
                  onClick={logout}
                  className="grid h-10 w-10 place-items-center rounded-full text-neutral-400 transition hover:bg-red-50 hover:text-red-600"
                  aria-label="Se déconnecter"
                >
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-dark"
              >
                Connexion
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
