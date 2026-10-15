import React, { useCallback, useRef, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import MealCard from '../components/MealCard';
import { getFavoriteMeals, loadFavoriteIds } from '../lib/favorites';
import { COLORS, RADII, SHADOWS, SPACING } from '../lib/theme';

export default function FavoritesScreen({ navigation }) {
  const hasLoadedRef = useRef(false);
  const [meals, setMeals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  const loadFavorites = useCallback(async () => {
    try {
      const favoriteIds = await loadFavoriteIds();
      setMeals(getFavoriteMeals(favoriteIds));
      setLoadError(false);
      hasLoadedRef.current = true;
    } catch (error) {
      console.error('Error loading favorite meals:', error);
      setMeals([]);
      setLoadError(true);
      hasLoadedRef.current = false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Reload on every focus so favorites toggled in Recipe Details show up here.
  useFocusEffect(
    useCallback(() => {
      if (!hasLoadedRef.current) {
        setIsLoading(true);
      }
      loadFavorites();
    }, [loadFavorites])
  );

  const handleRetry = useCallback(() => {
    setIsLoading(true);
    loadFavorites();
  }, [loadFavorites]);

  if (isLoading) {
    return (
      <View
        style={styles.loadingContainer}
        accessibilityRole="progressbar"
        accessibilityLabel="Loading favorite meals"
      >
        <Text>Loading favorites...</Text>
      </View>
    );
  }

  if (loadError) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>Unable to load favorites</Text>
          <Text style={styles.emptyText}>
            We could not read your saved favorites. Try again; nothing has been removed.
          </Text>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleRetry}
            accessibilityRole="button"
            accessibilityLabel="Retry loading favorite meals"
          >
            <Text style={styles.primaryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (meals.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>No favorites yet</Text>
          <Text style={styles.emptyText}>
            Tap the heart on any recipe to save it here for later.
          </Text>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => navigation.navigate('Explore')}
            accessibilityRole="button"
            accessibilityLabel="Explore meals to favorite"
          >
            <Text style={styles.primaryButtonText}>Explore Meals</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={styles.listContent}
      data={meals}
      keyExtractor={(item) => String(item.id)}
      ItemSeparatorComponent={() => <View style={styles.cardGap} />}
      renderItem={({ item }) => (
        <MealCard
          meal={item}
          imageStyle={styles.mealImage}
          onPress={() => navigation.navigate('RecipeDetail', { mealId: item.id })}
        />
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    padding: SPACING.lg,
  },
  cardGap: {
    height: SPACING.lg,
  },
  mealImage: {
    height: 160,
  },
  emptyCard: {
    margin: SPACING.lg,
    padding: SPACING.xl,
    borderRadius: RADII.xl,
    backgroundColor: COLORS.surface,
    ...SHADOWS.card,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  emptyText: {
    fontSize: 15,
    lineHeight: 22,
    color: COLORS.textMuted,
  },
  primaryButton: {
    marginTop: SPACING.lg,
    backgroundColor: COLORS.primary,
    borderRadius: RADII.md,
    paddingVertical: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: COLORS.primaryContrast,
    fontSize: 15,
    fontWeight: '700',
  },
});
