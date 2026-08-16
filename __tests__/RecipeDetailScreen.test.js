import React from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import RecipeDetailScreen from '../screens/RecipeDetailScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../lib/preferences';

const mockNavigation = {
  goBack: jest.fn(),
};

describe('RecipeDetailScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    AsyncStorage.getItem.mockResolvedValue(JSON.stringify([]));
  });

  it('renders recipe details from the canonical meal source', async () => {
    render(
      <RecipeDetailScreen
        navigation={mockNavigation}
        route={{ params: { mealId: 2 } }}
      />
    );

    expect(screen.getByText('Grilled Salmon with Roasted Vegetables')).toBeTruthy();
    expect(screen.getByText('Ingredients')).toBeTruthy();
    expect(screen.getByText('Instructions')).toBeTruthy();
    await waitFor(() => expect(AsyncStorage.getItem).toHaveBeenCalled());
  });

  it('toggles and restores the favorite state for a valid meal', async () => {
    render(
      <RecipeDetailScreen
        navigation={mockNavigation}
        route={{ params: { mealId: 2 } }}
      />
    );

    const favoriteButton = await screen.findByLabelText(
      'Add Grilled Salmon with Roasted Vegetables to favorites'
    );
    await act(async () => {
      fireEvent.press(favoriteButton);
    });
    await waitFor(() => {
      expect(screen.getByLabelText(
        'Remove Grilled Salmon with Roasted Vegetables from favorites'
      )).toBeTruthy();
    });
    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      STORAGE_KEYS.favoriteMeals,
      JSON.stringify([2])
    );
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
    expect(screen.queryByLabelText(/favorites/)).toBeNull();

    fireEvent.press(screen.getByLabelText('Go back to the previous screen'));
    expect(mockNavigation.goBack).toHaveBeenCalled();
  });
});
