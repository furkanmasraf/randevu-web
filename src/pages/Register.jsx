import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';

export default function Register() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      // Backend DTO yapısı ile birebir eşleşen nesneyi gönderiyoruz
      await API.post('/shops/register', { 
        firstName, 
        lastName, 
        email, 
        password, 
        phone 
      });
      
      setSuccess('Kullanıcı başarıyla oluşturuldu! Giriş sayfasına yönlendiriliyorsunuz...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError('Kayıt oluşturulurken bir hata oluştu. Bilgileri veya şifre uzunluğunu kontrol edin.');
      console.error(err);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '5px', fontFamily: 'Arial, sans-serif' }}>
      <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', width: '320px', gap: '12px' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '0' }}>Kuaför Randevu Sistemi</h2>
        <h3 style={{ textAlign: 'center', margin: '0', color: '#555' }}>Yeni Hesap Oluştur</h3>
        
        {error && <p style={{ color: 'red', textAlign: 'center', margin: '0' }}>{error}</p>}
        {success && <p style={{ color: 'green', textAlign: 'center', margin: '0' }}>{success}</p>}
        
        <input 
          type="text" 
          placeholder="Adınız" 
          value={firstName} 
          onChange={(e) => setFirstName(e.target.value)}
          style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
          required
        />
        <input 
          type="text" 
          placeholder="Soyadınız" 
          value={lastName} 
          onChange={(e) => setLastName(e.target.value)}
          style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
          required
        />
        <input 
          type="email" 
          placeholder="E-posta Adresi" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)}
          style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
          required
        />
        <input 
          type="text" 
          placeholder="Telefon Numarası" 
          value={phone} 
          onChange={(e) => setPhone(e.target.value)}
          style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
          required
        />
        <input 
          type="password" 
          placeholder="Şifre (En az 6 karakter)" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)}
          style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
          required
        />
        
        <button type="submit" style={{ padding: '10px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
          Hesap Oluştur
        </button>
        
        <button 
          type="button" 
          onClick={() => navigate('/login')} 
          style={{ background: 'none', border: 'none', color: '#007bff', cursor: 'pointer', marginTop: '5px', textDecoration: 'underline' }}
        >
          Zaten hesabın var mı? Giriş Yap
        </button>
      </form>
    </div>
  );
}