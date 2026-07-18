import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';

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

  const [isBtnHovered, setIsBtnHovered] = useState<boolean>(false);
  const [focusedInput, setFocusedInput] = useState<string>('');
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
      alert('Kayıt işleminiz başarıyla tamamlandı! Giriş yapabilirsiniz.');
      navigate('/login');
    } catch (err: any) {
      console.error('Kayıt hatası:', err);
      setError(err.response?.data?.message || 'Kayıt olurken bir hata oluştu. Lütfen bilgilerinizi kontrol edin.');
    } finally {
      setLoading(false);
    }
  };

  const getInputStyle = (inputName: string) => ({
    padding: '12px 14px',
    borderRadius: '10px',
    border: focusedInput === inputName ? '2px solid #b8863b' : '1px solid #e4ddd2',
    fontSize: '0.95rem',
    fontFamily: "'Inter', sans-serif",
    outline: 'none',
    backgroundColor: '#ffffff',
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

        @media (max-width: 380px) {
          .mkl-name-row {
            flex-direction: column !important;
          }
        }
      `}</style>

      <div style={{
        flex: isMobile ? 'none' : 1.1,
        height: isMobile ? '200px' : '100vh',
        backgroundImage: `url('/kuaforsalonu.jpg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px'
      }}>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(20,17,15,0.6) 0%, rgba(20,17,15,0.82) 100%)' }}></div>

        <div style={{
          position: 'relative',
          zIndex: 10,
          textAlign: 'center',
          padding: '44px 32px',
          backgroundColor: 'rgba(250, 247, 242, 0.08)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderRadius: '20px',
          border: '1px solid rgba(250, 247, 242, 0.18)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          maxWidth: '460px'
        }}>
          <h1 style={{
            fontFamily: "'Fraunces', serif",
            fontSize: isMobile ? '2rem' : '2.7rem',
            fontWeight: 600,
            color: '#faf7f2',
            margin: '0 0 16px 0',
            lineHeight: 1.15
          }}>
            Makas<span style={{ fontStyle: 'italic', color: '#c9a267' }}>Lab</span>'a Katıl
          </h1>

          <div style={{
            width: '48px',
            height: '3px',
            margin: '0 auto 20px auto',
            borderRadius: '3px',
            background: 'linear-gradient(90deg, #b8863b 0%, #b8863b 45%, #7a2e2e 55%, #7a2e2e 100%)'
          }} />

          <p style={{ fontSize: '1.05rem', color: '#e7ded1', fontWeight: 400, margin: 0, lineHeight: 1.6 }}>
            İster dakikalar içinde tarzına en uygun randevuyu al, ister işletmeni dijitalleştirerek konforun tadını çıkar.
          </p>
        </div>
      </div>

      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: isMobile ? 'center' : 'flex-start',
        padding: isMobile ? '20px' : '40px 48px',
        justifyContent: 'center',
        backgroundColor: '#ffffff',
        overflowY: 'auto',
        height: isMobile ? 'auto' : '100vh',
        boxSizing: 'border-box'
      }}>
        <div style={{ width: '100%', maxWidth: '420px', backgroundColor: '#ffffff', paddingTop: '24px', paddingBottom: '24px' }}>

          <div style={{ marginBottom: '28px' }}>
            <h2 style={{
              fontFamily: "'Fraunces', serif",
              fontSize: '1.9rem',
              fontWeight: 600,
              color: '#1c1917',
              margin: '0 0 8px 0',
              letterSpacing: '-0.01em'
            }}>
              Yeni Hesap Oluştur
            </h2>
            <p style={{ fontSize: '0.95rem', color: '#78706a', margin: 0, fontWeight: 400 }}>
              Hemen kaydolun ve dijital dünyaya adım atın.
            </p>
          </div>

          {error && (
            <div style={{ backgroundColor: '#fbeeea', color: '#a3402f', padding: '12px 14px', borderRadius: '10px', marginBottom: '20px', fontSize: '0.875rem', fontWeight: 600, border: '1px solid #e3b6a8' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>

            <div className="mkl-name-row" style={{ display: 'flex', gap: '14px', width: '100%' }}>

              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#3d3630', letterSpacing: '0.05em' }}>AD</label>
                <input
                  type="text"
                  name="firstName"
                  required
                  value={formData.firstName}
                  onFocus={() => setFocusedInput('firstName')}
                  onBlur={() => setFocusedInput('')}
                  onChange={handleChange}
                  style={{ ...getInputStyle('firstName'), width: '100%', boxSizing: 'border-box' }}
                  placeholder="Ad"
                />
              </div>

              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#3d3630', letterSpacing: '0.05em' }}>SOYAD</label>
                <input
                  type="text"
                  name="lastName"
                  required
                  value={formData.lastName}
                  onFocus={() => setFocusedInput('lastName')}
                  onBlur={() => setFocusedInput('')}
                  onChange={handleChange}
                  style={{ ...getInputStyle('lastName'), width: '100%', boxSizing: 'border-box' }}
                  placeholder="Soyad"
                />
              </div>

            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#3d3630', letterSpacing: '0.05em' }}>E-POSTA ADRESİ</label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onFocus={() => setFocusedInput('email')}
                onBlur={() => setFocusedInput('')}
                onChange={handleChange}
                style={getInputStyle('email')}
                placeholder="isim@domain.com"
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#3d3630', letterSpacing: '0.05em' }}>TELEFON NUMARASI</label>
              <input
                type="tel"
                name="phoneNumber"
                placeholder="05551234567"
                required
                value={formData.phoneNumber}
                onFocus={() => setFocusedInput('phoneNumber')}
                onBlur={() => setFocusedInput('')}
                onChange={handleChange}
                style={getInputStyle('phoneNumber')}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#3d3630', letterSpacing: '0.05em' }}>ŞİFRE</label>
              <input
                type="password"
                name="password"
                required
                value={formData.password}
                onFocus={() => setFocusedInput('password')}
                onBlur={() => setFocusedInput('')}
                onChange={handleChange}
                style={getInputStyle('password')}
                placeholder="••••••••"
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#3d3630', letterSpacing: '0.05em' }}>HESAP TÜRÜ</label>
              <div style={{ display: 'flex', gap: '14px' }}>

                <div
                  onClick={() => setFormData(prev => ({ ...prev, role: 'CUSTOMER' }))}
                  style={{
                    flex: 1,
                    padding: '14px',
                    borderRadius: '10px',
                    border: formData.role === 'CUSTOMER' ? '2px solid #b8863b' : '1px solid #e4ddd2',
                    backgroundColor: formData.role === 'CUSTOMER' ? '#faf3e5' : '#ffffff',
                    cursor: 'pointer',
                    textAlign: 'center',
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: formData.role === 'CUSTOMER' ? '#a06a24' : '#3d3630' }}>Müşteriyim</div>
                </div>

                <div
                  onClick={() => setFormData(prev => ({ ...prev, role: 'SHOP_OWNER' }))}
                  style={{
                    flex: 1,
                    padding: '14px',
                    borderRadius: '10px',
                    border: formData.role === 'SHOP_OWNER' ? '2px solid #b8863b' : '1px solid #e4ddd2',
                    backgroundColor: formData.role === 'SHOP_OWNER' ? '#faf3e5' : '#ffffff',
                    cursor: 'pointer',
                    textAlign: 'center',
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: formData.role === 'SHOP_OWNER' ? '#a06a24' : '#3d3630' }}>İşletmeyim</div>
                </div>

              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              onMouseEnter={() => setIsBtnHovered(true)}
              onMouseLeave={() => setIsBtnHovered(false)}
              style={{
                marginTop: '10px',
                backgroundColor: loading ? '#9a9186' : (isBtnHovered ? '#b8863b' : '#1c1917'),
                color: '#faf7f2',
                border: 'none',
                padding: '14px',
                borderRadius: '10px',
                fontWeight: 700,
                fontFamily: "'Inter', sans-serif",
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '1rem',
                boxShadow: isBtnHovered && !loading ? '0 10px 20px -6px rgba(184, 134, 59, 0.4)' : 'none',
                transform: isBtnHovered && !loading ? 'translateY(-1px)' : 'none',
                transition: 'all 0.2s ease-in-out'
              }}
            >
              {loading ? 'Hesap Oluşturuluyor...' : 'Kayıt Ol'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '28px', fontSize: '0.9rem', color: '#78706a', fontWeight: 400 }}>
            Zaten hesabınız var mı?{' '}
            <span onClick={() => navigate('/login')} style={{ color: '#b8863b', fontWeight: 700, cursor: 'pointer', textDecoration: 'none' }}>
              Giriş Yap
            </span>
          </p>

        </div>
      </div>

    </div>
  );
}