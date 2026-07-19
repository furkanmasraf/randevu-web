export type NotificationType = 'success' | 'error';

export interface NotificationMessage {
  type: NotificationType;
  message: string;
}

export default function NotificationToast({ notification }: { notification: NotificationMessage | null }) {
  if (!notification) return null;

  const accentColor = notification.type === 'success' ? '#A3845B' : '#C0392B';

  return (
    <div style={{
      position: 'sticky',
      top: 20,
      zIndex: 1500,
      marginBottom: '20px',
      padding: '18px 22px',
      borderRadius: '18px',
      background: '#1E1B18',
      color: '#FAF8F5',
      boxShadow: '0 20px 45px rgba(0,0,0,0.16)',
      maxWidth: '440px',
      border: `1px solid ${accentColor}`,
      fontWeight: 600,
      letterSpacing: '0.01em'
    }}>
      {notification.message}
    </div>
  );
}
