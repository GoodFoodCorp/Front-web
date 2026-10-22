import { http } from '../../../services/http';
import type {
  CreateStockPayload,
  MovementPayload,
  MovementResult,
  ReplenishmentRequest,
  StockItem,
  StockMovement,
  StockUsage,
  UpdateStockPayload,
} from '../types/stock.types';

interface StockDetail {
  item: StockItem;
  movements: StockMovement[];
}

export const stockApi = {
  list: () => http<StockItem[]>('/api/stocks'),

  get: (id: string) => http<StockDetail>(`/api/stocks/${id}`),

  create: (payload: CreateStockPayload) =>
    http<StockItem>('/api/stocks', { method: 'POST', body: JSON.stringify(payload) }),

  update: (id: string, payload: UpdateStockPayload) =>
    http<StockItem>(`/api/stocks/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),

  remove: (id: string) => http<void>(`/api/stocks/${id}`, { method: 'DELETE' }),

  usage: (id: string) => http<StockUsage>(`/api/stocks/${id}/usage`),

  registerMovement: (id: string, payload: MovementPayload) =>
    http<MovementResult>(`/api/stocks/${id}/movements`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  listReplenishments: () => http<ReplenishmentRequest[]>('/api/replenishment-requests'),

  createReplenishment: (stockItemId: string, quantityRequested: number) =>
    http<ReplenishmentRequest>('/api/replenishment-requests', {
      method: 'POST',
      body: JSON.stringify({ stockItemId, quantityRequested }),
    }),

  updateReplenishmentStatus: (id: string, status: string) =>
    http<ReplenishmentRequest>(`/api/replenishment-requests/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
};
