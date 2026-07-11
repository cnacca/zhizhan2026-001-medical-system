import { expect, test } from '@playwright/test'

const frontendUrl = process.env.TEST_FEEDBACK_FRONTEND_URL ?? 'http://127.0.0.1:5173'
const browserChannel = process.env.TEST_FEEDBACK_BROWSER_CHANNEL ?? 'chrome'

async function loginAsAdmin(page) {
  await page.goto(frontendUrl, { waitUntil: 'networkidle' })
  await page.evaluate(() => localStorage.clear())
  await page.goto(frontendUrl, { waitUntil: 'networkidle' })
  await page.getByTestId('portal-card-ADMIN').click()
  await page.getByLabel('用户名').fill(process.env.TEST_FEEDBACK_ADMIN_USERNAME ?? 'admin')
  await page.getByLabel('密码').fill(process.env.TEST_FEEDBACK_ADMIN_PASSWORD ?? 'change-me-admin')
  await page.getByRole('button', { name: '登录' }).click()
  await expect(page.getByText('管理员已登录')).toBeVisible()
}

const portalCases = {
  CS: {
    testId: 'portal-card-CS',
    username: process.env.TEST_FEEDBACK_CS_USERNAME ?? 'cs',
    password: process.env.TEST_FEEDBACK_CS_PASSWORD ?? 'change-me-cs',
    loggedInText: '客服已登录'
  },
  PRODUCTION: {
    testId: 'portal-card-PRODUCTION',
    username: process.env.TEST_FEEDBACK_WORKER_USERNAME ?? 'worker',
    password: process.env.TEST_FEEDBACK_WORKER_PASSWORD ?? 'change-me-worker',
    loggedInText: '生产人员已登录'
  },
  ADMIN: {
    testId: 'portal-card-ADMIN',
    username: process.env.TEST_FEEDBACK_ADMIN_USERNAME ?? 'admin',
    password: process.env.TEST_FEEDBACK_ADMIN_PASSWORD ?? 'change-me-admin',
    loggedInText: '管理员已登录'
  }
}

const parentMenuByChild = {
  '生产备注助手': '智能助手',
  '质量总览': '质量与返工',
  '终检报告': '质量与返工',
  '外协成本': '成本管理',
  '用户管理': '账号权限',
  '角色权限': '账号权限'
}

async function loginViaPortal(page, portal) {
  await page.goto(frontendUrl, { waitUntil: 'networkidle' })
  await page.evaluate(() => localStorage.clear())
  await page.goto(frontendUrl, { waitUntil: 'networkidle' })
  await page.getByTestId(portal.testId).click()
  await page.getByLabel('用户名').fill(portal.username)
  await page.getByLabel('密码').fill(portal.password)
  await page.getByRole('button', { name: '登录' }).click()
  await expect(page.getByText(portal.loggedInText)).toBeVisible()
}

async function assertBasicMenu(page, menuName, expectedText) {
  const menuItem = page.getByRole('menuitem', { name: menuName })
  const parentMenuName = parentMenuByChild[menuName]
  if (parentMenuName && !await menuItem.isVisible().catch(() => false)) {
    await page.getByRole('menuitem', { name: parentMenuName, exact: true }).click()
  }
  await menuItem.click()
  const routePanel = page.locator('.content-grid > .route-panel:not(.health-panel)')
  await expect(routePanel.getByText(expectedText, { exact: true }).first()).toBeVisible()
  await expect(routePanel.getByText('演示入口', { exact: true })).toHaveCount(0)
  await expect(routePanel.getByText('后续确认正式范围后再接入接口、权限和数据表。', { exact: true })).toHaveCount(0)
  await expect(routePanel.getByText(/请求失败：(400|403)/)).toHaveCount(0)
}

test.use({ channel: browserChannel })
test.setTimeout(120_000)

test('BUG-004 管理端绩效统计默认加载不返回 400', async ({ page }) => {
  await loginAsAdmin(page)

  const responses = []
  page.on('response', (response) => {
    if (response.url().includes('/performance')) {
      responses.push({ url: response.url(), status: response.status() })
    }
  })

  await page.getByRole('menuitem', { name: '绩效统计' }).click()
  await expect(page.locator('.performance-panel').getByRole('heading', { name: '绩效统计' })).toBeVisible()
  await expect(page.getByText('请输入员工编号后查询绩效统计')).toBeVisible()
  await expect(page.getByText('请求失败：400')).toHaveCount(0)
  await expect(page.locator('.performance-panel .el-alert--error')).toHaveCount(0)
  expect(responses).toEqual([])
})

test('BUG-003 旧反馈菜单提供一期基础能力而非演示页', async ({ page }) => {
  await loginViaPortal(page, portalCases.CS)
  await assertBasicMenu(page, '外协管理', '真实成本汇总')
  await assertBasicMenu(page, '生产备注助手', '生产备注助手')

  await loginViaPortal(page, portalCases.PRODUCTION)
  for (const [menuName, expectedText] of [
    ['扫码登记', '入检出检'],
    ['终检报告', '终检入口'],
    ['奖惩管理', '真实奖惩汇总'],
    ['设备管理', '真实设备汇总'],
    ['物料管理', '真实物料异常汇总'],
    ['成本管理', '真实成本汇总'],
    ['外协成本', '真实成本汇总'],
    ['安环管理', '真实安环汇总'],
    ['消息中心', '通知中心'],
    ['云端数据中心', '设计稿管理'],
    ['质量总览', '真实质量汇总']
  ]) {
    await assertBasicMenu(page, menuName, expectedText)
  }

  await loginViaPortal(page, portalCases.ADMIN)
  for (const [menuName, expectedText] of [
    ['用户管理', '账号 / 角色 / 权限清单'],
    ['角色权限', '账号 / 角色 / 权限清单'],
    ['设备管理', '真实设备汇总'],
    ['物料管理', '真实物料异常汇总'],
    ['外协管理', '真实成本汇总'],
    ['账单配送', '账单管理']
  ]) {
    await assertBasicMenu(page, menuName, expectedText)
  }
})
