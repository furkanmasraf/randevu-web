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

export default function BarberDashboard() {
  const [activeTab, setActiveTab] = useState<'appointments' | 'services' | 'hours'>('appointments');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [dynamicShopId, setDynamicShopId] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  
  // Yeni hizmet ekleme form state'leri
  const [newServiceName, setNewServiceName] = useState('');
  const [newServicePrice, setNewServicePrice] = useState('');
  const [newServiceDuration, setNewServiceDuration] = useState('30');

  // Çalışma saatleri state'leri
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('20:00');

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
      console.log(`Dashboard yükleniyor... Aktif Kullanıcı ID: ${userId}`);
      let currentShopId: number | null = null;

      // 1. DÜKKAN DETAYINI ÇEK
      try {
        const shopRes = await axios.get(`http://localhost:8080/api/shops/owner/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const shopData = shopRes.data;
        console.log("Backend'den başarıyla gelen dükkan bilgisi:", shopData);

        const exactShopId = shopData?.id || shopData?.shopId;

        if (exactShopId) {
          currentShopId = exactShopId;
          setDynamicShopId(exactShopId);
          if (shopData.startTime) setStartTime(shopData.startTime);
          if (shopData.endTime) setEndTime(shopData.endTime);
          console.log("Ön yüz dükkan ID'sini başarıyla algıladı ve set etti:", exactShopId);
        } else {
          console.warn("Dükkan nesnesi geldi fakat içinde geçerli bir 'id' veya 'shopId' bulunamadı!", shopData);
        }
      } catch (shopError) {
        console.error("Dükkan bilgisi çekilirken hata oluştu:", shopError);
      }

      // 2. DÜKKANA AİT HİZMETLERİ ÇEK
      if (currentShopId) {
        try {
          const serviceRes = await axios.get(`http://localhost:8080/api/shops/${currentShopId}/services`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          const verifiedServices = Array.isArray(serviceRes.data) ? serviceRes.data : [];
          setServices(verifiedServices);
          console.log("Hizmetler başarıyla yüklendi:", verifiedServices);
        } catch (serviceError) {
          console.error("Hizmetler çekilirken hata oluştu:", serviceError);
          setServices([]);
        }
      }

      // 3. RANDEVU TALEPLERİNİ ÇEK
      try {
        const appRes = await axios.get(`http://localhost:8080/api/appointments/shop/owner/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const verifiedAppointments = Array.isArray(appRes.data) ? appRes.data : [];
        setAppointments(verifiedAppointments);
        console.log("Randevular başarıyla yüklendi.");
      } catch (appError) {
        console.error("Randevular çekilirken hata oluştu, ancak panel akışı kurtarıldı:", appError);
        setAppointments([]);
      }

      setLoading(false);
    };

    fetchAllDashboardData();
  }, [navigate, token, role, userId]);

  // Randevu Onay/Ret İşlemi
  const updateStatus = async (id: number, newStatus: 'APPROVED' | 'REJECTED') => {
    try {
      await axios.put(`http://localhost:8080/api/appointments/${id}/status?status=${newStatus}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAppointments(prev => prev.map(app => app.id === id ? { ...app, status: newStatus } : app));
      alert(`Randevu durumu ${newStatus === 'APPROVED' ? 'Onaylandı' : 'Reddedildi'}.`);
    } catch (error) {
      console.error(error);
      alert("Durum güncellenirken bir hata oluştu.");
    }
  };

  // Gerçek Veritabanına Yeni Hizmet Ekleme
  const handleAddService = async () => {
    if (!dynamicShopId) {
      alert(`Hizmet eklenemedi: Sistem dükkan kimliğini (shopId) henüz veritabanından çekemedi. Lütfen sayfayı yenilemeyi deneyin.`);
      return;
    }

    if (!newServiceName || !newServicePrice) {
      alert("Lütfen hizmet adı ve fiyatını doldurun.");
      return;
    }

    try {
      const res = await axios.post(`http://localhost:8080/api/shops/${dynamicShopId}/services`, {
        name: newServiceName,
        price: parseFloat(newServicePrice),
        durationInMinutes: parseInt(newServiceDuration)
      }, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      
      setServices(prev => [...prev, res.data]);
      setNewServiceName('');
      setNewServicePrice('');
      alert("Hizmet başarıyla veritabanına kaydedildi!");
    } catch (error) {
      console.error("Hizmet eklenemedi:", error);
      alert("Hizmet eklenirken bir hata oluştu.");
    }
  };

  // Gerçek Veritabanından Hizmet Silme
  const handleDeleteService = async (id: number) => {
    if (!id || id === 0) {
      alert("Geçersiz Hizmet ID'si! Silme işlemi iptal edildi.");
      return;
    }
    if (!window.confirm("Bu hizmeti silmek istediğinize emin misiniz?")) return;
    try {
      await axios.delete(`http://localhost:8080/api/shops/services/${id}`, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      setServices(prev => prev.filter(item => {
        const itemId = item?.id || (item as any)?.serviceId;
        return itemId !== id;
      }));
      alert("Hizmet veritabanından başarıyla silindi.");
    } catch (error) {
      console.error("Hizmet silinemedi:", error);
      alert("Hizmet silinirken hata oluştu.");
    }
  };

  // Gerçek Veritabanına Çalışma Saatlerini Kaydetme
  const handleSaveHours = async () => {
    if (!dynamicShopId) {
      alert("Saatler kaydedilemiyor çünkü dükkan kimliği (shopId) bulunamadı.");
      return;
    }
    try {
      await axios.put(`http://localhost:8080/api/shops/${dynamicShopId}/working-hours`, { 
        startTime, 
        endTime 
      }, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      alert(`Çalışma saatleri başarıyla güncellendi: ${startTime} - ${endTime}`);
    } catch (error) {
      console.error("Saatler güncellenemedi:", error);
      alert("Saatler güncellenirken hata oluştu.");
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '50px', fontFamily: 'sans-serif' }}>Yönetim Paneli Yükleniyor...</div>;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'system-ui, sans-serif', backgroundColor: '#f9fafb' }}>
      
      {/* SOL MENÜ (SIDEBAR) */}
      <div style={{ width: '260px', backgroundColor: '#111827', color: '#fff', padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ marginBottom: '32px', paddingLeft: '8px' }}>
          <h2 style={{ margin: 0, fontSize: '1.25rem' }}>💈 Kuaför Panel</h2>
          <span style={{ fontSize: '0.85rem', color: '#9ca3af' }}>Dükkan Yönetimi</span>
        </div>
        
        <button onClick={() => setActiveTab('appointments')} style={{ width: '100%', textAlign: 'left', padding: '12px', borderRadius: '8px', border: 'none', backgroundColor: activeTab === 'appointments' ? '#1f2937' : 'transparent', color: '#fff', fontWeight: 600, cursor: 'pointer' }}>
          📅 Randevu Talepleri
        </button>
        <button onClick={() => setActiveTab('services')} style={{ width: '100%', textAlign: 'left', padding: '12px', borderRadius: '8px', border: 'none', backgroundColor: activeTab === 'services' ? '#1f2937' : 'transparent', color: '#fff', fontWeight: 600, cursor: 'pointer' }}>
          ✂️ Hizmetler & Fiyatlar
        </button>
        <button onClick={() => setActiveTab('hours')} style={{ width: '100%', textAlign: 'left', padding: '12px', borderRadius: '8px', border: 'none', backgroundColor: activeTab === 'hours' ? '#1f2937' : 'transparent', color: '#fff', fontWeight: 600, cursor: 'pointer' }}>
          🕒 Çalışma Saatleri
        </button>

        <button onClick={handleLogout} style={{ width: '100%', textAlign: 'left', padding: '12px', borderRadius: '8px', border: 'none', backgroundColor: '#ef4444', color: '#fff', fontWeight: 600, cursor: 'pointer', marginTop: 'auto' }}>
          🚪 Çıkış Yap
        </button>
      </div>

      {/* SAĞ İÇERİK ALANI */}
      <div style={{ flex: 1, padding: '40px' }}>
        
        {/* SEKME 1: RANDEVULAR */}
        {activeTab === 'appointments' && (
          <div>
            <h2 style={{ color: '#111827', marginBottom: '24px' }}>Gelen Randevu Talepleri</h2>
            {appointments.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb', color: '#6b7280' }}>Henüz bir randevu talebi yok.</div>
            ) : (
              <div style={{ backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb', textAlign: 'left' }}>
                      <th style={{ padding: '16px' }}>Müşteri</th>
                      <th style={{ padding: '16px' }}>Personel</th>
                      <th style={{ padding: '16px' }}>Hizmet</th>
                      <th style={{ padding: '16px' }}>Tarih / Saat</th>
                      <th style={{ padding: '16px' }}>Durum</th>
                      <th style={{ padding: '16px', textAlign: 'center' }}>İşlem</th>
                    </tr>
                  </thead>
                  <tbody>
                    {appointments.map(app => (
                      <tr key={app.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                        <td style={{ padding: '16px' }}><strong>{app?.customerName}</strong><br/><span style={{ fontSize: '0.8rem', color: '#6b7280' }}>{app?.customerPhone}</span></td>
                        <td style={{ padding: '16px' }}>{app?.employeeName}</td>
                        <td style={{ padding: '16px' }}>{app?.serviceName}</td>
                        <td style={{ padding: '16px' }}>{app?.appointmentTime ? new Date(app.appointmentTime).toLocaleString('tr-TR') : ''}</td>
                        <td style={{ padding: '16px' }}>
                          <span style={{ padding: '4px 10px', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 600, backgroundColor: app?.status === 'PENDING' ? '#fef3c7' : app?.status === 'APPROVED' ? '#e6f4ea' : '#fee2e2', color: app?.status === 'PENDING' ? '#d97706' : app?.status === 'APPROVED' ? '#16a34a' : '#dc2626' }}>{app?.status}</span>
                        </td>
                        <td style={{ padding: '16px', textAlign: 'center' }}>
                          {app?.status === 'PENDING' ? (
                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                              <button onClick={() => updateStatus(app.id, 'APPROVED')} style={{ backgroundColor: '#10b981', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>Onayla</button>
                              <button onClick={() => updateStatus(app.id, 'REJECTED')} style={{ backgroundColor: '#ef4444', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>Reddet</button>
                            </div>
                          ) : <span style={{ color: '#9ca3af', fontSize: '0.9rem' }}>İşlem Tamamlandı</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* SEKME 2: HİZMETLER & FİYATLAR */}
        {activeTab === 'services' && (
          <div>
            <h2 style={{ color: '#111827', marginBottom: '8px' }}>Hizmet ve Fiyat Yönetimi</h2>
            <p style={{ color: '#6b7280', marginBottom: '24px' }}>Dükkanınızda sunulan hizmetleri ekleyebilir veya silebilirsiniz.</p>
            
            {/* HİZMET EKLEME FORMU */}
            <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #e5e7eb', display: 'flex', gap: '16px', alignItems: 'flex-end', marginBottom: '24px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 2 }}>
                <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#374151' }}>Hizmet Adı</label>
                <input type="text" value={newServiceName} onChange={e => setNewServiceName(e.target.value)} placeholder="Örn: Saç + Sakal + Yıkama" style={{ padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
                <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#374151' }}>Fiyat (TL)</label>
                <input type="number" value={newServicePrice} onChange={e => setNewServicePrice(e.target.value)} placeholder="Örn: 200" style={{ padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
                <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#374151' }}>Süre (Dakika)</label>
                <select value={newServiceDuration} onChange={e => setNewServiceDuration(e.target.value)} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none', backgroundColor: '#fff' }}>
                  <option value="15">15 dk</option>
                  <option value="30">30 dk</option>
                  <option value="45">45 dk</option>
                  <option value="60">60 dk</option>
                </select>
              </div>
              <button onClick={handleAddService} style={{ backgroundColor: '#111827', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>Ekle</button>
            </div>

            {/* HİZMET LİSTESİ */}
            <div style={{ backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb', textAlign: 'left' }}>
                    <th style={{ padding: '16px' }}>Hizmet Adı</th>
                    <th style={{ padding: '16px' }}>Süre</th>
                    <th style={{ padding: '16px' }}>Fiyat</th>
                    <th style={{ padding: '16px', textAlign: 'center' }}>İşlem</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.isArray(services) && services.map((item, index) => {
                    if (!item) return null;
                    
                    // ID Uyuşmazlığını Çözen Güvenli ID Belirleme:
                    const currentId = item?.id || (item as any)?.serviceId || (item as any)?.shopServiceId;

                    return (
                      <tr key={currentId || index} style={{ borderBottom: '1px solid #e5e7eb' }}>
                        <td style={{ padding: '16px', fontWeight: 600 }}>
                          {item?.name || (item as any)?.serviceName || "Bilinmeyen Hizmet"}
                        </td>
                        <td style={{ padding: '16px' }}>
                          ⏳ {item?.durationInMinutes || (item as any)?.duration_in_minutes || 0} dakika
                        </td>
                        <td style={{ padding: '16px', color: '#10b981', fontWeight: 700 }}>
                          {item?.price || (item as any)?.servicePrice || 0} TL
                        </td>
                        <td style={{ padding: '16px', textAlign: 'center' }}>
                          <button 
                            onClick={() => handleDeleteService(currentId)} 
                            style={{ backgroundColor: 'transparent', color: '#ef4444', border: 'none', fontWeight: 600, cursor: 'pointer' }}
                          >
                            Sil
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SEKME 3: ÇALIŞMA SAATLERİ */}
        {activeTab === 'hours' && (
          <div style={{ maxWidth: '500px' }}>
            <h2 style={{ color: '#111827', marginBottom: '8px' }}>Çalışma Saatleri Ayarı</h2>
            <p style={{ color: '#6b7280', marginBottom: '24px' }}>Dükkanınızın açılış ve kapanış saatlerini belirleyin.</p>
            
            <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
                  <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#374151' }}>Açılış Saati</label>
                  <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
                  <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#374151' }}>Kapanış Saati</label>
                  <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none' }} />
                </div>
              </div>
              <button onClick={handleSaveHours} style={{ backgroundColor: '#111827', color: '#fff', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', marginTop: '10px' }}>Saatleri Kaydet</button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}