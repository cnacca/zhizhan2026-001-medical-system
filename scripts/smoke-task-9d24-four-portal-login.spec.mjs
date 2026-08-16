import { expect, test } from '@playwright/test'

const frontendUrl = process.env.TASK9D24_FRONTEND_URL ?? 'http://127.0.0.1:5173'
const browserChannel = process.env.TASK9D24_BROWSER_CHANNEL ?? 'chrome'
const timeoutMs = Number(process.env.TASK9D24_TIMEOUT_MS ?? 60_000)

const portalCases = [
  {
    title: '医生端',
    testId: 'portal-card-DOCTOR',
    username: process.env.TASK9D24_DOCTOR_USERNAME ?? 'doctor',
    password: process.env.TASK9D24_DOCTOR_PASSWORD ?? 'change-me-doctor',
    loggedInText: '医生已登录',
    portalTitle: '医生工作台'
  },
  {
    title: '客服端',
    testId: 'portal-card-CS',
    username: process.env.TASK9D24_CS_USERNAME ?? 'cs',
    password: process.env.TASK9D24_CS_PASSWORD ?? 'change-me-cs',
    loggedInText: '客服已登录',
    portalTitle: '客服协同台'
  },
  {
    title: '生产端',
    testId: 'portal-card-PRODUCTION',
    username: process.env.TASK9D24_WORKER_USERNAME ?? 'worker',
    password: process.env.TASK9D24_WORKER_PASSWORD ?? 'change-me-worker',
    loggedInText: '生产人员已登录',
    portalTitle: '生产管理台'
  },
  {
    title: '管理端',
    testId: 'portal-card-ADMIN',
    username: process.env.TASK9D24_ADMIN_USERNAME ?? 'admin',
    password: process.env.TASK9D24_ADMIN_PASSWORD ?? 'change-me-admin',
    loggedInText: '管理员已登录',
    portalTitle: '管理控制台'
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

async function resetToLogin(page) {
  await page.goto(frontendUrl, { waitUntil: 'networkidle' })
  await page.evaluate(() => localStorage.clear())
  await page.goto(frontendUrl, { waitUntil: 'networkidle' })
}

async function loginViaPortal(page, portal) {
  await resetToLogin(page)
  await page.getByTestId(portal.testId).click()
  const loginHeading = page.getByRole('heading', { name: `${portal.title}登录` })
  await expect(loginHeading).toBeVisible()
  await page.getByRole('textbox', { name: /账号|用户名/ }).first().fill(portal.username)
  await page.getByLabel('密码').fill(portal.password)
  const loginResponse = page.waitForResponse((response) =>
    new URL(response.url()).pathname === '/api/auth/login'
      && response.request().method() === 'POST')
  await page.getByRole('button', { name: '登录' }).click()
  expect((await loginResponse).status()).toBe(200)
  await expect(loginHeading).toBeHidden({ timeout: 15_000 })
}

const mockedProductionOrder = {
  order_id: 72002,
  order_no: 'MOCK-PRODUCTION-72002',
  clinic_id: 82002,
  clinic_name: 'Mock 生产诊所',
  doctor_user_id: null,
  cs_user_id: null,
  product_type: 'CROWN',
  internal_status: 'PRODUCING',
  external_status: 'PRODUCING',
  production_note: '仅用于前端冒烟验证的 mock 订单',
  reject_reason: null,
  form_data: { tooth_position: '11' }
}

const mockedProductionInstance = {
  instance_id: 82002,
  order_id: mockedProductionOrder.order_id,
  instance_status: 'IN_PROGRESS',
  intake_branch_used: 'SCAN',
  nodes: [{
    node_instance_id: 92002,
    node_code: 'cad-design',
    process_name: 'CAD设计',
    stage_name: 'CAD设计',
    step_order: 30,
    is_optional: 0,
    branch_group: null,
    branch_key: null,
    assigned_user_id: 9601,
    node_status: 'IN_PROGRESS',
    standard_duration: 30,
    started_at: '2026-07-13T09:00:00Z',
    deadline_at: '2026-07-13T10:00:00Z',
    completed_at: null,
    can_start: false,
    start_block_reason: null
  }],
  edges: []
}

async function mockProductionOrderReadApis(page) {
  await page.route(/\/production\/kanban\?date=/, (route) => route.fulfill({
    contentType: 'application/json',
    body: JSON.stringify({
      code: 0,
      msg: 'ok',
      data: {
        date: '2026-07-13',
        visible_order_ids: [mockedProductionOrder.order_id],
        stages: [{
          stage_name: 'CAD设计',
          unfinished_count: 1,
          in_progress_count: 1,
          completed_count: 0,
          overdue_count: 0,
          pending_question_count: 0,
          internal_rework_count: 0
        }]
      }
    })
  }))
  await page.route(/\/orders\?(?:.*&)?page=1(?:&|$)/, (route) => route.fulfill({
    contentType: 'application/json',
    body: JSON.stringify({
      code: 0,
      msg: 'ok',
      data: { items: [mockedProductionOrder], total: 1, page: 1, size: 100 }
    })
  }))
  await page.route(new RegExp(`/orders/${mockedProductionOrder.order_id}/process-instance$`), (route) => route.fulfill({
    contentType: 'application/json',
    body: JSON.stringify({ code: 0, msg: 'ok', data: mockedProductionInstance })
  }))
  await page.route(new RegExp(`/orders/${mockedProductionOrder.order_id}/files$`), (route) => route.fulfill({
    contentType: 'application/json',
    body: JSON.stringify({ code: 0, msg: 'ok', data: [] })
  }))
  await page.route(new RegExp(`/orders/${mockedProductionOrder.order_id}/messages$`), (route) => route.fulfill({
    contentType: 'application/json',
    body: JSON.stringify({ code: 0, msg: 'ok', data: [] })
  }))
  await page.route(new RegExp(`/orders/${mockedProductionOrder.order_id}/message-mentionable-users$`), (route) => route.fulfill({
    contentType: 'application/json',
    body: JSON.stringify({ code: 0, msg: 'ok', data: [] })
  }))
}

test.use({ channel: browserChannel })

test.describe('Task 9D.24 four portal login smoke', () => {
  test.setTimeout(timeoutMs)

  test('does not expose a non-functional remember-me control', async ({ browser }) => {
    await assertReachable()

    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } })
    try {
      await resetToLogin(page)
      await page.getByTestId('portal-card-PRODUCTION').click()

      await expect(page.getByText('为保护账号安全，关闭页面后需重新登录')).toBeVisible()
      await expect(page.getByRole('checkbox', { name: '记住我' })).toHaveCount(0)
    } finally {
      await page.close()
    }
  })

  test('opens the production kanban from the dashboard primary action', async ({ browser }) => {
    await assertReachable()

    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } })
    try {
      await loginViaPortal(page, portalCases[2])
      const primaryAction = page.locator('.prototype-primary-button')
      await expect(primaryAction).toHaveCount(1)
      await primaryAction.click()

      await expect(page.locator('.factory-kanban-page-strip')).toBeVisible({ timeout: 10_000 })
      await expect(page.locator('[data-testid="production-orders-page"]')).toHaveCount(0)
    } finally {
      await page.close()
    }
  })

  test('blocks a task pending in-check without surfacing a 409', async ({ browser }) => {
    await assertReachable()

    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } })
    const inCheckBlockedTask = {
      node_instance_id: 92001,
      order_id: 72001,
      order_no: 'GATE-72001',
      process_name: '入检后工序',
      node_status: 'READY',
      standard_duration: 20,
      started_at: null,
      deadline_at: null,
      completed_at: null,
      can_start: false,
      start_block_reason: 'IN_CHECK_REQUIRED'
    }
    const startRequests = []
    const checkSubmitRequests = []

    await page.route(/\/tasks\/mine(?:\?.*)?$/, (route) => route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({ code: 0, msg: 'ok', data: [inCheckBlockedTask] })
    }))
    await page.route(/\/check-records\/92001$/, (route) => route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({ code: 0, msg: 'ok', data: [] })
    }))
    await page.route(/\/process-instance\/nodes\/92001\/start$/, (route) => {
      startRequests.push(route.request().url())
      return route.fulfill({ status: 409, contentType: 'application/json', body: JSON.stringify({ message: 'node must pass in-check before start' }) })
    })
    await page.route(/\/check-records$/, (route) => {
      checkSubmitRequests.push(route.request().url())
      return route.fulfill({ status: 405, contentType: 'application/json', body: JSON.stringify({ message: 'mock test must not submit checks' }) })
    })

    try {
      await loginViaPortal(page, portalCases[2])
      await page.getByRole('menuitem', { name: '我的任务', exact: true }).click()

      const taskPage = page.locator('.factory-task-page')
      await expect(taskPage).toBeVisible({ timeout: 10_000 })
      await expect(taskPage.getByText('入检后工序')).toBeVisible()
      await expect(taskPage.getByText('需先完成入检并通过，才可以开始工作。')).toBeVisible()
      await expect(taskPage.getByRole('button', { name: '需先入检' })).toBeDisabled()
      await expect(taskPage).not.toContainText('请求失败：409')
      await expect(taskPage).not.toContainText('409')
      expect(startRequests).toEqual([])

      await taskPage.getByRole('button', { name: '去扫码入检' }).click()

      const scanPage = page.locator('.factory-scan-page')
      await expect(scanPage).toBeVisible({ timeout: 10_000 })
      await expect(scanPage.locator('.factory-scan-lookup input')).toHaveValue('92001')
      await expect(scanPage.locator('.factory-scan-detail')).toContainText('GATE-72001')
      await expect(scanPage.locator('.factory-scan-detail')).toContainText('入检后工序')
      expect(startRequests).toEqual([])
      expect(checkSubmitRequests).toEqual([])
    } finally {
      await page.close()
    }
  })

  test('carries the selected kanban order into CS message context', async ({ browser }) => {
    await assertReachable()

    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } })
    try {
      await loginViaPortal(page, portalCases[2])
      await mockProductionOrderReadApis(page)
      const primaryAction = page.locator('.prototype-primary-button')
      await expect(primaryAction).toHaveCount(1)
      await primaryAction.click()

      const kanbanCards = page.locator('.factory-kanban-card')
      await expect(kanbanCards).toHaveCount(1, { timeout: 10_000 })
      await expect(kanbanCards.nth(0)).toContainText(mockedProductionOrder.order_no)
      await kanbanCards.nth(0).click()
      await page.getByRole('button', { name: '消息 CS' }).click()

      await expect(page.locator('.factory-message-page')).toBeVisible({ timeout: 10_000 })
      await expect(page.getByTestId('customer-collaboration-order-id')).toHaveValue(String(mockedProductionOrder.order_id))
    } finally {
      await page.close()
    }
  })

  test('carries the selected production-order row into CS message context', async ({ browser }) => {
    await assertReachable()

    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } })
    try {
      await loginViaPortal(page, portalCases[2])
      await mockProductionOrderReadApis(page)
      await page.getByRole('menuitem', { name: '生产订单', exact: true }).click()

      await expect(page.getByTestId('production-orders-page')).toBeVisible({ timeout: 10_000 })
      const orderRows = page.getByTestId('production-orders-page').locator('tbody tr')
      await expect(orderRows).toHaveCount(1, { timeout: 10_000 })
      const firstOrderNumber = orderRows.nth(0).locator('.factory-order-number')
      await expect(firstOrderNumber).toHaveText(mockedProductionOrder.order_no)
      await firstOrderNumber.click()
      await expect(page.getByTestId('production-orders-drawer')).toBeVisible({ timeout: 10_000 })
      await page.getByRole('button', { name: '联系客服', exact: true }).click()

      await expect(page.locator('.factory-message-page')).toBeVisible({ timeout: 10_000 })
      await expect(page.getByTestId('customer-collaboration-order-id')).toHaveValue(String(mockedProductionOrder.order_id))
    } finally {
      await page.close()
    }
  })

  test('does not load final-inspection reports when opening external rework management', async ({ browser }) => {
    await assertReachable()

    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } })
    const finalInspectionReportRequests = []
    page.on('request', (request) => {
      if (new URL(request.url()).pathname.startsWith('/final-inspection-reports/')) {
        finalInspectionReportRequests.push(request.url())
      }
    })

    try {
      await loginViaPortal(page, portalCases[2])
      await page.getByRole('menuitem', { name: '质量与返工', exact: true }).click()
      await page.getByRole('menuitem', { name: '外返管理', exact: true }).click()

      await expect(page.locator('.factory-external-rework-page')).toBeVisible({ timeout: 10_000 })
      await page.waitForTimeout(500)
      expect(finalInspectionReportRequests).toEqual([])
    } finally {
      await page.close()
    }
  })

  test('opens internal rework without an absent-report loading error', async ({ browser }) => {
    await assertReachable()

    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } })
    try {
      await loginViaPortal(page, portalCases[2])
      await page.getByRole('menuitem', { name: '质量与返工', exact: true }).click()
      await page.getByRole('menuitem', { name: '内返管理', exact: true }).click()

      await expect(page.locator('.factory-rework-page')).toBeVisible({ timeout: 10_000 })
      await page.waitForTimeout(500)
      await expect(page.locator('.factory-rework-page .el-alert--error')).toHaveCount(0)
    } finally {
      await page.close()
    }
  })

  test('routes production dashboard exception cards to their intended pages', async ({ browser }) => {
    await assertReachable()

    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } })
    try {
      await loginViaPortal(page, portalCases[2])

      await page.getByRole('button', { name: /^工序超时/ }).click()
      await expect(page.locator('.factory-kanban-page-strip')).toBeVisible({ timeout: 10_000 })

      await page.getByRole('menuitem', { name: '工作台', exact: true }).click()
      await page.getByRole('button', { name: /^扫码异常/ }).click()
      await expect(page.locator('.factory-scan-page')).toBeVisible({ timeout: 10_000 })

      await page.getByRole('menuitem', { name: '工作台', exact: true }).click()
      await page.getByRole('button', { name: /^返工未关闭/ }).click()
      await expect(page.locator('.factory-rework-page')).toBeVisible({ timeout: 10_000 })
    } finally {
      await page.close()
    }
  })

  test('opens notifications from the production order bell', async ({ browser }) => {
    await assertReachable()

    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } })
    try {
      await loginViaPortal(page, portalCases[2])
      await page.getByRole('menuitem', { name: '生产订单', exact: true }).click()
      await expect(page.getByTestId('production-orders-page')).toBeVisible({ timeout: 10_000 })

      await page.getByRole('button', { name: '查看通知' }).click()

      await expect(page.locator('.notification-panel')).toBeVisible({ timeout: 10_000 })
      await expect(page.getByTestId('production-orders-page')).toHaveCount(0)
    } finally {
      await page.close()
    }
  })

  test('preserves the current production subview when refreshing the session', async ({ browser }) => {
    await assertReachable()

    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } })
    try {
      const loginResponse = page.waitForResponse((response) =>
        new URL(response.url()).pathname === '/api/auth/login' && response.request().method() === 'POST'
      )
      await loginViaPortal(page, portalCases[2])
      const loginPayload = await (await loginResponse).json()
      const refreshRequests = []
      await page.route(/\/api\/auth\/refresh$/, (route) => {
        refreshRequests.push(route.request().url())
        return route.fulfill({ contentType: 'application/json', body: JSON.stringify(loginPayload) })
      })
      await page.getByRole('menuitem', { name: '质量与返工', exact: true }).click()
      await page.getByRole('menuitem', { name: '外返管理', exact: true }).click()
      await expect(page.locator('.factory-external-rework-page')).toBeVisible({ timeout: 10_000 })

      await page.getByTestId('account-menu-trigger').click()
      const externalRefreshResponse = page.waitForResponse((response) =>
        new URL(response.url()).pathname === '/api/auth/refresh' && response.request().method() === 'POST'
      )
      await page.getByTestId('auth-refresh-button').click()
      expect((await externalRefreshResponse).ok()).toBeTruthy()
      await expect(page.locator('.factory-external-rework-page')).toBeVisible({ timeout: 10_000 })
      await expect(page.locator('.factory-rework-page')).toHaveCount(0)
      await expect(page.locator('.factory-final-report-page')).toHaveCount(0)

      await page.getByRole('menuitem', { name: '生产订单', exact: true }).click()
      await expect(page.getByTestId('production-orders-page')).toBeVisible({ timeout: 10_000 })
      await page.getByTestId('account-menu-trigger').click()
      const orderRefreshResponse = page.waitForResponse((response) =>
        new URL(response.url()).pathname === '/api/auth/refresh' && response.request().method() === 'POST'
      )
      await page.getByTestId('auth-refresh-button').click()
      expect((await orderRefreshResponse).ok()).toBeTruthy()
      await expect(page.getByTestId('production-orders-page')).toBeVisible({ timeout: 10_000 })
      await expect(page.locator('.factory-kanban-page-strip')).toHaveCount(0)
      expect(refreshRequests).toHaveLength(2)
    } finally {
      await page.close()
    }
  })

  test('uses the outsourcing cost type when entering the outsourcing view', async ({ browser }) => {
    await assertReachable()

    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } })
    try {
      await loginViaPortal(page, portalCases[2])
      await page.getByRole('menuitem', { name: '成本管理', exact: true }).click()
      await page.getByRole('menuitem', { name: '外协成本', exact: true }).click()

      await expect(page.locator('.factory-outsourcing-page')).toBeVisible({ timeout: 10_000 })
      await expect(page.getByTestId('production-cost-create-type')).toContainText('外协成本')
    } finally {
      await page.close()
    }
  })

  test('clears the collaboration context after the order id is removed', async ({ browser }) => {
    await assertReachable()

    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } })
    await page.route(/\/orders\/71001\/messages$/, (route) => route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({
        code: 0,
        msg: 'ok',
        data: [{
          msg_id: 1,
          order_id: 71001,
          order_no: 'AUDIT-71001',
          sender_role: 'WORKER',
          review_status: 'PENDING',
          external_status: 'PROCESSING',
          visible_to: 'CS',
          content: '旧订单消息',
          created_at: '2026-07-13T00:00:00Z'
        }]
      })
    }))
    await page.route(/\/orders\/71001\/message-mentionable-users$/, (route) => route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({
        code: 0,
        msg: 'ok',
        data: [{ user_id: 9001, display_name: '巡检客服', user_role: 'CS' }]
      })
    }))

    try {
      await loginViaPortal(page, portalCases[2])
      await page.getByRole('menuitem', { name: '沟通中心', exact: true }).click()
      const orderIdInput = page.getByTestId('customer-collaboration-order-id')
      await orderIdInput.fill('71001')
      await page.getByRole('button', { name: '查询订单消息' }).click()
      await expect(page.getByText('旧订单消息')).toBeVisible({ timeout: 10_000 })

      await orderIdInput.fill('')
      await page.getByRole('button', { name: '刷新协同台' }).click()
      await expect(page.getByText('旧订单消息')).toHaveCount(0)
      await expect(page.getByText('输入订单 ID 后查看医生、客服、生产消息上下文')).toBeVisible()
    } finally {
      await page.close()
    }
  })

  test('keeps the latest final inspection task when requests finish out of order', async ({ browser }) => {
    await assertReachable()

    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } })
    const tasks = [
      { node_instance_id: 90001, order_id: 71001, order_no: 'RACE-A', process_name: '终检 A', node_status: 'COMPLETED', standard_duration: 30 },
      { node_instance_id: 90002, order_id: 71002, order_no: 'RACE-B', process_name: '终检 B', node_status: 'COMPLETED', standard_duration: 30 }
    ]
    let delayNextARecords = false
    const report = (orderId, nodeId, reportNo) => ({
      report_id: orderId,
      order_id: orderId,
      report_no: reportNo,
      final_node_instance_id: nodeId,
      final_check_id: nodeId + 100,
      conclusion: 'PASS',
      summary: reportNo,
      pdf_file_id: null,
      inspector_user_id: 9001,
      status: 'GENERATED',
      signature_status: 'UNSIGNED',
      signed_by_user_id: null,
      signed_at: null,
      attachment_file_ids: [],
      created_at: '2026-07-13T00:00:00Z'
    })

    await page.route(/\/tasks\/mine\?status=COMPLETED&final_only=true$/, (route) => route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({ code: 0, msg: 'ok', data: tasks })
    }))
    await page.route(/\/check-records\/(90001|90002)$/, async (route) => {
      if (route.request().url().endsWith('/check-records/90001') && delayNextARecords) {
        delayNextARecords = false
        await new Promise((resolve) => setTimeout(resolve, 500))
      }
      await route.fulfill({ contentType: 'application/json', body: JSON.stringify({ code: 0, msg: 'ok', data: [] }) })
    })
    await page.route(/\/final-inspection-reports\/(71001|71002)\?allow_absent=true$/, (route) => {
      const isA = route.request().url().includes('/71001?')
      const payload = isA ? report(71001, 90001, 'FIR-A') : report(71002, 90002, 'FIR-B')
      return route.fulfill({ contentType: 'application/json', body: JSON.stringify({ code: 0, msg: 'ok', data: payload }) })
    })

    try {
      await loginViaPortal(page, portalCases[2])
      await page.getByRole('menuitem', { name: '质量与返工', exact: true }).click()
      await page.getByRole('menuitem', { name: '终检报告', exact: true }).click()
      await expect(page.getByText('终检报告 FIR-A / PASS')).toBeVisible({ timeout: 10_000 })

      delayNextARecords = true
      await page.getByRole('button', { name: /^终检 A RACE-A/ }).click()
      await page.getByRole('button', { name: /^终检 B RACE-B/ }).click()
      await expect(page.getByText('终检报告 FIR-B / PASS')).toBeVisible({ timeout: 10_000 })
      await page.waitForTimeout(700)

      await expect(page.locator('.factory-final-task-row.active')).toContainText('RACE-B')
      await expect(page.getByText('终检报告 FIR-B / PASS')).toBeVisible()
      await expect(page.getByText('终检报告 FIR-A / PASS')).toHaveCount(0)
    } finally {
      await page.close()
    }
  })

  test('shows password reset guidance without sending an auth request', async ({ browser }) => {
    await assertReachable()

    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } })
    const authRequests = []
    page.on('request', (request) => {
      if (new URL(request.url()).pathname.startsWith('/api/auth/')) {
        authRequests.push(request.url())
      }
    })

    try {
      await resetToLogin(page)
      await page.getByTestId('portal-card-PRODUCTION').click()
      await page.getByRole('button', { name: '忘记密码？' }).click()

      await expect(page.getByText('请联系系统管理员重置账号密码')).toBeVisible()
      expect(authRequests).toEqual([])

      await page.getByRole('button', { name: '返回入口' }).click()
      await expect(page.getByText('请联系系统管理员重置账号密码')).toHaveCount(0)
    } finally {
      await page.close()
    }
  })

  test('logs in through all four portals and rejects a mismatched portal', async ({ browser }) => {
    await assertReachable()

    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } })
    try {
      for (const portal of portalCases) {
        await loginViaPortal(page, portal)
        console.log(`task 9D.24 ${portal.title} smoke ok: ${portal.username} -> ${portal.portalTitle}`)
      }
    } finally {
      await page.close()
    }

    const mismatchPage = await browser.newPage({ viewport: { width: 1440, height: 1000 } })
    try {
      await mismatchPage.goto(frontendUrl, { waitUntil: 'networkidle' })
      await mismatchPage.getByTestId('portal-card-ADMIN').click()
      await mismatchPage.getByLabel('用户名').fill(process.env.TASK9D24_DOCTOR_USERNAME ?? 'doctor')
      await mismatchPage.getByLabel('密码').fill(process.env.TASK9D24_DOCTOR_PASSWORD ?? 'change-me-doctor')
      await mismatchPage.getByRole('button', { name: '登录' }).click()
      await expect(mismatchPage.getByText('账号角色与所选入口不匹配')).toBeVisible({ timeout: 10_000 })
      await expect(mismatchPage.locator('.status-bar')).toHaveCount(0)
      await expect(mismatchPage.locator('.login-shell')).toBeVisible()
      console.log('task 9D.24 mismatched portal smoke ok: doctor cannot enter ADMIN portal')
    } finally {
      await mismatchPage.close()
    }
  })
})
