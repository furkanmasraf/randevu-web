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
  imageUrl?: string;
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
  
  // 1. Sadece Dükkan Sahibi ise onu dashboard'una gönder
  // Müşteri veya ziyaretçi ana sayfada kalabilir.
  if (token && role && role.toUpperCase() === 'SHOP_OWNER') {
    navigate('/barber-dashboard');
    return;
  }

  // 2. Dükkanları çekmek için artık zorunlu bir token yok.
  // Eğer API'n dışarıya açıksa, token göndermene gerek kalmaz.
  const fetchShops = async () => {
    try {
      // Not: Eğer backend'de /api/shops endpoint'i için Authorization şartsa 
      // bu isteği `token` varsa ekleyerek yapabilirsin.
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      const response = await API.get('https://randevu-sistemi-dv33.onrender.com/api/shops', {
        headers: headers
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

  const handleProfileClick = () => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  if (!token) {
    // Giriş yapmamışsa login'e at
    navigate('/login');
  } else {
    // Rol kontrolü yap ve ilgili dashboard'a yönlendir
    // role bilgisini 'CUSTOMER' veya 'SHOP_OWNER' şeklinde tuttuğunu varsayıyorum
    if (role?.toUpperCase() === 'SHOP_OWNER') {
      navigate('/barber-dashboard');
    } else {
      navigate('/customer-dashboard');
    }
  }
};

  return (
  <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: '"Inter", system-ui, sans-serif', paddingBottom: '80px' }}>
    
    {/* 1.(Responsive Görsel) */}
    <header style={{ 
  position: 'relative', 
  height: '400px', 
  display: 'flex', 
  flexDirection: 'column', 
  justifyContent: 'center', 
  alignItems: 'center', 
  textAlign: 'center', 
  color: '#fff',
  background: 'linear-gradient(rgba(15, 23, 42, 0.5), rgba(15, 23, 42, 0.5)), url("/kuaforsalonu.jpg")', 
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  backgroundRepeat: 'no-repeat'
}}>
  <h1 style={{ fontSize: 'clamp(2rem, 8vw, 3rem)', fontWeight: 900, margin: 0 }}>Makas<span style={{ color: '#818cf8' }}>Lab</span></h1>
  <p style={{ fontSize: '1rem', opacity: 0.9, marginTop: '10px', padding: '0 20px' }}>Premium kuaför ve güzellik deneyimi dijital dünyada.</p>

  {/* SADECE PROFİLİM BUTONU - ÇIKIŞ BUTONU KALDIRILDI */}
  <div style={{ position: 'absolute', top: '20px', right: '20px' }}>
    <button 
      onClick={handleProfileClick}
      style={{ 
        padding: '10px 24px', 
        borderRadius: '12px', 
        border: '1px solid rgba(255,255,255,0.3)', 
        background: 'rgba(255,255,255,0.15)', 
        color: '#fff', 
        cursor: 'pointer', 
        fontWeight: 600,
        fontSize: '0.9rem',
        backdropFilter: 'blur(5px)',
        transition: 'all 0.3s ease'
      }}
    >
      👤 Profilim
    </button>
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
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', 
    gap: '20px' 
  }}>
    {filteredShops.map((shop) => (
      <div key={shop.id} style={{ 
        backgroundColor: '#fff', 
        padding: '20px', 
        borderRadius: '16px', 
        border: '1px solid #e2e8f0',
        boxShadow: '0 2px 4px rgba(0,0,0,0.02)', 
        display: 'flex', 
        flexDirection: 'row', // Yatay düzen için row
        alignItems: 'center', 
        gap: '20px' 
      }}>
        
        {/* SOL TARAF: KÜÇÜK LOGO ALANI */}
        <div style={{ width: '100px', height: '100px', flexShrink: 0 }}>
         {shop.imageUrl && shop.imageUrl.trim() !== "" ? (
          <img 
            // Cloudinary linkini olduğu gibi kullanıyoruz (Render linki ekleme!)
            src={shop.imageUrl}
            alt={shop.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '12px' }}
            // Eğer resim yüklenemezse tekrar tekrar istek atmasın diye 'onError' içine boş fonksiyon yazıyoruz
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
        ) : (
        // Resim yoksa yer tutucu gösteriyoruz
        <div style={{ width: '100%', height: '100%', backgroundColor: '#f0f0f0', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
         Logo
        </div>
        )}
        </div>

        {/* SAĞ TARAF: DÜKKAN BİLGİLERİ */}
        <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#1e293b' }}>{shop.name}</h3>
          <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
            <div style={{ marginBottom: '2px' }}>📍 {shop.city} / {shop.district}</div>
            <div style={{ marginBottom: '2px' }}>🏠 {shop.addressText}</div>
            <div style={{ fontWeight: 600, color: '#334155' }}>📞 {shop.phoneNumber || 'Telefon bilgisi yok'}</div>
          </div>
          <button 
            onClick={() => navigate(`/book-appointment/${shop.id}`)}
            style={{ 
              marginTop: '10px', 
              width: '100%', 
              backgroundColor: '#0f172a', 
              color: '#fff', 
              padding: '8px', 
              borderRadius: '8px', 
              border: 'none', 
              fontWeight: 700, 
              cursor: 'pointer' 
            }}
          >
            Randevu Al
          </button>
        </div>
        
      </div>
    ))}
  </div>
</main>
  </div>
);
}