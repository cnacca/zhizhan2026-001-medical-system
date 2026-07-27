# RuoYi-Vue-Pro Core Source

本目录是一期后端底座迁移使用的真实 RuoYi-Vue-Pro 核心源码，来源、提交和归档校验值固定在 `UPSTREAM.lock`。

## 已引入范围

- `yudao-dependencies`
- `yudao-framework`
- `yudao-module-infra`
- `yudao-module-system`
- `yudao-server`
- 上游 Lombok 构建契约：`lombok.config`
- MySQL Quartz DDL
- 去除所有 `INSERT` 演示数据后的 MySQL schema：`sql/mysql/ruoyi-vue-pro-schema-only.sql`
- 上游 MIT 许可证：`LICENSE.upstream`

商城、CRM、ERP、IoT、MES、WMS、BPM、支付、会员、报表、公众号、IM、AI 等一期无关模块没有引入。

## 安全处理

上游 `application.yaml`、`application-local.yaml`、`application-dev.yaml` 和完整演示 SQL 含硬编码示例密钥、第三方账号或默认口令，因此没有复制到本项目。

本目录的 `yudao-server/src/main/resources/application.yaml` 是项目本地新增的无凭据配置入口，只接受环境变量。schema-only SQL 只保留上游 DDL，不包含账号、角色、菜单、第三方客户端或演示业务数据。上游文件预签名响应的 OpenAPI 示例 URL 也已改为 `example.com` 占位，避免保留示例 access key 和签名。

## 当前接入状态

源码已可作为独立 Maven reactor 编译，但尚未加入现有 `backend/pom.xml`，也没有替换现有登录、Token、菜单、DataScope 或业务授权结果。这样可以在角色权限方案暂缓期间，先完成真实源码和依赖基线落地。

角色、菜单、权限码和 DataScope 的业务分配必须在后续独立决策通过后再迁移。

## 验证

```bash
./scripts/with-jdk21.sh mvn \
  -f vendor/ruoyi-vue-pro-core/pom.xml \
  -DskipTests \
  -Dmaven.javadoc.skip=true \
  package

npm run check:ruoyi-core-foundation
```

若要启动 `yudao-server`，必须显式提供独立数据库和 Redis 环境变量，并先执行 schema-only DDL。不得复用生产数据，也不得把该独立服务视为现有业务服务已经迁移完成。
