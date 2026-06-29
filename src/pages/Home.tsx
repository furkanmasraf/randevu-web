import { useState, useEffect, ChangeEvent } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Rota geçişi için import eklendi

// Backend'deki güncel ShopDTO veri yapısı ile harfi harfine eşitlendi
interface Shop {
  id: number;
  name: string;
  city: string;
  district: string;
  addressText: string;
  latitude: number;
  longitude: number;
  subscribed: boolean;
  category?: string; // İleride backend modeline eklenirse kullanılmak üzere opsiyonel
}

const CITIES = ["Tümü", "İstanbul", "Ankara", "İzmir", "Bursa", "Antalya"];
const CATEGORIES = ["Tümü", "Erkek Kuaförü", "Kadın Kuaförü", "Güzellik Salonu"];

export default function Home() {
  const navigate = useNavigate(); // useNavigate hook'u tanımlandı

  // 1. Durum (State) Yönetimleri
  const [shops, setShops] = useState<Shop[]>([]); 
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCity, setSelectedCity] = useState<string>('Tümü');
  const [selectedCategory, setSelectedCategory] = useState<string>('Tümü');

  // 2. Sayfa Açıldığında Verileri Backend'den Çekme
  useEffect(() => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      window.location.href = '/login';
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
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/login';
  };

  // 3. Çoklu Filtreleme Mantığı (Arama + Konum + Kategori)
  const filteredShops = shops.filter((shop) => {
    // Şehir Filtresi
    const matchesCity = selectedCity === 'Tümü' || shop.city.toLowerCase() === selectedCity.toLowerCase();

    // Arama Kutusu Filtresi (Salon Adı)
    const matchesSearch = shop.name.toLowerCase().includes(searchQuery.toLowerCase());

    // Kategori Filtresi: Eğer dükkanın adında "erkek", "kadın" veya "güzellik" geçiyorsa buna göre akıllı filtreleme yapar
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
    <div style={{ maxWidth: '1200px', margin: '40px auto', padding: '0 20px', fontFamily: 'system-ui, sans-serif' }}>
      
      {/* ÜST BAŞLIK ALANI */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        backgroundColor: '#fff', 
        padding: '24px 32px', 
        borderRadius: '16px', 
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        marginBottom: '24px'
      }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 700, color: '#111827' }}>Mevcut Berberler & Kuaförler</h1>
          <p style={{ margin: '4px 0 0 0', color: '#6b7280', fontSize: '0.95rem' }}>Size en uygun salonu seçip hemen randevunuzu planlayın.</p>
        </div>
        
        <button 
          onClick={handleLogout}
          style={{ backgroundColor: '#111827', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: '10px', fontWeight: 600, cursor: 'pointer', fontSize: '0.95rem' }}
        >
          Çıkış Yap
        </button>
      </div>

      {/* ARAMA VE FİLTRELEME ALANI */}
      <div style={{ 
        backgroundColor: '#fff', 
        padding: '20px 32px', 
        borderRadius: '16px', 
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        marginBottom: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ flex: 2, minWidth: '250px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#4b5563' }}>Salon Adı</label>
            <input 
              type="text"
              placeholder="Salon adı ile ara..."
              value={searchQuery}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
              style={{ padding: '12px 16px', borderRadius: '10px', border: '1px solid #d1d5db', outline: 'none', fontSize: '0.95rem' }}
            />
          </div>

          <div style={{ flex: 1, minWidth: '150px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#4b5563' }}>Konum</label>
            <select 
              value={selectedCity}
              onChange={(e: ChangeEvent<HTMLSelectElement>) => setSelectedCity(e.target.value)}
              style={{ padding: '12px 16px', borderRadius: '10px', border: '1px solid #d1d5db', outline: 'none', fontSize: '0.95rem', backgroundColor: '#fff' }}
            >
              {CITIES.map(city => <option key={city} value={city}>{city}</option>)}
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', paddingTop: '8px', borderTop: '1px solid #f3f4f6' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#4b5563' }}>Kategori:</span>
          <div style={{ display: 'flex', gap: '8px' }}>
            {CATEGORIES.map(category => {
              const isSelected = selectedCategory === category;
              return (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '20px',
                    border: isSelected ? '1px solid #111827' : '1px solid #e5e7eb',
                    backgroundColor: isSelected ? '#111827' : '#f9fafb',
                    color: isSelected ? '#fff' : '#4b5563',
                    fontWeight: 500,
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  {category}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* DÜKKAN LİSTELEME VE KART ALANI */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>Veriler yükleniyor...</div>
      ) : filteredShops.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
          {filteredShops.map((shop) => (
            <div 
              key={shop.id} 
              style={{ 
                backgroundColor: '#fff', 
                borderRadius: '16px', 
                padding: '24px', 
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03)',
                border: '1px solid #f3f4f6',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <span style={{ backgroundColor: '#eff6ff', color: '#1d4ed8', padding: '4px 12px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600, display: 'inline-block', marginBottom: '12px' }}>
                  {shop.name.toLowerCase().includes("erkek") ? "Erkek Kuaförü" : shop.name.toLowerCase().includes("kadın") ? "Kadın Kuaförü" : "Güzellik Salonu"}
                </span>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '1.25rem', fontWeight: 600, color: '#111827' }}>
                  {shop.name}
                </h3>
                <p style={{ margin: '0 0 16px 0', fontSize: '0.875rem', color: '#6b7280', lineHeight: '1.4' }}>
                  📍 {shop.city} / {shop.district} <br />
                  <span style={{ fontSize: '0.8rem', color: '#9ca3af' }}>{shop.addressText}</span>
                </p>
              </div>

              {/* Buton tıklama olayı dinamik yönlendirme yapacak şekilde güncellendi */}
              <button 
                onClick={() => navigate(`/book-appointment/${shop.id}`)}
                style={{ 
                  width: '100%', 
                  backgroundColor: '#111827', 
                  color: '#fff', 
                  border: 'none', 
                  padding: '10px 0', 
                  borderRadius: '8px', 
                  fontWeight: 600, 
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  transition: 'background-color 0.2s'
                }}
              >
                Randevu Al
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ 
          backgroundColor: '#fff', 
          padding: '40px', 
          borderRadius: '16px', 
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          textAlign: 'center',
          color: '#9ca3af',
          fontSize: '1rem',
          fontStyle: 'italic'
        }}>
          Arama kriterlerine uygun dükkan bulunamadı...
        </div>
      )}
    </div>
  );
}