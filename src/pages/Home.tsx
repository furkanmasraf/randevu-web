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
  const selectedCategory = 'Tümü';

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
    <div style={{ minHeight: '100vh', backgroundColor: '#f6f3ee', fontFamily: "'Inter', system-ui, sans-serif", paddingBottom: '80px' }}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600;700;800&display=swap');

        @keyframes heroFadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .mkl-profile-btn:hover {
          background: rgba(184, 134, 59, 0.85) !important;
          border-color: #b8863b !important;
        }

        .mkl-search-input:focus, .mkl-city-select:focus {
          outline: none;
          border-color: #b8863b !important;
          box-shadow: 0 0 0 3px rgba(184, 134, 59, 0.15);
        }

        .mkl-shop-card {
          position: relative;
          transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
        }

        .mkl-shop-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 4px;
          height: 100%;
          border-radius: 16px 0 0 16px;
          background: linear-gradient(180deg, #b8863b 0%, #b8863b 48%, #7a2e2e 52%, #7a2e2e 100%);
          opacity: 0;
          transition: opacity 0.25s ease;
        }

        .mkl-shop-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 24px -8px rgba(28, 25, 23, 0.15);
          border-color: #e0d3ba !important;
        }

        .mkl-shop-card:hover::before {
          opacity: 1;
        }

        .mkl-book-btn {
          transition: background-color 0.2s ease, transform 0.15s ease;
        }

        .mkl-book-btn:hover {
          background-color: #b8863b !important;
        }

        .mkl-book-btn:active {
          transform: scale(0.98);
        }
      `}</style>

      <header style={{
        position: 'relative',
        height: '420px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        color: '#faf7f2',
        background: 'linear-gradient(180deg, rgba(20,17,15,0.55) 0%, rgba(20,17,15,0.78) 100%), url("/kuaforsalonu.jpg")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        overflow: 'hidden'
      }}>
        <div style={{ animation: 'heroFadeUp 0.7s ease-out both' }}>
          <div style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: '0.72rem',
            fontWeight: 700,
            letterSpacing: '0.28em',
            textTransform: 'uppercase',
            color: '#c9a267',
            marginBottom: '14px'
          }}>
            Kuaför &amp; Güzellik Randevu
          </div>

          <h1 style={{
            fontFamily: "'Fraunces', serif",
            fontSize: 'clamp(2.4rem, 8vw, 3.6rem)',
            fontWeight: 600,
            letterSpacing: '-0.01em',
            margin: 0,
            lineHeight: 1.05
          }}>
            Makas<span style={{ fontStyle: 'italic', color: '#c9a267' }}>Lab</span>
          </h1>

          <div style={{
            width: '64px',
            height: '3px',
            margin: '18px auto',
            borderRadius: '3px',
            background: 'linear-gradient(90deg, #b8863b 0%, #b8863b 45%, #7a2e2e 55%, #7a2e2e 100%)'
          }} />

          <p style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: '1rem',
            color: '#e7ded1',
            marginTop: '4px',
            padding: '0 20px',
            maxWidth: '480px'
          }}>
            Premium kuaför ve güzellik deneyimi, tek dokunuşla randevunuzda.
          </p>
        </div>

        <div style={{ position: 'absolute', top: '20px', right: '20px' }}>
          <button
            className="mkl-profile-btn"
            onClick={handleProfileClick}
            style={{
              padding: '10px 22px',
              borderRadius: '10px',
              border: '1px solid rgba(250,247,242,0.35)',
              background: 'rgba(250,247,242,0.1)',
              color: '#faf7f2',
              cursor: 'pointer',
              fontFamily: "'Inter', sans-serif",
              fontWeight: 600,
              fontSize: '0.88rem',
              backdropFilter: 'blur(6px)',
              transition: 'all 0.25s ease'
            }}
          >
            Profilim
          </button>
        </div>
      </header>

      <div style={{ maxWidth: '900px', margin: '-56px auto 44px auto', padding: '0 20px', position: 'relative', zIndex: 10 }}>
        <div style={{
          backgroundColor: '#fff',
          padding: '18px',
          borderRadius: '18px',
          boxShadow: '0 16px 32px -12px rgba(28, 25, 23, 0.18)',
          border: '1px solid #eee3d0',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px'
        }}>
          <div style={{ display: 'flex', flexDirection: 'row', gap: '10px' }}>
            <input
              className="mkl-search-input"
              type="text"
              placeholder="Salon ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                flex: 2,
                padding: '12px 14px',
                borderRadius: '10px',
                border: '1px solid #e4ddd2',
                fontSize: '0.92rem',
                fontFamily: "'Inter', sans-serif",
                color: '#1c1917',
                transition: 'border-color 0.2s ease'
              }}
            />
            <select
              className="mkl-city-select"
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              style={{
                flex: 1,
                padding: '12px 14px',
                borderRadius: '10px',
                border: '1px solid #e4ddd2',
                fontSize: '0.92rem',
                fontFamily: "'Inter', sans-serif",
                color: '#1c1917',
                background: '#fff',
                transition: 'border-color 0.2s ease'
              }}
            >
              {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
      </div>

      <main style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 20px' }}>
        {filteredShops.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            color: '#8a7f6e',
            fontFamily: "'Inter', sans-serif",
            fontSize: '0.95rem'
          }}>
            Aramanıza uygun salon bulunamadı.
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '18px'
          }}>
            {filteredShops.map((shop) => (
              <div
                key={shop.id}
                className="mkl-shop-card"
                style={{
                  backgroundColor: '#fff',
                  padding: '20px',
                  borderRadius: '16px',
                  border: '1px solid #ece4d5',
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: '18px'
                }}
              >
                <div style={{ width: '92px', height: '92px', flexShrink: 0 }}>
                  {shop.imageUrl && shop.imageUrl.trim() !== "" ? (
                    <img
                      src={shop.imageUrl}
                      alt={shop.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '12px' }}
                      onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    />
                  ) : (
                    <div style={{
                      width: '100%',
                      height: '100%',
                      backgroundColor: '#f6f0e4',
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#b8863b',
                      fontFamily: "'Fraunces', serif",
                      fontSize: '1.4rem'
                    }}>
                      {shop.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>

                <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '5px', minWidth: 0 }}>
                  <h3 style={{
                    margin: 0,
                    fontFamily: "'Fraunces', serif",
                    fontWeight: 600,
                    fontSize: '1.12rem',
                    color: '#1c1917'
                  }}>
                    {shop.name}
                  </h3>

                  <div style={{ fontSize: '0.85rem', color: '#78706a', fontFamily: "'Inter', sans-serif" }}>
                    <div style={{ marginBottom: '2px' }}>{shop.city} / {shop.district}</div>
                    <div style={{ marginBottom: '2px' }}>{shop.addressText}</div>
                    <div style={{ fontWeight: 600, color: '#3d3630' }}>
                      {shop.phoneNumber || 'Telefon bilgisi yok'}
                    </div>
                  </div>

                  <button
                    className="mkl-book-btn"
                    onClick={() => navigate(`/book-appointment/${shop.id}`)}
                    style={{
                      marginTop: '10px',
                      width: '100%',
                      backgroundColor: '#1c1917',
                      color: '#faf7f2',
                      padding: '10px',
                      borderRadius: '9px',
                      border: 'none',
                      fontFamily: "'Inter', sans-serif",
                      fontWeight: 700,
                      fontSize: '0.9rem',
                      cursor: 'pointer'
                    }}
                  >
                    Randevu Al
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}