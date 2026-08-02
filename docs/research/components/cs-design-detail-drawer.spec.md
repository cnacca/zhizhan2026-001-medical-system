# CS Design Detail Drawer Spec

## Overview

Target: design drawer in `frontend/src/components/CsPortalPages.vue`; follows `cs-reference-detail-foundation.spec.md`.

- model: `540px` single-page continuous-scroll drawer with order context, clinical summary, version stack, preview and review area; no tabs
- version card: version number, upload state, file count, rejection reason and real preview entry; selected version has violet border
- action gate: only `待客服审核` exposes pass/reject; `待生产上传` can only prompt the user to follow up; `待客户确认` enters inquiry; rejected and confirmed versions are read-only
- reject action requires a written reason; passing/rejecting refreshes the real version list
- visuals: document Emoji, version pills, amber review callout and rose rejection callout; no invented design thumbnails
- states: loading, API error, no versions, preview unavailable and permission denied have separate copy
- responsive: action buttons wrap without changing the desktop drawer width
