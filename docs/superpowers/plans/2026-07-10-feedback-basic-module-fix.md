# 旧测试反馈菜单基础能力修复 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将 BUG-003 的旧反馈菜单从演示/待接入状态收口为当前一期可验证的基础能力入口。

**Architecture:** 菜单仅指向当前已有真实后端能力，`App.vue` 的活动菜单 ID 决定复用哪个基础数据面板和加载函数。Playwright 从真实登录流程进入页面，拦截异常响应并验证没有占位文案。

**Tech Stack:** Vue 3、Element Plus、Spring Boot 既有 REST API、Playwright、Node.js。

## Global Constraints

- 不新增外协供应商结算、扫码硬件集成、云端同步或完整 RBAC 闭环。
- 不移除菜单、不绕过服务端鉴权、不扩大医生端数据范围。
- Task 8 继续保持 `NOT_READY`。
- 不覆盖当前工作树中与本修复无关的用户修改。

---

### Task 1: 固化菜单基础能力验收用例

**Files:**
- Modify: `scripts/smoke-test-feedback-20260710.spec.mjs`
- Modify: `package.json`

- [ ] **Step 1: 写失败的菜单验收用例**

为客服、生产和管理端分别定义旧反馈菜单，点击后断言页面包含预期基础能力标题，且页面正文不包含 `演示入口`、`待接入`、`后续确认正式范围后再接入接口`、`请求失败：400` 或 `请求失败：403`。

- [ ] **Step 2: 运行用例确认失败**

Run: `pnpm exec playwright test scripts/smoke-test-feedback-20260710.spec.mjs --browser=chromium --workers=1`

Expected: FAIL，失败项定位到仍含 `placeholder: true` 或未被当前数据加载分支覆盖的菜单。

- [ ] **Step 3: 添加可重复执行入口**

在 `package.json` 新增 `smoke:test-feedback-20260710`，只执行上述 Playwright 文件。

- [ ] **Step 4: 重新运行用例**

Run: `npm run smoke:test-feedback-20260710`

Expected: 用例仍失败，但由应用待修复行为触发而非命令配置错误。

### Task 2: 接入已有生产与管理基础台账

**Files:**
- Modify: `frontend/src/App.vue`

- [ ] **Step 1: 扩展活动菜单归类**

将 `admin-device` 纳入设备汇总、`admin-material` 纳入物料异常汇总、`cs-outsourcing` 和 `admin-outsourcing` 纳入成本汇总；保留 `production-cost-outsourcing` 的既有归类。

- [ ] **Step 2: 移除这些菜单的占位配置并映射到对应真实路由**

为上述入口使用现有生产辅助页面的路由，确保 `loadActiveRouteData()` 调用相应的 `loadProduction*Summary()` 函数。

- [ ] **Step 3: 修正权限清单的正式基础版文案**

对 `admin-users` 和 `admin-roles` 保留账号、角色、权限和菜单清单的真实当前状态，不显示“演示入口”或“后续接入接口”。

- [ ] **Step 4: 运行定向用例**

Run: `npm run smoke:test-feedback-20260710`

Expected: 设备、物料、外协成本、用户和角色入口通过；其余旧反馈入口仍暴露为待修复项。

### Task 3: 复用真实业务页替换其余占位菜单

**Files:**
- Modify: `frontend/src/App.vue`

- [ ] **Step 1: 映射客服、终检、消息、云端和配送入口**

将生产备注助手映射到内部订单的 AI 生产备注区；终检报告映射到终检/返工记录；消息中心映射到通知中心；云端数据映射到内部订单设计稿附件台账；账单配送映射到配送页面。

- [ ] **Step 2: 映射扫码基础登记入口**

将扫码登记映射到已有检查任务和工序流转登记页，并将可见文字明确为人工登记，避免声称已经集成扫码硬件。

- [ ] **Step 3: 移除所有被映射菜单的占位配置**

确保旧反馈的每一项不再命中 `isPlaceholderRoute`，也不会掉回通用演示面板。

- [ ] **Step 4: 运行定向用例**

Run: `npm run smoke:test-feedback-20260710`

Expected: 三端全部旧反馈菜单通过；未出现 400、403、演示或待接入文案。

### Task 4: 回归与证据收口

**Files:**
- Modify: `docs/quality/defect-tracker.md`
- Create: `docs/quality/evidence/2026-07-10/bug-003-basic-module-fix.md`

- [ ] **Step 1: 执行静态与登录回归**

Run: `npm run check:scope-baseline-20260706 && npm run check:task9d24 && npm run smoke:task9d24 && npm run smoke:test-feedback-20260710`

Expected: 全部退出码为 0。

- [ ] **Step 2: 记录可复现证据**

记录运行命令、日期、覆盖菜单、通过结果和一期范围限制，不写入账号密码或 token。

- [ ] **Step 3: 更新台账**

为 BUG-001、BUG-002、BUG-004 记录已完成验证；为 BUG-003 记录 20 项菜单逐项结论、修复文件和回归结果。仅在所有定向与主链路回归通过后标记为 `已关闭`。
