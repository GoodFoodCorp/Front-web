/** A role an admin can give (auth-service role slugs). */
export type StaffRole = 'user' | 'manager' | 'livreur' | 'admin';

export interface StaffMember {
  id: string;
  email: string;
  tenant_id: string | null;
  is_email_verified: boolean;
  roles: { id: number; name: string; slug: string }[];
  created_at: string;
}

export interface StaffPage {
  data: StaffMember[];
  total: number;
}
