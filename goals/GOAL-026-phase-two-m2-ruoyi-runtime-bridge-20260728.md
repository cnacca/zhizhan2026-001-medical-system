# GOAL-026 二期 M2 RuoYi 运行时渐进桥接第一批

Status: `completed`

Mode: `stage-goal`

## Summary

在不替换现有业务运行时的前提下，让固定版本 RuoYi-Vue-Pro 源码进入现有后端真实运行路径，完成 M2 渐进桥接第一批。

## Scope

- 冻结 D-171 的四项确认口径和二期 M2 / M3 / M6 差异矩阵。
- 新增独立 RuoYi runtime bridge Maven 模块。
- 从固定 vendor 源码选择最小、无业务副作用的 Web Filter 顺序能力进入当前 reactor。
- 让现有 Bearer 身份过滤器真实使用该能力。
- 暴露不含敏感信息的运行时桥接状态并增加回归测试。
- 修正阶段文档、验收指针和过时机器检查。

## Non-goals

- 不一次性替换现有登录、Token、账号、权限守卫、业务表、Flyway 或前端。
- 不引入上游演示账号、默认口令、完整 seed SQL 或无关模块。
- 不把第一批桥接描述为完整权限、DataScope、审计、管理 UI 或 M2 完成。
- 不改变一期 Task 8 状态，不伪造真实环境和客户交付证据。

## Acceptance

- backend reactor 包含 `ruoyi-runtime-bridge`，并直接从固定 vendor 源码编译指定 RuoYi 类。
- 现有 `BearerIdentityFilter` 的 Spring Order 来自 RuoYi `WebFilterOrderEnum`。
- `/actuator/info` 可提供桥接模式、固定来源和不替换现有鉴权的事实。
- RuoYi 桥接测试和 Bearer 身份测试通过。
- 二期范围、差异矩阵、决策、当前状态、任务指针和静态检查一致。

## Verification

```bash
./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -am -Dtest=RuoyiRuntimeBridgeTests,BearerIdentityTests -Dsurefire.failIfNoSpecifiedTests=false test
npm run check:phase-two-m2-ruoyi-runtime-bridge
npm run check:phase-two-design-collaboration
npm run check:repoframe-docs
npm run acceptance
git diff --check
```

## Assumption Checks

- 固定 vendor 提交仍存在，目标源文件 SHA-256 与记录一致。
- `WebFilterOrderEnum.TENANT_SECURITY_FILTER=-99` 适合当前 Bearer 身份上下文清理边界。
- 第一批不依赖 RuoYi 的 Spring Boot 3.5.15 API，因此主应用继续保持 3.5.0。
- 当前无须迁移数据库或停机。

## Downstream Impact

- 后续权限、DataScope、审计和管理 UI 都应通过独立 bridge 边界逐段接入。
- 引入任何 RuoYi starter 前必须先做依赖树、启动、权限结果和回滚验证。
- M2-08 仍为 `PARTIAL`；M2、M3、M6 和一期 Task 8 均保持未完成。

## Completion

- RuoYi `WebFilterOrderEnum` 已从固定 vendor 源码进入当前 Maven reactor 和应用 classpath。
- 现有 Bearer 身份过滤器已使用该顺序常量，Actuator info 已暴露非敏感桥接事实。
- 13 项目标测试通过，其中桥接测试 2 项、Bearer 身份测试 11 项。
- 17 模块后端 package 通过；桥接 JAR 包含 RuoYi 目标类，Boot JAR 包含 bridge 依赖与 info contributor。
- 标准本地后端重启后，真实 `GET /actuator/info` 返回 `mode=incremental`、固定提交、`bearerFilterOrder=-99` 和 `replacesExistingAuth=false`。
- 验收中修复 `environment-runtime.sh start local` 因目标判断末尾返回 1 的退出码问题；再次执行统一启动入口返回 0，标准本地环境保持就绪。
