import React, { useEffect, useState } from 'react';
import { auth, db } from '../api/firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import {
  Box,
  Typography,
  Avatar,
  Tabs,
  Tab,
  Divider,
} from '@mui/material';
import ProductsPage from './ProductsPage';

export default function HomePage() {
  const [nombreLocal, setNombreLocal] = useState<string | null>(null);
  const [nombrePersona, setNombrePersona] = useState<string | null>(null);
  const [tabIndex, setTabIndex] = useState(0);

  useEffect(() => {
    const fetchNegocio = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          const negocioRef = doc(db, 'negocios', user.uid);
          const negocioSnap = await getDoc(negocioRef);
          if (negocioSnap.exists()) {
            const data = negocioSnap.data();
            setNombreLocal(data.nombreLocal || null);
            setNombrePersona(data.nombrePersona || null);
          } else {
            setNombreLocal(null);
            setNombrePersona(null);
          }
        } else {
          setNombreLocal(null);
          setNombrePersona(null);
        }
      } catch (error) {
        // Maneja o al menos logea el error para evitar que quede pendiente
        console.error('Error fetchNegocio:', error);
        setNombreLocal(null);
        setNombrePersona(null);
      }
    };
  
    fetchNegocio();
  
    const unsubscribe = auth.onAuthStateChanged(() => fetchNegocio());
    return unsubscribe;
  }, []);
  

  const avatarLetter = nombreLocal ? nombreLocal.substring(0, 2).toUpperCase() : '?';

  return (
    <Box sx={{ p: 2 }}>
      {nombreLocal && nombrePersona && (
        <Box
          sx={{
            background: 'linear-gradient(90deg, #1976d2 0%, #42a5f5 100%)',
            color: 'white',
            p: 1.5,
            borderRadius: 2,
            boxShadow: '0 3px 6px rgba(0,0,0,0.2)',
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            fontWeight: 'medium',
            fontSize: '1rem',
            mb: 2,
            userSelect: 'none',
            maxWidth: 400,
          }}
          aria-label="Información del negocio"
        >
          <Avatar
            sx={{ bgcolor: 'rgba(255,255,255,0.3)', color: 'white', fontWeight: 'bold' }}
            aria-label="Avatar negocio"
          >
            {avatarLetter}
          </Avatar>
          <Typography component="span" noWrap sx={{ flexGrow: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {nombreLocal} / {nombrePersona}
          </Typography>
        </Box>
      )}

      <Tabs
        value={tabIndex}
        onChange={(_, newValue) => setTabIndex(newValue)}
        textColor="primary"
        indicatorColor="primary"
        variant="fullWidth"
        sx={{ mb: 2 }}
      >
        <Tab label="Productos" />
        <Tab label="Promociones" />
        <Tab label="Ayuda" />
      </Tabs>

      <Divider sx={{ mb: 2 }} />

      {tabIndex === 0 && <ProductsPage />}
      {tabIndex === 1 && <Typography>Sección de promociones (próximamente)</Typography>}
      {tabIndex === 2 && <Typography>Sección de ayuda (próximamente)</Typography>}
    </Box>
  );
}
