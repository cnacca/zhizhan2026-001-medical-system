# 8088 登录与文件链路重新部署检查单（2026-08-11）

状态：`LOCAL_FIX_VERIFIED / SERVER_REDEPLOY_PENDING / NOT_READY`

## 1. 部署前环境变量

以下值必须写入服务器侧不入库的 env 或 secret 管理中，仓库示例值不能直接用于正式环境：

```text
APP_CORS_ALLOWED_ORIGIN=http://43.129.232.106:8088
MINIO_PUBLIC_ENDPOINT=http://43.129.232.106:9000
MINIO_PUBLIC_PORT=9000
MINIO_REGION=us-east-1
```

- 若已经有 HTTPS 域名，应把两个 origin 都换成对应 HTTPS 地址；`APP_CORS_ALLOWED_ORIGIN` 可以用英文逗号配置多个可信前端 origin。
- `MINIO_PUBLIC_ENDPOINT` 必须从最终用户浏览器可达，且签名生成后不能再替换 Host。
- 云安全组、Windows / Linux 防火墙与路由必须允许前端 8088 和文件 API 端口；MinIO 控制台 9001 不应公开。
- 正式部署前必须轮换 Flyway 本地演示账号或停用它们，并注入新的数据库、MinIO、Token 密钥。前端生产包已不再预填或携带演示密码，但这不能代替后端账号轮换。

## 2. 构建与启动前门禁

```bash
npm run build:frontend
npm run check:deployment-bugfixes-20260811
npm run check:task9d4
npm run check:task9d69
npm run check:deployment-env
npm run compose:phase-one:config
```

随后按服务器现有发布流程重新构建 backend / frontend 镜像并执行 compose 更新。不要复用只重启前端容器的方式：BUG-019 的修复位于后端登录控制器，必须部署新后端。

## 3. 部署后最低复测

### CORS / 登录

使用错误密码探测鉴权链路，避免在终端历史中写真实密码：

```bash
curl -i -X POST http://43.129.232.106:8088/api/auth/login \
  -H 'Origin: http://43.129.232.106:8088' \
  -H 'Content-Type: application/json' \
  --data '{"username":"nonexistent-check-user","password":"invalid","portal":"DOCTOR"}'
```

通过标准：响应不再是 `Invalid CORS request`，包含 `Access-Control-Allow-Origin: http://43.129.232.106:8088`，业务鉴权返回 401。再用已轮换的真实账号通过浏览器分别登录四端。

### 文件签名与删除

1. 上传一个测试附件并完成上传。
2. 检查预览 / 下载 URL 的 host 是浏览器可达的文件域名或 `43.129.232.106:9000`，不得出现 `minio:9000`。
3. 删除附件后，用医生、客服、管理员分别请求新预览 / 下载 URL，均应返回 403；文件列表中也不得出现该附件。
4. 删除前已经签发的 URL 可能在原 TTL 内继续有效。本批没有物理删除对象；如要求立即撤销，必须先确认数据保留策略。

### 医生端下单

1. 在有必传 STL / 图片规则的产品上，不上传必传文件直接点击“下一步”，页面必须停留在上传步骤并提示缺失文件。
2. 快速连续点击“下一步”三次，网络面板只能出现一组顺序保存请求，不得出现并发 PUT 与 409。
3. 补齐资料后完成提交，后台仍需保留直接 API 提交门禁。

## 4. 结果边界

只有上述服务器实测完成后，才能把 8088 登录和文件链路写成“线上已恢复”。当前本地代码、测试和 compose 只构成可部署修复，不构成真实环境验收；Task 8 继续保持 `NOT_READY`。
