import React, { useState, useEffect, ChangeEvent } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';

const Login: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

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

  const getInputStyle = (inputName: string) => ({
    padding: '14px 16px',
    borderRadius: '10px',
    border: focusedInput === inputName ? '2px solid #b8863b' : '1px solid #e4ddd2',
    fontSize: '0.95rem',
    fontFamily: "'Inter', sans-serif",
    outline: 'none',
    backgroundColor: '#faf8f4',
    color: '#1c1917',
    transition: 'all 0.2s ease-in-out',
    boxShadow: focusedInput === inputName ? '0 0 0 4px rgba(184, 134, 59, 0.15)' : 'none',
  });

  return (
    <div style={{
      display: 'flex',
      flexDirection: isMobile ? 'column' : 'row',
      minHeight: '100vh',
      width: '100vw',
      fontFamily: "'Inter', system-ui, sans-serif",
      backgroundColor: '#f6f3ee',
      margin: 0,
      overflowX: 'hidden'
    }}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600;700;800&display=swap');
      `}</style>

      {/* SOL ALAN: Görsel & Cam Efektli Bilgi Paneli */}
      <div style={{
        flex: isMobile ? 'none' : 1.2,
        height: isMobile ? '250px' : '100vh',
        backgroundImage: `url('/kuaforsalonu.jpg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(20,17,15,0.55) 0%, rgba(20,17,15,0.78) 100%)' }}></div>

        <div style={{
          position: 'relative',
          zIndex: 10,
          textAlign: 'center',
          padding: isMobile ? '20px' : '48px 32px',
          backgroundColor: 'rgba(250, 247, 242, 0.08)',
          backdropFilter: 'blur(12px)',
          borderRadius: '20px',
          border: '1px solid rgba(250, 247, 242, 0.2)',
          maxWidth: '500px'
        }}>
          <h1 style={{
            fontFamily: "'Fraunces', serif",
            fontSize: isMobile ? '2rem' : '3rem',
            fontWeight: 600,
            color: '#faf7f2',
            margin: '0 0 16px 0'
          }}>
            Makas<span style={{ fontStyle: 'italic', color: '#c9a267' }}>Lab</span>
          </h1>

          <div style={{
            width: '48px',
            height: '3px',
            margin: '0 auto 20px auto',
            borderRadius: '3px',
            background: 'linear-gradient(90deg, #b8863b 0%, #b8863b 45%, #7a2e2e 55%, #7a2e2e 100%)'
          }} />

          {!isMobile && (
            <p style={{ fontSize: '1.1rem', color: '#e7ded1', fontWeight: 400, lineHeight: 1.6, opacity: 0.9 }}>
              Premium kuaför deneyimi şimdi dijital dünyada. Sıradaki randevunu saniyeler içinde planla veya işletmeni yönet.
            </p>
          )}
        </div>
      </div>

      {/* SAĞ ALAN: Giriş Formu */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        padding: isMobile ? '20px' : '48px',
        justifyContent: 'center',
        backgroundColor: '#ffffff',
        overflowY: 'auto'
      }}>
        <div style={{
          width: '100%',
          maxWidth: '400px',
          backgroundColor: '#ffffff',
        }}>

          <div style={{ marginBottom: '40px' }}>
            <h2 style={{
              fontFamily: "'Fraunces', serif",
              fontSize: '2rem',
              fontWeight: 600,
              color: '#1c1917',
              margin: '0 0 10px 0',
              letterSpacing: '-0.01em'
            }}>
              Hoş Geldiniz
            </h2>
            <p style={{ fontSize: '1rem', color: '#78706a', margin: 0, fontWeight: 400 }}>
              Hesabınıza giriş yapın ve deneyiminizi yönetin.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#3d3630', letterSpacing: '0.06em' }}>E-POSTA ADRESİ</label>
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

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#3d3630', letterSpacing: '0.06em' }}>ŞİFRE</label>
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

            <button
              type="button"
              disabled={isLoading}
              onMouseEnter={() => setIsBtnHovered(true)}
              onMouseLeave={() => setIsBtnHovered(false)}
              onClick={handleLoginClick}
              style={{
                marginTop: '8px',
                padding: '16px',
                borderRadius: '10px',
                border: 'none',
                backgroundColor: isLoading ? '#9a9186' : (isBtnHovered ? '#b8863b' : '#1c1917'),
                color: '#faf7f2',
                fontSize: '1rem',
                fontFamily: "'Inter', sans-serif",
                fontWeight: 700,
                cursor: isLoading ? 'not-allowed' : 'pointer',
                boxShadow: isBtnHovered ? '0 10px 20px -6px rgba(184, 134, 59, 0.4)' : '0 4px 6px -1px rgba(28, 25, 23, 0.15)',
                transform: isBtnHovered && !isLoading ? 'translateY(-1px)' : 'none',
                transition: 'all 0.2s ease-in-out'
              }}
            >
              {isLoading ? 'Doğrulanıyor...' : 'Sisteme Giriş Yap'}
            </button>
          </div>

          <div style={{ textAlign: 'center', fontSize: '0.95rem', color: '#78706a', marginTop: '32px', fontWeight: 400 }}>
            Henüz bir hesabınız yok mu?{' '}
            <Link to="/register" style={{ fontWeight: 600, color: '#b8863b', textDecoration: 'none', borderBottom: '1px solid transparent', transition: 'border-color 0.2s' }}
                  onMouseEnter={(e) => e.currentTarget.style.borderBottom = '1px solid #b8863b'}
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