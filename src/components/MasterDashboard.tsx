import { motion } from 'framer-motion';
import { TrendingUp, ArrowUpRight, Plus, ArrowDownLeft, Wallet, PlusCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { SubAccount } from '../types';

interface MasterDashboardProps {
  onSelectAccount: (account: SubAccount) => void;
  onOpenDeposit: () => void;
  onOpenTransfer: () => void;
  onOpenCreate: () => void;
}

export function MasterDashboard({ onSelectAccount, onOpenDeposit, onOpenTransfer, onOpenCreate }: MasterDashboardProps) {
  const { masterBalance, subAccounts, transactions } = useApp();

  // Total unspent balance = sum of all sub-account closing balances
  const totalSubAccountBalance = subAccounts.reduce((sum, a) => sum + a.balance, 0);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const recentTransactions = transactions.slice(0, 10);

  return (
    <div style={{ padding: '2rem' }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          background: 'linear-gradient(135deg, var(--primary-green) 0%, var(--primary-light) 100%)',
          borderRadius: 'var(--radius-xl)',
          padding: 'var(--spacing-2xl)',
          color: 'white',
          marginBottom: 'var(--spacing-2xl)',
          boxShadow: 'var(--shadow-xl)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--spacing-lg)' }}>
          <div>
            <h1 style={{ fontSize: '1.125rem', fontWeight: 500, opacity: 0.9, marginBottom: 'var(--spacing-xs)' }}>
              MF Cash
            </h1>
            <p style={{ fontSize: '0.875rem', opacity: 0.8 }}>Master Dashboard</p>
          </div>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(255,255,255,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <TrendingUp size={24} />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 'var(--spacing-xl)', marginBottom: 'var(--spacing-xl)' }}>
          {/* Left - Main Account Balance */}
          <div>
            <p style={{ fontSize: '0.875rem', opacity: 0.8, marginBottom: 'var(--spacing-sm)' }}>
              Main Account Balance
            </p>
            <p style={{
              fontSize: '2.5rem',
              fontWeight: 700,
              lineHeight: 1.2,
            }}>
              {formatCurrency(masterBalance)}
            </p>
            <p style={{ fontSize: '0.75rem', opacity: 0.7, marginTop: 'var(--spacing-sm)' }}>
              Available for transfer
            </p>
          </div>

          {/* Right - Total Sub-Account Balance */}
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: '0.875rem', opacity: 0.8, marginBottom: 'var(--spacing-sm)' }}>
              Total Sub-Accounts Balance
            </p>
            <p style={{
              fontSize: '2.5rem',
              fontWeight: 700,
              lineHeight: 1.2,
            }}>
              {formatCurrency(totalSubAccountBalance)}
            </p>
            <p style={{ fontSize: '0.75rem', opacity: 0.7, marginTop: 'var(--spacing-sm)' }}>
              Unspent amount (not yet booked as expense)
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 'var(--spacing-md)', flexWrap: 'wrap' }}>
          <button
            onClick={onOpenDeposit}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 'var(--spacing-sm)',
              padding: 'var(--spacing-sm) var(--spacing-lg)',
              background: 'white',
              color: 'var(--primary-green)',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              fontWeight: 600,
              fontSize: '0.875rem',
              cursor: 'pointer',
              transition: 'all var(--transition-fast)',
            }}
          >
            <Plus size={18} />
            Deposit
          </button>
          <button
            onClick={onOpenTransfer}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 'var(--spacing-sm)',
              padding: 'var(--spacing-sm) var(--spacing-lg)',
              background: 'rgba(255,255,255,0.2)',
              color: 'white',
              border: '1px solid rgba(255,255,255,0.3)',
              borderRadius: 'var(--radius-md)',
              fontWeight: 600,
              fontSize: '0.875rem',
              cursor: 'pointer',
              transition: 'all var(--transition-fast)',
            }}
          >
            <ArrowUpRight size={18} />
            Transfer
          </button>
        </div>
      </motion.div>

      {/* Sub-Accounts Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        style={{ marginBottom: 'var(--spacing-2xl)' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-lg)' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            Sub-Accounts
          </h2>
          <button
            onClick={onOpenCreate}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              background: 'var(--primary-green)',
              color: 'white',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              fontWeight: 600,
              fontSize: '0.8rem',
              cursor: 'pointer',
              transition: 'all var(--transition-fast)',
              boxShadow: '0 2px 8px rgba(0, 77, 64, 0.3)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--primary-light)';
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 77, 64, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'var(--primary-green)';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 77, 64, 0.3)';
            }}
          >
            <PlusCircle size={16} />
            New Account
          </button>
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: 'var(--spacing-lg)',
        }}>
          {subAccounts.map((account, index) => (
            <SubAccountCard
              key={account.id}
              account={account}
              index={index}
              onSelect={() => onSelectAccount(account)}
            />
          ))}
        </div>
      </motion.div>

      {/* Recent Transactions */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: 'var(--spacing-lg)', color: 'var(--text-primary)' }}>
          Recent Transactions
        </h2>
        <div className="card" style={{
          background: 'var(--surface)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-md)',
          border: '1px solid var(--border)',
          overflow: 'hidden',
        }}>
          {recentTransactions.length === 0 ? (
            <div style={{ padding: 'var(--spacing-2xl)', textAlign: 'center', color: 'var(--text-muted)' }}>
              <Wallet size={48} style={{ marginBottom: 'var(--spacing-md)', opacity: 0.3 }} />
              <p>No transactions yet</p>
            </div>
          ) : (
            <div>
              {recentTransactions.map((transaction, index) => (
                <TransactionRow key={transaction.id} transaction={transaction} index={index} />
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

function TransactionRow({ transaction, index }: { transaction: any; index: number }) {
  const isDeposit = transaction.type === 'deposit';
  const isTransfer = transaction.type === 'transfer';
  const isExpense = transaction.type === 'expense';

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.05 * index }}
      style={{
        padding: 'var(--spacing-lg)',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 'var(--spacing-md)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: 'var(--radius-md)',
          background: isDeposit
            ? 'rgba(16, 185, 129, 0.1)'
            : isTransfer
              ? 'rgba(0, 77, 64, 0.1)'
              : 'rgba(239, 68, 68, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: isDeposit
            ? 'var(--success)'
            : isTransfer
              ? 'var(--primary-green)'
              : 'var(--error)',
          flexShrink: 0,
        }}>
          {isDeposit ? (
            <ArrowDownLeft size={20} />
          ) : isExpense ? (
            <ArrowUpRight size={20} />
          ) : (
            <Wallet size={20} />
          )}
        </div>
        <div>
          <p style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)', marginBottom: 'var(--spacing-xs)' }}>
            {transaction.description}
          </p>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {new Date(transaction.createdAt).toLocaleDateString('en-IN', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
        </div>
      </div>
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <p style={{
          fontSize: '0.938rem',
          fontWeight: 700,
          color: isDeposit ? 'var(--success)' : isExpense ? 'var(--error)' : 'var(--text-primary)',
        }}>
          {isDeposit ? '+' : isExpense ? '-' : ''}{formatCurrency(transaction.amount)}
        </p>
      </div>
    </motion.div>
  );
}

function SubAccountCard({ account, index, onSelect }: { account: SubAccount; index: number; onSelect: () => void }) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const isNegative = account.balance < 0;
  const balanceColor = isNegative ? '#EF4444' : 'var(--primary-green)';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 * index }}
      whileHover={{
        y: -4,
        boxShadow: 'var(--shadow-xl)',
        borderColor: 'var(--primary-green)',
        borderWidth: '2px'
      }}
      onClick={onSelect}
      style={{
        background: 'var(--surface)',
        padding: 'var(--spacing-xl)',
        borderRadius: 'var(--radius-xl)',
        boxShadow: 'var(--shadow-md)',
        border: '1px solid var(--border)',
        cursor: 'pointer',
        transition: 'all var(--transition-base)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div style={{ marginBottom: 'var(--spacing-lg)' }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: 'var(--spacing-sm)', color: 'var(--text-primary)' }}>
          {account.name}
        </h3>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 'var(--spacing-xs)' }}>
            Current Balance
          </p>
          <p style={{
            fontSize: '1.5rem',
            fontWeight: 700,
            color: balanceColor,
            lineHeight: 1.2
          }}>
            {formatCurrency(account.balance)}
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 'var(--spacing-xs)' }}>
            Created
          </p>
          <p style={{
            fontSize: '0.875rem',
            fontWeight: 500,
            color: 'var(--text-secondary)'
          }}>
            {account.createdAt.toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            })}
          </p>
        </div>
      </div>

      {/* Bottom action hint */}
      <div style={{
        marginTop: 'var(--spacing-lg)',
        paddingTop: 'var(--spacing-md)',
        borderTop: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 'var(--spacing-xs)'
      }}>
        <ArrowUpRight size={16} style={{ color: 'var(--text-muted)' }} />
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          Click to view ledger
        </span>
      </div>
    </motion.div>
  );
}
