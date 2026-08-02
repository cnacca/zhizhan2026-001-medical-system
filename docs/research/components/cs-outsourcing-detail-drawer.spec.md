# CS Outsourcing Detail Drawer Spec

## Overview

Target: outsourcing detail drawer in `frontend/src/components/CsPortalPages.vue`; follows `cs-reference-detail-foundation.spec.md`.

- model: `540px` single-page continuous-scroll drawer; `外协资料 / 进度记录 / 异常跟进 / 操作记录` appear in order as titled sections with no tabs
- overview: batch number, order/product, status, quantity, vendor name when modeled, expected/actual dates, cost and notes
- progress: build a visual timeline only from real timestamps/statuses; missing milestones remain “未记录”
- exception and operation tabs: read-only capability state until matching write/audit endpoints exist; never show a button that fakes completion
- visuals: factory/parcel Emoji, violet timeline nodes, amber overdue alert, bordered metric cards
- states: detail API loading/error/empty are separate; raw backend enum values never appear to users
- responsive: metric grid collapses below `560px`
