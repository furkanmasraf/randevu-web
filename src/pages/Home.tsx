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
  const [shops, setShops] = useState<Shop[]>([]); 
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCity, setSelectedCity] = useState<string>('Tümü');
  
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  useEffect(() => {
    const fetchShops = async () => {
      try {
        const response = await API.get('https://randevu-sistemi-dv33.onrender.com/api/shops');
        setShops(response.data);
      } catch (error) {
        console.error("Dükkanlar yüklenemedi:", error);
      }
    };
    fetchShops();
  }, []);

  // GÜÇLENDİRİLMİŞ FİLTRELEME:
  // Veri null gelse bile hata vermez, anlık olarak filtreler.
  const filteredShops = shops.filter((shop) => {
    const sName = (shop.name || "").toLowerCase();
    const sCity = (shop.city || "").toLowerCase();
    const query = searchQuery.toLowerCase();
    
    const cityMatches = selectedCity === "Tümü" || sCity === selectedCity.toLowerCase();
    const nameMatches = sName.includes(query);
    
    return cityMatches && nameMatches;
  });

  const handleProfileClick = () => {
    if (!token) navigate('/login');
    else navigate(role?.toUpperCase() === 'SHOP_OWNER' ? '/barber-dashboard' : '/customer-dashboard');
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.reload();
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: '"Inter", system-ui, sans-serif' }}>
      
      {/* 1. HERO ALANI */}
      <header style={{ 
        position: 'relative', height: '500px', display: 'flex', flexDirection: 'column', 
        justifyContent: 'center', alignItems: 'center', textAlign: 'center', color: '#fff',
        background: 'linear-gradient(rgba(15, 23, 42, 0.7), rgba(15, 23, 42, 0.7)), url("/kuaforsalonu.jpg")', 
        backgroundSize: 'cover', backgroundPosition: 'center'
      }}>
        <h1 style={{ fontSize: 'clamp(2.5rem, 8vw, 4rem)', fontWeight: 900, margin: 0 }}>Berber<span style={{ color: '#818cf8' }}>Lab</span></h1>
        <p style={{ fontSize: '1.2rem', marginTop: '15px', opacity: 0.9 }}>Kendinize bi güzellik yapın! Size en uygun salonlardan online randevunuzu kolayca alın.</p>

        <div style={{ position: 'absolute', top: '20px', right: '20px', display: 'flex', gap: '12px' }}>
          <button onClick={handleProfileClick} style={{ padding: '10px 20px', borderRadius: '12px', background: 'rgba(255,255,255,0.15)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)', cursor: 'pointer', fontWeight: 600 }}>👤 Profilim</button>
          {!token ? (
            <button onClick={() => navigate('/login')} style={{ padding: '10px 20px', borderRadius: '12px', background: '#6366f1', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700 }}>🔑 Giriş Yap</button>
          ) : (
            <button onClick={handleLogout} style={{ padding: '10px 20px', borderRadius: '12px', background: '#ef4444', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700 }}>🚪 Çıkış</button>
          )}
        </div>
      </header>

      {/* 2. FİLTRE ALANI */}
      <div style={{ maxWidth: '800px', margin: '-50px auto 40px auto', padding: '0 20px', zIndex: 10, position: 'relative' }}>
        <div style={{ backgroundColor: '#fff', padding: '25px', borderRadius: '20px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', display: 'flex', gap: '10px' }}>
          <input 
            type="text" 
            placeholder="Salon ara..." 
            value={searchQuery} 
            onChange={(e) => setSearchQuery(e.target.value)} 
            style={{ flex: 2, padding: '15px', borderRadius: '12px', border: '1px solid #e2e8f0' }} 
          />
          <select value={selectedCity} onChange={(e) => setSelectedCity(e.target.value)} style={{ flex: 1, padding: '15px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {/* 3. NASIL ÇALIŞIR? */}
      <section style={{ maxWidth: '1000px', margin: '60px auto', padding: '0 20px', textAlign: 'center' }}>
        <h2 style={{ fontSize: '2rem', marginBottom: '40px' }}>Nasıl Çalışır?</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '30px' }}>
          {[ {t: "Ara", d: "İhtiyacın olan hizmeti veya salonu seç."}, {t: "Seç", d: "Size en uygun zamanı ve uzmanı belirle."}, {t: "Onayla", d: "Randevun anında cebine gelsin."} ].map((item, i) => (
            <div key={i} style={{ padding: '30px', background: '#fff', borderRadius: '20px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
              <div style={{ fontSize: '2rem', marginBottom: '10px' }}>{i === 0 ? '🔍' : i === 1 ? '📅' : '✅'}</div>
              <h3>{item.t}</h3>
              <p style={{ color: '#64748b' }}>{item.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 4. DÜKKAN LİSTESİ */}
      <main style={{ maxWidth: '1000px', margin: '0 auto 60px auto', padding: '0 20px' }}>
        <h2 style={{ marginBottom: '20px' }}>Yakınınızdaki Salonlar</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
          {filteredShops.length > 0 ? (
             filteredShops.map((shop) => (
              <div key={shop.id} style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0', display: 'flex', gap: '15px' }}>
                <div style={{ width: '80px', height: '80px', backgroundColor: '#e2e8f0', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{shop.name.charAt(0)}</div>
                <div style={{ flexGrow: 1 }}>
                  <h3 style={{ margin: '0 0 5px 0' }}>{shop.name}</h3>
                  <p style={{ fontSize: '0.85rem', color: '#64748b' }}>📍 {shop.district} / {shop.city}</p>
                  <button onClick={() => navigate(`/book-appointment/${shop.id}`)} style={{ marginTop: '10px', width: '100%', padding: '8px', borderRadius: '8px', border: 'none', background: '#0f172a', color: '#fff', cursor: 'pointer' }}>Randevu Al</button>
                </div>
              </div>
            ))
          ) : (
            <p>Aradığınız kriterlerde salon bulunamadı.</p>
          )}
        </div>
      </main>

      {/* 5. İŞLETME SAHİPLERİ İÇİN */}
      <section style={{ backgroundColor: '#1e293b', color: 'white', padding: '60px 20px', textAlign: 'center', borderRadius: '24px', margin: '0 20px 40px 20px' }}>
        <h2 style={{ fontSize: '2rem' }}>Güzellik İşletmeniz mi var?</h2>
        <p style={{ margin: '15px 0 30px 0', opacity: 0.8 }}>Randevularınızı ve salonunuzu A'dan Z'ye yönetmek çok kolay! Hemen işletme hesabı oluşturun.</p>
        <button onClick={() => navigate('/register')} style={{ padding: '15px 30px', borderRadius: '12px', border: 'none', background: '#818cf8', color: 'white', fontWeight: 700, cursor: 'pointer' }}>Ücretsiz Kayıt Ol</button>
      </section>
    </div>
  );
}