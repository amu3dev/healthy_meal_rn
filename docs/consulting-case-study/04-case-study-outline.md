# 04 — Consulting Case-Study Outline

## Working title

**Healthy Meal: turning a meal prototype into a decision-ready product**

## One-line story

I entered an existing Expo/React Native product, traced its real user and data flows, separated product problems from technical debt, preserved a useful local-first architecture, and defined the smallest evidence-based path from prototype to production readiness.

This is a case study about decisions and verification, not a feature tour.

## Recommended public narrative

### 1. Context

**Story:** Healthy Meal began as a small mobile app intended to surface a healthy meal suggestion. The consulting opportunity was to understand whether it could become a credible product without immediately adding a backend, AI, accounts, or infrastructure.

**Show:** Repository link, one short demo, and the problem framing: daily food decision fatigue plus dietary preferences.

**Evidence:** [`README.md`](../../README.md#L1-L17), [`App.js`](../../App.js#L15-L60), git history from initial Expo commit `93badd8` through the audited branch.

**Do not claim:** That the app already has product-market fit or production users.

### 2. Initial product state

**Story:** The current product is a local-first, four-screen flow: Home, Preferences, Explore, and Recipe Detail. It has a 25-meal bundled catalog, deterministic daily selection, strict preference matching, local persistence, and a remote-image fallback.

**Show:** Before/after screenshots or a short annotated flow: Home → Preferences → Home → Explore → Recipe Detail.

**Evidence:** [`data/meals.js`](../../data/meals.js), [`lib/mealUtils.js`](../../lib/mealUtils.js), [`hooks/usePreferences.js`](../../hooks/usePreferences.js), and the screenshots under `docs/screenshots/`.

### 3. Key problems found

**Story:** The most important gaps were product-shaped rather than cosmetic:

- “Personalized” was broader than the implemented behavior.
- Strict equal-weight filters could produce no match without explaining why.
- Dietary/nutrition content had no provenance or review boundary.
- The experiment branch had a partial favorite loop and high-protein semantic drift.
- Public README, branch state, and test claims were not aligned.
- Technical checks did not yet prove a release artifact or product outcome.

**Show:** A compact finding table with severity, evidence, impact, and action from [01 — Audit](./01-product-technical-audit.md).

### 4. Product decisions

**Story:** The product was framed as a preference-matched decision aid, not a clinical nutrition product or AI recommender. The daily pick remains the primary surface; Explore is optional. Hard dietary exclusions must not be silently relaxed. Backend and AI work were deliberately deferred until user evidence justified them.

**Show:** Product thesis, JTBD, decision rules, assumptions, risks, and proposed metrics from [02 — Product thesis](./02-product-thesis.md).

**Consulting point:** Saying “not yet” to an impressive technology is part of the work.

### 5. Architecture decisions

**Story:** The existing data → utility → hook → component → screen structure was retained because it was understandable and sufficient. The app uses deterministic selection, canonical `mealId` navigation, AsyncStorage for local preferences, shared `MealCard`/`MealImage` components, and explicit loading/empty/fallback states.

**Show:** A simple architecture diagram or annotated code links; do not present a future backend as if it exists.

**Evidence:** [`lib/mealUtils.js`](../../lib/mealUtils.js), [`hooks/usePreferences.js`](../../hooks/usePreferences.js), [`components/MealCard.js`](../../components/MealCard.js), [`components/MealImage.js`](../../components/MealImage.js), [`screens/RecipeDetailScreen.js`](../../screens/RecipeDetailScreen.js#L8-L12).

### 6. Implementation

**Story:** The repository history shows incremental, reviewable changes rather than a rewrite. Representative decisions include extracting preferences into a hook (`0a8ab83`), adding Explore (`31722e6`), introducing a shared MealCard (`1294ac4`), adding accessibility behavior (`a99a7c8`), and adding CI (`4ca2beb`). Favorites and high-protein filtering are branch-specific work on the audited branch and should be labeled accordingly.

**Show:** Three or four linked commits, not the entire commit history. Pair each commit with the problem it solved.

**Consulting point:** The value is the chain from problem → decision → diff, not the number of commits.

### 7. Testing and verification

**Story:** Verification covers pure logic, catalog invariants, persistence hooks, components, screen behavior, and one real AsyncStorage-to-Home integration seam. Local checks on the audited branch pass: syntax, Expo dependency compatibility, and 12 Jest suites / 59 tests.

**Show:** CI workflow, test names, one test that catches the storage-to-selection-to-render seam, and the manual scenarios in the root README.

**Be transparent:** The current run also emits a deliberate storage-error console message and a React `act(...)` warning. There are no device-level tests, release builds, or product analytics yet.

### 8. Results

Split results into two categories.

#### Verified technical results

- Four-screen navigation flow exists.
- Twenty-five meal records pass catalog integrity checks.
- Preferences persist locally.
- Daily selection is deterministic for a date and preference set.
- Image failure has a fallback path.
- Accessibility labels and loading semantics are present in key flows.
- The audited branch passes the local checks listed above.

#### Not yet measured

- Reduction in decision time.
- Recommendation usefulness.
- Retention or repeat use.
- No-match recovery.
- Cook intent or meal preparation.
- Production reliability on shipped builds.

This distinction is a central trust signal for the case study.

### 9. Lessons

- Product clarity is a higher-leverage next step than infrastructure when the core job is still unmeasured.
- Determinism is a strong POC choice when explainability matters.
- Tests should protect seams, not only isolated helpers.
- A stored feature is not a complete feature if the user cannot return to its value.
- Health-adjacent content requires a provenance and review boundary, even when the app is technically simple.
- AI is useful for bounded inspection and implementation, but product, safety, privacy, and public claims remain human decisions.

### 10. Next steps

Use the prioritized roadmap, in order:

1. Clarify hard/soft constraints, first-run setup, and no-match recovery.
2. Unify high-protein and content semantics.
3. Complete or remove Favorites based on evidence.
4. Add a small measurement vocabulary and release-readiness gate.

## Suggested website structure

A compact public page can use this sequence:

1. Hero: “From meal prototype to decision-ready product.”
2. Context and product question.
3. One visual of the current journey.
4. “What I found” with three high-leverage findings.
5. “What I decided not to build yet” with backend/AI examples.
6. Architecture and verification evidence.
7. Roadmap and explicit unknowns.
8. CTA: “Bring me an existing product and we can make the next decision testable.”

This fits the website’s existing positioning around decision, tradeoffs, next step, trustworthy AI, and 0→1 delivery better than a generic “React Native app built” description.

## Evidence checklist before publishing

- [ ] Public branch/commit matches every linked claim.
- [ ] README test count matches the actual checked commit.
- [ ] Screenshots come from the same product state described in the page.
- [ ] Technical test results are separated from user outcomes.
- [ ] No nutrition, allergen, licensing, or privacy claim is published without review.
- [ ] The page states that the app is a POC/early product if no real usage evidence exists.
- [ ] The roadmap shows what was intentionally deferred and why.
