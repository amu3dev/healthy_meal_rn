import AsyncStorage from '@react-native-async-storage/async-storage';
import { getFavoriteMeals, loadFavoriteIds, normalizeFavoriteIds } from '../lib/favorites';
import { STORAGE_KEYS } from '../lib/preferences';

describe('favorites helpers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('normalizes stored ids to unique positive integers', () => {
    expect(normalizeFavoriteIds([2, 2, 'invalid', 0, -1, 1.5, 7])).toEqual([2, 7]);
    expect(normalizeFavoriteIds({ 2: true })).toEqual([]);
  });

  it('loads normalized ids from storage and treats a missing key as empty', async () => {
    AsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify([3, 3, 'x']));
    await expect(loadFavoriteIds()).resolves.toEqual([3]);
    expect(AsyncStorage.getItem).toHaveBeenCalledWith(STORAGE_KEYS.favoriteMeals);

    AsyncStorage.getItem.mockResolvedValueOnce(null);
    await expect(loadFavoriteIds()).resolves.toEqual([]);
  });

  it('resolves favorites newest first and skips ids missing from the catalog', () => {
    const meals = getFavoriteMeals([1, 999, 4]);

    expect(meals.map((meal) => meal.id)).toEqual([4, 1]);
  });
});
