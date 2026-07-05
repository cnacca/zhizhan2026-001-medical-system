# 9D.79 真实环境文件上传人工验收记录模板第一段

状态：TEMPLATE_READY / PARTIAL。

本模板用于真实测试环境具备后记录文件上传上线验收。当前只提供记录模板，不代表真实环境已验收。

## 基本信息

| 项目 | 记录 |
| --- | --- |
| 验收环境 | 待填写：测试环境 / 正式环境 |
| 验收日期 | 待填写 |
| 验收人员 | 待填写 |
| 代码版本 / commit | 待填写 |
| 前端地址 | 待填写，禁止填写带密钥的 URL |
| 后端地址 | 待填写，禁止填写带密钥的 URL |
| 测试 bucket | 待填写 bucket 名称或脱敏标识，不填写真实密钥 |
| 正式 bucket | 待填写 bucket 名称或脱敏标识，不填写真实密钥 |
| 对象存储账号隔离 | 待填写：测试账号 / 正式账号是否不同 |
| 客户/PM 签字状态：待确认 | 待填写确认人和确认日期 |

## 前置检查

| 检查项 | 期望 | 结果 |
| --- | --- | --- |
| `MINIO_BUCKET` | 测试环境和正式环境不同 | 待填写 |
| 对象存储账号隔离 | 测试环境和正式环境使用不同 access key / secret，记录只写脱敏标识 | 待填写 |
| 文件大小限制 | 与 `FILE_MAX_FILE_SIZE_BYTES` 一致 | 待填写 |
| 文件类型限制 | 与 `FILE_ALLOWED_CONTENT_TYPES` 一致 | 待填写 |
| 单订单文件数量限制 | 与 `FILE_MAX_FILES_PER_ORDER` 一致 | 待填写 |
| 真实密钥 | 不填写真实密钥、不贴真实 token、不贴带签名的长期 URL | 待填写 |

## 人工验收步骤

| 步骤 | 操作 | 期望 | 结果 |
| --- | --- | --- | --- |
| 1 | 医生端登录真实测试环境，创建测试订单。 | 订单创建成功，进入待审核状态。 | 待填写 |
| 2 | 上传允许类型的小文件。 | 上传完成，返回 `file_id`，医生端可绑定到订单。 | 待填写 |
| 3 | 上传超过限制的文件。 | 前端或后端拒绝，不落库为 `COMPLETED`。 | 待填写 |
| 4 | 上传不允许的文件类型。 | 前端或后端拒绝，并显示可理解错误。 | 待填写 |
| 5 | 上传 100MB+ 文件。 | Multipart 上传完成，预览 URL 可短时访问。 | 待填写 |
| 6 | 弱网条件下中断上传。 | 服务端保留 `PENDING` Multipart，可继续恢复。 | 待填写 |
| 7 | 跨设备或跨浏览器恢复同一文件。 | 新设备不依赖旧设备 localStorage，可通过服务端 pending 候选恢复。 | 待填写 |
| 8 | 医生尝试读取其他医生或内部文件。 | 返回 403 或不可见，不泄露内部对象信息。 | 待填写 |
| 9 | 检查测试 bucket。 | 文件对象进入测试 bucket，不进入正式 bucket。 | 待填写 |
| 10 | 检查正式 bucket。 | 未经正式验收授权时不写入正式 bucket。 | 待填写 |

## 推荐命令

```bash
npm run check:task9d67
npm run check:task9d77
npm run check:task9d78
npm run check:task9d79
npm run acceptance
```

本地辅助 smoke：

```bash
npm run smoke:task9d10-large-upload
npm run smoke:task9d10-server-resume
npm run smoke:task9d10-interrupted-resume
npm run smoke:task9d77-file-upload-resilience
```

## 结论

| 项目 | 结论 |
| --- | --- |
| 测试环境文件上传 | 待填写 |
| 正式环境文件上传 | 待填写 |
| 弱网 | 待填写 |
| 跨设备 | 待填写 |
| 测试 / 正式 bucket 隔离 | 待填写 |
| 客户 / PM 结论 | 待确认 |

## 边界

- 不填写真实密钥。
- 不填写真实 access key、secret key、token、长期签名 URL 或客户隐私数据。
- 不代表真实环境已验收。
- 不代表生产对象存储已联调完成。
- Task 8 仍保持 NOT_READY，直到真实环境验收和客户 / PM 书面确认关闭。
