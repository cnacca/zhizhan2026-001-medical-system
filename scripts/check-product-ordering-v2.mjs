import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const baselinePath = path.join(
  root,
  "docs/requirements/product-catalog-v2-source-baseline-20260731.json",
);

function fail(message) {
  throw new Error(`[product-ordering-v2] ${message}`);
}

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function assert(condition, message) {
  if (!condition) fail(message);
}

function assertUnique(items, key, label) {
  const values = items.map((item) => item[key]);
  const duplicates = values.filter(
    (value, index) => values.indexOf(value) !== index,
  );
  assert(
    duplicates.length === 0,
    `${label} 存在重复 ${key}: ${[...new Set(duplicates)].join(", ")}`,
  );
}

const baseline = JSON.parse(fs.readFileSync(baselinePath, "utf8"));
const workflowProductTypes = new Set([
  "REGULAR_CROWN",
  "IMPLANT_RESTORATION",
  "PRECISION_ATTACHMENT",
  "TELESCOPIC_CROWN",
  "VENEER_RESTORATION",
  "REMOVABLE_STEEL",
  "REMOVABLE_ACRYLIC",
  "REMOVABLE_INVISIBLE",
  "ORTHODONTICS",
  "DESIGN_ONLY",
]);

assert(baseline.schema_version === "2026-07-31.1", "schema_version 不符合当前基线");
assert(
  baseline.status === "SOURCE_NORMALIZED_NOT_YET_SEEDED",
  "资料基线不得伪装为已发布或已入库配置",
);
assert(
  baseline.defaults?.single_file_limit_bytes === 500 * 1024 * 1024,
  "单文件上限必须是 500 MiB",
);
assert(
  baseline.defaults?.pricing_status === "PENDING_QUOTE",
  "未配置正式价格时必须保持待报价",
);
assert(
  baseline.defaults?.workflow_structure_editable === false,
  "本阶段不得开放工序链结构编辑",
);
assert(
  baseline.decision_ids?.includes("D-174") &&
    baseline.decision_ids?.includes("D-175"),
  "资料基线必须关联 D-174 和 D-175",
);

for (const [items, key, label] of [
  [baseline.categories, "code", "产品分类"],
  [baseline.products, "code", "产品"],
  [baseline.materials, "code", "材料"],
  [baseline.accessories, "code", "配件"],
  [baseline.supplemental_orthodontic_terms, "code", "正畸补充术语"],
]) {
  assert(Array.isArray(items) && items.length > 0, `${label} 不能为空`);
  assertUnique(items, key, label);
}

const categoryCodes = new Set(baseline.categories.map((item) => item.code));
const productCodes = new Set(baseline.products.map((item) => item.code));
const materialCodes = new Set(baseline.materials.map((item) => item.code));
const accessoryCodes = new Set(baseline.accessories.map((item) => item.code));

for (const product of baseline.products) {
  assert(
    categoryCodes.has(product.category_code),
    `产品 ${product.code} 引用了不存在的分类 ${product.category_code}`,
  );
  assert(
    workflowProductTypes.has(product.workflow_product_type) ||
      (product.workflow_product_type === null &&
        product.category_code === "DESIGN_SERVICE" &&
        product.status === "DRAFT"),
    `产品 ${product.code} 的工序类型 ${product.workflow_product_type} 不在批准映射中`,
  );
}

assert(
  baseline.supplemental_orthodontic_terms.length === 62,
  "产品资料中的 62 个正畸补充术语必须逐项保留",
);
for (const item of baseline.supplemental_orthodontic_terms) {
  const canonicalBaseCode = item.canonical_code?.split(":")[0];
  assert(
    (item.canonical_code === null && item.classification.startsWith("DRAFT_")) ||
      productCodes.has(item.canonical_code) ||
      (item.classification === "VARIANT_ALIAS" &&
        productCodes.has(canonicalBaseCode)) ||
      (item.classification === "PRODUCT_GROUP_ALIAS" &&
        /^ORTHO_[A-Z0-9_]+$/.test(item.canonical_code)) ||
      materialCodes.has(item.canonical_code) ||
      accessoryCodes.has(item.canonical_code),
    `正畸术语 ${item.code} 引用了不存在的目录项 ${item.canonical_code}`,
  );
}

const aliases = new Map(
  baseline.aliases.map((item) => [
    `${item.canonical_type}:${item.alias}`,
    item.canonical_code,
  ]),
);
assert(
  aliases.get("PRODUCT:Full Denture") === "REMOVABLE_COMPLETE_DENTURE" &&
    aliases.get("PRODUCT:Complete Denture") === "REMOVABLE_COMPLETE_DENTURE",
  "Full Denture / Complete Denture 必须归并到同一全口义齿产品",
);
for (const alias of baseline.aliases) {
  const targetExists =
    (alias.canonical_type === "PRODUCT" && productCodes.has(alias.canonical_code)) ||
    (alias.canonical_type === "PRODUCT_VARIANT" &&
      productCodes.has(alias.canonical_code.split(":")[0])) ||
    (alias.canonical_type === "MATERIAL" &&
      materialCodes.has(alias.canonical_code)) ||
    (alias.canonical_type === "ACCESSORY" &&
      accessoryCodes.has(alias.canonical_code));
  assert(
    targetExists,
    `别名 ${alias.alias} 引用了不存在的 ${alias.canonical_type} ${alias.canonical_code}`,
  );
}

assert(
  materialCodes.has("MATERIAL_LUCITONE_199_ACRYLIC") &&
    !productCodes.has("MATERIAL_LUCITONE_199_ACRYLIC") &&
    !baseline.products.some((item) => /lucitone/i.test(item.display_name)),
  "Lucitone 199 必须作为材料品牌/规格，不能成为成品 SKU",
);
const clearAlignerTypeA = baseline.products.find(
  (item) => item.code === "CLEAR_ALIGNER_TYPE_A",
);
assert(
  clearAlignerTypeA?.enabled_by_configuration === true,
  "隐形正畸 A 型必须由配置启用，不能写死在页面",
);
assert(
  ["TOOTH_SHADE", "GINGIVAL_SHADE", "DENTURE_BASE_SHADE", "ALIGNER_COLOR"].every(
    (semanticType) => baseline.semantic_color_sets?.includes(semanticType),
  ),
  "牙色、牙龈色、基托色、矫治器色必须使用独立语义字段",
);

const requiredTexts = [
  {
    file: "goals/GOAL-031-product-ordering-v2-case-group-20260731.md",
    patterns: ["GOAL-031", "病例订单组", "产品子订单", "产品配置中心", "标准工时", "D-174", "D-175", "不开放"],
  },
  {
    file: "tasks/TASK-032-product-ordering-v2-case-group-20260731.md",
    patterns: ["TASK-032", "病例订单组", "产品子订单", "产品配置中心", "标准工时", "D-174", "D-175", "不开放"],
  },
  {
    file: "docs/development/product-ordering-v2-implementation-plan-20260731.md",
    patterns: ["病例订单组", "产品子订单", "产品配置中心", "标准工时", "D-174", "D-175", "不开放"],
  },
  {
    file: "DECISIONS.md",
    patterns: ["D-174", "D-175", "D-179", "D-180", "D-181", "产品配置中心", "标准工时", "当前发布目录", "隔离库", "一键开始编辑", "后端文字", "安全删除", "不开放"],
  },
  {
    file: "acceptance.json",
    patterns: ["GOAL-031", "TASK-032", "产品配置中心", "标准工时", "D-175", "D-176", "V60～V73", "ORD20260731-6622BC4A2A", "253", "NOT_READY"],
  },
];

for (const { file, patterns } of requiredTexts) {
  const content = read(file);
  for (const pattern of patterns) {
    assert(content.includes(pattern), `${file} 缺少批准口径：${pattern}`);
  }
}

const requiredImplementationTexts = [
  {
    file: "backend/platform-server/src/main/resources/db/migration/V60__order_case_group_foundation.sql",
    patterns: ["uk_order_case_group_idempotency", "ADD COLUMN group_id", "WHERE orders.group_id IS NULL"],
  },
  {
    file: "backend/platform-server/src/main/resources/db/migration/V61__catalog_v2_versioned_configuration.sql",
    patterns: ["DRAFT", "PENDING_QUOTE", "order_catalog_snapshot", "catalog:manage", "catalog:publish"],
  },
  {
    file: "backend/platform-server/src/main/resources/db/migration/V73__publish_confirmed_customer_product_catalog.sql",
    patterns: ["客户产品目录首版", "FIXED_PRINTED_ZIRCONIA_CROWN", "PENDING_QUOTE", "CLEAR_ALIGNER_TYPE_A", "INACTIVE"],
  },
  {
    file: "backend/platform-server/src/main/resources/db/migration/V63__workflow_standard_time_versioning.sql",
    patterns: ["standard_duration_minutes", "effective_at", "workflow:standard-time:manage"],
  },
  {
    file: "backend/platform-server/src/main/resources/db/migration/V68__orthodontic_case_plan_batch_versioning.sql",
    patterns: ["plan_snapshot_json", "PENDING_INTERNAL_REVIEW", "workflow:orthodontic-batch:manage"],
  },
  {
    file: "backend/platform-server/src/main/resources/db/migration/V72__hold_unconfirmed_standard_time_as_inactive.sql",
    patterns: ["HOLD_UNCONFIRMED", "publication_status = 'INACTIVE'", "menu_code = 'workflow-standard-time'"],
  },
  {
    file: "backend/platform-server/src/main/resources/db/migration/V74__reopen_standard_time_draft_configuration.sql",
    patterns: ["工序工时设置", "status = 'ACTIVE'", "publication_status = 'DRAFT'", "standard_duration_minutes", "NULL"],
  },
  {
    file: "backend/platform-server/src/main/resources/db/migration/V75__expose_ordering_content_configuration.sql",
    patterns: ["D-178", "下单内容设置", "catalog-configuration-center", "catalog:manage", "status = 'ACTIVE'"],
  },
  {
    file: "backend/platform-server/src/main/resources/application.yml",
    patterns: ["WORKFLOW_STANDARD_TIME_FORMAL_ENABLED:false"],
  },
  {
    file: "backend/platform-server/src/main/java/com/yuri/aiorder/workflow/execution/WorkflowExecutionService.java",
    patterns: ["STANDARD_TIME_PENDING"],
  },
  {
    file: "backend/platform-server/src/main/java/com/yuri/aiorder/catalog/CatalogRuleSchemaValidator.java",
    patterns: [
      "FIELD_TYPES",
      "FORM_SCHEMA field key is duplicated",
      "FORM_SCHEMA field type is unsupported",
      "validateVisibleWhen",
      "validateOptions",
      "validateNumericBounds",
      "validateSizeBounds",
    ],
  },
  {
    file: "backend/platform-server/src/main/java/com/yuri/aiorder/catalog/CatalogConfigurationService.java",
    patterns: ["validateActiveRuleSchemas", "ruleSchemaValidator.validate", "SELECT category_id, config_version_id, category_code", "SELECT product_id, config_version_id, category_id", "status, lock_version"],
  },
  {
    file: "backend/platform-server/src/main/java/com/yuri/aiorder/catalog/CatalogExtendedManagementService.java",
    patterns: [
      "DELETE_DRAFT",
      "snapshotReferences",
      "HttpStatus.CONFLICT",
      "catalog:manage",
      "ruleSchemaValidator.validate",
    ],
  },
  {
    file: "backend/platform-server/src/main/java/com/yuri/aiorder/order/casegroup/CaseGroupDraftService.java",
    patterns: [
      "PENDING_QUOTE",
      "order_catalog_snapshot",
      "normalized_form_values",
      "workflow_mapping_snapshot",
      "validateAllowedOptions",
      "validateNumericBounds",
      "validateCollectionBounds",
    ],
  },
  {
    file: "backend/platform-server/src/main/java/com/yuri/aiorder/order/casegroup/CaseGroupController.java",
    patterns: ["order:write-doctor", "order:read-doctor"],
  },
  {
    file: "backend/platform-server/src/main/java/com/yuri/aiorder/ai/AiGatewayService.java",
    patterns: ["formData.path(\"form_values\")", "field.visible(formValues)"],
  },
  {
    file: "frontend/src/components/AdminConfigurationCenter.vue",
    patterns: [
      "catalog-configuration-center",
      "workflow-standard-time-center",
      "工序工时设置",
      "工序工时尚未发布",
      "formalStandardTimeEnabled",
      "开始编辑",
      "完善后发布",
      "publicationStatusLabel",
      "workflowTypeLabel",
      "validId",
      "catalog-category-create",
      "categoryProductCount",
      "saveCategory",
      "toggleCategory",
      "deleteCategory",
      "catalog-category-delete",
      "请先填写分类名称",
      "请先填写产品名称",
      "field-control",
      "catalog-tab-products",
      "catalog-tab-materials",
      "catalog-tab-bindings",
      "saveProduct",
      "deleteProduct",
      "saveMaterial",
      "publication_status === 'ACTIVE'",
      "publication_status === 'DRAFT'",
      "catalog-version-select",
    ],
  },
  {
    file: "scripts/smoke-admin-ordering-configuration.spec.mjs",
    patterns: ["下单内容设置", "分类名称已更新", "未使用的分类已删除", "产品内容已更新", "材料内容已更新", "产品与材料绑定已保存", "catalog-category-create", "请先填写分类名称", "请先填写产品名称", "not.toHaveValue('0')", "ADMIN_CONFIG_ALLOW_WRITES", "isolated", "15173", "34px", "13px", "工序工时设置"],
  },
  {
    file: "frontend/src/doctor/DoctorCaseGroupWizard.vue",
    patterns: [
      "doctor-case-group-wizard",
      "/order-case-groups",
      "catalog?.publication_status !== 'ACTIVE'",
      "case-fdi-tooth-chart",
      "case-dental-svg",
      "item.category_code !== 'CLEAR_ALIGNER'",
      "选择产品大类和具体产品（均支持多选）",
      "function productSelected",
      "function toothClick",
      "function finishToothDrag",
      "function doubleClickTooth",
      "return '待报价'",
      "updateMultiSelectField",
      "commitObjectField",
      "fieldType(field) === 'object'",
    ],
  },
  {
    file: "backend/platform-server/src/test/java/com/yuri/aiorder/order/OrderCaseGroupTests.java",
    patterns: [
      "\"type\":\"quantity\"",
      "\"type\":\"multi_select\"",
      "\"type\":\"object\"",
      "invalid-quantity",
      "invalid-option",
      "invalid-object",
    ],
  },
  {
    file: "backend/platform-server/src/test/java/com/yuri/aiorder/product/ProductCatalogV2Tests.java",
    patterns: ["formSchemaRejectsUnsupportedTypesDuplicateKeysInvalidUpdatesAndInvalidPublishData", "previewExposesProductLockAndDraftProductCanBeUpdatedThenDeleted", "draftCategoryCanBeUpdatedAndDeletedOnlyWhenItHasNoProducts"],
  },
  {
    file: "backend/platform-server/src/test/java/com/yuri/aiorder/auth/PermissionInterceptorTests.java",
    patterns: ["doctorReadPermissionDoesNotGrantCaseGroupWrite", "order:write-doctor"],
  },
];

for (const { file, patterns } of requiredImplementationTexts) {
  const content = read(file);
  for (const pattern of patterns) {
    assert(content.includes(pattern), `${file} 缺少运行期实现门禁：${pattern}`);
  }
}

const doctorCaseGroupWizard = read("frontend/src/doctor/DoctorCaseGroupWizard.vue");
assert(
  !doctorCaseGroupWizard.includes("DoctorOrthodonticPrescription") &&
    !doctorCaseGroupWizard.includes("七步"),
  "客户尚未提供隐形正畸专项步骤，不得把七步处方设为医生下单门禁",
);

const adminConfigurationTemplate = read("frontend/src/components/AdminConfigurationCenter.vue")
  .split("<template>")[1]
  .split("</template>")[0];
for (const forbiddenText of [
  "正式标准工时开关未启用",
  "服务端校验数量与适用范围",
  "版本化 JSON Schema",
  "操作冲突（409）",
  "复制当前版本为草稿",
  "DAG 编辑",
]) {
  assert(
    !adminConfigurationTemplate.includes(forbiddenText),
    `管理端配置页不得展示后端技术文案：${forbiddenText}`,
  );
}

console.log(
  `[product-ordering-v2] PASS: ${baseline.categories.length} 分类、${baseline.products.length} 产品、${baseline.materials.length} 材料、${baseline.accessories.length} 配件、${baseline.supplemental_orthodontic_terms.length} 正畸补充术语；资料基线、D-174～D-181、V60～V75、分类安全删除、真实目录默认视图、一键开始编辑、业务化文案、隔离写入门禁与工序工时边界已对齐。`,
);
