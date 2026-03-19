export function formatPrice(price: number, currency: string = "EGP"): string {
  // For currencies with symbols, use Intl.NumberFormat
  // For others, just append the currency code
  const symbolCurrencies: Record<string, string> = {
    USD: "en-US",
    EUR: "de-DE",
    GBP: "en-GB",
  };

  if (symbolCurrencies[currency]) {
    return new Intl.NumberFormat(symbolCurrencies[currency], {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price);
  }

  // For EGP, SAR, AED, etc. - just show number + code
  return `${price.toFixed(2)} ${currency}`;
}
