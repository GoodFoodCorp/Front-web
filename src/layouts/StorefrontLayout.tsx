import { useMemo, useState } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { CalendarDays, LogOut, Package, Search, ShoppingCart, Store, Truck, User } from 'lucide-react';
import { NotificationBell } from '../features/notifications/NotificationBell';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';
import { useLocationStore } from '../store/locationStore';
import { useLogout } from '../features/auth/hooks/useAuth';
import { useRestaurants } from '../features/restaurants/hooks/useRestaurants';
import { useRestaurantMenu } from '../features/catalog/hooks/useMenu';
import type { MenuItem } from '../features/catalog/types/menu.types';
import { fold } from '../features/restaurants/finder';
import type { Restaurant } from '../features/restaurants/types/restaurant.types';
import { Footer } from '../components/Footer';
import logo from '../assets/logo.svg';
import { formatPrice } from '../utils/format';
import { dishPhoto } from '../utils/images';

const MAX_SUGGESTIONS = 4;

export function StorefrontLayout() {
  const navigate = useNavigate();
  const logout = useLogout();
  const count = useCartStore((s) => s.count());
  const { userId, email, roles } = useAuthStore();
  const isLoggedIn = userId !== null;
  const { data: restaurants } = useRestaurants();
  const restaurantId = useLocationStore((s) => s.restaurantId);

  const [search, setSearch] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);

  // Restaurants are searched everywhere, dishes in the restaurant last opened.
  const current = restaurants?.find((r) => r.id === restaurantId);
  const { data: currentMenu } = useRestaurantMenu(current?.id);

  const query = fold(search);
  const restaurantMatches = useMemo(() => {
    if (!query) return [];
    return (restaurants ?? []).filter((r) => fold(`${r.name} ${r.address} ${r.city}`).includes(query));
  }, [restaurants, query]);
  const dishMatches = useMemo(() => {
    if (!query) return [];
    return (currentMenu ?? []).filter((item) => fold(`${item.name} ${item.category}`).includes(query));
  }, [currentMenu, query]);

  const closeSearch = () => setSearchOpen(false);

  const showRestaurants = (q: string) => {
    closeSearch();
    navigate(q ? `/?q=${encodeURIComponent(q)}` : '/');
  };

  /** Enter: the matching restaurants, or the dishes when only dishes match. */
  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = search.trim();
    if (current && restaurantMatches.length === 0 && dishMatches.length > 0) {
      closeSearch();
      navigate(`/restaurants/${current.id}?q=${encodeURIComponent(q)}`);
    } else {
      showRestaurants(q);
    }
  };

  const openRestaurant = (r: Restaurant) => {
    setSearch('');
    closeSearch();
    navigate(`/restaurants/${r.id}`);
  };

  const pickDish = (restaurant: Restaurant, item: MenuItem) => {
    setSearch(item.name);
    closeSearch();
    navigate(`/restaurants/${restaurant.id}?q=${encodeURIComponent(item.name)}`);
  };

  return (
    <div className="flex min-h-screen flex-col bg-cream">
      <header className="sticky top-0 z-30 bg-brand text-white">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3">
          <Link to="/" className="flex shrink-0 items-center gap-2">
            <img src={logo} alt="Good Food" className="h-10 w-10" />
            <span className="hidden font-display text-xl font-extrabold sm:inline">Good Food</span>
          </Link>

          <div className="relative hidden max-w-md flex-1 md:block">
            <form onSubmit={submitSearch} role="search">
              <div className="flex items-center gap-2 rounded-xl bg-white/95 px-4 py-2">
                <button
                  type="submit"
                  aria-label="Rechercher"
                  className="shrink-0 text-neutral-400 transition hover:text-brand"
                >
                  <Search size={16} />
                </button>
                <input
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setSearchOpen(true);
                  }}
                  onFocus={() => setSearchOpen(true)}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') closeSearch();
                  }}
                  placeholder="Restaurant, ville, plat…"
                  aria-label="Rechercher un restaurant ou un plat"
                  className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-neutral-400"
                />
              </div>
            </form>

            {searchOpen && query && (
              <>
                <button aria-label="Fermer" className="fixed inset-0 z-30 cursor-default" onClick={closeSearch} />
                <div className="animate-dropdown absolute left-0 right-0 z-40 mt-2 origin-top overflow-hidden rounded-xl border border-brand/10 bg-white py-1 text-ink shadow-[var(--shadow-lift)]">
                  {restaurantMatches.length === 0 && dishMatches.length === 0 ? (
                    <p className="px-4 py-3 text-sm text-neutral-400">Aucun résultat pour « {search.trim()} »</p>
                  ) : (
                    <>
                      {restaurantMatches.length > 0 && <SuggestionHeading>Restaurants</SuggestionHeading>}
                      {restaurantMatches.slice(0, MAX_SUGGESTIONS).map((r) => (
                        <button
                          key={r.id}
                          onClick={() => openRestaurant(r)}
                          className="flex w-full items-center gap-3 px-3 py-2 text-left transition hover:bg-brand-pale"
                        >
                          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-brand-pale text-brand">
                            <Store size={18} aria-hidden />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-semibold text-brand">{r.name}</span>
                            <span className="block truncate text-xs text-neutral-400">
                              {r.address}, {r.city}
                            </span>
                          </span>
                        </button>
                      ))}
                      {restaurantMatches.length > MAX_SUGGESTIONS && (
                        <button
                          onClick={() => showRestaurants(search.trim())}
                          className="w-full px-4 py-2 text-left text-sm font-semibold text-brand transition hover:bg-brand-pale"
                        >
                          Voir les {restaurantMatches.length} restaurants
                        </button>
                      )}

                      {current && dishMatches.length > 0 && (
                        <SuggestionHeading>Plats chez {current.name}</SuggestionHeading>
                      )}
                      {current &&
                        dishMatches.slice(0, MAX_SUGGESTIONS).map((item) => (
                          <button
                            key={item.id}
                            onClick={() => pickDish(current, item)}
                            className="flex w-full items-center gap-3 px-3 py-2 text-left transition hover:bg-brand-pale"
                          >
                            <div
                              className="h-10 w-10 shrink-0 rounded-lg bg-cover bg-center"
                              style={{ backgroundImage: `url(${item.imageUrl || dishPhoto(item.name, item.category)})` }}
                            />
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-semibold text-brand">{item.name}</p>
                              <p className="truncate text-xs text-neutral-400">{item.category}</p>
                            </div>
                            <span className="shrink-0 text-sm font-bold text-brand">
                              {formatPrice(item.priceCents)}
                            </span>
                          </button>
                        ))}
                    </>
                  )}
                </div>
              </>
            )}
          </div>

          <div className="ml-auto flex items-center gap-1 sm:gap-3">
            {userId && <NotificationBell />}

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
                onClick={() => (isLoggedIn ? setUserOpen((v) => !v) : navigate('/login'))}
                className="grid h-10 w-10 place-items-center rounded-full transition hover:bg-white/10"
                aria-label="Compte"
              >
                <User size={20} />
              </button>
              {userOpen && isLoggedIn && (
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
                    {roles.includes('livreur') && (
                      <MenuLink to="/courier" icon={Truck} label="Espace livreur" onClick={() => setUserOpen(false)} />
                    )}
                    <button
                      onClick={() => {
                        setUserOpen(false);
                        logout();
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

function SuggestionHeading({ children }: { children: React.ReactNode }) {
  return <p className="px-4 pb-1 pt-2 text-xs font-semibold uppercase tracking-wide text-neutral-400">{children}</p>;
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
