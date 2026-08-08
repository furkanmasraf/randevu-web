import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../services/api';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

interface Employee { id: number; firstName: string; lastName: string; title: string; }
interface Service { id: number; name: string; price: number; durationMinutes?: number; durationInMinutes?: number; }
interface ShopDetails { 
  id: number; 
  shopName: string; 
  addressText: string; 
  phoneNumber: string; 
  imageUrl: string; 
  vitrinImageUrls: string[]; 
  vitrinImageUrl?: string;
  latitude?: number;
  longitude?: number;
}

export default function BookAppointment() {
  const { id } = useParams<{ id: string }>();
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
  const [notification, setNotification] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

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
          API.get(`https://randevu-sistemi-dv33.onrender.com/api/shops/${id}/employees`, { headers }),
          API.get(`https://randevu-sistemi-dv33.onrender.com/api/shops/${id}/services`, { headers }),
          API.get(`https://randevu-sistemi-dv33.onrender.com/api/shops/${id}/details`, { headers })
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
  }, [id]);

  const allPossibleSlots = ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00", "22:00", "23:00"];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedEmployee || !selectedService) {
      showNotification("Lütfen bir uzman ve hizmet seçin.");
      return;
    }

    if (!appointmentDate || !appointmentTime) {
      showNotification("Lütfen tarih ve saatinizi seçin.");
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        shopId: Number(id),
        id: Number(id),
        employeeId: Number(selectedEmployee),
        serviceId: Number(selectedService),
        userId: Number(localStorage.getItem('userId')),
        appointmentTime: `${appointmentDate}T${appointmentTime}:00`
      };

      await API.post('/api/appointments', payload, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      showNotification("Randevunuz başarıyla oluşturuldu!");
      const token = localStorage.getItem('token');
      setTimeout(() => {
        if (token) {
          navigate('/');
        } else {
          navigate('/login');
        }
      }, 1200);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Randevu oluşturulurken bir hata oluştu.";
      showNotification(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const currentEmployee = employees.find(emp => String(emp.id) === selectedEmployee);
  const currentService = services.find(s => String(s.id) === selectedService);

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#FAF8F5',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'Inter', sans-serif",
        color: '#A3845B',
        gap: '16px'
      }}>
        <div style={{
          width: '36px',
          height: '36px',
          border: '3px solid rgba(197, 168, 128, 0.2)',
          borderTopColor: '#A3845B',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
        <span style={{ fontSize: '0.92rem', fontWeight: 500, letterSpacing: '0.05em' }}>Salon Bilgileri Yükleniyor...</span>
        
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div style={{ 
      padding: '40px 24px 80px 24px', 
      backgroundColor: '#FAF8F5', 
      minHeight: '100vh', 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'flex-start',
      fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
      color: '#1E1B18'
    }}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

        /* Swiper styling */
        .mkl-swiper-wrap .swiper-button-next,
        .mkl-swiper-wrap .swiper-button-prev {
          color: #FAF8F5;
          transform: scale(0.65);
          background: rgba(30, 27, 24, 0.6);
          backdrop-filter: blur(4px);
          border-radius: 50%;
          width: 40px !important;
          height: 40px !important;
          margin-top: -20px;
          transition: all 0.2s ease;
        }
        .mkl-swiper-wrap .swiper-button-next:hover,
        .mkl-swiper-wrap .swiper-button-prev:hover {
          background: #A3845B;
        }
        .mkl-swiper-wrap .swiper-button-next::after,
        .mkl-swiper-wrap .swiper-button-prev::after {
          font-size: 14px !important;
          font-weight: bold;
        }
        .mkl-swiper-wrap .swiper-pagination-bullet {
          background: #FAF8F5;
          opacity: 0.5;
        }
        .mkl-swiper-wrap .swiper-pagination-bullet-active {
          background: #C5A880;
          opacity: 1;
        }

        /* Selection styles */
        .mkl-select-card {
          border: 1px solid rgba(197, 168, 128, 0.2);
          border-radius: 16px;
          background: #FFFFFF;
          padding: 14px 18px;
          cursor: pointer;
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
          display: flex;
          align-items: center;
          gap: 12px;
          position: relative;
        }

        .mkl-select-card:hover {
          border-color: #A3845B;
          background: rgba(197, 168, 128, 0.03);
          transform: translateY(-2px);
        }

        .mkl-select-card.active {
          border-color: #1E1B18;
          background: #1E1B18;
          color: #FAF8F5;
          box-shadow: 0 8px 20px rgba(30, 27, 24, 0.12);
        }

        /* Service Row Item */
        .mkl-service-item {
          border: 1.5px solid rgba(232, 226, 213, 0.7);
          border-radius: 16px;
          background: #FFFFFF;
          padding: 16px 20px;
          cursor: pointer;
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .mkl-service-item:hover {
          border-color: #A3845B;
          transform: translateY(-2px);
          box-shadow: 0 6px 15px rgba(163, 132, 91, 0.06);
        }

        .mkl-service-item.active {
          border-color: #C5A880;
          background: rgba(197, 168, 128, 0.05);
        }

        /* Time slots grid */
        .mkl-time-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
          gap: 10px;
        }

        .mkl-time-slot {
          padding: 10px;
          border-radius: 12px;
          border: 1px solid rgba(197, 168, 128, 0.25);
          background: #FFFFFF;
          color: #1E1B18;
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          text-align: center;
        }

        .mkl-time-slot:hover:not(:disabled) {
          border-color: #A3845B;
          color: #A3845B;
          background: rgba(197, 168, 128, 0.05);
          transform: translateY(-1px);
        }

        .mkl-time-slot.active {
          background: #1E1B18;
          color: #FAF8F5;
          border-color: #1E1B18;
        }

        .mkl-time-slot:disabled {
          background: #FAF8F5;
          border-color: rgba(232, 226, 213, 0.5);
          color: #C5A880;
          opacity: 0.4;
          cursor: not-allowed;
          text-decoration: line-through;
        }

        .mkl-submit-btn {
          width: 100%;
          padding: 14px 18px;
          border-radius: 14px;
          border: none;
          background: #1E1B18;
          color: #FAF8F5;
          font-size: 0.95rem;
          font-weight: 700;
          letter-spacing: 0.02em;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          transition: transform 0.2s ease, background 0.2s ease, opacity 0.2s ease;
        }

        .mkl-submit-btn:hover:not(:disabled) {
          background: #060504;
          transform: translateY(-1px);
        }

        .mkl-submit-btn:disabled {
          opacity: 0.65;
          cursor: not-allowed;
        }

        /* Custom inputs */
        .mkl-custom-date {
          width: 100%;
          padding: 14px 16px;
          border-radius: 14px;
          border: 1px solid rgba(197, 168, 128, 0.25);
          background: #FFFFFF;
          font-size: 0.95rem;
          color: #1E1B18;
          font-family: inherit;
          outline: none;
          transition: border-color 0.2s ease;
        }

        .mkl-custom-date:focus {
          border-color: #A3845B;
          box-shadow: 0 0 0 3px rgba(163, 132, 91, 0.12);
        }

        /* Responsive Columns */
        .mkl-booking-layout {
          display: flex;
          flex-direction: row;
          gap: 32px;
          width: 100%;
          max-width: 960px;
        }

        @media (max-width: 820px) {
          .mkl-booking-layout {
            flex-direction: column;
            gap: 24px;
          }
          .mkl-sticky-panel {
            position: static !important;
            width: 100% !important;
          }
        }

        /* Floating summary panel */
        .mkl-sticky-panel {
          position: sticky;
          top: 100px;
          width: 360px;
          flex-shrink: 0;
        }
      `}</style>

      {notification && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 9999,
          background: 'rgba(30, 27, 24, 0.95)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          border: '1px solid rgba(197, 168, 128, 0.25)',
          color: '#FAF8F5',
          padding: '16px 24px',
          borderRadius: '12px',
          boxShadow: '0 20px 45px rgba(0,0,0,0.18)',
          fontFamily: "'Inter', sans-serif"
        }}>
          {notification}
        </div>
      )}

      <div className="mkl-booking-layout">
        
        {/* Left Side / Top: Shop Showcase & Forms */}
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Shop Card */}
          {shopDetails && (
            <div style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '24px',
              border: '1px solid rgba(232, 226, 213, 0.7)',
              padding: '24px',
              boxShadow: '0 12px 24px -10px rgba(58, 53, 48, 0.06)'
            }}>
              
              {/* Swiper Vitrin */}
              <div className="mkl-swiper-wrap" style={{
                width: '100%',
                marginBottom: '20px',
                borderRadius: '16px',
                overflow: 'hidden',
                position: 'relative'
              }}>
                <Swiper
                  modules={[Navigation, Pagination, Autoplay]}
                  navigation={true}
                  pagination={{ clickable: true }}
                  autoplay={{ delay: 4000 }}
                  style={{ height: '240px' }}
                >
                  {shopDetails.vitrinImageUrls && shopDetails.vitrinImageUrls.length > 0 ? (
                    shopDetails.vitrinImageUrls.map((url, index) => (
                      <SwiperSlide key={index} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F5F0E6' }}>
                        <img src={url} alt={shopDetails.shopName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </SwiperSlide>
                    ))
                  ) : shopDetails.vitrinImageUrl ? (
                    <SwiperSlide style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F5F0E6' }}>
                      <img src={shopDetails.vitrinImageUrl} alt={shopDetails.shopName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </SwiperSlide>
                  ) : (
                    <SwiperSlide style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F5F0E6' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: '#A3845B', gap: '8px' }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.8 }}>
                          <path d="M12 22a7 7 0 0 0 7-7c0-4.3-3-7-7-7s-7 2.7-7 7a7 7 0 0 0 7 7z" />
                          <circle cx="12" cy="7" r="4" />
                        </svg>
                        <span style={{ fontSize: '1.5rem', fontWeight: 600 }}>
                          {shopDetails.shopName}
                        </span>
                      </div>
                    </SwiperSlide>
                  )}
                </Swiper>
              </div>

              {/* Shop info */}
              <h1 style={{
                margin: '0 0 6px 0',
                fontWeight: 600,
                fontSize: '1.5rem',
                color: '#1E1B18'
              }}>
                {shopDetails.shopName}
              </h1>

              {/* Tıklanabilir Konum Linki */}
              {shopDetails.addressText && (
                <a
                  href={
                    shopDetails.latitude && shopDetails.longitude
                      ? `https://www.google.com/maps/search/?api=1&query=${shopDetails.latitude},${shopDetails.longitude}`
                      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(shopDetails.addressText + ' ' + shopDetails.shopName)}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '6px',
                    color: '#8C8276',
                    fontSize: '0.88rem',
                    marginBottom: '14px',
                    textDecoration: 'none',
                    transition: 'color 0.2s ease',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = '#A3845B'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = '#8C8276'; }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.0" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: '2px' }}>
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  <span style={{ textDecoration: 'underline' }}>{shopDetails.addressText}</span>
                </a>
              )}

              {shopDetails.phoneNumber && (
                <a
                  href={`tel:${shopDetails.phoneNumber}`}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    color: '#A3845B',
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    textDecoration: 'none',
                    border: '1px solid rgba(197, 168, 128, 0.3)',
                    padding: '8px 16px',
                    borderRadius: '30px',
                    background: 'rgba(197, 168, 128, 0.05)',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#A3845B'; e.currentTarget.style.background = 'rgba(197, 168, 128, 0.1)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(197, 168, 128, 0.3)'; e.currentTarget.style.background = 'rgba(197, 168, 128, 0.05)'; }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72a12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                  {shopDetails.phoneNumber}
                </a>
              )}
            </div>
          )}

          {/* Booking interactive form */}
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '24px',
            border: '1px solid rgba(232, 226, 213, 0.7)',
            padding: '28px',
            boxShadow: '0 12px 24px -10px rgba(58, 53, 48, 0.06)',
            display: 'flex',
            flexDirection: 'column',
            gap: '28px'
          }}>
            
            {/* Step 1: Specialist Selection */}
            <div>
              <h3 style={{
                margin: '0 0 14px 0',
                fontSize: '1.15rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '24px', height: '24px', borderRadius: '50%', background: '#1E1B18', color: '#FAF8F5', fontSize: '0.75rem', fontWeight: 700 }}>1</span>
                Uzman Seçin
              </h3>
              
              {employees.length === 0 ? (
                <p style={{ color: '#8C8276', fontSize: '0.88rem', margin: 0 }}>Bu salonda çalışan personel bulunmamaktadır.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {employees.map(emp => {
                    const isSelected = String(emp.id) === selectedEmployee;
                    const fullName = `${emp.firstName || ''} ${emp.lastName || ''}`.trim() || 'İsimsiz Personel';
                    const initials = fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

                    return (
                      <div
                        key={emp.id}
                        className={`mkl-select-card ${isSelected ? 'active' : ''}`}
                        onClick={() => setSelectedEmployee(String(emp.id))}
                      >
                        {/* Custom avatar placeholder */}
                        <div style={{
                          width: '42px',
                          height: '42px',
                          borderRadius: '50%',
                          backgroundColor: isSelected ? '#C5A880' : '#F5F0E6',
                          color: isSelected ? '#1E1B18' : '#A3845B',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          fontSize: '0.88rem',
                          boxShadow: isSelected ? '0 4px 10px rgba(0,0,0,0.1)' : 'none'
                        }}>
                          {initials}
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', flex: 1 }}>
                          <span style={{ fontWeight: 600, fontSize: '0.92rem' }}>{fullName}</span>
                          <span style={{ fontSize: '0.75rem', opacity: 0.8, color: isSelected ? '#E8E2D5' : '#8C8276' }}>
                            {emp.title || 'Kuaför / Uzman'}
                          </span>
                        </div>

                        {isSelected && (
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C5A880" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Step 2: Service Selection */}
            <div>
              <h3 style={{
                margin: '0 0 14px 0',
                fontSize: '1.15rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '24px', height: '24px', borderRadius: '50%', background: '#1E1B18', color: '#FAF8F5', fontSize: '0.75rem', fontWeight: 700 }}>2</span>
                Hizmet Seçin
              </h3>

              {services.length === 0 ? (
                <p style={{ color: '#8C8276', fontSize: '0.88rem', margin: 0 }}>Bu salona ait hizmet bulunmamaktadır.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {services.map(s => {
                    const isSelected = String(s.id) === selectedService;
                    return (
                      <div
                        key={s.id}
                        className={`mkl-service-item ${isSelected ? 'active' : ''}`}
                        onClick={() => setSelectedService(String(s.id))}
                      >
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <span style={{ fontWeight: 600, fontSize: '0.95rem', color: '#1E1B18' }}>{s.name}</span>
                          <span style={{ fontSize: '0.78rem', color: '#8C8276', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <circle cx="12" cy="12" r="10" />
                              <polyline points="12 6 12 12 16 14" />
                            </svg>
                            {s.durationInMinutes || s.durationMinutes || 30} dakika
                          </span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ fontWeight: 700, color: '#A3845B', fontSize: '1rem' }}>{s.price} TL</span>
                          <div style={{
                            width: '20px',
                            height: '20px',
                            borderRadius: '50%',
                            border: '1.5px solid ' + (isSelected ? '#A3845B' : '#E8E2D5'),
                            background: isSelected ? '#A3845B' : 'transparent',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.2s ease'
                          }}>
                            {isSelected && (
                              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#FAF8F5" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Step 3: Date & Time Selection */}
            <div>
              <h3 style={{
                margin: '0 0 14px 0',
                fontSize: '1.15rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '24px', height: '24px', borderRadius: '50%', background: '#1E1B18', color: '#FAF8F5', fontSize: '0.75rem', fontWeight: 700 }}>3</span>
                Tarih ve Saat
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <input
                    className="mkl-custom-date"
                    type="date"
                    value={appointmentDate}
                    onChange={(e) => {
                      setAppointmentDate(e.target.value);
                      setAppointmentTime('');
                    }}
                  />
                </div>

                {appointmentDate && selectedEmployee && (
                  <div style={{ borderTop: '1px solid rgba(197, 168, 128, 0.15)', paddingTop: '16px' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#A3845B', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '10px' }}>
                      Müsait Saatler
                    </div>
                    
                    <div className="mkl-time-grid">
                      {allPossibleSlots.map(slot => {
                        const isTaken = takenSlots.includes(slot);
                        const isSelected = slot === appointmentTime;

                        return (
                          <button
                            key={slot}
                            type="button"
                            disabled={isTaken}
                            className={`mkl-time-slot ${isSelected ? 'active' : ''}`}
                            onClick={() => setAppointmentTime(slot)}
                          >
                            {slot}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {appointmentDate && !selectedEmployee && (
                  <div style={{ fontSize: '0.82rem', color: '#8C8276', padding: '8px 12px', background: 'rgba(197, 168, 128, 0.05)', borderRadius: '8px', border: '1px solid rgba(197, 168, 128, 0.15)' }}>
                    * Saat aralıklarını listelemek için lütfen yukarıdan bir personel seçin.
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>

        {/* Right Side: Sticky Summary Panel */}
        <div className="mkl-sticky-panel">
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '24px',
            border: '1px solid rgba(232, 226, 213, 0.7)',
            padding: '28px',
            boxShadow: '0 16px 35px -10px rgba(163, 132, 91, 0.15)',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px'
          }}>
            <h3 style={{
              margin: 0,
              fontSize: '1.25rem',
              fontWeight: 600,
              borderBottom: '1px solid rgba(197, 168, 128, 0.15)',
              paddingBottom: '12px'
            }}>
              Randevu Özeti
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.88rem' }}>
              
              {/* Specialist summary */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ color: '#8C8276' }}>Uzman:</span>
                <span style={{ fontWeight: 600 }}>
                  {currentEmployee ? `${currentEmployee.firstName} ${currentEmployee.lastName}` : '- Seçilmedi -'}
                </span>
              </div>

              {/* Service summary */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ color: '#8C8276' }}>Hizmet:</span>
                <span style={{ fontWeight: 600 }}>
                  {currentService ? currentService.name : '- Seçilmedi -'}
                </span>
              </div>

              {/* Duration summary */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ color: '#8C8276' }}>Süre:</span>
                <span style={{ fontWeight: 600 }}>
                  {currentService ? `${currentService.durationInMinutes || currentService.durationMinutes || 30} dk` : '-'}
                </span>
              </div>

              {/* Date & Time summary */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ color: '#8C8276' }}>Tarih / Saat:</span>
                <span style={{ fontWeight: 600 }}>
                  {appointmentDate ? appointmentDate.split('-').reverse().join('.') : ''} 
                  {appointmentTime ? ` @ ${appointmentTime}` : (!appointmentDate && !appointmentTime ? '-' : '')}
                </span>
              </div>

              <div style={{
                height: '1px',
                background: 'rgba(197, 168, 128, 0.15)',
                margin: '8px 0'
              }} />

              {/* Price summary */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ color: '#1E1B18', fontWeight: 600, fontSize: '0.95rem' }}>Toplam Ücret:</span>
                <span style={{ fontWeight: 700, color: '#A3845B', fontSize: '1.25rem' }}>
                  {currentService ? `${currentService.price} TL` : '0 TL'}
                </span>
              </div>

            </div>

            {/* Submit Action */}
            <form onSubmit={handleSubmit} style={{ marginTop: '8px' }}>
              {!localStorage.getItem('token') && (
                <div style={{ 
                  color: '#a3402f', 
                  fontSize: '0.78rem', 
                  textAlign: 'center', 
                  marginBottom: '12px',
                  background: 'rgba(163, 64, 47, 0.05)',
                  border: '1px solid rgba(163, 64, 47, 0.15)',
                  padding: '8px 12px',
                  borderRadius: '10px',
                  lineHeight: '1.4'
                }}>
                  * Randevuyu onaylamak için üye girişi yapmanız gerekecektir.
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="mkl-submit-btn"
                style={{
                  opacity: submitting ? 0.6 : 1,
                  cursor: submitting ? 'not-allowed' : 'pointer'
                }}
              >
                {submitting ? (
                  <>
                    <div style={{
                      width: '14px',
                      height: '14px',
                      border: '2px solid rgba(255,255,255,0.2)',
                      borderTopColor: '#FFFFFF',
                      borderRadius: '50%',
                      animation: 'spin 0.6s linear infinite'
                    }} />
                    Randevu Alınıyor...
                  </>
                ) : (
                  "Randevuyu Onayla"
                )}
              </button>
            </form>

            <button
              type="button"
              onClick={() => navigate('/')}
              style={{
                width: '100%',
                background: 'none',
                border: 'none',
                color: '#8C8276',
                fontWeight: 500,
                fontSize: '0.85rem',
                cursor: 'pointer',
                textAlign: 'center',
                textDecoration: 'underline'
              }}
            >
              Geri Dön
            </button>

          </div>
        </div>

      </div>
    </div>
  );
}