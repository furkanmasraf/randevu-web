import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import RegisterShop from './pages/RegisterShop'; 
import BookAppointment from './pages/BookAppointment'; // Yeni randevu sayfasını import ettik

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? <>{children}</> : <Navigate to="/login" />;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Dükkan kayıt rotasını da korumalı hale getirdik */}
        <Route path="/register-shop" element={<ProtectedRoute><RegisterShop /></ProtectedRoute>} />
        
        {/* Dinamik dükkan ID'sini yakalayacak korumalı Randevu Alma rotasını ekledik */}
        <Route path="/book-appointment/:shopId" element={<ProtectedRoute><BookAppointment /></ProtectedRoute>} />
        
        <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
      </Routes>
    </Router>
  );
}

export default App;