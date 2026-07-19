import { useEffect, useState } from 'react';
import { NotificationType, NotificationMessage } from '../components/NotificationToast';

export default function useNotification() {
  const [notification, setNotification] = useState<NotificationMessage | null>(null);
  const [timerId, setTimerId] = useState<number | null>(null);

  const showNotification = (message: string, type: NotificationType = 'success') => {
    if (timerId) {
      window.clearTimeout(timerId);
    }
    setNotification({ message, type });
    const id = window.setTimeout(() => setNotification(null), 4000);
    setTimerId(id);
  };

  useEffect(() => {
    return () => {
      if (timerId) {
        window.clearTimeout(timerId);
      }
    };
  }, [timerId]);

  return { notification, showNotification };
}
