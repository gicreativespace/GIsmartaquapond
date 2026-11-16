
/**
 * GI SMART POND
 * Date and Time Utilities
 *
 * Common date/time formatting functions.
 */

const DEFAULT_LOCALE = 'en-IN';
const DEFAULT_TIMEZONE = 'Asia/Kolkata';

export function getCurrentDate() {
  return new Date();
}

export function getCurrentTimestamp() {
  return Date.now();
}

export function formatDate(
  date = new Date(),
  options = {}
) {
  const value = new Date(date);

  if (Number.isNaN(value.getTime())) {
    return '--';
  }

  return new Intl.DateTimeFormat(DEFAULT_LOCALE, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: DEFAULT_TIMEZONE,
    ...options
  }).format(value);
}

export function formatTime(date = new Date()) {
  const value = new Date(date);

  if (Number.isNaN(value.getTime())) {
    return '--';
  }

  return new Intl.DateTimeFormat(DEFAULT_LOCALE, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZone: DEFAULT_TIMEZONE
  }).format(value);
}

export function formatDateTime(date = new Date()) {
  const value = new Date(date);

  if (Number.isNaN(value.getTime())) {
    return '--';
  }

  return `${formatDate(value)} · ${formatTime(value)}`;
}

export function getStartOfDay(date = new Date()) {
  const value = new Date(date);

  if (Number.isNaN(value.getTime())) {
    throw new Error('Invalid date');
  }

  value.setHours(0, 0, 0, 0);

  return value;
}

export function getEndOfDay(date = new Date()) {
  const value = new Date(date);

  if (Number.isNaN(value.getTime())) {
    throw new Error('Invalid date');
  }

  value.setHours(23, 59, 59, 999);

  return value;
}

export function getElapsedHours(startTime, endTime = Date.now()) {
  const start = new Date(startTime).getTime();
  const end = new Date(endTime).getTime();

  if (!Number.isFinite(start) || !Number.isFinite(end)) {
    throw new Error('Invalid time range');
  }

  return Math.max(0, (end - start) / 3600000);
}
