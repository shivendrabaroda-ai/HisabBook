import React from 'react';
import { Account, Category, Transaction, UserSettings } from '../../types';
import { formatCurrency, formatFriendlyDate } from '../../utils/formatters';

interface PrintableStatementProps {
  transactions: Transaction[];
  categories: Category[];
  accounts: Account[];
  settings: UserSettings;
  periodLabel: string;
  totalIncome: number;
  totalExpense: number;
  netSavings: number;
  savingsRate: number;
  onClose: () => void;
}

export const PrintableStatement: React.FC<PrintableStatementProps> = ({
  transactions,
  categories,
  accounts,
  settings,
  periodLabel,
  totalIncome,
  totalExpense,
  netSavings,
  savingsRate,
  onClose,
}) => {
  const catMap = new Map(categories.map((c) => [c.id, c.name]));
  const accMap = new Map(accounts.map((a) => [a.id, a.name]));

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-6 overflow-y-auto">
      <div className="bg-white text-slate-900 w-full max-w-4xl rounded-2xl p-6 sm:p-10 shadow-2xl max-h-[92vh] overflow-y-auto space-y-6">
        {/* Actions bar (Hidden in print) */}
        <div className="flex items-center justify-between no-print pb-4 border-b border-slate-200">
          <div className="text-xs text-slate-500 font-medium">
            Ready to print or save as PDF via your browser print dialog.
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-colors"
            >
              Print / Save as PDF
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
            >
              Close
            </button>
          </div>
        </div>

        {/* Printable Content Header */}
        <div className="flex items-start justify-between border-b-2 border-slate-900 pb-6">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black text-lg">
                ₹
              </div>
              <h1 className="text-2xl font-black tracking-tight text-slate-900">HisabBook</h1>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Personal Financial Statement & Expense Audit
            </p>
          </div>

          <div className="text-right text-xs">
            <p className="font-bold text-slate-800">{settings.userName || 'Rahul Sharma'}</p>
            <p className="text-slate-500">Period: <b>{periodLabel}</b></p>
            <p className="text-slate-400">Generated: {new Date().toLocaleDateString()}</p>
          </div>
        </div>

        {/* Summary Boxes */}
        <div className="grid grid-cols-4 gap-4 text-center print-break-inside-avoid">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Total Income</span>
            <span className="text-base font-extrabold text-emerald-700 mt-1 block">
              {formatCurrency(totalIncome, settings.currencySymbol, true, true)}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Total Expenses</span>
            <span className="text-base font-extrabold text-rose-700 mt-1 block">
              {formatCurrency(totalExpense, settings.currencySymbol, true, true)}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Net Savings</span>
            <span className="text-base font-extrabold text-slate-900 mt-1 block">
              {formatCurrency(netSavings, settings.currencySymbol, true, true)}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Savings Rate</span>
            <span className="text-base font-extrabold text-teal-700 mt-1 block">
              {savingsRate}%
            </span>
          </div>
        </div>

        {/* Transaction Table */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600">
            Transaction Ledger ({transactions.length} Records)
          </h3>

          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-300 text-[11px] uppercase font-bold text-slate-500">
                <th className="py-2">Date</th>
                <th className="py-2">Type</th>
                <th className="py-2">Category</th>
                <th className="py-2">Account</th>
                <th className="py-2">Payment Method</th>
                <th className="py-2">Description</th>
                <th className="py-2 text-right">Amount (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {transactions.map((tx) => (
                <tr key={tx.id} className="print-break-inside-avoid">
                  <td className="py-2 text-slate-600">{tx.date}</td>
                  <td className="py-2 uppercase font-extrabold text-[10px]">
                    <span
                      className={
                        tx.type === 'income'
                          ? 'text-emerald-700'
                          : tx.type === 'expense'
                          ? 'text-rose-700'
                          : 'text-blue-700'
                      }
                    >
                      {tx.type}
                    </span>
                  </td>
                  <td className="py-2 font-medium text-slate-800">
                    {catMap.get(tx.categoryId) || (tx.type === 'transfer' ? 'Transfer' : '-')}
                  </td>
                  <td className="py-2 text-slate-600">{accMap.get(tx.accountId) || '-'}</td>
                  <td className="py-2 text-slate-500 capitalize">{tx.paymentMethod}</td>
                  <td className="py-2 text-slate-700 truncate max-w-xs">{tx.description || '-'}</td>
                  <td className="py-2 text-right font-extrabold text-slate-900">
                    {formatCurrency(tx.amount, settings.currencySymbol, true, true)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="pt-6 border-t border-slate-200 text-center text-[10px] text-slate-400">
          Generated via HisabBook App • Safe & Secure Financial Accounting • Non-transferable statement
        </div>
      </div>
    </div>
  );
};
