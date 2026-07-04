import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

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
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]); // Bugün
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
  const [shopDetails, setShopDetails] = useState<{ shopName?: string; phoneNumber?: string; imageUrl?: string; latitude?: number; longitude?: number } | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('userId');
  const role = localStorage.getItem('role');



const fetchBusySlots = async (employeeId: number, date: string) => {
  try {
    const response = await axios.get(`http://localhost:8080/api/appointments/shop/employee-schedule`, {
      params: { employeeId, date },
      headers: { Authorization: `Bearer ${token}` }
    });
    // Personelin ID'sine göre saatleri kaydet
    setBusySlotsMap(prev => ({ ...prev, [employeeId]: response.data }));
  } catch (err) {
    console.error("Dolu saatler çekilemedi:", err);
  }
};

const fetchAppointments = async (shopId: number, filter: string = 'today') => {
  try {
    const response = await axios.get(`http://localhost:8080/api/appointments/shop/${shopId}/filter`, {
      params: { filter },
      headers: { Authorization: `Bearer ${token}` }
    });
    setAppointments(response.data);
  } catch (err) {
    console.error("Randevular çekilemedi:", err);
  }
};

const fetchAllDashboardData = async () => {
  setLoading(true);
  try {
    // 1. Dükkan bilgilerini çek
    const shopRes = await axios.get(`http://localhost:8080/api/shops/owner/${userId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (shopRes.data?.id) {
      const shopId = shopRes.data.id;
      setDynamicShopId(shopId);
      
      setShopDetails({
        shopName: shopRes.data.shopName || shopRes.data.name || '',
        phoneNumber: shopRes.data.phoneNumber || shopRes.data.phone || '',
        imageUrl: shopRes.data.imageUrl || shopRes.data.image || '',
      });

      // 2. HEM RANDEVULARI HEM DE PERSONELLERİ AYNI ANDA ÇEK
      // Artık 'employees' state'in de otomatik dolacak
      await Promise.all([
        fetchAppointments(shopId, appFilter),
        axios.get(`http://localhost:8080/api/appointments/shop/${shopId}/employees`, {
          headers: { Authorization: `Bearer ${token}` }
        }).then(res => _setEmployees(res.data))
      ]);
    }
  } catch (err) {
    console.error("API İSTEK HATASI:", err);
  } finally {
    setLoading(false);
  }
};
      
      // BURADA SIRAYLA VERİLERİ ÇEK
      useEffect(() => {
  if (!token || role !== 'SHOP_OWNER') {
    navigate('/login');
    return;
  }
  fetchAllDashboardData();
}, [navigate, token, role, userId]);

// İkinci useEffect: Filtre veya dükkan ID değiştikçe randevuları otomatik çeksin
useEffect(() => {
  if (dynamicShopId) {
    fetchAppointments(dynamicShopId, appFilter);
  }
}, [appFilter, dynamicShopId]);

useEffect(() => {
  if (activeTab === 'hours' && dynamicShopId) {
    // Tüm personeller için döngüyle dolu saatleri çekebilirsin 
    // veya seçili bir personelin saatlerini çekebilirsin
    // Şimdilik ilk personeli baz alalım ya da hepsini çekecek bir mantık kuralım
    employees.forEach(emp => fetchBusySlots(emp.id, selectedDate));
  }
}, [activeTab, selectedDate, dynamicShopId]);

  const handleAddService = async () => {
    if (!dynamicShopId) return alert("Dükkan bilgisi yüklenemedi!");
    try {
      await axios.post(`http://localhost:8080/api/services/shop/${dynamicShopId}`, 
        { name: newServiceName, price: parseFloat(newServicePrice), durationInMinutes: 30 }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Hizmet eklendi.");
      window.location.reload();
    } catch { alert("Hizmet eklenemedi."); }
  };

  const handleAddEmployee = async () => {
    if (!dynamicShopId) return alert("Dükkan bilgisi yüklenemedi!");
    const parts = newEmployeeName.trim().split(" ");
    const payload = { firstName: parts[0] || "-", lastName: parts.slice(1).join(" ") || "-" };
    
    try {
      await axios.post(`http://localhost:8080/api/employees/shop/${dynamicShopId}`, payload, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Personel eklendi!");
      window.location.reload();
    } catch { alert("Personel eklenemedi."); }
  };

  const handleUpdateShop = async () => {
    const formData = new FormData();
    if (selectedFile) formData.append("file", selectedFile);
    formData.append("shopName", shopDetails?.shopName || "");
    formData.append("phoneNumber", shopDetails?.phoneNumber || "");

    try {
      await axios.put(`http://localhost:8080/api/shops/${dynamicShopId}/update-with-image`, formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data"
        }
      });
      alert("Dükkan bilgileri ve görsel güncellendi!");
    } catch (err) {
      console.error("Dükkan güncellemesi başarısız:", err);
      alert("Dükkan bilgileri güncellenemedi.");
    }
  };

  if (loading) return <div>Yükleniyor...</div>;

  function updateStatus(id: any, arg1: string): void {
    if (!token) {
      alert('Oturum bilgisi bulunamadı.');
      return;
    }

    void axios
      .patch(
        `http://localhost:8080/api/appointments/${id}/status`,
        { status: arg1 },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then(() => {
        setAppointments(prev =>
          prev.map(app => (app.id === id ? { ...app, status: arg1 } : app))
        );
      })
      .catch(err => {
        console.error('Randevu durumu güncellenemedi:', err);
        alert('Randevu durumu güncellenemedi.');
      });
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f1f5f9' }}>
      {/* Sidebar ve İçerik aynı kalıyor */}
      <div style={{ width: '260px', backgroundColor: '#1e293b', color: '#fff', padding: '32px 14px' }}>
        <h2 style={{ fontSize: '1.35rem' }}>Makas<span style={{ color: '#818cf8' }}>Lab</span></h2>
        <button onClick={() => setActiveTab('appointments')} style={{ width: '100%', padding: '14px', background: 'none', border: 'none', color: '#fff', textAlign: 'left' }}>📅 Randevular</button>
        <button onClick={() => setActiveTab('services')} style={{ width: '100%', padding: '14px', background: 'none', border: 'none', color: '#fff', textAlign: 'left' }}>✂️ Hizmetler</button>
        <button onClick={() => setActiveTab('employees')} style={{ width: '100%', padding: '14px', background: 'none', border: 'none', color: '#fff', textAlign: 'left' }}>👤 Personel</button>
        <button onClick={() => setActiveTab('settings')} style={{ width: '100%', padding: '14px', background: 'none', border: 'none', color: '#fff', textAlign: 'left' }}>⚙️ Dükkan Ayarları</button>
        <button onClick={() => setActiveTab('hours')} 
  style={{ width: '100%', padding: '14px', background: 'none', border: 'none', color: '#fff', textAlign: 'left' }}>
  🕒 Personel Takvimi
</button>
      </div>

      <div style={{ flex: 1, padding: '40px' }}>
        {activeTab === 'appointments' && (
          <div>
            <h3>Randevular</h3>

            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
              {[
                { label: 'Geçmiş', val: 'past' },
                { label: 'Bugün', val: 'today' },
                { label: 'Gelecek', val: 'future' }
              ].map((item) => (
                <button
                  key={item.val}
                  onClick={() => setAppFilter(item.val as any)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '6px',
                    border: 'none',
                    cursor: 'pointer',
                    backgroundColor: appFilter === item.val ? '#6366f1' : '#e2e8f0',
                    color: appFilter === item.val ? '#fff' : '#1e293b'
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {appointments.length === 0 ? (
              <p>Henüz randevu bulunamadı.</p>
            ) : (
              <ul>
                {appointments.map((app) => (
                  <li key={app.id} style={{ marginBottom: '15px', padding: '20px', background: '#fff', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1e293b' }}>
                          {app.customerName || 'İsimsiz Müşteri'}
                        </div>
                        <div style={{ fontSize: '0.9rem', color: '#64748b', marginTop: '4px' }}>
                          📅 {app.appointmentTime ? new Date(app.appointmentTime).toLocaleString() : 'Tarih yok'}
                        </div>
                        <div style={{ fontSize: '0.9rem', color: '#475569', marginTop: '4px' }}>
                          ✂️ {app.serviceName || 'Hizmet bilgisi yok'} — <b>{app.price ? `${app.price} TL` : 'Fiyat yok'}</b>
                        </div>
                        <div style={{ fontSize: '0.85rem', color: '#6366f1', marginTop: '4px', fontWeight: 600 }}>
                          👤 Personel: {app.employeeName || 'Atanmadı'}
                        </div>
                      </div>

                      <div>
                        {app.status === 'PENDING' ? (
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button onClick={() => updateStatus(app.id, 'APPROVED')} style={{ background: '#22c55e', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>Kabul Et</button>
                            <button onClick={() => updateStatus(app.id, 'REJECTED')} style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>Reddet</button>
                          </div>
                        ) : (
                          <div style={{ padding: '8px 16px', borderRadius: '6px', fontWeight: 700, fontSize: '0.9rem', backgroundColor: app.status === 'APPROVED' ? '#dcfce7' : '#fee2e2', color: app.status === 'APPROVED' ? '#166534' : '#991b1b' }}>
                            {app.status === 'APPROVED' ? 'ONAYLANDI' : 'REDDEDİLDİ'}
                          </div>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
        {activeTab === 'services' && (
          <div>
            <h3>Hizmet Ekle</h3>
            <input value={newServiceName} onChange={e => setNewServiceName(e.target.value)} placeholder="Hizmet Adı" />
            <input value={newServicePrice} onChange={e => setNewServicePrice(e.target.value)} placeholder="Fiyat" />
            <button onClick={handleAddService}>Ekle</button>
            <ul>{services.map(s => <li key={s.id}>{s.name} - ₺{s.price}</li>)}</ul>
          </div>
        )}
        {activeTab === 'employees' && (
          <div>
            <h3>Personel Ekle</h3>
            <input value={newEmployeeName} onChange={e => setNewEmployeeName(e.target.value)} placeholder="Personel Adı" />
            <button onClick={handleAddEmployee}>Ekle</button>
            <ul>{employees.map(emp => <li key={emp.id}>{emp.firstName} {emp.lastName}</li>)}</ul>
          </div>
        )}
        {activeTab === 'settings' && (
  <div style={{ background: '#fff', padding: '30px', borderRadius: '12px' }}>
    <h3>Dükkan Bilgilerini Güncelle</h3>
    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', maxWidth: '400px' }}>
      <input 
        value={shopDetails?.shopName || ''} 
        onChange={e => setShopDetails(prev => ({...prev!, shopName: e.target.value}))} 
        placeholder="Dükkan Adı" 
        style={{ padding: '10px' }} 
      />
      <input 
        value={shopDetails?.phoneNumber || ''} 
        onChange={e => setShopDetails(prev => ({...prev!, phoneNumber: e.target.value}))} 
        placeholder="Telefon" 
        style={{ padding: '10px' }} 
      />
      <input 
        type="file" 
        onChange={e => setSelectedFile(e.target.files?.[0] || null)} 
      />
      <button onClick={handleUpdateShop} style={{ padding: '10px', background: '#6366f1', color: '#fff', border: 'none', borderRadius: '6px' }}>
        Kaydet
      </button>
    </div>
  </div>
)}
{activeTab === 'hours' && (
  <div style={{ background: '#fff', padding: '20px', borderRadius: '12px' }}>
    <h3>Personel Müsaitlik Durumu</h3>
    <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} />
    
    <div style={{ marginTop: '20px' }}>
      {employees.map(emp => (
        <div key={emp.id} style={{ marginBottom: '20px' }}>
          <h4>{emp.firstName} {emp.lastName}</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(60px, 1fr))', gap: '5px' }}>
            {timeSlots.map(time => (
              <div key={time} 
                style={{ 
                  padding: '8px', borderRadius: '4px', textAlign: 'center', fontSize: '0.8rem',
                  backgroundColor: (busySlotsMap[emp.id] || []).includes(time) ? '#ef4444' : '#22c55e', 
                  color: '#fff' 
                }}>
                {time}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
)}
      </div>
    </div>
  );
}