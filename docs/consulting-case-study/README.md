# Healthy Meal — Consulting Case Study

Healthy Meal is being used as a **living product case study**, not as a feature backlog. It shows how an existing mobile prototype can be taken through diagnosis, product framing, prioritization, architecture, implementation, verification, and production-readiness planning.

The consulting question is:

> How do we turn a small meal-recommendation prototype into a credible, testable product without adding infrastructure or AI before the product problem justifies it?

## Audit scope

This audit covers the local working tree at:

- Repository: `github.com/amu3dev/healthy_meal_rn`
- Audited branch: `experiment/hermes-goal-mode`
- Audited commit: `4081a04`
- Public default branch at inspection: `master` / `d139c0f`

The audited branch is six commits ahead of public `master`. It contains branch-specific favorites and Explore high-protein work that is **not yet part of the public default-branch story**. Public case-study claims should reference those changes only after they are intentionally merged and verified.

No application code was changed during the audit. The files in this directory are the requested consulting artifacts.

## Current evidence snapshot

Facts observed in the repository and local verification:

- Expo + React Native app with four navigable screens: Home, Preferences, Explore, and Recipe Detail.
- Local catalog of 25 meals in [`data/meals.js`](../../data/meals.js).
- Deterministic daily selection and strict preference matching in [`lib/mealUtils.js`](../../lib/mealUtils.js).
- Local preference persistence through AsyncStorage in [`hooks/usePreferences.js`](../../hooks/usePreferences.js).
- Branch-specific favorite persistence through [`hooks/useFavorites.js`](../../hooks/useFavorites.js).
- Shared meal-card and image abstractions in [`components/MealCard.js`](../../components/MealCard.js) and [`components/MealImage.js`](../../components/MealImage.js).
- Automated checks: syntax validation, Expo dependency compatibility, Jest tests, and a GitHub Actions workflow in [`.github/workflows/ci.yml`](../../.github/workflows/ci.yml).
- Local verification on the audited branch: syntax check passed, Expo dependency check reported dependencies up to date, and Jest passed **12 suites / 59 tests**.
- Product Experiment #1 preserves the local-first flow while making no-match states explain their active selections, separating load errors from valid empty results, and aligning High Protein to a tested `20g+` rule.
- Post-implementation verification: syntax check passed, Expo dependency check reported dependencies up to date, and Jest passed **12 suites / 68 tests**.
- The passing Jest run still emitted a deliberate persistence-error `console.error` and a React `act(...)` warning. These are quality signals to clean up, not failed assertions.
- Release-readiness checks are not clean: the documented web export fails because `react-dom`, `react-native-web`, and `@expo/metro-runtime` are absent; `npm audit --omit=dev` reports 54 vulnerabilities (3 low, 24 moderate, 24 high, 3 critical); and the primary `#4CAF50`/white color pair has a calculated contrast ratio of 2.78:1.
- No usage analytics, user study, experiment result, release build, or store deployment evidence is present. This case study must not claim business or user outcomes that the repository cannot prove.

## The transformation story

1. **Prototype** — start with a small Expo app and static meal data.
2. **Diagnosis** — inspect the real user flow, state boundaries, content model, tests, CI, and release gaps.
3. **Product strategy** — define Healthy Meal as a local-first decision aid for reducing daily food decision fatigue, not as a clinical nutrition product or an AI recommender.
4. **Prioritization** — select a small number of improvements tied to user value, learning, and consulting proof.
5. **Architecture** — preserve the existing data → utility → hook → component → screen structure; add infrastructure only when a validated need appears.
6. **Implementation** — use small, reviewable changes such as canonical `mealId` navigation, deterministic selection, resilient image rendering, and tested persistence.
7. **Verification** — combine unit tests, screen tests, an integration seam test, syntax checks, dependency checks, CI, and manual scenarios.
8. **Production readiness** — make content trust, measurement, release configuration, and public claims explicit before calling the app production-ready.

## Artifacts

| Artifact | Purpose |
|---|---|
| [01 — Product and technical audit](./01-product-technical-audit.md) | Evidence-based diagnosis across Product, Engineering, and Delivery. |
| [02 — Product thesis](./02-product-thesis.md) | Target user, problem, JTBD, promise, journey, assumptions, risks, and metrics. |
| [03 — Prioritized roadmap](./03-prioritized-roadmap.md) | Four focused improvements with hypotheses, verification, and consulting value. |
| [04 — Case-study outline](./04-case-study-outline.md) | Website-ready narrative and evidence plan from context to next steps. |
| [05 — AI-assisted delivery model](./05-ai-assisted-delivery-model.md) | Small Scout/Analyst → Product → Developer → Reviewer workflow with human gates. |
| [06 — Product Experiment #1](./06-product-experiment-1-implementation-brief.md) | Bounded implementation brief and verified evidence for recoverable preference matching. |

## How this supports the consulting website

Position Healthy Meal as a build trail that makes the way of working inspectable:

- **Context:** an existing mobile prototype with a useful but narrow job.
- **Judgment:** clarify the product promise, keep the daily recommendation deterministic, and avoid premature backend or AI work.
- **Technical depth:** show the data flow, persistence boundary, navigation contract, tests, CI, and production gaps.
- **Delivery discipline:** show how findings became hypotheses, acceptance criteria, small changes, and verification.
- **Trust:** distinguish verified repository facts from assumptions and future recommendations.

A public case-study page should link to this directory, the public repository, selected source files, screenshots, and CI evidence. It should describe technical results that are verified today and label user or business outcomes as future measurement until actual research exists.

## Public versus internal evidence

### Show publicly

- The product thesis and the problem being solved.
- Before/after screenshots or a short demo of the core journey.
- The architecture boundary and why local-first was appropriate for the POC.
- Selected examples of deterministic recommendation logic, persistence, accessibility, tests, and CI.
- The prioritized roadmap and the tradeoffs behind what was deliberately not built.
- Verified check results and a clear statement that usage outcomes are not yet measured.

### Keep internal unless deliberately sanitized

- Raw agent transcripts and prompts.
- Unverified reviewer claims or synthetic user results.
- Personal data from usability sessions.
- Credentials, tokens, private deployment details, and internal contact information.
- Content licensing or nutrition-review material that is not ready for public release.

## Current recommendation

Do not lead with a backend, an AI recommender, or a large feature expansion. Product Experiment #1 now makes the core decision loop more explicit and trustworthy; the next recommendation is to validate the no-match journey with a small human usability test before expanding scope. That produces stronger consulting evidence than adding infrastructure without user evidence.
