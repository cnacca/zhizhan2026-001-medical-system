# Codex Token 成本治理

本方案用于 `/Users/yuri/Documents/AI智能下单平台` 的持续开发，目标是在不牺牲验收质量的前提下，避免长会话反复携带大上下文，把单日 token 推到不可控量级。

## 会话边界治理

- 一个执行会话只做一个明确闭环，例如一个 `9D.xx` 第一增量。
- 完成后输出接力摘要，下一步优先开新会话继续。
- 单会话请求累计超过 2000 万 token，或单次上下文超过 15 万 token，停止继续开发，先总结当前状态。
- `goal mode` 只用于边界清晰的执行任务，不用于决定“下一步是什么”。

## SOP / Superpowers 分级启用

默认轻量模式用于状态查询、下一步确认、简短方案、普通文档确认和 token 排查：

- 不展开完整 Yuri SOP。
- 不生成 superpowers spec 或 implementation plan。
- 不读取完整 `tasks/README.md`、`DECISIONS.md` 或验收矩阵。
- 只用 `rg -n` 定位必要片段，再用 `sed -n` 读取小范围内容。

标准模式用于明确的实现、修复、落地、改代码、改验收脚本或项目文档回写：

- 使用必要的 TDD 和 verification。
- 只读取目标相关 skill，不连带读取无关 superpowers。
- 只跑目标检查和必要收口检查。
- 完成后回写必要项目文档。

重型模式用于完整审查、上线前检查、PR 前检查、全量验收、长跑执行、复杂故障、安全 / 权限 / 生产 / 数据风险任务：

- 重型模式必须新会话开始。
- 开始前运行 `npm run codex:token-report`。
- 明确 token 阈值、停止条件和验收范围。
- 可以完整展开 SOP 和全量验证，但完成后必须输出接力摘要。

## 文件读取治理

禁止默认整文件读取大文档，尤其是：

- `cat tasks/README.md`
- `cat STATUS.md`
- `cat DECISIONS.md`
- `cat acceptance.json`
- 大范围 `git diff` 且没有 `--stat`、`--name-only` 或指定文件
- 全仓 `rg .` 式扫描

推荐顺序：

```bash
rg -n "关键词" STATUS.md DECISIONS.md tasks/README.md README.md
sed -n '起始行,结束行p' 指定文件
git diff --stat
git diff --name-only
git diff -U0 -- 指定文件
```

只有定位不到问题时，才扩大范围读取。

## 验证分层治理

快速检查用于开发中：

```bash
npm run check:taskXXXX
npm run acceptance
```

收口检查用于完成一个闭环：

```bash
npm run check:taskXXXX
npm run build:frontend
npm run acceptance
./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=目标测试 test
git diff --check
```

全量检查只在提交前、大阶段结束或用户明确要求时执行。

## 本地审计命令

查看最近两天 token 消耗：

```bash
npm run codex:token-report
```

把超阈值作为失败：

```bash
npm run codex:token-report -- --fail-on-warning
```

可调整窗口和阈值：

```bash
npm run codex:token-report -- --days 1 --session-limit 20000000 --context-limit 150000
```

报告会列出：

- 按 UTC 日期累计的请求级 token。
- 最大 session。
- 大工具输出。
- 高风险命令。
- 是否触发停止继续开发的 warning。

## 执行红线

- 不在超长上下文里连续推进多个业务闭环。
- 不把大文档、全量 diff、大范围搜索结果一次性喂回模型。
- 不为了“确认一下”反复跑完整验证组合。
- 发现 token warning 后，先做接力摘要，再开新会话。
