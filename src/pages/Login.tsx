import React, { useState, useEffect, ChangeEvent } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';

const Login: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Hover durumları için inline state takipleri
  const [isBtnHovered, setIsBtnHovered] = useState<boolean>(false);
  const [focusedInput, setFocusedInput] = useState<string>('');
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
  const handleResize = () => setIsMobile(window.innerWidth <= 768);
  window.addEventListener('resize', handleResize);
  return () => window.removeEventListener('resize', handleResize);
}, []);

  const handleLoginClick = async (): Promise<void> => {
    localStorage.clear();
    if (!email || !password) {
      alert("Lütfen e-posta ve şifre alanlarını doldurun.");
      return;
    }

    setIsLoading(true);

    try {
      // 1. Post isteğinde header'ı açıkça belirt (JSON olduğunu garanti et)
      const response = await API.post('api/auth/login', { email, password }, {
        headers: { 'Content-Type': 'application/json' }
      });
      
      let { token, userId, role } = response.data;

      if (token) {
        token = token.replace(/^['"]|['"]$/g, '');
        localStorage.setItem('token', token);
        localStorage.setItem('userId', userId);
        localStorage.setItem('role', role); 

        if (role && role.toUpperCase() === 'SHOP_OWNER') {
          try {
            await API.get(`https://randevu-sistemi-dv33.onrender.com/api/shops/owner/${userId}`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            window.location.href = '/shop-owner/dashboard';
          } catch (shopErr) {
            window.location.href = '/shop-owner/register-shop';
          }
        } else {
          window.location.href = '/'; 
        }
      }
    } catch (err: any) {
      console.error("Giriş esnasında hata oluştu:", err);
      alert("Hatalı e-posta veya şifre!");
    } finally {
      setIsLoading(false);
    }
};

  // Ortak input stil fabrikası (Premium focus efekti içerir)
  const getInputStyle = (inputName: string) => ({
    padding: '14px 16px',
    borderRadius: '12px',
    border: focusedInput === inputName ? '2px solid #6366f1' : '1px solid #e2e8f0',
    fontSize: '0.95rem',
    outline: 'none',
    backgroundColor: '#f8fafc',
    color: '#334155',
    transition: 'all 0.2s ease-in-out',
    boxShadow: focusedInput === inputName ? '0 0 0 4px rgba(99, 102, 241, 0.15)' : 'none',
  });

  return (
  <div style={{ 
    display: 'flex', 
    flexDirection: isMobile ? 'column' : 'row', 
    minHeight: '100vh', // 'height: 100vh' yerine 'minHeight' kullanmak mobilde kaydırmayı kolaylaştırır
    width: '100vw', 
    fontFamily: '"Inter", system-ui, sans-serif', 
    backgroundColor: '#f8fafc', 
    margin: 0, 
    overflowX: 'hidden' // Yatay kaymayı engelle
  }}>
      
      {/* SOL ALAN: Premium Arka Plan Görseli & Cam Efektli (Glassmorphism) Kart */}
      <div style={{
  flex: isMobile ? 'none' : 1.2,
  height: isMobile ? '250px' : '100vh', 
  backgroundImage: `url('https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=1200&q=80')`,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '20px'
}}>
  {/* Koyu Sinematik Overlay */}
  <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.65)' }}></div>
  
  {/* Lüks Cam Efektli Bilgi Paneli (Senin Orijinal Kodun) */}
  <div style={{
    position: 'relative',
    zIndex: 10,
    textAlign: 'center',
    padding: isMobile ? '20px' : '48px 32px',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(12px)',
    borderRadius: '24px',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    maxWidth: '500px'
  }}>
    <h1 style={{ fontSize: isMobile ? '1.8rem' : '3.25rem', fontWeight: 800, color: '#ffffff', margin: '0 0 16px 0' }}>
      Makas <span style={{ color: '#818cf8' }}>Lab</span>
    </h1>
    {!isMobile && (
      <p style={{ fontSize: '1.2rem', color: '#f1f5f9', fontWeight: 400, lineHeight: 1.6, opacity: 0.9 }}>
        Premium kuaför deneyimi şimdi dijital dünyada. Sıradaki randevunu saniyeler içinde planla veya işletmeni lüksle yönet.
      </p>
    )}
  </div>
</div>

      {/* SAĞ ALAN: Minimalist ve Elit Giriş Formu */}
      <div style={{ 
      flex: 1, 
      display: 'flex', 
      alignItems: 'center', 
      padding: isMobile ? '20px' : '48px', 
      justifyContent: 'center', 
      backgroundColor: '#ffffff',
      overflowY: 'auto' // İçerik uzunsa kaydırılabilir olsun
    }}>
        <div style={{
          width: '100%',
          maxWidth: '400px',
          backgroundColor: '#ffffff',
        }}>
          
          <div style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '2.25rem', fontWeight: 700, color: '#0f172a', margin: '0 0 10px 0', letterSpacing: '-0.025em' }}>
              Hoş Geldiniz
            </h2>
            <p style={{ fontSize: '1rem', color: '#64748b', margin: 0, fontWeight: 400 }}>
              Hesabınıza giriş yapın ve deneyiminizi yönetin.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* E-posta Alanı */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#334155', letterSpacing: '0.025em' }}>E-POSTA ADRESİ</label>
              <input
                type="email"
                required
                value={email}
                onFocus={() => setFocusedInput('email')}
                onBlur={() => setFocusedInput('')}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                style={getInputStyle('email')}
                placeholder="isim@domain.com"
              />
            </div>

            {/* Şifre Alanı */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#334155', letterSpacing: '0.025em' }}>ŞİFRE</label>
              <input
                type="password"
                required
                value={password}
                onFocus={() => setFocusedInput('password')}
                onBlur={() => setFocusedInput('')}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                style={getInputStyle('password')}
                placeholder="••••••••"
              />
            </div>

            {/* Giriş Yap Butonu */}
            <button
              type="button"
              disabled={isLoading}
              onMouseEnter={() => setIsBtnHovered(true)}
              onMouseLeave={() => setIsBtnHovered(false)}
              onClick={handleLoginClick}
              style={{
                marginTop: '8px',
                padding: '16px',
                borderRadius: '14px',
                border: 'none',
                backgroundColor: isLoading ? '#64748b' : (isBtnHovered ? '#4f46e5' : '#6366f1'),
                color: '#ffffff',
                fontSize: '1rem',
                fontWeight: 600,
                cursor: isLoading ? 'not-allowed' : 'pointer',
                boxShadow: isBtnHovered ? '0 10px 15px -3px rgba(99, 102, 241, 0.3)' : '0 4px 6px -1px rgba(99, 102, 241, 0.2)',
                transform: isBtnHovered && !isLoading ? 'translateY(-1px)' : 'none',
                transition: 'all 0.2s ease-in-out'
              }}
            >
              {isLoading ? 'Doğrulanıyor...' : 'Sisteme Giriş Yap'}
            </button>
          </div>

          {/* Alt Bilgi & Kayıt Ol Linki */}
          <div style={{ textAlign: 'center', fontSize: '0.95rem', color: '#64748b', marginTop: '32px', fontWeight: 400 }}>
            Henüz bir hesabınız yok mu?{' '}
            <Link to="/register" style={{ fontWeight: 600, color: '#6366f1', textDecoration: 'none', borderBottom: '1px solid transparent', transition: 'border-color 0.2s' }}
                  onMouseEnter={(e) => e.currentTarget.style.borderBottom = '1px solid #6366f1'}
                  onMouseLeave={(e) => e.currentTarget.style.borderBottom = '1px solid transparent'}>
              Hemen Kayıt Olun
            </Link>
          </div>

        </div>
      </div>

    </div>
  );
};

export default Login;
