import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatCompactCurrency, formatCurrency } from '../../utils/formatters';

export const IncomeExpenseChart: React.FC = () => {
  const { transactions, settings, t } = useApp();
  const [hoveredMonth, setHoveredMonth] = useState<string | null>(null);

  // Compute last 6 months data from actual transactions
  const monthNamesEn = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthNamesHi = ['जन', 'फर', 'मार्च', 'अप्रै', 'मई', 'जून', 'जुला', 'अग', 'सितं', 'अक्टू', 'नव', 'दिसं'];

  const now = new Date();
  const monthsData = [];

  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const y = d.getFullYear();
    const m = d.getMonth();
    const key = `${y}-${String(m + 1).padStart(2, '0')}`;
    const label = settings.language === 'hi' ? `${monthNamesHi[m]} ${y % 100}` : `${monthNamesEn[m]} '${y % 100}`;

    let income = 0;
    let expense = 0;

    transactions.forEach((tx) => {
      if (tx.date.startsWith(key)) {
        if (tx.type === 'income') income += tx.amount;
        if (tx.type === 'expense') expense += tx.amount;
      }
    });

    monthsData.push({
      key,
      label,
      income,
      expense,
      savings: income - expense,
    });
  }

  // Find max value for scaling
  const maxVal = Math.max(...monthsData.map((m) => Math.max(m.income, m.expense)), 5000);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-4 sm:p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
            {t('incomeVsExpense')}
          </h3>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            {settings.language === 'hi' ? 'पिछले 6 महीनों का वित्तीय रुझान' : '6-Month Cash Flow Trend'}
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="text-slate-600 dark:text-slate-300 font-medium">{t('income')}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <span className="text-slate-600 dark:text-slate-300 font-medium">{t('expense')}</span>
          </div>
        </div>
      </div>

      {/* SVG Bar Chart */}
      <div className="h-44 sm:h-52 w-full flex items-end justify-between gap-2 sm:gap-4 pt-6 pb-2 px-1 border-b border-slate-100 dark:border-slate-800">
        {monthsData.map((m) => {
          const incHeight = Math.max(Math.round((m.income / maxVal) * 100), 4);
          const expHeight = Math.max(Math.round((m.expense / maxVal) * 100), 4);
          const isHovered = hoveredMonth === m.key;

          return (
            <div
              key={m.key}
              onMouseEnter={() => setHoveredMonth(m.key)}
              onMouseLeave={() => setHoveredMonth(null)}
              className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer relative"
            >
              {/* Tooltip on hover */}
              {isHovered && (
                <div className="absolute -top-12 z-20 bg-slate-900 dark:bg-slate-800 text-white text-[11px] font-medium py-1.5 px-2.5 rounded-xl shadow-xl whitespace-nowrap border border-slate-700 pointer-events-none">
                  <div className="text-emerald-400">
                    +{formatCurrency(m.income, settings.currencySymbol, settings.numberFormat === 'indian', true)}
                  </div>
                  <div className="text-rose-400">
                    -{formatCurrency(m.expense, settings.currencySymbol, settings.numberFormat === 'indian', true)}
                  </div>
                </div>
              )}

              {/* Bars side by side */}
              <div className="w-full max-w-[48px] flex items-end justify-center gap-1 sm:gap-1.5 h-full">
                {/* Income Bar */}
                <div
                  style={{ height: `${incHeight}%` }}
                  className="w-1/2 bg-gradient-to-t from-emerald-600 to-emerald-400 hover:from-emerald-500 hover:to-emerald-300 rounded-t-md transition-all duration-300 shadow-sm"
                  title={`Income: ₹${m.income}`}
                />
                {/* Expense Bar */}
                <div
                  style={{ height: `${expHeight}%` }}
                  className="w-1/2 bg-gradient-to-t from-rose-600 to-rose-400 hover:from-rose-500 hover:to-rose-300 rounded-t-md transition-all duration-300 shadow-sm"
                  title={`Expense: ₹${m.expense}`}
                />
              </div>

              {/* Month label */}
              <span className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 font-semibold mt-2 truncate w-full text-center">
                {m.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Quick summary below chart */}
      <div className="flex items-center justify-between pt-3 text-xs">
        <span className="text-slate-500 dark:text-slate-400">
          {settings.language === 'hi' ? 'औसत मासिक बचत' : 'Avg. Monthly Savings'}
        </span>
        <span className="font-bold text-slate-800 dark:text-slate-200">
          {formatCurrency(
            monthsData.reduce((acc, curr) => acc + curr.savings, 0) / monthsData.length,
            settings.currencySymbol,
            settings.numberFormat === 'indian'
          )}
        </span>
      </div>
    </div>
  );
};
