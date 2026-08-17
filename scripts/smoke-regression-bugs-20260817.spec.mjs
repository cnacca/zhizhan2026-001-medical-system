import { expect, test } from '@playwright/test'

const baseUrl = process.env.REGRESSION_BASE_URL ?? 'http://127.0.0.1:15177'

const orders = [
  {
    order_id: 101,
    order_no: 'PRE-WORKFLOW-101',
    clinic_id: 1,
    clinic_name: '待审核诊所',
    doctor_user_id: 11,
    doctor_name: '测试医生',
    patient_id: 21,
    patient_name: '患者甲',
    cs_user_id: null,
    product_type: 'FIXED_RESTORATION',
    internal_status: 'PENDING_CS_REVIEW',
    external_status: 'PENDING_REVIEW',
    production_note: null,
    reject_reason: null,
    form_data: {}
  },
  {
    order_id: 202,
    order_no: 'IN-DESIGN-202',
    clinic_id: 2,
    clinic_name: '生产诊所',
    doctor_user_id: 12,
    doctor_name: '测试医生乙',
    patient_id: 22,
    patient_name: '患者乙',
    cs_user_id: 32,
    product_type: 'IMPLANT_RESTORATION',
    internal_status: 'IN_DESIGN',
    external_status: 'DESIGNING',
    production_note: null,
    reject_reason: null,
    form_data: {}
  }
]

function payload(data) {
  return { code: 0, msg: 'ok', data }
}

test('管理端不再探测前置订单工序，并提供查看全部入口', async ({ page }) => {
  const processRequests = []

  await page.route('**/*', async (route) => {
    if (['fetch', 'xhr'].includes(route.request().resourceType())) {
      await route.fulfill({ status: 204 })
      return
    }
    await route.continue()
  })
  await page.route('**/orders/*/process-instance', async (route) => {
    const orderId = Number(new URL(route.request().url()).pathname.split('/')[2])
    processRequests.push(orderId)
    if (orderId !== 202) {
      await route.fulfill({ status: 404, json: { message: 'process instance not found' } })
      return
    }
    await route.fulfill({
      status: 200,
      json: payload({
        instance_id: 302,
        order_id: 202,
        instance_status: 'ACTIVE',
        intake_branch_used: 'DIGITAL',
        created_at: '2026-08-17T10:00:00',
        updated_at: '2026-08-17T10:00:00',
        nodes: [{
          node_instance_id: 402,
          node_category: 'PRODUCTION',
          stage_name: '设计',
          process_name: 'CAD 设计',
          node_status: 'READY',
          assigned_user_id: null,
          deadline_at: null
        }],
        edges: []
      })
    })
  })
  await page.route('**/orders/*/files', async (route) => {
    await route.fulfill({ status: 200, json: payload([]) })
  })
  await page.route('**/orders/*/design-drafts', async (route) => {
    await route.fulfill({ status: 200, json: payload([]) })
  })
  await page.route('**/orders?*', async (route) => {
    await route.fulfill({ status: 200, json: payload({ items: orders, total: orders.length, page: 1, size: 100 }) })
  })
  await page.route('**/api/auth/login', async (route) => {
    await route.fulfill({
      status: 200,
      json: {
        accessToken: 'admin-access-token',
        refreshToken: 'admin-refresh-token',
        username: 'admin',
        userId: 8001,
        clinicId: null,
        roles: ['ADMIN', 'ADMIN_MANAGER'],
        permissions: ['dashboard:read-internal', 'order:read-internal', 'workflow:read-internal'],
        menus: [
          { menuCode: 'dashboard', menuName: '工作台', menuType: 'MENU', routePath: '/dashboard', componentPath: null, permissionCode: 'dashboard:read-internal', icon: null, sortOrder: 1 },
          { menuCode: 'internal-orders', menuName: '订单管理', menuType: 'MENU', routePath: '/orders/internal', componentPath: null, permissionCode: 'order:read-internal', icon: null, sortOrder: 2 },
          { menuCode: 'workflow-process', menuName: '工艺生产', menuType: 'MENU', routePath: '/workflow/process-instance', componentPath: null, permissionCode: 'workflow:read-internal', icon: null, sortOrder: 3 }
        ],
        dataScope: 'ALL',
        expiresAt: '2026-08-17T16:00:00+08:00',
        refreshExpiresAt: '2026-08-20T16:00:00+08:00'
      }
    })
  })

  await page.goto(baseUrl)
  await page.getByTestId('portal-card-ADMIN').click()
  await page.getByLabel('用户名').fill('admin')
  await page.getByLabel('密码').fill('test-password')
  await page.getByRole('button', { name: '登录' }).click()

  const viewAll = page.getByTestId('admin-view-all-todos')
  await expect(viewAll).toBeVisible()
  await viewAll.click()
  await expect(page.getByText('PRE-WORKFLOW-101')).toBeVisible()
  await expect.poll(() => processRequests.filter((id) => id === 202).length).toBeGreaterThan(0)
  expect(processRequests).not.toContain(101)

  await page.getByRole('menuitem', { name: '工艺生产' }).click()
  await expect(page.getByText('IN-DESIGN-202')).toBeVisible()
  await page.locator('.arp-toolbar select').selectOption('NO_PROCESS')
  await expect(page.getByText('PRE-WORKFLOW-101')).toBeVisible()
  await expect.poll(() => processRequests.filter((id) => id === 202).length).toBeGreaterThan(1)
  expect(processRequests).not.toContain(101)
})
