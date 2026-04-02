import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, AlertTriangle, X, Recycle, ArrowUpRight, ArrowDownLeft, Smartphone, Banknote, Upload, Camera } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { uploadToCloudinary } from '../services/cloudinaryService';
import type { Vendor } from '../types';

export function ScrapView() {
  const { vendors, createVendor, deleteVendor, bookScrapSale, recordVendorPayment, getVendorLedger, subAccounts } = useApp();
  const [showCreateVendor, setShowCreateVendor] = useState(false);
  const [vendorName, setVendorName] = useState('');
  const [vendorPhone, setVendorPhone] = useState('');
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<Vendor | null>(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Scrap Sale Form State
  const [showSaleForm, setShowSaleForm] = useState(false);
  const [saleAmount, setSaleAmount] = useState('');
  const [saleDate, setSaleDate] = useState(new Date().toISOString().split('T')[0]);
  const [saleImageUrl, setSaleImageUrl] = useState<string | undefined>();
  const [saleImageFile, setSaleImageFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Payment Form State
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'cash'>('upi');
  const [upiName, setUpiName] = useState('');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [transferToAccountId, setTransferToAccountId] = useState('');

  // Fullscreen image
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const formatCurrency = (n: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2 }).format(n);
  const formatDate = (d: Date) => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

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

  const handleSaleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVendor) return;
    const parsedAmount = parseFloat(saleAmount);
    if (parsedAmount <= 0) { alert('Enter valid amount'); return; }

    // Upload image to Cloudinary if exists
    let cloudinaryUrl: string | undefined;
    if (saleImageFile) {
      setIsUploading(true);
      cloudinaryUrl = await uploadToCloudinary(saleImageFile) || undefined;
      setIsUploading(false);
    }

    bookScrapSale(selectedVendor.id, `Scrap sold to ${selectedVendor.name}`, parsedAmount, saleDate, undefined, undefined, cloudinaryUrl);
    setSaleAmount('');
    setSaleDate(new Date().toISOString().split('T')[0]);
    setSaleImageUrl(undefined);
    setSaleImageFile(null);
    setShowSaleForm(false);
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVendor) return;
    const parsedAmount = parseFloat(paymentAmount);
    if (parsedAmount <= 0) { alert('Enter valid amount'); return; }
    if (parsedAmount > selectedVendor.balance) { alert(`Insufficient balance. Available: ${formatCurrency(selectedVendor.balance)}`); return; }
    if (paymentMethod === 'cash' && !transferToAccountId) { alert('Please select where to transfer the cash'); return; }
    recordVendorPayment(selectedVendor.id, parsedAmount, paymentMethod, `Payment from ${selectedVendor.name}`, paymentDate, paymentMethod === 'upi' ? upiName : undefined, paymentMethod === 'cash' ? transferToAccountId : undefined);
    setPaymentAmount('');
    setPaymentDate(new Date().toISOString().split('T')[0]);
    setUpiName('');
    setTransferToAccountId('');
    setShowPaymentForm(false);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, setter: (url?: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      setter(URL.createObjectURL(file));
      setSaleImageFile(file);
    }
  };

  // Vendor Ledger View
  if (selectedVendor) {
    const ledgerEntries = getVendorLedger(selectedVendor.id);
    const freshVendor = vendors.find(v => v.id === selectedVendor.id) || selectedVendor;

    return (
      <div style={{ padding: isMobile ? '0.75rem' : '2rem' }}>
        {/* Header */}
        <div style={{ marginBottom: isMobile ? '1rem' : '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <button onClick={() => setSelectedVendor(null)} style={{ background: 'var(--background)', border: '1px solid var(--border)', borderRadius: '8px', padding: '6px 12px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              Back
            </button>
            {isMobile && (
              <div style={{ textAlign: 'right', flex: 1 }}>
                <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Pending</p>
                <p style={{ fontSize: '1.25rem', fontWeight: 700, color: freshVendor.balance > 0 ? '#F59E0B' : 'var(--success)' }}>{formatCurrency(freshVendor.balance)}</p>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '1.1rem', flexShrink: 0 }}>
              {freshVendor.name.charAt(0).toUpperCase()}
            </div>
            <div style={{ flex: 1 }}>
              <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>{freshVendor.name}</h1>
              {freshVendor.phone && <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{freshVendor.phone}</p>}
            </div>
            {!isMobile && (
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Pending</p>
                <p style={{ fontSize: '1.75rem', fontWeight: 700, color: freshVendor.balance > 0 ? '#F59E0B' : 'var(--success)' }}>{formatCurrency(freshVendor.balance)}</p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: '0.5rem' }}>
            <button onClick={() => setShowSaleForm(true)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '10px 16px', background: '#F59E0B', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', width: isMobile ? '100%' : 'auto' }}>
              <Plus size={18} /> Book Scrap
            </button>
            <button onClick={() => setShowPaymentForm(true)} disabled={freshVendor.balance === 0} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '10px 16px', background: freshVendor.balance === 0 ? 'var(--background)' : 'var(--surface)', color: freshVendor.balance === 0 ? 'var(--text-muted)' : 'var(--primary-green)', border: `1px solid ${freshVendor.balance === 0 ? 'var(--border)' : 'var(--primary-green)'}`, borderRadius: '8px', fontWeight: 600, fontSize: '0.85rem', cursor: freshVendor.balance === 0 ? 'not-allowed' : 'pointer', opacity: freshVendor.balance === 0 ? 0.6 : 1, width: isMobile ? '100%' : 'auto' }}>
              <Banknote size={18} /> Record Payment
            </button>
            {freshVendor.balance === 0 && (
              <button onClick={() => setShowDeleteConfirm(freshVendor)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '10px 16px', background: 'var(--surface)', color: 'var(--error)', border: '1px solid var(--error)', borderRadius: '8px', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', width: isMobile ? '100%' : 'auto' }}>
                <X size={16} /> Delete
              </button>
            )}
          </div>
        </div>

        {/* Ledger */}
        <h2 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Transactions</h2>

        {ledgerEntries.length === 0 ? (
          <div style={{ background: 'var(--surface)', padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-muted)', borderRadius: '12px', border: '1px solid var(--border)' }}>
            <p>No transactions yet</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {ledgerEntries.map((entry) => (
              <div key={entry.id} style={{ background: 'var(--surface)', borderRadius: '8px', border: '1px solid var(--border)', padding: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, minWidth: 0 }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '6px', background: entry.kind === 'sale' ? 'rgba(245,158,11,0.1)' : 'rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: entry.kind === 'sale' ? '#F59E0B' : 'var(--success)' }}>
                      {entry.kind === 'sale' ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                    </div>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <p style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-primary)' }}>{entry.description}</p>
                      <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{formatDate(entry.date)}</p>
                    </div>
                  </div>
                  <p style={{ fontSize: '0.85rem', fontWeight: 700, color: entry.kind === 'sale' ? '#F59E0B' : 'var(--success)', flexShrink: 0 }}>
                    {entry.kind === 'sale' ? '+' : '-'}{formatCurrency(entry.kind === 'sale' ? entry.credit : entry.debit)}
                  </p>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.5rem', borderTop: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    <span style={{ fontSize: '0.6rem', padding: '2px 6px', background: entry.kind === 'sale' ? 'rgba(245,158,11,0.1)' : 'rgba(16,185,129,0.1)', color: entry.kind === 'sale' ? '#D97706' : 'var(--success)', borderRadius: '20px', fontWeight: 500 }}>
                      {entry.kind === 'sale' ? 'Sale' : 'Payment'}
                    </span>
                    {entry.kind === 'payment' && entry.paymentMethod && (
                      <span style={{ fontSize: '0.6rem', padding: '2px 6px', background: entry.paymentMethod === 'upi' ? 'rgba(99,102,241,0.1)' : 'rgba(0,77,64,0.1)', color: entry.paymentMethod === 'upi' ? '#6366F1' : 'var(--primary-green)', borderRadius: '20px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '2px' }}>
                        {entry.paymentMethod === 'upi' ? <><Smartphone size={10} /> UPI</> : <><Banknote size={10} /> Cash</>}
                      </span>
                    )}
                    {entry.upiName && <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>{entry.upiName}</span>}
                  </div>
                  <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--primary-green)' }}>Bal: {formatCurrency(entry.runningBalance)}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Sale Form Modal */}
        {showSaleForm && (
          <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <div onClick={() => setShowSaleForm(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)' }} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ position: 'relative', width: 'calc(100% - 32px)', maxWidth: '420px', zIndex: 1001 }}>
              <div style={{ background: 'var(--surface)', padding: '24px', borderRadius: '16px', boxShadow: 'var(--shadow-xl)', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h2 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Book Scrap Sale</h2>
                  <button onClick={() => setShowSaleForm(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px', color: 'var(--text-muted)' }}><X size={20} /></button>
                </div>
                <div style={{ background: 'rgba(245,158,11,0.1)', padding: '10px 12px', borderRadius: '8px', marginBottom: '16px' }}>
                  <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Selling to</p>
                  <p style={{ fontSize: '0.9rem', fontWeight: 600, color: '#D97706' }}>{selectedVendor.name}</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Pending: {formatCurrency(freshVendor.balance)}</p>
                </div>
                <form onSubmit={handleSaleSubmit}>
                  <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '4px' }}>Date</label>
                      <input type="date" value={saleDate} onChange={(e) => setSaleDate(e.target.value)} required style={{ width: '100%', padding: '10px', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '0.85rem', boxSizing: 'border-box' }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '4px' }}>Amount</label>
                      <div style={{ position: 'relative' }}>
                        <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.9rem' }}>₹</span>
                        <input type="number" value={saleAmount} onChange={(e) => setSaleAmount(e.target.value)} placeholder="0.00" min="0.01" step="0.01" required style={{ width: '100%', padding: '10px 10px 10px 26px', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '0.85rem', boxSizing: 'border-box' }} />
                      </div>
                    </div>
                  </div>
                  {/* Photo */}
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '4px' }}>Photo (Optional)</label>
                    <div style={{ border: '2px dashed var(--border)', borderRadius: '8px', padding: '12px', textAlign: 'center' }}>
                      {saleImageUrl ? (
                        <div style={{ position: 'relative' }}>
                          <img src={saleImageUrl} alt="Preview" style={{ maxWidth: '100%', maxHeight: '100px', objectFit: 'contain', borderRadius: '6px' }} />
                          <button type="button" onClick={() => setSaleImageUrl(undefined)} style={{ position: 'absolute', top: '-6px', right: '-6px', width: '22px', height: '22px', borderRadius: '50%', background: 'var(--error)', color: 'white', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}><X size={12} /></button>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                          <label style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '6px 10px', background: 'var(--background)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '0.75rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                            <Upload size={12} /> Upload
                            <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, setSaleImageUrl)} style={{ display: 'none' }} />
                          </label>
                          <label style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '6px 10px', background: '#F59E0B', border: 'none', borderRadius: '8px', fontSize: '0.75rem', color: 'white', cursor: 'pointer' }}>
                            <Camera size={12} /> Camera
                            <input type="file" accept="image/*" capture="environment" onChange={(e) => handleImageUpload(e, setSaleImageUrl)} style={{ display: 'none' }} />
                          </label>
                        </div>
                      )}
                    </div>
                  </div>
                  <button type="submit" disabled={isUploading} style={{ width: '100%', padding: '12px', background: isUploading ? '#9CA3AF' : '#F59E0B', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, fontSize: '0.9rem', cursor: isUploading ? 'not-allowed' : 'pointer' }}>{isUploading ? 'Uploading...' : 'Book Scrap Sale'}</button>
                </form>
              </div>
            </motion.div>
          </div>
        )}

        {/* Payment Form Modal */}
        {showPaymentForm && (
          <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <div onClick={() => setShowPaymentForm(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)' }} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ position: 'relative', width: 'calc(100% - 32px)', maxWidth: '420px', zIndex: 1001 }}>
              <div style={{ background: 'var(--surface)', padding: '24px', borderRadius: '16px', boxShadow: 'var(--shadow-xl)', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h2 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Record Payment</h2>
                  <button onClick={() => setShowPaymentForm(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px', color: 'var(--text-muted)' }}><X size={20} /></button>
                </div>
                <div style={{ background: 'rgba(16,185,129,0.1)', padding: '10px 12px', borderRadius: '8px', marginBottom: '16px' }}>
                  <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Payment from</p>
                  <p style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--primary-green)' }}>{selectedVendor.name}</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Pending: {formatCurrency(freshVendor.balance)}</p>
                </div>
                <form onSubmit={handlePaymentSubmit}>
                  {/* Payment Method */}
                  <div style={{ marginBottom: '12px' }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '6px' }}>Payment Method</label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button type="button" onClick={() => setPaymentMethod('upi')} style={{ flex: 1, padding: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', background: paymentMethod === 'upi' ? '#6366F1' : 'var(--surface)', color: paymentMethod === 'upi' ? 'white' : 'var(--text-secondary)', border: `2px solid ${paymentMethod === 'upi' ? '#6366F1' : 'var(--border)'}`, borderRadius: '8px', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer' }}>
                        <Smartphone size={16} /> UPI
                      </button>
                      <button type="button" onClick={() => setPaymentMethod('cash')} style={{ flex: 1, padding: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', background: paymentMethod === 'cash' ? 'var(--primary-green)' : 'var(--surface)', color: paymentMethod === 'cash' ? 'white' : 'var(--text-secondary)', border: `2px solid ${paymentMethod === 'cash' ? 'var(--primary-green)' : 'var(--border)'}`, borderRadius: '8px', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer' }}>
                        <Banknote size={16} /> Cash
                      </button>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '4px' }}>Date</label>
                      <input type="date" value={paymentDate} onChange={(e) => setPaymentDate(e.target.value)} required style={{ width: '100%', padding: '10px', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '0.85rem', boxSizing: 'border-box' }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '4px' }}>Amount</label>
                      <div style={{ position: 'relative' }}>
                        <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.9rem' }}>₹</span>
                        <input type="number" value={paymentAmount} onChange={(e) => setPaymentAmount(e.target.value)} placeholder="0.00" min="0.01" max={freshVendor.balance} step="0.01" required style={{ width: '100%', padding: '10px 10px 10px 26px', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '0.85rem', boxSizing: 'border-box' }} />
                      </div>
                      <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '2px' }}>Max: {formatCurrency(freshVendor.balance)}</p>
                    </div>
                  </div>
                  {paymentMethod === 'upi' && (
                    <div style={{ marginBottom: '12px' }}>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '4px' }}>UPI Name / ID</label>
                      <input type="text" value={upiName} onChange={(e) => setUpiName(e.target.value)} placeholder="e.g., John@upi" required style={{ width: '100%', padding: '10px', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box' }} />
                    </div>
                  )}
                  {paymentMethod === 'cash' && (
                    <div style={{ marginBottom: '12px' }}>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '4px' }}>Transfer Cash To</label>
                      <select value={transferToAccountId} onChange={(e) => setTransferToAccountId(e.target.value)} required style={{ width: '100%', padding: '10px', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '0.85rem', backgroundColor: 'var(--surface)', boxSizing: 'border-box' }}>
                        <option value="">Select account...</option>
                        <option value="main">Main Account</option>
                        {subAccounts.map((acc) => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
                      </select>
                    </div>
                  )}
                  <button type="submit" style={{ width: '100%', padding: '12px', background: 'var(--primary-green)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer' }}>Record Payment</button>
                </form>
              </div>
            </motion.div>
          </div>
        )}

        {/* Fullscreen Image Viewer */}
        {zoomedImage && (
          <div onClick={() => setZoomedImage(null)} style={{ position: 'fixed', inset: 0, zIndex: 2000, background: 'rgba(0,0,0,0.95)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <button onClick={() => setZoomedImage(null)} style={{ position: 'absolute', top: '16px', right: '16px', background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><X size={24} color="white" /></button>
            <img src={zoomedImage} alt="Full" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '95vw', maxHeight: '90vh', objectFit: 'contain' }} />
          </div>
        )}
      </div>
    );
  }

  // Main Vendors List View
  return (
    <div style={{ padding: isMobile ? '0.75rem' : '2rem' }}>
      <div style={{ marginBottom: isMobile ? '1rem' : '1.5rem' }}>
        <h1 style={{ fontSize: isMobile ? '1.15rem' : '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>Scrap Management</h1>
        <p style={{ fontSize: isMobile ? '0.75rem' : '0.875rem', color: 'var(--text-muted)' }}>Track scrap sales and vendor payments</p>
      </div>

      {/* Summary Card */}
      <div style={{ background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)', borderRadius: '12px', padding: isMobile ? '12px' : '20px', color: 'white', marginBottom: isMobile ? '0.75rem' : '1.5rem', boxShadow: 'var(--shadow-lg)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={{ fontSize: isMobile ? '0.7rem' : '0.875rem', opacity: 0.9, marginBottom: '2px' }}>Total Pending</p>
            <p style={{ fontSize: isMobile ? '1.5rem' : '2rem', fontWeight: 700 }}>{formatCurrency(totalPending)}</p>
          </div>
          <div style={{ width: isMobile ? '40px' : '50px', height: isMobile ? '40px' : '50px', borderRadius: '10px', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Recycle size={isMobile ? 20 : 24} />
          </div>
        </div>
        <p style={{ fontSize: '0.65rem', opacity: 0.8, marginTop: '4px' }}>{vendors.length} vendor{vendors.length !== 1 ? 's' : ''}</p>
      </div>

      {/* Vendors Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
        <h2 style={{ fontSize: isMobile ? '0.95rem' : '1.2rem', fontWeight: 600, color: 'var(--text-primary)' }}>Vendors</h2>
        <button onClick={() => setShowCreateVendor(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px', background: '#F59E0B', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, fontSize: '0.75rem', cursor: 'pointer' }}>
          <Plus size={14} /> Add
        </button>
      </div>

      {vendors.length === 0 ? (
        <div style={{ background: 'var(--surface)', padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-muted)', borderRadius: '12px', border: '1px solid var(--border)' }}>
          <Recycle size={40} style={{ marginBottom: '12px', opacity: 0.3 }} />
          <p>No vendors yet</p>
          <p style={{ fontSize: '0.75rem', marginTop: '4px' }}>Add a vendor to start</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {vendors.map((vendor) => (
            <div key={vendor.id} onClick={() => setSelectedVendor(vendor)} style={{ background: 'var(--surface)', borderRadius: '10px', border: '1px solid var(--border)', padding: isMobile ? '10px' : '14px', cursor: 'pointer' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '8px', background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '0.95rem', flexShrink: 0 }}>
                    {vendor.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>{vendor.name}</p>
                    {vendor.phone && <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{vendor.phone}</p>}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>Pending</p>
                  <p style={{ fontSize: '1rem', fontWeight: 700, color: vendor.balance > 0 ? '#F59E0B' : 'var(--success)' }}>{formatCurrency(vendor.balance)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Vendor Modal */}
      {showCreateVendor && (
        <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div onClick={() => setShowCreateVendor(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)' }} />
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ position: 'relative', width: 'calc(100% - 32px)', maxWidth: '380px', zIndex: 1001 }}>
            <div style={{ background: 'var(--surface)', padding: '24px', borderRadius: '16px', boxShadow: 'var(--shadow-xl)', border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h2 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Add Vendor</h2>
                <button onClick={() => setShowCreateVendor(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px', color: 'var(--text-muted)' }}><X size={20} /></button>
              </div>
              <form onSubmit={handleCreateVendor}>
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '4px' }}>Vendor Name *</label>
                  <input type="text" value={vendorName} onChange={(e) => setVendorName(e.target.value)} placeholder="Enter vendor name" required autoFocus style={{ width: '100%', padding: '10px', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box' }} />
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '4px' }}>Phone (Optional)</label>
                  <input type="tel" value={vendorPhone} onChange={(e) => setVendorPhone(e.target.value)} placeholder="Phone number" style={{ width: '100%', padding: '10px', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box' }} />
                </div>
                <button type="submit" style={{ width: '100%', padding: '12px', background: '#F59E0B', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer' }}>Add Vendor</button>
              </form>
            </div>
          </motion.div>
        </div>
      )}

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div onClick={() => setShowDeleteConfirm(null)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)' }} />
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ position: 'relative', width: 'calc(100% - 32px)', maxWidth: '380px', zIndex: 1001 }}>
            <div style={{ background: 'var(--surface)', padding: '24px', borderRadius: '16px', boxShadow: 'var(--shadow-xl)', border: '1px solid var(--border)', textAlign: 'center' }}>
              <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'rgba(239,68,68,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--error)', margin: '0 auto 16px' }}>
                <AlertTriangle size={24} />
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '8px' }}>Delete Vendor?</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>Delete "{showDeleteConfirm.name}"?</p>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button onClick={() => setShowDeleteConfirm(null)} style={{ flex: 1, padding: '12px', background: 'var(--surface)', color: 'var(--text-primary)', border: '1px solid var(--border)', borderRadius: '8px', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}>Cancel</button>
                <button onClick={handleDeleteVendor} style={{ flex: 1, padding: '12px', background: 'var(--error)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}>Delete</button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
