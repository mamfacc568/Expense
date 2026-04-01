import { createContext, useContext, useReducer, useState, type ReactNode } from 'react';
import type { AppState, SubAccount, Expense, Transaction, LedgerEntry } from '../types';

const generateId = () => Math.random().toString(36).substring(2, 11);

// Notification callback type
type OnHighValueExpenseCallback = (amount: number, description: string, accountName: string) => void;

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
}

const initialState: AppState = {
  deposits: 0,
  subAccounts: [],
  expenses: [],
  transactions: [],
};

type Action =
  | { type: 'DEPOSIT_TO_MASTER'; payload: { amount: number; source: string } }
  | { type: 'CREATE_SUB_ACCOUNT'; payload: SubAccount }
  | { type: 'TRANSFER_TO_SUB'; payload: { amount: number; accountId: string; fromMaster: boolean } }
  | { type: 'TRANSFER_BETWEEN_ACCOUNTS'; payload: { amount: number; fromAccountId: string; toAccountId: string } }
  | { type: 'TRANSFER_TO_MAIN'; payload: { amount: number; fromAccountId: string } }
  | { type: 'BOOK_EXPENSE'; payload: Expense }
  | { type: 'ADD_TRANSACTION'; payload: Transaction }
  | { type: 'DELETE_SUB_ACCOUNT'; payload: string };

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
      return {
        ...state,
        subAccounts: [...state.subAccounts, action.payload],
      };

    case 'TRANSFER_TO_SUB':
      const { amount, accountId, fromMaster } = action.payload;
      if (fromMaster) {
        const account = state.subAccounts.find(a => a.id === accountId);
        if (!account) return state;

        // Check if Main Account (deposits) has enough balance
        if (state.deposits < amount) return state;

        return {
          ...state,
          deposits: state.deposits - amount,
          subAccounts: state.subAccounts.map(a =>
            a.id === accountId ? { ...a, balance: a.balance + amount } : a
          ),
          transactions: [
            {
              id: generateId(),
              type: 'transfer',
              fromAccount: 'Main Account',
              toAccount: account.name,
              amount,
              description: `Transfer from Main Account → ${account.name}`,
              createdAt: new Date(),
            },
            ...state.transactions,
          ],
        };
      }
      return state;

    case 'TRANSFER_BETWEEN_ACCOUNTS':
      const { amount: transferAmount, fromAccountId, toAccountId } = action.payload;
      const fromAccount = state.subAccounts.find(a => a.id === fromAccountId);
      const toAccount = state.subAccounts.find(a => a.id === toAccountId);

      if (!fromAccount || !toAccount) return state;
      if (fromAccount.balance < transferAmount) return state;
      if (fromAccountId === toAccountId) return state;

      return {
        ...state,
        subAccounts: state.subAccounts.map(a => {
          if (a.id === fromAccountId) return { ...a, balance: a.balance - transferAmount };
          if (a.id === toAccountId) return { ...a, balance: a.balance + transferAmount };
          return a;
        }),
        transactions: [
          {
            id: generateId(),
            type: 'transfer',
            fromAccount: fromAccount.name,
            toAccount: toAccount.name,
            amount: transferAmount,
            description: `Transfer from ${fromAccount.name} → ${toAccount.name}`,
            createdAt: new Date(),
          },
          ...state.transactions,
        ],
      };

    case 'TRANSFER_TO_MAIN':
      const { amount: toMainAmount, fromAccountId: sourceAccountId } = action.payload;
      const sourceAccount = state.subAccounts.find(a => a.id === sourceAccountId);

      if (!sourceAccount) return state;
      if (sourceAccount.balance < toMainAmount) return state;

      return {
        ...state,
        deposits: state.deposits + toMainAmount,
        subAccounts: state.subAccounts.map(a =>
          a.id === sourceAccountId ? { ...a, balance: a.balance - toMainAmount } : a
        ),
        transactions: [
          {
            id: generateId(),
            type: 'transfer',
            fromAccount: sourceAccount.name,
            toAccount: 'Main Account',
            amount: toMainAmount,
            description: `Transfer from ${sourceAccount.name} → Main Account`,
            createdAt: new Date(),
          },
          ...state.transactions,
        ],
      };

    case 'BOOK_EXPENSE':
      const expense = action.payload;
      const targetAccount = state.subAccounts.find(a => a.id === expense.accountId);
      if (!targetAccount || targetAccount.balance < expense.amount) return state;

      return {
        ...state,
        subAccounts: state.subAccounts.map(a =>
          a.id === expense.accountId ? { ...a, balance: a.balance - expense.amount } : a
        ),
        expenses: [expense, ...state.expenses],
        transactions: [
          {
            id: generateId(),
            type: 'expense',
            fromAccount: targetAccount.name,
            amount: expense.amount,
            description: expense.description,
            createdAt: new Date(),
          },
          ...state.transactions,
        ],
      };

    case 'ADD_TRANSACTION':
      return {
        ...state,
        transactions: [action.payload, ...state.transactions],
      };

    case 'DELETE_SUB_ACCOUNT':
      return {
        ...state,
        subAccounts: state.subAccounts.filter(a => a.id !== action.payload),
      };

    default:
      return state;
  }
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const [onHighValueExpense, setOnHighValueExpenseCallback] = useState<OnHighValueExpenseCallback | null>(null);

  const masterBalance = state.deposits;

  const depositToMaster = (amount: number, source: string) => {
    if (amount > 0 && source.trim()) dispatch({ type: 'DEPOSIT_TO_MASTER', payload: { amount, source: source.trim() } });
  };

  const createSubAccount = (name: string, initialBalance: number = 0) => {
    if (name.trim()) {
      const newAccount: SubAccount = {
        id: generateId(),
        name: name.trim(),
        balance: 0,
        createdAt: new Date(),
      };
      dispatch({ type: 'CREATE_SUB_ACCOUNT', payload: newAccount });

      if (initialBalance > 0) {
        dispatch({
          type: 'TRANSFER_TO_SUB',
          payload: { amount: initialBalance, accountId: newAccount.id, fromMaster: true },
        });
      }
    }
  };

  const transferToSubAccount = (fromMaster: boolean, amount: number, accountId?: string) => {
    if (amount > 0 && accountId) {
      if (fromMaster && state.deposits < amount) {
        alert('Insufficient Balance in Main Account\nTransfer not allowed');
        return;
      }
      dispatch({ type: 'TRANSFER_TO_SUB', payload: { amount, accountId, fromMaster } });
    }
  };

  const transferBetweenAccounts = (fromAccountId: string, toAccountId: string, amount: number) => {
    if (amount <= 0) return;
    if (fromAccountId === toAccountId) {
      alert('Cannot transfer to the same account');
      return;
    }

    const fromAccount = state.subAccounts.find(a => a.id === fromAccountId);
    if (!fromAccount) return;

    if (fromAccount.balance < amount) {
      alert(`Insufficient balance in ${fromAccount.name}\nAvailable: ₹${fromAccount.balance.toLocaleString('en-IN')}`);
      return;
    }

    dispatch({ type: 'TRANSFER_BETWEEN_ACCOUNTS', payload: { amount, fromAccountId, toAccountId } });
  };

  const transferToMainAccount = (fromAccountId: string, amount: number) => {
    if (amount <= 0) return;

    const fromAccount = state.subAccounts.find(a => a.id === fromAccountId);
    if (!fromAccount) return;

    if (fromAccount.balance < amount) {
      alert(`Insufficient balance in ${fromAccount.name}\nAvailable: ₹${fromAccount.balance.toLocaleString('en-IN')}`);
      return;
    }

    dispatch({ type: 'TRANSFER_TO_MAIN', payload: { amount, fromAccountId } });
  };

  const bookExpense = (
    accountId: string,
    description: string,
    amount: number,
    category: string,
    date: string,
    imageUrl?: string
  ) => {
    if (amount > 0 && description.trim()) {
      const targetAccount = state.subAccounts.find(a => a.id === accountId);
      
      // Trigger notification for high-value expenses (>= 10000)
      if (amount >= 10000 && onHighValueExpense && targetAccount) {
        onHighValueExpense(amount, description, targetAccount.name);
      }
      
      const newExpense: Expense = {
        id: generateId(),
        accountId,
        description: description.trim(),
        amount,
        category,
        date,
        imageUrl,
        createdAt: new Date(),
      };
      dispatch({ type: 'BOOK_EXPENSE', payload: newExpense });
    }
  };

  const deleteSubAccount = (accountId: string) => {
    const account = state.subAccounts.find(a => a.id === accountId);
    if (account && account.balance === 0) {
      dispatch({ type: 'DELETE_SUB_ACCOUNT', payload: accountId });
    }
  };

  const getAccountLedger = (accountId: string): LedgerEntry[] => {
    const account = state.subAccounts.find(a => a.id === accountId);
    if (!account) return [];

    // Get transfers TO this account (credit)
    const creditsFromTransfers = state.transactions
      .filter(t => t.type === 'transfer' && t.toAccount === account.name)
      .map(t => ({
        id: t.id,
        date: t.createdAt,
        description: t.description,
        credit: t.amount,
        debit: 0,
        kind: 'transfer' as const,
        fromAccount: t.fromAccount,
        toAccount: t.toAccount,
      }));

    // Get transfers FROM this account (debit) - when this account sends money to another
    const debitsFromTransfers = state.transactions
      .filter(t => t.type === 'transfer' && t.fromAccount === account.name)
      .map(t => ({
        id: t.id,
        date: t.createdAt,
        description: t.description,
        credit: 0,
        debit: t.amount,
        kind: 'transfer' as const,
        fromAccount: t.fromAccount,
        toAccount: t.toAccount,
      }));

    // Get expenses FROM this account
    const accountExpenses = state.expenses
      .filter(e => e.accountId === accountId)
      .map(e => ({
        id: e.id,
        date: e.createdAt,
        description: e.description,
        credit: 0,
        debit: e.amount,
        kind: 'expense' as const,
        category: e.category,
        imageUrl: e.imageUrl,
      }));

    // Combine and sort by date
    const allEntries = [...creditsFromTransfers, ...debitsFromTransfers, ...accountExpenses]
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Calculate running balance
    let runningBalance = 0;
    return allEntries.map(entry => {
      runningBalance += entry.credit - entry.debit;
      return { ...entry, runningBalance };
    });
  };

  const setOnHighValueExpense = (callback: OnHighValueExpenseCallback) => {
    setOnHighValueExpenseCallback(() => callback);
  };

  return (
    <AppContext.Provider
      value={{
        ...state,
        masterBalance,
        depositToMaster,
        createSubAccount,
        transferToSubAccount,
        transferBetweenAccounts,
        transferToMainAccount,
        bookExpense,
        deleteSubAccount,
        getAccountLedger,
        setOnHighValueExpense,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
