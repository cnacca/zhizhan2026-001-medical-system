# 任务 1 执行清单

日期：2026-06-29

## 任务定位

任务 1 只初始化工程骨架和本地开发基础设施，不写业务模块。

本清单用于在路线确认后直接执行，避免进入任务 1 时重新讨论范围。

## 推荐基线

推荐后端基线：

- RuoYi-Vue-Pro：优先使用支持 Spring Boot 3.x 的 `master-jdk17` 系列。
- JDK：优先 JDK 21；如兼容性需要可退到 JDK 17。
- Maven：不低于 `3.5.4`。

依据：

- RuoYi-Vue-Pro 官方仓库说明 `master-jdk17` 分支支持 JDK 17/21 和 Spring Boot 3.5。
- RuoYi-Vue-Pro 官方快速启动文档要求 Maven 版本大于等于 `3.5.4`。
- 当前项目是新建一期系统，没有历史 JDK 8 包袱；使用 JDK 17/21 分支更利于后续 Spring Boot 3.x 生态维护。

推荐前端基线：

- Vue3。
- Element Plus。
- pnpm 作为默认包管理器。

## 路线 A：本机 JDK + Maven

### 开始前检查

```bash
java -version
mvn -version
node -v
npm -v
pnpm -v
```

期望：

- Java 可用，版本为 17 或 21。
- Maven 可用，版本大于等于 3.5.4。
- Node/npm/pnpm 可用。

### 骨架范围

- 后端以 Spring Boot / RuoYi-Vue-Pro 模块化单体为基线。
- 前端以 Vue3 + Element Plus 为基线。
- Docker Compose 只承载 MySQL、Redis、MinIO 等基础服务。
- 增加 `.env.example`，只写占位值，不写真实密钥。
- 建立 README 中的真实启动、检查、验收命令。

### 验收命令

```bash
mvn -version
node -v
pnpm -v
docker info
docker compose config
```

任务完成后还需补充实际工程命令，例如：

```bash
mvn test
pnpm install
pnpm build
```

具体命令以任务 1 实际落地的工程目录为准。

## 路线 B：Docker 优先后端

### 开始前检查

```bash
docker context ls
docker info
node -v
pnpm -v
```

如果当前使用 Colima：

```bash
colima status
```

若未运行，需要用户确认后再启动 Colima。

### 骨架范围

- 后端 Maven 构建和运行放入容器或构建镜像中。
- 本机只要求 Node/npm/pnpm 可用。
- Docker Compose 同时承载后端、MySQL、Redis、MinIO，或至少承载基础服务和构建环境。

### 风险

- 首次拉取镜像和构建较慢。
- IDE 内本机调试成本更高。
- Maven 缓存、镜像层和容器网络需要额外维护。

## 路线 C：文件骨架优先

### 适用条件

只在用户明确接受“任务 1 部分完成”时使用。

### 可完成

- 固定目录结构。
- 固定模块命名。
- 固定 `.env.example`。
- 固定 Docker Compose 草案。
- 固定 README 启动占位说明。

### 不可验收

- 不能证明后端可启动。
- 不能证明基础登录可运行。
- 不能证明 MySQL、Redis、MinIO 与后端连通。

## 任务 1 不允许做的事

- 不实现订单、工艺流、文件、AI、绩效等业务接口。
- 不写真实密钥。
- 不绕过 RuoYi 权限体系。
- 不把医生端脱敏、安全读模型、AI 工具白名单延后到页面层临时处理。
- 不删除 `.local-context/` 源文档。

## 完成时必须更新

- `STATUS.md`：记录实际路线、完成情况、未完成事项。
- `DECISIONS.md`：把路线选择从待确认改为已确认。
- `tasks/README.md`：更新任务 1 状态、验收结果和未完成原因。
- `README.md`：写入真实启动命令、检查命令、环境变量说明。

## 参考

- RuoYi-Vue-Pro GitHub：`https://github.com/YunaiV/ruoyi-vue-pro`
- RuoYi-Vue-Pro 快速启动文档：`https://doc.iocoder.cn/quick-start/`
