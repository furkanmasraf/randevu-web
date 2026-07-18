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
    setIsSubmitting(true);
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
    navigate('/');
  };

  const getInputStyle = (inputName: string) => ({
    padding: '12px 14px',
    borderRadius: '10px',
    border: focusedInput === inputName ? '2px solid #b8863b' : '1px solid #e4ddd2',
    fontSize: '0.95rem',
    fontFamily: "'Inter', sans-serif",
    outline: 'none',
    backgroundColor: '#ffffff',
    color: '#1c1917',
    transition: 'all 0.2s',
    boxShadow: focusedInput === inputName ? '0 0 0 4px rgba(184, 134, 59, 0.15)' : 'none',
  });

  const renderStatusBadge = (status: string) => {
    const baseStyle = { padding: '6px 14px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 700, display: 'inline-block', textAlign: 'center' as const, whiteSpace: 'nowrap' as const, fontFamily: "'Inter', sans-serif" };
    switch (status) {
      case 'APPROVED': return <span style={{ ...baseStyle, color: '#3f7a4e', backgroundColor: '#eef6ee' }}>Onaylandı</span>;
      case 'PENDING': return <span style={{ ...baseStyle, color: '#a06a24', backgroundColor: '#faf3e5' }}>Bekliyor</span>;
      case 'CANCELLED': return <span style={{ ...baseStyle, color: '#a3402f', backgroundColor: '#fbeeea' }}>İptal Edildi</span>;
      case 'REJECTED': return <span style={{ ...baseStyle, color: '#78706a', backgroundColor: '#f2ede3' }}>Reddedildi</span>;
      default: return <span style={{ ...baseStyle, color: '#78706a', backgroundColor: '#f2ede3' }}>{status}</span>;
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f6f3ee', color: '#8a7f6e', fontFamily: "'Inter', sans-serif", fontSize: '1rem', fontWeight: 500 }}>
        Panel yükleniyor...
      </div>
    );
  }

  const SidebarButton = ({ onClick, active, label, isDanger = false }: any) => (
    <button
      onClick={onClick}
      className="mkl-side-btn"
      style={{
        width: '100%',
        textAlign: 'left',
        padding: '13px 14px',
        borderRadius: '10px',
        border: 'none',
        position: 'relative',
        backgroundColor: isDanger ? 'rgba(163, 64, 47, 0.18)' : (active ? 'rgba(184, 134, 59, 0.16)' : 'transparent'),
        color: isDanger ? '#e08b78' : (active ? '#d9b579' : '#a89b8a'),
        fontWeight: active || isDanger ? 700 : 600,
        cursor: 'pointer',
        fontSize: '0.92rem',
        fontFamily: "'Inter', sans-serif",
        transition: 'all 0.2s',
        paddingLeft: active ? '18px' : '14px'
      }}
    >
      {active && (
        <span style={{
          position: 'absolute',
          left: 0,
          top: '50%',
          transform: 'translateY(-50%)',
          width: '3px',
          height: '60%',
          borderRadius: '3px',
          background: 'linear-gradient(180deg, #b8863b 0%, #7a2e2e 100%)'
        }} />
      )}
      {label}
    </button>
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: "'Inter', system-ui, sans-serif", backgroundColor: '#f6f3ee', margin: 0 }}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600;700;800&display=swap');

        .mkl-side-btn:hover {
          background-color: rgba(250, 247, 242, 0.06) !important;
        }

        .mkl-hamburger:hover {
          background-color: #b8863b !important;
        }

        .mkl-back-btn:hover {
          border-color: #b8863b !important;
          color: #b8863b !important;
        }

        .mkl-appt-card {
          transition: transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease;
        }
        .mkl-appt-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 22px -10px rgba(28, 25, 23, 0.16);
          border-color: #e0d3ba;
        }

        .mkl-cancel-btn {
          transition: background-color 0.2s ease;
        }
        .mkl-cancel-btn:hover {
          background-color: #f3ddd6 !important;
        }

        .mkl-save-btn {
          transition: background-color 0.2s ease, transform 0.15s ease;
        }
        .mkl-save-btn:hover:not(:disabled) {
          background-color: #b8863b !important;
        }

        @media (max-width: 480px) {
          .mkl-content-wrap {
            padding: 16px !important;
          }
          .mkl-content-card {
            padding: 20px !important;
            border-radius: 16px !important;
          }
        }
      `}</style>

      {/* MOBİL HAMBURGER BUTONU */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="mkl-hamburger"
        style={{
          position: 'fixed', top: '16px', left: '16px', zIndex: 1100,
          padding: '10px 14px', backgroundColor: '#1c1917', color: '#faf7f2',
          border: 'none', borderRadius: '10px', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.15)',
          transition: 'background-color 0.2s ease', fontSize: '0.95rem'
        }}
      >
        {isSidebarOpen ? '✕' : '☰'}
      </button>

      {/* SOL SIDEBAR */}
      <div style={{
        width: '260px',
        backgroundColor: '#1c1917',
        color: '#faf7f2',
        padding: '32px 20px',
        display: isSidebarOpen ? 'flex' : 'none',
        flexDirection: 'column',
        position: 'fixed',
        height: '100%',
        zIndex: 1000,
        boxShadow: '4px 0 30px rgba(0,0,0,0.15)'
      }}
        className="md:!flex md:static"
      >
        <div style={{ marginBottom: '40px', paddingLeft: '10px' }}>
          <h2 style={{ margin: 0, fontFamily: "'Fraunces', serif", fontSize: '1.5rem', fontWeight: 600 }}>
            Makas<span style={{ fontStyle: 'italic', color: '#c9a267' }}>Lab</span>
          </h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flexGrow: 1 }}>
          <SidebarButton
            onClick={() => { setActiveTab('profile'); setIsSidebarOpen(false); }}
            active={activeTab === 'profile'}
            label="Profil Bilgilerim"
          />
          <SidebarButton
            onClick={() => { setActiveTab('appointments'); setIsSidebarOpen(false); }}
            active={activeTab === 'appointments'}
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
            backgroundColor: 'rgba(20,17,15,0.5)', zIndex: 900
          }}
        />
      )}

      {/* SAĞ İÇERİK ALANI */}
      <div className="mkl-content-wrap" style={{
        flex: 1,
        padding: '32px',
        maxWidth: '100%',
        overflowX: 'hidden'
      }}>
        <div className="mkl-content-card" style={{
          backgroundColor: '#ffffff',
          padding: '40px',
          borderRadius: '20px',
          border: '1px solid #ece4d5',
          boxShadow: '0 2px 8px -2px rgba(28, 25, 23, 0.06)'
        }}>

          {/* SEKME 1: RANDEVULARIM */}
          {activeTab === 'appointments' && (
            <div>
              <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                  <h2 style={{ margin: 0, fontFamily: "'Fraunces', serif", color: '#1c1917', fontSize: '1.8rem', fontWeight: 600 }}>Randevularım</h2>
                  <p style={{ margin: '6px 0 0 0', color: '#78706a', fontSize: '0.92rem' }}>Tüm randevu geçmişinizi ve gelecek planlarınızı görüntüleyin.</p>
                </div>
                <button
                  onClick={() => navigate('/')}
                  className="mkl-back-btn"
                  style={{
                    backgroundColor: '#ffffff', border: '1px solid #e4ddd2', padding: '10px 20px', borderRadius: '10px',
                    cursor: 'pointer', fontWeight: 600, color: '#3d3630', fontSize: '0.875rem',
                    fontFamily: "'Inter', sans-serif",
                    transition: 'all 0.2s', boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
                  }}
                >
                  ← Ana Sayfa
                </button>
              </div>

              {appointments.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px', color: '#a39785', fontFamily: "'Inter', sans-serif" }}>Henüz randevunuz bulunmuyor.</div>
              ) : (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                  gap: '18px'
                }}>
                  {appointments.map((app) => (
                    <div key={app.id} className="mkl-appt-card" style={{
                      padding: '22px',
                      background: '#fff',
                      borderRadius: '16px',
                      border: '1px solid #ece4d5',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '14px'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <h3 style={{ margin: 0, fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: '1.1rem', color: '#1c1917' }}>{app.shopName}</h3>
                          <span style={{ fontSize: '0.82rem', color: '#78706a' }}>{new Date(app.appointmentTime).toLocaleString('tr-TR', { dateStyle: 'long', timeStyle: 'short' })}</span>
                        </div>
                        {renderStatusBadge(app.status)}
                      </div>

                      <div style={{ fontSize: '0.88rem', color: '#3d3630', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <div style={{ color: '#78706a' }}>{app.shopAddress || '-'}</div>
                        <div style={{ color: '#78706a' }}>{app.shopPhone || '-'}</div>
                        <div style={{ display: 'flex', gap: '16px', marginTop: '2px', padding: '10px', background: '#faf8f4', borderRadius: '10px', flexWrap: 'wrap' }}>
                          <span>{app.employeeName}</span>
                          <span>{app.serviceName}</span>
                        </div>
                        <div style={{ fontWeight: 700, color: '#b8863b', fontSize: '1.05rem', marginTop: '2px', fontFamily: "'Fraunces', serif" }}>{app.price} TL</div>
                      </div>

                      {(app.status === 'PENDING' || app.status === 'APPROVED') && (
                        <button
                          onClick={() => handleCancel(app.id)}
                          className="mkl-cancel-btn"
                          style={{
                            width: '100%',
                            backgroundColor: '#fbeeea',
                            color: '#a3402f',
                            border: 'none',
                            padding: '11px',
                            borderRadius: '10px',
                            fontWeight: 700,
                            fontFamily: "'Inter', sans-serif",
                            cursor: 'pointer'
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

          {/* SEKME 2: PROFİL BİLGİLERİM */}
          {activeTab === 'profile' && (
            <div style={{ maxWidth: '600px', backgroundColor: '#fff' }}>

              <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                  <h2 style={{ color: '#1c1917', fontFamily: "'Fraunces', serif", fontSize: '1.6rem', fontWeight: 600, margin: 0 }}>Profil Ayarları</h2>
                  <p style={{ color: '#78706a', margin: '8px 0 0 0', fontSize: '0.92rem' }}>Kişisel bilgilerinizi buradan yönetebilirsiniz.</p>
                </div>
                <button
                  onClick={() => navigate('/')}
                  className="mkl-back-btn"
                  style={{
                    backgroundColor: '#ffffff', border: '1px solid #e4ddd2', padding: '10px 20px', borderRadius: '10px',
                    cursor: 'pointer', fontWeight: 600, color: '#3d3630', fontSize: '0.875rem',
                    fontFamily: "'Inter', sans-serif",
                    transition: 'all 0.2s', boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
                  }}
                >
                  ← Ana Sayfa
                </button>
              </div>

              <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: '140px' }}>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#3d3630', marginBottom: '8px', letterSpacing: '0.05em', fontFamily: "'Inter', sans-serif" }}>AD</label>
                    <input type="text" value={profileData.firstName} onFocus={() => setFocusedInput('firstName')} onBlur={() => setFocusedInput('')} onChange={e => setProfileData(prev => ({ ...prev, firstName: e.target.value }))} style={{ ...getInputStyle('firstName'), width: '100%', boxSizing: 'border-box' }} required />
                  </div>
                  <div style={{ flex: 1, minWidth: '140px' }}>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#3d3630', marginBottom: '8px', letterSpacing: '0.05em', fontFamily: "'Inter', sans-serif" }}>SOYAD</label>
                    <input type="text" value={profileData.lastName} onFocus={() => setFocusedInput('lastName')} onBlur={() => setFocusedInput('')} onChange={e => setProfileData(prev => ({ ...prev, lastName: e.target.value }))} style={{ ...getInputStyle('lastName'), width: '100%', boxSizing: 'border-box' }} required />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#3d3630', marginBottom: '8px', letterSpacing: '0.05em', fontFamily: "'Inter', sans-serif" }}>E-POSTA ADRESİ</label>
                  <input type="email" value={profileData.email} disabled style={{ ...getInputStyle('email'), width: '100%', boxSizing: 'border-box', backgroundColor: '#f2ede3', color: '#a39785', cursor: 'not-allowed' }} />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#3d3630', marginBottom: '8px', letterSpacing: '0.05em', fontFamily: "'Inter', sans-serif" }}>TELEFON NUMARASI</label>
                  <input type="tel" value={profileData.phoneNumber} onFocus={() => setFocusedInput('phone')} onBlur={() => setFocusedInput('')} onChange={e => setProfileData(prev => ({ ...prev, phoneNumber: e.target.value }))} style={{ ...getInputStyle('phone'), width: '100%', boxSizing: 'border-box' }} required />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#3d3630', marginBottom: '8px', letterSpacing: '0.05em', fontFamily: "'Inter', sans-serif" }}>YENİ ŞİFRE</label>
                  <input type="password" value={profileData.password} onFocus={() => setFocusedInput('password')} onBlur={() => setFocusedInput('')} onChange={e => setProfileData(prev => ({ ...prev, password: e.target.value }))} placeholder="••••••••" style={{ ...getInputStyle('password'), width: '100%', boxSizing: 'border-box' }} />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="mkl-save-btn"
                  style={{
                    width: '100%',
                    backgroundColor: isSubmitting ? '#9a9186' : '#1c1917',
                    color: '#faf7f2',
                    border: 'none',
                    padding: '15px',
                    borderRadius: '10px',
                    fontWeight: 700,
                    fontFamily: "'Inter', sans-serif",
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
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