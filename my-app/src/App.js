import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import UserManager from './components/UserManager';
import ProductManager from './components/ProductManager';

export default function App() {
  return (
    <BrowserRouter>
      <CssBaseline />
      <Box sx={{ display: 'flex', height: '100vh' }}>
        <Sidebar />
        <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/user-manager" element={<UserManager />} />
            <Route path="/product-manager" element={<ProductManager />} />
          </Routes>
        </Box>
      </Box>
    </BrowserRouter>
  );
}
