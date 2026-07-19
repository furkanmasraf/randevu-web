import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';

interface EmployeeItem {
  id: number;
  firstName: string;
  lastName: string;
}

interface ServiceItem {
  id: number;
  name: string;
  price: number;
}

export default function BarberDashboard() {
  const [busySlotsMap, setBusySlotsMap] = useState<Record<number, string[]>>({});
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const timeSlots = ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30", "18:00", "18:30", "19:00", "19:30", "20:00", "20:30", "21:00", "21:30", "22:00"," 22:30", "23:00", "23:30"];
  const [activeTab, setActiveTab] = useState<'appointments' | 'services' | 'hours' | 'employees' | 'settings'>('appointments');
  const [employees, _setEmployees] = useState<EmployeeItem[]>([]);
  const [services, _setServices] = useState<ServiceItem[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [dynamicShopId, setDynamicShopId] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [appFilter, setAppFilter] = useState<'past' | 'today' | 'future'>('today');

  const [newServiceName, setNewServiceName] = useState('');
  const [newServicePrice, setNewServicePrice] = useState('');
  const [newEmployeeName, setNewEmployeeName] = useState('');
  const [shopDetails, setShopDetails] = useState<{ shopName?: string; phoneNumber?: string; imageUrl?: string; vitrinImageUrls?: string[]; latitude?: number; longitude?: number } | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [vitrinFiles, setVitrinFiles] = useState<File[]>([]);
  const sidebarRef = useRef<HTMLDivElement>(null);

  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('userId');
  const role = localStorage.getItem('role');
  const isMobile = typeof window !== 'undefined' ? window.innerWidth <= 768 : false;

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const removeFile = (indexToRemove: number) => {
    setVitrinFiles(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  const fetchBusySlots = async (employeeId: number, date: string) => {
    try {
      const response = await API.get(`https://randevu-sistemi-dv33.onrender.com/api/appointments/shop/employee-schedule`, {
        params: { employeeId, date },
        headers: { Authorization: `Bearer ${token}` }
      });
      setBusySlotsMap(prev => ({ ...prev, [employeeId]: response.data }));
    } catch (err) {
      console.error("Dolu saatler çekilemedi:", err);
    }
  };

  const fetchAppointments = async (shopId: number, filter: string = 'today') => {
    try {
      const response = await API.get(`https://randevu-sistemi-dv33.onrender.com/api/appointments/shop/${shopId}/filter`, {
        params: { filter },
        headers: { Authorization: `Bearer ${token}` }
      });
      const sortedAppointments = response.data.sort((a: any, b: any) => {
        return new Date(b.appointmentTime).getTime() - new Date(a.appointmentTime).getTime();
      });
      setAppointments(sortedAppointments);
    } catch (err) {
      console.error("Randevular çekilemedi:", err);
    }
  };

  const fetchAllDashboardData = async () => {
    setLoading(true);
    try {
      const shopRes = await API.get(`https://randevu-sistemi-dv33.onrender.com/api/shops/owner/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (shopRes.data?.id) {
        const shopId = shopRes.data.id;
        setDynamicShopId(shopId);

        setShopDetails({
          shopName: shopRes.data.name || '',
          phoneNumber: shopRes.data.phoneNumber || '',
          imageUrl: shopRes.data.imageUrl || '',
          vitrinImageUrls: shopRes.data.vitrinImageUrls || [],
          latitude: shopRes.data.latitude || 0,
          longitude: shopRes.data.longitude || 0
        });

        await Promise.all([
          fetchAppointments(shopId, appFilter),
          API.get(`https://randevu-sistemi-dv33.onrender.com/api/appointments/shop/${shopId}/employees`, {
            headers: { Authorization: `Bearer ${token}` }
          }).then(res => _setEmployees(res.data)),

          API.get(`https://randevu-sistemi-dv33.onrender.com/api/services/shop/${shopId}`, {
            headers: { Authorization: `Bearer ${token}` }
          }).then(res => _setServices(res.data))
        ]);
      }
    } catch (err) {
      console.error("API İSTEK HATASI:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token || role !== 'SHOP_OWNER') {
      navigate('/login');
      return;
    }
    fetchAllDashboardData();
  }, [navigate, token, role, userId]);

  useEffect(() => {
    if (dynamicShopId) {
      fetchAppointments(dynamicShopId, appFilter);
    }
  }, [appFilter, dynamicShopId]);

  useEffect(() => {
    if (activeTab === 'hours' && dynamicShopId) {
      employees.forEach(emp => fetchBusySlots(emp.id, selectedDate));
    }
  }, [activeTab, selectedDate, dynamicShopId, appointments]);

  useEffect(() => {
    if (token && userId && role === 'SHOP_OWNER') {
      fetchAllDashboardData();
    }
  }, [userId]);

  const handleAddService = async () => {
    if (!dynamicShopId) return alert("Dükkan bilgisi yüklenemedi!");
    try {
      await API.post(`/api/services/shop/${dynamicShopId}`,
        { name: newServiceName, price: parseFloat(newServicePrice), durationInMinutes: 30 },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Hizmet eklendi.");
      window.location.reload();
    } catch { alert("Hizmet eklenemedi."); }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isSidebarOpen && window.innerWidth < 768 && sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        setIsSidebarOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isSidebarOpen]);

  const handleAddEmployee = async () => {
    if (!dynamicShopId) return alert("Dükkan bilgisi yüklenemedi!");
    const parts = newEmployeeName.trim().split(" ");
    const payload = { firstName: parts[0] || "-", lastName: parts.slice(1).join(" ") || "-" };

    try {
      await API.post(`/api/employees/shop/${dynamicShopId}`, payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Personel eklendi!");
      window.location.reload();
    } catch { alert("Personel eklenemedi."); }
  };

  const handleUpdateShop = async () => {
    const formData = new FormData();
    formData.append("shopName", shopDetails?.shopName || "");
    formData.append("phoneNumber", shopDetails?.phoneNumber || "");
    formData.append("existingImageUrls", JSON.stringify(shopDetails?.vitrinImageUrls || []));

    if (selectedFile) {
      formData.append("logo", selectedFile);
    } else if (shopDetails?.imageUrl === "") {
      formData.append("logoDeleted", "true");
    }
    vitrinFiles.forEach((file) => formData.append("vitrinFiles", file));

    try {
      await API.put(`/api/shops/${dynamicShopId}/update-with-image`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("Dükkan bilgileri ve görseller başarıyla güncellendi!");
    } catch (err) {
      console.error("Dükkan güncellemesi başarısız:", err);
      alert("Dükkan bilgileri güncellenemedi.");
    }
  };

  const handleDelete = async (type: 'employee' | 'service', id: number) => {
    if (!window.confirm("Emin misin?")) return;
    try {
      await API.delete(`https://randevu-sistemi-dv33.onrender.com/api/${type}s/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("Silindi!");
      window.location.reload();
    } catch {
      alert("Silme hatası!");
    }
  };

  const toggleSlotStatus = async (employeeId: number, time: string) => {
    const formattedTime = `${selectedDate}T${time}:00`;
    const isBusy = busySlotsMap[employeeId]?.includes(time);

    try {
      if (isBusy) {
        await API.delete(`https://randevu-sistemi-dv33.onrender.com/api/appointments/unblock`, {
          params: { employeeId, appointmentTime: formattedTime },
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await API.post(`https://randevu-sistemi-dv33.onrender.com/api/appointments/block`, {
          employeeId,
          appointmentTime: formattedTime
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }

      fetchBusySlots(employeeId, selectedDate);
    } catch (err) {
      console.error("İşlem hatası:", err);
      alert("İşlem gerçekleştirilemedi.");
    }
  };

  const pendingAppointmentsCount = appointments.filter(app => app.status === 'PENDING').length;

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh', 
        backgroundColor: '#FAF8F5', 
        color: '#A3845B', 
        fontFamily: "'Inter', sans-serif", 
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
        <span style={{ fontSize: '0.9rem', fontWeight: 500, letterSpacing: '0.05em' }}>Yönetici Paneli Yükleniyor...</span>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const shopInitials = (shopDetails?.shopName?.substring(0, 2) || "ML").toUpperCase();

  return (
    <div style={{ 
      display: 'flex', 
      minHeight: '100vh', 
      backgroundColor: '#FAF8F5', 
      fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
      color: '#1E1B18'
    }}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;0,9..144,700;1,9..144,400&family=Inter:wght@300;400;500;600;700&display=swap');

        .mkl-side-btn {
          width: 100%;
          text-align: left;
          padding: 12px 16px;
          border-radius: 12px;
          border: none;
          background: transparent;
          color: #8C8276;
          font-weight: 500;
          font-size: 0.92rem;
          cursor: pointer;
          transition: all 0.25s ease;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .mkl-side-btn:hover {
          color: #FAF8F5;
          background-color: rgba(255, 255, 255, 0.05);
        }

        .mkl-side-btn.active {
          color: #C5A880;
          background-color: rgba(197, 168, 128, 0.08);
          font-weight: 600;
        }

        .mkl-side-btn.danger {
          color: #E08B78;
          background-color: rgba(224, 139, 120, 0.08);
          margin-top: 20px;
        }

        .mkl-side-btn.danger:hover {
          background-color: rgba(224, 139, 120, 0.15);
          color: #FF9B85;
        }

        .mkl-bd-hamburger {
          position: fixed;
          top: 20px;
          right: 20px;
          z-index: 100;
          width: 44px;
          height: 44px;
          display: none;
          align-items: center;
          justify-content: center;
          background-color: #1E1B18;
          color: #FAF8F5;
          border: 1px solid rgba(197, 168, 128, 0.2);
          border-radius: 12px;
          cursor: pointer;
          box-shadow: 0 4px 15px rgba(0,0,0,0.1);
          transition: all 0.25s ease;
        }

        .mkl-bd-hamburger:hover {
          background-color: #A3845B;
        }

        .mkl-bd-filter-btn {
          padding: 10px 22px;
          border-radius: 12px;
          border: 1px solid rgba(197, 168, 128, 0.25);
          background: #FFFFFF;
          color: #8C8276;
          font-weight: 600;
          font-size: 0.88rem;
          cursor: pointer;
          transition: all 0.25s ease;
          font-family: inherit;
        }

        .mkl-bd-filter-btn:hover {
          border-color: #A3845B;
          color: #A3845B;
        }

        .mkl-bd-filter-btn.active {
          background: #1E1B18;
          border-color: #1E1B18;
          color: #FAF8F5;
          box-shadow: 0 4px 12px rgba(30, 27, 24, 0.15);
        }

        .mkl-bd-input {
          width: 100%;
          padding: 12px 16px;
          border-radius: 12px;
          border: 1px solid rgba(197, 168, 128, 0.25);
          background-color: #FFFFFF;
          font-size: 0.95rem;
          font-family: inherit;
          color: #1E1B18;
          outline: none;
          transition: all 0.25s ease;
        }

        .mkl-bd-input:focus {
          border-color: #A3845B;
          box-shadow: 0 0 0 3px rgba(163, 132, 91, 0.12);
        }

        .mkl-bd-card {
          background: #FFFFFF;
          border-radius: 20px;
          border: 1.5px solid rgba(232, 226, 213, 0.8);
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .mkl-bd-card:hover {
          transform: translateY(-3px);
          border-color: rgba(197, 168, 128, 0.4);
          box-shadow: 0 16px 30px -10px rgba(163, 132, 91, 0.12);
        }

        .mkl-bd-primary-btn {
          width: 100%;
          background: #1E1B18;
          color: #FAF8F5;
          border: none;
          padding: 13px;
          border-radius: 12px;
          font-weight: 700;
          font-size: 0.95rem;
          cursor: pointer;
          font-family: inherit;
          transition: all 0.25s ease;
        }

        .mkl-bd-primary-btn:hover {
          background: #A3845B;
          box-shadow: 0 8px 20px rgba(163, 132, 91, 0.2);
        }

        .mkl-action-btn-small {
          flex: 1;
          border: none;
          padding: 10px;
          border-radius: 10px;
          font-weight: 700;
          font-size: 0.88rem;
          cursor: pointer;
          font-family: inherit;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }

        .mkl-btn-approve {
          background-color: #1E1B18;
          color: #FAF8F5;
        }

        .mkl-btn-approve:hover {
          background-color: #A3845B;
          box-shadow: 0 4px 12px rgba(163, 132, 91, 0.25);
        }

        .mkl-btn-reject {
          background-color: rgba(192, 57, 43, 0.05);
          color: #c0392b;
          border: 1px solid rgba(192, 57, 43, 0.15);
        }

        .mkl-btn-reject:hover {
          background-color: #c0392b;
          color: #FAF8F5;
          border-color: #c0392b;
        }

        .mkl-btn-delete {
          background-color: rgba(192, 57, 43, 0.05);
          color: #c0392b;
          border: 1px solid rgba(192, 57, 43, 0.12);
          padding: 8px 14px;
          border-radius: 10px;
          cursor: pointer;
          font-weight: 700;
          font-size: 0.82rem;
          font-family: inherit;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .mkl-btn-delete:hover {
          background-color: #c0392b;
          color: #FAF8F5;
          border-color: #c0392b;
        }

        .mkl-bd-upload-zone {
          padding: 24px;
          border: 2px dashed rgba(197, 168, 128, 0.3);
          border-radius: 16px;
          text-align: center;
          background-color: #FFFFFF;
          transition: all 0.25s ease;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          cursor: pointer;
        }

        .mkl-bd-upload-zone:hover {
          border-color: #A3845B;
          background-color: rgba(197, 168, 128, 0.02);
        }

        .mkl-bd-slot {
          padding: 10px 0;
          border-radius: 10px;
          text-align: center;
          font-size: 0.85rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .mkl-bd-slot:hover {
          transform: translateY(-1px);
        }

        .mkl-stat-card {
          flex: 1;
          minWidth: 200px;
          background: #FFFFFF;
          border: 1.5px solid rgba(232, 226, 213, 0.8);
          border-radius: 20px;
          padding: 20px 24px;
          display: flex;
          align-items: center;
          gap: 16px;
          box-shadow: 0 4px 12px rgba(58, 53, 48, 0.02);
        }

        @media (max-width: 992px) {
          .mkl-bd-sidebar {
            display: ${isSidebarOpen ? 'flex' : 'none'} !important;
            position: fixed !important;
            top: 0;
            left: 0;
            height: 100vh;
            width: 280px !important;
            z-index: 1000;
            box-shadow: 8px 0 35px rgba(0,0,0,0.15);
          }
          .mkl-bd-hamburger {
            display: flex !important;
          }
        }
      `}</style>

      {/* MOBİL HAMBURGER */}
      <button className="mkl-bd-hamburger" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
        {isSidebarOpen ? (
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        )}
      </button>

      {/* SOL SIDEBAR */}
      <div
        ref={sidebarRef}
        className="mkl-bd-sidebar"
        style={{
          width: '280px',
          backgroundColor: '#1E1B18',
          color: '#FAF8F5',
          padding: '32px 24px',
          display: 'flex',
          flexDirection: 'column',
          flexShrink: 0,
          borderRight: '1px solid rgba(197, 168, 128, 0.15)',
          boxShadow: '8px 0 35px rgba(0,0,0,0.08)'
        }}
      >
        {/* Brand Header */}
        <div style={{ marginBottom: '40px', paddingLeft: '8px' }}>
          <a href="#" style={{ textDecoration: 'none', color: '#FAF8F5' }} onClick={(e) => { e.preventDefault(); navigate('/'); }}>
            <h2 style={{ 
              margin: 0, 
              fontFamily: "'Fraunces', serif", 
              fontSize: '1.45rem', 
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C5A880" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform: 'rotate(-45deg)' }}>
                <circle cx="6" cy="6" r="3" />
                <circle cx="6" cy="18" r="3" />
                <line x1="9.8" y1="8.2" x2="21" y2="12.4" />
                <line x1="9.8" y1="15.8" x2="21" y2="12.4" />
              </svg>
              Makas<span>Lab</span>
            </h2>
          </a>
        </div>

        {/* Navigation */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px', flexGrow: 1 }}>
          {[
            { 
              id: 'appointments', 
              label: 'Randevular',
              icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              )
            },
            { 
              id: 'services', 
              label: 'Hizmet Yönetimi',
              icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              )
            },
            { 
              id: 'employees', 
              label: 'Personel Yönetimi',
              icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              )
            },
            { 
              id: 'hours', 
              label: 'Personel Takvimi',
              icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              )
            },
            { 
              id: 'settings', 
              label: 'İşletme Ayarları',
              icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                </svg>
              )
            }
          ].map(item => (
            <button
              key={item.id}
              className={`mkl-side-btn ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => { setActiveTab(item.id as any); setIsSidebarOpen(false); }}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>

        {/* User Card bottom */}
        <div style={{
          marginTop: 'auto',
          paddingTop: '20px',
          borderTop: '1px solid rgba(197, 168, 128, 0.15)',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingLeft: '8px' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              backgroundColor: '#C5A880',
              color: '#1E1B18',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '0.85rem'
            }}>
              {shopInitials}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
              <span style={{ fontSize: '0.88rem', fontWeight: 600, color: '#FAF8F5', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {shopDetails?.shopName || 'Yönetici'}
              </span>
              <span style={{ fontSize: '0.75rem', color: '#8C8276', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                Salon Sahibi
              </span>
            </div>
          </div>

          <button onClick={handleLogout} className="mkl-side-btn danger">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Çıkış Yap
          </button>
        </div>
      </div>

      {/* ARKA PLAN MOBİL KARARTICI */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          style={{
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
            backgroundColor: 'rgba(30,27,24,0.4)', zIndex: 400
          }}
        />
      )}

      {/* ANA İÇERİK ALANI */}
      <main style={{ 
        flex: 1, 
        padding: isMobile ? '80px 20px 40px 20px' : '40px 48px', 
        maxWidth: '1200px', 
        marginInline: 'auto',
        boxSizing: 'border-box'
      }}>
        
        {/* Welcome Banner */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          marginBottom: '28px',
          borderBottom: '1px solid rgba(197, 168, 128, 0.15)',
          paddingBottom: '20px'
        }}>
          <div>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#A3845B', textTransform: 'uppercase', letterSpacing: '0.08em' }}>YÖNETİCİ PANELİ</span>
            <h1 style={{ margin: '4px 0 0 0', fontFamily: "'Fraunces', serif", fontSize: '2.1rem', fontWeight: 400 }}>
              {shopDetails?.shopName || 'Salon Yönetimi'}
            </h1>
          </div>
          
          <button onClick={() => navigate('/')} className="mkl-back-btn">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            Müşteri Görünümü
          </button>
        </div>

        {/* Business Stats Grid Bar */}
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: '32px' }}>
          <div className="mkl-stat-card">
            <div style={{ padding: '10px', borderRadius: '12px', backgroundColor: 'rgba(197, 168, 128, 0.1)', color: '#A3845B' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
              </svg>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.78rem', color: '#8C8276', fontWeight: 600, textTransform: 'uppercase' }}>Personel</span>
              <span style={{ fontSize: '1.4rem', fontWeight: 700 }}>{employees.length}</span>
            </div>
          </div>

          <div className="mkl-stat-card">
            <div style={{ padding: '10px', borderRadius: '12px', backgroundColor: 'rgba(197, 168, 128, 0.1)', color: '#A3845B' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform: 'rotate(-45deg)' }}>
                <circle cx="6" cy="6" r="3" />
                <circle cx="6" cy="18" r="3" />
                <line x1="9.8" y1="8.2" x2="21" y2="12.4" />
                <line x1="9.8" y1="15.8" x2="21" y2="12.4" />
              </svg>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.78rem', color: '#8C8276', fontWeight: 600, textTransform: 'uppercase' }}>Hizmetler</span>
              <span style={{ fontSize: '1.4rem', fontWeight: 700 }}>{services.length}</span>
            </div>
          </div>

          <div className="mkl-stat-card">
            <div style={{ padding: '10px', borderRadius: '12px', backgroundColor: 'rgba(163, 132, 91, 0.1)', color: '#A3845B' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.78rem', color: '#8C8276', fontWeight: 600, textTransform: 'uppercase' }}>Bekleyen İşler</span>
              <span style={{ fontSize: '1.4rem', fontWeight: 700, color: pendingAppointmentsCount > 0 ? '#d35400' : '#1E1B18' }}>
                {pendingAppointmentsCount}
              </span>
            </div>
          </div>
        </div>

        {/* TAB CONTENTS */}
        <div style={{
          backgroundColor: '#FFFFFF',
          padding: isMobile ? '24px 18px' : '40px',
          borderRadius: '24px',
          border: '1.5px solid rgba(232, 226, 213, 0.7)',
          boxShadow: '0 16px 30px -10px rgba(58, 53, 48, 0.05)'
        }}>

          {/* TAB 1: appointments */}
          {activeTab === 'appointments' && (
            <div>
              <header style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                  <h2 style={{ margin: 0, fontFamily: "'Fraunces', serif", fontSize: '1.5rem', fontWeight: 500 }}>Randevular</h2>
                  <p style={{ margin: '6px 0 0 0', color: '#8C8276', fontSize: '0.9rem' }}>İşletmenize gelen randevu taleplerini filtreleyin ve onaylayın.</p>
                </div>

                {/* Filter Capsule */}
                <div style={{ display: 'flex', gap: '8px', padding: '4px', background: '#FAF8F5', borderRadius: '14px', border: '1px solid rgba(197, 168, 128, 0.15)' }}>
                  {[
                    { id: 'past', label: 'Geçmiş' },
                    { id: 'today', label: 'Bugün' },
                    { id: 'future', label: 'Gelecek' }
                  ].map(f => (
                    <button
                      key={f.id}
                      className={`mkl-bd-filter-btn ${appFilter === f.id ? 'active' : ''}`}
                      onClick={() => setAppFilter(f.id as any)}
                      style={{ border: 'none', borderRadius: '10px', padding: '8px 16px' }}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </header>

              {appointments.length === 0 ? (
                <div style={{ 
                  textAlign: 'center', 
                  padding: '60px 24px', 
                  color: '#8C8276', 
                  background: '#FAF8F5',
                  border: '1px dashed rgba(197, 168, 128, 0.3)',
                  borderRadius: '16px'
                }}>
                  Filtreye uygun randevu bulunamadı.
                </div>
              ) : (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                  gap: '24px'
                }}>
                  {appointments.map((app) => {
                    const getStatusStyle = (status: string) => {
                      switch (status) {
                        case 'APPROVED': return { label: 'Onaylandı', color: '#27ae60', bg: '#e8f8f0' };
                        case 'REJECTED': return { label: 'Reddedildi', color: '#7f8c8d', bg: '#f2f4f4' };
                        case 'CANCELLED': return { label: 'İptal Edildi', color: '#c0392b', bg: '#fdedec' };
                        case 'PENDING': return { label: 'Bekliyor', color: '#d35400', bg: '#fdf2e9' };
                        default: return { label: status, color: '#1E1B18', bg: '#FAF8F5' };
                      }
                    };

                    const statusStyle = getStatusStyle(app.status);

                    const updateStatus = async (id: any, status: string) => {
                      if (!token) return alert('Giriş bilgisi bulunamadı.');
                      try {
                        await API.patch(`/api/appointments/${id}/status`, { status }, {
                          headers: { Authorization: `Bearer ${token}` }
                        });
                        if (dynamicShopId) {
                          fetchAppointments(dynamicShopId, appFilter);
                        }
                      } catch (err) {
                        console.error('Randevu durumu güncellenemedi:', err);
                        alert('Randevu durumu güncellenemedi.');
                      }
                    };

                    return (
                      <div key={app.id} className="mkl-bd-card">
                        
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div>
                            <h4 style={{ fontFamily: "'Fraunces', serif", fontSize: '1.15rem', fontWeight: 600, margin: 0, color: '#1E1B18' }}>
                              {app.customerName}
                            </h4>
                            <span style={{ fontSize: '0.78rem', color: '#8C8276', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10" />
                                <polyline points="12 6 12 12 16 14" />
                              </svg>
                              {new Date(app.appointmentTime).toLocaleString('tr-TR', { dateStyle: 'long', timeStyle: 'short' })}
                            </span>
                          </div>

                          <span style={{
                            fontSize: '0.75rem', fontWeight: 700, padding: '5px 12px', borderRadius: '8px',
                            backgroundColor: statusStyle.bg, color: statusStyle.color
                          }}>
                            {statusStyle.label}
                          </span>
                        </div>

                        {/* Details container */}
                        <div style={{ backgroundColor: '#FAF8F5', padding: '14px', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '10px', border: '1px solid rgba(232, 226, 213, 0.6)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: '#8C8276' }}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#A3845B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <circle cx="6" cy="6" r="3" />
                              <circle cx="6" cy="18" r="3" />
                              <line x1="9.8" y1="8.2" x2="21" y2="12.4" />
                            </svg>
                            <span style={{ fontWeight: 600, color: '#1E1B18' }}>{app.serviceName}</span>
                            <span style={{ marginLeft: 'auto', fontWeight: 700, color: '#A3845B' }}>{app.price} TL</span>
                          </div>
                          
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: '#8C8276' }}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                              <circle cx="12" cy="7" r="4" />
                            </svg>
                            <span>Uzman: {app.employeeName}</span>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: '#8C8276' }}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                            </svg>
                            <span>Tel: {app.customerPhone}</span>
                          </div>
                        </div>

                        {app.status === 'PENDING' && (
                          <div style={{ display: 'flex', gap: '12px', marginTop: '4px' }}>
                            <button onClick={() => updateStatus(app.id, 'APPROVED')} className="mkl-action-btn-small mkl-btn-approve">
                              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                              Onayla
                            </button>
                            
                            <button onClick={() => updateStatus(app.id, 'REJECTED')} className="mkl-action-btn-small mkl-btn-reject">
                              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                              </svg>
                              Reddet
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: services */}
          {activeTab === 'services' && (
            <div style={{ maxWidth: '640px', margin: '0 auto' }}>
              <div style={{ marginBottom: '24px' }}>
                <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: '1.5rem', fontWeight: 500, color: '#1E1B18', margin: 0 }}>Hizmet Yönetimi</h2>
                <p style={{ margin: '6px 0 0 0', color: '#8C8276', fontSize: '0.9rem' }}>Müşterilerinize sunduğunuz saç tasarımı, bakım veya makyaj hizmetlerini yönetin.</p>
              </div>

              {/* Add Service Box */}
              <div style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '20px',
                padding: '24px',
                marginBottom: '32px',
                border: '1.5px solid rgba(232, 226, 213, 0.8)',
                boxShadow: '0 8px 20px -10px rgba(58, 53, 48, 0.05)',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px'
              }}>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontFamily: "'Fraunces', serif", fontWeight: 500, color: '#1E1B18' }}>Yeni Hizmet Ekle</h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#1E1B18', letterSpacing: '0.05em' }}>HİZMET ADI</label>
                    <input
                      className="mkl-bd-input"
                      value={newServiceName}
                      onChange={e => setNewServiceName(e.target.value)}
                      placeholder="Örn: Saç Kesimi & Yıkama"
                    />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#1E1B18', letterSpacing: '0.05em' }}>ÜCRET (TL)</label>
                    <input
                      className="mkl-bd-input"
                      value={newServicePrice}
                      onChange={e => setNewServicePrice(e.target.value)}
                      placeholder="Örn: 250"
                      type="number"
                    />
                  </div>

                  <button onClick={handleAddService} className="mkl-bd-primary-btn" style={{ marginTop: '8px' }}>
                    Hizmeti Kaydet
                  </button>
                </div>
              </div>

              {/* Service List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {services.map(service => (
                  <div key={service.id} className="mkl-bd-card" style={{
                    padding: '18px 24px', borderRadius: '16px', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'
                  }}>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#1E1B18' }}>{service.name}</h4>
                      <p style={{ margin: '4px 0 0 0', color: '#A3845B', fontWeight: 700, fontSize: '0.95rem', fontFamily: "'Fraunces', serif" }}>{service.price} TL</p>
                    </div>
                    
                    <button onClick={() => handleDelete('service', service.id)} className="mkl-btn-delete">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" />
                      </svg>
                      Sil
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: employees */}
          {activeTab === 'employees' && (
            <div style={{ maxWidth: '640px', margin: '0 auto' }}>
              <div style={{ marginBottom: '24px' }}>
                <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: '1.5rem', fontWeight: 500, color: '#1E1B18', margin: 0 }}>Personel Yönetimi</h2>
                <p style={{ margin: '6px 0 0 0', color: '#8C8276', fontSize: '0.9rem' }}>Salonunuzda çalışan kuaförlerin, ustaların veya stajyerlerin kayıtlarını düzenleyin.</p>
              </div>

              {/* Add Employee Box */}
              <div style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '20px',
                padding: '24px',
                marginBottom: '32px',
                border: '1.5px solid rgba(232, 226, 213, 0.8)',
                boxShadow: '0 8px 20px -10px rgba(58, 53, 48, 0.05)',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px'
              }}>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontFamily: "'Fraunces', serif", fontWeight: 500, color: '#1E1B18' }}>Yeni Personel Ekle</h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#1E1B18', letterSpacing: '0.05em' }}>PERSONEL ADI SOYADI</label>
                    <input
                      className="mkl-bd-input"
                      value={newEmployeeName}
                      onChange={e => setNewEmployeeName(e.target.value)}
                      placeholder="Örn: Ahmet Yılmaz"
                    />
                  </div>

                  <button onClick={handleAddEmployee} className="mkl-bd-primary-btn" style={{ marginTop: '8px' }}>
                    Personeli Kaydet
                  </button>
                </div>
              </div>

              {/* Employee List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {employees.map(emp => {
                  const empInitials = `${emp.firstName.charAt(0)}${emp.lastName.charAt(0)}`.toUpperCase();
                  return (
                    <div key={emp.id} className="mkl-bd-card" style={{
                      padding: '16px 24px', borderRadius: '16px', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'rgba(197, 168, 128, 0.1)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#A3845B', fontSize: '0.85rem'
                        }}>
                          {empInitials}
                        </div>
                        <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#1E1B18' }}>
                          {emp.firstName} {emp.lastName}
                        </h4>
                      </div>
                      
                      <button onClick={() => handleDelete('employee', emp.id)} className="mkl-btn-delete">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" />
                        </svg>
                        Sil
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 4: settings */}
          {activeTab === 'settings' && (
            <div style={{ maxWidth: '640px', margin: '0 auto' }}>
              <div style={{ marginBottom: '24px' }}>
                <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: '1.5rem', fontWeight: 500, color: '#1E1B18', margin: 0 }}>Dükkan Ayarları</h2>
                <p style={{ margin: '6px 0 0 0', color: '#8C8276', fontSize: '0.9rem' }}>Müşterilerin dükkan kartında göreceği ad, telefon ve galeri görsellerini düzenleyin.</p>
              </div>

              <div style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '20px',
                padding: '28px',
                border: '1.5px solid rgba(232, 226, 213, 0.7)',
                display: 'flex',
                flexDirection: 'column',
                gap: '24px'
              }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 700, color: '#1E1B18', fontSize: '0.75rem', letterSpacing: '0.05em' }}>DÜKKAN ADI</label>
                  <input
                    className="mkl-bd-input"
                    value={shopDetails?.shopName || ''}
                    onChange={e => setShopDetails(prev => ({ ...prev!, shopName: e.target.value }))}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 700, color: '#1E1B18', fontSize: '0.75rem', letterSpacing: '0.05em' }}>İLETİŞİM NUMARASI</label>
                  <input
                    className="mkl-bd-input"
                    value={shopDetails?.phoneNumber || ''}
                    onChange={e => setShopDetails(prev => ({ ...prev!, phoneNumber: e.target.value }))}
                  />
                </div>

                {/* Logo Upload Zone */}
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 700, color: '#1E1B18', fontSize: '0.75rem', letterSpacing: '0.05em' }}>DÜKKAN LOGOSU</label>

                  <div className="mkl-bd-upload-zone" style={{ position: 'relative' }}>
                    {(shopDetails?.imageUrl || selectedFile) ? (
                      <div style={{ position: 'relative', display: 'inline-block' }}>
                        <img
                          src={selectedFile ? URL.createObjectURL(selectedFile) : shopDetails?.imageUrl}
                          alt="Logo"
                          style={{ width: '96px', height: '96px', borderRadius: '50%', objectFit: 'cover', border: '2.5px solid #C5A880' }}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedFile(null);
                            setShopDetails(prev => ({ ...prev!, imageUrl: "" }));
                          }}
                          style={{
                            position: 'absolute', top: 0, right: 0, background: '#c0392b', color: 'white',
                            borderRadius: '50%', border: 'none', cursor: 'pointer', width: '22px', height: '22px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold'
                          }}
                        >✕</button>
                      </div>
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#A3845B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                          <circle cx="8.5" cy="8.5" r="1.5" />
                          <polyline points="21 15 16 10 5 21" />
                        </svg>
                        <span style={{ fontSize: '0.85rem', color: '#8C8276', fontWeight: 500 }}>Logo görseli seçin</span>
                      </>
                    )}

                    <input
                      type="file"
                      accept="image/*"
                      onChange={e => setSelectedFile(e.target.files?.[0] || null)}
                      style={{ fontSize: '0.82rem', marginTop: '6px' }}
                    />
                  </div>
                </div>

                {/* Gallery Upload Zone */}
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 700, color: '#1E1B18', fontSize: '0.75rem', letterSpacing: '0.05em' }}>VİTRİN GÖRSELLERİ</label>

                  <div className="mkl-bd-upload-zone">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#A3845B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                    <span style={{ fontSize: '0.85rem', color: '#8C8276', fontWeight: 500 }}>Birden fazla görsel yükleyebilirsiniz</span>
                    
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={e => {
                        if (e.target.files) {
                          const newFiles = Array.from(e.target.files);
                          setVitrinFiles(prev => [...prev, ...newFiles]);
                        }
                      }}
                      style={{ fontSize: '0.82rem', marginTop: '4px' }}
                    />
                  </div>

                  {/* Thumbnail Previews */}
                  <div style={{ display: 'flex', gap: '12px', marginTop: '16px', flexWrap: 'wrap' }}>
                    {/* Database Existing Images */}
                    {shopDetails?.vitrinImageUrls?.map((url, index) => (
                      <div key={`db-${index}`} style={{ position: 'relative', width: '74px', height: '74px' }}>
                        <img src={url} style={{ width: '100%', height: '100%', borderRadius: '10px', objectFit: 'cover', border: '1px solid rgba(197, 168, 128, 0.2)' }} />
                        <button
                          type="button"
                          onClick={() => setShopDetails(prev => {
                            if (!prev) return prev;
                            return {
                              ...prev,
                              vitrinImageUrls: prev.vitrinImageUrls?.filter((_, i) => i !== index) ?? []
                            };
                          })}
                          style={{
                            position: 'absolute', top: -5, right: -5, background: '#c0392b', color: 'white',
                            borderRadius: '50%', border: 'none', cursor: 'pointer', width: '20px', height: '20px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px'
                          }}
                        >✕</button>
                      </div>
                    ))}

                    {/* New Upload Files */}
                    {vitrinFiles.map((file, index) => (
                      <div key={`new-${index}`} style={{ position: 'relative', width: '74px', height: '74px' }}>
                        <img src={URL.createObjectURL(file)} style={{ width: '100%', height: '100%', borderRadius: '10px', objectFit: 'cover', border: '2.5px solid #C5A880' }} />
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          style={{
                            position: 'absolute', top: -5, right: -5, background: '#c0392b', color: 'white',
                            borderRadius: '50%', border: 'none', cursor: 'pointer', width: '20px', height: '20px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px'
                          }}
                        >✕</button>
                      </div>
                    ))}
                  </div>
                </div>

                <button onClick={handleUpdateShop} className="mkl-bd-primary-btn" style={{ marginTop: '12px' }}>
                  Değişiklikleri Kaydet
                </button>
              </div>
            </div>
          )}

          {/* TAB 5: hours */}
          {activeTab === 'hours' && (
            <div>
              <div style={{ marginBottom: '24px' }}>
                <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: '1.5rem', fontWeight: 500, color: '#1E1B18', margin: 0 }}>Personel Takvimi</h2>
                <p style={{ margin: '6px 0 0 0', color: '#8C8276', fontSize: '0.9rem' }}>Personellerin çalışma saatlerini bloklayarak veya müsait kılarak randevu takvimini düzenleyin.</p>
              </div>

              {/* Date Input */}
              <div style={{ marginBottom: '28px', backgroundColor: '#FAF8F5', padding: '12px 20px', borderRadius: '14px', border: '1px solid rgba(197, 168, 128, 0.2)', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#A3845B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                </svg>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={e => setSelectedDate(e.target.value)}
                  style={{ border: 'none', background: 'transparent', fontSize: '0.98rem', fontWeight: 600, color: '#A3845B', cursor: 'pointer', outline: 'none', fontFamily: 'inherit' }}
                />
              </div>

              {/* Status Legend */}
              <div style={{ display: 'flex', gap: '16px', fontSize: '0.8rem', fontWeight: 600, marginBottom: '20px', paddingLeft: '4px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#27ae60' }} />
                  <span>Müsait Saat (Randevu Alınabilir)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#c0392b' }} />
                  <span>Bloklu / Dolu Saat</span>
                </div>
              </div>

              {/* Staff Grid Schedules */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {employees.map(emp => {
                  const initials = `${emp.firstName.charAt(0)}${emp.lastName.charAt(0)}`.toUpperCase();
                  return (
                    <div key={emp.id} style={{
                      backgroundColor: '#FFFFFF', padding: '24px', borderRadius: '20px',
                      border: '1.5px solid rgba(232, 226, 213, 0.7)', boxShadow: '0 4px 12px rgba(58, 53, 48, 0.02)'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '18px' }}>
                        <div style={{ 
                          width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'rgba(197, 168, 128, 0.1)', 
                          display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#A3845B', fontSize: '0.85rem'
                        }}>
                          {initials}
                        </div>
                        <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#1E1B18' }}>
                          {emp.firstName} {emp.lastName}
                        </h4>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(78px, 1fr))', gap: '8px' }}>
                        {timeSlots.map(time => {
                          const isBusy = (busySlotsMap[emp.id] || []).includes(time);
                          return (
                            <div
                              key={time}
                              className="mkl-bd-slot"
                              onClick={() => toggleSlotStatus(emp.id, time)}
                              style={{
                                backgroundColor: isBusy ? 'rgba(192, 57, 43, 0.05)' : 'rgba(39, 174, 96, 0.05)',
                                color: isBusy ? '#c0392b' : '#27ae60',
                                border: `1.5px solid ${isBusy ? 'rgba(192, 57, 43, 0.25)' : 'rgba(39, 174, 96, 0.25)'}`
                              }}
                            >
                              {time}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>
      </main>
      
    </div>
  );
}