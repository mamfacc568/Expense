import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Image as ImageIcon, Tag, FileText, Camera } from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { SubAccount } from '../types';

interface ExpenseFormProps {
  isOpen: boolean;
  onClose: () => void;
  selectedAccount?: SubAccount;
}

export function ExpenseForm({ isOpen, onClose, selectedAccount }: ExpenseFormProps) {
  const { subAccounts, bookExpense } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const [accountId, setAccountId] = useState(selectedAccount?.id || '');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);
  const [imageName, setImageName] = useState('');

  const allCategories = [
    'Supplies', 'Travel', 'Meals', 'Equipment', 'Software',
    'Services', 'Utilities', 'Rent', 'Marketing', 'Other'
  ];

  // Auto-select account when selectedAccount changes or modal opens
  useEffect(() => {
    if (selectedAccount?.id) {
      setAccountId(selectedAccount.id);
    }
  }, [selectedAccount, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    const account = subAccounts.find(a => a.id === accountId);

    if (!account) {
      alert('Please select an account');
      return;
    }

    if (parsedAmount > account.balance) {
      alert('Insufficient balance in selected account');
      return;
    }

    bookExpense(accountId, description, parsedAmount, category, date, imageUrl);
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setDescription('');
    setAmount('');
    setCategory('');
    setDate(new Date().toISOString().split('T')[0]);
    setImageUrl(undefined);
    setImageName('');
    if (!selectedAccount) {
      setAccountId('');
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setImageUrl(objectUrl);
      setImageName(file.name);
    }
  };

  const handleRemoveImage = () => {
    if (imageUrl && imageUrl.startsWith('blob:')) {
      URL.revokeObjectURL(imageUrl);
    }
    setImageUrl(undefined);
    setImageName('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const selectedAccountData = subAccounts.find(a => a.id === accountId);

  return (
    <AnimatePresence>
      {isOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 999,
        }}>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.5)',
            }}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            style={{
              position: 'relative',
              width: 'calc(100% - 32px)',
              maxWidth: '520px',
              maxHeight: 'calc(100vh - 32px)',
              overflow: 'auto',
              zIndex: 1000,
            }}
          >
            <div className="card" style={{
              background: 'var(--surface)',
              padding: '32px',
              borderRadius: 'var(--radius-xl)',
              boxShadow: 'var(--shadow-xl)',
              border: '1px solid var(--border)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-lg)' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Book Expense
                </h2>
                <button
                  onClick={onClose}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 'var(--spacing-sm)',
                    color: 'var(--text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                {/* Sub-Account Selection - Only show if no account is pre-selected */}
                {!selectedAccount && (
                  <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                    <label className="label" htmlFor="expenseAccount">
                      Sub-Account
                    </label>
                    <select
                      id="expenseAccount"
                      value={accountId}
                      onChange={(e) => setAccountId(e.target.value)}
                      required
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-md)',
                        fontSize: '0.875rem',
                        fontFamily: 'var(--font-family)',
                        backgroundColor: 'var(--surface)',
                        cursor: 'pointer',
                      }}
                    >
                      <option value="">Select account...</option>
                      {subAccounts.map((account) => (
                        <option key={account.id} value={account.id}>
                          {account.name} ({formatCurrency(account.balance)})
                        </option>
                      ))}
                    </select>
                    {selectedAccountData && (
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 'var(--spacing-xs)' }}>
                        Available Balance: {formatCurrency(selectedAccountData.balance)}
                      </p>
                    )}
                  </div>
                )}

                {/* Show account info when pre-selected */}
                {selectedAccount && (
                  <div style={{
                    marginBottom: 'var(--spacing-lg)',
                    padding: 'var(--spacing-md)',
                    background: 'var(--background)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border)',
                  }}>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 'var(--spacing-xs)' }}>
                      Booking expense from
                    </p>
                    <p style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                      {selectedAccount.name}
                    </p>
                    <p style={{ fontSize: '0.875rem', color: 'var(--primary-green)', margin: '4px 0 0 0' }}>
                      Available: {formatCurrency(selectedAccount.balance)}
                    </p>
                  </div>
                )}

                {/* Date and Category */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-lg)' }}>
                  <div>
                    <label className="label" htmlFor="expenseDate">
                      Date
                    </label>
                    <input
                      id="expenseDate"
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      required
                      style={{
                        width: '100%',
                        padding: 'var(--spacing-sm) var(--spacing-md)',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-md)',
                        fontSize: '0.875rem',
                        fontFamily: 'var(--font-family)',
                      }}
                    />
                  </div>
                  <div>
                    <label className="label" htmlFor="category">
                      <Tag size={16} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
                      Category
                    </label>
                    <select
                      id="category"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      required
                      style={{
                        width: '100%',
                        padding: 'var(--spacing-sm) var(--spacing-md)',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-md)',
                        fontSize: '0.875rem',
                        fontFamily: 'var(--font-family)',
                        backgroundColor: 'var(--surface)',
                        cursor: 'pointer',
                      }}
                    >
                      <option value="">Select category...</option>
                      {allCategories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Description */}
                <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                  <label className="label" htmlFor="description">
                    <FileText size={16} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
                    Description
                  </label>
                  <textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Enter expense description..."
                    required
                    rows={3}
                    style={{
                      width: '100%',
                      padding: 'var(--spacing-sm) var(--spacing-md)',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '0.875rem',
                      fontFamily: 'var(--font-family)',
                      resize: 'vertical',
                    }}
                  />
                </div>

                {/* Amount */}
                <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                  <label className="label" htmlFor="amount">
                    Amount
                  </label>
                  <div style={{ position: 'relative' }}>
                    <span
                      style={{
                        position: 'absolute',
                        left: '14px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: 'var(--text-muted)',
                        fontWeight: 600,
                        fontSize: '1rem',
                        zIndex: 1,
                      }}
                    >
                      ₹
                    </span>
                    <input
                      id="amount"
                      type="number"
                      className="input"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="Enter amount"
                      min="0.01"
                      step="0.01"
                      required
                      style={{
                        width: '100%',
                        padding: '12px 16px 12px 36px',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-md)',
                        fontSize: '0.875rem',
                        fontFamily: 'var(--font-family)',
                      }}
                    />
                  </div>
                </div>

                {/* Image Upload */}
                <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                  <label className="label">
                    <ImageIcon size={16} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
                    Receipt Image (Optional)
                  </label>
                  <div style={{
                    border: '2px dashed var(--border)',
                    borderRadius: 'var(--radius-md)',
                    padding: 'var(--spacing-lg)',
                    textAlign: 'center',
                    transition: 'all var(--transition-fast)',
                  }}>
                    {imageUrl ? (
                      <div style={{ position: 'relative' }}>
                        <img
                          src={imageUrl}
                          alt="Receipt preview"
                          style={{
                            maxWidth: '100%',
                            maxHeight: '150px',
                            objectFit: 'contain',
                            borderRadius: 'var(--radius-sm)',
                          }}
                        />
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 'var(--spacing-sm)' }}>
                          {imageName}
                        </p>
                        <button
                          type="button"
                          onClick={handleRemoveImage}
                          style={{
                            position: 'absolute',
                            top: '-8px',
                            right: '-8px',
                            width: '24px',
                            height: '24px',
                            borderRadius: 'var(--radius-full)',
                            background: 'var(--error)',
                            color: 'white',
                            border: 'none',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <div>
                        <Upload size={32} style={{ color: 'var(--text-muted)', marginBottom: 'var(--spacing-sm)' }} />
                        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: 'var(--spacing-sm)' }}>
                          Click to upload or capture from camera
                        </p>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          style={{ display: 'none' }}
                          id="imageUpload"
                        />
                        <input
                          ref={cameraInputRef}
                          type="file"
                          accept="image/*"
                          capture="environment"
                          onChange={handleImageUpload}
                          style={{ display: 'none' }}
                          id="cameraCapture"
                        />
                        <div style={{ display: 'flex', gap: 'var(--spacing-sm)', justifyContent: 'center', flexWrap: 'wrap' }}>
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 'var(--spacing-xs)',
                              padding: 'var(--spacing-sm) var(--spacing-md)',
                              background: 'var(--background)',
                              border: '1px solid var(--border)',
                              borderRadius: 'var(--radius-md)',
                              fontSize: '0.875rem',
                              color: 'var(--text-secondary)',
                              cursor: 'pointer',
                            }}
                          >
                            <Upload size={16} />
                            Choose File
                          </button>
                          <button
                            type="button"
                            onClick={() => cameraInputRef.current?.click()}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 'var(--spacing-xs)',
                              padding: 'var(--spacing-sm) var(--spacing-md)',
                              background: 'var(--primary-green)',
                              border: '1px solid var(--primary-green)',
                              borderRadius: 'var(--radius-md)',
                              fontSize: '0.875rem',
                              color: 'white',
                              cursor: 'pointer',
                            }}
                          >
                            <Camera size={16} />
                            Take Photo
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{
                    width: '100%',
                    padding: 'var(--spacing-md)',
                    background: 'var(--primary-green)',
                    color: 'white',
                    border: 'none',
                    borderRadius: 'var(--radius-md)',
                    fontWeight: 600,
                    fontSize: '0.938rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 'var(--spacing-sm)',
                  }}
                >
                  Book Expense
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
