// src/db.ts
import Dexie, {type  Table } from 'dexie';

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  quantity: number;
}

class ProductDB extends Dexie {
  products!: Table<Product, number>; // La tabla "products" con "id" como clave primaria

  constructor() {
    super('ProductDB');
    this.version(1).stores({
      products: '++id, name, price', // puedes agregar más índices si necesitas
    });
  }
}

export const productsDB = new ProductDB();
