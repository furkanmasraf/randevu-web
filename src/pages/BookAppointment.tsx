import { useState, useEffect, ChangeEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from 'axios';

interface Employee {
  id: number;
  name: string;
  title: string;
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

  // Veri State'leri
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Form Elemanlarının State'leri
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');
  const [selectedService, setSelectedService] = useState<string>('');
  const [appointmentDate, setAppointmentDate] = useState<string>('');
  const [appointmentTime, setAppointmentTime] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Etkileşim State'leri
  const [focusedInput, setFocusedInput] = useState<string>('');
  const [isBtnHovered, setIsBtnHovered] = useState<boolean>(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchShopDetails = async () => {
      try {
        setLoading(true);
        const headers = { Authorization: `Bearer ${token}` };
        
        const [empResponse, serviceResponse] = await Promise.all([
          axiosInstance.get(`http://localhost:8080/api/shops/${shopId}/employees`, { headers }),
          axiosInstance.get(`http://localhost:8080/api/shops/${shopId}/services`, { headers })
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    if (!selectedEmployee || !selectedService || !appointmentDate || !appointmentTime) {
      alert("Lütfen tüm alanları eksiksiz doldurunuz.");
      return;
    }

    try {
      setSubmitting(true);
      const combinedDateTime = `${appointmentDate}T${appointmentTime}:00`;

      const appointmentPayload = {
        shopId: Number(shopId),
        employeeId: Number(selectedEmployee),
        serviceId: Number(selectedService),
        userId: Number(localStorage.getItem('userId')),
        appointmentTime: combinedDateTime
      };

      await axiosInstance.post('http://localhost:8080/api/appointments', appointmentPayload, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      alert("Randevunuz başarıyla oluşturuldu! Onay bekleniyor.");
      navigate('/');
    } catch (error: any) {
      console.error("Randevu oluşturulurken hata:", error);
      alert(error.response?.data?.message || "Randevu alınırken bir hata oluştu.");
    } finally {
      setSubmitting(false);
    }
  };

  // Dinamik seçilen hizmet detayı bulucu (Özet paneli için)
  const currentServiceDetails = services.find(s => s.id === Number(selectedService));

  const getInputStyle = (inputName: string) => ({
    padding: '14px 16px',
    borderRadius: '12px',
    border: focusedInput === inputName ? '2px solid #6366f1' : '1px solid #e2e8f0',
    fontSize: '0.95rem',
    outline: 'none',
    backgroundColor: '#f8fafc',
    color: '#334155',
    transition: 'all 0.2s ease-in-out',
    boxShadow: focusedInput === inputName ? '0 0 0 4px rgba(99, 102, 241, 0.15)' : 'none',
  });

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f8fafc', fontFamily: 'system-ui, sans-serif', color: '#64748b', fontSize: '1.1rem', fontWeight: 500 }}>
        Koltuklar sizin için hazırlanıyor...
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', padding: '40px 20px', display: 'flex', justifyContent: 'center', alignItems: 'center', fontFamily: '"Inter", system-ui, sans-serif' }}>
      
      <div style={{ width: '100%', maxWidth: '540px', backgroundColor: '#ffffff', padding: '40px', borderRadius: '24px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.03), 0 10px 10px -5px rgba(0, 0, 0, 0.03)', border: '1px solid #e2e8f0' }}>
        
        {/* GERİ DÖNÜŞ PANELİ */}
        <button 
          onClick={() => navigate(-1)} 
          style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#f1f5f9', border: 'none', padding: '10px 18px', borderRadius: '10px', cursor: 'pointer', marginBottom: '28px', fontWeight: 600, color: '#475569', fontSize: '0.875rem', transition: 'all 0.2s' }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e2e8f0'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
        >
          ← Mağazalara Geri Dön
        </button>

        <div style={{ marginBottom: '32px' }}>
          <h2 style={{ margin: '0 0 8px 0', color: '#0f172a', fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.025em' }}>Randevu Planlama</h2>
          <p style={{ margin: 0, color: '#64748b', fontSize: '0.95rem', lineHeight: 1.5 }}>Lütfen dilediğiniz personeli, almak istediğiniz hizmeti ve zaman dilimini belirleyin.</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* PERSONEL SEÇİMİ */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#475569', letterSpacing: '0.05em' }}>PERSONEL</label>
            <select 
              value={selectedEmployee} 
              onFocus={() => setFocusedInput('employee')}
              onBlur={() => setFocusedInput('')}
              onChange={(e: ChangeEvent<HTMLSelectElement>) => setSelectedEmployee(e.target.value)}
              style={getInputStyle('employee')}
            >
              <option value="">İşlemi yapacak personeli seçin...</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>{emp.name} — ({emp.title})</option>
              ))}
            </select>
          </div>

          {/* HİZMET SEÇİMİ */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#475569', letterSpacing: '0.05em' }}>ALINACAK HİZMET</label>
            <select 
              value={selectedService} 
              onFocus={() => setFocusedInput('service')}
              onBlur={() => setFocusedInput('')}
              onChange={(e: ChangeEvent<HTMLSelectElement>) => setSelectedService(e.target.value)}
              style={getInputStyle('service')}
            >
              <option value="">Uygulanacak hizmeti seçin...</option>
              {services.map(ser => (
                <option key={ser.id} value={ser.id}>{ser.name} — {ser.price} TL ({ser.durationMinutes} dk)</option>
              ))}
            </select>
          </div>

          {/* TARİH VE SAAT SEÇİMİ */}
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '160px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#475569', letterSpacing: '0.05em' }}>RANDEVU TARİHİ</label>
              <input 
                type="date" 
                value={appointmentDate}
                onFocus={() => setFocusedInput('date')}
                onBlur={() => setFocusedInput('')}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setAppointmentDate(e.target.value)}
                style={getInputStyle('date')}
              />
            </div>

            <div style={{ flex: 1, minWidth: '160px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#475569', letterSpacing: '0.05em' }}>SEANS SAATİ</label>
              <input 
                type="time" 
                value={appointmentTime}
                onFocus={() => setFocusedInput('time')}
                onBlur={() => setFocusedInput('')}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setAppointmentTime(e.target.value)}
                style={getInputStyle('time')}
              />
            </div>
          </div>

          {/* 💎 PREMIUM ÖZET PANELİ (Dinamik) */}
          {currentServiceDetails && (
            <div style={{ backgroundColor: '#f5f3ff', border: '1px dashed #c7d2fe', padding: '16px 20px', borderRadius: '14px', marginTop: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', animation: 'fadeIn 0.3s ease' }}>
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#6366f1' }}>Seçilen Hizmet Özeti</div>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: '#312e81', marginTop: '2px' }}>{currentServiceDetails.name}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#4f46e5' }}>{currentServiceDetails.price} TL</div>
                <div style={{ fontSize: '0.8rem', color: '#6366f1', fontWeight: 500 }}>⏱ {currentServiceDetails.durationMinutes} Dakika</div>
              </div>
            </div>
          )}

          {/* ONAY BUTONU */}
          <button 
            type="submit" 
            disabled={submitting}
            onMouseEnter={() => setIsBtnHovered(true)}
            onMouseLeave={() => setIsBtnHovered(false)}
            style={{ 
              marginTop: '8px',
              backgroundColor: submitting ? '#64748b' : (isBtnHovered ? '#4f46e5' : '#111827'), 
              color: '#ffffff', 
              border: 'none', 
              padding: '16px 0', 
              borderRadius: '14px', 
              fontWeight: 600, 
              cursor: submitting ? 'not-allowed' : 'pointer', 
              fontSize: '1rem',
              boxShadow: isBtnHovered && !submitting ? '0 10px 15px -3px rgba(99, 102, 241, 0.3)' : 'none',
              transform: isBtnHovered && !submitting ? 'translateY(-1px)' : 'none',
              transition: 'all 0.2s ease-in-out'
            }}
          >
            {submitting ? "Oturum Kaydediliyor..." : "Randevuyu Onayla ve Oluştur"}
          </button>

        </form>
      </div>
    </div>
  );
}