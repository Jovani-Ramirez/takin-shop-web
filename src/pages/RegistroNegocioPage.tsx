import React from 'react';

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TextField,
  Button,
  Box,
  Typography,
} from '@mui/material';
import { auth, db } from '../api/firebaseConfig';
import { doc, setDoc } from 'firebase/firestore';

export default function RegistroNegocioPage() {
  const [nombreLocal, setNombreLocal] = useState('');
  const [nombrePersona, setNombrePersona] = useState('');
  const [direccion, setDireccion] = useState('');
  const [telefono, setTelefono] = useState('');

  const navigate = useNavigate();

  const handleGuardar = async () => {
    const user = auth.currentUser;
    if (!user) {
      alert('Usuario no autenticado.');
      return;
    }

    const data = {
      nombreLocal,
      nombrePersona,
      direccion,
      telefono,
      uid: user.uid,
      email: user.email,
    };

    try {
      await setDoc(doc(db, 'negocios', user.uid), data);
      navigate('/');
    } catch (error) {
      alert('Error al guardar los datos.');
    }
  };

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        Completa los datos de tu negocio
      </Typography>
      <TextField
        label="Nombre del local"
        fullWidth
        margin="normal"
        value={nombreLocal}
        onChange={(e) => setNombreLocal(e.target.value)}
      />
      <TextField
        label="Nombre del dueño"
        fullWidth
        margin="normal"
        value={nombrePersona}
        onChange={(e) => setNombrePersona(e.target.value)}
      />
      <TextField
        label="Dirección"
        fullWidth
        margin="normal"
        value={direccion}
        onChange={(e) => setDireccion(e.target.value)}
      />
      <TextField
        label="Teléfono"
        fullWidth
        margin="normal"
        value={telefono}
        onChange={(e) => setTelefono(e.target.value)}
      />
      <Button
        variant="contained"
        color="primary"
        fullWidth
        sx={{ mt: 2 }}
        onClick={handleGuardar}
      >
        Guardar negocio
      </Button>
    </Box>
  );
}
