import { useState, useEffect } from 'react';
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
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
    <div style={{ padding: isMobile ? '0.75rem' : '2rem' }}>
      {/* Header Card */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          background: 'linear-gradient(135deg, var(--primary-green) 0%, var(--primary-light) 100%)',
          borderRadius: isMobile ? 'var(--radius-lg)' : 'var(--radius-xl)',
          padding: isMobile ? '1rem' : 'var(--spacing-2xl)',
          color: 'white',
          marginBottom: isMobile ? '1rem' : 'var(--spacing-2xl)',
          boxShadow: 'var(--shadow-xl)',
        }}
      >
        {/* Top Row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: isMobile ? '0.75rem' : 'var(--spacing-lg)' }}>
          <div>
            <h1 style={{ fontSize: isMobile ? '1rem' : '1.125rem', fontWeight: 600, opacity: 0.9 }}>
              MF Cash
            </h1>
            <p style={{ fontSize: isMobile ? '0.75rem' : '0.875rem', opacity: 0.7 }}>Master Dashboard</p>
          </div>
          <div style={{
            width: isMobile ? '36px' : '40px',
            height: isMobile ? '36px' : '40px',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(255,255,255,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <TrendingUp size={isMobile ? 20 : 24} />
          </div>
        </div>

        {/* Balance Section */}
        <div style={{ 
          display: 'flex', 
          flexDirection: isMobile ? 'column' : 'row',
          justifyContent: 'space-between', 
          gap: isMobile ? '1rem' : 'var(--spacing-xl)', 
          marginBottom: isMobile ? '1rem' : 'var(--spacing-xl)' 
        }}>
          {/* Main Account Balance */}
          <div style={{ 
            background: isMobile ? 'rgba(255,255,255,0.1)' : 'transparent',
            padding: isMobile ? '0.75rem' : '0',
            borderRadius: isMobile ? 'var(--radius-md)' : '0',
          }}>
            <p style={{ fontSize: isMobile ? '0.7rem' : '0.875rem', opacity: 0.8, marginBottom: '0.25rem' }}>
              Main Account Balance
            </p>
            <p style={{
              fontSize: isMobile ? '1.75rem' : '2.5rem',
              fontWeight: 700,
              lineHeight: 1.2,
            }}>
              {formatCurrency(masterBalance)}
            </p>
            <p style={{ fontSize: '0.65rem', opacity: 0.6, marginTop: '0.25rem' }}>
              Available for transfer
            </p>
          </div>

          {/* Total Sub-Account Balance */}
          <div style={{ 
            textAlign: isMobile ? 'left' : 'right',
            background: isMobile ? 'rgba(255,255,255,0.1)' : 'transparent',
            padding: isMobile ? '0.75rem' : '0',
            borderRadius: isMobile ? 'var(--radius-md)' : '0',
          }}>
            <p style={{ fontSize: isMobile ? '0.7rem' : '0.875rem', opacity: 0.8, marginBottom: '0.25rem' }}>
              Sub-Accounts Balance
            </p>
            <p style={{
              fontSize: isMobile ? '1.5rem' : '2.5rem',
              fontWeight: 700,
              lineHeight: 1.2,
            }}>
              {formatCurrency(totalSubAccountBalance)}
            </p>
            <p style={{ fontSize: '0.65rem', opacity: 0.6, marginTop: '0.25rem' }}>
              Unspent amount
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: 'var(--spacing-md)', flexWrap: 'wrap' }}>
          <button
            onClick={onOpenDeposit}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 'var(--spacing-sm)',
              padding: isMobile ? '0.5rem 1rem' : 'var(--spacing-sm) var(--spacing-lg)',
              background: 'white',
              color: 'var(--primary-green)',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              fontWeight: 600,
              fontSize: isMobile ? '0.8rem' : '0.875rem',
              cursor: 'pointer',
              flex: isMobile ? 1 : 'none',
              justifyContent: 'center',
            }}
          >
            <Plus size={isMobile ? 16 : 18} />
            Deposit
          </button>
          <button
            onClick={onOpenTransfer}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 'var(--spacing-sm)',
              padding: isMobile ? '0.5rem 1rem' : 'var(--spacing-sm) var(--spacing-lg)',
              background: 'rgba(255,255,255,0.2)',
              color: 'white',
              border: '1px solid rgba(255,255,255,0.3)',
              borderRadius: 'var(--radius-md)',
              fontWeight: 600,
              fontSize: isMobile ? '0.8rem' : '0.875rem',
              cursor: 'pointer',
              flex: isMobile ? 1 : 'none',
              justifyContent: 'center',
            }}
          >
            <ArrowUpRight size={isMobile ? 16 : 18} />
            Transfer
          </button>
        </div>
      </motion.div>

      {/* Sub-Accounts Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        style={{ marginBottom: isMobile ? '1rem' : 'var(--spacing-2xl)' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: isMobile ? '0.75rem' : 'var(--spacing-lg)' }}>
          <h2 style={{ fontSize: isMobile ? '1rem' : '1.25rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            Sub-Accounts
          </h2>
          <button
            onClick={onOpenCreate}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: isMobile ? '6px 12px' : '8px 16px',
              background: 'var(--primary-green)',
              color: 'white',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              fontWeight: 600,
              fontSize: isMobile ? '0.75rem' : '0.8rem',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0, 77, 64, 0.3)',
            }}
          >
            <PlusCircle size={isMobile ? 14 : 16} />
            New
          </button>
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: isMobile ? '0.75rem' : 'var(--spacing-lg)',
        }}>
          {subAccounts.map((account, index) => (
            <SubAccountCard
              key={account.id}
              account={account}
              index={index}
              onSelect={() => onSelectAccount(account)}
              isMobile={isMobile}
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
        <h2 style={{ fontSize: isMobile ? '1rem' : '1.25rem', fontWeight: 600, marginBottom: isMobile ? '0.75rem' : 'var(--spacing-lg)', color: 'var(--text-primary)' }}>
          Recent Transactions
        </h2>
        <div style={{
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
                <TransactionRow key={transaction.id} transaction={transaction} index={index} isMobile={isMobile} />
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

function TransactionRow({ transaction, index, isMobile }: { transaction: any; index: number; isMobile: boolean }) {
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
        padding: isMobile ? '0.75rem' : 'var(--spacing-lg)',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 'var(--spacing-sm)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '0.5rem' : 'var(--spacing-md)', flex: 1, minWidth: 0 }}>
        <div style={{
          width: isMobile ? '32px' : '40px',
          height: isMobile ? '32px' : '40px',
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
            <ArrowDownLeft size={isMobile ? 16 : 20} />
          ) : isExpense ? (
            <ArrowUpRight size={isMobile ? 16 : 20} />
          ) : (
            <Wallet size={isMobile ? 16 : 20} />
          )}
        </div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <p style={{ 
            fontSize: isMobile ? '0.8rem' : '0.875rem', 
            fontWeight: 500, 
            color: 'var(--text-primary)', 
            marginBottom: '2px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            {transaction.description}
          </p>
          <p style={{ fontSize: isMobile ? '0.65rem' : '0.75rem', color: 'var(--text-muted)' }}>
            {new Date(transaction.createdAt).toLocaleDateString('en-IN', {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
        </div>
      </div>
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <p style={{
          fontSize: isMobile ? '0.8rem' : '0.938rem',
          fontWeight: 700,
          color: isDeposit ? 'var(--success)' : isExpense ? 'var(--error)' : 'var(--text-primary)',
        }}>
          {isDeposit ? '+' : isExpense ? '-' : ''}{formatCurrency(transaction.amount)}
        </p>
      </div>
    </motion.div>
  );
}

function SubAccountCard({ account, index, onSelect, isMobile }: { account: SubAccount; index: number; onSelect: () => void; isMobile: boolean }) {
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
      whileHover={!isMobile ? {
        y: -4,
        boxShadow: 'var(--shadow-xl)',
        borderColor: 'var(--primary-green)',
        borderWidth: '2px'
      } : undefined}
      whileTap={{ scale: 0.98 }}
      onClick={onSelect}
      style={{
        background: 'var(--surface)',
        padding: isMobile ? '0.875rem' : 'var(--spacing-xl)',
        borderRadius: isMobile ? 'var(--radius-lg)' : 'var(--radius-xl)',
        boxShadow: 'var(--shadow-md)',
        border: '1px solid var(--border)',
        cursor: 'pointer',
        transition: 'all var(--transition-base)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div style={{ marginBottom: isMobile ? '0.5rem' : 'var(--spacing-lg)' }}>
        <h3 style={{ fontSize: isMobile ? '0.95rem' : '1.125rem', fontWeight: 700, color: 'var(--text-primary)' }}>
          {account.name}
        </h3>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '2px' }}>
            Balance
          </p>
          <p style={{
            fontSize: isMobile ? '1.25rem' : '1.5rem',
            fontWeight: 700,
            color: balanceColor,
            lineHeight: 1.2
          }}>
            {formatCurrency(account.balance)}
          </p>
        </div>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '4px',
          color: 'var(--primary-green)',
          fontSize: '0.7rem',
          fontWeight: 500,
        }}>
          <ArrowUpRight size={14} />
          View
        </div>
      </div>
    </motion.div>
  );
}
