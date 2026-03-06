/**
 * Format a number as Sri Lankan Rupees (LKR)
 * @param amount - The amount to format
 * @returns Formatted currency string
 */
export function fmtLKR(amount: number | string): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(num)) {
    return 'LKR 0.00';
  }
  
  return new Intl.NumberFormat('en-LK', {
    style: 'currency',
    currency: 'LKR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(num);
}

/**
 * Parse a currency string to a number
 * @param value - The currency string to parse
 * @returns Parsed number
 */
export function parseLKR(value: string): number {
  const cleaned = value.replace(/[^0-9.-]/g, '');
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}
