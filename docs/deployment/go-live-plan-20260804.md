# 上线方案计划（客户自有服务器）

状态：DRAFT / 2026-08-04
适用目标机：客户服务器 `WIN-JU54VGL7D7K`

## 0. 客户服务器实况

| 项 | 值 | 影响 |
| --- | --- | --- |
| 操作系统 | Windows Server 2016 Standard（build 14393，LTSC） | **决定性约束，见 §1** |
| CPU | Intel Xeon E-2314 @ 2.80GHz | **4 核 4 线程**（无超线程），睿频 4.5GHz，8MB 缓存，65W |
| 内存 | 32.0 GB | 够用，见 §2 |
| 工作组 | WORKGROUP（未加域） | 无需考虑域账号集成 |
| 激活状态 | **Windows 尚未激活** | 上线前必须解决，否则拿不到安全更新 |
| 磁盘 | **7 TB**（类型与 RAID 未知） | 容量充裕；固态/机械与是否冗余仍需确认 |

## 0.5 【2026-08-04 客户回复后的重大变更】部署位置需要重新决策

客户回复了三条，其中一条推翻了「把这台机器当服务器」这个前提。

### 客户回复

| 问题 | 回复 |
| --- | --- |
| 磁盘 | **7 TB** |
| 诊所医生在哪 | **医生是外部的，医生相当于客户** |
| 物流 | **配送基本都是海外的，国内下单再发到国外** |

### 「医生是外部的」意味着系统必须公网可访问

原方案默认医生在工厂局域网内，服务器放工厂机器上即可。医生是外部客户，
就意味着这套系统要**从公网被访问**。而把公网服务放在工厂的一台 PC 上，
在中国大陆有三道现实障碍：

1. **ICP 备案**：域名解析到中国大陆服务器必须完成 ICP 备案，否则会被阻断访问。
   而备案需要**接入服务商**（持证 IDC/云厂商）代为提交——普通商宽/家宽线路
   通常拿不到接入商支持，实际上办不下来。
2. **端口封锁**：中国大陆的家宽与多数商宽默认封禁 80 / 443 入站端口。
3. **固定公网 IP**：多数商宽是动态 IP 或大内网（CGNAT），根本没有可用的公网入口。

这三条任意一条不成立，「工厂 PC 当公网服务器」就走不通。**不是配置问题，是线路性质问题。**

### 「医生基本在海外」的进一步影响（待确认，见下）

如果医生本人也在境外（而不只是货发到境外），还要叠加：

- **跨境网络**：境外诊所往中国大陆的服务器上传口扫 STL（单文件上限 500MB），
  跨境链路拥塞严重，实际可用带宽可能低到让功能不可用。反向（工厂发设计稿给医生）
  受限于工厂线路的**上行**带宽，中国商宽上行通常远低于下行。
- **数据合规**：医疗健康数据属 PIPL 定义的**敏感个人信息**。境外诊所把患者资料传入中国、
  以及中国这边把资料回传境外，两个方向都涉及跨境数据合规，还可能触发对方国家的法规
  （GDPR / PIPEDA / HIPAA 等）。**这需要客户与其海外客户及法务确认，不是技术方案能解决的。**
  注：客户现有系统（家红 / 易美正畸）已有加拿大经销商在用，说明他们**可能已有成熟做法**，
  应先问清楚现在是怎么处理的，而不是当成全新问题。

### 三个候选部署位置

| | 方案 | 备案 | 海外访问速度 | 工厂访问速度 | 客户「自己的电脑当服务器」 |
| --- | --- | --- | --- | --- | --- |
| **甲** | 工厂那台服务器 + 公网暴露 | 需备案，**商宽通常办不到** | 差 | 最好 | ✅ |
| **乙** | 香港 / 新加坡云主机 | **免备案** | 好 | 尚可 | ❌ |
| **丙** | 中国大陆云主机 | 需备案（云厂商可代办，数周） | 差 | 好 | ❌ |

**若医生在境外：推荐乙。** 免备案、海外访问快，工厂访问香港通常也可接受。
工厂那台 32GB / 7TB 的机器改作**异地备份目标**——这恰好补上当前「备份完全没有」的硬缺口，
机器不浪费。

**若医生在境内（只是货发境外）：甲仍可行**，但备案与端口两道障碍依然存在，
需要先确认工厂线路性质。

### 对交期计算的影响（F 批次）

`ordering_rule_config` 里 `SHIPPING_TRANSIT` 的占位值按国内快递设的（快递 2 天）。
**国际快递完全不是这个量级**，且很可能要按目的地国家/地区分别配置。
另外运输类型枚举 `COURIER / SALES_DELIVERY / SELF_PICKUP` 中，
「业务员配送」「自取」对海外客户没有意义，需与客户确认是否要改。

## 0.6 【2026-08-04 补充】客户已有三台境外云服务器

客户提供了现有云主机截图（腾讯云海外轻量）：

| 地区 | 规格 | 系统盘 | IPv4 | 到期 |
| --- | --- | --- | --- | --- |
| 新加坡 | 2 核 2 GB | 50 GB | 119.28.115.239 | **2026-08-18** |
| 硅谷 | 2 核 2 GB | 50 GB | 170.106.140.15 | **2026-08-24** |
| 法兰克福 | 2 核 2 GB | 50 GB | 43.131.63.37 | **2026-08-24** |

### 这改变了什么

1. **全部是 Ubuntu** → §1 关于 Windows Server 2016 的整段论证对这条路线不再适用，
   现有 compose 可直接跑，不需要 Hyper-V 虚机那一层。
2. **全部在境外** → **免 ICP 备案**（备案只针对中国大陆服务器）。
   §0.5 里「工厂 PC 当公网服务器」的三道障碍（备案／端口／公网 IP）一次性绕过。
3. **三个地区正好覆盖亚太／美洲／欧洲**，与「医生基本在海外」吻合；
   客户显然已经在跨境运营，**乙方案不需要说服，他们已经在做了**。

### 一个决定容量结论的架构事实

查代码确认：**文件上传是 presigned URL 前端直传 + 分片上传，不经过后端服务器**
（`FileResourceService` 用 `getPresignedObjectUrl` 与 `createMultipartUploadAsync` 等）。

意味着 500 MB 的口扫 STL **不吃应用服务器带宽**，浏览器直接传对象存储。
这让「应用服务器可以很小、文件另放对象存储」成为可行且推荐的架构。

### 但这三台都跑不动当前的栈

| 项 | 现有规格 | 实际需要 | 差距 |
| --- | --- | --- | --- |
| 内存 | **2 GB** | 后端 JVM 最低 ~2 GB + MySQL 最低 ~2 GB + Redis/nginx/系统 ~1 GB = **最低 5–6 GB** | **必然 OOM** |
| CPU | 2 核 | 2 核勉强可跑轻负载，4 核稳妥 | 偏紧 |
| 磁盘 | **50 GB** | 系统 + Docker 镜像 + MySQL 后剩不到 30 GB；STL 单文件上限 500 MB | **只够存几十个文件** |

**到期时间也很紧**：新加坡剩约两周，另两台剩约三周。

### 推荐目标架构

```
医生浏览器（海外）──presigned 直传──▶ 腾讯云 COS（对象存储，可开全球加速）
        │
        └──API──▶ 应用服务器 1 台（4C8G 起）── MySQL / Redis / 后端 / nginx
                          │
                          └──每日备份──▶ 工厂那台 32G + 7TB 机器（异地备份目标）
```

要点：

- **应用服务器 1 台，4 核 8 GB 起**，放在医生最集中的地区（待确认医生国别分布）。
  数据库是单点，不能多地部署。
- **文件不自建 MinIO，改用腾讯云 COS**：
  - 解决 50 GB 磁盘瓶颈，COS 按量计费无需预估容量；
  - presigned 直传架构下，医生浏览器直连 COS，可开全球加速改善跨境上传；
  - 代码只用了 4 个 MinIO 方法（`bucketExists` / `makeBucket` / `statObject` /
    `getPresignedObjectUrl`）加标准分片上传，**全部是 S3 标准操作**，很可能只改配置不改代码；
  - ⚠️ **必须实测**：已知坑是 COS 的桶名必须是 `<bucketname>-<appid>` 格式，
    否则返回 400；MinIO SDK 的 region／寻址风格也需验证。**这是阶段一要验证的头号事项。**
  - 附带好处：MinIO 是 AGPL 授权，改用 COS 也顺带避开了闭源交付的授权顾虑。
- 工厂那台 32 GB / 7 TB 机器改作**异地备份目标**，补上「备份完全没有」的硬缺口。

### 新增待确认

| # | 问题 | 影响 |
| --- | --- | --- |
| CLOUD-1 | 这三台**现在跑着什么**？是空闲的还是已有业务在用？ | 能不能直接拿来用 |
| CLOUD-2 | 为什么开了三个地区？**医生主要分布在哪些国家**？ | 决定应用服务器放哪个地区 |
| CLOUD-3 | 到期后续费吗？可否升配到 4C8G？ | 两周内到期，需尽快决定 |
| CLOUD-4 | 腾讯云账号下**有没有开通 COS**？ | 文件存储方案 |
| CLOUD-5 | 现有系统（家红/易美）的海外经销商，是不是就用这几台在服务？ | 可直接沿用其做法 |

## 1. 路线选择：为什么必须加一层 Linux 虚机

> **注：本节适用于「把工厂那台 Windows 机器当服务器」的路线。**
> 客户已有三台境外 Ubuntu 云主机（§0.6），若走云主机路线，本节整段不适用。
> 本节保留，用于说明工厂机器为何不能直接跑，以及它作为备份目标时的环境前提。

### 结论

**Windows Server 2016 上无法运行本项目的部署栈。** 必须在其上开 Hyper-V，跑一台 Ubuntu LTS 虚机，
在虚机里运行现有 `deploy/docker-compose.phase-one.yml`。

### 依据

本项目的部署栈全部是 Linux 容器镜像：

```
mysql:8.4   redis:7.4-alpine   minio/minio   eclipse-temurin:21-jre(后端)   nginx:1.27-alpine(前端)
```

微软官方支持策略明确：

- Windows Server 2016 **只支持 Windows 容器**，不支持 Linux 容器；
- **「Linux Containers on Windows (LCOW) 功能在 Windows Server 上已被弃用」**（微软支持策略原文），
  且 LCOW 当年要求 Server **1709** 以上，2016 LTSC（14393）本就不具备；
- Docker Desktop 只支持 Windows 10 / 11，**不支持 Windows Server**；
- WSL2 要求 build 19041 以上，即 **Windows Server 2022** 才有，2016 上没有；
- 连 Windows 容器这条路也是死的：其运行时 Mirantis Container Runtime 自 2023-04-30 起
  微软与 Mirantis 都不再提供支持、更新或补丁。

而 Hyper-V 跑 Linux 客户机是微软官方支持的：**Ubuntu 22.04 LTS 与 24.04 LTS 在
Windows Server 2016 宿主上全功能支持**，LIS（Linux 集成服务）已内建在 Ubuntu 内核中，
无需另装；且 22.04/24.04 的 Generation 2 虚机 **Secure Boot 可直接启用**
（只有 20.04 及更早才有需要关 Secure Boot 的注意事项）。

### 三条路线对比

| | 做法 | 现有部署产物 | 风险 | 结论 |
| --- | --- | --- | --- | --- |
| **A** | Hyper-V + Ubuntu 24.04 LTS 虚机 + 现有 compose | **一行不用改** | 低 | **推荐** |
| B | 服务器重装 Linux | 一行不用改 | 低，但客户机器若还跑别的 Windows 软件则不可行 | 备选，需客户确认 |
| C | Windows 上原生装 MySQL/Redis/MinIO/JRE/nginx | **全部作废，需重写** | 高：Redis 无官方 Windows 版；nginx on Windows 性能差；后端要靠 NSSM 注册服务；所有部署门禁失效 | **不推荐** |

选 A 的核心理由不是「虚机好」，而是 **A 路线下现有的 compose、Dockerfile、nginx 配置、
`check:deployment-env` 门禁全部继续有效**；C 路线要重造一套从未验证过的部署方式，
而我们连在 Linux 上都还没完整跑过一次（见 §3）。

### 一个必须现在就告知客户的事实

**Windows Server 2016 的扩展支持 2027-01-12 到期**（主流支持已于 2022 年结束）。
按本文档写作日期算只剩约 5 个月。到期后不再有安全更新，除非另买 ESU。

这不影响 A 路线的可行性（Ubuntu 虚机自己有更新通道），但意味着：

- 宿主 Windows 会在上线后不久变成一台无补丁的机器，而它是整个系统的物理载体；
- 如果客户能接受，**B 路线（直接重装 Linux）反而是长期成本更低的选择**；
- 若坚持保留 Windows，应在 2027-01 前规划升级到 Windows Server 2022/2025。

这条建议给到客户即可，最终由客户决定，不阻塞本次上线。

## 2. 容量核算

### CPU 是瓶颈，不是内存

Xeon E-2314 是 4 核 4 线程，**没有超线程**。五个容器（MySQL / Redis / MinIO / 后端 / nginx）
加宿主 Windows 与 Hyper-V 本身，全部挤在 4 个线程上。

### 建议分配

| | vCPU | 内存 | 说明 |
| --- | --- | --- | --- |
| 宿主 Windows + Hyper-V | 1 | 6 GB | 保留，不要压到极限 |
| Ubuntu 虚机 | **3** | **26 GB** | 静态内存，不要用动态内存（见下） |

虚机内部：

| 容器 | 内存上限 | 说明 |
| --- | --- | --- |
| MySQL | 8 GB（innodb_buffer_pool_size 设 6G） | 当前 compose 无任何限制，默认 buffer pool 仅 128M，必须调 |
| 后端 JVM | 6 GB | **当前 Dockerfile 无任何 `-Xmx`**，默认取容器内存 1/4，行为不可预期，必须显式设 |
| MinIO | 2 GB | 数据走磁盘 |
| Redis | 1 GB | 配 `maxmemory` 与淘汰策略 |
| nginx | 512 MB | |
| 余量 | 约 8 GB | 页缓存、备份任务、突发 |

### 两个必须在上线前改的现状

1. `deploy/docker-compose.phase-one.yml` **没有任何 `mem_limit` / `cpus`**。
   五个容器互相抢 4 个线程，一次大文件上传或数据导出就可能把 MySQL 挤住。
2. 后端镜像 **没有 JVM 堆参数**。

这两条是本方案要求在阶段一一并修掉的（见 §3 步骤 5）。

### Hyper-V 内存模式

用**静态内存**，不要用动态内存。微软文档明确指出 Linux 客户机的动态内存在客户机内存紧张时
可能失败，且 MySQL/JVM 这类会长期持有大块内存的进程与 ballooning 配合很差。

## 3. 阶段一：本地全链路演练（**必须先做，不可跳过**）

### 为什么这一阶段不能省

**这套 Docker 部署产物从来没有被完整跑起来过。**

证据：2026-08-03 做导出批次时偶然发现，生产 `frontend/nginx.conf` 只代理了 3 个后端前缀，
而前端实际使用 30 个——**管理端 RBAC 控制台在浏览器里一直是坏的**，而后端 333 项测试全绿。
这类缺陷只有真正把整套栈跑起来、用浏览器点一遍才会暴露（已在 D-184 修复）。

`docs/deployment/readiness-checklist.md` 中 `deployment-infrastructure` 至今是 `PARTIAL`。

**预期这一阶段还会发现类似问题。** 把它放在客户服务器上做，等于把调试过程摆在客户面前。

### 环境

一台 Linux 机器（本地物理机、本机虚机或临时云主机均可），装 Docker Engine + Compose v2。
配置向客户服务器看齐：**3 vCPU / 26 GB**——用同等资源跑，才能提前发现 4 核环境下的性能问题。

### 步骤

1. **准备生产环境变量文件**（不进仓库）

   ```bash
   cp deploy/env/phase-one.prod.example /opt/ai-order/.env.prod
   ```

   逐项替换（`replace-with-*` 一个都不能留）：

   | 变量 | 取值方式 |
   | --- | --- |
   | `APP_AUTH_TOKEN_SECRET` | `openssl rand -base64 48`，**生产 profile 会强制校验，留占位值直接启动失败** |
   | `MYSQL_PASSWORD` / `MYSQL_ROOT_PASSWORD` | 各自独立生成，不复用 |
   | `MINIO_ROOT_USER` / `MINIO_ROOT_PASSWORD` | 同上 |
   | `MYSQL_DATABASE` / `MYSQL_USER` / `MINIO_BUCKET` | 定正式名，不要用 `_example` 后缀 |
   | `APP_CORS_ALLOWED_ORIGIN` | 客户实际访问地址（见 §9 待确认） |
   | `FRONTEND_HTTP_PORT` | 默认 8088 |

2. **构建镜像并起栈**

   ```bash
   docker compose -f deploy/docker-compose.phase-one.yml --env-file /opt/ai-order/.env.prod config
   docker compose -f deploy/docker-compose.phase-one.yml --env-file /opt/ai-order/.env.prod build
   docker compose -f deploy/docker-compose.phase-one.yml --env-file /opt/ai-order/.env.prod up -d
   ```

   Flyway 会自动把 V1→V83 全部迁移跑完（当前 83 个迁移）。

3. **四端真实浏览器走查**（这是本阶段的核心，不是可选项）

   四个入口各登录一次，逐页点开。重点是**每一个页面都要看到真实数据**，
   而不是只看页面能打开——nginx 那个缺陷的表现正是「页面能打开、数据拿不到」。

   必须覆盖：医生端下单向导全流程、客服端订单与初审、生产端工作台与工序、
   管理端的 RBAC 控制台 / 下单内容设置 / 数据导出 / 导出留痕 / 账号交接。

   浏览器开发者工具的 Network 面板里**不允许出现返回 `text/html` 的接口请求**。

4. **跑既有校验**

   ```bash
   npm run check:deployment-env      # 含时区固定与代理前缀一致性
   npm run check:openapi
   ```

5. **补齐两个已知缺口**（在演练环境里改完再验证）

   - compose 加 `mem_limit` / `cpus`（按 §2 表）
   - 后端加 JVM 堆参数与容器感知：`JAVA_TOOL_OPTIONS=-Xms2g -Xmx6g -XX:MaxRAMPercentage=75`
   - MySQL 加 `--innodb-buffer-pool-size=6G`
   - Redis 加 `--maxmemory 800mb --maxmemory-policy allkeys-lru`

6. **压一次基本负载**：并发上传若干 100MB+ STL、同时跑一次导出，观察 4 核下的表现。

### 退出条件

- 四端全部页面有真实数据，Network 面板无 HTML 响应
- `check:deployment-env` / `check:openapi` 通过
- 容器重启后数据仍在（验证卷持久化）
- 本阶段发现的问题**全部修复并提交**

## 4. 阶段二：客户服务器准备

### 4.1 前置检查（远程连上后第一件事）

```powershell
# 虚拟化是否可用（Hyper-V 必需）
systeminfo | findstr /i "Hyper-V"
# 磁盘容量与类型
Get-PhysicalDisk | Format-Table FriendlyName, MediaType, Size
Get-Volume | Format-Table DriveLetter, FileSystemLabel, SizeRemaining, Size
# 系统版本
[System.Environment]::OSVersion.Version
```

若 BIOS 里虚拟化被关闭，需要客户配合重启进 BIOS 打开（Intel VT-x + VT-d）。
**这一步可能需要客户现场操作，要提前约时间。**

### 4.2 Windows 侧

1. **激活 Windows**（客户负责，我们只提醒）
2. 启用 Hyper-V 角色：

   ```powershell
   Install-WindowsFeature -Name Hyper-V -IncludeManagementTools -Restart
   ```

3. 电源设置：**高性能，永不睡眠、永不休眠**——这台机器要当服务器用
4. Windows Update：改为**通知但不自动重启**，避免半夜自动重启导致停服
5. 防火墙：只放行前端端口（默认 8088）与远程管理端口

### 4.3 建 Ubuntu 虚机

- 版本：**Ubuntu 24.04 LTS**（微软官方支持列表内，LIS 内建，Gen 2 + Secure Boot 可用）
- 代数：**Generation 2**
- vCPU 3 / 内存 **静态 26 GB**
- 虚拟交换机：**External**（虚机需要和局域网同网段，诊所要直接访问）
- 磁盘：见 §9，容量待定；建议独立 VHDX 放数据盘
- 装好后：

  ```bash
  sudo apt update && sudo apt install -y linux-azure   # 微软建议的调优内核，含最新 LIS
  sudo timedatectl set-timezone Asia/Shanghai          # 与 D-183 的业务时区一致
  ```

- 装 Docker Engine + Compose v2（官方 apt 源）
- 设**静态 IP**，并在虚机内配置开机自启：`docker compose ... up -d` 走 systemd unit 或
  compose 的 `restart: unless-stopped`

## 5. 阶段三：远程部署

### 5.1 远程接入方式（待客户确认，见 §9）

可选：向日葵 / ToDesk（国内常用，客户侧易接受）、AnyDesk、或客户提供 VPN + RDP。
**要求：能拿到宿主 Windows 的桌面，且能持续接入(部署期间可能反复重连)。**

### 5.2 部署方式：离线镜像包，不依赖客户网络拉镜像

客户服务器可能没有稳定的 Docker Hub 访问。**在本地把镜像导出成文件带过去**：

```bash
# 本地（阶段一验证通过的那套镜像）
docker save -o ai-order-images.tar \
  mysql:8.4 redis:7.4-alpine minio/minio:RELEASE.2025-09-07T16-13-09Z \
  ai-order-platform-backend:phase-one ai-order-platform-frontend:phase-one
```

传到客户虚机后：

```bash
docker load -i ai-order-images.tar
docker compose -f docker-compose.phase-one.yml --env-file .env.prod up -d
```

**同时带上**：`deploy/` 目录、`.env.prod`（现场生成密钥，不要用本地的）、
本文档、以及 §7 的回滚脚本。

### 5.3 部署后立即验证

复用阶段一的四端走查清单，在客户机器上再走一遍。
**这一遍必须由我们做完并通过，才交给客户试用。**

## 6. 阶段四：数据初始化与验收

1. **不灌演示数据**。生产库只做迁移，业务数据由客户从管理端录入。
2. **必须先配置的正式数据**（否则系统会给出误导性结果）：
   - **各产品标准制作周期**：`ordering_rule_config` 里目前全是占位值，
     界面显示「日期（待确认）」。走管理端 `PUT /ordering-rules/...` 配置，不改代码。
     **在客户给出真实周期前，不要让医生端对外使用交期功能。**
   - 真实部门 / 班组 / 岗位（管理端组织架构页）
   - 真实人员账号与角色（管理端角色权限页）
   - 产品目录与价格（管理端下单内容设置）
3. **超级管理员账号**：现场创建并由客户本人设置密码，我们不留后门账号。
4. 客户按 `docs/operations/phase-one-role-operation-manual.md` 走一遍四端主流程验收。

## 7. 回滚方案

| 情形 | 处理 |
| --- | --- |
| 容器起不来 | `docker compose down` → 修配置 → `up -d`；数据在具名卷里，不受影响 |
| 迁移失败 | Flyway 单个迁移失败会中止启动。先 `docker compose logs backend` 定位，**不要手工改 flyway_schema_history** |
| 应用有严重缺陷需回退版本 | 保留上一版镜像 tar；`docker load` 旧镜像后改 compose 的 tag 重起。**注意：迁移不可逆，回退镜像不回退数据库** |
| 整机需要重来 | 删虚机重建；数据靠 §8 的备份恢复 |

**因此上线第一天就必须有备份**，见 §8。

## 8. 阶段五：运维交接（上线前必须做完）

| 项 | 现状 | 上线前要求 |
| --- | --- | --- |
| **HTTPS** | **完全没有**。`nginx.conf` 只有 `listen 80` | 医生端要传患者资料与病例照片，**明文 HTTP 不可接受**。需域名 + 证书，或至少内网自签 |
| **备份** | 无 | MySQL 每日 `mysqldump` + MinIO 数据目录快照，**异机保存**（不能只在这一台机器上）。且必须做一次**真实恢复演练** |
| **监控告警** | 无 | 至少：容器存活、磁盘水位、每日备份成功与否 |
| 日志留存 | 无策略 | 配 Docker log rotation，避免撑爆磁盘 |
| 操作手册 | 已有 `docs/operations/` 四份 | 现场培训并签收 |
| UPS | 未知 | 客户自有机器当服务器，断电直接丢事务。建议配 UPS |

**这些不是我这几批的遗留，是项目本来就登记的 `PARTIAL` 缺口**，但部署时会立刻碰到。
其中 **HTTPS 与备份两项我认为是硬门槛**，不做不应该让真实患者数据进系统。

## 9. 待客户确认（阻塞项）

| # | 问题 | 阻塞什么 |
| --- | --- | --- |
| 1 | ~~磁盘容量~~ **已答：7TB**。仍需：固态还是机械？有没有 RAID？ | 容量已够；类型影响 MySQL 性能，RAID 影响单点故障风险 |
| 2 | 这台机器是否**专用**于本系统 | 决定 A 路线还是 B 路线（重装 Linux） |
| 3 | Windows 激活如何处理 | 上线前必须解决 |
| 4 | ~~局域网还是公网~~ **已答：医生是外部客户 → 必须公网**。新问题见 §0.5 | 触发部署位置重新决策 |
| 4a | **医生本人在境内还是境外？**（客户说「好像基本海外」，需确认） | **决定服务器放工厂还是放云上**，是当前最阻塞的一条 |
| 4b | 工厂网络是什么线路？有无固定公网 IP？80/443 通不通？能否备案？ | 决定甲方案是否可行 |
| 4c | 现有系统（家红/易美）的海外经销商现在是怎么访问的？数据合规怎么处理的？ | 很可能已有现成做法可沿用 |
| 5 | 域名与 HTTPS 证书由谁提供 | HTTPS 方案 |
| 6 | 远程接入方式（向日葵/ToDesk/VPN） | 部署执行方式 |
| 7 | 是否接受 2027-01 前升级 Windows Server | 长期支持策略 |
| 8 | 是否有 UPS | 断电风险 |

## 10. 时间估算

| 阶段 | 工作量 | 依赖 |
| --- | --- | --- |
| 阶段一 本地演练 + 修问题 | **1–2 天**（取决于暴露出多少问题） | 无，可立即开始 |
| 阶段二 服务器准备 | 半天 | 客户配合（BIOS、激活、磁盘信息） |
| 阶段三 远程部署 | 半天 | 阶段一通过 |
| 阶段四 数据初始化 | **取决于客户**提供真实数据的速度 | 客户 |
| 阶段五 运维交接（HTTPS/备份/监控） | 1 天 | 域名证书到位 |

**关键路径不在我们这边，在客户的三项输入**：磁盘信息、访问方式与域名证书、真实业务数据
（尤其是各产品标准制作周期）。

## 11. 本方案不改变的事

- Task 8 仍为 `NOT_READY`。本方案是把系统部署到客户服务器上试用，
  不等于一期整体验收通过。
- 真实环境验收、客户/PM 签字、培训签收等 `readiness-checklist.md` 中的
  `EXTERNAL_ACCEPTANCE` 项不因本次部署而关闭。
