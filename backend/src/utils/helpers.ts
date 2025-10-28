/**
 * Generate transaction number based on type and date
 * Format: INB-YYYYMMDD-XXX or OUT-YYYYMMDD-XXX
 */
export const generateTransactionNo = (type: 'INBOUND' | 'OUTBOUND', sequence: number): string => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const seq = String(sequence).padStart(4, '0');
  
  const prefix = type === 'INBOUND' ? 'INB' : 'OUT';
  
  return `${prefix}-${year}${month}${day}-${seq}`;
};

/**
 * Calculate shrinkage percentage
 */
export const calculateShrinkage = (initialWeight: number, currentWeight: number): number => {
  if (initialWeight === 0) return 0;
  return ((initialWeight - currentWeight) / initialWeight) * 100;
};

/**
 * Format number to Indonesian locale
 */
export const formatNumber = (num: number, decimals: number = 2): string => {
  return num.toLocaleString('id-ID', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};

/**
 * Generate barcode (simple implementation)
 * In production, use a proper barcode generation library
 */
export const generateBarcode = (prefix: string): string => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `${prefix}${timestamp}${random}`;
};

/**
 * Date range helper
 */
export const getDateRange = (period: 'today' | 'week' | 'month' | 'year') => {
  const now = new Date();
  const start = new Date();
  
  switch (period) {
    case 'today':
      start.setHours(0, 0, 0, 0);
      break;
    case 'week':
      start.setDate(now.getDate() - 7);
      break;
    case 'month':
      start.setMonth(now.getMonth() - 1);
      break;
    case 'year':
      start.setFullYear(now.getFullYear() - 1);
      break;
  }
  
  return { start, end: now };
};
