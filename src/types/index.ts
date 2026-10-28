/**
 * HisabBook - Financial Data Types & Interfaces
 */

export type TransactionType = 'expense' | 'income' | 'transfer';

export type PaymentMethod =
  | 'cash'
  | 'upi'
  | 'netbanking'
  | 'debit_card'
  | 'credit_card'
  | 'cheque'
  | 'other';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  categoryId: string; // for income & expense
  date: string; // ISO string YYYY-MM-DD or YYYY-MM-DDTHH:mm
  time?: string; // HH:mm
  accountId: string; // Source account (or main account)
  toAccountId?: string; // Target account for 'transfer'
  paymentMethod: PaymentMethod;
  description: string;
  receiptUrl?: string; // Base64 data URL or image path
  tags: string[];
  createdAt: number;
  updatedAt: number;
}

export type CategoryType = 'expense' | 'income';

export interface Category {
  id: string;
  name: string;
  nameHi: string;
  type: CategoryType;
  icon: string; // Lucide icon name
  color: string; // Tailwind color or hex
  isDefault?: boolean;
  budgetLimit?: number; // Optional monthly category budget
}

export type AccountType = 'cash' | 'bank' | 'upi' | 'credit_card' | 'other';

export interface Account {
  id: string;
  name: string;
  nameHi: string;
  type: AccountType;
  openingBalance: number;
  currentBalance: number;
  accountNumberMasked?: string;
  color: string;
  icon: string;
  creditLimit?: number; // for credit cards
  isDefault?: boolean;
}

export interface BudgetConfig {
  monthlyOverallBudget: number;
  dailySpendingLimit: number;
  categoryBudgets: Record<string, number>; // categoryId -> amount
}

export type RecurrenceFrequency = 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface RecurringBill {
  id: string;
  title: string;
  titleHi: string;
  amount: number;
  type: 'expense' | 'income';
  categoryId: string;
  accountId: string;
  frequency: RecurrenceFrequency;
  dueDay: number; // e.g. 5th of each month, or 1 for Monday
  nextDueDate: string; // YYYY-MM-DD
  isPaidForCurrentPeriod: boolean;
  lastPaidDate?: string;
  paymentMethod: PaymentMethod;
  notes?: string;
  reminderDaysBefore?: number;
}

export type Language = 'en' | 'hi';
export type Theme = 'light' | 'dark' | 'system';
export type CurrencyCode = 'INR' | 'USD' | 'EUR' | 'GBP' | 'AED';

export interface UserSettings {
  language: Language;
  currency: CurrencyCode;
  currencySymbol: string;
  theme: Theme;
  numberFormat: 'indian' | 'international';
  pinLockEnabled: boolean;
  pinHash?: string; // simple 4-digit hash
  autoLockMinutes: number;
  userName: string;
  userEmail?: string;
}

export interface TransactionFilter {
  searchQuery: string;
  type: 'all' | TransactionType;
  categoryId: string;
  accountId: string;
  paymentMethod: string;
  startDate: string;
  endDate: string;
  minAmount?: number;
  maxAmount?: number;
  tag?: string;
  sortBy: 'date_desc' | 'date_asc' | 'amount_desc' | 'amount_asc';
}

export type AppTab = 'dashboard' | 'transactions' | 'add' | 'budgets' | 'recurring' | 'reports' | 'settings';
