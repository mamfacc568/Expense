import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Bell, BellRing, CheckCheck } from 'lucide-react';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'warning' | 'info' | 'success';
  timestamp: Date;
  read: boolean;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (title: string, message: string, type?: 'warning' | 'info' | 'success') => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

// Soft bell sound effect - gentle chime
const playNotificationSound = () => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.3);
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  } catch (e) {
    console.log('Audio notification failed');
  }
};

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [toastNotifications, setToastNotifications] = useState<Notification[]>([]);

  // Load notifications from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('notifications');
      if (stored) {
        const parsed = JSON.parse(stored);
        // Filter out notifications older than 24 hours
        const now = new Date().getTime();
        const validNotifications = parsed.filter((n: Notification) => {
          const notificationTime = new Date(n.timestamp).getTime();
          return (now - notificationTime) < 24 * 60 * 60 * 1000; // 24 hours
        });
        setNotifications(validNotifications);
        if (validNotifications.length !== parsed.length) {
          localStorage.setItem('notifications', JSON.stringify(validNotifications));
        }
      }
    } catch (e) {
      console.error('Failed to load notifications:', e);
    }
  }, []);

  // Save notifications to localStorage and auto-clean after 24 hours
  useEffect(() => {
    try {
      localStorage.setItem('notifications', JSON.stringify(notifications));
    } catch (e) {
      console.error('Failed to save notifications:', e);
    }
  }, [notifications]);

  // Auto-clean old notifications every minute
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date().getTime();
      setNotifications(prev => {
        const valid = prev.filter(n => {
          const notificationTime = new Date(n.timestamp).getTime();
          return (now - notificationTime) < 24 * 60 * 60 * 1000;
        });
        if (valid.length !== prev.length) {
          localStorage.setItem('notifications', JSON.stringify(valid));
        }
        return valid;
      });
    }, 60 * 1000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  // Auto-remove toast notifications after 5 seconds
  useEffect(() => {
    if (toastNotifications.length > 0) {
      const timers = toastNotifications.map(toast =>
        setTimeout(() => {
          setToastNotifications(prev => prev.filter(n => n.id !== toast.id));
        }, 5000)
      );
      return () => timers.forEach(timer => clearTimeout(timer));
    }
  }, [toastNotifications]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const addNotification = useCallback((title: string, message: string, type: 'warning' | 'info' | 'success' = 'warning') => {
    const newNotification: Notification = {
      id: Math.random().toString(36).substring(2, 11),
      title,
      message,
      type,
      timestamp: new Date(),
      read: false,
    };

    setNotifications(prev => [newNotification, ...prev]);
    setToastNotifications(prev => [newNotification, ...prev]);
    
    // Play notification sound
    playNotificationSound();

    // Request browser notification permission
    if ('Notification' in window && Notification.permission === 'granted') {
      new window.Notification(title, {
        body: message,
        icon: '/vite.svg',
      });
    } else if ('Notification' in window && Notification.permission !== 'denied') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          new window.Notification(title, {
            body: message,
            icon: '/vite.svg',
          });
        }
      });
    }
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    setToastNotifications(prev => prev.filter(n => n.id !== id));
    try {
      const remaining = notifications.filter(n => n.id !== id);
      localStorage.setItem('notifications', JSON.stringify(remaining));
    } catch (e) {
      console.error('Failed to update notifications:', e);
    }
  }, [notifications]);

  const removeToastNotification = useCallback((id: string) => {
    setToastNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
    localStorage.removeItem('notifications');
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    try {
      const updated = notifications.map(n => n.id === id ? { ...n, read: true } : n);
      localStorage.setItem('notifications', JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to mark as read:', e);
    }
  }, [notifications]);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    try {
      const updated = notifications.map(n => ({ ...n, read: true }));
      localStorage.setItem('notifications', JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to mark all as read:', e);
    }
  }, [notifications]);

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, addNotification, removeNotification, clearAll, markAsRead, markAllAsRead, isOpen, setIsOpen }}>
      {children}
      {/* Notification Toast Container - Auto-dismissing */}
      <div style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        maxWidth: '400px',
        pointerEvents: 'none',
      }}>
        <AnimatePresence>
          {toastNotifications.map(notification => (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, x: 100, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 100, scale: 0.9 }}
              style={{
                background: notification.type === 'warning' 
                  ? 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)'
                  : notification.type === 'success'
                  ? 'linear-gradient(135deg, #D1FAE5 0%, #A7F3D0 100%)'
                  : 'linear-gradient(135deg, #DBEAFE 0%, #BFDBFE 100%)',
                borderRadius: '16px',
                padding: '16px',
                boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.5)',
                border: notification.type === 'warning' 
                  ? '2px solid #F59E0B'
                  : notification.type === 'success'
                  ? '2px solid #10B981'
                  : '2px solid #3B82F6',
                position: 'relative',
                overflow: 'hidden',
                pointerEvents: 'auto',
              }}
            >
              {/* Animated progress bar */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '3px',
                background: notification.type === 'warning' 
                  ? 'linear-gradient(90deg, #F59E0B, #FBBF24)'
                  : notification.type === 'success'
                  ? 'linear-gradient(90deg, #10B981, #34D399)'
                  : 'linear-gradient(90deg, #3B82F6, #60A5FA)',
                animation: 'shrink 5s linear forwards',
              }} />
              
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '12px',
                  background: notification.type === 'warning' 
                    ? 'linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)'
                    : notification.type === 'success'
                    ? 'linear-gradient(135deg, #10B981 0%, #34D399 100%)'
                    : 'linear-gradient(135deg, #3B82F6 0%, #60A5FA 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                }}>
                  <BellRing 
                    size={20} 
                    style={{ color: 'white' }}
                  />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{
                    fontSize: '0.875rem',
                    fontWeight: 700,
                    color: notification.type === 'warning' 
                      ? '#92400E'
                      : notification.type === 'success'
                      ? '#065F46'
                      : '#1E40AF',
                    marginBottom: '4px',
                  }}>
                    {notification.title}
                  </p>
                  <p style={{
                    fontSize: '0.813rem',
                    color: notification.type === 'warning' 
                      ? '#A16207'
                      : notification.type === 'success'
                      ? '#059669'
                      : '#1E3A8A',
                    lineHeight: 1.4,
                  }}>
                    {notification.message}
                  </p>
                  <p style={{
                    fontSize: '0.688rem',
                    color: notification.type === 'warning' 
                      ? '#B45309'
                      : notification.type === 'success'
                      ? '#047857'
                      : '#1D4ED8',
                    marginTop: '8px',
                    opacity: 0.7,
                  }}>
                    {new Date(notification.timestamp).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                <button
                  onClick={() => removeToastNotification(notification.id)}
                  style={{
                    background: 'rgba(0, 0, 0, 0.05)',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '6px',
                    borderRadius: '8px',
                    color: notification.type === 'warning'
                      ? '#B45309'
                      : notification.type === 'success'
                      ? '#047857'
                      : '#1D4ED8',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = notification.type === 'warning' 
                      ? 'rgba(245, 158, 11, 0.2)'
                      : notification.type === 'success'
                      ? 'rgba(16, 185, 129, 0.2)'
                      : 'rgba(59, 130, 246, 0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(0, 0, 0, 0.05)';
                  }}
                >
                  <X size={16} />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      <style>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
}

// Notification Panel Component
export function NotificationPanel() {
  const { notifications, unreadCount, removeNotification, markAsRead, markAllAsRead, isOpen, setIsOpen } = useNotification();
  const isMobile = window.innerWidth < 768;

  const getNotificationIcon = (type: 'warning' | 'info' | 'success') => {
    switch (type) {
      case 'warning': return <BellRing size={20} style={{ color: 'white' }} />;
      case 'success': return <CheckCheck size={20} style={{ color: 'white' }} />;
      default: return <Bell size={20} style={{ color: 'white' }} />;
    }
  };

  const getColors = (type: 'warning' | 'info' | 'success') => {
    switch (type) {
      case 'warning': return { bg: '#FEF3C7', iconBg: '#F59E0B', title: '#92400E', msg: '#A16207' };
      case 'success': return { bg: '#D1FAE5', iconBg: '#10B981', title: '#065F46', msg: '#059669' };
      default: return { bg: '#DBEAFE', iconBg: '#3B82F6', title: '#1E40AF', msg: '#1E3A8A' };
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', zIndex: 9998 }}
          />

          {/* Centered Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: isMobile ? 'calc(100% - 24px)' : '420px',
              maxHeight: isMobile ? 'calc(100vh - 60px)' : 'calc(100vh - 120px)',
              background: 'var(--surface)',
              borderRadius: '20px',
              boxShadow: '0 25px 80px rgba(0,0,0,0.25)',
              zIndex: 9999,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            {/* Header */}
            <div style={{
              padding: '20px',
              borderBottom: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'var(--surface)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '44px', height: '44px', borderRadius: '12px',
                  background: 'linear-gradient(135deg, var(--primary-green) 0%, var(--primary-light) 100%)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(0, 77, 64, 0.3)',
                }}>
                  <Bell size={22} style={{ color: 'white' }} />
                </div>
                <div>
                  <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Notifications</h2>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>
                    {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}
                  </p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {unreadCount > 0 && (
                  <button onClick={markAllAsRead} style={{
                    padding: '8px 14px', background: 'var(--primary-container)', border: 'none', borderRadius: '8px',
                    color: 'var(--primary-green)', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: '6px',
                  }}>
                    <CheckCheck size={14} /> Read all
                  </button>
                )}
                <button onClick={() => setIsOpen(false)} style={{
                  background: 'var(--background)', border: '1px solid var(--border)', borderRadius: '8px',
                  padding: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--text-muted)',
                }}>
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Notifications List */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
              {notifications.length === 0 ? (
                <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  <div style={{
                    width: '70px', height: '70px', borderRadius: '16px', background: 'var(--background)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px',
                  }}>
                    <Bell size={32} style={{ opacity: 0.3 }} />
                  </div>
                  <p style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '4px' }}>No notifications</p>
                  <p style={{ fontSize: '0.8rem', opacity: 0.7 }}>Notifications auto-remove after 24 hours</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {notifications.map(notification => {
                    const colors = getColors(notification.type);
                    return (
                      <motion.div
                        key={notification.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        onClick={() => markAsRead(notification.id)}
                        style={{
                          background: colors.bg,
                          borderRadius: '12px',
                          padding: '14px',
                          cursor: 'pointer',
                          position: 'relative',
                          border: notification.read ? 'none' : '2px solid ' + colors.iconBg,
                        }}
                      >
                        {!notification.read && (
                          <div style={{
                            position: 'absolute', top: '10px', right: '10px',
                            width: '8px', height: '8px', borderRadius: '50%',
                            background: colors.iconBg,
                          }} />
                        )}
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                          <div style={{
                            width: '40px', height: '40px', borderRadius: '10px',
                            background: colors.iconBg,
                            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                          }}>
                            {getNotificationIcon(notification.type)}
                          </div>
                          <div style={{ flex: 1, minWidth: 0, paddingRight: '24px' }}>
                            <p style={{ fontSize: '0.85rem', fontWeight: 700, color: colors.title, margin: '0 0 4px 0' }}>
                              {notification.title}
                            </p>
                            <p style={{ fontSize: '0.8rem', color: colors.msg, lineHeight: 1.4, margin: 0 }}>
                              {notification.message}
                            </p>
                            <p style={{ fontSize: '0.7rem', color: colors.msg, marginTop: '8px', opacity: 0.7, margin: '8px 0 0 0' }}>
                              {new Date(notification.timestamp).toLocaleDateString('en-IN', {
                                day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
                              })}
                            </p>
                          </div>
                          <button
                            onClick={(e) => { e.stopPropagation(); removeNotification(notification.id); }}
                            style={{
                              position: 'absolute', bottom: '12px', right: '12px',
                              background: 'rgba(0,0,0,0.05)', border: 'none', cursor: 'pointer',
                              padding: '6px', borderRadius: '6px', color: colors.msg,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}
                          >
                            <X size={14} />
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div style={{
                padding: '12px 20px', borderTop: '1px solid var(--border)',
                textAlign: 'center', fontSize: '0.7rem', color: 'var(--text-muted)',
              }}>
                Notifications auto-remove after 24 hours
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
