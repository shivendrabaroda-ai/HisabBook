import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatCurrency } from '../../utils/formatters';
import { CategoryIcon } from '../common/CategoryIcon';

export const CategoryPieChart: React.FC = () => {
  const { metrics, categories, settings, t } = useApp();
  const [hoveredCatId, setHoveredCatId] = useState<string | null>(null);

  const spendingMap = metrics.categorySpendingThisMonth;
  const totalExpense = metrics.monthExpense || 1;

  // Filter categories with spending > 0
  const categoryBreakdown = categories
    .filter((c) => (spendingMap[c.id] || 0) > 0)
    .map((c) => ({
      ...c,
      amount: spendingMap[c.id] || 0,
      percent: Math.round(((spendingMap[c.id] || 0) / totalExpense) * 100),
    }))
    .sort((a, b) => b.amount - a.amount);

  // SVG Donut calculation
  const radius = 60;
  const strokeWidth = 24;
  const circumference = 2 * Math.PI * radius;
  let accumulatedAngle = 0;

  const slices = categoryBreakdown.map((item) => {
    const fraction = item.amount / totalExpense;
    const strokeDasharray = `${fraction * circumference} ${circumference}`;
    const strokeDashoffset = -accumulatedAngle;
    accumulatedAngle += fraction * circumference;

    return {
      ...item,
      strokeDasharray,
      strokeDashoffset,
    };
  });

  const activeCategory = categoryBreakdown.find((c) => c.id === hoveredCatId) || categoryBreakdown[0];

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-4 sm:p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
            {t('spendingByCategory')}
          </h3>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            {settings.language === 'hi' ? 'इस महीने का श्रेणीवार विभाजन' : 'This Month Breakdown'}
          </p>
        </div>
        <span className="text-xs font-bold text-slate-500">
          {categoryBreakdown.length} {settings.language === 'hi' ? 'श्रेणियां' : 'Categories'}
        </span>
      </div>

      {categoryBreakdown.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-sm text-slate-400">
            {settings.language === 'hi' ? 'इस महीने कोई खर्च दर्ज नहीं है' : 'No expenses recorded this month'}
          </p>
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row items-center gap-6">
          {/* Donut Chart */}
          <div className="relative w-44 h-44 shrink-0 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 160 160">
              {/* Background ring */}
              <circle
                cx="80"
                cy="80"
                r={radius}
                fill="none"
                stroke="currentColor"
                className="text-slate-100 dark:text-slate-800"
                strokeWidth={strokeWidth}
              />

              {/* Slices */}
              {slices.map((slice) => {
                const isHovered = hoveredCatId === slice.id;
                return (
                  <circle
                    key={slice.id}
                    cx="80"
                    cy="80"
                    r={radius}
                    fill="none"
                    stroke={slice.color || '#059669'}
                    strokeWidth={isHovered ? strokeWidth + 4 : strokeWidth}
                    strokeDasharray={slice.strokeDasharray}
                    strokeDashoffset={slice.strokeDashoffset}
                    className="transition-all duration-300 cursor-pointer"
                    onMouseEnter={() => setHoveredCatId(slice.id)}
                    onMouseLeave={() => setHoveredCatId(null)}
                  />
                );
              })}
            </svg>

            {/* Center Text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-4">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider truncate max-w-[90px]">
                {activeCategory
                  ? settings.language === 'hi' && activeCategory.nameHi
                    ? activeCategory.nameHi
                    : activeCategory.name
                  : t('expensesThisMonth')}
              </span>
              <span className="text-sm font-black text-slate-900 dark:text-white">
                {activeCategory
                  ? `${activeCategory.percent}%`
                  : formatCurrency(metrics.monthExpense, settings.currencySymbol, settings.numberFormat === 'indian', true)}
              </span>
              <span className="text-[10px] text-slate-500 font-medium">
                {activeCategory
                  ? formatCurrency(activeCategory.amount, settings.currencySymbol, settings.numberFormat === 'indian', true)
                  : ''}
              </span>
            </div>
          </div>

          {/* Category List */}
          <div className="w-full space-y-2 max-h-56 overflow-y-auto pr-1">
            {categoryBreakdown.map((item) => (
              <div
                key={item.id}
                onMouseEnter={() => setHoveredCatId(item.id)}
                onMouseLeave={() => setHoveredCatId(null)}
                className={`flex items-center justify-between p-2 rounded-xl transition-all cursor-pointer ${
                  hoveredCatId === item.id
                    ? 'bg-slate-100 dark:bg-slate-800 scale-[1.01]'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    style={{ backgroundColor: `${item.color}20`, color: item.color }}
                    className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                  >
                    <CategoryIcon name={item.icon} size={16} />
                  </div>
                  <div className="truncate">
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                      {settings.language === 'hi' && item.nameHi ? item.nameHi : item.name}
                    </p>
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                        <div
                          style={{ width: `${item.percent}%`, backgroundColor: item.color }}
                          className="h-full rounded-full"
                        />
                      </div>
                      <span className="text-[10px] font-semibold text-slate-500">
                        {item.percent}%
                      </span>
                    </div>
                  </div>
                </div>

                <span className="text-xs font-bold text-slate-900 dark:text-white shrink-0">
                  {formatCurrency(item.amount, settings.currencySymbol, settings.numberFormat === 'indian', true)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
