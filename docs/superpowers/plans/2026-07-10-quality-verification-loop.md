# Quality Verification Loop Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Establish repository-local quality records that let a new agent verify and repair legacy test feedback without chat-history dependency.

**Architecture:** `verification-loop.md` defines the permanent state machine and acceptance gates. `feedback-source-2026-07-08.md` preserves the actionable old-feedback summary, `defect-tracker.md` holds the live state of each bug, and `evidence/README.md` defines small, reviewable evidence records.

**Tech Stack:** Markdown, Git, existing npm and Playwright verification commands.

## Global Constraints

- Work only in `/Users/yuri/Documents/AI智能下单平台`.
- Treat the 2026-07-08 feedback as an old-version input, not current proof.
- Do not change application code, `acceptance.json`, or Task 8 status.
- Do not record passwords, Tokens, secrets, customer data, or unredacted sensitive logs.

---

### Task 1: Define the verification state machine and evidence contract

**Files:**
- Create: `docs/quality/verification-loop.md`
- Create: `docs/quality/evidence/README.md`

- [x] Define lifecycle and loop-stage fields, entry/exit gates, rollback paths, and closure rules.
- [x] Define the minimum reproducible evidence record and storage convention.
- [x] Verify all required stages and sensitive-data restrictions are present with `rg`.

### Task 2: Preserve the actionable old-feedback source and wire the live tracker

**Files:**
- Create: `docs/quality/feedback-source-2026-07-08.md`
- Modify: `docs/quality/defect-tracker.md`

- [x] Record the old feedback baseline, known limitations of the missing temporary archive, four defect summaries, and the 20 abnormal menu observations.
- [x] Add read order, lifecycle, loop-stage, next action, and source links to each tracked defect.
- [x] Verify the tracker contains four defects, all start at `OPEN / BASELINE`, and no defect is marked closed.

### Task 3: Perform documentation integrity checks

**Files:**
- Verify: `docs/quality/*.md`
- Verify: `docs/quality/evidence/README.md`

- [x] Run `git diff --check`.
- [x] Check required file names, defect IDs, lifecycle fields, and evidence conventions with `rg`.
- [x] Record no runtime or application verification as part of this documentation-only setup.
