// src/pages/__tests__/RegistroNegocioPage.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import RegistroNegocioPage from '../RegistroNegocioPage';
import { BrowserRouter } from 'react-router-dom';

// Mock de useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Mock firebase/firestore con doc que retorna objeto y setDoc como mock
jest.mock('firebase/firestore', () => {
  const original = jest.requireActual('firebase/firestore');
  return {
    ...original,
    doc: jest.fn(() => ({})),  // Retorna objeto vacío para evitar undefined
    setDoc: jest.fn(),
  };
});
const mockSetDoc = require('firebase/firestore').setDoc;

// Mock firebaseConfig con ruta corregida
jest.mock('../../api/firebaseConfig', () => ({
  auth: {
    currentUser: { uid: '123', email: 'test@example.com' },
  },
  db: {},
}));

describe('RegistroNegocioPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderComponent = () =>
    render(
      <BrowserRouter>
        <RegistroNegocioPage />
      </BrowserRouter>
    );

  it('renderiza todos los inputs y botón', () => {
    renderComponent();

    expect(screen.getByLabelText(/nombre del local/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/nombre del dueño/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/dirección/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/teléfono/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /guardar negocio/i })).toBeInTheDocument();
  });

  it('permite escribir en los campos', () => {
    renderComponent();

    fireEvent.change(screen.getByLabelText(/nombre del local/i), { target: { value: 'Mi local' } });
    fireEvent.change(screen.getByLabelText(/nombre del dueño/i), { target: { value: 'Juan' } });
    fireEvent.change(screen.getByLabelText(/dirección/i), { target: { value: 'Calle Falsa 123' } });
    fireEvent.change(screen.getByLabelText(/teléfono/i), { target: { value: '555-1234' } });

    expect(screen.getByLabelText(/nombre del local/i)).toHaveValue('Mi local');
    expect(screen.getByLabelText(/nombre del dueño/i)).toHaveValue('Juan');
    expect(screen.getByLabelText(/dirección/i)).toHaveValue('Calle Falsa 123');
    expect(screen.getByLabelText(/teléfono/i)).toHaveValue('555-1234');
  });

  it('guarda datos y navega cuando usuario está autenticado', async () => {
    renderComponent();

    fireEvent.change(screen.getByLabelText(/nombre del local/i), { target: { value: 'Mi local' } });
    fireEvent.change(screen.getByLabelText(/nombre del dueño/i), { target: { value: 'Juan' } });
    fireEvent.change(screen.getByLabelText(/dirección/i), { target: { value: 'Calle Falsa 123' } });
    fireEvent.change(screen.getByLabelText(/teléfono/i), { target: { value: '555-1234' } });

    fireEvent.click(screen.getByRole('button', { name: /guardar negocio/i }));

    await waitFor(() => {
      expect(mockSetDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          nombreLocal: 'Mi local',
          nombrePersona: 'Juan',
          direccion: 'Calle Falsa 123',
          telefono: '555-1234',
          uid: '123',
          email: 'test@example.com',
        })
      );
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });


  it('muestra alerta si falla guardar datos', async () => {
    window.alert = jest.fn();
    mockSetDoc.mockRejectedValueOnce(new Error('Fallo en guardar'));

    renderComponent();

    fireEvent.change(screen.getByLabelText(/nombre del local/i), { target: { value: 'Mi local' } });
    fireEvent.change(screen.getByLabelText(/nombre del dueño/i), { target: { value: 'Juan' } });
    fireEvent.change(screen.getByLabelText(/dirección/i), { target: { value: 'Calle Falsa 123' } });
    fireEvent.change(screen.getByLabelText(/teléfono/i), { target: { value: '555-1234' } });

    fireEvent.click(screen.getByRole('button', { name: /guardar negocio/i }));

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('Error al guardar los datos.');
    });
  });
});
