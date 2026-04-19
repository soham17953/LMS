/**
 * Utility functions for normalizing class/standard values
 * to ensure consistency between student profiles and database content
 */

/**
 * Normalize a class value by removing suffixes like "th", "st", "nd", "rd"
 * @param {string|number} classValue - The class value to normalize
 * @returns {string} - Normalized class value
 */
function normalizeClass(classValue) {
  if (!classValue) return '';
  
  // Convert to string and remove common suffixes
  return String(classValue)
    .trim()
    .replace(/(?:st|nd|rd|th)$/i, '');
}

/**
 * Normalize an array of class values
 * @param {Array<string|number>} classArray - Array of class values
 * @returns {Array<string>} - Array of normalized class values
 */
function normalizeClassArray(classArray) {
  if (!Array.isArray(classArray)) return [];
  
  return classArray
    .map(normalizeClass)
    .filter(Boolean); // Remove empty strings
}

module.exports = {
  normalizeClass,
  normalizeClassArray
};
