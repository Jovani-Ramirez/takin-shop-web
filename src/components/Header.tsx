import React from 'react';

import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { auth, } from '../api/firebaseConfig';
import type { User } from 'firebase/auth';

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<User | null>(auth.currentUser);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(setUser);
    return unsubscribe;
  }, []);

  const handleLogout = () => {
    auth.signOut();
  };

  const isLoginPage = location.pathname === '/login';
  const isRegistroNegocio = location.pathname === '/registro-negocio';

  return (
    <AppBar position="static" sx={{ mb: 2 }}>
      <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Typography
          variant="h6"
          component={Link}
          to="/"
          color="inherit"
          sx={{ textDecoration: 'none', fontWeight: 'bold' }}
        >
          🏥 Farmacia
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {user && (
            <>
              {isRegistroNegocio && (
                <Typography variant="body2" color="inherit">
                  Registrando negocio
                </Typography>
              )}
            </>
          )}

          {!isRegistroNegocio && (
            <>
              {user ? (
                <Button color="inherit" onClick={handleLogout}>
                  Cerrar sesión
                </Button>
              ) : isLoginPage ? (
                <Button color="inherit" onClick={() => navigate(-1)}>
                  Regresar
                </Button>
              ) : (
                <Button color="inherit" onClick={() => navigate('/login')}>
                  Iniciar sesión
                </Button>
              )}
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}
