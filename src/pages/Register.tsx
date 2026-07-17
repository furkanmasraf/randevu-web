import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phoneNumber: string;
  role: string;
}

export default function Register() {
  const navigate = useNavigate();

  // Full ekran sınıfını yönetmek için useEffect
  useEffect(() => {
    document.body.classList.add('register-full-screen');
    return () => {
      document.body.classList.remove('register-full-screen');
    };
  }, []);

  const [formData, setFormData] = useState<FormData>({
    firstName: '', lastName: '', email: '', password: '', phoneNumber: '', role: 'CUSTOMER'
  });

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [isBtnHovered, setIsBtnHovered] = useState<boolean>(false);
  const [isMobile, setIsMobile] = useState<boolean>(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await API.post('/api/auth/register', { ...formData, role: formData.role.toUpperCase() });
      alert('Kayıt başarılı!');
      navigate('/login');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      display: 'flex', flexDirection: isMobile ? 'column' : 'row',
      width: '100vw', height: '100vh', overflow: 'hidden'
    }}>
      {/* Sol Panel */}
      <div style={{
        flex: isMobile ? '0 0 200px' : 1.1,
        backgroundImage: `url('https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=1200&q=80')`,
        backgroundSize: 'cover', backgroundPosition: 'center',
        position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>
        <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.75)' }}></div>
        <h1 style={{ position: 'relative', zIndex: 10, color: '#fff' }}>BerberLab</h1>
      </div>

      {/* Sağ Panel */}
      <div style={{ 
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', 
        backgroundColor: '#fff', overflowY: 'auto', padding: '20px'
      }}>
        <div style={{ width: '100%', maxWidth: '400px' }}>
          <h2>Yeni Hesap Oluştur</h2>
          {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}
          
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <input type="text" name="firstName" placeholder="Ad" required onChange={handleChange} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ccc' }} />
            <input type="text" name="lastName" placeholder="Soyad" required onChange={handleChange} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ccc' }} />
            <input type="email" name="email" placeholder="E-posta" required onChange={handleChange} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ccc' }} />
            <input type="tel" name="phoneNumber" placeholder="Telefon" required onChange={handleChange} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ccc' }} />
            <input type="password" name="password" placeholder="Şifre" required onChange={handleChange} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ccc' }} />
            
            <button 
              type="submit" 
              disabled={loading}
              onMouseEnter={() => setIsBtnHovered(true)}
              onMouseLeave={() => setIsBtnHovered(false)}
              style={{ 
                padding: '14px', backgroundColor: isBtnHovered ? '#4f46e5' : '#6366f1', 
                color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' 
              }}
            >
              {loading ? '...' : 'Kayıt Ol'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}