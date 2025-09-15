/**
 * Date utility functions to handle timezone normalization
 */

/**
 * Converts a Date object to a local date string in YYYY-MM-DD format
 * This prevents timezone conversion issues when using HTML date inputs
 */
export function toLocalDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Converts a date string (YYYY-MM-DD) to a Date object at local midnight
 * This ensures the date is interpreted in local timezone
 */
export function fromLocalDateString(dateString: string): Date {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
}

/**
 * Gets today's date in YYYY-MM-DD format using local timezone
 */
export function getTodayLocalString(): string {
  return toLocalDateString(new Date());
}

/**
 * Normalizes a date for API submission
 * Converts local date string to ISO string at local midnight
 */
export function normalizeDate(dateString: string): string {
  if (!dateString) return dateString;

  const localDate = fromLocalDateString(dateString);
  // Convert to ISO but maintain the local date
  return localDate.toISOString();
}

/**
 * Converts an ISO date string to local date string for form inputs
 * Handles both full ISO strings and date-only strings
 */
export function isoToLocalDateString(isoString: string): string {
  if (!isoString) return '';

  // If it's already in YYYY-MM-DD format, return as is
  if (/^\d{4}-\d{2}-\d{2}$/.test(isoString)) {
    return isoString;
  }

  // Parse ISO string and convert to local date
  const date = new Date(isoString);
  return toLocalDateString(date);
}

/**
 * Validates if a date string is in valid YYYY-MM-DD format
 */
export function isValidDateString(dateString: string): boolean {
  if (!dateString) return false;
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateString)) return false;

  const date = fromLocalDateString(dateString);
  return !isNaN(date.getTime());
}