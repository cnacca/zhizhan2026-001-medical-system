import fs from 'node:fs'

const checks = [
  ['scripts/smoke-task-9d62-main-chain.spec.mjs', [
    'phaseOneMainChainSteps',
    'TASK9D62_DATA_MODE',
    'fixed-demo-first-three',
    'apiLogin',
    'createFixedDemoOrder',
    'approveCsReview',
    'approveProductionReview',
    'assertMainChainDataState',
    'task 9D.62.1 fixed data chain first increment ok',
    'assignFirstReadyNode',
    'completeAssignedNodeWithChecksAndWorklog',
    'assertWorkerTaskVisible',
    'task 9D.62.2 assignment and node operation first increment ok',
    'uploadDesignDraftFile',
    'completeDesignDraftConfirmation',
    'assertDoctorDesignDraftVisible',
    'task 9D.62.3 design draft confirmation first increment ok',
    'uploadBillFile',
    'attachBillToOrder',
    'assertDoctorBillPreviewVisible',
    'assertLogisticsShipmentGate',
    'task 9D.62.4 bill logistics first increment ok',
    'completeRemainingWorkflowNodes',
    'shipOrderAfterFinalInspection',
    'confirmReceiptByDoctor',
    'task 9D.62.5 shipment and receipt first increment ok',
    'createReworkExceptionPath',
    'loadReworkRecord',
    'closeReworkAfterTargetRedo',
    'task 9D.63 rework exception first increment ok',
    'GOAL-018',
    'assertDoctorSafeProjection',
    'assertCsInternalVisibility',
    'assertWorkerTaskScope',
    'assertAdminAssignmentAndReassignment',
    'task 9D.62.GOAL018 role boundary assertions ok',
    '1. 医生下单',
    '2. 客服初审',
    '3. 生产审核',
    '4. 派工到任务池',
    '5. 入检开工完工',
    '6. 出检推进',
    '7. 返工可见',
    '8. 设计稿确认',
    '9. 消息客服审核',
    '10. 账单物流',
    '11. 医生 AI 安全查询',
    '12. 医生确认收货',
    'TASK9D62_FRONTEND_URL',
    'TASK9D62_BROWSER_CHANNEL',
    'task 9D.62 phase-one main-chain browser smoke ok',
  ]],
  ['package.json', [
    'check:task9d62',
    'smoke:task9d62',
    'scripts/smoke-task-9d62-main-chain.spec.mjs',
  ]],
  ['acceptance.json', [
    'task-9d62-main-chain-browser-smoke-required-text',
  ]],
  ['docs/acceptance/task-8-acceptance-matrix.md', [
    '9D.62',
    '12 步主链路浏览器 smoke 第一增量',
    '9D.62.2',
    '9D.62.3',
    '9D.62.4',
    '9D.62.5',
    '9D.63',
  ]],
  ['docs/deployment/readiness-checklist.md', [
    'smoke:task9d62',
    '9D.62.2',
    '9D.62.3',
    '9D.62.4',
    '9D.62.5',
    '9D.63',
  ]],
  ['docs/deployment/task-8-final-readiness-report.md', [
    '9D.62',
    '9D.62.2',
    '9D.62.3',
    '9D.62.4',
    '9D.62.5',
    '9D.63',
  ]],
  ['DECISIONS.md', [
    'D-108 任务 9D.62 先固定 12 步主链路浏览器 smoke 入口',
    'D-110 任务 9D.62.2 用 API 固定演示数据推进派工与首个工序操作',
    'D-111 任务 9D.62.3 用真实文件签名 URL 推进设计稿确认数据闭环',
    'D-112 任务 9D.62.4 用真实账单文件推进账单预览数据闭环',
    'D-113 任务 9D.62.5 用完整本地工序推进发货与确认收货数据闭环',
    'D-114 任务 9D.63 用固定演示数据补返工异常路径闭环',
  ]],
  ['STATUS.md', [
    '9D.62 12 步主链路浏览器 smoke 第一增量',
    '9D.62.2',
    '9D.62.3',
    '9D.62.4',
    '9D.62.5',
    '9D.63',
  ]],
  ['tasks/README.md', [
    '任务 9D.62：12 步主链路浏览器 smoke 第一增量',
    '9D.62.2',
    '9D.62.3',
    '9D.62.4',
    '9D.62.5',
    '9D.63',
  ]],
  ['README.md', [
    'smoke:task9d62',
  ]],
]

for (const [file, patterns] of checks) {
  if (!fs.existsSync(file)) {
    console.error(`${file} missing required file`)
    process.exit(1)
  }
  const text = fs.readFileSync(file, 'utf8')
  for (const pattern of patterns) {
    if (!text.includes(pattern)) {
      console.error(`${file} missing required text: ${pattern}`)
      process.exit(1)
    }
  }
}

console.log('task 9D.62 main-chain browser smoke check ok')
