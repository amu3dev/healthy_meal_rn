import React from 'react';
import { Dimensions, FlatList } from 'react-native';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { useFocusEffect } from '@react-navigation/native';
import ExploreScreen from '../screens/ExploreScreen';
import usePreferences from '../hooks/usePreferences';
import {
  getMatchingMeals,
  getPreferenceSummary,
  HIGH_PROTEIN_THRESHOLD,
} from '../lib/mealUtils';
import { SPACING } from '../lib/theme';

jest.mock('@react-navigation/native', () => ({
  useFocusEffect: jest.fn(),
}));

jest.mock('../hooks/usePreferences');
jest.mock('../lib/mealUtils', () => ({
  getMatchingMeals: jest.fn(),
  getPreferenceSummary: jest.fn(),
  HIGH_PROTEIN_THRESHOLD: jest.requireActual('../lib/mealUtils').HIGH_PROTEIN_THRESHOLD,
  isHighProteinMeal: jest.requireActual('../lib/mealUtils').isHighProteinMeal,
}));

const mockNavigation = {
  navigate: jest.fn(),
};

let focusCallback;
const SNAP_INTERVAL = (Dimensions.get('window').width - 56) + SPACING.lg;

function createMeal(id, name, overrides = {}) {
  return {
    id,
    name,
    calories: 400 + id,
    protein: `${20 + id}g`,
    carbs: `${10 + id}g`,
    fats: `${8 + id}g`,
    prepTime: '20 min',
    difficulty: 'Easy',
    cuisine: 'Mediterranean',
    image: `https://example.com/${id}.jpg`,
    ...overrides,
  };
}

function createDeferred() {
  let resolve;
  let reject;

  const promise = new Promise((nextResolve, nextReject) => {
    resolve = nextResolve;
    reject = nextReject;
  });

  return { promise, resolve, reject };
}

function getPressableAncestor(node) {
  let currentNode = node;

  while (currentNode && typeof currentNode.props?.onPress !== 'function') {
    currentNode = currentNode.parent;
  }

  return currentNode;
}

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
    getPreferenceSummary.mockReturnValue('Filtered by High Protein Only (20g+)');
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
      createMeal(2, 'Grilled Salmon with Roasted Vegetables', {
        calories: 520,
        protein: '42g',
        carbs: '18g',
        fats: '28g',
        prepTime: '30 min',
        difficulty: 'Medium',
        cuisine: 'American',
      }),
      createMeal(4, 'Turkey Lettuce Wraps', {
        calories: 340,
        protein: '33g',
        carbs: '14g',
        fats: '16g',
        cuisine: 'Asian-Inspired',
      }),
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

    expect(screen.getByText('Filtered by High Protein Only (20g+)')).toBeTruthy();
    expect(screen.getByLabelText('Shuffle meal ideas')).toBeTruthy();
    expect(screen.getByLabelText('Show next meal idea')).toBeTruthy();

    await act(async () => {
      fireEvent.press(screen.getByLabelText('Open recipe details for Grilled Salmon with Roasted Vegetables'));
      jest.runOnlyPendingTimers();
    });
    expect(mockNavigation.navigate).toHaveBeenCalledWith('RecipeDetail', { mealId: 2 });
  });

  it('toggles the Explore high-protein filter and restores the unfiltered pool', async () => {
    const meals = [
      createMeal(2, 'Grilled Salmon with Roasted Vegetables'),
      createMeal(4, 'Turkey Lettuce Wraps'),
    ];

    usePreferences.mockReturnValue({
      loadPreferences: jest.fn().mockResolvedValue({ vegan: true }),
    });
    getMatchingMeals.mockReturnValue(meals);

    render(<ExploreScreen navigation={mockNavigation} />);

    await waitFor(() => {
      expect(screen.getByLabelText('High Protein Only filter')).toBeTruthy();
    });
    expect(getMatchingMeals).toHaveBeenLastCalledWith({ vegan: true, highProteinOnly: false });

    await act(async () => {
      fireEvent(screen.getByLabelText('High Protein Only filter'), 'valueChange', true);
    });

    await waitFor(() => {
      expect(getMatchingMeals).toHaveBeenLastCalledWith({ vegan: true, highProteinOnly: true });
    });

    await act(async () => {
      fireEvent(screen.getByLabelText('High Protein Only filter'), 'valueChange', false);
    });

    await waitFor(() => {
      expect(getMatchingMeals).toHaveBeenLastCalledWith({ vegan: true, highProteinOnly: false });
    });
  });

  it('describes the high-protein threshold in the filter accessibility hint', async () => {
    usePreferences.mockReturnValue({
      loadPreferences: jest.fn().mockResolvedValue({}),
    });
    getMatchingMeals.mockReturnValue([createMeal(2, 'Grilled Salmon with Roasted Vegetables')]);

    render(<ExploreScreen navigation={mockNavigation} />);

    await waitFor(() => {
      expect(screen.getByLabelText('High Protein Only filter')).toBeTruthy();
    });

    expect(screen.getByLabelText('High Protein Only filter').props.accessibilityHint).toBe(
      `Shows meals with at least ${HIGH_PROTEIN_THRESHOLD}g of protein when enabled`
    );
  });

  it('keeps the current position and meal order when refocused with unchanged preferences', async () => {
    const savedPreferences = {
      highProtein: true,
    };
    const meals = [
      createMeal(2, 'Grilled Salmon with Roasted Vegetables', {
        calories: 520,
        protein: '42g',
        carbs: '18g',
        fats: '28g',
        prepTime: '30 min',
        difficulty: 'Medium',
        cuisine: 'American',
      }),
      createMeal(4, 'Turkey Lettuce Wraps', {
        calories: 340,
        protein: '33g',
        carbs: '14g',
        fats: '16g',
        cuisine: 'Asian-Inspired',
      }),
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
      createMeal(2, 'Grilled Salmon with Roasted Vegetables', {
        calories: 520,
        protein: '42g',
        carbs: '18g',
        fats: '28g',
        prepTime: '30 min',
        difficulty: 'Medium',
        cuisine: 'American',
      }),
      createMeal(4, 'Turkey Lettuce Wraps', {
        calories: 340,
        protein: '33g',
        carbs: '14g',
        fats: '16g',
        cuisine: 'Asian-Inspired',
      }),
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

  it('shows a loading state before meal ideas are ready', async () => {
    const deferred = createDeferred();

    usePreferences.mockReturnValue({
      loadPreferences: jest.fn().mockReturnValue(deferred.promise),
    });

    render(<ExploreScreen navigation={mockNavigation} />);

    expect(screen.getByText('Loading meal ideas...')).toBeTruthy();

    await act(async () => {
      deferred.resolve({});
    });

    await waitFor(() => {
      expect(screen.queryByText('Loading meal ideas...')).toBeNull();
    });
  });

  it('disables previous and next controls at the gallery boundaries', async () => {
    const meals = [
      createMeal(2, 'Grilled Salmon with Roasted Vegetables'),
      createMeal(4, 'Turkey Lettuce Wraps'),
    ];

    usePreferences.mockReturnValue({
      loadPreferences: jest.fn().mockResolvedValue({}),
    });
    getMatchingMeals.mockReturnValue(meals);
    getPreferenceSummary.mockReturnValue('Showing all meals');

    render(<ExploreScreen navigation={mockNavigation} />);

    await waitFor(() => {
      expect(screen.getByText('1 of 2')).toBeTruthy();
    });

    const previousButton = getPressableAncestor(screen.getByText('Previous'));
    const nextButton = getPressableAncestor(screen.getByText('Next'));

    expect(previousButton.props.disabled).toBe(true);
    expect(nextButton.props.disabled).toBe(false);

    await act(async () => {
      fireEvent.press(previousButton);
      jest.runOnlyPendingTimers();
    });
    expect(screen.getByText('1 of 2')).toBeTruthy();

    await act(async () => {
      fireEvent.press(nextButton);
      jest.runOnlyPendingTimers();
    });

    expect(screen.getByText('2 of 2')).toBeTruthy();
    expect(getPressableAncestor(screen.getByText('Previous')).props.disabled).toBe(false);
    expect(getPressableAncestor(screen.getByText('Next')).props.disabled).toBe(true);
  });

  it('resets to the first card when shuffle mix is used from a later position', async () => {
    const meals = [
      createMeal(2, 'Grilled Salmon with Roasted Vegetables'),
      createMeal(4, 'Turkey Lettuce Wraps'),
      createMeal(6, 'Greek Salmon Salad'),
    ];

    usePreferences.mockReturnValue({
      loadPreferences: jest.fn().mockResolvedValue({}),
    });
    getMatchingMeals.mockReturnValue(meals);
    getPreferenceSummary.mockReturnValue('Showing all meals');

    render(<ExploreScreen navigation={mockNavigation} />);

    await waitFor(() => {
      expect(screen.getByText('1 of 3')).toBeTruthy();
    });

    await act(async () => {
      fireEvent.press(screen.getByLabelText('Show next meal idea'));
      jest.runOnlyPendingTimers();
    });

    expect(screen.getByText('2 of 3')).toBeTruthy();

    await act(async () => {
      fireEvent.press(screen.getByLabelText('Shuffle meal ideas'));
      jest.runOnlyPendingTimers();
    });

    expect(screen.getByText('1 of 3')).toBeTruthy();
    expect(getPressableAncestor(screen.getByText('Previous')).props.disabled).toBe(true);
  });

  it('updates the active indicator when horizontal scrolling lands on a different card', async () => {
    const meals = [
      createMeal(2, 'Grilled Salmon with Roasted Vegetables'),
      createMeal(4, 'Turkey Lettuce Wraps'),
      createMeal(6, 'Greek Salmon Salad'),
    ];

    usePreferences.mockReturnValue({
      loadPreferences: jest.fn().mockResolvedValue({}),
    });
    getMatchingMeals.mockReturnValue(meals);
    getPreferenceSummary.mockReturnValue('Showing all meals');

    const view = render(<ExploreScreen navigation={mockNavigation} />);

    await waitFor(() => {
      expect(screen.getByText('1 of 3')).toBeTruthy();
    });

    const list = view.UNSAFE_getByType(FlatList);

    await act(async () => {
      fireEvent(list, 'momentumScrollEnd', {
        nativeEvent: {
          contentOffset: {
            x: SNAP_INTERVAL * 2,
          },
        },
      });
    });

    expect(screen.getByText('3 of 3')).toBeTruthy();
    expect(getPressableAncestor(screen.getByText('Next')).props.disabled).toBe(true);
  });
});
