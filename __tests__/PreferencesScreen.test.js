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
      savePreferences,
      togglePreference: jest.fn(),
    });

    render(<PreferencesScreen />);

    fireEvent.press(screen.getByText('Save Preferences'));

    await waitFor(() => {
      expect(savePreferences).toHaveBeenCalled();
    });

    expect(Alert.alert).toHaveBeenCalledWith(
      'Preferences saved',
      'Your daily meal suggestions now use these filters.'
    );
  });
});
