import { useEffect, useState } from 'react';
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
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', fontFamily: 'sans-serif', margin: 0, padding: '40px 20px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* 🧭 ÜST BAR: Modern & Minimalist Üst Alan */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          backgroundColor: '#ffffff',
          padding: '20px 32px',
          borderRadius: '16px',
          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02), 0 2px 4px -1px rgba(0,0,0,0.02)',
          border: '1px solid #f3f4f6',
          marginBottom: '40px'
        }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: '#111827' }}>
              Mevcut Berberler & Kuaförler
            </h2>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.875rem', color: '#6b7280' }}>
              Size en uygun salonu seçip hemen randevunuzu planlayın.
            </p>
          </div>
          
          <div style={{ display: 'flex', gap: '12px' }}>
            <button 
              onClick={() => navigate('/register-shop')} 
              style={{ 
                padding: '12px 20px', 
                backgroundColor: '#ffffff', 
                color: '#111827', 
                border: '1px solid #e5e7eb', 
                borderRadius: '10px', 
                cursor: 'pointer', 
                fontWeight: 600,
                fontSize: '0.875rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s'
              }}
            >
              <span>➕</span> Yeni Dükkan Ekle
            </button>
            <button 
              onClick={handleLogout} 
              style={{ 
                padding: '12px 20px', 
                backgroundColor: '#111827', 
                color: '#ffffff', 
                border: 'none', 
                borderRadius: '10px', 
                cursor: 'pointer', 
                fontWeight: 600,
                fontSize: '0.875rem',
                transition: 'background-color 0.2s'
              }}
            >
              Çıkış Yap
            </button>
          </div>
        </div>

        {/* 🗂️ DÜKKAN LİSTELEME IZGARASI */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
          gap: '24px' 
        }}>
          {shops.length === 0 ? (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px 20px', backgroundColor: '#ffffff', borderRadius: '16px', border: '1px dashed #e5e7eb' }}>
              <p style={{ color: '#9ca3af', fontStyle: 'italic', margin: 0, fontSize: '0.95rem' }}>
                Henüz kayıtlı dükkan bulunamadı veya backend bağlantısı bekleniyor...
              </p>
            </div>
          ) : (
            shops.map((shop) => (
              <div 
                key={shop.id} 
                style={{ 
                  backgroundColor: '#ffffff', 
                  padding: '24px', 
                  borderRadius: '16px', 
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.02), 0 4px 6px -2px rgba(0, 0, 0, 0.02)', 
                  border: '1px solid #f3f4f6',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'transform 0.2s, boxShadow 0.2s'
                }}
              >
                <div>
                  {/* Salon İkonu / Başlık Alanı */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>
                      💇‍♂️
                    </div>
                    <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 600, color: '#111827' }}>
                      {shop.name}
                    </h3>
                  </div>
                  
                  <p style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '24px', display: 'flex', alignItems: 'flex-start', gap: '6px', lineHeight: '1.4' }}>
                    <span>📍</span> {shop.address || 'Adres Belirtilmemiş'}
                  </p>
                </div>

                <button 
                  onClick={() => alert(`${shop.name} için randevu oluşturma sayfasına yönlendiriliyorsunuz...`)}
                  style={{ 
                    width: '100%', 
                    padding: '12px', 
                    backgroundColor: '#111827', 
                    color: '#ffffff', 
                    border: 'none', 
                    borderRadius: '10px', 
                    cursor: 'pointer', 
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    transition: 'background-color 0.2s'
                  }}
                >
                  Randevu Al
                </button>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}