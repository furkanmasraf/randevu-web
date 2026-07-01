import { useState, useEffect, ChangeEvent } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

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
}

const CITIES = ["Tümü", "İstanbul", "Ankara", "İzmir", "Bursa", "Antalya"];
const CATEGORIES = ["Tümü", "Erkek Kuaförü", "Kadın Kuaförü", "Güzellik Salonu"];

export default function Home() {
  const navigate = useNavigate();

  // Durum (State) Yönetimleri
  const [shops, setShops] = useState<Shop[]>([]); 
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCity, setSelectedCity] = useState<string>('Tümü');
  const [selectedCategory, setSelectedCategory] = useState<string>('Tümü');

  // Etkileşim Takipleri İçin Hover State'leri
  const [hoveredCardId, setHoveredCardId] = useState<number | null>(null);
  const [hoveredBtn, setHoveredBtn] = useState<string | null>(null);

  const firstName = localStorage.getItem('firstName') || 'Kullanıcı';
  const lastName = localStorage.getItem('lastName') || '';

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
        setLoading(true);
        const response = await axios.get('http://localhost:8080/api/shops', {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        setShops(response.data);
      } catch (error) {
        console.error("Dükkanlar yüklenirken hata oluştu:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchShops();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

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
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', paddingBottom: '60px', fontFamily: '"Inter", system-ui, sans-serif' }}>
      
      {/* 🌟 ÜST BAŞLIK VE ELİT NAVİGASYON BARI */}
      <div style={{ backgroundColor: '#0f172a', color: '#ffffff', padding: '20px 0', marginBottom: '40px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.025em' }}>
              Makas<span style={{ color: '#818cf8' }}>Lab</span> Müşteri Paneli
            </h1>
            <p style={{ margin: '4px 0 0 0', color: '#94a3b8', fontSize: '0.85rem' }}>Hoş geldin, {firstName} {lastName} ✨</p>
          </div>
          
          <div style={{ display: 'flex', gap: '12px' }}>
            <button 
              onClick={() => navigate('/my-appointments')}
              onMouseEnter={() => setHoveredBtn('appointments')}
              onMouseLeave={() => setHoveredBtn(null)}
              style={{ 
                backgroundColor: hoveredBtn === 'appointments' ? '#334155' : '#1e293b', 
                color: '#f8fafc', 
                border: '1px solid #334155', 
                padding: '10px 20px', 
                borderRadius: '10px', 
                fontWeight: 600, 
                cursor: 'pointer', 
                fontSize: '0.9rem',
                transition: 'all 0.2s ease-in-out'
              }}
            >
              👤 Profilim
            </button>

            <button 
              onClick={handleLogout}
              onMouseEnter={() => setHoveredBtn('logout')}
              onMouseLeave={() => setHoveredBtn(null)}
              style={{ 
                backgroundColor: hoveredBtn === 'logout' ? '#dc2626' : '#ef4444', 
                color: '#fff', 
                border: 'none', 
                padding: '10px 20px', 
                borderRadius: '10px', 
                fontWeight: 600, 
                cursor: 'pointer', 
                fontSize: '0.9rem',
                transition: 'all 0.2s ease-in-out'
              }}
            >
              Çıkış Yap
            </button>
          </div>
        </div>
      </div>

      {/* ANA İÇERİK ALANI */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
        
        {/* 🔍 PREMIUM FILTRELEME ALANI */}
        <div style={{ 
          backgroundColor: '#ffffff', 
          padding: '24px 32px', 
          borderRadius: '20px', 
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.02), 0 8px 10px -6px rgba(0, 0, 0, 0.02)',
          border: '1px solid #e2e8f0',
          marginBottom: '32px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px'
        }}>
          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
            <div style={{ flex: 2, minWidth: '280px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#475569', letterSpacing: '0.05em' }}>SALON ARA</label>
              <input 
                type="text"
                placeholder="Kuaför salonu veya anahtar kelime yazın..."
                value={searchQuery}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                style={{ padding: '14px 16px', borderRadius: '12px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '0.95rem', backgroundColor: '#f8fafc', transition: 'all 0.2s' }}
              />
            </div>

            <div style={{ flex: 1, minWidth: '180px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#475569', letterSpacing: '0.05em' }}>KONUM SEÇ</label>
              <select 
                value={selectedCity}
                onChange={(e: ChangeEvent<HTMLSelectElement>) => setSelectedCity(e.target.value)}
                style={{ padding: '14px 16px', borderRadius: '12px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '0.95rem', backgroundColor: '#f8fafc', color: '#334155', cursor: 'pointer' }}
              >
                {CITIES.map(city => <option key={city} value={city}>{city}</option>)}
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap', paddingTop: '16px', borderTop: '1px solid #f1f5f9' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#475569', letterSpacing: '0.05em' }}>KATEGORİLER:</span>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {CATEGORIES.map(category => {
                const isSelected = selectedCategory === category;
                return (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    style={{
                      padding: '10px 20px',
                      borderRadius: '24px',
                      border: isSelected ? '1px solid #6366f1' : '1px solid #e2e8f0',
                      backgroundColor: isSelected ? '#6366f1' : '#ffffff',
                      color: isSelected ? '#ffffff' : '#64748b',
                      fontWeight: 600,
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      boxShadow: isSelected ? '0 4px 12px rgba(99, 102, 241, 0.25)' : 'none',
                      transition: 'all 0.2s ease-in-out'
                    }}
                  >
                    {category}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* 💈 DÜKKAN LİSTELEME VE KART ALANI */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#64748b', fontSize: '1.1rem', fontWeight: 500 }}>Salonlar lüks deneyime hazırlanıyor...</div>
        ) : filteredShops.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '30px' }}>
            {filteredShops.map((shop) => {
              const isCardHovered = hoveredCardId === shop.id;
              const isErkek = shop.name.toLowerCase().includes("erkek");
              const isKadin = shop.name.toLowerCase().includes("kadın") || shop.name.toLowerCase().includes("bayan");
              
              return (
                <div 
                  key={shop.id} 
                  onMouseEnter={() => setHoveredCardId(shop.id)}
                  onMouseLeave={() => setHoveredCardId(null)}
                  style={{ 
                    backgroundColor: '#ffffff', 
                    borderRadius: '20px', 
                    padding: '28px', 
                    boxShadow: isCardHovered ? '0 20px 25px -5px rgba(99, 102, 241, 0.1), 0 10px 10px -5px rgba(99, 102, 241, 0.04)' : '0 4px 6px -1px rgba(0,0,0,0.02), 0 2px 4px -1px rgba(0,0,0,0.01)',
                    border: isCardHovered ? '1px solid rgba(99, 102, 241, 0.3)' : '1px solid #e2e8f0',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    transform: isCardHovered ? 'translateY(-4px)' : 'none',
                    transition: 'all 0.25s ease-in-out',
                    cursor: 'pointer'
                  }}
                >
                  <div>
                    {/* Rozet Tasarımı */}
                    <span style={{ 
                      backgroundColor: isErkek ? '#eff6ff' : isKadin ? '#fdf2f8' : '#f0fdf4', 
                      color: isErkek ? '#1d4ed8' : isKadin ? '#db2777' : '#16a34a', 
                      padding: '6px 14px', 
                      borderRadius: '30px', 
                      fontSize: '0.75rem', 
                      fontWeight: 700, 
                      display: 'inline-block', 
                      marginBottom: '16px' 
                    }}>
                      {isErkek ? "💈 Erkek Kuaförü" : isKadin ? "✂️ Kadın Kuaförü" : "✨ Güzellik Salonu"}
                    </span>
                    
                    <h3 style={{ margin: '0 0 10px 0', fontSize: '1.35rem', fontWeight: 700, color: '#0f172a', letterSpacing: '-0.02em' }}>
                      {shop.name}
                    </h3>
                    
                    <p style={{ margin: '0 0 24px 0', fontSize: '0.9rem', color: '#64748b', lineHeight: '1.5' }}>
                      📍 <strong style={{ color: '#334155' }}>{shop.city} / {shop.district}</strong> <br />
                      <span style={{ fontSize: '0.825rem', color: '#94a3b8', marginTop: '4px', display: 'inline-block' }}>{shop.addressText}</span>
                    </p>
                  </div>

                  <button 
                    onClick={() => navigate(`/book-appointment/${shop.id}`)}
                    style={{ 
                      width: '100%', 
                      backgroundColor: isCardHovered ? '#4f46e5' : '#0f172a', 
                      color: '#ffffff', 
                      border: 'none', 
                      padding: '14px 0', 
                      borderRadius: '12px', 
                      fontWeight: 600, 
                      cursor: 'pointer',
                      fontSize: '0.95rem',
                      boxShadow: isCardHovered ? '0 10px 15px -3px rgba(79, 70, 229, 0.3)' : 'none',
                      transition: 'all 0.2s ease-in-out'
                    }}
                  >
                    Randevu Al
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ 
            backgroundColor: '#ffffff', 
            padding: '50px', 
            borderRadius: '20px', 
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)',
            border: '1px solid #e2e8f0',
            textAlign: 'center',
            color: '#94a3b8',
            fontSize: '1rem',
            fontWeight: 500
          }}>
            🔍 Arama kriterlerinize uygun lüks bir dükkan bulunamadı...
          </div>
        )}
      </div>
    </div>
  );
}