import AsyncStorage from '@react-native-async-storage/async-storage';
import { getMealById } from './mealUtils';
import { STORAGE_KEYS } from './preferences';

export function normalizeFavoriteIds(value) {
  if (!Array.isArray(value)) {
    return [];
  }

  return [...new Set(value.filter((id) => Number.isInteger(id) && id > 0))];
}

/**
 * @returns {Promise<number[]>}
 */
export async function loadFavoriteIds() {
  const savedFavorites = await AsyncStorage.getItem(STORAGE_KEYS.favoriteMeals);

  return normalizeFavoriteIds(savedFavorites ? JSON.parse(savedFavorites) : []);
}

/**
 * Resolves saved ids to catalog meals, most recently favorited first.
 * Ids that no longer exist in the catalog are skipped.
 *
 * @param {number[]} favoriteIds
 * @returns {import('./types').Meal[]}
 */
export function getFavoriteMeals(favoriteIds) {
  return [...favoriteIds]
    .reverse()
    .map(getMealById)
    .filter(Boolean);
}
