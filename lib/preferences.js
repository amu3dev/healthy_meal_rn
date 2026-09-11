export const STORAGE_KEYS = {
  userPreferences: 'userPreferences',
  favoriteMeals: 'favoriteMeals',
};

/** @type {import('./types').Preferences} */
export const DEFAULT_PREFERENCES = {
  vegetarian: false,
  vegan: false,
  glutenFree: false,
  dairyFree: false,
  lowCarb: false,
  highProtein: false,
};

export const PREFERENCE_LABELS = {
  vegetarian: 'Vegetarian',
  vegan: 'Vegan',
  glutenFree: 'Gluten Free',
  dairyFree: 'Dairy Free',
  lowCarb: 'Low Carb',
  highProtein: 'High Protein (20g+)',
};

export function mergePreferences(preferences = {}) {
  return Object.keys(DEFAULT_PREFERENCES).reduce((merged, key) => {
    merged[key] = Boolean(preferences[key]);
    return merged;
  }, {});
}

export function getEnabledPreferences(preferences = {}) {
  const mergedPreferences = mergePreferences(preferences);

  return Object.keys(mergedPreferences).filter((key) => mergedPreferences[key]);
}

export function formatPreferenceLabel(key) {
  return PREFERENCE_LABELS[key] || key;
}
