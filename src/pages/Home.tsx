import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import { 
  Search, 
  MapPin, 
  Scissors, 
  User, 
  Sparkles, 
  Clock, 
  ArrowRight, 
  Building2, 
  Star,
  CheckCircle2,
  Calendar,
  Phone,
  Navigation
} from 'lucide-react';

interface Shop {
  id: number;
  name: string;
  city: string;
  district: string;
  addressText: string;
  latitude?: number;
  longitude?: number;
  subscribed: boolean;
  imageUrl?: string;
  category?: string;
  phoneNumber?: string;
  distanceKm?: number;
}

const TURKEY_CITIES = [
  "Tümü",
  "Adana", "Adıyaman", "Afyonkarahisar", "Ağrı", "Aksaray", "Amasya", "Ankara", "Antalya", "Ardahan",
  "Artvin", "Aydın", "Balıkesir", "Bartın", "Batman", "Bayburt", "Bilecik", "Bingöl", "Bitlis", "Bolu",
  "Burdur", "Bursa", "Çanakkale", "Çankırı", "Çorum", "Denizli", "Diyarbakır", "Düzce", "Edirne", "Elazığ",
  "Erzincan", "Erzurum", "Eskişehir", "Gaziantep", "Giresun", "Gümüşhane", "Hakkari", "Hatay", "Iğdır", "Isparta",
  "İstanbul", "İzmir", "Kahramanmaraş", "Karabük", "Karaman", "Kars", "Kastamonu", "Kayseri", "Kırıkkale", "Kırklareli",
  "Kırşehir", "Kilis", "Kocaeli", "Konya", "Kütahya", "Malatya", "Manisa", "Mardin", "Mersin", "Muğla",
  "Muş", "Nevşehir", "Niğde", "Ordu", "Osmaniye", "Rize", "Sakarya", "Samsun", "Siirt", "Sinop",
  "Sivas", "Şanlıurfa", "Şırnak", "Tekirdağ", "Tokat", "Trabzon", "Tunceli", "Uşak", "Van", "Yalova",
  "Yozgat", "Zonguldak"
];

const TURKEY_DISTRICTS: Record<string, string[]> = {
  "İstanbul": [
    "Tümü", "Adalar", "Arnavutköy", "Ataşehir", "Avcılar", "Bağcılar", "Bahçelievler", "Bakırköy", 
    "Başakşehir", "Bayrampaşa", "Beşiktaş", "Beykoz", "Beylikdüzü", "Beyoğlu", "Büyükçekmece", "Çatalca", 
    "Çekmeköy", "Esenler", "Esenyurt", "Eyüpsultan", "Fatih", "Gaziosmanpaşa", "Güngören", "Kadıköy", 
    "Kağıthane", "Kartal", "Küçükçekmece", "Maltepe", "Pendik", "Sancaktepe", "Sarıyer", "Silivri", 
    "Sultanbeyli", "Sultangazi", "Şile", "Şişli", "Tuzla", "Ümraniye", "Üsküdar", "Zeytinburnu"
  ],
  "Ankara": [
    "Tümü", "Akyurt", "Altındağ", "Ayaş", "Bala", "Beypazarı", "Çamlıdere", "Çankaya", "Çubuk", 
    "Elmadağ", "Etimesgut", "Evren", "Gölbaşı", "Güdül", "Haymana", "Kahramankazan", "Kalecik", 
    "Keçiören", "Kızılcahamam", "Mamak", "Nallıhan", "Polatlı", "Pursaklar", "Sincan", "Şereflikoçhisar", "Yenimahalle"
  ],
  "İzmir": [
    "Tümü", "Aliağa", "Balçova", "Bayındır", "Bayraklı", "Bergama", "Beydağ", "Bornova", "Buca", 
    "Çeşme", "Çiğli", "Dikili", "Foça", "Gaziemir", "Güzelbahçe", "Karabağlar", "Karaburun", "Karşıyaka", 
    "Kemalpaşa", "Kınık", "Kiraz", "Konak", "Menderes", "Menemen", "Narlıdere", "Ödemiş", "Seferihisar", 
    "Selçuk", "Tire", "Torbalı", "Urla"
  ],
  "Bursa": [
    "Tümü", "Büyükorhan", "Gemlik", "Gürsu", "Harmancık", "İnegöl", "İznik", "Karacabey", "Keles", 
    "Kestel", "Mudanya", "Mustafakemalpaşa", "Nilüfer", "Orhaneli", "Orhangazi", "Osmangazi", "Yenişehir", "Yıldırım"
  ],
  "Antalya": [
    "Tümü", "Akseki", "Aksu", "Alanya", "Demre", "Döşemealtı", "Elmalı", "Finike", "Gazipaşa", 
    "Gündoğmuş", "İbradı", "Kaş", "Kemer", "Kepez", "Konyaaltı", "Korkuteli", "Kumluca", "Manavgat", "Muratpaşa", "Serik"
  ],
  "Adana": [
    "Tümü", "Aladağ", "Ceyhan", "Çukurova", "Feke", "İmamoğlu", "Karaisalı", "Karataş", "Kozan", 
    "Pozantı", "Saimbeyli", "Sarıçam", "Seyhan", "Tufanbeyli", "Yumurtalık", "Yüreğir"
  ]
};

const CATEGORIES = [
  { id: 'Tümü', label: 'Tümü', icon: Scissors },
  { id: 'Erkek Kuaförü', label: 'Erkek Kuaförü', icon: User },
  { id: 'Kadın Kuaförü', label: 'Kadın Kuaförü', icon: Sparkles },
  { id: 'Güzellik Salonu', label: 'Güzellik Salonu', icon: Star },
];

function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export default function Home() {
  const navigate = useNavigate();

  const [shops, setShops] = useState<Shop[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCity, setSelectedCity] = useState<string>('Tümü');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('Tümü');
  const [selectedCategory, setSelectedCategory] = useState<string>('Tümü');
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locating, setLocating] = useState<boolean>(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');

    if (token) {
      setIsLoggedIn(true);
      if (role && role.toUpperCase() === 'SHOP_OWNER') {
        navigate('/barber-dashboard');
        return;
      }
    }

    const fetchShops = async () => {
      try {
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const response = await API.get('/api/shops', { headers });
        setShops(response.data || []);
      } catch (error) {
        console.error("Dükkanlar yüklenirken hata oluştu:", error);
      }
    };

    fetchShops();
  }, [navigate]);

  const handleFindNearMe = () => {
    if (!navigator.geolocation) {
      alert("Tarayıcınız konum servisini desteklemiyor.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setUserLocation({ lat, lng });

        const shopsWithDistance = shops.map(shop => {
          if (shop.latitude && shop.longitude) {
            const dist = calculateDistanceKm(lat, lng, shop.latitude, shop.longitude);
            return { ...shop, distanceKm: Math.round(dist * 10) / 10 };
          }
          return shop;
        });

        shopsWithDistance.sort((a, b) => (a.distanceKm || 9999) - (b.distanceKm || 9999));
        setShops(shopsWithDistance);
        setLocating(false);
      },
      (err) => {
        console.error("Konum alınamadı:", err);
        alert("Konumunuza erişilemedi. Lütfen izinleri kontrol edin.");
        setLocating(false);
      }
    );
  };

  const availableDistricts = selectedCity !== 'Tümü' && TURKEY_DISTRICTS[selectedCity] 
    ? TURKEY_DISTRICTS[selectedCity] 
    : [];

  const filteredShops = shops.filter((shop) => {
    const matchesCity = selectedCity === 'Tümü' || (shop.city && shop.city.toLowerCase() === selectedCity.toLowerCase());
    const matchesDistrict = selectedDistrict === 'Tümü' || (shop.district && shop.district.toLowerCase() === selectedDistrict.toLowerCase());

    const query = searchQuery.trim().toLowerCase();
    const matchesSearch = !query || 
      shop.name.toLowerCase().includes(query) ||
      (shop.district && shop.district.toLowerCase().includes(query)) ||
      (shop.addressText && shop.addressText.toLowerCase().includes(query)) ||
      (shop.city && shop.city.toLowerCase().includes(query));

    let matchesCategory = true;
    if (selectedCategory !== 'Tümü') {
      matchesCategory = shop.category?.toLowerCase() === selectedCategory.toLowerCase();
    }
    
    return matchesCity && matchesDistrict && matchesSearch && matchesCategory;
  });

  const handleProfileClick = () => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');

    if (!token) {
      navigate('/login');
    } else {
      if (role?.toUpperCase() === 'SHOP_OWNER') {
        navigate('/barber-dashboard');
      } else {
        navigate('/customer-dashboard');
      }
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#FAF8F5', color: '#1E1B18', display: 'flex', flexDirection: 'column', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      
      {/* HEADER / NAVIGATION */}
      <header className="glass-nav" style={{ padding: '16px 32px' }}>
        <div style={{ maxWidth: '1240px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          
          {/* Logo */}
          <div onClick={() => navigate('/')} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', flexShrink: 0 }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#C5A880" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform: 'rotate(-45deg)' }}>
              <circle cx="6" cy="6" r="3" />
              <circle cx="6" cy="18" r="3" />
              <line x1="9.8" y1="8.2" x2="21" y2="12.4" />
              <line x1="9.8" y1="15.8" x2="21" y2="12.4" />
            </svg>
            <span style={{ fontSize: '1.35rem', fontWeight: 800, color: '#1E1B18' }}>
              Makas<span style={{ color: '#A3845B', fontWeight: 700 }}>Lab</span>
            </span>
          </div>

          {/* Nav Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button 
              onClick={() => navigate('/register?role=SHOP_OWNER')} 
              className="btn-secondary nav-btn-mobile" 
              style={{ fontSize: '0.85rem', padding: '10px 14px' }}
            >
              <Building2 size={16} /> <span className="nav-btn-text-mobile">Salonunuzu Ekleyin</span>
            </button>

            <button 
              onClick={handleProfileClick} 
              className="btn-primary nav-btn-mobile" 
              style={{ fontSize: '0.85rem', padding: '10px 16px' }}
            >
              <User size={16} /> <span className="nav-btn-text-mobile">{isLoggedIn ? 'Hesabım' : 'Giriş Yap'}</span>
            </button>
          </div>

        </div>
      </header>

      {/* HERO SECTION */}
      <section className="hero-section-mobile" style={{ 
        background: 'linear-gradient(135deg, #1E1B18 0%, #322D28 100%)', 
        color: '#FAF8F5', 
        padding: '64px 24px 72px 24px', 
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ maxWidth: '960px', margin: '0 auto', position: 'relative', zIndex: 10 }}>
          
          <span style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '6px', 
            background: 'rgba(197, 168, 128, 0.15)', 
            color: '#C5A880', 
            border: '1px solid rgba(197, 168, 128, 0.3)',
            padding: '6px 14px', 
            borderRadius: '30px', 
            fontSize: '0.78rem', 
            fontWeight: 700, 
            marginBottom: '16px' 
          }}>
            <Sparkles size={14} /> Premium Kuaför ve Salon Deneyimi
          </span>

          <h1 className="hero-title-mobile" style={{ fontSize: '2.6rem', fontWeight: 800, color: '#FAF8F5', lineHeight: 1.2, marginBottom: '16px', letterSpacing: '-0.02em' }}>
            İstediğiniz Şehir ve İlçede <br />
            <span style={{ color: '#C5A880', fontWeight: 800 }}>Yakınınızdaki Kuaförü Anında Bulun</span>
          </h1>

          <p className="hero-subtitle-mobile" style={{ fontSize: '1rem', color: '#E8E2D5', maxWidth: '660px', margin: '0 auto 32px auto', lineHeight: 1.5, fontWeight: 500 }}>
            Şehir ve ilçe seçerek veya konumunuzu kullanarak etrafınızdaki en seçkin salonları görün.
          </p>

          {/* SEARCH & FILTER BAR WITH RESPONSIVE FLEX/GRID */}
          <div className="search-container-mobile" style={{ 
            background: '#FFFFFF', 
            padding: '10px', 
            borderRadius: '20px', 
            display: 'flex', 
            gap: '8px', 
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.25)', 
            maxWidth: '920px',
            margin: '0 auto',
            border: '1px solid rgba(197, 168, 128, 0.3)'
          }}>
            {/* Search Input */}
            <div className="search-item-mobile" style={{ flex: '2 1 200px', display: 'flex', alignItems: 'center', position: 'relative' }}>
              <Search size={18} color="#A3845B" style={{ position: 'absolute', left: '14px' }} />
              <input
                type="text"
                placeholder="Salon adı, ilçe veya adres..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{ 
                  width: '100%', 
                  paddingLeft: '42px', 
                  border: 'none', 
                  fontSize: '0.92rem',
                  background: 'transparent',
                  color: '#1E1B18'
                }}
              />
            </div>

            {/* City Selector */}
            <div className="search-item-mobile" style={{ flex: '1 1 130px', display: 'flex', alignItems: 'center', position: 'relative' }}>
              <MapPin size={18} color="#A3845B" style={{ position: 'absolute', left: '10px' }} />
              <select
                value={selectedCity}
                onChange={e => {
                  setSelectedCity(e.target.value);
                  setSelectedDistrict('Tümü');
                }}
                style={{ 
                  width: '100%', 
                  paddingLeft: '34px', 
                  border: 'none', 
                  background: '#FAF8F5',
                  fontSize: '0.88rem',
                  fontWeight: 600,
                  color: '#1E1B18',
                  cursor: 'pointer'
                }}
              >
                {TURKEY_CITIES.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>

            {/* District Selector */}
            {availableDistricts.length > 0 && (
              <div className="search-item-mobile" style={{ flex: '1 1 130px', display: 'flex', alignItems: 'center', position: 'relative' }}>
                <MapPin size={18} color="#A3845B" style={{ position: 'absolute', left: '10px' }} />
                <select
                  value={selectedDistrict}
                  onChange={e => setSelectedDistrict(e.target.value)}
                  style={{ 
                    width: '100%', 
                    paddingLeft: '34px', 
                    border: 'none', 
                    background: '#FAF8F5',
                    fontSize: '0.88rem',
                    fontWeight: 600,
                    color: '#1E1B18',
                    cursor: 'pointer'
                  }}
                >
                  {availableDistricts.map(dist => (
                    <option key={dist} value={dist}>{dist === 'Tümü' ? `Tüm İlçeler` : dist}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Find Near Me Geolocation Button */}
            <button
              onClick={handleFindNearMe}
              disabled={locating}
              className="btn-secondary search-item-mobile"
              title="Mevcut konumunuza göre en yakın salonları sıralayın"
              style={{ padding: '12px 16px', fontSize: '0.85rem' }}
            >
              <Navigation size={16} color="#A3845B" /> {locating ? 'Konum Alınıyor...' : 'Yakınımda Bul'}
            </button>

            {/* Search Button */}
            <button className="btn-primary search-item-mobile" style={{ padding: '12px 24px' }}>
              Salon Bul <ArrowRight size={16} />
            </button>
          </div>

          {userLocation && (
            <div style={{ marginTop: '16px', fontSize: '0.85rem', color: '#C5A880', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
              <Navigation size={14} /> Konumunuza göre yakınlıklara göre sıralandı
            </div>
          )}

        </div>
      </section>

      {/* CATEGORY SELECTOR & MAIN CONTENT */}
      <main className="main-content-mobile" style={{ maxWidth: '1240px', width: '100%', margin: '0 auto', padding: '48px 24px 80px 24px' }}>
        
        {/* Category Filter Pills */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '32px' }}>
          {CATEGORIES.map(cat => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '12px',
                  border: isSelected ? '2px solid #1E1B18' : '1px solid rgba(197, 168, 128, 0.3)',
                  background: isSelected ? '#1E1B18' : '#FFFFFF',
                  color: isSelected ? '#C5A880' : '#8C8276',
                  fontWeight: isSelected ? 700 : 600,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.2s ease'
                }}
              >
                <Icon size={15} color={isSelected ? '#C5A880' : '#8C8276'} />
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Section Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '24px' }}>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1E1B18', margin: 0 }}>
              {selectedCategory === 'Tümü' ? 'Öne Çıkan Salonlar' : selectedCategory}
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#8C8276', marginTop: '4px' }}>
              {selectedCity !== 'Tümü' ? `${selectedCity} ${selectedDistrict !== 'Tümü' ? `/ ${selectedDistrict}` : ''} konumunda ` : ''}
              Toplam {filteredShops.length} işletme listeleniyor
            </p>
          </div>
        </div>

        {/* SALON CARDS GRID */}
        {filteredShops.length === 0 ? (
          <div style={{ background: '#FFFFFF', padding: '48px 24px', borderRadius: '20px', textAlign: 'center', border: '1px solid rgba(197, 168, 128, 0.3)', color: '#8C8276' }}>
            <Building2 size={40} color="#A3845B" style={{ margin: '0 auto 14px' }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1E1B18', marginBottom: '6px' }}>Aradığınız Kriterlerde Salon Bulunamadı</h3>
            <p style={{ fontSize: '0.88rem', color: '#8C8276' }}>Lütfen ilçe veya şehir aramasını değiştirip tekrar deneyin.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
            {filteredShops.map(shop => (
              <div 
                key={shop.id}
                className="card-hover"
                style={{
                  background: '#FFFFFF',
                  borderRadius: '20px',
                  border: '1.5px solid rgba(232, 226, 213, 0.8)',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
              >
                {/* Shop Image Header */}
                <div style={{ height: '180px', position: 'relative', overflow: 'hidden', background: '#FAF8F5' }}>
                  <img 
                    src={shop.imageUrl || '/kuaforsalonu.jpg'} 
                    alt={shop.name} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  {shop.distanceKm !== undefined && (
                    <div style={{ position: 'absolute', top: '12px', left: '12px', background: 'rgba(30, 27, 24, 0.85)', color: '#C5A880', backdropFilter: 'blur(4px)', padding: '4px 10px', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Navigation size={12} /> {shop.distanceKm} km yakınınızda
                    </div>
                  )}
                  {shop.category && (
                    <div style={{ position: 'absolute', top: '12px', right: '12px', background: '#FFFFFF', color: '#1E1B18', padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, border: '1px solid rgba(197, 168, 128, 0.3)' }}>
                      {shop.category}
                    </div>
                  )}
                </div>

                {/* Shop Content */}
                <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#1E1B18', marginBottom: '8px' }}>
                      {shop.name}
                    </h3>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.88rem', color: '#8C8276', marginBottom: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <MapPin size={15} color="#A3845B" />
                        <span style={{ fontWeight: 600, color: '#1E1B18' }}>
                          {shop.district ? `${shop.district}, ` : ''}{shop.city}
                        </span>
                      </div>
                      {shop.addressText && (
                        <div style={{ fontSize: '0.82rem', color: '#8C8276', paddingLeft: '21px' }}>
                          {shop.addressText}
                        </div>
                      )}
                      {shop.phoneNumber && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                          <Phone size={15} color="#A3845B" />
                          <span>{shop.phoneNumber}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => navigate(`/book-appointment/${shop.id}`)}
                    className="btn-primary"
                    style={{ width: '100%', padding: '12px' }}
                  >
                    <Calendar size={16} /> Randevu Al
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* WHY US SECTION */}
        <section style={{ marginTop: '72px', borderTop: '1px solid rgba(197, 168, 128, 0.2)', paddingTop: '48px' }}>
          <div style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto 36px auto' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#A3845B', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              NEDEN MAKASLAB?
            </span>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#1E1B18', marginTop: '6px' }}>
              Randevu Almanın En Kolay ve Güvenli Yolu
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
            <div style={{ background: '#FFFFFF', padding: '24px 20px', borderRadius: '20px', border: '1.5px solid rgba(232, 226, 213, 0.8)', textAlign: 'center' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(197, 168, 128, 0.1)', color: '#A3845B', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                <Clock size={22} />
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1E1B18', marginBottom: '6px' }}>7/24 Anında Onaylı Randevu</h3>
              <p style={{ fontSize: '0.85rem', color: '#8C8276', lineHeight: 1.5 }}>Telefonla aramaya son. Müsait saatleri canlı görün ve saniyeler içinde randevunuzu tamamlayın.</p>
            </div>

            <div style={{ background: '#FFFFFF', padding: '24px 20px', borderRadius: '20px', border: '1.5px solid rgba(232, 226, 213, 0.8)', textAlign: 'center' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(197, 168, 128, 0.1)', color: '#A3845B', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                <CheckCircle2 size={22} />
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1E1B18', marginBottom: '6px' }}>Şeffaf Fiyat ve Hizmetler</h3>
              <p style={{ fontSize: '0.85rem', color: '#8C8276', lineHeight: 1.5 }}>Sürpriz ücretlerle karşılaşmayın. Salonların sunduğu hizmetlerin fiyatını ve süresini önceden görün.</p>
            </div>

            <div style={{ background: '#FFFFFF', padding: '24px 20px', borderRadius: '20px', border: '1.5px solid rgba(232, 226, 213, 0.8)', textAlign: 'center' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(197, 168, 128, 0.1)', color: '#A3845B', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                <Star size={22} />
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1E1B18', marginBottom: '6px' }}>Gerçek Müşteri Yorumları</h3>
              <p style={{ fontSize: '0.85rem', color: '#8C8276', lineHeight: 1.5 }}>Sadece randevusunu tamamlayan gerçek müşterilerin değerlendirmelerini ve puanlarını inceleyin.</p>
            </div>
          </div>
        </section>

        {/* PARTNER CTA BANNER */}
        <section className="partner-banner-mobile" style={{ 
          marginTop: '64px', 
          background: '#1E1B18', 
          borderRadius: '24px', 
          padding: '40px 32px', 
          color: '#FAF8F5',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '20px',
          border: '1px solid rgba(197, 168, 128, 0.2)'
        }}>
          <div>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#C5A880', textTransform: 'uppercase', letterSpacing: '0.08em' }}>SALON SAHİPLERİ İÇİN</span>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#FAF8F5', marginTop: '6px', marginBottom: '8px' }}>
              Salonunuzu MakasLab'e Ekleyin, Müşterilerinizi Büyütün
            </h2>
            <p style={{ fontSize: '0.9rem', color: '#E8E2D5', maxWidth: '540px', fontWeight: 500 }}>
              Randevu takibini dijitalleştirin, boş koltuk kalmasın. Ücretsiz işletme profilinizi hemen oluşturun.
            </p>
          </div>

          <button 
            onClick={() => navigate('/register?role=SHOP_OWNER')}
            className="btn-accent"
            style={{ padding: '14px 28px', fontSize: '0.95rem' }}
          >
            <Building2 size={18} /> Ücretsiz Başlayın
          </button>
        </section>

      </main>

      {/* FOOTER */}
      <footer style={{ background: '#FFFFFF', borderTop: '1px solid rgba(197, 168, 128, 0.2)', padding: '32px 24px', marginTop: 'auto' }}>
        <div style={{ maxWidth: '1240px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C5A880" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform: 'rotate(-45deg)' }}>
              <circle cx="6" cy="6" r="3" />
              <circle cx="6" cy="18" r="3" />
              <line x1="9.8" y1="8.2" x2="21" y2="12.4" />
              <line x1="9.8" y1="15.8" x2="21" y2="12.4" />
            </svg>
            <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1E1B18' }}>
              Makas<span style={{ color: '#A3845B', fontWeight: 700 }}>Lab</span>
            </span>
          </div>

          <p style={{ fontSize: '0.82rem', color: '#8C8276' }}>
            © 2026 MakasLab Inc. Tüm hakları saklıdır. Kuaför ve Salon Yönetim Platformu.
          </p>

        </div>
      </footer>

    </div>
  );
}