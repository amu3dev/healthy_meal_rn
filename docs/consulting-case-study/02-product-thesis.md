# 02 — Product Thesis

## Thesis

**Healthy Meal is a local-first decision aid for people who want one credible, preference-matched healthy meal idea without spending time deciding what to cook.**

The product should reduce decision fatigue first. It should not present itself as a clinical nutrition service, a full meal planner, or an AI recommender until the product has evidence that those jobs matter.

## Target user

### Primary target user — hypothesis

A health-conscious person who:

- makes a recurring meal decision under time or attention pressure;
- has stable dietary constraints or goals;
- prefers a useful starting point over a large recipe catalog;
- wants enough recipe detail to decide whether to cook the meal;
- is willing to set preferences once and use the app locally.

This is a working hypothesis, not a measured user segment. The repository contains no interviews, analytics, or usage data.

### Out of scope for the initial thesis

- Clinical dietary advice or medical nutrition planning.
- Allergy guarantees without reviewed content and an explicit safety process.
- Household grocery planning, inventory management, and multi-person planning.
- A general-purpose recipe marketplace.
- AI-generated nutrition or recipe claims.

## Primary problem

People who want to eat healthily can spend more effort deciding what fits their constraints than preparing the meal. A large catalog can increase choice overload. Healthy Meal should make the first useful decision quickly while preserving optional exploration for users who want alternatives.

## Job To Be Done

> When I need a healthy meal idea and have dietary constraints, help me choose one plausible meal quickly, explain why it fits, and let me inspect the recipe without making me search through an overwhelming catalog.

## Product promise

> Open Healthy Meal and get one preference-matched meal to consider today, with enough nutrition and recipe detail to decide what to do next.

The promise has three important boundaries:

1. **One useful recommendation:** the home screen is a decision surface, not a catalog wall.
2. **Preference matched:** the current implementation uses explicit boolean filters and deterministic selection; it does not learn from behavior.
3. **To consider:** the app helps a user decide; it does not guarantee medical suitability, nutrition accuracy, or that the user will cook the meal.

## Main user journey

1. **Open:** Home presents one daily meal.
2. **Orient:** The user sees the recommendation summary and understands whether preferences are active.
3. **Set constraints:** The user can open Preferences, distinguish hard dietary exclusions from optional goals, and save them.
4. **Receive a match:** Home reloads the saved preferences and presents a deterministic daily pick.
5. **Inspect:** The user opens Recipe Detail to review nutrition, time, difficulty, ingredients, and instructions.
6. **Choose next action:** The user decides to cook, save, reject, or explore another option.
7. **Return:** The next visit preserves the preference contract and offers a new daily context without requiring another search.

The current repository implements steps 1, 2, 3, 4, 5, and optional exploration. Steps 6 and 7 are not yet measured, and the audited branch’s favorite toggle does not yet provide a saved-meals return surface.

## Key assumptions

| ID | Assumption | How to learn |
|---|---|---|
| A1 | One strong starting recommendation reduces decision effort better than showing many options. | Compare a single-pick flow with a small gallery in usability sessions. |
| A2 | Users can express their dietary needs as a small number of understandable constraints. | Observe preference setup; record confusion and requested categories. |
| A3 | The local catalog usually contains at least one acceptable match for a user’s chosen hard constraints. | Measure match availability across representative preference profiles. |
| A4 | Users value recipe detail after seeing a recommendation. | Measure detail opens and ask whether the content was sufficient to decide. |
| A5 | Local-first storage is acceptable for the POC and early validation. | Ask whether users expect cross-device sync, accounts, or content freshness. |
| A6 | The meal content is trustworthy enough for a demo but not yet for health-adjacent production claims. | Review source, nutrition, allergen, and image provenance with an appropriate expert. |
| A7 | A saved or “useful” action would create a meaningful feedback loop. | Test a minimal feedback action before building a full favorites/planning system. |

## Biggest product risks

### R1 — Constraint ambiguity and unsafe relaxation

The current model treats all preferences as equal booleans. A future “relax filters” action must not weaken an allergy or intolerance constraint silently. The product needs a clear hard/soft contract before it expands its matching behavior.

### R2 — Content credibility

Nutrition values, tags, ingredients, and instructions are local data with no visible provenance or review state. “Healthy” is a trust-bearing claim. A polished interface cannot compensate for unreviewed content.

### R3 — Recommendation usefulness is unmeasured

The app can prove that a meal was selected and displayed. It cannot yet prove that the meal was useful, prepared, saved, or preferable to searching elsewhere.

### R4 — Feature drift

Explore, high-protein filtering, and the branch-specific favorite toggle can pull the product toward a catalog or meal-planning app. Each feature should be judged against the one-decision promise.

### R5 — Content and asset freshness

The current local dataset and remote images are enough for a POC. They do not establish an operating model for review, replacement, licensing, or updates.

## Proposed North Star metric

### Weekly validated meal decisions per active user — proposed, not measured

Count a validated decision when an active user receives a matching recommendation, opens its recipe detail, and completes an explicit usefulness action such as **Save**, **Useful**, or **I would cook this**.

This is intentionally stronger than “screen viewed.” It connects the product promise to a user decision while making the required instrumentation and feedback action explicit. Until that action exists, the repository must not claim this metric has been achieved.

## Supporting metrics

1. **Recommendation match rate** — recommendation attempts that produce at least one eligible meal.
2. **Preference setup completion** — users who save preferences after opening the setup flow.
3. **Recipe-detail open rate** — matching recommendations that lead to detail inspection.
4. **No-match recovery rate** — no-match sessions that reach a valid match after an explicit user-approved change.
5. **Validated usefulness rate** — recommendations receiving a positive usefulness/save/cook-intent action.

These metrics should be privacy-conscious and proportionate to the POC. A local event log or provider-neutral event interface is enough to validate the event vocabulary before introducing a remote analytics system.

## Product decision rules

- Prefer a deterministic, explainable rule over an opaque recommender until real recommendation-quality evidence justifies more complexity.
- Do not call the experience personalized when it only applies explicit filters.
- Treat hard dietary exclusions differently from soft goals.
- Keep the daily pick and Explore gallery conceptually separate.
- Do not add a backend or CMS until content freshness, multi-device access, or operational ownership becomes a validated problem.
- Do not add AI to generate nutrition, allergen, or health claims.
- Every new feature must state the user problem, hypothesis, validation method, and consulting capability it demonstrates.
