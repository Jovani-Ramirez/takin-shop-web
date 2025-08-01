import React from 'react';

import {
    Button,
    Container,
    TextField,
    Typography,
    Divider
} from '@mui/material';
import { useState } from 'react';
import { GoogleAuthProvider, signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { auth } from '../api/firebaseConfig';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../api/firebaseConfig';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const loginWithEmail = async () => {
        try {
            await signInWithEmailAndPassword(auth, email, password);
            navigate('/');
        } catch (err) {
            alert('Error al iniciar sesión');
        }
    };

    const loginWithGoogle = async () => {
        const provider = new GoogleAuthProvider();
        try {
          const result = await signInWithPopup(auth, provider);
          const user = result.user;
      
          if (!user) {
            alert('Error al obtener datos del usuario.');
            return;
          }
      
          const negocioRef = doc(db, 'negocios', user.uid);
          const negocioSnap = await getDoc(negocioRef);
      
          if (negocioSnap.exists()) {
            // Ya tiene negocio, ir al home
            navigate('/');
          } else {
            // No existe negocio, ir a registro
            navigate('/registro-negocio');
          }
      
        } catch (error: any) {
          alert('Error con Google');
          console.error(error);
        }
      };
    return (
        <Container maxWidth="xs" sx={{ mt: 4 }}>
            <Typography variant="h5" align="center" gutterBottom>
                Iniciar Sesión
            </Typography>
            <TextField
                label="Correo electrónico"
                fullWidth
                margin="normal"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />
            <TextField
                label="Contraseña"
                type="password"
                fullWidth
                margin="normal"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />
            <Button variant="contained" fullWidth sx={{ mt: 2 }} onClick={loginWithEmail}>
                Iniciar sesión
            </Button>

            <Divider sx={{ my: 2 }}>o</Divider>

            <Button variant="outlined" fullWidth onClick={loginWithGoogle}>
                Iniciar con Google
            </Button>

            <Button
                fullWidth
                sx={{ mt: 2 }}
                onClick={() => navigate('/register')}
            >
                Crear una cuenta
            </Button>
        </Container>
    );
}
