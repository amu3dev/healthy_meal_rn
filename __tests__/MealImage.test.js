import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import MealImage from '../components/MealImage';

describe('MealImage', () => {
  it('renders fallback content immediately when no uri is provided', async () => {
    await render(<MealImage label="Fallback Meal" />);

    expect(screen.getByText('Fallback Meal')).toBeTruthy();
    expect(screen.getByText('Image unavailable')).toBeTruthy();
  });

  it('shows a loading indicator until the image load completes', async () => {
    const { getByLabelText, getByTestId, queryByTestId } = await render(
      <MealImage uri="https://example.com/meal.jpg" label="Loaded Meal" />
    );

    const image = getByLabelText('Loaded Meal');

    expect(getByTestId('meal-image-loading')).toBeTruthy();

    await fireEvent(image, 'load');

    expect(queryByTestId('meal-image-loading')).toBeNull();
    expect(screen.queryByText('Image unavailable')).toBeNull();
  });

  it('falls back gracefully when the image errors', async () => {
    const { getByLabelText } = await render(
      <MealImage uri="https://example.com/broken.jpg" label="Broken Meal" />
    );

    await fireEvent(getByLabelText('Broken Meal'), 'error');

    expect(screen.getByText('Broken Meal')).toBeTruthy();
    expect(screen.getByText('Image unavailable')).toBeTruthy();
  });

  it('can hide image accessibility when used decoratively inside a larger control', async () => {
    const { queryByLabelText } = await render(
      <MealImage
        uri="https://example.com/decorative.jpg"
        label="Decorative Meal"
        isDecorative
      />
    );

    expect(queryByLabelText('Decorative Meal')).toBeNull();
  });

  it('resets the fallback state when the uri changes', async () => {
    const { getByLabelText, rerender, queryByText, getByTestId } = await render(
      <MealImage uri="https://example.com/old.jpg" label="Retry Meal" />
    );

    await fireEvent(getByLabelText('Retry Meal'), 'error');
    expect(screen.getByText('Image unavailable')).toBeTruthy();

    await rerender(<MealImage uri="https://example.com/new.jpg" label="Retry Meal" />);

    expect(queryByText('Image unavailable')).toBeNull();
    expect(getByTestId('meal-image-loading')).toBeTruthy();
  });
});
