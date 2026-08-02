# CS Billing Detail Drawer Spec

## Overview

Target: billing detail drawer in `frontend/src/components/CsPortalPages.vue`; follows `cs-reference-detail-foundation.spec.md`.

- model: `540px` single-page continuous-scroll drawer; `账单资料 / 订单明细 / 收款记录 / 操作记录` appear in order as titled sections with no tabs
- header/summary: bill number, bill status, payment status, amount, received amount and outstanding amount
- receipt sum is derived from real payment records; contradictory bill/payment data produces a rose warning and disables new receipt submission until refreshed/resolved
- receipt form appears only when an outstanding amount can be recorded; it never simulates online payment, refund or tax handling
- payment method values are Chinese labels; amount is displayed in currency units while API requests remain cents
- visuals: money Emoji, amount emphasis card, green paid callout, amber outstanding callout, bordered record rows
- states: bill API and payment API errors are shown independently; no receipt is a real empty state
- responsive: summary grids collapse below `560px`
