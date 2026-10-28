/**
 * Formatting utilities for Indian Rupee currency, Indian numbering format, and dates.
 */

import { Language } from '../types';

/**
 * Format a number using Indian Numbering System (e.g. 1,23,456.78)
 * or international format (123,456.78)
 */
export function formatIndianNumber(num: number, decimals: number = 2): string {
  if (isNaN(num) || num === null || num === undefined) return '0.00';
  
  const isNegative = num < 0;
  const absNum = Math.abs(num);
  const fixedStr = absNum.toFixed(decimals);
  const [intPart, decPart] = fixedStr.split('.');

  // Indian numbering: last 3 digits, then groups of 2
  let result = '';
  if (intPart.length > 3) {
    const lastThree = intPart.substring(intPart.length - 3);
    const otherNumbers = intPart.substring(0, intPart.length - 3);
    const withCommas = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',');
    result = withCommas + ',' + lastThree;
  } else {
    result = intPart;
  }

  const formatted = decimals > 0 ? `${result}.${decPart}` : result;
  return isNegative ? `-${formatted}` : formatted;
}

/**
 * Format currency with symbol (default: ₹)
 */
export function formatCurrency(
  amount: number,
  symbol: string = '₹',
  isIndianFormat: boolean = true,
  hideDecimalsIfZero: boolean = false
): string {
  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);
  const hasDecimals = absAmount % 1 !== 0;
  const decimals = hideDecimalsIfZero && !hasDecimals ? 0 : 2;

  let formattedNum = '';
  if (isIndianFormat) {
    formattedNum = formatIndianNumber(absAmount, decimals);
  } else {
    formattedNum = absAmount.toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  }

  return `${isNegative ? '-' : ''}${symbol}${formattedNum}`;
}

/**
 * Compact Indian currency formatter: ₹2.5K, ₹1.2L (Lakhs), ₹3.4Cr (Crores)
 */
export function formatCompactCurrency(amount: number, symbol: string = '₹'): string {
  const isNegative = amount < 0;
  const abs = Math.abs(amount);

  let formatted = '';
  if (abs >= 10000000) {
    formatted = `${(abs / 10000000).toFixed(2)} Cr`;
  } else if (abs >= 100000) {
    formatted = `${(abs / 100000).toFixed(2)} L`;
  } else if (abs >= 1000) {
    formatted = `${(abs / 1000).toFixed(1)} K`;
  } else {
    formatted = abs.toFixed(0);
  }

  return `${isNegative ? '-' : ''}${symbol}${formatted}`;
}

/**
 * Convert number to Indian English and Hindi words for amount preview
 */
export function numberToWordsIndian(num: number, lang: Language = 'en'): string {
  if (num <= 0 || isNaN(num)) return '';
  const rounded = Math.floor(num);

  if (lang === 'hi') {
    // Basic Hindi numbers helper
    if (rounded >= 10000000) return `${(rounded / 10000000).toFixed(1)} करोड़ रुपये`;
    if (rounded >= 100000) return `${(rounded / 100000).toFixed(1)} लाख रुपये`;
    if (rounded >= 1000) return `${(rounded / 1000).toFixed(1)} हज़ार रुपये`;
    return `${rounded} रुपये`;
  }

  const a = [
    '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
    'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen',
  ];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  function inWords(n: number): string {
    if (n === 0) return '';
    if (n < 20) return a[n];
    if (n < 100) return b[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + a[n % 10] : '');
    if (n < 1000)
      return inWords(Math.floor(n / 100)) + ' Hundred' + (n % 100 !== 0 ? ' and ' + inWords(n % 100) : '');
    if (n < 100000)
      return inWords(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 !== 0 ? ' ' + inWords(n % 1000) : '');
    if (n < 10000000)
      return inWords(Math.floor(n / 100000)) + ' Lakh' + (n % 100000 !== 0 ? ' ' + inWords(n % 100000) : '');
    return inWords(Math.floor(n / 10000000)) + ' Crore' + (n % 10000000 !== 0 ? ' ' + inWords(n % 10000000) : '');
  }

  const result = inWords(rounded);
  return result ? `${result} Rupees only` : '';
}

/**
 * Format date for display: "Today", "Yesterday", "27 Oct 2026"
 */
export function formatFriendlyDate(dateStr: string, lang: Language = 'en'): string {
  if (!dateStr) return '';
  const date = new Date(dateStr.length === 10 ? `${dateStr}T12:00:00` : dateStr);
  const today = new Date();
  
  const isSameDay = (d1: Date, d2: Date) =>
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (isSameDay(date, today)) {
    return lang === 'hi' ? 'आज' : 'Today';
  }
  if (isSameDay(date, yesterday)) {
    return lang === 'hi' ? 'कल' : 'Yesterday';
  }

  const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' };
  return date.toLocaleDateString(lang === 'hi' ? 'hi-IN' : 'en-IN', options);
}

/**
 * Get current date string in YYYY-MM-DD
 */
export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Get current time string in HH:MM
 */
export function getCurrentTimeString(): string {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}
