# CS Customer Detail Modal Spec

## Overview

Target: customer detail modal in `frontend/src/components/CsPortalPages.vue`.

- model: centered `860px` dialog, maximum height `82vh`, scrollable single-page body, reference overlay
- header: clinic avatar/Emoji, clinic name, code/status metadata and close square
- content order: `诊所信息 / 医生成员 / 制作偏好 / 商务条款 / 订单记录` appear as titled sections in one continuous page; no tabs or hidden panels
- information tab: contact, phone, email, address and real recorded metadata in bordered cells
- members and order history: show real records only; when no endpoint/data exists, show a polished capability empty state and do not invent people or orders
- preferences: known preference fields use Chinese labels; nested objects render as structured grouped cards rather than `[object Object]`; save preserves unknown keys
- commercial terms: show only backend-supported terms, otherwise explicit “尚未建模” state
- visuals: clinic Emoji avatar, violet tabs, green/amber state chips, white `1.5px` bordered cards
- responsive: width `calc(100vw - 24px)` below `900px`; every section stays in document flow
