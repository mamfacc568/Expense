import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Filter,
  Wallet
} from 'lucide-react';
import { useApp } from '../context/AppContext';

interface ReconciliationViewProps {
  searchQuery?: string;
}

export function ReconciliationView({ searchQuery = '' }: ReconciliationViewProps) {
  const { transactions, deposits } = useApp();
  const [filterType, setFilterType] = useState<'all' | 'deposit' | 'transfer' | 'expense'>('all');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  // Filter to only show transfer and deposit transactions (not expenses)
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

  // Calculate running balance
  let runningBalance = deposits;
  const transactionsWithBalance = [...filteredTransactions]
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    .map(t => {
      if (t.type === 'deposit') {
        runningBalance += t.amount;
      } else if (t.type === 'transfer' && t.fromAccount === 'Main Account') {
        // Transfer out of main account - main balance decreases
        runningBalance -= t.amount;
      } else if (t.type === 'transfer' && t.toAccount === 'Main Account') {
        // Transfer into main account - main balance increases
        runningBalance += t.amount;
      }
      return { ...t, runningBalance };
    })
    .reverse(); // Show newest first

  return (
    <div style={{ padding: '2rem' }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ marginBottom: 'var(--spacing-2xl)' }}
      >
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 'var(--spacing-xs)' }}>
          Transaction History
        </h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          Track all fund transfers and deposits
        </p>
      </motion.div>

      {/* Filter Tabs */}
      <div style={{
        display: 'flex',
        gap: 'var(--spacing-sm)',
        marginBottom: 'var(--spacing-lg)',
        flexWrap: 'wrap',
      }}>
        {(['all', 'deposit', 'transfer'] as const).map((type) => (
          <button
            key={type}
            onClick={() => setFilterType(type)}
            style={{
              padding: 'var(--spacing-sm) var(--spacing-md)',
              background: filterType === type ? 'var(--primary-green)' : 'var(--surface)',
              color: filterType === type ? 'white' : 'var(--text-secondary)',
              border: `1px solid ${filterType === type ? 'var(--primary-green)' : 'var(--border)'}`,
              borderRadius: 'var(--radius-md)',
              fontSize: '0.875rem',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all var(--transition-fast)',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--spacing-xs)',
            }}
          >
            <Filter size={14} />
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </button>
        ))}
      </div>

      {/* Transactions Table */}
      <div className="card" style={{
        background: 'var(--surface)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-md)',
        border: '1px solid var(--border)',
        overflow: 'hidden',
      }}>
        <div style={{
          padding: 'var(--spacing-lg)',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            Transactions
          </h2>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {filteredTransactions.length} transaction{filteredTransactions.length !== 1 ? 's' : ''}
          </span>
        </div>

        {filteredTransactions.length === 0 ? (
          <div style={{ padding: 'var(--spacing-2xl)', textAlign: 'center', color: 'var(--text-muted)' }}>
            <Wallet size={48} style={{ marginBottom: 'var(--spacing-md)', opacity: 0.3 }} />
            <p>No transactions found</p>
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
                  }}>Date & Time</th>
                  <th style={{
                    padding: 'var(--spacing-md) var(--spacing-lg)', textAlign: 'left',
                    fontWeight: 600, color: 'var(--text-secondary)', borderBottom: '2px solid var(--border)',
                  }}>Description</th>
                  <th style={{
                    padding: 'var(--spacing-md) var(--spacing-lg)', textAlign: 'left',
                    fontWeight: 600, color: 'var(--text-secondary)', borderBottom: '2px solid var(--border)',
                  }}>From</th>
                  <th style={{
                    padding: 'var(--spacing-md) var(--spacing-lg)', textAlign: 'left',
                    fontWeight: 600, color: 'var(--text-secondary)', borderBottom: '2px solid var(--border)',
                  }}>To</th>
                  <th style={{
                    padding: 'var(--spacing-md) var(--spacing-lg)', textAlign: 'right',
                    fontWeight: 600, color: 'var(--text-secondary)', borderBottom: '2px solid var(--border)',
                    whiteSpace: 'nowrap',
                  }}>Amount</th>
                  <th style={{
                    padding: 'var(--spacing-md) var(--spacing-lg)', textAlign: 'right',
                    fontWeight: 600, color: 'var(--text-secondary)', borderBottom: '2px solid var(--border)',
                    whiteSpace: 'nowrap',
                  }}>Main Balance</th>
                </tr>
              </thead>
              <tbody>
                {transactionsWithBalance.map((transaction, index) => {
                  const isDeposit = transaction.type === 'deposit';
                  const isTransferIn = transaction.type === 'transfer' && transaction.toAccount === 'Main Account';

                  return (
                    <tr
                      key={transaction.id}
                      style={{
                        borderBottom: index < transactionsWithBalance.length - 1 ? '1px solid var(--border)' : 'none',
                        transition: 'background-color var(--transition-fast)',
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--background)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <td style={{
                        padding: 'var(--spacing-md) var(--spacing-lg)',
                        color: 'var(--text-secondary)',
                        whiteSpace: 'nowrap',
                      }}>
                        {new Date(transaction.createdAt).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td style={{
                        padding: 'var(--spacing-md) var(--spacing-lg)',
                        color: 'var(--text-primary)',
                        fontWeight: 500,
                      }}>
                        {transaction.description}
                      </td>
                      <td style={{
                        padding: 'var(--spacing-md) var(--spacing-lg)',
                        color: 'var(--text-secondary)',
                      }}>
                        {transaction.fromAccount || '-'}
                      </td>
                      <td style={{
                        padding: 'var(--spacing-md) var(--spacing-lg)',
                        color: 'var(--text-secondary)',
                      }}>
                        {transaction.toAccount || '-'}
                      </td>
                      <td style={{
                        padding: 'var(--spacing-md) var(--spacing-lg)',
                        textAlign: 'right',
                        fontWeight: 700,
                        color: isDeposit || isTransferIn ? 'var(--success)' : 'var(--error)',
                      }}>
                        {isDeposit || isTransferIn ? '+' : '-'}{formatCurrency(transaction.amount)}
                      </td>
                      <td style={{
                        padding: 'var(--spacing-md) var(--spacing-lg)',
                        textAlign: 'right',
                        fontWeight: 600,
                        color: 'var(--primary-green)',
                      }}>
                        {formatCurrency(transaction.runningBalance)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
