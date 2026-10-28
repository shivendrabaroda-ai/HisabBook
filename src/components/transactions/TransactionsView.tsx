import React, { useState } from 'react';
import {
  ArrowDownLeft,
  ArrowRightLeft,
  ArrowUpRight,
  Calendar,
  ChevronDown,
  Download,
  Filter,
  Image as ImageIcon,
  MoreVertical,
  Pencil,
  Plus,
  Receipt,
  RotateCcw,
  Search,
  Tag,
  Trash2,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Transaction, TransactionType } from '../../types';
import { exportToCsv, exportToExcel } from '../../utils/exporter';
import { formatCurrency, formatFriendlyDate } from '../../utils/formatters';
import { CategoryIcon } from '../common/CategoryIcon';

interface TransactionsViewProps {
  onOpenAddModal: () => void;
  onEditTransaction: (tx: Transaction) => void;
  onViewReceipt: (url: string) => void;
}

export const TransactionsView: React.FC<TransactionsViewProps> = ({
  onOpenAddModal,
  onEditTransaction,
  onViewReceipt,
}) => {
  const {
    transactions,
    categories,
    accounts,
    deleteTransaction,
    settings,
    filters,
    setFilters,
    resetFilters,
    t,
  } = useApp();

  const [showFiltersModal, setShowFiltersModal] = useState(false);
  const [selectedTxForAction, setSelectedTxForAction] = useState<Transaction | null>(null);
  const [deleteConfirmTx, setDeleteConfirmTx] = useState<Transaction | null>(null);

  const catMap = new Map(categories.map((c) => [c.id, c]));
  const accMap = new Map(accounts.map((a) => [a.id, a]));

  // Apply filters
  const filteredTransactions = transactions.filter((tx) => {
    // Type filter
    if (filters.type !== 'all' && tx.type !== filters.type) return false;

    // Category filter
    if (filters.categoryId && tx.categoryId !== filters.categoryId) return false;

    // Account filter
    if (filters.accountId && tx.accountId !== filters.accountId && tx.toAccountId !== filters.accountId) {
      return false;
    }

    // Payment method filter
    if (filters.paymentMethod && tx.paymentMethod !== filters.paymentMethod) return false;

    // Date range
    if (filters.startDate && tx.date.slice(0, 10) < filters.startDate) return false;
    if (filters.endDate && tx.date.slice(0, 10) > filters.endDate) return false;

    // Min / Max amount
    if (filters.minAmount !== undefined && tx.amount < filters.minAmount) return false;
    if (filters.maxAmount !== undefined && tx.amount > filters.maxAmount) return false;

    // Search query (checks description, tags, category name, account name, amount)
    if (filters.searchQuery.trim()) {
      const q = filters.searchQuery.toLowerCase().trim();
      const cat = catMap.get(tx.categoryId);
      const acc = accMap.get(tx.accountId);
      const matchDesc = (tx.description || '').toLowerCase().includes(q);
      const matchTags = (tx.tags || []).some((tag) => tag.toLowerCase().includes(q));
      const matchCat = cat && (cat.name.toLowerCase().includes(q) || cat.nameHi.toLowerCase().includes(q));
      const matchAcc = acc && (acc.name.toLowerCase().includes(q) || acc.nameHi.toLowerCase().includes(q));
      const matchAmount = String(tx.amount).includes(q);
      const matchMethod = tx.paymentMethod.toLowerCase().includes(q);

      if (!matchDesc && !matchTags && !matchCat && !matchAcc && !matchAmount && !matchMethod) {
        return false;
      }
    }

    return true;
  });

  // Apply sorting
  const sortedTransactions = [...filteredTransactions].sort((a, b) => {
    if (filters.sortBy === 'date_asc') return a.date.localeCompare(b.date);
    if (filters.sortBy === 'amount_desc') return b.amount - a.amount;
    if (filters.sortBy === 'amount_asc') return a.amount - b.amount;
    return b.date.localeCompare(a.date); // default date_desc
  });

  // Calculate filtered totals
  let filteredIncome = 0;
  let filteredExpense = 0;
  sortedTransactions.forEach((tx) => {
    if (tx.type === 'income') filteredIncome += tx.amount;
    if (tx.type === 'expense') filteredExpense += tx.amount;
  });

  const activeFiltersCount =
    (filters.type !== 'all' ? 1 : 0) +
    (filters.categoryId ? 1 : 0) +
    (filters.accountId ? 1 : 0) +
    (filters.paymentMethod ? 1 : 0) +
    (filters.startDate ? 1 : 0) +
    (filters.endDate ? 1 : 0) +
    (filters.searchQuery ? 1 : 0);

  const handleDelete = (id: string) => {
    deleteTransaction(id);
    setDeleteConfirmTx(null);
    setSelectedTxForAction(null);
  };

  return (
    <div className="space-y-4 pb-24">
      {/* Top Search & Filter Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-3 sm:p-4 shadow-sm space-y-3">
        <div className="flex items-center gap-2">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={filters.searchQuery}
              onChange={(e) => setFilters((prev) => ({ ...prev, searchQuery: e.target.value }))}
              placeholder={t('searchPlaceholder')}
              className="w-full pl-9 pr-9 py-2 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            {filters.searchQuery && (
              <button
                onClick={() => setFilters((prev) => ({ ...prev, searchQuery: '' }))}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filter Toggle Button */}
          <button
            onClick={() => setShowFiltersModal(true)}
            className={`p-2 sm:px-3 sm:py-2 rounded-2xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
              activeFiltersCount > 0
                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border-emerald-500'
                : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
            }`}
          >
            <Filter className="w-4 h-4" />
            <span className="hidden sm:inline">{t('filterByType')}</span>
            {activeFiltersCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-emerald-600 text-[10px] font-bold text-white flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
          </button>

          {/* Export CSV / Excel dropdown */}
          <button
            onClick={() => exportToCsv(sortedTransactions, categories, accounts)}
            className="p-2 sm:px-3 sm:py-2 rounded-2xl text-xs font-bold bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-all flex items-center gap-1.5"
            title="Download CSV"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">CSV</span>
          </button>
        </div>

        {/* Quick Type Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
          {(['all', 'expense', 'income', 'transfer'] as const).map((typeVal) => (
            <button
              key={typeVal}
              onClick={() => setFilters((prev) => ({ ...prev, type: typeVal }))}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold capitalize transition-all ${
                filters.type === typeVal
                  ? typeVal === 'expense'
                    ? 'bg-rose-500 text-white shadow-sm'
                    : typeVal === 'income'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : typeVal === 'transfer'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
              }`}
            >
              {typeVal === 'all'
                ? t('all')
                : typeVal === 'expense'
                ? t('expense')
                : typeVal === 'income'
                ? t('income')
                : t('transfer')}
            </button>
          ))}

          {activeFiltersCount > 0 && (
            <button
              onClick={resetFilters}
              className="px-2.5 py-1.5 rounded-xl text-xs font-bold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-1 transition-colors ml-auto"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{t('clearFilters')}</span>
            </button>
          )}
        </div>
      </div>

      {/* Summary of Filtered View */}
      <div className="bg-slate-100 dark:bg-slate-800/60 rounded-2xl px-4 py-2.5 flex items-center justify-between text-xs font-medium text-slate-600 dark:text-slate-300">
        <span>
          {sortedTransactions.length} {settings.language === 'hi' ? 'लेनदेन मिले' : 'transactions found'}
        </span>
        <div className="flex items-center gap-3">
          <span className="text-emerald-600 dark:text-emerald-400 font-bold">
            +{formatCurrency(filteredIncome, settings.currencySymbol, settings.numberFormat === 'indian', true)}
          </span>
          <span className="text-rose-600 dark:text-rose-400 font-bold">
            -{formatCurrency(filteredExpense, settings.currencySymbol, settings.numberFormat === 'indian', true)}
          </span>
        </div>
      </div>

      {/* Transactions List */}
      {sortedTransactions.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-8 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
            <Receipt className="w-6 h-6" />
          </div>
          <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{t('noResults')}</p>
          <button
            onClick={resetFilters}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
          >
            {t('clearFilters')}
          </button>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl divide-y divide-slate-100 dark:divide-slate-800/80 overflow-hidden shadow-sm">
          {sortedTransactions.map((tx) => {
            const cat = catMap.get(tx.categoryId);
            const sourceAcc = accMap.get(tx.accountId);
            const targetAcc = tx.toAccountId ? accMap.get(tx.toAccountId) : null;
            const isIncome = tx.type === 'income';
            const isTransfer = tx.type === 'transfer';

            return (
              <div
                key={tx.id}
                className="p-3.5 sm:p-4 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors flex items-center justify-between gap-3 group"
              >
                {/* Left side: Icon & Title & Meta */}
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
                    className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-sm"
                  >
                    {isTransfer ? (
                      <ArrowRightLeft className="w-5 h-5" />
                    ) : (
                      <CategoryIcon name={cat?.icon || 'Tag'} size={22} />
                    )}
                  </div>

                  <div className="min-w-0 space-y-0.5">
                    <div className="flex items-center gap-2">
                      <p className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-slate-100 truncate">
                        {isTransfer
                          ? settings.language === 'hi'
                            ? 'खाता ट्रांसफर'
                            : 'Account Transfer'
                          : settings.language === 'hi' && cat?.nameHi
                          ? cat.nameHi
                          : cat?.name || tx.description || 'Transaction'}
                      </p>

                      {tx.receiptUrl && (
                        <button
                          onClick={() => onViewReceipt(tx.receiptUrl!)}
                          className="p-1 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 hover:scale-110 transition-transform"
                          title="View Receipt"
                        >
                          <ImageIcon className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    {tx.description && (
                      <p className="text-[11px] text-slate-600 dark:text-slate-400 truncate max-w-xs">
                        {tx.description}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-slate-400 pt-0.5">
                      <span className="font-semibold text-slate-500">
                        {formatFriendlyDate(tx.date, settings.language)} {tx.time ? `• ${tx.time}` : ''}
                      </span>
                      <span>•</span>
                      <span className="px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 font-medium text-slate-600 dark:text-slate-300">
                        {isTransfer
                          ? `${sourceAcc?.name} → ${targetAcc?.name}`
                          : sourceAcc?.name || 'Account'}
                      </span>
                      <span>•</span>
                      <span className="uppercase text-[9px] font-bold text-slate-400">
                        {tx.paymentMethod}
                      </span>
                    </div>

                    {tx.tags && tx.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {tx.tags.map((tag) => (
                          <span
                            key={tag}
                            className="text-[9px] font-bold px-1.5 py-0.2 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right side: Amount & Action Buttons */}
                <div className="flex items-center gap-2 shrink-0">
                  <div className="text-right">
                    <p
                      className={`text-sm sm:text-base font-black flex items-center justify-end gap-0.5 ${
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
                    </p>
                  </div>

                  {/* Actions (Edit / Delete) */}
                  <div className="flex items-center gap-1 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => onEditTransaction(tx)}
                      className="p-1.5 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      title="Edit"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirmTx(tx)}
                      className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmTx && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-3xl p-5 shadow-2xl border border-slate-200 dark:border-slate-800 text-center space-y-3 animate-fade-in">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
              {t('deleteConfirmTitle')}
            </h3>
            <p className="text-xs text-slate-500">
              {t('deleteConfirmMsg')}
            </p>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setDeleteConfirmTx(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 font-bold text-xs text-slate-700 dark:text-slate-300"
              >
                {t('cancel')}
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmTx.id)}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 font-bold text-xs text-white"
              >
                {t('confirm')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detailed Filter Modal */}
      {showFiltersModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl p-5 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                {t('filterByType')}
              </h3>
              <button
                onClick={() => setShowFiltersModal(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Category Filter */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-500 uppercase">{t('category')}</label>
              <select
                value={filters.categoryId}
                onChange={(e) => setFilters((prev) => ({ ...prev, categoryId: e.target.value }))}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white"
              >
                <option value="">{settings.language === 'hi' ? 'सभी श्रेणियां' : 'All Categories'}</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {settings.language === 'hi' && c.nameHi ? c.nameHi : c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Account Filter */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-500 uppercase">{t('account')}</label>
              <select
                value={filters.accountId}
                onChange={(e) => setFilters((prev) => ({ ...prev, accountId: e.target.value }))}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white"
              >
                <option value="">{settings.language === 'hi' ? 'सभी खाते' : 'All Accounts'}</option>
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {settings.language === 'hi' && a.nameHi ? a.nameHi : a.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase">{t('startDate')}</label>
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => setFilters((prev) => ({ ...prev, startDate: e.target.value }))}
                  className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase">{t('endDate')}</label>
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => setFilters((prev) => ({ ...prev, endDate: e.target.value }))}
                  className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                />
              </div>
            </div>

            {/* Sort Order */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-500 uppercase">{t('sortBy')}</label>
              <select
                value={filters.sortBy}
                onChange={(e) => setFilters((prev) => ({ ...prev, sortBy: e.target.value as any }))}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white"
              >
                <option value="date_desc">{t('sortNewest')}</option>
                <option value="date_asc">{t('sortOldest')}</option>
                <option value="amount_desc">{t('sortHighest')}</option>
                <option value="amount_asc">{t('sortLowest')}</option>
              </select>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  resetFilters();
                  setShowFiltersModal(false);
                }}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 font-bold text-xs text-slate-700 dark:text-slate-300"
              >
                {t('clearFilters')}
              </button>
              <button
                type="button"
                onClick={() => setShowFiltersModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 font-bold text-xs text-white"
              >
                {t('applyFilters')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
