import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { useFocusEffect } from '@react-navigation/native';
import HomeScreen from '../screens/HomeScreen';
import usePreferences from '../hooks/usePreferences';
import { getDailyMeal, getPreferenceSummary } from '../lib/mealUtils';

jest.mock('@expo/vector-icons', () => ({
  MaterialIcons: () => null,
}));

jest.mock('@react-navigation/native', () => ({
  useFocusEffect: jest.fn(),
}));

jest.mock('../hooks/usePreferences');
jest.mock('../lib/mealUtils', () => ({
  getDailyMeal: jest.fn(),
  getPreferenceSummary: jest.fn(),
}));

const mockNavigation = {
  navigate: jest.fn(),
};

function runFocusEffect() {
  useFocusEffect.mockImplementation((callback) => {
    React.useEffect(() => {
      return callback();
    }, [callback]);
  });
}

describe('HomeScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getPreferenceSummary.mockReturnValue('Showing all meals');
  });

  it('renders a loading state before the focus effect runs', () => {
    useFocusEffect.mockImplementation(() => {});
    usePreferences.mockReturnValue({
      loadPreferences: jest.fn(),
    });

    render(<HomeScreen navigation={mockNavigation} />);

    expect(screen.getByText('Loading...')).toBeTruthy();
    expect(screen.getByLabelText("Loading today's healthy meal")).toBeTruthy();
  });

  it('renders the no-match empty state when filters produce no meal', async () => {
    runFocusEffect();
    usePreferences.mockReturnValue({
      loadPreferences: jest.fn().mockResolvedValue({
        vegan: true,
        highProtein: true,
        lowCarb: true,
      }),
    });
    getDailyMeal.mockReturnValue(null);

    render(<HomeScreen navigation={mockNavigation} />);

    await waitFor(() => {
      expect(screen.getByText('No matching meal for today')).toBeTruthy();
    });

    expect(screen.getByText('No meals match your current filters yet')).toBeTruthy();
    fireEvent.press(screen.getByLabelText('Review dietary preferences'));
    expect(mockNavigation.navigate).toHaveBeenCalledWith('Preferences');
  });

  it('navigates to recipe detail using mealId instead of a full meal object', async () => {
    const meal = {
      id: 4,
      name: 'Turkey Lettuce Wraps',
      calories: 340,
      protein: '33g',
      carbs: '14g',
      fats: '16g',
      prepTime: '20 min',
      difficulty: 'Easy',
      cuisine: 'Asian-Inspired',
      image: 'https://example.com/turkey-wraps.jpg',
    };

    runFocusEffect();
    usePreferences.mockReturnValue({
      loadPreferences: jest.fn().mockResolvedValue({}),
    });
    getDailyMeal.mockReturnValue(meal);

    render(<HomeScreen navigation={mockNavigation} />);

    await waitFor(() => {
      expect(screen.getByText('Turkey Lettuce Wraps')).toBeTruthy();
    });

    expect(screen.getByLabelText('Open dietary preferences')).toBeTruthy();
    fireEvent.press(screen.getByLabelText('Open recipe details for Turkey Lettuce Wraps'));
    expect(mockNavigation.navigate).toHaveBeenCalledWith('RecipeDetail', { mealId: 4 });
  });
});
