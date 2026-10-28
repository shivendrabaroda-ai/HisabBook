import React, { useState } from 'react';
import {
  Banknote,
  Briefcase,
  Coffee,
  Film,
  Fuel,
  HeartPulse,
  Home,
  Landmark,
  MoreHorizontal,
  Plus,
  ShoppingBag,
  Tag,
  Trash2,
  Users,
  UtensilsCrossed,
  Wifi,
  X,
  Zap,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Category, CategoryType } from '../../types';
import { CategoryIcon } from '../common/CategoryIcon';

interface CategoryManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AVAILABLE_ICONS = [
  'UtensilsCrossed',
  'Coffee',
  'Fuel',
  'Home',
  'Zap',
  'Wifi',
  'Landmark',
  'HeartPulse',
  'ShoppingBag',
  'Users',
  'Film',
  'Banknote',
  'Briefcase',
  'TrendingUp',
  'PlusCircle',
  'Tag',
  'Car',
  'Smartphone',
];

const AVAILABLE_COLORS = [
  '#f97316', // orange
  '#854d0e', // amber
  '#0284c7', // sky
  '#7c3aed', // violet
  '#eab308', // yellow
  '#06b6d4', // cyan
  '#dc2626', // red
  '#ec4899', // pink
  '#a855f7', // purple
  '#10b981', // emerald
  '#6366f1', // indigo
  '#16a34a', // green
  '#0d9488', // teal
  '#2563eb', // blue
  '#64748b', // slate
];

export const CategoryManagerModal: React.FC<CategoryManagerModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { categories, addCategory, deleteCategory, settings, t } = useApp();

  const [activeTab, setActiveTab] = useState<CategoryType>('expense');
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState('');
  const [nameHi, setNameHi] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('Tag');
  const [selectedColor, setSelectedColor] = useState('#10b981');

  if (!isOpen) return null;

  const filtered = categories.filter((c) => c.type === activeTab);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    addCategory({
      name: name.trim(),
      nameHi: nameHi.trim() || name.trim(),
      type: activeTab,
      icon: selectedIcon,
      color: selectedColor,
      isDefault: false,
    });

    setName('');
    setNameHi('');
    setShowAddForm(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl p-5 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
              {t('categories')}
            </h3>
            <p className="text-xs text-slate-500">
              {settings.language === 'hi' ? 'अपनी श्रेणियां प्रबंधित करें' : 'Create and manage custom categories'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-xl text-slate-400 hover:text-slate-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Expense vs Income toggle */}
        <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800 text-xs font-bold">
          <button
            onClick={() => setActiveTab('expense')}
            className={`py-2 rounded-xl transition-all ${
              activeTab === 'expense'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {t('expense')} ({categories.filter((c) => c.type === 'expense').length})
          </button>
          <button
            onClick={() => setActiveTab('income')}
            className={`py-2 rounded-xl transition-all ${
              activeTab === 'income'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {t('income')} ({categories.filter((c) => c.type === 'income').length})
          </button>
        </div>

        {/* Add Category Trigger / Form */}
        {!showAddForm ? (
          <button
            onClick={() => setShowAddForm(true)}
            className="w-full py-2.5 rounded-2xl border-2 border-dashed border-emerald-500/40 text-emerald-600 dark:text-emerald-400 text-xs font-bold hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors flex items-center justify-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>{t('addCategory')}</span>
          </button>
        ) : (
          <form
            onSubmit={handleCreate}
            className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3 animate-slide-up"
          >
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase">
              {t('addCategory')} ({activeTab === 'expense' ? t('expense') : t('income')})
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-1">
                  Name (English)
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Gym & Fitness"
                  className="w-full p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-1">
                  Name (हिंदी)
                </label>
                <input
                  type="text"
                  value={nameHi}
                  onChange={(e) => setNameHi(e.target.value)}
                  placeholder="उदा. जिम और फिटनेस"
                  className="w-full p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold"
                />
              </div>
            </div>

            {/* Icon picker */}
            <div>
              <label className="text-[10px] font-bold text-slate-500 block mb-1">
                {t('categoryIcon')}
              </label>
              <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-1 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                {AVAILABLE_ICONS.map((ic) => (
                  <button
                    type="button"
                    key={ic}
                    onClick={() => setSelectedIcon(ic)}
                    className={`p-1.5 rounded-lg border transition-all ${
                      selectedIcon === ic
                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950 text-emerald-600'
                        : 'border-transparent text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <CategoryIcon name={ic} size={16} />
                  </button>
                ))}
              </div>
            </div>

            {/* Color picker */}
            <div>
              <label className="text-[10px] font-bold text-slate-500 block mb-1">
                {t('categoryColor')}
              </label>
              <div className="flex flex-wrap gap-2 pt-1">
                {AVAILABLE_COLORS.map((clr) => (
                  <button
                    type="button"
                    key={clr}
                    onClick={() => setSelectedColor(clr)}
                    style={{ backgroundColor: clr }}
                    className={`w-6 h-6 rounded-full transition-transform ${
                      selectedColor === clr ? 'scale-125 ring-2 ring-slate-900 dark:ring-white ring-offset-1' : ''
                    }`}
                  />
                ))}
              </div>
            </div>

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

        {/* Existing categories list */}
        <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
          {filtered.map((cat) => (
            <div
              key={cat.id}
              className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  style={{ backgroundColor: `${cat.color}20`, color: cat.color }}
                  className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                >
                  <CategoryIcon name={cat.icon} size={16} />
                </div>
                <div className="truncate">
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                    {cat.name}
                  </p>
                  {cat.nameHi && (
                    <p className="text-[10px] text-slate-400 truncate">{cat.nameHi}</p>
                  )}
                </div>
              </div>

              {!cat.isDefault && (
                <button
                  onClick={() => deleteCategory(cat.id)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                  title="Delete category"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
