# 订单后续需求与验收修复发布（2026-09-03）

状态：`DEPLOYED / PRODUCTION_HEALTH_VERIFIED`。

用户明确要求“提交并部署”。目标为现有正式站 `https://chinesedigitaldental.com`，仓库 `cnacca/zhizhan2026-001-medical-system`。沿用功能分支 → dev → main 的 PR 合并流程，不直接 push main。

## 实际发布结果

- 业务提交：`b92327a2c7257be4d6359e7e968582c592caa4f0`；集成 PR [#58](https://github.com/cnacca/zhizhan2026-001-medical-system/pull/58)、发布 PR [#59](https://github.com/cnacca/zhizhan2026-001-medical-system/pull/59) 均已合并。
- 正式版本：`0eb3ffbabdd686f4ce0ecbeb436649069f10ab09`。
- [Deploy production #33715356521](https://github.com/cnacca/zhizhan2026-001-medical-system/actions/runs/33715356521)：`success`，2026-09-03 12:31:30–12:37:31（UTC+8，约 6 分钟），完整发布通道。
- CI 再次完成 368 项后端回归、发布门禁、双镜像构建/检查、发布包校验、上传、部署与公网 Origin/重定向探针，全部通过。
- 日志确认发布前 MySQL 备份 `20260903T043644Z-auto-deploy-0eb3ffbabdd6/mysql.sql.gz` 已生成并校验；服务端上级路径被 GitHub 脱敏，不将脱敏占位符当作真实路径。
- 回滚镜像：`ai-order-platform-backend:rollback-before-0eb3ffbabdd6-20260903T043644Z` 和对应 frontend 标签。未执行实际回滚或数据库恢复演练。
- 发布后独立公网读取 `/api/bootstrap/health` 返回 `status: ok`；MySQL/Redis/MinIO 仍为原有持续运行的健康容器，未重建数据服务。
- 公网首页和新 JS/CSS 均为 HTTP 200；正式 JS 包含“入检/出检登记”，CSS 包含检验列表 `grid-auto-rows:max-content` 修复。Chrome 能显示登录页，医生测试账号登录响应 200，并进入医生端框架。
- 线上浏览器工作台完整加载复验未完成：自动化多次出现导航超时，进入医生端后在 15–25 秒观察窗仍显示加载中，没有捕获 JS 异常。独立认证接口检查中订单、患者、通知、医生设置、产品、表单配置均 HTTP 200（本次读取约 37–243ms）。这不足以证明四端工作台全部正常，也不足以确定是网络还是页面聚合加载问题；不冒充线上四端浏览器通过，不据此自动回滚数据库。
- 完整工作流日志保留于本地 `/tmp/aiorder-production-33715356521-full.log`。Actions 有 Node action runtime / setup-java v4 弃用警告，本次未阻断；不在此次发布中擅自升级工作流依赖。

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
