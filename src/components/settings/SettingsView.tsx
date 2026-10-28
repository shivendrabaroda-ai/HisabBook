import React, { useRef, useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  Check,
  Database,
  Download,
  FileSpreadsheet,
  Globe,
  KeyRound,
  Lock,
  Moon,
  RotateCcw,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
  Sun,
  Trash2,
  Upload,
  User,
  Wallet,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { CurrencyCode, Language, Theme } from '../../types';
import { downloadJsonBackup, exportToCsv, exportToExcel } from '../../utils/exporter';
import { AccountManagerModal } from './AccountManagerModal';
import { CategoryManagerModal } from './CategoryManagerModal';

export const SettingsView: React.FC = () => {
  const {
    settings,
    updateSettings,
    setLanguage,
    setAppPin,
    removeAppPin,
    categories,
    accounts,
    transactions,
    budgetConfig,
    recurringBills,
    loadSampleData,
    clearAllData,
    importBackupData,
    setActiveTab,
    t,
  } = useApp();

  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [newPin, setNewPin] = useState('');
  const [confirmPinVal, setConfirmPinVal] = useState('');
  const [pinError, setPinError] = useState('');
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const showNotification = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 3000);
  };

  const handleSetPinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPin.length !== 4) {
      setPinError('PIN must be 4 digits');
      return;
    }
    if (newPin !== confirmPinVal) {
      setPinError(t('pinMismatch'));
      return;
    }

    setAppPin(newPin);
    setNewPin('');
    setConfirmPinVal('');
    setPinError('');
    setShowPinModal(false);
    showNotification(t('pinSuccess'));
  };

  const handleBackupExport = () => {
    const backupObj = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      settings,
      categories,
      accounts,
      transactions,
      budgetConfig,
      recurringBills,
    };
    downloadJsonBackup(
      backupObj,
      `HisabBook_Backup_${new Date().toISOString().slice(0, 10)}.json`
    );
    showNotification(
      settings.language === 'hi' ? 'बैकअप फ़ाइल डाउनलोड हो गई' : 'Backup JSON downloaded'
    );
  };

  const handleBackupImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        const res = importBackupData(content);
        if (res.success) {
          showNotification(res.message);
        } else {
          setPinError(res.message);
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="space-y-4 pb-28">
      {/* Toast notification */}
      {actionNotice && (
        <div className="bg-emerald-600 text-white p-3.5 rounded-2xl text-xs font-bold shadow-lg flex items-center gap-2 animate-fade-in">
          <Check className="w-4 h-4" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Security Guarantee Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-teal-950 to-slate-900 border border-emerald-500/30 rounded-3xl p-4 sm:p-5 text-white shadow-md relative overflow-hidden">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm sm:text-base text-white">
              {settings.language === 'hi' ? '100% सुरक्षित और स्थानीय' : '100% Private & Locally Secure'}
            </h3>
            <p className="text-[11px] sm:text-xs text-emerald-200/80 leading-relaxed mt-0.5">
              {t('securityDisclaimer')}
            </p>
          </div>
        </div>
      </div>

      {/* General Settings Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4">
        <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
          <Globe className="w-4 h-4 text-emerald-600" />
          <span>{t('generalSettings')}</span>
        </h3>

        <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
          {/* Language Selection */}
          <div className="py-3 flex items-center justify-between">
            <div>
              <p className="font-bold text-slate-800 dark:text-slate-200">{t('language')}</p>
              <p className="text-[11px] text-slate-400">English / हिंदी भाषा का चयन करें</p>
            </div>
            <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1">
              <button
                onClick={() => setLanguage('en')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  settings.language === 'en'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-500'
                }`}
              >
                English
              </button>
              <button
                onClick={() => setLanguage('hi')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  settings.language === 'hi'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-500'
                }`}
              >
                हिंदी
              </button>
            </div>
          </div>

          {/* Number Formatting */}
          <div className="py-3 flex items-center justify-between">
            <div>
              <p className="font-bold text-slate-800 dark:text-slate-200">{t('numberFormat')}</p>
              <p className="text-[11px] text-slate-400">
                {settings.numberFormat === 'indian' ? 'Lakhs & Crores (1,23,456)' : 'International (123,456)'}
              </p>
            </div>
            <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1">
              <button
                onClick={() => updateSettings({ numberFormat: 'indian' })}
                className={`px-2.5 py-1.5 rounded-lg font-bold transition-all ${
                  settings.numberFormat === 'indian'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-500'
                }`}
              >
                ₹ Indian
              </button>
              <button
                onClick={() => updateSettings({ numberFormat: 'international' })}
                className={`px-2.5 py-1.5 rounded-lg font-bold transition-all ${
                  settings.numberFormat === 'international'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-500'
                }`}
              >
                Standard
              </button>
            </div>
          </div>

          {/* Theme Selection */}
          <div className="py-3 flex items-center justify-between">
            <div>
              <p className="font-bold text-slate-800 dark:text-slate-200">{t('theme')}</p>
              <p className="text-[11px] text-slate-400">Dark mode or light mode appearance</p>
            </div>
            <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1">
              <button
                onClick={() => updateSettings({ theme: 'light' })}
                className={`px-2.5 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1 ${
                  settings.theme === 'light'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500'
                }`}
              >
                <Sun className="w-3.5 h-3.5 text-amber-500" />
                <span>Light</span>
              </button>
              <button
                onClick={() => updateSettings({ theme: 'dark' })}
                className={`px-2.5 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1 ${
                  settings.theme === 'dark'
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-500'
                }`}
              >
                <Moon className="w-3.5 h-3.5 text-indigo-400" />
                <span>Dark</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Finance Config Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-3">
        <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
          <Wallet className="w-4 h-4 text-emerald-600" />
          <span>{settings.language === 'hi' ? 'खाते और श्रेणियां' : 'Financial Structure'}</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <button
            onClick={() => setShowCategoryModal(true)}
            className="p-3.5 rounded-2xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/60 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 flex items-center justify-between text-left transition-all"
          >
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-white">
                {t('categories')}
              </p>
              <p className="text-[10px] text-slate-400">
                {categories.length} {settings.language === 'hi' ? 'श्रेणियां उपलब्ध' : 'categories configured'}
              </p>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400" />
          </button>

          <button
            onClick={() => setShowAccountModal(true)}
            className="p-3.5 rounded-2xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/60 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 flex items-center justify-between text-left transition-all"
          >
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-white">
                {t('accounts')}
              </p>
              <p className="text-[10px] text-slate-400">
                {accounts.length} {settings.language === 'hi' ? 'सक्रिय बैंक / नकद / कार्ड' : 'active wallets & accounts'}
              </p>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400" />
          </button>
        </div>
      </div>

      {/* Security & PIN Lock Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-3">
        <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
          <Lock className="w-4 h-4 text-emerald-600" />
          <span>{t('securityTitle')}</span>
        </h3>

        <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60">
          <div>
            <p className="text-xs font-bold text-slate-900 dark:text-white">
              {t('pinLock')}
            </p>
            <p className="text-[10px] text-slate-400">
              {settings.pinLockEnabled
                ? settings.language === 'hi'
                  ? 'पिन सुरक्षा चालू है'
                  : '4-digit PIN is active'
                : settings.language === 'hi'
                ? 'कोई पिन सेट नहीं है'
                : 'No PIN set'}
            </p>
          </div>

          {settings.pinLockEnabled ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowPinModal(true)}
                className="px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-700 text-xs font-bold hover:bg-slate-300"
              >
                {t('changePin')}
              </button>
              <button
                onClick={removeAppPin}
                className="px-3 py-1.5 rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-950/40 text-xs font-bold hover:bg-rose-100"
              >
                {t('removePin')}
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowPinModal(true)}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors shadow-sm"
            >
              {t('setPin')}
            </button>
          )}
        </div>
      </div>

      {/* Data Backup, Export & Sample Data */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-3">
        <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
          <Database className="w-4 h-4 text-emerald-600" />
          <span>{t('dataBackup')}</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {/* JSON Export */}
          <button
            onClick={handleBackupExport}
            className="p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/60 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 flex items-center gap-2.5 text-xs font-bold text-slate-800 dark:text-slate-200 transition-colors"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            <span>{t('exportBackup')}</span>
          </button>

          {/* JSON Import */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/60 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 flex items-center gap-2.5 text-xs font-bold text-slate-800 dark:text-slate-200 transition-colors"
          >
            <Upload className="w-4 h-4 text-blue-600" />
            <span>{t('importBackup')}</span>
          </button>
          <input
            type="file"
            ref={fileInputRef}
            accept=".json"
            onChange={handleBackupImport}
            className="hidden"
          />

          {/* CSV Download */}
          <button
            onClick={() => exportToCsv(transactions, categories, accounts)}
            className="p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/60 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 flex items-center gap-2.5 text-xs font-bold text-slate-800 dark:text-slate-200 transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4 text-amber-600" />
            <span>{t('exportCsv')}</span>
          </button>

          {/* Excel Download */}
          <button
            onClick={() => exportToExcel(transactions, categories, accounts)}
            className="p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/60 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 flex items-center gap-2.5 text-xs font-bold text-slate-800 dark:text-slate-200 transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4 text-teal-600" />
            <span>{t('exportExcel')}</span>
          </button>
        </div>

        {/* Load Sample Data Button */}
        <div className="pt-2">
          <button
            onClick={() => setShowResetConfirm(true)}
            className="w-full py-2.5 rounded-2xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-950/70 border border-emerald-300/40 text-emerald-800 dark:text-emerald-300 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>{t('resetSampleData')}</span>
          </button>
        </div>
      </div>

      {/* Danger Zone: Wipe all data */}
      <div className="bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 rounded-3xl p-5 shadow-sm space-y-2">
        <h4 className="text-xs font-extrabold text-rose-700 dark:text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
          <AlertTriangle className="w-4 h-4" />
          <span>Danger Zone</span>
        </h4>
        <p className="text-[11px] text-slate-500">
          Permanently clear all transactions, custom accounts, and budgets from this device.
        </p>
        <button
          onClick={() => setShowDeleteConfirm(true)}
          className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors flex items-center gap-1.5"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>{t('deleteAllData')}</span>
        </button>
      </div>

      {/* Category Manager Modal */}
      <CategoryManagerModal
        isOpen={showCategoryModal}
        onClose={() => setShowCategoryModal(false)}
      />

      {/* Account Manager Modal */}
      <AccountManagerModal
        isOpen={showAccountModal}
        onClose={() => setShowAccountModal(false)}
      />

      {/* Set PIN Modal */}
      {showPinModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleSetPinSubmit}
            className="bg-white dark:bg-slate-900 w-full max-w-xs rounded-3xl p-5 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-3"
          >
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center mx-auto">
              <KeyRound className="w-5 h-5" />
            </div>

            <h3 className="font-extrabold text-sm text-center text-slate-900 dark:text-white">
              {t('setPin')}
            </h3>

            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                {t('enterPin')}
              </label>
              <input
                type="password"
                maxLength={4}
                required
                value={newPin}
                onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
                placeholder="••••"
                className="w-full text-center tracking-widest text-xl font-black p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                {t('confirmPin')}
              </label>
              <input
                type="password"
                maxLength={4}
                required
                value={confirmPinVal}
                onChange={(e) => setConfirmPinVal(e.target.value.replace(/\D/g, ''))}
                placeholder="••••"
                className="w-full text-center tracking-widest text-xl font-black p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              />
            </div>

            {pinError && <p className="text-xs text-rose-500 text-center">{pinError}</p>}

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowPinModal(false)}
                className="flex-1 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 font-bold text-xs"
              >
                {t('cancel')}
              </button>
              <button
                type="submit"
                className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
              >
                {t('save')}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Delete All Data Confirm */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-3xl p-5 shadow-2xl border border-slate-200 dark:border-slate-800 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
              {t('deleteAllData')}?
            </h3>
            <p className="text-xs text-slate-500">
              {t('deleteAllConfirm')}
            </p>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 font-bold text-xs"
              >
                {t('cancel')}
              </button>
              <button
                onClick={() => {
                  clearAllData();
                  setShowDeleteConfirm(false);
                  showNotification('All data cleared');
                }}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 font-bold text-xs text-white"
              >
                {t('confirm')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Load Sample Data Confirm */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-3xl p-5 shadow-2xl border border-slate-200 dark:border-slate-800 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center mx-auto">
              <RotateCcw className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
              {t('resetSampleData')}?
            </h3>
            <p className="text-xs text-slate-500">
              {t('resetSampleDataConfirm')}
            </p>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 font-bold text-xs"
              >
                {t('cancel')}
              </button>
              <button
                onClick={() => {
                  loadSampleData();
                  setShowResetConfirm(false);
                  showNotification('Sample data loaded successfully');
                }}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 font-bold text-xs text-white"
              >
                {t('confirm')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
