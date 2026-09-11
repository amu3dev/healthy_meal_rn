import MEALS from '../data/meals';
import {
  getDailyMeal,
  getMealById,
  getMatchingMeals,
  getNoMatchMessage,
  getPreferenceSummary,
  isHighProteinMeal,
} from '../lib/mealUtils';

describe('meal utilities', () => {
  it('returns the full catalog when no preferences are enabled', () => {
    expect(getMatchingMeals()).toHaveLength(MEALS.length);
  });

  it('resolves meals from the canonical source by id', () => {
    expect(getMealById(2)?.name).toBe('Grilled Salmon with Roasted Vegetables');
    expect(getMealById('999')).toBeNull();
  });

  it('filters meals using the canonical high-protein rule for saved preferences', () => {
    const meals = getMatchingMeals({ highProtein: true });

    expect(meals.length).toBeGreaterThan(0);
    expect(meals.every(isHighProteinMeal)).toBe(true);
    expect(meals.map((meal) => meal.name)).toEqual(
      expect.arrayContaining([
        'Grilled Salmon with Roasted Vegetables',
        'Tempeh Lettuce Cups',
        'Baked Cod with Green Beans',
        'Quinoa Buddha Bowl',
      ])
    );
  });

  it('uses the same high-protein meal pool for saved preferences and Explore', () => {
    const savedPreferenceMeals = getMatchingMeals({ highProtein: true });
    const exploreMeals = getMatchingMeals({ highProteinOnly: true });

    expect(savedPreferenceMeals.map((meal) => meal.id)).toEqual(
      expect.arrayContaining(exploreMeals.map((meal) => meal.id))
    );
    expect(exploreMeals.map((meal) => meal.id)).toEqual(
      expect.arrayContaining(savedPreferenceMeals.map((meal) => meal.id))
    );
  });

  it('composes the Explore high-protein filter with existing preferences', () => {
    const meals = getMatchingMeals({ highProteinOnly: true, vegan: true });

    expect(meals.length).toBeGreaterThan(0);
    expect(meals.every((meal) => meal.tags.vegan)).toBe(true);
    expect(meals.every((meal) => Number.parseInt(meal.protein, 10) >= 20)).toBe(true);
  });

  it.each([
    ['19g', false],
    ['20g', true],
    ['21g', true],
  ])('classifies %s against the high-protein threshold', (protein, expected) => {
    expect(isHighProteinMeal({ protein })).toBe(expected);
  });

  it.each(['20 grams', 'unknown', undefined, null])(
    'fails closed for invalid protein value %s',
    (protein) => {
      expect(isHighProteinMeal({ protein })).toBe(false);
    },
  );

  it('excludes invalid protein values only when the Explore filter is enabled', () => {
    const originalProtein = MEALS[0].protein;

    try {
      MEALS[0].protein = '20 grams';
      expect(getMatchingMeals({ highProteinOnly: true })).not.toContain(MEALS[0]);

      MEALS[0].protein = undefined;
      expect(getMatchingMeals({ highProteinOnly: true })).not.toContain(MEALS[0]);
      expect(getMatchingMeals()).toContain(MEALS[0]);
    } finally {
      MEALS[0].protein = originalProtein;
    }
  });

  it('keeps the high-protein tag aligned with the canonical protein rule', () => {
    MEALS.forEach((meal) => {
      expect(meal.tags.highProtein).toBe(isHighProteinMeal(meal));
    });
  });

  it('returns no matches for impossible combinations', () => {
    expect(
      getMatchingMeals({ vegan: true, highProtein: true, lowCarb: true, glutenFree: true })
    ).toEqual([]);
  });

  it('returns no matches for the smallest catalog conflict', () => {
    expect(getMatchingMeals({ vegan: true, glutenFree: true, lowCarb: true })).toEqual([]);
  });

  it('returns a recommendation after the user removes one conflicting filter', () => {
    const date = new Date('2026-05-31T10:00:00Z');

    expect(getDailyMeal({ vegan: true, glutenFree: true, lowCarb: true }, date)).toBeNull();
    expect(getDailyMeal({ vegan: true, glutenFree: true }, date)).not.toBeNull();
  });

  it('returns a deterministic daily meal for the same day and preference set', () => {
    const date = new Date('2026-05-31T10:00:00Z');
    const firstMeal = getDailyMeal({ vegetarian: true }, date);
    const secondMeal = getDailyMeal({ vegetarian: true }, date);

    expect(firstMeal).toEqual(secondMeal);
  });

  it('returns null when no meals match the selected filters', () => {
    expect(
      getDailyMeal(
        { vegan: true, highProtein: true, lowCarb: true, glutenFree: true },
        new Date('2026-05-31')
      )
    ).toBeNull();
  });

  it('describes the active preference summary', () => {
    expect(getPreferenceSummary({ dairyFree: true, highProteinOnly: true })).toBe(
      'Filtered by Dairy Free, High Protein Only (20g+)'
    );
  });

  it('describes why selected filters have no match', () => {
    expect(getNoMatchMessage({ vegan: true, glutenFree: true, lowCarb: true })).toBe(
      'No meals match these selections: Vegan, Gluten Free, Low Carb.'
    );
  });

  it('uses the Explore filter label in no-match messaging', () => {
    expect(getNoMatchMessage({ highProteinOnly: true })).toBe(
      'No meals match these selections: High Protein Only (20g+).'
    );
  });
});
