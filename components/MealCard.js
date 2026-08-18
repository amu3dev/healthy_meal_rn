import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MealImage from './MealImage';
import { COLORS, RADII, SHADOWS, SPACING } from '../lib/theme';
import { isHighProteinMeal } from '../lib/mealUtils';

export default function MealCard({
  meal,
  onPress,
  accessibilityLabel,
  cardStyle,
  imageStyle,
  contentStyle,
  titleStyle,
  metaStyle,
  nutritionRowStyle,
  metaPlacement = 'afterNutrition',
}) {
  const metaBlock = (
    <Text style={[styles.metaText, metaStyle]}>
      {meal.prepTime} • {meal.difficulty} • {meal.cuisine}
    </Text>
  );

  return (
    <TouchableOpacity
      style={[styles.card, cardStyle]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || `Open recipe details for ${meal.name}`}
    >
      <MealImage
        uri={meal.image}
        label={meal.name}
        isDecorative
        style={[styles.mealImage, imageStyle]}
      />
      <View style={[styles.content, contentStyle]}>
        <View style={styles.titleRow}>
          <Text style={[styles.mealName, titleStyle]}>{meal.name}</Text>
          {isHighProteinMeal(meal) ? (
            <Text
              style={styles.badge}
              accessibilityLabel="High Protein"
              accessibilityHint="Indicates a meal with at least 20g protein"
            >
              High Protein
            </Text>
          ) : null}
        </View>

        {metaPlacement === 'beforeNutrition' ? metaBlock : null}

        <View style={[styles.nutritionRow, nutritionRowStyle]}>
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

        {metaPlacement === 'afterNutrition' ? metaBlock : null}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADII.xl,
    ...SHADOWS.prominent,
  },
  mealImage: {
    width: '100%',
    height: 200,
    borderTopLeftRadius: RADII.xl,
    borderTopRightRadius: RADII.xl,
  },
  content: {
    padding: SPACING.lg,
  },
  mealName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  titleRow: {
    gap: SPACING.sm,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADII.sm,
    backgroundColor: COLORS.imageFallbackBackground,
    color: COLORS.imageFallbackTitle,
    fontSize: 12,
    fontWeight: 'bold',
  },
  metaText: {
    marginTop: SPACING.lg,
    fontSize: 14,
    color: COLORS.textMuted,
  },
  nutritionRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
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
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: SPACING.xs,
  },
});
