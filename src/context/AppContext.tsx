import { createContext, useContext, useReducer, useState, type ReactNode } from 'react';
import type { AppState, SubAccount, Expense, Transaction, LedgerEntry, Vendor, ScrapSale, VendorPayment, VendorLedgerEntry } from '../types';
import { sendExpenseNotification, sendDepositNotification, sendScrapSaleNotification, sendScrapPaymentNotification } from '../services/whatsappService';

const generateId = () => Math.random().toString(36).substring(2, 11);

type OnHighValueExpenseCallback = (amount: number, description: string, accountName: string) => void;
type OnHighValueScrapCallback = (amount: number, vendorName: string) => void;

interface AppContextType extends AppState {
  masterBalance: number;
  depositToMaster: (amount: number, source: string) => void;
  createSubAccount: (name: string, initialBalance?: number) => void;
  transferToSubAccount: (fromMaster: boolean, amount: number, accountId?: string) => void;
  transferBetweenAccounts: (fromAccountId: string, toAccountId: string, amount: number) => void;
  transferToMainAccount: (fromAccountId: string, amount: number) => void;
  bookExpense: (accountId: string, description: string, amount: number, category: string, date: string, imageUrl?: string) => void;
  deleteSubAccount: (accountId: string) => void;
  getAccountLedger: (accountId: string) => LedgerEntry[];
  setOnHighValueExpense: (callback: OnHighValueExpenseCallback) => void;
  setOnHighValueScrap: (callback: OnHighValueScrapCallback) => void;
  // Scrap functions
  createVendor: (name: string, phone?: string) => void;
  deleteVendor: (vendorId: string) => void;
  bookScrapSale: (vendorId: string, description: string, amount: number, date: string, weight?: number, rate?: number, imageUrl?: string) => void;
  recordVendorPayment: (vendorId: string, amount: number, paymentMethod: 'upi' | 'cash', description: string, date: string, upiName?: string, transferToAccountId?: string) => void;
  getVendorLedger: (vendorId: string) => VendorLedgerEntry[];
}

const initialState: AppState = {
  deposits: 0,
  subAccounts: [],
  expenses: [],
  transactions: [],
  vendors: [],
  scrapSales: [],
  vendorPayments: [],
};

type Action =
  | { type: 'DEPOSIT_TO_MASTER'; payload: { amount: number; source: string } }
  | { type: 'CREATE_SUB_ACCOUNT'; payload: SubAccount }
  | { type: 'TRANSFER_TO_SUB'; payload: { amount: number; accountId: string; fromMaster: boolean } }
  | { type: 'TRANSFER_BETWEEN_ACCOUNTS'; payload: { amount: number; fromAccountId: string; toAccountId: string } }
  | { type: 'TRANSFER_TO_MAIN'; payload: { amount: number; fromAccountId: string } }
  | { type: 'BOOK_EXPENSE'; payload: Expense }
  | { type: 'ADD_TRANSACTION'; payload: Transaction }
  | { type: 'DELETE_SUB_ACCOUNT'; payload: string }
  // Scrap actions
  | { type: 'CREATE_VENDOR'; payload: Vendor }
  | { type: 'DELETE_VENDOR'; payload: string }
  | { type: 'BOOK_SCRAP_SALE'; payload: ScrapSale }
  | { type: 'RECORD_VENDOR_PAYMENT'; payload: { payment: VendorPayment; transferToAccountId?: string } };

function appReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'DEPOSIT_TO_MASTER':
      return {
        ...state,
        deposits: state.deposits + action.payload.amount,
        transactions: [
          {
            id: generateId(),
            type: 'deposit',
            amount: action.payload.amount,
            description: `Deposit from ${action.payload.source}`,
            createdAt: new Date(),
          },
          ...state.transactions,
        ],
      };

    case 'CREATE_SUB_ACCOUNT':
      return { ...state, subAccounts: [...state.subAccounts, action.payload] };

    case 'TRANSFER_TO_SUB': {
      const { amount, accountId, fromMaster } = action.payload;
      if (fromMaster) {
        const account = state.subAccounts.find(a => a.id === accountId);
        if (!account || state.deposits < amount) return state;
        return {
          ...state,
          deposits: state.deposits - amount,
          subAccounts: state.subAccounts.map(a => a.id === accountId ? { ...a, balance: a.balance + amount } : a),
          transactions: [{
            id: generateId(), type: 'transfer', fromAccount: 'Main Account', toAccount: account.name, amount,
            description: `Transfer from Main Account → ${account.name}`, createdAt: new Date(),
          }, ...state.transactions],
        };
      }
      return state;
    }

    case 'TRANSFER_BETWEEN_ACCOUNTS': {
      const { amount, fromAccountId, toAccountId } = action.payload;
      const fromAccount = state.subAccounts.find(a => a.id === fromAccountId);
      const toAccount = state.subAccounts.find(a => a.id === toAccountId);
      if (!fromAccount || !toAccount || fromAccount.balance < amount || fromAccountId === toAccountId) return state;
      return {
        ...state,
        subAccounts: state.subAccounts.map(a => {
          if (a.id === fromAccountId) return { ...a, balance: a.balance - amount };
          if (a.id === toAccountId) return { ...a, balance: a.balance + amount };
          return a;
        }),
        transactions: [{
          id: generateId(), type: 'transfer', fromAccount: fromAccount.name, toAccount: toAccount.name, amount,
          description: `Transfer from ${fromAccount.name} → ${toAccount.name}`, createdAt: new Date(),
        }, ...state.transactions],
      };
    }

    case 'TRANSFER_TO_MAIN': {
      const { amount, fromAccountId } = action.payload;
      const sourceAccount = state.subAccounts.find(a => a.id === fromAccountId);
      if (!sourceAccount || sourceAccount.balance < amount) return state;
      return {
        ...state,
        deposits: state.deposits + amount,
        subAccounts: state.subAccounts.map(a => a.id === fromAccountId ? { ...a, balance: a.balance - amount } : a),
        transactions: [{
          id: generateId(), type: 'transfer', fromAccount: sourceAccount.name, toAccount: 'Main Account', amount,
          description: `Transfer from ${sourceAccount.name} → Main Account`, createdAt: new Date(),
        }, ...state.transactions],
      };
    }

    case 'BOOK_EXPENSE': {
      const expense = action.payload;
      const targetAccount = state.subAccounts.find(a => a.id === expense.accountId);
      if (!targetAccount || targetAccount.balance < expense.amount) return state;
      return {
        ...state,
        subAccounts: state.subAccounts.map(a => a.id === expense.accountId ? { ...a, balance: a.balance - expense.amount } : a),
        expenses: [expense, ...state.expenses],
        transactions: [{
          id: generateId(), type: 'expense', fromAccount: targetAccount.name, amount: expense.amount,
          description: expense.description, createdAt: new Date(),
        }, ...state.transactions],
      };
    }

    case 'ADD_TRANSACTION':
      return { ...state, transactions: [action.payload, ...state.transactions] };

    case 'DELETE_SUB_ACCOUNT':
      return { ...state, subAccounts: state.subAccounts.filter(a => a.id !== action.payload) };

    // Scrap reducers
    case 'CREATE_VENDOR':
      return { ...state, vendors: [...state.vendors, action.payload] };

    case 'DELETE_VENDOR':
      return { ...state, vendors: state.vendors.filter(v => v.id !== action.payload) };

    case 'BOOK_SCRAP_SALE': {
      const sale = action.payload;
      return {
        ...state,
        scrapSales: [sale, ...state.scrapSales],
        vendors: state.vendors.map(v => v.id === sale.vendorId ? { ...v, balance: v.balance + sale.amount } : v),
      };
    }

    case 'RECORD_VENDOR_PAYMENT': {
      const { payment, transferToAccountId } = action.payload;
      const vendor = state.vendors.find(v => v.id === payment.vendorId);
      if (!vendor || vendor.balance < payment.amount) return state;

      let newState = {
        ...state,
        vendorPayments: [payment, ...state.vendorPayments],
        vendors: state.vendors.map(v => v.id === payment.vendorId ? { ...v, balance: v.balance - payment.amount } : v),
      };

      // If cash payment and transferToAccountId is provided, transfer to that account or main
      if (payment.paymentMethod === 'cash' && transferToAccountId) {
        if (transferToAccountId === 'main') {
          newState.deposits += payment.amount;
          newState.transactions = [{
            id: generateId(), type: 'deposit', amount: payment.amount,
            description: `Scrap payment from ${vendor.name} - ${payment.description}`,
            createdAt: new Date(),
          }, ...newState.transactions];
        } else {
          const targetAccount = newState.subAccounts.find(a => a.id === transferToAccountId);
          if (targetAccount) {
            newState.subAccounts = newState.subAccounts.map(a =>
              a.id === transferToAccountId ? { ...a, balance: a.balance + payment.amount } : a
            );
            newState.transactions = [{
              id: generateId(), type: 'transfer', fromAccount: vendor.name, toAccount: targetAccount.name,
              amount: payment.amount, description: `Scrap payment from ${vendor.name} → ${targetAccount.name}`,
              createdAt: new Date(),
            }, ...newState.transactions];
          }
        }
      }

      return newState;
    }

    default:
      return state;
  }
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const [onHighValueExpense, setOnHighValueExpenseCallback] = useState<OnHighValueExpenseCallback | null>(null);
  const [onHighValueScrap, setOnHighValueScrapCallback] = useState<OnHighValueScrapCallback | null>(null);

  const masterBalance = state.deposits;

  const depositToMaster = (amount: number, source: string) => {
    if (amount > 0 && source.trim()) {
      // Send WhatsApp notification for deposit
      sendDepositNotification({
        amount,
        source: source.trim(),
        date: new Date().toLocaleDateString('en-IN'),
      });
      
      dispatch({ type: 'DEPOSIT_TO_MASTER', payload: { amount, source: source.trim() } });
    }
  };

  const createSubAccount = (name: string, initialBalance: number = 0) => {
    if (name.trim()) {
      const newAccount: SubAccount = { id: generateId(), name: name.trim(), balance: 0, createdAt: new Date() };
      dispatch({ type: 'CREATE_SUB_ACCOUNT', payload: newAccount });
      if (initialBalance > 0) dispatch({ type: 'TRANSFER_TO_SUB', payload: { amount: initialBalance, accountId: newAccount.id, fromMaster: true } });
    }
  };

  const transferToSubAccount = (fromMaster: boolean, amount: number, accountId?: string) => {
    if (amount > 0 && accountId) {
      if (fromMaster && state.deposits < amount) { alert('Insufficient Balance in Main Account'); return; }
      dispatch({ type: 'TRANSFER_TO_SUB', payload: { amount, accountId, fromMaster } });
    }
  };

  const transferBetweenAccounts = (fromAccountId: string, toAccountId: string, amount: number) => {
    if (amount <= 0 || fromAccountId === toAccountId) return;
    const fromAccount = state.subAccounts.find(a => a.id === fromAccountId);
    if (!fromAccount || fromAccount.balance < amount) { alert('Insufficient balance'); return; }
    dispatch({ type: 'TRANSFER_BETWEEN_ACCOUNTS', payload: { amount, fromAccountId, toAccountId } });
  };

  const transferToMainAccount = (fromAccountId: string, amount: number) => {
    if (amount <= 0) return;
    const fromAccount = state.subAccounts.find(a => a.id === fromAccountId);
    if (!fromAccount || fromAccount.balance < amount) { alert('Insufficient balance'); return; }
    dispatch({ type: 'TRANSFER_TO_MAIN', payload: { amount, fromAccountId } });
  };

  const bookExpense = (accountId: string, description: string, amount: number, category: string, date: string, imageUrl?: string) => {
    if (amount > 0 && description.trim()) {
      const targetAccount = state.subAccounts.find(a => a.id === accountId);
      
      // App notification for high value
      if (amount >= 10000 && onHighValueExpense && targetAccount) onHighValueExpense(amount, description, targetAccount.name);
      
      // WhatsApp notification only if amount >= 10000
      if (amount >= 10000 && targetAccount) {
        sendExpenseNotification({
          amount,
          description: description.trim(),
          accountName: targetAccount.name,
          date: date || new Date().toLocaleDateString('en-IN'),
          category,
          imageUrl,
        });
      }
      
      dispatch({ type: 'BOOK_EXPENSE', payload: { id: generateId(), accountId, description: description.trim(), amount, category, date, imageUrl, createdAt: new Date() } });
    }
  };

  const deleteSubAccount = (accountId: string) => {
    const account = state.subAccounts.find(a => a.id === accountId);
    if (account && account.balance === 0) dispatch({ type: 'DELETE_SUB_ACCOUNT', payload: accountId });
  };

  const getAccountLedger = (accountId: string): LedgerEntry[] => {
    const account = state.subAccounts.find(a => a.id === accountId);
    if (!account) return [];
    const creditsFromTransfers = state.transactions.filter(t => t.type === 'transfer' && t.toAccount === account.name).map(t => ({ id: t.id, date: t.createdAt, description: t.description, credit: t.amount, debit: 0, kind: 'transfer' as const, fromAccount: t.fromAccount, toAccount: t.toAccount }));
    const debitsFromTransfers = state.transactions.filter(t => t.type === 'transfer' && t.fromAccount === account.name).map(t => ({ id: t.id, date: t.createdAt, description: t.description, credit: 0, debit: t.amount, kind: 'transfer' as const, fromAccount: t.fromAccount, toAccount: t.toAccount }));
    const accountExpenses = state.expenses.filter(e => e.accountId === accountId).map(e => ({ id: e.id, date: e.createdAt, description: e.description, credit: 0, debit: e.amount, kind: 'expense' as const, category: e.category, imageUrl: e.imageUrl }));
    const allEntries = [...creditsFromTransfers, ...debitsFromTransfers, ...accountExpenses].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    let runningBalance = 0;
    return allEntries.map(entry => { runningBalance += entry.credit - entry.debit; return { ...entry, runningBalance }; });
  };

  const setOnHighValueExpense = (callback: OnHighValueExpenseCallback) => setOnHighValueExpenseCallback(() => callback);
  const setOnHighValueScrap = (callback: OnHighValueScrapCallback) => setOnHighValueScrapCallback(() => callback);

  // Scrap functions
  const createVendor = (name: string, phone?: string) => {
    if (name.trim()) dispatch({ type: 'CREATE_VENDOR', payload: { id: generateId(), name: name.trim(), phone, balance: 0, createdAt: new Date() } });
  };

  const deleteVendor = (vendorId: string) => {
    const vendor = state.vendors.find(v => v.id === vendorId);
    if (vendor && vendor.balance === 0) dispatch({ type: 'DELETE_VENDOR', payload: vendorId });
  };

  const bookScrapSale = (vendorId: string, description: string, amount: number, date: string, weight?: number, rate?: number, imageUrl?: string) => {
    if (amount > 0 && description.trim()) {
      const vendor = state.vendors.find(v => v.id === vendorId);
      
      // App notification for high value
      if (amount >= 10000 && onHighValueScrap && vendor) onHighValueScrap(amount, vendor.name);
      
      // WhatsApp notification for EVERY scrap sale with image
      if (vendor) {
        sendScrapSaleNotification({
          amount,
          vendorName: vendor.name,
          date: date || new Date().toLocaleDateString('en-IN'),
          imageUrl,
        });
      }
      
      dispatch({ type: 'BOOK_SCRAP_SALE', payload: { id: generateId(), vendorId, description: description.trim(), amount, date, weight, rate, imageUrl, createdAt: new Date() } });
    }
  };

  const recordVendorPayment = (vendorId: string, amount: number, paymentMethod: 'upi' | 'cash', description: string, date: string, upiName?: string, transferToAccountId?: string) => {
    if (amount <= 0) return;
    const vendor = state.vendors.find(v => v.id === vendorId);
    if (!vendor || vendor.balance < amount) { alert('Insufficient vendor balance'); return; }
    
    // Send WhatsApp notification for all scrap payments
    sendScrapPaymentNotification({
      amount,
      vendorName: vendor.name,
      paymentMethod,
      upiName: paymentMethod === 'upi' ? upiName : undefined,
      date: date || new Date().toLocaleDateString('en-IN'),
    });
    
    dispatch({ type: 'RECORD_VENDOR_PAYMENT', payload: { payment: { id: generateId(), vendorId, amount, paymentMethod, upiName, description: description.trim(), date, createdAt: new Date() }, transferToAccountId } });
  };

  const getVendorLedger = (vendorId: string): VendorLedgerEntry[] => {
    const sales = state.scrapSales.filter(s => s.vendorId === vendorId).map(s => ({ id: s.id, date: s.createdAt, description: s.description, credit: s.amount, debit: 0, kind: 'sale' as const, imageUrl: s.imageUrl }));
    const payments = state.vendorPayments.filter(p => p.vendorId === vendorId).map(p => ({ id: p.id, date: p.createdAt, description: p.description, credit: 0, debit: p.amount, kind: 'payment' as const, paymentMethod: p.paymentMethod, upiName: p.upiName }));
    const allEntries = [...sales, ...payments].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    let runningBalance = 0;
    return allEntries.map(entry => { runningBalance += entry.credit - entry.debit; return { ...entry, runningBalance }; });
  };

  return (
    <AppContext.Provider value={{
      ...state, masterBalance, depositToMaster, createSubAccount, transferToSubAccount,
      transferBetweenAccounts, transferToMainAccount, bookExpense, deleteSubAccount,
      getAccountLedger, setOnHighValueExpense, setOnHighValueScrap, createVendor, deleteVendor, bookScrapSale,
      recordVendorPayment, getVendorLedger,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
}
