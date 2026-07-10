import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';

interface Shop {
  id: number;
  name: string;
  city: string;
  district: string;
  addressText: string;
  latitude: number;
  longitude: number;
  subscribed: boolean;
  category?: string;
  phoneNumber?: string;
}

const CITIES = ["Tümü", "İstanbul", "Ankara", "İzmir", "Bursa", "Antalya"];


export default function Home() {
  const navigate = useNavigate();

  // Durum (State) Yönetimleri
  const [shops, setShops] = useState<Shop[]>([]); 
  // loading state removed because its value was unused
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCity, setSelectedCity] = useState<string>('Tümü');
  const selectedCategory = 'Tümü';

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    
    if (!token) {
      navigate('/login');
      return;
    }

    if (role && role.toUpperCase() === 'SHOP_OWNER') {
      navigate('/shop-owner/dashboard');
      return;
    }

    const fetchShops = async () => {
      try {
        const response = await API.get('https://randevu-sistemi-dv33.onrender.com/api/shops', {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        setShops(response.data);
      } catch (error) {
        console.error("Dükkanlar yüklenirken hata oluştu:", error);
      }
    };

    fetchShops();
  }, [navigate]);

  const filteredShops = shops.filter((shop) => {
    const matchesCity = selectedCity === 'Tümü' || shop.city.toLowerCase() === selectedCity.toLowerCase();
    const matchesSearch = shop.name.toLowerCase().includes(searchQuery.toLowerCase());

    let matchesCategory = true;
    if (selectedCategory !== 'Tümü') {
      const shopNameLower = shop.name.toLowerCase();
      if (selectedCategory === "Erkek Kuaförü") {
        matchesCategory = shopNameLower.includes("erkek");
      } else if (selectedCategory === "Kadın Kuaförü") {
        matchesCategory = shopNameLower.includes("kadın") || shopNameLower.includes("bayan");
      } else if (selectedCategory === "Güzellik Salonu") {
        matchesCategory = shopNameLower.includes("güzellik");
      }
    }
    return matchesCity && matchesSearch && matchesCategory;
  });

  return (
  <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: '"Inter", system-ui, sans-serif', paddingBottom: '80px' }}>
    
    {/* 1. PREMIUM HERO (Responsive Görsel) */}
    <header style={{ 
  position: 'relative', 
  height: '400px', 
  display: 'flex', 
  flexDirection: 'column', 
  justifyContent: 'center', 
  alignItems: 'center', 
  textAlign: 'center', 
  color: '#fff',
  background: 'linear-gradient(rgba(15, 23, 42, 0.5), rgba(15, 23, 42, 0.5)), url("/kuaforsalonu.jpg")',  backgroundSize: 'cover',
  backgroundPosition: 'center',
  backgroundRepeat: 'no-repeat'
}}>
      <h1 style={{ fontSize: 'clamp(2rem, 8vw, 3rem)', fontWeight: 900, margin: 0 }}>Makas<span style={{ color: '#818cf8' }}>Lab</span></h1>
      <p style={{ fontSize: '1rem', opacity: 0.9, marginTop: '10px', padding: '0 20px' }}>Premium kuaför ve güzellik deneyimi dijital dünyada.</p>

      {/* Navigasyon (Mobil uyumlu) */}
      <div style={{ position: 'absolute', top: '20px', right: '20px', display: 'flex', gap: '8px' }}>
        <button 
    onClick={() => {
      const token = localStorage.getItem('token');
      navigate(token ? '/my-appointments' : '/login');
    }} 
    style={{ 
      padding: '8px 12px', 
      borderRadius: '8px', 
      border: 'none', 
      background: 'rgba(255,255,255,0.15)', 
      color: '#fff', 
      cursor: 'pointer', 
      fontSize: '0.8rem', 
      fontWeight: 600 
    }}
  >
    👤 Profilim
  </button>

  {/* Çıkış Butonu: Sadece giriş yapılmışsa görünür */}
  {localStorage.getItem('token') && (
    <button 
      onClick={() => {
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        navigate('/');
      }} 
      style={{ 
        padding: '8px 12px', 
        borderRadius: '8px', 
        border: 'none', 
        background: '#ef4444', 
        color: '#fff', 
        cursor: 'pointer', 
        fontSize: '0.8rem', 
        fontWeight: 600 
      }}
    >
      Çıkış
    </button>
  )}
      </div>
    </header>

    {/* 2. YÜZEN FİLTRE (Responsive) */}
    <div style={{ maxWidth: '900px', margin: '-60px auto 40px auto', padding: '0 20px', position: 'relative', zIndex: 10 }}>
      <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '20px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ display: 'flex', flexDirection: 'row', gap: '10px' }}>
          <input type="text" placeholder="Salon ara..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={{ flex: 2, padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '0.9rem' }} />
          <select value={selectedCity} onChange={(e) => setSelectedCity(e.target.value)} style={{ flex: 1, padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '0.9rem' }}>{CITIES.map(c => <option key={c} value={c}>{c}</option>)}</select>
        </div>
      </div>
    </div>

    {/* 3. KOMPAKT VE RESPONSIVE DÜKKAN LİSTESİ */}
    <main style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 20px' }}>
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', // Mobilde 1, masaüstünde 3 sütun yapar
        gap: '20px' 
      }}>
        {filteredShops.map((shop) => (
          <div key={shop.id} style={{ 
            backgroundColor: '#fff', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0',
            boxShadow: '0 2px 4px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column', gap: '8px'
          }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#1e293b' }}>{shop.name}</h3>
            <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
              <div style={{ marginBottom: '4px' }}>📍 {shop.city} / {shop.district}</div>
              <div style={{ marginBottom: '4px' }}>🏠 {shop.addressText}</div>
              <div style={{ fontWeight: 600, color: '#334155' }}>📞 {shop.phoneNumber || 'Telefon bilgisi yok'}</div>
            </div>
            <button 
              onClick={() => navigate(`/book-appointment/${shop.id}`)}
              style={{ marginTop: 'auto', width: '100%', backgroundColor: '#0f172a', color: '#fff', padding: '10px', borderRadius: '8px', border: 'none', fontWeight: 700, cursor: 'pointer' }}
            >
              Randevu Al
            </button>
          </div>
        ))}
      </div>
    </main>
  </div>
);
}