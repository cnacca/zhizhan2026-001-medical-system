import { expect, test } from '@playwright/test'

const baseUrl = process.env.FEEDBACK_20260822_BASE_URL ?? 'http://127.0.0.1:15178'

const now = '2026-08-22T10:00:00'
const reviewOrder = {
  order_id: 101,
  order_no: 'REVIEW-STL-101',
  clinic_id: 1,
  clinic_name: '数字化诊所',
  doctor_user_id: 11,
  doctor_name: '测试医生',
  patient_id: 21,
  patient_name: '患者甲',
  customer_order_no: 'CASE-101',
  cs_user_id: 31,
  product_type: 'FIXED_RESTORATION',
  internal_status: 'PENDING_PRODUCTION_REVIEW',
  external_status: 'IN_PRODUCTION',
  production_note: '按口扫资料制作',
  reject_reason: null,
  form_data: { tooth_position: '11', shade: 'A2', material: '氧化锆' },
  created_at: now,
  updated_at: now
}
const assignmentOrder = {
  ...reviewOrder,
  order_id: 202,
  order_no: 'ASSIGN-STL-202',
  customer_order_no: 'CASE-202',
  internal_status: 'PROCESS_INSTANCE_CREATED'
}
const stlFile = {
  file_id: 501,
  source_type: 'DOCTOR',
  visibility: 'ALL',
  original_filename: 'scan-101.stl',
  content_type: 'model/stl',
  file_size: 2048,
  upload_status: 'COMPLETED',
  created_at: now
}
const productionOrder = {
  ...reviewOrder,
  order_id: 303,
  order_no: 'WORKER-STL-303',
  customer_order_no: 'CASE-303',
  internal_status: 'PRODUCING',
  external_status: 'IN_PRODUCTION'
}
const productionInstance = {
  instance_id: 303,
  order_id: productionOrder.order_id,
  instance_status: 'ACTIVE',
  intake_branch_used: 'SCAN',
  created_at: now,
  updated_at: now,
  nodes: [{
    node_instance_id: 403,
    node_code: 'cad-design',
    node_category: 'PRODUCTION',
    stage_name: 'CAD设计',
    process_name: 'CAD设计',
    step_order: 30,
    node_status: 'IN_PROGRESS',
    assigned_user_id: 9601,
    standard_duration: 30,
    started_at: now,
    deadline_at: '2026-08-22T11:00:00',
    completed_at: null,
    can_start: false,
    start_block_reason: null
  }],
  edges: []
}
const minimalStlDataUrl = `data:model/stl;base64,${Buffer.from(`solid triangle
facet normal 0 0 1
outer loop
vertex 0 0 0
vertex 1 0 0
vertex 0 1 0
endloop
endfacet
endsolid triangle`).toString('base64')}`

function payload(data) {
  return { code: 0, msg: 'ok', data }
}

async function installCommonRoutes(page) {
  await page.route('**/*', async (route) => {
    if (['fetch', 'xhr'].includes(route.request().resourceType())) {
      await route.fulfill({ status: 200, json: payload([]) })
      return
    }
    await route.continue()
  })
  await page.route('**/health', (route) => route.fulfill({ status: 200, json: { status: 'UP' } }))
  await page.route('**/notifications?*', (route) => route.fulfill({ status: 200, json: payload([]) }))
  await page.route('**/notifications/unread-count', (route) => route.fulfill({ status: 200, json: payload({ unread_count: 0 }) }))
}

async function login(page, portalTestId, username) {
  await page.goto(baseUrl)
  await page.getByTestId(portalTestId).click()
  await page.getByLabel('用户名').fill(username)
  await page.getByLabel('密码').fill('test-password')
  await page.getByRole('button', { name: '登录' }).click()
}

test('客服可以按明确依据退回补资料', async ({ page }) => {
  await installCommonRoutes(page)
  const csOrder = {
    ...reviewOrder,
    internal_status: 'PENDING_CS_REVIEW',
    external_status: 'PENDING_REVIEW',
    production_note: null,
    form_data: { tooth_position: '11', shade: 'A2', material: '氧化锆', instruction: 'Please verify scan' }
  }
  let reviewBody = null

  await page.route('**/api/auth/login', (route) => route.fulfill({
    status: 200,
    json: {
      accessToken: 'cs-access-token',
      refreshToken: 'cs-refresh-token',
      username: 'cs',
      userId: 31,
      clinicId: null,
      roles: ['CS'],
      permissions: ['order:read-internal', 'order:review'],
      menus: [{ menuCode: 'cs-information-translation', menuName: '信息审核/翻译', menuType: 'MENU', routePath: '/cs/information-translation', componentPath: null, permissionCode: 'order:review', icon: null, sortOrder: 1 }],
      dataScope: 'SELF',
      expiresAt: '2026-08-24T18:00:00+08:00',
      refreshExpiresAt: '2026-08-27T18:00:00+08:00'
    }
  }))
  await page.route('**/orders?*', (route) => route.fulfill({ status: 200, json: payload({ items: [csOrder], total: 1, page: 1, size: 100 }) }))
  await page.route('**/orders/101/files', (route) => route.fulfill({ status: 200, json: payload([stlFile]) }))
  await page.route('**/files/501/preview-url', (route) => route.fulfill({ status: 200, json: payload({ preview_url: 'data:application/octet-stream;base64,' }) }))
  await page.route('**/form-configs?*', (route) => route.fulfill({ status: 200, json: payload([]) }))
  await page.route('**/clinics/1/preference', (route) => route.fulfill({ status: 200, json: payload(null) }))
  await page.route('**/orders/101/review', async (route) => {
    reviewBody = route.request().postDataJSON()
    await route.fulfill({
      status: 200,
      json: payload({ ...csOrder, internal_status: 'CS_REJECTED', reject_reason: reviewBody.reject_reason, updated_at: '2026-08-22T10:05:00' })
    })
  })

  await login(page, 'portal-card-CS', 'cs')
  await expect(page.getByTestId('cs-information-review-actions')).toBeVisible()
  await expect(page.getByText('系统只提供完整性依据，不替代牙科专业判断')).toBeVisible()
  await page.getByRole('button', { name: '附件 1' }).click()
  await page.getByRole('button', { name: '3D 查看' }).click()
  await expect(page.getByText('STL 3D 预览')).toBeVisible()
  await expect(page.getByText('scan-101.stl').last()).toBeVisible()
  await page.getByRole('button', { name: '关闭' }).click()
  await page.getByRole('button', { name: '信息审核' }).click()
  await page.getByLabel('退回补资料原因').fill('缺少咬合扫描，请医生补充后重新提交。')
  await page.getByRole('button', { name: '退回补资料' }).click()

  await expect(page.getByText('客服初审已退回，原因已写入订单并等待医生补充资料。')).toBeVisible()
  expect(reviewBody).toEqual({
    action: 'REJECT',
    production_note: null,
    reject_reason: '缺少咬合扫描，请医生补充后重新提交。'
  })
})

test('生产审核和管理员派工都能在线核对 STL', async ({ page }) => {
  await installCommonRoutes(page)
  await page.route('**/api/auth/login', (route) => route.fulfill({
    status: 200,
    json: {
      accessToken: 'admin-access-token',
      refreshToken: 'admin-refresh-token',
      username: 'admin',
      userId: 8001,
      clinicId: null,
      roles: ['ADMIN'],
      permissions: ['workflow:review-production', 'workflow:assign', 'workflow:read-internal', 'order:read-internal', 'staff:manage'],
      menus: [
        { menuCode: 'production-review', menuName: '生产审核监控', menuType: 'MENU', routePath: '/workflow/review', componentPath: null, permissionCode: 'workflow:review-production', icon: null, sortOrder: 1 },
        { menuCode: 'workflow-assign', menuName: '员工派工', menuType: 'MENU', routePath: '/workflow/assign', componentPath: null, permissionCode: 'workflow:assign', icon: null, sortOrder: 2 },
        { menuCode: 'admin-orders', menuName: '订单管理', menuType: 'MENU', routePath: '/orders/internal', componentPath: null, permissionCode: 'order:read-internal', icon: null, sortOrder: 3 }
      ],
      dataScope: 'ALL',
      expiresAt: '2026-08-24T18:00:00+08:00',
      refreshExpiresAt: '2026-08-27T18:00:00+08:00'
    }
  }))
  await page.route('**/orders?*', (route) => route.fulfill({ status: 200, json: payload({ items: [reviewOrder, assignmentOrder], total: 2, page: 1, size: 100 }) }))
  await page.route('**/workflow-chains', (route) => route.fulfill({ status: 200, json: payload([{ chain_id: 1, chain_name: '常规冠修复', product_type: 'FIXED_RESTORATION', intake_branch: 'SCAN', status: 1 }]) }))
  await page.route('**/orders/*/files', (route) => route.fulfill({ status: 200, json: payload([stlFile]) }))
  await page.route('**/files/501/preview-url', (route) => route.fulfill({ status: 200, json: payload({ preview_url: 'data:application/octet-stream;base64,' }) }))
  await page.route('**/orders/202/process-instance', (route) => route.fulfill({
    status: 200,
    json: payload({
      instance_id: 302,
      order_id: 202,
      instance_status: 'ACTIVE',
      intake_branch_used: 'SCAN',
      created_at: now,
      updated_at: now,
      nodes: [{ node_instance_id: 402, node_category: 'PRODUCTION', stage_name: '设计', process_name: 'CAD 设计', node_status: 'READY', assigned_user_id: null, deadline_at: null }],
      edges: []
    })
  }))
  await page.route('**/staff/workload?*', (route) => route.fulfill({ status: 200, json: payload({ items: [], total: 0, page: 1, size: 50 }) }))
  await page.route('**/staff/account-options', (route) => route.fulfill({ status: 200, json: payload({ departments: [], posts: [], permissions: [] }) }))

  await login(page, 'portal-card-ADMIN', 'admin')
  await expect(page.getByTestId('production-review-page')).toBeVisible()
  await page.getByTestId('production-review-table').getByRole('button', { name: '审核' }).click()
  const reviewFiles = page.getByTestId('production-review-order-files')
  await expect(reviewFiles.getByText('scan-101.stl')).toBeVisible()
  await expect(reviewFiles.getByText('下载不是审核前置条件')).toBeVisible()
  await reviewFiles.getByRole('button', { name: '浏览器 3D 查看' }).click()
  await expect(page.getByText('STL 3D 预览')).toBeVisible()
  await expect(page.getByText('scan-101.stl').last()).toBeVisible()
  await page.getByRole('button', { name: '关闭' }).click()
  await expect(page.getByText('STL 3D 预览')).toBeHidden()
  await page.getByTestId('admin-production-review-drawer').getByRole('button', { name: 'Close this dialog' }).click()
  await expect(page.getByTestId('admin-production-review-drawer')).toBeHidden()

  await page.getByRole('menuitem', { name: '工艺生产' }).click()
  await expect(page.getByText('ASSIGN-STL-202')).toBeVisible()
  await page.getByRole('navigation', { name: '页面内容切换' }).getByRole('button', { name: '员工派工' }).click()
  await page.getByRole('button', { name: '派工', exact: true }).click()
  const assignmentFiles = page.getByTestId('process-assignment-order-files')
  await expect(assignmentFiles.getByText('scan-101.stl')).toBeVisible()
  await expect(assignmentFiles.getByText('管理员可先在线核对 STL')).toBeVisible()
  await expect(assignmentFiles.getByRole('button', { name: '浏览器 3D 查看' })).toBeVisible()
  await page.getByTestId('admin-process-assignment-drawer').getByRole('button', { name: 'Close this dialog' }).click()
  await expect(page.getByTestId('admin-process-assignment-drawer')).toBeHidden()

  await page.getByRole('menuitem', { name: '订单管理' }).click()
  await page.getByRole('navigation', { name: '页面内容切换' }).getByRole('button', { name: '文件资料' }).click()
  await expect(page.getByTestId('admin-files-page')).toBeVisible()
  await page.getByRole('button', { name: '预览', exact: true }).first().click()
  await expect(page.getByText('STL 3D 预览')).toBeVisible()
  expect(page.context().pages()).toHaveLength(1)
})

test('普通生产账号可在生产看板站内预览 STL，且不会触发下载或空白页', async ({ page }) => {
  await installCommonRoutes(page)
  let previewRequestCount = 0
  let downloadRequestCount = 0

  await page.route('**/api/auth/login', (route) => route.fulfill({
    status: 200,
    json: {
      accessToken: 'worker-access-token',
      refreshToken: 'worker-refresh-token',
      username: 'worker',
      userId: 9601,
      clinicId: null,
      roles: ['WORKER'],
      permissions: ['order:read-internal', 'workflow:operate-assigned', 'file:manage-internal'],
      menus: [{ menuCode: 'production-board', menuName: '生产看板', menuType: 'MENU', routePath: '/production/board', componentPath: null, permissionCode: 'order:read-internal', icon: null, sortOrder: 1 }],
      dataScope: 'SELF',
      expiresAt: '2026-08-24T18:00:00+08:00',
      refreshExpiresAt: '2026-08-27T18:00:00+08:00'
    }
  }))
  await page.route('**/production/kanban?*', (route) => route.fulfill({
    status: 200,
    json: payload({
      date: '2026-08-22',
      visible_order_ids: [productionOrder.order_id],
      stages: [{
        stage_name: 'CAD设计',
        unfinished_count: 1,
        in_progress_count: 1,
        completed_count: 0,
        overdue_count: 0,
        pending_question_count: 0,
        internal_rework_count: 0
      }]
    })
  }))
  await page.route('**/orders?*', (route) => route.fulfill({ status: 200, json: payload({ items: [productionOrder], total: 1, page: 1, size: 100 }) }))
  await page.route('**/orders/303/process-instance', (route) => route.fulfill({ status: 200, json: payload(productionInstance) }))
  await page.route('**/orders/303/files', (route) => route.fulfill({ status: 200, json: payload([{ ...stlFile, original_filename: 'worker-scan-303.stl' }]) }))
  await page.route('**/files/501/preview-url', (route) => {
    previewRequestCount += 1
    return route.fulfill({ status: 200, json: payload({ preview_url: minimalStlDataUrl }) })
  })
  await page.route('**/files/501/download-url', (route) => {
    downloadRequestCount += 1
    return route.fulfill({ status: 200, json: payload({ download_url: minimalStlDataUrl }) })
  })

  await login(page, 'portal-card-PRODUCTION', 'worker')
  await expect(page.locator('.factory-kanban-page-strip')).toHaveText('生产看板')
  const orderCard = page.locator('.factory-kanban-card').filter({ hasText: 'WORKER-STL-303' })
  await expect(orderCard).toBeVisible()
  await orderCard.click()
  await expect(page.getByTestId('production-stl-selector')).toBeVisible()
  await expect(page.locator('.factory-file-list strong').filter({ hasText: 'worker-scan-303.stl' })).toBeVisible()

  const pagesBeforePreview = page.context().pages().length
  await page.getByTestId('production-stl-preview-button').click()
  await expect(page.getByText('STL 3D 预览')).toBeVisible()
  await expect(page.getByTestId('stl-viewer-canvas').locator('canvas')).toBeVisible()
  await expect(page.locator('.stl-viewer-overlay.is-error')).toHaveCount(0)

  expect(previewRequestCount).toBe(1)
  expect(downloadRequestCount).toBe(0)
  expect(page.context().pages()).toHaveLength(pagesBeforePreview)
})
