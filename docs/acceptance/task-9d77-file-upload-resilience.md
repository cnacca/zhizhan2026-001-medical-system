# 9D.77 文件上传弱网 / 跨设备验收第一段

本文件记录 9D.77 对 `file-upload-prod` 缺口的第一段本地验收闭环。它不新增业务接口，不接真实对象存储，不替代客户签字，不代表真实生产对象存储联调完成。Task 8 仍保持 NOT_READY。

## 目标

- 用本地 Playwright smoke 模拟弱网限速 / 断网场景。
- 用两个独立浏览器 context 模拟跨设备续传：设备 A 上传中断并留下服务端 pending Multipart，设备 B 没有设备 A 的 `doctor-order-upload:` localStorage，仍能通过服务端 pending 候选恢复同一 `file_id` 并完成上传。

## 非目标

- 不做真实物理弱网、真实移动设备或跨城市网络验收。
- 不接真实生产 MinIO / S3 bucket。
- 不做完整 Uppy Dashboard、并发调优、断点续传策略重构或独立 Tus/tusd 服务。
- 不把客户最终 Multipart 限制签字、测试/正式 bucket 实际隔离验收写成已完成。

## 验收命令

静态检查：

```bash
npm run check:task9d77
```

本地浏览器 smoke：

```bash
npm run smoke:task9d77-file-upload-resilience
```

可选参数：

```bash
TASK9D77_CROSS_DEVICE_UPLOAD_SIZE_BYTES=6291456
TASK9D77_WEAK_NETWORK_DELAY_MS=250
TASK9D77_TIMEOUT_MS=180000
TASK9D77_FRONTEND_URL=http://127.0.0.1:5173
TASK9D77_BROWSER_CHANNEL=chrome
```

## 当前证据

- `scripts/smoke-task-9d77-file-upload-resilience.spec.mjs` 使用设备 A / 设备 B 两个 browser context。
- 设备 A 对 PUT 分片增加 `TASK9D77_WEAK_NETWORK_DELAY_MS` 延迟，并在第 2 个 PUT 模拟 `internetdisconnected`。
- 设备 A 中断后断言服务端 `/files/{fileId}/multipart/status` 仍为 `PENDING`，且已有 1 个完成分片。
- 设备 B 从空 localStorage 开始，搜索同一订单，选择同一文件，通过 `/files/multipart/pending` 候选恢复，并完成同一 `file_id`。

## 剩余缺口

- 真实弱网限速 / 断网物理环境验收仍未完成。
- 真实跨设备、跨浏览器、跨网络续传仍未完成。
- 客户最终 Multipart 限制签字仍未完成。
- 测试 / 正式 bucket 实际隔离验收仍未完成。
