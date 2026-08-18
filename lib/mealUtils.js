import MEALS from '../data/meals';
import {
  formatPreferenceLabel,
  getEnabledPreferences,
  mergePreferences,
} from './preferences';

export const HIGH_PROTEIN_THRESHOLD = 20;

/**
 * @param {Partial<import('./types').Meal>|null|undefined} meal
 * @returns {boolean}
 */
export function isHighProteinMeal(meal) {
  const proteinMatch =
    typeof meal?.protein === 'string' && meal.protein.match(/^(\d+)g$/);
  const proteinGrams = proteinMatch ? Number(proteinMatch[1]) : NaN;

  return Number.isFinite(proteinGrams) && proteinGrams >= HIGH_PROTEIN_THRESHOLD;
}

/**
 * @param {number|string|null|undefined} mealId
 * @returns {import('./types').Meal|null}
 */
export function getMealById(mealId) {
  const normalizedMealId = Number(mealId);

  if (!Number.isFinite(normalizedMealId)) {
    return null;
  }

  return MEALS.find((meal) => meal.id === normalizedMealId) || null;
}

function getLocalDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function hashString(value) {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }

  return hash;
}

/**
 * @param {Partial<import('./types').Preferences>} [preferences={}]
 * @returns {import('./types').Meal[]}
 */
export function getMatchingMeals(preferences = {}) {
  const normalizedPreferences = mergePreferences(preferences);
  const enabledPreferences = getEnabledPreferences(normalizedPreferences);
  const matchingMeals =
    enabledPreferences.length === 0
      ? MEALS
      : MEALS.filter((meal) =>
          enabledPreferences.every((key) => meal.tags && meal.tags[key])
        );

  if (!preferences.highProteinOnly) {
    return matchingMeals;
  }

  return matchingMeals.filter(isHighProteinMeal);
}

/**
 * @param {Partial<import('./types').Preferences>} [preferences={}]
 * @param {Date} [date=new Date()]
 * @returns {import('./types').Meal|null}
 */
export function getDailyMeal(preferences = {}, date = new Date()) {
  const matchingMeals = getMatchingMeals(preferences);

  if (matchingMeals.length === 0) {
    return null;
  }

  const enabledPreferences = getEnabledPreferences(preferences);
  const selectionKey = `${getLocalDateKey(date)}:${enabledPreferences.join(',') || 'all'}`;
  const mealIndex = hashString(selectionKey) % matchingMeals.length;

  return matchingMeals[mealIndex];
}

/**
 * @param {Partial<import('./types').Preferences>} [preferences={}]
 * @returns {string}
 */
export function getPreferenceSummary(preferences = {}) {
  const enabledPreferences = getEnabledPreferences(preferences);
  const activeLabels = [
    ...enabledPreferences.map(formatPreferenceLabel),
    ...(preferences.highProteinOnly
      ? [`High Protein Only (${HIGH_PROTEIN_THRESHOLD}g+)`]
      : []),
  ];

  if (activeLabels.length === 0) {
    return 'Showing all meals';
  }

  return `Filtered by ${activeLabels.join(', ')}`;
}
