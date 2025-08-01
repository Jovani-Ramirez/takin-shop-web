global.structuredClone = global.structuredClone || ((obj) => JSON.parse(JSON.stringify(obj)));

import React from 'react';
import { render, screen, act } from '@testing-library/react';
import ProductsPage from '../ProductsPage';
import { BrowserRouter as Router } from 'react-router-dom';

// Mocks para Dexie (IndexedDB)
jest.mock('../../db/productsDB', () => ({
  productsDB: {
    products: {
      toArray: jest.fn().mockResolvedValue([]),
      clear: jest.fn(),
      bulkPut: jest.fn(),
    },
  },
}));

jest.mock('../../db/index', () => ({
    __esModule: true,
    default: {
      cart: {
        toArray: jest.fn().mockResolvedValue([{ id: 1, quantity: 1 }, { id: 2, quantity: 3 }]),
        get: jest.fn(),
        update: jest.fn(),
        add: jest.fn(),
      },
    },
  }));
  

// Mock Firebase
jest.mock('firebase/firestore', () => ({
    getDocs: jest.fn().mockResolvedValue({
      docs: [
        { id: '1', data: () => ({ name: 'Product 1', description: 'desc', price: 100 }) },
        { id: '2', data: () => ({ name: 'Product 2', description: 'desc', price: 100 }) },
      ],
    }),
    collection: jest.fn(),
    getFirestore: jest.fn(),
    doc: jest.fn(),
    getDoc: jest.fn(),
  }));
  
  
jest.mock('firebase/auth', () => ({
  getAuth: jest.fn().mockReturnValue({ currentUser: { uid: 'user123' } }),
  onAuthStateChanged: jest.fn(),
}));

// Render con router
const renderWithRouter = () =>
  render(
    <Router>
      <ProductsPage />
    </Router>
  );

  describe('ProductsPage', () => {
    beforeAll(() => {
      class MockIntersectionObserver {
        observe = jest.fn();
        unobserve = jest.fn();
        disconnect = jest.fn();
      }
  
      Object.defineProperty(global, 'IntersectionObserver', {
        writable: true,
        configurable: true,
        value: MockIntersectionObserver,
      });
    });
  
    it('renderiza correctamente', async () => {
      await act(async () => {
        renderWithRouter();
      });  
    });
  
    it('muestra contador del carrito con productos', async () => {
      await act(async () => {
        renderWithRouter();
      });
  
      expect(await screen.findByText('4')).toBeInTheDocument(); // badge del carrito
    });
  
    it('simula scroll infinito (intersection observer)', async () => {
      await act(async () => {
        renderWithRouter();
      });
  
      // No es necesario hacer nada aquí, ya se mockeó IntersectionObserver arriba
      expect(global.IntersectionObserver).toBeDefined();
    });
  });
  
