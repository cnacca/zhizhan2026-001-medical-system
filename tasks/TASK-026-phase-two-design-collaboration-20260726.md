# TASK-026 二期设计协作核心闭环执行批次

Status: `completed`

Goal: `goals/GOAL-025-phase-two-design-collaboration-20260726.md`

## Summary

按 `docs/acceptance/phase-two-scope-baseline-20260726.md` 完成二期设计协作的数据库、权限、API、前端和验收闭环。

## Scope

- 新增 V49 兼容迁移与设计任务服务。
- 调整现有设计稿上传/审核/医生确认语义。
- 增加服务端可见性和权限回归。
- 增加生产端与医生端真实页面接线。
- 更新 OpenAPI、项目文档和机器检查。

## Non-goals

- 不重建一期数据，不删除旧接口历史证据。
- 不实现 M6 正式环境工作。
- 不实现订单取消入口、外协 P1、海外诊所或 STL 三维浏览器新能力。
- 不提交或推送 Git。

## Acceptance

- 以 GOAL-025 的 Acceptance 为准。
- 所有新增状态转换均有数据库事实和自动化测试。
- 前端动作以服务端 `allowed_actions` 为准，不能仅凭按钮隐藏实现权限。

## Verification

```bash
./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=DesignTaskCollaborationTests,DesignTaskClaimConcurrencyTests,MessageDesignBillNotificationTests,FileAccessTests,WorkflowRuntimeTests,StaffAccountManagementTests,BearerIdentityTests,CheckWorklogPerformanceTests test
npm run check:phase-two-design-collaboration
npm run check:openapi
npm run check:doctor-portal-v2
npm run build:frontend
npm run acceptance
git diff --check
```

## Checklist

- [x] 二期基线与 RepoFrame 指针。
  - Scope: 记录 PRD 指纹、确认口径、GOAL-025 / TASK-026 和独立验收。
  - Non-goals: 不覆盖一期验收矩阵。
  - Acceptance: 当前入口能明确区分一期和二期。
  - Verification: acceptance JSON 解析、阶段静态检查。

- [x] 数据模型、任务认领与权限。
  - Scope: 设计任务、并发认领、岗位权限、管理员有理由转派和审计。
  - Non-goals: 不改变后续工序为自主领取。
  - Acceptance: 并发唯一、本人范围、实时权限和转派理由测试通过。
  - Verification: `DesignTaskCollaborationTests`。

- [x] 版本、内审、医生确认与文件隔离。
  - Scope: 幂等多文件版本、主动提交、组长审核、医生处理、历史与文件可见性。
  - Non-goals: 不新增重复版本表。
  - Acceptance: 内审驳回隐藏、医生提交版本永久可见、服务端文件门禁通过。
  - Verification: `DesignTaskCollaborationTests`、`MessageDesignBillNotificationTests`、`FileAccessTests`。

- [x] 生产端和医生端真实页面。
  - Scope: 任务池、我的任务、内审队列、上传/预览/审核，以及 DoctorPortalV2 真实版本确认。
  - Non-goals: 不恢复客服审核按钮，不做全站改版。
  - Acceptance: 前端构建和真实浏览器主路径通过。
  - Verification: 前端构建、专项静态检查、浏览器 smoke。

- [x] OpenAPI、回归与完成回写。
  - Scope: API 契约、状态、验证证据、STATUS/PROJECT/README/DECISIONS/tasks。
  - Non-goals: 不伪造客户确认或正式环境证据。
  - Acceptance: 目标回归通过，Task 8 保持 `NOT_READY`。
  - Verification: GOAL-025 完整验证命令。

## Assumption Checks

- V49 / V50 是本批次连续追加的 Flyway 版本，均保持增量兼容且不改写已执行迁移。
- 一单一条设计任务足以覆盖当前 PRD，不需要拆成多个并行设计任务。
- 设计组长权限通过岗位权限映射实现，不创建新的基础角色。

## Downstream Impact

- 设计任务领取人需要纳入文件和消息的 `SELF` 数据范围。
- 客服设计稿页面由技术审核改为医生可见进度只读。
- 后续生产派工接口按已确认规则收紧为管理员。

## Completion Record

- V49 / V50、设计任务服务、Bearer 权限重水合、文件隔离、状态门禁和四端所需 API / 页面已落地。
- 目标后端 8 个测试类共 86 项通过，其中并发领取测试验证恰好一个 `200`、一个 `409`，并只落一条领取事件。
- OpenAPI 118 paths / 136 operations、二期专项检查、Doctor Portal V2 检查、前端生产构建、项目 acceptance 和 `git diff --check` 通过。
- 本地真实浏览器验证管理端、普通技工生产端和医生端页面；设计任务接口代理遗漏在验收中发现并修复，最终页面无 error / warn。
- 医生端补齐同文件 Multipart 待续传恢复、批量上传部分成功保留、待确认聚合失败显式报错，以及确认写入成功但回读失败时的本地合并与再次对账。
- 未提交或推送 Git，未伪造正式部署、客户确认或最终交付证据。

## Remaining Work

- 后续按二期计划另开阶段级批次推进 M2 技术底座、M3 完整业务闭环、五个 AI P0、取消 / 外协等剩余范围，以及 M6 部署和四端图文 PDF 手册。
- 跨设备 pending 续传当前沿用既有“订单 + 文件名 + 大小 + Content-Type”候选匹配；恢复后对象大小 / 内容哈希无损仍属于真实对象存储验收项，不能据本批次宣称生产级跨设备上传完成。
- 一期 Task 8 继续保持 `NOT_READY`；本批次完成不改变正式上线与客户验收门禁。
