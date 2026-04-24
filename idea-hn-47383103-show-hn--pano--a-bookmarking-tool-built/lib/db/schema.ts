export interface Shelf {
  id: number;
  name: string;
  description: string | null;
  cover_image: string | null;
  created_at: string;
  updated_at: string;
  order_index: number;
}

export interface Item {
  id: number;
  shelf_id: number;
  url: string;
  title: string;
  description: string | null;
  image_url: string | null;
  favicon_url: string | null;
  created_at: string;
  tags: string | null;
}

export interface User {
  id: string;
  email: string;
  premium: boolean;
  premium_expires_at: string | null;
}
