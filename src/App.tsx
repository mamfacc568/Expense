import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, FileText, Settings, Bell, IndianRupee, Menu, X, Recycle } from 'lucide-react';
import { AppProvider, useApp } from './context/AppContext';
import { NotificationProvider, useNotification, NotificationPanel } from './context/NotificationContext';
import { MasterDashboard } from './components/MasterDashboard';
import { AccountManager } from './components/AccountManager';
import { ExpenseForm } from './components/ExpenseForm';
import { ReconciliationView } from './components/ReconciliationView';
import { ExpenseHistoryView } from './components/ExpenseHistoryView';
import { AccountLedgerView } from './components/AccountLedgerView';
import { ScrapView } from './components/ScrapView';
import type { SubAccount } from './types';
import './styles/design-system.css';

type View = 'dashboard' | 'reconciliation' | 'expenses' | 'scrap' | 'account-ledger';
type ModalType = 'create' | 'transfer' | 'deposit' | 'expense' | null;

function AppContent() {
  const { setOnHighValueExpense, setOnHighValueScrap } = useApp();
  const { addNotification, setIsOpen, unreadCount } = useNotification();
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [selectedAccount, setSelectedAccount] = useState<SubAccount | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Set up high-value expense notification handler
  useEffect(() => {
    setOnHighValueExpense((amount, description, accountName) => {
      addNotification(
        'High-Value Expense Alert!',
        `₹${amount.toLocaleString('en-IN')} expense booked from ${accountName}: ${description}`,
        'warning'
      );
    });
  }, [setOnHighValueExpense, addNotification]);

  // Set up high-value scrap sale notification handler
  useEffect(() => {
    setOnHighValueScrap((amount, vendorName) => {
      addNotification(
        'High-Value Scrap Sale!',
        `₹${amount.toLocaleString('en-IN')} scrap sold to ${vendorName}`,
        'warning'
      );
    });
  }, [setOnHighValueScrap, addNotification]);

  const handleSelectAccount = (account: SubAccount) => {
    setSelectedAccount(account);
    setCurrentView('account-ledger');
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'reconciliation', label: 'Reconciliation', icon: FileText },
    { id: 'expenses', label: 'Expenses', icon: IndianRupee },
    { id: 'scrap', label: 'Scrap', icon: Recycle },
  ] as const;

  const handleBackToDashboard = () => {
    setCurrentView('dashboard');
    setSelectedAccount(null);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: isMobile ? 'column' : 'row' }}>
      {/* Desktop Sidebar */}
      {!isMobile && (
        <motion.aside
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          style={{
            width: '280px',
            background: 'linear-gradient(180deg, var(--primary-dark) 0%, var(--primary-green) 100%)',
            padding: 'var(--spacing-xl)',
            display: 'flex',
            flexDirection: 'column',
            position: 'fixed',
            height: '100vh',
            overflow: 'hidden',
            boxShadow: '4px 0 20px rgba(0, 0, 0, 0.1)',
          }}
        >
          {/* Header */}
          <div style={{ marginBottom: 'var(--spacing-2xl)' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--spacing-md)',
              color: 'white',
              marginBottom: 'var(--spacing-lg)'
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: 'var(--radius-lg)',
                background: 'rgba(255,255,255,0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)',
              }}>
              </div>
              <div>
                <h1 style={{ fontSize: '1.25rem', fontWeight: 700 }}>MF Cash</h1>
                <p style={{ fontSize: '0.875rem', opacity: 0.9 }}>Financial Ledger</p>
              </div>
            </div>

            {/* Date display */}
            <div style={{
              background: 'rgba(255,255,255,0.1)',
              padding: 'var(--spacing-sm) var(--spacing-md)',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.875rem',
              color: 'rgba(255,255,255,0.9)',
              backdropFilter: 'blur(10px)'
            }}>
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </div>
          </div>

          <nav style={{ flex: 1 }}>
            {navItems.map((item, index) => (
              <motion.button
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                onClick={() => {
                  setCurrentView(item.id as View);
                  setSelectedAccount(null);
                }}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--spacing-md)',
                  padding: 'var(--spacing-lg)',
                  marginBottom: 'var(--spacing-sm)',
                  background: currentView === item.id
                    ? 'rgba(255,255,255,0.2)'
                    : 'transparent',
                  border: currentView === item.id
                    ? '1px solid rgba(255,255,255,0.3)'
                    : 'none',
                  borderRadius: 'var(--radius-lg)',
                  color: currentView === item.id ? 'white' : 'rgba(255,255,255,0.8)',
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)',
                  textAlign: 'left',
                  position: 'relative',
                  overflow: 'hidden',
                }}
                whileHover={{
                  background: currentView !== item.id ? 'rgba(255,255,255,0.1)' : undefined,
                  x: 4
                }}
              >
                <div style={{
                  background: currentView === item.id
                    ? 'rgba(255,255,255,0.2)'
                    : 'rgba(255,255,255,0.1)',
                  width: '36px',
                  height: '36px',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all var(--transition-fast)'
                }}>
                  <item.icon size={20} />
                </div>
                <div style={{ flex: 1 }}>
                  <span style={{
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    display: 'block',
                    marginBottom: '2px'
                  }}>
                    {item.label}
                  </span>
                  <span style={{
                    fontSize: '0.75rem',
                    opacity: 0.7,
                    fontWeight: 400
                  }}>
                    {item.id === 'dashboard' ? 'Overview & Analytics' :
                     item.id === 'reconciliation' ? 'Transaction History' :
                     item.id === 'expenses' ? 'Expense Records' :
                     'Scrap Sales & Vendors'}
                  </span>
                </div>
                {currentView === item.id && (
                  <div style={{
                    width: '4px',
                    height: '24px',
                    background: 'white',
                    borderRadius: 'var(--radius-sm)'
                  }} />
                )}
              </motion.button>
            ))}
          </nav>

          {/* User profile placeholder */}
          <div style={{
            marginTop: 'auto',
            paddingTop: 'var(--spacing-xl)',
            borderTop: '1px solid rgba(255,255,255,0.15)',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--spacing-md)',
            padding: 'var(--spacing-md)',
            background: 'rgba(255,255,255,0.05)',
            borderRadius: 'var(--radius-md)',
          }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: 'var(--radius-full)',
              background: 'rgba(255,255,255,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Settings size={18} style={{ opacity: 0.8 }} />
            </div>
            <div style={{ flex: 1 }}>
              <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'white' }}>
                Admin User
              </span>
              <p style={{ fontSize: '0.75rem', opacity: 0.7 }}>
                View Settings
              </p>
            </div>
          </div>
        </motion.aside>
      )}

      {/* Mobile Header */}
      {isMobile && (
        <header style={{
          background: 'linear-gradient(90deg, var(--primary-dark) 0%, var(--primary-green) 100%)',
          padding: 'var(--spacing-md)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              style={{
                background: 'rgba(255,255,255,0.1)',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                padding: 'var(--spacing-sm)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {isMobileMenuOpen ? <X size={24} color="white" /> : <Menu size={24} color="white" />}
            </button>
            <h1 style={{ color: 'white', fontSize: '1.125rem', fontWeight: 700 }}>MF Cash</h1>
          </div>
          <div style={{ position: 'relative' }}>
            <motion.button
              onClick={() => setIsOpen(true)}
              style={{
                background: 'rgba(255,255,255,0.1)',
                border: 'none',
                borderRadius: 'var(--radius-full)',
                padding: 'var(--spacing-sm)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Bell size={20} color="white" />
            </motion.button>
            {unreadCount > 0 && (
              <div style={{
                position: 'absolute',
                top: '-4px',
                right: '-4px',
                minWidth: '18px',
                height: '18px',
                borderRadius: '9px',
                background: 'var(--error)',
                color: 'white',
                fontSize: '0.65rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px solid var(--primary-green)',
              }}>
                {unreadCount > 9 ? '9+' : unreadCount}
              </div>
            )}
          </div>
        </header>
      )}

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobile && isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.5)',
              zIndex: 200,
            }}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25 }}
              style={{
                width: '280px',
                height: '100%',
                background: 'linear-gradient(180deg, var(--primary-dark) 0%, var(--primary-green) 100%)',
                padding: 'var(--spacing-xl)',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ marginBottom: 'var(--spacing-2xl)' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--spacing-md)',
                  color: 'white',
                  marginBottom: 'var(--spacing-lg)'
                }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: 'var(--radius-lg)',
                    background: 'rgba(255,255,255,0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                  </div>
                  <div>
                    <h1 style={{ fontSize: '1.25rem', fontWeight: 700 }}>MF Cash</h1>
                    <p style={{ fontSize: '0.875rem', opacity: 0.9 }}>Financial Ledger</p>
                  </div>
                </div>
              </div>

              <nav>
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setCurrentView(item.id as View);
                      setSelectedAccount(null);
                      setIsMobileMenuOpen(false);
                    }}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--spacing-md)',
                      padding: 'var(--spacing-md)',
                      marginBottom: 'var(--spacing-sm)',
                      background: currentView === item.id
                        ? 'rgba(255,255,255,0.2)'
                        : 'transparent',
                      border: 'none',
                      borderRadius: 'var(--radius-md)',
                      color: currentView === item.id ? 'white' : 'rgba(255,255,255,0.8)',
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                  >
                    <item.icon size={20} />
                    <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>
                      {item.label}
                    </span>
                  </button>
                ))}
              </nav>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main style={{
        marginLeft: isMobile ? 0 : '280px',
        flex: 1,
        background: 'linear-gradient(135deg, #F9FAFC 0%, #F3F4F6 100%)',
        minHeight: isMobile ? 'calc(100vh - 60px)' : '100vh',
        position: 'relative',
        paddingBottom: isMobile ? '80px' : 0,
      }}>
        {/* Top bar with search - Desktop only */}
        {!isMobile && (
          <div style={{
            borderBottom: '1px solid var(--border)',
            padding: 'var(--spacing-lg)',
            position: 'sticky',
            top: 0,
            zIndex: 10,
            backdropFilter: 'blur(10px)',
            background: 'rgba(255, 255, 255, 0.95)'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              maxWidth: '1400px',
              margin: '0 auto'
            }}>
              <h1 style={{
                fontSize: '1.5rem',
                fontWeight: 700,
                color: 'var(--text-primary)'
              }}>
                {currentView === 'dashboard' ? 'Dashboard' :
                 currentView === 'account-ledger' ? 'Account Details' :
                 currentView === 'expenses' ? 'Expenses' :
                 currentView === 'scrap' ? 'Scrap' :
                 'Reconciliation'}
              </h1>

              {/* Notification and user menu */}
              <div className="flex items-center gap-4">
                <div style={{ position: 'relative' }}>
                  <motion.button
                    onClick={() => setIsOpen(true)}
                    className="w-11 h-11 rounded-full flex items-center justify-center cursor-pointer transition-all"
                    style={{
                      background: unreadCount > 0 
                        ? 'var(--primary-container)'
                        : 'var(--surface)',
                      border: '1px solid var(--outline-variant)',
                      boxShadow: unreadCount > 0 
                        ? '0 4px 16px rgba(0, 103, 91, 0.25)' 
                        : '0 2px 10px rgba(0, 0, 0, 0.08)',
                    }}
                    whileHover={{ 
                      background: unreadCount > 0 
                        ? 'var(--primary-fixed-dim)'
                        : 'var(--surface-container)',
                      scale: 1.05 
                    }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Bell 
                      size={22} 
                      style={{ 
                        color: unreadCount > 0 ? 'var(--primary)' : 'var(--on-surface-variant)',
                        animation: unreadCount > 0 ? 'bounce 1s infinite' : 'none',
                      }} 
                    />
                  </motion.button>
                  {unreadCount > 0 && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      style={{
                        position: 'absolute',
                        top: '-4px',
                        right: '-4px',
                        minWidth: '22px',
                        height: '22px',
                        borderRadius: '11px',
                        background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
                        color: 'white',
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '3px',
                        boxShadow: '0 2px 8px rgba(239, 68, 68, 0.5)',
                        border: '2px solid var(--surface)',
                      }}
                    >
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </motion.div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Page content */}
        <div style={{
          padding: isMobile ? 'var(--spacing-md)' : 'var(--spacing-xl)',
          maxWidth: '1400px',
          margin: '0 auto',
          width: '100%'
        }}>
        <AnimatePresence mode="wait">
          {currentView === 'dashboard' ? (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <MasterDashboard
                onSelectAccount={handleSelectAccount}
                onOpenDeposit={() => setActiveModal('deposit')}
                onOpenTransfer={() => setActiveModal('transfer')}
                onOpenCreate={() => setActiveModal('create')}
              />
            </motion.div>
          ) : currentView === 'account-ledger' && selectedAccount ? (
            <motion.div
              key="account-ledger"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <AccountLedgerView
                account={selectedAccount}
                onBack={handleBackToDashboard}
                onExpense={() => setActiveModal('expense')}
              />
            </motion.div>
          ) : currentView === 'expenses' ? (
            <motion.div
              key="expenses"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <ExpenseHistoryView />
            </motion.div>
          ) : currentView === 'scrap' ? (
            <motion.div
              key="scrap"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <ScrapView />
            </motion.div>
          ) : (
            <motion.div
              key="reconciliation"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <ReconciliationView searchQuery="" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Close page content div */}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      {isMobile && (
        <nav style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          background: 'white',
          borderTop: '1px solid var(--border)',
          display: 'flex',
          justifyContent: 'space-around',
          padding: 'var(--spacing-sm) 0',
          zIndex: 50,
          boxShadow: '0 -4px 20px rgba(0,0,0,0.1)',
        }}>
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setCurrentView(item.id as View);
                setSelectedAccount(null);
              }}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px',
                padding: 'var(--spacing-sm)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: currentView === item.id ? 'var(--primary-green)' : 'var(--text-muted)',
                minWidth: '70px',
              }}
            >
              <div style={{
                background: currentView === item.id ? 'var(--primary-container)' : 'transparent',
                padding: '8px',
                borderRadius: 'var(--radius-md)',
                transition: 'all var(--transition-fast)',
              }}>
                <item.icon size={22} />
              </div>
              <span style={{
                fontSize: '0.7rem',
                fontWeight: currentView === item.id ? 600 : 400,
              }}>
                {item.label}
              </span>
            </button>
          ))}
        </nav>
      )}

      {/* Modals */}
      <AccountManager
        isOpen={activeModal === 'create' || activeModal === 'transfer' || activeModal === 'deposit'}
        onClose={() => setActiveModal(null)}
        mode={activeModal === 'transfer' ? 'transfer' : activeModal === 'deposit' ? 'deposit' : 'create'}
        selectedAccountId={selectedAccount?.id}
      />

      <ExpenseForm
        isOpen={activeModal === 'expense'}
        onClose={() => {
          setActiveModal(null);
        }}
        selectedAccount={selectedAccount || undefined}
      />
      <NotificationPanel />
    </div>
  );
}

function App() {
  return (
    <AppProvider>
      <NotificationProvider>
        <AppContent />
      </NotificationProvider>
    </AppProvider>
  );
}

// Add bounce animation style
const style = document.createElement('style');
style.textContent = `
  @keyframes bounce {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-3px); }
  }
`;
document.head.appendChild(style);

export default App;
