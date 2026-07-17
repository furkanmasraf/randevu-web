import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom'; // 1. Link buraya eklendi
import API from '../services/api';

const BACKGROUND_IMAGE_URL = '/kuaforsalonu.jpg'; 

export default function Login() {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showError, setShowError] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');

  const navigate = useNavigate();

  // ⚡️ SUNUCU ÖN ISITMA
  useEffect(() => {
    const wakeUpServer = async () => {
      try { await API.get('/'); } catch (e) { }
    };
    wakeUpServer();
  }, []);

  const handleEmailChange = (val: string) => {
    setEmail(val);
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (val && !regex.test(val)) {
      setEmailError('Geçersiz e-posta formatı.');
    } else {
      setEmailError('');
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (emailError || !email || !password) {
      setAlertMessage('Lütfen geçerli bir e-posta ve şifre giriniz.');
      setShowError(true);
      return;
    }

    setLoading(true);

    try {
      const response = await API.post('/api/auth/login', { email, password });
      
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('userId', response.data.userId);
      localStorage.setItem('role', response.data.role);

      navigate(response.data.role === 'CUSTOMER' ? '/customer-dashboard' : '/dashboard');
    } catch (err: any) {
      setAlertMessage('E-posta adresi veya şifre hatalı. Lütfen bilgilerinizi kontrol edin.');
      setShowError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      position: 'fixed', 
      top: 0, 
      left: 0, 
      width: '100vw', 
      height: '100vh', 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.6), rgba(15, 23, 42, 0.6)), url(${BACKGROUND_IMAGE_URL})`,
      backgroundSize: 'cover', 
      backgroundPosition: 'center', 
      backgroundRepeat: 'no-repeat',
      zIndex: 1000 
    }}>
      <div style={{ 
        width: '90%', maxWidth: '400px', backgroundColor: 'white', padding: '40px', 
        borderRadius: '24px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.3)' 
      }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: 900 }}>Berber<span style={{ color: '#6366f1' }}>Lab</span></h1>
        </div>

        <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#475569' }}>E-POSTA ADRESİ</label>
            <input 
              value={email}
              onChange={(e) => handleEmailChange(e.target.value)}
              style={{ width: '100%', padding: '14px', borderRadius: '12px', border: emailError ? '2px solid #ef4444' : '1px solid #e2e8f0', marginTop: '8px', boxSizing: 'border-box' }}
            />
            {emailError && <span style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '5px', display: 'block' }}>{emailError}</span>}
          </div>

          <div>
            {/* 2. Şifre etiketi ve Şifremi Unuttum linkini yan yana getirecek esnek kutu (flexbox) yapısı */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#475569' }}>ŞİFRE</label>
              <Link 
                to="/forgot-password" 
                style={{ 
                  fontSize: '0.75rem', 
                  fontWeight: 700, 
                  color: '#6366f1', 
                  textDecoration: 'none',
                  transition: 'color 0.2s'
                }}
              >
                Şifremi Unuttum?
              </Link>
            </div>
            <input 
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0', marginTop: '8px', boxSizing: 'border-box' }}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            style={{ width: '100%', backgroundColor: loading ? '#94a3b8' : '#6366f1', color: 'white', padding: '16px', borderRadius: '12px', border: 'none', cursor: 'pointer', fontWeight: 700 }}
          >
            {loading ? 'Giriş Yapılıyor...' : 'Sisteme Giriş Yap'}
          </button>
        </form>
      </div>

      {/* Modal Hata Ekranı */}
      {showError && (
        <div style={{ 
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', 
          backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(8px)',
          display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999 
        }}>
          <div style={{ 
            width: '90%', maxWidth: '380px', backgroundColor: '#ffffff', 
            borderRadius: '24px', padding: '32px', textAlign: 'center' 
          }}>
            <div style={{ 
              width: '64px', height: '64px', backgroundColor: '#fee2e2', 
              color: '#ef4444', borderRadius: '50%', display: 'flex', 
              justifyContent: 'center', alignItems: 'center', margin: '0 auto 20px auto',
              fontSize: '2rem'
            }}>⚠️</div>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '1.4rem', fontWeight: 800 }}>Giriş Başarısız</h3>
            <p style={{ margin: '0 0 28px 0', fontSize: '1rem', color: '#64748b' }}>{alertMessage}</p>
            <button 
              onClick={() => setShowError(false)}
              style={{ width: '100%', padding: '14px', backgroundColor: '#6366f1', color: 'white', border: 'none', borderRadius: '14px', fontWeight: 700, cursor: 'pointer' }}
            >
              Anladım
            </button>
          </div>
        </div>
      )}
    </div>
  );
}