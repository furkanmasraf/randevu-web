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
interface ShopDetails { id: number; shopName: string; addressText: string; phoneNumber: string; imageUrl: string; vitrinImageUrls: string[]; vitrinImageUrl?: string;}

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

        const shopData = shopRes.data;

        const normalizedShopDetails = {
          ...shopData,
          vitrinImageUrls: Array.isArray(shopData.vitrinImageUrls)
            ? shopData.vitrinImageUrls
            : (shopData.vitrinImageUrl ? [shopData.vitrinImageUrl] : [])
        };

        setEmployees(empRes.data);
        setServices(servRes.data);
        setShopDetails(normalizedShopDetails);
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

      const token = localStorage.getItem('token');
      if (token) {
        navigate('/');
      } else {
        navigate('/login');
      }

    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Randevu oluşturulurken bir hata oluştu.";
      alert(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#f6f3ee',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'Inter', system-ui, sans-serif",
        color: '#8a7f6e',
        fontSize: '0.95rem'
      }}>
        Yükleniyor...
      </div>
    );
  }

  return (
    <div style={{ padding: '40px 20px', backgroundColor: '#f6f3ee', minHeight: '100vh', display: 'flex', justifyContent: 'center', fontFamily: "'Inter', system-ui, sans-serif" }}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600;700;800&display=swap');

        .mkl-swiper-wrap .swiper-button-next,
        .mkl-swiper-wrap .swiper-button-prev {
          color: #faf7f2;
          transform: scale(0.6);
          background: rgba(28, 25, 23, 0.35);
          border-radius: 50%;
          width: 34px !important;
          height: 34px !important;
          margin-top: -17px;
        }
        .mkl-swiper-wrap .swiper-button-next::after,
        .mkl-swiper-wrap .swiper-button-prev::after {
          font-size: 14px !important;
        }
        .mkl-swiper-wrap .swiper-pagination-bullet {
          background: #faf7f2;
          opacity: 0.6;
        }
        .mkl-swiper-wrap .swiper-pagination-bullet-active {
          background: #b8863b;
          opacity: 1;
        }

        .mkl-field:focus {
          outline: none !important;
          border-color: #b8863b !important;
          box-shadow: 0 0 0 3px rgba(184, 134, 59, 0.15);
        }

        .mkl-phone-link:hover {
          text-decoration: underline !important;
        }

        .mkl-submit-btn {
          transition: background-color 0.2s ease, transform 0.15s ease;
        }
        .mkl-submit-btn:hover:not(:disabled) {
          background-color: #b8863b !important;
        }
        .mkl-submit-btn:active:not(:disabled) {
          transform: scale(0.98);
        }
        .mkl-submit-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      `}</style>

      <div style={{
        width: '100%',
        maxWidth: '500px',
        backgroundColor: '#fff',
        padding: '30px',
        borderRadius: '20px',
        boxShadow: '0 16px 32px -12px rgba(28, 25, 23, 0.14)',
        border: '1px solid #ece4d5'
      }}>

        {shopDetails && (
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <div className="mkl-swiper-wrap" style={{
              width: '100%',
              marginBottom: '24px',
              borderRadius: '16px',
              overflow: 'hidden',
              boxShadow: '0 4px 12px rgba(28,25,23,0.12)'
            }}>
              <Swiper
                modules={[Navigation, Pagination, Autoplay]}
                navigation={true}
                pagination={{ clickable: true }}
                autoplay={{ delay: 3500 }}
                style={{ height: '280px' }}
              >
                {shopDetails.vitrinImageUrls && shopDetails.vitrinImageUrls.length > 0 ? (
                  shopDetails.vitrinImageUrls.map((url, index) => (
                    <SwiperSlide key={index} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f6f0e4' }}>
                      <img src={url} alt={shopDetails.shopName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </SwiperSlide>
                  ))
                ) : shopDetails.vitrinImageUrl ? (
                  <SwiperSlide style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f6f0e4' }}>
                    <img src={shopDetails.vitrinImageUrl} alt={shopDetails.shopName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </SwiperSlide>
                ) : (
                  <SwiperSlide style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f6f0e4' }}>
                    <span style={{ fontFamily: "'Fraunces', serif", fontSize: '2.2rem', color: '#b8863b' }}>
                      {shopDetails.shopName?.charAt(0).toUpperCase()}
                    </span>
                  </SwiperSlide>
                )}
              </Swiper>
            </div>

            <h2 style={{
              marginTop: '0',
              marginBottom: '6px',
              fontFamily: "'Fraunces', serif",
              fontWeight: 600,
              fontSize: '1.4rem',
              color: '#1c1917'
            }}>
              {shopDetails.shopName}
            </h2>
            <p style={{ color: '#78706a', fontSize: '0.9rem', marginBottom: '10px' }}>
              {shopDetails.addressText}
            </p>

            <a
              className="mkl-phone-link"
              href={shopDetails.phoneNumber ? `tel:${shopDetails.phoneNumber}` : '#'}
              style={{
                color: shopDetails.phoneNumber ? '#b8863b' : '#b3a692',
                fontWeight: 700,
                fontSize: '1rem',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                cursor: shopDetails.phoneNumber ? 'pointer' : 'default'
              }}
            >
              {shopDetails.phoneNumber || 'Telefon bilgisi yok'}
            </a>

            <div style={{
              width: '48px',
              height: '3px',
              margin: '20px auto 0 auto',
              borderRadius: '3px',
              background: 'linear-gradient(90deg, #b8863b 0%, #b8863b 45%, #7a2e2e 55%, #7a2e2e 100%)'
            }} />
          </div>
        )}

        <h2 style={{
          fontFamily: "'Fraunces', serif",
          fontWeight: 600,
          fontSize: '1.2rem',
          color: '#1c1917',
          marginBottom: '18px'
        }}>
          Randevu Planlama
        </h2>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

          <select className="mkl-field" value={selectedEmployee} onChange={(e) => setSelectedEmployee(e.target.value)} style={inputStyle}>
            <option value="">Personel Seçin</option>
            {employees.map(emp => (
              <option key={emp.id} value={emp.id}>
                {(emp.firstName || emp.lastName) ? `${emp.firstName || ''} ${emp.lastName || ''}`.trim() : 'İsimsiz Personel'}
              </option>
            ))}
          </select>

          <select className="mkl-field" value={selectedService} onChange={(e) => setSelectedService(e.target.value)} style={inputStyle}>
            <option value="">Hizmet Seçin</option>
            {services.map(s => <option key={s.id} value={s.id}>{`${s.name} - ${s.price} TL`}</option>)}
          </select>

          <input className="mkl-field" type="date" value={appointmentDate} onChange={(e) => setAppointmentDate(e.target.value)} style={inputStyle} />

          <select className="mkl-field" value={appointmentTime} onChange={(e) => setAppointmentTime(e.target.value)} style={inputStyle}>
            <option value="">Saat Seçin</option>
            {allPossibleSlots.map(slot => (
              <option key={slot} value={slot} disabled={takenSlots.includes(slot)} style={{ color: takenSlots.includes(slot) ? '#c0392b' : '#1c1917' }}>
                {slot} {takenSlots.includes(slot) ? '(Dolu)' : ''}
              </option>
            ))}
          </select>

          {!localStorage.getItem('token') && (
            <p style={{ color: '#a3402f', fontSize: '0.8rem', textAlign: 'center', marginTop: '-4px' }}>
              * Randevuyu onaylamak için giriş yapmanız gerekecektir.
            </p>
          )}

          <button type="submit" disabled={submitting} className="mkl-submit-btn" style={buttonStyle}>
            {submitting ? "Oturum Kaydediliyor..." : "Randevuyu Onayla"}
          </button>
        </form>
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  padding: '13px 14px',
  borderRadius: '10px',
  border: '1px solid #e4ddd2',
  backgroundColor: '#faf8f4',
  fontSize: '0.95rem',
  fontFamily: "'Inter', sans-serif",
  color: '#1c1917',
  outline: 'none',
  transition: 'border-color 0.2s ease'
};

const buttonStyle: React.CSSProperties = {
  padding: '14px',
  background: '#1c1917',
  color: '#faf7f2',
  border: 'none',
  borderRadius: '10px',
  cursor: 'pointer',
  fontWeight: 700,
  fontSize: '1rem',
  fontFamily: "'Inter', sans-serif",
  marginTop: '6px'
};