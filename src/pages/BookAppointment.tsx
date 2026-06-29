import { useState, useEffect, ChangeEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

// Backend ilişkileri için gerekli TypeScript tipleri
interface Employee {
  id: number;
  name: string;
  title: string; // Örn: Usta Berber, Renklendirme Uzmanı vb.
}

interface Service {
  id: number;
  name: string;
  price: number;
  durationMinutes: number;
}

export default function BookAppointment() {
  const { shopId } = useParams<{ shopId: string }>();
  const navigate = useNavigate();

  // 1. Form ve Veri State'leri
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Seçilen form elemanlarının state'leri
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');
  const [selectedService, setSelectedService] = useState<string>('');
  const [appointmentDate, setAppointmentDate] = useState<string>('');
  const [appointmentTime, setAppointmentTime] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);

  // 2. Sayfa Açıldığında Dükkana Ait Çalışan ve Hizmetleri Çekme
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchShopDetails = async () => {
      try {
        setLoading(true);
        // NOT: Endpoint'leri kendi backend yapınıza (Örn: /api/shops/{id}/employees) göre güncelleyebilirsiniz.
        // Şimdilik test amaçlı veya paralel geliştirme için dükkana ait verileri paralel çekiyoruz.
        const headers = { Authorization: `Bearer ${token}` };
        
        const [empResponse, serviceResponse] = await Promise.all([
          axios.get(`http://localhost:8080/api/shops/${shopId}/employees`, { headers }),
          axios.get(`http://localhost:8080/api/shops/${shopId}/services`, { headers })
        ]);

        setEmployees(empResponse.data);
        setServices(serviceResponse.data);
      } catch (error) {
        console.error("Dükkan detayları çekilirken hata oluştu:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchShopDetails();
  }, [shopId, navigate]);

  // 3. Randevu Kaydetme (POST) İşlemi
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    if (!selectedEmployee || !selectedService || !appointmentDate || !appointmentTime) {
      alert("Lütfen tüm alanları eksiksiz doldurunuz.");
      return;
    }

    try {
      setSubmitting(true);

      // Tarih ve saat alanlarını backend'in beklediği LocalDateTime formatına (YYYY-MM-DDTHH:mm:ss) getiriyoruz
      const combinedDateTime = `${appointmentDate}T${appointmentTime}:00`;

      const appointmentPayload = {
       shopId: Number(shopId),
       employeeId: Number(selectedEmployee),
       serviceId: Number(selectedService),
       userId: Number(localStorage.getItem('userId')), // Kullanıcı ID'si localStorage'dan alınıyor,
       appointmentTime: combinedDateTime
     };

      await axios.post('http://localhost:8080/api/appointments', appointmentPayload, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      alert("Randevunuz başarıyla oluşturuldu! Onay bekleniyor.");
      navigate('/'); // Başarılıysa ana sayfaya dön
    } catch (error: any) {
      console.error("Randevu oluşturulurken hata:", error);
      alert(error.response?.data?.message || "Randevu alınırken bir hata oluştu.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '50px', color: '#6b7280' }}>Dükkan bilgileri yükleniyor...</div>;
  }

  return (
    <div style={{ maxWidth: '600px', margin: '40px auto', padding: '32px', backgroundColor: '#fff', borderRadius: '16px', boxShadow: '0 4px 10px rgba(0,0,0,0.08)', fontFamily: 'system-ui, sans-serif' }}>
      <button onClick={() => navigate(-1)} style={{ backgroundColor: '#f3f4f6', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', marginBottom: '24px', fontWeight: 600, color: '#4b5563' }}>
        ← Geri Dön
      </button>

      <h2 style={{ margin: '0 0 8px 0', color: '#111827', fontSize: '1.5rem', fontWeight: 700 }}>Randevu Planlama</h2>
      <p style={{ margin: '0 0 24px 0', color: '#6b7280', fontSize: '0.95rem' }}>Lütfen dilediğiniz personel, hizmet ve zaman dilimini seçiniz.</p>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* PERSONEL SEÇİMİ */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#4b5563' }}>Personel Seçimi</label>
          <select 
            value={selectedEmployee} 
            onChange={(e: ChangeEvent<HTMLSelectElement>) => setSelectedEmployee(e.target.value)}
            style={{ padding: '12px 16px', borderRadius: '10px', border: '1px solid #d1d5db', outline: 'none', fontSize: '0.95rem', backgroundColor: '#fff' }}
          >
            <option value="">Personel Seçiniz...</option>
            {employees.map(emp => (
              <option key={emp.id} value={emp.id}>{emp.name} ({emp.title})</option>
            ))}
          </select>
        </div>

        {/* HİZMET SEÇİMİ */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#4b5563' }}>Alınacak Hizmet</label>
          <select 
            value={selectedService} 
            onChange={(e: ChangeEvent<HTMLSelectElement>) => setSelectedService(e.target.value)}
            style={{ padding: '12px 16px', borderRadius: '10px', border: '1px solid #d1d5db', outline: 'none', fontSize: '0.95rem', backgroundColor: '#fff' }}
          >
            <option value="">Hizmet Seçiniz...</option>
            {services.map(ser => (
              <option key={ser.id} value={ser.id}>{ser.name} - {ser.price} TL ({ser.durationMinutes} dk)</option>
            ))}
          </select>
        </div>

        {/* TARİH VE SAAT SEÇİMİ */}
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '140px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#4b5563' }}>Tarih</label>
            <input 
              type="date" 
              value={appointmentDate}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setAppointmentDate(e.target.value)}
              style={{ padding: '12px 16px', borderRadius: '10px', border: '1px solid #d1d5db', outline: 'none', fontSize: '0.95rem' }}
            />
          </div>

          <div style={{ flex: 1, minWidth: '140px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#4b5563' }}>Saat</label>
            <input 
              type="time" 
              value={appointmentTime}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setAppointmentTime(e.target.value)}
              style={{ padding: '12px 16px', borderRadius: '10px', border: '1px solid #d1d5db', outline: 'none', fontSize: '0.95rem' }}
            />
          </div>
        </div>

        {/* ONAY BUTONU */}
        <button 
          type="submit" 
          disabled={submitting}
          style={{ 
            marginTop: '12px',
            backgroundColor: '#111827', 
            color: '#fff', 
            border: 'none', 
            padding: '14px 0', 
            borderRadius: '10px', 
            fontWeight: 600, 
            cursor: submitting ? 'not-allowed' : 'pointer', 
            fontSize: '1rem',
            opacity: submitting ? 0.7 : 1,
            transition: 'all 0.2s'
          }}
        >
          {submitting ? "Randevu Kaydediliyor..." : "Randevuyu Onayla ve Oluştur"}
        </button>

      </form>
    </div>
  );
}