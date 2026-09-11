# 01 — Product and Technical Audit

## Executive summary

Healthy Meal is a credible **early product POC**, not merely a generated Expo starter. The repository has a coherent daily-meal flow, local persistence, strict preference matching, an optional Explore gallery, canonical `mealId` navigation, resilient image rendering, accessibility labels, automated tests, an integration seam test, and GitHub Actions.

The main limitation is no longer basic code quality. It is product and production clarity:

1. The app has a useful daily-decision promise, but the promise is broader than the implemented personalization.
2. Preferences are modeled as equal boolean filters with strict AND semantics, even though allergies/intolerances and lifestyle goals have different user consequences.
3. Meal and nutrition content is inline and unprovenanced, while every image is a remote Unsplash URL.
4. The current branch contains a favorite toggle without a way to browse saved meals, and its high-protein semantics diverge from the existing preference tag.
5. The public repository story is behind the audited branch: the README says 10 suites / 41 tests and omits branch-specific files, while the current branch runs 12 suites / 59 tests.

The recommended first improvement is **not** a backend. It is to make the core recommendation contract trustworthy and measurable: define hard versus soft constraints, make no-match recovery explicit, unify the matching semantics, and validate the journey with a small usability study and instrumentable success criteria.

## Scope and evidence rules

This audit covers the local working tree at `experiment/hermes-goal-mode`, commit `4081a04`. Public `master` is `d139c0f`. The current branch is six commits ahead of `master` and includes favorites and high-protein Explore changes that are not yet in the public default branch.

Evidence categories:

- **Fact** — directly observed in source, tests, configuration, git history, or a tool run.
- **Interpretation** — a product or engineering conclusion drawn from those facts.
- **Assumption** — a statement that needs user research, content review, or production evidence.
- **Recommendation** — proposed action, not a claim that the action is already implemented.

Local verification performed on the audited branch:

- `npm run check:syntax` — passed.
- `CI=1 npm run check:expo` — dependencies reported up to date.
- `npm test -- --runInBand` — 12 suites and 59 tests passed.
- The passing Jest run emitted a deliberate `console.error` from the storage-failure test and a React `act(...)` warning in the recipe-detail test. No assertion failed.
- Public GitHub history showed successful CI runs on `master`; no run was listed for the inspected experiment branch.

## Current product experience

| Flow | Observed behavior | Evidence |
|---|---|---|
| Home | Starts with one daily meal. It reloads saved preferences on focus, selects a deterministic meal for the local date, shows a summary, and offers Explore or Preferences. | [`App.js`](../../App.js#L15-L60), [`screens/HomeScreen.js`](../../screens/HomeScreen.js#L20-L53), [`lib/mealUtils.js`](../../lib/mealUtils.js#L80-L91) |
| Preferences | Presents six switches and saves the selected boolean filters to AsyncStorage after an explicit Save action. | [`screens/PreferencesScreen.js`](../../screens/PreferencesScreen.js#L7-L70), [`hooks/usePreferences.js`](../../hooks/usePreferences.js#L14-L44) |
| Explore | Loads matching meals, shuffles the pool, supports swipe/Previous/Next/Shuffle Mix, and has a branch-specific `High Protein Only` toggle. | [`screens/ExploreScreen.js`](../../screens/ExploreScreen.js#L61-L127), [`screens/ExploreScreen.js`](../../screens/ExploreScreen.js#L170-L274) |
| Recipe detail | Resolves the canonical meal by `mealId`, displays nutrition, metadata, ingredients, and instructions, and on the audited branch exposes a favorite toggle. | [`screens/RecipeDetailScreen.js`](../../screens/RecipeDetailScreen.js#L8-L126), [`lib/mealUtils.js`](../../lib/mealUtils.js#L26-L34) |
| Data and assets | All 25 meals are bundled in one JavaScript module. Nutrition and metadata are presentation-shaped strings; all 25 image URLs point to Unsplash. | [`data/meals.js`](../../data/meals.js), [`lib/types.js`](../../lib/types.js#L23-L39) |

## Product findings

### P-1 — The implemented product is a preference-matched decision aid, not a broadly personalized nutrition product

- **Observation:** The home experience selects one deterministic meal from a filtered catalog. The selection key uses the local date and enabled preference keys; it does not use behavior, history, location, health profile, or feedback.
- **Evidence:** [`getDailyMeal`](../../lib/mealUtils.js#L80-L91); the README describes a deterministic daily meal in [`README.md`](../../README.md#L1-L17).
- **Severity:** Medium — product clarity.
- **Product impact:** “Personalized” can create expectations the app does not meet. A narrower promise is more credible and easier to validate.
- **Technical impact:** A future AI or recommendation service would be solving an undefined problem if the current decision job is not measured first.
- **Recommended action:** Use “preference-matched daily meal suggestion” or “decision aid” as the POC language. Reserve “personalized recommendation” for a later version with evidence of meaningful personalization.

### P-2 — Strict equal-weight filters create predictable no-match dead ends

- **Observation:** Enabled preferences are combined with `every(...)`; vegetarian, vegan, gluten-free, dairy-free, low-carb, and high-protein are all treated as boolean constraints. The UI has a no-match card that sends the user to Preferences, but it does not explain which constraint caused the conflict or offer a safe recovery path.
- **Evidence:** [`getMatchingMeals`](../../lib/mealUtils.js#L58-L72), [`DEFAULT_PREFERENCES`](../../lib/preferences.js#L6-L14), and the documented no-match scenario in [`README.md`](../../README.md#L217-L229). The catalog contains zero matches for several strict combinations, including vegan + gluten-free + low-carb.
- **Severity:** High for product trust; Medium for the POC.
- **Product impact:** Users can make a reasonable-looking selection and receive no answer. Treating an allergy constraint the same as a preference goal risks an unsafe or confusing future product.
- **Technical impact:** The current boolean model cannot express hard exclusions, soft goals, priority, or explainable relaxation without a contract change.
- **Recommended action:** Separate hard dietary exclusions from optional goals. Preserve hard exclusions, show the match count or conflict explanation, and offer a user-approved way to relax a goal. Never silently relax an allergy or intolerance constraint.

### P-3 — Content trust is not yet production-ready

- **Observation:** Meal names, nutrition values, tags, ingredients, and instructions are authored inline without source, reviewer, last-reviewed date, allergen evidence, or content version. Remote Unsplash images are used as product content.
- **Evidence:** [`data/meals.js`](../../data/meals.js#L1-L38) and the repeated `images.unsplash.com` URLs; there are no provenance fields in [`lib/types.js`](../../lib/types.js#L23-L39).
- **Severity:** High for any health-adjacent production claim; Low/Medium for a clearly labeled demo.
- **Product impact:** Users may interpret nutrition and dietary labels as authoritative. Incorrect or stale content undermines trust even if the UI is polished.
- **Technical impact:** There is no content ownership or review boundary, and asset availability/licensing is external to the release process.
- **Recommended action:** Before production positioning, define a content contract: source/reviewer, review date, allergen notes, nutrition confidence, image ownership, and a clear non-clinical disclaimer. Keep the local dataset until real content operations justify a CMS.

### P-4 — Favorites is a partial branch feature, not yet a complete user loop

- **Observation:** The audited branch persists favorite IDs and exposes a favorite toggle on Recipe Detail, but there is no Favorites screen, list, navigation entry, or Home surface for returning to saved meals.
- **Evidence:** [`hooks/useFavorites.js`](../../hooks/useFavorites.js), [`screens/RecipeDetailScreen.js`](../../screens/RecipeDetailScreen.js#L32-L59), and the four-screen navigator in [`App.js`](../../App.js#L31-L58). The feature is absent from public `master`.
- **Severity:** Medium — branch-specific product coherence issue.
- **Product impact:** A user can express intent but cannot reliably act on it later. The app stores a signal without closing the loop.
- **Technical impact:** Storage and tests exist, but the read model and navigation contract for a saved collection do not.
- **Recommended action:** Either remove/defer the toggle until user research supports it, or complete the smallest useful Saved Meals surface with an empty state, persisted re-entry, and tests. Do not present the toggle as a finished capability in the public case study before that decision.

### P-5 — First-run setup is available but not discoverable as a product step

- **Observation:** Home is the initial route and starts with all preferences disabled, while preference setup is behind a settings icon. There is no first-run explanation or explicit “set your dietary constraints” step.
- **Evidence:** [`App.js`](../../App.js#L15-L21), [`DEFAULT_PREFERENCES`](../../lib/preferences.js#L6-L14), and the Home settings action [`screens/HomeScreen.js`](../../screens/HomeScreen.js#L74-L84).
- **Severity:** Medium.
- **Product impact:** The first recommendation may feel generic, and a user may not understand why preferences matter.
- **Technical impact:** No new platform capability is required; this is primarily an information-architecture and copy decision.
- **Recommended action:** Add a lightweight first-run prompt with Skip and Set Preferences, or make the existing Home summary explicitly invite setup. Do not add authentication just to solve this.

### P-6 — High-protein semantics diverge on the audited branch

- **Observation:** The Preferences screen filters on the `highProtein` tag, while Explore’s branch-specific `High Protein Only` filter uses a numeric `20g+` threshold. Meal 1 has `20g` protein but `highProtein: false`, so the two concepts do not produce the same pool. The card badge also uses the numeric threshold.
- **Evidence:** [`lib/mealUtils.js`](../../lib/mealUtils.js#L8-L20) and [`lib/mealUtils.js`](../../lib/mealUtils.js#L58-L72); the Quinoa Buddha Bowl record in [`data/meals.js`](../../data/meals.js#L3-L37); the branch implementation in [`screens/ExploreScreen.js`](../../screens/ExploreScreen.js#L170-L187).
- **Severity:** Medium — branch-specific semantic drift.
- **Product impact:** A user can see a “High Protein” badge on a meal that the saved High Protein preference excludes.
- **Technical impact:** Two sources of truth can drift as the catalog changes.
- **Recommended action:** Choose one contract. Prefer deriving the badge and filter from a numeric protein value, or make the tag authoritative and remove the duplicate threshold concept. Add a consistency test for every meal.

## Engineering findings

### E-1 — The current layering is a strength at this scale

- **Observation:** Static data, pure utilities, persistence hooks, reusable components, and screens have clear boundaries.
- **Evidence:** `data/`, `lib/`, `hooks/`, `components/`, and `screens/`; `MealCard` and `MealImage` are reused by Home and Explore.
- **Severity:** Low / positive finding.
- **Product impact:** The POC can evolve without immediately requiring a backend or state-management framework.
- **Technical impact:** The structure is understandable and testable. A provider, API client, or state library would be premature today.
- **Recommended action:** Preserve this shape. Add abstractions only when a third consumer or a real integration boundary appears.

### E-2 — Persistence is resilient but has no shared source of truth or schema version

- **Observation:** Home and Explore create their own preference-hook instances and re-read AsyncStorage on focus. Storage keys are raw strings and saved values are normalized by truthiness. Load failures fall back to defaults and log to the console.
- **Evidence:** [`hooks/usePreferences.js`](../../hooks/usePreferences.js#L9-L57), [`lib/preferences.js`](../../lib/preferences.js#L1-L40), and Home/Explore focus effects.
- **Severity:** Medium.
- **Product impact:** The current flows work, but more consumers or background updates could make navigation focus part of correctness.
- **Technical impact:** There is no versioned migration path, typed validation, or centralized update notification. A stored string such as `'false'` becomes truthy under `Boolean(...)`.
- **Recommended action:** Keep the hook-per-screen pattern for the current scope. Add a provider only when a third consumer or non-navigation sync exists; then introduce a small versioned storage contract and explicit value validation.

### E-3 — The data model is optimized for display, not future filtering or content operations

- **Observation:** Macros and prep time are strings such as `42g` and `30 min`; JSDoc documents shapes but does not enforce them at compile time.
- **Evidence:** [`lib/types.js`](../../lib/types.js#L23-L39), [`data/meals.js`](../../data/meals.js#L3-L15), and parsing logic in [`__tests__/mealsData.test.js`](../../__tests__/mealsData.test.js#L1-L56).
- **Severity:** Medium when the product expands; Low for the current POC.
- **Product impact:** Numeric sorting, range filters, nutrition comparisons, and trustworthy content review become harder.
- **Technical impact:** Consumers parse presentation values back into numbers, and a future API would need a normalization boundary.
- **Recommended action:** Do not migrate to TypeScript or a backend solely for architecture theater. Normalize the first field only when a real numeric use case is approved, and keep display formatting at the UI boundary.

### E-4 — Automated confidence is solid but not yet release confidence

- **Observation:** The branch has 12 suites / 59 passing tests covering pure logic, catalog invariants, hooks, components, screens, and one Home integration seam. There are no device-level or end-to-end tests, no real navigation-container smoke test, and no coverage threshold.
- **Evidence:** `__tests__/`; [`__tests__/HomeScreen.integration.test.js`](../../__tests__/HomeScreen.integration.test.js#L27-L68); [`jest.config.js`](../../jest.config.js#L1-L10).
- **Severity:** Medium.
- **Product impact:** Core logic is protected, but device-specific accessibility, layout, image loading, and release behavior remain unverified.
- **Technical impact:** Green unit tests can coexist with an Expo/native integration regression.
- **Recommended action:** Keep the current test pyramid. Add one small device/simulator smoke path only when a real distribution target exists; do not add a heavy E2E framework before that decision.

### E-5 — CI validates repository integrity but not production delivery

- **Observation:** GitHub Actions installs dependencies and runs `npm run check` on pushes to `master` and all pull requests. The check covers syntax, Expo dependency compatibility, and Jest. It does not lint, type-check, enforce coverage, build an app, upload artifacts, or verify a release configuration.
- **Evidence:** [`.github/workflows/ci.yml`](../../.github/workflows/ci.yml#L1-L27) and [`package.json`](../../package.json#L6-L14).
- **Severity:** High for production readiness; Low/Medium for the current POC.
- **Product impact:** There is no repeatable evidence that a tested commit can become an installable release.
- **Technical impact:** Native build configuration, identifiers, signing, versioning, and store metadata are outside the quality gate.
- **Recommended action:** First choose the intended release target. Then add the smallest appropriate build/preview gate, app identifiers, versioning, and artifact retention. Avoid adding EAS or a release service before the product decision requires distribution.

### E-6 — Observability is absent, so learning and failure diagnosis are manual

- **Observation:** The app logs storage/image/loading errors to the console but records no recommendation availability, no-match recovery, recipe-open, save, or image-failure events.
- **Evidence:** `console.error` calls in [`screens/HomeScreen.js`](../../screens/HomeScreen.js#L34-L40), [`screens/ExploreScreen.js`](../../screens/ExploreScreen.js#L95-L103), and [`hooks/useFavorites.js`](../../hooks/useFavorites.js#L76-L82); no analytics dependency or event boundary in `package.json`.
- **Severity:** Medium.
- **Product impact:** There is no evidence that the daily recommendation is useful or that users recover from no-match states.
- **Technical impact:** Production incidents and product learning depend on reproduction and manual inspection.
- **Recommended action:** Define the event vocabulary first. Add a privacy-respecting, provider-neutral event boundary only after user research confirms which signals matter; do not add a remote analytics backend by default.

### E-7 — Remote images and static content are appropriate for the POC but a production dependency

- **Observation:** Images are loaded remotely with caching and a graceful fallback. The catalog is bundled locally, so the main recommendation path is local-first, but visual quality and image availability depend on external URLs.
- **Evidence:** [`components/MealImage.js`](../../components/MealImage.js#L37-L68), the 25 Unsplash URLs in [`data/meals.js`](../../data/meals.js), and the manual broken-image scenario in [`README.md`](../../README.md#L217-L229).
- **Severity:** Medium for production; Low for a demo.
- **Product impact:** A broken or mismatched image can reduce trust in a recipe even when the fallback prevents a crash.
- **Technical impact:** No ownership, cache invalidation, licensing record, or asset health check is present.
- **Recommended action:** Keep the fallback. Before release, choose owned/bundled/licensed assets and add an asset/content review step rather than building a media platform.

### E-8 — Branch-specific Favorites persistence can overwrite data after a load failure

- **Observation:** Each `useFavorites` instance owns a private in-memory favorite-ID snapshot. If the initial AsyncStorage read fails, the hook resets that snapshot to an empty array, marks loading complete, and still permits a toggle. The next successful write can therefore replace previously stored IDs with only the current meal.
- **Evidence:** [`hooks/useFavorites.js`](../../hooks/useFavorites.js#L21-L58) resets state after a read error; [`hooks/useFavorites.js`](../../hooks/useFavorites.js#L60-L85) builds later writes from that snapshot. The branch has no Favorites list route in [`App.js`](../../App.js#L31-L59).
- **Severity:** High for the audited branch; branch-specific.
- **Product impact:** A user can lose saved intent without a visible recovery path, and the save action still lacks a way to retrieve the collection.
- **Technical impact:** Error recovery and read-modify-write ownership are not safe for a shared persisted collection. Multiple hook instances can also hold stale snapshots.
- **Recommended action:** Block writes until hydration succeeds, expose a recoverable load error, and use one serialized storage owner before treating Favorites as durable. Complete the smallest Saved Meals surface or remove the partial feature.

### E-9 — Async preference loads can commit stale results

- **Observation:** Home and Explore await AsyncStorage before updating meal/status state, but do not use a request sequence, cancellation, or mounted guard around the state commit. Explore reloads when its callback changes, including when the branch-specific protein filter changes.
- **Evidence:** [`screens/HomeScreen.js`](../../screens/HomeScreen.js#L18-L53), [`screens/ExploreScreen.js`](../../screens/ExploreScreen.js#L61-L113), and the dependency on `highProteinOnly` in the Explore callback.
- **Severity:** Medium; identified by code inspection, not by a reproduced production incident.
- **Product impact:** Rapid navigation or filter changes could show cards and status text derived from different preference snapshots.
- **Technical impact:** Older asynchronous work can overwrite newer state, and there is no regression test for out-of-order completions.
- **Recommended action:** Add a small latest-request guard at the shared load boundary and one deferred-promise test for out-of-order completion. Avoid introducing a data-fetching framework for local AsyncStorage.

### E-10 — Primary green controls fail the normal-text contrast threshold

- **Observation:** The theme uses `#4CAF50` with white text for the navigation header, primary buttons, and active favorite state. The calculated contrast ratio is 2.78:1, below WCAG 2.2 thresholds for normal text and large text.
- **Evidence:** [`lib/theme.js`](../../lib/theme.js#L1-L8); the color is used by the primary controls in [`App.js`](../../App.js#L22-L26), [`screens/HomeScreen.js`](../../screens/HomeScreen.js#L213-L231), and [`screens/RecipeDetailScreen.js`](../../screens/RecipeDetailScreen.js#L153-L160). Local calculation: 2.78:1.
- **Severity:** High for accessibility and production readiness; Low impact on the current POC’s functional flow.
- **Product impact:** Some users may have difficulty reading primary labels or distinguishing active controls.
- **Technical impact:** Semantic labels are present, but the visual token system has no contrast assertion.
- **Recommended action:** Darken the green or select a sufficiently dark foreground, then add a small automated contrast check for the theme tokens and repeat a device accessibility pass.

### E-11 — The documented web path is not runnable from a clean install

- **Observation:** `npm run web` is documented and Expo configuration includes web support, but the project does not install the required web packages. A fresh local export fails before bundling.
- **Evidence:** [`package.json`](../../package.json#L6-L14), [`app.json`](../../app.json#L20-L29), and local verification: `npm ls react-dom react-native-web @expo/metro-runtime --depth=0` returned an empty dependency set; `CI=1 npx expo export --platform web --output-dir /tmp/healthy-meal-web-export` exited 1 and requested `react-dom@18.3.1`, `react-native-web@~0.19.13`, and `@expo/metro-runtime@~4.0.1`.
- **Severity:** Medium for delivery accuracy; Low if native-only distribution is the actual decision.
- **Product impact:** A visitor or collaborator following the documented web command cannot run the advertised platform.
- **Technical impact:** The repository has an inconsistent platform contract.
- **Recommended action:** Either install and lock the Expo-compatible web dependencies and verify export in CI, or remove web from the supported-platform documentation and configuration.

### E-12 — Dependency security requires triage before production release

- **Observation:** `npm audit --omit=dev` exits non-zero with 54 reported vulnerabilities: 3 low, 24 moderate, 24 high, and 3 critical. Several suggested fixes require major Expo, React Native, or CLI changes.
- **Evidence:** Local `npm audit --omit=dev --audit-level=low` output on the audited branch; the report includes transitive Expo, Metro, React Native CLI, XML, tar, and shell-quote paths.
- **Severity:** High for production readiness; not a reason to run a blind force-upgrade on the POC.
- **Product impact:** Security uncertainty limits credible claims about a production-ready release.
- **Technical impact:** The dependency tree needs reachability and compatibility review; `npm audit fix --force` could change framework majors and destabilize the app.
- **Recommended action:** Triage advisories by shipped/runtime reachability, upgrade within the supported Expo SDK boundary, rerun the full check, and establish a recurring dependency-update policy. Do not apply `--force` without a separate upgrade decision.

## Delivery findings

### D-1 — The repository has a useful incremental build trail, but the trail is not yet curated for an external reader

- **Observation:** Git history contains 128 commits in the audited branch, including focused changes for persistence, data validation, shared components, accessibility, Explore, tests, CI, favorites, and high-protein filtering.
- **Evidence:** `git log --oneline --all`; representative commits include `0a8ab83` (preferences hook), `31722e6` (Explore), `1294ac4` (MealCard), `a99a7c8` (accessibility), `4ca2beb` (CI), and `ebe0835` / `50d3635` (branch-specific work).
- **Severity:** Medium — consulting proof opportunity.
- **Product impact:** A visitor can see activity, but not necessarily the decision logic behind it.
- **Technical impact:** Commit history is evidence, but without curated decision records it is hard to distinguish deliberate scope from churn.
- **Recommended action:** Use this directory as a curated narrative. Link a small number of commits to decisions; do not publish every internal review note as if it were a product outcome.

### D-2 — Public `master`, the audited branch, and the README do not describe the same product

- **Observation:** Public `master` is `d139c0f`; the audited branch is `4081a04` six commits ahead. The current README still says 10 suites / 41 tests, omits `useFavorites.js`, and does not describe the branch-specific high-protein work. GitHub’s public repository page also has no description, website, or topics.
- **Severity:** High for public credibility.
- **Product impact:** A prospect following the website link may see a different feature set and test count from the case study.
- **Technical impact:** The source of truth for “shipped” versus “experimental” is unclear.
- **Recommended action:** Decide what is public. Merge only intentionally accepted work, update README and repository metadata, and link the website to a commit or release that matches the case-study claims. Keep experiments labeled as experiments.

### D-3 — There are no verified product outcomes yet

- **Observation:** The repository proves implementation and test activity but contains no user study, analytics, experiment, retention, task-completion, or business result.
- **Severity:** High for case-study claims; not a code defect.
- **Product impact:** A polished demo can show capability but cannot yet prove that the product reduces decision fatigue.
- **Technical impact:** Metric names and event boundaries are not validated against real behavior.
- **Recommended action:** Run a small structured usability study around the core journey. Record participant task completion, no-match recovery, perceived usefulness, and observed friction. Keep findings separate from technical test results.

### D-4 — AI-assisted delivery should be made inspectable, not marketed as maximum automation

- **Observation:** The repository has strong material for a bounded AI workflow—small modules, tests, manual scenarios, and focused commits—but no public handoff contract or human approval policy.
- **Severity:** Medium — consulting proof opportunity.
- **Product impact:** “AI-assisted” is credible only if it improves evidence quality and decision speed without weakening product judgment.
- **Technical impact:** Unbounded agents could add dependencies, alter scope, or make health/content claims without review.
- **Recommended action:** Use the four-role workflow in [05 — AI-assisted delivery model](./05-ai-assisted-delivery-model.md). Require linked evidence, acceptance criteria, a green baseline, and human approval for product, safety, privacy, public-claim, merge, and release decisions.

## Existing strengths to preserve

- Clear distinction between the daily recommendation and optional Explore flow.
- Deterministic selection that is explainable and easy to test.
- Canonical `mealId` navigation instead of passing full objects between screens.
- Reusable `MealCard` and `MealImage` components.
- Explicit loading, empty, error/fallback, and accessibility semantics.
- Data integrity tests for IDs, images, required fields, and tag invariants.
- A real AsyncStorage-to-Home integration seam test.
- A small dependency set and no premature backend, AI, or state-management framework.

## Top five findings

1. **Define the product contract:** describe the app as a preference-matched decision aid, not a broad personalized nutrition system.
2. **Make constraints safe and actionable:** distinguish hard exclusions from soft goals and explain/recover from no-match states.
3. **Establish content trust:** provenance, review ownership, allergen/nutrition boundaries, and image ownership are required before production claims.
4. **Align public evidence:** reconcile the experiment branch, `master`, README, test counts, and case-study claims.
5. **Create a measurable feedback loop:** validate recipe usefulness and no-match recovery before adding infrastructure or AI.

## Recommended first improvement

Run a short product-validation slice before adding a backend:

1. Write the hard/soft preference contract.
2. Make first-run setup discoverable.
3. Make no-match states explain the conflict and offer user-approved recovery.
4. Unify high-protein semantics.
5. Test the flow with a small set of representative users and record the results.

This is the highest-leverage combination of product judgment, trustworthy technical design, and learning value.
