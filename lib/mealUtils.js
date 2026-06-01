import MEALS from '../data/meals';
import {
  formatPreferenceLabel,
  getEnabledPreferences,
  mergePreferences,
} from './preferences';

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

export function getMatchingMeals(preferences = {}) {
  const normalizedPreferences = mergePreferences(preferences);
  const enabledPreferences = getEnabledPreferences(normalizedPreferences);

  if (enabledPreferences.length === 0) {
    return MEALS;
  }

  return MEALS.filter((meal) =>
    enabledPreferences.every((key) => meal.tags && meal.tags[key])
  );
}

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

export function getPreferenceSummary(preferences = {}) {
  const enabledPreferences = getEnabledPreferences(preferences);

  if (enabledPreferences.length === 0) {
    return 'Showing all meals';
  }

  return `Filtered by ${enabledPreferences.map(formatPreferenceLabel).join(', ')}`;
}
