/**
 * HisabBook - Personal Daily Expense Tracker & Financial Manager
 * Main Application Component
 */

import React, { useEffect, useState } from 'react';
import {
  CalendarClock,
  CircleGauge,
  CreditCard,
  FileBarChart,
  Home,
  Plus,
  Receipt,
  Settings,
  WifiOff,
} from 'lucide-react';
import { AddTransactionModal } from './components/add/AddTransactionModal';
import { BudgetsView } from './components/budgets/BudgetsView';
import { BottomNav } from './components/common/BottomNav';
import { Header } from './components/common/Header';
import { PinLockModal } from './components/common/PinLockModal';
import { ReceiptModal } from './components/common/ReceiptModal';
import { DashboardView } from './components/dashboard/DashboardView';
import { RecurringBillsView } from './components/recurring/RecurringBillsView';
import { ReportsView } from './components/reports/ReportsView';
import { SettingsView } from './components/settings/SettingsView';
import { TransactionsView } from './components/transactions/TransactionsView';
import { AppProvider, useApp } from './context/AppContext';
import { AppTab, Transaction } from './types';

function MainLayout() {
  const { activeTab, setActiveTab, isPinLocked, t, settings } = useApp();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [activeReceiptUrl, setActiveReceiptUrl] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleOpenAdd = () => {
    setEditingTransaction(null);
    setIsAddModalOpen(true);
  };

  const handleEditTransaction = (tx: Transaction) => {
    setEditingTransaction(tx);
    setIsAddModalOpen(true);
  };

  const navLinks = [
    { id: 'dashboard' as AppTab, label: t('navHome'), icon: Home },
    { id: 'transactions' as AppTab, label: t('navTransactions'), icon: Receipt },
    { id: 'budgets' as AppTab, label: t('navBudgets'), icon: CircleGauge },
    { id: 'recurring' as AppTab, label: t('navRecurring'), icon: CalendarClock },
    { id: 'reports' as AppTab, label: t('navReports'), icon: FileBarChart },
    { id: 'settings' as AppTab, label: t('navSettings'), icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col antialiased transition-colors duration-200">
      {/* Offline Status Banner */}
      {isOffline && (
        <div className="bg-amber-600 text-white text-xs font-bold py-1.5 px-4 text-center flex items-center justify-center gap-2">
          <WifiOff className="w-4 h-4" />
          <span>
            {settings.language === 'hi'
              ? 'आप ऑफ़लाइन हैं। हिसाबबुक आपका डेटा स्थानीय रूप से सुरक्षित रखता है।'
              : 'You are offline. HisabBook works completely offline and saves data locally.'}
          </span>
        </div>
      )}

      {/* PIN Security Pad if locked */}
      {isPinLocked && <PinLockModal />}

      {/* Main Top Header */}
      <Header />

      {/* Desktop / Tablet Sub-Navbar */}
      <div className="hidden md:block bg-white/60 dark:bg-slate-900/60 border-b border-slate-200/60 dark:border-slate-800/60 backdrop-blur sticky top-[61px] z-20">
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-between py-2">
          <div className="flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = activeTab === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => setActiveTab(link.id)}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.label}</span>
                </button>
              );
            })}
          </div>

          {/* Quick Add Button on Desktop */}
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white text-xs font-extrabold shadow-md shadow-emerald-600/20 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>{t('addTransaction')}</span>
          </button>
        </div>
      </div>

      {/* Main View Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 pt-4 sm:pt-6">
        {activeTab === 'dashboard' && (
          <DashboardView
            onOpenAddModal={handleOpenAdd}
            onSelectTransaction={handleEditTransaction}
          />
        )}

        {activeTab === 'transactions' && (
          <TransactionsView
            onOpenAddModal={handleOpenAdd}
            onEditTransaction={handleEditTransaction}
            onViewReceipt={(url) => setActiveReceiptUrl(url)}
          />
        )}

        {activeTab === 'budgets' && <BudgetsView />}

        {activeTab === 'recurring' && <RecurringBillsView />}

        {activeTab === 'reports' && <ReportsView />}

        {activeTab === 'settings' && <SettingsView />}
      </main>

      {/* Mobile-first Bottom Navigation Bar */}
      <BottomNav onOpenAddModal={handleOpenAdd} />

      {/* Modals */}
      <AddTransactionModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingTransaction(null);
        }}
        initialTransaction={editingTransaction}
      />

      <ReceiptModal
        url={activeReceiptUrl}
        onClose={() => setActiveReceiptUrl(null)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
