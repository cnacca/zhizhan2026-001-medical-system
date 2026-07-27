# GOAL-024 RuoYi-Vue-Pro Core Foundation

Status: `completed`

Mode: `stage-goal`

## Summary

引入固定版本的真实 RuoYi-Vue-Pro 后端核心源码，建立可独立编译、可追溯、无硬编码凭据的迁移基础，同时保持现有业务服务和权限结果不变。

## Scope

- 固定官方 `master-jdk17` 提交、归档校验值和 MIT 许可证。
- 引入默认后端核心：dependencies、framework、infra、system、server。
- 排除商城、CRM、ERP、IoT、MES、WMS、BPM、支付、会员、报表、公众号、IM、AI 和 UI 等本期无关模块。
- 移除上游含硬编码示例密钥的运行配置和完整演示数据，提供无凭据环境变量配置与 schema-only SQL。
- 新增可重复的静态门禁和 JDK 21 Maven 构建验证。
- 记录本批次边界、已确认事实、开放问题和后续迁移门。

## Non-goals

- 不设计或调整医生、客服、技工、超级管理员的具体角色权限。
- 不把 RuoYi system 模块接入现有运行时，不替换现有登录、Token、菜单、DataScope 或业务授权。
- 不迁移现有 `system_*` 表，不写入任何现有数据库。
- 不引入任何真实密钥、默认口令、第三方账号或客户数据。
- 不声明一期开发、Task 8 或生产 readiness 完成。

## Acceptance

- 上游来源固定到 `ec3f7cbf73e88514a70a6b59d365092ee470603d`，归档 SHA-256 和 MIT 许可证可追溯。
- 21 个默认核心 Maven 模块在 JDK 21 下独立打包成功。
- 仓库中存在真实核心 Java 源码，但没有一期无关上游模块。
- 已知上游示例密钥、上游 local/dev 配置和完整 seed SQL 不进入仓库。
- `npm run check:ruoyi-core-foundation` 通过。
- 现有 `backend/` 与 `frontend/` 业务实现未因本批次改变权限结果。

## Verification

```bash
npm run check:ruoyi-core-foundation
./scripts/with-jdk21.sh mvn -f vendor/ruoyi-vue-pro-core/pom.xml -DskipTests -Dmaven.javadoc.skip=true clean package
npm run test:backend
npm run build:frontend
npm run acceptance
git diff --check
```

## Completion

- 2026-07-24：固定提交和源码归档已落地，21 个上游核心 Maven 模块在 JDK 21 下 `clean package` 成功。
- 上游根目录 `lombok.config` 已作为必要构建契约保留；静态门禁会阻止遗漏。
- 上游运行配置、完整 seed SQL 和已知示例凭据未进入仓库，预签名 URL 示例已脱敏为占位值。
- 现有后端 16 模块、192 个测试全部通过，前端生产构建通过。
- `backend/` 与 `frontend/` 没有本批次代码改动；现有登录、Token、菜单、DataScope 和业务权限结果未改变。
- 角色权限分配继续暂缓；Task 8 继续为 `NOT_READY`。

## Assumption Checks

- 当前项目 Java 21 / Spring Boot 3.5.x 与上游 Java 17 target / Spring Boot 3.5.15 可在隔离 reactor 中同时构建。
- 上游 system/infra 源码先隔离引入，再逐模块桥接，风险低于一次性替换现有业务运行时。
- 角色权限分配是独立产品决策门，本批次不能用上游演示角色或菜单替代。

## Downstream Impact

- 后续可以基于固定源码做依赖版本对齐、数据库映射、Spring Security/Token、审计和 DataScope 的逐段迁移。
- 任何运行时接入都必须先产出表映射、兼容策略、回滚方案和权限不扩张证明。
