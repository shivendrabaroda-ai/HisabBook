import React, { useState } from 'react';
import {
  AlertCircle,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  Landmark,
  Plus,
  Trash2,
  X,
  XCircle,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { PaymentMethod, RecurrenceFrequency, RecurringBill } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import { CategoryIcon } from '../common/CategoryIcon';

export const RecurringBillsView: React.FC = () => {
  const {
    recurringBills,
    categories,
    accounts,
    addRecurringBill,
    deleteRecurringBill,
    toggleRecurringBillPaid,
    settings,
    t,
  } = useApp();

  const [showAddModal, setShowAddModal] = useState(false);
  const [payPromptBill, setPayPromptBill] = useState<RecurringBill | null>(null);
  const [selectedPayAccount, setSelectedPayAccount] = useState<string>(accounts[0]?.id || '');

  // Add form states
  const [title, setTitle] = useState('');
  const [amountStr, setAmountStr] = useState('');
  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [categoryId, setCategoryId] = useState('');
  const [accountId, setAccountId] = useState(accounts[0]?.id || '');
  const [frequency, setFrequency] = useState<RecurrenceFrequency>('monthly');
  const [dueDay, setDueDay] = useState(5);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('upi');
  const [notes, setNotes] = useState('');

  const catMap = new Map(categories.map((c) => [c.id, c]));
  const accMap = new Map(accounts.map((a) => [a.id, a]));
  const isIndian = settings.numberFormat === 'indian';
  const sym = settings.currencySymbol;

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(amountStr);
    if (!title.trim() || isNaN(amt) || amt <= 0) return;

    const defaultCat = categories.find((c) => c.type === type);
    const chosenCatId = categoryId || (defaultCat ? defaultCat.id : '');

    addRecurringBill({
      title: title.trim(),
      titleHi: title.trim(),
      amount: amt,
      type,
      categoryId: chosenCatId,
      accountId,
      frequency,
      dueDay,
      nextDueDate: `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(dueDay).padStart(2, '0')}`,
      isPaidForCurrentPeriod: false,
      paymentMethod,
      notes: notes.trim(),
    });

    setTitle('');
    setAmountStr('');
    setNotes('');
    setShowAddModal(false);
  };

  const handleTogglePaidClick = (bill: RecurringBill) => {
    if (bill.isPaidForCurrentPeriod) {
      // Toggle back to unpaid
      toggleRecurringBillPaid(bill.id, false);
    } else {
      // Prompt user: record as real transaction now?
      setPayPromptBill(bill);
      setSelectedPayAccount(bill.accountId || accounts[0]?.id);
    }
  };

  const confirmMarkPaidWithTransaction = (recordTx: boolean) => {
    if (!payPromptBill) return;
    toggleRecurringBillPaid(payPromptBill.id, recordTx, selectedPayAccount);
    setPayPromptBill(null);
  };

  return (
    <div className="space-y-4 pb-24">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 shadow-sm flex items-center justify-between">
        <div>
          <h2 className="text-lg font-black text-slate-900 dark:text-white">
            {t('recurringTitle')}
          </h2>
          <p className="text-xs text-slate-500">
            {settings.language === 'hi'
              ? 'किराया, ऋण ईएमआई, सब्सक्रिप्शन और वेतन ट्रैक करें'
              : 'Track room rent, loan EMIs, insurance, subscriptions, and salary'}
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-3.5 py-2 rounded-2xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 flex items-center gap-1.5 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>{t('addRecurring')}</span>
        </button>
      </div>

      {/* Bill List */}
      {recurringBills.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-8 text-center space-y-3">
          <Calendar className="w-10 h-10 text-slate-400 mx-auto" />
          <p className="text-xs text-slate-500">
            {settings.language === 'hi'
              ? 'कोई आवर्ती बिल या ईएमआई नहीं मिला'
              : 'No recurring bills or EMIs added yet.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {recurringBills.map((bill) => {
            const cat = catMap.get(bill.categoryId);
            const acc = accMap.get(bill.accountId);
            const isPaid = bill.isPaidForCurrentPeriod;

            return (
              <div
                key={bill.id}
                className={`bg-white dark:bg-slate-900 border rounded-3xl p-4 shadow-sm space-y-3 transition-all ${
                  isPaid
                    ? 'border-emerald-300 dark:border-emerald-900/50 bg-emerald-50/20'
                    : 'border-slate-200/80 dark:border-slate-800'
                }`}
              >
                {/* Header row */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      style={{ backgroundColor: `${cat?.color || '#059669'}20`, color: cat?.color || '#059669' }}
                      className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0"
                    >
                      <CategoryIcon name={cat?.icon || 'CalendarClock'} size={20} />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                        {settings.language === 'hi' && bill.titleHi ? bill.titleHi : bill.title}
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        {settings.language === 'hi' ? `प्रत्येक महीने की ${bill.dueDay} तारीख` : `Due on ${bill.dueDay}th of month`}
                      </p>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                      isPaid
                        ? 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-400 border border-emerald-300/50'
                        : 'bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border border-amber-300/50'
                    }`}
                  >
                    {isPaid ? t('paidStatus') : t('unpaidStatus')}
                  </span>
                </div>

                {/* Amount and Account */}
                <div className="flex items-baseline justify-between pt-1">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">
                      {bill.type === 'income' ? t('income') : t('amount')}
                    </span>
                    <span className="text-lg font-black text-slate-900 dark:text-white">
                      {formatCurrency(bill.amount, sym, isIndian, true)}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">
                      {t('account')}
                    </span>
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                      {acc?.name || 'Main Account'}
                    </span>
                  </div>
                </div>

                {bill.notes && (
                  <p className="text-[11px] text-slate-500 bg-slate-50 dark:bg-slate-800/50 p-2 rounded-xl">
                    {bill.notes}
                  </p>
                )}

                {/* Action buttons */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => handleTogglePaidClick(bill)}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                      isPaid
                        ? 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'
                    }`}
                  >
                    {isPaid ? <XCircle className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                    <span>{isPaid ? t('markUnpaid') : t('markPaid')}</span>
                  </button>

                  <button
                    onClick={() => deleteRecurringBill(bill.id)}
                    className="p-2 ml-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                    title="Delete recurring bill"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pay Prompt Modal: Record transaction or just toggle status */}
      {payPromptBill && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-3xl p-5 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 animate-slide-up">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>

            <div className="text-center">
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                {t('recordPaymentPrompt')}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                {payPromptBill.title} - {formatCurrency(payPromptBill.amount, sym, isIndian, true)}
              </p>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-500 uppercase">{t('account')}</label>
              <select
                value={selectedPayAccount}
                onChange={(e) => setSelectedPayAccount(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white"
              >
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} (Balance: ₹{a.currentBalance})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <button
                onClick={() => confirmMarkPaidWithTransaction(true)}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 font-bold text-xs text-white"
              >
                {settings.language === 'hi' ? 'हाँ, लेनदेन दर्ज करें' : 'Yes, record transaction & mark paid'}
              </button>
              <button
                onClick={() => confirmMarkPaidWithTransaction(false)}
                className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 font-bold text-xs text-slate-700 dark:text-slate-300"
              >
                {settings.language === 'hi' ? 'केवल भुगतान चिह्नित करें (लेनदेन के बिना)' : 'Mark paid only (No transaction)'}
              </button>
              <button
                onClick={() => setPayPromptBill(null)}
                className="w-full py-1.5 text-xs text-slate-400 hover:text-slate-600 font-semibold"
              >
                {t('cancel')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Recurring Bill Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleAddSubmit}
            className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl p-5 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                {t('addRecurring')}
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-1">
                {settings.language === 'hi' ? 'शीर्षक' : 'Title (e.g. Room Rent, Car EMI)'}
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="House Rent"
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-1">
                  {t('amount')} (₹)
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={amountStr}
                  onChange={(e) => setAmountStr(e.target.value)}
                  placeholder="12000"
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-1">
                  {settings.language === 'hi' ? 'देय दिन (Due Day)' : 'Due Day (1 - 31)'}
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  max="31"
                  value={dueDay}
                  onChange={(e) => setDueDay(parseInt(e.target.value) || 1)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-1">
                  {t('category')}
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-1">
                  {t('account')}
                </label>
                <select
                  value={accountId}
                  onChange={(e) => setAccountId(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white"
                >
                  {accounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-1">
                {settings.language === 'hi' ? 'नोट्स' : 'Notes / Description'}
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Auto debit on 5th"
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 font-bold text-xs text-slate-700 dark:text-slate-300"
              >
                {t('cancel')}
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 font-bold text-xs text-white"
              >
                {t('confirm')}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
