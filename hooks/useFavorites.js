import { useCallback, useEffect, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../lib/preferences';

function normalizeFavoriteIds(value) {
  if (!Array.isArray(value)) {
    return [];
  }

  return [...new Set(value.filter((id) => Number.isInteger(id) && id > 0))];
}

export default function useFavorites(mealId) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const currentFavoriteRef = useRef(false);
  const confirmedFavoriteRef = useRef(false);
  const favoriteIdsRef = useRef([]);
  const writeQueueRef = useRef(Promise.resolve());

  useEffect(() => {
    let isMounted = true;

    async function loadFavorites() {
      try {
        const savedFavorites = await AsyncStorage.getItem(STORAGE_KEYS.favoriteMeals);
        const favoriteIds = normalizeFavoriteIds(
          savedFavorites ? JSON.parse(savedFavorites) : []
        );
        const loadedIsFavorite = favoriteIds.includes(mealId);

        favoriteIdsRef.current = favoriteIds;
        currentFavoriteRef.current = loadedIsFavorite;
        confirmedFavoriteRef.current = loadedIsFavorite;
        if (isMounted) {
          setIsFavorite(loadedIsFavorite);
        }
      } catch (error) {
        console.error('Error loading favorite meals:', error);
        favoriteIdsRef.current = [];
        currentFavoriteRef.current = false;
        confirmedFavoriteRef.current = false;
        if (isMounted) {
          setIsFavorite(false);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadFavorites();

    return () => {
      isMounted = false;
    };
  }, [mealId]);

  const toggleFavorite = useCallback(() => {
    const nextIsFavorite = !currentFavoriteRef.current;
    currentFavoriteRef.current = nextIsFavorite;
    setIsFavorite(nextIsFavorite);

    const write = writeQueueRef.current.then(async () => {
      const nextFavoriteIds = nextIsFavorite
        ? normalizeFavoriteIds([...favoriteIdsRef.current, mealId])
        : favoriteIdsRef.current.filter((id) => id !== mealId);

      await AsyncStorage.setItem(
        STORAGE_KEYS.favoriteMeals,
        JSON.stringify(nextFavoriteIds)
      );
      favoriteIdsRef.current = nextFavoriteIds;
      confirmedFavoriteRef.current = nextIsFavorite;
    }).catch((error) => {
      console.error('Error saving favorite meals:', error);
      if (currentFavoriteRef.current === nextIsFavorite) {
        currentFavoriteRef.current = confirmedFavoriteRef.current;
        setIsFavorite(confirmedFavoriteRef.current);
      }
    });

    writeQueueRef.current = write.catch(() => undefined);
    return write;
  }, [mealId]);

  return { isFavorite, isLoading, toggleFavorite };
}