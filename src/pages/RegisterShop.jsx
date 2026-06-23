import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';

export default function RegisterShop() {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleRegisterShop = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      // Backend dükkan ekleme endpoint'ine istek atıyoruz
      // Not: Eğer backend '/api/shops' altında `@PostMapping` bekliyorsa adresi '/shops' yapıyoruz
      await API.post('/shops/register', { name, address });
      
      setSuccess('Dükkan başarıyla sisteme kaydedildi!');
      setTimeout(() => {
        navigate('/'); // Kayıttan sonra listeyi görmek için ana sayfaya dönüyoruz
      }, 1500);
    } catch (err) {
      setError('Dükkan kaydedilirken bir hata oluştu. Yetkinizi veya alanları kontrol edin.');
      console.error(err);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '50px', fontFamily: 'Arial, sans-serif' }}>
      <form onSubmit={handleRegisterShop} style={{ display: 'flex', flexDirection: 'column', width: '320px', gap: '15px' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '0' }}>Kuaför / Berber Paneli</h2>
        <h3 style={{ textAlign: 'center', margin: '0', color: '#555' }}>Yeni Dükkan Kaydet</h3>
        
        {error && <p style={{ color: 'red', textAlign: 'center', margin: '0' }}>{error}</p>}
        {success && <p style={{ color: 'green', textAlign: 'center', margin: '0' }}>{success}</p>}
        
        <input 
          type="text" 
          placeholder="Dükkan / Salon Adı" 
          value={name} 
          onChange={(e) => setName(e.target.value)}
          style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
          required
        />
        <textarea 
          placeholder="Dükkan Adresi" 
          value={address} 
          onChange={(e) => setAddress(e.target.value)}
          style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc', minHeight: '8px', resize: 'vertical' }}
          required
        />
        
        <button type="submit" style={{ padding: '10px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
          Dükkanı Kaydet
        </button>
        
        <button 
          type="button" 
          onClick={() => navigate('/')} 
          style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer', textDecoration: 'underline' }}
        >
          İptal Et ve Ana Sayfaya Dön
        </button>
      </form>
    </div>
  );
}