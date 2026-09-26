/** Profiles and addresses are owned by user-service. */

export interface UserProfile {
  user_id: string;
  first_name: string;
  last_name: string;
  phone: string;
  avatar_url: string;
  age: number | null;
  updated_at: string;
}

export interface ProfileForm {
  first_name: string;
  last_name: string;
  phone: string;
  age: number | null;
}

export interface NotificationPreferences {
  email_orders: boolean;
  email_promos: boolean;
  sms_orders: boolean;
}

export interface Address {
  id: string;
  label: string;
  street: string;
  zip_code: string;
  city: string;
  is_default: boolean;
  full_address: string;
}

export interface AddressForm {
  label: string;
  street: string;
  zip_code: string;
  city: string;
  is_default: boolean;
}
