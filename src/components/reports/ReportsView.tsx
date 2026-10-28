import React, { useState } from 'react';
import {
  ArrowDownLeft,
  ArrowUpRight,
  Calendar,
  Download,
  FileSpreadsheet,
  FileText,
  Printer,
  Sparkles,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { exportToCsv, exportToExcel } from '../../utils/exporter';
import { formatCurrency } from '../../utils/formatters';
import { CategoryIcon } from '../common/CategoryIcon';
import { PrintableStatement } from './PrintableStatement';

type ReportPeriod = 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';

export const ReportsView: React.FC = () => {
  const { transactions, categories, accounts, metrics, settings, t } = useApp();

  const [period, setPeriod] = useState<ReportPeriod>('monthly');
  const [customStart, setCustomStart] = useState<string>(() => {
    const d = new Date();
    d.setDate(1);
    return d.toISOString().slice(0, 10);
  });
  const [customEnd, setCustomEnd] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const [showPrintModal, setShowPrintModal] = useState<boolean>(false);

  const isIndian = settings.numberFormat === 'indian';
  const sym = settings.currencySymbol;
  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);

  // Filter transactions according to selected period
  const filtered = transactions.filter((tx) => {
    const txDate = tx.date.slice(0, 10);

    if (period === 'daily') {
      return txDate === todayStr;
    }
    if (period === 'weekly') {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      return txDate >= sevenDaysAgo.toISOString().slice(0, 10);
    }
    if (period === 'monthly') {
      const monthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      return txDate.startsWith(monthPrefix);
    }
    if (period === 'yearly') {
      return txDate.startsWith(String(now.getFullYear()));
    }
    if (period === 'custom') {
      if (customStart && txDate < customStart) return false;
      if (customEnd && txDate > customEnd) return false;
      return true;
    }
    return true;
  });

  // Calculate stats for current period
  let periodIncome = 0;
  let periodExpense = 0;
  const catSpending: Record<string, number> = {};

  filtered.forEach((tx) => {
    if (tx.type === 'income') periodIncome += tx.amount;
    if (tx.type === 'expense') {
      periodExpense += tx.amount;
      catSpending[tx.categoryId] = (catSpending[tx.categoryId] || 0) + tx.amount;
    }
  });

  const netSavings = periodIncome - periodExpense;
  const savingsRate = periodIncome > 0 ? Math.max(Math.round((netSavings / periodIncome) * 100), 0) : 0;

  // Days count in current period for daily average
  const daysCount = period === 'daily' ? 1 : period === 'weekly' ? 7 : period === 'monthly' ? now.getDate() : 365;
  const avgDailyExpense = periodExpense / (daysCount || 1);

  // Category Leaderboard
  const catMap = new Map(categories.map((c) => [c.id, c]));
  const topCategories = Object.entries(catSpending)
    .map(([catId, amount]) => {
      const cat = catMap.get(catId);
      return {
        id: catId,
        cat,
        amount,
        percent: periodExpense > 0 ? Math.round((amount / periodExpense) * 100) : 0,
      };
    })
    .sort((a, b) => b.amount - a.amount);

  const getPeriodLabel = () => {
    if (period === 'daily') return settings.language === 'hi' ? 'आज का विवरण' : 'Today';
    if (period === 'weekly') return settings.language === 'hi' ? 'पिछले 7 दिन' : 'Last 7 Days';
    if (period === 'monthly') return settings.language === 'hi' ? 'इस महीने' : 'This Month';
    if (period === 'yearly') return settings.language === 'hi' ? 'इस वर्ष' : 'This Year';
    return `${customStart} - ${customEnd}`;
  };

  return (
    <div className="space-y-4 pb-24">
      {/* Top Header Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-black text-slate-900 dark:text-white">
              {t('reportsTitle')}
            </h2>
            <p className="text-xs text-slate-500">
              {settings.language === 'hi'
                ? 'आय, खर्च और बचत का विस्तृत विश्लेषण और रिपोर्ट'
                : 'Audited financial breakdown, savings analytics, and statement exports'}
            </p>
          </div>

          {/* Export Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => exportToCsv(filtered, categories, accounts)}
              className="px-3 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors flex items-center gap-1.5"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>CSV</span>
            </button>

            <button
              onClick={() => exportToExcel(filtered, categories, accounts)}
              className="px-3 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors flex items-center gap-1.5"
            >
              <Download className="w-4 h-4 text-blue-600" />
              <span>Excel</span>
            </button>

            <button
              onClick={() => setShowPrintModal(true)}
              className="px-3 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 transition-all flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4" />
              <span>{t('printPdf')}</span>
            </button>
          </div>
        </div>

        {/* Period Tabs */}
        <div className="grid grid-cols-5 gap-1 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800 text-xs font-bold">
          <button
            onClick={() => setPeriod('daily')}
            className={`py-1.5 rounded-xl transition-all ${
              period === 'daily'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {t('periodDaily')}
          </button>
          <button
            onClick={() => setPeriod('weekly')}
            className={`py-1.5 rounded-xl transition-all ${
              period === 'weekly'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {t('periodWeekly')}
          </button>
          <button
            onClick={() => setPeriod('monthly')}
            className={`py-1.5 rounded-xl transition-all ${
              period === 'monthly'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {t('periodMonthly')}
          </button>
          <button
            onClick={() => setPeriod('yearly')}
            className={`py-1.5 rounded-xl transition-all ${
              period === 'yearly'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {t('periodYearly')}
          </button>
          <button
            onClick={() => setPeriod('custom')}
            className={`py-1.5 rounded-xl transition-all ${
              period === 'custom'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {t('periodCustom')}
          </button>
        </div>

        {/* Custom Range Picker */}
        {period === 'custom' && (
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase block mb-1">
                {t('startDate')}
              </label>
              <input
                type="date"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase block mb-1">
                {t('endDate')}
              </label>
              <input
                type="date"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white"
              />
            </div>
          </div>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-4 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            {settings.language === 'hi' ? 'कुल आय' : 'Total Income'}
          </span>
          <p className="text-lg font-black text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1">
            <ArrowDownLeft className="w-4 h-4" />
            {formatCurrency(periodIncome, sym, isIndian, true)}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-4 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            {settings.language === 'hi' ? 'कुल खर्च' : 'Total Expense'}
          </span>
          <p className="text-lg font-black text-rose-600 dark:text-rose-400 mt-1 flex items-center gap-1">
            <ArrowUpRight className="w-4 h-4" />
            {formatCurrency(periodExpense, sym, isIndian, true)}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-4 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            {t('netSavings')}
          </span>
          <p
            className={`text-lg font-black mt-1 ${
              netSavings >= 0 ? 'text-teal-600 dark:text-teal-400' : 'text-rose-600 dark:text-rose-400'
            }`}
          >
            {formatCurrency(netSavings, sym, isIndian, true)}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-4 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            {t('savingsRate')}
          </span>
          <p className="text-lg font-black text-indigo-600 dark:text-indigo-400 mt-1">
            {savingsRate}%
          </p>
        </div>
      </div>

      {/* Comparison with Previous Month Alert */}
      {period === 'monthly' && metrics.previousMonthExpense > 0 && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-4 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center font-black ${
                metrics.monthExpenseChangePercent > 0
                  ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-600'
                  : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600'
              }`}
            >
              {metrics.monthExpenseChangePercent > 0 ? (
                <TrendingUp className="w-5 h-5" />
              ) : (
                <TrendingDown className="w-5 h-5" />
              )}
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-100">
                {t('previousMonthComparison')}
              </p>
              <p className="text-[11px] text-slate-500">
                {metrics.monthExpenseChangePercent > 0
                  ? settings.language === 'hi'
                    ? `पिछले महीने से ${metrics.monthExpenseChangePercent}% अधिक खर्च हुआ है`
                    : `Spending is ${metrics.monthExpenseChangePercent}% higher than last month`
                  : settings.language === 'hi'
                  ? `पिछले महीने से ${Math.abs(metrics.monthExpenseChangePercent)}% कम खर्च हुआ है (शानदार!)`
                  : `Spending is ${Math.abs(metrics.monthExpenseChangePercent)}% lower than last month (Great!)`}
              </p>
            </div>
          </div>
          <span
            className={`text-xs font-black px-2 py-1 rounded-xl ${
              metrics.monthExpenseChangePercent > 0
                ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
            }`}
          >
            {metrics.monthExpenseChangePercent > 0 ? '+' : ''}
            {metrics.monthExpenseChangePercent}%
          </span>
        </div>
      )}

      {/* Top Spending Categories Leaderboard */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-3">
        <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
          {t('highestSpendingCategories')}
        </h3>

        {topCategories.length === 0 ? (
          <p className="text-xs text-slate-400 py-4 text-center">
            {settings.language === 'hi' ? 'कोई खर्च नहीं मिला' : 'No expenses recorded in this period'}
          </p>
        ) : (
          <div className="space-y-3">
            {topCategories.map((item, index) => (
              <div key={item.id} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-5 font-bold text-slate-400 text-center">#{index + 1}</span>
                    <div
                      style={{ backgroundColor: `${item.cat?.color || '#059669'}20`, color: item.cat?.color }}
                      className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0"
                    >
                      <CategoryIcon name={item.cat?.icon || 'Tag'} size={14} />
                    </div>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {settings.language === 'hi' && item.cat?.nameHi ? item.cat.nameHi : item.cat?.name || 'Category'}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-slate-500 text-[11px] font-semibold">{item.percent}%</span>
                    <span className="font-extrabold text-slate-900 dark:text-white">
                      {formatCurrency(item.amount, sym, isIndian, true)}
                    </span>
                  </div>
                </div>

                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    style={{
                      width: `${item.percent}%`,
                      backgroundColor: item.cat?.color || '#059669',
                    }}
                    className="h-full rounded-full transition-all duration-500"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Printable Statement Modal */}
      {showPrintModal && (
        <PrintableStatement
          transactions={filtered}
          categories={categories}
          accounts={accounts}
          settings={settings}
          periodLabel={getPeriodLabel()}
          totalIncome={periodIncome}
          totalExpense={periodExpense}
          netSavings={netSavings}
          savingsRate={savingsRate}
          onClose={() => setShowPrintModal(false)}
        />
      )}
    </div>
  );
};
