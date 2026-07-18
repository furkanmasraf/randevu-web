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
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', fontFamily: "'Inter', system-ui, sans-serif", backgroundColor: '#f6f3ee', margin: 0, padding: '20px', boxSizing: 'border-box' }}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600;700;800&display=swap');

        .mkl-rs-cancel:hover {
          color: #b8863b !important;
        }

        .mkl-rs-submit {
          transition: background-color 0.2s ease, transform 0.15s ease, box-shadow 0.2s ease;
        }
        .mkl-rs-submit:hover {
          background-color: #b8863b !important;
          box-shadow: 0 10px 20px -6px rgba(184, 134, 59, 0.4) !important;
          transform: translateY(-1px);
        }
      `}</style>

      <form onSubmit={handleRegisterShop} style={{ display: 'flex', flexDirection: 'column', width: '100%', maxWidth: '420px', gap: '18px', backgroundColor: '#ffffff', padding: '40px', borderRadius: '20px', boxShadow: '0 16px 32px -12px rgba(28, 25, 23, 0.14)', border: '1px solid #ece4d5', boxSizing: 'border-box' }}>

        <div style={{ textAlign: 'center', marginBottom: '8px' }}>
          <h2 style={{ margin: 0, fontFamily: "'Fraunces', serif", color: '#1c1917', fontSize: '1.6rem', fontWeight: 600 }}>
            Makas<span style={{ fontStyle: 'italic', color: '#c9a267' }}>Lab</span> İşletme
          </h2>
          <p style={{ margin: '6px 0 0 0', color: '#78706a', fontSize: '0.92rem' }}>Yeni Dükkan Kayıt Formu</p>
          <div style={{
            width: '44px',
            height: '3px',
            margin: '14px auto 0 auto',
            borderRadius: '3px',
            background: 'linear-gradient(90deg, #b8863b 0%, #b8863b 45%, #7a2e2e 55%, #7a2e2e 100%)'
          }} />
        </div>

        {error && <div style={{ color: '#a3402f', backgroundColor: '#fbeeea', padding: '12px', borderRadius: '10px', fontSize: '0.875rem', fontWeight: 600, textAlign: 'center', border: '1px solid #e3b6a8' }}>{error}</div>}
        {success && <div style={{ color: '#3f7a4e', backgroundColor: '#eef6ee', padding: '12px', borderRadius: '10px', fontSize: '0.875rem', fontWeight: 600, textAlign: 'center', border: '1px solid #b9d9bd' }}>{success}</div>}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#3d3630', letterSpacing: '0.05em' }}>DÜKKAN / SALON ADI</label>
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

        <div style={{ display: 'flex', gap: '14px', width: '100%' }}>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#3d3630', letterSpacing: '0.05em' }}>ŞEHİR</label>
            <input
              type="text"
              placeholder="İstanbul"
              value={city}
              onFocus={() => setFocusedInput('city')}
              onBlur={() => setFocusedInput('')}
              onChange={(e) => setCity(e.target.value)}
              style={{ ...getInputStyle('city'), width: '100%', boxSizing: 'border-box' }}
              required
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#3d3630', letterSpacing: '0.05em' }}>İLÇE</label>
            <input
              type="text"
              placeholder="Kadıköy"
              value={district}
              onFocus={() => setFocusedInput('district')}
              onBlur={() => setFocusedInput('')}
              onChange={(e) => setDistrict(e.target.value)}
              style={{ ...getInputStyle('district'), width: '100%', boxSizing: 'border-box' }}
              required
            />
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#3d3630', letterSpacing: '0.05em' }}>DETAYLI ADRES METNİ</label>
          <textarea
            placeholder="Örn: Caferağa Mahallesi Moda Caddesi No:45 Kat:1"
            value={addressText}
            onFocus={() => setFocusedInput('address')}
            onBlur={() => setFocusedInput('')}
            onChange={(e) => setAddressText(e.target.value)}
            style={{ ...getInputStyle('address'), minHeight: '80px', resize: 'vertical', fontFamily: 'inherit', width: '100%', boxSizing: 'border-box' }}
            required
          />
        </div>

        <button
          type="submit"
          className="mkl-rs-submit"
          style={{
            padding: '15px',
            backgroundColor: '#1c1917',
            color: '#faf7f2',
            border: 'none',
            borderRadius: '10px',
            cursor: 'pointer',
            fontWeight: 700,
            fontSize: '0.98rem',
            fontFamily: "'Inter', sans-serif",
            marginTop: '6px'
          }}
        >
          Dükkanı Oluştur ve Başlat
        </button>

        <button
          type="button"
          onClick={() => navigate('/')}
          className="mkl-rs-cancel"
          style={{ background: 'none', border: 'none', color: '#78706a', cursor: 'pointer', textDecoration: 'none', fontSize: '0.875rem', textAlign: 'center', fontWeight: 500, marginTop: '2px', fontFamily: "'Inter', sans-serif", transition: 'color 0.2s ease' }}
        >
          İptal Et ve Geri Dön
        </button>
      </form>

    </div>
  );
}