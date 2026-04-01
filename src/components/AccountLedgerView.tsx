import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Plus, Trash2, AlertTriangle, X, ArrowUpRight, ArrowDownLeft, ArrowLeftRight, ZoomIn } from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { SubAccount, LedgerEntry } from '../types';

interface AccountLedgerViewProps {
  account: SubAccount;
  onBack: () => void;
  onExpense: () => void;
}

export function AccountLedgerView({ account, onBack, onExpense }: AccountLedgerViewProps) {
  const { getAccountLedger, deleteSubAccount, subAccounts, transferBetweenAccounts, transferToMainAccount } = useApp();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<LedgerEntry | null>(null);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferTarget, setTransferTarget] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const freshAccount = subAccounts.find(a => a.id === account.id) || account;
  const ledgerEntries = getAccountLedger(freshAccount.id);
  const totalCredits = ledgerEntries.reduce((sum, e) => sum + e.credit, 0);
  const totalDebits = ledgerEntries.reduce((sum, e) => sum + e.debit, 0);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatDateTime = (date: Date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleDelete = () => {
    if (freshAccount.balance === 0) {
      deleteSubAccount(freshAccount.id);
      onBack();
    }
  };

  const handleTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(transferAmount);
    if (amount <= 0) { alert('Please enter a valid amount'); return; }
    if (amount > freshAccount.balance) { alert(`Insufficient balance\nAvailable: ${formatCurrency(freshAccount.balance)}`); return; }
    if (transferTarget === 'main') {
      transferToMainAccount(freshAccount.id, amount);
      setShowTransferModal(false);
      setTransferTarget('');
      setTransferAmount('');
      return;
    }
    if (transferTarget && transferTarget !== 'main') {
      transferBetweenAccounts(freshAccount.id, transferTarget, amount);
      setShowTransferModal(false);
      setTransferTarget('');
      setTransferAmount('');
    }
  };

  const otherAccounts = subAccounts.filter(a => a.id !== freshAccount.id);

  return (
    <div style={{ padding: isMobile ? '0.75rem' : '2rem' }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ marginBottom: isMobile ? '1rem' : 'var(--spacing-2xl)' }}
      >
        {/* Top Row: Back + Name + Balance */}
        <div style={{ 
          display: 'flex', 
          alignItems: isMobile ? 'flex-start' : 'center', 
          gap: isMobile ? '0.5rem' : 'var(--spacing-md)', 
          marginBottom: isMobile ? '0.75rem' : 'var(--spacing-lg)',
          flexDirection: isMobile ? 'column' : 'row',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: isMobile ? '100%' : 'auto' }}>
            <button
              onClick={onBack}
              style={{
                background: 'var(--background)', 
                border: '1px solid var(--border)', 
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer', 
                padding: isMobile ? '6px 10px' : 'var(--spacing-sm)',
                color: 'var(--text-secondary)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                fontSize: '0.8rem',
                gap: '4px',
                fontWeight: 500,
              }}
            >
              <ArrowLeft size={isMobile ? 16 : 18} />
              Back
            </button>
            {isMobile && (
              <div style={{ textAlign: 'right', flex: 1 }}>
                <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Balance</p>
                <p style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary-green)' }}>
                  {formatCurrency(freshAccount.balance)}
                </p>
              </div>
            )}
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '0.5rem' : 'var(--spacing-md)', flex: 1, width: isMobile ? '100%' : 'auto' }}>
            <div style={{
              width: isMobile ? '36px' : '48px', 
              height: isMobile ? '36px' : '48px', 
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, var(--secondary-green) 0%, var(--primary-green) 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontWeight: 700, fontSize: isMobile ? '1rem' : '1.25rem',
              flexShrink: 0,
            }}>
              {freshAccount.name.charAt(0).toUpperCase()}
            </div>
            <div style={{ flex: 1 }}>
              <h1 style={{ fontSize: isMobile ? '1.1rem' : '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {freshAccount.name}
              </h1>
              <p style={{ fontSize: isMobile ? '0.7rem' : '0.875rem', color: 'var(--text-muted)' }}>
                Created {freshAccount.createdAt.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
            {!isMobile && (
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Closing Balance</p>
                <p style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--primary-green)' }}>
                  {formatCurrency(freshAccount.balance)}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons - Stacked on mobile */}
        <div style={{ 
          display: 'flex', 
          flexDirection: isMobile ? 'column' : 'row',
          gap: isMobile ? '0.5rem' : 'var(--spacing-md)', 
        }}>
          <button
            onClick={onExpense}
            style={{
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              gap: 'var(--spacing-sm)',
              padding: isMobile ? '0.65rem 1rem' : 'var(--spacing-sm) var(--spacing-lg)', 
              background: 'var(--primary-green)',
              color: 'white', 
              border: 'none', 
              borderRadius: 'var(--radius-md)',
              fontWeight: 600, 
              fontSize: isMobile ? '0.85rem' : '0.875rem', 
              cursor: 'pointer',
              width: isMobile ? '100%' : 'auto',
            }}
          >
            <Plus size={18} />
            Book Expense
          </button>
          <button
            onClick={() => setShowTransferModal(true)}
            disabled={freshAccount.balance === 0}
            style={{
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              gap: 'var(--spacing-sm)',
              padding: isMobile ? '0.65rem 1rem' : 'var(--spacing-sm) var(--spacing-lg)',
              background: freshAccount.balance === 0 ? 'var(--background)' : 'var(--surface)',
              color: freshAccount.balance === 0 ? 'var(--text-muted)' : 'var(--primary-green)',
              border: `1px solid ${freshAccount.balance === 0 ? 'var(--border)' : 'var(--primary-green)'}`,
              borderRadius: 'var(--radius-md)',
              fontWeight: 600, 
              fontSize: isMobile ? '0.85rem' : '0.875rem',
              cursor: freshAccount.balance === 0 ? 'not-allowed' : 'pointer',
              opacity: freshAccount.balance === 0 ? 0.6 : 1,
              width: isMobile ? '100%' : 'auto',
            }}
          >
            <ArrowLeftRight size={18} />
            Transfer Balance
          </button>
          {freshAccount.balance === 0 && (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              style={{
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                gap: 'var(--spacing-sm)',
                padding: isMobile ? '0.65rem 1rem' : 'var(--spacing-sm) var(--spacing-lg)', 
                background: 'var(--surface)',
                color: 'var(--error)', 
                border: '1px solid var(--error)', 
                borderRadius: 'var(--radius-md)',
                fontWeight: 600, 
                fontSize: isMobile ? '0.85rem' : '0.875rem', 
                cursor: 'pointer',
                width: isMobile ? '100%' : 'auto',
              }}
            >
              <Trash2 size={18} />
              Delete Account
            </button>
          )}
        </div>
      </motion.div>

      {/* Summary Cards */}
      <div style={{
        display: 'grid', 
        gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: isMobile ? '0.5rem' : 'var(--spacing-lg)', 
        marginBottom: isMobile ? '1rem' : 'var(--spacing-2xl)',
      }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          style={{
            background: 'var(--surface)', 
            padding: isMobile ? '0.75rem' : 'var(--spacing-lg)',
            borderRadius: 'var(--radius-lg)', 
            boxShadow: 'var(--shadow-sm)', 
            border: '1px solid var(--border)',
          }}
        >
          <span style={{ fontSize: isMobile ? '0.65rem' : '0.875rem', color: 'var(--text-muted)' }}>
            {isMobile ? 'Credits' : 'Total Credits (Fund Received)'}
          </span>
          <p style={{ fontSize: isMobile ? '1rem' : '1.5rem', fontWeight: 700, color: 'var(--success)', marginTop: '4px' }}>
            {formatCurrency(totalCredits)}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          style={{
            background: 'var(--surface)', 
            padding: isMobile ? '0.75rem' : 'var(--spacing-lg)',
            borderRadius: 'var(--radius-lg)', 
            boxShadow: 'var(--shadow-sm)', 
            border: '1px solid var(--border)',
          }}
        >
          <span style={{ fontSize: isMobile ? '0.65rem' : '0.875rem', color: 'var(--text-muted)' }}>
            {isMobile ? 'Debits' : 'Total Debits (Expenses/Transfers)'}
          </span>
          <p style={{ fontSize: isMobile ? '1rem' : '1.5rem', fontWeight: 700, color: 'var(--error)', marginTop: '4px' }}>
            {formatCurrency(totalDebits)}
          </p>
        </motion.div>
      </div>

      {/* Ledger */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <h2 style={{ fontSize: isMobile ? '1rem' : '1.25rem', fontWeight: 600, marginBottom: isMobile ? '0.75rem' : 'var(--spacing-lg)', color: 'var(--text-primary)' }}>
          Transactions
        </h2>
        
        {ledgerEntries.length === 0 ? (
          <div style={{ 
            background: 'var(--surface)',
            padding: isMobile ? '2rem 1rem' : 'var(--spacing-2xl)', 
            textAlign: 'center', 
            color: 'var(--text-muted)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border)',
          }}>
            <p style={{ fontSize: '0.9rem' }}>No transactions yet</p>
            <p style={{ fontSize: '0.75rem', marginTop: 'var(--spacing-sm)' }}>
              Book an expense or transfer funds to see the ledger
            </p>
          </div>
        ) : isMobile ? (
          // Mobile: Card-based list
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {ledgerEntries.map((entry, index) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.03 * index }}
                onClick={() => setSelectedEntry(entry)}
                style={{
                  background: 'var(--surface)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border)',
                  padding: '0.75rem',
                  cursor: 'pointer',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ 
                      fontSize: '0.8rem', 
                      fontWeight: 500, 
                      color: 'var(--text-primary)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}>
                      {entry.description}
                    </p>
                    <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      {formatDate(entry.date)}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: '0.5rem' }}>
                    {entry.credit > 0 ? (
                      <p style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--success)' }}>
                        +{formatCurrency(entry.credit)}
                      </p>
                    ) : (
                      <p style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--error)' }}>
                        -{formatCurrency(entry.debit)}
                      </p>
                    )}
                  </div>
                </div>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  paddingTop: '0.5rem',
                  borderTop: '1px solid var(--border)',
                }}>
                  <span style={{ 
                    fontSize: '0.65rem', 
                    color: entry.credit > 0 ? 'var(--success)' : 'var(--error)',
                    background: entry.credit > 0 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                    padding: '2px 8px',
                    borderRadius: 'var(--radius-full)',
                    fontWeight: 500,
                  }}>
                    {entry.credit > 0 ? 'Credit' : 'Debit'}
                  </span>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--primary-green)' }}>
                    Bal: {formatCurrency(entry.runningBalance)}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          // Desktop: Table
          <div style={{
            background: 'var(--surface)', 
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-md)', 
            border: '1px solid var(--border)', 
            overflow: 'hidden',
          }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                <thead>
                  <tr style={{ background: 'var(--background)' }}>
                    <th style={{ padding: 'var(--spacing-md) var(--spacing-lg)', textAlign: 'left', fontWeight: 600, color: 'var(--text-secondary)', borderBottom: '2px solid var(--border)', whiteSpace: 'nowrap' }}>Date</th>
                    <th style={{ padding: 'var(--spacing-md) var(--spacing-lg)', textAlign: 'left', fontWeight: 600, color: 'var(--text-secondary)', borderBottom: '2px solid var(--border)' }}>Description</th>
                    <th style={{ padding: 'var(--spacing-md) var(--spacing-lg)', textAlign: 'right', fontWeight: 600, color: 'var(--text-secondary)', borderBottom: '2px solid var(--border)', whiteSpace: 'nowrap' }}>Credit</th>
                    <th style={{ padding: 'var(--spacing-md) var(--spacing-lg)', textAlign: 'right', fontWeight: 600, color: 'var(--text-secondary)', borderBottom: '2px solid var(--border)', whiteSpace: 'nowrap' }}>Debit</th>
                    <th style={{ padding: 'var(--spacing-md) var(--spacing-lg)', textAlign: 'right', fontWeight: 600, color: 'var(--text-secondary)', borderBottom: '2px solid var(--border)', whiteSpace: 'nowrap' }}>Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {ledgerEntries.map((entry, index) => (
                    <tr
                      key={entry.id}
                      onClick={() => setSelectedEntry(entry)}
                      style={{
                        borderBottom: index < ledgerEntries.length - 1 ? '1px solid var(--border)' : 'none',
                        cursor: 'pointer',
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--background)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <td style={{ padding: 'var(--spacing-md) var(--spacing-lg)', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{formatDate(entry.date)}</td>
                      <td style={{ padding: 'var(--spacing-md) var(--spacing-lg)', color: 'var(--text-primary)', fontWeight: 500 }}>{entry.description}</td>
                      <td style={{ padding: 'var(--spacing-md) var(--spacing-lg)', textAlign: 'right', color: entry.credit > 0 ? 'var(--success)' : 'var(--text-muted)', fontWeight: entry.credit > 0 ? 600 : 400 }}>{entry.credit > 0 ? formatCurrency(entry.credit) : '-'}</td>
                      <td style={{ padding: 'var(--spacing-md) var(--spacing-lg)', textAlign: 'right', color: entry.debit > 0 ? 'var(--error)' : 'var(--text-muted)', fontWeight: entry.debit > 0 ? 600 : 400 }}>{entry.debit > 0 ? formatCurrency(entry.debit) : '-'}</td>
                      <td style={{ padding: 'var(--spacing-md) var(--spacing-lg)', textAlign: 'right', fontWeight: 700, color: entry.runningBalance >= 0 ? 'var(--primary-green)' : 'var(--error)' }}>{formatCurrency(entry.runningBalance)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </motion.div>

      {/* Transfer Modal */}
      {showTransferModal && (
        <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div onClick={() => setShowTransferModal(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(0, 0, 0, 0.5)' }} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            style={{ position: 'relative', width: 'calc(100% - 32px)', maxWidth: '440px', maxHeight: 'calc(100vh - 32px)', overflow: 'auto', zIndex: 1001 }}
          >
            <div style={{
              background: 'var(--surface)', padding: isMobile ? '1.25rem' : '32px', borderRadius: 'var(--radius-xl)',
              boxShadow: 'var(--shadow-xl)', border: '1px solid var(--border)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-lg)' }}>
                <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-primary)' }}>Transfer Balance</h2>
                <button onClick={() => setShowTransferModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 'var(--spacing-sm)', color: 'var(--text-muted)' }}>
                  <X size={20} />
                </button>
              </div>
              <div style={{ background: 'var(--background)', padding: 'var(--spacing-md)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--spacing-lg)' }}>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>From Account</p>
                <p style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>{freshAccount.name}</p>
                <p style={{ fontSize: '0.875rem', color: 'var(--primary-green)', fontWeight: 600 }}>Available: {formatCurrency(freshAccount.balance)}</p>
              </div>
              <form onSubmit={handleTransfer}>
                <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                  <label className="label" htmlFor="transferTarget">Transfer To</label>
                  <select
                    id="transferTarget"
                    value={transferTarget}
                    onChange={(e) => setTransferTarget(e.target.value)}
                    required
                    style={{ width: '100%', padding: 'var(--spacing-sm) var(--spacing-md)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', fontSize: '0.875rem', fontFamily: 'var(--font-family)', backgroundColor: 'var(--surface)', cursor: 'pointer' }}
                  >
                    <option value="">Select target account...</option>
                    <option value="main">Main Account</option>
                    {otherAccounts.map((acc) => (
                      <option key={acc.id} value={acc.id}>{acc.name} ({formatCurrency(acc.balance)})</option>
                    ))}
                  </select>
                </div>
                <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                  <label className="label" htmlFor="transferAmount">Transfer Amount</label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontWeight: 600, fontSize: '1rem', zIndex: 1 }}>₹</span>
                    <input
                      id="transferAmount"
                      type="number"
                      className="input"
                      value={transferAmount}
                      onChange={(e) => setTransferAmount(e.target.value)}
                      placeholder="Enter amount"
                      min="0.01"
                      max={freshAccount.balance}
                      step="0.01"
                      required
                      style={{ width: '100%', padding: '12px 16px 12px 36px', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', fontSize: '0.875rem', fontFamily: 'var(--font-family)' }}
                    />
                  </div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 'var(--spacing-xs)' }}>Max: {formatCurrency(freshAccount.balance)}</p>
                </div>
                <button type="submit" style={{
                  width: '100%', padding: 'var(--spacing-md)', background: 'var(--primary-green)', color: 'white', border: 'none',
                  borderRadius: 'var(--radius-md)', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--spacing-sm)',
                }}>
                  <ArrowLeftRight size={18} />
                  Transfer Now
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      )}

      {/* Entry Detail Popup */}
      {selectedEntry && (
        <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div onClick={() => setSelectedEntry(null)} style={{ position: 'absolute', inset: 0, background: 'rgba(0, 0, 0, 0.5)' }} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            style={{ position: 'relative', width: 'calc(100% - 32px)', maxWidth: '500px', maxHeight: 'calc(100vh - 32px)', overflow: 'auto', zIndex: 1001 }}
          >
            <div style={{
              background: 'var(--surface)', padding: isMobile ? '1.25rem' : '32px', borderRadius: 'var(--radius-xl)',
              boxShadow: 'var(--shadow-xl)', border: '1px solid var(--border)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--spacing-lg)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
                  <div style={{
                    width: isMobile ? '40px' : '48px', height: isMobile ? '40px' : '48px', borderRadius: 'var(--radius-md)',
                    background: selectedEntry.credit > 0 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: selectedEntry.credit > 0 ? 'var(--success)' : 'var(--error)',
                  }}>
                    {selectedEntry.credit > 0 ? <ArrowDownLeft size={isMobile ? 20 : 24} /> : <ArrowUpRight size={isMobile ? 20 : 24} />}
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {selectedEntry.kind === 'transfer' ? 'Fund Transfer' : 'Expense'}
                    </h3>
                    <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{formatDateTime(selectedEntry.date)}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedEntry(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 'var(--spacing-sm)', color: 'var(--text-muted)' }}>
                  <X size={20} />
                </button>
              </div>

              <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Description</p>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>{selectedEntry.description}</p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-lg)' }}>
                <div style={{ background: 'var(--background)', padding: '0.75rem', borderRadius: 'var(--radius-md)' }}>
                  <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                    {selectedEntry.credit > 0 ? 'Credit' : 'Debit'}
                  </p>
                  <p style={{ fontSize: '1.25rem', fontWeight: 700, color: selectedEntry.credit > 0 ? 'var(--success)' : 'var(--error)' }}>
                    {selectedEntry.credit > 0 ? '+' : '-'}{formatCurrency(selectedEntry.credit > 0 ? selectedEntry.credit : selectedEntry.debit)}
                  </p>
                </div>
                <div style={{ background: 'var(--background)', padding: '0.75rem', borderRadius: 'var(--radius-md)' }}>
                  <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Balance After</p>
                  <p style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary-green)' }}>{formatCurrency(selectedEntry.runningBalance)}</p>
                </div>
              </div>

              {selectedEntry.kind === 'transfer' && (
                <div style={{ background: 'var(--background)', padding: 'var(--spacing-md)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--spacing-lg)' }}>
                  <div>
                    <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>From</p>
                    <p style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>{selectedEntry.fromAccount || '-'}</p>
                  </div>
                  <ArrowLeftRight size={16} style={{ color: 'var(--primary-green)' }} />
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>To</p>
                    <p style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>{selectedEntry.toAccount || '-'}</p>
                  </div>
                </div>
              )}

              {selectedEntry.kind === 'expense' && selectedEntry.category && (
                <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                  <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Category</p>
                  <span style={{ display: 'inline-block', padding: '4px 12px', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)', borderRadius: 'var(--radius-full)', fontSize: '0.8rem', fontWeight: 600 }}>
                    {selectedEntry.category}
                  </span>
                </div>
              )}

              {selectedEntry.imageUrl && (
                <div>
                  <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Receipt</p>
                  <div 
                    onClick={() => setZoomedImage(selectedEntry.imageUrl!)}
                    style={{ 
                      borderRadius: 'var(--radius-md)', 
                      overflow: 'hidden', 
                      border: '1px solid var(--border)',
                      cursor: 'pointer',
                      position: 'relative',
                    }}
                  >
                    <img src={selectedEntry.imageUrl} alt="Receipt" style={{ width: '100%', maxHeight: '200px', objectFit: 'cover', display: 'block' }} />
                    <div style={{
                      position: 'absolute',
                      bottom: '8px',
                      right: '8px',
                      background: 'rgba(0,0,0,0.6)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '4px 8px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      color: 'white',
                      fontSize: '0.7rem',
                    }}>
                      <ZoomIn size={14} />
                      Tap to view
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div onClick={() => setShowDeleteConfirm(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(0, 0, 0, 0.5)' }} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            style={{ position: 'relative', width: 'calc(100% - 32px)', maxWidth: '400px', zIndex: 1001 }}
          >
            <div style={{
              background: 'var(--surface)', padding: isMobile ? '1.5rem' : '32px', borderRadius: 'var(--radius-xl)',
              boxShadow: 'var(--shadow-xl)', border: '1px solid var(--border)', textAlign: 'center',
            }}>
              <div style={{
                width: '56px', height: '56px', borderRadius: 'var(--radius-full)',
                background: 'rgba(239, 68, 68, 0.1)', display: 'flex', alignItems: 'center',
                justifyContent: 'center', color: 'var(--error)', margin: '0 auto var(--spacing-lg)',
              }}>
                <AlertTriangle size={28} />
              </div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 'var(--spacing-sm)' }}>Delete Account?</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 'var(--spacing-xl)' }}>
                Are you sure you want to delete "{freshAccount.name}"? This action cannot be undone.
              </p>
              <div style={{ display: 'flex', gap: 'var(--spacing-md)' }}>
                <button onClick={() => setShowDeleteConfirm(false)} style={{
                  flex: 1, padding: 'var(--spacing-md)', background: 'var(--surface)',
                  color: 'var(--text-primary)', border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer',
                }}>Cancel</button>
                <button onClick={handleDelete} style={{
                  flex: 1, padding: 'var(--spacing-md)', background: 'var(--error)',
                  color: 'white', border: 'none', borderRadius: 'var(--radius-md)',
                  fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer',
                }}>Delete</button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Fullscreen Image Viewer */}
      {zoomedImage && (
        <div 
          style={{ 
            position: 'fixed', 
            inset: 0, 
            zIndex: 2000, 
            background: 'rgba(0,0,0,0.95)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
          }}
          onClick={() => setZoomedImage(null)}
        >
          <button
            onClick={() => setZoomedImage(null)}
            style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              borderRadius: 'var(--radius-full)',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              zIndex: 2001,
            }}
          >
            <X size={24} color="white" />
          </button>
          <img 
            src={zoomedImage} 
            alt="Receipt Full View" 
            onClick={(e) => e.stopPropagation()}
            style={{ 
              maxWidth: '95vw', 
              maxHeight: '90vh', 
              objectFit: 'contain',
              borderRadius: 'var(--radius-md)',
            }} 
          />
          <p style={{ 
            color: 'rgba(255,255,255,0.7)', 
            fontSize: '0.8rem', 
            marginTop: '12px',
          }}>
            Tap anywhere to close
          </p>
        </div>
      )}
    </div>
  );
}
