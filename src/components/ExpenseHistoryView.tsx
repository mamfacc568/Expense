import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { IndianRupee, Image as ImageIcon, X, Search, Filter, ChevronDown, ZoomIn } from 'lucide-react';
import { useApp } from '../context/AppContext';

type DateFilter = 'all' | 'today' | 'week' | 'month';

export function ExpenseHistoryView() {
  const { expenses, subAccounts } = useApp();
  const [selectedExpense, setSelectedExpense] = useState<typeof expenses[0] | null>(null);
  const [dateFilter, setDateFilter] = useState<DateFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [showDateFilterDropdown, setShowDateFilterDropdown] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
    return new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const formatDateTime = (date: string | Date) => {
    return new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
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

  const getAccountName = (accountId: string) => {
    const account = subAccounts.find(a => a.id === accountId);
    return account?.name || 'Unknown';
  };

  const filteredExpenses = expenses
    .filter(e => isWithinDateFilter(e.date || e.createdAt))
    .filter(e => !categoryFilter || e.category === categoryFilter)
    .filter(e => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      const accountName = getAccountName(e.accountId).toLowerCase();
      return e.description.toLowerCase().includes(query) || e.category.toLowerCase().includes(query) || accountName.includes(query);
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const totalExpenses = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);

  const filterButtons: { label: string; value: DateFilter }[] = [
    { label: 'All', value: 'all' },
    { label: 'Today', value: 'today' },
    { label: 'This Week', value: 'week' },
    { label: 'This Month', value: 'month' },
  ];

  const currentFilterLabel = filterButtons.find(b => b.value === dateFilter)?.label || 'Filter';

  return (
    <div style={{ padding: isMobile ? '0.75rem' : '2rem' }}>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: isMobile ? '0.75rem' : 'var(--spacing-2xl)' }}>
        <h1 style={{ fontSize: isMobile ? '1.15rem' : '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>Expense History</h1>
        <p style={{ fontSize: isMobile ? '0.75rem' : '0.875rem', color: 'var(--text-muted)' }}>Track all expenses across your sub-accounts</p>
      </motion.div>

      {/* Summary Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        style={{
          background: 'linear-gradient(135deg, var(--primary-green) 0%, var(--primary-light) 100%)',
          borderRadius: 'var(--radius-lg)', padding: isMobile ? '0.875rem' : 'var(--spacing-xl)',
          color: 'white', marginBottom: isMobile ? '0.75rem' : 'var(--spacing-2xl)',
          boxShadow: 'var(--shadow-lg)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={{ fontSize: isMobile ? '0.7rem' : '0.875rem', opacity: 0.9, marginBottom: '2px' }}>Total Expenses</p>
            <p style={{ fontSize: isMobile ? '1.5rem' : '2rem', fontWeight: 700 }}>{formatCurrency(totalExpenses)}</p>
          </div>
          <div style={{
            width: isMobile ? '40px' : '56px', height: isMobile ? '40px' : '56px',
            borderRadius: 'var(--radius-md)', background: 'rgba(255,255,255,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <IndianRupee size={isMobile ? 20 : 28} />
          </div>
        </div>
        <p style={{ fontSize: '0.65rem', opacity: 0.8, marginTop: '4px' }}>
          {filteredExpenses.length} expense{filteredExpenses.length !== 1 ? 's' : ''} recorded
        </p>
      </motion.div>

      {/* Filters */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ marginBottom: isMobile ? '0.75rem' : 'var(--spacing-xl)' }}>
        {isMobile ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {/* Search */}
            <div style={{ position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Search expenses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%', paddingLeft: '36px', paddingRight: '12px', paddingTop: '0.5rem', paddingBottom: '0.5rem',
                  border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', background: 'var(--surface)',
                  fontSize: '0.8rem', outline: 'none',
                }}
              />
            </div>
            {/* Filter Row */}
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                style={{
                  flex: 1, padding: '0.5rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)',
                  background: 'var(--surface)', fontSize: '0.75rem', outline: 'none',
                }}
              >
                <option value="">All Categories</option>
                {allCategories.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
              </select>
              {/* Date Filter Pills */}
              <div style={{ display: 'flex', gap: '0.25rem', overflowX: 'auto' }}>
                {filterButtons.map((btn) => (
                  <button
                    key={btn.value}
                    onClick={() => setDateFilter(btn.value)}
                    style={{
                      padding: '0.4rem 0.6rem', borderRadius: 'var(--radius-full)', fontSize: '0.65rem', fontWeight: 500,
                      background: dateFilter === btn.value ? 'var(--primary-green)' : 'var(--surface)',
                      color: dateFilter === btn.value ? 'white' : 'var(--text-secondary)',
                      border: `1px solid ${dateFilter === btn.value ? 'var(--primary-green)' : 'var(--border)'}`,
                      whiteSpace: 'nowrap', cursor: 'pointer',
                    }}
                  >
                    {btn.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: 'var(--spacing-md)', flexWrap: 'wrap', alignItems: 'center' }}>
            <form onSubmit={(e) => e.preventDefault()} style={{ position: 'relative', flex: '1', minWidth: '250px' }}>
              <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text" placeholder="Search by description, category, or account..." value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ width: '100%', paddingLeft: '42px', paddingRight: '16px', paddingTop: '10px', paddingBottom: '10px', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', background: 'var(--surface)', fontSize: '0.875rem', outline: 'none' }}
              />
            </form>
            <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} style={{ padding: '10px 16px', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', background: 'var(--surface)', fontSize: '0.875rem', cursor: 'pointer', minWidth: '150px', outline: 'none' }}>
              <option value="">All Categories</option>
              {allCategories.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
            </select>
            <div style={{ position: 'relative' }}>
              <button onClick={() => setShowDateFilterDropdown(!showDateFilterDropdown)} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 16px', background: 'var(--surface)', color: 'var(--text-primary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer', minWidth: '140px', justifyContent: 'space-between' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Filter size={16} />{currentFilterLabel}</span>
                <ChevronDown size={16} style={{ transform: showDateFilterDropdown ? 'rotate(180deg)' : 'rotate(0)' }} />
              </button>
              {showDateFilterDropdown && (
                <>
                  <div style={{ position: 'fixed', inset: 0, zIndex: 40 }} onClick={() => setShowDateFilterDropdown(false)} />
                  <div style={{ position: 'absolute', top: 'calc(100% + 8px)', right: 0, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-lg)', zIndex: 50, minWidth: '160px' }}>
                    {filterButtons.map((btn) => (
                      <button key={btn.value} onClick={() => { setDateFilter(btn.value); setShowDateFilterDropdown(false); }} style={{ width: '100%', padding: '10px 16px', background: dateFilter === btn.value ? 'var(--primary-green)' : 'transparent', color: dateFilter === btn.value ? 'white' : 'var(--text-primary)', border: 'none', fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer' }}>
                        {btn.label}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </motion.div>

      {/* Expenses List */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
        <h2 style={{ fontSize: isMobile ? '0.95rem' : '1.25rem', fontWeight: 600, marginBottom: isMobile ? '0.5rem' : 'var(--spacing-lg)', color: 'var(--text-primary)' }}>
          All Expenses
        </h2>

        {filteredExpenses.length === 0 ? (
          <div style={{ background: 'var(--surface)', padding: isMobile ? '2rem 1rem' : 'var(--spacing-2xl)', textAlign: 'center', color: 'var(--text-muted)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
            <IndianRupee size={40} style={{ marginBottom: 'var(--spacing-md)', opacity: 0.3 }} />
            <p style={{ fontSize: '0.9rem' }}>No expenses found</p>
            <p style={{ fontSize: '0.75rem', marginTop: '4px' }}>{searchQuery || categoryFilter || dateFilter !== 'all' ? 'Try adjusting your filters' : 'Book an expense to see it here'}</p>
          </div>
        ) : isMobile ? (
          // Mobile: Card List
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {filteredExpenses.map((expense, index) => (
              <motion.div
                key={expense.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                onClick={() => setSelectedExpense(expense)}
                style={{ background: 'var(--surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', padding: '0.75rem', cursor: 'pointer' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {expense.description}
                    </p>
                    <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      {formatDate(expense.date || expense.createdAt)}
                    </p>
                  </div>
                  <p style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--error)', flexShrink: 0, marginLeft: '0.5rem' }}>
                    -{formatCurrency(expense.amount)}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.6rem', padding: '2px 6px', background: 'rgba(0, 191, 165, 0.1)', color: 'var(--primary-green)', borderRadius: 'var(--radius-full)', fontWeight: 500 }}>
                    {getAccountName(expense.accountId)}
                  </span>
                  <span style={{ fontSize: '0.6rem', padding: '2px 6px', background: 'rgba(99, 102, 241, 0.1)', color: '#6366F1', borderRadius: 'var(--radius-full)', fontWeight: 500 }}>
                    {expense.category}
                  </span>
                  {expense.imageUrl && <ImageIcon size={12} style={{ color: 'var(--primary-green)' }} />}
                </div>
              </motion.div>
            ))}
            {/* Total */}
            <div style={{ background: 'var(--background)', borderRadius: 'var(--radius-md)', padding: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid var(--border)' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>Total</span>
              <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>{formatCurrency(totalExpenses)}</span>
            </div>
          </div>
        ) : (
          // Desktop: Table
          <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-md)', border: '1px solid var(--border)', overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                <thead>
                  <tr style={{ background: 'var(--background)' }}>
                    <th style={{ padding: 'var(--spacing-md) var(--spacing-lg)', textAlign: 'left', fontWeight: 600, color: 'var(--text-secondary)', borderBottom: '2px solid var(--border)', whiteSpace: 'nowrap' }}>Date</th>
                    <th style={{ padding: 'var(--spacing-md) var(--spacing-lg)', textAlign: 'left', fontWeight: 600, color: 'var(--text-secondary)', borderBottom: '2px solid var(--border)' }}>Description</th>
                    <th style={{ padding: 'var(--spacing-md) var(--spacing-lg)', textAlign: 'left', fontWeight: 600, color: 'var(--text-secondary)', borderBottom: '2px solid var(--border)' }}>Sub-Account</th>
                    <th style={{ padding: 'var(--spacing-md) var(--spacing-lg)', textAlign: 'left', fontWeight: 600, color: 'var(--text-secondary)', borderBottom: '2px solid var(--border)' }}>Category</th>
                    <th style={{ padding: 'var(--spacing-md) var(--spacing-lg)', textAlign: 'right', fontWeight: 600, color: 'var(--text-secondary)', borderBottom: '2px solid var(--border)', whiteSpace: 'nowrap' }}>Amount</th>
                    <th style={{ padding: 'var(--spacing-md) var(--spacing-lg)', textAlign: 'center', fontWeight: 600, color: 'var(--text-secondary)', borderBottom: '2px solid var(--border)' }}>Receipt</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredExpenses.map((expense, index) => (
                    <tr key={expense.id} onClick={() => setSelectedExpense(expense)} style={{ borderBottom: index < filteredExpenses.length - 1 ? '1px solid var(--border)' : 'none', cursor: 'pointer' }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--background)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <td style={{ padding: 'var(--spacing-md) var(--spacing-lg)', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{formatDate(expense.date || expense.createdAt)}</td>
                      <td style={{ padding: 'var(--spacing-md) var(--spacing-lg)', color: 'var(--text-primary)', fontWeight: 500, maxWidth: '250px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{expense.description}</td>
                      <td style={{ padding: 'var(--spacing-md) var(--spacing-lg)' }}><span style={{ padding: '2px 8px', background: 'rgba(0, 191, 165, 0.1)', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem', color: 'var(--primary-green)', fontWeight: 500 }}>{getAccountName(expense.accountId)}</span></td>
                      <td style={{ padding: 'var(--spacing-md) var(--spacing-lg)' }}><span style={{ padding: '2px 8px', background: 'rgba(99, 102, 241, 0.1)', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem', color: '#6366F1', fontWeight: 500 }}>{expense.category}</span></td>
                      <td style={{ padding: 'var(--spacing-md) var(--spacing-lg)', textAlign: 'right', fontWeight: 700, color: 'var(--text-primary)' }}>{formatCurrency(expense.amount)}</td>
                      <td style={{ padding: 'var(--spacing-md) var(--spacing-lg)', textAlign: 'center' }}>{expense.imageUrl ? <ImageIcon size={18} style={{ color: 'var(--primary-green)' }} /> : <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>-</span>}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr style={{ background: 'var(--background)', borderTop: '2px solid var(--border)' }}>
                    <td colSpan={4} style={{ padding: 'var(--spacing-md) var(--spacing-lg)', fontWeight: 700, color: 'var(--text-primary)' }}>Total</td>
                    <td style={{ padding: 'var(--spacing-md) var(--spacing-lg)', textAlign: 'right', fontWeight: 700, color: 'var(--text-primary)', fontSize: '1rem' }}>{formatCurrency(totalExpenses)}</td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}
      </motion.div>

      {/* Expense Detail Popup */}
      {selectedExpense && (
        <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div onClick={() => setSelectedExpense(null)} style={{ position: 'absolute', inset: 0, background: 'rgba(0, 0, 0, 0.5)' }} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
            style={{ position: 'relative', width: 'calc(100% - 32px)', maxWidth: '500px', maxHeight: 'calc(100vh - 32px)', overflow: 'auto', zIndex: 1001 }}
          >
            <div style={{ background: 'var(--surface)', padding: isMobile ? '1.25rem' : '32px', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-xl)', border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--spacing-lg)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
                  <div style={{ width: isMobile ? '40px' : '48px', height: isMobile ? '40px' : '48px', borderRadius: 'var(--radius-md)', background: 'rgba(0, 191, 165, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-green)' }}>
                    <IndianRupee size={isMobile ? 20 : 24} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>Expense Details</h3>
                    <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{formatDateTime(selectedExpense.date || selectedExpense.createdAt)}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedExpense(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 'var(--spacing-sm)', color: 'var(--text-muted)' }}>
                  <X size={20} />
                </button>
              </div>

              <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Description</p>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>{selectedExpense.description}</p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-lg)' }}>
                <div style={{ background: 'var(--background)', padding: '0.75rem', borderRadius: 'var(--radius-md)' }}>
                  <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Amount</p>
                  <p style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--error)' }}>{formatCurrency(selectedExpense.amount)}</p>
                </div>
                <div style={{ background: 'var(--background)', padding: '0.75rem', borderRadius: 'var(--radius-md)' }}>
                  <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Category</p>
                  <span style={{ display: 'inline-block', padding: '2px 8px', background: 'rgba(99, 102, 241, 0.1)', color: '#6366F1', borderRadius: 'var(--radius-full)', fontSize: '0.75rem', fontWeight: 600 }}>
                    {selectedExpense.category}
                  </span>
                </div>
              </div>

              <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Sub-Account</p>
                <span style={{ display: 'inline-block', padding: '4px 10px', background: 'rgba(0, 191, 165, 0.1)', color: 'var(--primary-green)', borderRadius: 'var(--radius-full)', fontSize: '0.8rem', fontWeight: 600 }}>
                  {getAccountName(selectedExpense.accountId)}
                </span>
              </div>

              {selectedExpense.imageUrl && (
                <div>
                  <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Receipt</p>
                  <div
                    onClick={() => setZoomedImage(selectedExpense.imageUrl!)}
                    style={{ borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--border)', cursor: 'pointer', position: 'relative' }}
                  >
                    <img src={selectedExpense.imageUrl} alt="Receipt" style={{ width: '100%', maxHeight: '200px', objectFit: 'cover', display: 'block' }} />
                    <div style={{ position: 'absolute', bottom: '8px', right: '8px', background: 'rgba(0,0,0,0.6)', borderRadius: 'var(--radius-sm)', padding: '4px 8px', display: 'flex', alignItems: 'center', gap: '4px', color: 'white', fontSize: '0.65rem' }}>
                      <ZoomIn size={12} /> Tap to view
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}

      {/* Fullscreen Image Viewer */}
      {zoomedImage && (
        <div onClick={() => setZoomedImage(null)} style={{ position: 'fixed', inset: 0, zIndex: 2000, background: 'rgba(0,0,0,0.95)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
          <button onClick={() => setZoomedImage(null)} style={{ position: 'absolute', top: '16px', right: '16px', background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: 'var(--radius-full)', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 2001 }}>
            <X size={24} color="white" />
          </button>
          <img src={zoomedImage} alt="Receipt" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '95vw', maxHeight: '90vh', objectFit: 'contain', borderRadius: 'var(--radius-md)' }} />
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem', marginTop: '12px' }}>Tap anywhere to close</p>
        </div>
      )}
    </div>
  );
}
