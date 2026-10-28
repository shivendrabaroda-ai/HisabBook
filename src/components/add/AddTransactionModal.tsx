import React, { useEffect, useState } from 'react';
import {
  ArrowRightLeft,
  Calendar,
  Camera,
  Check,
  Clock,
  Coins,
  CreditCard,
  MinusCircle,
  PlusCircle,
  Tag,
  Upload,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { PaymentMethod, Transaction, TransactionType } from '../../types';
import {
  getCurrentTimeString,
  getTodayDateString,
  numberToWordsIndian,
} from '../../utils/formatters';
import { CategoryIcon } from '../common/CategoryIcon';

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTransaction?: Transaction | null;
}

export const AddTransactionModal: React.FC<AddTransactionModalProps> = ({
  isOpen,
  onClose,
  initialTransaction,
}) => {
  const {
    categories,
    accounts,
    settings,
    addTransaction,
    updateTransaction,
    t,
  } = useApp();

  const [type, setType] = useState<TransactionType>('expense');
  const [amountStr, setAmountStr] = useState<string>('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [accountId, setAccountId] = useState<string>('');
  const [toAccountId, setToAccountId] = useState<string>('');
  const [date, setDate] = useState<string>(getTodayDateString());
  const [time, setTime] = useState<string>(getCurrentTimeString());
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('upi');
  const [description, setDescription] = useState<string>('');
  const [receiptUrl, setReceiptUrl] = useState<string>('');
  const [tagInput, setTagInput] = useState<string>('');
  const [tags, setTags] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Pre-fill when editing or opening
  useEffect(() => {
    if (initialTransaction) {
      setType(initialTransaction.type);
      setAmountStr(String(initialTransaction.amount));
      setCategoryId(initialTransaction.categoryId || '');
      setAccountId(initialTransaction.accountId);
      setToAccountId(initialTransaction.toAccountId || '');
      setDate(initialTransaction.date.slice(0, 10));
      setTime(initialTransaction.time || getCurrentTimeString());
      setPaymentMethod(initialTransaction.paymentMethod);
      setDescription(initialTransaction.description || '');
      setReceiptUrl(initialTransaction.receiptUrl || '');
      setTags(initialTransaction.tags || []);
    } else {
      // Default initial states
      setType('expense');
      setAmountStr('');
      const defaultExpCat = categories.find((c) => c.type === 'expense');
      setCategoryId(defaultExpCat ? defaultExpCat.id : '');
      const defaultAcc = accounts[0];
      setAccountId(defaultAcc ? defaultAcc.id : '');
      const secondAcc = accounts[1] || accounts[0];
      setToAccountId(secondAcc ? secondAcc.id : '');
      setDate(getTodayDateString());
      setTime(getCurrentTimeString());
      setPaymentMethod('upi');
      setDescription('');
      setReceiptUrl('');
      setTags([]);
    }
    setErrorMessage('');
  }, [initialTransaction, isOpen, categories, accounts]);

  // Adjust category if type changes
  useEffect(() => {
    if (!initialTransaction) {
      if (type === 'income') {
        const firstInc = categories.find((c) => c.type === 'income');
        if (firstInc) setCategoryId(firstInc.id);
      } else if (type === 'expense') {
        const firstExp = categories.find((c) => c.type === 'expense');
        if (firstExp) setCategoryId(firstExp.id);
      }
    }
  }, [type, categories, initialTransaction]);

  if (!isOpen) return null;

  const filteredCategories = categories.filter((c) => c.type === type);

  // File receipt upload handler
  const handleReceiptUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 3 * 1024 * 1024) {
        setErrorMessage(
          settings.language === 'hi'
            ? 'रसीद फोटो का आकार 3MB से कम होना चाहिए'
            : 'Receipt image size must be under 3MB'
        );
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setReceiptUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddTag = () => {
    if (!tagInput.trim()) return;
    const cleanTag = tagInput.trim().startsWith('#')
      ? tagInput.trim()
      : `#${tagInput.trim()}`;
    if (!tags.includes(cleanTag)) {
      setTags([...tags, cleanTag]);
    }
    setTagInput('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleQuickAddAmount = (addVal: number) => {
    const current = parseFloat(amountStr) || 0;
    setAmountStr(String(current + addVal));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amountStr);

    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setErrorMessage(
        settings.language === 'hi'
          ? 'कृपया एक वैध सकारात्मक राशि दर्ज करें'
          : 'Please enter a valid amount greater than 0'
      );
      return;
    }

    if (!accountId) {
      setErrorMessage(
        settings.language === 'hi' ? 'कृपया खाता चुनें' : 'Please select an account'
      );
      return;
    }

    if (type === 'transfer') {
      if (!toAccountId) {
        setErrorMessage(
          settings.language === 'hi'
            ? 'कृपया गंतव्य खाता चुनें'
            : 'Please select a destination account'
        );
        return;
      }
      if (accountId === toAccountId) {
        setErrorMessage(
          settings.language === 'hi'
            ? 'स्रोत और गंतव्य खाता समान नहीं हो सकते'
            : 'Source and destination accounts cannot be the same'
        );
        return;
      }
    }

    if (type !== 'transfer' && !categoryId) {
      setErrorMessage(
        settings.language === 'hi' ? 'कृपया श्रेणी चुनें' : 'Please select a category'
      );
      return;
    }

    if (initialTransaction) {
      updateTransaction({
        ...initialTransaction,
        type,
        amount: parsedAmount,
        categoryId: type === 'transfer' ? '' : categoryId,
        accountId,
        toAccountId: type === 'transfer' ? toAccountId : undefined,
        date,
        time,
        paymentMethod,
        description: description.trim(),
        receiptUrl: receiptUrl || undefined,
        tags,
      });
    } else {
      addTransaction({
        type,
        amount: parsedAmount,
        categoryId: type === 'transfer' ? '' : categoryId,
        accountId,
        toAccountId: type === 'transfer' ? toAccountId : undefined,
        date,
        time,
        paymentMethod,
        description: description.trim(),
        receiptUrl: receiptUrl || undefined,
        tags,
      });
    }

    onClose();
  };

  const parsedAmt = parseFloat(amountStr) || 0;
  const wordsRepresentation = numberToWordsIndian(parsedAmt, settings.language);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden max-h-[92vh] flex flex-col animate-slide-up">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white">
              {initialTransaction ? t('editTransaction') : t('addTransaction')}
            </h3>
            <p className="text-xs text-slate-500">
              {settings.language === 'hi'
                ? 'राशि, श्रेणी और खाता चुनें'
                : 'Enter details to update your accounts'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 overflow-y-auto space-y-4">
          {/* Transaction Type Tabs */}
          <div className="grid grid-cols-3 gap-1.5 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800">
            <button
              type="button"
              onClick={() => setType('expense')}
              className={`py-2 text-xs font-extrabold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                type === 'expense'
                  ? 'bg-rose-500 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <MinusCircle className="w-4 h-4" />
              <span>{t('expense')}</span>
            </button>

            <button
              type="button"
              onClick={() => setType('income')}
              className={`py-2 text-xs font-extrabold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                type === 'income'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <PlusCircle className="w-4 h-4" />
              <span>{t('income')}</span>
            </button>

            <button
              type="button"
              onClick={() => setType('transfer')}
              className={`py-2 text-xs font-extrabold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                type === 'transfer'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <ArrowRightLeft className="w-4 h-4" />
              <span>{t('transfer')}</span>
            </button>
          </div>

          {/* Amount Input with Currency Symbol */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
              {t('amount')} ({settings.currencySymbol} INR)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-black text-slate-400 dark:text-slate-500">
                ₹
              </span>
              <input
                type="number"
                step="any"
                min="0"
                required
                value={amountStr}
                onChange={(e) => setAmountStr(e.target.value)}
                placeholder="0.00"
                className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-2xl font-black text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-mono-numbers"
              />
            </div>

            {/* Indian Words representation */}
            {wordsRepresentation && (
              <p className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 italic px-1 pt-0.5">
                {wordsRepresentation}
              </p>
            )}

            {/* Quick Amount Add Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pt-1 pb-1 scrollbar-none">
              {[50, 100, 200, 500, 1000, 2000, 5000].map((chip) => (
                <button
                  type="button"
                  key={chip}
                  onClick={() => handleQuickAddAmount(chip)}
                  className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-[11px] font-bold text-slate-700 dark:text-slate-300 transition-colors shrink-0"
                >
                  +{chip}
                </button>
              ))}
            </div>
          </div>

          {/* Transfer Accounts Row or Single Account + Category */}
          {type === 'transfer' ? (
            <div className="space-y-3 p-3 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-900/50">
              <p className="text-xs text-blue-700 dark:text-blue-300 font-medium">
                {t('transferWarning')}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-500 block mb-1">
                    {t('fromAccount')}
                  </label>
                  <select
                    value={accountId}
                    onChange={(e) => setAccountId(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white"
                  >
                    {accounts.map((acc) => (
                      <option key={acc.id} value={acc.id}>
                        {settings.language === 'hi' && acc.nameHi ? acc.nameHi : acc.name} (₹{acc.currentBalance})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-500 block mb-1">
                    {t('toAccount')}
                  </label>
                  <select
                    value={toAccountId}
                    onChange={(e) => setToAccountId(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white"
                  >
                    {accounts.map((acc) => (
                      <option key={acc.id} value={acc.id}>
                        {settings.language === 'hi' && acc.nameHi ? acc.nameHi : acc.name} (₹{acc.currentBalance})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Category Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  {t('category')}
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-40 overflow-y-auto p-1">
                  {filteredCategories.map((cat) => {
                    const isSelected = categoryId === cat.id;
                    return (
                      <button
                        type="button"
                        key={cat.id}
                        onClick={() => setCategoryId(cat.id)}
                        className={`p-2 rounded-2xl border text-left flex flex-col items-center justify-center text-center transition-all ${
                          isSelected
                            ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 ring-2 ring-emerald-500/30'
                            : 'border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        <div
                          style={{ backgroundColor: `${cat.color}20`, color: cat.color }}
                          className="w-8 h-8 rounded-xl flex items-center justify-center mb-1"
                        >
                          <CategoryIcon name={cat.icon} size={16} />
                        </div>
                        <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 truncate w-full">
                          {settings.language === 'hi' && cat.nameHi ? cat.nameHi : cat.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Account Selector */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  {t('account')}
                </label>
                <select
                  value={accountId}
                  onChange={(e) => setAccountId(e.target.value)}
                  className="w-full p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white"
                >
                  {accounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {settings.language === 'hi' && acc.nameHi ? acc.nameHi : acc.name} (₹{acc.currentBalance})
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          {/* Date, Time & Payment Method */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <div>
              <label className="text-[11px] font-bold text-slate-500 block mb-1">
                {t('date')}
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-500 block mb-1">
                {t('time')}
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-500 block mb-1">
                {t('paymentMethod')}
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white"
              >
                <option value="upi">{t('method_upi')}</option>
                <option value="cash">{t('method_cash')}</option>
                <option value="netbanking">{t('method_netbanking')}</option>
                <option value="credit_card">{t('method_credit_card')}</option>
                <option value="debit_card">{t('method_debit_card')}</option>
                <option value="cheque">{t('method_cheque')}</option>
                <option value="other">{t('method_other')}</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
              {t('description')}
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('descriptionPlaceholder')}
              className="w-full p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
            />
          </div>

          {/* Tags */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
              {t('tags')}
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                placeholder="#office, #personal"
                className="flex-1 p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-3 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-xs font-bold rounded-xl transition-colors"
              >
                +
              </button>
            </div>

            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:text-rose-500"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Receipt Attachment */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
              {t('receiptAttachment')}
            </label>

            {receiptUrl ? (
              <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 max-h-40 group">
                <img src={receiptUrl} alt="Receipt preview" className="w-full h-36 object-cover" />
                <button
                  type="button"
                  onClick={() => setReceiptUrl('')}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-slate-900/80 text-white hover:bg-rose-600 transition-colors"
                  title="Remove Receipt"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-500 rounded-2xl cursor-pointer bg-slate-50/50 dark:bg-slate-800/30 transition-all">
                <Camera className="w-6 h-6 text-slate-400 mb-1" />
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                  {t('attachReceipt')}
                </span>
                <span className="text-[10px] text-slate-400">PNG, JPG up to 3MB</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleReceiptUpload}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* Error display */}
          {errorMessage && (
            <p className="text-xs text-rose-500 font-bold p-2 rounded-xl bg-rose-50 dark:bg-rose-950/40">
              {errorMessage}
            </p>
          )}

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-extrabold text-sm shadow-lg shadow-emerald-500/25 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4" />
              <span>
                {initialTransaction ? t('updateTransaction') : t('saveTransaction')}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
