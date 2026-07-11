import { expect, test } from '@playwright/test'

const frontendUrl = process.env.TASK9D62_FRONTEND_URL ?? 'http://127.0.0.1:5173'
const browserChannel = process.env.TASK9D62_BROWSER_CHANNEL ?? 'chrome'
const timeoutMs = Number(process.env.TASK9D62_TIMEOUT_MS ?? 120_000)
const dataMode = process.env.TASK9D62_DATA_MODE ?? 'fixed-demo-first-three'

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
    menuPath: ['订单管理', '新建订单'],
    heading: '医生订单工作台',
    visibleText: ['新建订单', '产品类型', '附件 file_id'],
    testIds: ['doctor-upload-file-input', 'doctor-order-create-button']
  },
  {
    name: '2. 客服初审',
    portal: 'CS',
    menuPath: ['订单管理', '待审核订单'],
    heading: '客服初审',
    visibleText: ['待审核订单', '查询']
  },
  {
    name: '3. 生产审核',
    portal: 'CS',
    menuPath: ['订单管理', '待审核订单'],
    heading: '客服初审',
    visibleText: ['客服端 / 审核与沟通', '核对医生提交资料，整理生产备注，并作为医生与工厂之间的审核中枢。']
  },
  {
    name: '4. 派工到任务池',
    portal: 'ADMIN',
    menuPath: ['工艺生产', '员工派工'],
    heading: '员工派工',
    visibleText: ['员工派工', '工序进度']
  },
  {
    name: '5. 入检开工完工',
    portal: 'PRODUCTION',
    menuPath: ['我的任务'],
    heading: '我的任务',
    visibleText: ['我的任务', '刷新']
  },
  {
    name: '6. 出检推进',
    portal: 'PRODUCTION',
    menuPath: ['扫码登记'],
    heading: '扫码登记',
    visibleText: ['通过人工核验登记入检、开工、暂停、完工和流转节点。']
  },
  {
    name: '7. 返工可见',
    portal: 'PRODUCTION',
    menuPath: ['质量与返工', '内返管理'],
    heading: '返工终检',
    visibleText: ['生产端 / 返工终检', '终检入口']
  },
  {
    name: '8. 设计稿确认',
    portal: 'DOCTOR',
    menuPath: ['订单管理', '设计稿确认'],
    heading: '医生订单工作台',
    visibleText: ['设计稿确认', '查询']
  },
  {
    name: '9. 消息客服审核',
    portal: 'CS',
    menuPath: ['沟通中心', '待审核消息'],
    heading: '客服协同台',
    visibleText: ['待审核消息', '订单消息上下文']
  },
  {
    name: '10. 账单物流',
    portal: 'DOCTOR',
    menuPath: ['订单管理', '账单物流'],
    heading: '医生订单工作台',
    visibleText: ['账单物流', '查询']
  },
  {
    name: '11. 医生 AI 安全查询',
    portal: 'DOCTOR',
    menuPath: ['订单助手'],
    heading: '医生订单工作台',
    visibleText: ['订单助手', '查询']
  },
  {
    name: '12. 医生确认收货',
    portal: 'DOCTOR',
    menuPath: ['订单管理', '我的订单'],
    heading: '医生订单工作台',
    visibleText: ['我的订单', '查询']
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

async function apiLogin(portalName) {
  const portal = credentials[portalName]
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
  const payload = await apiFetch('/orders', doctorToken, {
    method: 'POST',
    body: JSON.stringify({
      product_type: 'REGULAR_CROWN',
      form_data: {
        patient_name: `Task9D62Demo-${marker}`,
        tooth_position: '16',
        material: '氧化锆',
        shade: 'A2',
        acceptance_marker: '9D.62.1 fixed-demo-first-three'
      },
      file_ids: [],
      is_draft: false
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

async function loadFirstActiveWorkflowChain(token) {
  const payload = await apiFetch('/workflow-chains', token)
  const chain = payload.data.find((item) => item.status === 1) ?? payload.data[0]
  if (!chain) {
    throw new Error('no workflow chain available for task 9D.62.1 fixed demo data')
  }
  return chain
}

async function approveProductionReview(orderId, csToken) {
  const chain = await loadFirstActiveWorkflowChain(csToken)
  const payload = await apiFetch(`/orders/${orderId}/production-review`, csToken, {
    method: 'POST',
    body: JSON.stringify({
      action: 'APPROVE',
      chain_id: chain.chain_id,
      intake_branch: chain.intake_branch ?? 'SCAN',
      branch_params: {
        route: '9D62_FIXED_DEMO'
      }
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
  const readyNode = instance.nodes.find((node) => node.node_status === 'READY')
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
  expect(assignedNode?.assigned_user_id).toBe(workerUserId)
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
  expect(assignedNode?.assigned_user_id).toBe(workerUserId)
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
  const assignedTarget = await assignReadyNode(
    orderId,
    adminToken,
    workerUserId,
    {
      node_instance_id: rework.target_node_instance_id
    }
  )
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

async function createReworkExceptionPath(orderId, completedNodeId, adminToken, workerToken, workerUserId) {
  const failedOutCheck = await submitFailedOutCheckForRework(completedNodeId, workerToken, completedNodeId)
  const pendingRework = await loadReworkRecord(failedOutCheck.rework_id, orderId, workerToken, 'PENDING')
  expect(pendingRework.from_node_instance_id).toBe(completedNodeId)
  expect(pendingRework.target_node_instance_id).toBe(completedNodeId)
  expect(pendingRework.target_node_status).toBe('READY')
  expect(pendingRework.reason_detail).toBe('9D.63 固定演示数据：出检失败，创建返工记录')

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
  const content = new TextEncoder().encode(`Task 9D.62.3 design draft smoke ${Date.now()}`)
  const tokenPayload = await apiFetch('/files/upload-token', workerToken, {
    method: 'POST',
    body: JSON.stringify({
      order_id: orderId,
      source_type: 'DESIGN_DRAFT',
      visibility: 'DOCTOR_CS',
      original_filename: `task-9d62-design-${Date.now()}.txt`,
      content_type: 'text/plain',
      file_size: content.byteLength
    })
  })

  const uploadResponse = await fetch(tokenPayload.data.upload_url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'text/plain',
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
  const payload = await apiFetch(`/orders/${orderId}/design-drafts`, workerToken, {
    method: 'POST',
    body: JSON.stringify({
      file_ids: [fileId],
      upload_note: '9D.62.3 固定演示数据：生产端上传设计稿'
    })
  })
  expect(payload.data.order_id).toBe(orderId)
  expect(payload.data.file_ids).toContain(fileId)
  expect(payload.data.file_count).toBe(1)
  expect(payload.data.status).toBe('PENDING_CS_REVIEW')
  return payload.data
}

async function approveDesignDraftByCs(orderId, draftId, csToken) {
  const payload = await apiFetch(`/orders/${orderId}/design-drafts/${draftId}/cs-review`, csToken, {
    method: 'POST',
    body: JSON.stringify({
      action: 'APPROVE'
    })
  })
  expect(payload.data.draft_id).toBe(draftId)
  expect(payload.data.status).toBe('PENDING_DOCTOR_CONFIRM')
  return payload.data
}

async function assertDoctorDesignDraftVisible(orderId, draftId, doctorToken) {
  const payload = await apiFetch(`/orders/${orderId}/design-drafts`, doctorToken)
  const draft = payload.data.find((item) => item.draft_id === draftId)
  if (!draft) {
    throw new Error(`task 9D.62.3 doctor cannot see design draft ${draftId}`)
  }
  expect(draft.status).toBe('PENDING_DOCTOR_CONFIRM')
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
  const content = new TextEncoder().encode(`Task 9D.62.4 bill smoke ${Date.now()}`)
  const tokenPayload = await apiFetch('/files/upload-token', csToken, {
    method: 'POST',
    body: JSON.stringify({
      order_id: orderId,
      source_type: 'BILL',
      visibility: 'DOCTOR_CS',
      original_filename: `task-9d62-bill-${Date.now()}.txt`,
      content_type: 'text/plain',
      file_size: content.byteLength
    })
  })

  const uploadResponse = await fetch(tokenPayload.data.upload_url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'text/plain',
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
  expect(productionReview.internal_status).toBe('PROCESS_INSTANCE_CREATED')
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
  expect(productionReview.internal_status).toBe('PROCESS_INSTANCE_CREATED')
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
      expect(task.assigned_user_id).toBe(workerUserId)
    }
  }
  const task = payload.data.find((item) => item.node_instance_id === nodeInstanceId)
  if (!task) {
    throw new Error(`task 9D.62.GOAL018 worker scoped task ${nodeInstanceId} not visible with status ${expectedStatus}`)
  }
  expect(task.node_status).toBe(expectedStatus)
  return task
}

async function assertAdminAssignmentAndReassignment(orderId, adminToken, workerUserId, assignedNode) {
  expect(assignedNode.assigned_user_id).toBe(workerUserId)
  const reassignedNode = await assignReadyNode(orderId, adminToken, workerUserId, assignedNode)
  expect(reassignedNode.assigned_user_id).toBe(workerUserId)
  return reassignedNode
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
  const createdOrder = await createFixedDemoOrder(doctorSession.accessToken)
  const csReview = await approveCsReview(createdOrder.order_id, csSession.accessToken)
  const productionReview = await approveProductionReview(createdOrder.order_id, csSession.accessToken)
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
  const assignedNode = await assignFirstReadyNode(createdOrder.order_id, adminSession.accessToken, workerSession.userId)
  const reassignedNode = await assertAdminAssignmentAndReassignment(
    createdOrder.order_id,
    adminSession.accessToken,
    workerSession.userId,
    assignedNode
  )
  const scopedWorkerTask = await assertWorkerTaskScope(
    reassignedNode.node_instance_id,
    workerSession.accessToken,
    workerSession.userId,
    'READY'
  )
  console.log(
    `task 9D.62.GOAL018 role boundary assertions ok: order_id=${createdOrder.order_id}, doctor_external_status=${doctorProjection.external_status}, cs_nodes=${csInternalVisibility.nodes.length}, worker_task=${scopedWorkerTask.node_instance_id}, reassigned_user_id=${reassignedNode.assigned_user_id}`
  )
  const roleAssertions = {
    doctorProjection,
    csInternalVisibility,
    scopedWorkerTask,
    reassignedNode
  }
  await completeAssignedNodeWithChecksAndWorklog(reassignedNode.node_instance_id, workerSession.accessToken)
  console.log(
    `task 9D.62.2 assignment and node operation first increment ok: order_id=${createdOrder.order_id}, node_instance_id=${reassignedNode.node_instance_id}, worker_user_id=${workerSession.userId}`
  )
  const closedRework = await createReworkExceptionPath(
    createdOrder.order_id,
    reassignedNode.node_instance_id,
    adminSession.accessToken,
    workerSession.accessToken,
    workerSession.userId
  )
  console.log(
    `task 9D.63 rework exception first increment ok: order_id=${createdOrder.order_id}, rework_id=${closedRework.rework_id}, target_node_instance_id=${closedRework.target_node_instance_id}, status=${closedRework.status}`
  )
  const designDraftFileId = await uploadDesignDraftFile(createdOrder.order_id, workerSession.accessToken)
  const designDraft = await uploadDesignDraft(createdOrder.order_id, workerSession.accessToken, designDraftFileId)
  await approveDesignDraftByCs(createdOrder.order_id, designDraft.draft_id, csSession.accessToken)
  const confirmedDesignDraft = await completeDesignDraftConfirmation(
    createdOrder.order_id,
    designDraft.draft_id,
    doctorSession.accessToken
  )
  console.log(
    `task 9D.62.3 design draft confirmation first increment ok: order_id=${createdOrder.order_id}, draft_id=${confirmedDesignDraft.draft_id}, file_id=${designDraftFileId}`
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
    rework: closedRework,
    designDraft: confirmedDesignDraft,
    bill,
    completedWorkflow,
    logistics,
    completedOrder
  }
}

async function resetToLogin(page) {
  await page.goto(frontendUrl, { waitUntil: 'networkidle' })
  await page.evaluate(() => localStorage.clear())
  await page.goto(frontendUrl, { waitUntil: 'networkidle' })
}

async function loginViaPortal(page, portalName) {
  const portal = credentials[portalName]
  await resetToLogin(page)
  await page.getByTestId(portal.testId).click()
  await expect(page.getByRole('heading', { name: `${portal.title}登录` })).toBeVisible()
  await page.getByLabel('用户名').fill(portal.username)
  await page.getByLabel('密码').fill(portal.password)
  await page.getByRole('button', { name: '登录' }).click()
  await expect(page.getByText(portal.loggedInText)).toBeVisible({ timeout: 10_000 })
  await expect(page.locator('.prototype-dashboard-panel')).toBeVisible({ timeout: 10_000 })
}

async function clickMenuItem(page, label) {
  const nav = page.locator('.route-menu')
  const item = nav.getByRole('menuitem', { name: label }).filter({ visible: true }).first()
  await expect(item, `menu item "${label}" should be visible`).toBeVisible({ timeout: 10_000 })
  await item.click()
}

async function navigateMainChainStep(page, step) {
  for (const label of step.menuPath) {
    await clickMenuItem(page, label)
  }
  if (step.actionText) {
    const action = page.getByText(step.actionText, { exact: true }).filter({ visible: true }).first()
    await expect(action, `${step.name} action "${step.actionText}" should be visible`).toBeVisible({ timeout: 10_000 })
    await action.click()
  }
  await expect(page.getByRole('heading', { name: step.heading }).first()).toBeVisible({ timeout: 10_000 })
  for (const text of step.visibleText) {
    await expect(
      page.getByText(text, { exact: true }).filter({ visible: true }).first(),
      `${step.name} should show "${text}"`
    ).toBeVisible({ timeout: 10_000 })
  }
  for (const testId of step.testIds ?? []) {
    await expect(page.getByTestId(testId), `${step.name} should expose ${testId}`).toBeVisible({ timeout: 10_000 })
  }
}

test.use({ channel: browserChannel })

test.describe('Task 9D.62 phase-one main-chain browser smoke', () => {
  test.setTimeout(timeoutMs)

  test('visits the 12 PRD/TRD main-chain browser entry points', async ({ browser }) => {
    await assertReachable()
    await prepareFixedDemoFirstThreeSteps()

    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } })
    try {
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
