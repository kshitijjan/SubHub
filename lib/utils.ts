import dayjs from "dayjs";

/**
 * Formats a number to a currency string.
 * Defaults to INR formatting (e.g. ₹1,23,456.78) with exactly two decimal places.
 * 
 * @param value The numerical value to format.
 * @param currency The currency code (default: 'INR').
 * @returns Formatted currency string.
 */
export function formatCurrency(value: number, currency: string = 'INR'): string {
  try {
    const uppercaseCurrency = currency.toUpperCase();
    const locale = uppercaseCurrency === 'INR' ? 'en-IN' : 'en-US';
    
    const hasDecimal = value % 1 !== 0;

    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: uppercaseCurrency,
      minimumFractionDigits: hasDecimal ? 2 : 0,
      maximumFractionDigits: 2,
    }).format(value);
  } catch (error) {
    console.error("Error formatting currency with Intl.NumberFormat, falling back:", error);
    try {
      const hasDecimal = value % 1 !== 0;
      const formattedValue = hasDecimal ? (value || 0).toFixed(2) : Math.round(value || 0).toString();
      const uppercaseCurrency = (currency || 'INR').toUpperCase();
      if (uppercaseCurrency === 'INR') {
        return `₹${formattedValue}`;
      }
      return `${uppercaseCurrency} ${formattedValue}`;
    } catch (fallbackError) {
      return String(value);
    }
  }
}
export const formatSubscriptionDateTime = (value?: string): string => {
  if (!value) return "Not provided";
  const parsedDate = dayjs(value);
  return parsedDate.isValid() ? parsedDate.format("MM/DD/YYYY") : "Not provided";
};

export const formatStatusLabel = (value?: string): string => {
  if (!value) return "Unknown";
  return value.charAt(0).toUpperCase() + value.slice(1);
};

export const getMonthlyTotal = (subscriptions: Subscription[], targetMonth: number, targetYear: number): number => {
  return subscriptions
    .filter(sub => isActiveInMonth(sub, targetMonth, targetYear))
    .reduce((acc, sub) => acc + sub.price, 0);
};

export const isActiveInMonth = (sub: Subscription, targetMonth: number, targetYear: number): boolean => {
  if (sub.status !== 'active') return false;
  
  let startMonth = 0;
  let startYear = targetYear; 
  
  // Only use startDate if the user explicitly provided one.
  // We don't use created_at because a user might add a 5-year old subscription today.
  if (sub.startDate) {
    const dateObj = dayjs(sub.startDate);
    if (!dateObj.isValid()) return false;
    startMonth = dateObj.month();
    startYear = dateObj.year();
  } else {
    // If no explicit startDate, assume it has been active for the whole year
    startMonth = 0;
    startYear = targetYear - 1; 
  }

  if (startYear > targetYear) return false;
  if (startYear === targetYear && targetMonth < startMonth) return false;

  const renewalMonth = dayjs(sub.renewalDate).month();
  
  if (sub.billing?.toLowerCase() === 'monthly') {
     return true;
  }
  
  return renewalMonth === targetMonth;
};
