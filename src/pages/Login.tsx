import React, { useState, ChangeEvent, FormEvent } from 'react';
// Sayfa geçişlerini yönetmek için useNavigate hook'unu kullanıyoruz
import { useNavigate } from 'react-router-dom';
import API from '../services/api';

const Login: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // Yönlendiriciyi tanımlıyoruz
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setIsLoading(true);

    console.log("Backend'e giriş isteği gönderiliyor:", { email, password });

    try {
      // Spring Boot backend'indeki login endpoint'ine istek atıyoruz
      const response = await API.post('/auth/login', { email, password });

      // Backend artık bir Map döndüğü için içerisinden hem token'ı hem de userId'yi çekiyoruz
      const { token, userId, role } = response.data;

    if (token) {
      localStorage.setItem('token', token);
      localStorage.setItem('userId', userId);
      localStorage.setItem('role', role); // Rolü de hafızaya yazıyoruz

        // Role göre yol ayrımı
        if (role && role.toUpperCase() === 'BARBER') {
          navigate('/barber/dashboard'); // Dükkan sahibini yönetim paneline uçuruyoruz
        } else {
          navigate('/'); // Müşteriyi dükkan listesine gönderiyoruz
        }
      }
    } catch (err: any) {
      setIsLoading(false);
      console.error("Giriş esnasında hata oluştu:", err);
      
      if (err.response) {
        alert("Hatalı e-posta veya şifre girdiniz!");
      } else {
        alert("Backend sunucusuna ulaşılamıyor. Spring Boot projenin açık olduğundan emin ol!");
      }
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', fontFamily: 'sans-serif', backgroundColor: '#f9fafb', margin: 0, overflow: 'hidden' }}>
      
      {/* SOL TARAF: Görsel ve Slogan Alanı */}
      <div style={{
        flex: 1,
        backgroundImage: `url('https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=1000&q=80')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(2px)' }}></div>
        <div style={{ position: 'relative', zIndex: 10, textAlign: 'center', padding: '0 48px' }}>
          <h1 style={{ fontSize: '3rem', fontWeight: 800, color: '#ffffff', margin: '0 0 16px 0', letterSpacing: '1px' }}>
            Randevu Kuaför
          </h1>
          <p style={{ fontSize: '1.25rem', color: '#e5e7eb', fontWeight: 500, margin: 0 }}>
            Tarzını keşfet, sıradaki randevunu saniyeler içinde planla.
          </p>
        </div>
      </div>

      {/* SAĞ TARAF: Giriş Formu */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', padding: '48px', justifyContent: 'center' }}>
        <div style={{
          width: '100%',
          maxWidth: '420px',
          backgroundColor: '#ffffff',
          padding: '40px',
          borderRadius: '16px',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)',
          border: '1px solid #f3f4f6'
        }}>
          
          <div style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '1.85rem', fontWeight: 700, color: '#111827', margin: '0 0 8px 0' }}>
              Tekrar Hoş Geldiniz
            </h2>
            <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0 }}>
              Hesabınıza giriş yapın ve randevularınızı yönetin.
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Email Alanı */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#374151' }}>E-posta Adresi</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                style={{ padding: '12px 16px', borderRadius: '10px', border: '1px solid #d1d5db', fontSize: '0.95rem', outline: 'none' }}
                placeholder="name@example.com"
              />
            </div>

            {/* Şifre Alanı */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#374151' }}>Şifre</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                style={{ padding: '12px 16px', borderRadius: '10px', border: '1px solid #d1d5db', fontSize: '0.95rem', outline: 'none' }}
                placeholder="••••••••"
              />
            </div>

            {/* Giriş Butonu */}
            <button
              type="submit"
              disabled={isLoading}
              style={{
                marginTop: '10px',
                padding: '14px',
                borderRadius: '10px',
                border: 'none',
                backgroundColor: isLoading ? '#4b5563' : '#111827',
                color: '#ffffff',
                fontSize: '0.95rem',
                fontWeight: 600,
                cursor: isLoading ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                transition: 'background-color 0.2s'
              }}
            >
              {isLoading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
            </button>
          </form>

          {/* Kayıt Linki */}
          <div style={{ textAlign: 'center', fontSize: '0.875rem', color: '#6b7280', marginTop: '24px' }}>
            Hesabınız yok mu?{' '}
            <a href="/register" style={{ fontWeight: 600, color: '#111827', textDecoration: 'none' }}>Hemen Kayıt Olun</a>
          </div>

        </div>
      </div>

    </div>
  );
};

export default Login;