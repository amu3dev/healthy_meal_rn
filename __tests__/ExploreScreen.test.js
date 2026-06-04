import React from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
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

let focusCallback;

function runFocusEffect() {
  useFocusEffect.mockImplementation((callback) => {
    focusCallback = callback;

    React.useEffect(() => {
      return callback();
    }, [callback]);
  });
}

describe('ExploreScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    focusCallback = undefined;
    runFocusEffect();
    getPreferenceSummary.mockReturnValue('Filtered by High Protein');
  });

  afterEach(async () => {
    await act(async () => {
      jest.runOnlyPendingTimers();
    });
    jest.useRealTimers();
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

    await act(async () => {
      fireEvent.press(screen.getByLabelText('Adjust dietary preferences'));
      jest.runOnlyPendingTimers();
    });
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

    await act(async () => {
      fireEvent.press(screen.getByLabelText('Open recipe details for Grilled Salmon with Roasted Vegetables'));
      jest.runOnlyPendingTimers();
    });
    expect(mockNavigation.navigate).toHaveBeenCalledWith('RecipeDetail', { mealId: 2 });
  });

  it('keeps the current position and meal order when refocused with unchanged preferences', async () => {
    const savedPreferences = {
      highProtein: true,
    };
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
      loadPreferences: jest.fn()
        .mockResolvedValueOnce(savedPreferences)
        .mockResolvedValueOnce(savedPreferences),
    });
    getMatchingMeals.mockReturnValue(meals);

    render(<ExploreScreen navigation={mockNavigation} />);

    await waitFor(() => {
      expect(screen.getByText('1 of 2')).toBeTruthy();
    });

    await act(async () => {
      fireEvent.press(screen.getByLabelText('Show next meal idea'));
      jest.runOnlyPendingTimers();
    });
    expect(screen.getByText('2 of 2')).toBeTruthy();

    await act(async () => {
      focusCallback();
    });

    expect(screen.getByText('2 of 2')).toBeTruthy();
    expect(getMatchingMeals).toHaveBeenCalledTimes(1);
  });

  it('reloads and resets the gallery when preferences change on refocus', async () => {
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
    const changedPreferences = {
      lowCarb: true,
    };

    usePreferences.mockReturnValue({
      loadPreferences: jest.fn()
        .mockResolvedValueOnce({})
        .mockResolvedValueOnce(changedPreferences),
    });
    getMatchingMeals.mockReturnValue(meals);
    getPreferenceSummary
      .mockReturnValueOnce('Showing all meals')
      .mockReturnValueOnce('Filtered by Low Carb');

    render(<ExploreScreen navigation={mockNavigation} />);

    await waitFor(() => {
      expect(screen.getByText('1 of 2')).toBeTruthy();
    });

    await act(async () => {
      fireEvent.press(screen.getByLabelText('Show next meal idea'));
      jest.runOnlyPendingTimers();
    });
    expect(screen.getByText('2 of 2')).toBeTruthy();

    await act(async () => {
      focusCallback();
    });

    await waitFor(() => {
      expect(screen.getByText('Filtered by Low Carb')).toBeTruthy();
    });

    expect(screen.getByText('1 of 2')).toBeTruthy();
    expect(getMatchingMeals).toHaveBeenCalledTimes(2);
  });
});
