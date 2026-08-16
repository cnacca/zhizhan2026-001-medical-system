import { expect, test } from '@playwright/test'

const baseUrl = process.env.REGRESSION_BASE_URL ?? 'http://127.0.0.1:15176'

async function login(page, portal, username, password) {
  await page.goto(baseUrl)
  await page.getByTestId(`portal-card-${portal}`).click()
  await page.getByLabel(portal === 'DOCTOR' ? '账号' : '用户名').fill(username)
  await page.getByLabel('密码').fill(password)
  await page.getByRole('button', { name: '登录' }).click()
}

test('客服窄屏不横向溢出且刷新后恢复登录', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await login(page, 'CS', 'cs', 'change-me-cs')
  await expect(page.locator('.portal-cs')).toBeVisible()

  const firstLayout = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    viewportWidth: window.innerWidth,
    toolsRight: Math.round(document.querySelector('.cs-reference-topbar-tools')?.getBoundingClientRect().right ?? 0)
  }))
  expect(firstLayout.scrollWidth).toBeLessThanOrEqual(firstLayout.viewportWidth)
  expect(firstLayout.toolsRight).toBeLessThanOrEqual(firstLayout.viewportWidth)

  await page.reload()
  await expect(page.locator('.portal-cs')).toBeVisible()
  await expect(page.locator('.login-page')).toHaveCount(0)
})

test('生产端提供可见帮助入口', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await login(page, 'PRODUCTION', 'worker', 'change-me-worker')
  await expect(page.locator('.portal-production')).toBeVisible()
  await page.getByTestId('production-help-open').click()
  await expect(page.getByRole('heading', { name: '生产端帮助' })).toBeVisible()
})
