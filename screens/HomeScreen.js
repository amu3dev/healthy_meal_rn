import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import MealImage from '../components/MealImage';
import { getDailyMeal, getPreferenceSummary } from '../lib/mealUtils';
import {
  getEnabledPreferences,
} from '../lib/preferences';
import { COLORS, RADII, SHADOWS, SPACING } from '../lib/theme';
import usePreferences from '../hooks/usePreferences';

export default function HomeScreen({ navigation }) {
  const [meal, setMeal] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [statusMessage, setStatusMessage] = useState('Showing all meals');
  const { loadPreferences } = usePreferences({ loadOnMount: false });

  const loadDailyMeal = useCallback(async () => {
    try {
      const parsedPreferences = await loadPreferences();
      const dailyMeal = getDailyMeal(parsedPreferences);
      const enabledPreferences = getEnabledPreferences(parsedPreferences);

      setMeal(dailyMeal);
      setStatusMessage(
        dailyMeal
          ? getPreferenceSummary(parsedPreferences)
          : enabledPreferences.length > 0
            ? 'No meals match your current filters yet'
            : 'No meals are available right now'
      );
    } catch (error) {
      console.error('Error loading meal:', error);
      setMeal(null);
      setStatusMessage('Unable to load today\'s meal right now');
    } finally {
      setIsLoading(false);
    }
  }, [loadPreferences]);

  useFocusEffect(
    useCallback(() => {
      setIsLoading(true);
      loadDailyMeal();
    }, [loadDailyMeal])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadDailyMeal().finally(() => setRefreshing(false));
  }, [loadDailyMeal]);

  if (isLoading) {
    return (
      <View
        style={styles.loadingContainer}
        accessibilityRole="progressbar"
        accessibilityLabel="Loading today's healthy meal"
      >
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.headerText}>Today's Healthy Meal</Text>
        <TouchableOpacity
          style={styles.preferencesButton}
          onPress={() => navigation.navigate('Preferences')}
          accessibilityRole="button"
          accessibilityLabel="Open dietary preferences"
        >
          <MaterialIcons name="settings" size={24} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      <Text style={styles.summaryText}>{statusMessage}</Text>

      {meal ? (
        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate('RecipeDetail', { mealId: meal.id })}
          accessibilityRole="button"
          accessibilityLabel={`Open recipe details for ${meal.name}`}
        >
          <MealImage
            uri={meal.image}
            label={meal.name}
            style={styles.mealImage}
          />
          <View style={styles.mealInfo}>
            <Text style={styles.mealName}>{meal.name}</Text>

            <View style={styles.nutritionContainer}>
              <View style={styles.nutritionItem}>
                <Text style={styles.nutritionValue}>{meal.calories}</Text>
                <Text style={styles.nutritionLabel}>calories</Text>
              </View>
              <View style={styles.nutritionItem}>
                <Text style={styles.nutritionValue}>{meal.protein}</Text>
                <Text style={styles.nutritionLabel}>protein</Text>
              </View>
              <View style={styles.nutritionItem}>
                <Text style={styles.nutritionValue}>{meal.carbs}</Text>
                <Text style={styles.nutritionLabel}>carbs</Text>
              </View>
              <View style={styles.nutritionItem}>
                <Text style={styles.nutritionValue}>{meal.fats}</Text>
                <Text style={styles.nutritionLabel}>fats</Text>
              </View>
            </View>

            <Text style={styles.metaText}>
              {meal.prepTime} • {meal.difficulty} • {meal.cuisine}
            </Text>
          </View>
        </TouchableOpacity>
      ) : (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>No matching meal for today</Text>
          <Text style={styles.emptyText}>
            Adjust your preferences to widen the meal pool, then come back here.
          </Text>
          <TouchableOpacity
            style={styles.emptyButton}
            onPress={() => navigation.navigate('Preferences')}
            accessibilityRole="button"
            accessibilityLabel="Review dietary preferences"
          >
            <Text style={styles.emptyButtonText}>Review Preferences</Text>
          </TouchableOpacity>
        </View>
      )}

      <Text style={styles.tip}>
        Tip: Today's pick stays consistent all day. Change your preferences or come back tomorrow for a new match.
      </Text>
    </ScrollView>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  preferencesButton: {
    padding: SPACING.sm,
  },
  summaryText: {
    marginHorizontal: SPACING.lg,
    color: COLORS.textMuted,
    fontSize: 14,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADII.xl,
    margin: SPACING.lg,
    ...SHADOWS.prominent,
  },
  emptyCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADII.xl,
    margin: SPACING.lg,
    padding: SPACING.xl,
    ...SHADOWS.card,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  emptyText: {
    color: COLORS.textMuted,
    fontSize: 15,
    lineHeight: 22,
  },
  emptyButton: {
    marginTop: SPACING.lg,
    backgroundColor: COLORS.primary,
    borderRadius: RADII.md,
    paddingVertical: 12,
    alignItems: 'center',
  },
  emptyButtonText: {
    color: COLORS.primaryContrast,
    fontWeight: 'bold',
    fontSize: 15,
  },
  mealImage: {
    width: '100%',
    height: 200,
    borderTopLeftRadius: RADII.xl,
    borderTopRightRadius: RADII.xl,
  },
  mealInfo: {
    padding: SPACING.lg,
  },
  mealName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: SPACING.lg,
    color: COLORS.textPrimary,
  },
  nutritionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 8,
  },
  nutritionItem: {
    alignItems: 'center',
  },
  nutritionValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  nutritionLabel: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: SPACING.xs,
  },
  metaText: {
    marginTop: SPACING.lg,
    color: COLORS.textMuted,
    fontSize: 14,
  },
  tip: {
    textAlign: 'center',
    color: COLORS.textMuted,
    fontSize: 14,
    marginTop: 4,
    marginHorizontal: 16,
    lineHeight: 20,
    marginBottom: 24,
  },
});
