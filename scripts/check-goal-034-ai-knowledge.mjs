import fs from 'node:fs'

// GOAL-034 G3：AI-6 牙科 FAQ 与 AI-7 智能推荐产品。
// 这条检查守住三件事：
//   1. 两个智能体复用既有治理链路（限流 / 审计 / 输出防护），不另起炉灶；
//   2. 医生端的内部信息拒答边界不因新增入口而放宽；
//   3. 推荐结果与模型输出都不可能出现目录里不存在的产品。

const service = fs.readFileSync(
  'backend/platform-server/src/main/java/com/yuri/aiorder/ai/AiGatewayService.java',
  'utf8'
)
const controller = fs.readFileSync(
  'backend/platform-server/src/main/java/com/yuri/aiorder/ai/AiGatewayController.java',
  'utf8'
)
const migration = fs.readFileSync(
  'backend/platform-server/src/main/resources/db/migration/V77__ai_faq_knowledge_base.sql',
  'utf8'
)
const contracts = fs.readFileSync('frontend/src/doctor/types/contracts.ts', 'utf8')
const httpGateway = fs.readFileSync('frontend/src/doctor/services/httpDoctorGateway.ts', 'utf8')
const portal = fs.readFileSync('frontend/src/doctor/DoctorPortalV2.vue', 'utf8')
const wizard = fs.readFileSync('frontend/src/doctor/DoctorCaseGroupWizard.vue', 'utf8')
const openapi = fs.readFileSync('docs/api/openapi.yaml', 'utf8')
const record = fs.readFileSync(
  'docs/acceptance/goal-034-ai-faq-and-recommendation-real-model-record.md',
  'utf8'
)
const tests = fs.readFileSync(
  'backend/platform-server/src/test/java/com/yuri/aiorder/ai/AiGatewayTests.java',
  'utf8'
)

const required = [
  // 知识库与接口
  [migration, 'V77 migration', 'CREATE TABLE ai_faq_entry'],
  [migration, 'V77 migration', 'SAMPLE_PENDING_CUSTOMER_CONFIRMATION'],
  [controller, 'AiGatewayController.java', '/ai/faq'],
  [controller, 'AiGatewayController.java', '/ai/product-recommendation'],
  [openapi, 'openapi.yaml', 'postAiFaq'],
  [openapi, 'openapi.yaml', 'postAiProductRecommendation'],
  // 复用既有治理链路
  [service, 'AiGatewayService.java', 'enforceAiRateLimit(null, identity, "AI_FAQ"'],
  [service, 'AiGatewayService.java', 'enforceAiRateLimit(null, identity, "AI_PRODUCT_RECOMMENDATION"'],
  [service, 'AiGatewayService.java', 'case "AI_FAQ" -> "AI_FAQ_V1"'],
  // 医生端内部信息边界
  [service, 'AiGatewayService.java', 'identity.role() == UserRole.DOCTOR && asksForInternalData'],
  [tests, 'AiGatewayTests.java', 'doctorFaqRefusesInternalQuestionsWithoutCallingTheModel'],
  [tests, 'AiGatewayTests.java', 'workerCannotUseFaqOrProductRecommendation'],
  // 防幻觉：模型编号必须与候选集取交集
  [service, 'AiGatewayService.java', 'RECOMMENDED_IDS_MARKER'],
  [service, 'AiGatewayService.java', 'allowed.contains(productId)'],
  [service, 'AiGatewayService.java', 'stripRecommendedIdsLine'],
  [service, 'AiGatewayService.java', "version.publication_status = 'ACTIVE'"],
  // 前端入口
  [contracts, 'contracts.ts', 'askFaq(question: string'],
  [contracts, 'contracts.ts', 'recommendProducts(caseNote?: string)'],
  [httpGateway, 'httpDoctorGateway.ts', "'/ai/faq'"],
  [httpGateway, 'httpDoctorGateway.ts', "'/ai/product-recommendation'"],
  [portal, 'DoctorPortalV2.vue', 'answerWithFaq'],
  [wizard, 'DoctorCaseGroupWizard.vue', 'applyRecommendation'],
  [wizard, 'DoctorCaseGroupWizard.vue', 'selectedCategoryCode.value = product.category_code'],
  [wizard, 'DoctorCaseGroupWizard.vue', "recommendationSelected(recommendation) ? '✓ 已采用'"],
  // 真实模型证据
  [record, 'real-model record', 'langchain-deepseek-chat'],
  [record, 'real-model record', 'SAFE_REFUSAL']
]

const failures = required
  .filter(([content, , fragment]) => !content.includes(fragment))
  .map(([, file, fragment]) => `${file} missing: ${fragment}`)

// 推荐必须由医生显式采用，不能自动填表。
if (!wizard.includes('需您确认后才会加入订单')) {
  failures.push('DoctorCaseGroupWizard.vue: 缺少「需医生确认后才加入订单」的说明')
}

if (failures.length > 0) {
  console.error(failures.join('\n'))
  process.exit(1)
}

console.log('GOAL-034 AI-6 / AI-7 知识与推荐检查通过')
