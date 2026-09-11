import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { useFocusEffect } from '@react-navigation/native';
import HomeScreen from '../screens/HomeScreen';
import usePreferences from '../hooks/usePreferences';
import { getDailyMeal, getNoMatchMessage, getPreferenceSummary } from '../lib/mealUtils';

jest.mock('@expo/vector-icons', () => ({
  MaterialIcons: () => null,
}));

jest.mock('@react-navigation/native', () => ({
  useFocusEffect: jest.fn(),
}));

jest.mock('../hooks/usePreferences');
jest.mock('../lib/mealUtils', () => ({
  getDailyMeal: jest.fn(),
  getNoMatchMessage: jest.fn(),
  getPreferenceSummary: jest.fn(),
  isHighProteinMeal: jest.requireActual('../lib/mealUtils').isHighProteinMeal,
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
    getNoMatchMessage.mockReturnValue(
      'No meals match these selections: Vegan, High Protein (20g+), Low Carb.'
    );
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
    getNoMatchMessage.mockReturnValue(
      'No meals match these selections: Vegan, High Protein (20g+), Low Carb.'
    );

    render(<HomeScreen navigation={mockNavigation} />);

    await waitFor(() => {
      expect(screen.getByText('No meal matches all selections')).toBeTruthy();
    });

    expect(screen.getByText('No meals match these selections: Vegan, High Protein (20g+), Low Carb.')).toBeTruthy();
    expect(screen.getByText('Turn off one selected filter or goal, save your changes, and return here to try again. Nothing is changed automatically.')).toBeTruthy();
    fireEvent.press(screen.getByLabelText('Review dietary preferences'));
    expect(mockNavigation.navigate).toHaveBeenCalledWith('Preferences');
  });

  it('renders a load error instead of no-match guidance when preferences fail', async () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    runFocusEffect();
    usePreferences.mockReturnValue({
      loadPreferences: jest.fn().mockRejectedValue(new Error('storage unavailable')),
    });

    render(<HomeScreen navigation={mockNavigation} />);

    await waitFor(() => {
      expect(screen.getByText("Unable to load today's meal")).toBeTruthy();
    });

    expect(screen.queryByText('No meal matches all selections')).toBeNull();
    expect(screen.queryByText(/Nothing is changed automatically/)).toBeNull();
    expect(screen.getByLabelText("Retry loading today's meal")).toBeTruthy();
    expect(consoleError).toHaveBeenCalledWith('Error loading meal:', expect.any(Error));
    consoleError.mockRestore();
  });

  it('helps an unfiltered user discover preferences', async () => {
    runFocusEffect();
    usePreferences.mockReturnValue({
      loadPreferences: jest.fn().mockResolvedValue({}),
    });
    getDailyMeal.mockReturnValue({
      id: 1,
      name: 'Quinoa Buddha Bowl',
      calories: 420,
      protein: '20g',
      carbs: '45g',
      fats: '14g',
      prepTime: '25 min',
      difficulty: 'Easy',
      cuisine: 'Mediterranean',
      image: 'https://example.com/quinoa.jpg',
    });

    render(<HomeScreen navigation={mockNavigation} />);

    await waitFor(() => {
      expect(screen.getByText("Make today's pick fit you")).toBeTruthy();
    });

    expect(screen.getByText('Set dietary filters or optional meal goals to narrow your recommendation.')).toBeTruthy();
    fireEvent.press(screen.getByLabelText('Set dietary preferences'));
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

  it('navigates to the explore gallery from the daily meal screen', async () => {
    const meal = {
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
    };

    runFocusEffect();
    usePreferences.mockReturnValue({
      loadPreferences: jest.fn().mockResolvedValue({}),
    });
    getDailyMeal.mockReturnValue(meal);

    render(<HomeScreen navigation={mockNavigation} />);

    await waitFor(() => {
      expect(screen.getByText('Want more ideas?')).toBeTruthy();
    });

    fireEvent.press(screen.getByLabelText('Explore more meal ideas'));
    expect(mockNavigation.navigate).toHaveBeenCalledWith('Explore');
  });
});
