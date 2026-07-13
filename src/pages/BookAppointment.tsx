import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../services/api';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

interface Employee { id: number; firstName: string; lastName: string; title: string; }
interface Service { id: number; name: string; price: number; durationMinutes: number; }
interface ShopDetails { id: number; shopName: string; addressText: string; phoneNumber: string; imageUrl: string; }

export default function BookAppointment() {
  const { shopId } = useParams<{ shopId: string }>();
  const navigate = useNavigate();

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [shopDetails, setShopDetails] = useState<ShopDetails | null>(null);
  const [takenSlots, setTakenSlots] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const [selectedEmployee, setSelectedEmployee] = useState<string>('');
  const [selectedService, setSelectedService] = useState<string>('');
  const [appointmentDate, setAppointmentDate] = useState<string>('');
  const [appointmentTime, setAppointmentTime] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (selectedEmployee && appointmentDate) {
      const fetchTakenSlots = async () => {
        try {
          const response = await API.get(`https://randevu-sistemi-dv33.onrender.com/api/appointments/taken-slots`, {
            params: { employeeId: selectedEmployee, date: appointmentDate }
          });
          setTakenSlots(response.data);
        } catch (error) { console.error("Dolu saatler çekilirken hata:", error); }
      };
      fetchTakenSlots();
    }
  }, [selectedEmployee, appointmentDate]);

  useEffect(() => {
    // Artık token kontrolü yok, çünkü buraya zaten giriş yapmış kullanıcı gelir!
    const fetchAllData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };
        
        const [empRes, servRes, shopRes] = await Promise.all([
          API.get(`https://randevu-sistemi-dv33.onrender.com/api/shops/${shopId}/employees`, { headers }),
          API.get(`https://randevu-sistemi-dv33.onrender.com/api/shops/${shopId}/services`, { headers }),
          API.get(`https://randevu-sistemi-dv33.onrender.com/api/shops/${shopId}/details`, { headers })
        ]);
        
        setEmployees(empRes.data);
        setServices(servRes.data);
        setShopDetails(shopRes.data);
      } catch (error) { 
        console.error("Veri çekme hatası:", error); 
      } finally { 
        setLoading(false); 
      }
    };
    
    fetchAllData();
  }, [shopId]);

  const allPossibleSlots = ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00", "22:00", "23:00"];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validasyon kontrolü
    if (!selectedEmployee || !selectedService || !appointmentDate || !appointmentTime) {
      alert("Lütfen tüm alanları doldurun."); 
      return;
    }

    try {
      setSubmitting(true);
      
      const payload = {
        shopId: Number(shopId),
        employeeId: Number(selectedEmployee),
        serviceId: Number(selectedService),
        userId: Number(localStorage.getItem('userId')),
        appointmentTime: `${appointmentDate}T${appointmentTime}:00`
      };

      await API.post('/api/appointments', payload, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      alert("Randevunuz başarıyla oluşturuldu!");

      // Akıllı yönlendirme mantığı
      const token = localStorage.getItem('token');
      if (token) {
        // Kullanıcı giriş yapmışsa ana sayfaya (Home/Dashboard) gönder
        navigate('/');
      } else {
        // Kullanıcı giriş yapmamışsa (misafir olarak alıyorsa) giriş ekranına gönder
        navigate('/login');
      }

    } catch (error: any) { 
      // Hata mesajını daha okunabilir hale getirdik
      const errorMessage = error.response?.data?.message || "Randevu oluşturulurken bir hata oluştu.";
      alert(errorMessage); 
    } finally { 
      setSubmitting(false); 
    }
  };

  if (loading) return <div>Yükleniyor...</div>;

  return (
    <div style={{ padding: '40px 20px', backgroundColor: '#f8fafc', minHeight: '100vh', display: 'flex', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: '500px', backgroundColor: '#fff', padding: '30px', borderRadius: '20px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)' }}>
        
        {/* DÜKKAN VİTRİNİ */}
        {shopDetails && (
  <div style={{ textAlign: 'center', marginBottom: '30px' }}>
    {/* Görseli Kontrol Et */}
    <div style={{ 
  width: '100%', 
  marginBottom: '30px', 
  borderRadius: '16px', 
  overflow: 'hidden', 
  boxShadow: '0 4px 12px rgba(0,0,0,0.1)' 
}}>
  <Swiper
    modules={[Navigation, Pagination, Autoplay]}
    navigation={true}
    pagination={{ clickable: true }}
    autoplay={{ delay: 3500 }}
    style={{ height: '280px' }} // Dikdörtgen görünüm için yükseklik
  >
    <SwiperSlide style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f1f5f9' }}>
  {shopDetails.imageUrl && shopDetails.imageUrl.trim() !== "" ? (
    <img 
      src={`https://randevu-sistemi-dv33.onrender.com${shopDetails.imageUrl}`} 
      alt={shopDetails.shopName} 
      style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
    />
  ) : (
    <span style={{ fontSize: '4rem' }}>💈</span> // Görsel yoksa şık bir ikon
  )}
</SwiperSlide>
    {/* İleride buraya daha fazla SwiperSlide ekleyebilirsin */}
  </Swiper>
</div>
    
    <h2 style={{ marginTop: '15px', marginBottom: '5px', color: '#0f172a' }}>{shopDetails.shopName}</h2>
    <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '10px' }}>📍 {shopDetails.addressText}</p>
    
    {/* Telefon bilgisini link olarak ekledik, dokunulabilir hale geldi */}
    <a 
  href={shopDetails.phoneNumber ? `tel:${shopDetails.phoneNumber}` : '#'} 
  style={{ 
    color: shopDetails.phoneNumber ? '#3b82f6' : '#94a3b8', // Numarasızsa gri renk
    fontWeight: 700, 
    fontSize: '1rem', 
    textDecoration: 'none',
    display: 'inline-flex', 
    alignItems: 'center', 
    gap: '8px',
    cursor: shopDetails.phoneNumber ? 'pointer' : 'default' // Numarasızsa tıklanmasın
  }}
>
  📞 {shopDetails.phoneNumber || 'Telefon bilgisi yok'}
</a>
  </div>
        )}

        <h2>Randevu Planlama</h2>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <select value={selectedEmployee} onChange={(e) => setSelectedEmployee(e.target.value)} style={inputStyle}>
            <option value="">Personel Seçin</option>
            {employees.map(emp => (
              <option key={emp.id} value={emp.id}>
                {(emp.firstName || emp.lastName) ? `${emp.firstName || ''} ${emp.lastName || ''}`.trim() : 'İsimsiz Personel'}
              </option>
            ))}
          </select>

          <select value={selectedService} onChange={(e) => setSelectedService(e.target.value)} style={inputStyle}>
            <option value="">Hizmet Seçin</option>
            {services.map(s => <option key={s.id} value={s.id}>{s.name} - {s.price} TL</option>)}
          </select>

          <input type="date" value={appointmentDate} onChange={(e) => setAppointmentDate(e.target.value)} style={inputStyle} />

          <select value={appointmentTime} onChange={(e) => setAppointmentTime(e.target.value)} style={inputStyle}>
            <option value="">Saat Seçin</option>
            {allPossibleSlots.map(slot => (
              <option key={slot} value={slot} disabled={takenSlots.includes(slot)} style={{ color: takenSlots.includes(slot) ? 'red' : 'black' }}>
                {slot} {takenSlots.includes(slot) ? '(Dolu)' : ''}
              </option>
            ))}
          </select>

          {!localStorage.getItem('token') && (
    <p style={{ color: '#ef4444', fontSize: '0.8rem', textAlign: 'center', marginTop: '-10px' }}>
      * Randevuyu onaylamak için giriş yapmanız gerekecektir.
    </p>
  )}

          <button type="submit" disabled={submitting} style={buttonStyle}>
            {submitting ? "Oturum Kaydediliyor..." : "Randevuyu Onayla"}
          </button>
        </form>
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0', backgroundColor: '#f8fafc', fontSize: '0.95rem', outline: 'none'
};

const buttonStyle: React.CSSProperties = {
  padding: '14px', background: '#0f172a', color: '#fff', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: 600, fontSize: '1rem', marginTop: '10px'
};