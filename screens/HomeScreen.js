import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import MealCard from '../components/MealCard';
import { getDailyMeal, getNoMatchMessage, getPreferenceSummary } from '../lib/mealUtils';
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
  const [hasActivePreferences, setHasActivePreferences] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const { loadPreferences } = usePreferences({ loadOnMount: false });

  const loadDailyMeal = useCallback(async () => {
    try {
      const parsedPreferences = await loadPreferences();
      const dailyMeal = getDailyMeal(parsedPreferences);
      setLoadError(false);
      const enabledPreferences = getEnabledPreferences(parsedPreferences);

      setMeal(dailyMeal);
      setHasActivePreferences(enabledPreferences.length > 0);
      setStatusMessage(
        dailyMeal
          ? getPreferenceSummary(parsedPreferences)
          : enabledPreferences.length > 0
            ? getNoMatchMessage(parsedPreferences)
            : 'No meals are available right now.'
      );
    } catch (error) {
      console.error('Error loading meal:', error);
      setLoadError(true);
      setMeal(null);
      setHasActivePreferences(false);
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

  const handleRetry = useCallback(() => {
    setIsLoading(true);
    loadDailyMeal();
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
        <>
          <MealCard
            meal={meal}
            cardStyle={styles.card}
            imageStyle={styles.mealImage}
            contentStyle={styles.mealInfo}
            titleStyle={styles.mealName}
            metaStyle={styles.metaText}
            nutritionRowStyle={styles.nutritionContainer}
            onPress={() => navigation.navigate('RecipeDetail', { mealId: meal.id })}
            accessibilityLabel={`Open recipe details for ${meal.name}`}
          />

          {!hasActivePreferences && (
            <View style={styles.preferencePrompt}>
              <Text style={styles.preferencePromptTitle}>Make today&apos;s pick fit you</Text>
              <Text style={styles.preferencePromptText}>
                Set dietary filters or optional meal goals to narrow your recommendation.
              </Text>
              <TouchableOpacity
                style={styles.preferencePromptButton}
                onPress={() => navigation.navigate('Preferences')}
                accessibilityRole="button"
                accessibilityLabel="Set dietary preferences"
              >
                <Text style={styles.preferencePromptButtonText}>Set Preferences</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.exploreCard}>
            <Text style={styles.exploreTitle}>Want more ideas?</Text>
            <Text style={styles.exploreText}>
              Keep today&apos;s pick intact and browse a swipeable gallery of more matching meals.
            </Text>
            <TouchableOpacity
              style={styles.exploreButton}
              onPress={() => navigation.navigate('Explore')}
              accessibilityRole="button"
              accessibilityLabel="Explore more meal ideas"
            >
              <Text style={styles.exploreButtonText}>Explore More Meals</Text>
            </TouchableOpacity>
          </View>
        </>
      ) : loadError ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>Unable to load today&apos;s meal</Text>
          <Text style={styles.emptyText}>
            We could not load your saved preferences. Try again without changing them.
          </Text>
          <TouchableOpacity
            style={styles.emptyButton}
            onPress={handleRetry}
            accessibilityRole="button"
            accessibilityLabel="Retry loading today's meal"
          >
            <Text style={styles.emptyButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>No meal matches all selections</Text>
          <Text style={styles.emptyText}>
            Turn off one selected filter or goal, save your changes, and return here to try again. Nothing is changed automatically.
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
    margin: SPACING.lg,
  },
  emptyCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADII.xl,
    margin: SPACING.lg,
    padding: SPACING.xl,
    ...SHADOWS.card,
  },
  preferencePrompt: {
    backgroundColor: COLORS.surface,
    borderRadius: RADII.xl,
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
    padding: SPACING.xl,
    ...SHADOWS.soft,
  },
  preferencePromptTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  preferencePromptText: {
    color: COLORS.textMuted,
    fontSize: 15,
    lineHeight: 22,
  },
  preferencePromptButton: {
    marginTop: SPACING.lg,
    borderRadius: RADII.md,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: COLORS.primary,
  },
  preferencePromptButtonText: {
    color: COLORS.primaryContrast,
    fontSize: 15,
    fontWeight: 'bold',
  },
  exploreCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADII.xl,
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
    padding: SPACING.xl,
    ...SHADOWS.card,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  exploreTitle: {
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
  exploreText: {
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
  exploreButton: {
    marginTop: SPACING.lg,
    backgroundColor: COLORS.primary,
    borderRadius: RADII.md,
    paddingVertical: 12,
    alignItems: 'center',
  },
  exploreButtonText: {
    color: COLORS.primaryContrast,
    fontWeight: 'bold',
    fontSize: 15,
  },
  mealImage: {
    height: 200,
  },
  mealInfo: {
    padding: SPACING.lg,
  },
  mealName: {
    marginBottom: SPACING.lg,
  },
  nutritionContainer: {
    marginTop: 8,
  },
  metaText: {
    marginTop: SPACING.lg,
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
