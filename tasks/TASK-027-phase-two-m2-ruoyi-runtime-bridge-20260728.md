# TASK-027 二期 M2 RuoYi 运行时渐进桥接第一批

Status: `completed`

Goal: `goals/GOAL-026-phase-two-m2-ruoyi-runtime-bridge-20260728.md`

## Scope

- 记录二期 PRD 来源指纹、确认口径和里程碑缺口。
- 建立 RuoYi runtime bridge 模块与版本边界。
- 将固定源码的 Web Filter 顺序能力接入现有 Bearer 运行时。
- 增加非敏感运行状态、目标测试、静态门禁和项目文档回写。

## Non-goals

- 不迁移账号、角色、权限、菜单、部门岗位、Token 或业务数据。
- 不升级主应用 Spring Boot，不接完整 RuoYi starter 或管理 UI。
- 不提交或推送 Git。

## Checklist

- [x] 二期四项确认写入 D-171、范围基线和差异矩阵。
- [x] 新增 `ruoyi-runtime-bridge` 模块，从固定 vendor 源码编译目标类。
- [x] 现有 Bearer 身份过滤器使用 RuoYi Filter Order。
- [x] Actuator info 暴露非敏感桥接状态。
- [x] 目标测试通过。
- [x] RepoFrame 指针、状态文档和静态检查完成校准。
- [x] 标准本地后端重启并通过真实 `/actuator/info` 复核。
- [x] 修复目标环境启动成功却返回非零退出码的运行脚本缺口。

## Acceptance

- 以 GOAL-026 Acceptance 为准。
- 所有桥接改动均可通过删除模块依赖回滚，不涉及数据库迁移。
- 不扩大医生端、客服、技工或管理员权限。

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

- 目标源码没有上游外部依赖，适合先行桥接。
- 现有 Filter 自动注册顺序可由 Spring `@Order` 明确控制。
- `/actuator/info` 只返回版本、模式和顺序，不返回敏感配置。
- 统一环境脚本的目标分支必须显式返回 0，不能让未选择的第二个 `&&` 条件成为函数退出码。

## Downstream Impact

- 下一批优先做现有权限/DataScope 与 RuoYi 规则接口的只读兼容适配。
- 完整审计、管理 UI 和通用 SQL DataScope 仍是后续批次。
- M2-08 仍为 `PARTIAL`，不得宣称 M2 已完成。
