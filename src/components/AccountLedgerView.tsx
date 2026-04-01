import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Plus, Trash2, AlertTriangle, X, ArrowUpRight, ArrowDownLeft, ArrowLeftRight, FileText, Tag, Image as ImageIcon } from 'lucide-react';
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

  // Get fresh account data from context to ensure hot reload works
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

    if (amount <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    if (amount > freshAccount.balance) {
      alert(`Insufficient balance\nAvailable: ${formatCurrency(freshAccount.balance)}`);
      return;
    }

    if (transferTarget === 'main') {
      // Transfer back to Main Account
      transferToMainAccount(freshAccount.id, amount);
      setShowTransferModal(false);
      setTransferTarget('');
      setTransferAmount('');
      return;
    }

    // Transfer to another sub-account
    if (transferTarget && transferTarget !== 'main') {
      transferBetweenAccounts(freshAccount.id, transferTarget, amount);
      setShowTransferModal(false);
      setTransferTarget('');
      setTransferAmount('');
    }
  };

  // Get other accounts (excluding current account)
  const otherAccounts = subAccounts.filter(a => a.id !== freshAccount.id);

  return (
    <div style={{ padding: '2rem' }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ marginBottom: 'var(--spacing-2xl)' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-lg)' }}>
          <button
            onClick={onBack}
            style={{
              background: 'none', border: 'none', cursor: 'pointer', padding: 'var(--spacing-sm)',
              color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'color var(--transition-fast)',
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--primary-green)'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
          >
            <ArrowLeft size={24} />
          </button>
          <div style={{
            width: '48px', height: '48px', borderRadius: 'var(--radius-md)',
            background: 'linear-gradient(135deg, var(--secondary-green) 0%, var(--primary-green) 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontWeight: 700, fontSize: '1.25rem',
          }}>
            {freshAccount.name.charAt(0).toUpperCase()}
          </div>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 'var(--spacing-xs)' }}>
              {freshAccount.name}
            </h1>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              Created {freshAccount.createdAt.toLocaleDateString('en-IN', { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 'var(--spacing-xs)' }}>Closing Balance</p>
            <p style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--primary-green)' }}>
              {formatCurrency(freshAccount.balance)}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: 'var(--spacing-md)', flexWrap: 'wrap' }}>
          <button
            onClick={onExpense}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 'var(--spacing-sm)',
              padding: 'var(--spacing-sm) var(--spacing-lg)', background: 'var(--primary-green)',
              color: 'white', border: 'none', borderRadius: 'var(--radius-md)',
              fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer', transition: 'all var(--transition-fast)',
            }}
          >
            <Plus size={18} />
            Book Expense
          </button>
          <button
            onClick={() => setShowTransferModal(true)}
            disabled={freshAccount.balance === 0}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 'var(--spacing-sm)',
              padding: 'var(--spacing-sm) var(--spacing-lg)',
              background: freshAccount.balance === 0 ? 'var(--background)' : 'var(--surface)',
              color: freshAccount.balance === 0 ? 'var(--text-muted)' : 'var(--primary-green)',
              border: `1px solid ${freshAccount.balance === 0 ? 'var(--border)' : 'var(--primary-green)'}`,
              borderRadius: 'var(--radius-md)',
              fontWeight: 600, fontSize: '0.875rem',
              cursor: freshAccount.balance === 0 ? 'not-allowed' : 'pointer',
              transition: 'all var(--transition-fast)',
              opacity: freshAccount.balance === 0 ? 0.6 : 1,
            }}
          >
            <ArrowLeftRight size={18} />
            Transfer Balance
          </button>
          {freshAccount.balance === 0 && (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 'var(--spacing-sm)',
                padding: 'var(--spacing-sm) var(--spacing-lg)', background: 'var(--surface)',
                color: 'var(--error)', border: '1px solid var(--error)', borderRadius: 'var(--radius-md)',
                fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer', transition: 'all var(--transition-fast)',
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
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 'var(--spacing-lg)', marginBottom: 'var(--spacing-2xl)',
      }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="card"
          style={{
            background: 'var(--surface)', padding: 'var(--spacing-lg)',
            borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-md)', border: '1px solid var(--border)',
          }}
        >
          <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Total Credits (Fund Received)</span>
          <p style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--success)', marginTop: 'var(--spacing-sm)' }}>
            {formatCurrency(totalCredits)}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="card"
          style={{
            background: 'var(--surface)', padding: 'var(--spacing-lg)',
            borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-md)', border: '1px solid var(--border)',
          }}
        >
          <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Total Debits (Expenses/Transfers Out)</span>
          <p style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--error)', marginTop: 'var(--spacing-sm)' }}>
            {formatCurrency(totalDebits)}
          </p>
        </motion.div>
      </div>

      {/* Sub Account Ledger Table */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: 'var(--spacing-lg)', color: 'var(--text-primary)' }}>
          Sub Account Ledger
        </h2>
        <div className="card" style={{
          background: 'var(--surface)', borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-md)', border: '1px solid var(--border)', overflow: 'hidden',
        }}>
          {ledgerEntries.length === 0 ? (
            <div style={{ padding: 'var(--spacing-2xl)', textAlign: 'center', color: 'var(--text-muted)' }}>
              <p>No transactions yet</p>
              <p style={{ fontSize: '0.75rem', marginTop: 'var(--spacing-sm)' }}>
                Book an expense or transfer funds to see the ledger
              </p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                <thead>
                  <tr style={{ background: 'var(--background)' }}>
                    <th style={{
                      padding: 'var(--spacing-md) var(--spacing-lg)', textAlign: 'left',
                      fontWeight: 600, color: 'var(--text-secondary)', borderBottom: '2px solid var(--border)',
                      whiteSpace: 'nowrap',
                    }}>Date</th>
                    <th style={{
                      padding: 'var(--spacing-md) var(--spacing-lg)', textAlign: 'left',
                      fontWeight: 600, color: 'var(--text-secondary)', borderBottom: '2px solid var(--border)',
                    }}>Description</th>
                    <th style={{
                      padding: 'var(--spacing-md) var(--spacing-lg)', textAlign: 'right',
                      fontWeight: 600, color: 'var(--text-secondary)', borderBottom: '2px solid var(--border)',
                      whiteSpace: 'nowrap',
                    }}>Credit</th>
                    <th style={{
                      padding: 'var(--spacing-md) var(--spacing-lg)', textAlign: 'right',
                      fontWeight: 600, color: 'var(--text-secondary)', borderBottom: '2px solid var(--border)',
                      whiteSpace: 'nowrap',
                    }}>Debit</th>
                    <th style={{
                      padding: 'var(--spacing-md) var(--spacing-lg)', textAlign: 'right',
                      fontWeight: 600, color: 'var(--text-secondary)', borderBottom: '2px solid var(--border)',
                      whiteSpace: 'nowrap',
                    }}>Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {ledgerEntries.map((entry, index) => (
                    <tr
                      key={entry.id}
                      onClick={() => setSelectedEntry(entry)}
                      style={{
                        borderBottom: index < ledgerEntries.length - 1 ? '1px solid var(--border)' : 'none',
                        transition: 'background-color var(--transition-fast)',
                        cursor: 'pointer',
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--background)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <td style={{
                        padding: 'var(--spacing-md) var(--spacing-lg)', color: 'var(--text-secondary)',
                        whiteSpace: 'nowrap',
                      }}>
                        {formatDate(entry.date)}
                      </td>
                      <td style={{
                        padding: 'var(--spacing-md) var(--spacing-lg)', color: 'var(--text-primary)',
                        fontWeight: 500,
                      }}>
                        {entry.description}
                      </td>
                      <td style={{
                        padding: 'var(--spacing-md) var(--spacing-lg)', textAlign: 'right',
                        color: entry.credit > 0 ? 'var(--success)' : 'var(--text-muted)',
                        fontWeight: entry.credit > 0 ? 600 : 400,
                      }}>
                        {entry.credit > 0 ? formatCurrency(entry.credit) : '-'}
                      </td>
                      <td style={{
                        padding: 'var(--spacing-md) var(--spacing-lg)', textAlign: 'right',
                        color: entry.debit > 0 ? 'var(--error)' : 'var(--text-muted)',
                        fontWeight: entry.debit > 0 ? 600 : 400,
                      }}>
                        {entry.debit > 0 ? formatCurrency(entry.debit) : '-'}
                      </td>
                      <td style={{
                        padding: 'var(--spacing-md) var(--spacing-lg)', textAlign: 'right',
                        fontWeight: 700,
                        color: entry.runningBalance >= 0 ? 'var(--primary-green)' : 'var(--error)',
                      }}>
                        {formatCurrency(entry.runningBalance)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </motion.div>

      {/* Transfer Modal */}
      {showTransferModal && (
        <div style={{
          position: 'fixed', inset: 0, display: 'flex', alignItems: 'center',
          justifyContent: 'center', zIndex: 1000,
        }}>
          <div
            onClick={() => setShowTransferModal(false)}
            style={{ position: 'absolute', inset: 0, background: 'rgba(0, 0, 0, 0.5)' }}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            style={{
              position: 'relative', width: 'calc(100% - 32px)', maxWidth: '440px',
              maxHeight: 'calc(100vh - 32px)', overflow: 'auto', zIndex: 1001,
            }}
          >
            <div className="card" style={{
              background: 'var(--surface)', padding: '32px', borderRadius: 'var(--radius-xl)',
              boxShadow: 'var(--shadow-xl)', border: '1px solid var(--border)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-lg)' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Transfer Balance
                </h2>
                <button
                  onClick={() => setShowTransferModal(false)}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer', padding: 'var(--spacing-sm)',
                    color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  <X size={20} />
                </button>
              </div>

              {/* From Account Info */}
              <div style={{
                background: 'var(--background)', padding: 'var(--spacing-md)',
                borderRadius: 'var(--radius-md)', marginBottom: 'var(--spacing-lg)',
              }}>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>From Account</p>
                <p style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>{freshAccount.name}</p>
                <p style={{ fontSize: '0.875rem', color: 'var(--primary-green)', fontWeight: 600 }}>
                  Available: {formatCurrency(freshAccount.balance)}
                </p>
              </div>

              <form onSubmit={handleTransfer}>
                {/* To Account Selection */}
                <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                  <label className="label" htmlFor="transferTarget">Transfer To</label>
                  <select
                    id="transferTarget"
                    value={transferTarget}
                    onChange={(e) => setTransferTarget(e.target.value)}
                    required
                    style={{
                      width: '100%', padding: 'var(--spacing-sm) var(--spacing-md)',
                      border: '1px solid var(--border)', borderRadius: 'var(--radius-md)',
                      fontSize: '0.875rem', fontFamily: 'var(--font-family)',
                      backgroundColor: 'var(--surface)', cursor: 'pointer',
                    }}
                  >
                    <option value="">Select target account...</option>
                    <option value="main">Main Account</option>
                    {otherAccounts.map((acc) => (
                      <option key={acc.id} value={acc.id}>
                        {acc.name} ({formatCurrency(acc.balance)})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Arrow indicator */}
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 'var(--spacing-lg)' }}>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)',
                    background: 'var(--background)', padding: '8px 16px', borderRadius: 'var(--radius-full)',
                  }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{freshAccount.name}</span>
                    <ArrowLeftRight size={16} style={{ color: 'var(--primary-green)' }} />
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {transferTarget === 'main' ? 'Main Account' : otherAccounts.find(a => a.id === transferTarget)?.name || '...'}
                    </span>
                  </div>
                </div>

                {/* Amount */}
                <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                  <label className="label" htmlFor="transferAmount">Transfer Amount</label>
                  <div style={{ position: 'relative' }}>
                    <span style={{
                      position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)',
                      color: 'var(--text-muted)', fontWeight: 600, fontSize: '1rem', zIndex: 1,
                    }}>₹</span>
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
                      style={{
                        width: '100%', padding: '12px 16px 12px 36px',
                        border: '1px solid var(--border)', borderRadius: 'var(--radius-md)',
                        fontSize: '0.875rem', fontFamily: 'var(--font-family)',
                      }}
                    />
                  </div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 'var(--spacing-xs)' }}>
                    Max: {formatCurrency(freshAccount.balance)}
                  </p>
                </div>

                <button
                  type="submit"
                  style={{
                    width: '100%', padding: 'var(--spacing-md)',
                    background: 'var(--primary-green)', color: 'white', border: 'none',
                    borderRadius: 'var(--radius-md)', fontWeight: 600, fontSize: '0.875rem',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    gap: 'var(--spacing-sm)',
                  }}
                >
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
        <div style={{
          position: 'fixed', inset: 0, display: 'flex', alignItems: 'center',
          justifyContent: 'center', zIndex: 1000,
        }}>
          <div
            onClick={() => setSelectedEntry(null)}
            style={{ position: 'absolute', inset: 0, background: 'rgba(0, 0, 0, 0.5)' }}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            style={{
              position: 'relative', width: 'calc(100% - 32px)', maxWidth: '500px',
              maxHeight: 'calc(100vh - 32px)', overflow: 'auto', zIndex: 1001,
            }}
          >
            <div className="card" style={{
              background: 'var(--surface)', padding: '32px', borderRadius: 'var(--radius-xl)',
              boxShadow: 'var(--shadow-xl)', border: '1px solid var(--border)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--spacing-lg)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
                  <div style={{
                    width: '48px', height: '48px', borderRadius: 'var(--radius-md)',
                    background: selectedEntry.credit > 0 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: selectedEntry.credit > 0 ? 'var(--success)' : 'var(--error)',
                  }}>
                    {selectedEntry.credit > 0 ? <ArrowDownLeft size={24} /> : <ArrowUpRight size={24} />}
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 'var(--spacing-xs)' }}>
                      {selectedEntry.kind === 'transfer' ? 'Fund Transfer' : 'Expense'}
                    </h3>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {formatDateTime(selectedEntry.date)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedEntry(null)}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer', padding: 'var(--spacing-sm)',
                    color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  <X size={20} />
                </button>
              </div>

              {/* Description */}
              <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 'var(--spacing-xs)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <FileText size={14} /> Description
                </p>
                <p style={{ fontSize: '0.938rem', color: 'var(--text-primary)', lineHeight: 1.6 }}>
                  {selectedEntry.description}
                </p>
              </div>

              {/* Amount */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-lg)', marginBottom: 'var(--spacing-lg)' }}>
                <div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 'var(--spacing-xs)' }}>
                    {selectedEntry.credit > 0 ? 'Credit (Received)' : 'Debit (Spent)'}
                  </p>
                  <p style={{ fontSize: '1.5rem', fontWeight: 700, color: selectedEntry.credit > 0 ? 'var(--success)' : 'var(--error)' }}>
                    {selectedEntry.credit > 0 ? '+' : '-'}{formatCurrency(selectedEntry.credit > 0 ? selectedEntry.credit : selectedEntry.debit)}
                  </p>
                </div>
                <div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 'var(--spacing-xs)' }}>
                    Balance After
                  </p>
                  <p style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary-green)' }}>
                    {formatCurrency(selectedEntry.runningBalance)}
                  </p>
                </div>
              </div>

              {/* Transfer Details */}
              {selectedEntry.kind === 'transfer' && (
                <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                  <div style={{
                    background: 'var(--background)', padding: 'var(--spacing-md)',
                    borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center',
                    justifyContent: 'space-between', gap: 'var(--spacing-md)',
                  }}>
                    <div>
                      <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '2px' }}>From</p>
                      <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {selectedEntry.fromAccount || '-'}
                      </p>
                    </div>
                    <ArrowLeft size={20} style={{ color: 'var(--primary-green)', transform: 'rotate(180deg)' }} />
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '2px' }}>To</p>
                      <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {selectedEntry.toAccount || '-'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Expense Details */}
              {selectedEntry.kind === 'expense' && selectedEntry.category && (
                <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 'var(--spacing-xs)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Tag size={14} /> Category
                  </p>
                  <span style={{
                    display: 'inline-block', padding: '4px 12px',
                    background: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)',
                    borderRadius: 'var(--radius-full)', fontSize: '0.8rem', fontWeight: 600,
                  }}>
                    {selectedEntry.category}
                  </span>
                </div>
              )}

              {/* Receipt Image */}
              {selectedEntry.imageUrl && (
                <div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 'var(--spacing-xs)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <ImageIcon size={14} /> Receipt Image
                  </p>
                  <div style={{
                    borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--border)',
                  }}>
                    <img
                      src={selectedEntry.imageUrl}
                      alt="Receipt"
                      style={{ width: '100%', maxHeight: '300px', objectFit: 'cover', display: 'block' }}
                    />
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div style={{
          position: 'fixed', inset: 0, display: 'flex', alignItems: 'center',
          justifyContent: 'center', zIndex: 999,
        }}>
          <div
            onClick={() => setShowDeleteConfirm(false)}
            style={{ position: 'absolute', inset: 0, background: 'rgba(0, 0, 0, 0.5)' }}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            style={{ position: 'relative', width: 'calc(100% - 32px)', maxWidth: '400px', zIndex: 1000 }}
          >
            <div className="card" style={{
              background: 'var(--surface)', padding: '32px', borderRadius: 'var(--radius-xl)',
              boxShadow: 'var(--shadow-xl)', border: '1px solid var(--border)', textAlign: 'center',
            }}>
              <div style={{
                width: '64px', height: '64px', borderRadius: 'var(--radius-full)',
                background: 'rgba(239, 68, 68, 0.1)', display: 'flex', alignItems: 'center',
                justifyContent: 'center', color: 'var(--error)', margin: '0 auto var(--spacing-lg)',
              }}>
                <AlertTriangle size={32} />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 'var(--spacing-sm)' }}>
                Delete Account?
              </h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: 'var(--spacing-xl)' }}>
                Are you sure you want to delete "{freshAccount.name}"? This action cannot be undone.
              </p>
              <div style={{ display: 'flex', gap: 'var(--spacing-md)' }}>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  style={{
                    flex: 1, padding: 'var(--spacing-md)', background: 'var(--surface)',
                    color: 'var(--text-primary)', border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-md)', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  style={{
                    flex: 1, padding: 'var(--spacing-md)', background: 'var(--error)',
                    color: 'white', border: 'none', borderRadius: 'var(--radius-md)',
                    fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer',
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
