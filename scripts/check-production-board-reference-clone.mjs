import fs from 'node:fs'

const files = {
  app: fs.readFileSync('frontend/src/App.vue', 'utf8'),
  styles: fs.readFileSync('frontend/src/styles.css', 'utf8'),
  response: fs.readFileSync('backend/platform-server/src/main/java/com/yuri/aiorder/workflow/runtime/ProcessNodeResponse.java', 'utf8'),
  service: fs.readFileSync('backend/platform-server/src/main/java/com/yuri/aiorder/workflow/runtime/WorkflowRuntimeService.java', 'utf8'),
  controller: fs.readFileSync('backend/platform-server/src/main/java/com/yuri/aiorder/workflow/runtime/WorkflowRuntimeController.java', 'utf8'),
}

const required = [
  [files.app, 'App.vue', 'stage_name: string | null'],
  [files.app, 'App.vue', 'const productionBoardStageDefinitions'],
  [files.app, 'App.vue', "title: '待生产审核'"],
  [files.app, 'App.vue', "title: '待派工'"],
  [files.app, 'App.vue', "title: 'CAD审核/扫描'"],
  [files.app, 'App.vue', "title: '石膏'"],
  [files.app, 'App.vue', "title: 'CAD设计'"],
  [files.app, 'App.vue', "title: 'CAM排版/染色/切削'"],
  [files.app, 'App.vue', "title: '车瓷'"],
  [files.app, 'App.vue', "title: '车金'"],
  [files.app, 'App.vue', "title: '上瓷'"],
  [files.app, 'App.vue', "title: '排牙'"],
  [files.app, 'App.vue', "title: '蜡型'"],
  [files.app, 'App.vue', "title: '充胶完成'"],
  [files.app, 'App.vue', "title: '钢托打磨/就位'"],
  [files.app, 'App.vue', "title: '胶托打磨/就位'"],
  [files.app, 'App.vue', "title: '质检'"],
  [files.app, 'App.vue', "title: '外发加工'"],
  [files.app, 'App.vue', 'factory-kanban-grid'],
  [files.app, 'App.vue', ':class="{ auxiliary: column.auxiliary }"'],
  [files.app, 'App.vue', 'factory-kanban-card'],
  [files.app, 'App.vue', 'factory-kanban-drawer'],
  [files.app, 'App.vue', 'factory-drawer-timeline'],
  [files.app, 'App.vue', '完成'],
  [files.app, 'App.vue', '超时'],
  [files.app, 'App.vue', '待问'],
  [files.app, 'App.vue', '内返'],
  [files.app, 'App.vue', 'visible_order_ids: number[]'],
  [files.app, 'App.vue', 'unfinished_count: number'],
  [files.app, 'App.vue', 'productionBoardVisibleOrderIds'],
  [files.app, 'App.vue', 'function isProductionBoardWaitingDispatch(card: ProductionKanbanCard)'],
  [files.app, 'App.vue', 'return isProductionBoardWaitingDispatch(card)'],
  [files.app, 'App.vue', "if (status === 'PENDING_PRODUCTION_REVIEW') return '待生产审核'"],
  [files.app, 'App.vue', "? '等待生产审核'"],
  [files.app, 'App.vue', "? '尚未派工'"],
  [files.app, 'App.vue', 'factory-order-note-text'],
  [files.app, 'App.vue', "timeZone: 'Asia/Shanghai'"],
  [files.app, 'App.vue', 'function productionBoardToday()'],
  [files.app, 'App.vue', '<span>未完成 <b>{{ summary.unfinishedCount }}</b></span>'],
  [files.app, 'App.vue', '开始时间'],
  [files.app, 'App.vue', '截止时间'],
  [files.app, 'App.vue', 'factory-drawer-files'],
  [files.app, 'App.vue', 'factory-drawer-work-actions'],
  [files.app, 'App.vue', '下载选中 STL'],
  [files.app, 'App.vue', '在浏览器中查看3D'],
  [files.app, 'App.vue', '上传设计返回'],
  [files.app, 'App.vue', '上传评审'],
  [files.app, 'App.vue', '打印工单'],
  [files.app, 'App.vue', 'download-url'],
  [files.styles, 'styles.css', '.factory-kanban-card {'],
  [files.styles, 'styles.css', '.factory-kanban-column.auxiliary {'],
  [files.styles, 'styles.css', '.factory-drawer-timeline {'],
  [files.styles, 'styles.css', '.factory-stage-summary-metrics {'],
  [files.styles, 'styles.css', 'height: 64px;'],
  [files.styles, 'styles.css', '.factory-order-note-text {'],
  [files.styles, 'styles.css', '-webkit-line-clamp: 2;'],
  [files.styles, 'styles.css', '.factory-drawer-files {'],
  [files.styles, 'styles.css', '.factory-drawer-work-actions {'],
  [files.styles, 'styles.css', '.factory-cad-actions {'],
  [files.response, 'ProcessNodeResponse.java', '@JsonProperty("stage_name") String stageName'],
  [files.response, 'ProcessNodeResponse.java', '@JsonProperty("started_at") LocalDateTime startedAt'],
  [files.response, 'ProcessNodeResponse.java', '@JsonProperty("deadline_at") LocalDateTime deadlineAt'],
  [files.service, 'WorkflowRuntimeService.java', 'stage_name,'],
  [files.service, 'WorkflowRuntimeService.java', 'deadline_at,'],
  [files.controller, 'WorkflowRuntimeController.java', '/production/kanban'],
]

const failures = required
  .filter(([content, , fragment]) => !content.includes(fragment))
  .map(([, file, fragment]) => `${file} missing: ${fragment}`)

if (files.app.includes('productionBoardColumnKeyForProcess')) {
  failures.push('App.vue still derives formal Kanban columns from process names')
}

if (files.app.includes("title: '工序待同步'") || files.app.includes("title: '工序待映射'")) {
  failures.push('App.vue still renders technical flow status as a Kanban column')
}

if (files.app.includes("['PENDING_PRODUCTION_REVIEW', 'PROCESS_INSTANCE_CREATED'].includes(status)) return 'CAD审核/扫描'")) {
  failures.push('App.vue still places pre-production queues in the CAD审核/扫描 column')
}

const activeNodeMarkerCondition = "productionBoardSelectedCard?.node?.node_instance_id === node.node_instance_id && node.node_status === 'IN_PROGRESS'"
if (files.app.split(activeNodeMarkerCondition).length - 1 !== 2) {
  failures.push('生产看板订单抽屉必须仅在当前节点为 IN_PROGRESS 时显示“进行中”')
}

if (failures.length > 0) {
  console.error(failures.join('\n'))
  process.exit(1)
}

console.log('生产看板参考页复刻结构检查通过')
