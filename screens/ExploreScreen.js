import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import MealImage from '../components/MealImage';
import { getMatchingMeals, getPreferenceSummary } from '../lib/mealUtils';
import { getEnabledPreferences } from '../lib/preferences';
import { COLORS, RADII, SHADOWS, SPACING } from '../lib/theme';
import usePreferences from '../hooks/usePreferences';

const SCREEN_WIDTH = Dimensions.get('window').width;
const CARD_WIDTH = SCREEN_WIDTH - 56;
const CARD_GAP = SPACING.lg;
const SNAP_INTERVAL = CARD_WIDTH + CARD_GAP;

function shuffleMeals(meals) {
  const nextMeals = [...meals];

  for (let index = nextMeals.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    const currentMeal = nextMeals[index];
    nextMeals[index] = nextMeals[swapIndex];
    nextMeals[swapIndex] = currentMeal;
  }

  return nextMeals;
}

export default function ExploreScreen({ navigation }) {
  const flatListRef = useRef(null);
  const [meals, setMeals] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState('Showing all meals');
  const { loadPreferences } = usePreferences({ loadOnMount: false });

  const currentMeal = meals[activeIndex] || null;
  const hasMeals = meals.length > 0;

  const scrollToIndex = useCallback((nextIndex) => {
    flatListRef.current?.scrollToOffset({
      animated: true,
      offset: nextIndex * SNAP_INTERVAL,
    });
    setActiveIndex(nextIndex);
  }, []);

  const loadExploreMeals = useCallback(async () => {
    try {
      const parsedPreferences = await loadPreferences();
      const matchingMeals = getMatchingMeals(parsedPreferences);
      const randomizedMeals = shuffleMeals(matchingMeals);
      const enabledPreferences = getEnabledPreferences(parsedPreferences);

      setMeals(randomizedMeals);
      setActiveIndex(0);
      setStatusMessage(
        randomizedMeals.length > 0
          ? getPreferenceSummary(parsedPreferences)
          : enabledPreferences.length > 0
            ? 'No meals match your current filters yet'
            : 'No meals are available right now'
      );

      requestAnimationFrame(() => {
        flatListRef.current?.scrollToOffset({ animated: false, offset: 0 });
      });
    } catch (error) {
      console.error('Error loading explore meals:', error);
      setMeals([]);
      setActiveIndex(0);
      setStatusMessage('Unable to load meal ideas right now');
    } finally {
      setIsLoading(false);
    }
  }, [loadPreferences]);

  useFocusEffect(
    useCallback(() => {
      setIsLoading(true);
      loadExploreMeals();
    }, [loadExploreMeals])
  );

  const handleShuffleMix = useCallback(() => {
    if (meals.length <= 1) {
      return;
    }

    const randomizedMeals = shuffleMeals(meals);
    setMeals(randomizedMeals);
    setActiveIndex(0);

    requestAnimationFrame(() => {
      flatListRef.current?.scrollToOffset({ animated: false, offset: 0 });
    });
  }, [meals]);

  const handleNext = useCallback(() => {
    if (!hasMeals || activeIndex >= meals.length - 1) {
      return;
    }

    scrollToIndex(activeIndex + 1);
  }, [activeIndex, hasMeals, meals.length, scrollToIndex]);

  const handlePrevious = useCallback(() => {
    if (!hasMeals || activeIndex === 0) {
      return;
    }

    scrollToIndex(activeIndex - 1);
  }, [activeIndex, hasMeals, scrollToIndex]);

  const handleMomentumScrollEnd = useCallback((event) => {
    const nextIndex = Math.round(event.nativeEvent.contentOffset.x / SNAP_INTERVAL);
    setActiveIndex(nextIndex);
  }, []);

  const indicatorText = useMemo(() => {
    if (!hasMeals) {
      return '0 of 0';
    }

    return `${activeIndex + 1} of ${meals.length}`;
  }, [activeIndex, hasMeals, meals.length]);

  if (isLoading) {
    return (
      <View
        style={styles.loadingContainer}
        accessibilityRole="progressbar"
        accessibilityLabel="Loading meal ideas"
      >
        <Text>Loading meal ideas...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Explore More Meals</Text>
        <Text style={styles.summaryText}>{statusMessage}</Text>
        <Text style={styles.helperText}>
          Swipe through the gallery or use the controls below to browse fresh ideas from your filtered meal pool.
        </Text>
      </View>

      {hasMeals ? (
        <>
          <FlatList
            ref={flatListRef}
            style={styles.list}
            horizontal
            data={meals}
            keyExtractor={(item) => String(item.id)}
            showsHorizontalScrollIndicator={false}
            decelerationRate="fast"
            disableIntervalMomentum
            snapToInterval={SNAP_INTERVAL}
            snapToAlignment="start"
            contentContainerStyle={styles.listContent}
            ItemSeparatorComponent={() => <View style={styles.cardGap} />}
            onMomentumScrollEnd={handleMomentumScrollEnd}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.card}
                onPress={() => navigation.navigate('RecipeDetail', { mealId: item.id })}
                accessibilityRole="button"
                accessibilityLabel={`Open recipe details for ${item.name}`}
              >
                <MealImage
                  uri={item.image}
                  label={item.name}
                  style={styles.mealImage}
                />
                <View style={styles.cardContent}>
                  <Text style={styles.mealName}>{item.name}</Text>
                  <Text style={styles.metaText}>
                    {item.prepTime} • {item.difficulty} • {item.cuisine}
                  </Text>

                  <View style={styles.nutritionRow}>
                    <View style={styles.nutritionItem}>
                      <Text style={styles.nutritionValue}>{item.calories}</Text>
                      <Text style={styles.nutritionLabel}>calories</Text>
                    </View>
                    <View style={styles.nutritionItem}>
                      <Text style={styles.nutritionValue}>{item.protein}</Text>
                      <Text style={styles.nutritionLabel}>protein</Text>
                    </View>
                    <View style={styles.nutritionItem}>
                      <Text style={styles.nutritionValue}>{item.carbs}</Text>
                      <Text style={styles.nutritionLabel}>carbs</Text>
                    </View>
                    <View style={styles.nutritionItem}>
                      <Text style={styles.nutritionValue}>{item.fats}</Text>
                      <Text style={styles.nutritionLabel}>fats</Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            )}
          />

          <View style={styles.controlsSection}>
            <Text style={styles.indicatorText}>{indicatorText}</Text>

            <View style={styles.controlsRow}>
              <TouchableOpacity
                style={[styles.controlButton, activeIndex === 0 && styles.controlButtonDisabled]}
                onPress={handlePrevious}
                disabled={activeIndex === 0}
                accessibilityRole="button"
                accessibilityLabel="Show previous meal idea"
              >
                <Text style={styles.controlButtonText}>Previous</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.controlButtonPrimary}
                onPress={handleShuffleMix}
                accessibilityRole="button"
                accessibilityLabel="Shuffle meal ideas"
              >
                <Text style={styles.controlButtonPrimaryText}>Shuffle Mix</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.controlButton,
                  activeIndex >= meals.length - 1 && styles.controlButtonDisabled,
                ]}
                onPress={handleNext}
                disabled={activeIndex >= meals.length - 1}
                accessibilityRole="button"
                accessibilityLabel="Show next meal idea"
              >
                <Text style={styles.controlButtonText}>Next</Text>
              </TouchableOpacity>
            </View>
          </View>
        </>
      ) : (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>No meal ideas right now</Text>
          <Text style={styles.emptyText}>
            Your current filters are too strict for the explore gallery. Update your preferences and try again.
          </Text>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => navigation.navigate('Preferences')}
            accessibilityRole="button"
            accessibilityLabel="Adjust dietary preferences"
          >
            <Text style={styles.primaryButtonText}>Adjust Preferences</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
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
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  summaryText: {
    marginTop: SPACING.sm,
    fontSize: 14,
    color: COLORS.textMuted,
  },
  helperText: {
    marginTop: SPACING.sm,
    fontSize: 15,
    lineHeight: 22,
    color: COLORS.textSecondary,
  },
  listContent: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.sm,
    paddingRight: SPACING.lg,
    alignItems: 'flex-start',
  },
  list: {
    flexGrow: 0,
  },
  cardGap: {
    width: CARD_GAP,
  },
  card: {
    width: CARD_WIDTH,
    alignSelf: 'flex-start',
    backgroundColor: COLORS.surface,
    borderRadius: RADII.xl,
    ...SHADOWS.prominent,
  },
  mealImage: {
    width: '100%',
    height: 220,
    borderTopLeftRadius: RADII.xl,
    borderTopRightRadius: RADII.xl,
  },
  cardContent: {
    padding: SPACING.lg,
  },
  mealName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  metaText: {
    marginTop: SPACING.sm,
    fontSize: 14,
    color: COLORS.textMuted,
  },
  nutritionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.lg,
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
    marginTop: SPACING.xs,
    fontSize: 12,
    color: COLORS.textMuted,
  },
  controlsSection: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xl,
  },
  indicatorText: {
    textAlign: 'center',
    fontSize: 14,
    color: COLORS.textMuted,
    marginBottom: SPACING.md,
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SPACING.sm,
  },
  controlButton: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: RADII.md,
    paddingVertical: 12,
    alignItems: 'center',
    ...SHADOWS.soft,
  },
  controlButtonPrimary: {
    flex: 1.2,
    backgroundColor: COLORS.primary,
    borderRadius: RADII.md,
    paddingVertical: 12,
    alignItems: 'center',
    ...SHADOWS.soft,
  },
  controlButtonDisabled: {
    opacity: 0.45,
  },
  controlButtonText: {
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  controlButtonPrimaryText: {
    color: COLORS.primaryContrast,
    fontWeight: '700',
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
