import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import NotificationToast from '../components/NotificationToast';
import useNotification from '../hooks/useNotification';

export default function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phoneNumber: '',
    role: 'CUSTOMER'
  });

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const { notification, showNotification } = useNotification();

  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const payload = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      password: formData.password,
      phoneNumber: formData.phoneNumber,
      role: formData.role.toUpperCase()
    };

    try {
      await API.post('/api/auth/register', payload);
      showNotification('Kayıt işleminiz başarıyla tamamlandı! Giriş yapabilirsiniz.', 'success');
      setTimeout(() => navigate('/login'), 1200);
    } catch (err: any) {
      console.error('Kayıt hatası:', err);
      setError(err.response?.data?.message || 'Kayıt olurken bir hata oluştu. Lütfen bilgilerinizi kontrol edin.');
    } finally {
      setLoading(false);
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
          padding: 13px 16px 13px 44px;
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

        .mkl-role-card {
          flex: 1;
          padding: 14px;
          border-radius: 14px;
          border: 1.5px solid rgba(232, 226, 213, 0.8);
          background-color: #FFFFFF;
          cursor: pointer;
          transition: all 0.25s ease;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 6px;
          color: #8C8276;
        }

        .mkl-role-card:hover {
          border-color: #A3845B;
          background-color: rgba(197, 168, 128, 0.03);
          transform: translateY(-1px);
        }

        .mkl-role-card.active {
          border-color: #1E1B18;
          background-color: #1E1B18;
          color: #C5A880;
          box-shadow: 0 6px 16px rgba(30, 27, 24, 0.1);
        }

        .mkl-btn-submit {
          padding: 14px;
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
          background: rgba(30, 27, 24, 0.55);
          backdrop-filter: blur(16px);
          border: 1px solid rgba(197, 168, 128, 0.25);
          border-radius: 24px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.25);
        }

        .mkl-link-highlight {
          font-weight: 700;
          color: #A3845B;
          text-decoration: none;
          position: relative;
          padding-bottom: 2px;
          cursor: pointer;
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

        .mkl-name-row {
          display: flex;
          gap: 14px;
          width: 100%;
        }

        @media (max-width: 480px) {
          .mkl-name-row {
            flex-direction: column;
            gap: 16px;
          }
        }
      `}</style>

      {/* SOL ALAN: Görsel & Cam Efektli Bilgi Paneli */}
      <div style={{
        flex: isMobile ? 'none' : 1.1,
        height: isMobile ? '200px' : '100vh',
        backgroundImage: `url('/unisex_salon_hero.jpg')`,
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
          background: 'linear-gradient(135deg, rgba(30,27,24,0.45) 0%, rgba(30,27,24,0.8) 100%)' 
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
          maxWidth: '440px',
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
            fontSize: isMobile ? '1.7rem' : '2.6rem',
            fontWeight: 400,
            color: '#FAF8F5',
            margin: '0 0 12px 0',
            lineHeight: 1.15,
            letterSpacing: '-0.02em'
          }}>
            Makas<span style={{ fontStyle: 'italic', color: '#C5A880', fontWeight: 300 }}>Lab</span>'a Katıl
          </h1>

          <div style={{
            width: '40px',
            height: '2px',
            margin: '0 auto 18px auto',
            background: 'linear-gradient(90deg, #C5A880 0%, #A3845B 100%)'
          }} />

          <p style={{ 
            fontSize: isMobile ? '0.88rem' : '1rem', 
            color: '#E8E2D5', 
            fontWeight: 300, 
            lineHeight: 1.5, 
            margin: 0 
          }}>
            Tarzınıza en uygun randevuyu saniyeler içinde alın veya salonunuzu dijitalleştirip kolayca yönetmeye başlayın.
          </p>
        </div>
      </div>

      {/* SAĞ ALAN: Kayıt Formu (Düzeltilmiş Scroll ve Dikey Hizalama) */}
      <div style={{
        flex: 1,
        height: isMobile ? 'auto' : '100vh',
        overflowY: 'auto',
        backgroundColor: '#FFFFFF',
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box'
      }}>
        <div className="animate-fade-up" style={{
          width: '100%',
          maxWidth: '420px',
          margin: 'auto',
          padding: isMobile ? '32px 24px' : '60px 40px',
          boxSizing: 'border-box'
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
              Yeni Hesap Oluştur
            </h2>
            <p style={{ fontSize: '0.92rem', color: '#8C8276', margin: 0, fontWeight: 400 }}>
              Hemen kaydolun ve MakasLab deneyimine adım atın.
            </p>
          </div>

          {error && (
            <div style={{ 
              backgroundColor: 'rgba(163, 64, 47, 0.05)', 
              color: '#a3402f', 
              padding: '12px 14px', 
              borderRadius: '12px', 
              marginBottom: '24px', 
              fontSize: '0.88rem', 
              fontWeight: 600, 
              border: '1px solid rgba(163, 64, 47, 0.15)' 
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            
            {/* Name and Surname Row */}
            <div className="mkl-name-row">
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#1E1B18', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Ad</label>
                <div className="mkl-input-wrapper">
                  <span className="mkl-input-icon-left">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  </span>
                  <input
                    className="mkl-login-input"
                    type="text"
                    name="firstName"
                    required
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="Adınız"
                    style={{ paddingLeft: '40px' }}
                  />
                </div>
              </div>

              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#1E1B18', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Soyad</label>
                <div className="mkl-input-wrapper">
                  <span className="mkl-input-icon-left">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  </span>
                  <input
                    className="mkl-login-input"
                    type="text"
                    name="lastName"
                    required
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Soyadınız"
                    style={{ paddingLeft: '40px' }}
                  />
                </div>
              </div>
            </div>

            {/* Email Input */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#1E1B18', letterSpacing: '0.08em', textTransform: 'uppercase' }}>E-posta Adresi</label>
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
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="isim@domain.com"
                />
              </div>
            </div>

            {/* Phone Number Input */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#1E1B18', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Telefon Numarası</label>
              <div className="mkl-input-wrapper">
                <span className="mkl-input-icon-left">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                </span>
                <input
                  className="mkl-login-input"
                  type="tel"
                  name="phoneNumber"
                  required
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  placeholder="05XXXXXXXXX"
                />
              </div>
            </div>

            {/* Password Input */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#1E1B18', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Şifre</label>
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
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                />
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

            {/* Role Card Selection */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#1E1B18', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Hesap Türü</label>
              <div style={{ display: 'flex', gap: '14px' }}>
                
                <div
                  className={`mkl-role-card ${formData.role === 'CUSTOMER' ? 'active' : ''}`}
                  onClick={() => setFormData(prev => ({ ...prev, role: 'CUSTOMER' }))}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>Müşteriyim</span>
                </div>

                <div
                  className={`mkl-role-card ${formData.role === 'SHOP_OWNER' ? 'active' : ''}`}
                  onClick={() => setFormData(prev => ({ ...prev, role: 'SHOP_OWNER' }))}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: 'rotate(-45deg)' }}>
                    <circle cx="6" cy="6" r="3" />
                    <circle cx="6" cy="18" r="3" />
                    <line x1="9.8" y1="8.2" x2="21" y2="12.4" />
                    <line x1="9.8" y1="15.8" x2="21" y2="12.4" />
                  </svg>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>İşletmeyim</span>
                </div>

              </div>
            </div>

            {/* Register Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="mkl-btn-submit"
              style={{ marginTop: '8px' }}
            >
              {loading ? (
                <>
                  <div style={{
                    width: '16px',
                    height: '16px',
                    border: '2px solid rgba(255,255,255,0.2)',
                    borderTopColor: '#FFFFFF',
                    borderRadius: '50%',
                    animation: 'spin 0.6s linear infinite'
                  }} />
                  Hesap Oluşturuluyor...
                </>
              ) : (
                "Kayıt Ol"
              )}
            </button>
          </form>

          {/* Bottom redirection */}
          <p style={{ textAlign: 'center', marginTop: '32px', fontSize: '0.9rem', color: '#8C8276', fontWeight: 400 }}>
            Zaten hesabınız var mı?{' '}
            <span onClick={() => navigate('/login')} className="mkl-link-highlight">
              Giriş Yap
            </span>
          </p>

        </div>
      </div>

      {/* Embedded loader animation */}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>

    </div>
  );
}