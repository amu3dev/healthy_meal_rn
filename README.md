# Healthy Meal RN

Healthy Meal RN is an Expo + React Native app that suggests a healthy meal of the day, lets users save dietary preferences, and shows recipe details in a simple mobile-first flow.

## Why This Project Stands Out

- Builds a complete multi-screen mobile flow with React Navigation.
- Persists user preferences locally with AsyncStorage.
- Uses deterministic daily selection instead of random reshuffling on every refresh.
- Handles no-match and missing-data states instead of only the happy path.
- Ships with a lightweight GitHub Actions workflow to validate the repo on every push and pull request.

## Features

- Daily healthy meal suggestion on the home screen
- Dietary filters for vegetarian, vegan, gluten-free, dairy-free, low-carb, and high-protein preferences
- Persistent preferences saved on device
- Recipe detail screen with nutrition, ingredients, and cooking steps
- Empty-state guidance when no meals match the selected preferences
- Pull-to-refresh that reloads the current daily selection logic

## Tech Stack

- Expo SDK 52
- React Native 0.76
- React Navigation native stack
- AsyncStorage for local persistence

## Project Structure

```text
.
├── App.js
├── app.json
├── data/
│   └── meals.js
├── lib/
│   ├── mealUtils.js
│   └── preferences.js
├── screens/
│   ├── HomeScreen.js
│   ├── PreferencesScreen.js
│   └── RecipeDetailScreen.js
└── assets/
```

## Local Setup

```bash
npm install
npm start
```

Useful Expo shortcuts:

- `npm run ios`
- `npm run android`
- `npm run web`

## Quality Checks

Run the local validation scripts:

```bash
npm run check
```

This currently verifies:

- JavaScript syntax across the app source
- Expo dependency compatibility with the installed SDK

## Manual Test Scenarios

Use these quick checks to verify the main product logic:

1. Open the app with all filters off and confirm the home screen shows a meal with `Showing all meals`.
2. Enable `High Protein` and confirm the salmon meal is shown.
3. Enable `Vegan` and confirm the quinoa bowl is shown.
4. Enable `Vegan` + `High Protein` and confirm the no-match empty state appears.
5. Return to Preferences, loosen filters, and confirm a meal appears again.

## Resume-Friendly Highlights

- Designed and implemented a mobile meal recommendation flow using Expo and React Native.
- Built client-side persistence and preference-aware filtering logic.
- Improved product reliability by adding graceful empty/error states and deterministic daily behavior.
- Added repository automation with GitHub Actions to validate dependency compatibility and source integrity.

## Next Improvements

- Expand the meal catalog and associate richer nutritional metadata
- Add automated component or integration tests
- Add screenshots or a short demo GIF for the repository landing page
- Connect to a backend or CMS for dynamic meal content
