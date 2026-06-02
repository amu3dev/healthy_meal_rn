import React from 'react';
import { ActivityIndicator } from 'react-native';
import { fireEvent, render, screen } from '@testing-library/react-native';
import MealImage from '../components/MealImage';

describe('MealImage', () => {
  it('renders fallback content immediately when no uri is provided', () => {
    render(<MealImage label="Fallback Meal" />);

    expect(screen.getByText('Fallback Meal')).toBeTruthy();
    expect(screen.getByText('Image unavailable')).toBeTruthy();
  });

  it('shows a loading indicator until the image load completes', () => {
    const { getByLabelText, UNSAFE_getByType, UNSAFE_queryByType } = render(
      <MealImage uri="https://example.com/meal.jpg" label="Loaded Meal" />
    );

    const image = getByLabelText('Loaded Meal');

    expect(UNSAFE_getByType(ActivityIndicator)).toBeTruthy();

    fireEvent(image, 'load');

    expect(UNSAFE_queryByType(ActivityIndicator)).toBeNull();
    expect(screen.queryByText('Image unavailable')).toBeNull();
  });

  it('falls back gracefully when the image errors', () => {
    const { getByLabelText } = render(
      <MealImage uri="https://example.com/broken.jpg" label="Broken Meal" />
    );

    fireEvent(getByLabelText('Broken Meal'), 'error');

    expect(screen.getByText('Broken Meal')).toBeTruthy();
    expect(screen.getByText('Image unavailable')).toBeTruthy();
  });

  it('resets the fallback state when the uri changes', () => {
    const { getByLabelText, rerender, queryByText, UNSAFE_getByType } = render(
      <MealImage uri="https://example.com/old.jpg" label="Retry Meal" />
    );

    fireEvent(getByLabelText('Retry Meal'), 'error');
    expect(screen.getByText('Image unavailable')).toBeTruthy();

    rerender(<MealImage uri="https://example.com/new.jpg" label="Retry Meal" />);

    expect(queryByText('Image unavailable')).toBeNull();
    expect(UNSAFE_getByType(ActivityIndicator)).toBeTruthy();
  });
});
