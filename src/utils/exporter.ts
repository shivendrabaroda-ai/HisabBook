/**
 * Export utilities for CSV, Excel (.xls), and JSON backup.
 */

import { Account, Category, Transaction } from '../types';

/**
 * Generate CSV string from transactions
 */
export function exportToCsv(
  transactions: Transaction[],
  categories: Category[],
  accounts: Account[]
): void {
  const catMap = new Map(categories.map((c) => [c.id, c.name]));
  const accMap = new Map(accounts.map((a) => [a.id, a.name]));

  const headers = [
    'Transaction ID',
    'Date',
    'Time',
    'Type',
    'Amount (INR)',
    'Category',
    'Account',
    'Transfer To Account',
    'Payment Method',
    'Description',
    'Tags',
  ];

  const rows = transactions.map((tx) => [
    `"${tx.id}"`,
    `"${tx.date}"`,
    `"${tx.time || ''}"`,
    `"${tx.type.toUpperCase()}"`,
    tx.amount.toFixed(2),
    `"${catMap.get(tx.categoryId) || (tx.type === 'transfer' ? 'Transfer' : 'Uncategorized')}"`,
    `"${accMap.get(tx.accountId) || 'Unknown'}"`,
    `"${tx.toAccountId ? accMap.get(tx.toAccountId) || 'Unknown' : ''}"`,
    `"${tx.paymentMethod}"`,
    `"${(tx.description || '').replace(/"/g, '""')}"`,
    `"${(tx.tags || []).join(', ')}"`,
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
  downloadBlob(csvContent, `HisabBook_Transactions_${new Date().toISOString().slice(0, 10)}.csv`, 'text/csv;charset=utf-8;');
}

/**
 * Generate formatted Excel XML / HTML file (.xls)
 */
export function exportToExcel(
  transactions: Transaction[],
  categories: Category[],
  accounts: Account[]
): void {
  const catMap = new Map(categories.map((c) => [c.id, c.name]));
  const accMap = new Map(accounts.map((a) => [a.id, a.name]));

  let totalIncome = 0;
  let totalExpense = 0;

  transactions.forEach((tx) => {
    if (tx.type === 'income') totalIncome += tx.amount;
    if (tx.type === 'expense') totalExpense += tx.amount;
  });

  const tableRows = transactions
    .map(
      (tx) => `
    <tr>
      <td>${tx.date}</td>
      <td>${tx.time || ''}</td>
      <td style="font-weight: bold; color: ${tx.type === 'income' ? '#16a34a' : tx.type === 'expense' ? '#dc2626' : '#2563eb'}">${tx.type.toUpperCase()}</td>
      <td style="text-align: right;">${tx.amount.toFixed(2)}</td>
      <td>${catMap.get(tx.categoryId) || (tx.type === 'transfer' ? 'Account Transfer' : '-')}</td>
      <td>${accMap.get(tx.accountId) || ''}</td>
      <td>${tx.toAccountId ? accMap.get(tx.toAccountId) || '' : '-'}</td>
      <td>${tx.paymentMethod}</td>
      <td>${tx.description || ''}</td>
      <td>${(tx.tags || []).join(', ')}</td>
    </tr>`
    )
    .join('');

  const excelHtml = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>HisabBook Statement</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]-->
        <meta http-equiv="content-type" content="text/plain; charset=UTF-8"/>
        <style>
          th { background-color: #0f766e; color: #ffffff; font-weight: bold; border: 1px solid #cccccc; padding: 6px; }
          td { border: 1px solid #e2e8f0; padding: 5px; font-family: sans-serif; font-size: 11pt; }
          .summary-th { background-color: #f1f5f9; font-weight: bold; }
        </style>
      </head>
      <body>
        <h2>HisabBook - Financial Transaction Report</h2>
        <p>Generated on: ${new Date().toLocaleString()}</p>
        <p>Total Income: <b>₹ ${totalIncome.toFixed(2)}</b> | Total Expenses: <b>₹ ${totalExpense.toFixed(2)}</b> | Net Savings: <b>₹ ${(totalIncome - totalExpense).toFixed(2)}</b></p>
        <table border="1">
          <thead>
            <tr>
              <th>Date</th>
              <th>Time</th>
              <th>Type</th>
              <th>Amount (INR)</th>
              <th>Category</th>
              <th>Source Account</th>
              <th>Destination Account</th>
              <th>Payment Method</th>
              <th>Description</th>
              <th>Tags</th>
            </tr>
          </thead>
          <tbody>
            ${tableRows}
          </tbody>
        </table>
      </body>
    </html>
  `;

  downloadBlob(excelHtml, `HisabBook_Statement_${new Date().toISOString().slice(0, 10)}.xls`, 'application/vnd.ms-excel;charset=utf-8;');
}

/**
 * Backup state as JSON file
 */
export function downloadJsonBackup(data: unknown, filename: string): void {
  const jsonStr = JSON.stringify(data, null, 2);
  downloadBlob(jsonStr, filename, 'application/json;charset=utf-8;');
}

function downloadBlob(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }, 100);
}
