/**
 * numberValidation.js
 *
 * Universal non-negative & number validation utilities for the entire project.
 * Prevents negative values (e.g. -2, -1) in any number fields (price, stock,
 * quantity, coupon discount, max uses, min order, ratings, etc.).
 */

// ── 1. Predicates ─────────────────────────────────────────────────────────────

/**
 * Checks whether a value is a valid non-negative number (>= 0).
 * Returns false for NaN, null, undefined, or negative numbers like -2.
 */
export function isNonNegative(value) {
  if (value === null || value === undefined || value === '') return false;
  const n = Number(value);
  return !Number.isNaN(n) && Number.isFinite(n) && n >= 0;
}

/**
 * Checks whether a value is strictly positive (> 0).
 */
export function isPositive(value) {
  if (value === null || value === undefined || value === '') return false;
  const n = Number(value);
  return !Number.isNaN(n) && Number.isFinite(n) && n > 0;
}

// ── 2. Form Field Validator Rules (returns string error or null) ───────────────

/**
 * Validates that a value cannot be negative (must be >= 0).
 * Example: rejects -2, -10 with a clear error message.
 *
 * @param {any} value
 * @param {string} [label='Field']
 * @returns {string|null}
 */
export function nonNegativeNumber(value, label = 'Field') {
  if (value === '' || value === null || value === undefined) return null; // let `required` handle empty
  const n = Number(value);
  if (Number.isNaN(n)) return `${label} must be a valid number`;
  if (n < 0) return `${label} cannot be negative (entered: ${value}). Must be 0 or greater.`;
  return null;
}

/**
 * Validates that a value must be strictly greater than 0 (> 0).
 * Example: rejects 0, -1, -2 for fields like price, stock, quantity, etc.
 *
 * @param {any} value
 * @param {string} [label='Field']
 * @returns {string|null}
 */
export function positiveNumber(value, label = 'Field') {
  if (value === '' || value === null || value === undefined) return null;
  const n = Number(value);
  if (Number.isNaN(n)) return `${label} must be a valid number`;
  if (n <= 0) return `${label} must be greater than 0 (entered: ${value}).`;
  return null;
}

/**
 * Validates that a value is at least `minimum`.
 *
 * @param {number} minimum
 * @returns {(value: any, label?: string) => string|null}
 */
export const minNumber = (minimum = 0) => (value, label = 'Field') => {
  if (value === '' || value === null || value === undefined) return null;
  const n = Number(value);
  if (Number.isNaN(n)) return `${label} must be a valid number`;
  if (n < minimum) {
    return `${label} must be at least ${minimum} (entered: ${value}).`;
  }
  return null;
};

/**
 * Validates that a value is an integer and non-negative (>= 0).
 */
export function integerNonNegative(value, label = 'Field') {
  const err = nonNegativeNumber(value, label);
  if (err) return err;
  if (value === '' || value === null || value === undefined) return null;
  const n = Number(value);
  if (!Number.isInteger(n)) return `${label} must be a whole number (integer).`;
  return null;
}

/**
 * Validates number range [minimum, maximum].
 */
export const numberRange = (minimum = 0, maximum = Infinity) => (value, label = 'Field') => {
  const minErr = minNumber(minimum)(value, label);
  if (minErr) return minErr;
  if (value === '' || value === null || value === undefined) return null;
  const n = Number(value);
  if (n > maximum) return `${label} cannot exceed ${maximum}.`;
  return null;
};

// ── 3. Sanitizers ─────────────────────────────────────────────────────────────

/**
 * Clamps any numeric value to never fall below `min` (default 0).
 * Rejects negative inputs by returning `min`.
 *
 * @param {any} value
 * @param {number} [min=0]
 * @param {number} [max=Infinity]
 * @returns {number}
 */
export function clampNonNegative(value, min = 0, max = Infinity) {
  const parsed = Number(value);
  if (Number.isNaN(parsed) || !Number.isFinite(parsed)) return min;
  return Math.min(Math.max(min, parsed), max);
}

/**
 * Sanitizes input string/number to remove negative values.
 * Returns a sanitized string or number >= 0.
 */
export function sanitizeNonNegative(value, fallback = '0') {
  if (value === '' || value === null || value === undefined) return '';
  const num = Number(value);
  if (Number.isNaN(num) || num < 0) return String(fallback);
  return String(num);
}

// ── 4. Input Keyboard & Paste Event Helpers ────────────────────────────────────

/**
 * onKeyDown event listener to block minus ('-'), plus ('+'), and exponent ('e', 'E')
 * from ever being typed into numeric inputs.
 *
 * Usage:
 *   <input type="number" onKeyDown={preventNegativeInput} />
 *   <TextField type="number" onKeyDown={preventNegativeInput} />
 */
export function preventNegativeInput(e) {
  // Block '-' (minus), 'e' (scientific notation), 'E', and '+'
  if (
    e.key === '-' ||
    e.key === 'Minus' ||
    e.key === 'Subtract' ||
    e.key === 'e' ||
    e.key === 'E' ||
    e.keyCode === 189 || // '-' on main keyboard
    e.keyCode === 109    // '-' on numpad
  ) {
    e.preventDefault();
  }
}

/**
 * onPaste event listener to block pasting strings that contain a minus sign or negative value.
 *
 * Usage:
 *   <input type="number" onPaste={preventNegativePaste} />
 */
export function preventNegativePaste(e) {
  const pasteText = (e.clipboardData || window.clipboardData)?.getData('text') || '';
  if (pasteText.includes('-') || (Number(pasteText) < 0 && !Number.isNaN(Number(pasteText)))) {
    e.preventDefault();
  }
}

/**
 * Combines inputProps for Material-UI or native HTML number inputs.
 * Spread this onto any number input:
 *   <TextField type="number" {...nonNegativeInputProps(0)} />
 */
export function nonNegativeInputProps(min = 0, max) {
  return {
    onKeyDown: preventNegativeInput,
    onPaste: preventNegativePaste,
    inputProps: {
      min,
      ...(max !== undefined ? { max } : {}),
    },
  };
}

// ── 5. Form Object Validator Helper ───────────────────────────────────────────

/**
 * Scans an entire form data object for any fields that should never be negative.
 * Returns an errors object containing messages for any negative fields found.
 *
 * @param {Record<string, any>} formData
 * @param {Array<string|{field: string, label?: string, min?: number}>} fieldDefs
 * @returns {Record<string, string>}
 */
export function validateFormNonNegative(formData = {}, fieldDefs = []) {
  const errors = {};

  fieldDefs.forEach((def) => {
    const field = typeof def === 'string' ? def : def.field;
    const label = (typeof def === 'object' && def.label) ? def.label : field;
    const minimum = (typeof def === 'object' && def.min !== undefined) ? def.min : 0;

    const value = formData[field];
    if (value !== undefined && value !== null && value !== '') {
      const n = Number(value);
      if (Number.isNaN(n)) {
        errors[field] = `${label} must be a valid number`;
      } else if (n < minimum) {
        errors[field] = `${label} cannot be negative (entered: ${value}). Must be at least ${minimum}.`;
      }
    }
  });

  return errors;
}

export default {
  isNonNegative,
  isPositive,
  nonNegativeNumber,
  positiveNumber,
  minNumber,
  integerNonNegative,
  numberRange,
  clampNonNegative,
  sanitizeNonNegative,
  preventNegativeInput,
  preventNegativePaste,
  nonNegativeInputProps,
  validateFormNonNegative,
};
