import React, { useState } from 'react';
import {
  Banknote,
  Building2,
  CreditCard,
  Plus,
  Smartphone,
  Trash2,
  Wallet,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Account, AccountType } from '../../types';
import { formatCurrency } from '../../utils/formatters';

interface AccountManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AccountManagerModal: React.FC<AccountManagerModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { accounts, addAccount, deleteAccount, settings, t } = useApp();

  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState('');
  const [nameHi, setNameHi] = useState('');
  const [type, setType] = useState<AccountType>('bank');
  const [openingBalanceStr, setOpeningBalanceStr] = useState('0');
  const [accountNumberMasked, setAccountNumberMasked] = useState('');
  const [creditLimitStr, setCreditLimitStr] = useState('');

  if (!isOpen) return null;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const opBal = parseFloat(openingBalanceStr) || 0;
    const credLimit = creditLimitStr ? parseFloat(creditLimitStr) : undefined;

    let color = '#0284c7';
    let icon = 'Building2';
    if (type === 'cash') {
      color = '#16a34a';
      icon = 'Banknote';
    } else if (type === 'upi') {
      color = '#6366f1';
      icon = 'Smartphone';
    } else if (type === 'credit_card') {
      color = '#e11d48';
      icon = 'CreditCard';
    }

    addAccount({
      name: name.trim(),
      nameHi: nameHi.trim() || name.trim(),
      type,
      openingBalance: opBal,
      accountNumberMasked: accountNumberMasked.trim() || undefined,
      color,
      icon,
      creditLimit: credLimit,
    });

    setName('');
    setNameHi('');
    setOpeningBalanceStr('0');
    setAccountNumberMasked('');
    setCreditLimitStr('');
    setShowAddForm(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl p-5 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
              {t('accounts')}
            </h3>
            <p className="text-xs text-slate-500">
              {settings.language === 'hi' ? 'बैंक खाते, नकद, यूपीआई व कार्ड्स' : 'Bank accounts, cash, UPI & cards'}
            </p>
          </div>
          <button onClick={onClose} className="p-1 rounded-xl text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {!showAddForm ? (
          <button
            onClick={() => setShowAddForm(true)}
            className="w-full py-2.5 rounded-2xl border-2 border-dashed border-emerald-500/40 text-emerald-600 dark:text-emerald-400 text-xs font-bold hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors flex items-center justify-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>{t('addAccount')}</span>
          </button>
        ) : (
          <form
            onSubmit={handleCreate}
            className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3 animate-slide-up"
          >
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase">
              {t('addAccount')}
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-1">
                  {t('accountName')}
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Axis Salary A/C"
                  className="w-full p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-1">
                  {t('accountType')}
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as AccountType)}
                  className="w-full p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold"
                >
                  <option value="bank">{t('acc_bank')}</option>
                  <option value="cash">{t('acc_cash')}</option>
                  <option value="upi">{t('acc_upi')}</option>
                  <option value="credit_card">{t('acc_credit_card')}</option>
                  <option value="other">{t('acc_other')}</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-1">
                  {t('openingBalance')} (₹)
                </label>
                <input
                  type="number"
                  value={openingBalanceStr}
                  onChange={(e) => setOpeningBalanceStr(e.target.value)}
                  className="w-full p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-1">
                  Masked Number (Optional)
                </label>
                <input
                  type="text"
                  value={accountNumberMasked}
                  onChange={(e) => setAccountNumberMasked(e.target.value)}
                  placeholder="•••• 1234"
                  className="w-full p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold font-mono"
                />
              </div>
            </div>

            {type === 'credit_card' && (
              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-1">
                  {t('creditLimit')} (₹)
                </label>
                <input
                  type="number"
                  value={creditLimitStr}
                  onChange={(e) => setCreditLimitStr(e.target.value)}
                  placeholder="75000"
                  className="w-full p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold"
                />
              </div>
            )}

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="flex-1 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 font-bold text-xs"
              >
                {t('cancel')}
              </button>
              <button
                type="submit"
                className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
              >
                {t('confirm')}
              </button>
            </div>
          </form>
        )}

        {/* Existing Accounts List */}
        <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
          {accounts.map((acc) => (
            <div
              key={acc.id}
              className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  style={{ backgroundColor: `${acc.color}20`, color: acc.color }}
                  className="w-9 h-9 rounded-xl flex items-center justify-center font-bold shrink-0"
                >
                  {acc.type === 'credit_card' ? (
                    <CreditCard className="w-5 h-5" />
                  ) : acc.type === 'cash' ? (
                    <Banknote className="w-5 h-5" />
                  ) : acc.type === 'upi' ? (
                    <Smartphone className="w-5 h-5" />
                  ) : (
                    <Building2 className="w-5 h-5" />
                  )}
                </div>
                <div className="truncate">
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                    {acc.name}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    {acc.accountNumberMasked || acc.type.toUpperCase()}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold text-slate-900 dark:text-white">
                  {formatCurrency(acc.currentBalance, settings.currencySymbol, true)}
                </span>

                {accounts.length > 1 && (
                  <button
                    onClick={() => deleteAccount(acc.id)}
                    className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                    title="Delete Account"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
