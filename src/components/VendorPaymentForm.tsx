import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Smartphone, Banknote } from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { Vendor } from '../types';

interface VendorPaymentFormProps {
  vendor: Vendor;
  onClose: () => void;
}

export function VendorPaymentForm({ vendor, onClose }: VendorPaymentFormProps) {
  const { recordVendorPayment, subAccounts } = useApp();
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'cash'>('upi');
  const [upiName, setUpiName] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [transferToAccountId, setTransferToAccountId] = useState('');
  const [isMobile] = useState(window.innerWidth < 400);

  const formatCurrency = (n: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2 }).format(n);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (parsedAmount <= 0) { alert('Enter valid amount'); return; }
    if (parsedAmount > vendor.balance) { alert(`Insufficient balance. Available: ${formatCurrency(vendor.balance)}`); return; }

    if (paymentMethod === 'cash' && !transferToAccountId) {
      alert('Please select where to transfer the cash');
      return;
    }

    recordVendorPayment(vendor.id, parsedAmount, paymentMethod, description || `Payment received from ${vendor.name}`, date, paymentMethod === 'upi' ? upiName : undefined, paymentMethod === 'cash' ? transferToAccountId : undefined);
    onClose();
  };

  return (
    <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)' }} />
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ position: 'relative', width: 'calc(100% - 32px)', maxWidth: '480px', maxHeight: 'calc(100vh - 32px)', overflow: 'auto', zIndex: 1001 }}>
        <div style={{ background: 'var(--surface)', padding: isMobile ? '1.25rem' : '32px', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-xl)', border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-lg)' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-primary)' }}>Record Payment</h2>
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 'var(--spacing-sm)', color: 'var(--text-muted)' }}><X size={20} /></button>
          </div>

          <div style={{ background: 'rgba(16,185,129,0.1)', padding: 'var(--spacing-md)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--spacing-lg)' }}>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Payment from</p>
            <p style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--primary-green)' }}>{vendor.name}</p>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Pending: {formatCurrency(vendor.balance)}</p>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Payment Method Toggle */}
            <div style={{ marginBottom: 'var(--spacing-lg)' }}>
              <label className="label">Payment Method *</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button type="button" onClick={() => setPaymentMethod('upi')} style={{
                  flex: 1, padding: 'var(--spacing-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  background: paymentMethod === 'upi' ? '#6366F1' : 'var(--surface)',
                  color: paymentMethod === 'upi' ? 'white' : 'var(--text-secondary)',
                  border: `2px solid ${paymentMethod === 'upi' ? '#6366F1' : 'var(--border)'}`,
                  borderRadius: 'var(--radius-md)', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer',
                }}>
                  <Smartphone size={18} /> UPI
                </button>
                <button type="button" onClick={() => setPaymentMethod('cash')} style={{
                  flex: 1, padding: 'var(--spacing-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  background: paymentMethod === 'cash' ? 'var(--primary-green)' : 'var(--surface)',
                  color: paymentMethod === 'cash' ? 'white' : 'var(--text-secondary)',
                  border: `2px solid ${paymentMethod === 'cash' ? 'var(--primary-green)' : 'var(--border)'}`,
                  borderRadius: 'var(--radius-md)', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer',
                }}>
                  <Banknote size={18} /> Cash
                </button>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-md)' }}>
              <div>
                <label className="label">Date *</label>
                <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required style={{ width: '100%', padding: 'var(--spacing-sm) var(--spacing-md)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', fontSize: '0.875rem', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label className="label">Amount *</label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontWeight: 600 }}>₹</span>
                  <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" min="0.01" max={vendor.balance} step="0.01" required style={{ width: '100%', padding: 'var(--spacing-sm) var(--spacing-md) var(--spacing-sm) 30px', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', fontSize: '0.875rem', boxSizing: 'border-box' }} />
                </div>
                <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px' }}>Max: {formatCurrency(vendor.balance)}</p>
              </div>
            </div>

            {/* UPI Name field */}
            {paymentMethod === 'upi' && (
              <div style={{ marginBottom: 'var(--spacing-md)' }}>
                <label className="label">UPI Name / ID *</label>
                <input type="text" value={upiName} onChange={(e) => setUpiName(e.target.value)} placeholder="e.g., John@upi or PhonePe - John" required={paymentMethod === 'upi'} style={{ width: '100%', padding: 'var(--spacing-sm) var(--spacing-md)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' }} />
              </div>
            )}

            {/* Cash Transfer To field */}
            {paymentMethod === 'cash' && (
              <div style={{ marginBottom: 'var(--spacing-md)' }}>
                <label className="label">Transfer Cash To *</label>
                <select value={transferToAccountId} onChange={(e) => setTransferToAccountId(e.target.value)} required={paymentMethod === 'cash'} style={{ width: '100%', padding: 'var(--spacing-sm) var(--spacing-md)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', fontSize: '0.875rem', backgroundColor: 'var(--surface)', cursor: 'pointer', boxSizing: 'border-box' }}>
                  <option value="">Select account...</option>
                  <option value="main">Main Account</option>
                  {subAccounts.map((acc) => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
                </select>
                <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px' }}>Cash will be added to this account</p>
              </div>
            )}

            <div style={{ marginBottom: 'var(--spacing-lg)' }}>
              <label className="label">Description</label>
              <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} placeholder={`Payment from ${vendor.name}`} style={{ width: '100%', padding: 'var(--spacing-sm) var(--spacing-md)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' }} />
            </div>

            <button type="submit" style={{ width: '100%', padding: 'var(--spacing-md)', background: 'var(--primary-green)', color: 'white', border: 'none', borderRadius: 'var(--radius-md)', fontWeight: 600, fontSize: '0.938rem', cursor: 'pointer' }}>
              Record Payment
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
