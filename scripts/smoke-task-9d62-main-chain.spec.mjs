import { expect, test } from '@playwright/test'
import { assertIsolatedSmokeTarget } from './assert-isolated-smoke-target.mjs'

const frontendUrl = process.env.TASK9D62_FRONTEND_URL ?? ''
const browserChannel = process.env.TASK9D62_BROWSER_CHANNEL ?? 'chrome'
const timeoutMs = Number(process.env.TASK9D62_TIMEOUT_MS ?? 120_000)
const dataMode = process.env.TASK9D62_DATA_MODE ?? 'fixed-demo-first-three'
const dataOnly = process.env.TASK9D62_DATA_ONLY === 'true'
const demoScenario = process.env.TASK9D62_DEMO_SCENARIO?.trim() ?? ''
const productType = process.env.TASK9D62_PRODUCT_TYPE?.trim() || 'REGULAR_CROWN'
const stopAfter = process.env.TASK9D62_STOP_AFTER?.trim() || 'completed'
const supportedStopStages = new Set([
  'pending-cs',
  'pending-production',
  'assigned',
  'rework-pending',
  'design-pending',
  'ready-to-ship',
  'completed'
])

if (!supportedStopStages.has(stopAfter)) {
  throw new Error(`unsupported TASK9D62_STOP_AFTER=${stopAfter}`)
}

function requireIsolatedTestEnvironment() {
  assertIsolatedSmokeTarget({
    isolatedEnv: process.env.TASK9D62_ISOLATED_ENV,
    isolatedEnvVariable: 'TASK9D62_ISOLATED_ENV',
    frontendUrl,
    frontendUrlVariable: 'TASK9D62_FRONTEND_URL',
    taskLabel: 'Task 9D.62 main-chain smoke'
  })
}

const credentials = {
  DOCTOR: {
    title: '医生端',
    username: process.env.TASK9D62_DOCTOR_USERNAME ?? 'doctor',
    password: process.env.TASK9D62_DOCTOR_PASSWORD ?? 'change-me-doctor',
    testId: 'portal-card-DOCTOR',
    loggedInText: '医生已登录'
  },
  CS: {
    title: '客服端',
    username: process.env.TASK9D62_CS_USERNAME ?? 'cs',
    password: process.env.TASK9D62_CS_PASSWORD ?? 'change-me-cs',
    testId: 'portal-card-CS',
    loggedInText: '客服已登录'
  },
  PRODUCTION: {
    title: '生产端',
    username: process.env.TASK9D62_WORKER_USERNAME ?? 'worker',
    password: process.env.TASK9D62_WORKER_PASSWORD ?? 'change-me-worker',
    testId: 'portal-card-PRODUCTION',
    loggedInText: '生产人员已登录'
  },
  ADMIN: {
    title: '管理端',
    username: process.env.TASK9D62_ADMIN_USERNAME ?? 'admin',
    password: process.env.TASK9D62_ADMIN_PASSWORD ?? 'change-me-admin',
    testId: 'portal-card-ADMIN',
    loggedInText: '管理员已登录'
  }
}

const phaseOneMainChainSteps = [
  {
    name: '1. 医生下单',
    portal: 'DOCTOR',
    menuPath: [],
    actionText: '＋ 新建订单',
    visibleText: ['新建订单', '1. 选择患者'],
    testIds: ['doctor-order-wizard']
  },
  {
    name: '2. 客服初审',
    portal: 'CS',
    menuPath: ['信息审核/翻译'],
    heading: '信息审核/翻译',
    visibleText: ['处理队列']
  },
  {
    name: '3. 生产审核',
    portal: 'PRODUCTION',
    menuPath: ['生产审核'],
    heading: '生产审核',
    visibleText: ['审核队列'],
    layoutCheck: 'production-review'
  },
  {
    name: '4. 设计任务领取与提交',
    portal: 'PRODUCTION',
    menuPath: ['设计任务池'],
    heading: '设计任务池',
    visibleText: ['设计任务池']
  },
  {
    name: '5. 医生确认设计稿',
    portal: 'DOCTOR',
    menuPath: ['我的订单'],
    heading: '订单管理',
    visibleText: ['全部订单'],
    testIds: ['doctor-page-orders']
  },
  {
    name: '5A. 管理员生产审核监控',
    portal: 'ADMIN',
    menuPath: ['生产审核监控'],
    heading: '生产审核监控',
    visibleText: ['审核队列']
  },
  {
    name: '6. 管理员派工',
    portal: 'ADMIN',
    menuPath: ['工艺生产'],
    actionText: '员工派工',
    heading: '工艺生产',
    visibleText: ['员工派工', '工序进度']
  },
  {
    name: '7. 入检开工完工',
    portal: 'PRODUCTION',
    menuPath: ['我的任务'],
    heading: '我的任务',
    visibleText: ['↻ 刷新任务']
  },
  {
    name: '8. 出检推进',
    portal: 'PRODUCTION',
    menuPath: ['扫码登记'],
    heading: '扫码登记',
    visibleText: ['↻ 刷新任务', '定位任务']
  },
  {
    name: '9. 返工可见',
    portal: 'PRODUCTION',
    menuPath: ['质量与返工'],
    actionText: '内返管理',
    heading: '内返管理',
    visibleText: ['终检入口']
  },
  {
    name: '10. 消息客服审核',
    portal: 'CS',
    menuPath: ['问单沟通'],
    heading: '问单沟通',
    visibleText: ['全部会话']
  },
  {
    name: '11. 账单物流',
    portal: 'DOCTOR',
    menuPath: ['账单中心'],
    heading: '账单与物流',
    visibleText: ['账单与物流'],
    testIds: ['doctor-page-billing']
  },
  {
    name: '12. 医生 AI 安全查询',
    portal: 'DOCTOR',
    menuPath: ['订单助手'],
    heading: '订单助手',
    visibleText: ['订单助手'],
    testIds: ['doctor-page-assistant']
  },
  {
    name: '13. 医生确认收货',
    portal: 'DOCTOR',
    menuPath: ['我的订单'],
    heading: '订单管理',
    visibleText: ['全部订单'],
    testIds: ['doctor-page-orders']
  }
]

async function assertReachable() {
  let response
  try {
    response = await fetch(`${frontendUrl}/api/bootstrap/health`)
  } catch (error) {
    throw new Error(`frontend/backend health check failed at ${frontendUrl}: ${error.message}`)
  }
  if (!response.ok) {
    throw new Error(`frontend/backend health check returned ${response.status}; start compose, backend, and frontend first`)
  }
}

async function apiFetch(pathname, token, options = {}) {
  const response = await fetch(`${frontendUrl}${pathname}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers ?? {})
    }
  })
  if (!response.ok) {
    const body = await response.text()
    throw new Error(`${pathname} failed with ${response.status}: ${body}`)
  }
  return response.json()
}

async function apiFetchExpectStatus(pathname, token, expectedStatus, options = {}) {
  const response = await fetch(`${frontendUrl}${pathname}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers ?? {})
    }
  })
  const body = await response.text()
  if (response.status !== expectedStatus) {
    throw new Error(`${pathname} expected ${expectedStatus} but got ${response.status}: ${body}`)
  }
  return body
}

async function apiLogin(portalName, accountOverride = {}) {
  const portal = { ...credentials[portalName], ...accountOverride }
  return apiFetch('/api/auth/login', null, {
    method: 'POST',
    body: JSON.stringify({
      username: portal.username,
      password: portal.password,
      portal: portalName
    })
  })
}

async function createFixedDemoOrder(doctorToken) {
  const marker = Date.now()
  const patientName = demoScenario
    ? `演示-${demoScenario}-${marker}`
    : `Task9D62Demo-${marker}`
  const acceptanceMarker = demoScenario
    ? `DEMO_DATA_V1:${demoScenario}`
    : '9D.62.1 fixed-demo-first-three'
  const formData = {
    patient_name: patientName,
    tooth_position: '16',
    material: '氧化锆',
    shade: 'A2',
    acceptance_marker: acceptanceMarker,
    demo_scenario: demoScenario || null
  }
  const draftPayload = await apiFetch('/orders', doctorToken, {
    method: 'POST',
    body: JSON.stringify({
      product_type: productType,
      form_data: formData,
      file_ids: [],
      is_draft: true
    })
  })
  const orderId = draftPayload.data.order_id
  const content = new TextEncoder().encode(
    'solid task9d62-order\n'
    + 'facet normal 0 0 1\n outer loop\n'
    + '  vertex 0 0 0\n  vertex 1 0 0\n  vertex 0 1 0\n'
    + ' endloop\nendfacet\nendsolid task9d62-order\n'
  )
  const tokenPayload = await apiFetch('/files/upload-token', doctorToken, {
    method: 'POST',
    body: JSON.stringify({
      order_id: orderId,
      source_type: 'ORDER_ATTACHMENT',
      visibility: 'DOCTOR',
      original_filename: `task-9d62-order-${marker}.stl`,
      content_type: 'model/stl',
      file_size: content.byteLength
    })
  })
  const uploadResponse = await fetch(tokenPayload.data.upload_url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'model/stl',
      'Content-Length': String(content.byteLength)
    },
    body: content
  })
  if (!uploadResponse.ok) {
    const body = await uploadResponse.text()
    throw new Error(`task 9D.62 order STL signed upload failed with ${uploadResponse.status}: ${body}`)
  }
  const completedFile = await apiFetch(`/files/${tokenPayload.data.file_id}/complete`, doctorToken, {
    method: 'POST'
  })
  expect(completedFile.data.upload_status).toBe('COMPLETED')

  const payload = await apiFetch(`/orders/${orderId}`, doctorToken, {
    method: 'PUT',
    body: JSON.stringify({
      product_type: productType,
      form_data: formData,
      file_ids: [completedFile.data.file_id],
      submit: true
    })
  })
  return payload.data
}

async function approveCsReview(orderId, csToken) {
  const payload = await apiFetch(`/orders/${orderId}/review`, csToken, {
    method: 'POST',
    body: JSON.stringify({
      action: 'APPROVE',
      production_note: '9D.62.1 固定演示数据：客服初审通过，进入生产审核。'
    })
  })
  return payload.data
}

async function createPendingWorkerMessage(orderId, workerToken) {
  const content = `9D.62 客服正常入口消息审核 ${Date.now()}`
  const payload = await apiFetch(`/orders/${orderId}/messages`, workerToken, {
    method: 'POST',
    body: JSON.stringify({ content, mention_user_ids: [] })
  })
  expect(payload.data.review_status).toBe('PENDING_REVIEW')
  return { ...payload.data, content }
}

async function loadActiveWorkflowChainForProduct(token) {
  const payload = await apiFetch('/workflow-chains', token)
  const chain = payload.data.find((item) => item.status === 1 && item.product_type === productType)
  if (!chain) {
    throw new Error('no workflow chain available for task 9D.62.1 fixed demo data')
  }
  return chain
}

async function grantProductionReviewPermission(adminToken, workerSession) {
  const assignableDirectPermissions = new Set([
    'design-draft:internal-review',
    'workflow:review-production',
    'final-inspection:manage'
  ])
  const permissionCodes = [...new Set([
    ...workerSession.permissions.filter((code) => assignableDirectPermissions.has(code)),
    'workflow:review-production'
  ])]
  const payload = await apiFetch(`/staff/accounts/${workerSession.userId}`, adminToken, {
    method: 'PUT',
    body: JSON.stringify({
      permission_codes: permissionCodes
    })
  })
  expect(payload.data.permission_codes).toContain('workflow:review-production')
  return payload.data
}

function productionReviewBranchParams() {
  if (productType === 'IMPLANT_RESTORATION') {
    return { implant_abutment: 'FINISHED_ABUTMENT' }
  }
  if (productType === 'VENEER_RESTORATION') {
    return { veneer_route: 'CAD_MILLING' }
  }
  return {}
}

async function approveProductionReview(orderId, reviewerToken) {
  const chain = await loadActiveWorkflowChainForProduct(reviewerToken)
  const payload = await apiFetch(`/orders/${orderId}/production-review`, reviewerToken, {
    method: 'POST',
    body: JSON.stringify({
      action: 'APPROVE',
      chain_id: chain.chain_id,
      intake_branch: chain.intake_branch === 'BOTH' ? 'SCAN' : chain.intake_branch,
      branch_params: productionReviewBranchParams()
    })
  })
  return payload.data
}

async function loadProcessInstance(orderId, token) {
  const payload = await apiFetch(`/orders/${orderId}/process-instance`, token)
  return payload.data
}

async function assignFirstReadyNode(orderId, adminToken, workerUserId) {
  const instance = await loadProcessInstance(orderId, adminToken)
  const readyNode = instance.nodes.find((node) =>
    node.node_status === 'READY' && node.node_category !== 'DESIGN_GATE')
  if (!readyNode) {
    throw new Error(`task 9D.62.2 cannot find READY node for order ${orderId}`)
  }
  const payload = await apiFetch(`/orders/${orderId}/process-instance/assign`, adminToken, {
    method: 'POST',
    body: JSON.stringify({
      assignments: [{
        node_instance_id: readyNode.node_instance_id,
        user_id: workerUserId
      }]
    })
  })
  const assignedNode = payload.data.nodes.find((node) => node.node_instance_id === readyNode.node_instance_id)
  expect(assignedNode?.assigned_user_id).toBe(Number(workerUserId))
  return assignedNode
}

async function assignReadyNode(orderId, adminToken, workerUserId, node) {
  const payload = await apiFetch(`/orders/${orderId}/process-instance/assign`, adminToken, {
    method: 'POST',
    body: JSON.stringify({
      assignments: [{
        node_instance_id: node.node_instance_id,
        user_id: workerUserId
      }]
    })
  })
  const assignedNode = payload.data.nodes.find((item) => item.node_instance_id === node.node_instance_id)
  expect(assignedNode?.assigned_user_id).toBe(Number(workerUserId))
  return assignedNode
}

async function assertWorkerTaskVisible(nodeInstanceId, workerToken, status) {
  const payload = await apiFetch(`/tasks/mine?status=${status}`, workerToken)
  const task = payload.data.find((item) => item.node_instance_id === nodeInstanceId)
  if (!task) {
    throw new Error(`task 9D.62.2 worker task ${nodeInstanceId} not visible with status ${status}`)
  }
  expect(task.node_status).toBe(status)
  return task
}

async function submitCheckRecord(nodeInstanceId, workerToken, checkType, remark) {
  const payload = await apiFetch('/check-records', workerToken, {
    method: 'POST',
    body: JSON.stringify({
      node_instance_id: nodeInstanceId,
      check_type: checkType,
      is_pass: true,
      remark
    })
  })
  expect(payload.data.node_instance_id).toBe(nodeInstanceId)
  expect(payload.data.check_type).toBe(checkType)
  expect(payload.data.result).toBe('PASS')
  return payload.data
}

async function submitFailedOutCheckForRework(nodeInstanceId, workerToken, reworkToNodeId) {
  const payload = await apiFetch('/check-records', workerToken, {
    method: 'POST',
    body: JSON.stringify({
      node_instance_id: nodeInstanceId,
      check_type: 2,
      is_pass: false,
      remark: '9D.63 固定演示数据：出检失败，创建返工记录',
      rework_to_node_id: reworkToNodeId
    })
  })
  expect(payload.data.node_instance_id).toBe(nodeInstanceId)
  expect(payload.data.check_type).toBe(2)
  expect(payload.data.result).toBe('FAIL')
  expect(payload.data.rework_id).toBeGreaterThan(0)
  return payload.data
}

async function operateNode(nodeInstanceId, workerToken, action, expectedStatus) {
  const payload = await apiFetch(`/process-instance/nodes/${nodeInstanceId}/${action}`, workerToken, {
    method: 'POST'
  })
  expect(payload.data.node_instance_id).toBe(nodeInstanceId)
  expect(payload.data.node_status).toBe(expectedStatus)
  return payload.data
}

async function startAndFinishWorklog(nodeInstanceId, workerToken) {
  const started = await apiFetch('/work-logs/start', workerToken, {
    method: 'POST',
    body: JSON.stringify({
      node_instance_id: nodeInstanceId
    })
  })
  expect(started.data.node_instance_id).toBe(nodeInstanceId)
  expect(started.data.status).toBe('IN_PROGRESS')

  const finished = await apiFetch(`/work-logs/${started.data.work_log_id}/finish`, workerToken, {
    method: 'POST'
  })
  expect(finished.data.node_instance_id).toBe(nodeInstanceId)
  expect(finished.data.status).toBe('COMPLETED')
  return finished.data
}

async function completeAssignedNodeWithChecksAndWorklog(nodeInstanceId, workerToken) {
  await assertWorkerTaskVisible(nodeInstanceId, workerToken, 'READY')
  await submitCheckRecord(nodeInstanceId, workerToken, 1, '9D.62.2 固定演示数据：入检通过')
  await operateNode(nodeInstanceId, workerToken, 'start', 'IN_PROGRESS')
  await assertWorkerTaskVisible(nodeInstanceId, workerToken, 'IN_PROGRESS')
  await startAndFinishWorklog(nodeInstanceId, workerToken)
  await operateNode(nodeInstanceId, workerToken, 'complete', 'COMPLETED')
  await assertWorkerTaskVisible(nodeInstanceId, workerToken, 'COMPLETED')
  await submitCheckRecord(nodeInstanceId, workerToken, 2, '9D.62.2 固定演示数据：出检通过')
}

async function loadReworkRecord(reworkId, orderId, token, status = 'PENDING') {
  const payload = await apiFetch(`/reworks?status=${status}&order_id=${orderId}`, token)
  const rework = payload.data.find((item) => item.rework_id === reworkId)
  if (!rework) {
    throw new Error(`task 9D.63 rework ${reworkId} not visible with status ${status}`)
  }
  return rework
}

async function closeReworkAfterTargetRedo(orderId, rework, adminToken, workerToken, workerUserId) {
  expect(rework.target_node_instance_id).toBeGreaterThan(0)
  expect(rework.target_node_status).toBe('READY')
  let assignedTarget = { node_instance_id: rework.target_node_instance_id }
  if (rework.assigned_user_id == null) {
    assignedTarget = await assignReadyNode(
      orderId,
      adminToken,
      workerUserId,
      assignedTarget
    )
  } else if (Number(rework.assigned_user_id) !== Number(workerUserId)) {
    const reassigned = await apiFetch(
      `/orders/${orderId}/process-instance/nodes/${rework.target_node_instance_id}/reassign`,
      adminToken,
      {
        method: 'POST',
        body: JSON.stringify({
          new_user_id: workerUserId,
          reason: '9D.63 固定演示数据：返工目标节点转派给当前验收技工'
        })
      }
    )
    assignedTarget = reassigned.data.nodes.find(
      (node) => node.node_instance_id === rework.target_node_instance_id
    )
    expect(assignedTarget?.assigned_user_id).toBe(Number(workerUserId))
  }
  await completeAssignedNodeWithChecksAndWorklog(assignedTarget.node_instance_id, workerToken)

  const payload = await apiFetch(`/reworks/${rework.rework_id}/close`, workerToken, {
    method: 'POST',
    body: JSON.stringify({
      reason_category: 'FIT_ISSUE',
      responsibility_type: 'WORKER',
      close_note: '9D.63 固定演示数据：返工目标节点重做后关闭'
    })
  })
  expect(payload.data.rework_id).toBe(rework.rework_id)
  expect(payload.data.status).toBe('DONE')
  expect(payload.data.reason_category).toBe('FIT_ISSUE')
  expect(payload.data.responsibility_type).toBe('WORKER')
  expect(payload.data.close_note).toBe('9D.63 固定演示数据：返工目标节点重做后关闭')
  return payload.data
}

async function createReworkExceptionPath(
  orderId,
  completedNodeId,
  adminToken,
  workerToken,
  workerUserId,
  { leavePending = false } = {}
) {
  const failedOutCheck = await submitFailedOutCheckForRework(completedNodeId, workerToken, completedNodeId)
  const pendingRework = await loadReworkRecord(failedOutCheck.rework_id, orderId, workerToken, 'PENDING')
  expect(pendingRework.from_node_instance_id).toBe(completedNodeId)
  expect(pendingRework.target_node_instance_id).toBe(completedNodeId)
  expect(pendingRework.target_node_status).toBe('READY')
  expect(pendingRework.reason_detail).toBe('9D.63 固定演示数据：出检失败，创建返工记录')

  if (leavePending) {
    return pendingRework
  }

  const closedRework = await closeReworkAfterTargetRedo(
    orderId,
    pendingRework,
    adminToken,
    workerToken,
    workerUserId
  )
  const doneRework = await loadReworkRecord(closedRework.rework_id, orderId, workerToken, 'DONE')
  expect(doneRework.status).toBe('DONE')
  expect(doneRework.target_node_status).toBe('COMPLETED')
  return doneRework
}

async function uploadDesignDraftFile(orderId, workerToken) {
  const content = new TextEncoder().encode(`solid task9d62\nfacet normal 0 0 1\n outer loop\n  vertex 0 0 0\n  vertex 1 0 0\n  vertex 0 1 0\n endloop\nendfacet\nendsolid task9d62\n`)
  const tokenPayload = await apiFetch('/files/upload-token', workerToken, {
    method: 'POST',
    body: JSON.stringify({
      order_id: orderId,
      source_type: 'DESIGN_DRAFT',
      visibility: 'INTERNAL',
      original_filename: `task-9d62-design-${Date.now()}.stl`,
      content_type: 'model/stl',
      file_size: content.byteLength
    })
  })

  const uploadResponse = await fetch(tokenPayload.data.upload_url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'model/stl',
      'Content-Length': String(content.byteLength)
    },
    body: content
  })
  if (!uploadResponse.ok) {
    const body = await uploadResponse.text()
    throw new Error(`task 9D.62.3 design draft signed upload failed with ${uploadResponse.status}: ${body}`)
  }

  const completePayload = await apiFetch(`/files/${tokenPayload.data.file_id}/complete`, workerToken, {
    method: 'POST'
  })
  expect(completePayload.data.upload_status).toBe('COMPLETED')
  expect(completePayload.data.file_id).toBe(tokenPayload.data.file_id)
  return completePayload.data.file_id
}

async function uploadDesignDraft(orderId, workerToken, fileId) {
  const submissionKey = `task-9d62-design-${orderId}-${Date.now()}`
  const payload = await apiFetch(`/orders/${orderId}/design-drafts`, workerToken, {
    method: 'POST',
    body: JSON.stringify({
      file_ids: [fileId],
      upload_note: '9D.62.3 固定演示数据：生产端上传设计稿',
      submission_key: submissionKey
    })
  })
  expect(payload.data.order_id).toBe(orderId)
  expect(payload.data.file_ids).toContain(fileId)
  expect(payload.data.file_count).toBe(1)
  expect(payload.data.status).toBe('PENDING_REVIEW')
  return payload.data
}

async function claimDesignTask(orderId, workerToken) {
  const poolPayload = await apiFetch('/design-tasks/pool', workerToken)
  const task = poolPayload.data.find((item) => item.order_id === orderId)
  if (!task) {
    throw new Error(`task 9D.62.3 cannot find design task for order ${orderId}`)
  }
  const payload = await apiFetch(`/design-tasks/${task.task_id}/claim`, workerToken, {
    method: 'POST'
  })
  expect(payload.data.task_id).toBe(task.task_id)
  expect(payload.data.status).toBe('CLAIMED')
  return payload.data
}

async function submitDesignDraft(orderId, draftId, workerToken) {
  const payload = await apiFetch(`/orders/${orderId}/design-drafts/${draftId}/submit`, workerToken, {
    method: 'POST'
  })
  expect(payload.data.draft_id).toBe(draftId)
  expect(payload.data.status).toBe('PENDING_REVIEW')
  expect(payload.data.submitted_at).toBeTruthy()
  return payload.data
}

async function approveDesignDraftInternally(orderId, draftId, reviewerToken) {
  const payload = await apiFetch(`/orders/${orderId}/design-drafts/${draftId}/internal-review`, reviewerToken, {
    method: 'POST',
    body: JSON.stringify({
      action: 'APPROVE'
    })
  })
  expect(payload.data.draft_id).toBe(draftId)
  expect(payload.data.status).toBe('PENDING_DOCTOR')
  return payload.data
}

async function assertDoctorDesignDraftVisible(orderId, draftId, doctorToken) {
  const payload = await apiFetch(`/orders/${orderId}/design-drafts`, doctorToken)
  const draft = payload.data.find((item) => item.draft_id === draftId)
  if (!draft) {
    throw new Error(`task 9D.62.3 doctor cannot see design draft ${draftId}`)
  }
  expect(draft.status).toBe('PENDING_DOCTOR')
  expect(draft.file_ids.length).toBeGreaterThan(0)
  return draft
}

async function loadDesignDraftPreviewUrl(fileId, doctorToken) {
  const payload = await apiFetch(`/files/${fileId}/preview-url`, doctorToken)
  expect(payload.data.file_id).toBe(fileId)
  expect(payload.data.preview_url).toBeTruthy()
  return payload.data.preview_url
}

async function completeDesignDraftConfirmation(orderId, draftId, doctorToken) {
  const visibleDraft = await assertDoctorDesignDraftVisible(orderId, draftId, doctorToken)
  await loadDesignDraftPreviewUrl(visibleDraft.file_ids[0], doctorToken)
  const payload = await apiFetch(`/orders/${orderId}/design-drafts/${draftId}/doctor-confirm`, doctorToken, {
    method: 'POST',
    body: JSON.stringify({
      action: 'CONFIRM'
    })
  })
  expect(payload.data.draft_id).toBe(draftId)
  expect(payload.data.status).toBe('DOCTOR_CONFIRMED')
  return payload.data
}

async function uploadBillFile(orderId, csToken) {
  // 账单文件必须是 doctor-visible 的 PDF：绑定账单前 CollaborationService 会校验
  // content_type = 'application/pdf' 或文件名以 .pdf 结尾，否则返回 409。
  const content = new TextEncoder().encode(`%PDF-1.4\nTask 9D.62.4 bill smoke ${Date.now()}\n%%EOF\n`)
  const tokenPayload = await apiFetch('/files/upload-token', csToken, {
    method: 'POST',
    body: JSON.stringify({
      order_id: orderId,
      source_type: 'BILL',
      visibility: 'DOCTOR_CS',
      original_filename: `task-9d62-bill-${Date.now()}.pdf`,
      content_type: 'application/pdf',
      file_size: content.byteLength
    })
  })

  const uploadResponse = await fetch(tokenPayload.data.upload_url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Length': String(content.byteLength)
    },
    body: content
  })
  if (!uploadResponse.ok) {
    const body = await uploadResponse.text()
    throw new Error(`task 9D.62.4 bill signed upload failed with ${uploadResponse.status}: ${body}`)
  }

  const completePayload = await apiFetch(`/files/${tokenPayload.data.file_id}/complete`, csToken, {
    method: 'POST'
  })
  expect(completePayload.data.upload_status).toBe('COMPLETED')
  expect(completePayload.data.file_id).toBe(tokenPayload.data.file_id)
  return completePayload.data.file_id
}

async function attachBillToOrder(orderId, csToken, fileId) {
  const payload = await apiFetch(`/orders/${orderId}/bill`, csToken, {
    method: 'POST',
    body: JSON.stringify({
      file_id: fileId
    })
  })
  expect(payload.data.order_id).toBe(orderId)
  expect(payload.data.file_id).toBe(fileId)
  expect(payload.data.bill_status).toBe('UPLOADED')
  return payload.data
}

async function assertDoctorBillPreviewVisible(orderId, fileId, doctorToken) {
  const billPayload = await apiFetch(`/orders/${orderId}/bill`, doctorToken)
  expect(billPayload.data.order_id).toBe(orderId)
  expect(billPayload.data.file_id).toBe(fileId)
  expect(billPayload.data.bill_status).toBe('UPLOADED')

  const previewPayload = await apiFetch(`/files/${fileId}/preview-url`, doctorToken)
  expect(previewPayload.data.file_id).toBe(fileId)
  expect(previewPayload.data.preview_url).toBeTruthy()
  return previewPayload.data.preview_url
}

async function assertLogisticsShipmentGate(orderId, csToken) {
  await apiFetchExpectStatus(`/orders/${orderId}/logistics`, csToken, 409, {
    method: 'POST',
    body: JSON.stringify({
      carrier: '顺丰速运',
      tracking_no: `SF-9D62-BLOCKED-${Date.now()}`
    })
  })
  const logisticsPayload = await apiFetch(`/orders/${orderId}/logistics`, csToken)
  expect(logisticsPayload.data.order_id).toBe(orderId)
  expect(logisticsPayload.data.logistics_status).toBe('PENDING')
}

async function completeRemainingWorkflowNodes(orderId, adminToken, workerToken, workerUserId) {
  const completedNodeIds = []
  for (let round = 0; round < 100; round += 1) {
    const instance = await loadProcessInstance(orderId, adminToken)
    if (instance.instance_status === 'COMPLETED') {
      expect(instance.nodes.every((node) => ['COMPLETED', 'SKIPPED'].includes(node.node_status))).toBe(true)
      return {
        instance,
        completedNodeIds
      }
    }

    const readyNodes = instance.nodes
      .filter((node) => node.node_status === 'READY')
      .sort((a, b) => a.step_order - b.step_order || a.node_instance_id - b.node_instance_id)
    if (readyNodes.length === 0) {
      throw new Error(`task 9D.62.5 workflow instance ${instance.instance_id} has no READY node but status is ${instance.instance_status}`)
    }

    for (const readyNode of readyNodes) {
      const assignedNode = await assignReadyNode(orderId, adminToken, workerUserId, readyNode)
      await completeAssignedNodeWithChecksAndWorklog(assignedNode.node_instance_id, workerToken)
      completedNodeIds.push(assignedNode.node_instance_id)
    }
  }
  throw new Error(`task 9D.62.5 workflow did not complete within 100 rounds for order ${orderId}`)
}

// 发货门禁要求 order_bill.payment_status ∈ {PAID, NOT_REQUIRED}，否则返回 409。
// 一期按 CP-001 基线由 CS / ADMIN 人工维护付款状态，这里复用同一条人工链路。
async function markBillPaid(orderId, csToken) {
  const payload = await apiFetch(`/orders/${orderId}/bill/payment-status`, csToken, {
    method: 'POST',
    body: JSON.stringify({ payment_status: 'PAID' })
  })
  expect(payload.data.order_id).toBe(orderId)
  expect(payload.data.payment_status).toBe('PAID')
  return payload.data
}

async function shipOrderAfterFinalInspection(orderId, csToken) {
  const trackingNo = `SF-9D62-${Date.now()}`
  const payload = await apiFetch(`/orders/${orderId}/logistics`, csToken, {
    method: 'POST',
    body: JSON.stringify({
      carrier: '顺丰速运',
      tracking_no: trackingNo
    })
  })
  expect(payload.data.order_id).toBe(orderId)
  expect(payload.data.carrier).toBe('顺丰速运')
  expect(payload.data.tracking_no).toBe(trackingNo)
  expect(payload.data.logistics_status).toBe('SHIPPED')
  return payload.data
}

async function confirmReceiptByDoctor(orderId, doctorToken) {
  const shippedOrder = await apiFetch(`/orders/${orderId}`, doctorToken)
  expect(shippedOrder.data.order_id).toBe(orderId)
  expect(shippedOrder.data.external_status).toBe('SHIPPED')

  const confirmPayload = await apiFetch(`/orders/${orderId}/confirm-receipt`, doctorToken, {
    method: 'POST'
  })
  expect(confirmPayload.data.orderId).toBe(orderId)
  expect(confirmPayload.data.externalStatus).toBe('COMPLETED')

  const completedOrder = await apiFetch(`/orders/${orderId}`, doctorToken)
  expect(completedOrder.data.order_id).toBe(orderId)
  expect(completedOrder.data.external_status).toBe('COMPLETED')
  return completedOrder.data
}

function assertMainChainDataState(createdOrder, csReview, productionReview) {
  expect(createdOrder.order_id, 'fixed demo order should have order_id').toBeGreaterThan(0)
  expect(createdOrder.order_no, 'fixed demo order should have order_no').toBeTruthy()
  expect(createdOrder.external_status).toBe('PENDING_REVIEW')
  expect(csReview.order_id).toBe(createdOrder.order_id)
  expect(csReview.internal_status).toBe('PENDING_PRODUCTION_REVIEW')
  expect(productionReview.order_id).toBe(createdOrder.order_id)
  expect(productionReview.internal_status).toBe('IN_DESIGN')
  expect(productionReview.instance_id, 'production review should instantiate workflow').toBeGreaterThan(0)
}

function assertObjectDoesNotHaveKeys(value, forbiddenKeys, label) {
  if (!value || typeof value !== 'object') {
    return
  }
  for (const [key, child] of Object.entries(value)) {
    if (forbiddenKeys.includes(key)) {
      throw new Error(`${label} doctor forbidden internal field: ${key}`)
    }
    if (child && typeof child === 'object') {
      assertObjectDoesNotHaveKeys(child, forbiddenKeys, label)
    }
  }
}

async function assertDoctorSafeProjection(orderId, doctorToken) {
  const payload = await apiFetch(`/orders/${orderId}`, doctorToken)
  expect(payload.data.order_id).toBe(orderId)
  expect(payload.data.external_status).toBeTruthy()
  assertObjectDoesNotHaveKeys(payload.data, [
    'internal_status',
    'node_instance_id',
    'process_name',
    'assigned_username',
    'assigned_user_id',
    'check_record',
    'work_log',
    'performance',
    'rework',
    'nodes'
  ], 'GOAL-018 doctor safe projection')
  return payload.data
}

async function assertCsInternalVisibility(orderId, csToken, productionReview) {
  expect(productionReview.internal_status).toBe('IN_DESIGN')
  const instance = await loadProcessInstance(orderId, csToken)
  expect(instance.order_id).toBe(orderId)
  expect(instance.nodes.length).toBeGreaterThan(0)
  expect(instance.nodes.some((node) => node.node_instance_id > 0)).toBe(true)
  return instance
}

async function assertWorkerTaskScope(nodeInstanceId, workerToken, workerUserId, expectedStatus = 'READY') {
  const payload = await apiFetch(`/tasks/mine?status=${expectedStatus}`, workerToken)
  for (const task of payload.data) {
    if ('assigned_user_id' in task) {
      expect(task.assigned_user_id).toBe(Number(workerUserId))
    }
  }
  const task = payload.data.find((item) => item.node_instance_id === nodeInstanceId)
  if (!task) {
    throw new Error(`task 9D.62.GOAL018 worker scoped task ${nodeInstanceId} not visible with status ${expectedStatus}`)
  }
  expect(task.node_status).toBe(expectedStatus)
  return task
}

async function assertAdminAssignmentAndReassignment(
  orderId,
  adminToken,
  workerSession,
  alternateWorkerSession,
  assignedNode
) {
  expect(assignedNode.assigned_user_id).toBe(Number(workerSession.userId))

  await apiFetchExpectStatus(
    `/orders/${orderId}/process-instance/assign`,
    adminToken,
    409,
    {
      method: 'POST',
      body: JSON.stringify({
        assignments: [{
          node_instance_id: assignedNode.node_instance_id,
          user_id: alternateWorkerSession.userId
        }]
      })
    }
  )
  await apiFetchExpectStatus(
    `/orders/${orderId}/process-instance/nodes/${assignedNode.node_instance_id}/reassign`,
    adminToken,
    400,
    {
      method: 'POST',
      body: JSON.stringify({
        new_user_id: alternateWorkerSession.userId,
        reason: ' '
      })
    }
  )

  const alternateAssignment = await apiFetch(
    `/orders/${orderId}/process-instance/nodes/${assignedNode.node_instance_id}/reassign`,
    adminToken,
    {
      method: 'POST',
      body: JSON.stringify({
        new_user_id: alternateWorkerSession.userId,
        reason: '9D.62.GOAL018：验证已有执行人必须通过有理由转派'
      })
    }
  )
  const alternateNode = alternateAssignment.data.nodes.find(
    (node) => node.node_instance_id === assignedNode.node_instance_id
  )
  expect(alternateNode?.assigned_user_id).toBe(Number(alternateWorkerSession.userId))
  await assertWorkerTaskScope(
    assignedNode.node_instance_id,
    alternateWorkerSession.accessToken,
    alternateWorkerSession.userId,
    'READY'
  )

  const originalWorkerTasks = await apiFetch('/tasks/mine?status=READY', workerSession.accessToken)
  expect(originalWorkerTasks.data.some(
    (task) => task.node_instance_id === assignedNode.node_instance_id
  )).toBe(false)

  const restoredAssignment = await apiFetch(
    `/orders/${orderId}/process-instance/nodes/${assignedNode.node_instance_id}/reassign`,
    adminToken,
    {
      method: 'POST',
      body: JSON.stringify({
        new_user_id: workerSession.userId,
        reason: '9D.62.GOAL018：完成转派门禁验证后恢复主链执行人'
      })
    }
  )
  const restoredNode = restoredAssignment.data.nodes.find(
    (node) => node.node_instance_id === assignedNode.node_instance_id
  )
  expect(restoredNode?.assigned_user_id).toBe(Number(workerSession.userId))
  return restoredNode
}

async function prepareFixedDemoFirstThreeSteps() {
  if (dataMode !== 'fixed-demo-first-three') {
    console.log(`task 9D.62.1 fixed data chain skipped: TASK9D62_DATA_MODE=${dataMode}`)
    return null
  }
  const doctorSession = await apiLogin('DOCTOR')
  const csSession = await apiLogin('CS')
  const adminSession = await apiLogin('ADMIN')
  const workerSession = await apiLogin('PRODUCTION')
  const alternateWorkerSession = await apiLogin('PRODUCTION', {
    username: process.env.TASK9D62_ORDINARY_WORKER_USERNAME ?? 'demo_cad',
    password: process.env.TASK9D62_ORDINARY_WORKER_PASSWORD ?? 'change-me-worker'
  })
  const createdOrder = await createFixedDemoOrder(doctorSession.accessToken)
  if (stopAfter === 'pending-cs') {
    console.log(
      `task 9D.62 demo stage ready: scenario=${demoScenario || 'default'}, stage=${stopAfter}, order_id=${createdOrder.order_id}, order_no=${createdOrder.order_no}`
    )
    return { createdOrder, stage: stopAfter }
  }
  const csReview = await approveCsReview(createdOrder.order_id, csSession.accessToken)
  if (stopAfter === 'pending-production') {
    console.log(
      `task 9D.62 demo stage ready: scenario=${demoScenario || 'default'}, stage=${stopAfter}, order_id=${createdOrder.order_id}, order_no=${createdOrder.order_no}`
    )
    return { createdOrder, csReview, stage: stopAfter }
  }
  await grantProductionReviewPermission(adminSession.accessToken, workerSession)
  const productionReview = await approveProductionReview(createdOrder.order_id, workerSession.accessToken)
  assertMainChainDataState(createdOrder, csReview, productionReview)
  const doctorProjection = await assertDoctorSafeProjection(createdOrder.order_id, doctorSession.accessToken)
  const csInternalVisibility = await assertCsInternalVisibility(
    createdOrder.order_id,
    csSession.accessToken,
    productionReview
  )
  console.log(
    `task 9D.62.1 fixed data chain first increment ok: order_id=${createdOrder.order_id}, order_no=${createdOrder.order_no}, instance_id=${productionReview.instance_id}`
  )

  const designTask = await claimDesignTask(createdOrder.order_id, workerSession.accessToken)
  const pendingMessage = await createPendingWorkerMessage(createdOrder.order_id, workerSession.accessToken)
  const designDraftFileId = await uploadDesignDraftFile(createdOrder.order_id, workerSession.accessToken)
  const designDraft = await uploadDesignDraft(createdOrder.order_id, workerSession.accessToken, designDraftFileId)
  await submitDesignDraft(createdOrder.order_id, designDraft.draft_id, workerSession.accessToken)
  const internallyApprovedDesignDraft = await approveDesignDraftInternally(
    createdOrder.order_id,
    designDraft.draft_id,
    adminSession.accessToken
  )
  if (stopAfter === 'design-pending') {
    console.log(
      `task 9D.62 demo stage ready: scenario=${demoScenario || 'default'}, stage=${stopAfter}, order_id=${createdOrder.order_id}, draft_id=${internallyApprovedDesignDraft.draft_id}`
    )
    return {
      createdOrder,
      csReview,
      productionReview,
      designTask,
      designDraft: internallyApprovedDesignDraft,
      stage: stopAfter
    }
  }
  const confirmedDesignDraft = await completeDesignDraftConfirmation(
    createdOrder.order_id,
    designDraft.draft_id,
    doctorSession.accessToken
  )
  console.log(
    `task 9D.62.3 design draft confirmation first increment ok: order_id=${createdOrder.order_id}, draft_id=${confirmedDesignDraft.draft_id}, file_id=${designDraftFileId}`
  )

  const assignedNode = await assignFirstReadyNode(createdOrder.order_id, adminSession.accessToken, workerSession.userId)
  const reassignedNode = await assertAdminAssignmentAndReassignment(
    createdOrder.order_id,
    adminSession.accessToken,
    workerSession,
    alternateWorkerSession,
    assignedNode
  )
  const scopedWorkerTask = await assertWorkerTaskScope(
    reassignedNode.node_instance_id,
    workerSession.accessToken,
    workerSession.userId,
    'READY'
  )
  console.log(
    `task 9D.62.GOAL018 role boundary assertions ok: order_id=${createdOrder.order_id}, doctor_external_status=${doctorProjection.external_status}, cs_nodes=${csInternalVisibility.nodes.length}, worker_task=${scopedWorkerTask.node_instance_id}, assigned_user_id=${reassignedNode.assigned_user_id}`
  )
  const roleAssertions = {
    doctorProjection,
    csInternalVisibility,
    scopedWorkerTask,
    reassignedNode
  }
  if (stopAfter === 'assigned') {
    console.log(
      `task 9D.62 demo stage ready: scenario=${demoScenario || 'default'}, stage=${stopAfter}, order_id=${createdOrder.order_id}, node_instance_id=${reassignedNode.node_instance_id}`
    )
    return {
      createdOrder,
      csReview,
      productionReview,
      designTask,
      designDraft: confirmedDesignDraft,
      assignedNode: reassignedNode,
      roleAssertions,
      stage: stopAfter
    }
  }
  await completeAssignedNodeWithChecksAndWorklog(reassignedNode.node_instance_id, workerSession.accessToken)
  console.log(
    `task 9D.62.2 assignment and node operation first increment ok: order_id=${createdOrder.order_id}, node_instance_id=${reassignedNode.node_instance_id}, worker_user_id=${workerSession.userId}`
  )
  const rework = await createReworkExceptionPath(
    createdOrder.order_id,
    reassignedNode.node_instance_id,
    adminSession.accessToken,
    workerSession.accessToken,
    workerSession.userId,
    { leavePending: stopAfter === 'rework-pending' }
  )
  if (stopAfter === 'rework-pending') {
    console.log(
      `task 9D.62 demo stage ready: scenario=${demoScenario || 'default'}, stage=${stopAfter}, order_id=${createdOrder.order_id}, rework_id=${rework.rework_id}`
    )
    return {
      createdOrder,
      csReview,
      productionReview,
      assignedNode: reassignedNode,
      roleAssertions,
      rework,
      stage: stopAfter
    }
  }
  console.log(
    `task 9D.63 rework exception first increment ok: order_id=${createdOrder.order_id}, rework_id=${rework.rework_id}, target_node_instance_id=${rework.target_node_instance_id}, status=${rework.status}`
  )
  const billFileId = await uploadBillFile(createdOrder.order_id, csSession.accessToken)
  const bill = await attachBillToOrder(createdOrder.order_id, csSession.accessToken, billFileId)
  await assertDoctorBillPreviewVisible(createdOrder.order_id, billFileId, doctorSession.accessToken)
  await assertLogisticsShipmentGate(createdOrder.order_id, csSession.accessToken)
  console.log(
    `task 9D.62.4 bill logistics first increment ok: order_id=${createdOrder.order_id}, bill_id=${bill.bill_id}, file_id=${billFileId}, shipment_gate=FINAL_OUT_REQUIRED`
  )
  const completedWorkflow = await completeRemainingWorkflowNodes(
    createdOrder.order_id,
    adminSession.accessToken,
    workerSession.accessToken,
    workerSession.userId
  )
  if (stopAfter === 'ready-to-ship') {
    console.log(
      `task 9D.62 demo stage ready: scenario=${demoScenario || 'default'}, stage=${stopAfter}, order_id=${createdOrder.order_id}, completed_nodes=${completedWorkflow.completedNodeIds.length}`
    )
    return {
      createdOrder,
      csReview,
      productionReview,
      assignedNode: reassignedNode,
      roleAssertions,
      rework,
      designDraft: confirmedDesignDraft,
      bill,
      completedWorkflow,
      stage: stopAfter
    }
  }
  await markBillPaid(createdOrder.order_id, csSession.accessToken)
  const logistics = await shipOrderAfterFinalInspection(createdOrder.order_id, csSession.accessToken)
  const completedOrder = await confirmReceiptByDoctor(createdOrder.order_id, doctorSession.accessToken)
  console.log(
    `task 9D.62.5 shipment and receipt first increment ok: order_id=${createdOrder.order_id}, completed_nodes=${completedWorkflow.completedNodeIds.length}, tracking_no=${logistics.tracking_no}, external_status=${completedOrder.external_status}`
  )
  return {
    createdOrder,
    csReview,
    productionReview,
    assignedNode: reassignedNode,
    roleAssertions,
    rework,
    designDraft: confirmedDesignDraft,
    bill,
    completedWorkflow,
    logistics,
    completedOrder,
    pendingMessage
  }
}

async function resetToLogin(page) {
  await page.goto(frontendUrl, { waitUntil: 'domcontentloaded' })
  await page.evaluate(() => localStorage.clear())
  await page.reload({ waitUntil: 'domcontentloaded' })
  await expect(page.getByTestId('portal-card-DOCTOR')).toBeVisible({ timeout: 10_000 })
}

async function loginViaPortal(page, portalName, accountOverride = {}) {
  const portal = { ...credentials[portalName], ...accountOverride }
  await resetToLogin(page)
  await page.getByTestId(portal.testId).click()
  await expect(page.getByRole('heading', { name: `${portal.title}登录` })).toBeVisible()
  const accountLabel = portalName === 'DOCTOR' ? '账号' : '用户名'
  await page.getByRole('textbox', { name: accountLabel }).fill(portal.username, { timeout: 10_000 })
  await page.getByRole('textbox', { name: '密码' }).fill(portal.password, { timeout: 10_000 })
  await page.getByRole('button', { name: '登录' }).click()
  if (portalName === 'DOCTOR') {
    await expect(page.getByRole('navigation', { name: '医生端菜单' })).toBeVisible({ timeout: 10_000 })
    await expect(page.getByTestId('doctor-page-dashboard')).toBeVisible({ timeout: 10_000 })
  } else {
    await expect(page.locator('.route-menu')).toBeVisible({ timeout: 10_000 })
    await expect(page.locator('.prototype-dashboard-panel')).toBeVisible({ timeout: 10_000 })
  }
}

async function assertProductionReviewMenuIsolation(page) {
  await loginViaPortal(page, 'PRODUCTION', {
    username: process.env.TASK9D62_ORDINARY_WORKER_USERNAME ?? 'demo_cad',
    password: process.env.TASK9D62_ORDINARY_WORKER_PASSWORD ?? 'change-me-worker'
  })
  await expect(
    page.locator('.route-menu').getByRole('menuitem', { name: '生产审核', exact: true })
  ).toHaveCount(0)

  await loginViaPortal(page, 'CS')
  await expect(
    page.locator('.route-menu').getByRole('menuitem', { name: /生产审核/ })
  ).toHaveCount(0)
  console.log('task 9D.62 production-review menu isolation ok: ordinary WORKER and CS hidden')
}

async function clickMenuItem(page, label, portalName) {
  if (portalName === 'DOCTOR') {
    const button = page.getByRole('button', { name: label, exact: true }).filter({ visible: true }).first()
    await expect(button, `doctor menu button "${label}" should be visible`).toBeVisible({ timeout: 10_000 })
    await button.click()
    return
  }
  const nav = page.locator('.route-menu')
  const item = nav.getByRole('menuitem', { name: label }).filter({ visible: true }).first()
  await expect(item, `menu item "${label}" should be visible`).toBeVisible({ timeout: 10_000 })
  await item.click()
}

async function navigateMainChainStep(page, step) {
  for (const label of step.menuPath) {
    await clickMenuItem(page, label, step.portal)
  }
  if (step.actionText) {
    const action = page.getByText(step.actionText, { exact: true }).filter({ visible: true }).first()
    await expect(action, `${step.name} action "${step.actionText}" should be visible`).toBeVisible({ timeout: 10_000 })
    await action.click()
  }
  if (step.heading) {
    await expect(page.getByRole('heading', { name: step.heading }).first()).toBeVisible({ timeout: 10_000 })
  }
  for (const text of step.visibleText) {
    await expect(
      page.getByText(text, { exact: true }).filter({ visible: true }).first(),
      `${step.name} should show "${text}"`
    ).toBeVisible({ timeout: 10_000 })
  }
  for (const testId of step.testIds ?? []) {
    await expect(page.getByTestId(testId), `${step.name} should expose ${testId}`).toBeVisible({ timeout: 10_000 })
  }
  if (step.layoutCheck === 'production-review') {
    await assertProductionReviewLayout(page)
  }
}

async function assertProductionReviewLayout(page) {
  const reviewPage = page.getByTestId('production-review-page')
  await expect(reviewPage).toBeVisible({ timeout: 10_000 })
  await expect(page.getByTestId('production-review-table')).toBeVisible({ timeout: 10_000 })

  const layout = await reviewPage.evaluate((root) => {
    const table = root.querySelector('[data-testid="production-review-table"]')
    const search = root.querySelector('.aor-filter-search')
    const note = root.querySelector('.aor-production-note')
    const action = root.querySelector('.aor-view-button')
    const headers = [...root.querySelectorAll('th')].map((cell) => ({
      label: cell.textContent?.trim() ?? '',
      width: Math.round(cell.getBoundingClientRect().width),
      whiteSpace: getComputedStyle(cell).whiteSpace
    }))
    const noteStyle = note ? getComputedStyle(note) : null
    const actionStyle = action ? getComputedStyle(action) : null

    return {
      documentOverflow: document.documentElement.scrollWidth - window.innerWidth,
      tableLayout: table ? getComputedStyle(table).tableLayout : '',
      searchHeight: search ? Math.round(search.getBoundingClientRect().height) : 0,
      headers,
      noteHeight: note ? Math.round(note.getBoundingClientRect().height) : 0,
      noteOverflow: noteStyle?.overflow ?? '',
      noteWhiteSpace: noteStyle?.whiteSpace ?? '',
      actionHeight: action ? Math.round(action.getBoundingClientRect().height) : 0,
      actionBackground: actionStyle?.backgroundColor ?? ''
    }
  })

  const customerHeader = layout.headers.find((header) => header.label === '客户')
  const statusHeader = layout.headers.find((header) => header.label === '审核状态')
  expect(layout.documentOverflow, 'production review must not overflow the viewport').toBeLessThanOrEqual(1)
  expect(layout.tableLayout, 'production review table must use fixed column layout').toBe('fixed')
  expect(layout.searchHeight, 'production review search must keep designed control height').toBeGreaterThanOrEqual(36)
  expect(customerHeader?.width ?? 0, 'customer column must not collapse into vertical text').toBeGreaterThanOrEqual(120)
  expect(statusHeader?.width ?? 0, 'status column must not collapse into vertical text').toBeGreaterThanOrEqual(120)
  expect(customerHeader?.whiteSpace, 'production review headers must stay on one line').toBe('nowrap')
  expect(layout.noteHeight, 'production note preview must stay within two lines').toBeLessThanOrEqual(36)
  expect(layout.noteOverflow, 'production note preview must clip long content').toBe('hidden')
  expect(layout.noteWhiteSpace, 'production note preview must wrap inside its column').toBe('normal')
  expect(layout.actionHeight, 'production review action must use designed button height').toBe(32)
  expect(layout.actionBackground, 'production review action must not fall back to a native button').toBe('rgb(15, 159, 145)')
}

async function assertCsMessageReviewFromNormalMenu(page, preparedData) {
  if (!preparedData?.pendingMessage) return
  await loginViaPortal(page, 'CS')
  await page.getByRole('menuitem', { name: '问单沟通', exact: true }).click()
  await expect(page.getByRole('heading', { name: '问单沟通', exact: true })).toBeVisible()
  await page.getByRole('button', { name: /^待审核\s+\d+$/ }).click()
  const search = page.getByRole('searchbox', { name: '搜索会话' })
  await search.fill(preparedData.createdOrder.order_no)
  const conversation = page.getByRole('button', { name: new RegExp(preparedData.createdOrder.order_no) }).first()
  await expect(conversation).toBeVisible()
  await conversation.click()
  const message = page.locator('.cs-r-message-timeline article').filter({ hasText: preparedData.pendingMessage.content })
  await expect(message).toBeVisible()
  const reviewPanel = message.locator('.cs-r-message-review')
  await expect(reviewPanel.getByRole('button', { name: '审核通过', exact: true })).toBeVisible()
  const reject = reviewPanel.getByRole('button', { name: '退回修改', exact: true })
  const note = reviewPanel.getByLabel(new RegExp(`消息 ${preparedData.pendingMessage.msg_id} 审核意见`))
  await expect(reject).toBeDisabled()
  await note.fill('浏览器门禁验证后仍选择通过')
  await expect(reject).toBeEnabled()
  await reviewPanel.getByRole('button', { name: '审核通过', exact: true }).click()
  await expect(reviewPanel).toBeHidden()
  await expect(page.getByText('消息已审核通过并按可见范围发送。', { exact: true })).toBeVisible()
  await expect(page.getByText(preparedData.pendingMessage.content, { exact: true })).toHaveCount(0)
  await expect(page.getByRole('heading', { name: '请选择会话', exact: true })).toBeVisible()
}

test.use({ channel: browserChannel })

test.describe('Task 9D.62 phase-one main-chain browser smoke', () => {
  test.setTimeout(timeoutMs)

  test('visits the current PRD/TRD main-chain browser entry points', async ({ browser }) => {
    requireIsolatedTestEnvironment()
    await assertReachable()
    const preparedData = await prepareFixedDemoFirstThreeSteps()

    if (dataOnly) {
      console.log(`task 9D.62 data-only mode ok: scenario=${demoScenario || 'default'}, stage=${stopAfter}`)
      return
    }

    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } })
    try {
      await assertProductionReviewMenuIsolation(page)
      await assertCsMessageReviewFromNormalMenu(page, preparedData)
      let currentPortal = null
      for (const step of phaseOneMainChainSteps) {
        if (currentPortal !== step.portal) {
          currentPortal = step.portal
          await loginViaPortal(page, currentPortal)
        }
        await navigateMainChainStep(page, step)
        console.log(`task 9D.62 step ok: ${step.name}`)
      }
      console.log('task 9D.62 phase-one main-chain browser smoke ok')
    } finally {
      await page.close()
    }
  })
})
