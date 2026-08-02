import fs from 'node:fs'

const read = (path) => fs.readFileSync(path, 'utf8')

const files = {
  controller: read('backend/platform-server/src/main/java/com/yuri/aiorder/workflow/execution/WorkflowExecutionController.java'),
  service: read('backend/platform-server/src/main/java/com/yuri/aiorder/workflow/execution/WorkflowExecutionService.java'),
  request: read('backend/platform-server/src/main/java/com/yuri/aiorder/workflow/execution/ProductionRewardPenaltyRecordRequest.java'),
  statusRequest: read('backend/platform-server/src/main/java/com/yuri/aiorder/workflow/execution/ProductionRewardPenaltyStatusRequest.java'),
  response: read('backend/platform-server/src/main/java/com/yuri/aiorder/workflow/execution/ProductionRewardPenaltyRecordResponse.java'),
  tests: read('backend/platform-server/src/test/java/com/yuri/aiorder/production/ProductionRewardPenaltySummaryTests.java'),
  openapi: read('docs/api/openapi.yaml'),
  frontend: read('frontend/src/App.vue'),
  status: read('STATUS.md'),
  decisions: read('DECISIONS.md'),
  tasks: read('tasks/README.md'),
  readme: read('README.md'),
  plan: read('docs/acceptance/phase-one-production-support-closure-plan.md'),
  gapMatrix: read('docs/acceptance/prd-v2-gap-matrix.md'),
  task8Matrix: read('docs/acceptance/task-8-acceptance-matrix.md'),
  readiness: read('docs/deployment/readiness-checklist.md'),
  finalReport: read('docs/deployment/task-8-final-readiness-report.md'),
  acceptance: read('acceptance.json'),
  packageJson: read('package.json')
}

const required = [
  [files.controller, 'WorkflowExecutionController.java', '"/production/reward-penalty/records"'],
  [files.controller, 'WorkflowExecutionController.java', '"/production/reward-penalty/records/{recordNo}/status"'],
  [files.controller, 'WorkflowExecutionController.java', 'createProductionRewardPenaltyRecord'],
  [files.controller, 'WorkflowExecutionController.java', 'updateProductionRewardPenaltyRecordStatus'],
  [files.service, 'WorkflowExecutionService.java', 'createProductionRewardPenaltyRecord('],
  [files.service, 'WorkflowExecutionService.java', 'updateProductionRewardPenaltyRecordStatus('],
  [files.service, 'WorkflowExecutionService.java', 'requireProductionRewardPenaltyWrite'],
  [files.service, 'WorkflowExecutionService.java', 'PRODUCTION_REWARD_PENALTY_TYPES'],
  [files.service, 'WorkflowExecutionService.java', 'PRODUCTION_REWARD_PENALTY_STATUSES'],
  [files.service, 'WorkflowExecutionService.java', 'PRODUCTION_REWARD_PENALTY_REASON_CATEGORIES'],
  [files.service, 'WorkflowExecutionService.java', 'record_no already exists'],
  [files.service, 'WorkflowExecutionService.java', 'reward penalty record not found'],
  [files.request, 'ProductionRewardPenaltyRecordRequest.java', '@JsonProperty("record_no")'],
  [files.request, 'ProductionRewardPenaltyRecordRequest.java', '@JsonProperty("record_type")'],
  [files.request, 'ProductionRewardPenaltyRecordRequest.java', '@JsonProperty("reason_category")'],
  [files.request, 'ProductionRewardPenaltyRecordRequest.java', '@JsonProperty("employee_user_id")'],
  [files.statusRequest, 'ProductionRewardPenaltyStatusRequest.java', '@NotBlank String status'],
  [files.response, 'ProductionRewardPenaltyRecordResponse.java', '@JsonProperty("approver_user_id")'],
  [files.response, 'ProductionRewardPenaltyRecordResponse.java', '@JsonProperty("approved_at")'],
  [files.tests, 'ProductionRewardPenaltySummaryTests.java', 'workerCanCreateRewardPenaltyRecordAndAdminCanUpdateStatus'],
  [files.tests, 'ProductionRewardPenaltySummaryTests.java', 'doctorCannotCreateOrUpdateProductionRewardPenaltyRecord'],
  [files.openapi, 'openapi.yaml', 'ProductionRewardPenaltyRecordRequest'],
  [files.openapi, 'openapi.yaml', 'ProductionRewardPenaltyStatusRequest'],
  [files.openapi, 'openapi.yaml', 'ProductionRewardPenaltyRecord'],
  [files.openapi, 'openapi.yaml', 'createProductionRewardPenaltyRecord'],
  [files.openapi, 'openapi.yaml', 'updateProductionRewardPenaltyRecordStatus'],
  [files.openapi, 'openapi.yaml', 'CUSTOMER_FEEDBACK'],
  [files.frontend, 'App.vue', 'createProductionRewardPenaltyRecord'],
  [files.frontend, 'App.vue', 'updateProductionRewardPenaltyRecordStatus'],
  [files.frontend, 'App.vue', '登记奖惩记录'],
  [files.frontend, 'App.vue', '更新审批状态'],
  [files.frontend, 'App.vue', '/production/reward-penalty/records'],
  [files.status, 'STATUS.md', '9D.95.5 奖惩记录 / 审批状态第一增量'],
  [files.decisions, 'DECISIONS.md', 'D-085 任务 9D.95.5 奖惩记录 / 审批状态第一增量'],
  [files.tasks, 'tasks/README.md', '任务 9D.95.5：奖惩记录 / 审批状态第一增量'],
  [files.readme, 'README.md', 'npm run check:task9d955'],
  [files.plan, 'phase-one-production-support-closure-plan.md', '9D.95.5 奖惩记录 / 审批状态第一增量'],
  [files.gapMatrix, 'prd-v2-gap-matrix.md', '9D.95.5 奖惩记录 / 审批状态第一增量'],
  [files.task8Matrix, 'task-8-acceptance-matrix.md', '9D.95.5 奖惩记录 / 审批状态第一增量'],
  [files.readiness, 'readiness-checklist.md', '9D.95.5 奖惩记录 / 审批状态第一增量'],
  [files.finalReport, 'task-8-final-readiness-report.md', '9D.95.5 奖惩记录 / 审批状态第一增量'],
  [files.acceptance, 'acceptance.json', 'task-9d955-production-reward-penalty-management'],
  [files.acceptance, 'acceptance.json', 'npm run check:task9d955'],
  [files.acceptance, 'acceptance.json', 'Task 8 仍保持 NOT_READY'],
  [files.packageJson, 'package.json', 'check:task9d955']
]

const forbidden = [
  '工资发放已完成',
  '薪酬结算已完成',
  '复杂审批引擎已完成',
  '奖惩管理已全部完成',
  'Task 8 READY'
]

const missing = required.filter(([content, name, needle]) => !content.includes(needle))
const blocked = forbidden.flatMap((needle) =>
  [files.status, files.tasks, files.readme, files.plan, files.gapMatrix, files.task8Matrix, files.readiness, files.finalReport]
    .filter((content) => content.includes(needle))
    .map(() => needle)
)

if (missing.length || blocked.length) {
  console.error('task 9D.95.5 production reward penalty management check failed:')
  for (const [, name, needle] of missing) {
    console.error(`- ${name} missing ${needle}`)
  }
  for (const needle of blocked) {
    console.error(`- forbidden ${needle}`)
  }
  process.exit(1)
}

console.log('task 9D.95.5 production reward penalty management check ok')
