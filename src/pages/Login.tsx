import { useState, ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import NotificationToast from '../components/NotificationToast';
import useNotification from '../hooks/useNotification';
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { notification, showNotification } = useNotification();
  const navigate = useNavigate();

  const isMobile = typeof window !== 'undefined' ? window.innerWidth <= 768 : false;

  const handleLoginClick = async () => {
    if (!email.trim() || !password.trim()) {
      showNotification('Lütfen e-posta ve şifrenizi girin.', 'error');
      return;
    }

    try {
      setIsLoading(true);

      const response = await API.post('/api/auth/login', {
        email,
        password
      });

      const { token, id, role } = response.data;

      if (token && id) {
        localStorage.setItem('token', token);
        localStorage.setItem('userId', id);
        localStorage.setItem('role', role);

        showNotification('Giriş başarılı! Yönlendiriliyorsunuz...', 'success');

        setTimeout(() => {
          if (role === 'SHOP_OWNER') {
            navigate('/barber-dashboard');
          } else if (role === 'CUSTOMER') {
            navigate('/customer-dashboard');
          } else {
            navigate('/');
          }
        }, 800);
      } else {
        showNotification('Giriş cevabında eksik bilgi alındı.', 'error');
      }
    } catch (err: any) {
      console.error("Giriş hatası:", err);
      const errorMessage = err.response?.data?.message || 'Giriş yapılamadı. Bilgilerinizi kontrol edip tekrar deneyin.';
      showNotification(errorMessage, 'error');
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
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      backgroundColor: '#FAF8F5',
      margin: 0,
      overflowX: 'hidden',
      color: '#1E1B18'
    }}>

      {/* SOL ALAN: Görsel & Cam Efektli Bilgi Paneli */}
      <div style={{
        flex: isMobile ? 'none' : 1.2,
        height: isMobile ? '260px' : '100vh',
        backgroundImage: `url('/unisex_salon_hero.jpg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px'
      }}>
        {/* Dark Overlay */}
        <div style={{ 
          position: 'absolute', 
          inset: 0, 
          background: 'linear-gradient(135deg, rgba(30,27,24,0.55) 0%, rgba(30,27,24,0.85) 100%)' 
        }}></div>

        {/* Small Brand Logo in Top Left (Desktop only) */}
        {!isMobile && (
          <div 
            onClick={() => navigate('/')}
            style={{
              position: 'absolute',
              top: '32px',
              left: '32px',
              color: '#FAF8F5',
              zIndex: 10,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '1.25rem',
              fontWeight: 800,
              cursor: 'pointer'
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C5A880" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform: 'rotate(-45deg)' }}>
              <circle cx="6" cy="6" r="3" />
              <circle cx="6" cy="18" r="3" />
              <line x1="9.8" y1="8.2" x2="21" y2="12.4" />
              <line x1="9.8" y1="15.8" x2="21" y2="12.4" />
            </svg>
            Makas<span style={{ color: '#C5A880', fontWeight: 700 }}>Lab</span>
          </div>
        )}

        <div style={{
          position: 'relative',
          zIndex: 10,
          textAlign: 'center',
          padding: isMobile ? '24px 20px' : '48px 40px',
          maxWidth: '440px',
          width: '100%',
          background: 'rgba(30, 27, 24, 0.65)',
          backdropFilter: 'blur(16px)',
          borderRadius: '20px',
          border: '1px solid rgba(197, 168, 128, 0.25)',
          boxShadow: '0 20px 40px rgba(0,0,0,0.25)'
        }}>
          {isMobile && (
            <div 
              onClick={() => navigate('/')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                color: '#FAF8F5',
                fontSize: '1.1rem',
                fontWeight: 800,
                marginBottom: '12px'
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C5A880" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform: 'rotate(-45deg)' }}>
                <circle cx="6" cy="6" r="3" />
                <circle cx="6" cy="18" r="3" />
                <line x1="9.8" y1="8.2" x2="21" y2="12.4" />
                <line x1="9.8" y1="15.8" x2="21" y2="12.4" />
              </svg>
              Makas<span style={{ color: '#C5A880', fontWeight: 700 }}>Lab</span>
            </div>
          )}

          <h1 style={{
            fontSize: isMobile ? '1.8rem' : '2.4rem',
            fontWeight: 800,
            color: '#FAF8F5',
            margin: '0 0 12px 0'
          }}>
            Hoş Geldiniz
          </h1>

          <div style={{
            width: '40px',
            height: '2px',
            margin: '0 auto 16px auto',
            background: '#C5A880',
            borderRadius: '2px'
          }} />

          <p style={{ 
            fontSize: isMobile ? '0.88rem' : '0.98rem', 
            color: '#E8E2D5', 
            fontWeight: 500, 
            lineHeight: 1.6, 
            margin: 0 
          }}>
            Prestijli salon randevularınızı dijital dünyada saniyeler içinde planlayın veya salonunuzu profesyonelce yönetin.
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
        <div style={{
          width: '100%',
          maxWidth: '380px'
        }}>

          <div style={{ marginBottom: '32px' }}>
            <h2 style={{
              fontSize: '1.8rem',
              fontWeight: 800,
              color: '#1E1B18',
              margin: '0 0 8px 0'
            }}>
              Hesabınıza Giriş Yapın
            </h2>
            <p style={{ fontSize: '0.9rem', color: '#8C8276', margin: 0, fontWeight: 500 }}>
              Randevularınızı takip etmek için bilgilerinizi girin.
            </p>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); handleLoginClick(); }} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <NotificationToast notification={notification} />
            
            {/* Email Input */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ 
                fontSize: '0.75rem', 
                fontWeight: 700, 
                color: '#1E1B18', 
                letterSpacing: '0.05em',
                textTransform: 'uppercase'
              }}>
                E-posta Adresi
              </label>
              
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <span style={{ position: 'absolute', left: '14px', color: '#A3845B', pointerEvents: 'none', display: 'flex' }}>
                  <Mail size={18} />
                </span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  style={{
                    width: '100%',
                    padding: '13px 16px 13px 44px',
                    borderRadius: '12px',
                    border: '1px solid rgba(197, 168, 128, 0.25)',
                    fontSize: '0.95rem',
                    color: '#1E1B18',
                    outline: 'none',
                    transition: 'all 0.25s ease'
                  }}
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
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase'
                }}>
                  Şifre
                </label>
                <a href="/reset-password" style={{ fontSize: '0.8rem', color: '#A3845B', fontWeight: 600, textDecoration: 'none' }}>
                  Şifremi Unuttum?
                </a>
              </div>
              
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <span style={{ position: 'absolute', left: '14px', color: '#A3845B', pointerEvents: 'none', display: 'flex' }}>
                  <Lock size={18} />
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  style={{
                    width: '100%',
                    padding: '13px 44px 13px 44px',
                    borderRadius: '12px',
                    border: '1px solid rgba(197, 168, 128, 0.25)',
                    fontSize: '0.95rem',
                    color: '#1E1B18',
                    outline: 'none',
                    transition: 'all 0.25s ease'
                  }}
                />
                
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '14px',
                    color: '#8C8276',
                    cursor: 'pointer',
                    background: 'none',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    padding: 0
                  }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Login Action Button */}
            <button
              type="submit"
              disabled={isLoading || !email || !password}
              className="btn-primary"
              style={{ marginTop: '8px', padding: '14px', fontSize: '0.95rem' }}
            >
              {isLoading ? 'Giriş Yapılıyor...' : <> Giriş Yap <ArrowRight size={16} /> </>}
            </button>
          </form>

          {/* Switch to Register link */}
          <div style={{ marginTop: '32px', textAlign: 'center', fontSize: '0.88rem', color: '#8C8276' }}>
            Hesabınız yok mu?{' '}
            <a href="/register" style={{ fontWeight: 700, color: '#A3845B', textDecoration: 'underline' }}>
              Ücretsiz Kayıt Olun
            </a>
          </div>

        </div>
      </div>

    </div>
  );
}