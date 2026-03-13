import { Order } from './order.types';

export const fetchUserOrders = async (userId: number): Promise<Order[]> => {
  const res = await fetch(`/api/users/${userId}/orders`);
  if (!res.ok) throw new Error('Failed to fetch user orders');
  return res.json();
};

export const fetchAdminOrders = async (): Promise<Order[]> => {
  const res = await fetch('/api/admin/orders');
  if (!res.ok) throw new Error('Failed to fetch admin orders');
  return res.json();
};

export const fetchVendorOrders = async (vendorId: number): Promise<Order[]> => {
  const res = await fetch(`/api/vendor/${vendorId}/orders`);
  if (!res.ok) throw new Error('Failed to fetch vendor orders');
  return res.json();
};

export const createOrder = async (orderData: any) => {
  const res = await fetch('/api/checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(orderData)
  });
  if (!res.ok) throw new Error('Failed to create order');
  return res.json();
};

export const updateOrderStatus = async (orderId: number, status: string) => {
  const res = await fetch(`/api/admin/orders/${orderId}/status`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status })
  });
  if (!res.ok) throw new Error('Failed to update order status');
  return res.json();
};
