/**
 * Utility functions for normalizing class/standard values
 * to ensure consistency between student profiles and database content
 */

/**
 * Normalize a class value by removing suffixes like "th", "st", "nd", "rd"
 * @param {string|number} classValue - The class value to normalize (e.g., "8th", "9th", "10th")
 * @returns {string} - Normalized class value (e.g., "8", "9", "10")
 * 
 * @example
 * normalizeClass("8th") // returns "8"
 * normalizeClass("9th") // returns "9"
 * normalizeClass("10th") // returns "10"
 * normalizeClass(8) // returns "8"
 */
export function normalizeClass(classValue) {
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
 * 
 * @example
 * normalizeClassArray(["8th", "9th"]) // returns ["8", "9"]
 */
export function normalizeClassArray(classArray) {
  if (!Array.isArray(classArray)) return [];
  
  return classArray
    .map(normalizeClass)
    .filter(Boolean); // Remove empty strings
}

/**
 * Format a class value for display (adds "th" suffix)
 * @param {string|number} classValue - The class value
 * @returns {string} - Formatted class value for display
 * 
 * @example
 * formatClassForDisplay("8") // returns "8th"
 * formatClassForDisplay("9") // returns "9th"
 */
export function formatClassForDisplay(classValue) {
  if (!classValue) return '';
  
  const normalized = normalizeClass(classValue);
  
  // Add appropriate suffix
  const num = parseInt(normalized, 10);
  if (isNaN(num)) return normalized;
  
  // Special cases for 11, 12, 13
  if (num >= 11 && num <= 13) return `${num}th`;
  
  // Get last digit
  const lastDigit = num % 10;
  
  switch (lastDigit) {
    case 1: return `${num}st`;
    case 2: return `${num}nd`;
    case 3: return `${num}rd`;
    default: return `${num}th`;
  }
}

/**
 * Get available classes for a given medium
 * @param {string} medium - "English" | "Marathi"
 * @returns {Array<{value: string, label: string}>} - Array of class options
 */
export function getClassOptionsForMedium(medium) {
  const englishClasses = ['8', '9', '10'];
  const marathiClasses = ['5', '6', '7', '8', '9', '10'];
  
  const classes = medium === 'English' ? englishClasses : 
                  medium === 'Marathi' ? marathiClasses : 
                  [];
  
  return classes.map(cls => ({
    value: cls, // Store without suffix
    label: formatClassForDisplay(cls) // Display with suffix
  }));
}
