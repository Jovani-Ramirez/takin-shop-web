// src/components/__tests__/Header.test.tsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Header from '../Header';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom';

// Estado simulado del usuario
let mockCurrentUser: { uid: string; email: string; } | null = null;

// Mock de firebaseConfig para simular auth
jest.mock('../../api/firebaseConfig', () => ({
  auth: {
    get currentUser() {
      return mockCurrentUser;
    },
    onAuthStateChanged: jest.fn((cb) => {
      cb(mockCurrentUser);
      return jest.fn(); // unsubscribe fake
    }),
    signOut: jest.fn(),
  },
}));

// Helper para renderizar con router
const renderWithRouter = (ui: React.ReactElement, { route = '/' } = {}) => {
  window.history.pushState({}, 'Test page', route);
  return render(<BrowserRouter>{ui}</BrowserRouter>);
};

describe('Header component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCurrentUser = null;  // resetear usuario antes de cada test
  });

  test('muestra el título de la farmacia', () => {
    renderWithRouter(<Header />);
    expect(screen.getByText('🏥 Farmacia')).toBeInTheDocument();
  });

  test('muestra botón "Iniciar sesión" si no hay usuario logueado', () => {
    renderWithRouter(<Header />);
    expect(screen.getByText('Iniciar sesión')).toBeInTheDocument();
  });

  test('muestra botón "Regresar" en /login si no hay usuario', () => {
    renderWithRouter(<Header />, { route: '/login' });
    expect(screen.getByText('Regresar')).toBeInTheDocument();
  });

  test('muestra texto "Registrando negocio" si está en /registro-negocio y hay usuario', () => {
    mockCurrentUser = { uid: '123', email: 'test@example.com' };
    renderWithRouter(<Header />, { route: '/registro-negocio' });
    expect(screen.getByText('Registrando negocio')).toBeInTheDocument();
  });

  test('permite cerrar sesión cuando hay usuario', () => {
    mockCurrentUser = { uid: '123', email: 'test@example.com' };
    renderWithRouter(<Header />, { route: '/' });

    const logoutButton = screen.getByText('Cerrar sesión');
    expect(logoutButton).toBeInTheDocument();

    fireEvent.click(logoutButton);
    const { auth } = require('../../api/firebaseConfig');
    expect(auth.signOut).toHaveBeenCalled();
  });
});
