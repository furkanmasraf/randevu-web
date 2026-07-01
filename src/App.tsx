import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import RegisterShop from './pages/RegisterShop'; 
import BookAppointment from './pages/BookAppointment'; 
import CustomerDashboard from './pages/CustomerDashboard'; // Klasör yapına göre import ismi güncellendi
import BarberDashboard from './pages/BarberDashboard';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Tüm korumaları geçici olarak kaldırıp yolları sonuna kadar açıyoruz */}
        <Route path="/register-shop" element={<RegisterShop />} />
        <Route path="/book-appointment/:shopId" element={<BookAppointment />} />
        <Route path="/" element={<Home />} />
        
        {/* İsmi MyAppointments yerine doğrudan yeni bileşen adına çektik */}
        <Route path="/my-appointments" element={<CustomerDashboard />} /> 
        
        <Route path="/shop-owner/dashboard" element={<BarberDashboard />} />
        <Route path="/shop-owner/register-shop" element={<RegisterShop />} />

        {/* Catch-all rotasını da tamamen kapatıyoruz ki tarayıcı hiçbir yere fırlatamasın */}
        {/* <Route path="*" element={<Navigate to="/login" replace />} /> */}
      </Routes>
    </Router>
  );
}

export default App;