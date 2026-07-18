import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import RegisterShop from './pages/RegisterShop'; 
import BookAppointment from './pages/BookAppointment'; 
import CustomerDashboard from './pages/CustomerDashboard';
import BarberDashboard from './pages/BarberDashboard';
import ProtectedRoute from './pages/ProtectedRoute';

function App() {
  return (
    <Router>
      <Routes>
        {/* PUBLIC ROTALAR (Giriş yapmadan erişilebilir) */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/book-appointment/:shopId" element={<BookAppointment />} />
        
        {/* KORUMALI ROTALAR (Sadece giriş yapmış kullanıcılar) */}
        <Route element={<ProtectedRoute />}>
        {/* Müşteri Paneli */}
        <Route path="/customer-dashboard" element={<CustomerDashboard />} />
        <Route path="/my-appointments" element={<CustomerDashboard />} />
  
        {/* Dükkan Sahibi Paneli */}
        <Route path="/barber-dashboard" element={<BarberDashboard />} />
        <Route path="/shop-owner/dashboard" element={<BarberDashboard />} />
  
         <Route path="/shop-owner/register-shop" element={<RegisterShop />} />
      </Route>

        {/* CATCH-ALL (Tanımsız rotalar için ana sayfaya yönlendir) */}
        <Route path="*" element={<Home />} />
      </Routes>
    </Router>
  );
}

export default App;