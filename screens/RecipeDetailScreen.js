import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import MealImage from '../components/MealImage';
import { getMealById } from '../lib/mealUtils';
import { COLORS, RADII, SHADOWS, SPACING } from '../lib/theme';

export default function RecipeDetailScreen({ navigation, route }) {
  const mealId = route && route.params ? route.params.mealId : null;
  const meal = getMealById(mealId);

  if (!meal) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>Recipe unavailable</Text>
        <Text style={styles.emptyText}>
          We could not find the meal details for this screen. Head back home and choose a meal again.
        </Text>
        <TouchableOpacity
          style={styles.emptyButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.emptyButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <MealImage
        uri={meal.image}
        label={meal.name}
        style={styles.image}
      />

      <View style={styles.content}>
        <Text style={styles.title}>{meal.name}</Text>

        <View style={styles.nutritionCard}>
          <View style={styles.nutritionRow}>
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
            <View style={styles.nutritionItem}>
              <Text style={styles.nutritionValue}>{meal.fiber}</Text>
              <Text style={styles.nutritionLabel}>fiber</Text>
            </View>
          </View>
        </View>

        <View style={styles.metaCard}>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Prep Time</Text>
            <Text style={styles.metaValue}>{meal.prepTime}</Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Difficulty</Text>
            <Text style={styles.metaValue}>{meal.difficulty}</Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Cuisine</Text>
            <Text style={styles.metaValue}>{meal.cuisine}</Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Servings</Text>
            <Text style={styles.metaValue}>{meal.servings}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ingredients</Text>
          {(meal.ingredients || []).map((ingredient, index) => (
            <View key={index} style={styles.listItem}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.listText}>{ingredient}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Instructions</Text>
          {(meal.instructions || []).map((instruction, index) => (
            <View key={index} style={styles.listItem}>
              <Text style={styles.stepNumber}>{index + 1}.</Text>
              <Text style={styles.listText}>{instruction}</Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  emptyContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: SPACING.xxl,
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.textSoft,
    lineHeight: 24,
  },
  emptyButton: {
    marginTop: 20,
    backgroundColor: COLORS.primary,
    borderRadius: RADII.md,
    paddingVertical: 12,
    alignItems: 'center',
  },
  emptyButtonText: {
    color: COLORS.primaryContrast,
    fontSize: 16,
    fontWeight: 'bold',
  },
  image: {
    width: '100%',
    height: 250,
  },
  content: {
    padding: SPACING.lg,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: SPACING.lg,
  },
  nutritionCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADII.lg,
    padding: SPACING.lg,
    marginBottom: 24,
    ...SHADOWS.soft,
  },
  nutritionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
  metaCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADII.lg,
    padding: SPACING.lg,
    marginBottom: 24,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    ...SHADOWS.soft,
  },
  metaItem: {
    width: '48%',
    marginBottom: 12,
  },
  metaLabel: {
    color: COLORS.textMuted,
    fontSize: 12,
    textTransform: 'uppercase',
    marginBottom: SPACING.xs,
  },
  metaValue: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
  section: {
    backgroundColor: COLORS.surface,
    borderRadius: RADII.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    ...SHADOWS.soft,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  listItem: {
    flexDirection: 'row',
    paddingVertical: 8,
    alignItems: 'flex-start',
  },
  bullet: {
    fontSize: 16,
    color: COLORS.primary,
    marginRight: SPACING.sm,
    width: 16,
  },
  stepNumber: {
    fontSize: 16,
    color: COLORS.primary,
    marginRight: SPACING.sm,
    width: 24,
  },
  listText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    flex: 1,
    lineHeight: 24,
  },
});
