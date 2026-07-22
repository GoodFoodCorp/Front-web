/** Profiles and addresses are owned by user-service. */

export interface UserProfile {
  user_id: string;
  first_name: string;
  last_name: string;
  phone: string;
  updated_at: string;
}

export interface ProfileForm {
  first_name: string;
  last_name: string;
  phone: string;
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
