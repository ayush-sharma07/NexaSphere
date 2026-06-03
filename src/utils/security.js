/**
 * Security and Sanitization Utilities
 */

/**
 * Basic HTML sanitizer to prevent Cross-Site Scripting (XSS).
 * Strips HTML tags and escapes sensitive characters.
 * 
 * @param {string} input - Raw input string
 * @returns {string} Sanitized string
 */
export function sanitizeInput(input) {
  if (typeof input !== 'string') return '';
  
  return input
    .replace(/<[^>]*>/g, '') // Strip HTML tags
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Check if the input contains potential script elements or malicious tags.
 * 
 * @param {string} input - Input to inspect
 * @returns {boolean} True if input is suspicious
 */
export function isSuspiciousInput(input) {
  if (typeof input !== 'string') return false;
  
  const pattern = /javascript:|onload|onerror|onclick|onmouseover|<script/i;
  return pattern.test(input);
}
