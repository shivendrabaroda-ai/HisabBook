import React from 'react';
import { ArrowDownLeft, ArrowRight, ArrowRightLeft, ArrowUpRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Transaction } from '../../types';
import { formatCurrency, formatFriendlyDate } from '../../utils/formatters';
import { CategoryIcon } from '../common/CategoryIcon';

interface RecentTransactionsListProps {
  onSelectTransaction: (tx: Transaction) => void;
}

export const RecentTransactionsList: React.FC<RecentTransactionsListProps> = ({
  onSelectTransaction,
}) => {
  const { transactions, categories, accounts, settings, setActiveTab, t } = useApp();

  const recent = transactions.slice(0, 6);
  const catMap = new Map(categories.map((c) => [c.id, c]));
  const accMap = new Map(accounts.map((a) => [a.id, a]));

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-4 sm:p-5 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
          {t('recentTransactions')}
        </h3>
        <button
          onClick={() => setActiveTab('transactions')}
          className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 flex items-center gap-1 group"
        >
          <span>{t('viewAll')}</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {recent.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-xs text-slate-400">{t('noRecentTransactions')}</p>
        </div>
      ) : (
        <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
          {recent.map((tx) => {
            const cat = catMap.get(tx.categoryId);
            const sourceAcc = accMap.get(tx.accountId);
            const targetAcc = tx.toAccountId ? accMap.get(tx.toAccountId) : null;

            const isIncome = tx.type === 'income';
            const isTransfer = tx.type === 'transfer';

            return (
              <div
                key={tx.id}
                onClick={() => onSelectTransaction(tx)}
                className="py-3 flex items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/40 px-2 rounded-2xl transition-colors cursor-pointer group"
              >
                {/* Left icon & text */}
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    style={{
                      backgroundColor: isTransfer
                        ? '#3b82f620'
                        : cat
                        ? `${cat.color}20`
                        : '#10b98120',
                      color: isTransfer ? '#2563eb' : cat ? cat.color : '#059669',
                    }}
                    className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-sm"
                  >
                    {isTransfer ? (
                      <ArrowRightLeft className="w-5 h-5" />
                    ) : (
                      <CategoryIcon name={cat?.icon || 'Tag'} size={20} />
                    )}
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      {isTransfer
                        ? settings.language === 'hi'
                          ? 'खाता ट्रांसफर'
                          : 'Account Transfer'
                        : settings.language === 'hi' && cat?.nameHi
                        ? cat.nameHi
                        : cat?.name || tx.description || 'Transaction'}
                    </p>

                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      <span>{formatFriendlyDate(tx.date, settings.language)}</span>
                      <span>•</span>
                      <span className="truncate max-w-[120px] font-medium text-slate-600 dark:text-slate-300">
                        {isTransfer
                          ? `${sourceAcc?.name} → ${targetAcc?.name}`
                          : sourceAcc?.name || 'Account'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right Amount */}
                <div className="text-right shrink-0">
                  <div
                    className={`text-xs sm:text-sm font-extrabold flex items-center justify-end gap-0.5 ${
                      isIncome
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : isTransfer
                        ? 'text-blue-600 dark:text-blue-400'
                        : 'text-slate-900 dark:text-white'
                    }`}
                  >
                    {isIncome && <ArrowDownLeft className="w-3.5 h-3.5" />}
                    {isTransfer && <ArrowRightLeft className="w-3 h-3" />}
                    {!isIncome && !isTransfer && <ArrowUpRight className="w-3.5 h-3.5 text-rose-500" />}
                    <span>
                      {isIncome ? '+' : !isTransfer ? '-' : ''}
                      {formatCurrency(tx.amount, settings.currencySymbol, settings.numberFormat === 'indian', true)}
                    </span>
                  </div>

                  {tx.tags && tx.tags.length > 0 && (
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 block truncate max-w-[90px]">
                      {tx.tags[0]}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
