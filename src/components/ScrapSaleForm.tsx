import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { X, Upload, Camera } from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { Vendor } from '../types';

interface ScrapSaleFormProps {
  vendor: Vendor;
  onClose: () => void;
}

export function ScrapSaleForm({ vendor, onClose }: ScrapSaleFormProps) {
  const { bookScrapSale } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [weight, setWeight] = useState('');
  const [rate, setRate] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [imageUrl, setImageUrl] = useState<string | undefined>();
  const [isMobile] = useState(window.innerWidth < 400);

  const formatCurrency = (n: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2 }).format(n);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) { setImageUrl(URL.createObjectURL(file)); }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (parsedAmount <= 0) { alert('Enter valid amount'); return; }
    bookScrapSale(vendor.id, description, parsedAmount, date, weight ? parseFloat(weight) : undefined, rate ? parseFloat(rate) : undefined, imageUrl);
    onClose();
  };

  return (
    <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)' }} />
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ position: 'relative', width: 'calc(100% - 32px)', maxWidth: '500px', maxHeight: 'calc(100vh - 32px)', overflow: 'auto', zIndex: 1001 }}>
        <div style={{ background: 'var(--surface)', padding: isMobile ? '1.25rem' : '32px', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-xl)', border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-lg)' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-primary)' }}>Book Scrap Sale</h2>
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 'var(--spacing-sm)', color: 'var(--text-muted)' }}><X size={20} /></button>
          </div>

          <div style={{ background: 'rgba(245,158,11,0.1)', padding: 'var(--spacing-md)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--spacing-lg)' }}>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Selling to</p>
            <p style={{ fontSize: '1rem', fontWeight: 600, color: '#D97706' }}>{vendor.name}</p>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Current pending: {formatCurrency(vendor.balance)}</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-md)' }}>
              <div>
                <label className="label">Date *</label>
                <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required style={{ width: '100%', padding: 'var(--spacing-sm) var(--spacing-md)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', fontSize: '0.875rem', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label className="label">Amount *</label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontWeight: 600 }}>₹</span>
                  <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" min="0.01" step="0.01" required style={{ width: '100%', padding: 'var(--spacing-sm) var(--spacing-md) var(--spacing-sm) 30px', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', fontSize: '0.875rem', boxSizing: 'border-box' }} />
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-md)' }}>
              <div>
                <label className="label">Weight (kg)</label>
                <input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="Optional" min="0" step="0.01" style={{ width: '100%', padding: 'var(--spacing-sm) var(--spacing-md)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', fontSize: '0.875rem', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label className="label">Rate (₹/kg)</label>
                <input type="number" value={rate} onChange={(e) => setRate(e.target.value)} placeholder="Optional" min="0" step="0.01" style={{ width: '100%', padding: 'var(--spacing-sm) var(--spacing-md)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', fontSize: '0.875rem', boxSizing: 'border-box' }} />
              </div>
            </div>

            <div style={{ marginBottom: 'var(--spacing-md)' }}>
              <label className="label">Description *</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="e.g., Iron scrap, Paper, Plastic..." required rows={2} style={{ width: '100%', padding: 'var(--spacing-sm) var(--spacing-md)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', fontSize: '0.875rem', resize: 'vertical', boxSizing: 'border-box' }} />
            </div>

            {/* Image Upload */}
            <div style={{ marginBottom: 'var(--spacing-lg)' }}>
              <label className="label">Photo (Optional)</label>
              <div style={{ border: '2px dashed var(--border)', borderRadius: 'var(--radius-md)', padding: 'var(--spacing-md)', textAlign: 'center' }}>
                {imageUrl ? (
                  <div style={{ position: 'relative' }}>
                    <img src={imageUrl} alt="Preview" style={{ maxWidth: '100%', maxHeight: '120px', objectFit: 'contain', borderRadius: 'var(--radius-sm)' }} />
                    <button type="button" onClick={() => { setImageUrl(undefined); }} style={{ position: 'absolute', top: '-8px', right: '-8px', width: '24px', height: '24px', borderRadius: 'var(--radius-full)', background: 'var(--error)', color: 'white', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={14} /></button>
                  </div>
                ) : (
                  <div>
                    <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
                    <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" onChange={handleImageUpload} style={{ display: 'none' }} />
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                      <button type="button" onClick={() => fileInputRef.current?.click()} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '0.4rem 0.75rem', background: 'var(--background)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', fontSize: '0.8rem', color: 'var(--text-secondary)', cursor: 'pointer' }}><Upload size={14} /> Upload</button>
                      <button type="button" onClick={() => cameraInputRef.current?.click()} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '0.4rem 0.75rem', background: '#F59E0B', border: '1px solid #F59E0B', borderRadius: 'var(--radius-md)', fontSize: '0.8rem', color: 'white', cursor: 'pointer' }}><Camera size={14} /> Camera</button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <button type="submit" style={{ width: '100%', padding: 'var(--spacing-md)', background: '#F59E0B', color: 'white', border: 'none', borderRadius: 'var(--radius-md)', fontWeight: 600, fontSize: '0.938rem', cursor: 'pointer' }}>
              Book Scrap Sale
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
