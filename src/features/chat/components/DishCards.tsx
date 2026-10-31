import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, ShoppingCart, Store } from 'lucide-react';
import { Button } from '../../../components/Button';
import { Modal } from '../../../components/Modal';
import { useRestaurantMenu } from '../../catalog/hooks/useMenu';
import { AllergenList } from '../../catalog/components/AllergenList';
import { useRestaurants } from '../../restaurants/hooks/useRestaurants';
import { useCartStore } from '../../../store/cartStore';
import { useChatStore } from '../../../store/chatStore';
import { formatPrice } from '../../../utils/format';
import { dishPhoto } from '../../../utils/images';
import type { DishCard } from '../types/chat.types';

/** The real dishes a reply talks about, as a row of clickable cards. */
export function DishCards({ dishes }: { dishes: DishCard[] }) {
  const [open, setOpen] = useState<DishCard | null>(null);
  return (
    <>
      <div className="-mx-1 mt-1.5 flex snap-x gap-2 overflow-x-auto px-1 pb-1" role="list" aria-label="Plats proposés">
        {dishes.map((d) => (
          <button
            key={`${d.restaurant_id}-${d.id}`}
            type="button"
            role="listitem"
            onClick={() => setOpen(d)}
            className="w-36 shrink-0 snap-start overflow-hidden rounded-xl border border-brand/10 bg-white text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-lift)] focus-visible:ring-2 focus-visible:ring-brand/30"
          >
            <DishImage dish={d} className="h-20" />
            <span className="block p-2">
              <span className="block truncate text-xs font-bold text-brand">{d.name}</span>
              <span className="mt-0.5 flex items-center justify-between text-xs">
                <span className="font-semibold text-neutral-700">{formatPrice(d.price_cents)}</span>
                <span className="text-[10px] text-neutral-400">Voir</span>
              </span>
            </span>
          </button>
        ))}
      </div>
      {open && <DishDetail dish={open} onClose={() => setOpen(null)} />}
    </>
  );
}

/** The dish's own photo when the restaurant uploaded one, else a stock one. */
function DishImage({ dish, className }: { dish: DishCard; className: string }) {
  const { data: menu } = useRestaurantMenu(dish.restaurant_id);
  const uploaded = menu?.find((m) => m.id === dish.id)?.imageUrl;
  return (
    <span
      className={`block w-full bg-cover bg-center ${className}`}
      style={{ backgroundImage: `url(${uploaded || dishPhoto(dish.name, dish.category)})` }}
      aria-hidden
    />
  );
}

function DishDetail({ dish, onClose }: { dish: DishCard; onClose: () => void }) {
  const navigate = useNavigate();
  const closeChat = useChatStore((s) => s.close);
  const add = useCartStore((s) => s.add);
  const { data: menu } = useRestaurantMenu(dish.restaurant_id);
  const { data: restaurants } = useRestaurants();
  const [added, setAdded] = useState(false);

  const item = menu?.find((m) => m.id === dish.id);
  const restaurant = restaurants?.find((r) => r.id === dish.restaurant_id);
  const restaurantName = restaurant?.name ?? dish.restaurant_name ?? 'Restaurant';
  const available = item?.available ?? true;

  const addToCart = () => {
    if (!item) return;
    add(item, { id: dish.restaurant_id, name: restaurantName });
    setAdded(true);
  };

  const goTo = (path: string) => {
    onClose();
    closeChat();
    navigate(path);
  };

  return (
    <Modal title={dish.name} onClose={onClose} maxWidth="max-w-md">
      <div className="space-y-4">
        <DishImage dish={dish} className="h-48 rounded-xl" />
        <div className="flex items-start justify-between gap-3">
          <button
            type="button"
            onClick={() => goTo(`/restaurants/${dish.restaurant_id}`)}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-neutral-600 hover:text-brand"
          >
            <Store size={15} aria-hidden /> {restaurantName}
          </button>
          <span className="font-display text-xl font-extrabold text-brand">{formatPrice(dish.price_cents)}</span>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {dish.category && <span className="rounded-full bg-brand-pale px-2.5 py-1 font-semibold text-brand">{dish.category}</span>}
          {!available && <span className="rounded-full bg-red-50 px-2.5 py-1 font-semibold text-red-600">Indisponible</span>}
        </div>
        {(item?.description || dish.description) && (
          <p className="text-sm text-neutral-600">{item?.description || dish.description}</p>
        )}
        {item && item.ingredients.length > 0 && (
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-neutral-400">Composition</p>
            <p className="text-sm text-neutral-600">{item.ingredients.join(', ')}</p>
          </div>
        )}
        {item ? (
          <AllergenList allergens={item.allergens} />
        ) : (
          <p className="text-xs text-neutral-400">Allergènes : consultez la carte du restaurant avant de commander.</p>
        )}
        <div className="flex flex-wrap gap-2">
          <Button onClick={addToCart} disabled={!item || !available || added} className="flex-1">
            {added ? (
              <>
                <Check size={16} /> Ajouté au panier
              </>
            ) : (
              <>
                <ShoppingCart size={16} /> Ajouter au panier
              </>
            )}
          </Button>
          {added ? (
            <Button variant="accent" onClick={() => goTo('/cart')} className="flex-1">
              Voir le panier
            </Button>
          ) : (
            <Button variant="ghost" onClick={() => goTo(`/restaurants/${dish.restaurant_id}`)} className="flex-1">
              Voir le menu
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
}
