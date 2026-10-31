import { useEffect, useState } from 'react';
import { ask } from '../../services/realtime';
import type { LivePosition } from './useLiveDelivery';
import type { Point } from './LiveMap';

/** One point every few seconds: enough for a smooth map, light on battery and servers. */
const SEND_EVERY_MS = 5000;

export type SharingState = 'off' | 'on' | 'denied' | 'unsupported';

/**
 * While the courier has deliveries under way, follows their GPS and sends
 * each point to delivery-service, which answers with the recomputed arrival
 * time (also pushed to the customer).
 */
export function useShareLocation(deliveryIds: string[]) {
  const [state, setState] = useState<SharingState>('off');
  const [position, setPosition] = useState<Point | null>(null);
  const [live, setLive] = useState<Record<string, LivePosition>>({});
  const key = deliveryIds.join(',');

  useEffect(() => {
    const ids = key ? key.split(',') : [];
    if (ids.length === 0) {
      setState('off');
      return;
    }
    if (!('geolocation' in navigator)) {
      setState('unsupported');
      return;
    }
    let lastSent = 0;
    const watch = navigator.geolocation.watchPosition(
      (pos) => {
        const point = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setPosition(point);
        setState('on');
        if (Date.now() - lastSent < SEND_EVERY_MS) return;
        lastSent = Date.now();
        for (const deliveryId of ids) {
          void ask<{ ok: boolean; position?: LivePosition }>('position:update', { deliveryId, ...point })
            .then((r) => {
              if (r.ok && r.position) setLive((all) => ({ ...all, [deliveryId]: r.position! }));
            })
            .catch(() => undefined);
        }
      },
      (err) => setState(err.code === err.PERMISSION_DENIED ? 'denied' : 'off'),
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 20000 },
    );
    return () => navigator.geolocation.clearWatch(watch);
  }, [key]);

  return { state, position, live };
}
