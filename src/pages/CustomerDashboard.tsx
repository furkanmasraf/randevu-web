import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import NotificationToast from '../components/NotificationToast';
import useNotification from '../hooks/useNotification';

interface AppointmentDTO {
  id: number;
  shopName: string;
  employeeName: string;
  serviceName: string;
  price: number;
  appointmentTime: string;
  shopAddress?: string;
  shopPhone?: string;
  status: 'PENDING' | 'APPROVED' | 'CANCELLED' | 'REJECTED';
}

export default function CustomerDashboard() {
  const [activeTab, setActiveTab] = useState<'appointments' | 'profile'>('appointments');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [appointments, setAppointments] = useState<AppointmentDTO[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    password: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { notification, showNotification } = useNotification();
  const [cancelPendingId, setCancelPendingId] = useState<number | null>(null);

  const navigate = useNavigate();
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    const role = localStorage.getItem('role');

    if (!token || !userId || role !== 'CUSTOMER') {
      navigate('/login');
      return;
    }

    const fetchAllData = async () => {
      try {
        setLoading(true);

        const appResponse = await API.get(`https://randevu-sistemi-dv33.onrender.com/api/appointments/user/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const sorted = Array.isArray(appResponse.data)
          ? [...appResponse.data].sort((a, b) => new Date(b.appointmentTime).getTime() - new Date(a.appointmentTime).getTime())
          : [];
        setAppointments(sorted);

        const userResponse = await API.get(`https://randevu-sistemi-dv33.onrender.com/api/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (userResponse.data) {
          setProfileData({
            firstName: userResponse.data.firstName || '',
            lastName: userResponse.data.lastName || '',
            email: userResponse.data.email || '',
            phoneNumber: userResponse.data.phoneNumber || '',
            password: ''
          });
        }
      } catch (error) {
        console.error("Veriler yüklenirken hata oluştu:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [navigate]);

  const requestCancel = (appointmentId: number) => {
    setCancelPendingId(appointmentId);
  };

  const handleCancel = async () => {
    if (cancelPendingId === null) return;
    const token = localStorage.getItem('token');

    try {
      await API.put(`https://randevu-sistemi-dv33.onrender.com/api/appointments/${cancelPendingId}/cancel`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setAppointments(prev =>
        prev.map(app => app.id === cancelPendingId ? { ...app, status: 'CANCELLED' } : app)
      );
      showNotification('Randevunuz başarıyla iptal edildi.', 'success');
    } catch (error) {
      console.error('Randevu iptal edilirken hata oluştu:', error);
      showNotification('Randevu iptal edilemedi.', 'error');
    } finally {
      setCancelPendingId(null);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');

    try {
      const payload: any = {
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        phoneNumber: profileData.phoneNumber
      };

      if (profileData.password.trim() !== '') {
        payload.password = profileData.password;
      }

      await API.put(`https://randevu-sistemi-dv33.onrender.com/api/users/${userId}`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showNotification('Profil bilgileriniz başarıyla güncellendi!', 'success');
    } catch (error) {
      console.error('Profil güncellenirken hata oluştu:', error);
      showNotification('Profil bilgileri güncellenemedi.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  const renderStatusBadge = (status: string) => {
    const baseStyle = { 
      padding: '6px 14px', 
      borderRadius: '8px', 
      fontSize: '0.78rem', 
      fontWeight: 700, 
      display: 'inline-flex', 
      alignItems: 'center',
      gap: '6px',
      textAlign: 'center' as const, 
      whiteSpace: 'nowrap' as const 
    };

    switch (status) {
      case 'APPROVED': 
        return (
          <span style={{ ...baseStyle, color: '#27ae60', backgroundColor: '#e8f8f0' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#27ae60' }} />
            Onaylandı
          </span>
        );
      case 'PENDING': 
        return (
          <span style={{ ...baseStyle, color: '#d35400', backgroundColor: '#fdf2e9' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#d35400' }} />
            Bekliyor
          </span>
        );
      case 'CANCELLED': 
        return (
          <span style={{ ...baseStyle, color: '#c0392b', backgroundColor: '#fdedec' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#c0392b' }} />
            İptal Edildi
          </span>
        );
      case 'REJECTED': 
        return (
          <span style={{ ...baseStyle, color: '#7f8c8d', backgroundColor: '#f2f4f4' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#7f8c8d' }} />
            Reddedildi
          </span>
        );
      default: 
        return <span style={{ ...baseStyle, color: '#78706a', backgroundColor: '#f2ede3' }}>{status}</span>;
    }
  };

  // Group appointments into upcoming and past
  const now = new Date().getTime();
  const upcomingAppointments = appointments.filter(app => {
    const time = new Date(app.appointmentTime).getTime();
    return time >= now && app.status !== 'CANCELLED' && app.status !== 'REJECTED';
  });
  
  const pastAppointments = appointments.filter(app => {
    const time = new Date(app.appointmentTime).getTime();
    return time < now || app.status === 'CANCELLED' || app.status === 'REJECTED';
  });

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh', 
        backgroundColor: '#FAF8F5', 
        color: '#A3845B', 
        fontFamily: "'Inter', sans-serif", 
        gap: '16px' 
      }}>
        <div style={{
          width: '36px',
          height: '36px',
          border: '3px solid rgba(197, 168, 128, 0.2)',
          borderTopColor: '#A3845B',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
        <span style={{ fontSize: '0.9rem', fontWeight: 500, letterSpacing: '0.05em' }}>Panel Yükleniyor...</span>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const userInitials = `${profileData.firstName.charAt(0)}${profileData.lastName.charAt(0)}`.toUpperCase();

  return (
    <div style={{ 
      display: 'flex', 
      minHeight: '100vh', 
      fontFamily: "'Inter', system-ui, -apple-system, sans-serif", 
      backgroundColor: '#FAF8F5', 
      margin: 0,
      color: '#1E1B18'
    }}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;0,9..144,700;1,9..144,400&family=Inter:wght@300;400;500;600;700&display=swap');

        /* Custom transitions */
        .mkl-side-btn {
          width: 100%;
          text-align: left;
          padding: 12px 16px;
          border-radius: 12px;
          border: none;
          background: transparent;
          color: #8C8276;
          font-weight: 500;
          font-size: 0.92rem;
          cursor: pointer;
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .mkl-side-btn:hover {
          color: #FAF8F5;
          background-color: rgba(255, 255, 255, 0.05);
        }

        .mkl-side-btn.active {
          color: #C5A880;
          background-color: rgba(197, 168, 128, 0.08);
          font-weight: 600;
        }

        .mkl-side-btn.danger {
          color: #E08B78;
          background-color: rgba(224, 139, 120, 0.08);
          margin-top: 20px;
        }

        .mkl-side-btn.danger:hover {
          background-color: rgba(224, 139, 120, 0.15);
          color: #FF9B85;
        }

        .mkl-hamburger {
          position: fixed;
          top: 20px;
          right: 20px;
          zIndex: 1100;
          width: 44px;
          height: 44px;
          display: none;
          align-items: center;
          justify-content: center;
          background-color: #1E1B18;
          color: #FAF8F5;
          border: 1px solid rgba(197, 168, 128, 0.2);
          border-radius: 12px;
          cursor: pointer;
          box-shadow: 0 4px 15px rgba(0,0,0,0.1);
          transition: all 0.25s ease;
        }

        .mkl-hamburger:hover {
          background-color: #A3845B;
          border-color: #A3845B;
        }

        .mkl-back-btn {
          background-color: #FFFFFF;
          border: 1px solid rgba(197, 168, 128, 0.25);
          padding: 10px 20px;
          border-radius: 12px;
          cursor: pointer;
          font-weight: 600;
          color: #1E1B18;
          font-size: 0.88rem;
          font-family: inherit;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.25s ease;
        }

        .mkl-back-btn:hover {
          border-color: #A3845B;
          color: #A3845B;
          background-color: rgba(197, 168, 128, 0.03);
          transform: translateY(-1px);
        }

        .mkl-appt-card {
          background: #FFFFFF;
          border-radius: 20px;
          border: 1.5px solid rgba(232, 226, 213, 0.8);
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .mkl-appt-card:hover {
          transform: translateY(-4px);
          border-color: rgba(197, 168, 128, 0.4);
          box-shadow: 0 16px 30px -10px rgba(163, 132, 91, 0.12);
        }

        .mkl-cancel-btn {
          width: 100%;
          background-color: rgba(192, 57, 43, 0.05);
          color: #c0392b;
          border: 1.5px solid rgba(192, 57, 43, 0.15);
          padding: 11px;
          border-radius: 12px;
          font-weight: 700;
          font-family: inherit;
          font-size: 0.88rem;
          cursor: pointer;
          transition: all 0.25s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }

        .mkl-cancel-btn:hover {
          background-color: #c0392b;
          border-color: #c0392b;
          color: #FAF8F5;
          box-shadow: 0 4px 12px rgba(192, 57, 43, 0.15);
        }

        .mkl-save-btn {
          width: 100%;
          background-color: #1E1B18;
          color: #FAF8F5;
          border: none;
          padding: 15px;
          border-radius: 14px;
          font-weight: 700;
          font-family: inherit;
          cursor: pointer;
          font-size: 0.95rem;
          transition: all 0.25s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .mkl-save-btn:hover:not(:disabled) {
          background-color: #A3845B;
          box-shadow: 0 8px 20px rgba(163, 132, 91, 0.2);
        }

        .mkl-save-btn:disabled {
          background-color: #E8E2D5;
          color: #8C8276;
          cursor: not-allowed;
        }

        .mkl-dashboard-input {
          width: 100%;
          padding: 12px 16px 12px 42px;
          border-radius: 12px;
          border: 1px solid rgba(197, 168, 128, 0.25);
          background-color: #FFFFFF;
          font-size: 0.95rem;
          font-family: inherit;
          color: #1E1B18;
          outline: none;
          transition: all 0.25s ease;
        }

        .mkl-dashboard-input:focus {
          border-color: #A3845B;
          box-shadow: 0 0 0 3px rgba(163, 132, 91, 0.12);
        }

        .mkl-dashboard-input:disabled {
          background-color: #FAF8F5;
          border-color: rgba(232, 226, 213, 0.6);
          color: #8C8276;
          cursor: not-allowed;
        }

        .mkl-form-group {
          position: relative;
          display: flex;
          align-items: center;
        }

        .mkl-form-icon-left {
          position: absolute;
          left: 14px;
          color: #A3845B;
          pointer-events: none;
          display: flex;
          align-items: center;
        }

        /* Responsive */
        @media (max-width: 992px) {
          .mkl-sidebar {
            display: ${isSidebarOpen ? 'flex' : 'none'} !important;
            position: fixed !important;
            top: 0;
            left: 0;
            height: 100vh;
            width: 280px !important;
            z-index: 1000;
          }
          .mkl-hamburger {
            display: flex !important;
          }
        }
      `}</style>

      {/* MOBİL HAMBURGER BUTONU */}
      <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="mkl-hamburger">
        {isSidebarOpen ? (
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        )}
      </button>

      {/* SOL SIDEBAR */}
      <div 
        className="mkl-sidebar"
        style={{
          width: '280px',
          backgroundColor: '#1E1B18',
          color: '#FAF8F5',
          padding: '32px 24px',
          display: 'flex',
          flexDirection: 'column',
          flexShrink: 0,
          borderRight: '1px solid rgba(197, 168, 128, 0.15)',
          boxShadow: '8px 0 35px rgba(0,0,0,0.08)'
        }}
      >
        {/* Brand Header */}
        <div style={{ marginBottom: '40px', paddingLeft: '8px' }}>
          <a href="#" style={{ textDecoration: 'none', color: '#FAF8F5' }} onClick={(e) => { e.preventDefault(); navigate('/'); }}>
            <h2 style={{ 
              margin: 0, 
              fontFamily: "'Fraunces', serif", 
              fontSize: '1.5rem', 
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C5A880" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform: 'rotate(-45deg)' }}>
                <circle cx="6" cy="6" r="3" />
                <circle cx="6" cy="18" r="3" />
                <line x1="9.8" y1="8.2" x2="21" y2="12.4" />
                <line x1="9.8" y1="15.8" x2="21" y2="12.4" />
              </svg>
              Makas<span style={{ fontStyle: 'italic', color: '#C5A880', fontWeight: 300 }}>Lab</span>
            </h2>
          </a>
        </div>

        {/* Sidebar Nav Links */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flexGrow: 1 }}>
          <button
            onClick={() => { setActiveTab('appointments'); setIsSidebarOpen(false); }}
            className={`mkl-side-btn ${activeTab === 'appointments' ? 'active' : ''}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            Randevularım
          </button>
          
          <button
            onClick={() => { setActiveTab('profile'); setIsSidebarOpen(false); }}
            className={`mkl-side-btn ${activeTab === 'profile' ? 'active' : ''}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            Profil Ayarlarım
          </button>
        </div>

        {/* User Card at Sidebar Bottom */}
        <div style={{
          marginTop: 'auto',
          paddingTop: '20px',
          borderTop: '1px solid rgba(197, 168, 128, 0.15)',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingLeft: '8px' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              backgroundColor: '#C5A880',
              color: '#1E1B18',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '0.85rem'
            }}>
              {userInitials}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
              <span style={{ fontSize: '0.88rem', fontWeight: 600, color: '#FAF8F5', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {profileData.firstName} {profileData.lastName}
              </span>
              <span style={{ fontSize: '0.75rem', color: '#8C8276', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {profileData.email}
              </span>
            </div>
          </div>

          <button
            onClick={() => { handleLogout(); setIsSidebarOpen(false); }}
            className="mkl-side-btn danger"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Çıkış Yap
          </button>
        </div>
      </div>

      {/* ARKA PLAN MOBİL KARARTICI */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          style={{
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
            backgroundColor: 'rgba(30,27,24,0.4)', zIndex: 900
          }}
        />
      )}

      {/* SAĞ İÇERİK ALANI */}
      <div style={{
        flex: 1,
        padding: isMobile ? '80px 20px 40px 20px' : '40px 48px',
        maxWidth: '100%',
        overflowX: 'hidden',
        boxSizing: 'border-box',
        position: 'relative'
      }}>
        <NotificationToast notification={notification} />

        {/* Welcome Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '32px',
          borderBottom: '1px solid rgba(197, 168, 128, 0.15)',
          paddingBottom: '20px',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <div>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#A3845B', textTransform: 'uppercase', letterSpacing: '0.08em' }}>MÜŞTERİ PANELİ</span>
            <h1 style={{ margin: '4px 0 0 0', fontFamily: "'Fraunces', serif", fontSize: '2.1rem', fontWeight: 400 }}>
              Merhaba, <span style={{ fontStyle: 'italic', fontWeight: 300, color: '#A3845B' }}>{profileData.firstName}</span>
            </h1>
          </div>

          <button onClick={() => navigate('/')} className="mkl-back-btn">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            Randevu Al / Ana Sayfa
          </button>
        </div>

        {/* TABS CONTAINER */}
        <div style={{
          backgroundColor: '#FFFFFF',
          padding: isMobile ? '24px 18px' : '40px',
          borderRadius: '24px',
          border: '1.5px solid rgba(232, 226, 213, 0.7)',
          boxShadow: '0 16px 30px -10px rgba(58, 53, 48, 0.05)'
        }}>

          {/* TAB 1: RANDEVULARIM */}
          {activeTab === 'appointments' && (
            <div>
              <div style={{ marginBottom: '32px' }}>
                <h2 style={{ margin: 0, fontFamily: "'Fraunces', serif", color: '#1E1B18', fontSize: '1.5rem', fontWeight: 500 }}>
                  Randevularım
                </h2>
                <p style={{ margin: '6px 0 0 0', color: '#8C8276', fontSize: '0.9rem' }}>
                  Tüm randevu geçmişinizi ve gelecek salon rezervasyonlarınızı buradan yönetebilirsiniz.
                </p>
              </div>

              {appointments.length === 0 ? (
                <div style={{ 
                  textAlign: 'center', 
                  padding: '60px 24px', 
                  color: '#8C8276', 
                  background: '#FAF8F5',
                  border: '1px dashed rgba(197, 168, 128, 0.3)',
                  borderRadius: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#C5A880" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                  <span style={{ fontWeight: 500 }}>Henüz aktif bir randevunuz bulunmamaktadır.</span>
                  <button 
                    onClick={() => navigate('/')} 
                    style={{ 
                      background: 'none', border: 'none', color: '#A3845B', fontWeight: 600, 
                      fontSize: '0.88rem', textDecoration: 'underline', cursor: 'pointer' 
                    }}
                  >
                    Şimdi bir randevu alın
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
                  
                  {/* UPCOMING APPOINTMENTS SECTION */}
                  {upcomingAppointments.length > 0 && (
                    <div>
                      <h3 style={{ 
                        fontFamily: "'Fraunces', serif", fontSize: '1.2rem', fontWeight: 500, 
                        marginBottom: '16px', borderBottom: '1px solid rgba(197, 168, 128, 0.15)', 
                        paddingBottom: '8px', color: '#A3845B' 
                      }}>
                        Yaklaşan Randevular
                      </h3>
                      
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                        gap: '24px'
                      }}>
                        {upcomingAppointments.map((app) => (
                          <div key={app.id} className="mkl-appt-card">
                            
                            {/* Card Header */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' }}>
                              <div>
                                <h4 style={{ margin: 0, fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: '1.15rem', color: '#1E1B18' }}>
                                  {app.shopName}
                                </h4>
                                <span style={{ fontSize: '0.78rem', color: '#8C8276', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="10" />
                                    <polyline points="12 6 12 12 16 14" />
                                  </svg>
                                  {new Date(app.appointmentTime).toLocaleString('tr-TR', { dateStyle: 'long', timeStyle: 'short' })}
                                </span>
                              </div>
                              {renderStatusBadge(app.status)}
                            </div>

                            {/* Details List */}
                            <div style={{ fontSize: '0.85rem', color: '#3A3530', display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '1px solid rgba(197, 168, 128, 0.1)', paddingTop: '12px' }}>
                              {app.shopAddress && (
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', color: '#8C8276' }}>
                                  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: '2px' }}>
                                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                                    <circle cx="12" cy="10" r="3" />
                                  </svg>
                                  <span>{app.shopAddress}</span>
                                </div>
                              )}
                              
                              {app.shopPhone && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#8C8276' }}>
                                  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                                  </svg>
                                  <span>{app.shopPhone}</span>
                                </div>
                              )}

                              <div style={{ 
                                display: 'flex', 
                                gap: '12px', 
                                marginTop: '4px', 
                                padding: '10px 14px', 
                                background: '#FAF8F5', 
                                borderRadius: '12px', 
                                border: '1px solid rgba(232, 226, 213, 0.6)'
                              }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', flex: 1 }}>
                                  <span style={{ fontSize: '0.72rem', color: '#8C8276', textTransform: 'uppercase', fontWeight: 600 }}>Uzman</span>
                                  <span style={{ fontWeight: 600 }}>{app.employeeName}</span>
                                </div>
                                <div style={{ width: '1px', background: 'rgba(197, 168, 128, 0.2)' }} />
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', flex: 1 }}>
                                  <span style={{ fontSize: '0.72rem', color: '#8C8276', textTransform: 'uppercase', fontWeight: 600 }}>Hizmet</span>
                                  <span style={{ fontWeight: 600 }}>{app.serviceName}</span>
                                </div>
                              </div>
                              
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '4px' }}>
                                <span style={{ color: '#8C8276', fontWeight: 500 }}>Hizmet Tutarı:</span>
                                <span style={{ fontWeight: 700, color: '#A3845B', fontSize: '1.2rem', fontFamily: "'Fraunces', serif" }}>
                                  {app.price} TL
                                </span>
                              </div>
                            </div>

                            {/* Cancel Option */}
                            <button onClick={() => requestCancel(app.id)} className="mkl-cancel-btn">
                              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                              </svg>
                              Randevuyu İptal Et
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* PAST APPOINTMENTS SECTION */}
                  {pastAppointments.length > 0 && (
                    <div>
                      <h3 style={{ 
                        fontFamily: "'Fraunces', serif", fontSize: '1.2rem', fontWeight: 500, 
                        marginBottom: '16px', borderBottom: '1px solid rgba(197, 168, 128, 0.15)', 
                        paddingBottom: '8px', color: '#8C8276' 
                      }}>
                        Geçmiş &amp; İptal Edilen Randevular
                      </h3>
                      
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                        gap: '24px',
                        opacity: 0.85
                      }}>
                        {pastAppointments.map((app) => (
                          <div key={app.id} className="mkl-appt-card" style={{ backgroundColor: '#FAF8F5' }}>
                            
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' }}>
                              <div>
                                <h4 style={{ margin: 0, fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: '1.15rem', color: '#555' }}>
                                  {app.shopName}
                                </h4>
                                <span style={{ fontSize: '0.78rem', color: '#8C8276', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="10" />
                                    <polyline points="12 6 12 12 16 14" />
                                  </svg>
                                  {new Date(app.appointmentTime).toLocaleString('tr-TR', { dateStyle: 'long', timeStyle: 'short' })}
                                </span>
                              </div>
                              {renderStatusBadge(app.status)}
                            </div>

                            <div style={{ fontSize: '0.85rem', color: '#555', display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '1px solid rgba(197, 168, 128, 0.1)', paddingTop: '12px' }}>
                              <div style={{ 
                                display: 'flex', 
                                gap: '12px', 
                                padding: '8px 12px', 
                                background: '#FFFFFF', 
                                borderRadius: '12px', 
                                border: '1px solid rgba(232, 226, 213, 0.4)'
                              }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', flex: 1 }}>
                                  <span style={{ fontSize: '0.7rem', color: '#8C8276', textTransform: 'uppercase' }}>Uzman</span>
                                  <span style={{ fontWeight: 500 }}>{app.employeeName}</span>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', flex: 1 }}>
                                  <span style={{ fontSize: '0.7rem', color: '#8C8276', textTransform: 'uppercase' }}>Hizmet</span>
                                  <span style={{ fontWeight: 500 }}>{app.serviceName}</span>
                                </div>
                              </div>
                              
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                                <span style={{ color: '#8C8276' }}>Tutar:</span>
                                <span style={{ fontWeight: 600, color: '#8C8276', fontSize: '1.05rem' }}>
                                  {app.price} TL
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                </div>
              )}
            </div>
          )}

          {/* TAB 2: PROFİL AYARLARIM */}
          {cancelPendingId !== null && (
            <div style={{
              marginBottom: '24px',
              padding: '18px 20px',
              borderRadius: '20px',
              background: '#1E1B18',
              color: '#FAF8F5',
              boxShadow: '0 20px 35px rgba(0,0,0,0.1)',
              display: 'flex',
              flexDirection: 'column',
              gap: '18px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>Randevu İptal Onayı</h3>
                  <p style={{ margin: '8px 0 0', color: '#D8C8AB', fontSize: '0.92rem' }}>
                    Seçili randevuyu iptal etmek istediğinize emin misiniz? Bu işlem geri alınamaz.
                  </p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={handleCancel}
                  style={{
                    flex: 1,
                    minWidth: '160px',
                    background: '#c0392b',
                    color: '#FAF8F5',
                    border: 'none',
                    borderRadius: '14px',
                    padding: '14px 18px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Evet, İptal Et
                </button>
                <button
                  type="button"
                  onClick={() => setCancelPendingId(null)}
                  style={{
                    flex: 1,
                    minWidth: '160px',
                    background: '#FAF8F5',
                    color: '#1E1B18',
                    border: '1px solid rgba(30, 27, 24, 0.12)',
                    borderRadius: '14px',
                    padding: '14px 18px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Vazgeç
                </button>
              </div>
            </div>
          )}
          {activeTab === 'profile' && (
            <div style={{ maxWidth: '640px' }}>

              <div style={{ marginBottom: '32px' }}>
                <h2 style={{ color: '#1E1B18', fontFamily: "'Fraunces', serif", fontSize: '1.5rem', fontWeight: 500, margin: 0 }}>
                  Profil Bilgilerini Güncelle
                </h2>
                <p style={{ color: '#8C8276', margin: '6px 0 0 0', fontSize: '0.9rem' }}>
                  Kişisel iletişim bilgilerinizi ve hesabınıza ait şifreyi buradan güncelleyebilirsiniz.
                </p>
              </div>

              <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                
                {/* Names row */}
                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: '200px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#1E1B18', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Ad</label>
                    <div className="mkl-form-group">
                      <span className="mkl-form-icon-left">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                          <circle cx="12" cy="7" r="4" />
                        </svg>
                      </span>
                      <input 
                        className="mkl-dashboard-input" 
                        type="text" 
                        value={profileData.firstName} 
                        onChange={e => setProfileData(prev => ({ ...prev, firstName: e.target.value }))} 
                        required 
                      />
                    </div>
                  </div>
                  
                  <div style={{ flex: 1, minWidth: '200px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#1E1B18', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Soyad</label>
                    <div className="mkl-form-group">
                      <span className="mkl-form-icon-left">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                          <circle cx="12" cy="7" r="4" />
                        </svg>
                      </span>
                      <input 
                        className="mkl-dashboard-input" 
                        type="text" 
                        value={profileData.lastName} 
                        onChange={e => setProfileData(prev => ({ ...prev, lastName: e.target.value }))} 
                        required 
                      />
                    </div>
                  </div>
                </div>

                {/* Email (Disabled) */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#1E1B18', letterSpacing: '0.05em', textTransform: 'uppercase' }}>E-posta Adresi</label>
                  <div className="mkl-form-group">
                    <span className="mkl-form-icon-left" style={{ opacity: 0.6 }}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                        <polyline points="22,6 12,13 2,6" />
                      </svg>
                    </span>
                    <input 
                      className="mkl-dashboard-input" 
                      type="email" 
                      value={profileData.email} 
                      disabled 
                    />
                  </div>
                  <span style={{ fontSize: '0.72rem', color: '#8C8276', fontStyle: 'italic', marginLeft: '4px' }}>* Kayıtlı e-posta adresi değiştirilemez.</span>
                </div>

                {/* Phone Number */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#1E1B18', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Telefon Numarası</label>
                  <div className="mkl-form-group">
                    <span className="mkl-form-icon-left">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                      </svg>
                    </span>
                    <input 
                      className="mkl-dashboard-input" 
                      type="tel" 
                      value={profileData.phoneNumber} 
                      onChange={e => setProfileData(prev => ({ ...prev, phoneNumber: e.target.value }))} 
                      required 
                    />
                  </div>
                </div>

                {/* Password field */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#1E1B18', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Yeni Şifre</label>
                  <div className="mkl-form-group">
                    <span className="mkl-form-icon-left">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                      </svg>
                    </span>
                    <input 
                      className="mkl-dashboard-input" 
                      type="password" 
                      value={profileData.password} 
                      onChange={e => setProfileData(prev => ({ ...prev, password: e.target.value }))} 
                      placeholder="Değiştirmek istemiyorsanız boş bırakın" 
                    />
                  </div>
                </div>

                {/* Save Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="mkl-save-btn"
                  style={{ marginTop: '12px' }}
                >
                  {isSubmitting ? (
                    <>
                      <div style={{
                        width: '16px',
                        height: '16px',
                        border: '2px solid rgba(255,255,255,0.2)',
                        borderTopColor: '#FFFFFF',
                        borderRadius: '50%',
                        animation: 'spin 0.6s linear infinite'
                      }} />
                      Kaydediliyor...
                    </>
                  ) : (
                    "Değişiklikleri Kaydet"
                  )}
                </button>

              </form>
            </div>
          )}

        </div>
      </div>
      
    </div>
  );
}