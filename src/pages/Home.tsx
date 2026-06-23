import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';

interface Shop {
  id: number;
  name: string;
  address?: string;
}

export default function Home() {
  const [shops, setShops] = useState<Shop[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Spring Boot backend'indeki dükkan listesi endpoint'ine istek atıyoruz
    API.get('/shops') 
      .then((response) => {
        setShops(response.data);
      })
      .catch((err) => {
        console.error("Dükkanlar yüklenirken hata oluştu:", err);
      });
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      {/* Üst Bar: Başlık, Dükkan Ekleme ve Çıkış Butonları */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #eee', paddingBottom: '15px' }}>
        <h2>Mevcut Berberler & Kuaförler</h2>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
            onClick={() => navigate('/register-shop')} 
            style={{ padding: '10px 15px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            ➕ Yeni Dükkan Ekle
          </button>
          <button 
            onClick={handleLogout} 
            style={{ padding: '10px 15px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            Çıkış Yap
          </button>
        </div>
      </div>

      {/* Dükkan Listeleme Izgarası (Grid) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px', marginTop: '25px' }}>
        {shops.length === 0 ? (
          <p style={{ color: '#666', fontStyle: 'italic' }}>Henüz kayıtlı dükkan bulunamadı veya backend bağlantısı bekleniyor...</p>
        ) : (
          shops.map((shop) => (
            <div key={shop.id} style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '8px', boxShadow: '2px 2px 5px rgba(0,0,0,0.1)', backgroundColor: '#fff' }}>
              <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>{shop.name}</h3>
              <p style={{ color: '#666', fontSize: '14px', marginBottom: '15px' }}>📍 {shop.address || 'Adres Belirtilmemiş'}</p>
              <button 
                onClick={() => alert(`${shop.name} için randevu oluşturma sayfasına yönlendiriliyorsunuz...`)}
                style={{ width: '100%', padding: '10px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
              >
                Randevu Al
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}