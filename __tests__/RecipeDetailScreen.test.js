import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import RecipeDetailScreen from '../screens/RecipeDetailScreen';

const mockNavigation = {
  goBack: jest.fn(),
};

describe('RecipeDetailScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders recipe details from the canonical meal source', () => {
    render(
      <RecipeDetailScreen
        navigation={mockNavigation}
        route={{ params: { mealId: 2 } }}
      />
    );

    expect(screen.getByText('Grilled Salmon with Roasted Vegetables')).toBeTruthy();
    expect(screen.getByText('Ingredients')).toBeTruthy();
    expect(screen.getByText('Instructions')).toBeTruthy();
  });

  it('renders a fallback state when the meal id is invalid', () => {
    render(
      <RecipeDetailScreen
        navigation={mockNavigation}
        route={{ params: { mealId: 999 } }}
      />
    );

    expect(screen.getByText('Recipe unavailable')).toBeTruthy();
    expect(screen.getByLabelText('Go back to the previous screen')).toBeTruthy();

    fireEvent.press(screen.getByLabelText('Go back to the previous screen'));
    expect(mockNavigation.goBack).toHaveBeenCalled();
  });
});
