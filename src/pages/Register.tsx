import { useState, ChangeEvent, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

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
      await axios.post('http://localhost:8080/api/auth/register', payload);
      
      alert('Kayıt işleminiz başarıyla tamamlandı! Giriş yapabilirsiniz.');
      navigate('/login');
    } catch (err: any) {
      console.error('Kayıt hatası:', err);
      setError(err.response?.data?.message || 'Kayıt olurken bir hata oluştu. Lütfen bilgilerinizi kontrol edin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#f3f4f6', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ backgroundColor: '#fff', padding: '40px', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', width: '100%', maxWidth: '450px' }}>
        
        <h2 style={{ textAlign: 'center', margin: '0 0 8px 0', color: '#111827', fontWeight: 700 }}>Hesap Oluştur</h2>
        <p style={{ textAlign: 'center', margin: '0 0 24px 0', color: '#6b7280', fontSize: '0.9rem' }}>Hemen kaydolun ve sistemin tadını çıkarın.</p>

        {error && <div style={{ backgroundColor: '#fee2e2', color: '#ef4444', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '0.875rem', fontWeight: 500 }}>{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#4b5563' }}>Ad</label>
              <input type="text" name="firstName" required value={formData.firstName} onChange={handleChange} style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none' }} />
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#4b5563' }}>Soyad</label>
              <input type="text" name="lastName" required value={formData.lastName} onChange={handleChange} style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none' }} />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#4b5563' }}>E-posta</label>
            <input type="email" name="email" required value={formData.email} onChange={handleChange} style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none' }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#4b5563' }}>Telefon Numarası</label>
            <input type="tel" name="phoneNumber" placeholder="05551234567" required value={formData.phoneNumber} onChange={handleChange} style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none' }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#4b5563' }}>Şifre</label>
            <input type="password" name="password" required value={formData.password} onChange={handleChange} style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none' }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#4b5563' }}>Hesap Türü</label>
            <select 
              name="role" 
              value={formData.role} 
              onChange={handleChange} 
              style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none', backgroundColor: '#fff', cursor: 'pointer', fontWeight: 500 }}
            >
              <option value="CUSTOMER">Müşteri (Randevu Almak İstiyorum)</option>
              <option value="SHOP_OWNER">Dükkan Sahibi / Berber (Salonumu Yönetmek İstiyorum)</option>
            </select>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            style={{ marginTop: '8px', backgroundColor: '#111827', color: '#fff', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', fontSize: '1rem', transition: 'background-color 0.2s' }}
          >
            {loading ? 'Kaydediliyor...' : 'Kayıt Ol'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.875rem', color: '#4b5563' }}>
          Zaten hesabınız var mı? <span onClick={() => navigate('/login')} style={{ color: '#111827', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }}>Giriş Yap</span>
        </p>

      </div>
    </div>
  );
}