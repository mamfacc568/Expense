import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Plus, ArrowDownLeft, ArrowUpRight, Smartphone, Banknote, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { Vendor } from '../types';

interface VendorLedgerViewProps {
  vendor: Vendor;
  onBack: () => void;
  onBookSale: () => void;
  onRecordPayment: () => void;
}

export function VendorLedgerView({ vendor, onBack, onBookSale, onRecordPayment }: VendorLedgerViewProps) {
  const { getVendorLedger, vendors } = useApp();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const freshVendor = vendors.find(v => v.id === vendor.id) || vendor;
  const ledgerEntries = getVendorLedger(freshVendor.id);
  const totalSales = ledgerEntries.reduce((sum, e) => sum + e.credit, 0);
  const totalPayments = ledgerEntries.reduce((sum, e) => sum + e.debit, 0);

  const formatCurrency = (n: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2 }).format(n);
  const formatDate = (d: Date) => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <div style={{ padding: isMobile ? '0.75rem' : '2rem' }}>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: isMobile ? '1rem' : 'var(--spacing-2xl)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: isMobile ? '0.75rem' : 'var(--spacing-lg)', width: '100%' }}>
          <button onClick={onBack} style={{ background: 'var(--background)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', cursor: 'pointer', padding: isMobile ? '6px 10px' : 'var(--spacing-sm)', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', fontWeight: 500 }}>
            <ArrowLeft size={isMobile ? 16 : 18} /> Back
          </button>
          {isMobile && (
            <div style={{ textAlign: 'right', flex: 1 }}>
              <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Pending</p>
              <p style={{ fontSize: '1.25rem', fontWeight: 700, color: freshVendor.balance > 0 ? '#F59E0B' : 'var(--success)' }}>{formatCurrency(freshVendor.balance)}</p>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: isMobile ? '0.75rem' : 'var(--spacing-lg)' }}>
          <div style={{ width: isMobile ? '36px' : '48px', height: isMobile ? '36px' : '48px', borderRadius: 'var(--radius-md)', background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: isMobile ? '1rem' : '1.25rem', flexShrink: 0 }}>
            {freshVendor.name.charAt(0).toUpperCase()}
          </div>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: isMobile ? '1.1rem' : '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>{freshVendor.name}</h1>
            {freshVendor.phone && <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{freshVendor.phone}</p>}
          </div>
          {!isMobile && (
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Pending Balance</p>
              <p style={{ fontSize: '1.75rem', fontWeight: 700, color: freshVendor.balance > 0 ? '#F59E0B' : 'var(--success)' }}>{formatCurrency(freshVendor.balance)}</p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: '0.5rem' }}>
          <button onClick={onBookSale} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: isMobile ? '0.65rem 1rem' : 'var(--spacing-sm) var(--spacing-lg)', background: '#F59E0B', color: 'white', border: 'none', borderRadius: 'var(--radius-md)', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', width: isMobile ? '100%' : 'auto' }}>
            <Plus size={18} /> Book Scrap Sale
          </button>
          <button onClick={onRecordPayment} disabled={freshVendor.balance === 0} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: isMobile ? '0.65rem 1rem' : 'var(--spacing-sm) var(--spacing-lg)', background: freshVendor.balance === 0 ? 'var(--background)' : 'var(--surface)', color: freshVendor.balance === 0 ? 'var(--text-muted)' : 'var(--primary-green)', border: `1px solid ${freshVendor.balance === 0 ? 'var(--border)' : 'var(--primary-green)'}`, borderRadius: 'var(--radius-md)', fontWeight: 600, fontSize: '0.85rem', cursor: freshVendor.balance === 0 ? 'not-allowed' : 'pointer', opacity: freshVendor.balance === 0 ? 0.6 : 1, width: isMobile ? '100%' : 'auto' }}>
            <Banknote size={18} /> Record Payment
          </button>
        </div>
      </motion.div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(auto-fit, minmax(200px, 1fr))', gap: isMobile ? '0.5rem' : 'var(--spacing-lg)', marginBottom: isMobile ? '1rem' : 'var(--spacing-2xl)' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ background: 'var(--surface)', padding: isMobile ? '0.75rem' : 'var(--spacing-lg)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border)' }}>
          <span style={{ fontSize: isMobile ? '0.65rem' : '0.875rem', color: 'var(--text-muted)' }}>Total Sales</span>
          <p style={{ fontSize: isMobile ? '1rem' : '1.5rem', fontWeight: 700, color: '#F59E0B', marginTop: '4px' }}>{formatCurrency(totalSales)}</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} style={{ background: 'var(--surface)', padding: isMobile ? '0.75rem' : 'var(--spacing-lg)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border)' }}>
          <span style={{ fontSize: isMobile ? '0.65rem' : '0.875rem', color: 'var(--text-muted)' }}>Total Payments</span>
          <p style={{ fontSize: isMobile ? '1rem' : '1.5rem', fontWeight: 700, color: 'var(--success)', marginTop: '4px' }}>{formatCurrency(totalPayments)}</p>
        </motion.div>
      </div>

      {/* Ledger */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
        <h2 style={{ fontSize: isMobile ? '0.95rem' : '1.25rem', fontWeight: 600, marginBottom: isMobile ? '0.5rem' : 'var(--spacing-lg)', color: 'var(--text-primary)' }}>Transactions</h2>

        {ledgerEntries.length === 0 ? (
          <div style={{ background: 'var(--surface)', padding: isMobile ? '2rem 1rem' : 'var(--spacing-2xl)', textAlign: 'center', color: 'var(--text-muted)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
            <p style={{ fontSize: '0.9rem' }}>No transactions yet</p>
            <p style={{ fontSize: '0.75rem', marginTop: '4px' }}>Book a scrap sale or record a payment</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {ledgerEntries.map((entry, index) => (
              <motion.div key={entry.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.03 }}
                style={{ background: 'var(--surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', padding: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, minWidth: 0 }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: 'var(--radius-sm)', background: entry.kind === 'sale' ? 'rgba(245,158,11,0.1)' : 'rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: entry.kind === 'sale' ? '#F59E0B' : 'var(--success)' }}>
                      {entry.kind === 'sale' ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                    </div>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <p style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{entry.description}</p>
                      <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{formatDate(entry.date)}</p>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: '0.5rem' }}>
                    <p style={{ fontSize: '0.85rem', fontWeight: 700, color: entry.kind === 'sale' ? '#F59E0B' : 'var(--success)' }}>
                      {entry.kind === 'sale' ? '+' : '-'}{formatCurrency(entry.kind === 'sale' ? entry.credit : entry.debit)}
                    </p>
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.5rem', borderTop: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    <span style={{ fontSize: '0.6rem', padding: '2px 6px', background: entry.kind === 'sale' ? 'rgba(245,158,11,0.1)' : 'rgba(16,185,129,0.1)', color: entry.kind === 'sale' ? '#D97706' : 'var(--success)', borderRadius: 'var(--radius-full)', fontWeight: 500 }}>
                      {entry.kind === 'sale' ? 'Sale' : 'Payment'}
                    </span>
                    {entry.kind === 'payment' && entry.paymentMethod && (
                      <span style={{ fontSize: '0.6rem', padding: '2px 6px', background: entry.paymentMethod === 'upi' ? 'rgba(99,102,241,0.1)' : 'rgba(0,77,64,0.1)', color: entry.paymentMethod === 'upi' ? '#6366F1' : 'var(--primary-green)', borderRadius: 'var(--radius-full)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '2px' }}>
                        {entry.paymentMethod === 'upi' ? <><Smartphone size={10} /> UPI</> : <><Banknote size={10} /> Cash</>}
                      </span>
                    )}
                    {entry.upiName && <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>{entry.upiName}</span>}
                  </div>
                  <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--primary-green)' }}>Bal: {formatCurrency(entry.runningBalance)}</span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Fullscreen Image Viewer */}
      {zoomedImage && (
        <div onClick={() => setZoomedImage(null)} style={{ position: 'fixed', inset: 0, zIndex: 2000, background: 'rgba(0,0,0,0.95)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
          <button onClick={() => setZoomedImage(null)} style={{ position: 'absolute', top: '16px', right: '16px', background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: 'var(--radius-full)', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 2001 }}>
            <X size={24} color="white" />
          </button>
          <img src={zoomedImage} alt="Full view" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '95vw', maxHeight: '90vh', objectFit: 'contain', borderRadius: 'var(--radius-md)' }} />
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem', marginTop: '12px' }}>Tap anywhere to close</p>
        </div>
      )}
    </div>
  );
}
