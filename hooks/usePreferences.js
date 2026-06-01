import { useCallback, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  DEFAULT_PREFERENCES,
  STORAGE_KEYS,
  mergePreferences,
} from '../lib/preferences';

export default function usePreferences(options = {}) {
  const { loadOnMount = true } = options;
  const [preferences, setPreferences] = useState(DEFAULT_PREFERENCES);
  const [isLoading, setIsLoading] = useState(loadOnMount);

  const loadPreferences = useCallback(async () => {
    setIsLoading(true);

    try {
      const savedPreferences = await AsyncStorage.getItem(STORAGE_KEYS.userPreferences);
      const nextPreferences = savedPreferences
        ? mergePreferences(JSON.parse(savedPreferences))
        : DEFAULT_PREFERENCES;

      setPreferences(nextPreferences);
      return nextPreferences;
    } catch (error) {
      console.error('Error loading preferences:', error);
      setPreferences(DEFAULT_PREFERENCES);
      return DEFAULT_PREFERENCES;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const savePreferences = useCallback(async (nextPreferences = preferences) => {
    const normalizedPreferences = mergePreferences(nextPreferences);

    await AsyncStorage.setItem(
      STORAGE_KEYS.userPreferences,
      JSON.stringify(normalizedPreferences)
    );
    setPreferences(normalizedPreferences);

    return normalizedPreferences;
  }, [preferences]);

  const togglePreference = useCallback((key) => {
    setPreferences((currentPreferences) => ({
      ...currentPreferences,
      [key]: !currentPreferences[key],
    }));
  }, []);

  useEffect(() => {
    if (loadOnMount) {
      loadPreferences();
    }
  }, [loadOnMount, loadPreferences]);

  return {
    preferences,
    setPreferences,
    isLoading,
    loadPreferences,
    savePreferences,
    togglePreference,
  };
}
