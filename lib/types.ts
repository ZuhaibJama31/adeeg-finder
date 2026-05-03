export type Role = "client" | "worker" | "admin";

export type User = {
  id: number;
  name: string;
  phone: string;
  role: Role;
  city?: string | null;
  rating?: number | null;
  bio?: string | null;
  skills?: string[] | string | null;
  category?: Category | null;
  category_id?: number | null;
};

export type Category = {
  id: number;
  name: string;
  slug?: string;
  icon?: string | null;
  description?: string | null;
  workers_count?: number;
};

export type BookingStatus =
  | "pending"
  | "accepted"
  | "rejected"
  | "in_progress"
  | "completed"
  | "cancelled";

export type Booking = {
  id: number;
  status: BookingStatus;
  description: string;
  address: string;
  city: string;
  scheduled_at: string;
  agreed_price?: number | null;
  created_at?: string;
  worker?: Worker;
  client?: User ;
  worker_id?: number;
  client_id?: number;
};

export type AuthResponse = {
  message: string;
  token: string;
  user: User;
};

export type Worker = {
  id: number;
  user_id?: number;

  user: User;

  category?: Category | null;

  rating?: number;
  bio?: string | null;
  profile_picture?: string | null;
  experience_years?: number;
  is_available?: boolean;
};