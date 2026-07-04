import { expect, test } from '@playwright/test'

const frontendUrl = process.env.TASK9D62_FRONTEND_URL ?? 'http://127.0.0.1:5173'
const browserChannel = process.env.TASK9D62_BROWSER_CHANNEL ?? 'chrome'
const timeoutMs = Number(process.env.TASK9D62_TIMEOUT_MS ?? 120_000)

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
    visibleText: ['通过扫码记录入检、开工、暂停、完工和流转节点。']
  },
  {
    name: '7. 返工可见',
    portal: 'PRODUCTION',
    menuPath: ['工作台'],
    actionText: '看返工',
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
  const item = nav.getByText(label, { exact: true }).filter({ visible: true }).first()
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
