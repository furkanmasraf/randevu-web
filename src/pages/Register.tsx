import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';

export default function Register() {
  const navigate = useNavigate();

  // Orijinal veri yapın tamamen korundu
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

  // Stil ve focus takipleri için state'ler
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
    border: focusedInput === inputName ? '2px solid #6366f1' : '1px solid #cbd5e1',
    fontSize: '0.95rem',
    outline: 'none',
    backgroundColor: '#ffffff',
    color: '#334155',
    transition: 'all 0.2s ease-in-out',
    boxShadow: focusedInput === inputName ? '0 0 0 4px rgba(99, 102, 241, 0.15)' : 'none',
  });

  return (
    <div style={{ 
  display: 'flex', 
  flexDirection: isMobile ? 'column' : 'row', // Mobilde alt alta
  minHeight: '100vh', 
  width: '100vw', 
  fontFamily: '"Inter", system-ui, sans-serif', 
  backgroundColor: '#f8fafc', 
  margin: 0, 
  overflowX: 'hidden' // Taşmayı engelle
}}>
      {/* SOL ALAN: MakasLab Temalı Sinematik Cam Efektli Panel */}
      <div style={{
        flex: isMobile ? 'none' : 1.1, // Mobilde 'none' yap
  height: isMobile ? '200px' : '100vh', // Mobilde 200px yükseklik yeterli
        backgroundImage: `url('https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=1200&q=80')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px'
      }}>
        <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.75)' }}></div>
        
        <div style={{
          position: 'relative',
          zIndex: 10,
          textAlign: 'center',
          padding: '44px 32px',
          backgroundColor: 'rgba(255, 255, 255, 0.08)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderRadius: '24px',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          maxWidth: '460px'
        }}>
          <h1 style={{ fontSize: '3rem', fontWeight: 800, color: '#ffffff', margin: '0 0 16px 0', letterSpacing: '-0.025em', lineHeight: 1.1 }}>
            Makas<span style={{ color: '#818cf8' }}>Lab</span>'a Katıl
          </h1>
          <p style={{ fontSize: '1.15rem', color: '#e2e8f0', fontWeight: 400, margin: 0, lineHeight: 1.6 }}>
            İster dakikalar içinde tarzına en uygun randevuyu al, ister işletmeni dijitalleştirerek lüksün ve konforun tadını çıkar.
          </p>
        </div>
      </div>

      {/* SAĞ ALAN: Kayıt Formu */}
      <div style={{ 
  flex: 1, 
  display: 'flex', 
  alignItems: isMobile ? 'center' : 'flex-start', // Mobilde ortala
  padding: isMobile ? '20px' : '40px 48px',        // Mobilde padding'i kıs
  justifyContent: 'center', 
  backgroundColor: '#ffffff', 
  overflowY: 'auto', 
  height: isMobile ? 'auto' : '100vh', // Mobilde auto yükseklik
  boxSizing: 'border-box'
}}>
        <div style={{ width: '100%', maxWidth: '420px', backgroundColor: '#ffffff', paddingTop: '24px', paddingBottom: '24px' }}>
          
          <div style={{ marginBottom: '28px' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', margin: '0 0 8px 0', letterSpacing: '-0.025em' }}>
              Yeni Hesap Oluştur
            </h2>
            <p style={{ fontSize: '0.95rem', color: '#64748b', margin: 0, fontWeight: 400 }}>
              Hemen kaydolun ve dijital dünyaya adım atın.
            </p>
          </div>

          {error && (
            <div style={{ backgroundColor: '#fef2f2', color: '#b91c1c', padding: '12px 14px', borderRadius: '10px', marginBottom: '20px', fontSize: '0.875rem', fontWeight: 600, border: '1px solid #fca5a5' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            
            {/* Ad ve Soyad - Yan Yana Kolon */}
            <div style={{ display: 'flex', gap: '14px' }}>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', letterSpacing: '0.05em' }}>AD</label>
                <input 
                  type="text" 
                  name="firstName" 
                  required 
                  value={formData.firstName} 
                  onFocus={() => setFocusedInput('firstName')}
                  onBlur={() => setFocusedInput('')}
                  onChange={handleChange} 
                  style={getInputStyle('firstName')} 
                  placeholder="Ad"
                />
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', letterSpacing: '0.05em' }}>SOYAD</label>
                <input 
                  type="text" 
                  name="lastName" 
                  required 
                  value={formData.lastName} 
                  onFocus={() => setFocusedInput('lastName')}
                  onBlur={() => setFocusedInput('')}
                  onChange={handleChange} 
                  style={getInputStyle('lastName')} 
                  placeholder="Soyad"
                />
              </div>
            </div>

            {/* E-posta */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', letterSpacing: '0.05em' }}>E-POSTA ADRESİ</label>
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

            {/* Telefon Numarası */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', letterSpacing: '0.05em' }}>TELEFON NUMARASI</label>
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

            {/* Şifre */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', letterSpacing: '0.05em' }}>ŞİFRE</label>
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

            {/* Premium Rol Seçim Kartları (State ile Senkronize) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', letterSpacing: '0.05em' }}>HESAP TÜRÜ</label>
              <div style={{ display: 'flex', gap: '14px' }}>
                
                {/* Müşteri Kartı */}
                <div 
                  onClick={() => setFormData(prev => ({ ...prev, role: 'CUSTOMER' }))}
                  style={{
                    flex: 1,
                    padding: '14px',
                    borderRadius: '12px',
                    border: formData.role === 'CUSTOMER' ? '2px solid #6366f1' : '1px solid #cbd5e1',
                    backgroundColor: formData.role === 'CUSTOMER' ? '#f5f3ff' : '#ffffff',
                    cursor: 'pointer',
                    textAlign: 'center',
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: formData.role === 'CUSTOMER' ? '#4f46e5' : '#475569' }}>Müşteriyim</div>
                </div>

                {/* Dükkan Sahibi Kartı */}
                <div 
                  onClick={() => setFormData(prev => ({ ...prev, role: 'SHOP_OWNER' }))}
                  style={{
                    flex: 1,
                    padding: '14px',
                    borderRadius: '12px',
                    border: formData.role === 'SHOP_OWNER' ? '2px solid #6366f1' : '1px solid #cbd5e1',
                    backgroundColor: formData.role === 'SHOP_OWNER' ? '#f5f3ff' : '#ffffff',
                    cursor: 'pointer',
                    textAlign: 'center',
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: formData.role === 'SHOP_OWNER' ? '#4f46e5' : '#475569' }}>İşletmeyim</div>
                </div>

              </div>
            </div>

            {/* Kayıt Ol Butonu */}
            <button 
              type="submit" 
              disabled={loading}
              onMouseEnter={() => setIsBtnHovered(true)}
              onMouseLeave={() => setIsBtnHovered(false)}
              style={{ 
                marginTop: '10px', 
                backgroundColor: loading ? '#64748b' : (isBtnHovered ? '#4f46e5' : '#6366f1'), 
                color: '#fff', 
                border: 'none', 
                padding: '14px', 
                borderRadius: '12px', 
                fontWeight: 700, 
                cursor: loading ? 'not-allowed' : 'pointer', 
                fontSize: '1rem', 
                boxShadow: isBtnHovered && !loading ? '0 10px 15px -3px rgba(99, 102, 241, 0.3)' : 'none',
                transform: isBtnHovered && !loading ? 'translateY(-1px)' : 'none',
                transition: 'all 0.2s ease-in-out' 
              }}
            >
              {loading ? 'Hesap Oluşturuluyor...' : 'Kayıt Ol'}
            </button>
          </form>

          {/* Giriş Linki */}
          <p style={{ textAlign: 'center', marginTop: '28px', fontSize: '0.9rem', color: '#64748b', fontWeight: 400 }}>
            Zaten hesabınız var mı?{' '}
            <span onClick={() => navigate('/login')} style={{ color: '#6366f1', fontWeight: 700, cursor: 'pointer', textDecoration: 'none' }}>
              Giriş Yap
            </span>
          </p>

        </div>
      </div>

    </div>
  );
}

// useEffect is imported from React above; no local implementation needed.
