import fs from 'node:fs'

const files = {
  app: fs.readFileSync('frontend/src/App.vue', 'utf8'),
  viewer: fs.readFileSync('frontend/src/components/StlViewerDialog.vue', 'utf8'),
  styles: fs.readFileSync('frontend/src/styles.css', 'utf8'),
  doctorVo: fs.readFileSync('backend/platform-server/src/main/java/com/yuri/aiorder/order/api/DoctorOrderVO.java', 'utf8'),
  projection: fs.readFileSync('backend/platform-server/src/main/java/com/yuri/aiorder/order/api/OrderProjectionQueryService.java', 'utf8'),
  collaboration: fs.readFileSync('backend/platform-server/src/main/java/com/yuri/aiorder/collaboration/CollaborationService.java', 'utf8'),
  openapi: fs.readFileSync('docs/api/openapi.yaml', 'utf8')
}

const required = [
  [files.app, 'BUG-005 STL-only selection', "file.original_filename.toLowerCase().endsWith('.stl')"],
  [files.app, 'BUG-005 original upload priority', "left.source_type === 'ORDER_ATTACHMENT' ? 0 : 1"],
  [files.app, 'BUG-005 explicit selector', 'data-testid="production-stl-selector"'],
  [files.app, 'BUG-005 3D dialog', 'productionBoardStlViewerVisible.value = true'],
  [files.viewer, 'BUG-005 STLLoader', 'new STLLoader().parse(buffer)'],
  [files.viewer, 'BUG-005 OrbitControls', 'new OrbitControls(camera, renderer.domElement)'],
  [files.viewer, 'BUG-005 high-DPI canvas CSS sizing', 'renderer.setSize(width, height)'],
  [files.viewer, 'BUG-005 canvas display sizing', '.stl-viewer-canvas :deep(canvas)'],
  [files.app, 'BUG-005 popup-safe signed file opening', "window.open('about:blank', '_blank')"],
  [files.app, 'BUG-005 signed file navigation', 'popup.location.replace'],
  [files.app, 'BUG-006 edit guard', 'v-if="canDoctorEditOrder(doctorOrderWorkspace.order)"'],
  [files.doctorVo, 'BUG-006 desensitized editable flag', 'boolean editable'],
  [files.projection, 'BUG-006 editable status calculation', 'isDoctorEditable(row.internalStatus())'],
  [files.openapi, 'BUG-006 editable contract', '是否允许医生继续编辑或补资料'],
  [files.app, 'BUG-007 doctor attachments', 'data-testid="doctor-original-attachments"'],
  [files.app, 'BUG-007 cs attachments', 'data-testid="cs-original-attachments"'],
  [files.app, 'BUG-007 original attachment filter', "file.source_type === 'ORDER_ATTACHMENT'"],
  [files.app, 'BUG-008 message-first load', 'const messagePayload = await apiFetch<MessageItem[]>'],
  [files.app, 'BUG-008 optional mentionable users', 'customerCollaborationMentionableUsers.value = []'],
  [files.collaboration, 'BUG-008 doctor own CS_ONLY history', "sender_user_id = :viewerUserId AND sender_role = 'DOCTOR'"],
  [files.app, 'BUG-009 tooth_position mapping', "['tooth_position', 'tooth_numbers'"],
  [files.styles, 'STL selector style', '.factory-stl-selector'],
  [files.styles, 'attachment list style', '.order-attachment-list']
]

const failures = required
  .filter(([content, , fragment]) => !content.includes(fragment))
  .map(([, description, fragment]) => `${description} missing: ${fragment}`)

const forbidden = [
  [files.app, 'mixed CAD/design selection helper remains', 'function productionBoardCadFiles()'],
  [files.app, '3D preview still opens signed file directly', 'window.open(payload.data.preview_url, \'_blank\', \'noopener\')'],
  [files.viewer, 'high-DPI canvas still uses buffer size as CSS size', 'renderer.setSize(width, height, false)']
]

for (const [content, description, fragment] of forbidden) {
  if (content.includes(fragment)) failures.push(description)
}

if (failures.length > 0) {
  console.error('2026-07-13 browser acceptance feedback check failed:')
  for (const failure of failures) console.error(`- ${failure}`)
  process.exit(1)
}

console.log('2026-07-13 browser acceptance feedback check ok')
