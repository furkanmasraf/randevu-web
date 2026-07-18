import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';

interface EmployeeItem {
  id: number;
  firstName: string;
  lastName: string;
}

interface ServiceItem {
  id: number;
  name: string;
  price: number;
}

export default function BarberDashboard() {
  const [busySlotsMap, setBusySlotsMap] = useState<Record<number, string[]>>({});
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const timeSlots = ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30", "18:00", "18:30", "19:00", "19:30"];
  const [activeTab, setActiveTab] = useState<'appointments' | 'services' | 'hours' | 'employees' | 'settings'>('appointments');
  const [employees, _setEmployees] = useState<EmployeeItem[]>([]);
  const [services, _setServices] = useState<ServiceItem[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [dynamicShopId, setDynamicShopId] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [appFilter, setAppFilter] = useState<'past' | 'today' | 'future'>('today');

  const [newServiceName, setNewServiceName] = useState('');
  const [newServicePrice, setNewServicePrice] = useState('');
  const [newEmployeeName, setNewEmployeeName] = useState('');
  const [shopDetails, setShopDetails] = useState<{ shopName?: string; phoneNumber?: string; imageUrl?: string; vitrinImageUrls?: string[]; latitude?: number; longitude?: number } | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [vitrinFiles, setVitrinFiles] = useState<File[]>([]);
  const sidebarRef = useRef<HTMLDivElement>(null);

  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('userId');
  const role = localStorage.getItem('role');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const removeFile = (indexToRemove: number) => {
    setVitrinFiles(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  const fetchBusySlots = async (employeeId: number, date: string) => {
    try {
      const response = await API.get(`https://randevu-sistemi-dv33.onrender.com/api/appointments/shop/employee-schedule`, {
        params: { employeeId, date },
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log(`Personel ${employeeId} için gelen dolu saatler:`, response.data);
      setBusySlotsMap(prev => ({ ...prev, [employeeId]: response.data }));
    } catch (err) {
      console.error("Dolu saatler çekilemedi:", err);
    }
  };

  const fetchAppointments = async (shopId: number, filter: string = 'today') => {
    try {
      const response = await API.get(`https://randevu-sistemi-dv33.onrender.com/api/appointments/shop/${shopId}/filter`, {
        params: { filter },
        headers: { Authorization: `Bearer ${token}` }
      });
      const sortedAppointments = response.data.sort((a: any, b: any) => {
        return new Date(b.appointmentTime).getTime() - new Date(a.appointmentTime).getTime();
      });
      setAppointments(sortedAppointments);
    } catch (err) {
      console.error("Randevular çekilemedi:", err);
    }
  };

  const fetchAllDashboardData = async () => {
    setLoading(true);
    try {
      const shopRes = await API.get(`https://randevu-sistemi-dv33.onrender.com/api/shops/owner/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log("Backend'den Gelen Dükkan Verisi:", shopRes.data);

      if (shopRes.data?.id) {
        const shopId = shopRes.data.id;
        setDynamicShopId(shopId);

        setShopDetails({
          shopName: shopRes.data.name || '',
          phoneNumber: shopRes.data.phoneNumber || '',
          imageUrl: shopRes.data.imageUrl || '',
          vitrinImageUrls: shopRes.data.vitrinImageUrls || [],
          latitude: shopRes.data.latitude || 0,
          longitude: shopRes.data.longitude || 0
        });

        await Promise.all([
          fetchAppointments(shopId, appFilter),
          API.get(`https://randevu-sistemi-dv33.onrender.com/api/appointments/shop/${shopId}/employees`, {
            headers: { Authorization: `Bearer ${token}` }
          }).then(res => _setEmployees(res.data)),

          API.get(`https://randevu-sistemi-dv33.onrender.com/api/services/shop/${shopId}`, {
            headers: { Authorization: `Bearer ${token}` }
          }).then(res => _setServices(res.data))
        ]);
      }
    } catch (err) {
      console.error("API İSTEK HATASI:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token || role !== 'SHOP_OWNER') {
      navigate('/login');
      return;
    }
    fetchAllDashboardData();
  }, [navigate, token, role, userId]);

  useEffect(() => {
    if (dynamicShopId) {
      fetchAppointments(dynamicShopId, appFilter);
    }
  }, [appFilter, dynamicShopId]);

  useEffect(() => {
    if (activeTab === 'hours' && dynamicShopId) {
      employees.forEach(emp => fetchBusySlots(emp.id, selectedDate));
    }
  }, [activeTab, selectedDate, dynamicShopId, appointments]);

  useEffect(() => {
    if (token && userId && role === 'SHOP_OWNER') {
      fetchAllDashboardData();
    }
  }, [userId]);

  const handleAddService = async () => {
    if (!dynamicShopId) return alert("Dükkan bilgisi yüklenemedi!");
    try {
      await API.post(`/api/services/shop/${dynamicShopId}`,
        { name: newServiceName, price: parseFloat(newServicePrice), durationInMinutes: 30 },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Hizmet eklendi.");
      window.location.reload();
    } catch { alert("Hizmet eklenemedi."); }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isSidebarOpen && window.innerWidth < 768 && sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        setIsSidebarOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isSidebarOpen]);

  const handleAddEmployee = async () => {
    if (!dynamicShopId) return alert("Dükkan bilgisi yüklenemedi!");
    const parts = newEmployeeName.trim().split(" ");
    const payload = { firstName: parts[0] || "-", lastName: parts.slice(1).join(" ") || "-" };

    try {
      await API.post(`/api/employees/shop/${dynamicShopId}`, payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Personel eklendi!");
      window.location.reload();
    } catch { alert("Personel eklenemedi."); }
  };

  const handleUpdateShop = async () => {
    const formData = new FormData();
    formData.append("shopName", shopDetails?.shopName || "");
    formData.append("phoneNumber", shopDetails?.phoneNumber || "");
    formData.append("existingImageUrls", JSON.stringify(shopDetails?.vitrinImageUrls || []));

    if (selectedFile) {
      formData.append("logo", selectedFile);
    } else if (shopDetails?.imageUrl === "") {
      formData.append("logoDeleted", "true");
    }
    vitrinFiles.forEach((file) => formData.append("vitrinFiles", file));

    try {
      await API.put(`/api/shops/${dynamicShopId}/update-with-image`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("Dükkan bilgileri ve görseller başarıyla güncellendi!");
    } catch (err) {
      console.error("Dükkan güncellemesi başarısız:", err);
      alert("Dükkan bilgileri güncellenemedi.");
    }
  };

  const handleDelete = async (type: 'employee' | 'service', id: number) => {
    if (!window.confirm("Emin misin?")) return;
    try {
      await API.delete(`https://randevu-sistemi-dv33.onrender.com/api/${type}s/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("Silindi!");
      window.location.reload();
    } catch {
      alert("Silme hatası!");
    }
  };

  const toggleSlotStatus = async (employeeId: number, time: string) => {
    const formattedTime = `${selectedDate}T${time}:00`;
    const isBusy = busySlotsMap[employeeId]?.includes(time);

    try {
      if (isBusy) {
        await API.delete(`https://randevu-sistemi-dv33.onrender.com/api/appointments/unblock`, {
          params: { employeeId, appointmentTime: formattedTime },
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await API.post(`https://randevu-sistemi-dv33.onrender.com/api/appointments/block`, {
          employeeId,
          appointmentTime: formattedTime
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }

      fetchBusySlots(employeeId, selectedDate);
    } catch (err) {
      console.error("İşlem hatası:", err);
      alert("İşlem gerçekleştirilemedi.");
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', backgroundColor: '#f6f3ee', color: '#1c1917', fontFamily: "'Inter', system-ui, sans-serif" }}>
        <div style={{ fontSize: '1.15rem', fontWeight: 700 }}>Yükleniyor...</div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f6f3ee', fontFamily: "'Inter', system-ui, sans-serif" }}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600;700;800&display=swap');

        .mkl-bd-hamburger:hover {
          background-color: #b8863b !important;
        }

        .mkl-bd-nav-btn:hover {
          background-color: rgba(250, 247, 242, 0.06) !important;
        }

        .mkl-bd-logout:hover {
          background-color: rgba(163, 64, 47, 0.15) !important;
        }

        .mkl-bd-filter-btn:hover {
          border-color: #b8863b !important;
        }

        .mkl-bd-input:focus {
          outline: none !important;
          border-color: #b8863b !important;
          box-shadow: 0 0 0 3px rgba(184, 134, 59, 0.15);
        }

        .mkl-bd-card {
          transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
        }
        .mkl-bd-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 22px -10px rgba(28, 25, 23, 0.16);
          border-color: #e0d3ba;
        }

        .mkl-bd-primary-btn {
          transition: background-color 0.2s ease;
        }
        .mkl-bd-primary-btn:hover {
          background-color: #b8863b !important;
        }

        .mkl-bd-approve-btn:hover {
          background-color: #b8863b !important;
        }

        .mkl-bd-reject-btn:hover {
          background-color: #f3ddd6 !important;
        }

        .mkl-bd-delete-btn:hover {
          background-color: #f3ddd6 !important;
        }

        .mkl-bd-upload-zone {
          transition: border-color 0.2s ease, background-color 0.2s ease;
        }
        .mkl-bd-upload-zone:hover {
          border-color: #b8863b !important;
        }

        .mkl-bd-slot {
          transition: transform 0.15s ease;
        }
        .mkl-bd-slot:hover {
          transform: scale(1.05);
        }

        @media (max-width: 480px) {
          .mkl-bd-main {
            padding: 20px !important;
          }
        }
      `}</style>

      {/* MOBİL HAMBURGER */}
      <button
        className="md:hidden mkl-bd-hamburger"
        style={{ position: 'fixed', top: '15px', left: '15px', zIndex: 99, background: '#1c1917', color: '#faf7f2', border: 'none', padding: '10px 15px', borderRadius: '10px', fontSize: '1.1rem', cursor: 'pointer', transition: 'background-color 0.2s ease' }}
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        ☰
      </button>

      {/* SIDEBAR */}
      <div
        ref={sidebarRef}
        style={{
          position: 'fixed', inset: '0', zIndex: 50, width: '280px', backgroundColor: '#1c1917', color: '#faf7f2',
          transform: isSidebarOpen ? 'translateX(0)' : 'translateX(-100%)', transition: 'transform 0.3s ease',
          padding: '40px 20px', display: 'flex', flexDirection: 'column'
        }} className="md:static md:transform-none">
        <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: '1.4rem', fontWeight: 600, marginBottom: '40px' }}>
          Makas<span style={{ fontStyle: 'italic', color: '#c9a267' }}>Lab</span>
        </h2>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {[
            { id: 'appointments', label: 'Randevular' },
            { id: 'services', label: 'Hizmet Yönetimi' },
            { id: 'employees', label: 'Personel Yönetimi' },
            { id: 'settings', label: 'İşletme Ayarları' },
            { id: 'hours', label: 'Personel Takvimi' }
          ].map(item => (
            <button
              key={item.id}
              className="mkl-bd-nav-btn"
              onClick={() => { setActiveTab(item.id as any); setIsSidebarOpen(false); }}
              style={{
                width: '100%', padding: '12px 14px', textAlign: 'left',
                background: activeTab === item.id ? 'rgba(184, 134, 59, 0.16)' : 'transparent',
                border: 'none',
                color: activeTab === item.id ? '#d9b579' : '#a89b8a',
                borderRadius: '10px', cursor: 'pointer', fontWeight: 600,
                fontFamily: "'Inter', sans-serif", fontSize: '0.92rem',
                transition: 'background-color 0.2s ease'
              }}
            >
              {item.label}
            </button>
          ))}
        </nav>
        <button
          onClick={handleLogout}
          className="mkl-bd-logout"
          style={{
            marginTop: 'auto',
            padding: '11px',
            backgroundColor: 'transparent',
            border: '1px solid #a3402f',
            color: '#e08b78',
            borderRadius: '10px',
            fontFamily: "'Inter', sans-serif",
            fontWeight: 600,
            cursor: 'pointer',
            width: '100%',
            transition: 'background-color 0.2s ease'
          }}
        >
          Çıkış Yap
        </button>
      </div>

      {/* ANA İÇERİK */}
      <main className="mkl-bd-main" style={{ flex: 1, padding: '40px', marginTop: '60px', maxWidth: '1200px', marginInline: 'auto' }}>
        {activeTab === 'appointments' && (
          <div>
            <header style={{ marginBottom: '30px' }}>
              <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: '1.8rem', fontWeight: 600, color: '#1c1917' }}>Randevular</h1>
              <div style={{ display: 'flex', gap: '10px', marginTop: '20px', flexWrap: 'wrap' }}>
                {['past', 'today', 'future'].map((f) => (
                  <button
                    key={f}
                    className="mkl-bd-filter-btn"
                    onClick={() => setAppFilter(f as any)}
                    style={{
                      padding: '10px 22px', borderRadius: '10px', border: appFilter === f ? '1px solid #1c1917' : '1px solid #e4ddd2', cursor: 'pointer', fontWeight: 700,
                      backgroundColor: appFilter === f ? '#1c1917' : '#fff', color: appFilter === f ? '#faf7f2' : '#78706a',
                      fontFamily: "'Inter', sans-serif",
                      boxShadow: '0 2px 4px rgba(28,25,23,0.05)', transition: 'border-color 0.2s ease'
                    }}
                  >
                    {f === 'past' ? 'Geçmiş' : f === 'today' ? 'Bugün' : 'Gelecek'}
                  </button>
                ))}
              </div>
            </header>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '20px'
            }}>
              {appointments.map((app) => {
                const getStatusStyle = (status: string) => {
                  switch (status) {
                    case 'APPROVED': return { label: 'Onaylandı', color: '#3f7a4e', bg: '#eef6ee' };
                    case 'REJECTED': return { label: 'Reddedildi', color: '#78706a', bg: '#f2ede3' };
                    case 'CANCELLED': return { label: 'İptal Edildi', color: '#a3402f', bg: '#fbeeea' };
                    case 'PENDING': return { label: 'Bekliyor', color: '#a06a24', bg: '#faf3e5' };
                    default: return { label: status, color: '#3d3630', bg: '#f2ede3' };
                  }
                };

                const statusStyle = getStatusStyle(app.status);

                function updateStatus(id: any, status: string): void {
                  if (!token) {
                    alert('Giriş bilgisi bulunamadı. Lütfen tekrar giriş yapın.');
                    return;
                  }

                  (async () => {
                    try {
                      await API.patch(`/api/appointments/${id}/status`, { status }, {
                        headers: { Authorization: `Bearer ${token}` }
                      });

                      if (dynamicShopId) {
                        await fetchAppointments(dynamicShopId, appFilter);
                      }
                    } catch (err) {
                      console.error('Randevu durumu güncellenemedi:', err);
                      alert('Randevu durumu güncellenemedi.');
                    }
                  })();
                }

                return (
                  <div key={app.id} className="mkl-bd-card" style={{
                    background: '#fff', borderRadius: '16px', padding: '22px', boxShadow: '0 2px 8px -2px rgba(28,25,23,0.06)',
                    border: '1px solid #ece4d5', display: 'flex', flexDirection: 'column', gap: '14px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <h4 style={{ fontFamily: "'Fraunces', serif", fontSize: '1.1rem', fontWeight: 600, margin: 0, color: '#1c1917' }}>{app.customerName}</h4>

                      <span style={{
                        fontSize: '0.75rem', fontWeight: 700, padding: '5px 12px', borderRadius: '8px',
                        backgroundColor: statusStyle.bg, color: statusStyle.color, fontFamily: "'Inter', sans-serif"
                      }}>
                        {statusStyle.label}
                      </span>
                    </div>

                    <div style={{ backgroundColor: '#faf8f4', padding: '14px', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '7px' }}>
                      <div style={{ fontSize: '0.88rem', color: '#78706a' }}>{new Date(app.appointmentTime).toLocaleString()}</div>
                      <div style={{ fontSize: '0.92rem', fontWeight: 600, color: '#1c1917' }}>{app.serviceName} - {app.price} TL</div>
                      <div style={{ fontSize: '0.88rem', color: '#78706a' }}>{app.employeeName}</div>
                      <div style={{ fontSize: '0.88rem', color: '#78706a' }}>{app.customerPhone}</div>
                    </div>

                    {app.status === 'PENDING' && (
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <button onClick={() => updateStatus(app.id, 'APPROVED')} className="mkl-bd-approve-btn" style={{ flex: 1, background: '#1c1917', color: '#faf7f2', border: 'none', padding: '11px', borderRadius: '10px', fontWeight: 700, cursor: 'pointer', fontFamily: "'Inter', sans-serif", transition: 'background-color 0.2s ease' }}>Onayla</button>
                        <button onClick={() => updateStatus(app.id, 'REJECTED')} className="mkl-bd-reject-btn" style={{ flex: 1, background: '#fbeeea', color: '#a3402f', border: 'none', padding: '11px', borderRadius: '10px', fontWeight: 700, cursor: 'pointer', fontFamily: "'Inter', sans-serif", transition: 'background-color 0.2s ease' }}>Reddet</button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'services' && (
          <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: '1.8rem', fontWeight: 600, color: '#1c1917', marginBottom: '24px' }}>Hizmet Yönetimi</h1>

            <div style={{
              backgroundColor: '#ffffff',
              borderRadius: '18px',
              padding: '22px',
              marginBottom: '28px',
              boxShadow: '0 2px 8px -2px rgba(28,25,23,0.06)',
              border: '1px solid #ece4d5'
            }}>
              <h3 style={{ marginTop: 0, marginBottom: '18px', fontSize: '1.05rem', fontFamily: "'Fraunces', serif", fontWeight: 600, color: '#1c1917' }}>Yeni Hizmet Ekle</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <input
                  className="mkl-bd-input"
                  value={newServiceName}
                  onChange={e => setNewServiceName(e.target.value)}
                  placeholder="Hizmet Adı (örn: Saç Kesimi)"
                  style={{ padding: '13px 14px', borderRadius: '10px', border: '1px solid #e4ddd2', fontSize: '0.95rem', fontFamily: "'Inter', sans-serif", color: '#1c1917' }}
                />
                <input
                  className="mkl-bd-input"
                  value={newServicePrice}
                  onChange={e => setNewServicePrice(e.target.value)}
                  placeholder="Fiyat (TL)"
                  type="number"
                  style={{ padding: '13px 14px', borderRadius: '10px', border: '1px solid #e4ddd2', fontSize: '0.95rem', fontFamily: "'Inter', sans-serif", color: '#1c1917' }}
                />
                <button
                  onClick={handleAddService}
                  className="mkl-bd-primary-btn"
                  style={{
                    backgroundColor: '#1c1917', color: '#faf7f2', border: 'none', padding: '13px',
                    borderRadius: '10px', fontWeight: 700, cursor: 'pointer', fontSize: '0.98rem', marginTop: '4px', fontFamily: "'Inter', sans-serif"
                  }}
                >
                  Hizmeti Kaydet
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {services.map(service => (
                <div key={service.id} className="mkl-bd-card" style={{
                  backgroundColor: '#fff', padding: '18px 20px', borderRadius: '14px',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  border: '1px solid #ece4d5', boxShadow: '0 2px 4px rgba(28,25,23,0.02)'
                }}>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#1c1917', fontFamily: "'Inter', sans-serif" }}>{service.name}</h4>
                    <p style={{ margin: '4px 0 0 0', color: '#b8863b', fontWeight: 700, fontSize: '0.9rem', fontFamily: "'Fraunces', serif" }}>{service.price} TL</p>
                  </div>
                  <button
                    onClick={() => handleDelete('service', service.id)}
                    className="mkl-bd-delete-btn"
                    style={{
                      backgroundColor: '#fbeeea', color: '#a3402f', border: 'none',
                      padding: '9px 18px', borderRadius: '10px', fontWeight: 700, cursor: 'pointer', fontFamily: "'Inter', sans-serif",
                      transition: 'background-color 0.2s ease'
                    }}
                  >
                    Sil
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'employees' && (
          <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: '1.8rem', fontWeight: 600, color: '#1c1917', marginBottom: '24px' }}>Personel Yönetimi</h1>

            <div style={{
              backgroundColor: '#ffffff',
              borderRadius: '18px',
              padding: '22px',
              marginBottom: '28px',
              boxShadow: '0 2px 8px -2px rgba(28,25,23,0.06)',
              border: '1px solid #ece4d5'
            }}>
              <h3 style={{ marginTop: 0, marginBottom: '18px', fontSize: '1.05rem', fontFamily: "'Fraunces', serif", fontWeight: 600, color: '#1c1917' }}>Yeni Personel Ekle</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <input
                  className="mkl-bd-input"
                  value={newEmployeeName}
                  onChange={e => setNewEmployeeName(e.target.value)}
                  placeholder="Ad Soyad (örn: Ad Soyad)"
                  style={{ padding: '13px 14px', borderRadius: '10px', border: '1px solid #e4ddd2', fontSize: '0.95rem', fontFamily: "'Inter', sans-serif", color: '#1c1917' }}
                />
                <button
                  onClick={handleAddEmployee}
                  className="mkl-bd-primary-btn"
                  style={{
                    backgroundColor: '#1c1917', color: '#faf7f2', border: 'none', padding: '13px',
                    borderRadius: '10px', fontWeight: 700, cursor: 'pointer', fontSize: '0.98rem', marginTop: '4px', fontFamily: "'Inter', sans-serif"
                  }}
                >
                  Personeli Kaydet
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {employees.map(emp => (
                <div key={emp.id} className="mkl-bd-card" style={{
                  backgroundColor: '#fff', padding: '18px 20px', borderRadius: '14px',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  border: '1px solid #ece4d5', boxShadow: '0 2px 4px rgba(28,25,23,0.02)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '38px', height: '38px', borderRadius: '50%', backgroundColor: '#faf3e5',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#b8863b', fontFamily: "'Fraunces', serif"
                    }}>
                      {emp.firstName[0]}{emp.lastName[0]}
                    </div>
                    <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#1c1917', fontFamily: "'Inter', sans-serif" }}>
                      {emp.firstName} {emp.lastName}
                    </h4>
                  </div>
                  <button
                    onClick={() => handleDelete('employee', emp.id)}
                    className="mkl-bd-delete-btn"
                    style={{
                      backgroundColor: '#fbeeea', color: '#a3402f', border: 'none',
                      padding: '9px 18px', borderRadius: '10px', fontWeight: 700, cursor: 'pointer', fontFamily: "'Inter', sans-serif",
                      transition: 'background-color 0.2s ease'
                    }}
                  >
                    Sil
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div style={{ maxWidth: '600px', margin: '0 auto', paddingBottom: '40px' }}>
            <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: '1.8rem', fontWeight: 600, color: '#1c1917', marginBottom: '24px' }}>Dükkan Ayarları</h1>

            <div style={{
              backgroundColor: '#ffffff',
              borderRadius: '18px',
              padding: '28px',
              boxShadow: '0 2px 8px -2px rgba(28,25,23,0.06)',
              border: '1px solid #ece4d5'
            }}>
              <h3 style={{ marginTop: 0, marginBottom: '22px', fontSize: '1.1rem', fontFamily: "'Fraunces', serif", fontWeight: 600, color: '#1c1917' }}>İşletme Bilgileri</h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 700, color: '#3d3630', fontSize: '0.75rem', letterSpacing: '0.05em', fontFamily: "'Inter', sans-serif" }}>DÜKKAN ADI</label>
                  <input
                    className="mkl-bd-input"
                    value={shopDetails?.shopName || ''}
                    onChange={e => setShopDetails(prev => ({ ...prev!, shopName: e.target.value }))}
                    placeholder="MakasLab"
                    style={{ width: '100%', padding: '13px 14px', borderRadius: '10px', border: '1px solid #e4ddd2', fontSize: '0.98rem', boxSizing: 'border-box', outline: 'none', fontFamily: "'Inter', sans-serif", color: '#1c1917' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 700, color: '#3d3630', fontSize: '0.75rem', letterSpacing: '0.05em', fontFamily: "'Inter', sans-serif" }}>İLETİŞİM NUMARASI</label>
                  <input
                    className="mkl-bd-input"
                    value={shopDetails?.phoneNumber || ''}
                    onChange={e => setShopDetails(prev => ({ ...prev!, phoneNumber: e.target.value }))}
                    placeholder="05XX XXX XX XX"
                    style={{ width: '100%', padding: '13px 14px', borderRadius: '10px', border: '1px solid #e4ddd2', fontSize: '0.98rem', boxSizing: 'border-box', outline: 'none', fontFamily: "'Inter', sans-serif", color: '#1c1917' }}
                  />
                </div>

                {/* Logo Yükleme */}
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 700, color: '#3d3630', fontSize: '0.75rem', letterSpacing: '0.05em', fontFamily: "'Inter', sans-serif" }}>DÜKKAN LOGOSU</label>

                  <div className="mkl-bd-upload-zone" style={{ padding: '20px', border: '2px dashed #e4ddd2', borderRadius: '12px', textAlign: 'center', backgroundColor: '#faf8f4', marginBottom: '15px' }}>

                    {(shopDetails?.imageUrl || selectedFile) && (
                      <div style={{ position: 'relative', display: 'inline-block', marginBottom: '10px' }}>
                        <img
                          src={selectedFile ? URL.createObjectURL(selectedFile) : shopDetails?.imageUrl}
                          alt="Dükkan Logosu"
                          style={{ width: '96px', height: '96px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #b8863b' }}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedFile(null);
                            setShopDetails(prev => ({ ...prev!, imageUrl: "" }));
                          }}
                          style={{ position: 'absolute', top: 0, right: 0, background: '#a3402f', color: 'white', borderRadius: '50%', border: 'none', cursor: 'pointer', width: '20px', height: '20px' }}
                        >X</button>
                      </div>
                    )}

                    <input
                      type="file"
                      accept="image/*"
                      onChange={e => setSelectedFile(e.target.files?.[0] || null)}
                      style={{ display: 'block', margin: '0 auto', fontSize: '0.9rem' }}
                    />
                  </div>
                </div>

                {/* Vitrin Görseli Yükleme */}
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 700, color: '#3d3630', fontSize: '0.75rem', letterSpacing: '0.05em', fontFamily: "'Inter', sans-serif" }}>
                    VİTRİN GÖRSELLERİ
                  </label>

                  <div className="mkl-bd-upload-zone" style={{ padding: '20px', border: '2px dashed #e4ddd2', borderRadius: '12px', textAlign: 'center', backgroundColor: '#faf8f4', marginBottom: '15px' }}>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={e => {
                        if (e.target.files) {
                          const newFiles = Array.from(e.target.files);
                          setVitrinFiles(prev => [...prev, ...newFiles]);
                        }
                      }}
                    />
                    <div style={{ display: 'flex', gap: '10px', marginTop: '10px', flexWrap: 'wrap' }}>

                      {shopDetails?.vitrinImageUrls?.map((url, index) => (
                        <div key={`db-${index}`} style={{ position: 'relative' }}>
                          <img src={url} style={{ width: '80px', height: '80px', borderRadius: '8px', objectFit: 'cover' }} />
                          <button
                            type="button"
                            onClick={() => setShopDetails(prev => {
                              if (!prev) return prev;
                              return {
                                ...prev,
                                vitrinImageUrls: prev.vitrinImageUrls?.filter((_, i) => i !== index) ?? []
                              };
                            })}
                            style={{ position: 'absolute', top: -5, right: -5, background: '#a3402f', color: 'white', borderRadius: '50%', border: 'none', cursor: 'pointer', width: '20px', height: '20px' }}
                          >X</button>
                        </div>
                      ))}

                      {vitrinFiles.map((file, index) => (
                        <div key={`new-${index}`} style={{ position: 'relative' }}>
                          <img src={URL.createObjectURL(file)} style={{ width: '80px', height: '80px', borderRadius: '8px', objectFit: 'cover', border: '2px solid #b8863b' }} />
                          <button
                            type="button"
                            onClick={() => setVitrinFiles(prev => prev.filter((_, i) => i !== index))}
                            style={{ position: 'absolute', top: -5, right: -5, background: '#a3402f', color: 'white', borderRadius: '50%', border: 'none', cursor: 'pointer', width: '20px', height: '20px' }}
                          >X</button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    {vitrinFiles.map((file, index) => (
                      <div key={index} style={{ position: 'relative', width: '80px', height: '80px' }}>
                        <img
                          src={URL.createObjectURL(file)}
                          alt="preview"
                          style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }}
                        />
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          style={{
                            position: 'absolute', top: '-5px', right: '-5px', background: '#a3402f',
                            color: 'white', border: 'none', borderRadius: '50%', width: '20px', height: '20px',
                            cursor: 'pointer', fontSize: '12px', lineHeight: '20px'
                          }}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleUpdateShop}
                  className="mkl-bd-primary-btn"
                  style={{
                    marginTop: '12px', backgroundColor: '#1c1917', color: '#faf7f2', border: 'none',
                    padding: '15px', borderRadius: '10px', fontWeight: 700, cursor: 'pointer', fontSize: '0.98rem', fontFamily: "'Inter', sans-serif", transition: 'background-color 0.2s ease'
                  }}
                >
                  Değişiklikleri Kaydet
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'hours' && (
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: '1.8rem', fontWeight: 600, color: '#1c1917', marginBottom: '24px' }}>Personel Takvimi</h1>

            <div style={{ marginBottom: '28px', backgroundColor: '#fff', padding: '14px 22px', borderRadius: '14px', border: '1px solid #ece4d5', display: 'inline-block' }}>
              <input
                type="date"
                value={selectedDate}
                onChange={e => setSelectedDate(e.target.value)}
                style={{ border: 'none', fontSize: '0.98rem', fontWeight: 600, color: '#b8863b', cursor: 'pointer', fontFamily: "'Inter', sans-serif" }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {employees.map(emp => (
                <div key={emp.id} style={{
                  backgroundColor: '#fff', padding: '22px', borderRadius: '16px',
                  border: '1px solid #ece4d5', boxShadow: '0 2px 8px -2px rgba(28,25,23,0.06)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '18px' }}>
                    <div style={{ width: '38px', height: '38px', borderRadius: '50%', backgroundColor: '#f2ede3', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#78706a', fontFamily: "'Fraunces', serif" }}>
                      {emp.firstName[0]}{emp.lastName[0]}
                    </div>
                    <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#1c1917', fontFamily: "'Inter', sans-serif" }}>{emp.firstName} {emp.lastName}</h4>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(70px, 1fr))', gap: '8px' }}>
                    {timeSlots.map(time => {
                      const isBusy = (busySlotsMap[emp.id] || []).includes(time);
                      return (
                        <div
                          key={time}
                          className="mkl-bd-slot"
                          onClick={() => toggleSlotStatus(emp.id, time)}
                          style={{
                            padding: '10px 0',
                            borderRadius: '8px',
                            textAlign: 'center',
                            fontSize: '0.82rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            fontFamily: "'Inter', sans-serif",
                            backgroundColor: isBusy ? '#fbeeea' : '#eef6ee',
                            color: isBusy ? '#a3402f' : '#3f7a4e',
                            border: `1px solid ${isBusy ? '#e3b6a8' : '#c3ddc7'}`
                          }}
                        >
                          {time}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}