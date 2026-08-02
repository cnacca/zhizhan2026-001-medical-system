# 产品目录 V2 标准化基线

状态：`SOURCE_NORMALIZED / NOT_YET_SEEDED`

日期：2026-07-31

对应：GOAL-031 / TASK-032 / D-174

机器可读目录：`docs/requirements/product-catalog-v2-source-baseline-20260731.json`

## 1. 建模规则

- Category 是展示和配置分组，不生成生产事实。
- Product 是可生成子订单的真实产品。
- Variant 是同一产品的制作形态，不单独产生子订单，除非独立生产/计价/库存/发货/返工。
- Material 是制造属性，主材料默认单选。
- Accessory 是带数量/价格的附加选项，默认不生成子订单。
- Alias 只用于检索、导入和旧名称兼容，不创建重复 SKU。
- 每个实体使用稳定英文 code；显示名、别名和来源文本可以调整，code 不随文案改名。
- 源文件没有正式价格的项目全部 `PENDING_QUOTE`；没有确认分类或工序映射的项目保持 `DRAFT`。

## 2. 六大类别

| code | 显示名 | 说明 |
| --- | --- | --- |
| `FIXED_RESTORATION` | 固定义齿 | 牙冠、桥、嵌体、贴面、桩核、套筒冠等 |
| `REMOVABLE_PROSTHETICS` | 活动义齿 | 支架、胶托、弹性义齿、全口义齿、修理和牙套 |
| `IMPLANT_RESTORATION` | 种植修复 | 种植冠、基台、一体冠、导板、桥架和全口种植 |
| `CONVENTIONAL_ORTHODONTICS` | 常规正畸 | 颌垫、保持器、功能矫治、扩弓和阻鼾 |
| `CLEAR_ALIGNER` | 隐形正畸 | 一期只启用配置的 A 型，数据/UI 支持多类型 |
| `DESIGN_SERVICE` | 设计服务 | 数字化设计交付，业务执行仍使用子订单 |

## 3. 工作流映射

| 目录范围 | 现有 `product_type` |
| --- | --- |
| 常规固定冠/桥/嵌体/桩核/全金属/蜡型 | `REGULAR_CROWN` |
| 贴面及其同类修复 | `VENEER_RESTORATION` |
| 精密附件独立加工 | `PRECISION_ATTACHMENT` |
| 双重冠/套筒冠 | `TELESCOPIC_CROWN` |
| 种植修复 | `IMPLANT_RESTORATION` |
| 活动支架 | `REMOVABLE_STEEL` |
| 树脂胶托、全口义齿、修理、托盘/蜡堤 | `REMOVABLE_ACRYLIC` |
| 弹性义齿、透明/漂白/微笑牙套 | `REMOVABLE_INVISIBLE` |
| 常规正畸与隐形正畸 | `ORTHODONTICS` |
| 纯设计服务 | 待新增/确认 `DESIGN_ONLY` 执行模式，不得错误套入完整生产链 |

目录 code 与工作流 `product_type` 分离。一个工作流类型可以服务多个产品，不能再把 `product_catalog.product_type` 当作产品唯一键。

## 4. 去重与别名

| 规范实体 | 别名/旧名 | 处理 |
| --- | --- | --- |
| `REMOVABLE_COMPLETE_DENTURE` 全口义齿 | Full Denture、Complete Denture | 同一个 SKU |
| `MATERIAL_LUCITONE_199_ACRYLIC` Lucitone 199 丙烯酸树脂 | Luciton 199 Acrylic | 材料品牌/规格，不是产品 |
| `ORTHO_TWIN_BLOCK` 双导面功能矫治器 | Twin Block Appliances、Standard Twin Block | 一个产品，Standard 作为变体 |
| `ORTHO_FIXED_RETAINER` 舌侧固定保持器 | Fixed Retention Retainer、Permanent Retainer | 一个产品，具体线材/固定方式作为变体 |
| `ORTHO_SPACE_MAINTAINER` 间隙保持器 | Fixed Space Maintainer、Space Maintainer | 一个产品，固定/活动作为变体，正式区分待确认 |
| `REMOVABLE_BLEACHING_TRAY` 漂白牙套 | Bleaching Trays | 按最新动态表归活动义齿，不重复放正畸 |
| `ORTHO_SPORT_MOUTH_GUARD` 运动牙套 | Sport Mount guards | 规范拼写为 Sport Mouth Guard，原文保留为别名 |

## 5. 价格状态

- 客户资料没有正式价格表。
- 《产品内容》标题出现 “Orthodontics Price List”，正文只有 62 个产品/附加项名称，没有金额。
- 动态下单表第 12 页的 `$280` 仅是界面截图示意。
- 因此所有目录项初始 `pricing_status=PENDING_QUOTE`，正式价格规则另行导入并版本化。

## 6. 材料、颜色与配件边界

- 氧化锆、E-max、合金、树脂、HPP/PEEK、钛、Lucitone 199 等是材料/品牌规格。
- 标准/个性化/角度/复合/临时基台和 Ti Base 是种植子订单的部件/变体；需要独立生产或发货时可提升为关联子订单。
- 正畸 “additional ...” 项默认是带数量的配件。
- 精密附着体默认是配件；独立加工时使用 `PRECISION_ATTACHMENT` 工作流和关联子订单。
- 牙色、牙龈色、基托色、矫治器颜色分别建值集，不合并成一个 `shade` 字符串。

## 7. 启用策略

- `ACTIVE_CANDIDATE`：主来源明确、分类和工作流可安全确定，可在 C/E 批次完成校验后启用。
- `DRAFT`：只在较早补充资料出现、存在拼写/重复/分类/工作流不确定，暂不在医生端展示。
- `INACTIVE`：保留历史或未来扩展，不可新下单。
- 隐形正畸只有配置的 A 型进入 `ACTIVE_CANDIDATE`，其他类型不硬编码也不展示。

## 8. 不直接灌库的内容

- 原始长段材料文本。
- `$280`、`10 working days` 或现有 1 分占位价。
- 未确认的 3 天/6/12/24/48 小时冲突交期。
- 拼写未校对、仅英文存在且无法确定中文业务实体的条目。
- “照搬参考平台”中的积分、患者绑定、佩戴建议和高级 3D 功能。

## 9. 下一批使用方式

1. V60 建产品目录 V2、别名、材料、配件、schema、上传和价格规则结构。
2. 使用机器可读 JSON 只导入 `ACTIVE_CANDIDATE` 且通过验证的实体。
3. `DRAFT` 项可以进入后台待整理清单，但不得出现在医生端可下单目录。
4. 正式价格、交期和政策数据通过版本化导入，不修改本基线来源事实。
