import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
  const token = localStorage.getItem('token');

  // Eğer token varsa içeriği göster (Outlet), yoksa login'e yönlendir
  return token ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;