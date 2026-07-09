import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';

interface AppointmentDTO {
  id: number;
  shopName: string;
  employeeName: string;
  serviceName: string;
  price: number;
  appointmentTime: string;
  status: 'PENDING' | 'APPROVED' | 'CANCELLED' | 'REJECTED';
}

export default function CustomerDashboard() {
  const [activeTab, setActiveTab] = useState<'appointments' | 'profile'>('appointments');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [appointments, setAppointments] = useState<AppointmentDTO[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  
  // Profil Form State'leri
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    password: ''
  });
  const [focusedInput, setFocusedInput] = useState<string>('');
  const [isBtnHovered, setIsBtnHovered] = useState<boolean>(false);

  const navigate = useNavigate();

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
        
        // 1. Randevuları Çek
        const appResponse = await API.get(`https://randevu-sistemi-dv33.onrender.com/api/appointments/user/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setAppointments(Array.isArray(appResponse.data) ? appResponse.data : []);

        // 2. Profil Bilgilerini Çek
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

  const handleCancel = async (appointmentId: number) => {
    const token = localStorage.getItem('token');
    if (!window.confirm("Bu randevuyu iptal etmek istediğinize emin misiniz?")) return;

    try {
      await API.put(`https://randevu-sistemi-dv33.onrender.com/api/appointments/${appointmentId}/cancel`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      alert("Randevunuz başarıyla iptal edildi.");
      setAppointments(prev => 
        prev.map(app => app.id === appointmentId ? { ...app, status: 'CANCELLED' } : app)
      );
    } catch (error) {
      console.error("Randevu iptal edilirken hata oluştu:", error);
      alert("Randevu iptal edilemedi.");
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
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
      alert("Profil bilgileriniz başarıyla güncellendi!");
    } catch (error) {
      console.error("Profil güncellenirken hata oluştu:", error);
      alert("Profil bilgileri güncellenemedi.");
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const getInputStyle = (inputName: string) => ({
    padding: '12px 14px',
    borderRadius: '10px',
    border: focusedInput === inputName ? '2px solid #6366f1' : '1px solid #cbd5e1',
    fontSize: '0.95rem',
    outline: 'none',
    backgroundColor: '#ffffff',
    color: '#334155',
    transition: 'all 0.2s',
    boxShadow: focusedInput === inputName ? '0 0 0 4px rgba(99, 102, 241, 0.15)' : 'none',
  });

  const renderStatusBadge = (status: string) => {
    const baseStyle = { padding: '6px 14px', borderRadius: '8px', fontSize: '0.825rem', fontWeight: 700, display: 'inline-block', textAlign: 'center' as const, whiteSpace: 'nowrap' as const };
    switch (status) {
      case 'APPROVED': return <span style={{ ...baseStyle, color: '#16a34a', backgroundColor: '#f0fdf4' }}>Onaylandı</span>;
      case 'PENDING': return <span style={{ ...baseStyle, color: '#b45309', backgroundColor: '#fffbeb' }}>Bekliyor</span>;
      case 'CANCELLED': return <span style={{ ...baseStyle, color: '#b91c1c', backgroundColor: '#fef2f2' }}>İptal Edildi</span>;
      case 'REJECTED': return <span style={{ ...baseStyle, color: '#475569', backgroundColor: '#f8fafc' }}>Reddedildi</span>;
      default: return <span style={{ ...baseStyle, color: '#64748b', backgroundColor: '#f3f4f6' }}>{status}</span>;
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f1f5f9', color: '#64748b', fontSize: '1.1rem', fontWeight: 500 }}>
        Panel yükleniyor...
      </div>
    );
  }

  const SidebarButton = ({ onClick, active, icon, label, isDanger = false }: any) => (
  <button 
    onClick={onClick}
    style={{ 
      width: '100%', 
      textAlign: 'left', 
      padding: '14px', 
      borderRadius: '12px', 
      border: 'none', 
      backgroundColor: isDanger ? 'rgba(239, 68, 68, 0.15)' : (active ? 'rgba(255,255,255,0.1)' : 'transparent'), 
      color: isDanger ? '#ef4444' : (active ? '#818cf8' : '#94a3b8'), 
      fontWeight: isDanger ? 700 : 600, 
      cursor: 'pointer', 
      fontSize: '0.95rem', 
      transition: 'all 0.2s', 
      display: 'flex', 
      alignItems: 'center', 
      gap: '12px' 
    }}
  >
    <span>{icon}</span> {label}
  </button>
);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: '"Inter", system-ui, sans-serif', backgroundColor: '#f1f5f9', margin: 0 }}>
      
      {/* HAMBURGER BUTONU (Mobilde görünecek) */}
      <button 
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        style={{ position: 'fixed', top: '16px', left: '16px', zIndex: 1100, padding: '10px', backgroundColor: '#1e293b', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
        className="md:hidden"
      >
        {isSidebarOpen ? '✕' : '☰'}
      </button>
      
      {/* SOL SIDEBAR */}
      <div style={{ 
        width: '260px', 
        backgroundColor: '#1e293b', 
        color: '#ffffff', 
        padding: '32px 14px', 
        display: isSidebarOpen ? 'flex' : 'none', // Mobilde state'e göre açılır
        flexDirection: 'column', 
        gap: '10px', 
        position: 'fixed', // Mobilde ekranın üstünde sabit
        height: '100%',
        zIndex: 1000,
        boxShadow: '4px 0 30px rgba(0,0,0,0.1)'
      }}
      className="md:!flex md:static" // Büyük ekranda her zaman göster
      >
        <div style={{ marginBottom: '30px', paddingLeft: '10px', marginTop: '40px' }}>
          <h2 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 800 }}>Makas<span style={{ color: '#818cf8' }}>Lab</span></h2>
        </div>
        
        <SidebarButton 
          onClick={() => { setActiveTab('appointments'); setIsSidebarOpen(false); }} 
          active={activeTab === 'appointments'} 
          icon="📅" 
          label="Randevularım" 
        />
        <SidebarButton 
          onClick={() => { setActiveTab('profile'); setIsSidebarOpen(false); }} 
          active={activeTab === 'profile'} 
          icon="👤" 
          label="Profil Bilgilerim" 
        />
        <SidebarButton 
          onClick={() => { handleLogout(); setIsSidebarOpen(false); }} 
          isDanger={true}
          icon="🚪" 
          label="Çıkış Yap" 
        />
      </div>

      {/* 3. ARKA PLAN KARARTICI (Overlay) - BURAYA EKLE! */}
{isSidebarOpen && (
  <div 
    onClick={() => setIsSidebarOpen(false)} 
    style={{ 
      position: 'fixed', 
      top: 0, 
      left: 0, 
      width: '100%', 
      height: '100%', 
      backgroundColor: 'rgba(0,0,0,0.5)', 
      zIndex: 900 // Sidebar'dan küçük olmalı ki Sidebar önde kalsın
    }} 
  />
)}

      {/* SAĞ İÇERİK ALANI */}
      <div style={{ flex: 1, padding: '20px', paddingTop: '80px' }} className="md:padding:40px">
        <div style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '24px' }} className="md:padding:40px">

          {/* SEKME 1: RANDEVULARIM */}
          {activeTab === 'appointments' && (
  <div>
    <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div>
        <h2 style={{ margin: 0, color: '#0f172a', fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.025em' }}>Randevularım</h2>
        <p style={{ margin: '6px 0 0 0', color: '#64748b', fontSize: '0.95rem', lineHeight: 1.5 }}>Geçmiş ve gelecek randevu taleplerinizin durumunu buradan takip edebilirsiniz.</p>
      </div>
      <button 
        onClick={() => navigate('/')} 
        style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', padding: '10px 18px', borderRadius: '10px', cursor: 'pointer', fontWeight: 600, color: '#475569', fontSize: '0.875rem' }}
      >
        ← Ana Sayfa
      </button>
    </div>
    
    {appointments.length === 0 ? (
      <div style={{ textAlign: 'center', padding: '60px', color: '#94a3b8' }}>Henüz randevunuz bulunmuyor.</div>
    ) : (
      <>
        {/* MOBİL: KART GÖRÜNÜMÜ */}
        <div className="md:hidden" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {appointments.map((app) => (
            <div key={app.id} style={{ padding: '16px', background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ fontWeight: 800, color: '#0f172a', fontSize: '1.05rem' }}>{app.shopName}</span>
                {renderStatusBadge(app.status)}
              </div>
              <div style={{ color: '#475569', fontSize: '0.9rem', marginBottom: '4px' }}>👤 {app.employeeName}</div>
              <div style={{ color: '#475569', fontSize: '0.9rem', marginBottom: '8px' }}>✂️ {app.serviceName}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #f1f5f9' }}>
                <span style={{ fontWeight: 700, color: '#6366f1' }}>{app.price} TL</span>
                <span style={{ color: '#64748b', fontSize: '0.85rem' }}>
                  {new Date(app.appointmentTime).toLocaleString('tr-TR', { dateStyle: 'short', timeStyle: 'short' })}
                </span>
              </div>
              {(app.status === 'PENDING' || app.status === 'APPROVED') && (
                <button onClick={() => handleCancel(app.id)} style={{ width: '100%', marginTop: '12px', padding: '10px', backgroundColor: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: '10px', fontWeight: 700, cursor: 'pointer' }}>İptal Et</button>
              )}
            </div>
          ))}
        </div>

        {/* MASAÜSTÜ: TABLO GÖRÜNÜMÜ */}
        <div className="hidden md:block" style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <th style={{ padding: '18px 24px', color: '#475569', fontSize: '0.8rem', fontWeight: 700 }}>SALON</th>
                <th style={{ padding: '18px 24px', color: '#475569', fontSize: '0.8rem', fontWeight: 700 }}>PERSONEL</th>
                <th style={{ padding: '18px 24px', color: '#475569', fontSize: '0.8rem', fontWeight: 700 }}>HİZMET</th>
                <th style={{ padding: '18px 24px', color: '#475569', fontSize: '0.8rem', fontWeight: 700 }}>TARİH / SAAT</th>
                <th style={{ padding: '18px 24px', color: '#475569', fontSize: '0.8rem', fontWeight: 700 }}>TUTAR</th>
                <th style={{ padding: '18px 24px', color: '#475569', fontSize: '0.8rem', fontWeight: 700 }}>DURUM</th>
                <th style={{ padding: '18px 24px', color: '#475569', fontSize: '0.8rem', fontWeight: 700, textAlign: 'center' }}>İŞLEM</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((app) => (
                <tr key={app.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '20px 24px', fontWeight: 700 }}>{app.shopName}</td>
                  <td style={{ padding: '20px 24px' }}>{app.employeeName}</td>
                  <td style={{ padding: '20px 24px' }}>{app.serviceName}</td>
                  <td style={{ padding: '20px 24px' }}>{new Date(app.appointmentTime).toLocaleString('tr-TR')}</td>
                  <td style={{ padding: '20px 24px', fontWeight: 700, color: '#6366f1' }}>{app.price} TL</td>
                  <td style={{ padding: '20px 24px' }}>{renderStatusBadge(app.status)}</td>
                  <td style={{ padding: '20px 24px', textAlign: 'center' }}>
                    {(app.status === 'PENDING' || app.status === 'APPROVED') && (
                      <button onClick={() => handleCancel(app.id)} style={{ backgroundColor: '#fee2e2', color: '#ef4444', border: 'none', padding: '8px 14px', borderRadius: '10px', cursor: 'pointer', fontWeight: 700 }}>İptal Et</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </>
    )}
  </div>
)}

          {/* SEKME 2: PROFiL BİLGİLERİM */}
          {activeTab === 'profile' && (
            <div style={{ maxWidth: '550px' }}>
              <div style={{ marginBottom: '32px' }}>
                <h2 style={{ color: '#0f172a', fontSize: '1.75rem', fontWeight: 800, margin: 0, letterSpacing: '-0.025em' }}>Profil Ayarları</h2>
                <p style={{ color: '#64748b', margin: '6px 0 0 0', fontSize: '0.95rem' }}>Kişisel bilgilerinizi düzenleyebilir ve hesap şifrenizi güncelleyebilirsiniz.</p>
              </div>
              
              <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'flex', gap: '16px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#475569' }}>AD</label>
                    <input type="text" value={profileData.firstName} onFocus={() => setFocusedInput('firstName')} onBlur={() => setFocusedInput('')} onChange={e => setProfileData(prev => ({ ...prev, firstName: e.target.value }))} style={getInputStyle('firstName')} required />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#475569' }}>SOYAD</label>
                    <input type="text" value={profileData.lastName} onFocus={() => setFocusedInput('lastName')} onBlur={() => setFocusedInput('')} onChange={e => setProfileData(prev => ({ ...prev, lastName: e.target.value }))} style={getInputStyle('lastName')} required />
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#475569' }}>E-POSTA ADRESİ (DEĞİŞTİRİLEMEZ)</label>
                  <input type="email" value={profileData.email} disabled style={{ ...getInputStyle('email'), backgroundColor: '#f8fafc', color: '#94a3b8', cursor: 'not-allowed', border: '1px solid #e2e8f0' }} />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#475569' }}>TELEFON NUMARASI</label>
                  <input type="tel" value={profileData.phoneNumber} onFocus={() => setFocusedInput('phone')} onBlur={() => setFocusedInput('')} onChange={e => setProfileData(prev => ({ ...prev, phoneNumber: e.target.value }))} style={getInputStyle('phone')} required />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#475569' }}>YENİ ŞİFRE (DEĞİŞTİRMEK İSTEMİYORSANIZ BOŞ BIRAKIN)</label>
                  <input type="password" value={profileData.password} onFocus={() => setFocusedInput('password')} onBlur={() => setFocusedInput('')} onChange={e => setProfileData(prev => ({ ...prev, password: e.target.value }))} placeholder="••••••••" style={getInputStyle('password')} />
                </div>

                <button 
                  type="submit" 
                  onMouseEnter={() => setIsBtnHovered(true)}
                  onMouseLeave={() => setIsBtnHovered(false)}
                  style={{ backgroundColor: isBtnHovered ? '#4f46e5' : '#6366f1', color: '#fff', border: 'none', padding: '14px', borderRadius: '12px', fontWeight: 700, cursor: 'pointer', fontSize: '1rem', marginTop: '10px', transition: 'all 0.2s', boxShadow: isBtnHovered ? '0 10px 15px -3px rgba(99, 102, 241, 0.2)' : 'none' }}
                >
                  Değişiklikleri Kaydet
                </button>
              </form>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}