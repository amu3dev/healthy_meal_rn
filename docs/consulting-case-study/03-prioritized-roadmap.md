# 03 — Prioritized Roadmap

This is a focused product roadmap, not a generic backlog. Each item earns its place by improving the core decision job, creating useful learning, or making the consulting work inspectable.

## Prioritization lens

- **User value:** Does this make it easier or safer to choose a meal?
- **Consulting proof:** Does it demonstrate product judgment, architecture, implementation, or verification?
- **Cost:** Can it be delivered as a small, reviewable slice?
- **Technical risk:** Does it introduce a new state, data, or deployment boundary?
- **Learning value:** Will it reduce a material product uncertainty?

Ratings are qualitative planning judgments, not measured delivery estimates.

**Sequencing note:** The first product slice is item 1 because it addresses the core user decision. The smallest safe code fix is item 2: reconcile the branch-specific high-protein contract before merging or promoting that feature. The release-readiness concerns in item 4 are gates, not reasons to add infrastructure immediately.

| Priority | Improvement | User value | Proof value | Cost | Technical risk | Learning value |
|---|---|---:|---:|---:|---:|---:|
| 1 | Make the core decision loop explicit and safe | High | High | Medium | Medium | High |
| 2 | Unify recommendation/content semantics | High | High | Low/Medium | Low | Medium |
| 3 | Complete or deliberately remove Favorites | Medium | High | Low/Medium | Medium | High |
| 4 | Add a measurement and release-readiness gate | Medium | High | Medium | Medium | High |

## 1. Make the core decision loop explicit and safe

### Problem

The app starts with all filters off, hides preference setup behind a settings icon, and combines all enabled preferences with strict AND semantics. Some reasonable combinations produce no meal. The no-match state sends the user back to Preferences but does not explain the conflict or distinguish a hard restriction from a soft goal.

### Hypothesis

If the product makes first-run setup clearer, distinguishes hard exclusions from optional goals, and gives users an understandable recovery path, more sessions will reach a valid recipe decision without weakening safety-critical constraints.

### Proposed change

Deliver the smallest product contract that supports the hypothesis:

- Add a lightweight first-run prompt with **Set Preferences** and **Skip**.
- Re-label or group preferences into hard dietary exclusions and optional goals after validating the wording.
- Show the current match count or a plain-language explanation when no meals match.
- Offer a user-approved action to revise a goal; never auto-relax an allergy/intolerance constraint.
- Add a test matrix for representative hard/soft combinations.

Do not add accounts, a backend, or an AI ranking model.

### Why now

This is the core product risk. More catalog items or a richer Explore gallery will not fix an unclear constraint contract. It also creates the strongest bridge between product strategy and technical implementation.

### How to verify success

- Run five to eight structured usability sessions using common preference profiles.
- Measure recommendation match rate and no-match recovery rate.
- Observe whether users understand which choices are strict and which are goals.
- Add automated tests for hard constraints, soft-goal changes, and no-match messaging.
- Re-run the manual scenarios in the root README.

### Consulting capability demonstrated

Product framing, safety-aware prioritization, UX diagnosis, domain-boundary judgment, and translating a product hypothesis into a testable implementation slice.

## 2. Unify recommendation and content semantics

### Problem

The audited branch has two high-protein meanings: the saved `highProtein` tag and Explore’s numeric `20g+` filter. The Quinoa Buddha Bowl is a concrete mismatch: it has `20g` protein but `highProtein: false`. Macros and prep time are also stored as display strings, and content has no provenance or review state.

### Hypothesis

If matching, badges, tests, and copy use one canonical content contract, users will see more consistent recommendations and future content changes will be safer.

### Proposed change

- Choose one high-protein definition and make all consumers use it.
- Add a data-integrity test that fails when the tag and numeric definition disagree, or derive the tag from a canonical numeric value.
- Document the content review boundary: source, reviewer, review date, allergen notes, and image ownership.
- Normalize only the fields needed for an approved product use case; do not perform a speculative TypeScript or CMS migration.

### Why now

The inconsistency is already observable in the current branch, and every future catalog edit can multiply it. Fixing the contract is cheaper than building more recommendation behavior on top of it.

### How to verify success

- The same meal set is returned for the same high-protein concept across Home, Explore, badges, and tests.
- The catalog validation suite passes with zero semantic mismatches.
- A reviewer can identify the source/review state for each production-bound meal.
- A deliberate malformed meal fails validation rather than silently changing behavior.

### Consulting capability demonstrated

Product/technical contract design, data quality judgment, minimal schema evolution, and preventing semantic drift without overengineering.

## 3. Complete or deliberately remove Favorites

### Problem

The audited branch writes favorite IDs and lets a user toggle a favorite on Recipe Detail, but it provides no Saved Meals list or navigation entry. The user can express intent but cannot return to the saved item through the product.

### Hypothesis

If users can re-find a meal they considered useful, a saved action can become a meaningful return loop and a feedback signal. If they do not need that loop, removing the partial feature keeps the product coherent.

### Proposed change

After the first validation slice, choose one path:

- **Keep it:** add a minimal Saved Meals screen using the existing local storage contract, with a useful empty state, detail navigation by `mealId`, and persistence tests across navigation/reload.
- **Defer it:** remove the branch-only toggle and keep the roadmap decision documented until user evidence supports it.

Do not add social sharing, cloud sync, or a full meal planner in this slice.

### Why now

The partial feature is already present on the audited branch and is easy to overstate publicly. Making the keep/remove decision demonstrates scope discipline.

### How to verify success

- A saved meal is visible from a deliberate product entry point after leaving and reopening the detail screen.
- Removing it updates the list and storage without duplicate IDs.
- Users can explain why they would save a meal and what they expect to do with it.
- If deferred, the public build contains no orphaned favorite affordance.

### Consulting capability demonstrated

Feature coherence, user-loop design, persistence architecture, scope control, and honest public positioning.

## 4. Add a measurement and release-readiness gate

### Problem

The repository has strong technical checks but no product event vocabulary, usage evidence, build artifact, release configuration, or proof that the app can be distributed. The current tests pass, but the run emits warning noise.

### Hypothesis

If the team defines a small set of privacy-conscious product signals and a release acceptance gate, future work can be judged by evidence rather than feature volume.

### Proposed change

- Define events such as `recommendation_shown`, `recipe_opened`, `no_match`, `no_match_recovered`, `preference_saved`, and `useful_or_saved`.
- Implement only the smallest provider-neutral boundary needed for the chosen validation study; avoid sending personal or health data by default.
- Clean up the deliberate console noise and `act(...)` warning so green tests are quiet and diagnosable.
- Choose a distribution target, then add only the necessary app identifiers, build/preview configuration, artifact retention, and release documentation.
- Update the README and repository metadata so public claims match the verified commit.

### Why now

This is the bridge from portfolio-quality POC to credible production path. It should follow the product contract work, not precede it.

### How to verify success

- A documented validation run produces the defined events without PII.
- CI remains green and warning-free for expected test paths.
- A fresh checkout can produce the intended preview/installable artifact, or the repository explicitly states why it cannot yet.
- The website case study links to the same branch/commit whose tests and screenshots are cited.

### Consulting capability demonstrated

Measurement design, privacy judgment, delivery operations, release readiness, and evidence-based communication.

## Deliberately not prioritized

### Backend or CMS

Not justified while the catalog is small, local, and sufficient for validating the decision loop. Reconsider when content review, freshness, multi-device access, or non-engineering content ownership becomes a real bottleneck.

### AI recommendation engine

Not justified before the deterministic matcher is measured. A transparent rule system is easier to debug and explain, and the current product has no evidence that opaque ranking is the limiting problem.

### Weekly meal planning

Potentially valuable, but it changes the job from “choose one meal now” to “plan a week.” Validate the core decision loop before expanding the product surface.

### TypeScript migration

Potentially useful if the project grows, but not the highest-leverage first move. Normalize and enforce the fields that a validated product requirement actually needs.
