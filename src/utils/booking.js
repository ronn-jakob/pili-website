export function parseDate(value) {
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime())
    ? new Date('2026-11-12T00:00:00')
    : date;
}

export function formatLongDate(date) {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

export function formatShortDate(date) {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
  }).format(date);
}

export function formatMoney(value, currency) {
  return new Intl.NumberFormat(currency === 'USD' ? 'en-US' : 'en-PH', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

export function getCancellationDate(date, hours) {
  return new Date(date.getTime() - hours * 60 * 60 * 1000);
}
