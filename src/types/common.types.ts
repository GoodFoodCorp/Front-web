/** Shared types used across features. */

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  is_active: boolean;
}

export interface Profile {
  user_id: string;
  email: string;
  tenant_id: string;
  roles: string[];
}
