import React from 'react';
import { Dimensions, FlatList } from 'react-native';
import { act, fireEvent, render as renderScreen, screen, waitFor } from '@testing-library/react-native';
import { SafeAreaInsetsContext } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import ExploreScreen from '../screens/ExploreScreen';
import usePreferences from '../hooks/usePreferences';
import {
  getMatchingMeals,
  getNoMatchMessage,
  getPreferenceSummary,
  HIGH_PROTEIN_THRESHOLD,
} from '../lib/mealUtils';
import { DEFAULT_PREFERENCES } from '../lib/preferences';
function render(ui) {
  return renderScreen(
    <SafeAreaInsetsContext.Provider value={{ top: 24, right: 0, bottom: 24, left: 0 }}>
      {ui}
    </SafeAreaInsetsContext.Provider>
  );
}

jest.mock('@react-navigation/native', () => ({
  useFocusEffect: jest.fn(),
}));

jest.mock('../hooks/usePreferences');
jest.mock('../lib/mealUtils', () => ({
  getMatchingMeals: jest.fn(),
  getNoMatchMessage: jest.fn(),
  getPreferenceSummary: jest.fn(),
  HIGH_PROTEIN_THRESHOLD: jest.requireActual('../lib/mealUtils').HIGH_PROTEIN_THRESHOLD,
  isHighProteinMeal: jest.requireActual('../lib/mealUtils').isHighProteinMeal,
}));

const mockNavigation = {
  navigate: jest.fn(),
};

let focusCallback;
const initialWindow = Dimensions.get('window');

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

function isButtonDisabled(button) {
  return Boolean(button.props?.disabled || button.props?.accessibilityState?.disabled);
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
    getNoMatchMessage.mockReturnValue(
      'No meals match these selections: High Protein (20g+).'
    );
    getPreferenceSummary.mockReturnValue('Filtered by High Protein (20g+)');
  });

  afterEach(async () => {
    await act(async () => {
      Dimensions.set({ window: initialWindow });
      jest.runOnlyPendingTimers();
    });
    jest.restoreAllMocks();
    jest.useRealTimers();
  });

  it('renders a no-match state when the filtered meal pool is empty', async () => {
    usePreferences.mockReturnValue({
      loadPreferences: jest.fn().mockResolvedValue({
        highProtein: true,
      }),
    });
    getMatchingMeals.mockReturnValue([]);
    getNoMatchMessage.mockReturnValue(
      'No meals match these selections: High Protein (20g+).'
    );

    await render(<ExploreScreen navigation={mockNavigation} />);

    await waitFor(() => {
      expect(screen.getByText('No meal ideas match these filters')).toBeTruthy();
    });

    expect(screen.getByText('No meals match these selections: High Protein (20g+).')).toBeTruthy();
    expect(screen.getByText('Revise one saved preference, save your changes, and try again. Nothing is changed automatically.')).toBeTruthy();

    await act(async () => {
      await fireEvent.press(screen.getByLabelText('Adjust dietary preferences'));
      jest.runOnlyPendingTimers();
    });
    expect(mockNavigation.navigate).toHaveBeenCalledWith('Preferences');
  });

  it('renders a load error instead of no-match guidance when preferences fail', async () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    usePreferences.mockReturnValue({
      loadPreferences: jest.fn().mockRejectedValue(new Error('storage unavailable')),
    });

    await render(<ExploreScreen navigation={mockNavigation} />);

    await waitFor(() => {
      expect(screen.getByText('Unable to load meal ideas')).toBeTruthy();
    });

    expect(screen.queryByText('No meal ideas match these filters')).toBeNull();
    expect(screen.queryByText(/Nothing is changed automatically/)).toBeNull();
    expect(screen.getByLabelText('Retry loading meal ideas')).toBeTruthy();
    expect(consoleError).toHaveBeenCalledWith('Error loading explore meals:', expect.any(Error));
    consoleError.mockRestore();
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

    await render(<ExploreScreen navigation={mockNavigation} />);

    await waitFor(() => {
      expect(screen.getByText('Explore More Meals')).toBeTruthy();
    });

    expect(screen.getByText('Filtered by High Protein (20g+)')).toBeTruthy();
    expect(screen.getByLabelText('Shuffle meal ideas')).toBeTruthy();
    expect(screen.getByLabelText('Show next meal idea')).toBeTruthy();

    await act(async () => {
      await fireEvent.press(screen.getByLabelText('Open recipe details for Grilled Salmon with Roasted Vegetables'));
      jest.runOnlyPendingTimers();
    });
    expect(mockNavigation.navigate).toHaveBeenCalledWith('RecipeDetail', { mealId: 2 });
  });

  it('toggles a session-only high-protein filter through the shared preference key', async () => {
    const meals = [
      createMeal(2, 'Grilled Salmon with Roasted Vegetables'),
      createMeal(4, 'Turkey Lettuce Wraps'),
    ];
    const savedPreferences = { ...DEFAULT_PREFERENCES, vegan: true };

    usePreferences.mockReturnValue({
      loadPreferences: jest.fn().mockResolvedValue({ vegan: true }),
    });
    getMatchingMeals.mockReturnValue(meals);

    await render(<ExploreScreen navigation={mockNavigation} />);

    await waitFor(() => {
      expect(screen.getByLabelText('High protein filter')).toBeTruthy();
    });
    expect(getMatchingMeals).toHaveBeenLastCalledWith(savedPreferences);
    expect(screen.getByLabelText('High protein filter').props.value).toBe(false);

    await act(async () => {
      await fireEvent(screen.getByLabelText('High protein filter'), 'valueChange', true);
    });

    await waitFor(() => {
      expect(getMatchingMeals).toHaveBeenLastCalledWith({ ...savedPreferences, highProtein: true });
    });
    expect(screen.getByLabelText('High protein filter').props.value).toBe(true);

    await act(async () => {
      await fireEvent(screen.getByLabelText('High protein filter'), 'valueChange', false);
    });

    await waitFor(() => {
      expect(getMatchingMeals).toHaveBeenLastCalledWith(savedPreferences);
    });
    expect(getMatchingMeals.mock.calls.every(([preferences]) => !('highProteinOnly' in preferences))).toBe(true);
  });

  it('describes the high-protein threshold in the filter accessibility hint', async () => {
    usePreferences.mockReturnValue({
      loadPreferences: jest.fn().mockResolvedValue({}),
    });
    getMatchingMeals.mockReturnValue([createMeal(2, 'Grilled Salmon with Roasted Vegetables')]);

    await render(<ExploreScreen navigation={mockNavigation} />);

    await waitFor(() => {
      expect(screen.getByLabelText('High protein filter')).toBeTruthy();
    });

    expect(screen.getByText('High Protein (20g+)')).toBeTruthy();
    expect(screen.getByLabelText('High protein filter').props.accessibilityHint).toBe(
      `Shows meals with at least ${HIGH_PROTEIN_THRESHOLD}g of protein when enabled`
    );
  });

  it('shows the filter as on and locked when High Protein is a saved preference', async () => {
    usePreferences.mockReturnValue({
      loadPreferences: jest.fn().mockResolvedValue({ highProtein: true }),
    });
    getMatchingMeals.mockReturnValue([createMeal(2, 'Grilled Salmon with Roasted Vegetables')]);

    await render(<ExploreScreen navigation={mockNavigation} />);

    await waitFor(() => {
      expect(screen.getByLabelText('High protein filter')).toBeTruthy();
    });

    const filterSwitch = screen.getByLabelText('High protein filter');
    expect(filterSwitch.props.value).toBe(true);
    expect(filterSwitch).toBeDisabled();
    expect(filterSwitch.props.accessibilityHint).toBe(
      'On because High Protein is saved in your preferences'
    );
    expect(screen.getByText('Saved in your preferences.')).toBeTruthy();
    expect(getMatchingMeals).toHaveBeenLastCalledWith({ ...DEFAULT_PREFERENCES, highProtein: true });
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

    await render(<ExploreScreen navigation={mockNavigation} />);

    await waitFor(() => {
      expect(screen.getByText('1 of 2')).toBeTruthy();
    });

    await act(async () => {
      await fireEvent.press(screen.getByLabelText('Show next meal idea'));
      jest.runOnlyPendingTimers();
    });
    expect(screen.getByText('2 of 2')).toBeTruthy();

    await act(async () => {
      await focusCallback();
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

    await render(<ExploreScreen navigation={mockNavigation} />);

    await waitFor(() => {
      expect(screen.getByText('1 of 2')).toBeTruthy();
    });

    await act(async () => {
      await fireEvent.press(screen.getByLabelText('Show next meal idea'));
      jest.runOnlyPendingTimers();
    });
    expect(screen.getByText('2 of 2')).toBeTruthy();

    await act(async () => {
      await focusCallback();
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

    await render(<ExploreScreen navigation={mockNavigation} />);

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

    await render(<ExploreScreen navigation={mockNavigation} />);

    await waitFor(() => {
      expect(screen.getByText('1 of 2')).toBeTruthy();
    });

    const previousButton = screen.getByLabelText('Show previous meal idea');
    const nextButton = screen.getByLabelText('Show next meal idea');

    expect(isButtonDisabled(previousButton)).toBe(true);
    expect(isButtonDisabled(nextButton)).toBe(false);

    await act(async () => {
      await fireEvent.press(previousButton);
      jest.runOnlyPendingTimers();
    });
    expect(screen.getByText('1 of 2')).toBeTruthy();

    await act(async () => {
      await fireEvent.press(nextButton);
      jest.runOnlyPendingTimers();
    });

    expect(screen.getByText('2 of 2')).toBeTruthy();
    expect(isButtonDisabled(screen.getByLabelText('Show previous meal idea'))).toBe(false);
    expect(isButtonDisabled(screen.getByLabelText('Show next meal idea'))).toBe(true);
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

    await render(<ExploreScreen navigation={mockNavigation} />);

    await waitFor(() => {
      expect(screen.getByText('1 of 3')).toBeTruthy();
    });

    await act(async () => {
      await fireEvent.press(screen.getByLabelText('Show next meal idea'));
      jest.runOnlyPendingTimers();
    });

    expect(screen.getByText('2 of 3')).toBeTruthy();

    await act(async () => {
      await fireEvent.press(screen.getByLabelText('Shuffle meal ideas'));
      jest.runOnlyPendingTimers();
    });

    expect(screen.getByText('1 of 3')).toBeTruthy();
    expect(isButtonDisabled(screen.getByLabelText('Show previous meal idea'))).toBe(true);
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

    await render(<ExploreScreen navigation={mockNavigation} />);

    await waitFor(() => {
      expect(screen.getByText('1 of 3')).toBeTruthy();
    });

    const list = screen.getByTestId('explore-meal-list');

    await act(async () => {
      await fireEvent(list, 'momentumScrollEnd', {
        nativeEvent: {
          contentOffset: {
            x: list.props.snapToInterval * 2,
          },
        },
      });
    });

    expect(screen.getByText('3 of 3')).toBeTruthy();
    expect(isButtonDisabled(screen.getByLabelText('Show next meal idea'))).toBe(true);
  });

  it('keeps the gallery position and uses the new card spacing after a window resize', async () => {
    usePreferences.mockReturnValue({ loadPreferences: jest.fn().mockResolvedValue({}) });
    getMatchingMeals.mockReturnValue([
      createMeal(1, 'First meal'),
      createMeal(2, 'Second meal'),
      createMeal(3, 'Third meal'),
    ]);
    await act(async () => {
      Dimensions.set({ window: { width: 360, height: 800, scale: 3, fontScale: 1 } });
    });
    await render(<ExploreScreen navigation={mockNavigation} />);
    await waitFor(() => expect(screen.getByText('1 of 3')).toBeTruthy());

    const scrollToOffset = jest.spyOn(FlatList.prototype, 'scrollToOffset').mockImplementation(() => {});
    await fireEvent(screen.getByTestId('explore-meal-list'), 'layout', {
      nativeEvent: { layout: { width: 360, height: 500 } },
    });
    const phoneInterval = screen.getByTestId('explore-meal-list').props.snapToInterval;
    await fireEvent.press(screen.getByLabelText('Show next meal idea'));
    expect(screen.getByText('2 of 3')).toBeTruthy();
    scrollToOffset.mockClear();

    // Different meal heights must not interrupt a horizontal swipe.
    await fireEvent(screen.getByTestId('explore-meal-list'), 'layout', {
      nativeEvent: { layout: { width: 360, height: 600 } },
    });
    expect(scrollToOffset).not.toHaveBeenCalled();

    await act(async () => {
      Dimensions.set({ window: { width: 800, height: 1000, scale: 2, fontScale: 1 } });
    });
    const list = screen.getByTestId('explore-meal-list');
    expect(list.props.snapToInterval).toBeGreaterThan(phoneInterval);
    expect(list.props.snapToInterval).toBeLessThan(800 / 2 + 56);
    expect(screen.getByText('2 of 3')).toBeTruthy();
    expect(getMatchingMeals).toHaveBeenCalledTimes(1);
    await fireEvent(list, 'layout', {
      nativeEvent: { layout: { width: 800, height: 600 } },
    });
    expect(scrollToOffset).toHaveBeenCalledWith({ animated: false, offset: list.props.snapToInterval });

    await fireEvent(list, 'momentumScrollEnd', {
      nativeEvent: { contentOffset: { x: list.props.snapToInterval * 2 } },
    });
    expect(screen.getByText('3 of 3')).toBeTruthy();
    expect(screen.getByLabelText('Show next meal idea')).toBeDisabled();
  });

  it('keeps the meal indicator within the gallery boundaries when scrolling overshoots', async () => {
    usePreferences.mockReturnValue({ loadPreferences: jest.fn().mockResolvedValue({}) });
    getMatchingMeals.mockReturnValue([createMeal(1, 'First meal'), createMeal(2, 'Second meal')]);
    await render(<ExploreScreen navigation={mockNavigation} />);
    await waitFor(() => expect(screen.getByText('1 of 2')).toBeTruthy());
    const list = screen.getByTestId('explore-meal-list');

    await fireEvent(list, 'momentumScrollEnd', {
      nativeEvent: { contentOffset: { x: -list.props.snapToInterval } },
    });
    expect(screen.getByText('1 of 2')).toBeTruthy();
    await fireEvent(list, 'momentumScrollEnd', {
      nativeEvent: { contentOffset: { x: list.props.snapToInterval * 3 } },
    });
    expect(screen.getByText('2 of 2')).toBeTruthy();
  });
});
