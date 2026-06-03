import React from 'react';
import { Alert } from 'react-native';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import PreferencesScreen from '../screens/PreferencesScreen';
import usePreferences from '../hooks/usePreferences';

jest.mock('../hooks/usePreferences');

describe('PreferencesScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  });

  afterEach(() => {
    Alert.alert.mockRestore();
  });

  it('shows a loading state while preferences hydrate', () => {
    usePreferences.mockReturnValue({
      preferences: {
        vegetarian: false,
        vegan: false,
        glutenFree: false,
        dairyFree: false,
        lowCarb: false,
        highProtein: false,
      },
      isLoading: true,
      savePreferences: jest.fn(),
      togglePreference: jest.fn(),
    });

    render(<PreferencesScreen />);

    expect(screen.getByText('Loading preferences...')).toBeTruthy();
    expect(screen.getByLabelText('Loading saved dietary preferences')).toBeTruthy();
  });

  it('saves preferences and shows success feedback', async () => {
    const savePreferences = jest.fn().mockResolvedValue(undefined);

    usePreferences.mockReturnValue({
      preferences: {
        vegetarian: false,
        vegan: true,
        glutenFree: false,
        dairyFree: false,
        lowCarb: false,
        highProtein: true,
      },
      isLoading: false,
      savePreferences,
      togglePreference: jest.fn(),
    });

    render(<PreferencesScreen />);

    expect(screen.getByLabelText('Vegan preference')).toBeTruthy();
    expect(screen.getByLabelText('High Protein preference')).toBeTruthy();

    fireEvent.press(screen.getByLabelText('Save dietary preferences'));

    await waitFor(() => {
      expect(savePreferences).toHaveBeenCalled();
    });

    expect(Alert.alert).toHaveBeenCalledWith(
      'Preferences saved',
      'Your daily meal suggestions now use these filters.'
    );
  });
});
