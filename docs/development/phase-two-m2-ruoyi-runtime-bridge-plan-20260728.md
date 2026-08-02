# 二期 M2 RuoYi 运行时渐进桥接计划

状态：`FIRST_SLICE_COMPLETED`

日期：`2026-07-28`

## 目标

让固定版本的 RuoYi-Vue-Pro 核心源码以可验证、可回滚的方式进入现有应用真实运行路径，同时保持现有登录、Token、账号、权限、业务表和主链行为不变。

## 采用方案

第一批桥接 RuoYi `yudao-common` 中的 `WebFilterOrderEnum`：

1. 新增 `backend/ruoyi-runtime-bridge` Maven 模块。
2. 构建时从固定 vendor 源码目录只编译 `WebFilterOrderEnum.java`，不复制源码、不依赖本机 Maven install。
3. 现有 `BearerIdentityFilter` 使用该 RuoYi 常量确定 Spring Filter 顺序。
4. `/actuator/info` 暴露桥接模式、来源版本、固定提交和过滤器顺序，不暴露凭据、账号、业务数据或内部权限清单。

这是一条真实运行时桥接：RuoYi 源类进入现有后端 reactor 和应用 classpath，并参与 Bearer 身份过滤器的实际排序。它只关闭 M2-08 的第一小段，不能据此宣称完整权限、DataScope、审计、管理 UI 或 M2 已完成。

## 为什么先做这一段

- 对现有授权结果零替换，回归面可控。
- 能先验证 3.5.0 主应用与固定 RuoYi 源码在同一 Java 21 reactor 中的兼容方式。
- 不引入上游演示账号、种子 SQL、配置、Spring Security 或 MyBatis-Plus 全量依赖。
- 后续权限、DataScope 和审计桥接可以复用同一独立模块边界，不污染业务模块。

## 版本与来源

- vendor 固定提交：`ec3f7cbf73e88514a70a6b59d365092ee470603d`
- RuoYi revision：`2026.06-SNAPSHOT`
- 当前主应用 Spring Boot：`3.5.0`
- 上游 Spring Boot：`3.5.15`
- 首批源文件 SHA-256：`368d8d470fd5049097b96eaf262725e683cf1926f92e941ab05b1d6da871fdca`

第一批只使用不依赖 Spring Boot API 的常量接口，不将主应用升级到 3.5.15。后续引入 starter 前必须单独完成依赖树和启动回归。

## 回滚

- 从 `BearerIdentityFilter` 移除 RuoYi 顺序常量引用。
- 从 `platform-server` 移除 `ruoyi-runtime-bridge` 依赖。
- 从 backend reactor 移除该模块。

回滚不涉及数据库迁移、账号、Token 或业务数据。

## 后续桥接顺序

1. 基于现有 `system_user_permission` 和 `data_scope` 建立只读兼容适配，先验证权限结果一致。
2. 接入操作审计适配，写入现有审计事实或受控兼容表。
3. 评估通用 SQL DataScope；不得绕过医生端和 `SELF` 范围。
4. 运行时稳定后再接管理 UI；不得导入上游演示账号和默认口令。

## 验证

```bash
./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -am \
  -Dtest=RuoyiRuntimeBridgeTests,BearerIdentityTests \
  -Dsurefire.failIfNoSpecifiedTests=false test
npm run check:phase-two-m2-ruoyi-runtime-bridge
npm run acceptance
git diff --check
```
