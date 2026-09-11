# 05 — AI-Assisted Delivery Model

## Purpose

Healthy Meal should demonstrate a practical AI-assisted delivery model, not maximum agent count. The goal is to make delivery faster **without hiding product judgment, safety decisions, or verification behind an agent claim**.

The recommended workflow is a small four-role loop:

> **Scout / Analyst → Product → Developer → Reviewer → Human approval**

An agent can perform more than one role on a small task, but the responsibilities and handoff artifacts must remain separate.

## Role definitions

| Role | Responsibility | Expected input | Expected output |
|---|---|---|---|
| Scout / Analyst | Inspect the existing product and establish facts before proposing changes. | Repository, current branch/commit, task goal, existing checks. | Evidence ledger: flow map, relevant files, test/CI state, findings, assumptions, unanswered questions. No code edits. |
| Product | Decide which problem is worth solving and how success will be learned. | Scout evidence, product thesis, user/context constraints. | Decision brief: problem, hypothesis, target user, priority, acceptance criteria, metric, out of scope, human approvals needed. |
| Developer | Implement the smallest approved change and its verification. | Approved decision brief, current baseline, repository conventions. | Small diff, tests, updated docs/screenshots where needed, run output, known limitations. |
| Reviewer | Challenge the change against product, technical, accessibility, privacy, and delivery gates. | Decision brief, diff, test output, screenshots, changed content. | Review report: pass/fail per gate, defects, residual risk, recommendation to merge or revise. |
| Human owner | Own product, safety, privacy, public-claim, merge, and release decisions. | All role outputs and context unavailable to agents. | Explicit approval, revision request, or decision to stop. |

## Standard workflow

### 0. Establish a bounded goal

Use a task brief with:

- Product problem.
- Repository/branch/commit scope.
- Evidence links.
- Hypothesis.
- Acceptance criteria.
- Validation method.
- Out of scope.
- Human decisions required.

Example:

```text
Problem: Users can select strict filters and receive no meal without understanding why.
Evidence: lib/mealUtils.js, screens/HomeScreen.js, README manual scenario.
Hypothesis: Explaining conflicts and distinguishing goals from exclusions improves recovery.
Acceptance: hard exclusions remain strict; no-match explains the conflict; user can revise a goal;
            tests cover representative combinations; no new backend or AI dependency.
Validation: unit matrix + manual usability sessions.
Out of scope: accounts, CMS, clinical advice, automatic relaxation.
Human approval: preference taxonomy, content wording, public health claims.
```

### 1. Scout / Analyst pass

The Scout reads before editing:

1. Git status, branch, remote, and recent history.
2. Entry points and user flows.
3. Data model and state/persistence path.
4. Relevant tests and quality scripts.
5. CI and release configuration.
6. Existing documentation and screenshots.

The Scout must link every material claim to a file, test, command output, or commit. It must label interpretation and assumptions. It must not change code, install dependencies, or “fix” a finding during diagnosis.

**Handoff gate:** Product accepts the evidence ledger as sufficient or sends the Scout back for a missing flow, caller, test, or branch distinction.

### 2. Product pass

Product turns evidence into one decision. It must answer:

- What user problem is being solved?
- Why is it higher priority than other findings?
- What is the smallest useful change?
- What would count as success?
- What will explicitly not be built?
- Which content, privacy, accessibility, or safety decisions require human review?

Product does not ask Developer to “improve the app” without acceptance criteria. It also does not convert an interesting technology into a requirement.

**Handoff gate:** Human owner approves the problem framing, scope, success measure, and risk boundary before implementation begins.

### 3. Developer pass

Developer works in a focused branch or pull request:

- Reuse existing utilities, hooks, components, and dependencies.
- Keep the diff as small as the approved product problem allows.
- Add the smallest test that fails if the new logic regresses.
- Preserve loading, empty, error, fallback, and accessibility behavior.
- Update the relevant documentation and screenshots when user-visible behavior changes.
- Do not add a backend, AI provider, analytics vendor, or framework without an explicit decision record.

Developer reports commands actually run and their real output. A passing mock is not presented as device verification.

**Handoff gate:** Reviewer receives the decision brief, diff, changed files, test additions, command output, manual steps, and known limitations.

### 4. Reviewer pass

Reviewer checks both the requested change and its nearest sibling paths:

- Does the diff solve the stated product problem?
- Does behavior match the approved hypothesis and acceptance criteria?
- Are all callers of changed utilities still correct?
- Are hard constraints, content claims, and persistence boundaries safe?
- Are accessibility labels, roles, states, loading, empty, and error paths covered?
- Does the color system meet contrast requirements as well as semantic accessibility requirements?
- Are async hydration, persistence failures, and out-of-order completions covered?
- Are tests meaningful rather than only increasing counts?
- Were new dependencies or infrastructure justified, including dependency-security triage?
- Does the README/case-study claim match the actual branch, commit, and supported-platform commands?
- Does CI pass, and is warning noise understood?

Reviewer may be an agent for mechanical inspection, but a human owns the merge decision.

**Handoff gate:** No merge or public claim until the human owner accepts the review and residual risks.

## Quality gates

### Baseline gate

Before a change:

- Working tree scope is known.
- Branch and commit are recorded.
- Existing checks pass or known failures are documented.
- The relevant user journey is reproducible.

### Product gate

- Problem and target user are explicit.
- Hypothesis and success signal are explicit.
- The feature is tied to the product thesis.
- Out-of-scope items are written down.
- No feature exists only to make the architecture look more impressive.

### Engineering gate

- Small diff and existing patterns preferred.
- Tests cover changed non-trivial logic and at least one relevant seam.
- Data contracts and malformed values fail safely.
- Persistence failures do not silently create misleading user state.
- No secrets or personal data enter logs, fixtures, prompts, or commits.
- Accessibility and state coverage are reviewed for user-visible changes.

### Delivery gate

- `npm run check` and the relevant manual scenario pass.
- CI status is checked on the exact branch/commit.
- README, screenshots, and case-study claims match the code.
- Release/build status is stated honestly; a test pass is not a store-ready build.
- Residual risks and deferred work are recorded.

## Mandatory human approval

A human must approve:

- Product thesis, target user, priority, and roadmap changes.
- Dietary, nutrition, allergen, medical, or other health-adjacent content.
- Privacy, analytics, telemetry, consent, and data-retention decisions.
- New backend, AI provider, external API, or third-party data source.
- Schema migrations, data deletion, storage-key changes, or destructive commands.
- Image/content licensing and public attribution claims.
- Accessibility tradeoffs that remove or weaken an existing behavior.
- Public case-study wording, quantified results, and production-readiness claims.
- Merge, release, deployment, and external communications.

## Never delegate blindly

Do not accept an agent’s output without checking when it involves:

- “Healthy,” allergy-safe, nutrition, or medical suitability claims.
- Security, secrets, authentication, authorization, or personal data.
- Deleting or migrating user data.
- Adding an AI model because it sounds strategically impressive.
- Usage results, benchmark numbers, user research, or CI status not backed by fresh output.
- Image ownership, licenses, or third-party terms.
- A claim that a feature is complete because a toggle or API endpoint exists.
- A claim that a passing unit test proves a release works on a device.

## Healthy Meal application

For this repository, the smallest reliable loop is:

1. **Scout:** map Home → Preferences → Home → Explore → Recipe Detail; inspect `mealUtils`, AsyncStorage hooks, tests, CI, and branch divergence.
2. **Product:** choose the constraint/no-match problem as the first product slice and define match/recovery metrics.
3. **Developer:** implement one bounded UX/data-contract change, reuse the local-first architecture, and add tests.
4. **Reviewer:** run the full check, inspect the manual scenario, verify accessibility and content wording, and compare the public claim with the exact commit.
5. **Human:** approve the product contract, content/safety language, merge, and any public website update.

This workflow demonstrates AI-assisted delivery because the reasoning is inspectable: evidence is linked, handoffs are explicit, changes are small, and humans own the decisions where an agent cannot safely infer intent.

## Public proof of the workflow

Show sanitized artifacts rather than agent theater:

- A short evidence-based audit.
- A decision brief with hypothesis and out-of-scope boundary.
- A focused pull request or commit with tests.
- Reviewer checks and actual command output.
- A clear statement of what remains unmeasured.

The strongest claim is not “many agents worked on this.” It is:

> AI-assisted inspection and implementation accelerated a bounded product decision while human review preserved product clarity, technical quality, and trust.
