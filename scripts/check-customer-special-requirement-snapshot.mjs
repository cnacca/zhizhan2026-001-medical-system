import fs from 'node:fs'

const checks = [
  ['backend/platform-server/src/main/java/com/yuri/aiorder/clinic/ClinicService.java', [
    '"color", "contact", "occlusion", "margin", "shape", "material", "note"',
  ]],
  ['backend/platform-server/src/main/java/com/yuri/aiorder/clinic/ClinicManagementService.java', [
    '"color", "contact", "occlusion", "margin", "shape", "material", "note"',
  ]],
  ['backend/platform-server/src/main/java/com/yuri/aiorder/ai/AiGatewayService.java', [
    'CUSTOMER_REQUIREMENT_CATEGORIES',
    'loadCustomerProductionRequirements',
    '客户档案特殊要求（初审时自动带入）',
    '严禁输出模板版本、数据库字段、数据来源、知识上下文、内部状态、审计说明或 AI 说明',
  ]],
  ['frontend/src/components/CustomerManagementPage.vue', [
    "{ key: 'occlusion', label: '咬合偏好' }",
    '<h3>特殊生产要求</h3>',
    '客服初审自动带入，订单确认后保存当时要求的快照',
  ]],
  ['frontend/src/components/CsPortalPages.vue', [
    'buildAutomaticProductionNote',
    '`/clinics/${order.clinic_id}/preference`',
    'data-testid="cs-customer-requirement-reminder"',
    '通过初审后保存为订单快照，档案后续修改不会改变本单',
    'customerRequirementItems',
    'isLegacyTechnicalProductionNote',
    'PHASE_ONE_DEFAULT_V1',
    'const confirmedProductionNote = reviewedDraft',
    '`/orders/${orderId}/review`',
    'production_note: confirmedProductionNote',
  ]],
  ['backend/platform-server/src/test/java/com/yuri/aiorder/clinic/ClinicPreferenceTests.java', [
    'approvedOrderKeepsCustomerRequirementSnapshotAfterPreferenceChanges',
    '客户档案特殊要求（初审时自动带入）',
    '.doesNotContain("邻接偏松")',
  ]],
  ['docs/api/openapi.yaml', [
    'description: 咬合关系偏好',
  ]],
]

for (const [file, patterns] of checks) {
  const text = fs.readFileSync(file, 'utf8')
  for (const pattern of patterns) {
    if (!text.includes(pattern)) {
      console.error(`${file} missing required text: ${pattern}`)
      process.exit(1)
    }
  }
}

console.log('customer special requirement auto-fill and snapshot check ok')
