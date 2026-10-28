/**
 * AppContext - Central State Management for HisabBook
 */

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  Account,
  AppTab,
  BudgetConfig,
  Category,
  Language,
  RecurringBill,
  Transaction,
  TransactionFilter,
  UserSettings,
} from '../types';
import { getTodayDateString } from '../utils/formatters';
import {
  DEFAULT_ACCOUNTS,
  DEFAULT_BUDGET,
  DEFAULT_CATEGORIES,
  DEFAULT_RECURRING_BILLS,
  DEFAULT_SETTINGS,
  generateSeedTransactions,
  recalculateAccountBalances,
  STORAGE_KEYS,
} from '../utils/storage';
import { getTranslation, translations } from '../utils/translations';

interface FinancialMetrics {
  totalBalance: number;
  monthIncome: number;
  monthExpense: number;
  monthSavings: number;
  todayExpense: number;
  weekExpense: number;
  last30DaysExpense: number;
  remainingMonthlyBudget: number;
  budgetUsagePercent: number;
  dailyOverspend: boolean;
  categorySpendingThisMonth: Record<string, number>;
  previousMonthExpense: number;
  previousMonthIncome: number;
  monthExpenseChangePercent: number;
}

interface AppContextType {
  // State
  transactions: Transaction[];
  accounts: Account[];
  categories: Category[];
  budgetConfig: BudgetConfig;
  recurringBills: RecurringBill[];
  settings: UserSettings;
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
  filters: TransactionFilter;
  setFilters: React.Dispatch<React.SetStateAction<TransactionFilter>>;
  resetFilters: () => void;
  isPinLocked: boolean;
  metrics: FinancialMetrics;
  
  // Actions
  addTransaction: (tx: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTransaction: (tx: Transaction) => void;
  deleteTransaction: (id: string) => void;
  
  addAccount: (acc: Omit<Account, 'id' | 'currentBalance'>) => void;
  updateAccount: (acc: Account) => void;
  deleteAccount: (id: string) => void;
  
  addCategory: (cat: Omit<Category, 'id'>) => void;
  updateCategory: (cat: Category) => void;
  deleteCategory: (id: string) => void;
  
  updateBudgetConfig: (cfg: Partial<BudgetConfig>) => void;
  
  addRecurringBill: (bill: Omit<RecurringBill, 'id'>) => void;
  updateRecurringBill: (bill: RecurringBill) => void;
  deleteRecurringBill: (id: string) => void;
  toggleRecurringBillPaid: (billId: string, recordTransaction?: boolean, accountId?: string) => void;
  
  updateSettings: (newSettings: Partial<UserSettings>) => void;
  setLanguage: (lang: Language) => void;
  toggleTheme: () => void;
  
  // Security PIN
  setAppPin: (pin: string) => boolean;
  removeAppPin: () => void;
  unlockWithPin: (pin: string) => boolean;
  lockApp: () => void;

  // Data management
  loadSampleData: () => void;
  clearAllData: () => void;
  importBackupData: (jsonStr: string) => { success: boolean; message: string };

  // Quick helper
  t: (key: keyof typeof translations.en) => string;
}

const defaultFilters: TransactionFilter = {
  searchQuery: '',
  type: 'all',
  categoryId: '',
  accountId: '',
  paymentMethod: '',
  startDate: '',
  endDate: '',
  sortBy: 'date_desc',
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load initial settings
  const [settings, setSettings] = useState<UserSettings>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (stored) return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
    } catch (e) {
      console.error('Error loading settings', e);
    }
    return DEFAULT_SETTINGS;
  });

  // PIN lock session state
  const [isPinLocked, setIsPinLocked] = useState<boolean>(() => {
    if (settings.pinLockEnabled && settings.pinHash) {
      const unlocked = sessionStorage.getItem(STORAGE_KEYS.PIN_SESSION);
      return unlocked !== 'true';
    }
    return false;
  });

  // Categories
  const [categories, setCategories] = useState<Category[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error('Error loading categories', e);
    }
    return DEFAULT_CATEGORIES;
  });

  // Raw accounts
  const [accounts, setAccounts] = useState<Account[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.ACCOUNTS);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error('Error loading accounts', e);
    }
    return DEFAULT_ACCOUNTS;
  });

  // Transactions
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error('Error loading transactions', e);
    }
    return generateSeedTransactions();
  });

  // Budgets
  const [budgetConfig, setBudgetConfig] = useState<BudgetConfig>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.BUDGETS);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error('Error loading budgets', e);
    }
    return DEFAULT_BUDGET;
  });

  // Recurring Bills
  const [recurringBills, setRecurringBills] = useState<RecurringBill[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.RECURRING_BILLS);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error('Error loading recurring bills', e);
    }
    return DEFAULT_RECURRING_BILLS;
  });

  // Navigation tab & filters
  const [activeTab, setActiveTab] = useState<AppTab>('dashboard');
  const [filters, setFilters] = useState<TransactionFilter>(defaultFilters);

  // Synchronize HTML theme class
  useEffect(() => {
    const isDark =
      settings.theme === 'dark' ||
      (settings.theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.theme]);

  // Always compute updated account balances based on transactions
  const accountsWithCalculatedBalances = useMemo(() => {
    return recalculateAccountBalances(accounts, transactions);
  }, [accounts, transactions]);

  // Persist state updates
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(accounts));
  }, [accounts]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(budgetConfig));
  }, [budgetConfig]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.RECURRING_BILLS, JSON.stringify(recurringBills));
  }, [recurringBills]);

  // Calculate detailed financial metrics accurately
  const metrics: FinancialMetrics = useMemo(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth(); // 0-indexed
    const todayStr = getTodayDateString();

    // 7 days ago timestamp
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const oneWeekAgoStr = oneWeekAgo.toISOString().slice(0, 10);

    // 30 days ago
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().slice(0, 10);

    // Previous month dates
    const prevMonthDate = new Date(currentYear, currentMonth - 1, 1);
    const prevYear = prevMonthDate.getFullYear();
    const prevMonth = prevMonthDate.getMonth();

    let totalBal = 0;
    accountsWithCalculatedBalances.forEach((acc) => {
      totalBal += acc.currentBalance;
    });

    let monthInc = 0;
    let monthExp = 0;
    let prevMonthInc = 0;
    let prevMonthExp = 0;
    let todayExp = 0;
    let weekExp = 0;
    let last30DaysExp = 0;
    const catSpending: Record<string, number> = {};

    transactions.forEach((tx) => {
      const txDate = new Date(tx.date.length === 10 ? `${tx.date}T12:00:00` : tx.date);
      const txYear = txDate.getFullYear();
      const txMonth = txDate.getMonth();
      const txDateStr = tx.date.slice(0, 10);

      // Check current month
      const isCurrentMonth = txYear === currentYear && txMonth === currentMonth;
      const isPrevMonth = txYear === prevYear && txMonth === prevMonth;

      if (tx.type === 'income') {
        if (isCurrentMonth) monthInc += tx.amount;
        if (isPrevMonth) prevMonthInc += tx.amount;
      } else if (tx.type === 'expense') {
        if (isCurrentMonth) {
          monthExp += tx.amount;
          catSpending[tx.categoryId] = (catSpending[tx.categoryId] || 0) + tx.amount;
        }
        if (isPrevMonth) {
          prevMonthExp += tx.amount;
        }

        if (txDateStr === todayStr) {
          todayExp += tx.amount;
        }
        if (txDateStr >= oneWeekAgoStr) {
          weekExp += tx.amount;
        }
        if (txDateStr >= thirtyDaysAgoStr) {
          last30DaysExp += tx.amount;
        }
      }
      // Note: 'transfer' does not add to income or expense!
    });

    const monthSavings = monthInc - monthExp;
    const overallBudget = budgetConfig.monthlyOverallBudget || 1;
    const remainingBudget = overallBudget - monthExp;
    const budgetUsagePercent = Math.min(Math.round((monthExp / overallBudget) * 100), 999);
    const dailyOverspend = budgetConfig.dailySpendingLimit > 0 && todayExp > budgetConfig.dailySpendingLimit;

    // Previous month comparison percentage
    let monthExpenseChangePercent = 0;
    if (prevMonthExp > 0) {
      monthExpenseChangePercent = Math.round(((monthExp - prevMonthExp) / prevMonthExp) * 100);
    }

    return {
      totalBalance: totalBal,
      monthIncome: monthInc,
      monthExpense: monthExp,
      monthSavings: monthSavings,
      todayExpense: todayExp,
      weekExpense: weekExp,
      last30DaysExpense: last30DaysExp,
      remainingMonthlyBudget: remainingBudget,
      budgetUsagePercent: budgetUsagePercent,
      dailyOverspend: dailyOverspend,
      categorySpendingThisMonth: catSpending,
      previousMonthExpense: prevMonthExp,
      previousMonthIncome: prevMonthInc,
      monthExpenseChangePercent: monthExpenseChangePercent,
    };
  }, [accountsWithCalculatedBalances, transactions, budgetConfig]);

  // Actions
  const addTransaction = (txData: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newTx: Transaction = {
      ...txData,
      id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setTransactions((prev) => [newTx, ...prev]);
  };

  const updateTransaction = (updatedTx: Transaction) => {
    setTransactions((prev) =>
      prev.map((tx) => (tx.id === updatedTx.id ? { ...updatedTx, updatedAt: Date.now() } : tx))
    );
  };

  const deleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((tx) => tx.id !== id));
  };

  const addAccount = (accData: Omit<Account, 'id' | 'currentBalance'>) => {
    const newAcc: Account = {
      ...accData,
      id: `acc_${Date.now()}`,
      currentBalance: accData.openingBalance,
    };
    setAccounts((prev) => [...prev, newAcc]);
  };

  const updateAccount = (updatedAcc: Account) => {
    setAccounts((prev) => prev.map((a) => (a.id === updatedAcc.id ? updatedAcc : a)));
  };

  const deleteAccount = (id: string) => {
    if (accounts.length <= 1) return; // Must have at least 1 account
    setAccounts((prev) => prev.filter((a) => a.id !== id));
  };

  const addCategory = (catData: Omit<Category, 'id'>) => {
    const newCat: Category = {
      ...catData,
      id: `cat_${Date.now()}`,
    };
    setCategories((prev) => [...prev, newCat]);
  };

  const updateCategory = (updatedCat: Category) => {
    setCategories((prev) => prev.map((c) => (c.id === updatedCat.id ? updatedCat : c)));
  };

  const deleteCategory = (id: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== id));
  };

  const updateBudgetConfig = (cfg: Partial<BudgetConfig>) => {
    setBudgetConfig((prev) => ({ ...prev, ...cfg }));
  };

  const addRecurringBill = (billData: Omit<RecurringBill, 'id'>) => {
    const newBill: RecurringBill = {
      ...billData,
      id: `rec_${Date.now()}`,
    };
    setRecurringBills((prev) => [...prev, newBill]);
  };

  const updateRecurringBill = (updatedBill: RecurringBill) => {
    setRecurringBills((prev) => prev.map((b) => (b.id === updatedBill.id ? updatedBill : b)));
  };

  const deleteRecurringBill = (id: string) => {
    setRecurringBills((prev) => prev.filter((b) => b.id !== id));
  };

  const toggleRecurringBillPaid = (
    billId: string,
    recordTransaction: boolean = false,
    accountId?: string
  ) => {
    setRecurringBills((prev) =>
      prev.map((bill) => {
        if (bill.id !== billId) return bill;
        const newPaidStatus = !bill.isPaidForCurrentPeriod;

        if (newPaidStatus && recordTransaction) {
          // Record as real transaction
          const targetAccId = accountId || bill.accountId;
          addTransaction({
            type: bill.type,
            amount: bill.amount,
            categoryId: bill.categoryId,
            date: getTodayDateString(),
            accountId: targetAccId,
            paymentMethod: bill.paymentMethod,
            description: `Payment for recurring bill: ${bill.title}`,
            tags: ['#recurring', '#bill'],
          });
        }

        return {
          ...bill,
          isPaidForCurrentPeriod: newPaidStatus,
          lastPaidDate: newPaidStatus ? getTodayDateString() : bill.lastPaidDate,
        };
      })
    );
  };

  const updateSettings = (newSettings: Partial<UserSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const setLanguage = (lang: Language) => {
    setSettings((prev) => ({ ...prev, language: lang }));
  };

  const toggleTheme = () => {
    setSettings((prev) => {
      const nextTheme = prev.theme === 'dark' ? 'light' : 'dark';
      return { ...prev, theme: nextTheme };
    });
  };

  // PIN Lock handlers
  const setAppPin = (pin: string): boolean => {
    if (!pin || pin.length !== 4) return false;
    // Store simple hash
    const hash = btoa(pin + '_hisab');
    setSettings((prev) => ({
      ...prev,
      pinLockEnabled: true,
      pinHash: hash,
    }));
    sessionStorage.setItem(STORAGE_KEYS.PIN_SESSION, 'true');
    setIsPinLocked(false);
    return true;
  };

  const removeAppPin = () => {
    setSettings((prev) => ({
      ...prev,
      pinLockEnabled: false,
      pinHash: undefined,
    }));
    sessionStorage.removeItem(STORAGE_KEYS.PIN_SESSION);
    setIsPinLocked(false);
  };

  const unlockWithPin = (pin: string): boolean => {
    if (!settings.pinHash) return true;
    const hash = btoa(pin + '_hisab');
    if (hash === settings.pinHash) {
      sessionStorage.setItem(STORAGE_KEYS.PIN_SESSION, 'true');
      setIsPinLocked(false);
      return true;
    }
    return false;
  };

  const lockApp = () => {
    if (settings.pinLockEnabled) {
      sessionStorage.removeItem(STORAGE_KEYS.PIN_SESSION);
      setIsPinLocked(true);
    }
  };

  const resetFilters = () => {
    setFilters(defaultFilters);
  };

  const loadSampleData = () => {
    setCategories(DEFAULT_CATEGORIES);
    setAccounts(DEFAULT_ACCOUNTS);
    setTransactions(generateSeedTransactions());
    setBudgetConfig(DEFAULT_BUDGET);
    setRecurringBills(DEFAULT_RECURRING_BILLS);
  };

  const clearAllData = () => {
    setTransactions([]);
    setAccounts(DEFAULT_ACCOUNTS.map((a) => ({ ...a, openingBalance: 0, currentBalance: 0 })));
    setRecurringBills([]);
    setBudgetConfig({
      monthlyOverallBudget: 25000,
      dailySpendingLimit: 1000,
      categoryBudgets: {},
    });
  };

  const importBackupData = (jsonStr: string): { success: boolean; message: string } => {
    try {
      const data = JSON.parse(jsonStr);
      if (!data || typeof data !== 'object') {
        return { success: false, message: 'Invalid JSON format' };
      }
      if (Array.isArray(data.transactions)) setTransactions(data.transactions);
      if (Array.isArray(data.accounts)) setAccounts(data.accounts);
      if (Array.isArray(data.categories)) setCategories(data.categories);
      if (data.budgetConfig) setBudgetConfig(data.budgetConfig);
      if (Array.isArray(data.recurringBills)) setRecurringBills(data.recurringBills);
      if (data.settings) setSettings((prev) => ({ ...prev, ...data.settings }));
      return { success: true, message: 'Data restored successfully!' };
    } catch (e: unknown) {
      const errMsg = e instanceof Error ? e.message : 'Unknown error';
      return { success: false, message: `Failed to parse backup: ${errMsg}` };
    }
  };

  const t = (key: keyof typeof translations.en): string => {
    return getTranslation(settings.language, key);
  };

  return (
    <AppContext.Provider
      value={{
        transactions,
        accounts: accountsWithCalculatedBalances,
        categories,
        budgetConfig,
        recurringBills,
        settings,
        activeTab,
        setActiveTab,
        filters,
        setFilters,
        resetFilters,
        isPinLocked,
        metrics,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        addAccount,
        updateAccount,
        deleteAccount,
        addCategory,
        updateCategory,
        deleteCategory,
        updateBudgetConfig,
        addRecurringBill,
        updateRecurringBill,
        deleteRecurringBill,
        toggleRecurringBillPaid,
        updateSettings,
        setLanguage,
        toggleTheme,
        setAppPin,
        removeAppPin,
        unlockWithPin,
        lockApp,
        loadSampleData,
        clearAllData,
        importBackupData,
        t,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
