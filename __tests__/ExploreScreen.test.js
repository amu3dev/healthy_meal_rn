import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { useFocusEffect } from '@react-navigation/native';
import ExploreScreen from '../screens/ExploreScreen';
import usePreferences from '../hooks/usePreferences';
import { getMatchingMeals, getPreferenceSummary } from '../lib/mealUtils';

jest.mock('@react-navigation/native', () => ({
  useFocusEffect: jest.fn(),
}));

jest.mock('../hooks/usePreferences');
jest.mock('../lib/mealUtils', () => ({
  getMatchingMeals: jest.fn(),
  getPreferenceSummary: jest.fn(),
}));

const mockNavigation = {
  navigate: jest.fn(),
};

function runFocusEffect() {
  useFocusEffect.mockImplementation((callback) => {
    React.useEffect(() => callback(), [callback]);
  });
}

describe('ExploreScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    runFocusEffect();
    getPreferenceSummary.mockReturnValue('Filtered by High Protein');
  });

  it('renders a no-match state when the filtered meal pool is empty', async () => {
    usePreferences.mockReturnValue({
      loadPreferences: jest.fn().mockResolvedValue({
        highProtein: true,
      }),
    });
    getMatchingMeals.mockReturnValue([]);

    render(<ExploreScreen navigation={mockNavigation} />);

    await waitFor(() => {
      expect(screen.getByText('No meal ideas right now')).toBeTruthy();
    });

    fireEvent.press(screen.getByLabelText('Adjust dietary preferences'));
    expect(mockNavigation.navigate).toHaveBeenCalledWith('Preferences');
  });

  it('opens recipe details from the explore gallery and exposes shuffle controls', async () => {
    const meals = [
      {
        id: 2,
        name: 'Grilled Salmon with Roasted Vegetables',
        calories: 520,
        protein: '42g',
        carbs: '18g',
        fats: '28g',
        prepTime: '30 min',
        difficulty: 'Medium',
        cuisine: 'American',
        image: 'https://example.com/salmon.jpg',
      },
      {
        id: 4,
        name: 'Turkey Lettuce Wraps',
        calories: 340,
        protein: '33g',
        carbs: '14g',
        fats: '16g',
        prepTime: '20 min',
        difficulty: 'Easy',
        cuisine: 'Asian-Inspired',
        image: 'https://example.com/turkey.jpg',
      },
    ];

    usePreferences.mockReturnValue({
      loadPreferences: jest.fn().mockResolvedValue({
        highProtein: true,
      }),
    });
    getMatchingMeals.mockReturnValue(meals);

    render(<ExploreScreen navigation={mockNavigation} />);

    await waitFor(() => {
      expect(screen.getByText('Explore More Meals')).toBeTruthy();
    });

    expect(screen.getByText('Filtered by High Protein')).toBeTruthy();
    expect(screen.getByLabelText('Shuffle meal ideas')).toBeTruthy();
    expect(screen.getByLabelText('Show next meal idea')).toBeTruthy();

    fireEvent.press(screen.getByLabelText('Open recipe details for Grilled Salmon with Roasted Vegetables'));
    expect(mockNavigation.navigate).toHaveBeenCalledWith('RecipeDetail', { mealId: 2 });
  });
});
