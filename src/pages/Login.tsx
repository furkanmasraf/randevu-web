import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    setError('');
    try {
      // Backend'deki DTO yapına (email ve password) tam uyumlu hale getirildi
      // Sonuna rastgele parametre eklenerek tarayıcı önbelleği (304) bypass edildi
      const response = await API.post(`/auth/login?_=${new Date().getTime()}`, { email, password });
      
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        alert('Giriş başarılı!');
        navigate('/'); // Ana sayfaya uçuruyoruz
      }
    } catch (err) {
      setError('E-posta veya şifre hatalı!');
      console.error(err);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '100px', fontFamily: 'Arial, sans-serif' }}>
      <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', width: '300px', gap: '15px' }}>
        <h2 style={{ textAlign: 'center' }}>Kuaför Randevu Sistemi</h2>
        <h3 style={{ textAlign: 'center', margin: '0', color: '#555' }}>Giriş Yap</h3>
        
        {error && <p style={{ color: 'red', textAlign: 'center', margin: '0' }}>{error}</p>}
        
        <input 
          type="email" 
          placeholder="E-posta Adresi" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)}
          style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
          required
        />
        <input 
          type="password" 
          placeholder="Şifre" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)}
          style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
          required
        />
        <button type="submit" style={{ padding: '10px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
          Giriş Yap
        </button>
        
        <button 
          type="button" 
          onClick={() => navigate('/register')} 
          style={{ background: 'none', border: 'none', color: '#007bff', cursor: 'pointer', marginTop: '5px', textDecoration: 'underline' }}
        >
          Hesabın yok mu? Kayıt Ol
        </button>
      </form>
    </div>
  );
}