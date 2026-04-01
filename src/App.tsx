import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, FileText, Settings, Bell, Search, IndianRupee } from 'lucide-react';
import { AppProvider, useApp } from './context/AppContext';
import { NotificationProvider, useNotification, NotificationPanel } from './context/NotificationContext';
import { MasterDashboard } from './components/MasterDashboard';
import { AccountManager } from './components/AccountManager';
import { ExpenseForm } from './components/ExpenseForm';
import { ReconciliationView } from './components/ReconciliationView';
import { ExpenseHistoryView } from './components/ExpenseHistoryView';
import { AccountLedgerView } from './components/AccountLedgerView';
import type { SubAccount } from './types';
import './styles/design-system.css';

type View = 'dashboard' | 'reconciliation' | 'expenses' | 'account-ledger';
type ModalType = 'create' | 'transfer' | 'deposit' | 'expense' | null;

function AppContent() {
  const { setOnHighValueExpense } = useApp();
  const { addNotification, setIsOpen, unreadCount } = useNotification();
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [selectedAccount, setSelectedAccount] = useState<SubAccount | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

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

  const handleSelectAccount = (account: SubAccount) => {
    setSelectedAccount(account);
    setCurrentView('account-ledger');
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'reconciliation', label: 'Reconciliation', icon: FileText },
    { id: 'expenses', label: 'Expenses', icon: IndianRupee },
  ] as const;

  const handleBackToDashboard = () => {
    setCurrentView('dashboard');
    setSelectedAccount(null);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex' }}>
      {/* Sidebar Navigation */}
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
                   'Expense Records'}
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

      {/* Main Content */}
      <main style={{
        marginLeft: '280px',
        flex: 1,
        background: 'linear-gradient(135deg, #F9FAFC 0%, #F3F4F6 100%)',
        minHeight: '100vh',
        position: 'relative',
      }}>
        {/* Top bar with search */}
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
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xl)' }}>
              <h1 style={{
                fontSize: '1.5rem',
                fontWeight: 700,
                color: 'var(--text-primary)'
              }}>
                {currentView === 'dashboard' ? 'Dashboard' :
                 currentView === 'account-ledger' ? 'Account Details' :
                 currentView === 'expenses' ? 'Expenses' :
                 'Reconciliation'}
              </h1>

              {/* Search bar */}
              <form
                onSubmit={(e) => e.preventDefault()}
                style={{
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <Search size={18} style={{ position: 'absolute', left: '14px', color: 'var(--text-muted)', zIndex: 1, pointerEvents: 'none' }} />
                <input
                  type="text"
                  placeholder="Search transactions, accounts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') e.preventDefault(); }}
                  style={{
                    paddingLeft: '42px',
                    paddingRight: '16px',
                    paddingTop: '10px',
                    paddingBottom: '10px',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--background)',
                    fontSize: '0.875rem',
                    width: '300px',
                    transition: 'all var(--transition-fast)',
                    outline: 'none'
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--primary-green)'}
                  onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
                />
              </form>
            </div>

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

        {/* Page content */}
        <div style={{
          padding: 'var(--spacing-xl)',
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
          ) : (
            <motion.div
              key="reconciliation"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <ReconciliationView searchQuery={searchQuery} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Close page content div */}
        </div>
      </main>

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
          setSelectedAccount(null);
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
