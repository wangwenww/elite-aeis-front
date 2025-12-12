/**
 * Utility functions for API operations
 */

/**
 * Prepend API prefix to a URL if needed
 * @param {string} url - The URL to prepend prefix to
 * @returns {string} - URL with API prefix if needed
 */
export const withApiPrefix = (url) => {
  if (!url) return url;
  if (url.startsWith('http')) {
    return url;
  }
  if (url.startsWith('/')) {
    return import.meta.env.VITE_API_BASE_URL + url;
  }
  return import.meta.env.VITE_API_BASE_URL + '/' + url;
};

/**
 * Extract file name from a file path
 * @param {string} filePath - The file path
 * @returns {string} - The file name
 */
export const extractFileName = (filePath) => {
  if (!filePath) return '';
  return filePath.split('/').pop();
};

/**
 * Format file size in human readable format
 * @param {number} bytes - The file size in bytes
 * @returns {string} - Formatted file size
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Validate email format
 * @param {string} email - The email to validate
 * @returns {boolean} - Whether the email is valid
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate phone number format
 * @param {string} phone - The phone to validate
 * @returns {boolean} - Whether the phone is valid
 */
export const isValidPhone = (phone) => {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
};