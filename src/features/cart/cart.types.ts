import { Product } from '../product/product.types';

export interface CartItem extends Product {
  quantity: number;
}
