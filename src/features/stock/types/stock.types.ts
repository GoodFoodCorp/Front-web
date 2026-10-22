export interface StockItem {
  id: string;
  tenantId: string;
  name: string;
  unit: string;
  quantityOnHand: number;
  thresholdMin: number;
  thresholdMax: number;
  isBelowMinimum: boolean;
  updatedAt: string;
}

export interface StockMovement {
  id: string;
  stockItemId: string;
  type: 'IN' | 'OUT' | 'ADJUSTMENT';
  quantity: number;
  reason: string;
  createdAt: string;
  createdBy: string;
  /** Quantity an order consumption could not take (insufficient stock); 0 otherwise. */
  shortfall?: number;
}

export type ReplenishmentStatus = 'PENDING' | 'APPROVED' | 'ORDERED' | 'RECEIVED' | 'CANCELLED';

export interface ReplenishmentRequest {
  id: string;
  tenantId: string;
  stockItemId: string;
  quantityRequested: number;
  status: ReplenishmentStatus;
  requestedBy: string;
  isAutomatic: boolean;
  requestedAt: string;
  updatedAt: string;
}

export interface MovementResult {
  movement: StockMovement;
  item: StockItem;
  autoReplenishment: ReplenishmentRequest | null;
}

export interface CreateStockPayload {
  name: string;
  unit: string;
  quantityOnHand: number;
  thresholdMin: number;
  thresholdMax: number;
}

export type UpdateStockPayload = CreateStockPayload;

/** What ties an article to the rest of the system; a locked article cannot be
 *  deleted nor renamed (recipes, movements, replenishments or orders use it). */
export interface StockUsage {
  dishes: string[];
  hasMovements: boolean;
  hasReplenishments: boolean;
  hasOrders: boolean;
  isLocked: boolean;
}

export interface MovementPayload {
  type: 'IN' | 'OUT' | 'ADJUSTMENT';
  quantity: number;
  reason: string;
}
