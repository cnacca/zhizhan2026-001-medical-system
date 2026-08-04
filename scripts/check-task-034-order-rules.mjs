import fs from 'node:fs'

// TASK-034 F 批次：下单规则后端化。
// 守住四件事：
//   1. 前端能选的每一项后端都真的读了（GOAL-033 调研结论五的反面）；
//   2. 规则数值全部在配置表里，代码里没有写死的天数；
//   3. 占位周期必须能被界面识别出来标「待确认」，不得表现为正式承诺交期；
//   4. 没有为了这批功能扩订单状态枚举——试戴与过程确认是各自的域。

const read = (p) => fs.readFileSync(p, 'utf8')

const migration = read(
  'backend/platform-server/src/main/resources/db/migration/V81__order_rules_backend_engine.sql'
)
const vocabulary = read('backend/platform-server/src/main/java/com/yuri/aiorder/order/rules/OrderRuleVocabulary.java')
const selections = read('backend/platform-server/src/main/java/com/yuri/aiorder/order/rules/OrderRuleSelections.java')
const catalog = read('backend/platform-server/src/main/java/com/yuri/aiorder/order/rules/OrderingRuleCatalog.java')
const planService = read('backend/platform-server/src/main/java/com/yuri/aiorder/order/rules/DeliveryPlanService.java')
const tryInService = read('backend/platform-server/src/main/java/com/yuri/aiorder/order/rules/TryInService.java')
const billItemService = read('backend/platform-server/src/main/java/com/yuri/aiorder/order/rules/OrderBillItemService.java')
const ruleService = read('backend/platform-server/src/main/java/com/yuri/aiorder/order/rules/OrderRuleService.java')
const controller = read('backend/platform-server/src/main/java/com/yuri/aiorder/order/rules/OrderRuleController.java')
const draftService = read('backend/platform-server/src/main/java/com/yuri/aiorder/order/casegroup/CaseGroupDraftService.java')
const projection = read('backend/platform-server/src/main/java/com/yuri/aiorder/order/api/OrderProjectionQueryService.java')
const internalDto = read('backend/platform-server/src/main/java/com/yuri/aiorder/order/api/OrderInternalDTO.java')
const doctorPortal = read('frontend/src/doctor/DoctorPortalV2.vue')
const csPages = read('frontend/src/components/CsPortalPages.vue')
const openapi = read('docs/api/openapi.yaml')
const tests = read('backend/platform-server/src/test/java/com/yuri/aiorder/order/OrderRuleEngineTests.java')

const failures = []

const required = [
  // 1. 规则数据落在配置表里
  [migration, 'V81 migration', 'CREATE TABLE ordering_rule_config'],
  [migration, 'V81 migration', 'confirmation_status VARCHAR(16) NOT NULL DEFAULT \'PLACEHOLDER\''],
  [migration, 'V81 migration', "('PRIORITY_CAP', 'RUSH_3_DAYS', 3"],
  [migration, 'V81 migration', "('PROCESS_CONFIRMATION', 'PER_ITEM_DAYS', 1"],
  [migration, 'V81 migration', "('SHIPPING_TRANSIT', 'SELF_PICKUP', 0"],
  [migration, 'V81 migration', 'CREATE TABLE order_delivery_plan'],
  [migration, 'V81 migration', 'CREATE TABLE order_process_confirmation'],
  [migration, 'V81 migration', 'CREATE TABLE order_try_in'],
  [migration, 'V81 migration', 'CREATE TABLE order_bill_item'],
  // 权限码
  [migration, 'V81 migration', "'order:process-confirm-request'"],
  [migration, 'V81 migration', "'order:process-confirm-doctor'"],
  [migration, 'V81 migration', "'order:try-in-manage'"],
  [migration, 'V81 migration', "'ordering-rule:manage'"],

  // 2. 前端能选的每一项后端都读了
  [selections, 'OrderRuleSelections.java', 'FORM_KEY_ORDER_TYPE'],
  [selections, 'OrderRuleSelections.java', 'FORM_KEY_PRIORITY'],
  [selections, 'OrderRuleSelections.java', 'FORM_KEY_SHIPPING_METHOD'],
  [selections, 'OrderRuleSelections.java', 'FORM_KEY_TRY_IN_REQUIRED'],
  [selections, 'OrderRuleSelections.java', 'FORM_KEY_PROCESS_REVIEWS'],
  [selections, 'OrderRuleSelections.java', 'inbound_tracking_no is required for order type'],
  [draftService, 'CaseGroupDraftService.java', 'OrderRuleSelections.parse(request.formValues(), false)'],
  [draftService, 'CaseGroupDraftService.java', 'OrderRuleSelections.parse(parsed.formValues(), true)'],
  [draftService, 'CaseGroupDraftService.java', 'orderRuleService.initializeOnSubmit('],

  // 3. 交期计算取配置，占位值可识别
  [planService, 'DeliveryPlanService.java', 'ruleCatalog.productCycle('],
  [planService, 'DeliveryPlanService.java', 'ruleCatalog.priorityCap('],
  [planService, 'DeliveryPlanService.java', 'ruleCatalog.perProcessConfirmationDays()'],
  [planService, 'DeliveryPlanService.java', 'ruleCatalog.doctorConfirmationGraceDays()'],
  [planService, 'DeliveryPlanService.java', 'ruleCatalog.shippingTransit('],
  [planService, 'DeliveryPlanService.java', 'baseCycleInfluencesResult'],
  [catalog, 'OrderingRuleCatalog.java', 'public boolean isPlaceholder()'],
  [ruleService, 'OrderRuleService.java', 'computation.placeholderRules()'],
  [doctorPortal, 'DoctorPortalV2.vue', "estimate_status === 'PLACEHOLDER'"],
  [doctorPortal, 'DoctorPortalV2.vue', '（待确认）'],
  [csPages, 'CsPortalPages.vue', '（待确认）'],

  // 试戴：独立计价项 + 同一订单
  [billItemService, 'OrderBillItemService.java', 'generateTryInItem'],
  [billItemService, 'OrderBillItemService.java', 'ITEM_TRY_IN = "TRY_IN"'],
  [tryInService, 'TryInService.java', 'finalizeSelection'],
  [tryInService, 'TryInService.java', 'UPDATE orders'],

  // 客服端时间异常提示
  [internalDto, 'OrderInternalDTO.java', '@JsonProperty("delivery_alert")'],
  [projection, 'OrderProjectionQueryService.java', 'EARLIER_THAN_FEASIBLE'],
  [projection, 'OrderProjectionQueryService.java', 'confirmation_overdue'],
  [csPages, 'CsPortalPages.vue', 'cs-delivery-alert'],
  [doctorPortal, 'DoctorPortalV2.vue', 'saveRequestedDeliveryDate'],
  [doctorPortal, 'DoctorPortalV2.vue', 'respondProcessConfirmation'],

  // 占位值转正走配置，不改代码
  [controller, 'OrderRuleController.java', '/ordering-rules/{ruleType}/{ruleKey}'],
  [ruleService, 'OrderRuleService.java', 'UPDATE ordering_rule_config'],

  // 契约
  [openapi, 'openapi.yaml', 'getOrderDeliveryPlan'],
  [openapi, 'openapi.yaml', 'putOrderDeliveryRequestedDate'],
  [openapi, 'openapi.yaml', 'postOrderProcessConfirmationRequest'],
  [openapi, 'openapi.yaml', 'postOrderProcessConfirmationRespond'],
  [openapi, 'openapi.yaml', 'postOrderTryInComplete'],
  [openapi, 'openapi.yaml', 'postOrderTryInFinalize'],
  [openapi, 'openapi.yaml', 'putOrderingRule'],

  // 测试：每条验收都有对应断言，含越权拒绝
  [tests, 'OrderRuleEngineTests.java', 'tryInSelectionCreatesItsOwnBillItemAndTheFinalProductStaysOnTheSameOrder'],
  [tests, 'OrderRuleEngineTests.java', 'eachProcessConfirmationAddsExactlyOneDayToTheDeliveryDate'],
  [tests, 'OrderRuleEngineTests.java', 'rushOrderShortensTheDeliveryDateAndStaysDistinguishableFromTheNormalCycle'],
  [tests, 'OrderRuleEngineTests.java', 'impressionReworkAndReturnOrdersCannotBeSubmittedWithoutInboundTrackingNo'],
  [tests, 'OrderRuleEngineTests.java', 'doctorPullingTheDeliveryDateForwardRaisesTheCsVarianceAlert'],
  [tests, 'OrderRuleEngineTests.java', 'patientCreatedWhileOrderingImmediatelyAppearsInPatientManagementAndCarriesIntoTheOrder'],
  [tests, 'OrderRuleEngineTests.java', 'processConfirmationLeftUnansweredPostponesDeliveryAndSurfacesAWaitingAlert'],
  [tests, 'OrderRuleEngineTests.java', 'deliveryEstimateIsMarkedPlaceholderUntilCustomerConfirmsTheStandardCycle'],
  [tests, 'OrderRuleEngineTests.java', 'unknownOrderingRuleValuesAreRejectedInsteadOfSilentlyDefaulted'],
  [tests, 'OrderRuleEngineTests.java', 'processConfirmationRolesAreSeparated'],
  [tests, 'OrderRuleEngineTests.java', 'removingTryInPermissionFromCsDeniesTryInCompletionEvenThoughThePortalRoleMatches'],
  [tests, 'OrderRuleEngineTests.java', 'doctorCannotReadAnotherDoctorsDeliveryPlan']
]

required
  .filter(([content, , fragment]) => !content.includes(fragment))
  .forEach(([, file, fragment]) => failures.push(`${file} missing: ${fragment}`))

// 交期天数不得写死在引擎里。允许 0 / 1 / -1 这类结构性常量（下标、符号判定），
// 但不允许出现看起来像标准周期的字面量赋值。
const hardcodedDays = planService.match(/(?:int|long)\s+\w*[Dd]ays\w*\s*=\s*(?!0;|1;|-1;)\d+;/g)
if (hardcodedDays) {
  failures.push(`DeliveryPlanService.java 出现写死的天数：${hardcodedDays.join(', ')}（规则数值必须来自 ordering_rule_config）`)
}

// 没有为本批次扩订单状态枚举：试戴与过程确认是各自的域，混进订单状态会让
// 一期验收的「13 个内部值 / 7 个外部值」口径失效。
const internalStatus = read(
  'backend/platform-server/src/main/java/com/yuri/aiorder/order/status/InternalOrderStatus.java'
)
const externalStatus = read(
  'backend/platform-server/src/main/java/com/yuri/aiorder/order/status/ExternalOrderStatus.java'
)
for (const forbidden of ['TRY_IN', 'AWAITING_DOCTOR', 'WAITING_DOCTOR']) {
  if (internalStatus.includes(forbidden) || externalStatus.includes(forbidden)) {
    failures.push(`订单状态枚举里出现了 ${forbidden}：试戴/过程确认是独立的域，不进订单状态`)
  }
}

// 回寄运单号的必填范围按验收口径（印模/返工/退货），与前端校验保持一致。
if (!vocabulary.includes('Set.of("IMPRESSION", "REWORK", "RETURN")')) {
  failures.push('OrderRuleVocabulary.java: 回寄运单号必填的订单类型与验收口径不一致')
}
const wizard = read('frontend/src/doctor/DoctorCaseGroupWizard.vue')
if (!wizard.includes("['IMPRESSION', 'REWORK', 'RETURN'].includes(caseSettings.order_type)")) {
  failures.push('DoctorCaseGroupWizard.vue: 前端的回寄运单号校验范围与后端不一致')
}

if (failures.length > 0) {
  console.error('check:task-034-order-rules failed:')
  for (const failure of failures) console.error(`  - ${failure}`)
  process.exit(1)
}

console.log(`check:task-034-order-rules passed (${required.length} assertions)`)
