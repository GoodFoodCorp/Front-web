import { http } from '../../../services/http';
import type {
  CreateStockPayload,
  MovementPayload,
  MovementResult,
  ReplenishmentRequest,
  StockItem,
  StockMovement,
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
