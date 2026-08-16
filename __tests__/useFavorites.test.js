import { act, renderHook, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import useFavorites from '../hooks/useFavorites';
import { STORAGE_KEYS } from '../lib/preferences';

describe('useFavorites', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('hydrates a meal favorite from deduplicated stored ids', async () => {
    AsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify([2, 2, 'invalid', 7]));

    const { result } = renderHook(() => useFavorites(2));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.isFavorite).toBe(true);
    expect(AsyncStorage.getItem).toHaveBeenCalledWith(STORAGE_KEYS.favoriteMeals);
  });

  it('favorites and unfavorites a meal without duplicate ids', async () => {
    AsyncStorage.getItem.mockResolvedValue(JSON.stringify([2, 2]));

    const { result } = renderHook(() => useFavorites(2));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.toggleFavorite();
    });
    expect(result.current.isFavorite).toBe(false);
    expect(AsyncStorage.setItem).toHaveBeenLastCalledWith(
      STORAGE_KEYS.favoriteMeals,
      JSON.stringify([])
    );

    await act(async () => {
      await result.current.toggleFavorite();
    });
    expect(result.current.isFavorite).toBe(true);
    expect(AsyncStorage.setItem).toHaveBeenLastCalledWith(
      STORAGE_KEYS.favoriteMeals,
      JSON.stringify([2])
    );
  });

  it('keeps the confirmed state when persistence fails', async () => {
    AsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify([]));
    const { result } = renderHook(() => useFavorites(2));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    AsyncStorage.setItem.mockRejectedValueOnce(new Error('storage unavailable'));
    await act(async () => {
      await result.current.toggleFavorite();
    });

    expect(result.current.isFavorite).toBe(false);
  });
});