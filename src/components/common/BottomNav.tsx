import React from 'react';
import {
  CalendarClock,
  CircleGauge,
  FileBarChart,
  Home,
  Plus,
  Receipt,
  Settings,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AppTab } from '../../types';

interface BottomNavProps {
  onOpenAddModal: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ onOpenAddModal }) => {
  const { activeTab, setActiveTab, t } = useApp();

  const navItems = [
    { id: 'dashboard' as AppTab, label: t('navHome'), icon: Home },
    { id: 'transactions' as AppTab, label: t('navTransactions'), icon: Receipt },
    { id: 'add_modal' as const, label: t('navAdd'), icon: Plus, isAddButton: true },
    { id: 'reports' as AppTab, label: t('navReports'), icon: FileBarChart },
    { id: 'settings' as AppTab, label: t('navSettings'), icon: Settings },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-t border-slate-200/80 dark:border-slate-800 pb-[env(safe-area-inset-bottom,0px)] shadow-[0_-8px_20px_rgba(0,0,0,0.05)] transition-colors">
      <div className="max-w-lg mx-auto flex items-center justify-around px-2 py-1.5 sm:py-2">
        {navItems.map((item) => {
          if ('isAddButton' in item && item.isAddButton) {
            return (
              <div key="add-btn" className="relative -top-4 px-2">
                <button
                  onClick={onOpenAddModal}
                  className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-500 hover:from-emerald-500 hover:to-teal-400 text-white flex flex-col items-center justify-center shadow-lg shadow-emerald-500/40 active:scale-95 transition-all focus:outline-none focus:ring-4 focus:ring-emerald-500/30 group"
                  aria-label="Add Transaction"
                >
                  <Plus className="w-7 h-7 group-hover:rotate-90 transition-transform duration-300" />
                </button>
                <span className="block text-[10px] font-bold text-center mt-1 text-emerald-600 dark:text-emerald-400">
                  {item.label}
                </span>
              </div>
            );
          }

          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as AppTab)}
              className={`flex-1 flex flex-col items-center justify-center py-1 px-1 transition-all rounded-xl ${
                isActive
                  ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 font-medium'
              }`}
            >
              <div
                className={`p-1 rounded-xl transition-colors ${
                  isActive ? 'bg-emerald-50 dark:bg-emerald-950/60' : ''
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
              </div>
              <span className="text-[10px] mt-0.5 truncate max-w-[64px]">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
