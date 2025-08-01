// src/pages/__tests__/CartPage.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CartPage from '../CartPage';
import { BrowserRouter } from 'react-router-dom';

// Mocks globales
jest.mock('../../api/firebaseConfig', () => ({
  auth: { currentUser: null },
  db: {}
}));

jest.mock('../../db/index', () => ({
  __esModule: true,
  default: {
    cart: {
      toArray: jest.fn().mockResolvedValue([]),
      update: jest.fn(),
      delete: jest.fn(),
      clear: jest.fn()
    }
  }
}));

jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  addDoc: jest.fn(),
  getDoc: jest.fn().mockResolvedValue({ exists: () => false }),
  doc: jest.fn(),
  Timestamp: { now: jest.fn() }
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn()
}));

// 🔧 Wrapper con router
const renderWithRouter = (ui: React.ReactElement) => {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
};

describe('CartPage', () => {
  it('muestra mensaje cuando el carrito está vacío', async () => {
    renderWithRouter(<CartPage />);

    await waitFor(() => {
      expect(screen.getByText('Tu carrito está vacío.')).toBeInTheDocument();
    });
  });

  it('muestra input para código de promoción', async () => {
    renderWithRouter(<CartPage />);
    expect(await screen.findByLabelText(/código de promoción/i)).toBeInTheDocument();
  });

});
