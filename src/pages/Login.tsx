import React, { useState, useEffect, ChangeEvent } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';

const Login: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);

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

  return (
    <div style={{
      display: 'flex',
      flexDirection: isMobile ? 'column' : 'row',
      minHeight: '100vh',
      width: '100vw',
      fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
      backgroundColor: '#FAF8F5',
      margin: 0,
      overflowX: 'hidden',
      color: '#1E1B18'
    }}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;0,9..144,700;1,9..144,400&family=Inter:wght@300;400;500;600;700&display=swap');

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-up {
          animation: fadeInUp 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .mkl-login-input {
          width: 100%;
          padding: 14px 16px 14px 44px;
          border-radius: 12px;
          border: 1px solid rgba(197, 168, 128, 0.25);
          font-size: 0.95rem;
          font-family: inherit;
          outline: none;
          background-color: #FFFFFF;
          color: #1E1B18;
          transition: all 0.25s ease;
        }

        .mkl-login-input:focus {
          border-color: #A3845B;
          box-shadow: 0 0 0 3px rgba(163, 132, 91, 0.12);
          background-color: #FFFFFF;
        }

        .mkl-input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .mkl-input-icon-left {
          position: absolute;
          left: 14px;
          color: #A3845B;
          pointer-events: none;
          display: flex;
          align-items: center;
        }

        .mkl-password-toggle {
          position: absolute;
          right: 14px;
          color: #8C8276;
          cursor: pointer;
          background: none;
          border: none;
          display: flex;
          align-items: center;
          padding: 0;
          transition: color 0.2s ease;
        }

        .mkl-password-toggle:hover {
          color: #A3845B;
        }

        .mkl-btn-submit {
          padding: 16px;
          border-radius: 14px;
          border: 1px solid #1E1B18;
          background-color: #1E1B18;
          color: #FAF8F5;
          font-size: 0.95rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.25s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          box-shadow: 0 4px 12px rgba(30, 27, 24, 0.1);
        }

        .mkl-btn-submit:hover:not(:disabled) {
          background-color: #A3845B;
          border-color: #A3845B;
          transform: translateY(-1px);
          box-shadow: 0 8px 20px rgba(163, 132, 91, 0.2);
        }

        .mkl-btn-submit:active:not(:disabled) {
          transform: translateY(0);
        }

        .mkl-btn-submit:disabled {
          background-color: #E8E2D5;
          border-color: #E8E2D5;
          color: #8C8276;
          cursor: not-allowed;
          box-shadow: none;
        }

        .mkl-glass-card {
          background: rgba(250, 248, 245, 0.08);
          backdrop-filter: blur(16px);
          border: 1px solid rgba(250, 248, 245, 0.18);
          border-radius: 24px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.25);
          transition: all 0.3s ease;
        }

        .mkl-link-highlight {
          font-weight: 600;
          color: #A3845B;
          text-decoration: none;
          position: relative;
          padding-bottom: 2px;
        }

        .mkl-link-highlight::after {
          content: '';
          position: absolute;
          width: 100%;
          transform: scaleX(0);
          height: 1.5px;
          bottom: 0;
          left: 0;
          background-color: #A3845B;
          transform-origin: bottom right;
          transition: transform 0.25s ease-out;
        }

        .mkl-link-highlight:hover::after {
          transform: scaleX(1);
          transform-origin: bottom left;
        }
      `}</style>

      {/* SOL ALAN: Görsel & Cam Efektli Bilgi Paneli */}
      <div style={{
        flex: isMobile ? 'none' : 1.2,
        height: isMobile ? '280px' : '100vh',
        backgroundImage: `url('/kuaforsalonu.jpg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px'
      }}>
        {/* Dark Luxury Overlay */}
        <div style={{ 
          position: 'absolute', 
          inset: 0, 
          background: 'linear-gradient(135deg, rgba(30,27,24,0.5) 0%, rgba(30,27,24,0.85) 100%)' 
        }}></div>

        {/* Small Brand Logo in Top Left (Desktop only) */}
        {!isMobile && (
          <div style={{
            position: 'absolute',
            top: '32px',
            left: '32px',
            color: '#FAF8F5',
            zIndex: 10,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontFamily: "'Fraunces', serif",
            fontSize: '1.25rem',
            fontWeight: 700
          }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C5A880" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform: 'rotate(-45deg)' }}>
              <circle cx="6" cy="6" r="3" />
              <circle cx="6" cy="18" r="3" />
              <line x1="9.8" y1="8.2" x2="21" y2="12.4" />
              <line x1="9.8" y1="15.8" x2="21" y2="12.4" />
            </svg>
            Makas<span style={{ fontStyle: 'italic', color: '#C5A880', fontWeight: 300 }}>Lab</span>
          </div>
        )}

        <div className="mkl-glass-card" style={{
          position: 'relative',
          zIndex: 10,
          textAlign: 'center',
          padding: isMobile ? '24px 20px' : '56px 40px',
          maxWidth: '460px',
          width: '100%'
        }}>
          {isMobile && (
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              color: '#FAF8F5',
              fontFamily: "'Fraunces', serif",
              fontSize: '1.1rem',
              fontWeight: 700,
              marginBottom: '12px'
            }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C5A880" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform: 'rotate(-45deg)' }}>
                <circle cx="6" cy="6" r="3" />
                <circle cx="6" cy="18" r="3" />
                <line x1="9.8" y1="8.2" x2="21" y2="12.4" />
                <line x1="9.8" y1="15.8" x2="21" y2="12.4" />
              </svg>
              Makas<span style={{ fontStyle: 'italic', color: '#C5A880', fontWeight: 300 }}>Lab</span>
            </div>
          )}

          <h1 style={{
            fontFamily: "'Fraunces', serif",
            fontSize: isMobile ? '1.8rem' : '2.8rem',
            fontWeight: 400,
            color: '#FAF8F5',
            margin: '0 0 12px 0',
            letterSpacing: '-0.02em'
          }}>
            Hoş Geldiniz
          </h1>

          <div style={{
            width: '40px',
            height: '2px',
            margin: '0 auto 18px auto',
            background: 'linear-gradient(90deg, #C5A880 0%, #A3845B 100%)'
          }} />

          <p style={{ 
            fontSize: isMobile ? '0.88rem' : '1.02rem', 
            color: '#E8E2D5', 
            fontWeight: 300, 
            lineHeight: 1.5, 
            margin: 0 
          }}>
            Premium kuaför deneyimi şimdi dijital dünyada. Sıradaki randevunuzu saniyeler içinde planlayın veya salonunuzu yönetin.
          </p>
        </div>
      </div>

      {/* SAĞ ALAN: Giriş Formu */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        padding: isMobile ? '32px 24px' : '48px 60px',
        justifyContent: 'center',
        backgroundColor: '#FFFFFF',
        overflowY: 'auto'
      }}>
        <div className="animate-fade-up" style={{
          width: '100%',
          maxWidth: '380px'
        }}>

          <div style={{ marginBottom: '36px' }}>
            <h2 style={{
              fontFamily: "'Fraunces', serif",
              fontSize: '1.85rem',
              fontWeight: 500,
              color: '#1E1B18',
              margin: '0 0 8px 0',
              letterSpacing: '-0.01em'
            }}>
              Hesabınıza Giriş Yapın
            </h2>
            <p style={{ fontSize: '0.92rem', color: '#8C8276', margin: 0, fontWeight: 400 }}>
              Randevularınızı takip etmek ve yeni seanslar almak için bilgilerinizi girin.
            </p>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); handleLoginClick(); }} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Email Input */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ 
                fontSize: '0.75rem', 
                fontWeight: 700, 
                color: '#1E1B18', 
                letterSpacing: '0.08em',
                textTransform: 'uppercase'
              }}>
                E-posta Adresi
              </label>
              
              <div className="mkl-input-wrapper">
                <span className="mkl-input-icon-left">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                </span>
                <input
                  className="mkl-login-input"
                  type="email"
                  required
                  value={email}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                  placeholder="isim@domain.com"
                />
              </div>
            </div>

            {/* Password Input */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <label style={{ 
                  fontSize: '0.75rem', 
                  fontWeight: 700, 
                  color: '#1E1B18', 
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase'
                }}>
                  Şifre
                </label>
                <a href="#" style={{ fontSize: '0.78rem', color: '#8C8276', textDecoration: 'none' }} onClick={(e) => { e.preventDefault(); alert("Şifre sıfırlama servisi şu an bakımda."); }}>
                  Şifremi Unuttum?
                </a>
              </div>
              
              <div className="mkl-input-wrapper">
                <span className="mkl-input-icon-left">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </span>
                <input
                  className="mkl-login-input"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                  placeholder="••••••••"
                />
                
                {/* Password Reveal Toggle Button */}
                <button
                  type="button"
                  className="mkl-password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Login Action Button */}
            <button
              type="submit"
              disabled={isLoading || !email || !password}
              className="mkl-btn-submit"
              style={{ marginTop: '12px' }}
            >
              {isLoading ? (
                <>
                  <div style={{
                    width: '16px',
                    height: '16px',
                    border: '2px solid rgba(255,255,255,0.2)',
                    borderTopColor: '#FFFFFF',
                    borderRadius: '50%',
                    animation: 'spin 0.6s linear infinite'
                  }} />
                  Giriş Yapılıyor...
                </>
              ) : (
                "Sisteme Giriş Yap"
              )}
            </button>
          </form>

          {/* Bottom redirection */}
          <div style={{ textAlign: 'center', fontSize: '0.9rem', color: '#8C8276', marginTop: '36px', fontWeight: 400 }}>
            Henüz bir hesabınız yok mu?{' '}
            <Link to="/register" className="mkl-link-highlight">
              Hemen Kayıt Olun
            </Link>
          </div>

        </div>
      </div>

      {/* Embedded loader animation for the login button */}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>

    </div>
  );
};

export default Login;