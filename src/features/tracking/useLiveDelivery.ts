import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { http } from '../../services/http';
import { ask, realtime } from '../../services/realtime';

/** [lat, lng] points of a road route. */
export type RoutePath = [number, number][];

/** A point of the courier, with the arrival time recomputed from it. */
export interface LivePosition {
  deliveryId: string;
  lat: number;
  lng: number;
  timestamp: string;
  status: string;
  etaAt?: string;
  remainingKm?: number;
  phase?: 'TO_RESTAURANT' | 'TO_CUSTOMER';
  /** Sent when the route was planned again (new phase, detour). */
  route?: RoutePath;
}

interface RouteAnswer {
  route: RoutePath | null;
  etaAt?: string;
  remainingKm?: number;
  phase?: 'TO_RESTAURANT' | 'TO_CUSTOMER';
}

/** The road route left to ride, for a page opened during the delivery. */
export function useDeliveryRoute(deliveryId: string | undefined, active: boolean) {
  return useQuery({
    queryKey: ['deliveries', 'route', deliveryId],
    queryFn: () => http<RouteAnswer>(`/api/deliveries/${deliveryId}/route`),
    enabled: !!deliveryId && active,
    staleTime: 60_000,
  });
}

/**
 * Follows a delivery live: joins its room on the realtime channel (the
 * server checks the viewer may watch it) and returns each new position and
 * the road route, replaced whenever the server plans it again.
 */
export function useLiveDelivery(deliveryId: string | undefined, active: boolean) {
  const [position, setPosition] = useState<LivePosition | null>(null);
  const [liveRoute, setLiveRoute] = useState<RoutePath | null>(null);
  const { data: initial } = useDeliveryRoute(deliveryId, active);

  useEffect(() => {
    if (!deliveryId || !active) return;
    const socket = realtime();
    const join = () => void ask('delivery:subscribe', { deliveryId }).catch(() => undefined);
    const onPosition = (p: LivePosition) => {
      if (p.deliveryId !== deliveryId) return;
      setPosition(p);
      if (p.route) setLiveRoute(p.route);
    };
    join();
    socket.on('connect', join); // rooms are lost on reconnection
    socket.on('position:broadcast', onPosition);
    return () => {
      socket.off('connect', join);
      socket.off('position:broadcast', onPosition);
    };
  }, [deliveryId, active]);

  return {
    position,
    route: liveRoute ?? initial?.route ?? null,
    etaAt: position?.etaAt ?? initial?.etaAt,
    phase: position?.phase ?? initial?.phase,
    remainingKm: position?.remainingKm ?? initial?.remainingKm,
  };
}

/** "12:42 · dans 8 min". */
export function formatEta(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const at = new Date(iso);
  const minutes = Math.max(0, Math.round((at.getTime() - Date.now()) / 60_000));
  const time = at.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  return minutes <= 1 ? `${time} · imminent` : `${time} · dans ${minutes} min`;
}

/** Turn-by-turn navigation in the courier's own GPS app. */
export function navigationLinks(to: { lat: number; lng: number }) {
  const dest = `${to.lat},${to.lng}`;
  return {
    google: `https://www.google.com/maps/dir/?api=1&destination=${dest}&travelmode=bicycling`,
    waze: `https://waze.com/ul?ll=${dest}&navigate=yes`,
    apple: `https://maps.apple.com/?daddr=${dest}`,
  };
}
