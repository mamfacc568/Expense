import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, ArrowRight, ArrowLeftRight } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface AccountManagerProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'create' | 'transfer' | 'deposit';
  selectedAccountId?: string;
}

export function AccountManager({ isOpen, onClose, mode, selectedAccountId }: AccountManagerProps) {
  const { subAccounts, masterBalance, createSubAccount, transferToSubAccount, transferBetweenAccounts, depositToMaster } = useApp();
  const [accountName, setAccountName] = useState('');
  const [initialBalance, setInitialBalance] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  const [targetAccount, setTargetAccount] = useState(selectedAccountId || '');
  const [sourceAccount, setSourceAccount] = useState('');
  const [depositAmount, setDepositAmount] = useState('');
  const [depositSource, setDepositSource] = useState('');
  const [otherSource, setOtherSource] = useState('');
  const [transferType, setTransferType] = useState<'main-to-sub' | 'account-to-account'>('main-to-sub');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  useEffect(() => {
    if (selectedAccountId) {
      setTargetAccount(selectedAccountId);
    }
  }, [selectedAccountId]);

  const depositSources = [
    'Vishu Sir',
    'Other',
  ];

  const handleDeposit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(depositAmount);
    if (amount >= 0 && depositSource.trim()) {
      if (depositSource === 'Other' && !otherSource.trim()) {
        alert('Please specify the source');
        return;
      }
      const source = depositSource === 'Other' ? otherSource : depositSource;
      depositToMaster(amount, source);
      setDepositAmount('');
      setDepositSource('');
      setOtherSource('');
      onClose();
    }
  };

  const handleCreateAccount = (e: React.FormEvent) => {
    e.preventDefault();
    const balance = parseFloat(initialBalance) || 0;
    if (balance > masterBalance) {
      alert('Insufficient master balance');
      return;
    }
    createSubAccount(accountName, balance);
    setAccountName('');
    setInitialBalance('');
    onClose();
  };

  const handleTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(transferAmount);

    if (transferType === 'main-to-sub') {
      if (amount > masterBalance) {
        alert('Insufficient Balance in Main Account\nTransfer not allowed');
        return;
      }
      if (targetAccount) {
        transferToSubAccount(true, amount, targetAccount);
        resetTransferForm();
        onClose();
      }
    } else {
      // Account to Account transfer
      if (!sourceAccount || !targetAccount) {
        alert('Please select both source and target accounts');
        return;
      }
      if (sourceAccount === targetAccount) {
        alert('Cannot transfer to the same account');
        return;
      }
      transferBetweenAccounts(sourceAccount, targetAccount, amount);
      resetTransferForm();
      onClose();
    }
  };

  const resetTransferForm = () => {
    setTransferAmount('');
    setTargetAccount('');
    setSourceAccount('');
    setTransferType('main-to-sub');
  };

  const sourceAccountData = subAccounts.find(a => a.id === sourceAccount);

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
              maxWidth: '480px',
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
                  {mode === 'create' ? 'Create Sub-Account' : mode === 'transfer' ? 'Transfer Funds' : 'Deposit to Master'}
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

              {mode === 'deposit' ? (
                <form onSubmit={handleDeposit}>
                  <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                    <label className="label" htmlFor="depositSource">
                      Source of Funds
                    </label>
                    <select
                      id="depositSource"
                      value={depositSource}
                      onChange={(e) => setDepositSource(e.target.value)}
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
                        color: 'var(--text-primary)',
                      }}
                    >
                      <option value="">Select source...</option>
                      {depositSources.map((source) => (
                        <option key={source} value={source}>
                          {source}
                        </option>
                      ))}
                    </select>
                  </div>

                  {depositSource === 'Other' && (
                    <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                      <label className="label" htmlFor="otherSource">
                        Specify Source <span style={{ color: 'var(--error)' }}>*</span>
                      </label>
                      <input
                        id="otherSource"
                        type="text"
                        className="input"
                        value={otherSource}
                        onChange={(e) => setOtherSource(e.target.value)}
                        placeholder="Enter source name..."
                        required
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          border: '1px solid var(--border)',
                          borderRadius: 'var(--radius-md)',
                          fontSize: '0.875rem',
                          fontFamily: 'var(--font-family)',
                        }}
                      />
                    </div>
                  )}

                  <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                    <label className="label" htmlFor="depositAmount">
                      Amount
                    </label>
                    <div style={{ position: 'relative' }}>
                      <span style={{
                        position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)',
                        color: 'var(--text-muted)', fontWeight: 600, fontSize: '1rem', zIndex: 1,
                      }}>₹</span>
                      <input
                        id="depositAmount"
                        type="number"
                        className="input"
                        value={depositAmount}
                        onChange={(e) => setDepositAmount(e.target.value)}
                        placeholder="Enter amount"
                        min="0"
                        step="0.01"
                        required
                        style={{
                          width: '100%', padding: '12px 16px 12px 36px',
                          border: '1px solid var(--border)', borderRadius: 'var(--radius-md)',
                          fontSize: '0.875rem', fontFamily: 'var(--font-family)',
                        }}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    style={{
                      width: '100%', padding: '14px 24px',
                      background: 'var(--primary-green)', color: 'white', border: 'none',
                      borderRadius: 'var(--radius-md)', fontWeight: 600, fontSize: '0.938rem',
                      cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      gap: 'var(--spacing-sm)', marginTop: 'var(--spacing-md)',
                    }}
                  >
                    <Plus size={18} />
                    Deposit Funds
                  </button>
                </form>
              ) : mode === 'create' ? (
                <form onSubmit={handleCreateAccount}>
                  <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                    <label className="label" htmlFor="accountName">Account Name</label>
                    <input
                      id="accountName"
                      type="text"
                      className="input"
                      value={accountName}
                      onChange={(e) => setAccountName(e.target.value)}
                      placeholder="e.g., Marketing Budget"
                      required
                      style={{
                        width: '100%', padding: 'var(--spacing-sm) var(--spacing-md)',
                        border: '1px solid var(--border)', borderRadius: 'var(--radius-md)',
                        fontSize: '0.875rem', fontFamily: 'var(--font-family)',
                      }}
                    />
                  </div>

                  <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                    <label className="label" htmlFor="initialBalance">Initial Balance (Optional)</label>
                    <div style={{ position: 'relative' }}>
                      <span style={{
                        position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)',
                        color: 'var(--text-muted)', fontWeight: 600, fontSize: '1rem', zIndex: 1,
                      }}>₹</span>
                      <input
                        id="initialBalance"
                        type="number"
                        className="input"
                        value={initialBalance}
                        onChange={(e) => setInitialBalance(e.target.value)}
                        placeholder="Enter amount"
                        min="0"
                        step="0.01"
                        style={{
                          width: '100%', padding: '12px 16px 12px 36px',
                          border: '1px solid var(--border)', borderRadius: 'var(--radius-md)',
                          fontSize: '0.875rem', fontFamily: 'var(--font-family)',
                        }}
                      />
                    </div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 'var(--spacing-xs)' }}>
                      Available Main Account Balance: {formatCurrency(masterBalance)}
                    </p>
                  </div>

                  <button
                    type="submit"
                    style={{
                      width: '100%', padding: 'var(--spacing-md)',
                      background: 'var(--primary-green)', color: 'white', border: 'none',
                      borderRadius: 'var(--radius-md)', fontWeight: 600, fontSize: '0.875rem',
                      cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      gap: 'var(--spacing-sm)',
                    }}
                  >
                    <Plus size={18} />
                    Create Account
                  </button>
                </form>
              ) : (
                <form onSubmit={handleTransfer}>
                  {/* Transfer Type Tabs */}
                  <div style={{
                    display: 'flex',
                    gap: 'var(--spacing-sm)',
                    marginBottom: 'var(--spacing-lg)',
                    background: 'var(--background)',
                    padding: '4px',
                    borderRadius: 'var(--radius-md)',
                  }}>
                    <button
                      type="button"
                      onClick={() => setTransferType('main-to-sub')}
                      style={{
                        flex: 1,
                        padding: 'var(--spacing-sm) var(--spacing-md)',
                        background: transferType === 'main-to-sub' ? 'var(--primary-green)' : 'transparent',
                        color: transferType === 'main-to-sub' ? 'white' : 'var(--text-secondary)',
                        border: 'none',
                        borderRadius: 'var(--radius-sm)',
                        fontWeight: 600,
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                        transition: 'all var(--transition-fast)',
                      }}
                    >
                      Main → Sub
                    </button>
                    <button
                      type="button"
                      onClick={() => setTransferType('account-to-account')}
                      style={{
                        flex: 1,
                        padding: 'var(--spacing-sm) var(--spacing-md)',
                        background: transferType === 'account-to-account' ? 'var(--primary-green)' : 'transparent',
                        color: transferType === 'account-to-account' ? 'white' : 'var(--text-secondary)',
                        border: 'none',
                        borderRadius: 'var(--radius-sm)',
                        fontWeight: 600,
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                        transition: 'all var(--transition-fast)',
                      }}
                    >
                      Account → Account
                    </button>
                  </div>

                  {transferType === 'main-to-sub' ? (
                    <>
                      <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                        <label className="label" htmlFor="targetAccount">Select Sub-Account</label>
                        <select
                          id="targetAccount"
                          value={targetAccount}
                          onChange={(e) => setTargetAccount(e.target.value)}
                          required
                          style={{
                            width: '100%', padding: 'var(--spacing-sm) var(--spacing-md)',
                            border: '1px solid var(--border)', borderRadius: 'var(--radius-md)',
                            fontSize: '0.875rem', fontFamily: 'var(--font-family)',
                            backgroundColor: 'var(--surface)', cursor: 'pointer',
                          }}
                        >
                          <option value="">Select an account...</option>
                          {subAccounts.map((account) => (
                            <option key={account.id} value={account.id}>
                              {account.name} ({formatCurrency(account.balance)})
                            </option>
                          ))}
                        </select>
                      </div>
                    </>
                  ) : (
                    <>
                      <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                        <label className="label" htmlFor="sourceAccount">From Account</label>
                        <select
                          id="sourceAccount"
                          value={sourceAccount}
                          onChange={(e) => setSourceAccount(e.target.value)}
                          required
                          style={{
                            width: '100%', padding: 'var(--spacing-sm) var(--spacing-md)',
                            border: '1px solid var(--border)', borderRadius: 'var(--radius-md)',
                            fontSize: '0.875rem', fontFamily: 'var(--font-family)',
                            backgroundColor: 'var(--surface)', cursor: 'pointer',
                          }}
                        >
                          <option value="">Select source account...</option>
                          {subAccounts.map((account) => (
                            <option key={account.id} value={account.id}>
                              {account.name} ({formatCurrency(account.balance)})
                            </option>
                          ))}
                        </select>
                        {sourceAccountData && (
                          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 'var(--spacing-xs)' }}>
                            Available Balance: {formatCurrency(sourceAccountData.balance)}
                          </p>
                        )}
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 'var(--spacing-lg)' }}>
                        <ArrowLeftRight size={24} style={{ color: 'var(--primary-green)' }} />
                      </div>

                      <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                        <label className="label" htmlFor="targetAccount">To Account</label>
                        <select
                          id="targetAccount"
                          value={targetAccount}
                          onChange={(e) => setTargetAccount(e.target.value)}
                          required
                          style={{
                            width: '100%', padding: 'var(--spacing-sm) var(--spacing-md)',
                            border: '1px solid var(--border)', borderRadius: 'var(--radius-md)',
                            fontSize: '0.875rem', fontFamily: 'var(--font-family)',
                            backgroundColor: 'var(--surface)', cursor: 'pointer',
                          }}
                        >
                          <option value="">Select target account...</option>
                          {subAccounts.filter(a => a.id !== sourceAccount).map((account) => (
                            <option key={account.id} value={account.id}>
                              {account.name} ({formatCurrency(account.balance)})
                            </option>
                          ))}
                        </select>
                      </div>
                    </>
                  )}

                  <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                    <label className="label" htmlFor="transferAmount">Transfer Amount</label>
                    <div style={{ position: 'relative' }}>
                      <span style={{
                        position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)',
                        color: 'var(--text-muted)', fontWeight: 600, fontSize: '1rem', zIndex: 1,
                      }}>₹</span>
                      <input
                        id="transferAmount"
                        type="number"
                        className="input"
                        value={transferAmount}
                        onChange={(e) => setTransferAmount(e.target.value)}
                        placeholder="Enter amount"
                        min="0.01"
                        step="0.01"
                        required
                        style={{
                          width: '100%', padding: '12px 16px 12px 36px',
                          border: '1px solid var(--border)', borderRadius: 'var(--radius-md)',
                          fontSize: '0.875rem', fontFamily: 'var(--font-family)',
                        }}
                      />
                    </div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 'var(--spacing-xs)' }}>
                      {transferType === 'main-to-sub'
                        ? `Available Main Account Balance: ${formatCurrency(masterBalance)}`
                        : sourceAccountData
                          ? `Available Balance: ${formatCurrency(sourceAccountData.balance)}`
                          : 'Select a source account'}
                    </p>
                  </div>

                  <button
                    type="submit"
                    style={{
                      width: '100%', padding: 'var(--spacing-md)',
                      background: 'var(--primary-green)', color: 'white', border: 'none',
                      borderRadius: 'var(--radius-md)', fontWeight: 600, fontSize: '0.875rem',
                      cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      gap: 'var(--spacing-sm)',
                    }}
                  >
                    <ArrowRight size={18} />
                    Transfer Funds
                  </button>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
