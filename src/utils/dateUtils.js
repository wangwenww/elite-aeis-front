import dayjs from 'dayjs';

/**
 * Format date to a readable string
 * @param {string|Date} value - The date value to format
 * @param {string} format - The format string (default: 'YYYY-MM-DD HH:mm')
 * @returns {string} - Formatted date string or '-' if invalid
 */
export const formatDate = (value, format = 'YYYY-MM-DD HH:mm') => {
  if (!value) return '-';
  try {
    return dayjs(value).format(format);
  } catch (e) {
    console.warn('Invalid date format:', value);
    return '-';
  }
};

/**
 * Format date to date only
 * @param {string|Date} value - The date value to format
 * @returns {string} - Formatted date string or '-' if invalid
 */
export const formatDateOnly = (value) => {
  return formatDate(value, 'YYYY-MM-DD');
};

/**
 * Format date to time only
 * @param {string|Date} value - The date value to format
 * @returns {string} - Formatted time string or '-' if invalid
 */
export const formatTimeOnly = (value) => {
  return formatDate(value, 'HH:mm');
};

/**
 * Get start of day
 * @param {string|Date} date - The date to get start of day for
 * @returns {dayjs.Dayjs} - Start of day
 */
export const startOfDay = (date) => {
  return dayjs(date).startOf('day');
};

/**
 * Get end of day
 * @param {string|Date} date - The date to get end of day for
 * @returns {dayjs.Dayjs} - End of day
 */
export const endOfDay = (date) => {
  return dayjs(date).endOf('day');
};