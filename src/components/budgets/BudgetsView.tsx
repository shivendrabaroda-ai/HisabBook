import React, { useState } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  Check,
  ChevronRight,
  CircleAlert,
  Flame,
  Pencil,
  Plus,
  Save,
  Sliders,
  TrendingDown,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatCurrency } from '../../utils/formatters';
import { CategoryIcon } from '../common/CategoryIcon';

export const BudgetsView: React.FC = () => {
  const {
    categories,
    budgetConfig,
    updateBudgetConfig,
    metrics,
    settings,
    t,
  } = useApp();

  const [isEditing, setIsEditing] = useState(false);
  const [overallBudgetStr, setOverallBudgetStr] = useState(String(budgetConfig.monthlyOverallBudget));
  const [dailyLimitStr, setDailyLimitStr] = useState(String(budgetConfig.dailySpendingLimit));
  const [catBudgets, setCatBudgets] = useState<Record<string, number>>(budgetConfig.categoryBudgets || {});
  const [savedSuccess, setSavedSuccess] = useState(false);

  const expenseCategories = categories.filter((c) => c.type === 'expense');
  const spendingMap = metrics.categorySpendingThisMonth;
  const isIndian = settings.numberFormat === 'indian';
  const sym = settings.currencySymbol;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const overall = parseFloat(overallBudgetStr) || 0;
    const daily = parseFloat(dailyLimitStr) || 0;

    updateBudgetConfig({
      monthlyOverallBudget: overall,
      dailySpendingLimit: daily,
      categoryBudgets: catBudgets,
    });

    setIsEditing(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleCatBudgetChange = (catId: string, val: string) => {
    const num = parseFloat(val) || 0;
    setCatBudgets((prev) => ({
      ...prev,
      [catId]: num,
    }));
  };

  return (
    <div className="space-y-4 pb-24">
      {/* Top Header Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 shadow-sm flex items-center justify-between">
        <div>
          <h2 className="text-lg font-black text-slate-900 dark:text-white">
            {t('budgetTitle')}
          </h2>
          <p className="text-xs text-slate-500">
            {settings.language === 'hi'
              ? 'खर्च पर नियंत्रण रखें और बचत बढ़ाएं'
              : 'Track spending limits, prevent overspending, and reach savings goals'}
          </p>
        </div>

        <button
          onClick={() => {
            if (isEditing) {
              setIsEditing(false);
            } else {
              setOverallBudgetStr(String(budgetConfig.monthlyOverallBudget));
              setDailyLimitStr(String(budgetConfig.dailySpendingLimit));
              setCatBudgets(budgetConfig.categoryBudgets || {});
              setIsEditing(true);
            }
          }}
          className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            isEditing
              ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
              : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>{isEditing ? t('cancel') : t('setBudgets')}</span>
        </button>
      </div>

      {savedSuccess && (
        <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 p-3 rounded-2xl text-xs font-bold flex items-center gap-2 animate-fade-in">
          <Check className="w-4 h-4" />
          <span>
            {settings.language === 'hi'
              ? 'बजट सफलतापूर्वक सहेज लिया गया!'
              : 'Budgets updated successfully!'}
          </span>
        </div>
      )}

      {/* Editing Form */}
      {isEditing && (
        <form
          onSubmit={handleSave}
          className="bg-white dark:bg-slate-900 border-2 border-emerald-500/40 rounded-3xl p-5 shadow-lg space-y-4 animate-slide-up"
        >
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
              {settings.language === 'hi' ? 'बजट सेटिंग्स संपादित करें' : 'Configure Budget Limits'}
            </h3>
            <span className="text-xs text-slate-400">INR (₹)</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-1">
                {t('overallMonthlyBudget')} (₹)
              </label>
              <input
                type="number"
                min="0"
                value={overallBudgetStr}
                onChange={(e) => setOverallBudgetStr(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-sm text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-1">
                {t('dailySpendingLimit')} (₹)
              </label>
              <input
                type="number"
                min="0"
                value={dailyLimitStr}
                onChange={(e) => setDailyLimitStr(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-sm text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* Category-wise Budgets */}
          <div className="space-y-2 pt-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              {settings.language === 'hi' ? 'श्रेणीवार मासिक सीमाएं' : 'Category-wise Limits (Optional)'}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-60 overflow-y-auto pr-1">
              {expenseCategories.map((cat) => {
                const currentBudgetVal = catBudgets[cat.id] || '';
                return (
                  <div
                    key={cat.id}
                    className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60"
                  >
                    <div className="flex items-center gap-2 min-w-0 pr-2">
                      <div
                        style={{ backgroundColor: `${cat.color}20`, color: cat.color }}
                        className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                      >
                        <CategoryIcon name={cat.icon} size={15} />
                      </div>
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                        {settings.language === 'hi' && cat.nameHi ? cat.nameHi : cat.name}
                      </span>
                    </div>

                    <div className="relative w-28 shrink-0">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-bold">
                        ₹
                      </span>
                      <input
                        type="number"
                        placeholder="Limit"
                        value={currentBudgetVal}
                        onChange={(e) => handleCatBudgetChange(cat.id, e.target.value)}
                        className="w-full pl-6 pr-2 py-1 text-xs font-bold rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 font-bold text-xs text-slate-700 dark:text-slate-300"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 font-bold text-xs text-white flex items-center justify-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>{t('saveBudgets')}</span>
            </button>
          </div>
        </form>
      )}

      {/* Main Overall Monthly Budget Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              {t('overallMonthlyBudget')}
            </span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-2xl font-black text-slate-900 dark:text-white">
                {formatCurrency(budgetConfig.monthlyOverallBudget, sym, isIndian, true)}
              </span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              {t('budgetRemaining')}
            </span>
            <p
              className={`text-lg font-black ${
                metrics.remainingMonthlyBudget >= 0
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-rose-600 dark:text-rose-400'
              }`}
            >
              {formatCurrency(metrics.remainingMonthlyBudget, sym, isIndian, true)}
            </p>
          </div>
        </div>

        {/* Progress bar */}
        <div>
          <div className="flex justify-between text-xs font-bold mb-1.5">
            <span className="text-slate-600 dark:text-slate-400">
              {settings.language === 'hi' ? 'उपयोग:' : 'Utilization:'}{' '}
              {formatCurrency(metrics.monthExpense, sym, isIndian, true)}
            </span>
            <span
              className={
                metrics.budgetUsagePercent >= 100
                  ? 'text-rose-600 font-black'
                  : metrics.budgetUsagePercent >= 90
                  ? 'text-rose-500'
                  : metrics.budgetUsagePercent >= 75
                  ? 'text-amber-500'
                  : 'text-emerald-600'
              }
            >
              {metrics.budgetUsagePercent}%
            </span>
          </div>

          <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden p-0.5 border border-slate-200/40 dark:border-slate-700/50">
            <div
              style={{ width: `${Math.min(metrics.budgetUsagePercent, 100)}%` }}
              className={`h-full rounded-full transition-all duration-500 ${
                metrics.budgetUsagePercent >= 100
                  ? 'bg-rose-600'
                  : metrics.budgetUsagePercent >= 90
                  ? 'bg-rose-500'
                  : metrics.budgetUsagePercent >= 75
                  ? 'bg-amber-500'
                  : 'bg-emerald-500'
              }`}
            />
          </div>
        </div>

        {/* Daily limit badge */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
          <span className="text-slate-500 font-medium">
            {t('dailySpendingLimit')}: <b>{formatCurrency(budgetConfig.dailySpendingLimit, sym, isIndian, true)}</b>
          </span>
          <span className="text-slate-500 font-medium">
            {settings.language === 'hi' ? 'आज का खर्च:' : "Today's Spent:"}{' '}
            <b className={metrics.dailyOverspend ? 'text-rose-600' : 'text-slate-900 dark:text-white'}>
              {formatCurrency(metrics.todayExpense, sym, isIndian, true)}
            </b>
          </span>
        </div>
      </div>

      {/* Category-wise Budget Cards */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 px-1">
          {settings.language === 'hi' ? 'श्रेणीवार बजट स्थिति' : 'Category Budget Status'}
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {expenseCategories.map((cat) => {
            const limit = budgetConfig.categoryBudgets?.[cat.id] || cat.budgetLimit || 0;
            const spent = spendingMap[cat.id] || 0;
            if (limit <= 0 && spent <= 0) return null;

            const usagePercent = limit > 0 ? Math.min(Math.round((spent / limit) * 100), 999) : 0;
            const remaining = limit - spent;

            let barColor = 'bg-emerald-500';
            let warningBadge = null;

            if (limit > 0) {
              if (usagePercent >= 100) {
                barColor = 'bg-rose-600';
                warningBadge = (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300 flex items-center gap-1">
                    <CircleAlert className="w-3 h-3" />
                    100% {t('overBudget')}
                  </span>
                );
              } else if (usagePercent >= 90) {
                barColor = 'bg-rose-500';
                warningBadge = (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    90% Limit
                  </span>
                );
              } else if (usagePercent >= 75) {
                barColor = 'bg-amber-500';
                warningBadge = (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    75% Limit
                  </span>
                );
              }
            }

            return (
              <div
                key={cat.id}
                className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-sm space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      style={{ backgroundColor: `${cat.color}20`, color: cat.color }}
                      className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                    >
                      <CategoryIcon name={cat.icon} size={18} />
                    </div>
                    <div className="truncate">
                      <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                        {settings.language === 'hi' && cat.nameHi ? cat.nameHi : cat.name}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        {limit > 0
                          ? `${settings.language === 'hi' ? 'बजट:' : 'Budget:'} ${formatCurrency(limit, sym, isIndian, true)}`
                          : settings.language === 'hi' ? 'कोई सीमा तय नहीं' : 'No limit set'}
                      </p>
                    </div>
                  </div>

                  {warningBadge}
                </div>

                {limit > 0 && (
                  <div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${Math.min(usagePercent, 100)}%` }}
                        className={`h-full rounded-full transition-all duration-300 ${barColor}`}
                      />
                    </div>
                    <div className="flex justify-between items-center text-[10px] font-medium text-slate-500 mt-1">
                      <span>
                        {settings.language === 'hi' ? 'खर्च:' : 'Spent:'}{' '}
                        {formatCurrency(spent, sym, isIndian, true)}
                      </span>
                      <span className={remaining < 0 ? 'text-rose-600 font-bold' : ''}>
                        {remaining >= 0
                          ? `${formatCurrency(remaining, sym, isIndian, true)} ${settings.language === 'hi' ? 'बाकी' : 'left'}`
                          : `${formatCurrency(Math.abs(remaining), sym, isIndian, true)} ${settings.language === 'hi' ? 'अतिरिक्त खर्च' : 'over'}`}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
