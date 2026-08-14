# 提交后自动部署正式站

状态：`IMPLEMENTED_LOCALLY / NOT_ENABLED / NOT_VERIFIED_ON_SERVER`

本方案在代码合并到 `main` 后，由 GitHub Actions 构建前后端镜像并通过 SSH 部署到正式服务器。它不会把真实密钥写入仓库，也不会在服务器上临时编译源码。

当前只完成本地工作流、服务器部署脚本和静态校验。GitHub secrets、服务器部署账号、首次手工运行及真实回滚演练尚未配置或验证；Task 8 继续保持 `NOT_READY`。

## 触发边界

- 自动触发：`main` 收到 push，且仓库变量 `PRODUCTION_AUTO_DEPLOY_ENABLED=true`。
- 手工触发：GitHub Actions 页面从 `main` 执行 `Deploy production`；功能分支即使手工选择也不会进入部署 job。
- 并发：同一时间只允许一个正式部署；新的提交不会取消正在进行的发布。
- 环境：工作流固定使用 GitHub `production` environment。建议只允许受保护的 `main` 部署，并配置 required reviewer 完成首次验证。
- `dev`、功能分支和 pull request 不会部署正式站。

## 发布过程

1. 校验 acceptance、部署环境、8088 修复、Compose 和前端生产构建。
2. 用 Java 21 打包后端，用 Node 22 / pnpm 11.7.0 构建前端。
3. 构建以完整 Git SHA 标记的两个 Docker 镜像。
4. 对源码归档和镜像归档生成 SHA-256 校验文件。
5. 通过已知主机指纹校验的 SSH 连接上传发布包。
6. 服务器获取互斥锁、复核校验和、渲染正式 Compose 配置。
7. 在变更容器前执行 MySQL 单事务逻辑备份并校验 gzip。
8. 保留当前前后端镜像为 `rollback-before-<sha>-<timestamp>`。
9. 加载新镜像，以 `--no-deps` 只强制重建 backend / frontend，不重建 MySQL、Redis、MinIO，也不删除 volume。
10. 等待 Compose 和 loopback HTTP 健康检查通过，再记录当前 revision。

前端镜像构建固定使用 pnpm 11.7.0，并以 frontend workspace 作为安装过滤目标。由于当前仍共享根锁文件，冷构建会解析部分根 workspace 依赖元数据，首次构建速度仍受 npm 网络影响；这属于效率问题，不应通过放宽 lockfile 校验规避。

部署脚本不会执行 `docker compose down -v`、删除 bucket、清理历史 release 或修改 Flyway 历史。健康检查失败时也不会自动回退数据库 schema；日志会输出备份位置和上一版镜像标签，由负责人按迁移兼容性判断回滚。

脚本也不会自动删除旧 release、备份或 rollback image。启用连续部署后必须监控服务器磁盘水位；在真实恢复和回滚演练通过、保留周期得到确认前，不应加入自动清理命令。

## GitHub 配置

在仓库 Settings 中创建名为 `production` 的 environment，限制为受保护的 `main`。首次上线建议配置 required reviewer。

添加以下 environment secrets（也可使用 repository secrets）：

| 名称 | 内容 |
| --- | --- |
| `PRODUCTION_SSH_HOST` | 正式服务器主机名或 IP |
| `PRODUCTION_SSH_USER` | 仅用于部署的 Linux 用户 |
| `PRODUCTION_SSH_PRIVATE_KEY` | 对应部署用户公钥的独立 Ed25519 私钥 |
| `PRODUCTION_SSH_KNOWN_HOSTS` | 已通过可信渠道核对指纹的 known_hosts 记录 |

不要在 CI 中临时用 `ssh-keyscan` 接受未知主机。部署私钥不要复用服务器现有的 GitHub deploy key。

确认首次手工部署和回滚点有效后，再添加 repository variable：

```text
PRODUCTION_AUTO_DEPLOY_ENABLED=true
```

## 服务器首次配置

1. 为 CI 创建独立 SSH 密钥对，将公钥加入部署用户的 `~/.ssh/authorized_keys`；私钥只放入 GitHub secret。
2. 确保部署用户可以运行 Docker，但不能通过该权限扩大到无关主机或环境。
3. 创建服务器配置：

   ```bash
   install -d -m 700 "$HOME/.config/ai-order-platform"
   cp deploy/production-deploy.example.conf "$HOME/.config/ai-order-platform/deploy.conf"
   chmod 600 "$HOME/.config/ai-order-platform/deploy.conf"
   ```

4. 核对配置中的 release、正式 `.env`、MinIO loopback override、备份目录和 loopback 健康地址。正式 `.env` 继续留在服务器，不上传 GitHub。
5. 保证部署用户对 release / backup 目录有写权限，对正式 env 与 override 只有读取权限。

## 首次启用顺序

1. 保持 `PRODUCTION_AUTO_DEPLOY_ENABLED` 未设置。
2. 从 GitHub Actions 手工执行一次 `Deploy production`。
3. 核对四端登录、患者与产品选择、文件上传/预览/下载、WebSocket、通知和原数据。
4. 记录 MySQL 备份路径和两个 rollback image tag，实际演练一次回滚。
5. 首次验证通过后再启用 repository variable。

## 本地验证

```bash
npm run check:production-auto-deploy
npm run check:deployment-env
npm run compose:phase-one:config
```
