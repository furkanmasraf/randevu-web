export type AlertType = 'success' | 'error' | 'warning' | 'info';

export interface AlertDetail {
  message: string;
  type: AlertType;
  duration?: number;
}

export const triggerToast = (message: string, type: AlertType = 'warning', duration = 4000) => {
  const event = new CustomEvent('global-toast', {
    detail: { message, type, duration }
  });
  window.dispatchEvent(event);
};

if (typeof window !== 'undefined') {
  window.alert = (message: string) => {
    triggerToast(message, 'warning');
  };
}