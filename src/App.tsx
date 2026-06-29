import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import RegisterShop from './pages/RegisterShop'; 
import BookAppointment from './pages/BookAppointment'; 
import MyAppointments from './pages/MyAppointments';
import BarberDashboard from './pages/BarberDashboard';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  if (!token) {
    return <Navigate to="/login" />;
  }

  if (allowedRoles && (!role || !allowedRoles.includes(role.toUpperCase()))) {
    if (role?.toUpperCase() === 'SHOP_OWNER') {
      return <Navigate to="/shop-owner/dashboard" />;
    }
    return <Navigate to="/" />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        <Route 
          path="/register-shop" 
          element={
            <ProtectedRoute allowedRoles={['SHOP_OWNER']}>
              <RegisterShop />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/book-appointment/:shopId" 
          element={
            <ProtectedRoute allowedRoles={['CUSTOMER']}>
              <BookAppointment />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/" 
          element={
            <ProtectedRoute allowedRoles={['CUSTOMER']}>
              <Home />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/my-appointments" 
          element={
            <ProtectedRoute allowedRoles={['CUSTOMER']}>
              <MyAppointments />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/shop-owner/dashboard" 
          element={
            <ProtectedRoute allowedRoles={['SHOP_OWNER']}>
              <BarberDashboard />
            </ProtectedRoute>
          } 
        />

        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;