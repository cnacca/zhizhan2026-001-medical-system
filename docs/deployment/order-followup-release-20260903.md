# 订单后续需求与验收修复发布（2026-09-03）

状态：`PRE_RELEASE_VERIFIED / DEPLOYMENT_PENDING`。

用户明确要求“提交并部署”。目标为现有正式站 `https://chinesedigitaldental.com`，仓库 `cnacca/zhizhan2026-001-medical-system`。沿用功能分支 → dev → main 的 PR 合并流程，不直接 push main。

## 发布范围

- D-217 订单标识、交期、收货确认、医生追加资料、文件预览、组长受控派工与四端工作台。
- D-218 来源快照校准、按产品分区上传、派工状态与 UI、人工入检/出检登记、下方工作台跳转与预览入口补齐。
- 本次验收追加修复：检验任务长列表按内容自动行高，防止文字越界重叠。
- 包含 V96–V98 增量迁移；不修改已发布的 V1–V95，不删除订单/历史附件/审计记录。既有后端业务规则按已确认需求生效，不手工改写正式业务数据。

## 发布前验证

- 前端类型检查与生产构建通过。
- 独立测试库 `ai_order_refinements_20260903_test` 的完整后端测试：368 项，0 失败、0 错误、0 跳过。
- 真实 Chrome 本地验收：10 项全部通过（52.2 秒），含三种视口下检验任务文字边界、实际 STL 上传/分类/预览、混合产品资料入口和四端下方工作台跳转。
- 发布工作流同款门禁、OpenAPI、Compose 校验通过；64 项订单规则、来源基线与新增验收细化检查通过。
- 77 个待提交文件的敏感文件名、私钥、GitHub token 和 API key 模式检查未发现命中；无 `.env` 或真实密钥待提交。
- 本地日志：`/tmp/aiorder-release-backend-20260903.log`、`/tmp/aiorder-release-gates-20260903.log`、`/tmp/aiorder-release-browser-20260903.log`。

## 部署与回退边界

- 因包含后端、迁移、脚本和依赖，本次必须使用完整发布通道；保留 CI 全量回归、不可变镜像和 SHA-256 校验。
- 自动流程在替换容器前完成 MySQL 备份，并保留上一版前后端回滚镜像；不重建 MySQL/Redis/MinIO，不删除 volume。
- 健康失败不自动回退数据库结构，不 repair Flyway 历史；根据失败阶段和兼容性另行判断。
- 发布成功后记录 PR、revision、Actions 结果及公网只读验证。技术部署不代表客户逐项验收或一期全部完成；Task 8 仍为 `NOT_READY`。
