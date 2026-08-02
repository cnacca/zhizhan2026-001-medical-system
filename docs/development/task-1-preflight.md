# 任务 1 前置预检

日期：2026-06-29

## 目标

在正式初始化前后端工程前，确认任务 1 的技术进入条件、可选路线和验收边界。

任务 1 仍然只做项目骨架初始化，不写订单、工序、文件、AI、绩效等业务模块。

## 当前本机环境

已确认可用：

- Node.js：`v24.16.0`
- npm：`11.13.0`
- pnpm：`11.7.0`
- Docker CLI：`Docker version 29.5.3`
- Colima：`0.10.3`

当前不可用：

- Java Runtime：`/usr/bin/java` 存在，但系统提示未安装 Java Runtime。
- Maven：`mvn` 不存在。
- Gradle：`gradle` 不存在。
- Docker daemon：当前 Docker context 为 `colima`，但 Colima socket 不存在，`docker info` 无法连接。

## 可选路线

### 路线 A：本机安装 JDK + Maven

适合：

- 后续要频繁本机调试 Spring Boot / RuoYi-Vue-Pro。
- 希望 IDE、单元测试、热启动体验更顺。

代价：

- 需要在本机安装 JDK 和 Maven。
- 会改变开发机环境，执行前应由用户确认。

任务 1 验收：

- `java -version` 可用。
- `mvn -version` 可用。
- 后端可本机启动。
- 前端可本机启动。
- MySQL、Redis、MinIO 可通过 Docker Compose 启动。

### 路线 B：Docker 优先构建后端

适合：

- 暂时不想改本机 Java/Maven 环境。
- 希望本地环境更接近部署环境。

代价：

- 首次构建更慢。
- IDE 内调试体验弱于本机 JDK + Maven。
- 仍需选择基础镜像、Maven 缓存策略和容器内启动方式。

任务 1 验收：

- Docker 可运行。
- 如使用当前 Colima context，需要先启动 Colima，并确认 `docker info` 成功。
- 后端通过容器构建或容器内 Maven 运行。
- 前端可本机启动或容器启动。
- MySQL、Redis、MinIO 可通过 Docker Compose 启动。

### 路线 C：先落文件骨架，暂缓后端可运行验收

适合：

- 只想先固定目录、模块、环境变量模板和 Compose 文件。
- 后端运行环境暂时无法处理。

代价：

- 不满足任务 1 的完整验收标准。
- 只能标记为“部分完成”，不能进入依赖可运行后端的业务任务。

任务 1 验收：

- 可以完成目录结构、配置模板和 README。
- 不能证明后端启动、登录和数据库连通。

## 推荐

默认推荐路线 A：本机安装 JDK + Maven，再初始化完整骨架。

后端推荐基线：

- RuoYi-Vue-Pro `master-jdk17` 系列。
- JDK 21 优先；如兼容性需要，可退到 JDK 17。
- Maven 版本大于等于 `3.5.4`。

原因：

- 任务 1 的验收标准包含“本地能启动前后端”和“基础登录可运行”。
- 后续任务 2-8 会大量依赖后端编译、迁移、测试和调试。
- Docker 仍可用于 MySQL、Redis、MinIO，以及后续部署验收。
- 当前项目是新建系统，没有历史 JDK 8 包袱；采用 RuoYi-Vue-Pro 的 JDK 17/21 线更适合后续 Spring Boot 3.x 维护。

如果用户不想改本机环境，则选择路线 B，并把后端 Maven 构建固定到容器内。

更详细的执行清单见：`docs/development/task-1-execution-checklist.md`。

## 进入任务 1 前需要确认

- 选择路线 A、B 还是 C。
- 如果选路线 A，JDK 版本建议使用 17 或 21；需结合 RuoYi-Vue-Pro 当前版本确认。
- 如果选路线 B，后端构建是否允许完全容器化。
- 如果选路线 B，是否允许启动 Colima 或改用 Docker Desktop/default context。
- 是否直接以 RuoYi-Vue-Pro 作为后端基线，还是先建立最小 Spring Boot 模块化骨架再接入 RuoYi。
- 是否确认使用 RuoYi-Vue-Pro `master-jdk17` 系列作为任务 1 后端基线。

## 不在本预检中执行

- 不安装 JDK/Maven。
- 不初始化 Vue / Spring Boot / RuoYi 工程。
- 不创建业务模块。
- 不写数据库迁移。
- 不接入真实 DeepSeek Key、MinIO 密钥或数据库密码。

## 预检命令

```bash
java -version
mvn -version
gradle -version
node -v
npm -v
pnpm -v
docker --version
docker context ls
docker info
```
