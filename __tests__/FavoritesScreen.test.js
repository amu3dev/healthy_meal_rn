import React from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import FavoritesScreen from '../screens/FavoritesScreen';

jest.mock('@react-navigation/native', () => ({
  useFocusEffect: jest.fn(),
}));

const mockNavigation = {
  navigate: jest.fn(),
};

let focusCallback;

describe('FavoritesScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useFocusEffect.mockImplementation((callback) => {
      focusCallback = callback;
      React.useEffect(() => {
        callback();
      }, [callback]);
    });
  });

  it('lists saved favorites newest first and opens recipe details', async () => {
    AsyncStorage.getItem.mockResolvedValue(JSON.stringify([1, 2]));

    render(<FavoritesScreen navigation={mockNavigation} />);

    await waitFor(() => {
      expect(screen.getByText('Grilled Salmon with Roasted Vegetables')).toBeTruthy();
    });
    const names = screen.getAllByText(/Quinoa Buddha Bowl|Grilled Salmon with Roasted Vegetables/)
      .map((node) => node.props.children);
    expect(names).toEqual(['Grilled Salmon with Roasted Vegetables', 'Quinoa Buddha Bowl']);

    fireEvent.press(screen.getByLabelText('Open recipe details for Quinoa Buddha Bowl'));
    expect(mockNavigation.navigate).toHaveBeenCalledWith('RecipeDetail', { mealId: 1 });
  });

  it('shows an empty state that points to Explore when nothing is saved', async () => {
    AsyncStorage.getItem.mockResolvedValue(null);

    render(<FavoritesScreen navigation={mockNavigation} />);

    await waitFor(() => {
      expect(screen.getByText('No favorites yet')).toBeTruthy();
    });

    fireEvent.press(screen.getByLabelText('Explore meals to favorite'));
    expect(mockNavigation.navigate).toHaveBeenCalledWith('Explore');
  });

  it('picks up favorites added elsewhere when refocused', async () => {
    AsyncStorage.getItem
      .mockResolvedValueOnce(JSON.stringify([]))
      .mockResolvedValueOnce(JSON.stringify([4]));

    render(<FavoritesScreen navigation={mockNavigation} />);

    await waitFor(() => {
      expect(screen.getByText('No favorites yet')).toBeTruthy();
    });

    await act(async () => {
      focusCallback();
    });

    await waitFor(() => {
      expect(screen.getByText('Turkey Lettuce Wraps')).toBeTruthy();
    });
    expect(screen.queryByText('Loading favorites...')).toBeNull();
  });

  it('shows a retryable error when favorites cannot be read', async () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    AsyncStorage.getItem
      .mockRejectedValueOnce(new Error('storage unavailable'))
      .mockResolvedValueOnce(JSON.stringify([2]));

    render(<FavoritesScreen navigation={mockNavigation} />);

    await waitFor(() => {
      expect(screen.getByText('Unable to load favorites')).toBeTruthy();
    });
    expect(consoleError).toHaveBeenCalledWith('Error loading favorite meals:', expect.any(Error));

    await act(async () => {
      fireEvent.press(screen.getByLabelText('Retry loading favorite meals'));
    });

    await waitFor(() => {
      expect(screen.getByText('Grilled Salmon with Roasted Vegetables')).toBeTruthy();
    });
    consoleError.mockRestore();
  });
});
