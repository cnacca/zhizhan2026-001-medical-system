import fs from 'node:fs'

const app = fs.readFileSync('frontend/src/App.vue', 'utf8')
const service = fs.readFileSync('backend/platform-server/src/main/java/com/yuri/aiorder/collaboration/CollaborationService.java', 'utf8')
const tests = fs.readFileSync('backend/platform-server/src/test/java/com/yuri/aiorder/collaboration/MessageDesignBillNotificationTests.java', 'utf8')
const openapi = fs.readFileSync('docs/api/openapi.yaml', 'utf8')

const requiredFragments = [
  [service, 'CollaborationService.java', 'requireFinalOutCheckPass'],
  [service, 'CollaborationService.java', 'final out-check pass is required before shipment'],
  [service, 'CollaborationService.java', "c.check_type = 'OUT'"],
  [service, 'CollaborationService.java', "c.result = 'PASS'"],
  [tests, 'MessageDesignBillNotificationTests.java', 'shipmentRequiresFinalOutCheckPassBeforeUpdatingExternalProjection'],
  [tests, 'MessageDesignBillNotificationTests.java', 'markFinalOutCheckPassed'],
  [tests, 'MessageDesignBillNotificationTests.java', 'SF-BLOCKED'],
  [tests, 'MessageDesignBillNotificationTests.java', 'SF-READY'],
  [app, 'frontend/src/App.vue', 'shipProductionBoardOrder'],
  [app, 'frontend/src/App.vue', 'productionBoardLogisticsCarrier'],
  [app, 'frontend/src/App.vue', 'production-board-logistics-carrier'],
  [app, 'frontend/src/App.vue', 'production-board-logistics-tracking-no'],
  [app, 'frontend/src/App.vue', 'production-board-ship-button'],
  [app, 'frontend/src/App.vue', '终检出检通过后才能发货'],
  [openapi, 'docs/api/openapi.yaml', '任务 9D.14 第一增量'],
  [openapi, 'docs/api/openapi.yaml', 'OUT/PASS 终检出检记录']
]

const missing = requiredFragments
  .filter(([source, , fragment]) => !source.includes(fragment))
  .map(([, file, fragment]) => `${file} -> ${fragment}`)

if (missing.length > 0) {
  console.error('task 9D.14 shipping gate check failed:')
  for (const item of missing) {
    console.error(`- missing ${item}`)
  }
  process.exit(1)
}

console.log('task 9D.14 shipping gate check ok')
