import {
  DEFAULT_PREFERENCES,
  formatPreferenceLabel,
  getEnabledPreferences,
  mergePreferences,
} from '../lib/preferences';

describe('preferences helpers', () => {
  it('merges partial preferences onto the known keys', () => {
    expect(mergePreferences({ vegan: true })).toEqual({
      ...DEFAULT_PREFERENCES,
      vegan: true,
    });
  });

  it('returns only enabled preference keys', () => {
    expect(
      getEnabledPreferences({
        vegetarian: true,
        vegan: false,
        highProtein: true,
      })
    ).toEqual(['vegetarian', 'highProtein']);
  });

  it('formats preference labels for display', () => {
    expect(formatPreferenceLabel('glutenFree')).toBe('Gluten Free');
  });
});
