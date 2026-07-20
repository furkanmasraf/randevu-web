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

const CATEGORIES = [
  { id: 'Tümü', label: 'Tümü', icon: (active: boolean) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={active ? '#1c1917' : '#8c8276'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      <path d="M2 12h20" />
    </svg>
  )},
  { id: 'Erkek Kuaförü', label: 'Erkek Kuaförü', icon: (active: boolean) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={active ? '#1c1917' : '#8c8276'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 22V4c0-.5.2-1 .6-1.4C5 2.2 5.5 2 6 2h12c.5 0 1 .2 1.4.6.4.4.6.9.6 1.4v18" />
      <path d="M18 14H6" />
      <path d="M6 10h12" />
      <circle cx="12" cy="6" r="1" />
    </svg>
  )},
  { id: 'Kadın Kuaförü', label: 'Kadın Kuaförü', icon: (active: boolean) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={active ? '#1c1917' : '#8c8276'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22a7 7 0 0 0 7-7c0-4.3-3-7-7-7s-7 2.7-7 7a7 7 0 0 0 7 7z" />
      <path d="M12 2a5 5 0 0 0-5 5c0 1 .5 2.5 1.5 3.5" />
      <path d="M12 2a5 5 0 0 1 5 5c0 1-.5 2.5-1.5 3.5" />
      <path d="M8 14h8" />
    </svg>
  )},
  { id: 'Güzellik Salonu', label: 'Güzellik Salonu', icon: (active: boolean) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={active ? '#1c1917' : '#8c8276'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2s8 3 8 10-8 10-8 10-8-3-8-10 8-10 8-10z" />
      <path d="M12 6a3 3 0 1 0 0 6 3 3 0 0 0 0-6z" />
    </svg>
  )}
];

export default function Home() {
  const navigate = useNavigate();

  const [shops, setShops] = useState<Shop[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCity, setSelectedCity] = useState<string>('Tümü');
  const [selectedCategory, setSelectedCategory] = useState<string>('Tümü');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');

    if (token && role && role.toUpperCase() === 'SHOP_OWNER') {
      navigate('/barber-dashboard');
      return;
    }

    const fetchShops = async () => {
      try {
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
      // Backend'den gelen kategori bilgisini case-insensitive olarak kontrol ediyoruz
      matchesCategory = shop.category?.toLowerCase() === selectedCategory.toLowerCase();
    }
    
    return matchesCity && matchesSearch && matchesCategory;
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
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#FAF8F5', 
      fontFamily: "'Inter', system-ui, -apple-system, sans-serif", 
      paddingBottom: '100px',
      color: '#1E1B18'
    }}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;0,9..144,700;1,9..144,400&family=Inter:wght@300;400;500;600;700&display=swap');

        /* Custom scrollbar */
        ::-webkit-scrollbar {
          width: 8px;
        }
        ::-webkit-scrollbar-track {
          background: #FAF8F5;
        }
        ::-webkit-scrollbar-thumb {
          background: #E8E2D5;
          border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #C5A880;
        }

        /* Animations */
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(24px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes goldGlow {
          0%, 100% { box-shadow: 0 0 10px rgba(197, 168, 128, 0.2); }
          50% { box-shadow: 0 0 20px rgba(197, 168, 128, 0.45); }
        }

        .animate-fade-in {
          animation: fadeIn 0.8s ease-out forwards;
        }

        .animate-fade-up {
          animation: fadeInUp 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        /* Interactive Elements */
        .mkl-navbar {
          background: rgba(250, 248, 245, 0.8);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid rgba(197, 168, 128, 0.15);
          position: sticky;
          top: 0;
          z-index: 100;
          transition: all 0.3s ease;
        }

        .mkl-logo {
          font-family: 'Fraunces', serif;
          font-size: 1.5rem;
          font-weight: 700;
          color: #1E1B18;
          text-decoration: none;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .mkl-logo span {
          font-style: italic;
          color: #A3845B;
        }

        .mkl-nav-btn {
          padding: 8px 20px;
          border-radius: 40px;
          border: 1px solid #C5A880;
          background: transparent;
          color: #A3845B;
          font-weight: 500;
          font-size: 0.88rem;
          cursor: pointer;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .mkl-nav-btn:hover {
          background: #A3845B;
          color: #FAF8F5;
          border-color: #A3845B;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(163, 132, 91, 0.2);
        }

        .mkl-search-bar {
          background: #FFFFFF;
          border: 1px solid rgba(197, 168, 128, 0.25);
          border-radius: 24px;
          box-shadow: 0 16px 40px -10px rgba(58, 53, 48, 0.08);
          transition: all 0.3s ease;
        }

        .mkl-search-bar:focus-within {
          border-color: #A3845B;
          box-shadow: 0 16px 40px -10px rgba(163, 132, 91, 0.15);
        }

        .mkl-input-group {
          position: relative;
          display: flex;
          align-items: center;
          flex: 1;
        }

        .mkl-input-icon {
          position: absolute;
          left: 16px;
          color: #A3845B;
          display: flex;
          align-items: center;
          pointer-events: none;
        }

        .mkl-input-field {
          width: 100%;
          padding: 16px 16px 16px 44px;
          border: none;
          background: transparent;
          font-size: 0.95rem;
          color: #1E1B18;
          font-family: inherit;
        }

        .mkl-input-field:focus {
          outline: none;
        }

        .mkl-divider {
          width: 1px;
          height: 32px;
          background: rgba(197, 168, 128, 0.25);
        }

        @media (max-width: 768px) {
          .mkl-search-bar {
            flex-direction: column;
            border-radius: 20px;
            padding: 8px;
          }
          .mkl-divider {
            width: 100%;
            height: 1px;
            margin: 4px 0;
          }
          .mkl-input-field {
            padding: 12px 12px 12px 40px;
          }
          .mkl-input-icon {
            left: 12px;
          }
        }

        /* Category tabs */
        .mkl-categories-container {
          display: flex;
          justify-content: center;
          gap: 12px;
          margin-bottom: 40px;
          overflow-x: auto;
          padding: 4px;
          scrollbar-width: none; /* Firefox */
        }
        .mkl-categories-container::-webkit-scrollbar {
          display: none; /* Safari and Chrome */
        }

        .mkl-category-tab {
          padding: 10px 20px;
          border-radius: 30px;
          border: 1px solid rgba(197, 168, 128, 0.2);
          background: #FFFFFF;
          color: #8C8276;
          cursor: pointer;
          font-weight: 500;
          font-size: 0.88rem;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          white-space: nowrap;
        }

        .mkl-category-tab:hover {
          border-color: #A3845B;
          color: #A3845B;
          background: rgba(197, 168, 128, 0.05);
          transform: translateY(-1px);
        }

        .mkl-category-tab.active {
          background: #1E1B18;
          color: #FAF8F5;
          border-color: #1E1B18;
          box-shadow: 0 6px 16px rgba(30, 27, 24, 0.15);
        }

        /* Premium Shop Card */
        .mkl-card {
          background: #FFFFFF;
          border: 1px solid rgba(232, 226, 213, 0.7);
          border-radius: 24px;
          overflow: hidden;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          display: flex;
          flex-direction: column;
          position: relative;
        }

        .mkl-card:hover {
          transform: translateY(-6px);
          border-color: rgba(197, 168, 128, 0.4);
          box-shadow: 0 20px 35px -10px rgba(163, 132, 91, 0.12);
        }

        .mkl-card.premium {
          animation: goldGlow 3s infinite ease-in-out;
          border: 1.5px solid rgba(197, 168, 128, 0.5);
        }

        .mkl-card.premium::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(90deg, #C5A880, #A3845B, #C5A880);
          z-index: 5;
        }

        .mkl-image-container {
          position: relative;
          height: 200px;
          overflow: hidden;
          background: #F5F0E6;
        }

        .mkl-card-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .mkl-card:hover .mkl-card-img {
          transform: scale(1.06);
        }

        .mkl-badge-premium {
          position: absolute;
          top: 16px;
          right: 16px;
          background: linear-gradient(135deg, #1E1B18 0%, #3A3530 100%);
          color: #C5A880;
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          padding: 6px 12px;
          border-radius: 30px;
          border: 1px solid rgba(197, 168, 128, 0.3);
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
          display: flex;
          align-items: center;
          gap: 4px;
          z-index: 2;
        }

        .mkl-badge-city {
          position: absolute;
          bottom: 16px;
          left: 16px;
          background: rgba(250, 248, 245, 0.9);
          backdrop-filter: blur(8px);
          color: #1E1B18;
          font-size: 0.78rem;
          font-weight: 600;
          padding: 4px 12px;
          border-radius: 20px;
          border: 1px solid rgba(255, 255, 255, 0.4);
          z-index: 2;
        }

        .mkl-card-body {
          padding: 24px;
          display: flex;
          flex-direction: column;
          flex-grow: 1;
        }

        .mkl-card-title {
          font-family: 'Fraunces', serif;
          font-size: 1.25rem;
          font-weight: 600;
          color: #1E1B18;
          margin: 0 0 10px 0;
          line-height: 1.3;
        }

        .mkl-info-row {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          color: #8C8276;
          font-size: 0.85rem;
          margin-bottom: 8px;
          line-height: 1.4;
        }

        .mkl-info-icon {
          flex-shrink: 0;
          color: #A3845B;
          margin-top: 2px;
        }

        .mkl-card-action {
          margin-top: auto;
          padding-top: 20px;
        }

        .mkl-btn-primary {
          width: 100%;
          background: #1E1B18;
          color: #FAF8F5;
          border: 1px solid #1E1B18;
          padding: 12px;
          border-radius: 14px;
          font-weight: 600;
          font-size: 0.92rem;
          cursor: pointer;
          transition: all 0.25s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .mkl-btn-primary:hover {
          background: #A3845B;
          border-color: #A3845B;
          color: #FAF8F5;
          transform: translateY(-1px);
          box-shadow: 0 8px 20px rgba(163, 132, 91, 0.2);
        }

        .mkl-btn-primary:active {
          transform: translateY(0);
        }

        .mkl-premium-border {
          position: absolute;
          inset: 0;
          border-radius: 24px;
          pointer-events: none;
          border: 2px solid transparent;
          transition: border-color 0.3s ease;
        }

        .mkl-card.premium:hover .mkl-premium-border {
          border-color: #C5A880;
        }
      `}</style>

      {/* Modern Premium Navbar */}
      <nav className="mkl-navbar">
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '16px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <a href="#" className="mkl-logo" onClick={(e) => { e.preventDefault(); navigate('/'); }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#A3845B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform: 'rotate(-45deg)' }}>
              <circle cx="6" cy="6" r="3" />
              <circle cx="6" cy="18" r="3" />
              <line x1="9.8" y1="8.2" x2="21" y2="12.4" />
              <line x1="9.8" y1="15.8" x2="21" y2="12.4" />
            </svg>
            Makas<span>Lab</span>
          </a>

          <button className="mkl-nav-btn" onClick={handleProfileClick}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            Profilim
          </button>
        </div>
      </nav>

      {/* Hero Section - UPDATED with Unisex Salon Hero Image */}
      <header style={{
        position: 'relative',
        height: '460px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        color: '#FAF8F5',
        background: 'linear-gradient(180deg, rgba(30,27,24,0.45) 0%, rgba(30,27,24,0.85) 100%), url("/unisex_salon_hero.jpg")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'scroll',
        overflow: 'hidden',
        padding: '0 24px'
      }}>
        {/* Soft Gold Ambient Glow inside Hero */}
        <div style={{
          position: 'absolute',
          bottom: '-10%',
          width: '600px',
          height: '250px',
          background: 'radial-gradient(ellipse at center, rgba(197, 168, 128, 0.15) 0%, rgba(0,0,0,0) 70%)',
          pointerEvents: 'none'
        }} />

        <div className="animate-fade-up" style={{ zIndex: 2, maxWidth: '640px' }}>
          <div style={{
            fontSize: '0.75rem',
            fontWeight: 600,
            letterSpacing: '0.3em',
            textTransform: 'uppercase',
            color: '#C5A880',
            marginBottom: '16px'
          }}>
            Lüks &amp; Güzellik Deneyimi
          </div>

          <h1 style={{
            fontFamily: "'Fraunces', serif",
            fontSize: 'clamp(2.5rem, 7vw, 4.2rem)',
            fontWeight: 400,
            lineHeight: 1.1,
            margin: '0 0 20px 0',
            letterSpacing: '-0.02em'
          }}>
            Tarzınızı Keşfedin,<br />
            <span style={{ fontStyle: 'italic', color: '#C5A880', fontWeight: 300 }}>Kendinizi Şımartın.</span>
          </h1>

          <p style={{
            fontSize: '1.05rem',
            color: '#E8E2D5',
            lineHeight: 1.6,
            fontWeight: 300,
            margin: '0 auto',
            maxWidth: '500px'
          }}>
            Şehrin en iyi ve en seçkin kuaför salonlarından dilediğiniz saatte randevunuzu saniyeler içinde planlayın.
          </p>
        </div>
      </header>

      {/* Main Search and Layout Container */}
      <div style={{ 
        maxWidth: '1100px', 
        margin: '-60px auto 0 auto', 
        padding: '0 24px', 
        position: 'relative', 
        zIndex: 10 
      }}>
        
        {/* Search capsule */}
        <div className="mkl-search-bar animate-fade-up" style={{
          display: 'flex',
          padding: '10px',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '40px'
        }}>
          <div className="mkl-input-group">
            <span className="mkl-input-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </span>
            <input
              className="mkl-input-field"
              type="text"
              placeholder="Salon veya kuaför adı ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="mkl-divider" />

          <div className="mkl-input-group">
            <span className="mkl-input-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
            </span>
            <select
              className="mkl-input-field"
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              style={{ 
                cursor: 'pointer',
                appearance: 'none',
                WebkitAppearance: 'none'
              }}
            >
              {CITIES.map(c => (
                <option key={c} value={c} style={{ color: '#1E1B18', background: '#FAF8F5' }}>
                  {c === 'Tümü' ? 'Tüm Şehirler' : c}
                </option>
              ))}
            </select>
            {/* Custom Arrow for Select */}
            <span style={{ position: 'absolute', right: '16px', color: '#A3845B', pointerEvents: 'none', display: 'flex', alignItems: 'center' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </span>
          </div>
        </div>

        {/* Category Badges Tabs */}
        <div className="mkl-categories-container animate-fade-in">
          {CATEGORIES.map(category => {
            const isActive = selectedCategory === category.id;
            return (
              <button
                key={category.id}
                className={`mkl-category-tab ${isActive ? 'active' : ''}`}
                onClick={() => setSelectedCategory(category.id)}
              >
                {category.icon(isActive)}
                {category.label}
              </button>
            );
          })}
        </div>

        {/* Section Title */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          marginBottom: '24px',
          borderBottom: '1px solid rgba(197, 168, 128, 0.15)',
          paddingBottom: '12px'
        }}>
          <h2 style={{
            fontFamily: "'Fraunces', serif",
            fontSize: '1.75rem',
            fontWeight: 500,
            margin: 0
          }}>
            Seçkin Salonlar
          </h2>
          <span style={{ fontSize: '0.85rem', color: '#8C8276', fontWeight: 500 }}>
            {filteredShops.length} dükkan listeleniyor
          </span>
        </div>

        {/* Shops Grid */}
        <main>
          {filteredShops.length === 0 ? (
            <div className="animate-fade-in" style={{
              textAlign: 'center',
              padding: '80px 24px',
              color: '#8C8276',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '16px',
              background: '#FFFFFF',
              borderRadius: '24px',
              border: '1px dashed rgba(197, 168, 128, 0.3)'
            }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#C5A880" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="8" y1="12" x2="16" y2="12" />
              </svg>
              <div style={{ fontSize: '1.1rem', fontWeight: 500, color: '#1E1B18' }}>
                Eşleşen Salon Bulunamadı
              </div>
              <p style={{ margin: 0, fontSize: '0.88rem', maxWidth: '340px', lineHeight: 1.5 }}>
                Arama kriterlerinizi değiştirmeyi veya farklı bir filtre seçmeyi deneyebilirsiniz.
              </p>
              <button 
                onClick={() => { setSearchQuery(''); setSelectedCity('Tümü'); setSelectedCategory('Tümü'); }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#A3845B',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  marginTop: '8px'
                }}
              >
                Tüm Filtreleri Temizle
              </button>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))',
              gap: '28px'
            }}>
              {filteredShops.map((shop, index) => {
                // Determine display category based on name/category
                const displayCategory = shop.category || (
                  shop.name.toLowerCase().includes("erkek") ? "Erkek Kuaförü" :
                  (shop.name.toLowerCase().includes("kadın") || shop.name.toLowerCase().includes("bayan")) ? "Kadın Kuaförü" :
                  shop.name.toLowerCase().includes("güzellik") ? "Güzellik Salonu" : "Kuaför & Güzellik"
                );

                return (
                  <div
                    key={shop.id}
                    className={`mkl-card ${shop.subscribed ? 'premium' : ''} animate-fade-up`}
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <div className="mkl-premium-border" />
                    
                    {/* Image Area */}
                    <div className="mkl-image-container">
                      {shop.subscribed && (
                        <div className="mkl-badge-premium">
                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                          </svg>
                          Öne Çıkan
                        </div>
                      )}
                      
                      <div className="mkl-badge-city">
                        {shop.city}
                      </div>

                      {shop.imageUrl && shop.imageUrl.trim() !== "" ? (
                        <img
                          src={shop.imageUrl}
                          alt={shop.name}
                          className="mkl-card-img"
                          onError={(e) => { e.currentTarget.style.display = 'none'; }}
                        />
                      ) : (
                        <div style={{
                          width: '100%',
                          height: '100%',
                          background: 'linear-gradient(135deg, #F5F0E6 0%, #E8E2D5 100%)',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#A3845B',
                          gap: '12px'
                        }}>
                          <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.7 }}>
                            <path d="M12 22a7 7 0 0 0 7-7c0-4.3-3-7-7-7s-7 2.7-7 7a7 7 0 0 0 7 7z" />
                            <circle cx="12" cy="7" r="4" />
                          </svg>
                          <span style={{
                            fontFamily: "'Fraunces', serif",
                            fontSize: '1rem',
                            fontWeight: 500,
                            letterSpacing: '0.05em'
                          }}>
                            {shop.name.charAt(0).toUpperCase() + shop.name.slice(1, 4)}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Card Content */}
                    <div className="mkl-card-body">
                      {/* Shop Category Tag */}
                      <span style={{
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        color: '#A3845B',
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                        marginBottom: '6px',
                        display: 'inline-block'
                      }}>
                        {displayCategory}
                      </span>

                      <h3 className="mkl-card-title">
                        {shop.name}
                      </h3>

                      {/* Info lines */}
                      <div style={{ marginBottom: '16px' }}>
                        <div className="mkl-info-row">
                          <span className="mkl-info-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                              <circle cx="12" cy="10" r="3" />
                            </svg>
                          </span>
                          <span>{shop.district}, {shop.addressText}</span>
                        </div>

                        <div className="mkl-info-row">
                          <span className="mkl-info-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                            </svg>
                          </span>
                          <span style={{ fontWeight: 500, color: '#3A3530' }}>
                            {shop.phoneNumber || 'Telefon bilgisi yok'}
                          </span>
                        </div>
                      </div>

                      {/* Action Button */}
                      <div className="mkl-card-action">
                        <button
                          className="mkl-btn-primary"
                          onClick={() => navigate(`/book-appointment/${shop.id}`)}
                        >
                          Randevu Al
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="5" y1="12" x2="19" y2="12" />
                            <polyline points="12 5 19 12 12 19" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}