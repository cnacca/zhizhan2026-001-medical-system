# GOAL-025 二期设计协作核心闭环

Status: `completed`

Mode: `stage-goal`

## Summary

在一期现有订单、文件、设计稿版本和工序链基础上，完成二期第一批“设计任务池自主领取 → 多文件版本 → 组长内审 → 医生确认”的安全闭环。

## Scope

- 建立独立设计任务、任务状态、认领和操作审计。
- 生产审核通过时幂等创建设计任务，不重复创建工序实例或设计任务。
- 支持公共任务池、本人任务、并发领取和管理员填写原因转派。
- 复用 `design_draft` / `design_draft_file` 作为版本事实源，增加任务关联、上传说明、提交时间和逐版本审核历史。
- 由有组长权限点的 `WORKER` 或管理员执行内部审核；客服改为只读。
- 医生只看已提交给医生的版本，并可确认或填写原因驳回。
- 修正通用订单文件列表的医生可见性边界。
- 提供生产端设计任务池、我的设计任务、内审队列，以及医生端真实设计确认接口接线。
- 回写二期基线、OpenAPI、自动化验收和项目状态。

## Non-goals

- 不重建仓库、数据库或一期文档。
- 不复制 `design_draft_version`，不覆盖已有版本。
- 不把设计任务塞入任意生产工序节点。
- 不开放客服技术审核、客服派工或管理员代医生确认。
- 不完成订单取消功能、全部五个 AI 智能体、正式部署或四份 PDF 手册。
- 不把 M2、M3、M6 或一期 Task 8 标为完成。

## Acceptance

- 同一订单最多一条设计任务；生产审核重复请求不会重复创建。
- 两个技工并发领取只有一个成功，失败方获得 `409`。
- 非领取人不能读取或操作他人设计任务；组长权限与普通技工权限可区分。
- 一次多文件上传形成一个版本，相同幂等键重试返回同一版本。
- 上传和提交内审分开；组长驳回原因必填，原技工可追加新版本。
- 客服不能调用内部审核接口。
- 医生只看到已经进入医生确认阶段的版本，且内审驳回文件无法从通用文件接口或签名 URL 越权读取。
- 医生确认后后续生产门禁可继续；医生驳回后继续阻塞。
- OpenAPI、后端目标测试、前端构建、静态检查和真实浏览器核心路径通过。

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

## Completion

- V49 / V50 已在现有数据库模型上增量建立设计任务、个体权限、事件审计、历史稿关联和旧文件可见性兼容，不重建一期数据。
- 生产审核创建设计任务、并发领取、本人任务、管理员有理由转派、组长内审、医生确认 / 驳回和首节点门禁已接入真实服务端状态。
- 一次多文件形成一个版本；生产端按文件保留已完成结果，医生端 Multipart 会查找待续传记录、复用原 `file_id/upload_id` 并跳过已完成分片。
- 通用文件列表、预览和下载已按设计阶段、订单归属和角色执行服务端隔离；客服没有技术审核入口，管理员不能代医生确认。
- 生产端任务池 / 我的任务、权限内审、管理端设计任务和 Doctor Portal V2 已接真实 API；提交成功后的回读异常会保留已提交结果并继续对账，不会误导用户重复提交。
- 8 个目标测试类共 86 项通过；OpenAPI 118 paths / 136 operations 校验、专项静态门禁、前端生产构建、项目 acceptance 和差异检查通过。
- 本地真实浏览器已覆盖管理端设计任务、生产端任务池 / 我的任务、普通技工无内审入口、医生端订单列表 / 详情，相关页面控制台无 error / warn。
- 本阶段只完成二期设计协作第一批本地开发闭环；一期 Task 8 继续保持 `NOT_READY`，M2 / M3 / M6、正式部署、客户记录和四份 PDF 手册仍按后续独立批次执行。

## Assumption Checks

- `design_draft` 已经是一单多版本事实表，`design_draft_file` 已经是一版本多文件事实表。
- 设计任务是工序链前置协作对象，不等于后续生产 DAG 节点。
- 组长和质检继续属于 `WORKER`，通过岗位权限点区分。
- 一期历史设计稿可通过兼容迁移关联到设计任务，不删除或覆盖。

## Downstream Impact

- 后续 M3 批次在本闭环之后继续推进完整入检、工时、出检、返工和终检验收，不允许跳步。
- M2 的完整账号权限配置页、五个 AI P0、M6 部署和手册仍使用独立批次推进。
