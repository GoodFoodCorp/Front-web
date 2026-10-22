import { http } from '../../../services/http';
import type { DeliveryDetail } from '../types/delivery.types';

/** Read-only on the web: couriers act on deliveries from the mobile app. */
export const deliveryApi = {
  /** The service resolves either a delivery id or an order id. */
  getByOrderId: (orderId: string) => http<DeliveryDetail>(`/api/deliveries/${orderId}`),
};
