import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from 'axios';

interface Employee { id: number; name: string; title: string; }
interface Service { id: number; name: string; price: number; durationMinutes: number; }

export default function BookAppointment() {
  const { shopId } = useParams<{ shopId: string }>();
  const navigate = useNavigate();

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [takenSlots, setTakenSlots] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const [selectedEmployee, setSelectedEmployee] = useState<string>('');
  const [selectedService, setSelectedService] = useState<string>('');
  const [appointmentDate, setAppointmentDate] = useState<string>('');
  const [appointmentTime, setAppointmentTime] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Müsaitlik Kontrolü
  useEffect(() => {
    if (selectedEmployee && appointmentDate) {
      const fetchTakenSlots = async () => {
        try {
          const response = await axiosInstance.get(`http://localhost:8080/api/appointments/taken-slots`, {
            params: { employeeId: selectedEmployee, date: appointmentDate }
          });
          setTakenSlots(response.data);
        } catch (error) {
          console.error("Dolu saatler çekilirken hata:", error);
        }
      };
      fetchTakenSlots();
    }
  }, [selectedEmployee, appointmentDate]);

  // Sayfa Yüklenirken Verileri Çek
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { navigate('/login'); return; }

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
      } catch (error) { console.error(error); } finally { setLoading(false); }
    };
    fetchShopDetails();
  }, [shopId, navigate]);

  const allPossibleSlots = ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00"];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmployee || !selectedService || !appointmentDate || !appointmentTime) {
      alert("Lütfen tüm alanları doldurun."); return;
    }

    try {
      setSubmitting(true);
      
      // PAYLOAD TANIMLANDI
      const appointmentPayload = {
        shopId: Number(shopId),
        employeeId: Number(selectedEmployee),
        serviceId: Number(selectedService),
        userId: Number(localStorage.getItem('userId')),
        appointmentTime: `${appointmentDate}T${appointmentTime}:00`
      };

      await axiosInstance.post('http://localhost:8080/api/appointments', appointmentPayload, {
        headers: { 
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      alert("Randevunuz başarıyla oluşturuldu!");
      navigate('/');
    } catch (error: any) {
      console.error(error);
      alert(error.response?.data?.message || "Randevu alınırken hata oluştu.");
    } finally { 
      setSubmitting(false); 
    }
  };

  if (loading) return <div>Yükleniyor...</div>;

  return (
    <div style={{ padding: '40px 20px', backgroundColor: '#f8fafc', minHeight: '100vh', display: 'flex', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: '500px', backgroundColor: '#fff', padding: '30px', borderRadius: '20px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)' }}>
        
        <h2>Randevu Planlama</h2>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <select value={selectedEmployee} onChange={(e) => setSelectedEmployee(e.target.value)} style={{ padding: '12px' }}>
            <option value="">Personel Seçin</option>
            {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.name}</option>)}
          </select>

          <select value={selectedService} onChange={(e) => setSelectedService(e.target.value)} style={{ padding: '12px' }}>
            <option value="">Hizmet Seçin</option>
            {services.map(service => (
              <option key={service.id} value={service.id}>{service.name} - {service.price} TL</option>
            ))}
          </select>

          <input type="date" value={appointmentDate} onChange={(e) => setAppointmentDate(e.target.value)} style={{ padding: '12px' }} />

          <select value={appointmentTime} onChange={(e) => setAppointmentTime(e.target.value)} style={{ padding: '12px' }}>
            <option value="">Saat Seçin</option>
            {allPossibleSlots.map(slot => (
              <option 
                key={slot} 
                value={slot} 
                disabled={takenSlots.includes(slot)}
                style={{ color: takenSlots.includes(slot) ? 'red' : 'black' }}
              >
                {slot} {takenSlots.includes(slot) ? '(Dolu)' : ''}
              </option>
            ))}
          </select>

          <button type="submit" disabled={submitting}>
            {submitting ? "Oturum Kaydediliyor..." : "Randevuyu Onayla"}
          </button>
        </form>
      </div>
    </div>
  );
}