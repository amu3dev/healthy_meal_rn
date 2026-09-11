import MEALS from '../data/meals';
import { isHighProteinMeal } from '../lib/mealUtils';

function parseMacro(value) {
  return Number.parseInt(value, 10);
}

describe('meal catalog data', () => {
  it('keeps meal ids unique', () => {
    const ids = MEALS.map((meal) => meal.id);
    expect(new Set(ids).size).toBe(MEALS.length);
  });

  it('keeps meal image urls unique', () => {
    const images = MEALS.map((meal) => meal.image);
    expect(new Set(images).size).toBe(MEALS.length);
  });

  it('includes the required core fields for every meal', () => {
    MEALS.forEach((meal) => {
      expect(meal).toEqual(expect.objectContaining({
        id: expect.any(Number),
        name: expect.any(String),
        calories: expect.any(Number),
        protein: expect.stringMatching(/^\d+g$/),
        carbs: expect.stringMatching(/^\d+g$/),
        fats: expect.stringMatching(/^\d+g$/),
        fiber: expect.stringMatching(/^\d+g$/),
        prepTime: expect.any(String),
        difficulty: expect.any(String),
        cuisine: expect.any(String),
        servings: expect.any(Number),
        image: expect.stringMatching(/^https?:\/\//),
        ingredients: expect.any(Array),
        instructions: expect.any(Array),
        tags: expect.any(Object),
      }));
      expect(meal.ingredients.length).toBeGreaterThan(0);
      expect(meal.instructions.length).toBeGreaterThan(0);
    });
  });

  it('keeps low-carb tagged meals in a believable carb range without starchy sides', () => {
    MEALS.filter((meal) => meal.tags.lowCarb).forEach((meal) => {
      const ingredientText = meal.ingredients.join(' ').toLowerCase();

      expect(parseMacro(meal.carbs)).toBeLessThanOrEqual(20);
      expect(ingredientText).not.toMatch(/potato|sweet potato|brown rice|quinoa/);
    });
  });

  it('keeps the high-protein tag aligned with the canonical protein rule', () => {
    MEALS.forEach((meal) => {
      expect(meal.tags.highProtein).toBe(isHighProteinMeal(meal));
    });
  });

  it('keeps high-protein tagged meals at 20g protein or above', () => {
    MEALS.filter((meal) => meal.tags.highProtein).forEach((meal) => {
      expect(parseMacro(meal.protein)).toBeGreaterThanOrEqual(20);
    });
  });
});
