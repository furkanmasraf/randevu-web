import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function RegisterShop() {
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [district, setDistrict] = useState('');
  const [addressText, setAddressText] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('userId');
  const role = localStorage.getItem('role');

  // Güvenlik Kontrolü: Giriş yapmamış veya yetkisi olmayan kullanıcıyı engelle
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
      // Backend'deki Shop modelinin beklediği birebir payload mimarisi
      const payload = {
        name,
        city,
        district,
        addressText,
        ownerId: parseInt(userId) // Dükkanı sisteme giren berbere bağlıyoruz
      };

      await axios.post('http://localhost:8080/api/shops/register', payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setSuccess('💈 Dükkanınız başarıyla sisteme kaydedildi!');
      setTimeout(() => {
        // Kayıttan sonra doğrudan az önce ayağa kaldırdığımız berber paneline yönlendiriyoruz
        navigate('/shop-owner/dashboard');
      }, 1500);
    } catch (err: any) {
      setError('Dükkan kaydedilirken bir hata oluştu. Lütfen alanları kontrol edin.');
      console.error(err);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', fontFamily: 'system-ui, sans-serif', backgroundColor: '#f9fafb' }}>
      <form onSubmit={handleRegisterShop} style={{ display: 'flex', flexDirection: 'column', width: '380px', gap: '16px', backgroundColor: '#fff', padding: '32px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)', border: '1px solid #e5e7eb' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '8px' }}>
          <h2 style={{ margin: 0, color: '#111827', fontSize: '1.5rem' }}>💈 Kuaför & Berber</h2>
          <p style={{ margin: '4px 0 0 0', color: '#6b7280', fontSize: '0.9rem' }}>Yeni Dükkan Kayıt Formu</p>
        </div>
        
        {error && <div style={{ color: '#ef4444', backgroundColor: '#fee2e2', padding: '10px', borderRadius: '8px', fontSize: '0.875rem', fontWeight: 500, textAlign: 'center' }}>{error}</div>}
        {success && <div style={{ color: '#10b981', backgroundColor: '#e6f4ea', padding: '10px', borderRadius: '8px', fontSize: '0.875rem', fontWeight: 500, textAlign: 'center' }}>{success}</div>}
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#374151' }}>Dükkan / Salon Adı</label>
          <input 
            type="text" 
            placeholder="Örn: Furkan Erkek Kuaförü" 
            value={name} 
            onChange={(e) => setName(e.target.value)}
            style={{ padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none', fontSize: '0.95rem' }}
            required
          />
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#374151' }}>Şehir</label>
            <input 
              type="text" 
              placeholder="Örn: İstanbul" 
              value={city} 
              onChange={(e) => setCity(e.target.value)}
              style={{ padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none', fontSize: '0.95rem', width: '100%', boxSizing: 'border-box' }}
              required
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#374151' }}>İlçe</label>
            <input 
              type="text" 
              placeholder="Örn: Kadıköy" 
              value={district} 
              onChange={(e) => setDistrict(e.target.value)}
              style={{ padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none', fontSize: '0.95rem', width: '100%', boxSizing: 'border-box' }}
              required
            />
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#374151' }}>Detaylı Adres Metni</label>
          <textarea 
            placeholder="Örn: Moda Caddesi No:12 Kat:1" 
            value={addressText} 
            onChange={(e) => setAddressText(e.target.value)}
            style={{ padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none', minHeight: '60px', resize: 'vertical', fontFamily: 'inherit', fontSize: '0.95rem' }}
            required
          />
        </div>
        
        <button type="submit" style={{ padding: '12px', backgroundColor: '#111827', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '0.95rem', marginTop: '8px', transition: 'background-color 0.2s' }}>
          Dükkanı Oluştur ve Başlat
        </button>
        
        <button 
          type="button" 
          onClick={() => navigate('/')} 
          style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', textDecoration: 'underline', fontSize: '0.875rem' }}
        >
          İptal Et ve Geri Dön
        </button>
      </form>
    </div>
  );
}