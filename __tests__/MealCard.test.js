import React from 'react';
import { render, screen } from '@testing-library/react-native';
import MealCard from '../components/MealCard';
import { HIGH_PROTEIN_THRESHOLD } from '../lib/mealUtils';

function createMeal(protein) {
  return {
    name: 'Test Meal',
    protein,
    calories: '400 kcal',
    carbs: '30g',
    fats: '12g',
    prepTime: '20 min',
    difficulty: 'Easy',
    cuisine: 'Mediterranean',
  };
}

describe('MealCard', () => {
  it('shows the High Protein badge at the inclusive threshold', () => {
    render(<MealCard meal={createMeal('20g')} />);

    const badge = screen.getByLabelText('High Protein');

    expect(badge).toBeTruthy();
    expect(badge.props.accessibilityHint).toBe(
      `Indicates a meal with at least ${HIGH_PROTEIN_THRESHOLD}g protein`,
    );
  });

  it('does not show the High Protein badge below the threshold or for invalid amounts', () => {
    const { rerender, queryByText } = render(<MealCard meal={createMeal('19g')} />);

    expect(queryByText('High Protein')).toBeNull();

    rerender(<MealCard meal={createMeal('20 grams')} />);

    expect(queryByText('High Protein')).toBeNull();
  });
});
