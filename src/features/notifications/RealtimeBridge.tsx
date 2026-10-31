import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { closeRealtime, realtime } from '../../services/realtime';
import { selectIsLoggedIn, useAuthStore } from '../../store/authStore';
import { useNotificationStore, type AppNotification } from './notificationStore';

/** A short chime: a new order or a new delivery must not go unnoticed. */
function chime(): void {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.4);
  } catch {
    /* audio may be blocked until the first click */
  }
}

/** Shown by the system when the tab is in the background, if allowed. */
function systemNotification(n: AppNotification): void {
  if (typeof Notification === 'undefined' || Notification.permission !== 'granted' || !document.hidden) return;
  const shown = new Notification(n.title, { body: n.body, tag: n.id, icon: '/favicon.svg' });
  shown.onclick = () => {
    window.focus();
    window.location.assign(n.link);
  };
}

/**
 * Keeps the live channel open while someone is signed in and turns what it
 * receives into notifications (bell, toast, system notification) and fresh
 * data: the lists concerned are reloaded at once instead of at the next poll.
 */
export function RealtimeBridge() {
  const isLoggedIn = useAuthStore(selectIsLoggedIn);
  const userId = useAuthStore((s) => s.userId);
  const isCourier = useAuthStore((s) => s.roles.includes('livreur'));
  const isManager = useAuthStore((s) => s.roles.includes('manager'));
  const claimFor = useNotificationStore((s) => s.claimFor);
  const push = useNotificationStore((s) => s.push);
  const sync = useNotificationStore((s) => s.sync);
  const qc = useQueryClient();

  useEffect(() => {
    claimFor(isLoggedIn ? userId : null);
    if (!isLoggedIn) {
      closeRealtime();
      return;
    }
    const socket = realtime();
    void sync();
    const refresh = () => {
      void qc.invalidateQueries({ queryKey: ['orders'] });
      void qc.invalidateQueries({ queryKey: ['deliveries'] });
    };
    // Back online: the notifications sent meanwhile, and fresh lists.
    const catchUp = () => {
      refresh();
      void sync();
    };
    const notify = (n: AppNotification, loud: boolean) => {
      refresh();
      if (!push(n)) return;
      systemNotification(n);
      if (loud) chime();
    };
    // Loud: a new order for the kitchen, a new delivery for a courier.
    const onNotification = (n: AppNotification) =>
      notify(n, (isManager && n.status === 'CONFIRMED') || (isCourier && n.status === 'AVAILABLE'));
    socket.on('notification', onNotification);
    socket.on('delivery:available', refresh);
    socket.on('delivery:withdrawn', refresh);
    socket.on('delivery:cancelled', refresh);
    socket.on('connect', catchUp);
    return () => {
      socket.off('notification', onNotification);
      socket.off('delivery:available', refresh);
      socket.off('delivery:withdrawn', refresh);
      socket.off('delivery:cancelled', refresh);
      socket.off('connect', catchUp);
    };
  }, [isLoggedIn, userId, isCourier, isManager, claimFor, push, sync, qc]);

  return null;
}
