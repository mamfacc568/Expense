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

// Scrap Feature Types
export interface Vendor {
  id: string;
  name: string;
  phone?: string;
  balance: number;
  createdAt: Date;
}

export interface ScrapSale {
  id: string;
  vendorId: string;
  description: string;
  weight?: number;
  rate?: number;
  amount: number;
  date: string;
  imageUrl?: string;
  createdAt: Date;
}

export interface VendorPayment {
  id: string;
  vendorId: string;
  amount: number;
  paymentMethod: 'upi' | 'cash';
  upiName?: string;
  description: string;
  date: string;
  createdAt: Date;
}

export interface VendorLedgerEntry {
  id: string;
  date: Date;
  description: string;
  credit: number;
  debit: number;
  runningBalance: number;
  kind: 'sale' | 'payment';
  paymentMethod?: 'upi' | 'cash';
  upiName?: string;
  imageUrl?: string;
}

export interface AppState {
  deposits: number;
  subAccounts: SubAccount[];
  expenses: Expense[];
  transactions: Transaction[];
  vendors: Vendor[];
  scrapSales: ScrapSale[];
  vendorPayments: VendorPayment[];
}
