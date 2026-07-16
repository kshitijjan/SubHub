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
    
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: uppercaseCurrency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  } catch (error) {
    console.error("Error formatting currency with Intl.NumberFormat, falling back:", error);
    try {
      const formattedValue = (value || 0).toFixed(2);
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
