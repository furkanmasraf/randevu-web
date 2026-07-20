import React, { useState, useEffect } from 'react';
import { AlertDetail, AlertType } from '../utils/customAlert';

export default function GlobalNotification() {
  const [toast, setToast] = useState<AlertDetail | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleGlobalAlert = (e: Event) => {
      const customEvent = e as CustomEvent<AlertDetail>;
      setToast(customEvent.detail);
      setVisible(true);
    };

    window.addEventListener('global-toast', handleGlobalAlert);
    return () => window.removeEventListener('global-toast', handleGlobalAlert);
  }, []);

  useEffect(() => {
    if (!visible || !toast) return;

    const timer = setTimeout(() => {
      setVisible(false);
    }, toast.duration || 4000);

    return () => clearTimeout(timer);
  }, [visible, toast]);

  if (!toast) return null;

  const config: Record<AlertType, { bg: string; border: string; text: string; icon: React.ReactNode }> = {
    success: {
      bg: 'rgba(232, 248, 240, 0.95)',
      border: '1px solid rgba(39, 174, 96, 0.3)',
      text: '#27ae60',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      )
    },
    error: {
      bg: 'rgba(253, 237, 236, 0.95)',
      border: '1px solid rgba(192, 57, 43, 0.3)',
      text: '#c0392b',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
        </svg>
      )
    },
    warning: {
      bg: 'rgba(253, 242, 233, 0.95)',
      border: '1px solid rgba(211, 84, 0, 0.3)',
      text: '#d35400',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      )
    },
    info: {
      bg: 'rgba(240, 244, 248, 0.95)',
      border: '1px solid rgba(163, 132, 91, 0.3)',
      text: '#A3845B',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
      )
    }
  };

  const current = config[toast.type];

  return (
    <div style={{
      position: 'fixed',
      top: '24px',
      right: '24px',
      zIndex: 9999,
      pointerEvents: 'none',
      fontFamily: "'Inter', sans-serif"
    }}>
      <style>{`
        .mkl-toast-enter {
          transform: translateY(-20px) scale(0.95);
          opacity: 0;
          transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .mkl-toast-active {
          transform: translateY(0) scale(1);
          opacity: 1;
        }
        .mkl-toast-progress {
          position: absolute;
          bottom: 0;
          left: 0;
          height: 3px;
          border-radius: 0 0 0 12px;
          animation: shrinkProgress ${toast.duration || 4000}ms linear forwards;
        }
        @keyframes shrinkProgress {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>

      <div 
        className={`mkl-toast-enter ${visible ? 'mkl-toast-active' : ''}`}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '14px 20px',
          borderRadius: '16px',
          backgroundColor: current.bg,
          border: current.border,
          boxShadow: '0 20px 40px -15px rgba(30, 27, 24, 0.15)',
          backdropFilter: 'blur(12px)',
          color: '#1E1B18',
          maxWidth: '340px',
          position: 'relative',
          overflow: 'hidden',
          transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        <span style={{ color: current.text, display: 'flex', alignItems: 'center' }}>
          {current.icon}
        </span>
        <span style={{ fontSize: '0.88rem', fontWeight: 500, lineHeight: 1.4, flex: 1 }}>
          {toast.message}
        </span>
        
        <div 
          className="mkl-toast-progress" 
          style={{ backgroundColor: current.text }} 
        />
      </div>
    </div>
  );
}