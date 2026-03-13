import { CartItem } from './cart.types';

export const addToCart = async (productId: number, quantity: number) => {
  const res = await fetch('/api/cart', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ productId, quantity })
  });
  if (!res.ok) throw new Error('Failed to add to cart');
  return res.json();
};

export const fetchCart = async (): Promise<CartItem[]> => {
  const res = await fetch('/api/cart');
  if (!res.ok) throw new Error('Failed to fetch cart');
  return res.json();
};
