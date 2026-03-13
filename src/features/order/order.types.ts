export interface Order {
  id: number;
  buyer_id: number;
  total: number;
  status: 'Processing' | 'Shipped' | 'Delivered';
  shipping_address: string;
  created_at: string;
}
