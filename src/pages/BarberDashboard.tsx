import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

interface Appointment {
  id: number;
  customerName: string;
  customerPhone: string;
  employeeName: string;
  serviceName: string;
  appointmentTime: string;
  status: 'PENDING' | 'APPROVED' | 'CANCELLED' | 'REJECTED';
}

interface ServiceItem {
  id: number;
  name: string;
  price: number;
  durationInMinutes: number;
}

interface EmployeeItem {
  id: number;
  firstName: string;
  lastName: string;
}

export default function BarberDashboard() {
  const [activeTab, setActiveTab] = useState<'appointments' | 'services' | 'hours' | 'employees'>('appointments');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [employees, setEmployees] = useState<EmployeeItem[]>([]);
  const [dynamicShopId, setDynamicShopId] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  
  // Sidebar durum takibi
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);

  // Form State'leri
  const [newServiceName, setNewServiceName] = useState('');
  const [newServicePrice, setNewServicePrice] = useState('');
  const [newServiceDuration, setNewServiceDuration] = useState('30');
  const [newEmployeeName, setNewEmployeeName] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('20:00');

  // Etkileşim Takipleri
  const [focusedInput, setFocusedInput] = useState<string>('');
  const [hoveredRowId, setHoveredRowId] = useState<number | null>(null);

  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('userId');
  const role = localStorage.getItem('role');

  useEffect(() => {
    if (!token || role !== 'SHOP_OWNER') {
      navigate('/login');
      return;
    }

    const fetchAllDashboardData = async () => {
      setLoading(true);
      let currentShopId: number | null = null;

      try {
        const shopRes = await axios.get(`http://localhost:8080/api/shops/owner/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const shopData = shopRes.data;
        const exactShopId = shopData?.id || shopData?.shopId;

        if (exactShopId) {
          currentShopId = exactShopId;
          setDynamicShopId(exactShopId);
          if (shopData.startTime) setStartTime(shopData.startTime);
          if (shopData.endTime) setEndTime(shopData.endTime);
        }
      } catch (shopError) {
        console.error("Dükkan bilgisi çekilirken hata:", shopError);
      }

      if (currentShopId) {
        // HİZMETLERİ ÇEK
        try {
          const serviceRes = await axios.get(`http://localhost:8080/api/shops/${currentShopId}/services`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setServices(Array.isArray(serviceRes.data) ? serviceRes.data : []);
        } catch (error) {
          setServices([]);
        }

        // PERSONELLERİ ÇEK
        try {
          const empRes = await axios.get(`http://localhost:8080/api/employees/shop/${currentShopId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setEmployees(Array.isArray(empRes.data) ? empRes.data : []);
        } catch (error) {
          setEmployees([]);
        }
      }

      try {
        const appRes = await axios.get(`http://localhost:8080/api/appointments/shop/owner/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setAppointments(Array.isArray(appRes.data) ? appRes.data : []);
      } catch (error) {
        setAppointments([]);
      }
      setLoading(false);
    };

    fetchAllDashboardData();
  }, [navigate, token, role, userId]);

  const updateStatus = async (id: number, newStatus: 'APPROVED' | 'REJECTED') => {
    try {
      await axios.put(`http://localhost:8080/api/appointments/${id}/status?status=${newStatus}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAppointments(prev => prev.map(app => app.id === id ? { ...app, status: newStatus } : app));
      alert(`Randevu durumu ${newStatus === 'APPROVED' ? 'Onaylandı' : 'Reddedildi'}.`);
    } catch (error) {
      alert("Durum güncellenirken bir hata oluştu.");
    }
  };

  const handleAddService = async () => {
    if (!dynamicShopId || !newServiceName || !newServicePrice) return;
    try {
      const res = await axios.post(`http://localhost:8080/api/shops/${dynamicShopId}/services`, {
        name: newServiceName,
        price: parseFloat(newServicePrice),
        durationInMinutes: parseInt(newServiceDuration)
      }, { headers: { Authorization: `Bearer ${token}` } });
      setServices(prev => [...prev, res.data]);
      setNewServiceName('');
      setNewServicePrice('');
      alert("Hizmet başarıyla eklendi.");
    } catch (error) {
      alert("Hizmet eklenirken hata oluştu.");
    }
  };

  const handleDeleteService = async (id: number) => {
    if (!window.confirm("Bu hizmeti silmek istediğinize emin misiniz?")) return;
    try {
      await axios.delete(`http://localhost:8080/api/shops/services/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      setServices(prev => prev.filter(item => (item?.id || (item as any)?.serviceId) !== id));
      alert("Hizmet silindi.");
    } catch (error) {
      alert("Hizmet silinirken hata oluştu.");
    }
  };

  // PERSONEL EKLEME — SQL first_name ve last_name not-null kısıtlamalarına göre güncellendi
  const handleAddEmployee = async () => {
    if (!dynamicShopId || !newEmployeeName.trim()) {
      alert("Lütfen personel adı ve soyadını doldurun.");
      return;
    }
    try {
      // Girilen Ad Soyad bilgisini parçalıyoruz
      const nameParts = newEmployeeName.trim().split(' ');
      const firstName = nameParts.slice(0, -1).join(' ') || nameParts[0];
      const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : '';

      const payload = {
        firstName: firstName,
        lastName: lastName,
        shop: {
          id: Number(dynamicShopId)
        }
      };

      const res = await axios.post(`http://localhost:8080/api/employees`, payload, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      
      setEmployees(prev => [...prev, res.data]);
      setNewEmployeeName('');
      alert("Personel başarıyla veritabanına kaydedildi!");
    } catch (error: any) {
      console.error("Personel eklenemedi:", error);
      alert(error.response?.data?.message || "Personel eklenirken bir hata oluştu.");
    }
  };

  const handleDeleteEmployee = async (id: number) => {
    if (!window.confirm("Bu personeli silmek istediğinize emin misiniz?")) return;
    try {
      await axios.delete(`http://localhost:8080/api/shops/employees/${id}`, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      setEmployees(prev => prev.filter(emp => emp.id !== id));
      alert("Personel sistemden silindi.");
    } catch (error) {
      alert("Personel silinirken hata oluştu.");
    }
  };

  const handleSaveHours = async () => {
    if (!dynamicShopId) return;
    try {
      await axios.put(`http://localhost:8080/api/shops/${dynamicShopId}/working-hours`, { startTime, endTime }, { headers: { Authorization: `Bearer ${token}` } });
      alert("Saatler güncellendi.");
    } catch (error) {
      alert("Saatler güncellenirken hata oluştu.");
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
      case 'PENDING': return <span style={{ ...baseStyle, backgroundColor: '#fffbeb', color: '#b45309' }}>Bekliyor</span>;
      case 'APPROVED': return <span style={{ ...baseStyle, backgroundColor: '#f0fdf4', color: '#15803d' }}>Onaylandı</span>;
      case 'CANCELLED': return <span style={{ ...baseStyle, backgroundColor: '#fef2f2', color: '#b91c1c' }}>İptal Edildi</span>;
      case 'REJECTED': return <span style={{ ...baseStyle, backgroundColor: '#f8fafc', color: '#475569' }}>Reddedildi</span>;
      default: return <span style={{ ...baseStyle, backgroundColor: '#f3f4f6', color: '#1f2937' }}>{status}</span>;
    }
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f1f5f9', color: '#64748b' }}>Yönetim Paneli Güvenle Hazırlanıyor...</div>;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: '"Inter", system-ui, sans-serif', backgroundColor: '#f1f5f9', margin: 0 }}>
      
      {/* SIDEBAR */}
      <div style={{ 
        width: isSidebarCollapsed ? '76px' : '260px', 
        backgroundColor: '#1e293b', 
        color: '#ffffff', 
        padding: '32px 14px', 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '10px', 
        boxShadow: '4px 0 30px rgba(0,0,0,0.02)',
        transition: 'width 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        overflow: 'hidden',
        position: 'relative'
      }}>
        <div 
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          style={{ width: '100%', display: 'flex', justifyContent: isSidebarCollapsed ? 'center' : 'flex-end', padding: '0 8px', marginBottom: '24px', cursor: 'pointer', color: '#94a3b8' }}
        >
          <span style={{ fontSize: '1.4rem' }}>{isSidebarCollapsed ? '☰' : '✕'}</span>
        </div>

        <div style={{ marginBottom: '30px', paddingLeft: '10px', opacity: isSidebarCollapsed ? 0 : 1, transition: 'opacity 0.15s', whiteSpace: 'nowrap' }}>
          <h2 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 800 }}>
            Makas<span style={{ color: '#818cf8' }}>Lab</span>
          </h2>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>PRO Yönetim</div>
        </div>
        
        {/* SEKMELER */}
        <button 
          onClick={() => setActiveTab('appointments')} 
          style={{ width: '100%', textAlign: 'left', padding: '14px', borderRadius: '12px', border: 'none', backgroundColor: activeTab === 'appointments' ? 'rgba(255,255,255,0.1)' : 'transparent', color: activeTab === 'appointments' ? '#818cf8' : '#94a3b8', fontWeight: 600, cursor: 'pointer', fontSize: '0.95rem', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '12px', whiteSpace: 'nowrap' }}
        >
          <span>📅</span> {!isSidebarCollapsed && 'Randevu Talepleri'}
        </button>
        <button 
          onClick={() => setActiveTab('services')} 
          style={{ width: '100%', textAlign: 'left', padding: '14px', borderRadius: '12px', border: 'none', backgroundColor: activeTab === 'services' ? 'rgba(255,255,255,0.1)' : 'transparent', color: activeTab === 'services' ? '#818cf8' : '#94a3b8', fontWeight: 600, cursor: 'pointer', fontSize: '0.95rem', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '12px', whiteSpace: 'nowrap' }}
        >
          <span>✂️</span> {!isSidebarCollapsed && 'Hizmetler & Fiyatlar'}
        </button>
        <button 
          onClick={() => setActiveTab('employees')} 
          style={{ width: '100%', textAlign: 'left', padding: '14px', borderRadius: '12px', border: 'none', backgroundColor: activeTab === 'employees' ? 'rgba(255,255,255,0.1)' : 'transparent', color: activeTab === 'employees' ? '#818cf8' : '#94a3b8', fontWeight: 600, cursor: 'pointer', fontSize: '0.95rem', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '12px', whiteSpace: 'nowrap' }}
        >
          <span>👤</span> {!isSidebarCollapsed && 'Personel Yönetimi'}
        </button>
        <button 
          onClick={() => setActiveTab('hours')} 
          style={{ width: '100%', textAlign: 'left', padding: '14px', borderRadius: '12px', border: 'none', backgroundColor: activeTab === 'hours' ? 'rgba(255,255,255,0.1)' : 'transparent', color: activeTab === 'hours' ? '#818cf8' : '#94a3b8', fontWeight: 600, cursor: 'pointer', fontSize: '0.95rem', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '12px', whiteSpace: 'nowrap' }}
        >
          <span>🕒</span> {!isSidebarCollapsed && 'Çalışma Saatleri'}
        </button>

        <button 
          onClick={handleLogout} 
          style={{ width: '100%', textAlign: 'left', padding: '14px', borderRadius: '12px', border: 'none', backgroundColor: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', fontWeight: 700, cursor: 'pointer', marginTop: 'auto', fontSize: '0.95rem', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '12px', whiteSpace: 'nowrap' }}
        >
          <span>🚪</span> {!isSidebarCollapsed && 'Çıkış Yap'}
        </button>
      </div>

      {/* SAĞ İÇERİK ALANI */}
      <div style={{ flex: 1, padding: '40px', overflowX: 'hidden', overflowY: 'auto', maxHeight: '100vh', boxSizing: 'border-box' }}>
        <div style={{ backgroundColor: '#ffffff', padding: '40px', borderRadius: '20px', boxShadow: '0 4px 18px rgba(0,0,0,0.01)', border: '1px solid #e2e8f0' }}>

          {/* SEKME 1: RANDEVULAR */}
          {activeTab === 'appointments' && (
            <div>
              <div style={{ marginBottom: '32px' }}>
                <h2 style={{ color: '#0f172a', fontSize: '1.75rem', fontWeight: 800, margin: 0, letterSpacing: '-0.025em' }}>Gelen Randevu Talepleri</h2>
                <p style={{ color: '#64748b', margin: '6px 0 0 0', fontSize: '0.95rem' }}>Müşterilerinizden gelen anlık koltuk ve hizmet isteklerini buradan yönetebilirsiniz.</p>
              </div>
              
              {appointments.length === 0 ? (
                <div style={{ padding: '60px', textAlign: 'center', color: '#94a3b8', fontWeight: 500 }}>Henüz bir randevu talebi bulunmuyor.</div>
              ) : (
                <div style={{ borderRadius: '12px', border: '1px solid #e2e8f0', overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '700px' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                        <th style={{ padding: '18px 24px', color: '#475569', fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.05em' }}>MÜŞTERİ</th>
                        <th style={{ padding: '18px 24px', color: '#475569', fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.05em' }}>PERSONEL</th>
                        <th style={{ padding: '18px 24px', color: '#475569', fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.05em' }}>HİZMET</th>
                        <th style={{ padding: '18px 24px', color: '#475569', fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.05em' }}>TARİH / SAAT</th>
                        <th style={{ padding: '18px 24px', color: '#475569', fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.05em' }}>DURUM</th>
                        <th style={{ padding: '18px 24px', color: '#475569', fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.05em', textAlign: 'center' }}>İŞLEM</th>
                      </tr>
                    </thead>
                    <tbody>
                      {appointments.map(app => {
                        const isRowHovered = hoveredRowId === app.id;
                        return (
                          <tr 
                            key={app.id} 
                            onMouseEnter={() => setHoveredRowId(app.id)}
                            onMouseLeave={() => setHoveredRowId(null)}
                            style={{ borderBottom: '1px solid #f1f5f9', backgroundColor: isRowHovered ? '#f8fafc' : '#ffffff', transition: 'background-color 0.1s' }}
                          >
                            <td style={{ padding: '18px 24px' }}>
                              <strong style={{ color: '#0f172a', fontSize: '0.95rem' }}>{app?.customerName}</strong>
                              <br/><span style={{ fontSize: '0.825rem', color: '#64748b', marginTop: '2px', display: 'inline-block' }}>{app?.customerPhone}</span>
                            </td>
                            <td style={{ padding: '18px 24px', color: '#334155', fontWeight: 500, fontSize: '0.9rem' }}>{app?.employeeName}</td>
                            <td style={{ padding: '18px 24px', color: '#475569', fontSize: '0.9rem' }}>{app?.serviceName}</td>
                            <td style={{ padding: '18px 24px', color: '#0f172a', fontWeight: 600, fontSize: '0.9rem' }}>
                              {app?.appointmentTime ? new Date(app.appointmentTime).toLocaleString('tr-TR', { dateStyle: 'short', timeStyle: 'short' }) : ''}
                            </td>
                            <td style={{ padding: '18px 24px' }}>
                              {renderStatusBadge(app?.status)}
                            </td>
                            <td style={{ padding: '18px 24px', textAlign: 'center' }}>
                              {app?.status === 'PENDING' ? (
                                <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                  <button onClick={() => updateStatus(app.id, 'APPROVED')} style={{ backgroundColor: '#16a34a', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem' }}>Onayla</button>
                                  <button onClick={() => updateStatus(app.id, 'REJECTED')} style={{ backgroundColor: '#fee2e2', color: '#ef4444', border: 'none', padding: '8px 14px', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem' }}>Reddet</button>
                                </div>
                              ) : <span style={{ color: '#94a3b8', fontSize: '0.875rem', fontWeight: 500 }}>İşlendi</span>}
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

          {/* SEKME 2: HİZMETLER & FİYATLAR */}
          {activeTab === 'services' && (
            <div>
              <div style={{ marginBottom: '32px' }}>
                <h2 style={{ color: '#0f172a', fontSize: '1.85rem', fontWeight: 800, margin: 0, letterSpacing: '-0.025em' }}>Hizmet ve Fiyat Yönetimi</h2>
                <p style={{ color: '#64748b', margin: '6px 0 0 0', fontSize: '0.95rem' }}>Dükkanınızda sunulan hizmet menüsünü buradan güncelleyebilirsiniz.</p>
              </div>
              
              <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0', display: 'flex', gap: '16px', alignItems: 'flex-end', marginBottom: '32px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 2, minWidth: '200px' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#475569' }}>HİZMET ADI</label>
                  <input type="text" value={newServiceName} onFocus={() => setFocusedInput('srvName')} onBlur={() => setFocusedInput('')} onChange={e => setNewServiceName(e.target.value)} placeholder="Örn: Saç Kesimi" style={getInputStyle('srvName')} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1, minWidth: '100px' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#475569' }}>FİYAT (TL)</label>
                  <input type="number" value={newServicePrice} onFocus={() => setFocusedInput('srvPrice')} onBlur={() => setFocusedInput('')} onChange={e => setNewServicePrice(e.target.value)} placeholder="300" style={getInputStyle('srvPrice')} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1, minWidth: '120px' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#475569' }}>SÜRE</label>
                  <select value={newServiceDuration} onFocus={() => setFocusedInput('srvDur')} onBlur={() => setFocusedInput('')} onChange={e => setNewServiceDuration(e.target.value)} style={{ ...getInputStyle('srvDur'), cursor: 'pointer' }}>
                    <option value="15">15 dk</option>
                    <option value="30">30 dk</option>
                    <option value="45">45 dk</option>
                    <option value="60">60 dk</option>
                  </select>
                </div>
                <button onClick={handleAddService} style={{ backgroundColor: '#6366f1', color: '#fff', border: 'none', padding: '14px 28px', borderRadius: '12px', fontWeight: 700, cursor: 'pointer', fontSize: '0.95rem' }}>Ekle</button>
              </div>

              <div style={{ borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                      <th style={{ padding: '18px 24px', color: '#475569', fontSize: '0.8rem', fontWeight: 700 }}>HİZMET ADI</th>
                      <th style={{ padding: '18px 24px', color: '#475569', fontSize: '0.8rem', fontWeight: 700 }}>SÜRE</th>
                      <th style={{ padding: '18px 24px', color: '#475569', fontSize: '0.8rem', fontWeight: 700 }}>FİYAT</th>
                      <th style={{ padding: '18px 24px', color: '#475569', fontSize: '0.8rem', fontWeight: 700, textAlign: 'center' }}>İŞLEM</th>
                    </tr>
                  </thead>
                  <tbody>
                    {services.map((item, index) => {
                      const currentId = item?.id || (item as any)?.serviceId;
                      return (
                        <tr key={currentId || index} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '18px 24px', fontWeight: 700, color: '#0f172a' }}>{item?.name}</td>
                          <td style={{ padding: '18px 24px', color: '#475569' }}>{item?.durationInMinutes} dakika</td>
                          <td style={{ padding: '18px 24px', color: '#16a34a', fontWeight: 800 }}>{item?.price} TL</td>
                          <td style={{ padding: '18px 24px', textAlign: 'center' }}>
                            <button onClick={() => handleDeleteService(currentId)} style={{ backgroundColor: 'transparent', color: '#ef4444', border: 'none', fontWeight: 700, cursor: 'pointer' }}>Sil</button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* SEKME 3: PERSONEL YÖNETİMİ */}
          {activeTab === 'employees' && (
            <div>
              <div style={{ marginBottom: '32px' }}>
                <h2 style={{ color: '#0f172a', fontSize: '1.85rem', fontWeight: 800, margin: 0, letterSpacing: '-0.025em' }}>Personel Yönetimi</h2>
                <p style={{ color: '#64748b', margin: '6px 0 0 0', fontSize: '0.95rem' }}>Dükkanınızda hizmet veren uzman kadroyu buradan yönetebilir ve yeni ekip arkadaşları ekleyebilirsiniz.</p>
              </div>
              
              <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0', display: 'flex', gap: '16px', alignItems: 'flex-end', marginBottom: '32px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 2, minWidth: '200px' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#475569' }}>PERSONEL ADI SOYADI</label>
                  <input 
                    type="text" 
                    value={newEmployeeName}
                    onChange={(e) => setNewEmployeeName(e.target.value)}
                    placeholder="Örn: Ahmet Yılmaz" 
                    style={{
                      padding: '12px 14px',
                      borderRadius: '10px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.95rem',
                      outline: 'none',
                      backgroundColor: '#ffffff',
                      color: '#334155',
                      width: '100%',
                      boxSizing: 'border-box'
                    }}
                    required
                  />
                </div>
                <button onClick={handleAddEmployee} style={{ backgroundColor: '#6366f1', color: '#fff', border: 'none', padding: '14px 28px', borderRadius: '12px', fontWeight: 700, cursor: 'pointer', fontSize: '0.95rem' }}>Personel Ekle</button>
              </div>

              <div style={{ borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                      <th style={{ padding: '18px 24px', color: '#475569', fontSize: '0.8rem', fontWeight: 700 }}>PERSONEL ADI SOYADI</th>
                      <th style={{ padding: '18px 24px', color: '#475569', fontSize: '0.8rem', fontWeight: 700 }}>DURUM</th>
                      <th style={{ padding: '18px 24px', color: '#475569', fontSize: '0.8rem', fontWeight: 700, textAlign: 'center' }}>İŞLEM</th>
                    </tr>
                  </thead>
                  <tbody>
                    {employees.length === 0 ? (
                      <tr>
                        <td colSpan={3} style={{ padding: '24px', textAlign: 'center', color: '#94a3b8' }}>Henüz bir personel eklenmedi.</td>
                      </tr>
                    ) : (
                      employees.map((emp, index) => (
                        <tr key={emp.id || index} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '18px 24px', fontWeight: 700, color: '#0f172a' }}>
                            {emp.firstName} {emp.lastName}
                          </td>
                          <td style={{ padding: '18px 24px', color: '#475569', fontWeight: 500 }}>
                            Aktif Çalışan
                          </td>
                          <td style={{ padding: '18px 24px', textAlign: 'center' }}>
                            <button onClick={() => handleDeleteEmployee(emp.id)} style={{ backgroundColor: 'transparent', color: '#ef4444', border: 'none', fontWeight: 700, cursor: 'pointer' }}>Sil</button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* SEKME 4: ÇALIŞMA SAATLERİ */}
          {activeTab === 'hours' && (
            <div style={{ maxWidth: '500px' }}>
              <div style={{ marginBottom: '32px' }}>
                <h2 style={{ color: '#0f172a', fontSize: '1.85rem', fontWeight: 800, margin: 0, letterSpacing: '-0.025em' }}>Çalışma Saatleri</h2>
                <p style={{ color: '#64748b', margin: '6px 0 0 0', fontSize: '0.95rem' }}>Dükkanınızın açılış ve kapanış saatleri.</p>
              </div>
              
              <div style={{ backgroundColor: '#ffffff', padding: '28px', borderRadius: '20px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'flex', gap: '16px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#475569' }}>AÇILIŞ</label>
                    <input type="time" value={startTime} onFocus={() => setFocusedInput('openHr')} onBlur={() => setFocusedInput('')} onChange={e => setStartTime(e.target.value)} style={getInputStyle('openHr')} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#475569' }}>KAPANIŞ</label>
                    <input type="time" value={endTime} onFocus={() => setFocusedInput('closeHr')} onBlur={() => setFocusedInput('')} onChange={e => setEndTime(e.target.value)} style={getInputStyle('closeHr')} />
                  </div>
                </div>
                <button onClick={handleSaveHours} style={{ backgroundColor: '#0f172a', color: '#fff', border: 'none', padding: '14px', borderRadius: '12px', fontWeight: 700, cursor: 'pointer', marginTop: '10px' }}>Saatleri Güncelle</button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}