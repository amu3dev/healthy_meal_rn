# Healthy Meal — Product Experiment #1
## Implementation brief: recoverable preference matching

**Status:** Implemented and locally verified
**Baseline:** `experiment/hermes-goal-mode` at `8bee852`
**Scope:** One bounded improvement to the core decision loop

## Evidence ledger

- `lib/mealUtils.js` applies all enabled boolean preferences with conjunctive (`AND`) matching. With no enabled preference, the full 25-meal catalog is returned.
- A read-only probe of the current catalog found two minimal zero-match combinations:
  - `vegan + glutenFree + lowCarb` → **0 matches**;
  - `vegetarian + glutenFree + dairyFree + lowCarb` → **0 matches**.
- The current documented combination `vegan + highProtein + lowCarb + glutenFree` also returns **0 matches**; `highProtein` is redundant in that conflict.
- Home currently shows `No meals match your current filters yet` and routes to Preferences. It does not name the active filters or explain the recovery action.
- Preferences are saved only when the user presses **Save Preferences**. Home reloads the saved values on focus.
- The six current flags are positive matching requirements when enabled; disabled flags impose no inverse constraint. The repository does not define medical, allergen, or clinical meaning for the labels.
- The implementation uses one numeric `20g+` rule for saved `highProtein` matching, Explore High Protein Only, MealCard badges, and catalog validation. `Quinoa Buddha Bowl` is aligned to that rule with `highProtein: true`.

## Problem

A user can select a valid-looking combination of preferences that has no catalog match. The product reports an empty result but does not show which selections caused it or give a clear, intentional recovery action.

## Hypothesis

If Healthy Meal names the active selections, explains that they are applied together, and directs the user to revise one selection without changing anything automatically, users will be able to recover from no-match states with less guessing while the deterministic recommendation contract remains intact.

## Proposed UX

1. **Discoverability:** When Home has a meal and no saved preferences are enabled, show a small inline prompt explaining that dietary filters and optional meal goals can make the recommendation fit the user better, with the existing Preferences route.
2. **Semantics:** In Preferences, group the existing switches into **Dietary filters** and **Optional meal goals**. Explain that selected choices narrow the local catalog together; goals are catalog labels, not medical guidance.
3. **No match:** Replace generic no-match status text with the active labels, for example: `No meals match these selections: Vegan, Gluten Free, Low Carb.`
4. **Recovery:** Keep the existing Review/Adjust Preferences CTA. Tell the user to turn off one selected filter or goal, save, and return. Nothing is relaxed automatically.
5. **High Protein:** Define one canonical rule: a valid integer protein value such as `20g` is high protein when it is at least `20g`. Use that rule for saved Preferences, Explore, badges, and validation.

## Preference contract

- Enabled dietary filters are required catalog labels for this experiment.
- Enabled optional goals also narrow the pool; “optional” describes user intent, not a soft fallback rule.
- Disabled flags impose no negative or inverse constraint.
- The labels do not constitute medical, allergy-safety, or nutritional advice.
- A no-match result is valid product state. The app must explain it and require explicit user revision.
- High Protein uses the numeric `20g+` rule. The `highProtein` tag is metadata validated against that rule, not a second matching definition.

## Acceptance criteria

1. A user with no saved preferences sees a clear, compact path to set preferences from Home.
2. Preferences visibly distinguish dietary filters from optional meal goals without adding a new onboarding flow.
3. Existing valid combinations still return matching meals.
4. `vegan + glutenFree + lowCarb` and the documented impossible combination still return no meal rather than an unfiltered recommendation.
5. Home and Explore no-match states name the active selections and explain how to recover.
6. Recovery uses the existing Preferences flow and requires the user to toggle and save; no constraint is silently removed.
7. Saved High Protein and Explore High Protein Only use the same canonical `20g+` contract, including the 20g boundary and Quinoa catalog record.
8. Deterministic daily selection, persistence, navigation, loading, error, empty, and accessibility behavior remain intact.

## Out of scope

- Authentication
- Backend or CMS
- Cloud synchronization
- AI recommendation or ranking
- Major navigation redesign
- Broad visual redesign
- New state-management framework
- Analytics vendor
- Unrelated refactoring
- Automatic fallback or opaque constraint relaxation

## Verification plan

- Add focused utility tests for zero-match messaging, canonical High Protein matching, the 20g boundary, and catalog consistency.
- Add screen tests for Home discoverability and no-match explanation/recovery, Explore no-match explanation, and Preferences grouping/copy.
- Add regression coverage so Home and Explore show a retryable load-error state instead of no-match guidance when preference loading fails.
- Preserve existing persistence, deterministic-selection, navigation, and integration tests.
- Run `npm run check`, inspect warnings/errors, run `git diff --check`, and review the complete diff independently.
- Treat technical verification as separate from user validation; no user outcome will be claimed by this experiment.

## Verified implementation

- Home and Explore now distinguish load failures from successful no-match results.
- No-match states name active selections and require explicit preference changes; no filter is relaxed automatically.
- Preferences explain the combined filter behavior and distinguish dietary filters from optional meal goals.
- `npm run check` passes: 12 Jest suites / 68 tests, syntax validation, and Expo dependency compatibility.
- Independent review found the load-error classification defect; regression tests were added and the defect was fixed. A subsequent local source/diff verification pass passed. Known baseline warnings remain documented above.
