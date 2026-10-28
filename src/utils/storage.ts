/**
 * Storage and default seed data for HisabBook.
 */

import {
  Account,
  BudgetConfig,
  Category,
  RecurringBill,
  Transaction,
  UserSettings,
} from '../types';
import { getTodayDateString } from './formatters';

export const STORAGE_KEYS = {
  TRANSACTIONS: 'hisabbook_transactions_v1',
  ACCOUNTS: 'hisabbook_accounts_v1',
  CATEGORIES: 'hisabbook_categories_v1',
  BUDGETS: 'hisabbook_budgets_v1',
  RECURRING_BILLS: 'hisabbook_recurring_bills_v1',
  SETTINGS: 'hisabbook_settings_v1',
  PIN_SESSION: 'hisabbook_pin_session_v1',
};

export const DEFAULT_SETTINGS: UserSettings = {
  language: 'en',
  currency: 'INR',
  currencySymbol: '₹',
  theme: 'light',
  numberFormat: 'indian',
  pinLockEnabled: false,
  autoLockMinutes: 5,
  userName: 'Rahul Sharma',
  userEmail: 'rahul.finance@example.com',
};

export const DEFAULT_CATEGORIES: Category[] = [
  // Expenses
  {
    id: 'cat_food',
    name: 'Food & Groceries',
    nameHi: 'भोजन और किराना',
    type: 'expense',
    icon: 'UtensilsCrossed',
    color: '#f97316', // orange-500
    isDefault: true,
    budgetLimit: 12000,
  },
  {
    id: 'cat_chai',
    name: 'Tea & Snacks',
    nameHi: 'चाय और नाश्ता',
    type: 'expense',
    icon: 'Coffee',
    color: '#854d0e', // amber-800
    isDefault: true,
    budgetLimit: 2500,
  },
  {
    id: 'cat_travel',
    name: 'Travel & Fuel',
    nameHi: 'यात्रा और ईंधन',
    type: 'expense',
    icon: 'Fuel',
    color: '#0284c7', // sky-600
    isDefault: true,
    budgetLimit: 5000,
  },
  {
    id: 'cat_rent',
    name: 'Room Rent',
    nameHi: 'कमरे का किराया',
    type: 'expense',
    icon: 'Home',
    color: '#7c3aed', // violet-600
    isDefault: true,
    budgetLimit: 15000,
  },
  {
    id: 'cat_bills',
    name: 'Electricity & Water Bills',
    nameHi: 'बिजली और पानी बिल',
    type: 'expense',
    icon: 'Zap',
    color: '#eab308', // yellow-500
    isDefault: true,
    budgetLimit: 3000,
  },
  {
    id: 'cat_mobile',
    name: 'Mobile Recharge & Internet',
    nameHi: 'मोबाइल और इंटरनेट',
    type: 'expense',
    icon: 'Wifi',
    color: '#06b6d4', // cyan-500
    isDefault: true,
    budgetLimit: 1500,
  },
  {
    id: 'cat_emi',
    name: 'EMI & Loan Payments',
    nameHi: 'ईएमआई और ऋण भुगतान',
    type: 'expense',
    icon: 'Landmark',
    color: '#dc2626', // red-600
    isDefault: true,
    budgetLimit: 8500,
  },
  {
    id: 'cat_medical',
    name: 'Medical & Pharmacy',
    nameHi: 'दवा और चिकित्सा',
    type: 'expense',
    icon: 'HeartPulse',
    color: '#ec4899', // pink-500
    isDefault: true,
    budgetLimit: 2000,
  },
  {
    id: 'cat_shopping',
    name: 'Shopping & Clothes',
    nameHi: 'खरीदारी और कपड़े',
    type: 'expense',
    icon: 'ShoppingBag',
    color: '#a855f7', // purple-500
    isDefault: true,
    budgetLimit: 4000,
  },
  {
    id: 'cat_family',
    name: 'Family & Children',
    nameHi: 'पारिवारिक खर्च',
    type: 'expense',
    icon: 'Users',
    color: '#10b981', // emerald-500
    isDefault: true,
    budgetLimit: 5000,
  },
  {
    id: 'cat_entertainment',
    name: 'Entertainment & OTT',
    nameHi: 'मनोरंजन और सिनेमा',
    type: 'expense',
    icon: 'Film',
    color: '#6366f1', // indigo-500
    isDefault: true,
    budgetLimit: 2000,
  },
  {
    id: 'cat_other_exp',
    name: 'Other Expenses',
    nameHi: 'अन्य खर्च',
    type: 'expense',
    icon: 'MoreHorizontal',
    color: '#64748b', // slate-500
    isDefault: true,
  },

  // Incomes
  {
    id: 'cat_salary',
    name: 'Salary',
    nameHi: 'वेतन (Salary)',
    type: 'income',
    icon: 'Banknote',
    color: '#16a34a', // green-600
    isDefault: true,
  },
  {
    id: 'cat_freelance',
    name: 'Freelance & Business',
    nameHi: 'व्यवसाय व फ्रीलांस',
    type: 'income',
    icon: 'Briefcase',
    color: '#0d9488', // teal-600
    isDefault: true,
  },
  {
    id: 'cat_investment',
    name: 'Investments & Interest',
    nameHi: 'निवेश और ब्याज',
    type: 'income',
    icon: 'TrendingUp',
    color: '#2563eb', // blue-600
    isDefault: true,
  },
  {
    id: 'cat_other_inc',
    name: 'Other Income',
    nameHi: 'अन्य आय',
    type: 'income',
    icon: 'PlusCircle',
    color: '#059669', // emerald-600
    isDefault: true,
  },
];

export const DEFAULT_ACCOUNTS: Account[] = [
  {
    id: 'acc_cash',
    name: 'Cash in Hand',
    nameHi: 'हाथ में नकद',
    type: 'cash',
    openingBalance: 4500,
    currentBalance: 4500,
    color: '#16a34a', // green
    icon: 'Banknote',
    isDefault: true,
  },
  {
    id: 'acc_sbi',
    name: 'SBI Salary Account',
    nameHi: 'एसबीआई बैंक खाता',
    type: 'bank',
    openingBalance: 48000,
    currentBalance: 48000,
    accountNumberMasked: '•••• 4821',
    color: '#0284c7', // sky
    icon: 'Building2',
  },
  {
    id: 'acc_upi',
    name: 'UPI (GPay / PhonePe)',
    nameHi: 'यूपीआई वॉलेट',
    type: 'upi',
    openingBalance: 5200,
    currentBalance: 5200,
    color: '#6366f1', // indigo
    icon: 'Smartphone',
  },
  {
    id: 'acc_cc',
    name: 'HDFC Millennia Credit Card',
    nameHi: 'एचडीएफसी क्रेडिट कार्ड',
    type: 'credit_card',
    openingBalance: 0,
    currentBalance: -8400, // outstanding used credit
    accountNumberMasked: '•••• 9012',
    creditLimit: 100000,
    color: '#e11d48', // rose
    icon: 'CreditCard',
  },
];

export const DEFAULT_BUDGET: BudgetConfig = {
  monthlyOverallBudget: 50000,
  dailySpendingLimit: 2000,
  categoryBudgets: {
    cat_food: 12000,
    cat_chai: 2500,
    cat_travel: 5000,
    cat_rent: 15000,
    cat_bills: 3000,
    cat_shopping: 4000,
    cat_emi: 8500,
  },
};

export const DEFAULT_RECURRING_BILLS: RecurringBill[] = [
  {
    id: 'rec_rent',
    title: 'Flat Rent Payment',
    titleHi: 'कमरे का किराया',
    amount: 14000,
    type: 'expense',
    categoryId: 'cat_rent',
    accountId: 'acc_sbi',
    frequency: 'monthly',
    dueDay: 5,
    nextDueDate: `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-05`,
    isPaidForCurrentPeriod: true,
    paymentMethod: 'upi',
    notes: 'Landlord Google Pay transfer',
    reminderDaysBefore: 2,
  },
  {
    id: 'rec_car_emi',
    title: 'Car Loan EMI',
    titleHi: 'कार लोन ईएमआई',
    amount: 8500,
    type: 'expense',
    categoryId: 'cat_emi',
    accountId: 'acc_sbi',
    frequency: 'monthly',
    dueDay: 10,
    nextDueDate: `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-10`,
    isPaidForCurrentPeriod: true,
    paymentMethod: 'netbanking',
    notes: 'Auto-debit from SBI',
    reminderDaysBefore: 3,
  },
  {
    id: 'rec_wifi',
    title: 'Airtel Fiber Broadband',
    titleHi: 'एयरटेल फाइबर ब्रॉडबैंड',
    amount: 943,
    type: 'expense',
    categoryId: 'cat_mobile',
    accountId: 'acc_upi',
    frequency: 'monthly',
    dueDay: 22,
    nextDueDate: `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-22`,
    isPaidForCurrentPeriod: false,
    paymentMethod: 'upi',
    notes: '200 Mbps plan with Disney+ Hotstar',
    reminderDaysBefore: 2,
  },
  {
    id: 'rec_electricity',
    title: 'Electricity Bill (Bescom/Tata)',
    titleHi: 'बिजली बिल',
    amount: 1850,
    type: 'expense',
    categoryId: 'cat_bills',
    accountId: 'acc_upi',
    frequency: 'monthly',
    dueDay: 28,
    nextDueDate: `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-28`,
    isPaidForCurrentPeriod: false,
    paymentMethod: 'upi',
    notes: 'Pay before due date to avoid surcharge',
    reminderDaysBefore: 3,
  },
  {
    id: 'rec_salary',
    title: 'Monthly Salary Credit',
    titleHi: 'मासिक वेतन जमा',
    amount: 68000,
    type: 'income',
    categoryId: 'cat_salary',
    accountId: 'acc_sbi',
    frequency: 'monthly',
    dueDay: 1,
    nextDueDate: `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-01`,
    isPaidForCurrentPeriod: true,
    paymentMethod: 'netbanking',
    notes: 'TechCorp Pvt Ltd Net Salary',
    reminderDaysBefore: 1,
  },
];

/**
 * Generate realistic Indian transactions for the current and recent dates
 */
export function generateSeedTransactions(): Transaction[] {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const todayDate = now.getDate();

  function getDate(daysAgo: number): string {
    const d = new Date(year, month, todayDate - daysAgo);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  return [
    {
      id: 'tx_salary_1',
      type: 'income',
      amount: 68000,
      categoryId: 'cat_salary',
      date: `${year}-${String(month + 1).padStart(2, '0')}-01`,
      time: '09:30',
      accountId: 'acc_sbi',
      paymentMethod: 'netbanking',
      description: 'Monthly Salary credited from Employer',
      tags: ['#salary', '#monthly'],
      createdAt: Date.now() - 25 * 86400000,
      updatedAt: Date.now() - 25 * 86400000,
    },
    {
      id: 'tx_rent_1',
      type: 'expense',
      amount: 14000,
      categoryId: 'cat_rent',
      date: `${year}-${String(month + 1).padStart(2, '0')}-05`,
      time: '11:15',
      accountId: 'acc_sbi',
      paymentMethod: 'upi',
      description: 'Room rent paid via UPI to landlord',
      tags: ['#rent', '#house'],
      createdAt: Date.now() - 20 * 86400000,
      updatedAt: Date.now() - 20 * 86400000,
    },
    {
      id: 'tx_emi_1',
      type: 'expense',
      amount: 8500,
      categoryId: 'cat_emi',
      date: `${year}-${String(month + 1).padStart(2, '0')}-10`,
      time: '14:00',
      accountId: 'acc_sbi',
      paymentMethod: 'netbanking',
      description: 'Car EMI auto-debit',
      tags: ['#emi', '#car'],
      createdAt: Date.now() - 15 * 86400000,
      updatedAt: Date.now() - 15 * 86400000,
    },
    {
      id: 'tx_transfer_1',
      type: 'transfer',
      amount: 5000,
      categoryId: '',
      date: getDate(12),
      time: '16:20',
      accountId: 'acc_sbi',
      toAccountId: 'acc_upi',
      paymentMethod: 'upi',
      description: 'Loaded funds into UPI wallet for daily expenses',
      tags: ['#wallet_load'],
      createdAt: Date.now() - 12 * 86400000,
      updatedAt: Date.now() - 12 * 86400000,
    },
    {
      id: 'tx_groceries_1',
      type: 'expense',
      amount: 3450,
      categoryId: 'cat_food',
      date: getDate(8),
      time: '18:45',
      accountId: 'acc_upi',
      paymentMethod: 'upi',
      description: 'Monthly grocery shopping at DMart',
      tags: ['#groceries', '#dmart'],
      createdAt: Date.now() - 8 * 86400000,
      updatedAt: Date.now() - 8 * 86400000,
    },
    {
      id: 'tx_fuel_1',
      type: 'expense',
      amount: 1500,
      categoryId: 'cat_travel',
      date: getDate(6),
      time: '08:30',
      accountId: 'acc_cc',
      paymentMethod: 'credit_card',
      description: 'Petrol top-up at Indian Oil pump',
      tags: ['#petrol', '#fuel'],
      createdAt: Date.now() - 6 * 86400000,
      updatedAt: Date.now() - 6 * 86400000,
    },
    {
      id: 'tx_freelance_1',
      type: 'income',
      amount: 12500,
      categoryId: 'cat_freelance',
      date: getDate(5),
      time: '15:10',
      accountId: 'acc_sbi',
      paymentMethod: 'netbanking',
      description: 'UI Design consulting project milestone',
      tags: ['#freelance', '#client'],
      createdAt: Date.now() - 5 * 86400000,
      updatedAt: Date.now() - 5 * 86400000,
    },
    {
      id: 'tx_dinner_1',
      type: 'expense',
      amount: 1280,
      categoryId: 'cat_food',
      date: getDate(4),
      time: '20:15',
      accountId: 'acc_cc',
      paymentMethod: 'credit_card',
      description: 'Dinner with family at Barbeque Nation',
      tags: ['#dinner', '#family'],
      createdAt: Date.now() - 4 * 86400000,
      updatedAt: Date.now() - 4 * 86400000,
    },
    {
      id: 'tx_medicine_1',
      type: 'expense',
      amount: 620,
      categoryId: 'cat_medical',
      date: getDate(3),
      time: '12:40',
      accountId: 'acc_upi',
      paymentMethod: 'upi',
      description: 'Monthly vitamins & prescription medicines from Apollo',
      tags: ['#health'],
      createdAt: Date.now() - 3 * 86400000,
      updatedAt: Date.now() - 3 * 86400000,
    },
    {
      id: 'tx_metro_1',
      type: 'expense',
      amount: 80,
      categoryId: 'cat_travel',
      date: getDate(2),
      time: '09:15',
      accountId: 'acc_upi',
      paymentMethod: 'upi',
      description: 'Metro card smart recharge for office commute',
      tags: ['#commute'],
      createdAt: Date.now() - 2 * 86400000,
      updatedAt: Date.now() - 2 * 86400000,
    },
    {
      id: 'tx_swiggy_1',
      type: 'expense',
      amount: 380,
      categoryId: 'cat_food',
      date: getDate(1),
      time: '13:20',
      accountId: 'acc_upi',
      paymentMethod: 'upi',
      description: 'Swiggy lunch order - Biryani',
      tags: ['#food'],
      createdAt: Date.now() - 1 * 86400000,
      updatedAt: Date.now() - 1 * 86400000,
    },
    {
      id: 'tx_chai_1',
      type: 'expense',
      amount: 40,
      categoryId: 'cat_chai',
      date: getTodayDateString(),
      time: '10:00',
      accountId: 'acc_cash',
      paymentMethod: 'cash',
      description: 'Masala Chai & Samosa at corner stall',
      tags: ['#chai', '#snacks'],
      createdAt: Date.now() - 3600000 * 4,
      updatedAt: Date.now() - 3600000 * 4,
    },
    {
      id: 'tx_groceries_today',
      type: 'expense',
      amount: 250,
      categoryId: 'cat_food',
      date: getTodayDateString(),
      time: '17:30',
      accountId: 'acc_upi',
      paymentMethod: 'upi',
      description: 'Milk, bread and bananas from local shop',
      tags: ['#daily'],
      createdAt: Date.now() - 3600000,
      updatedAt: Date.now() - 3600000,
    },
  ];
}

/**
 * Helper to calculate current balances accurately from opening balances and all transactions
 */
export function recalculateAccountBalances(accounts: Account[], transactions: Transaction[]): Account[] {
  return accounts.map((acc) => {
    let balance = acc.openingBalance;

    for (const tx of transactions) {
      if (tx.type === 'income' && tx.accountId === acc.id) {
        balance += tx.amount;
      } else if (tx.type === 'expense' && tx.accountId === acc.id) {
        balance -= tx.amount;
      } else if (tx.type === 'transfer') {
        if (tx.accountId === acc.id) {
          // Source: money moved out
          balance -= tx.amount;
        }
        if (tx.toAccountId === acc.id) {
          // Destination: money moved in
          balance += tx.amount;
        }
      }
    }

    return {
      ...acc,
      currentBalance: balance,
    };
  });
}
