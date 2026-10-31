import { useEffect, useState } from 'react';
import { ask, realtime } from '../../services/realtime';

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
}

/**
 * Follows a delivery live: joins its room on the realtime channel (the
 * server checks the viewer may watch it) and returns each new position.
 */
export function useLiveDelivery(deliveryId: string | undefined, active: boolean): LivePosition | null {
  const [position, setPosition] = useState<LivePosition | null>(null);

  useEffect(() => {
    if (!deliveryId || !active) return;
    const socket = realtime();
    const join = () => void ask('delivery:subscribe', { deliveryId }).catch(() => undefined);
    const onPosition = (p: LivePosition) => {
      if (p.deliveryId === deliveryId) setPosition(p);
    };
    join();
    socket.on('connect', join); // rooms are lost on reconnection
    socket.on('position:broadcast', onPosition);
    return () => {
      socket.off('connect', join);
      socket.off('position:broadcast', onPosition);
    };
  }, [deliveryId, active]);

  return position;
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
