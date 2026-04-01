export interface SubAccount {
  id: string;
  name: string;
  balance: number;
  createdAt: Date;
}

export interface Expense {
  id: string;
  accountId: string;
  description: string;
  amount: number;
  category: string;
  date: string;
  imageUrl?: string;
  createdAt: Date;
}

export interface Transaction {
  id: string;
  type: 'deposit' | 'transfer' | 'expense';
  fromAccount?: string;
  toAccount?: string;
  amount: number;
  description: string;
  userName?: string;
  createdAt: Date;
}

export interface LedgerEntry {
  id: string;
  date: Date;
  description: string;
  credit: number;
  debit: number;
  runningBalance: number;
  kind: 'transfer' | 'expense';
  fromAccount?: string;
  toAccount?: string;
  category?: string;
  imageUrl?: string;
}

export interface AppState {
  deposits: number;
  subAccounts: SubAccount[];
  expenses: Expense[];
  transactions: Transaction[];
}
