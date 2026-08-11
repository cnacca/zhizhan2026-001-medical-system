# TASK-036 8088 部署缺陷与下单回归修复批次

Status: `completed`（本地代码与自动化收口，2026-08-11；线上复测待执行）

Goal: `goals/GOAL-035-deployment-defect-closure-20260811.md`

## Objective

在 `dev` 基线上为 BUG-019 / 020 / 021 / 022 / 012 / 013 建立可重复的失败测试和机器检查，完成最小必要修复，并产出不夸大线上状态的部署后复测清单。

## Scope Checklist

- [x] CORS 配置化回归：允许显式线上 Origin，拒绝未列入 Origin。
- [x] 软删除文件访问回归：医生 / 客服 / 管理员均拒绝新签名 URL。
- [x] MinIO 双端点：内部 client 负责存储操作，公网 client 只负责签名。
- [x] 医生端本步必填门禁与保存互斥锁。
- [x] 9D.4 权限模型静态校验更新。
- [x] BUG-015 固定布局 / 两行截断回归。
- [x] 生产构建不预填、不打包演示密码。
- [x] 部署 compose、env 示例、README / readiness 与 RepoFrame 指针同步。

## Non-goals

- 不直接变更线上服务器、防火墙、DNS、HTTPS 证书或生产数据。
- 不物理删除历史 MinIO 对象，不伪造旧签名 URL 已立即失效。
- 不执行真实账号轮换；只把轮换列入重新部署前硬门禁。
- 不提交、不推送，不把 Task 8 改为 `READY`。

## Acceptance Criteria

1. `BearerIdentityTests` 覆盖可配置线上 Origin 与拒绝未知 Origin。
2. `FileAccessTests` 覆盖删除文件不能签发预览 / 下载 URL且有 DENIED 审计。
3. MinIO 配置测试证明公网签名 client 使用独立 endpoint。
4. 本批静态检查覆盖双端点、ACTIVE 文件约束、前端步骤门禁 / 互斥锁、生产密码和 BUG-015。
5. 后端测试、前端构建、部署 compose 渲染、既有 9D.4 与部署检查通过。

## Verification Commands

```bash
MYSQL_TEST_DATABASE=ai_order_platform_bugfix_20260811_test MINIO_TEST_BUCKET=ai-order-bugfix-20260811-test ./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=BearerIdentityTests,FileAccessTests,FileStorageConfigurationTests test
npm run build:frontend
npm run check:deployment-bugfixes-20260811
npm run check:task9d4
npm run check:task9d69
npm run check:deployment-env
npm run acceptance
```

## Assumption Checks

- [x] 当前分支为 `dev`，HEAD 与 `origin/dev` 一致且工作树在本批开始前干净。
- [x] 登录失败可由硬编码 localhost CORS 与线上 Origin 不匹配解释，并已通过线上请求复现。
- [x] 删除文件仍能访问的根因是 `loadFile` 未约束 ACTIVE，而列表接口已约束 ACTIVE。
- [x] MinIO 签名 Host 参与 AWS V4 签名，不能在签名后字符串替换。
- [x] BUG-015 当前实现已有 fixed layout 与两行截断，因此作为回归项而非重复改样式。

## Downstream Impact

- 服务器部署必须新增 `MINIO_PUBLIC_ENDPOINT`，并确保对应端口 / 域名从用户浏览器可达。
- 重新部署后需重新跑 8088 登录、文件上传、删除后访问、预览 / 下载和医生端快速连点复测。
- 已经生成的删除文件签名链接可能在原 TTL 内继续有效；若业务要求立即撤销，需客户确认对象保留与物理删除策略。
- 数据库演示账号轮换仍是正式上线硬门禁，不由前端去“隐藏”替代。

## Completion Record

- 实现结果：BUG-019 / 020 / 021 / 022 / 012 / 013 已修复；BUG-015 现有固定布局与两行截断实现保持不变并加入回归。
- 目标后端回归：`BearerIdentityTests,FileAccessTests,FileStorageConfigurationTests` 共 27 tests，0 failures，0 errors。
- 全量后端回归：在 `ai_order_platform_bugfix_20260811_full_test` 与独立 MinIO bucket 上共 336 tests，0 failures，0 errors。
- 前端与机器检查：`build:frontend`、`check:deployment-bugfixes-20260811`、`check:task9d4`、`check:task9d69`、`check:deployment-env`、`check:task9d78`、`compose:phase-one:config`、`acceptance` 与 `git diff --check` 均通过。
- 环境说明：既有共享测试库存在 Flyway V73 checksum 历史漂移，旧 `target/classes` 还残留已删除的 V77 构建产物；本批没有改写或删除共享测试数据，而是清理精确的生成物并使用全新隔离库验证。这也是旧环境中结果难以稳定复现的原因之一，不是本批源代码回归。
- 外部待办：按 `docs/deployment/8088-redeployment-checklist-20260811.md` 注入真实 Origin / 公网 MinIO 地址、开放网络、轮换正式账号并重新部署，再做 8088 浏览器复测。Task 8 保持 `NOT_READY`。
