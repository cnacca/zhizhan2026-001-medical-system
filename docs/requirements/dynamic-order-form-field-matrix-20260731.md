# 动态下单表 V2 字段与规则矩阵

状态：`SOURCE_NORMALIZED / IMPLEMENTATION_BASELINE`

日期：2026-07-31

对应：GOAL-031 / TASK-032 / D-174

## 1. 来源与优先级

| 来源 | 指纹 | 用途 | 优先级 |
| --- | --- | --- | --- |
| 《动态下单表最终版.docx》 | `147810af568da193d7acd10f7963283ff8e0e74f5f272415aefda7bb6b1daef5` | 动态字段、牙位、文件、试戴/过程确认、交期与医生向导 | 主来源 |
| 《产品内容.doc》 | `d40a767e0ae7151d8c6a63960bb312d7661471780c95f50068210d02d3ded525` | 产品、材料、配件与中英文别名补充 | 次来源 |

冲突时按 D-174：已批准口径 > 动态下单表 > 产品内容 > 现有占位种子。两份源文件分别完成 12 页和 6 页渲染检查。

## 2. 病例订单组固定字段

这些字段属于 `order_case_group`，不应在每个产品子订单重复填写。

| 字段 code | 显示名 | 类型 | 必填 | 规则 | 来源 |
| --- | --- | --- | --- | --- | --- |
| `clinic_id` | 诊所 | identity_ref | 是 | 当前医生账号自动带出，服务端锁定，不允许跨诊所改写 | 动态表 p1 |
| `doctor_user_id` | 医生 | identity_ref | 是 | 当前账号自动带出 | 动态表 p1 |
| `doctor_contact_snapshot` | 医生联系方式快照 | object | 是 | 从账号读取并冻结提交时快照 | 动态表 p1 |
| `patient_id` | 患者 | patient_ref | 是 | 支持旧患者检索；无记录时创建患者并回写患者管理 | 动态表 p1 |
| `priority_code` | 订单优先级 | single_select | 是 | `NORMAL / RUSH_3_DAY / SAME_DAY`；是否可选由产品交期规则校验 | 动态表 p2 |
| `requested_delivery_date` | 期望到货日期 | date | 是 | 默认由产品/工艺交期推导；医生可调整，异常时客服需确认 | 动态表 p2 |
| `appointment_date` | 患者预约时间 | date | 否 | 用于交期提示，不直接覆盖生产计划 | 动态表 p2 |
| `shipping_method` | 配送方式 | single_select | 是 | `EXPRESS / SALES_DELIVERY / PICKUP` | 动态表 p1-p2 |
| `order_scenario` | 订单场景 | single_select | 是 | `ONLINE / IMPRESSION / REWORK / RETURN / DESIGN_ONLY`；返工/退货应进入独立售后事实，不伪装为新产品 | 动态表 p1-p2 |
| `inbound_tracking_no` | 寄入运单号 | text | 条件必填 | 印模、返工模或退货实物寄回时显示 | 动态表 p1-p2 |
| `group_tags` | 病例标签 | multi_select | 否 | 标签字典配置化 | 动态表 p2 |
| `global_notes` | 病例通用备注 | textarea | 否 | 可中英文输入；AI 翻译只生成草稿，人工确认后进入生产信息 | 动态表 p2 |
| `idempotency_key` | 提交幂等键 | text | 是 | 客户端生成、服务端唯一约束，防多击重复创建 | D-174 |

## 3. 新患者字段

| 字段 code | 显示名 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- | --- |
| `first_name` | 名 | text | 是 | 页面示例字段 |
| `last_name` | 姓 | text | 是 | 页面示例字段 |
| `date_of_birth` | 出生日期 | date | 否 | 页面示例字段 |
| `gender` | 性别 | single_select | 否 | 选项由字典配置 |
| `phone` | 电话 | text | 否 | 个人信息按患者权限隔离 |
| `email` | 邮箱 | text | 否 | 个人信息按患者权限隔离 |
| `medical_record_no` | 病历号 | text | 否 | 诊所内唯一策略后续配置 |
| `oral_health_status` | 口腔健康状态 | single_select | 否 | 字典配置 |
| `allergies_medications` | 过敏/用药 | textarea | 否 | 医疗敏感信息，不进入生产端无关投影 |
| `emergency_contact` | 紧急联系人 | object | 否 | 医疗敏感信息，不进入生产端无关投影 |
| `medical_notes` | 医疗备注 | textarea | 否 | 医疗敏感信息，不进入生产端无关投影 |

## 4. 产品子订单固定字段

| 字段 code | 显示名 | 类型 | 必填 | 规则 |
| --- | --- | --- | --- | --- |
| `product_id` | 产品 | product_ref | 是 | 每个子订单一个真实产品 |
| `workflow_product_type` | 工序类型 | hidden | 是 | 从产品配置解析，医生不能手工改 |
| `line_no` | 子订单序号 | integer | 是 | 组内稳定顺序 |
| `relation_type` | 关联类型 | single_select | 是 | `PRIMARY / RELATED / COMBINATION / AFTER_SALES` |
| `form_schema_version` | 表单版本 | hidden | 是 | 提交时冻结 |
| `product_snapshot` | 产品快照 | hidden_object | 是 | code、名称、分类、版本、工作流映射 |
| `form_values` | 动态值 | object | 是 | 支持 string/number/boolean/array/object/quantity |
| `tooth_selection` | 牙位/区域 | object | 按规则 | 使用结构化牙位模型，不用自由文本代替 |
| `pricing_snapshot` | 报价快照 | hidden_object | 是 | 未配置价格时状态为 `PENDING_QUOTE` |

## 5. D01/D02 多选解释

源文件的 D01 产品大类和 D02 产品均注明“可多选”。实现规则：

- D01/D02 的多选结果不是写进一个 `orders.form_data` 的数组。
- 医生在同一个病例订单组下添加多个产品。
- 每个最终可下单产品生成一个 `orders` 子订单。
- 材料和配件留在对应子订单配置中。
- 组合产品通过 `relation_type=COMBINATION` 和明确的关联表表达，不共享生产状态。

## 6. 牙位规则

| 规则 code | 适用类别 | 单击 | 拖拽 | 双击 | 附加结构 |
| --- | --- | --- | --- | --- | --- |
| `TOOTH_FIXED` | 固定义齿 | 单冠牙位 | 连续桥范围 | 全口单冠选择 | 缺失位、桥体范围 |
| `TOOTH_REMOVABLE` | 活动义齿 | 缺失位 | 连续缺失位 | 卡环牙位 | 卡环、支托、基托范围 |
| `TOOTH_IMPLANT` | 种植修复 | 单冠牙位 | 种植桥范围 | 全口单冠选择 | 基台、桥架可按牙位/组件关联 |
| `TOOTH_ORTHO` | 常规正畸 | 单牙/区域 | 连续正畸区域 | 带环牙位 | 带环、扩弓、矫治区域 |
| `TOOTH_CLEAR_ALIGNER` | 隐形正畸 | 诊断/目标牙位 | 区域策略 | 不固定为全口快捷键 | 牙位诊断、移动策略、阶段目标 |
| `TOOTH_NONE` | 非牙位设计服务 | 无 | 无 | 无 | 使用文件/设计对象代替 |

交互必须有当前选择摘要和一键清除；双击语义按类别解释，不能共用一套布尔数组。

## 7. 类别级制作要求

### 7.1 固定修复

| code | 显示名 | 类型 | 值/条件 |
| --- | --- | --- | --- |
| `occlusion_level` | 咬合 | single_select | `LIGHT / NORMAL / HEAVY / RELIEF` |
| `occlusion_relief_mm` | 空开毫米 | number | `occlusion_level=RELIEF` 时必填 |
| `contact_type` | 邻接 | single_select | `OPEN / NORMAL / TIGHT / POINT / SURFACE` |
| `stain_level` | 染色 | single_select | `NONE / LIGHT / MEDIUM / HEAVY` |
| `margin_design` | 边缘 | single_select | `METAL / PORCELAIN / THREE_QUARTER_METAL_LINGUAL` |
| `missing_tooth_positions` | 缺失位 | tooth_selection | 桥体等产品按条件显示 |

### 7.2 活动义齿

| code | 显示名 | 类型 | 值/条件 |
| --- | --- | --- | --- |
| `occlusion_level` | 咬合 | single_select | 同固定修复 |
| `occlusion_relief_mm` | 空开毫米 | number | 条件必填 |
| `stain_level` | 染色 | single_select | 无/轻/中/重 |
| `vertical_height_mm` | 垂直高度 | number | 按产品 schema 决定是否必填 |
| `clasp_design` | 卡环设计 | single_select/object | 无或具体卡环方案 |
| `denture_tooth_brand` | 牙齿品牌 | single_select | Huge / Yamahachi / Vita |
| `gingival_bionic_shade` | 牙龈仿生色 | hidden/disabled | 主来源明确活动模板不要该选项 |

### 7.3 种植修复

| code | 显示名 | 类型 | 值/条件 |
| --- | --- | --- | --- |
| `retention_method` | 固位方式 | single_select | `SCREW / CEMENT` |
| `implant_system` | 种植系统 | single_select/text | 目录配置；正式选项待业务提供 |
| `implant_diameter_mm` | 种植直径 | number | 大于 0 |
| `transgingival_height_mm` | 穿龈高度 | number | 大于等于 0 |
| `connection_type` | 连接方式 | single_select | `EXTERNAL / INTERNAL` |
| `occlusion_level` | 咬合 | single_select | 同固定修复 |
| `occlusion_relief_mm` | 空开毫米 | number | 条件必填 |
| `stain_level` | 染色 | single_select | 无/轻/中/重 |
| `gingival_porcelain` | 加牙龈瓷 | boolean | 是/否 |
| `abutment_type` | 基台产品 | single_select | 标准/个性化/角度/复合/临时/Ti Base |
| `screw_access_position` | 螺丝开口位置 | single_select | 颊侧/舌侧/咬合面 |

### 7.4 常规正畸

| code | 显示名 | 类型 | 值 |
| --- | --- | --- | --- |
| `dentition_stage` | 牙龄 | single_select | 恒牙/乳牙/替牙 |
| `angle_classification` | 错颌畸形类别 | single_select | 安氏 I/II/III |
| `skeletal_type` | 骨骼类型 | single_select | 牙型/骨性 |
| `chief_complaints` | 诉求问题 | multi_select | 拥挤/稀疏/前突/地包天 |
| `orthodontic_accessories` | 正畸配件 | quantity_list | 多选并带数量 |

### 7.5 设计服务

| code | 显示名 | 类型 | 值 |
| --- | --- | --- | --- |
| `delivery_format` | 交付格式 | single_select | STL / OBJ / EXO / 3SHAPE |
| `design_standard` | 设计标准 | single_select | 通用/个性化 |
| `design_turnaround` | 设计时间 | single_select | 6/12/24/48 小时；3 天选项与源文件存在冲突，待统一后启用 |
| `revision_policy` | 修改次数/政策 | object | 页面示例显示 revision，但次数/收费未给出，保持待配置 |

### 7.6 隐形正畸

通用表单不得用一句“照搬参考平台”代替。按 D-174 建立独立七步 schema：

1. 基本信息。
2. 资料/模型。
3. 临床信息与牙位诊断。
4. 矫治器/联合矫治。
5. 目标牙位与移动策略。
6. 隐形方案参数。
7. 预览/模板/提交。

A 型通过产品配置启用；其他类型保持可扩展但未配置不展示。

## 8. 颜色字段分离

| code | 含义 | 适用 |
| --- | --- | --- |
| `tooth_shade_system` / `tooth_shade` | 牙色品牌与色号 | 固定、种植、活动 |
| `cervical_shade` / `body_shade` / `incisal_shade` | 颈/体/切端分色 | 选择分色系统时显示 |
| `gingival_shade` | 牙龈色 | 需要牙龈瓷或仿生牙龈的产品 |
| `denture_base_shade` | 义齿基托色 | 活动义齿 |
| `aligner_color` | 矫治器颜色/图案 | 支持颜色的正畸产品 |
| `shade_material_notes` | 颜色与材料备注 | 所有适用产品 |
| `polish_level` | 抛光程度 | 普通/镜面 |

VITA 16 Classic 和 3D Master 色号按源文件建立共享值集；正式启用前校对拼写与适用产品。

## 9. 上传规则

所有规则的单文件上限为 500MB。源页面列出的通用格式为 STL、PLY、OBJ、DICOM、JPG、PNG、PDF；订单组总容量、文件数量和更细格式白名单仍由服务端配置。

### 9.1 固定修复

| code | 资料 | 必填 |
| --- | --- | --- |
| `UPPER_ARCH_SCAN` | 上颌口扫 STL | 是 |
| `LOWER_ARCH_SCAN` | 下颌口扫 STL | 是 |
| `BITE_REGISTRATION` | 咬合扫描 | 是 |
| `SHADE_REFERENCE_PHOTO` | 比色图 | 是 |
| `INTRAORAL_OCCLUSION_PHOTO` | 口内照 | 否 |
| `OLD_RESTORATION_REFERENCE` | 旧义齿参考 | 否 |
| `PLASTER_MODEL_TRACKING` | 石膏模型运单号 | 条件 |

### 9.2 种植修复

| code | 资料 | 必填 |
| --- | --- | --- |
| `FULL_ARCH_SCAN` | 上下颌口扫 | 是 |
| `IMPLANT_SCAN_BODY_DATA` | 种植体扫描杆数据 | 是 |
| `BITE_SCAN` | 咬合记录 | 是 |
| `PRE_POST_HEALING_PHOTOS` | 术前/术后照 | 是 |
| `CBCT_COMPLEX` | CBCT 影像 | 否；导板/复杂病例可条件必填 |

### 9.3 活动义齿

| code | 资料 | 必填 |
| --- | --- | --- |
| `FULL_ARCH_SCAN` | 上下颌口扫 | 是 |
| `JAW_REGISTRATION` | 颌位记录 | 是 |
| `OLD_DENTURE_PHOTO` | 旧义齿全貌照 | 是 |
| `PATIENT_PROFILE_PHOTO` | 面部侧面照 | 否 |
| `PLASTER_MODEL_TRACKING` | 石膏模型运单号 | 条件 |

### 9.4 常规/隐形正畸

| code | 资料 | 必填 |
| --- | --- | --- |
| `FULL_ARCH_SCAN` | 全口口扫 | 是 |
| `STANDARD_FIVE_PHOTO_SET` | 标准五张口内照 | 是 |
| `PANORAMIC_XRAY` | 全景片 | 是 |
| `CEPHALOMETRIC_XRAY` | 头颅侧位片 | 是 |
| `DOCTOR_TREATMENT_PLAN` | 医生治疗方案 | 否 |

### 9.5 设计服务

| code | 资料 | 必填 |
| --- | --- | --- |
| `ARCH_SCAN_DATA` | 口扫数据 | 是 |
| `SHADE_REFERENCE` | 比色图 | 是 |
| `CBCT_GUIDE_DESIGN` | CBCT + Scan | 否；导板设计可条件必填 |

共享病例/影像资料优先挂订单组；产品特有资料挂子订单。后端授权同时校验医生归属、订单组归属、子订单归属和文件用途。

## 10. 试戴与过程确认

| code | 显示名 | 类型 | 规则 |
| --- | --- | --- | --- |
| `try_in_before_finish` | 完成前试戴 | boolean | 形成同一子订单的试戴阶段与完成阶段，不新建重复订单号；费用作为价格组件 |
| `cad_design_review` | CAD 设计确认 | boolean | 可循环修改；每次确认/驳回追加事实 |
| `post_milling_photo_review` | 切削/打印后照片确认 | boolean | 待医生确认期间不继续对应后继 |
| `post_glazing_photo_review` | 上釉后照片确认 | boolean | 终检前门禁 |
| `clinical_notes` | 特殊要求 | textarea | AI 翻译仅为草稿，人工确认后使用 |

源文件说明每个过程确认增加 1 个工作日，但基础交期和例外政策未提供，先建规则组件，未配置前不自动承诺交期。

## 11. 报价与交期

- 第 12 页的 `$280` 和 `10 working days` 是界面示例，不是客户正式价格/周期。
- 提交摘要应显示每个子订单的报价状态、明细、预计周期和组级汇总。
- 未配置正式规则：`quote_status=PENDING_QUOTE`，金额为空，不显示 0 元或占位价。
- 正式规则：产品基础价 + 材料 + 配件数量 + 特殊工艺 + 加急/调整费用。
- 提交时冻结规则版本与金额快照；人工改价必须填写原因并审计。
- 多产品组的预计完成时间应分别展示，不用一个日期掩盖部分完成。

## 12. 待确认项

| ID | 待确认内容 | 当前安全默认 |
| --- | --- | --- |
| `POV2-OPEN-001` | 正式价格、币种、生效日期 | 待报价 |
| `POV2-OPEN-002` | 各产品标准交期及加急资格 | 不自动承诺，仅显示待客服确认 |
| `POV2-OPEN-003` | 设计服务 3 天与 6/12/24/48 小时的统一规则 | 配置为草稿，不启用冲突选项 |
| `POV2-OPEN-004` | 订单组总容量、文件总数、各用途格式白名单 | 服务端配置；只确认单文件 500MB |
| `POV2-OPEN-005` | CBCT、比色图等资料的条件必填细则 | 按产品 schema 条件配置，未确认项不扩大强制范围 |
| `POV2-OPEN-006` | 过程确认增加工期、次数、费用和超时政策 | 只建版本化规则，不写死 |
| `POV2-OPEN-007` | 隐形正畸除 A 型外的正式产品类型 | 仅启用已配置 A 型 |
| `POV2-OPEN-008` | 设计服务交付后是否进入独立账单/物流 | 先按设计子订单建模，生产工序映射保持草稿 |
