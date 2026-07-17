import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import RegisterShop from './pages/RegisterShop'; 
import BookAppointment from './pages/BookAppointment'; 
import CustomerDashboard from './pages/CustomerDashboard';
import BarberDashboard from './pages/BarberDashboard';
import ProtectedRoute from './pages/ProtectedRoute';
import ForgotPassword from './pages/ForgotPassword';

function App() {
  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />
      
      <Router>
        <Routes>
          {/* PUBLIC ROTALAR */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/book-appointment/:shopId" element={<BookAppointment />} />
          
          {/* KORUMALI ROTALAR */}
          <Route element={<ProtectedRoute />}>
            {/* Müşteri Paneli */}
            <Route path="/customer-dashboard" element={<CustomerDashboard />} />
            <Route path="/my-appointments" element={<CustomerDashboard />} />
      
            {/* Dükkan Sahibi Paneli */}
            <Route path="/barber-dashboard" element={<BarberDashboard />} />
            <Route path="/shop-owner/dashboard" element={<BarberDashboard />} />
      
            <Route path="/shop-owner/register-shop" element={<RegisterShop />} />
          </Route>

          {/* CATCH-ALL */}
          <Route path="*" element={<Home />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;