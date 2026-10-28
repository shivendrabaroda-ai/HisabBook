import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  Car,
  Check,
  Coffee,
  Fuel,
  Milk,
  ShoppingBag,
  Train,
  Utensils,
  Zap,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { getCurrentTimeString, getTodayDateString } from '../../utils/formatters';

interface QuickPreset {
  labelEn: string;
  labelHi: string;
  amount: number;
  categoryId: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  color: string;
}

export const QuickAddBar: React.FC = () => {
  const { addTransaction, accounts, settings, t } = useApp();
  const [recentlyAdded, setRecentlyAdded] = useState<string | null>(null);

  const presets: QuickPreset[] = [
    {
      labelEn: 'Chai & Snacks',
      labelHi: 'चाय व नाश्ता',
      amount: 25,
      categoryId: 'cat_chai',
      icon: Coffee,
      description: 'Chai & biscuits snack',
      color: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-300/40',
    },
    {
      labelEn: 'Auto / Cab',
      labelHi: 'ऑटो / कैब',
      amount: 60,
      categoryId: 'cat_travel',
      icon: Car,
      description: 'Auto / Ride fare',
      color: 'bg-sky-500/10 text-sky-700 dark:text-sky-400 border-sky-300/40',
    },
    {
      labelEn: 'Metro',
      labelHi: 'मेट्रो टिकट',
      amount: 40,
      categoryId: 'cat_travel',
      icon: Train,
      description: 'Metro ride fare',
      color: 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border-cyan-300/40',
    },
    {
      labelEn: 'Lunch / Thali',
      labelHi: 'दोपहर का भोजन',
      amount: 150,
      categoryId: 'cat_food',
      icon: Utensils,
      description: 'Lunch thali meal',
      color: 'bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-300/40',
    },
    {
      labelEn: 'Petrol / Fuel',
      labelHi: 'पेट्रोल ईंधन',
      amount: 200,
      categoryId: 'cat_travel',
      icon: Fuel,
      description: 'Petrol top-up',
      color: 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-300/40',
    },
    {
      labelEn: 'Milk & Bread',
      labelHi: 'दूध व ब्रेड',
      amount: 65,
      categoryId: 'cat_food',
      icon: Milk,
      description: 'Daily fresh milk & bread',
      color: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-300/40',
    },
    {
      labelEn: 'Groceries',
      labelHi: 'किराना सामान',
      amount: 500,
      categoryId: 'cat_food',
      icon: ShoppingBag,
      description: 'Daily grocery essentials',
      color: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-300/40',
    },
  ];

  const handleQuickAdd = (preset: QuickPreset) => {
    // Pick default UPI or Cash account
    const defaultAccount =
      accounts.find((a) => a.type === 'upi') ||
      accounts.find((a) => a.type === 'cash') ||
      accounts[0];

    addTransaction({
      type: 'expense',
      amount: preset.amount,
      categoryId: preset.categoryId,
      date: getTodayDateString(),
      time: getCurrentTimeString(),
      accountId: defaultAccount.id,
      paymentMethod: defaultAccount.type === 'cash' ? 'cash' : 'upi',
      description: preset.description,
      tags: ['#quick_add'],
    });

    setRecentlyAdded(preset.labelEn);
    confetti({
      particleCount: 25,
      spread: 60,
      origin: { y: 0.8 },
      colors: ['#059669', '#10b981', '#14b8a6'],
    });

    setTimeout(() => {
      setRecentlyAdded(null);
    }, 2500);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-1.5">
          <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
            {t('quickAdd')}
          </h3>
        </div>
        {recentlyAdded && (
          <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 animate-fade-in">
            <Check className="w-3.5 h-3.5" />
            {settings.language === 'hi' ? `${recentlyAdded} जोड़ा गया!` : `${recentlyAdded} added!`}
          </span>
        )}
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-none pt-0.5">
        {presets.map((preset) => {
          const Icon = preset.icon;
          const isAdded = recentlyAdded === preset.labelEn;

          return (
            <button
              key={preset.labelEn}
              onClick={() => handleQuickAdd(preset)}
              className={`shrink-0 flex items-center gap-2 px-3 py-2 rounded-2xl border text-xs font-semibold transition-all active:scale-95 shadow-sm hover:shadow ${preset.color} ${
                isAdded ? 'ring-2 ring-emerald-500 ring-offset-1 scale-105' : ''
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{settings.language === 'hi' ? preset.labelHi : preset.labelEn}</span>
              <span className="font-extrabold bg-white/60 dark:bg-slate-900/40 px-1.5 py-0.5 rounded-lg text-[11px]">
                ₹{preset.amount}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
