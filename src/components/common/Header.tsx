import React, { useState } from 'react';
import {
  Bell,
  CheckCircle2,
  Lock,
  Moon,
  Sparkles,
  Sun,
  User,
  Wallet,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const Header: React.FC = () => {
  const {
    settings,
    setLanguage,
    toggleTheme,
    lockApp,
    recurringBills,
    setActiveTab,
    t,
  } = useApp();

  const [showBillPopover, setShowBillPopover] = useState(false);

  // Check pending / upcoming bills
  const unpaidBills = recurringBills.filter((b) => !b.isPaidForCurrentPeriod);

  return (
    <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 transition-colors">
      <div className="max-w-6xl mx-auto px-4 py-2.5 flex items-center justify-between">
        {/* Logo and Brand */}
        <div
          onClick={() => setActiveTab('dashboard')}
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
            <span className="font-extrabold text-xl leading-none">₹</span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-lg font-black tracking-tight text-slate-900 dark:text-white">
                {settings.language === 'hi' ? 'हिसाबबुक' : 'HisabBook'}
              </h1>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 border border-emerald-300/40">
                PRO
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium -mt-0.5 hidden sm:block">
              {t('appSubtitle')}
            </p>
          </div>
        </div>

        {/* Right Action Icons */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Language Switcher */}
          <button
            onClick={() => setLanguage(settings.language === 'en' ? 'hi' : 'en')}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-all border border-slate-200/60 dark:border-slate-700"
            title="Toggle Language"
            aria-label="Toggle Language"
          >
            <span className="text-sm">{settings.language === 'en' ? '🇮🇳' : '🇬🇧'}</span>
            <span className="font-bold">{settings.language === 'en' ? 'हिंदी' : 'EN'}</span>
          </button>

          {/* Bills Alert Bell */}
          <div className="relative">
            <button
              onClick={() => setShowBillPopover(!showBillPopover)}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative"
              title="Due Bills & Reminders"
              aria-label="Due Bills"
            >
              <Bell className="w-5 h-5" />
              {unpaidBills.length > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-500 text-[10px] font-bold text-white flex items-center justify-center animate-pulse">
                  {unpaidBills.length}
                </span>
              )}
            </button>

            {/* Bills dropdown popover */}
            {showBillPopover && (
              <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-3 z-50">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800 mb-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    {settings.language === 'hi' ? 'देय बिल और ईएमआई' : 'Upcoming Bills & EMIs'}
                  </h3>
                  <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    {unpaidBills.length} {settings.language === 'hi' ? 'लंबित' : 'Pending'}
                  </span>
                </div>

                {unpaidBills.length === 0 ? (
                  <div className="text-center py-4">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-1 opacity-80" />
                    <p className="text-xs text-slate-500">
                      {settings.language === 'hi' ? 'सभी बिल चुकता हैं!' : 'All recurring bills are paid!'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-56 overflow-y-auto">
                    {unpaidBills.map((b) => (
                      <div
                        key={b.id}
                        className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/50"
                      >
                        <div className="min-w-0 pr-2">
                          <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                            {settings.language === 'hi' && b.titleHi ? b.titleHi : b.title}
                          </p>
                          <p className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">
                            {settings.language === 'hi' ? `नियत तारीख: ${b.dueDay}` : `Due Day: ${b.dueDay}th`}
                          </p>
                        </div>
                        <span className="text-xs font-extrabold text-slate-900 dark:text-white shrink-0">
                          ₹{b.amount}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                <button
                  onClick={() => {
                    setShowBillPopover(false);
                    setActiveTab('recurring');
                  }}
                  className="w-full mt-2 py-1.5 text-center text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-xl transition-colors"
                >
                  {settings.language === 'hi' ? 'बिल अनुभाग खोलें →' : 'Manage Recurring Bills →'}
                </button>
              </div>
            )}
          </div>

          {/* Theme Switcher */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Toggle Dark/Light Mode"
            aria-label="Toggle Dark/Light Mode"
          >
            {settings.theme === 'dark' ? (
              <Sun className="w-5 h-5 text-amber-400" />
            ) : (
              <Moon className="w-5 h-5 text-slate-600" />
            )}
          </button>

          {/* Lock App PIN Button if PIN enabled */}
          {settings.pinLockEnabled && (
            <button
              onClick={lockApp}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-amber-500"
              title="Lock HisabBook"
              aria-label="Lock App"
            >
              <Lock className="w-5 h-5" />
            </button>
          )}

          {/* User profile avatar */}
          <div className="flex items-center gap-1.5 pl-1">
            <div className="w-8 h-8 rounded-full bg-emerald-600/10 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 font-bold text-xs flex items-center justify-center border border-emerald-500/30">
              {settings.userName ? settings.userName.charAt(0) : 'R'}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
