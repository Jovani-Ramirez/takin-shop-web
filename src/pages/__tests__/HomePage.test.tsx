import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import HomePage from '../HomePage'; // Ajusta el path según tu estructura
import { auth } from '../../api/firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';

// Mock del componente hijo
jest.mock('../ProductsPage', () => () => <div data-testid="products-page">Mock ProductsPage</div>);

// Mock de Firebase
jest.mock('../../api/firebaseConfig', () => ({
  auth: {
    currentUser: { uid: 'user123' },
    onAuthStateChanged: jest.fn(),
  },
  db: {},
}));

jest.mock('firebase/firestore', () => ({
  doc: jest.fn(),
  getDoc: jest.fn(),
}));

describe('HomePage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('muestra la información del negocio correctamente', async () => {
    const fakeData = {
      nombreLocal: 'Farmacia Tak\'in',
      nombrePersona: 'Jovani Ramírez',
    };

    (doc as jest.Mock).mockReturnValue('fakeDocRef');
    (getDoc as jest.Mock).mockResolvedValue({
      exists: () => true,
      data: () => fakeData,
    });

    (auth.onAuthStateChanged as jest.Mock).mockImplementation((callback: any) => {
      callback(); // Simular login
      return () => {}; // Simular unsubscribe
    });

    render(<HomePage />);

    await waitFor(() => {
      expect(screen.getByText(/Farmacia Tak'in \/ Jovani Ramírez/i)).toBeInTheDocument();
      expect(screen.getByTestId('products-page')).toBeInTheDocument();
    });
  });

  test('cambia de pestañas correctamente', async () => {
    (doc as jest.Mock).mockReturnValue('fakeDocRef');
    (getDoc as jest.Mock).mockResolvedValue({
      exists: () => true,
      data: () => ({
        nombreLocal: 'Farmacia',
        nombrePersona: 'Jovani',
      }),
    });

    (auth.onAuthStateChanged as jest.Mock).mockImplementation((callback: any) => {
      callback();
      return () => {};
    });

    render(<HomePage />);

    // Verifica pestaña inicial
    await waitFor(() => {
      expect(screen.getByTestId('products-page')).toBeInTheDocument();
    });

    // Cambia a pestaña "Promociones"
    fireEvent.click(screen.getByRole('tab', { name: /promociones/i }));
    expect(screen.getByText(/sección de promociones/i)).toBeInTheDocument();

    // Cambia a pestaña "Ayuda"
    fireEvent.click(screen.getByRole('tab', { name: /ayuda/i }));
    expect(screen.getByText(/sección de ayuda/i)).toBeInTheDocument();
  });

  test('no muestra información si no hay usuario o datos', async () => {
    (auth as any).currentUser = null;

    render(<HomePage />);
    await waitFor(() => {
      expect(screen.queryByText(/\/ /)).not.toBeInTheDocument();
    });
  });
});
