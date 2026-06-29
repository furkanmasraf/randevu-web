import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// Backend'den dönecek AppointmentDTO yapısı ile uyumlu TypeScript tipi
interface AppointmentDTO {
  id: number;
  shopName: string;
  employeeName: string;
  serviceName: string;
  price: number;
  appointmentTime: string;
  status: 'PENDING' | 'APPROVED' | 'CANCELLED' | 'REJECTED';
}

export default function MyAppointments() {
  const [appointments, setAppointments] = useState<AppointmentDTO[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  // Sayfa yüklendiğinde kullanıcının randevularını çekiyoruz
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');

    if (!token || !userId) {
      navigate('/login');
      return;
    }

    const fetchAppointments = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:8080/api/appointments/user/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setAppointments(response.data);
      } catch (error) {
        console.error("Randevular yüklenirken hata oluştu:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [navigate]);

  // Randevu İptal Etme İşlemi (PUT)
  const handleCancel = async (appointmentId: number) => {
    const token = localStorage.getItem('token');
    if (!window.confirm("Bu randevuyu iptal etmek istediğinize emin misiniz?")) return;

    try {
      await axios.put(`http://localhost:8080/api/appointments/${appointmentId}/cancel`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      alert("Randevunuz başarıyla iptal edildi.");
      
      // State'i güncelleyerek arayüzde statüyü anlık olarak CANCELLED yapıyoruz
      setAppointments(prev => 
        prev.map(app => app.id === appointmentId ? { ...app, status: 'CANCELLED' } : app)
      );
    } catch (error) {
      console.error("Randevu iptal edilirken hata oluştu:", error);
      alert("Randevu iptal edilemedi.");
    }
  };

  // Statülerin renklerini kurumsal standartlarda belirleyen fonksiyon
  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'APPROVED': return { color: '#10b981', backgroundColor: '#e6f4ea', padding: '6px 12px', borderRadius: '20px', fontWeight: 600, fontSize: '0.85rem' };
      case 'PENDING': return { color: '#f59e0b', backgroundColor: '#fef3c7', padding: '6px 12px', borderRadius: '20px', fontWeight: 600, fontSize: '0.85rem' };
      case 'CANCELLED': return { color: '#ef4444', backgroundColor: '#fee2e2', padding: '6px 12px', borderRadius: '20px', fontWeight: 600, fontSize: '0.85rem' };
      case 'REJECTED': return { color: '#6b7280', backgroundColor: '#f3f4f6', padding: '6px 12px', borderRadius: '20px', fontWeight: 600, fontSize: '0.85rem' };
      default: return {};
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '50px', color: '#6b7280' }}>Randevularınız yükleniyor...</div>;
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '40px auto', padding: '0 24px', fontFamily: 'system-ui, sans-serif' }}>
      
      {/* Üst Başlık Alanı */}
      <div style={{ display: 'flex', justifyContent: 'between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <button onClick={() => navigate('/')} style={{ backgroundColor: '#f3f4f6', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', marginBottom: '12px', fontWeight: 600, color: '#4b5563' }}>
            ← Ana Sayfaya Dön
          </button>
          <h2 style={{ margin: 0, color: '#111827', fontSize: '1.75rem', fontWeight: 700 }}>Randevularım</h2>
          <p style={{ margin: '4px 0 0 0', color: '#6b7280', fontSize: '0.95rem' }}>Geçmiş ve gelecek randevu taleplerinizin durumunu buradan takip edebilirsiniz.</p>
        </div>
      </div>

      {/* Randevu Listesi Tablosu */}
      {appointments.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px', backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #e5e7eb', color: '#6b7280' }}>
          Henüz hiç randevu talebiniz bulunmuyor.
        </div>
      ) : (
        <div style={{ backgroundColor: '#fff', borderRadius: '16px', boxShadow: '0 4px 10px rgba(0,0,0,0.04)', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                <th style={{ padding: '16px', color: '#4b5563', fontSize: '0.85rem', fontWeight: 600 }}>Dükkan</th>
                <th style={{ padding: '16px', color: '#4b5563', fontSize: '0.85rem', fontWeight: 600 }}>Personel</th>
                <th style={{ padding: '16px', color: '#4b5563', fontSize: '0.85rem', fontWeight: 600 }}>Hizmet</th>
                <th style={{ padding: '16px', color: '#4b5563', fontSize: '0.85rem', fontWeight: 600 }}>Tarih / Saat</th>
                <th style={{ padding: '16px', color: '#4b5563', fontSize: '0.85rem', fontWeight: 600 }}>Tutar</th>
                <th style={{ padding: '16px', color: '#4b5563', fontSize: '0.85rem', fontWeight: 600 }}>Durum</th>
                <th style={{ padding: '16px', color: '#4b5563', fontSize: '0.85rem', fontWeight: 600, textAlign: 'center' }}>İşlem</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((app) => (
                <tr key={app.id} style={{ borderBottom: '1px solid #e5e7eb', transition: 'background-color 0.2s' }}>
                  <td style={{ padding: '16px', fontWeight: 600, color: '#111827' }}>{app.shopName}</td>
                  <td style={{ padding: '16px', color: '#4b5563' }}>{app.employeeName}</td>
                  <td style={{ padding: '16px', color: '#4b5563' }}>{app.serviceName}</td>
                  <td style={{ padding: '16px', color: '#111827', fontWeight: 500 }}>
                    {new Date(app.appointmentTime).toLocaleString('tr-TR', { dateStyle: 'short', timeStyle: 'short' })}
                  </td>
                  <td style={{ padding: '16px', fontWeight: 600, color: '#111827' }}>{app.price} TL</td>
                  <td style={{ padding: '16px' }}>
                    <span style={getStatusStyle(app.status)}>{app.status}</span>
                  </td>
                  <td style={{ padding: '16px', textAlign: 'center' }}>
                    {app.status === 'PENDING' || app.status === 'APPROVED' ? (
                      <button 
                        onClick={() => handleCancel(app.id)}
                        style={{ backgroundColor: '#fee2e2', color: '#ef4444', border: 'none', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}
                      >
                        İptal Et
                      </button>
                    ) : (
                      <span style={{ color: '#9ca3af', fontSize: '0.85rem' }}>-</span>
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