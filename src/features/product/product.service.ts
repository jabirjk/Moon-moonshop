import { Product, Review } from './product.types';

export const fetchProducts = async (): Promise<Product[]> => {
  const res = await fetch('/api/products');
  if (!res.ok) throw new Error('Failed to fetch products');
  return res.json();
};

export const fetchProductById = async (id: number): Promise<Product> => {
  const res = await fetch(`/api/products/${id}`);
  if (!res.ok) throw new Error('Failed to fetch product');
  return res.json();
};

export const fetchProductReviews = async (productId: number): Promise<Review[]> => {
  const res = await fetch(`/api/products/${productId}/reviews`);
  if (!res.ok) throw new Error('Failed to fetch reviews');
  return res.json();
};

export const postProductReview = async (productId: number, review: Partial<Review>) => {
  const res = await fetch(`/api/products/${productId}/reviews`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(review)
  });
  if (!res.ok) throw new Error('Failed to post review');
  return res.json();
};

export const viewProduct = async (productId: number) => {
  const res = await fetch(`/api/products/${productId}/view`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to record view');
  return res.json();
};

export const fetchProductTags = async (productId: number): Promise<string[]> => {
  const res = await fetch(`/api/products/${productId}/tags`);
  if (!res.ok) throw new Error('Failed to fetch tags');
  return res.json();
};

export const postProductTags = async (productId: number, tags: string[]) => {
  const res = await fetch(`/api/products/${productId}/tags`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tags })
  });
  if (!res.ok) throw new Error('Failed to post tags');
  return res.json();
};

export const postStockAlert = async (productId: number) => {
  const res = await fetch(`/api/products/${productId}/stock-alert`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to post stock alert');
  return res.json();
};
