# CS Product Detail Drawer Spec

## Overview

Target: product detail drawer in `frontend/src/components/CsPortalPages.vue`; follows `cs-reference-detail-foundation.spec.md`.

- model: `540px` single-page continuous-scroll drawer; `产品资料 / 医生下单要求 / 变更记录` appear in order as titled sections with no tabs
- product tab: Emoji product identity, code, name, category, lead days and enabled state; only supported fields are editable
- requirements tab: real requirement rows with required marker, field type, order and option summary; no raw enum values
- history tab: real `updated_at` metadata when present; if history API is absent, explicitly state that audit history is not yet available
- visuals: category Emoji, violet selected tab, grid cards and enabled green badge
- states: requirements API error is not rendered as an empty list; save uses the existing update endpoint
- responsive: form grid collapses below `560px`
