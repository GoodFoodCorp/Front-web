import { io, type Socket } from 'socket.io-client';
import { API_BASE_URL } from '../config/app.config';

/**
 * The live channel with delivery-service (Socket.IO namespace /tracking):
 * order notifications, new deliveries for couriers, courier positions. One
 * connection per tab, authenticated by the session cookie, reconnecting by
 * itself after a network loss.
 */
let socket: Socket | null = null;

export function realtime(): Socket {
  socket ??= io(`${API_BASE_URL}/tracking`, {
    withCredentials: true,
    transports: ['websocket', 'polling'],
    reconnectionDelayMax: 10_000,
  });
  return socket;
}

/** Signing out: the next account opens its own connection. */
export function closeRealtime(): void {
  socket?.disconnect();
  socket = null;
}

/** Sends and waits for the server's answer (Socket.IO acknowledgement). */
export function ask<T>(event: string, payload: unknown, timeoutMs = 8000): Promise<T> {
  return realtime().timeout(timeoutMs).emitWithAck(event, payload) as Promise<T>;
}
