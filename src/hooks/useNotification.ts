// src/hooks/useNotification.ts
import { triggerToast, AlertType } from '../utils/customAlert';

export default function useNotification() {
  const showNotification = (message: string, type: AlertType = 'info') => {
    // Sayfalardaki eski çağrıları otomatik olarak global sisteme yönlendirir
    triggerToast(message, type);
  };

  return {
    notification: null, // Artık yerel state gerekmediği için boş dönüyoruz
    showNotification
  };
}