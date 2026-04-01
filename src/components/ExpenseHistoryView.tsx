import { useState } from 'react';
import { motion } from 'framer-motion';
import { IndianRupee, Image as ImageIcon, X, Tag, FileText, Search, Filter, ChevronDown } from 'lucide-react';
import { useApp } from '../context/AppContext';

type DateFilter = 'all' | 'today' | 'week' | 'month';

export function ExpenseHistoryView() {
  const { expenses, subAccounts } = useApp();
  const [selectedExpense, setSelectedExpense] = useState<typeof expenses[0] | null>(null);
  const [dateFilter, setDateFilter] = useState<DateFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [showDateFilterDropdown, setShowDateFilterDropdown] = useState(false);

  const defaultCategories = [
    'Supplies', 'Travel', 'Meals', 'Equipment', 'Software',
    'Services', 'Utilities', 'Rent', 'Marketing', 'Other'
  ];

  const allCategories = [...defaultCategories];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatDateTime = (date: string | Date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const isWithinDateFilter = (date: string | Date): boolean => {
    const expenseDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    switch (dateFilter) {
      case 'today':
        const endOfDay = new Date(today);
        endOfDay.setHours(23, 59, 59, 999);
        return expenseDate >= today && expenseDate <= endOfDay;
      case 'week':
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        return expenseDate >= weekStart;
      case 'month':
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        return expenseDate >= monthStart;
      default:
        return true;
    }
  };

  // Filter and sort expenses
  const filteredExpenses = expenses
    .filter(e => isWithinDateFilter(e.date || e.createdAt))
    .filter(e => !categoryFilter || e.category === categoryFilter)
    .filter(e => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      const accountName = getAccountName(e.accountId).toLowerCase();
      return (
        e.description.toLowerCase().includes(query) ||
        e.category.toLowerCase().includes(query) ||
        accountName.includes(query)
      );
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const totalExpenses = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);

  const getAccountName = (accountId: string) => {
    const account = subAccounts.find(a => a.id === accountId);
    return account?.name || 'Unknown';
  };

  const filterButtons: { label: string; value: DateFilter }[] = [
    { label: 'All', value: 'all' },
    { label: 'Today', value: 'today' },
    { label: 'This Week', value: 'week' },
    { label: 'This Month', value: 'month' },
  ];

  const currentFilterLabel = filterButtons.find(b => b.value === dateFilter)?.label || 'Filter';

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
          Expense History
        </h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          Track all expenses across your sub-accounts
        </p>
      </motion.div>

      {/* Summary Card - Changed to neutral color */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{
          background: 'linear-gradient(135deg, var(--primary-green) 0%, var(--primary-light) 100%)',
          borderRadius: 'var(--radius-xl)',
          padding: 'var(--spacing-xl)',
          color: 'white',
          marginBottom: 'var(--spacing-2xl)',
          boxShadow: 'var(--shadow-lg)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={{ fontSize: '0.875rem', opacity: 0.9, marginBottom: 'var(--spacing-xs)' }}>
              Total Expenses
            </p>
            <p style={{ fontSize: '2rem', fontWeight: 700 }}>
              {formatCurrency(totalExpenses)}
            </p>
          </div>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: 'var(--radius-lg)',
            background: 'rgba(255,255,255,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <IndianRupee size={28} />
          </div>
        </div>
        <p style={{ fontSize: '0.75rem', opacity: 0.8, marginTop: 'var(--spacing-sm)' }}>
          {filteredExpenses.length} expense{filteredExpenses.length !== 1 ? 's' : ''} recorded
        </p>
      </motion.div>

      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        style={{ marginBottom: 'var(--spacing-xl)' }}
      >
        <div style={{ display: 'flex', gap: 'var(--spacing-md)', flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Search Input */}
          <form
            onSubmit={(e) => e.preventDefault()}
            style={{
              position: 'relative',
              flex: '1',
              minWidth: '250px',
            }}
          >
            <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', zIndex: 1, pointerEvents: 'none' }} />
            <input
              type="text"
              placeholder="Search by description, category, or account..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') e.preventDefault(); }}
              style={{
                width: '100%',
                paddingLeft: '42px',
                paddingRight: '16px',
                paddingTop: '10px',
                paddingBottom: '10px',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                background: 'var(--surface)',
                fontSize: '0.875rem',
                outline: 'none',
                transition: 'border-color var(--transition-fast)',
              }}
              onFocus={(e) => e.target.style.borderColor = 'var(--primary-green)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
            />
          </form>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            style={{
              padding: '10px 16px',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              background: 'var(--surface)',
              fontSize: '0.875rem',
              cursor: 'pointer',
              minWidth: '150px',
              outline: 'none',
            }}
          >
            <option value="">All Categories</option>
            {allCategories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          {/* Date Filter Dropdown */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowDateFilterDropdown(!showDateFilterDropdown)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 16px',
                background: 'var(--surface)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.875rem',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
                minWidth: '140px',
                justifyContent: 'space-between',
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Filter size={16} />
                {currentFilterLabel}
              </span>
              <ChevronDown size={16} style={{ transition: 'transform 0.2s', transform: showDateFilterDropdown ? 'rotate(180deg)' : 'rotate(0)' }} />
            </button>

            {showDateFilterDropdown && (
              <>
                <div
                  style={{ position: 'fixed', inset: 0, zIndex: 40 }}
                  onClick={() => setShowDateFilterDropdown(false)}
                />
                <div style={{
                  position: 'absolute',
                  top: 'calc(100% + 8px)',
                  right: 0,
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: 'var(--shadow-lg)',
                  zIndex: 50,
                  minWidth: '160px',
                  overflow: 'hidden',
                }}>
                  {filterButtons.map((btn) => (
                    <button
                      key={btn.value}
                      onClick={() => {
                        setDateFilter(btn.value);
                        setShowDateFilterDropdown(false);
                      }}
                      style={{
                        width: '100%',
                        padding: '10px 16px',
                        background: dateFilter === btn.value ? 'var(--primary-green)' : 'transparent',
                        color: dateFilter === btn.value ? 'white' : 'var(--text-primary)',
                        border: 'none',
                        fontSize: '0.875rem',
                        fontWeight: dateFilter === btn.value ? 600 : 500,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        transition: 'all var(--transition-fast)',
                      }}
                      onMouseEnter={(e) => {
                        if (dateFilter !== btn.value) {
                          e.currentTarget.style.background = 'var(--background)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (dateFilter !== btn.value) {
                          e.currentTarget.style.background = 'transparent';
                        }
                      }}
                    >
                      <Filter size={14} />
                      {btn.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </motion.div>

      {/* Expenses Table */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: 'var(--spacing-lg)', color: 'var(--text-primary)' }}>
          All Expenses
        </h2>
        <div className="card" style={{
          background: 'var(--surface)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-md)',
          border: '1px solid var(--border)',
          overflow: 'hidden',
        }}>
          {filteredExpenses.length === 0 ? (
            <div style={{ padding: 'var(--spacing-2xl)', textAlign: 'center', color: 'var(--text-muted)' }}>
              <IndianRupee size={48} style={{ marginBottom: 'var(--spacing-md)', opacity: 0.3 }} />
              <p>No expenses found</p>
              <p style={{ fontSize: '0.75rem', marginTop: 'var(--spacing-sm)' }}>
                {searchQuery || categoryFilter || dateFilter !== 'all'
                  ? 'Try adjusting your filters'
                  : 'Book an expense from a sub-account to see it here'}
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
                      padding: 'var(--spacing-md) var(--spacing-lg)', textAlign: 'left',
                      fontWeight: 600, color: 'var(--text-secondary)', borderBottom: '2px solid var(--border)',
                    }}>Sub-Account</th>
                    <th style={{
                      padding: 'var(--spacing-md) var(--spacing-lg)', textAlign: 'left',
                      fontWeight: 600, color: 'var(--text-secondary)', borderBottom: '2px solid var(--border)',
                    }}>Category</th>
                    <th style={{
                      padding: 'var(--spacing-md) var(--spacing-lg)', textAlign: 'right',
                      fontWeight: 600, color: 'var(--text-secondary)', borderBottom: '2px solid var(--border)',
                      whiteSpace: 'nowrap',
                    }}>Amount</th>
                    <th style={{
                      padding: 'var(--spacing-md) var(--spacing-lg)', textAlign: 'center',
                      fontWeight: 600, color: 'var(--text-secondary)', borderBottom: '2px solid var(--border)',
                      whiteSpace: 'nowrap',
                    }}>Receipt</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredExpenses.map((expense, index) => (
                    <tr
                      key={expense.id}
                      onClick={() => setSelectedExpense(expense)}
                      style={{
                        borderBottom: index < filteredExpenses.length - 1 ? '1px solid var(--border)' : 'none',
                        cursor: 'pointer',
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
                        {formatDate(expense.date || expense.createdAt)}
                      </td>
                      <td style={{
                        padding: 'var(--spacing-md) var(--spacing-lg)',
                        color: 'var(--text-primary)',
                        fontWeight: 500,
                        maxWidth: '250px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}>
                        {expense.description}
                      </td>
                      <td style={{
                        padding: 'var(--spacing-md) var(--spacing-lg)',
                        color: 'var(--text-secondary)',
                      }}>
                        <span style={{
                          display: 'inline-block',
                          padding: '2px 8px',
                          background: 'rgba(0, 191, 165, 0.1)',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.8rem',
                          color: 'var(--primary-green)',
                          fontWeight: 500,
                        }}>
                          {getAccountName(expense.accountId)}
                        </span>
                      </td>
                      <td style={{
                        padding: 'var(--spacing-md) var(--spacing-lg)',
                        color: 'var(--text-secondary)',
                      }}>
                        <span style={{
                          display: 'inline-block',
                          padding: '2px 8px',
                          background: 'rgba(99, 102, 241, 0.1)',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.8rem',
                          color: '#6366F1',
                          fontWeight: 500,
                        }}>
                          {expense.category}
                        </span>
                      </td>
                      <td style={{
                        padding: 'var(--spacing-md) var(--spacing-lg)',
                        textAlign: 'right',
                        fontWeight: 700,
                        color: 'var(--text-primary)',
                      }}>
                        {formatCurrency(expense.amount)}
                      </td>
                      <td style={{
                        padding: 'var(--spacing-md) var(--spacing-lg)',
                        textAlign: 'center',
                      }}>
                        {expense.imageUrl ? (
                          <ImageIcon size={18} style={{ color: 'var(--primary-green)' }} />
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr style={{ background: 'var(--background)', borderTop: '2px solid var(--border)' }}>
                    <td colSpan={4} style={{
                      padding: 'var(--spacing-md) var(--spacing-lg)',
                      fontWeight: 700,
                      color: 'var(--text-primary)',
                    }}>
                      Total
                    </td>
                    <td style={{
                      padding: 'var(--spacing-md) var(--spacing-lg)',
                      textAlign: 'right',
                      fontWeight: 700,
                      color: 'var(--text-primary)',
                      fontSize: '1rem',
                    }}>
                      {formatCurrency(totalExpenses)}
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>
      </motion.div>

      {/* Expense Detail Popup */}
      {selectedExpense && (
        <div style={{
          position: 'fixed', inset: 0, display: 'flex', alignItems: 'center',
          justifyContent: 'center', zIndex: 1000,
        }}>
          <div
            onClick={() => setSelectedExpense(null)}
            style={{ position: 'absolute', inset: 0, background: 'rgba(0, 0, 0, 0.5)' }}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
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
                    background: 'rgba(0, 191, 165, 0.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'var(--primary-green)',
                  }}>
                    <IndianRupee size={24} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 'var(--spacing-xs)' }}>
                      Expense Details
                    </h3>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {formatDateTime(selectedExpense.date || selectedExpense.createdAt)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedExpense(null)}
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
                  {selectedExpense.description}
                </p>
              </div>

              {/* Amount & Category */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-lg)', marginBottom: 'var(--spacing-lg)' }}>
                <div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 'var(--spacing-xs)' }}>
                    Amount
                  </p>
                  <p style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {formatCurrency(selectedExpense.amount)}
                  </p>
                </div>
                <div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 'var(--spacing-xs)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Tag size={14} /> Category
                  </p>
                  <span style={{
                    display: 'inline-block', padding: '4px 12px',
                    background: 'rgba(99, 102, 241, 0.1)', color: '#6366F1',
                    borderRadius: 'var(--radius-full)', fontSize: '0.8rem', fontWeight: 600,
                  }}>
                    {selectedExpense.category}
                  </span>
                </div>
              </div>

              {/* Sub-Account */}
              <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 'var(--spacing-xs)' }}>
                  Sub-Account
                </p>
                <span style={{
                  display: 'inline-block', padding: '4px 12px',
                  background: 'rgba(0, 191, 165, 0.1)', color: 'var(--primary-green)',
                  borderRadius: 'var(--radius-full)', fontSize: '0.85rem', fontWeight: 600,
                }}>
                  {getAccountName(selectedExpense.accountId)}
                </span>
              </div>

              {/* Receipt Image */}
              {selectedExpense.imageUrl && (
                <div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 'var(--spacing-xs)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <ImageIcon size={14} /> Receipt Image
                  </p>
                  <div style={{
                    borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--border)',
                  }}>
                    <img
                      src={selectedExpense.imageUrl}
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
    </div>
  );
}
