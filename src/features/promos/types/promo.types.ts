/** Promo codes are network-wide (siège only) and owned by promo-service. */
export interface PromoCode {
  id: string;
  code: string;
  percent_off: number;
  min_order_amount_cents: number;
  max_redemptions: number | null;
  redemptions_used: number;
  starts_at: string;
  expires_at?: string;
  is_active: boolean;
  created_at: string;
}

/** Payload for creating/updating a promo code (siège only). */
export interface PromoCodeForm {
  code: string;
  percent_off: number;
  min_order_amount_cents: number;
  max_redemptions: number | null;
  expires_at?: string;
  is_active: boolean;
}

export interface PromoPreview {
  valid: boolean;
  code: string;
  percent_off: number;
  discount_cents: number;
}
