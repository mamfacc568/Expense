import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Bell, BellRing, Trash2, CheckCheck } from 'lucide-react';

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

// Samsung bell sound effect
const playNotificationSound = () => {
  const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
  audio.volume = 0.5;
  audio.play().catch(() => {
    console.log('Audio notification failed');
  });
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
  const { notifications, unreadCount, removeNotification, clearAll, markAsRead, markAllAsRead, isOpen, setIsOpen } = useNotification();

  const getNotificationIcon = (type: 'warning' | 'info' | 'success') => {
    switch (type) {
      case 'warning':
        return <BellRing size={20} style={{ color: 'white' }} />;
      case 'success':
        return <CheckCheck size={20} style={{ color: 'white' }} />;
      default:
        return <Bell size={20} style={{ color: 'white' }} />;
    }
  };

  const getNotificationColors = (type: 'warning' | 'info' | 'success') => {
    switch (type) {
      case 'warning':
        return {
          bg: 'linear-gradient(135deg, #FEF3C7 0%, #FFFBEB 100%)',
          border: 'border-amber-200',
          iconBg: 'linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)',
          title: 'text-amber-900',
          message: 'text-amber-700',
        };
      case 'success':
        return {
          bg: 'linear-gradient(135deg, #D1FAE5 0%, #ECFDF5 100%)',
          border: 'border-emerald-200',
          iconBg: 'linear-gradient(135deg, #10B981 0%, #34D399 100%)',
          title: 'text-emerald-900',
          message: 'text-emerald-700',
        };
      default:
        return {
          bg: 'linear-gradient(135deg, #DBEAFE 0%, #EFF6FF 100%)',
          border: 'border-blue-200',
          iconBg: 'linear-gradient(135deg, #3B82F6 0%, #60A5FA 100%)',
          title: 'text-blue-900',
          message: 'text-blue-700',
        };
    }
  };

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.3)',
              backdropFilter: 'blur(4px)',
              zIndex: 9998,
            }}
          />
        )}
      </AnimatePresence>

      {/* Panel */}
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.95 }}
        animate={{ 
          opacity: isOpen ? 1 : 0, 
          y: isOpen ? 0 : -20,
          scale: isOpen ? 1 : 0.95,
        }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        style={{
          position: 'fixed',
          top: '70px',
          right: '20px',
          width: '400px',
          maxHeight: 'calc(100vh - 100px)',
          background: 'var(--surface)',
          borderRadius: '20px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(255, 255, 255, 0.5)',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          pointerEvents: isOpen ? 'auto' : 'none',
        }}
      >
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--outline-variant)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'linear-gradient(135deg, var(--surface-container) 0%, var(--surface) 100%)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dim) 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(0, 103, 91, 0.3)',
            }}>
              <Bell size={20} style={{ color: 'white' }} />
            </div>
            <div>
              <h2 style={{ 
                fontSize: '1.125rem', 
                fontWeight: 700, 
                color: 'var(--on-surface)',
                margin: 0,
              }}>
                Notifications
              </h2>
              <p style={{ 
                fontSize: '0.75rem', 
                color: 'var(--on-surface-variant)',
                margin: 0,
              }}>
                {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                style={{
                  padding: '8px 12px',
                  background: 'var(--primary-container)',
                  border: 'none',
                  borderRadius: '8px',
                  color: 'var(--on-primary-container)',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
                onMouseEnter={(e) => e.currentTarget.style.filter = 'brightness(0.95)'}
                onMouseLeave={(e) => e.currentTarget.style.filter = 'none'}
              >
                <CheckCheck size={14} />
                Mark all read
              </button>
            )}
            <button
              onClick={clearAll}
              disabled={notifications.length === 0}
              style={{
                padding: '8px 12px',
                background: notifications.length === 0 ? 'var(--surface-container)' : 'var(--error-container)',
                border: 'none',
                borderRadius: '8px',
                color: notifications.length === 0 ? 'var(--on-surface-variant)' : 'var(--on-error-container)',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: notifications.length === 0 ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                opacity: notifications.length === 0 ? 0.5 : 1,
              }}
              onMouseEnter={(e) => {
                if (notifications.length > 0) e.currentTarget.style.filter = 'brightness(0.95)';
              }}
              onMouseLeave={(e) => e.currentTarget.style.filter = 'none'}
            >
              <Trash2 size={14} />
              Clear all
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '16px',
        }}>
          {notifications.length === 0 ? (
            <div style={{
              padding: '48px 24px',
              textAlign: 'center',
              color: 'var(--text-muted)',
            }}>
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '20px',
                background: 'var(--surface-container)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
              }}>
                <Bell size={36} style={{ opacity: 0.3 }} />
              </div>
              <p style={{ fontSize: '0.938rem', fontWeight: 600, marginBottom: '4px' }}>
                No notifications yet
              </p>
              <p style={{ fontSize: '0.813rem', opacity: 0.7 }}>
                When you receive notifications, they'll appear here
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <AnimatePresence>
                {notifications.map(notification => {
                  const colors = getNotificationColors(notification.type);
                  return (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -100 }}
                      onClick={() => markAsRead(notification.id)}
                      style={{
                        background: colors.bg,
                        borderRadius: '16px',
                        padding: '16px',
                        border: `1px solid ${notification.read ? 'transparent' : 'rgba(0, 0, 0, 0.1)'}`,
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        position: 'relative',
                        overflow: 'hidden',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.1)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      {!notification.read && (
                        <div style={{
                          position: 'absolute',
                          top: '12px',
                          right: '12px',
                          width: '8px',
                          height: '8px',
                          borderRadius: '4px',
                          background: 'var(--primary)',
                          boxShadow: '0 0 0 2px white',
                        }} />
                      )}
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                        <div style={{
                          width: '44px',
                          height: '44px',
                          borderRadius: '12px',
                          background: colors.iconBg,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                        }}>
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div style={{ flex: 1, minWidth: 0, paddingRight: '20px' }}>
                          <p style={{
                            fontSize: '0.875rem',
                            fontWeight: 700,
                            color: colors.title,
                            marginBottom: '4px',
                            margin: '0 0 4px 0',
                          }}>
                            {notification.title}
                          </p>
                          <p style={{
                            fontSize: '0.813rem',
                            color: colors.message,
                            lineHeight: 1.4,
                            margin: 0,
                          }}>
                            {notification.message}
                          </p>
                          <p style={{
                            fontSize: '0.688rem',
                            color: colors.message,
                            marginTop: '8px',
                            opacity: 0.7,
                            margin: '8px 0 0 0',
                          }}>
                            {new Date(notification.timestamp).toLocaleDateString('en-US', { 
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeNotification(notification.id);
                          }}
                          style={{
                            position: 'absolute',
                            bottom: '16px',
                            right: '16px',
                            background: 'rgba(0, 0, 0, 0.05)',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '6px',
                            borderRadius: '8px',
                            color: colors.message,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.2s',
                            opacity: 0,
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)';
                            e.currentTarget.style.color = '#DC2626';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'rgba(0, 0, 0, 0.05)';
                            e.currentTarget.style.color = colors.message;
                          }}
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </div>
      </motion.div>
    </>
  );
}
