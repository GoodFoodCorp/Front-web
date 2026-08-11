import { useEffect, useState } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import {
  CalendarDays,
  ChevronDown,
  LogOut,
  MapPin,
  Package,
  Search,
  ShoppingCart,
  Store,
  User,
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';
import { useLocationStore } from '../store/locationStore';
import { useLogout } from '../features/auth/hooks/useAuth';
import { useRestaurants } from '../features/restaurants/hooks/useRestaurants';
import { Footer } from '../components/Footer';
import logo from '../assets/logo.svg';

export function StorefrontLayout() {
  const navigate = useNavigate();
  const logout = useLogout();
  const count = useCartStore((s) => s.count());
  const { accessToken, email, roles } = useAuthStore();
  const { data: restaurants } = useRestaurants();
  const { restaurantId, setRestaurantId } = useLocationStore();

  const [search, setSearch] = useState('');
  const [locationOpen, setLocationOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);

  // Default the browsed location to the first active restaurant.
  useEffect(() => {
    if (!restaurantId && restaurants && restaurants.length > 0) {
      setRestaurantId(restaurants[0].id);
    }
  }, [restaurantId, restaurants, setRestaurantId]);

  const current = restaurants?.find((r) => r.id === restaurantId);

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!current) return;
    navigate(`/restaurants/${current.id}${search.trim() ? `?q=${encodeURIComponent(search.trim())}` : ''}`);
  };

  return (
    <div className="flex min-h-screen flex-col bg-cream">
      <header className="sticky top-0 z-30 bg-brand text-white">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3">
          <Link to="/" className="flex shrink-0 items-center gap-2">
            <img src={logo} alt="Good Food" className="h-10 w-10" />
            <span className="hidden font-display text-xl font-extrabold sm:inline">Good Food</span>
          </Link>

          <form onSubmit={submitSearch} className="hidden max-w-md flex-1 md:block">
            <div className="flex items-center gap-2 rounded-xl bg-white/95 px-4 py-2">
              <Search size={16} className="shrink-0 text-neutral-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher..."
                className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-neutral-400"
              />
            </div>
          </form>

          <div className="ml-auto flex items-center gap-1 sm:gap-3">
            {/* Location / restaurant picker */}
            <div className="relative">
              <button
                onClick={() => setLocationOpen((v) => !v)}
                className="flex items-center gap-1.5 rounded-lg px-2 py-2 text-sm text-white/90 transition hover:bg-white/10"
              >
                <MapPin size={16} />
                <span className="hidden max-w-[160px] truncate sm:inline">
                  {current ? current.name : 'Choisir un restaurant'}
                </span>
                <ChevronDown size={14} />
              </button>
              {locationOpen && (
                <>
                  <button
                    aria-label="Fermer"
                    className="fixed inset-0 z-30 cursor-default"
                    onClick={() => setLocationOpen(false)}
                  />
                  <div className="absolute right-0 z-40 mt-2 w-64 overflow-hidden rounded-xl border border-brand/10 bg-white py-1 text-ink shadow-[var(--shadow-lift)]">
                    <p className="px-4 py-2 text-xs font-semibold uppercase tracking-wide text-neutral-400">
                      Choisir un restaurant
                    </p>
                    {(restaurants ?? []).map((r) => (
                      <button
                        key={r.id}
                        onClick={() => {
                          setRestaurantId(r.id);
                          setLocationOpen(false);
                        }}
                        className={`flex w-full items-center gap-2 px-4 py-2 text-left text-sm transition hover:bg-brand-pale ${
                          r.id === restaurantId ? 'font-semibold text-brand' : 'text-neutral-600'
                        }`}
                      >
                        <Store size={14} className="shrink-0" /> {r.name}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            <button
              onClick={() => navigate('/cart')}
              className="relative grid h-10 w-10 shrink-0 place-items-center rounded-full transition hover:bg-white/10"
              aria-label="Panier"
            >
              <ShoppingCart size={20} />
              {count > 0 && (
                <span className="absolute -right-0.5 -top-0.5 grid h-5 w-5 animate-[pop_0.35s] place-items-center rounded-full bg-accent text-xs font-bold text-brand-dark">
                  {count}
                </span>
              )}
            </button>

            {/* User menu */}
            <div className="relative">
              <button
                onClick={() => (accessToken ? setUserOpen((v) => !v) : navigate('/login'))}
                className="grid h-10 w-10 place-items-center rounded-full transition hover:bg-white/10"
                aria-label="Compte"
              >
                <User size={20} />
              </button>
              {userOpen && accessToken && (
                <>
                  <button
                    aria-label="Fermer"
                    className="fixed inset-0 z-30 cursor-default"
                    onClick={() => setUserOpen(false)}
                  />
                  <div className="absolute right-0 z-40 mt-2 w-56 overflow-hidden rounded-xl border border-brand/10 bg-white py-1 text-ink shadow-[var(--shadow-lift)]">
                    <p className="truncate px-4 py-2 text-xs text-neutral-400">{email}</p>
                    <MenuLink to="/profile" icon={User} label="Mon profil" onClick={() => setUserOpen(false)} />
                    <MenuLink to="/orders" icon={Package} label="Mes commandes" onClick={() => setUserOpen(false)} />
                    <MenuLink
                      to="/reservations"
                      icon={CalendarDays}
                      label="Réservations"
                      onClick={() => setUserOpen(false)}
                    />
                    {roles.includes('manager') && (
                      <MenuLink
                        to="/portal"
                        icon={Store}
                        label="Portail franchisé"
                        onClick={() => setUserOpen(false)}
                      />
                    )}
                    {roles.includes('admin') && (
                      <MenuLink to="/admin" icon={Store} label="Portail siège" onClick={() => setUserOpen(false)} />
                    )}
                    <button
                      onClick={() => {
                        setUserOpen(false);
                        logout();
                        navigate('/login');
                      }}
                      className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm font-semibold text-red-600 transition hover:bg-red-50"
                    >
                      <LogOut size={16} /> Déconnexion
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}

function MenuLink({
  to,
  icon: Icon,
  label,
  onClick,
}: {
  to: string;
  icon: typeof User;
  label: string;
  onClick: () => void;
}) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold text-neutral-700 transition hover:bg-brand-pale hover:text-brand"
    >
      <Icon size={16} /> {label}
    </Link>
  );
}
