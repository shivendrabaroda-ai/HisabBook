import React from 'react';
import {
  AlertCircle,
  AlertTriangle,
  ArrowDownLeft,
  ArrowUpRight,
  CreditCard,
  Plus,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Transaction } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import { CategoryPieChart } from './CategoryPieChart';
import { IncomeExpenseChart } from './IncomeExpenseChart';
import { QuickAddBar } from './QuickAddBar';
import { RecentTransactionsList } from './RecentTransactionsList';

interface DashboardViewProps {
  onOpenAddModal: () => void;
  onSelectTransaction: (tx: Transaction) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onOpenAddModal,
  onSelectTransaction,
}) => {
  const { metrics, accounts, budgetConfig, settings, setActiveTab, t } = useApp();

  const isIndian = settings.numberFormat === 'indian';
  const sym = settings.currencySymbol;

  // Determine budget status
  const budgetUsage = metrics.budgetUsagePercent;
  let budgetColor = 'bg-emerald-500';
  let budgetBadgeColor = 'text-emerald-700 bg-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-400';
  let showBudgetWarning = false;
  let warningMessage = '';

  if (budgetUsage >= 100) {
    budgetColor = 'bg-rose-600';
    budgetBadgeColor = 'text-rose-700 bg-rose-100 dark:bg-rose-950/80 dark:text-rose-300';
    showBudgetWarning = true;
    warningMessage = t('budgetWarning100');
  } else if (budgetUsage >= 90) {
    budgetColor = 'bg-rose-500';
    budgetBadgeColor = 'text-rose-700 bg-rose-100 dark:bg-rose-950/80 dark:text-rose-300';
    showBudgetWarning = true;
    warningMessage = t('budgetWarning90');
  } else if (budgetUsage >= 75) {
    budgetColor = 'bg-amber-500';
    budgetBadgeColor = 'text-amber-800 bg-amber-100 dark:bg-amber-950/80 dark:text-amber-300';
    showBudgetWarning = true;
    warningMessage = t('budgetWarning75');
  }

  return (
    <div className="space-y-5 pb-24">
      {/* Warning Banners */}
      {showBudgetWarning && (
        <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-2xl p-3 sm:p-4 flex items-center justify-between gap-3 animate-fade-in">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />
            <p className="text-xs sm:text-sm font-bold text-rose-800 dark:text-rose-200">
              {warningMessage}
            </p>
          </div>
          <button
            onClick={() => setActiveTab('budgets')}
            className="text-xs font-bold text-rose-700 dark:text-rose-300 underline shrink-0 hover:opacity-80"
          >
            {settings.language === 'hi' ? 'बजट देखें' : 'View Budget'}
          </button>
        </div>
      )}

      {metrics.dailyOverspend && (
        <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 rounded-2xl p-3 flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
          <p className="text-xs font-semibold text-amber-800 dark:text-amber-200">
            {t('dailyLimitExceeded')} (Limit: {formatCurrency(budgetConfig.dailySpendingLimit, sym, isIndian, true)})
          </p>
        </div>
      )}

      {/* Main Net Worth / Balance Master Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 text-white p-5 sm:p-6 shadow-xl border border-emerald-500/20">
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-teal-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center justify-between text-emerald-200/80 mb-1">
            <div className="flex items-center gap-2">
              <Wallet className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold uppercase tracking-wider">{t('totalBalance')}</span>
            </div>
            <span className="text-[11px] font-medium bg-emerald-500/20 border border-emerald-500/30 px-2 py-0.5 rounded-full text-emerald-300">
              {accounts.length} {settings.language === 'hi' ? 'खाते सक्रिय' : 'Accounts'}
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white my-1 font-mono-numbers">
            {formatCurrency(metrics.totalBalance, sym, isIndian)}
          </h2>

          <div className="mt-4 pt-4 border-t border-white/10 grid grid-cols-3 gap-2 text-center sm:text-left">
            <div>
              <span className="text-[10px] uppercase font-bold text-emerald-200/70 block">
                {t('incomeThisMonth')}
              </span>
              <span className="text-sm sm:text-base font-extrabold text-emerald-400 flex items-center justify-center sm:justify-start gap-0.5">
                <ArrowDownLeft className="w-3.5 h-3.5" />
                {formatCurrency(metrics.monthIncome, sym, isIndian, true)}
              </span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-rose-200/70 block">
                {t('expensesThisMonth')}
              </span>
              <span className="text-sm sm:text-base font-extrabold text-rose-400 flex items-center justify-center sm:justify-start gap-0.5">
                <ArrowUpRight className="w-3.5 h-3.5" />
                {formatCurrency(metrics.monthExpense, sym, isIndian, true)}
              </span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-teal-200/70 block">
                {t('savingsThisMonth')}
              </span>
              <span
                className={`text-sm sm:text-base font-extrabold flex items-center justify-center sm:justify-start gap-0.5 ${
                  metrics.monthSavings >= 0 ? 'text-teal-300' : 'text-amber-400'
                }`}
              >
                {formatCurrency(metrics.monthSavings, sym, isIndian, true)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Budget Progress Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-4 sm:p-5 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {t('monthlyBudget')}
            </h3>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-lg font-black text-slate-900 dark:text-white">
                {formatCurrency(metrics.remainingMonthlyBudget, sym, isIndian, true)}
              </span>
              <span className="text-xs text-slate-500 font-medium">
                {t('budgetRemaining')}
              </span>
            </div>
          </div>

          <div className={`px-2.5 py-1 rounded-xl font-bold text-xs ${budgetBadgeColor}`}>
            {budgetUsage}% {t('budgetUsed')}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden p-0.5 border border-slate-200/40 dark:border-slate-700/50">
          <div
            style={{ width: `${Math.min(budgetUsage, 100)}%` }}
            className={`h-full rounded-full transition-all duration-500 ${budgetColor}`}
          />
        </div>

        <div className="flex justify-between items-center text-[11px] text-slate-500 mt-2 font-medium">
          <span>
            {settings.language === 'hi' ? 'खर्च किया:' : 'Spent:'}{' '}
            <b>{formatCurrency(metrics.monthExpense, sym, isIndian, true)}</b>
          </span>
          <span>
            {settings.language === 'hi' ? 'कुल बजट:' : 'Limit:'}{' '}
            <b>{formatCurrency(budgetConfig.monthlyOverallBudget, sym, isIndian, true)}</b>
          </span>
        </div>
      </div>

      {/* 3 Metrics Row: Today's Expense, This Week, Last 30 Days */}
      <div className="grid grid-cols-3 gap-2.5 sm:gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-3 sm:p-4 text-center">
          <span className="text-[10px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
            {t('todayExpenses')}
          </span>
          <span className="text-sm sm:text-lg font-extrabold text-slate-900 dark:text-white mt-1 block">
            {formatCurrency(metrics.todayExpense, sym, isIndian, true)}
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-3 sm:p-4 text-center">
          <span className="text-[10px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
            {t('thisWeekExpenses')}
          </span>
          <span className="text-sm sm:text-lg font-extrabold text-slate-900 dark:text-white mt-1 block">
            {formatCurrency(metrics.weekExpense, sym, isIndian, true)}
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-3 sm:p-4 text-center">
          <span className="text-[10px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
            {t('last30DaysExpenses')}
          </span>
          <span className="text-sm sm:text-lg font-extrabold text-slate-900 dark:text-white mt-1 block">
            {formatCurrency(metrics.last30DaysExpense, sym, isIndian, true)}
          </span>
        </div>
      </div>

      {/* Quick Add Bar */}
      <QuickAddBar />

      {/* Accounts Overview Chips / Carousel */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
            {t('accounts')}
          </h3>
          <button
            onClick={() => setActiveTab('settings')}
            className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
          >
            {settings.language === 'hi' ? 'प्रबंधित करें' : 'Manage'}
          </button>
        </div>

        <div className="flex items-center gap-3 overflow-x-auto pb-1.5 scrollbar-none">
          {accounts.map((acc) => {
            const isCC = acc.type === 'credit_card';
            return (
              <div
                key={acc.id}
                className="shrink-0 min-w-[190px] sm:min-w-[210px] bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-3.5 shadow-sm hover:shadow transition-shadow"
              >
                <div className="flex items-center justify-between mb-2">
                  <div
                    style={{ backgroundColor: `${acc.color}20`, color: acc.color }}
                    className="w-8 h-8 rounded-xl flex items-center justify-center font-bold"
                  >
                    {isCC ? <CreditCard className="w-4 h-4" /> : <Wallet className="w-4 h-4" />}
                  </div>
                  {acc.accountNumberMasked && (
                    <span className="text-[10px] text-slate-400 font-mono">
                      {acc.accountNumberMasked}
                    </span>
                  )}
                </div>

                <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                  {settings.language === 'hi' && acc.nameHi ? acc.nameHi : acc.name}
                </p>

                <p className="text-sm font-black text-slate-900 dark:text-white mt-0.5">
                  {formatCurrency(acc.currentBalance, sym, isIndian)}
                </p>

                {isCC && acc.creditLimit && (
                  <p className="text-[10px] text-slate-400 mt-1">
                    {settings.language === 'hi' ? 'सीमा:' : 'Limit:'}{' '}
                    {formatCurrency(acc.creditLimit, sym, isIndian, true)}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Income vs Expense Chart */}
        <IncomeExpenseChart />

        {/* Category Breakdown Donut Chart */}
        <CategoryPieChart />
      </div>

      {/* Recent Transactions */}
      <RecentTransactionsList onSelectTransaction={onSelectTransaction} />
    </div>
  );
};
