import React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { useFocusEffect } from '@react-navigation/native';
import HomeScreen from '../screens/HomeScreen';
import { STORAGE_KEYS } from '../lib/preferences';
import { getDailyMeal, getPreferenceSummary } from '../lib/mealUtils';

jest.mock('@expo/vector-icons', () => ({
  MaterialIcons: () => null,
}));

jest.mock('@react-navigation/native', () => ({
  useFocusEffect: jest.fn(),
}));

const mockNavigation = {
  navigate: jest.fn(),
};

function runFocusEffect() {
  useFocusEffect.mockImplementation((callback) => {
    React.useEffect(() => callback(), [callback]);
  });
}

describe('HomeScreen integration', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-06-03T12:00:00Z'));
    runFocusEffect();
    await AsyncStorage.clear();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('loads saved preferences from AsyncStorage and renders the real daily meal selection', async () => {
    const savedPreferences = {
      dairyFree: true,
      lowCarb: true,
      highProtein: true,
    };
    const expectedMeal = getDailyMeal(savedPreferences, new Date('2026-06-03T12:00:00Z'));
    const expectedSummary = getPreferenceSummary(savedPreferences);

    await AsyncStorage.setItem(
      STORAGE_KEYS.userPreferences,
      JSON.stringify(savedPreferences)
    );

    render(<HomeScreen navigation={mockNavigation} />);

    await waitFor(() => {
      expect(screen.getByText(expectedMeal.name)).toBeTruthy();
    });

    expect(screen.getByText(expectedSummary)).toBeTruthy();
    expect(screen.getByLabelText(`Open recipe details for ${expectedMeal.name}`)).toBeTruthy();

    fireEvent.press(screen.getByLabelText(`Open recipe details for ${expectedMeal.name}`));
    expect(mockNavigation.navigate).toHaveBeenCalledWith('RecipeDetail', {
      mealId: expectedMeal.id,
    });
  });
});
