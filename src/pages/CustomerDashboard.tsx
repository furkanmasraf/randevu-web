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
  shopAddress?: string; 
  shopPhone?: string;
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
    addressText: '',
    password: ''
  });
  const [focusedInput, setFocusedInput] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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
        const sorted = Array.isArray(appResponse.data) 
          ? [...appResponse.data].sort((a, b) => new Date(b.appointmentTime).getTime() - new Date(a.appointmentTime).getTime())
          : [];
        setAppointments(sorted);

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
            addressText: userResponse.data.addressText || '',
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
  setIsSubmitting(true); // Yükleniyor durumunu başlat
  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('userId');
  
  try {
    const payload: any = {
      firstName: profileData.firstName,
      lastName: profileData.lastName,
      phoneNumber: profileData.phoneNumber,
      addressText: profileData.addressText
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
  } finally {
    setIsSubmitting(false);
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
      
      {/* MOBİL HAMBURGER BUTONU */}
      <button 
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        style={{ 
          position: 'fixed', top: '16px', left: '16px', zIndex: 1100, 
          padding: '10px 14px', backgroundColor: '#1e293b', color: '#fff', 
          border: 'none', borderRadius: '10px', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' 
        }}
        className="md:hidden"
      >
        {isSidebarOpen ? '✕' : '☰'}
      </button>
      
      {/* SOL SIDEBAR */}
<div style={{ 
  width: '260px', 
  backgroundColor: '#1e293b', 
  color: '#ffffff', 
  padding: '32px 20px', 
  display: isSidebarOpen ? 'flex' : 'none',
  flexDirection: 'column', 
  position: 'fixed', 
  height: '100%',
  zIndex: 1000,
  boxShadow: '4px 0 30px rgba(0,0,0,0.1)'
}}
className="md:!flex md:static" 
>
  {/* Logo Alanı */}
  <div style={{ marginBottom: '40px', paddingLeft: '10px' }}>
    <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>Makas<span style={{ color: '#818cf8' }}>Lab</span></h2>
  </div>
  
  {/* Menü Grupları */}
  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flexGrow: 1 }}>
  <SidebarButton 
    onClick={() => { setActiveTab('profile'); setIsSidebarOpen(false); }} 
    active={activeTab === 'profile'} 
    icon="👤" 
    label="Profil Bilgilerim" 
  />
  <SidebarButton 
    onClick={() => { setActiveTab('appointments'); setIsSidebarOpen(false); }} 
    active={activeTab === 'appointments'} 
    icon="📅" 
    label="Randevularım" 
  />

  <div style={{ marginTop: '24px' }}>
    <SidebarButton 
      onClick={() => { handleLogout(); setIsSidebarOpen(false); }} 
      isDanger={true}
      label="Çıkış Yap" 
    />
  </div>
</div>
</div>

      {/* ARKA PLAN KARARTICI */}
      {isSidebarOpen && (
        <div 
          onClick={() => setIsSidebarOpen(false)} 
          style={{ 
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', 
            backgroundColor: 'rgba(0,0,0,0.4)', zIndex: 900 
          }} 
        />
      )}

      {/* SAĞ İÇERİK ALANI (Modern Padding ve Radius) */}
      <div style={{ 
        flex: 1, 
        padding: '32px', // Hem mobilde hem masaüstünde temiz bir boşluk
        maxWidth: '100%',
        overflowX: 'hidden'
      }}>
        <div style={{ 
          backgroundColor: '#ffffff', 
          padding: '40px', // İçerideki beyaz alanın ferahlığı
          borderRadius: '24px', 
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)'
        }}>

          {/* SEKME 1: RANDEVULARIM */}
          {activeTab === 'appointments' && (
  <div>
    <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div>
        <h2 style={{ margin: 0, color: '#0f172a', fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.025em' }}>Randevularım</h2>
        <p style={{ margin: '6px 0 0 0', color: '#64748b', fontSize: '0.95rem' }}>Tüm randevu geçmişinizi ve gelecek planlarınızı görüntüleyin.</p>
      </div>
      <button 
        onClick={() => navigate('/')} 
        style={{ 
          backgroundColor: '#ffffff', border: '1px solid #e2e8f0', padding: '10px 20px', borderRadius: '12px', 
          cursor: 'pointer', fontWeight: 600, color: '#475569', fontSize: '0.875rem',
          transition: 'all 0.2s', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' 
        }}
      >
        ← Ana Sayfa
      </button>
    </div>

    {/* 3. RANDEVU LİSTESİ (Tüm ekranlarda kart yapısı) */}
{appointments.length === 0 ? (
  <div style={{ textAlign: 'center', padding: '60px', color: '#94a3b8' }}>Henüz randevunuz bulunmuyor.</div>
) : (
  <div style={{ 
    display: 'grid', 
    gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', 
    gap: '20px' 
  }}>
    {appointments.map((app) => (
      <div key={app.id} style={{ 
        padding: '24px', 
        background: '#fff', 
        borderRadius: '20px', 
        border: '1px solid #e2e8f0', 
        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}>
        {/* Başlık ve Durum */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#0f172a' }}>{app.shopName}</h3>
            <span style={{ fontSize: '0.85rem', color: '#64748b' }}>{new Date(app.appointmentTime).toLocaleString('tr-TR', { dateStyle: 'long', timeStyle: 'short' })}</span>
          </div>
          {renderStatusBadge(app.status)}
        </div>

        {/* Detaylar */}
        <div style={{ fontSize: '0.9rem', color: '#475569', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div>📍 {app.shopAddress || '-'}</div>
          <div>📞 {app.shopPhone || '-'}</div>
          <div style={{ display: 'flex', gap: '16px', marginTop: '4px', padding: '10px', background: '#f8fafc', borderRadius: '10px' }}>
            <span>👤 {app.employeeName}</span>
            <span>✂️ {app.serviceName}</span>
          </div>
          <div style={{ fontWeight: 800, color: '#6366f1', fontSize: '1.1rem', marginTop: '4px' }}>{app.price} TL</div>
        </div>
        
        {/* İptal Butonu */}
        {(app.status === 'PENDING' || app.status === 'APPROVED') && (
          <button 
            onClick={() => handleCancel(app.id)} 
            style={{ 
              width: '100%', 
              backgroundColor: '#fee2e2', 
              color: '#ef4444', 
              border: 'none', 
              padding: '12px', 
              borderRadius: '12px', 
              fontWeight: 700, 
              cursor: 'pointer',
              transition: 'background 0.2s'
            }}
          >
            Randevuyu İptal Et
          </button>
        )}
      </div>
    ))}
  </div>
)}
  </div>
)}

          {/* SEKME 2: PROFiL BİLGİLERİM */}
          {activeTab === 'profile' && (
  <div style={{ 
    maxWidth: '600px', 
    backgroundColor: '#fff', 
    padding: '40px', 
    borderRadius: '24px', 
    border: '1px solid #e2e8f0',
    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)'
  }}>
    <div style={{ marginBottom: '32px' }}>
      <h2 style={{ color: '#0f172a', fontSize: '1.75rem', fontWeight: 800, margin: 0, letterSpacing: '-0.025em' }}>Profil Ayarları</h2>
      <p style={{ color: '#64748b', margin: '8px 0 0 0', fontSize: '0.95rem' }}>Kişisel bilgilerinizi buradan yönetebilirsiniz.</p>
    </div>
    
    <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', gap: '16px' }}>
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#475569', marginBottom: '8px', letterSpacing: '0.05em' }}>AD</label>
          <input type="text" value={profileData.firstName} onFocus={() => setFocusedInput('firstName')} onBlur={() => setFocusedInput('')} onChange={e => setProfileData(prev => ({ ...prev, firstName: e.target.value }))} style={getInputStyle('firstName')} required />
        </div>
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#475569', marginBottom: '8px', letterSpacing: '0.05em' }}>SOYAD</label>
          <input type="text" value={profileData.lastName} onFocus={() => setFocusedInput('lastName')} onBlur={() => setFocusedInput('')} onChange={e => setProfileData(prev => ({ ...prev, lastName: e.target.value }))} style={getInputStyle('lastName')} required />
        </div>
      </div>

      <div>
        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#475569', marginBottom: '8px', letterSpacing: '0.05em' }}>E-POSTA ADRESİ</label>
        <input type="email" value={profileData.email} disabled style={{ ...getInputStyle('email'), width: '100%', boxSizing: 'border-box', backgroundColor: '#f8fafc', color: '#94a3b8', cursor: 'not-allowed' }} />
      </div>

      <div>
        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#475569', marginBottom: '8px', letterSpacing: '0.05em' }}>TELEFON NUMARASI</label>
        <input type="tel" value={profileData.phoneNumber} onFocus={() => setFocusedInput('phone')} onBlur={() => setFocusedInput('')} onChange={e => setProfileData(prev => ({ ...prev, phoneNumber: e.target.value }))} style={{ ...getInputStyle('phone'), width: '100%', boxSizing: 'border-box' }} required />
      </div>

      <div>
        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#475569', marginBottom: '8px', letterSpacing: '0.05em' }}>YENİ ŞİFRE</label>
        <input type="password" value={profileData.password} onFocus={() => setFocusedInput('password')} onBlur={() => setFocusedInput('')} onChange={e => setProfileData(prev => ({ ...prev, password: e.target.value }))} placeholder="••••••••" style={{ ...getInputStyle('password'), width: '100%', boxSizing: 'border-box' }} />
      </div>

      <button 
        type="submit" 
        disabled={isSubmitting} // Butonu kilitle
          style={{ 
          width: '100%', 
          backgroundColor: isSubmitting ? '#94a3b8' : '#0f172a', // Pasif renk
          color: '#fff', 
          border: 'none', 
          padding: '16px', 
          borderRadius: '12px', 
          fontWeight: 700, 
          cursor: isSubmitting ? 'not-allowed' : 'pointer', // İmleç değişimi
          fontSize: '1rem', 
          marginTop: '8px', 
          transition: 'all 0.2s' 
        }}
        >
        {isSubmitting ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
      </button>
    </form>
  </div>
)}

        </div>
      </div>
    </div>
  );
}