import { useState, useEffect } from 'react';
import API from '../services/api';
import NotificationToast from '../components/NotificationToast';
import useNotification from '../hooks/useNotification';

export default function ShopSettings() {
  const [shop, setShop] = useState({ shopName: '', address: '', phoneNumber: '', imageUrl: '' });
  const [loading, setLoading] = useState(true);
  const { notification, showNotification } = useNotification();

  useEffect(() => {
    // Backend'de Id'yi muhtemelen login olan kullanıcıdan veya URL'den alıyoruz
    const id = localStorage.getItem('id'); 
    API.get(`https://randevu-sistemi-dv33.onrender.com/api/shops/${id}/details`)
      .then(res => setShop(res.data))
      .finally(() => setLoading(false));
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    const id = localStorage.getItem('id');
    try {
      await API.put(`https://randevu-sistemi-dv33.onrender.com/api/shops/${id}/update`, shop);
      showNotification('Dükkan bilgileri güncellendi!', 'success');
    } catch (error) { showNotification('Güncelleme başarısız.', 'error'); }
  };

  if (loading) return <div>Yükleniyor...</div>;

  return (
    <div style={{ maxWidth: '400px', margin: '40px auto', padding: '20px' }}>
      <NotificationToast notification={notification} />
      <h2>Dükkan Bilgilerini Güncelle</h2>
      <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <input placeholder="Dükkan Adı" value={shop.shopName} onChange={e => setShop({...shop, shopName: e.target.value})} style={{ padding: '10px' }} />
        <input placeholder="Adres" value={shop.address} onChange={e => setShop({...shop, address: e.target.value})} style={{ padding: '10px' }} />
        <input placeholder="Telefon" value={shop.phoneNumber} onChange={e => setShop({...shop, phoneNumber: e.target.value})} style={{ padding: '10px' }} />
        <input placeholder="Profil Fotoğrafı URL" value={shop.imageUrl} onChange={e => setShop({...shop, imageUrl: e.target.value})} style={{ padding: '10px' }} />
        <button type="submit" style={{ padding: '10px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '5px' }}>Kaydet</button>
      </form>
    </div>
  );
}