# CS Order Detail Drawer Spec

## Overview

Target: order drawer in `frontend/src/components/CsPortalPages.vue`; follows `cs-reference-detail-foundation.spec.md`.

- model: `540px` continuous-scroll drawer, no tabs and no fixed footer
- header: order number, Chinese stage badge, close button
- content order: four-cell business summary; optional risk/review alert; production timeline; customer/doctor/patient details; clinical specifications; real files; design/bill/logistics related records; contextual actions; full order message thread and inline reply composer at the very bottom
- timeline: Emoji nodes (`✓`, `✏️`, `🔍`, `⚙️`, `📸`, `🎨`, `✅`, `💳`, `🚀`) with CSS line; completed/current/future states use green/violet/slate
- file assets: file-type Emoji plus real filename, size and upload state; preview only when a signed URL endpoint succeeds
- states: related API failure shows which section failed and a retry action; zero records shows a local empty state, not a page failure
- message thread: follows the reference file's in-drawer conversation model; maximum height `220px`, customer/other messages align left, CS messages align right, and all bubbles use the real order message endpoint
- inline reply: single-line text input plus send button in the drawer; Enter submits, empty/sending state disables submit, and the message is not sent until the user explicitly submits
- actions: information review navigation remains available above the message thread; stage-changing actions appear only when backed by an existing endpoint and valid state
- responsive: two-column cards become one column below `560px`
