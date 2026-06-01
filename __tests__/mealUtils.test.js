import MEALS from '../data/meals';
import {
  getDailyMeal,
  getMealById,
  getMatchingMeals,
  getPreferenceSummary,
} from '../lib/mealUtils';

describe('meal utilities', () => {
  it('returns the full catalog when no preferences are enabled', () => {
    expect(getMatchingMeals()).toHaveLength(MEALS.length);
  });

  it('resolves meals from the canonical source by id', () => {
    expect(getMealById(2)?.name).toBe('Grilled Salmon with Roasted Vegetables');
    expect(getMealById('999')).toBeNull();
  });

  it('filters meals based on enabled preferences', () => {
    const meals = getMatchingMeals({ highProtein: true });

    expect(meals.map((meal) => meal.name)).toEqual([
      'Grilled Salmon with Roasted Vegetables',
      'Turkey Lettuce Wraps',
      'Tofu Stir-Fry with Brown Rice',
      'Greek Yogurt Berry Parfait',
      'Zucchini Noodles with Pesto Chicken',
    ]);
  });

  it('returns no matches for impossible combinations', () => {
    expect(getMatchingMeals({ vegan: true, highProtein: true, lowCarb: true })).toEqual([]);
  });

  it('returns a deterministic daily meal for the same day and preference set', () => {
    const date = new Date('2026-05-31T10:00:00Z');
    const firstMeal = getDailyMeal({ vegetarian: true }, date);
    const secondMeal = getDailyMeal({ vegetarian: true }, date);

    expect(firstMeal).toEqual(secondMeal);
  });

  it('returns null when no meals match the selected filters', () => {
    expect(
      getDailyMeal({ vegan: true, highProtein: true, lowCarb: true }, new Date('2026-05-31'))
    ).toBeNull();
  });

  it('describes the active preference summary', () => {
    expect(getPreferenceSummary({ dairyFree: true, highProtein: true })).toBe(
      'Filtered by Dairy Free, High Protein'
    );
  });
});
