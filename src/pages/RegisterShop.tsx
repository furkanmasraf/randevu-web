import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';

export default function RegisterShop() {
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [district, setDistrict] = useState('');
  const [addressText, setAddressText] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Etkileşim ve animasyon state'leri
  const [focusedInput, setFocusedInput] = useState<string>('');
  const [isBtnHovered, setIsBtnHovered] = useState<boolean>(false);
  
  const navigate = useNavigate();

  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('userId');
  const role = localStorage.getItem('role');

  useEffect(() => {
    if (!token || role !== 'SHOP_OWNER') {
      navigate('/login');
    }
  }, [token, role, navigate]);

  const handleRegisterShop = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!userId) {
      setError('Kullanıcı kimliği bulunamadı. Lütfen tekrar giriş yapın.');
      return;
    }

    try {
      const payload = {
        name,
        city,
        district,
        addressText,
        ownerId: parseInt(userId)
      };

      await API.post('https://randevu-sistemi-dv33.onrender.com/api/shops/register', payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setSuccess('Dükkanınız başarıyla sisteme kaydedildi!');
      setTimeout(() => {
        navigate('/shop-owner/dashboard');
      }, 1500);
    } catch (err: any) {
      setError('Dükkan kaydedilirken bir hata oluştu. Lütfen alanları kontrol edin.');
      console.error(err);
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
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', fontFamily: '"Inter", system-ui, sans-serif', backgroundColor: '#f1f5f9', margin: 0 }}>
      
      <form onSubmit={handleRegisterShop} style={{ display: 'flex', flexDirection: 'column', width: '400px', gap: '20px', backgroundColor: '#ffffff', padding: '40px', borderRadius: '20px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.02)', border: '1px solid #e2e8f0' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '12px' }}>
          <h2 style={{ margin: 0, color: '#0f172a', fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.025em' }}>MakasLab İşletme</h2>
          <p style={{ margin: '6px 0 0 0', color: '#64748b', fontSize: '0.95rem' }}>Yeni Dükkan Kayıt Formu</p>
        </div>
        
        {error && <div style={{ color: '#b91c1c', backgroundColor: '#fef2f2', padding: '12px', borderRadius: '10px', fontSize: '0.875rem', fontWeight: 600, textAlign: 'center', border: '1px solid #fca5a5' }}>{error}</div>}
        {success && <div style={{ color: '#15803d', backgroundColor: '#f0fdf4', padding: '12px', borderRadius: '10px', fontSize: '0.875rem', fontWeight: 600, textAlign: 'center', border: '1px solid #bbf7d0' }}>{success}</div>}
        
        {/* Dükkan Adı */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#475569', letterSpacing: '0.025em' }}>DÜKKAN / SALON ADI</label>
          <input 
            type="text" 
            placeholder="Örn: Klas Kuaför Salonu" 
            value={name} 
            onFocus={() => setFocusedInput('name')}
            onBlur={() => setFocusedInput('')}
            onChange={(e) => setName(e.target.value)}
            style={getInputStyle('name')}
            required
          />
        </div>

        {/* Şehir / İlçe İkili Kolon */}
        <div style={{ display: 'flex', gap: '16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#475569', letterSpacing: '0.025em' }}>ŞEHİR</label>
            <input 
              type="text" 
              placeholder="İstanbul" 
              value={city} 
              onFocus={() => setFocusedInput('city')}
              onBlur={() => setFocusedInput('')}
              onChange={(e) => setCity(e.target.value)}
              style={getInputStyle('city')}
              required
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#475569', letterSpacing: '0.025em' }}>İLÇE</label>
            <input 
              type="text" 
              placeholder="Kadıköy" 
              value={district} 
              onFocus={() => setFocusedInput('district')}
              onBlur={() => setFocusedInput('')}
              onChange={(e) => setDistrict(e.target.value)}
              style={getInputStyle('district')}
              required
            />
          </div>
        </div>

        {/* Detaylı Adres */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#475569', letterSpacing: '0.025em' }}>DETAYLI ADRES METNİ</label>
          <textarea 
            placeholder="Örn: Caferağa Mahallesi Moda Caddesi No:45 Kat:1" 
            value={addressText} 
            onFocus={() => setFocusedInput('address')}
            onBlur={() => setFocusedInput('')}
            onChange={(e) => setAddressText(e.target.value)}
            style={{ ...getInputStyle('address'), minHeight: '80px', resize: 'vertical', fontFamily: 'inherit' }}
            required
          />
        </div>
        
        {/* Butonlar */}
        <button 
          type="submit" 
          onMouseEnter={() => setIsBtnHovered(true)}
          onMouseLeave={() => setIsBtnHovered(false)}
          style={{ 
            padding: '16px', 
            backgroundColor: isBtnHovered ? '#4f46e5' : '#111827', 
            color: 'white', 
            border: 'none', 
            borderRadius: '12px', 
            cursor: 'pointer', 
            fontWeight: 600, 
            fontSize: '0.95rem', 
            marginTop: '8px', 
            boxShadow: isBtnHovered ? '0 10px 15px -3px rgba(99, 102, 241, 0.2)' : 'none',
            transform: isBtnHovered ? 'translateY(-1px)' : 'none',
            transition: 'all 0.2s ease-in-out' 
          }}
        >
          Dükkanı Oluştur ve Başlat
        </button>
        
        <button 
          type="button" 
          onClick={() => navigate('/')} 
          style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', textDecoration: 'none', fontSize: '0.875rem', textAlign: 'center', fontWeight: 500, marginTop: '4px' }}
          onMouseEnter={(e) => e.currentTarget.style.color = '#0f172a'}
          onMouseLeave={(e) => e.currentTarget.style.color = '#64748b'}
        >
          İptal Et ve Geri Dön
        </button>
      </form>
      
    </div>
  );
}