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

export default function BarberDashboard() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    const userId = localStorage.getItem('userId');

    // Rol kontrolünü SHOP_OWNER olarak güncelledik
    if (!token || role !== 'SHOP_OWNER') {
      navigate('/login');
      return;
    }

    const fetchShopAppointments = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:8080/api/appointments/shop/owner/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setAppointments(response.data);
      } catch (error) {
        console.error("Dükkan randevuları çekilemedi:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchShopAppointments();
  }, [navigate]);

  const updateStatus = async (id: number, newStatus: 'APPROVED' | 'REJECTED') => {
    const token = localStorage.getItem('token');
    try {
      await axios.put(`http://localhost:8080/api/appointments/${id}/status?status=${newStatus}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setAppointments(prev => 
        prev.map(app => app.id === id ? { ...app, status: newStatus } : app)
      );
      alert(`Randevu durumu ${newStatus === 'APPROVED' ? 'Onaylandı' : 'Reddedildi'} olarak güncellendi.`);
    } catch (error) {
      console.error("Durum güncellenirken hata:", error);
      alert("İşlem başarısız oldu.");
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '50px' }}>Yönetim Paneli Yükleniyor...</div>;

  return (
    <div style={{ maxWidth: '1100px', margin: '40px auto', padding: '0 20px', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#111827', padding: '20px 32px', borderRadius: '16px', marginBottom: '32px' }}>
        <div>
          <h1 style={{ margin: 0, color: '#fff', fontSize: '1.5rem' }}>💈 Dükkan Yönetim Paneli</h1>
          <p style={{ margin: '4px 0 0 0', color: '#9ca3af' }}>Gelen randevu taleplerini buradan yönetebilirsiniz.</p>
        </div>
        <button onClick={handleLogout} style={{ backgroundColor: '#ef4444', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '10px', fontWeight: 600, cursor: 'pointer' }}>Çıkış Yap</button>
      </div>

      <h2 style={{ color: '#111827', marginBottom: '16px' }}>Randevu Talepleri</h2>
      
      {appointments.length === 0 ? (
        <div style={{ padding: '40px', textAlign: 'center', backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb', color: '#6b7280' }}>Henüz dükkanınıza gelen bir randevu talebi yok.</div>
      ) : (
        <div style={{ backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                <th style={{ padding: '16px' }}>Müşteri</th>
                <th style={{ padding: '16px' }}>Personel</th>
                <th style={{ padding: '16px' }}>Hizmet</th>
                <th style={{ padding: '16px' }}>Tarih / Saat</th>
                <th style={{ padding: '16px' }}>Durum</th>
                <th style={{ padding: '16px', textAlign: 'center' }}>İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map(app => (
                <tr key={app.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: '16px' }}>
                    <strong>{app.customerName}</strong><br/>
                    <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>{app.customerPhone}</span>
                  </td>
                  <td style={{ padding: '16px' }}>{app.employeeName}</td>
                  <td style={{ padding: '16px' }}>{app.serviceName}</td>
                  <td style={{ padding: '16px' }}>{new Date(app.appointmentTime).toLocaleString('tr-TR')}</td>
                  <td style={{ padding: '16px' }}>
                    <span style={{ padding: '4px 10px', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 600, backgroundColor: app.status === 'PENDING' ? '#fef3c7' : app.status === 'APPROVED' ? '#e6f4ea' : '#fee2e2', color: app.status === 'PENDING' ? '#d97706' : app.status === 'APPROVED' ? '#16a34a' : '#dc2626' }}>
                      {app.status}
                    </span>
                  </td>
                  <td style={{ padding: '16px', textAlign: 'center' }}>
                    {app.status === 'PENDING' ? (
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                        <button onClick={() => updateStatus(app.id, 'APPROVED')} style={{ backgroundColor: '#10b981', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>Onayla</button>
                        <button onClick={() => updateStatus(app.id, 'REJECTED')} style={{ backgroundColor: '#ef4444', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>Reddet</button>
                      </div>
                    ) : (
                      <span style={{ color: '#9ca3af', fontSize: '0.9rem' }}>İşlem Tamamlandı</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}