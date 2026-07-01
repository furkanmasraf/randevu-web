import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

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
  const [hoveredRowId, setHoveredRowId] = useState<number | null>(null);
  const navigate = useNavigate();

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

  const handleCancel = async (appointmentId: number) => {
    const token = localStorage.getItem('token');
    if (!window.confirm("Bu randevuyu iptal etmek istediğinize emin misiniz?")) return;

    try {
      await axios.put(`http://localhost:8080/api/appointments/${appointmentId}/cancel`, {}, {
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

  // --- STATÜLERİ TÜRKÇELEŞTİREN VE LÜKS ROZET STİLİ SUNAN FONKSİYON ---
  const renderStatusBadge = (status: string) => {
    const baseStyle = {
      padding: '6px 14px',
      borderRadius: '30px',
      fontWeight: 700,
      fontSize: '0.8rem',
      display: 'inline-block',
      letterSpacing: '0.025em'
    };

    switch (status) {
      case 'APPROVED': 
        return <span style={{ ...baseStyle, color: '#16a34a', backgroundColor: '#f0fdf4' }}>🟢 Onaylandı</span>;
      case 'PENDING': 
        return <span style={{ ...baseStyle, color: '#d97706', backgroundColor: '#fef3c7' }}>🟡 Bekliyor</span>;
      case 'CANCELLED': 
        return <span style={{ ...baseStyle, color: '#dc2626', backgroundColor: '#fee2e2' }}>🔴 İptal Edildi</span>;
      case 'REJECTED': 
        return <span style={{ ...baseStyle, color: '#475569', backgroundColor: '#f1f5f9' }}>⚫ Reddedildi</span>;
      default: 
        return <span style={{ ...baseStyle, color: '#64748b', backgroundColor: '#f8fafc' }}>{status}</span>;
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f8fafc', fontFamily: 'system-ui, sans-serif', color: '#64748b', fontSize: '1.1rem', fontWeight: 500 }}>
        Randevu geçmişiniz yükleniyor...
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', padding: '40px 20px', fontFamily: '"Inter", system-ui, sans-serif' }}>
      <div style={{ maxWidth: '1050px', margin: '0 auto' }}>
        
        {/* ÜST GEZİNTİ VE BAŞLIK PANELİ */}
        <div style={{ marginBottom: '32px' }}>
          <button 
            onClick={() => navigate('/')} 
            style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', padding: '10px 18px', borderRadius: '10px', cursor: 'pointer', marginBottom: '16px', fontWeight: 600, color: '#475569', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.2s', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}
          >
            ← Ana Sayfaya Dön
          </button>
          <h2 style={{ margin: 0, color: '#0f172a', fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.025em' }}>Randevularım</h2>
          <p style={{ margin: '6px 0 0 0', color: '#64748b', fontSize: '0.95rem', lineHeight: 1.5 }}>Geçmiş ve gelecek randevu taleplerinizin durumunu anlık olarak buradan takip edebilirsiniz.</p>
        </div>

        {/* VERİ TABLOSU KART ALANI */}
        {appointments.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px', backgroundColor: '#ffffff', borderRadius: '24px', border: '1px solid #e2e8f0', color: '#94a3b8', fontSize: '1rem', fontWeight: 500 }}>
            ✨ Henüz hiç randevu talebiniz bulunmuyor.
          </div>
        ) : (
          <div style={{ backgroundColor: '#ffffff', borderRadius: '24px', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.02), 0 8px 10px -6px rgba(0, 0, 0, 0.02)', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                    <th style={{ padding: '18px 24px', color: '#475569', fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.05em' }}>SALON / DÜKKAN</th>
                    <th style={{ padding: '18px 24px', color: '#475569', fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.05em' }}>PERSONEL</th>
                    <th style={{ padding: '18px 24px', color: '#475569', fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.05em' }}>HİZMET</th>
                    <th style={{ padding: '18px 24px', color: '#475569', fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.05em' }}>TARİH / SAAT</th>
                    <th style={{ padding: '18px 24px', color: '#475569', fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.05em' }}>TUTAR</th>
                    <th style={{ padding: '18px 24px', color: '#475569', fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.05em' }}>DURUM</th>
                    <th style={{ padding: '18px 24px', color: '#475569', fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.05em', textAlign: 'center' }}>İŞLEM</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.map((app) => {
                    const isRowHovered = hoveredRowId === app.id;
                    return (
                      <tr 
                        key={app.id} 
                        onMouseEnter={() => setHoveredRowId(app.id)}
                        onMouseLeave={() => setHoveredRowId(null)}
                        style={{ 
                          borderBottom: '1px solid #f1f5f9', 
                          backgroundColor: isRowHovered ? '#f8fafc' : '#ffffff',
                          transition: 'background-color 0.15s ease' 
                        }}
                      >
                        <td style={{ padding: '20px 24px', fontWeight: 700, color: '#0f172a', fontSize: '0.95rem' }}>{app.shopName}</td>
                        <td style={{ padding: '20px 24px', color: '#334155', fontSize: '0.9rem', fontWeight: 500 }}>{app.employeeName}</td>
                        <td style={{ padding: '20px 24px', color: '#475569', fontSize: '0.9rem' }}>{app.serviceName}</td>
                        <td style={{ padding: '20px 24px', color: '#0f172a', fontWeight: 600, fontSize: '0.9rem' }}>
                          📅 {new Date(app.appointmentTime).toLocaleString('tr-TR', { dateStyle: 'short', timeStyle: 'short' })}
                        </td>
                        <td style={{ padding: '20px 24px', fontWeight: 800, color: '#6366f1', fontSize: '0.95rem' }}>{app.price} TL</td>
                        <td style={{ padding: '20px 24px' }}>
                          {renderStatusBadge(app.status)}
                        </td>
                        <td style={{ padding: '20px 24px', textAlign: 'center' }}>
                          {app.status === 'PENDING' || app.status === 'APPROVED' ? (
                            <button 
                              onClick={() => handleCancel(app.id)}
                              style={{ 
                                backgroundColor: '#fee2e2', 
                                color: '#ef4444', 
                                border: 'none', 
                                padding: '8px 14px', 
                                borderRadius: '10px', 
                                cursor: 'pointer', 
                                fontWeight: 700, 
                                fontSize: '0.85rem',
                                transition: 'all 0.2s',
                                boxShadow: '0 2px 4px rgba(239, 68, 68, 0.05)'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = '#ef4444';
                                e.currentTarget.style.color = '#ffffff';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = '#fee2e2';
                                e.currentTarget.style.color = '#ef4444';
                              }}
                            >
                              İptal Et
                            </button>
                          ) : (
                            <span style={{ color: '#94a3b8', fontSize: '0.9rem', fontWeight: 500 }}>-</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}