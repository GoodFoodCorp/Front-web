/** Suppliers belong to one restaurant (franchise-service). */
export interface Supplier {
  id: string;
  restaurantId: string;
  name: string;
  contactName: string;
  email: string;
  phone: string;
  createdAt: string;
}

export interface SupplierForm {
  name: string;
  contactName: string;
  email: string;
  phone: string;
}
