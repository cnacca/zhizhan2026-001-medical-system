import { expect, test } from '@playwright/test'

const frontendUrl = process.env.PRODUCTION_REFERENCE_FRONTEND_URL ?? 'http://127.0.0.1:5173'
const browserChannel = process.env.PRODUCTION_REFERENCE_BROWSER_CHANNEL ?? 'chrome'

const pageCases = [
  ['员工管理', '.factory-staff-page'],
  ['绩效管理', '.factory-performance-page'],
  ['奖惩管理', '.factory-reward-page'],
  ['设备管理', '.factory-support-page'],
  ['物料管理', '.factory-support-page'],
  ['安环管理', '.factory-support-page'],
  ['成本管理', '.factory-support-page'],
  ['沟通中心', '.factory-message-page'],
  ['云端数据中心', '.factory-cloud-page']
]

test.use({ channel: browserChannel })

async function loginProduction(page) {
  await page.goto(frontendUrl, { waitUntil: 'networkidle' })
  await page.evaluate(() => localStorage.clear())
  await page.goto(frontendUrl, { waitUntil: 'networkidle' })
  await page.getByTestId('portal-card-PRODUCTION').click()
  await page.getByLabel('用户名').fill(process.env.PRODUCTION_REFERENCE_WORKER_USERNAME ?? 'worker')
  await page.getByLabel('密码').fill(process.env.PRODUCTION_REFERENCE_WORKER_PASSWORD ?? 'change-me-worker')
  await page.getByRole('button', { name: '登录' }).click()
  await expect(page.getByText('生产人员已登录', { exact: true })).toBeVisible({ timeout: 10_000 })
}

async function clickMenu(page, label) {
  const item = page.locator('.route-menu').getByText(label, { exact: true }).first()
  await expect(item).toHaveCount(1)
  await item.click()
}

test('生产端其余页面可访问且使用统一参考视觉容器', async ({ page }) => {
  await loginProduction(page)

  for (const [label, selector] of pageCases) {
    await clickMenu(page, label)
    await expect(page.locator(selector)).toBeVisible({ timeout: 10_000 })
  }

  await clickMenu(page, '成本管理')
  const outsourcing = page.locator('.route-menu').getByText('外协成本', { exact: true })
  if (!await outsourcing.isVisible()) {
    await clickMenu(page, '成本管理')
  }
  await expect(outsourcing).toBeVisible()
  await outsourcing.click()
  await expect(page.locator('.factory-outsourcing-page')).toBeVisible({ timeout: 10_000 })

  await clickMenu(page, '绩效管理')
  await expect(page.getByTestId('performance-formula-version')).toHaveText('当前绩效规则')
  await expect(page.getByText('PHASE_ONE_DEFAULT_V1', { exact: true })).toHaveCount(0)
})
