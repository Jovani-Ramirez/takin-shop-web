import Dexie, { type Table } from 'dexie';
import type { Product } from './types';

interface CartItem extends Product {}
interface CustomerInfo {
  id?: number;
  name: string;
  address: string;
  phone: string;
}

class ShoppingCartDB extends Dexie {
  cart!: Table<CartItem, number>;
  customerInfo!: Table<CustomerInfo, number>;
  products!: Table<Product, number>;

  constructor() {
    super('ShoppingCartDB');
    this.version(1).stores({
      cart: '++id, name, description, image',
      customerInfo: '++id, name, address, phone',
      products: 'id, name, description, image', // `id` no autoincrementa aquí
    });
  }
}

const db = new ShoppingCartDB();
export default db;
