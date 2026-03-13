export interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  image: string;
  image2?: string;
  image3?: string;
  video_url?: string;
  description: string;
  average_rating: number;
  review_count: number;
  vendor_name?: string;
  vendor_kyc_status?: 'unverified' | 'pending' | 'verified' | 'rejected';
  vendor_rating?: number;
  stock: number;
  shipping_cost?: number;
  shipping_time?: string;
  is_sale?: boolean;
  sale_price?: number;
  vendor_id?: number;
  created_at?: string;
  tags?: string[];
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
