import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowDownLeft, ArrowUpRight, Wallet } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface ReconciliationViewProps {
  searchQuery?: string;
}

export function ReconciliationView({ searchQuery = '' }: ReconciliationViewProps) {
  const { transactions, deposits } = useApp();
  const [filterType, setFilterType] = useState<'all' | 'deposit' | 'transfer' | 'expense'>('all');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const transferTransactions = transactions.filter(t => t.type !== 'expense');
  const filteredTransactions = transferTransactions
    .filter(t => filterType === 'all' || t.type === filterType)
    .filter(t => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return (
        t.description.toLowerCase().includes(query) ||
        (t.fromAccount || '').toLowerCase().includes(query) ||
        (t.toAccount || '').toLowerCase().includes(query)
      );
    });

  let runningBalance = deposits;
  const transactionsWithBalance = [...filteredTransactions]
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    .map(t => {
      if (t.type === 'deposit') runningBalance += t.amount;
      else if (t.type === 'transfer' && t.fromAccount === 'Main Account') runningBalance -= t.amount;
      else if (t.type === 'transfer' && t.toAccount === 'Main Account') runningBalance += t.amount;
      return { ...t, runningBalance };
    })
    .reverse();

  return (
    <div style={{ padding: isMobile ? '0.75rem' : '2rem' }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: isMobile ? '1rem' : 'var(--spacing-2xl)' }}
      >
        <h1 style={{ fontSize: isMobile ? '1.15rem' : '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>
          Transaction History
        </h1>
        <p style={{ fontSize: isMobile ? '0.75rem' : '0.875rem', color: 'var(--text-muted)' }}>
          Track all fund transfers and deposits
        </p>
      </motion.div>

      {/* Filter Tabs */}
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        marginBottom: isMobile ? '0.75rem' : 'var(--spacing-lg)',
        overflowX: 'auto',
        paddingBottom: '4px',
      }}>
        {(['all', 'deposit', 'transfer'] as const).map((type) => (
          <button
            key={type}
            onClick={() => setFilterType(type)}
            style={{
              padding: isMobile ? '0.4rem 0.75rem' : 'var(--spacing-sm) var(--spacing-md)',
              background: filterType === type ? 'var(--primary-green)' : 'var(--surface)',
              color: filterType === type ? 'white' : 'var(--text-secondary)',
              border: `1px solid ${filterType === type ? 'var(--primary-green)' : 'var(--border)'}`,
              borderRadius: 'var(--radius-full)',
              fontSize: isMobile ? '0.75rem' : '0.875rem',
              fontWeight: 500,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
          >
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </button>
        ))}
      </div>

      {/* Transactions */}
      {filteredTransactions.length === 0 ? (
        <div style={{
          background: 'var(--surface)',
          padding: isMobile ? '2rem 1rem' : 'var(--spacing-2xl)',
          textAlign: 'center',
          color: 'var(--text-muted)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border)',
        }}>
          <Wallet size={40} style={{ marginBottom: 'var(--spacing-md)', opacity: 0.3 }} />
          <p style={{ fontSize: '0.9rem' }}>No transactions found</p>
        </div>
      ) : isMobile ? (
        // Mobile: Card List
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {transactionsWithBalance.map((transaction, index) => {
            const isDeposit = transaction.type === 'deposit';
            const isTransferIn = transaction.type === 'transfer' && transaction.toAccount === 'Main Account';

            return (
              <motion.div
                key={transaction.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                style={{
                  background: 'var(--surface)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border)',
                  padding: '0.75rem',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, minWidth: 0 }}>
                    <div style={{
                      width: '32px', height: '32px', borderRadius: 'var(--radius-sm)',
                      background: isDeposit || isTransferIn ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                      color: isDeposit || isTransferIn ? 'var(--success)' : 'var(--error)',
                    }}>
                      {isDeposit || isTransferIn ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                    </div>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <p style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {transaction.description}
                      </p>
                      <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                        {new Date(transaction.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                  <p style={{ fontSize: '0.85rem', fontWeight: 700, color: isDeposit || isTransferIn ? 'var(--success)' : 'var(--error)', flexShrink: 0, marginLeft: '0.5rem' }}>
                    {isDeposit || isTransferIn ? '+' : '-'}{formatCurrency(transaction.amount)}
                  </p>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.5rem', borderTop: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.65rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>From: <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>{transaction.fromAccount || '-'}</span></span>
                    <span style={{ color: 'var(--text-muted)' }}>To: <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>{transaction.toAccount || '-'}</span></span>
                  </div>
                  <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--primary-green)' }}>
                    Bal: {formatCurrency(transaction.runningBalance)}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        // Desktop: Table
        <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-md)', border: '1px solid var(--border)', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ background: 'var(--background)' }}>
                  <th style={{ padding: 'var(--spacing-md) var(--spacing-lg)', textAlign: 'left', fontWeight: 600, color: 'var(--text-secondary)', borderBottom: '2px solid var(--border)', whiteSpace: 'nowrap' }}>Date & Time</th>
                  <th style={{ padding: 'var(--spacing-md) var(--spacing-lg)', textAlign: 'left', fontWeight: 600, color: 'var(--text-secondary)', borderBottom: '2px solid var(--border)' }}>Description</th>
                  <th style={{ padding: 'var(--spacing-md) var(--spacing-lg)', textAlign: 'left', fontWeight: 600, color: 'var(--text-secondary)', borderBottom: '2px solid var(--border)' }}>From</th>
                  <th style={{ padding: 'var(--spacing-md) var(--spacing-lg)', textAlign: 'left', fontWeight: 600, color: 'var(--text-secondary)', borderBottom: '2px solid var(--border)' }}>To</th>
                  <th style={{ padding: 'var(--spacing-md) var(--spacing-lg)', textAlign: 'right', fontWeight: 600, color: 'var(--text-secondary)', borderBottom: '2px solid var(--border)', whiteSpace: 'nowrap' }}>Amount</th>
                  <th style={{ padding: 'var(--spacing-md) var(--spacing-lg)', textAlign: 'right', fontWeight: 600, color: 'var(--text-secondary)', borderBottom: '2px solid var(--border)', whiteSpace: 'nowrap' }}>Main Balance</th>
                </tr>
              </thead>
              <tbody>
                {transactionsWithBalance.map((transaction, index) => {
                  const isDeposit = transaction.type === 'deposit';
                  const isTransferIn = transaction.type === 'transfer' && transaction.toAccount === 'Main Account';
                  return (
                    <tr key={transaction.id} style={{ borderBottom: index < transactionsWithBalance.length - 1 ? '1px solid var(--border)' : 'none' }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--background)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <td style={{ padding: 'var(--spacing-md) var(--spacing-lg)', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                        {new Date(transaction.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td style={{ padding: 'var(--spacing-md) var(--spacing-lg)', color: 'var(--text-primary)', fontWeight: 500 }}>{transaction.description}</td>
                      <td style={{ padding: 'var(--spacing-md) var(--spacing-lg)', color: 'var(--text-secondary)' }}>{transaction.fromAccount || '-'}</td>
                      <td style={{ padding: 'var(--spacing-md) var(--spacing-lg)', color: 'var(--text-secondary)' }}>{transaction.toAccount || '-'}</td>
                      <td style={{ padding: 'var(--spacing-md) var(--spacing-lg)', textAlign: 'right', fontWeight: 700, color: isDeposit || isTransferIn ? 'var(--success)' : 'var(--error)' }}>
                        {isDeposit || isTransferIn ? '+' : '-'}{formatCurrency(transaction.amount)}
                      </td>
                      <td style={{ padding: 'var(--spacing-md) var(--spacing-lg)', textAlign: 'right', fontWeight: 600, color: 'var(--primary-green)' }}>
                        {formatCurrency(transaction.runningBalance)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
