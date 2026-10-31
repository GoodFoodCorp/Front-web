import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { RoutePath } from './useLiveDelivery';

export interface Point {
  lat: number;
  lng: number;
}

/** Map tiles: OpenStreetMap unless a provider is configured (production volume). */
const TILES = (import.meta.env.VITE_MAP_TILES_URL as string | undefined) ?? 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
const ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';

function pin(emoji: string, color: string): L.DivIcon {
  return L.divIcon({
    className: '',
    html: `<div style="display:grid;place-items:center;width:34px;height:34px;border-radius:9999px;background:${color};border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,.3);font-size:16px">${emoji}</div>`,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
  });
}

const RESTAURANT = pin('🍽️', '#ffcc00');
const CUSTOMER = pin('🏠', '#004430');
const COURIER = pin('🛵', '#ffffff');

const valid = (p?: Point | null): p is Point => !!p && Number.isFinite(p.lat) && Number.isFinite(p.lng) && (p.lat !== 0 || p.lng !== 0);

/** The part of the route still ahead: from the point nearest the courier. */
function ahead(route: RoutePath, courier: Point | null | undefined): RoutePath {
  if (!valid(courier) || route.length < 2) return route;
  let nearest = 0;
  let best = Infinity;
  route.forEach(([lat, lng], i) => {
    const d = (lat - courier.lat) ** 2 + (lng - courier.lng) ** 2;
    if (d < best) {
      best = d;
      nearest = i;
    }
  });
  return [[courier.lat, courier.lng], ...route.slice(nearest)];
}

/**
 * The restaurant, the customer and, when known, the courier — moving as their
 * position comes in — with the road route still to ride. Without a route
 * (routing unavailable) a dashed straight line shows the direction.
 */
export function LiveMap({
  restaurant,
  customer,
  courier,
  route,
  towards = 'customer',
  className = 'h-64',
}: {
  restaurant: Point;
  customer: Point;
  courier?: Point | null;
  /** Road route planned by delivery-service ([lat, lng] points). */
  route?: RoutePath | null;
  /** Where the courier is heading, for the straight-line fallback. */
  towards?: 'restaurant' | 'customer';
  className?: string;
}) {
  const boxRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const courierRef = useRef<L.Marker | null>(null);
  const lineRef = useRef<L.Polyline | null>(null);
  const fittedRef = useRef<string>('');
  const { lat: rLat, lng: rLng } = restaurant;
  const { lat: cLat, lng: cLng } = customer;

  useEffect(() => {
    if (!boxRef.current) return;
    const restaurant = { lat: rLat, lng: rLng };
    const customer = { lat: cLat, lng: cLng };
    const map = L.map(boxRef.current, { zoomControl: true, attributionControl: true, scrollWheelZoom: false });
    L.tileLayer(TILES, { attribution: ATTRIBUTION, maxZoom: 19 }).addTo(map);
    const points: L.LatLngExpression[] = [];
    if (valid(restaurant)) {
      L.marker([restaurant.lat, restaurant.lng], { icon: RESTAURANT, title: 'Restaurant' }).addTo(map);
      points.push([restaurant.lat, restaurant.lng]);
    }
    if (valid(customer)) {
      L.marker([customer.lat, customer.lng], { icon: CUSTOMER, title: 'Adresse de livraison' }).addTo(map);
      points.push([customer.lat, customer.lng]);
    }
    if (points.length > 0) map.fitBounds(L.latLngBounds(points), { padding: [40, 40], maxZoom: 16 });
    else map.setView([48.8566, 2.3522], 12);
    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
      courierRef.current = null;
      lineRef.current = null;
      fittedRef.current = '';
    };
  }, [rLat, rLng, cLat, cLng]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (valid(courier)) {
      const at: L.LatLngExpression = [courier.lat, courier.lng];
      if (courierRef.current) courierRef.current.setLatLng(at);
      else courierRef.current = L.marker(at, { icon: COURIER, title: 'Livreur', zIndexOffset: 1000 }).addTo(map);
    }

    const target = towards === 'restaurant' ? { lat: rLat, lng: rLng } : { lat: cLat, lng: cLng };
    const onRoads = !!route && route.length > 1;
    const path: L.LatLngExpression[] | null = onRoads
      ? ahead(route, courier)
      : valid(courier) && valid(target)
        ? [
            [courier.lat, courier.lng],
            [target.lat, target.lng],
          ]
        : null;
    if (!path) return;
    const style: L.PolylineOptions = onRoads
      ? { color: '#004430', weight: 5, opacity: 0.85, lineJoin: 'round', dashArray: undefined }
      : { color: '#004430', weight: 3, dashArray: '6 8' };
    if (lineRef.current) lineRef.current.setLatLngs(path).setStyle(style);
    else lineRef.current = L.polyline(path, style).addTo(map);

    // Frame the whole route once per route, not on every point (the user may be zooming).
    const key = onRoads ? `${route.length}:${route[0].join()}` : `line:${towards}`;
    if (fittedRef.current !== key) {
      fittedRef.current = key;
      map.fitBounds(L.latLngBounds(path), { padding: [40, 40], maxZoom: 17 });
    }
  }, [courier, route, towards, rLat, rLng, cLat, cLng]);

  return <div ref={boxRef} className={`z-0 w-full overflow-hidden rounded-xl ${className}`} role="img" aria-label="Carte de la livraison" />;
}
