import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import NotificationToast from '../components/NotificationToast';
import useNotification from '../hooks/useNotification';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { notification, showNotification } = useNotification();
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      showNotification('Lütfen kayıtlı e-posta adresinizi girin.', 'error');
      return;
    }

    try {
      setIsSubmitting(true);
      await API.post('/api/auth/forgot-password', { email });
      showNotification('Şifre sıfırlama bağlantısı e-posta adresinize gönderildi.', 'success');
      setTimeout(() => navigate('/login'), 1800);
    } catch (err: any) {
      console.error('Şifre sıfırlama hatası:', err);
      showNotification(err.response?.data?.message || 'Şifre sıfırlama isteği gönderilemedi.', 'error');
    } finally {
      setIsSubmitting(false);
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
      `}</style>

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
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(135deg, rgba(30,27,24,0.5) 0%, rgba(30,27,24,0.85) 100%)'
        }} />

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
          <h1 style={{
            fontFamily: "'Fraunces', serif",
            fontSize: isMobile ? '1.8rem' : '2.8rem',
            fontWeight: 400,
            color: '#FAF8F5',
            margin: '0 0 12px 0',
            letterSpacing: '-0.02em'
          }}>
            Şifre Sıfırlama
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
            Kayıtlı e-posta adresinizi girin; size şifre sıfırlama bağlantısı göndereceğiz.
          </p>
        </div>
      </div>

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
          maxWidth: '420px'
        }}>
          <div style={{ marginBottom: '28px' }}>
            <NotificationToast notification={notification} />
            <h2 style={{
              fontFamily: "'Fraunces', serif",
              fontSize: '1.85rem',
              fontWeight: 500,
              color: '#1E1B18',
              margin: '0 0 8px 0',
              letterSpacing: '-0.01em'
            }}>
              Şifre Sıfırlama
            </h2>
            <p style={{ fontSize: '0.92rem', color: '#8C8276', margin: 0, fontWeight: 400 }}>
              Hesabınızı kurtarmak için kayıtlı e-posta adresinizi girin.
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#1E1B18', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                E-posta Adresi
              </label>
              <input
                type="email"
                value={email}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                placeholder="isim@domain.com"
                style={{ padding: '14px 16px', borderRadius: '14px', border: '1px solid rgba(197, 168, 128, 0.25)', background: '#fff', fontSize: '0.95rem', color: '#1E1B18' }}
                required
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                width: '100%',
                padding: '14px 18px',
                borderRadius: '14px',
                border: 'none',
                background: '#1E1B18',
                color: '#FAF8F5',
                fontSize: '0.95rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              {isSubmitting ? 'Gönderiliyor...' : 'Şifre Sıfırlama Bağlantısı Gönder'}
            </button>

            <button
              type="button"
              onClick={() => navigate('/login')}
              style={{
                width: '100%',
                padding: '14px 18px',
                borderRadius: '14px',
                border: '1px solid rgba(197, 168, 128, 0.25)',
                background: '#FFFFFF',
                color: '#1E1B18',
                fontSize: '0.95rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Giriş Ekranına Dön
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
