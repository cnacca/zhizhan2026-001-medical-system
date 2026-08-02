# GOAL-034 G3：AI-6 FAQ / AI-7 智能推荐真实模型联调记录

日期：2026-08-02。环境：本地 `npm run local:start`，后端 `http://localhost:8080`。

模型配置：`AI_PROVIDER=langchain-deepseek`、`AI_LANGCHAIN_ENABLED=true`、`AI_LANGCHAIN_PROVIDER=deepseek`、`AI_DEEPSEEK_ENABLED=true`，`DEEPSEEK_API_KEY` 由 `.env` 外部注入（不入库、不写进本文件）。

真实模型确认（`ai_audit_log`）：

| agent_code | model_name | result_status | input_token_count | output_token_count |
| --- | --- | --- | ---: | ---: |
| `AI_FAQ` | `langchain-deepseek-chat` | `SUCCESS` | 162 | 22 |
| `AI_FAQ` | `langchain-deepseek-chat` | `SUCCESS` | 158 | 15 |

`model_name` 不是 `deterministic-placeholder`，确认走的是真实 DeepSeek，而非本地兜底桩。

## AI-6 牙科 FAQ

### 场景 1：知识库命中

请求：`POST /ai/faq`，`{"question":"口扫文件支持哪些格式？单个文件最大多少？"}`（DOCTOR）

响应：

- `result_status`：`SUCCESS`
- `answer`：「根据知识条目，口扫文件支持 STL 及常见口扫导出的压缩包，单个文件上限为 500MB。」
- `matched_entries`：faq_id 2「口扫文件支持哪些格式？」、faq_id 1「下单需要提供哪些资料？」
- `requires_customer_confirmation`：`true`（引用的是示例语料，界面须标注「待甲方确认」）

### 场景 2：超出知识库范围时不编造

请求：`{"question":"订单大概多久能做好？加急可以吗？"}`

响应（节选）：

> 根据知识条目，交期取决于产品类型、是否需要试戴、是否有过程确认环节……当前系统中的周期为占位默认值，正式周期以甲方确认为准。
>
> 关于"加急"能否操作，知识条目中没有相关信息，我无法回答。如需进一步确认，请联系客服。

这是本批次最关键的一条证据：模型只回答了知识库覆盖的部分，对未覆盖的"加急"明确说明无法回答，没有自由发挥。

### 场景 3：医生端内部信息边界（AI-3 安全读边界不因新入口放宽）

请求：`{"question":"我这单现在是哪个技工在做？返工工时和绩效怎么算？"}`

响应：`result_status = SAFE_REFUSAL`，`matched_entries` 为空，答复为「我只能回答下单流程、产品材料、交期物流、返工售后和账单方面的常见问题，内部工序、技师、返工和绩效信息需要联系客服。」

该路径**不向模型发送任何上下文**，直接本地拒答并写审计（`order_id` 为空、`result_status = SAFE_REFUSAL`）。

### 场景 4：知识库无命中

请求：`{"question":"zzzz qqqq wwww"}`

响应：`result_status = NO_MATCH`，「这个问题暂时不在常见问题库里，请通过沟通中心联系客服，我们会安排人工回复。」不调用模型。

## AI-7 智能推荐产品

请求：`POST /ai/product-recommendation`，`{"case_note":"46 缺失，咬合力较大，患者预算有限"}`（DOCTOR，clinic 1）

响应：

| product_id | 产品 | 结构化理由 |
| ---: | --- | --- |
| 104 | 全金属冠 | 依据本次病例描述给出的建议，理由见下方说明。 |
| 99 | 烤瓷冠 | 依据本次病例描述给出的建议，理由见下方说明。 |
| 105 | 马里兰桥 | 依据本次病例描述给出的建议，理由见下方说明。 |

模型说明（`note`，节选）：

> 根据病例描述，46 缺失且咬合力较大、预算有限，优先考虑经济且能承受较大咬合力的固定修复方案……
> [104] 全金属冠：金属冠强度高、耐磨且价格相对经济……
> [99] 烤瓷冠：兼具金属基底强度和美观，价格适中……
> [105] 马里兰桥：可减少牙体预备且费用较低，适合单颗缺失的保守修复。
> 以上仅为建议，需医生根据患者口腔实际情况自行确认最终方案。

`catalog_version_id = 3`（当前生效目录版本）。

### 防幻觉设计

模型被要求在末尾输出一行 `RECOMMENDED_IDS: <编号列表>`。服务端解析该行后**与候选集取交集**才生成结构化推荐卡片，编号不在候选集内一律丢弃；模型完全没给出可用编号时，退回「按诊所历史下单分布排序」的服务端规则。因此推荐卡片不可能出现当前目录里不存在的产品。`RECOMMENDED_IDS` 行在返回前被剥离，不出现在界面文案中。

首轮联调曾出现结构化卡片（按历史排序）与模型说明（按病例推理）给出两套不同产品的问题，已按上述方式收口为一致结果。

## 边界

- FAQ 种子语料是项目方拟定的示例内容（CP-013），全部带 `source_note = SAMPLE_PENDING_CUSTOMER_CONFIRMATION`；客户正式语料到位后替换。
- 推荐结果只是下单向导中的建议项，医生必须点击「采用」才加入订单，系统不自动填表。
- 价格以正式报价为准；当前目录多数产品仍为 `PENDING_QUOTE`。
- 本记录只表示本地真实 key 联调通过，不代表生产环境联调、客户 / PM 书面确认或 Task 8 可以转为 READY。
