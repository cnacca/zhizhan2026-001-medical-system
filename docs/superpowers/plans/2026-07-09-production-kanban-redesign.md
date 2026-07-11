# Production Kanban Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild `/production/board` as a process-queue Kanban with progressive process-instance sync and drawer details.

**Architecture:** Keep the existing single-file Vue app structure and reuse existing APIs. Add a static acceptance script first, then evolve `App.vue` data mapping from status columns to auxiliary/process columns, and move the existing detail panel into an Element Plus drawer. Style the Kanban workspace in `styles.css` without changing backend contracts.

**Tech Stack:** Vue3, TypeScript, Element Plus, Vite, Node static check scripts.

---

### Task 1: Add Acceptance Guard

**Files:**
- Create: `scripts/check-production-kanban-redesign.mjs`
- Modify: `package.json`

- [x] **Step 1: Write failing check**

The check asserts the planned implementation surface exists: process-card model, progressive process-instance cache, auxiliary columns, drawer, summary chips, and no drag/auto-polling implementation.

- [x] **Step 2: Run check to verify it fails**

Run: `npm run check:production-kanban-redesign`
Expected before implementation: FAIL with missing required text in `frontend/src/App.vue`.

### Task 2: Implement Process Queue Data Model

**Files:**
- Modify: `frontend/src/App.vue`

- [x] **Step 1: Replace status-column-only Kanban model**

Add card, column, sync state, summary, risk, and helper types for process queue rendering.

- [x] **Step 2: Add progressive process instance cache**

After `/orders` loads, render base cards immediately and low-concurrency sync `/orders/{id}/process-instance` for visible orders.

- [x] **Step 3: Build auxiliary and process columns**

Use helper columns for review/dispatch/sync/doctor/final inspection, and sort true process columns by `step_order`, `node_code`, and `process_name`.

### Task 3: Implement Drawer Detail Interaction

**Files:**
- Modify: `frontend/src/App.vue`

- [x] **Step 1: Replace persistent detail panel with drawer**

Clicking a card opens a unified `el-drawer` on all viewport sizes.

- [x] **Step 2: Preserve existing detail capabilities**

Move order summary, node stats, node progress, and final-shipping form into drawer sections.

### Task 4: Implement Visual Layout

**Files:**
- Modify: `frontend/src/styles.css`

- [x] **Step 1: Add compact control and summary styles**

Style date controls, status/search row, summary chips, sync indicators, and horizontal scroll workspace.

- [x] **Step 2: Add high-density Kanban card styles**

Style stable-width columns, risk sidebars, labels, progress bars, and empty columns.

### Task 5: Verify

**Files:**
- Read: `frontend/src/App.vue`
- Read: `frontend/src/styles.css`
- Run: package scripts

- [x] **Step 1: Run static acceptance**

Run: `npm run check:production-kanban-redesign`
Expected: PASS.

- [x] **Step 2: Run frontend build**

Run: `npm run build:frontend`
Expected: PASS.

- [x] **Step 3: Run diff whitespace check**

Run: `git diff --check`
Expected: PASS.
