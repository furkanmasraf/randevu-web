import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';

export default function RegisterShop() {
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [district, setDistrict] = useState('');
  const [addressText, setAddressText] = useState('');
  const [category, setCategory] = useState('Erkek Kuaförü'); // Yeni state
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [focusedInput, setFocusedInput] = useState<string>('');

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
      setError('Kullanıcı kimliği bulunamadı.');
      return;
    }

    try {
      const payload = {
        name,
        city,
        district,
        addressText,
        category, // EKLEDİK: Kategori bilgisi backend'e gönderiliyor
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
      setError('Dükkan kaydedilirken bir hata oluştu.');
      console.error(err);
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
    width: '100%',
    boxSizing: 'border-box' as const,
    appearance: 'none' as const // Select için özel ayar
  });

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', fontFamily: "'Inter', system-ui, sans-serif", backgroundColor: '#f6f3ee', margin: 0, padding: '20px', boxSizing: 'border-box' }}>
      
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600;700;800&display=swap');
        .mkl-rs-cancel:hover { color: #b8863b !important; }
        .mkl-rs-submit:hover { background-color: #b8863b !important; box-shadow: 0 10px 20px -6px rgba(184, 134, 59, 0.4) !important; transform: translateY(-1px); }
      `}</style>

      <form onSubmit={handleRegisterShop} style={{ display: 'flex', flexDirection: 'column', width: '100%', maxWidth: '420px', gap: '18px', backgroundColor: '#ffffff', padding: '40px', borderRadius: '20px', boxShadow: '0 16px 32px -12px rgba(28, 25, 23, 0.14)', border: '1px solid #ece4d5' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '8px' }}>
          <h2 style={{ margin: 0, fontFamily: "'Fraunces', serif", color: '#1c1917', fontSize: '1.6rem' }}>Makas<span style={{ fontStyle: 'italic', color: '#c9a267' }}>Lab</span> İşletme</h2>
          <p style={{ margin: '6px 0 0 0', color: '#78706a', fontSize: '0.92rem' }}>Yeni Dükkan Kayıt Formu</p>
          <div style={{ width: '44px', height: '3px', margin: '14px auto 0 auto', background: 'linear-gradient(90deg, #b8863b 0%, #7a2e2e 100%)' }} />
        </div>

        {error && <div style={{ color: '#a3402f', backgroundColor: '#fbeeea', padding: '12px', borderRadius: '10px', fontSize: '0.875rem', fontWeight: 600, textAlign: 'center' }}>{error}</div>}
        {success && <div style={{ color: '#3f7a4e', backgroundColor: '#eef6ee', padding: '12px', borderRadius: '10px', fontSize: '0.875rem', fontWeight: 600, textAlign: 'center' }}>{success}</div>}

        {/* Form Alanları */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#3d3630' }}>DÜKKAN / SALON ADI</label>
          <input type="text" value={name} onFocus={() => setFocusedInput('name')} onBlur={() => setFocusedInput('')} onChange={(e) => setName(e.target.value)} style={getInputStyle('name')} required />
        </div>

        <div style={{ display: 'flex', gap: '14px' }}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#3d3630' }}>ŞEHİR</label>
            <input type="text" value={city} onFocus={() => setFocusedInput('city')} onBlur={() => setFocusedInput('')} onChange={(e) => setCity(e.target.value)} style={getInputStyle('city')} required />
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#3d3630' }}>İLÇE</label>
            <input type="text" value={district} onFocus={() => setFocusedInput('district')} onBlur={() => setFocusedInput('')} onChange={(e) => setDistrict(e.target.value)} style={getInputStyle('district')} required />
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#3d3630' }}>DETAYLI ADRES METNİ</label>
          <textarea value={addressText} onFocus={() => setFocusedInput('address')} onBlur={() => setFocusedInput('')} onChange={(e) => setAddressText(e.target.value)} style={{ ...getInputStyle('address'), minHeight: '80px', resize: 'vertical' }} required />
        </div>

        {/* Kategori Seçimi */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#3d3630' }}>İŞLETME KATEGORİSİ</label>
          <select value={category} onFocus={() => setFocusedInput('category')} onBlur={() => setFocusedInput('')} onChange={(e) => setCategory(e.target.value)} style={getInputStyle('category')}>
            <option value="Erkek Kuaförü">Erkek Kuaförü</option>
            <option value="Kadın Kuaförü">Kadın Kuaförü</option>
            <option value="Güzellik Salonu">Güzellik Salonu</option>
          </select>
        </div>

        <button type="submit" className="mkl-rs-submit" style={{ padding: '15px', backgroundColor: '#1c1917', color: '#faf7f2', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 700, marginTop: '6px' }}>
          Dükkanı Oluştur ve Başlat
        </button>

        <button type="button" onClick={() => navigate('/')} className="mkl-rs-cancel" style={{ background: 'none', border: 'none', color: '#78706a', cursor: 'pointer', fontSize: '0.875rem' }}>
          İptal Et ve Geri Dön
        </button>
      </form>
    </div>
  );
}