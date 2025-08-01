import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LoginPage from '../LoginPage'; // Ajusta si está en otra ruta
import { BrowserRouter } from 'react-router-dom';

import { auth } from '../../api/firebaseConfig';
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

jest.mock('firebase/auth', () => ({
    signInWithEmailAndPassword: jest.fn(),
    signInWithPopup: jest.fn(),
    GoogleAuthProvider: jest.fn().mockImplementation(() => ({})),
    getAuth: jest.fn(),
}));

jest.mock('firebase/app', () => ({
    initializeApp: jest.fn(() => ({})),
}));

jest.mock('firebase/firestore', () => ({
    doc: jest.fn(),
    getDoc: jest.fn(),
    getFirestore: jest.fn(),
}));

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockNavigate,
}));

describe('LoginPage', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    function renderComponent() {
        return render(
            <BrowserRouter>
                <LoginPage />
            </BrowserRouter>
        );
    }

    test('renderiza los campos de correo y contraseña', () => {
        renderComponent();

        expect(screen.getByLabelText(/correo electrónico/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /iniciar sesión/i })).toBeInTheDocument();
    });

    test('realiza login con email correctamente', async () => {
        (signInWithEmailAndPassword as jest.Mock).mockResolvedValue({});

        renderComponent();

        fireEvent.change(screen.getByLabelText(/correo electrónico/i), {
            target: { value: 'test@example.com' },
        });
        fireEvent.change(screen.getByLabelText(/contraseña/i), {
            target: { value: '123456' },
        });

        fireEvent.click(screen.getByRole('button', { name: /iniciar sesión/i }));

        await waitFor(() => {
            expect(signInWithEmailAndPassword).toHaveBeenCalledWith(auth, 'test@example.com', '123456');
            expect(mockNavigate).toHaveBeenCalledWith('/');
        });
    });

    test('muestra alerta si falla el login con email', async () => {
        window.alert = jest.fn();
        (signInWithEmailAndPassword as jest.Mock).mockRejectedValue(new Error('Login failed'));

        renderComponent();

        fireEvent.change(screen.getByLabelText(/correo electrónico/i), {
            target: { value: 'fail@example.com' },
        });
        fireEvent.change(screen.getByLabelText(/contraseña/i), {
            target: { value: 'wrong' },
        });

        fireEvent.click(screen.getByRole('button', { name: /iniciar sesión/i }));

        await waitFor(() => {
            expect(window.alert).toHaveBeenCalledWith('Error al iniciar sesión');
        });
    });

    test('login con Google redirige según existencia del negocio', async () => {
        const mockUser = { uid: 'user123' };

        (signInWithPopup as jest.Mock).mockResolvedValue({ user: mockUser });
        (doc as jest.Mock).mockReturnValue('fakeDocRef');
        (getDoc as jest.Mock).mockResolvedValue({
            exists: () => true,
        });

        renderComponent();
        fireEvent.click(screen.getByRole('button', { name: /iniciar con google/i }));

        await waitFor(() => {
            expect(signInWithPopup).toHaveBeenCalled();
            expect(getDoc).toHaveBeenCalled();
            expect(mockNavigate).toHaveBeenCalledWith('/');
        });
    });

    test('login con Google redirige a registro si no hay negocio', async () => {
        const mockUser = { uid: 'user456' };

        (signInWithPopup as jest.Mock).mockResolvedValue({ user: mockUser });
        (doc as jest.Mock).mockReturnValue('fakeDocRef');
        (getDoc as jest.Mock).mockResolvedValue({
            exists: () => false,
        });

        renderComponent();
        fireEvent.click(screen.getByRole('button', { name: /iniciar con google/i }));

        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith('/registro-negocio');
        });
    });

    test('redirige al registro manualmente', () => {
        renderComponent();
        fireEvent.click(screen.getByRole('button', { name: /crear una cuenta/i }));

        expect(mockNavigate).toHaveBeenCalledWith('/register');
    });
});
