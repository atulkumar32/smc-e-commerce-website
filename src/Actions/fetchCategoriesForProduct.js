/**
 * Fetches categories from the API and formats them for product form dropdowns.
 */

import { fetchCategoriesAction } from './CategoryAction';
import { resolveCategoryIds } from '../pages/admin/Categories/categoryFields';

/**
 * Normalize a category row from API/local storage into dropdown option shape.
 * @returns {{ value: string, label: string, id: string|null, category_id: string|null, description: string }}
 */
export function normalizeCategoryForDropdown(category) {
  const label = category.category_name || category.name || 'Unnamed';
  const ids = resolveCategoryIds(category);
  const value = ids.category_id || ids.id || '';

  return {
    value: String(value),
    label,
    id: ids.id,
    category_id: ids.category_id,
    description: category.description || '',
  };
}

/**
 * Fetch all categories for product add/edit dropdown.
 * @returns {Promise<{ options: Array, success: boolean, message: string }>}
 */
export async function fetchCategoriesForProductDropdown() {
  const result = await fetchCategoriesAction();
  const rawList = Array.isArray(result.list) ? result.list : [];

  const options = rawList
    .map(normalizeCategoryForDropdown)
    .filter((opt) => opt.value);

  return {
    options,
    success: result.success !== false,
    message: result.message || '',
  };
}

/**
 * Find option label by value (category_id or id).
 */
export function getCategoryLabelById(options, categoryId) {
  if (!categoryId) return '';
  const found = options.find((opt) => opt.value === String(categoryId));
  return found?.label || '';
}
