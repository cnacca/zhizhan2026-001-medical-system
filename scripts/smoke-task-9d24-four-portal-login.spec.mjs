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
    heading: '早上好，医生'
  },
  {
    title: '客服端',
    testId: 'portal-card-CS',
    username: process.env.TASK9D24_CS_USERNAME ?? 'cs',
    password: process.env.TASK9D24_CS_PASSWORD ?? 'change-me-cs',
    loggedInText: '客服已登录',
    heading: '客服工作台'
  },
  {
    title: '生产端',
    testId: 'portal-card-PRODUCTION',
    username: process.env.TASK9D24_WORKER_USERNAME ?? 'worker',
    password: process.env.TASK9D24_WORKER_PASSWORD ?? 'change-me-worker',
    loggedInText: '生产人员已登录',
    heading: '生产仪表盘'
  },
  {
    title: '管理端',
    testId: 'portal-card-ADMIN',
    username: process.env.TASK9D24_ADMIN_USERNAME ?? 'admin',
    password: process.env.TASK9D24_ADMIN_PASSWORD ?? 'change-me-admin',
    loggedInText: '管理员已登录',
    heading: '管理控制台'
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
  await expect(page.getByRole('heading', { name: `${portal.title}登录` })).toBeVisible()
  await page.getByLabel('用户名').fill(portal.username)
  await page.getByLabel('密码').fill(portal.password)
  await page.getByRole('button', { name: '登录' }).click()
  await expect(page.getByText(portal.loggedInText)).toBeVisible({ timeout: 10_000 })
  await expect(page.locator('.prototype-dashboard-panel')).toBeVisible({ timeout: 10_000 })
  await expect(page.getByRole('heading', { name: portal.heading }).first()).toBeVisible({ timeout: 10_000 })
}

test.use({ channel: browserChannel })

test.describe('Task 9D.24 four portal login smoke', () => {
  test.setTimeout(timeoutMs)

  test('logs in through all four portals and rejects a mismatched portal', async ({ browser }) => {
    await assertReachable()

    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } })
    try {
      for (const portal of portalCases) {
        await loginViaPortal(page, portal)
        console.log(`task 9D.24 ${portal.title} smoke ok: ${portal.username} -> ${portal.heading}`)
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
      console.log('task 9D.24 mismatched portal smoke ok: doctor cannot enter ADMIN portal')
    } finally {
      await mismatchPage.close()
    }
  })
})
