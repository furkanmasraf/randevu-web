import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

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
  const [appointments, setAppointments] = useState<AppointmentDTO[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [hoveredRowId, setHoveredRowId] = useState<number | null>(null);
  
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
        const appResponse = await axios.get(`http://localhost:8080/api/appointments/user/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setAppointments(Array.isArray(appResponse.data) ? appResponse.data : []);

        // 2. Profil Bilgilerini Çek
        const userResponse = await axios.get(`http://localhost:8080/api/users/${userId}`, {
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
      await axios.put(`http://localhost:8080/api/appointments/${appointmentId}/cancel`, {}, {
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

      await axios.put(`http://localhost:8080/api/users/${userId}`, payload, {
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

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: '"Inter", system-ui, sans-serif', backgroundColor: '#f1f5f9', margin: 0 }}>
      
      {/* SOL SIDEBAR */}
      <div style={{ width: '260px', backgroundColor: '#1e293b', color: '#ffffff', padding: '32px 14px', display: 'flex', flexDirection: 'column', gap: '10px', boxShadow: '4px 0 30px rgba(0,0,0,0.02)' }}>
        <div style={{ marginBottom: '30px', paddingLeft: '10px' }}>
          <h2 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 800 }}>
            Makas<span style={{ color: '#818cf8' }}>Lab</span>
          </h2>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>Müşteri Paneli</div>
        </div>
        
        <button 
          onClick={() => setActiveTab('appointments')} 
          style={{ width: '100%', textAlign: 'left', padding: '14px', borderRadius: '12px', border: 'none', backgroundColor: activeTab === 'appointments' ? 'rgba(255,255,255,0.1)' : 'transparent', color: activeTab === 'appointments' ? '#818cf8' : '#94a3b8', fontWeight: 600, cursor: 'pointer', fontSize: '0.95rem', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '12px' }}
        >
          <span>📅</span> Randevularım
        </button>
        <button 
          onClick={() => setActiveTab('profile')} 
          style={{ width: '100%', textAlign: 'left', padding: '14px', borderRadius: '12px', border: 'none', backgroundColor: activeTab === 'profile' ? 'rgba(255,255,255,0.1)' : 'transparent', color: activeTab === 'profile' ? '#818cf8' : '#94a3b8', fontWeight: 600, cursor: 'pointer', fontSize: '0.95rem', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '12px' }}
        >
          <span>👤</span> Profil Bilgilerim
        </button>

        <button 
          onClick={handleLogout} 
          style={{ width: '100%', textAlign: 'left', padding: '14px', borderRadius: '12px', border: 'none', backgroundColor: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', fontWeight: 700, cursor: 'pointer', marginTop: 'auto', fontSize: '0.95rem', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '12px' }}
        >
          <span>🚪</span> Çıkış Yap
        </button>
      </div>

      {/* SAĞ İÇERİK ALANI */}
      <div style={{ flex: 1, padding: '40px', overflowX: 'hidden', overflowY: 'auto', maxHeight: '100vh', boxSizing: 'border-box' }}>
        <div style={{ backgroundColor: '#ffffff', padding: '40px', borderRadius: '24px', boxShadow: '0 4px 18px rgba(0,0,0,0.01)', border: '1px solid #e2e8f0' }}>

          {/* SEKME 1: RANDEVULARIM */}
          {activeTab === 'appointments' && (
            <div>
              <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h2 style={{ margin: 0, color: '#0f172a', fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.025em' }}>Randevularım</h2>
                  <p style={{ margin: '6px 0 0 0', color: '#64748b', fontSize: '0.95rem', lineHeight: 1.5 }}>Geçmiş ve gelecek randevu taleplerinizin durumunu anlık olarak buradan takip edebilirsiniz.</p>
                </div>
                <button 
                  onClick={() => navigate('/')} 
                  style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', padding: '10px 18px', borderRadius: '10px', cursor: 'pointer', fontWeight: 600, color: '#475569', fontSize: '0.875rem', transition: 'all 0.2s', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}
                >
                  ← Ana Sayfaya Dön
                </button>
              </div>
              
              {appointments.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px', color: '#94a3b8', fontSize: '1rem', fontWeight: 500 }}>
                  Henüz hiç randevu talebiniz bulunmuyor.
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                        <th style={{ padding: '18px 24px', color: '#475569', fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.05em' }}>SALON / DÜKKAN</th>
                        <th style={{ padding: '18px 24px', color: '#475569', fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.05em' }}>PERSONEL</th>
                        <th style={{ padding: '18px 24px', color: '#475569', fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.05em' }}>HİZMET</th>
                        <th style={{ padding: '18px 24px', color: '#475569', fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.05em' }}>TARİH / SAAT</th>
                        <th style={{ padding: '18px 24px', color: '#475569', fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.05em' }}>TUTAR</th>
                        <th style={{ padding: '18px 24px', color: '#475569', fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.05em' }}>DURUM</th>
                        <th style={{ padding: '18px 24px', color: '#475569', fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.05em', textAlign: 'center' }}>İŞLEM</th>
                      </tr>
                    </thead>
                    <tbody>
                      {appointments.map((app) => {
                        const isRowHovered = hoveredRowId === app.id;
                        return (
                          <tr 
                            key={app.id} 
                            onMouseEnter={() => setHoveredRowId(app.id)}
                            onMouseLeave={() => setHoveredRowId(null)}
                            style={{ 
                              borderBottom: '1px solid #f1f5f9', 
                              backgroundColor: isRowHovered ? '#f8fafc' : '#ffffff',
                              transition: 'background-color 0.15s ease' 
                            }}
                          >
                            <td style={{ padding: '20px 24px', fontWeight: 700, color: '#0f172a', fontSize: '0.95rem' }}>{app.shopName}</td>
                            <td style={{ padding: '20px 24px', color: '#334155', fontSize: '0.9rem', fontWeight: 500 }}>{app.employeeName}</td>
                            <td style={{ padding: '20px 24px', color: '#475569', fontSize: '0.9rem' }}>{app.serviceName}</td>
                            <td style={{ padding: '20px 24px', color: '#0f172a', fontWeight: 600, fontSize: '0.9rem' }}>
                              {new Date(app.appointmentTime).toLocaleString('tr-TR', { dateStyle: 'short', timeStyle: 'short' })}
                            </td>
                            <td style={{ padding: '20px 24px', fontWeight: 800, color: '#6366f1', fontSize: '0.95rem' }}>{app.price} TL</td>
                            <td style={{ padding: '20px 24px' }}>
                              {renderStatusBadge(app.status)}
                            </td>
                            <td style={{ padding: '20px 24px', textAlign: 'center' }}>
                              {app.status === 'PENDING' || app.status === 'APPROVED' ? (
                                <button 
                                  onClick={() => handleCancel(app.id)}
                                  style={{ 
                                    backgroundColor: '#fee2e2', 
                                    color: '#ef4444', 
                                    border: 'none', 
                                    padding: '8px 14px', 
                                    borderRadius: '10px', 
                                    cursor: 'pointer', 
                                    fontWeight: 700, 
                                    fontSize: '0.85rem',
                                    transition: 'all 0.2s',
                                    boxShadow: '0 2px 4px rgba(239, 68, 68, 0.05)'
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = '#ef4444';
                                    e.currentTarget.style.color = '#ffffff';
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = '#fee2e2';
                                    e.currentTarget.style.color = '#ef4444';
                                  }}
                                >
                                  İptal Et
                                </button>
                              ) : (
                                <span style={{ color: '#94a3b8', fontSize: '0.9rem', fontWeight: 500 }}>-</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
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