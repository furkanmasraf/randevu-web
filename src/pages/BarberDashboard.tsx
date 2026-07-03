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
  const [activeTab, setActiveTab] = useState<'appointments' | 'services' | 'hours' | 'employees'>('appointments');
  const [employees, _setEmployees] = useState<EmployeeItem[]>([]);
  const [services, _setServices] = useState<ServiceItem[]>([]);
  const [appointments] = useState<any[]>([]);
  const [dynamicShopId, setDynamicShopId] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const [newServiceName, setNewServiceName] = useState('');
  const [newServicePrice, setNewServicePrice] = useState('');
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

    // İŞTE BURAYA DİKKAT:
    console.log("API'DEN GELEN TEMİZ VERİ:", shopRes.data);

    if (shopRes.data) {
  // Veri döngüsel mi değil mi kontrol etmeye gerek kalmayacak, 
  // çünkü artık sadece id, name, price dönecek.
  const shopId = shopRes.data.id; 

  if (shopId) {
    setDynamicShopId(shopId);
    console.log("ID Başarıyla Set Edildi:", shopId);
    // ... geri kalan Promise.all işlemleri
  } else {
    // Backend DTO'ya döndüğü için buraya düşmemesi lazım
    console.error("ID bulunamadı, API yanıtı:", shopRes.data);
  }
}
  } catch (err) {
    console.error("API İSTEK HATASI:", err);
  } finally {
    setLoading(false);
  }
};
    fetchAllDashboardData();
  }, [navigate, token, role, userId]);

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

  if (loading) return <div>Yükleniyor...</div>;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f1f5f9' }}>
      {/* Sidebar ve İçerik aynı kalıyor */}
      <div style={{ width: '260px', backgroundColor: '#1e293b', color: '#fff', padding: '32px 14px' }}>
        <h2 style={{ fontSize: '1.35rem' }}>Makas<span style={{ color: '#818cf8' }}>Lab</span></h2>
        <button onClick={() => setActiveTab('appointments')} style={{ width: '100%', padding: '14px', background: 'none', border: 'none', color: '#fff', textAlign: 'left' }}>📅 Randevular</button>
        <button onClick={() => setActiveTab('services')} style={{ width: '100%', padding: '14px', background: 'none', border: 'none', color: '#fff', textAlign: 'left' }}>✂️ Hizmetler</button>
        <button onClick={() => setActiveTab('employees')} style={{ width: '100%', padding: '14px', background: 'none', border: 'none', color: '#fff', textAlign: 'left' }}>👤 Personel</button>
      </div>

      <div style={{ flex: 1, padding: '40px' }}>
        {activeTab === 'appointments' && (
          <div>
            <h3>Randevular</h3>
            {appointments.length === 0 ? (
              <p>Henüz randevu bulunamadı.</p>
            ) : (
              <ul>
                {appointments.map((app, index) => (
                  <li key={app.id ?? index}>
                    {app.date || app.appointmentDate || 'Tarih yok'} - {app.customerName || app.clientName || `${app.firstName || ''} ${app.lastName || ''}`.trim() || 'Müşteri yok'} - {app.serviceName || app.service?.name || 'Hizmet yok'}
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
      </div>
    </div>
  );
}