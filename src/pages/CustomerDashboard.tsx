import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import { toast } from 'react-toastify'; // Toast eklendi

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
  const [loading, setLoading] = useState<boolean>(true);
  const [appointments, setAppointments] = useState<AppointmentDTO[]>([]);
  const [focusedInput, setFocusedInput] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    addressText: '',
    password: '',
    passwordConfirm: '' // Şifre tekrarı eklendi
  });
  
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    const role = localStorage.getItem('role');

    if (!token || !userId || role !== 'CUSTOMER') {
      toast.error("Oturum süreniz dolmuş veya yetkisiz erişim.");
      setLoading(false); 
      navigate('/login');
      return;
    }

    const loadDashboardData = async () => {
      try {
        setLoading(true);

        const [appsResponse, userResponse] = await Promise.all([
          API.get(`/api/appointments/user/${userId}`, { 
            headers: { Authorization: `Bearer ${token}` } 
          }).catch(err => {
            console.error("Randevular yüklenirken hata:", err);
            return { data: [] }; 
          }),
          API.get(`/api/users/${userId}`, { 
            headers: { Authorization: `Bearer ${token}` } 
          }).catch(err => {
            console.error("Profil yüklenirken hata:", err);
            return { data: null };
          })
        ]);

        const rawAppointments = appsResponse?.data;
        const sortedApps = Array.isArray(rawAppointments) 
          ? [...rawAppointments].sort((a, b) => new Date(b.appointmentTime).getTime() - new Date(a.appointmentTime).getTime()) 
          : [];
        setAppointments(sortedApps);

        if (userResponse?.data) {
          setProfileData({ 
            ...userResponse.data, 
            password: '', 
            passwordConfirm: '' 
          });
        }
      } catch (globalError) {
        toast.error("Veriler yüklenirken bir sorun oluştu.");
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [navigate]);

  const handleCancel = async (id: number) => {
    if (!window.confirm("Bu randevuyu iptal etmek istediğinize emin misiniz?")) return;
    
    try {
      await API.put(`/api/appointments/${id}/cancel`, {}, { 
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } 
      });
      setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: 'CANCELLED' } : a));
      toast.success("Randevunuz başarıyla iptal edildi.");
    } catch (err) {
      toast.error("İptal işlemi başarısız oldu.");
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Şifre kontrolü
    if (profileData.password || profileData.passwordConfirm) {
      if (profileData.password !== profileData.passwordConfirm) {
        toast.warning("Girdiğiniz şifreler birbiriyle eşleşmiyor!");
        return;
      }
      if (profileData.password.length < 6) {
        toast.warning("Şifreniz en az 6 karakter olmalıdır!");
        return;
      }
    }

    setIsSubmitting(true);
    
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

      await API.put(`/api/users/${localStorage.getItem('userId')}`, payload, { 
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } 
      });
      
      toast.success("Profil bilgileriniz başarıyla güncellendi!");
      // Şifre alanlarını temizle
      setProfileData(prev => ({ ...prev, password: '', passwordConfirm: '' }));
    } catch (err) {
      toast.error("Profil güncellenirken bir hata oluştu.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    toast.info("Başarıyla çıkış yapıldı.");
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
    const baseStyle = { 
      padding: '6px 14px', borderRadius: '8px', fontSize: '0.825rem', fontWeight: 700, 
      display: 'inline-block', textAlign: 'center' as const, whiteSpace: 'nowrap' as const 
    };
    switch (status) {
      case 'APPROVED': return <span style={{ ...baseStyle, color: '#16a34a', backgroundColor: '#f0fdf4' }}>Onaylandı</span>;
      case 'PENDING': return <span style={{ ...baseStyle, color: '#b45309', backgroundColor: '#fffbeb' }}>Bekliyor</span>;
      case 'CANCELLED': return <span style={{ ...baseStyle, color: '#b91c1c', backgroundColor: '#fef2f2' }}>İptal Edildi</span>;
      case 'REJECTED': return <span style={{ ...baseStyle, color: '#475569', backgroundColor: '#f8fafc' }}>Reddedildi</span>;
      default: return <span style={{ ...baseStyle, color: '#64748b', backgroundColor: '#f3f4f6' }}>{status}</span>;
    }
  };

  const SidebarButton = ({ onClick, active, icon, label, isDanger = false }: any) => (
    <button 
      onClick={onClick} 
      style={{ 
        width: '100%', textAlign: 'left', padding: '14px', borderRadius: '12px', border: 'none', 
        backgroundColor: isDanger ? 'rgba(239, 68, 68, 0.15)' : (active ? 'rgba(255,255,255,0.1)' : 'transparent'), 
        color: isDanger ? '#ef4444' : (active ? '#818cf8' : '#94a3b8'), 
        fontWeight: isDanger ? 700 : 600, cursor: 'pointer', fontSize: '0.95rem', 
        transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '12px' 
      }}
    >
      <span>{icon}</span> {label}
    </button>
  );

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f1f5f9', color: '#64748b', fontSize: '1.1rem', fontWeight: 500 }}>
        Panel yükleniyor...
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: '"Inter", system-ui, sans-serif', backgroundColor: '#f1f5f9', margin: 0 }}>
      {/* MOBİL HAMBURGER BUTONU */}
      <button 
        onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
        className="md:hidden" 
        style={{ position: 'fixed', top: '16px', left: '16px', zIndex: 1100, padding: '10px 14px', backgroundColor: '#1e293b', color: '#fff', border: 'none', borderRadius: '10px', cursor: 'pointer' }}
      >
        {isSidebarOpen ? '✕' : '☰'}
      </button>

      {/* SOL SIDEBAR */}
      <div 
        className="md:!flex md:static" 
        style={{ 
          width: '260px', backgroundColor: '#1e293b', color: '#ffffff', padding: '32px 20px', 
          display: isSidebarOpen ? 'flex' : 'none', flexDirection: 'column', position: 'fixed', height: '100%', zIndex: 1000 
        }}
      >
        <div style={{ marginBottom: '40px', paddingLeft: '10px' }}>
          <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>Makas<span style={{ color: '#818cf8' }}>Lab</span></h2>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flexGrow: 1 }}>
          <SidebarButton onClick={() => { setActiveTab('profile'); setIsSidebarOpen(false); }} active={activeTab === 'profile'} icon="👤" label="Profil ve Ayarlar" />
          <SidebarButton onClick={() => { setActiveTab('appointments'); setIsSidebarOpen(false); }} active={activeTab === 'appointments'} icon="📅" label="Randevularım" />
          <div style={{ marginTop: '24px' }}>
            <SidebarButton onClick={() => { handleLogout(); setIsSidebarOpen(false); }} isDanger={true} label="Çıkış Yap" />
          </div>
        </div>
      </div>

      {isSidebarOpen && (
        <div onClick={() => setIsSidebarOpen(false)} style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.4)', zIndex: 900 }} />
      )}

      {/* SAĞ İÇERİK ALANI */}
      <div style={{ flex: 1, padding: '32px', maxWidth: '100%', overflowX: 'hidden' }}>
        <div style={{ backgroundColor: '#ffffff', padding: '40px', borderRadius: '24px', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' }}>
          
          {/* SEKME 1: RANDEVULARIM */}
          {activeTab === 'appointments' && (
            <div>
              <div style={{ marginBottom: '32px' }}>
                <h2 style={{ margin: 0, color: '#0f172a', fontSize: '2rem', fontWeight: 800 }}>Randevularım</h2>
              </div>
              {appointments.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px', color: '#94a3b8' }}>Henüz randevunuz bulunmuyor.</div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
                  {appointments.map((app) => (
                    <div key={app.id} style={{ padding: '24px', background: '#fff', borderRadius: '20px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#0f172a' }}>{app.shopName}</h3>
                          <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
                            {new Date(app.appointmentTime).toLocaleString('tr-TR', { dateStyle: 'long', timeStyle: 'short' })}
                          </span>
                        </div>
                        {renderStatusBadge(app.status)}
                      </div>
                      <div style={{ fontSize: '0.9rem', color: '#475569', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ display: 'flex', gap: '16px', padding: '10px', background: '#f8fafc', borderRadius: '10px' }}>
                          <span>👤 {app.employeeName}</span>
                          <span>✂️ {app.serviceName}</span>
                        </div>
                        <div style={{ fontWeight: 800, color: '#6366f1', fontSize: '1.1rem' }}>{app.price} TL</div>
                      </div>
                      {(app.status === 'PENDING' || app.status === 'APPROVED') && (
                        <button onClick={() => handleCancel(app.id)} style={{ width: '100%', backgroundColor: '#fee2e2', color: '#ef4444', border: 'none', padding: '12px', borderRadius: '12px', fontWeight: 700, cursor: 'pointer' }}>
                          Randevuyu İptal Et
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* SEKME 2: PROFiL VE AYARLAR */}
          {activeTab === 'profile' && (
            <div>
              <div style={{ marginBottom: '32px' }}>
                <h2 style={{ color: '#0f172a', fontSize: '2rem', fontWeight: 800, margin: 0 }}>Profil ve Ayarlar</h2>
                <p style={{ color: '#64748b', marginTop: '8px' }}>Kişisel bilgilerinizi ve hesap güvenliğinizi buradan yönetebilirsiniz.</p>
              </div>
              
              <form onSubmit={handleUpdateProfile}>
                {/* 2 Kolonlu Grid Yapısı */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '40px' }}>
                  
                  {/* SOL KOLON: KİŞİSEL BİLGİLER */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <h3 style={{ color: '#0f172a', fontSize: '1.2rem', borderBottom: '2px solid #f1f5f9', paddingBottom: '10px', margin: 0 }}>Kişisel Bilgiler</h3>
                    
                    <div style={{ display: 'flex', gap: '16px' }}>
                      <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#475569', marginBottom: '8px' }}>AD</label>
                        <input type="text" value={profileData.firstName} onFocus={() => setFocusedInput('firstName')} onBlur={() => setFocusedInput('')} onChange={e => setProfileData(prev => ({ ...prev, firstName: e.target.value }))} style={{ ...getInputStyle('firstName'), width: '100%', boxSizing: 'border-box' }} required />
                      </div>
                      <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#475569', marginBottom: '8px' }}>SOYAD</label>
                        <input type="text" value={profileData.lastName} onFocus={() => setFocusedInput('lastName')} onBlur={() => setFocusedInput('')} onChange={e => setProfileData(prev => ({ ...prev, lastName: e.target.value }))} style={{ ...getInputStyle('lastName'), width: '100%', boxSizing: 'border-box' }} required />
                      </div>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#475569', marginBottom: '8px' }}>E-POSTA ADRESİ</label>
                      <input type="email" value={profileData.email} disabled style={{ ...getInputStyle('email'), width: '100%', boxSizing: 'border-box', backgroundColor: '#f8fafc', color: '#94a3b8', cursor: 'not-allowed' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#475569', marginBottom: '8px' }}>TELEFON NUMARASI</label>
                      <input type="tel" value={profileData.phoneNumber} onFocus={() => setFocusedInput('phone')} onBlur={() => setFocusedInput('')} onChange={e => setProfileData(prev => ({ ...prev, phoneNumber: e.target.value }))} style={{ ...getInputStyle('phone'), width: '100%', boxSizing: 'border-box' }} required />
                    </div>
                  </div>

                  {/* SAĞ KOLON: ŞİFRE İŞLEMLERİ */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <h3 style={{ color: '#0f172a', fontSize: '1.2rem', borderBottom: '2px solid #f1f5f9', paddingBottom: '10px', margin: 0 }}>Güvenlik</h3>
                    
                    <div style={{ backgroundColor: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>Şifrenizi değiştirmek istemiyorsanız bu alanları boş bırakın.</p>
                      
                      <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#475569', marginBottom: '8px' }}>YENİ ŞİFRE</label>
                        <input type="password" value={profileData.password} onFocus={() => setFocusedInput('password')} onBlur={() => setFocusedInput('')} onChange={e => setProfileData(prev => ({ ...prev, password: e.target.value }))} placeholder="••••••••" style={{ ...getInputStyle('password'), width: '100%', boxSizing: 'border-box' }} />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#475569', marginBottom: '8px' }}>YENİ ŞİFRE (TEKRAR)</label>
                        <input type="password" value={profileData.passwordConfirm} onFocus={() => setFocusedInput('passwordConfirm')} onBlur={() => setFocusedInput('')} onChange={e => setProfileData(prev => ({ ...prev, passwordConfirm: e.target.value }))} placeholder="••••••••" style={{ ...getInputStyle('passwordConfirm'), width: '100%', boxSizing: 'border-box' }} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* KAYDET BUTONU */}
                <div style={{ marginTop: '32px', display: 'flex', justifyContent: 'flex-end' }}>
                  <button type="submit" disabled={isSubmitting} style={{ backgroundColor: isSubmitting ? '#94a3b8' : '#0f172a', color: '#fff', border: 'none', padding: '16px 32px', borderRadius: '12px', fontWeight: 700, cursor: isSubmitting ? 'not-allowed' : 'pointer', fontSize: '1rem', transition: 'background-color 0.2s' }}>
                    {isSubmitting ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
                  </button>
                </div>
              </form>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}