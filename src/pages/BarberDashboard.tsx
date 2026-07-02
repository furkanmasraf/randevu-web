import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

interface EmployeeItem {
  id: number;
  firstName: string;
  lastName: string;
}

export default function BarberDashboard() {
  const [activeTab, setActiveTab] = useState<'appointments' | 'services' | 'hours' | 'employees'>('appointments');
  const [employees, setEmployees] = useState<EmployeeItem[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [dynamicShopId, setDynamicShopId] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const [newServiceName, setNewServiceName] = useState('');
  const [newServicePrice, setNewServicePrice] = useState('');
  const [newServiceDuration] = useState('30');
  const [newEmployeeName, setNewEmployeeName] = useState('');

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
  try {
    const shopRes = await axios.get(`http://localhost:8080/api/shops/owner/${userId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    // GELEN VERİYİ YAKALA
    const data = shopRes.data;
    console.log("İşlenen Veri:", data);

    // EĞER DÜKKAN NESNESİ DOĞRUDAN GELİYORSA
    if (data && data.id) {
      const shopId = data.id;
      setDynamicShopId(shopId);
      console.log("ID Başarıyla Set Edildi:", shopId);

      // Verileri çek
      const [serviceRes, empRes, appRes] = await Promise.all([
        axios.get(`http://localhost:8080/api/services/shop/${shopId}`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`http://localhost:8080/api/employees/shop/${shopId}`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`http://localhost:8080/api/appointments/shop/owner/${userId}`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      
      setServices(Array.isArray(serviceRes.data) ? serviceRes.data : []);
      setEmployees(Array.isArray(empRes.data) ? empRes.data : []);
      setAppointments(Array.isArray(appRes.data) ? appRes.data : []);
    } else {
      console.error("Beklenen formatta veri gelmedi:", data);
    }
  } catch (err) {
    console.error("Hata:", err);
  } finally {
    setLoading(false);
  }
};

    fetchAllDashboardData();
  }, [navigate, token, role, userId]);

  const handleAddService = async () => {
    if (!dynamicShopId) return alert("Dükkan ID'si yüklenemedi! Sayfayı yenileyin.");
    if (!newServiceName.trim() || !newServicePrice) return alert("Hizmet adı ve fiyat giriniz.");

    try {
      const payload = {
        name: newServiceName,
        price: parseFloat(newServicePrice),
        durationInMinutes: parseInt(newServiceDuration)
      };

      await axios.post(`http://localhost:8080/api/services/shop/${dynamicShopId}`, payload, { 
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } 
      });
      alert("Hizmet başarıyla eklendi.");
      window.location.reload();
    } catch (e) { 
      console.error(e); 
      alert("Hizmet eklenemedi."); 
    }
  };

  const handleAddEmployee = async () => {
    if (!dynamicShopId) {
      alert("Dükkan bulunamadığı için işlem yapılamıyor!");
      return;
    }
    
    if (!newEmployeeName.trim()) return alert("İsim girin.");
    
    try {
      const parts = newEmployeeName.trim().split(" ");
      const lastName = parts.length > 1 ? parts.pop()! : "-";
      const firstName = parts.join(" ");
      const payload = { firstName, lastName };

      await axios.post(`http://localhost:8080/api/employees/shop/${dynamicShopId}`, payload, { 
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } 
      });
      alert("Personel başarıyla kaydedildi!");
      window.location.reload();
    } catch (e) { 
      console.error(e); 
      alert("Personel eklenemedi."); 
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('role');
    navigate('/login');
  };

  if (loading) return <div>Yönetim Paneli Güvenle Hazırlanıyor...</div>;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f1f5f9' }}>
      <div style={{ width: '260px', backgroundColor: '#1e293b', color: '#ffffff', padding: '32px 14px' }}>
        <h2 style={{ fontSize: '1.35rem', fontWeight: 800 }}>Makas<span style={{ color: '#818cf8' }}>Lab</span></h2>
        <button onClick={() => setActiveTab('appointments')} style={{ width: '100%', padding: '14px', background: 'none', border: 'none', color: '#fff', textAlign: 'left' }}>📅 Randevular</button>
        <button onClick={() => setActiveTab('services')} style={{ width: '100%', padding: '14px', background: 'none', border: 'none', color: '#fff', textAlign: 'left' }}>✂️ Hizmetler</button>
        <button onClick={() => setActiveTab('employees')} style={{ width: '100%', padding: '14px', background: 'none', border: 'none', color: '#fff', textAlign: 'left' }}>👤 Personel</button>
        <button onClick={handleLogout} style={{ marginTop: 'auto', color: '#ef4444', background: 'none', border: 'none', textAlign: 'left', padding: '14px' }}>🚪 Çıkış Yap</button>
      </div>

      <div style={{ flex: 1, padding: '40px' }}>
        {activeTab === 'appointments' && (
          <div>
            <h3>Randevular</h3>
            {appointments.length === 0 ? (
              <p>Görüntülenecek randevu yok.</p>
            ) : (
              <ul>
                {appointments.map((a: any) => (
                  <li key={a.id ?? `${a.start}-${a.customerId}`}>
                    {a.customerName || `${a.customerFirstName || ''} ${a.customerLastName || ''}`} - {a.start}
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
            {services.length === 0 ? (
              <p style={{ marginTop: 12 }}>Kayıtlı hizmet yok.</p>
            ) : (
              <ul style={{ marginTop: 12 }}>
                {services.map((s: any) => (
                  <li key={s.id}>{s.name} - ₺{s.price}</li>
                ))}
              </ul>
            )}
          </div>
        )}
        {activeTab === 'employees' && (
          <div>
            <h3>Personel Ekle</h3>
            <input value={newEmployeeName} onChange={e => setNewEmployeeName(e.target.value)} placeholder="Personel Adı" />
            <button onClick={handleAddEmployee}>Ekle</button>
            {employees.length === 0 ? (
              <p style={{ marginTop: 12 }}>Kayıtlı personel yok.</p>
            ) : (
              <ul style={{ marginTop: 12 }}>
                {employees.map(emp => (
                  <li key={emp.id}>{emp.firstName} {emp.lastName}</li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
}