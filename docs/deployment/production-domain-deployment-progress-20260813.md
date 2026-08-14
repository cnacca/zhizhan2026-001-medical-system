# 正式域名部署进度记录（2026-08-13）

状态：`IN_PROGRESS / DNS_READY / HTTPS_READY / RUNTIME_ENV_READY / BUSINESS_ACCEPTANCE_PENDING / NOT_READY`

用途：记录 `chinesedigitaldental.com` 正式域名部署的已核实事实、已经执行的安全准备、当前风险和下一步。新会话继续部署时先读本文件，再读 `8088-redeployment-checklist-20260811.md`。

## 一、当前目标与实时结果

| 用途 | 目标地址 | 当前结果 |
| --- | --- | --- |
| 系统访问 | `https://chinesedigitaldental.com` | DNS 与 HTTPS 已生效；正式登录页可打开，CORS 预检返回允许主域名 |
| 系统别名 | `https://www.chinesedigitaldental.com` | CNAME 与证书已生效；仍需纳入完整浏览器复测 |
| 文件访问 | `https://files.chinesedigitaldental.com` | DNS、证书与 Nginx 路由已完成；MinIO 健康接口可达，上传/预览/下载仍待业务验收 |

宿主 Nginx 当前将系统域名反向代理至 `127.0.0.1:8088`，将文件域名反向代理至正式 `phase-one` MinIO 的 `127.0.0.1:19000`。MinIO 管理控制台 `9001` 不作为正式域名入口，也不应对公网开放。

## 二、已核实的服务器现状

以下事实来自 2026-08-12 至 2026-08-13 在腾讯云 OrcaTerm 中执行的检查、用户截图和公网请求验证：

| 项目 | 已核实结果 |
| --- | --- |
| 云主机 | 腾讯云轻量应用服务器 `Ubuntu-xIK2`，中国香港 |
| 公网 IP | `43.129.232.106` |
| 操作系统 | Ubuntu 24.04.4 LTS |
| 配置 | 4 核 CPU、约 7.5 GiB 内存、178 GiB 系统盘，检查时约 17 GiB 已用 |
| 登录 | `ubuntu` 用户，可执行 `sudo`；当前通过腾讯云 OrcaTerm 登录 |
| Docker | Docker 29.7.2、Docker Compose v5.4.0 |
| 宿主 Nginx | 已运行；正式系统域名与文件域名的 HTTP 站点已加载，配置检查通过 |
| 当前旧入口 | `http://43.129.232.106:8088`，暂未关闭 |
| 当前运行代码目录 | `/home/ubuntu/zhizhan2026-001-medical-system` |
| 当前 Compose 文件 | `/home/ubuntu/zhizhan2026-001-medical-system/deploy/docker-compose.phase-one.yml` |
| 当前 Compose 项目 | `deploy` |

当前正式运行容器为：

- `ai-order-frontend`
- `ai-order-backend`
- `ai-order-phase-one-mysql`
- `ai-order-phase-one-redis`
- `ai-order-phase-one-minio`

检查时以上容器均在运行，MySQL、Redis、MinIO 健康检查通过。数据库、Redis 和 MinIO 分别使用以下 Docker volume：

- `deploy_phase-one-mysql-data`
- `deploy_phase-one-redis-data`
- `deploy_phase-one-minio-data`

服务器还存在另一套 `ai-order-mysql / ai-order-redis / ai-order-minio` 容器，并把 `3306 / 6379 / 9000 / 9001` 暴露到宿主。该套容器用途尚未确认，部署期间不得误删。公网探测已确认 `3306 / 6379 / 8088 / 9000 / 9001` 当前均可连接，正式安全收口时必须在腾讯云防火墙关闭不必要入口；`22` 应尽量限制为可信来源，`80 / 443` 保留为正式网站入口。

## 三、已完成工作

### 1. 首次非停机备份

备份目录：

```text
/home/ubuntu/deployment-backups/20260812-230011
```

已备份当前 Git 状态及未提交改动、服务器 `.env`、MySQL 逻辑数据、MinIO 数据卷和 Redis 数据卷，并生成关键校验和。备份总大小约 250 MiB，归档已完成基本可读性检查，但**尚未执行真实恢复演练**，也尚未形成自动化、异地副本和保留策略，因此备份硬门槛仍未关闭。

### 2. 服务器脏工作区已隔离

原运行目录位于 `feature/project-skeleton@ff1e72cd`，存在 5 个已修改文件和 1 个未跟踪配置目录，相关内容已纳入备份。后续禁止在该目录直接 `git pull` 或强制覆盖。

### 3. 私有仓库与只读部署密钥

当前本地 `dev` 已推送至：

```text
https://github.com/cnacca/zhizhan2026-001-medical-system
```

本地与远程 `dev` 均指向：

```text
2fea96afc00c65f2df6266077e7da1f610ed39b6
```

服务器已创建 GitHub 只读 deploy key，并成功只读验证远程 `dev`。已建立干净代码副本：

```text
/home/ubuntu/releases/ai-order-2fea96af
```

该目录只是经过提交 SHA 校验的干净代码副本，**没有启动新容器、没有切换运行版本、没有覆盖现有数据库或文件**。

### 4. 正式 MinIO 本机入口

为避免误连宿主 `9000` 上的另一套 MinIO，已新增独立 Compose override：

```text
/home/ubuntu/deploy-overrides/minio-loopback.yml
```

正式 `ai-order-phase-one-minio` 现在额外映射：

```text
127.0.0.1:19000 -> 容器 9000
```

操作只重建了正式 MinIO 容器，继续挂载原 `deploy_phase-one-minio-data` 数据卷。`http://127.0.0.1:19000/minio/health/live` 已返回 200。后续任何 Compose 维护命令必须同时带上该 override，避免重建后丢失 loopback 映射。

### 5. Nginx HTTP 域名站点

已创建并启用：

```text
/etc/nginx/sites-available/chinesedigitaldental.com
/etc/nginx/sites-enabled/chinesedigitaldental.com
```

当前路由：

- `chinesedigitaldental.com` 与 `www.chinesedigitaldental.com` → `127.0.0.1:8088`；
- `files.chinesedigitaldental.com` → `127.0.0.1:19000`；
- 文件路由保留原始 Host，关闭请求/响应缓冲，并允许 600 MiB 请求体；
- 系统路由包含 WebSocket 转发头。

`nginx -t` 已通过，Nginx 已重载。本机 Host 路由和公网 HTTP 请求均已验证：系统首页返回 200 / 488 bytes，文件域名 MinIO 健康接口返回 200。

### 6. GoDaddy DNS 已生效

GoDaddy 停放页 `A @ Parked` 已删除，当前目标记录为：

```text
A      @       43.129.232.106
A      files   43.129.232.106
CNAME  www     chinesedigitaldental.com
```

2026-08-13 已分别通过 Google Public DNS 和 Cloudflare DNS 确认：主域名与文件域名只解析到 `43.129.232.106`，`www` 指向主域名；原停放页地址 `3.33.130.190 / 15.197.148.33` 已消失。

### 7. HTTPS、正式运行变量与后端重启（2026-08-14）

- 腾讯云轻量应用服务器防火墙已开放 `443`；
- Certbot 已为主域名、`www` 和 `files` 签发并安装证书，证书文件位于 `/etc/letsencrypt/live/chinesedigitaldental.com/`；签发时显示到期日为 `2026-11-11`；
- `certbot.timer` 为 active，`certbot renew --dry-run` 的模拟续期已成功；
- Nginx 配置检查通过，三个域名已启用 HTTPS；
- 服务器 `.env` 已改为 `APP_CORS_ALLOWED_ORIGIN=https://chinesedigitaldental.com` 和 `MINIO_PUBLIC_ENDPOINT=https://files.chinesedigitaldental.com`，并已只重建后端容器；
- 正式域名 CORS 预检返回 200，响应包含 `Access-Control-Allow-Origin: https://chinesedigitaldental.com`；
- 浏览器已打开正式域名医生登录页，但这只证明入口与静态页面可用，不等于四端业务验收完成。

### 8. 客服创建客户 403 热修复（2026-08-14）

- 正式库已幂等补授 `CS -> clinic:create`，记录数由 0 增至 1；执行前已备份 `system_role_permission` 至 `/home/ubuntu/deployment-backups/20260814-153643-cs-hotfix/system_role_permission.sql`；
- 正式前端使用独立分支 `fix/cs-clinic-create-permission@24cfd5dc` 的本地验证构建产物，镜像 revision 为 `24cfd5dc7b91004b3c2713d74e2775be4186eb84`；原镜像保留为 `ai-order-platform-frontend:rollback-before-cs-24cfd5dc`；
- 公网首页已加载新资源 `index-Dq0JlSMO.js`，`/api/bootstrap/health` 返回 `status=ok`，正式域名 CORS 预检返回 200；一期前端、后端、MySQL、Redis、MinIO 容器均正常；
- 使用服务器内短时 CS Bearer 和空 JSON 请求体调用 `POST /clinics` 返回 400 而不是 403，证明请求已越过权限门禁并进入参数校验；该探测未创建客户数据；
- 客服浏览器刷新后会退出当前会话，仍需重新登录获取最新权限，并使用真实表单完成一次建档复测。该热修复不代表四端业务验收或 Task 8 已完成。

## 四、医生端产品点击问题

在当前 `http://43.129.232.106:8088` 页面中，医生选择患者后点击具体产品没有反应。浏览器证据显示点击路径调用 `crypto.randomUUID()`，但普通 HTTP IP 页面不属于浏览器安全上下文，导致该 API 不可用并抛出异常。

当前 `dev` 仍有 7 处前端 `crypto.randomUUID()` 调用，涉及医生下单、医生门户和生产设计提交。使用正式 HTTPS 域名后浏览器会具备安全上下文，预计可解除当前点击阻塞；但这仍是待真实浏览器验证的推断，不能在 HTTPS 和业务复测前写成“已修复”。如果继续保留 HTTP IP 入口，相同风险仍会存在。

## 五、仍待完成

### 1. 代码版本与功能边界

干净发布目录已用于构建 `dev@2fea96af` 的后端镜像并重启后端；客服权限热修复前端现有独立来源链 `fix/cs-clinic-create-permission@24cfd5dc`。当前 `fix/doctor-order-delete-cancel` 的订单删除 / 取消申请改动仍只在本地脏工作区，未提交、未合并、未部署，不能把正式域名可访问写成该功能已上线。

### 2. 公网端口安全收口

2026-08-14 的腾讯云防火墙截图确认仍允许公网 `8088 / 8080 / 22`，并允许 `80 / 443`。业务验收通过后：

- 保留公网 `80 / 443`；
- 将 `22` 限制为可信来源；
- 关闭公网 `8088 / 8080`；
- 再核对是否存在 `3306 / 6379 / 9000 / 9001` 公网规则；若存在则关闭；
- 收口后从公网复测正式域名，确认网站和文件服务仍可用。

### 3. 真实业务验收

至少完成：

1. 四端登录与 CORS；
2. 医生选择患者后，逐项点击所有具体产品；
3. 必填步骤门禁与快速连续点击；
4. 文件上传、预览、下载、断点恢复与删除后拒绝签发新链接；
5. WebSocket / 通知；
6. 数据库和上传文件仍为原数据；
7. Nginx、前后端及三项数据服务健康状态；
8. HTTPS、证书续期与公网端口检查；
9. 一次真实备份恢复演练。

## 六、当前边界

- 已完成 DNS、三域名 HTTPS、证书续期 dry-run、正式 CORS / 文件地址和后端重启，不等于正式上线完成。
- 正式登录页与 CORS 预检通过，不等于四端登录、产品选择、文件、WebSocket 和状态流转已验收。
- 医生端产品点击故障预计由 HTTPS 安全上下文解除，但仍必须逐个产品真实点击复测后才能写成已修复。
- 订单删除 / 取消申请的新改动尚未提交、合并或部署，详见 `../development/doctor-order-delete-cancel-handoff-20260814.md`。
- 首次手工备份不等于自动备份体系完成，未做恢复演练也不能证明可恢复。
- 域名部署完成不等于一期 38 项总体验收完成。
- Task 8 必须继续保持 `NOT_READY`，直至真实环境验证和其余交付条件关闭。

## 七、下一步唯一执行入口

1. 按本文件第五节及 `8088-redeployment-checklist-20260811.md` 完成四端真实浏览器与文件全链路复测；
2. 验证医生选择患者后能逐项点击所有具体产品，并留存浏览器 / API 证据；
3. 验证 WebSocket / 通知和原数据库、上传文件未受影响；
4. 复测通过后关闭公网 `8088 / 8080`，限制 `22` 来源，并复核数据端口规则；
5. 执行一次真实备份恢复演练并记录 RTO / RPO、校验和与恢复结果；
6. 订单删除 / 取消申请功能作为独立后续变更测试、提交、合并和部署，不与本次域名基础部署混写。
