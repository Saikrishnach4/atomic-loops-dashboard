import React, { useMemo } from 'react';
import { useHookstate } from '@hookstate/core';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import MenuIcon from '@mui/icons-material/Menu';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import UserManager from './components/UserManager';
import ProductManager from './components/ProductManager';

export default function App() {
  const mode = useHookstate('light');
  const theme = useMemo(() => createTheme({ palette: { mode: mode.get() } }), [mode.get()]);
  const toggleMode = () => mode.set((m) => (m === 'light' ? 'dark' : 'light'));
  const mobileOpen = useHookstate(false);
  const toggleDrawer = () => mobileOpen.set((o) => !o);
  
  return (
    <ThemeProvider theme={theme}>
      <BrowserRouter>
        <CssBaseline />
        <AppBar position="fixed" color="transparent" elevation={0} sx={{ backdropFilter: 'blur(6px)' }}>
          <Toolbar sx={{ justifyContent: 'space-between', display: 'flex', alignItems: 'center' }}>
            
            <IconButton onClick={toggleDrawer} sx={{ display: { xs: 'inline-flex', lg: 'inline-flex' } }} color="inherit" aria-label="open drawer">
              <MenuIcon />
            </IconButton>
            <div style={{ display: 'flex', alignItems: 'center' }}>
            <IconButton onClick={toggleMode} color="inherit" aria-label="toggle theme">
              {mode.get() === 'light' ? <DarkModeIcon /> : <LightModeIcon />}
            </IconButton>
              
            <Typography variant="body2" sx={{ ml: 1 }}>{mode.get() === 'light' ? 'Light' : 'Dark'} mode</Typography>
            </div>
            
          </Toolbar>
        </AppBar>
        <Box sx={{ display: 'flex', height: '100vh' }}>
          <Sidebar mobileOpen={mobileOpen.get()} onClose={toggleDrawer} />
          <Box component="main" sx={{ flexGrow: 1, p: 3, bgcolor: (t) => (t.palette.mode === 'dark' ? 'background.default' : '#fafafa') }}>
            <Toolbar />
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/user-manager" element={<UserManager />} />
              <Route path="/product-manager" element={<ProductManager />} />
            </Routes>
          </Box>
        </Box>
      </BrowserRouter>
    </ThemeProvider>
  );
}
