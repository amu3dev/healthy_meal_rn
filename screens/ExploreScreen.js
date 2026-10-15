import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  FlatList,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import MealCard from '../components/MealCard';
import {
  getMatchingMeals,
  getNoMatchMessage,
  getPreferenceSummary,
  HIGH_PROTEIN_THRESHOLD,
} from '../lib/mealUtils';
import {
  formatPreferenceLabel,
  getEnabledPreferences,
  mergePreferences,
} from '../lib/preferences';
import { COLORS, RADII, SHADOWS, SPACING } from '../lib/theme';
import usePreferences from '../hooks/usePreferences';

const CARD_GAP = SPACING.lg;

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
  const { width, height, fontScale } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  // Leave a glimpse of the next meal, and avoid oversized cards on tablets.
  const cardWidth = Math.min(width - insets.left - insets.right - 56, 420);
  const snapInterval = cardWidth + CARD_GAP;
  const imageHeight = Math.max(120, Math.min(180, cardWidth * 0.52, height * 0.23));
  const stackedControls = fontScale > 1.3 || width - insets.left - insets.right < 340;
  const flatListRef = useRef(null);
  const listWidthRef = useRef(null);
  const hasLoadedRef = useRef(false);
  const preferencesKeyRef = useRef('');
  const [meals, setMeals] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [statusMessage, setStatusMessage] = useState('Showing all meals');
  // Session-only override; a saved highProtein preference always wins.
  const [highProteinOverride, setHighProteinOverride] = useState(false);
  const [savedHighProtein, setSavedHighProtein] = useState(false);
  const { loadPreferences } = usePreferences({ loadOnMount: false });

  const hasMeals = meals.length > 0;

  const scrollToIndex = useCallback((nextIndex) => {
    flatListRef.current?.scrollToOffset({
      animated: true,
      offset: nextIndex * snapInterval,
    });
    setActiveIndex(nextIndex);
  }, [snapInterval]);

  const loadExploreMeals = useCallback(async () => {
    try {
      const savedPreferences = mergePreferences(await loadPreferences());
      setLoadError(false);
      setSavedHighProtein(savedPreferences.highProtein);
      const effectivePreferences = {
        ...savedPreferences,
        highProtein: savedPreferences.highProtein || highProteinOverride,
      };
      const nextPreferencesKey = JSON.stringify(effectivePreferences);
      const shouldReloadMeals =
        !hasLoadedRef.current || preferencesKeyRef.current !== nextPreferencesKey;

      preferencesKeyRef.current = nextPreferencesKey;

      if (!shouldReloadMeals) {
        return;
      }

      const matchingMeals = getMatchingMeals(effectivePreferences);
      const randomizedMeals = shuffleMeals(matchingMeals);
      const enabledPreferences = getEnabledPreferences(effectivePreferences);

      setMeals(randomizedMeals);
      setActiveIndex(0);
      setStatusMessage(
        randomizedMeals.length > 0
          ? getPreferenceSummary(effectivePreferences)
          : enabledPreferences.length > 0
            ? getNoMatchMessage(effectivePreferences)
            : 'No meals are available right now.'
      );

      requestAnimationFrame(() => {
        flatListRef.current?.scrollToOffset({ animated: false, offset: 0 });
      });
      hasLoadedRef.current = true;
    } catch (error) {
      console.error('Error loading explore meals:', error);
      setLoadError(true);
      setMeals([]);
      setActiveIndex(0);
      setStatusMessage('Unable to load meal ideas right now');
      hasLoadedRef.current = false;
    } finally {
      setIsLoading(false);
    }
  }, [highProteinOverride, loadPreferences]);

  const handleRetry = useCallback(() => {
    setIsLoading(true);
    loadExploreMeals();
  }, [loadExploreMeals]);

  useFocusEffect(
    useCallback(() => {
      if (!hasLoadedRef.current) {
        setIsLoading(true);
      }
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
    const nextIndex = Math.max(0, Math.min(
      meals.length - 1,
      Math.round(event.nativeEvent.contentOffset.x / snapInterval)
    ));
    setActiveIndex(nextIndex);
  }, [meals.length, snapInterval]);

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
    <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
      <ScrollView
        testID="explore-page"
        style={styles.page}
        contentContainerStyle={styles.pageContent}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Explore More Meals</Text>
          <Text style={styles.summaryText}>{statusMessage}</Text>
          <View style={styles.filterRow}>
            <Text style={styles.filterLabel}>{formatPreferenceLabel('highProtein')}</Text>
            <Switch
              value={savedHighProtein || highProteinOverride}
              onValueChange={setHighProteinOverride}
              disabled={savedHighProtein}
              accessibilityRole="switch"
              accessibilityState={{
                checked: savedHighProtein || highProteinOverride,
                disabled: savedHighProtein,
              }}
              accessibilityLabel="High protein filter"
              accessibilityHint={
                savedHighProtein
                  ? 'On because High Protein is saved in your preferences'
                  : `Shows meals with at least ${HIGH_PROTEIN_THRESHOLD}g of protein when enabled`
              }
            />
          </View>
          {savedHighProtein ? (
            <Text style={styles.filterNote}>Saved in your preferences.</Text>
          ) : null}
          <Text style={styles.helperText}>
            Swipe to browse. Tap to open a recipe.
          </Text>
        </View>

        {hasMeals ? (
          <>
            <FlatList
              testID="explore-meal-list"
              ref={flatListRef}
              style={styles.list}
              horizontal
              data={meals}
              keyExtractor={(item) => String(item.id)}
              showsHorizontalScrollIndicator={false}
              decelerationRate="fast"
              disableIntervalMomentum
              snapToInterval={snapInterval}
              snapToAlignment="start"
              onLayout={({ nativeEvent: { layout } }) => {
                // A taller meal can change the list height while swiping. Only
                // realign for width changes, so a swipe is never pulled back.
                if (listWidthRef.current !== layout.width) {
                  listWidthRef.current = layout.width;
                  flatListRef.current?.scrollToOffset({
                    animated: false,
                    offset: activeIndex * snapInterval,
                  });
                }
              }}
              contentContainerStyle={styles.listContent}
              ItemSeparatorComponent={() => <View style={styles.cardGap} />}
              onMomentumScrollEnd={handleMomentumScrollEnd}
              renderItem={({ item }) => (
                <MealCard
                  meal={item}
                  cardStyle={[styles.card, { width: cardWidth }]}
                  imageStyle={{ height: imageHeight }}
                  contentStyle={styles.cardContent}
                  titleStyle={styles.mealTitle}
                  metaStyle={styles.metaText}
                  nutritionRowStyle={styles.nutritionRow}
                  metaPlacement="beforeNutrition"
                  onPress={() => navigation.navigate('RecipeDetail', { mealId: item.id })}
                  accessibilityLabel={`Open recipe details for ${item.name}`}
                />
              )}
            />

            <View style={styles.controlsSection}>
              <Text style={styles.indicatorText}>{indicatorText}</Text>

              <View style={[styles.controlsRow, stackedControls && styles.controlsColumn]}>
                <TouchableOpacity
                  style={[
                    styles.controlButton,
                    stackedControls && styles.stackedControlButton,
                    activeIndex === 0 && styles.controlButtonDisabled,
                  ]}
                  onPress={handlePrevious}
                  disabled={activeIndex === 0}
                  accessibilityRole="button"
                  accessibilityLabel="Show previous meal idea"
                >
                  <Text style={styles.controlButtonText}>Previous</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.controlButtonPrimary, stackedControls && styles.stackedControlButton]}
                  onPress={handleShuffleMix}
                  accessibilityRole="button"
                  accessibilityLabel="Shuffle meal ideas"
                >
                  <Text style={styles.controlButtonPrimaryText}>Shuffle Mix</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.controlButton,
                    stackedControls && styles.stackedControlButton,
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
        ) : loadError ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>Unable to load meal ideas</Text>
            <Text style={styles.emptyText}>
              We could not load your saved preferences. Try again without changing them.
            </Text>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleRetry}
              accessibilityRole="button"
              accessibilityLabel="Retry loading meal ideas"
            >
              <Text style={styles.primaryButtonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>No meal ideas match these filters</Text>
            <Text style={styles.emptyText}>
              {highProteinOverride && !savedHighProtein
                ? 'Turn off High Protein above, or revise a saved preference, then try again. Nothing is changed automatically.'
                : 'Revise one saved preference, save your changes, and try again. Nothing is changed automatically.'}
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
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  page: {
    flex: 1,
  },
  pageContent: {
    paddingBottom: SPACING.lg,
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
    fontSize: 24,
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
  filterRow: {
    marginTop: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  filterLabel: {
    flex: 1,
    marginRight: SPACING.sm,
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  filterNote: {
    marginTop: SPACING.xs,
    fontSize: 13,
    color: COLORS.textMuted,
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
    flexShrink: 0,
  },
  cardGap: {
    width: CARD_GAP,
  },
  card: {
    alignSelf: 'flex-start',
  },
  mealTitle: {
    fontSize: 22,
  },
  cardContent: {
    padding: SPACING.lg,
  },
  metaText: {
    marginTop: SPACING.sm,
  },
  nutritionRow: {
    marginTop: SPACING.md,
  },
  controlsSection: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.xs,
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
  controlsColumn: {
    flexDirection: 'column',
  },
  stackedControlButton: {
    flex: 0,
  },
  controlButton: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: RADII.md,
    paddingVertical: 12,
    paddingHorizontal: SPACING.xs,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.soft,
  },
  controlButtonPrimary: {
    flex: 1.2,
    backgroundColor: COLORS.primary,
    borderRadius: RADII.md,
    paddingVertical: 12,
    paddingHorizontal: SPACING.xs,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.soft,
  },
  controlButtonDisabled: {
    opacity: 0.45,
  },
  controlButtonText: {
    textAlign: 'center',
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  controlButtonPrimaryText: {
    textAlign: 'center',
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
