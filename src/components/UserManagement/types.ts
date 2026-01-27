export interface User {
  discord_id: string;
  username: string | null;
  is_active: boolean;
  can_manage_users: boolean;
  created_at: string;
}

export interface AccessRequest {
  discord_id: string;
  username: string | null;
  requested_at: string;
  status?: string;
  reviewed_by?: string | null;
  reviewed_at?: string | null;
  notes?: string | null;
}
