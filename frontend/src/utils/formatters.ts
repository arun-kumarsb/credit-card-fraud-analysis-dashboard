/**
 * SentinelShield - Indian Numbering & Currency Utilities
 * Formats numbers according to the Indian numbering system (Lakhs, Crores)
 * and displays currency with the Indian Rupee symbol (₹).
 */

export const CURRENCY_SYMBOL = '₹';

/**
 * Formats an integer or float with Indian numbering grouping (e.g. 2,50,000 instead of 250,000)
 */
export const formatNumberIN = (val: number | undefined | null): string => {
  if (val === undefined || val === null || isNaN(val)) return '0';
  return Number(val).toLocaleString('en-IN');
};

/**
 * Formats currency into compact Indian notation (Cr, L, k):
 * >= 1 Crore (1,00,00,000) -> ₹415.19 Cr
 * >= 1 Lakh  (1,00,000)    -> ₹16.11 L
 * >= 1 Thousand (1,000)    -> ₹78.1k
 * < 1,000                  -> ₹450
 */
export const formatCurrencyIN = (
  val: number | undefined | null,
  options?: { compact?: boolean; decimals?: number }
): string => {
  if (val === undefined || val === null || isNaN(val)) return `${CURRENCY_SYMBOL}0`;
  const isNegative = val < 0;
  const absVal = Math.abs(val);

  if (options?.compact !== false) {
    let formatted = '';
    if (absVal >= 1e7) {
      formatted = `${(absVal / 1e7).toFixed(options?.decimals ?? 2)} Cr`;
    } else if (absVal >= 1e5) {
      formatted = `${(absVal / 1e5).toFixed(options?.decimals ?? 2)} L`;
    } else if (absVal >= 1e3) {
      formatted = `${(absVal / 1e3).toFixed(options?.decimals ?? 1)}k`;
    } else {
      formatted = absVal.toFixed(options?.decimals ?? (absVal % 1 === 0 ? 0 : 2));
    }
    return `${isNegative ? '-' : ''}${CURRENCY_SYMBOL}${formatted}`;
  }

  return `${isNegative ? '-' : ''}${CURRENCY_SYMBOL}${absVal.toLocaleString('en-IN', {
    minimumFractionDigits: options?.decimals ?? 2,
    maximumFractionDigits: options?.decimals ?? 2,
  })}`;
};

/**
 * Exact currency formatting with commas in Indian system: ₹1,23,456.78
 */
export const formatExactCurrencyIN = (val: number | undefined | null): string => {
  return formatCurrencyIN(val, { compact: false, decimals: 2 });
};
