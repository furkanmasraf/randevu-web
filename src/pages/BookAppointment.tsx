import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../services/api';

interface Employee { id: number; firstName: string; lastName: string; title: string; }
interface Service { id: number; name: string; price: number; durationMinutes: number; }
interface ShopDetails { id: number; shopName: string; address: string; phoneNumber: string; imageUrl: string; }

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
    const token = localStorage.getItem('token');
    if (!token) { navigate('/login'); return; }

    const fetchAllData = async () => {
      try {
        setLoading(true);
        const headers = { Authorization: `Bearer ${token}` };
        const [empRes, servRes, shopRes] = await Promise.all([
          API.get(`https://randevu-sistemi-dv33.onrender.com/api/shops/${shopId}/employees`, { headers }),
          API.get(`https://randevu-sistemi-dv33.onrender.com/api/shops/${shopId}/services`, { headers }),
          API.get(`https://randevu-sistemi-dv33.onrender.com/api/shops/${shopId}/details`, { headers })
        ]);
        setEmployees(empRes.data);
        setServices(servRes.data);
        setShopDetails(shopRes.data);
      } catch (error) { console.error(error); } finally { setLoading(false); }
    };
    fetchAllData();
  }, [shopId, navigate]);

  const allPossibleSlots = ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00"];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmployee || !selectedService || !appointmentDate || !appointmentTime) {
      alert("Lütfen tüm alanları doldurun."); return;
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
      navigate('/');
    } catch (error: any) { alert(error.response?.data?.message || "Hata oluştu."); }
    finally { setSubmitting(false); }
  };

  if (loading) return <div>Yükleniyor...</div>;

  return (
    <div style={{ padding: '40px 20px', backgroundColor: '#f8fafc', minHeight: '100vh', display: 'flex', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: '500px', backgroundColor: '#fff', padding: '30px', borderRadius: '20px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)' }}>
        
        {/* DÜKKAN VİTRİNİ */}
        {shopDetails && (
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <img src={shopDetails.imageUrl} alt={shopDetails.shopName} style={{ width: '120px', height: '120px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #f1f5f9' }} />
            <h2 style={{ marginTop: '15px', marginBottom: '5px' }}>{shopDetails.shopName}</h2>
            <p style={{ color: '#64748b', fontSize: '0.9rem' }}>📍 {shopDetails.address}</p>
            <p style={{ color: '#0f172a', fontWeight: 'bold' }}>📞 {shopDetails.phoneNumber}</p>
          </div>
        )}

        <h2>Randevu Planlama</h2>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <select value={selectedEmployee} onChange={(e) => setSelectedEmployee(e.target.value)} style={{ padding: '12px', borderRadius: '8px' }}>
            <option value="">Personel Seçin</option>
            {employees.map(emp => (
              <option key={emp.id} value={emp.id}>
                {(emp.firstName || emp.lastName) ? `${emp.firstName || ''} ${emp.lastName || ''}`.trim() : 'İsimsiz Personel'}
              </option>
            ))}
          </select>

          <select value={selectedService} onChange={(e) => setSelectedService(e.target.value)} style={{ padding: '12px', borderRadius: '8px' }}>
            <option value="">Hizmet Seçin</option>
            {services.map(s => <option key={s.id} value={s.id}>{s.name} - {s.price} TL</option>)}
          </select>

          <input type="date" value={appointmentDate} onChange={(e) => setAppointmentDate(e.target.value)} style={{ padding: '12px', borderRadius: '8px' }} />

          <select value={appointmentTime} onChange={(e) => setAppointmentTime(e.target.value)} style={{ padding: '12px', borderRadius: '8px' }}>
            <option value="">Saat Seçin</option>
            {allPossibleSlots.map(slot => (
              <option key={slot} value={slot} disabled={takenSlots.includes(slot)} style={{ color: takenSlots.includes(slot) ? 'red' : 'black' }}>
                {slot} {takenSlots.includes(slot) ? '(Dolu)' : ''}
              </option>
            ))}
          </select>

          <button type="submit" disabled={submitting} style={{ padding: '12px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
            {submitting ? "Oturum Kaydediliyor..." : "Randevuyu Onayla"}
          </button>
        </form>
      </div>
    </div>
  );
}