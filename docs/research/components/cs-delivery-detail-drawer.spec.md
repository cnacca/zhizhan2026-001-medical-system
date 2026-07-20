# CS Delivery Detail Drawer Spec

## Overview

Targets: delivery detail drawer and shipping registration dialog in `frontend/src/components/CsPortalPages.vue`.

- drawer: `540px` single-page continuous-scroll detail; `配送资料 / 物流时间线 / 异常跟进 / 操作记录` appear in order as titled sections with no tabs
- registration: separate centered `760px` dialog with carrier cards, tracking number, validation summary and submit action
- carrier cards: four supported visual choices using text/Emoji/CSS marks; selection has violet outline; custom carrier remains possible when the API accepts it
- shipment gate cards: final QC, payment/policy and address; unknown backend facts say “提交时由后端校验” rather than assuming pass
- already shipped/delivered records never show the registration form again; exception/resolution actions follow current logistics state
- timeline uses real created/updated/shipped data where available; no fake live carrier tracking
- states: logistics API failure, pending shipment, shipped, exception and delivered are distinct
- responsive: registration width becomes `calc(100vw - 24px)` and carrier grid collapses to two/one columns
