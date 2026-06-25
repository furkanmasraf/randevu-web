import React, { useState, ChangeEvent, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:8080/api'
});

const Register: React.FC = () => {
  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
  e.preventDefault();
  setIsLoading(true);

  // Backend'deki User entity yapına uygun request objesi
  const registerData = {
    firstName,
    lastName,
    email,
    phone,
    password
    // 💡 İleride buraya varsayılan olarak "CUSTOMER" rolü de eklenebilir
  };

  try {
    // 🚀 Spring Boot backendindeki kayıt endpointine (Security'den muaf tuttuğumuz alana) istek atıyoruz
    // Not: Endpoint yolun /api/auth/register veya /users olabilir, projene göre düzenleyebilirsin
    const response = await API.post('/auth/register', registerData); 

    console.log("Kayıt başarılı! Gelen veri:", response.data);
    setIsLoading(false);
    
    // Kayıt başarılıysa kullanıcıyı giriş ekranına pasla
    navigate('/login');
  } catch (err) {
    setIsLoading(false);
    console.error("Kayıt esnasında hata oluştu:", err);
    alert("Kayıt başarısız! Lütfen bilgileri kontrol edin veya backend'in açık olduğundan emin olun.");
  }
};

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', fontFamily: 'sans-serif', backgroundColor: '#f9fafb', margin: 0, overflow: 'hidden' }}>
      
      {/* 🏙️ SOL TARAF: Görsel ve Slogan Alanı (Giriş ekranıyla uyumlu) */}
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
            Hemen hesabınızı oluşturun, dijital randevu konforunu yaşayın.
          </p>
        </div>
      </div>

      {/* 📝 SAĞ TARAF: Modern Kayıt Formu */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', padding: '48px', justifyContent: 'center', overflowY: 'auto' }}>
        <div style={{
          width: '100%',
          maxWidth: '460px',
          backgroundColor: '#ffffff',
          padding: '40px',
          borderRadius: '16px',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)',
          border: '1px solid #f3f4f6',
          margin: 'auto 0'
        }}>
          
          <div style={{ marginBottom: '28px' }}>
            <h2 style={{ fontSize: '1.85rem', fontWeight: 700, color: '#111827', margin: '0 0 8px 0' }}>
              Yeni Hesap Oluştur
            </h2>
            <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0 }}>
              Kişisel bilgilerinizi girerek saniyeler içinde kayıt olun.
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            {/* Ad & Soyad Yan Yana (Grid Düzeni) */}
            {/* 🛠️ Jilet Gibi Hizalanmış Ad & Soyad Alanı */}
            <div style={{ display: 'flex', gap: '16px', width: '100%', boxSizing: 'border-box' }}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#374151' }}>Adınız</label>
            <input
              type="text"
              required
              value={firstName}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setFirstName(e.target.value)}
              style={{ padding: '12px 16px', borderRadius: '10px', border: '1px solid #d1d5db', fontSize: '0.95rem', outline: 'none', width: '100%', boxSizing: 'border-box' }}
              placeholder="Ahmet"
            />
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#374151' }}>Soyadınız</label>
            <input
              type="text"
              required
              value={lastName}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setLastName(e.target.value)}
              style={{ padding: '12px 16px', borderRadius: '10px', border: '1px solid #d1d5db', fontSize: '0.95rem', outline: 'none', width: '100%', boxSizing: 'border-box' }}
              placeholder="Yılmaz"
            />
            </div>
            </div>

            {/* E-posta Alanı */}
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

            {/* Telefon Numarası */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#374151' }}>Telefon Numarası</label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setPhone(e.target.value)}
                style={{ padding: '12px 16px', borderRadius: '10px', border: '1px solid #d1d5db', fontSize: '0.95rem', outline: 'none' }}
                placeholder="0555 555 5555"
              />
            </div>

            {/* Şifre Alanı */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#374151' }}>Şifre</label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                style={{ padding: '12px 16px', borderRadius: '10px', border: '1px solid #d1d5db', fontSize: '0.95rem', outline: 'none' }}
                placeholder="••••••••"
              />
            </div>

            {/* Hesap Oluştur Butonu */}
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
              {isLoading ? 'Hesap Oluşturuluyor...' : 'Hesap Oluştur'}
            </button>
          </form>

          {/* Giriş Yap Linki */}
          <div style={{ textAlign: 'center', fontSize: '0.875rem', color: '#6b7280', marginTop: '24px' }}>
            Zaten hesabınız var mı?{' '}
            <a href="/login" style={{ fontWeight: 600, color: '#111827', textDecoration: 'none' }}>
              Giriş Yap
            </a>
          </div>

        </div>
      </div>

    </div>
  );
};

export default Register;