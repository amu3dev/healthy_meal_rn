import { act, renderHook, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import usePreferences from '../hooks/usePreferences';
import {
  DEFAULT_PREFERENCES,
  STORAGE_KEYS,
} from '../lib/preferences';

describe('usePreferences', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('hydrates saved preferences on mount by default', async () => {
    AsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify({
      vegan: true,
      dairyFree: true,
    }));

    const { result } = renderHook(() => usePreferences());

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(AsyncStorage.getItem).toHaveBeenCalledWith(STORAGE_KEYS.userPreferences);
    expect(result.current.preferences).toEqual({
      ...DEFAULT_PREFERENCES,
      vegan: true,
      dairyFree: true,
    });
  });

  it('does not load on mount when disabled, but can load later on demand', async () => {
    AsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify({
      highProtein: true,
    }));

    const { result } = renderHook(() => usePreferences({ loadOnMount: false }));

    expect(result.current.isLoading).toBe(false);
    expect(AsyncStorage.getItem).not.toHaveBeenCalled();
    expect(result.current.preferences).toEqual(DEFAULT_PREFERENCES);

    await act(async () => {
      await result.current.loadPreferences();
    });

    expect(AsyncStorage.getItem).toHaveBeenCalledWith(STORAGE_KEYS.userPreferences);
    expect(result.current.preferences).toEqual({
      ...DEFAULT_PREFERENCES,
      highProtein: true,
    });
  });

  it('normalizes and persists preferences when saving', async () => {
    const { result } = renderHook(() => usePreferences({ loadOnMount: false }));

    await act(async () => {
      await result.current.savePreferences({
        vegan: true,
        glutenFree: 'yes',
        lowCarb: 1,
      });
    });

    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      STORAGE_KEYS.userPreferences,
      JSON.stringify({
        ...DEFAULT_PREFERENCES,
        vegan: true,
        glutenFree: true,
        lowCarb: true,
      })
    );
    expect(result.current.preferences).toEqual({
      ...DEFAULT_PREFERENCES,
      vegan: true,
      glutenFree: true,
      lowCarb: true,
    });
  });

  it('toggles a single preference flag in memory', () => {
    const { result } = renderHook(() => usePreferences({ loadOnMount: false }));

    act(() => {
      result.current.togglePreference('vegetarian');
    });

    expect(result.current.preferences.vegetarian).toBe(true);

    act(() => {
      result.current.togglePreference('vegetarian');
    });

    expect(result.current.preferences.vegetarian).toBe(false);
  });
});
