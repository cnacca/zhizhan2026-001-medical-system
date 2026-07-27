# TASK-025 RuoYi-Vue-Pro Core Foundation

Status: `completed`

Goal: `goals/GOAL-024-ruoyi-core-foundation-20260724.md`

## Summary

作为一个执行批次完成真实 RuoYi-Vue-Pro 核心源码固定、无凭据引入、隔离构建和边界回写。

## Scope

- 获取并校验官方固定提交。
- 机械引入上游默认核心源码。
- 安全排除上游示例凭据和 seed 数据。
- 增加静态检查、独立构建入口和项目文档回写。

## Non-goals

- 不做角色权限分配。
- 不接管现有运行时。
- 不修改当前业务 Controller、服务、数据库迁移或前端权限行为。
- 不写真实凭据和生产数据。

## Acceptance

- 固定提交、许可证、模块边界和安全处理均有可验证记录。
- 上游核心 21 模块和现有业务后端都能独立构建。
- 角色权限、账号创建权限、经理/主管权限和标准工时数据仍按已确认边界保留。

## Verification

```bash
npm run check:ruoyi-core-foundation
./scripts/with-jdk21.sh mvn -f vendor/ruoyi-vue-pro-core/pom.xml -DskipTests -Dmaven.javadoc.skip=true clean package
npm run test:backend
npm run build:frontend
npm run acceptance
git diff --check
```

## Checklist

- [x] 固定上游来源。
  - Scope: 记录仓库、分支、提交、提交日期、归档 SHA-256、许可证和技术版本。
  - Non-goals: 不跟随浮动分支构建。
  - Acceptance: `UPSTREAM.lock` 可独立复核。
  - Verification: `npm run check:ruoyi-core-foundation`.

- [x] 引入真实核心源码。
  - Scope: 引入上游默认后端 reactor 的 21 个模块。
  - Non-goals: 不引入商城、ERP 等无关模块。
  - Acceptance: 隔离构建全部成功。
  - Verification: RuoYi core Maven package command.

- [x] 清理不安全示例。
  - Scope: 不复制上游 hard-coded 配置；SQL 只保留 DDL；新增环境变量配置入口。
  - Non-goals: 不伪造可用凭据，不保留演示账号。
  - Acceptance: 已知示例密钥静态扫描为零。
  - Verification: `npm run check:ruoyi-core-foundation`.

- [x] 现有项目回归与完成回写。
  - Scope: 验证现有后端仍可打包，更新 active goal/task 和完成记录。
  - Non-goals: 不改变运行时和权限结果。
  - Acceptance: 两套 Maven reactor 均通过，任务状态改为 completed。
  - Verification: backend Maven package; `npm run acceptance`; `git diff --check`.

## Assumption Checks

- 上游源文件的批量复制是机械 vendoring，不对 Java 源码做业务改写。
- 官方示例配置和完整 seed SQL不是“真实核心源码”必须组成部分，可以因安全规则排除。
- 后续运行时迁移需要新的阶段级 goal。

## Downstream Impact

- 项目不再只“参考 RuoYi 风格”，而是拥有固定版本的真实核心源码基线。
- 现有服务仍是唯一业务运行时；后续桥接不会在本任务中暗中发生。

## Completion Record

- 21 个 RuoYi 核心模块：JDK 21 `clean package` 成功。
- 现有后端：16 模块、192 个测试通过。
- 现有前端：Vue TypeScript 检查与 Vite 生产构建通过。
- 静态门禁、`acceptance.json` 解析和 `git diff --check` 通过。
- 本批次未修改 `backend/` 或 `frontend/` 业务代码，未执行角色权限分配。
