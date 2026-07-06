import { expect, test } from '@playwright/test'

const frontendUrl = process.env.TASK9D36_FRONTEND_URL ?? 'http://127.0.0.1:5173'
const browserChannel = process.env.TASK9D36_BROWSER_CHANNEL ?? process.env.TASK9D24_BROWSER_CHANNEL ?? 'chrome'

const portalCases = [
  {
    title: '医生端',
    testId: 'portal-card-DOCTOR',
    username: process.env.TASK9D24_DOCTOR_USERNAME ?? 'doctor',
    password: process.env.TASK9D24_DOCTOR_PASSWORD ?? 'change-me-doctor',
    loggedInText: '医生已登录',
    themeClass: 'portal-doctor',
    accent: '#2563eb',
    sidebar: '#0f2554',
    accountItem: '诊所信息',
    clicks: ['患者管理', '订单助手', '通知中心']
  },
  {
    title: '客服端',
    testId: 'portal-card-CS',
    username: process.env.TASK9D24_CS_USERNAME ?? 'cs',
    password: process.env.TASK9D24_CS_PASSWORD ?? 'change-me-cs',
    loggedInText: '客服已登录',
    themeClass: 'portal-cs',
    accent: '#7c3aed',
    sidebar: '#1e1b4b',
    accountItem: '客服账号',
    clicks: ['客户管理', '产品管理', '智能助手', '通知中心']
  },
  {
    title: '生产端',
    testId: 'portal-card-PRODUCTION',
    username: process.env.TASK9D24_WORKER_USERNAME ?? 'worker',
    password: process.env.TASK9D24_WORKER_PASSWORD ?? 'change-me-worker',
    loggedInText: '生产人员已登录',
    themeClass: 'portal-production',
    accent: '#0d9488',
    sidebar: '#0c2340',
    accountItem: '员工资料',
    clicks: ['生产订单', '消息中心', '设备管理', '物料异常', '安环管理', '成本管理', '奖惩管理']
  },
  {
    title: '管理端',
    testId: 'portal-card-ADMIN',
    username: process.env.TASK9D24_ADMIN_USERNAME ?? 'admin',
    password: process.env.TASK9D24_ADMIN_PASSWORD ?? 'change-me-admin',
    loggedInText: '管理员已登录',
    themeClass: 'portal-admin',
    accent: '#1296db',
    sidebar: '#111827',
    accountItem: '用户管理',
    clicks: ['账号权限', '产品配置', '工艺生产', 'AI 治理']
  }
]

function normalizeCssValue(value) {
  return value.trim().toLowerCase()
}

async function resetToLogin(page) {
  await page.goto(frontendUrl, { waitUntil: 'networkidle' })
  await page.evaluate(() => localStorage.clear())
  await page.goto(frontendUrl, { waitUntil: 'networkidle' })
}

async function login(page, portal) {
  await resetToLogin(page)
  await page.getByTestId(portal.testId).click()
  await page.getByLabel('用户名').fill(portal.username)
  await page.getByLabel('密码').fill(portal.password)
  await page.getByRole('button', { name: '登录' }).click()
  await expect(page.getByText(portal.loggedInText)).toBeVisible({ timeout: 10_000 })
}

async function readTheme(page) {
  return page.evaluate(() => {
    const shell = document.querySelector('.app-shell')
    const navPanel = document.querySelector('.nav-panel')
    if (!shell || !navPanel) {
      throw new Error('missing logged-in shell or navigation panel')
    }
    const shellStyle = getComputedStyle(shell)
    const navStyle = getComputedStyle(navPanel)
    return {
      className: shell.className,
      accent: shellStyle.getPropertyValue('--portal-accent'),
      sidebar: shellStyle.getPropertyValue('--portal-sidebar'),
      navBackground: navStyle.backgroundImage
    }
  })
}

async function assertAccountPanel(page, portal) {
  await page.getByTestId('account-menu-trigger').click()
  const panel = page.getByTestId('account-menu-panel')
  await expect(panel).toBeVisible({ timeout: 10_000 })
  await expect(panel.getByText('账号管理', { exact: true })).toBeVisible()
  await expect(panel.getByText(portal.accountItem, { exact: true }).first()).toBeVisible()
  await expect(page.getByTestId('account-switch-button')).toBeVisible()
  if (portal.title === '医生端') {
    await expect(panel).not.toContainText('绩效入口')
    await expect(panel).not.toContainText('岗位/工序')
  }
  await page.keyboard.press('Escape')
}

test.use({ channel: browserChannel })

test.describe('Task 9D.36 portal theme stability', () => {
  test('keeps each portal color system stable while navigating', async ({ page }) => {
    for (const portal of portalCases) {
      await login(page, portal)
      const before = await readTheme(page)
      expect(before.className).toContain(portal.themeClass)
      expect(normalizeCssValue(before.accent)).toBe(portal.accent)
      expect(normalizeCssValue(before.sidebar)).toBe(portal.sidebar)
      expect(before.navBackground).toContain('rgb')
      await assertAccountPanel(page, portal)

      await page.locator('.route-menu').getByText('工作台', { exact: true }).first().click()
      await expect(page.locator('.prototype-dashboard-panel')).toBeVisible({ timeout: 10_000 })
      await expect(page.locator('.prototype-stat-card').first()).toBeVisible()
      await expect(page.locator('.prototype-panel-card').first()).toBeVisible()
      await expect(page.locator('.prototype-chart-card')).toBeVisible()
      await expect(page.locator('.prototype-line-chart')).toBeVisible()
      await expect(page.locator('.prototype-stat-icon')).toHaveCount(0)
      await expect(page.locator('.admin-menu-grid .admin-menu-card')).toHaveCount(0)
      if (portal.title === '生产端') {
        await expect(page.locator('.prototype-stat-card')).toHaveCount(7)
        const firstMetricBox = await page.locator('.prototype-stat-card').first().boundingBox()
        expect(firstMetricBox?.height, 'production dashboard metric cards should stay compact').toBeLessThan(130)
      }

      for (const label of portal.clicks) {
        await page.locator('.route-menu').getByText(label, { exact: true }).first().click()
        await page.waitForTimeout(200)
        const chipCount = await page.locator('.prototype-chip').count()
        if (chipCount > 1) {
          const chip = page.locator('.prototype-chip').nth(1)
          await chip.click()
          await expect(chip).toHaveClass(/active/)
        }
        const after = await readTheme(page)
        expect(after.className, `${portal.title} should keep ${portal.themeClass} after clicking ${label}`).toContain(portal.themeClass)
        expect(normalizeCssValue(after.accent), `${portal.title} accent changed after clicking ${label}`).toBe(portal.accent)
        expect(normalizeCssValue(after.sidebar), `${portal.title} sidebar changed after clicking ${label}`).toBe(portal.sidebar)
      }

      console.log(`task 9D.36 ${portal.title} theme stable: ${portal.accent} / ${portal.sidebar}`)
    }
  })
})
