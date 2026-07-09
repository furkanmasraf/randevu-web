import { useState, useEffect } from 'react';
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('userId');
  const role = localStorage.getItem('role');



const fetchBusySlots = async (employeeId: number, date: string) => {
  try {
    const response = await API.get(`https://randevu-sistemi-dv33.onrender.com/api/appointments/shop/employee-schedule`, {
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
    const response = await API.get(`https://randevu-sistemi-dv33.onrender.com/api/appointments/shop/${shopId}/filter`, {
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
    const shopRes = await API.get(`https://randevu-sistemi-dv33.onrender.com/api/shops/owner/${userId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (shopRes.data?.id) {
      const shopId = shopRes.data.id;
      setDynamicShopId(shopId);
      
      // ... shopDetails set etme ...

      // Promise.all içine hizmetleri çekmeyi de ekle!
      await Promise.all([
        fetchAppointments(shopId, appFilter),
        API.get(`https://randevu-sistemi-dv33.onrender.com/api/appointments/shop/${shopId}/employees`, {
          headers: { Authorization: `Bearer ${token}` }
        }).then(res => _setEmployees(res.data)),
        
        // EKSİK OLAN KISIM BURASI:
        API.get(`https://randevu-sistemi-dv33.onrender.com/api/services/shop/${shopId}`, {
          headers: { Authorization: `Bearer ${token}` }
        }).then(res => _setServices(res.data)) // _setServices olarak tanımlamıştın
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
      await API.post(`/api/services/shop/${dynamicShopId}`, 
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
      await API.post(`/api/employees/shop/${dynamicShopId}`, payload, 
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
      await API.put(`/api/shops/${dynamicShopId}/update-with-image`, formData, {
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

  const handleDelete = async (type: 'employee' | 'service', id: number) => {
  if (!window.confirm("Emin misin?")) return;
  try {
    await API.delete(`https://randevu-sistemi-dv33.onrender.com/api/${type}s/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    alert("Silindi!");
    window.location.reload(); // En hızlı çözüm
  } catch {
    alert("Silme hatası!");
  }
};

  if (loading) return <div>Yükleniyor...</div>;

  function updateStatus(id: any, arg1: string): void {
    if (!token) {
      alert('Oturum bilgisi bulunamadı.');
      return;
    }

    void API
      .patch(
        `https://randevu-sistemi-dv33.onrender.com/api/appointments/${id}/status`,
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
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: 'system-ui, sans-serif' }}>
    
    {/* MOBİL HAMBURGER */}
    <button 
      className="md:hidden"
      style={{ position: 'fixed', top: '15px', left: '15px', zIndex: 99, background: '#1e293b', color: '#fff', border: 'none', padding: '10px 15px', borderRadius: '8px', fontSize: '1.2rem', cursor: 'pointer' }}
      onClick={() => setIsSidebarOpen(!isSidebarOpen)}
    >
      ☰
    </button>

    {/* SIDEBAR */}
    <div style={{ 
      position: 'fixed', inset: '0', zIndex: 50, width: '280px', backgroundColor: '#0f172a', color: '#fff', 
      transform: isSidebarOpen ? 'translateX(0)' : 'translateX(-100%)', transition: 'transform 0.3s ease',
      padding: '40px 20px'
    }} className="md:static md:transform-none">
      <h2 style={{ fontSize: '1.5rem', fontWeight: '900', marginBottom: '40px', color: '#818cf8' }}>MakasLab</h2>
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {[
          { id: 'appointments', label: 'Randevular', icon: '📅' },
          { id: 'services', label: 'Hizmetler', icon: '✂️' },
          { id: 'employees', label: 'Personel', icon: '👤' },
          { id: 'settings', label: 'Ayarlar', icon: '⚙️' },
          { id: 'hours', label: 'Takvim', icon: '🕒' }
        ].map(item => (
          <button 
            key={item.id}
            onClick={() => { setActiveTab(item.id as any); setIsSidebarOpen(false); }}
            style={{ width: '100%', padding: '12px', textAlign: 'left', background: activeTab === item.id ? '#1e293b' : 'transparent', border: 'none', color: '#fff', borderRadius: '10px', cursor: 'pointer', fontWeight: 600 }}
          >
            {item.icon} {item.label}
          </button>
        ))}
      </nav>
    </div>

    {/* ANA İÇERİK */}
    <main style={{ flex: 1, padding: '40px', marginTop: '60px', maxWidth: '1200px', marginInline: 'auto' }}>
      {activeTab === 'appointments' && (
        <div>
          <header style={{ marginBottom: '30px' }}>
            <h1 style={{ fontSize: '2rem', fontWeight: '800', color: '#0f172a' }}>Randevular</h1>
            {/* FİLTRELER */}
            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              {['past', 'today', 'future'].map((f) => (
                <button
                  key={f}
                  onClick={() => setAppFilter(f as any)}
                  style={{
                    padding: '10px 24px', borderRadius: '12px', border: 'none', cursor: 'pointer', fontWeight: 700,
                    backgroundColor: appFilter === f ? '#4f46e5' : '#fff', color: appFilter === f ? '#fff' : '#64748b',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                  }}
                >
                  {f === 'past' ? 'Geçmiş' : f === 'today' ? 'Bugün' : 'Gelecek'}
                </button>
              ))}
            </div>
          </header>

          {/* GRID YERLEŞİMİ */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', 
            gap: '24px' 
          }}>
            {appointments.map((app) => (
              <div key={app.id} style={{ 
                background: '#fff', borderRadius: '24px', padding: '24px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)',
                border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '16px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <h4 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0 }}>{app.customerName}</h4>
                  <span style={{ 
                    fontSize: '0.75rem', fontWeight: 800, padding: '4px 10px', borderRadius: '8px',
                    backgroundColor: app.status === 'APPROVED' ? '#dcfce7' : '#fee2e2', color: app.status === 'APPROVED' ? '#166534' : '#991b1b'
                  }}>
                    {app.status}
                  </span>
                </div>
                <div style={{ backgroundColor: '#f8fafc', padding: '15px', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ fontSize: '0.9rem' }}>📅 {new Date(app.appointmentTime).toLocaleString()}</div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 600 }}>✂️ {app.serviceName} - {app.price} TL</div>
                  <div style={{ fontSize: '0.9rem' }}>👤 {app.employeeName}</div>
                  <div style={{ fontSize: '0.9rem' }}>📞 {app.customerPhone}</div>
                </div>
                {app.status === 'PENDING' && (
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={() => updateStatus(app.id, 'APPROVED')} style={{ flex: 1, background: '#4f46e5', color: '#fff', border: 'none', padding: '12px', borderRadius: '12px', fontWeight: 700, cursor: 'pointer' }}>Onayla</button>
                    <button onClick={() => updateStatus(app.id, 'REJECTED')} style={{ flex: 1, background: '#f1f5f9', color: '#e11d48', border: 'none', padding: '12px', borderRadius: '12px', fontWeight: 700, cursor: 'pointer' }}>Reddet</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
        {activeTab === 'services' && (
          <div>
            <h3>Hizmet Ekle</h3>
            <input value={newServiceName} onChange={e => setNewServiceName(e.target.value)} placeholder="Hizmet Adı" />
            <input value={newServicePrice} onChange={e => setNewServicePrice(e.target.value)} placeholder="Fiyat" />
            <button onClick={handleAddService}>Ekle</button>
            <ul>
  {services.map(service => (
    <li key={service.id} style={{ marginBottom: '8px' }}>
      {service.name} - {service.price} TL
      <button 
        onClick={() => handleDelete('service', service.id)} 
        style={{ marginLeft: '10px', color: 'red' }}
      >
        Sil
      </button>
    </li>
  ))}
</ul>
          </div>
        )}
        {activeTab === 'employees' && (
          <div>
            <h3>Personel Ekle</h3>
            <input value={newEmployeeName} onChange={e => setNewEmployeeName(e.target.value)} placeholder="Personel Adı" />
            <button onClick={handleAddEmployee}>Ekle</button>
            <ul>
  {employees.map(emp => (
    <li key={emp.id}>
      {emp.firstName} {emp.lastName} 
      <button onClick={() => handleDelete('employee', emp.id)} style={{marginLeft:'10px', color:'red'}}>Sil</button>
    </li>
  ))}
</ul>
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
    </main>
    </div>
  );
}