export type UserRole = 'admin' | 'vendor' | 'buyer';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  created_at?: string;
  kyc_status?: 'unverified' | 'pending' | 'verified' | 'rejected';
  kyc_document?: string;
}

export interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  image: string;
  description: string;
  average_rating: number;
  review_count: number;
  vendor_name?: string;
  vendor_kyc_status?: 'unverified' | 'pending' | 'verified' | 'rejected';
  stock: number;
  vendor_id?: number;
  created_at?: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Review {
  id: number;
  product_id: number;
  user_id: number;
  rating: number;
  comment: string;
  created_at: string;
  user_name: string;
  avatar: string;
}

export interface Order {
  id: number;
  buyer_id: number;
  total: number;
  status: 'Processing' | 'Shipped' | 'Delivered';
  shipping_address: string;
  created_at: string;
  buyer_name?: string;
  buyer_email?: string;
  items?: OrderItem[];
}

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  quantity: number;
  price: number;
  name?: string;
  image?: string;
}

export interface Notification {
  id: number;
  user_id: number;
  message: string;
  type: 'order' | 'review' | 'status' | 'system';
  is_read: boolean;
  created_at: string;
}
