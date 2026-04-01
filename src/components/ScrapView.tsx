import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, AlertTriangle, X, Recycle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ScrapSaleForm } from './ScrapSaleForm';
import { VendorPaymentForm } from './VendorPaymentForm';
import { VendorLedgerView } from './VendorLedgerView';
import type { Vendor } from '../types';

export function ScrapView() {
  const { vendors, createVendor, deleteVendor } = useApp();
  const [showCreateVendor, setShowCreateVendor] = useState(false);
  const [vendorName, setVendorName] = useState('');
  const [vendorPhone, setVendorPhone] = useState('');
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<Vendor | null>(null);
  const [showScrapSaleForm, setShowScrapSaleForm] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2 }).format(amount);
  };

  const totalPending = vendors.reduce((sum, v) => sum + v.balance, 0);

  const handleCreateVendor = (e: React.FormEvent) => {
    e.preventDefault();
    if (vendorName.trim()) {
      createVendor(vendorName.trim(), vendorPhone.trim() || undefined);
      setVendorName('');
      setVendorPhone('');
      setShowCreateVendor(false);
    }
  };

  const handleDeleteVendor = () => {
    if (showDeleteConfirm && showDeleteConfirm.balance === 0) {
      deleteVendor(showDeleteConfirm.id);
      setShowDeleteConfirm(null);
    }
  };

  if (selectedVendor) {
    return (
      <VendorLedgerView
        vendor={selectedVendor}
        onBack={() => setSelectedVendor(null)}
        onBookSale={() => setShowScrapSaleForm(true)}
        onRecordPayment={() => setShowPaymentForm(true)}
      />
    );
  }

  return (
    <div style={{ padding: isMobile ? '0.75rem' : '2rem' }}>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: isMobile ? '1rem' : 'var(--spacing-2xl)' }}>
        <h1 style={{ fontSize: isMobile ? '1.15rem' : '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>Scrap Management</h1>
        <p style={{ fontSize: isMobile ? '0.75rem' : '0.875rem', color: 'var(--text-muted)' }}>Track scrap sales and vendor payments</p>
      </motion.div>

      {/* Summary Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        style={{
          background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
          borderRadius: 'var(--radius-lg)', padding: isMobile ? '0.875rem' : 'var(--spacing-xl)',
          color: 'white', marginBottom: isMobile ? '0.75rem' : 'var(--spacing-2xl)', boxShadow: 'var(--shadow-lg)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={{ fontSize: isMobile ? '0.7rem' : '0.875rem', opacity: 0.9, marginBottom: '2px' }}>Total Pending from Vendors</p>
            <p style={{ fontSize: isMobile ? '1.5rem' : '2rem', fontWeight: 700 }}>{formatCurrency(totalPending)}</p>
          </div>
          <div style={{ width: isMobile ? '40px' : '56px', height: isMobile ? '40px' : '56px', borderRadius: 'var(--radius-md)', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Recycle size={isMobile ? 20 : 28} />
          </div>
        </div>
        <p style={{ fontSize: '0.65rem', opacity: 0.8, marginTop: '4px' }}>{vendors.length} vendor{vendors.length !== 1 ? 's' : ''} registered</p>
      </motion.div>

      {/* Vendors Section */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: isMobile ? '0.5rem' : 'var(--spacing-lg)' }}>
          <h2 style={{ fontSize: isMobile ? '0.95rem' : '1.25rem', fontWeight: 600, color: 'var(--text-primary)' }}>Vendors</h2>
          <button onClick={() => setShowCreateVendor(true)} style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px', padding: isMobile ? '6px 10px' : '8px 16px',
            background: '#F59E0B', color: 'white', border: 'none', borderRadius: 'var(--radius-md)',
            fontWeight: 600, fontSize: isMobile ? '0.75rem' : '0.8rem', cursor: 'pointer',
          }}>
            <Plus size={isMobile ? 14 : 16} /> Add Vendor
          </button>
        </div>

        {vendors.length === 0 ? (
          <div style={{ background: 'var(--surface)', padding: isMobile ? '2rem 1rem' : 'var(--spacing-2xl)', textAlign: 'center', color: 'var(--text-muted)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
            <Recycle size={40} style={{ marginBottom: 'var(--spacing-md)', opacity: 0.3 }} />
            <p style={{ fontSize: '0.9rem' }}>No vendors yet</p>
            <p style={{ fontSize: '0.75rem', marginTop: '4px' }}>Add a vendor to start tracking scrap sales</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {vendors.map((vendor, index) => (
              <motion.div
                key={vendor.id}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}
                onClick={() => setSelectedVendor(vendor)}
                style={{ background: 'var(--surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', padding: isMobile ? '0.75rem' : 'var(--spacing-lg)', cursor: 'pointer' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{
                      width: isMobile ? '36px' : '44px', height: isMobile ? '36px' : '44px', borderRadius: 'var(--radius-md)',
                      background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'white', fontWeight: 700, fontSize: isMobile ? '0.9rem' : '1.1rem', flexShrink: 0,
                    }}>
                      {vendor.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p style={{ fontSize: isMobile ? '0.85rem' : '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>{vendor.name}</p>
                      {vendor.phone && <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{vendor.phone}</p>}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Pending</p>
                    <p style={{ fontSize: isMobile ? '1rem' : '1.25rem', fontWeight: 700, color: vendor.balance > 0 ? '#F59E0B' : 'var(--success)' }}>
                      {formatCurrency(vendor.balance)}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Create Vendor Modal */}
      {showCreateVendor && (
        <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div onClick={() => setShowCreateVendor(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)' }} />
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ position: 'relative', width: 'calc(100% - 32px)', maxWidth: '400px', zIndex: 1001 }}>
            <div style={{ background: 'var(--surface)', padding: isMobile ? '1.25rem' : '32px', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-xl)', border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-lg)' }}>
                <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-primary)' }}>Add Vendor</h2>
                <button onClick={() => setShowCreateVendor(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 'var(--spacing-sm)', color: 'var(--text-muted)' }}><X size={20} /></button>
              </div>
              <form onSubmit={handleCreateVendor}>
                <div style={{ marginBottom: 'var(--spacing-md)' }}>
                  <label className="label">Vendor Name *</label>
                  <input type="text" value={vendorName} onChange={(e) => setVendorName(e.target.value)} placeholder="Enter vendor name" required autoFocus
                    style={{ width: '100%', padding: 'var(--spacing-sm) var(--spacing-md)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' }} />
                </div>
                <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                  <label className="label">Phone (Optional)</label>
                  <input type="tel" value={vendorPhone} onChange={(e) => setVendorPhone(e.target.value)} placeholder="Enter phone number"
                    style={{ width: '100%', padding: 'var(--spacing-sm) var(--spacing-md)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' }} />
                </div>
                <button type="submit" style={{ width: '100%', padding: 'var(--spacing-md)', background: '#F59E0B', color: 'white', border: 'none', borderRadius: 'var(--radius-md)', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer' }}>
                  Add Vendor
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      )}

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div onClick={() => setShowDeleteConfirm(null)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)' }} />
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ position: 'relative', width: 'calc(100% - 32px)', maxWidth: '400px', zIndex: 1001 }}>
            <div style={{ background: 'var(--surface)', padding: isMobile ? '1.5rem' : '32px', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-xl)', border: '1px solid var(--border)', textAlign: 'center' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: 'var(--radius-full)', background: 'rgba(239,68,68,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--error)', margin: '0 auto var(--spacing-lg)' }}>
                <AlertTriangle size={28} />
              </div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 'var(--spacing-sm)' }}>Delete Vendor?</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 'var(--spacing-xl)' }}>Are you sure you want to delete "{showDeleteConfirm.name}"?</p>
              <div style={{ display: 'flex', gap: 'var(--spacing-md)' }}>
                <button onClick={() => setShowDeleteConfirm(null)} style={{ flex: 1, padding: 'var(--spacing-md)', background: 'var(--surface)', color: 'var(--text-primary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer' }}>Cancel</button>
                <button onClick={handleDeleteVendor} style={{ flex: 1, padding: 'var(--spacing-md)', background: 'var(--error)', color: 'white', border: 'none', borderRadius: 'var(--radius-md)', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer' }}>Delete</button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Scrap Sale Form */}
      {showScrapSaleForm && selectedVendor && (
        <ScrapSaleForm vendor={selectedVendor} onClose={() => setShowScrapSaleForm(false)} />
      )}

      {/* Payment Form */}
      {showPaymentForm && selectedVendor && (
        <VendorPaymentForm vendor={selectedVendor} onClose={() => setShowPaymentForm(false)} />
      )}
    </div>
  );
}
