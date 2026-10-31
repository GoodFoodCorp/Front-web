import { useEffect, useMemo, useState } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { CalendarDays, LogOut, Package, Search, ShoppingCart, Store, Truck, User, UtensilsCrossed } from 'lucide-react';
import { NotificationBell } from '../features/notifications/NotificationBell';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';
import { useLocationStore } from '../store/locationStore';
import { useLogout } from '../features/auth/hooks/useAuth';
import { useRestaurants } from '../features/restaurants/hooks/useRestaurants';
import { useDishSearch } from '../features/catalog/hooks/useMenu';
import { groupDishes } from '../features/catalog/dishSearch';
import { matchRestaurants } from '../features/restaurants/finder';
import { Footer } from '../components/Footer';
import logo from '../assets/logo.svg';
import { formatPrice } from '../utils/format';

const MAX_RESTAURANTS = 3;
const MAX_DISHES = 4;
const DEBOUNCE_MS = 250;

export function StorefrontLayout() {
  const navigate = useNavigate();
  const logout = useLogout();
  const count = useCartStore((s) => s.count());
  const { userId, email, roles } = useAuthStore();
  const isLoggedIn = userId !== null;
  const { data: restaurants = [] } = useRestaurants();
  const place = useLocationStore((s) => s.place);

  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);

  // Dishes are searched in every restaurant once typing pauses.
  useEffect(() => {
    const timer = setTimeout(() => setQuery(search.trim()), DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [search]);
  const { data: matches } = useDishSearch(query);

  const restaurantMatches = useMemo(() => matchRestaurants(restaurants, search), [restaurants, search]);
  const dishMatches = useMemo(
    () => (query.length >= 2 ? groupDishes(matches ?? [], restaurants, place) : []),
    [matches, restaurants, place, query],
  );

  const goToResults = (q: string) => {
    setSearchOpen(false);
    navigate(`/search?q=${encodeURIComponent(q)}`);
  };

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) goToResults(search.trim());
  };

  const typed = search.trim().length > 0;

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
                    if (e.key === 'Escape') setSearchOpen(false);
                  }}
                  placeholder="Un plat, un restaurant…"
                  aria-label="Rechercher un plat ou un restaurant"
                  className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-neutral-400"
                />
              </div>
            </form>

            {searchOpen && typed && (
              <>
                <button
                  aria-label="Fermer"
                  className="fixed inset-0 z-30 cursor-default"
                  onClick={() => setSearchOpen(false)}
                />
                <div className="animate-dropdown absolute left-0 right-0 z-40 mt-2 origin-top overflow-hidden rounded-xl border border-brand/10 bg-white py-1 text-ink shadow-[var(--shadow-lift)]">
                  {restaurantMatches.length > 0 && <SuggestionHeading>Restaurants</SuggestionHeading>}
                  {restaurantMatches.slice(0, MAX_RESTAURANTS).map((r) => (
                    <button
                      key={r.id}
                      onClick={() => {
                        setSearch('');
                        setSearchOpen(false);
                        navigate(`/restaurants/${r.id}`);
                      }}
                      className="flex w-full items-center gap-3 px-3 py-2 text-left transition hover:bg-brand-pale"
                    >
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-brand-pale text-brand">
                        <Store size={17} aria-hidden />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold text-brand">{r.name}</span>
                        <span className="block truncate text-xs text-neutral-400">
                          {r.address}, {r.city}
                        </span>
                      </span>
                    </button>
                  ))}

                  {dishMatches.length > 0 && <SuggestionHeading>Plats</SuggestionHeading>}
                  {dishMatches.slice(0, MAX_DISHES).map((dish) => (
                    <button
                      key={dish.name}
                      onClick={() => goToResults(dish.name)}
                      className="flex w-full items-center gap-3 px-3 py-2 text-left transition hover:bg-brand-pale"
                    >
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-accent/30 text-brand-dark">
                        <UtensilsCrossed size={16} aria-hidden />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold text-brand">{dish.name}</span>
                        <span className="block truncate text-xs text-neutral-400">
                          {dish.offers.length === 1
                            ? `Chez ${dish.offers[0].restaurant.name}`
                            : `Dans ${dish.offers.length} restaurants`}
                        </span>
                      </span>
                      <span className="shrink-0 text-sm font-bold text-brand">
                        {dish.offers.length > 1 ? 'dès ' : ''}
                        {formatPrice(dish.fromCents)}
                      </span>
                    </button>
                  ))}

                  {restaurantMatches.length === 0 && dishMatches.length === 0 ? (
                    <p className="px-4 py-3 text-sm text-neutral-400">
                      {query !== search.trim() || search.trim().length < 2
                        ? 'Recherche…'
                        : `Aucun résultat pour « ${search.trim()} »`}
                    </p>
                  ) : (
                    <button
                      onClick={() => goToResults(search.trim())}
                      className="w-full border-t border-brand/10 px-4 py-2.5 text-left text-sm font-semibold text-brand transition hover:bg-brand-pale"
                    >
                      Voir tous les résultats pour « {search.trim()} »
                    </button>
                  )}
                </div>
              </>
            )}
          </div>

          <div className="ml-auto flex items-center gap-1 sm:gap-3">
            <Link
              to="/search"
              aria-label="Rechercher"
              className="grid h-10 w-10 place-items-center rounded-full transition hover:bg-white/10 md:hidden"
            >
              <Search size={20} />
            </Link>

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
