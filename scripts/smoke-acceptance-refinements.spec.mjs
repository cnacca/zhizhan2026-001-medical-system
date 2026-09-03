import { test, expect } from '@playwright/test'
import { assertIsolatedSmokeTarget } from './assert-isolated-smoke-target.mjs'
const base = 'http://127.0.0.1:15173'
assertIsolatedSmokeTarget({ isolatedEnv: process.env.DEMO_ISOLATED_ENV, isolatedEnvVariable: 'DEMO_ISOLATED_ENV', frontendUrl: base, frontendUrlVariable: 'local demo', taskLabel: 'acceptance refinements' })
test.use({ channel: 'chrome', viewport: { width: 1440, height: 1000 } })
async function login(page, portal, user) {
  await page.goto(base)
  await page.getByTestId(`portal-card-${portal}`).click()
  await page.getByRole('textbox', { name: portal === 'DOCTOR' ? '账号' : '用户名', exact: true }).fill(user)
  await page.getByRole('textbox', { name: '密码', exact: true }).fill(`change-me-${user}`)
  await page.getByRole('button', { name: '登录', exact: true }).click()
  await expect(page.locator(portal === 'DOCTOR' ? '[data-testid=doctor-page-dashboard]' : '.prototype-dashboard-panel')).toBeVisible({ timeout: 20000 })
}
test('production assignment and manual inspection retain full-test menus and consistent UI', async ({ page }) => {
  const errors = []
  page.on('pageerror', (e) => errors.push(e.message))
  await login(page, 'PRODUCTION', 'worker')
  await page.locator('.route-menu').getByText('员工派工', { exact: true }).click()
  const panel = page.getByTestId('admin-process-assignment-page')
  await expect(panel).toHaveClass(/production-review-panel/)
  await expect(panel.locator('tbody tr').first()).toBeVisible()
  expect(await panel.locator('table').evaluate((el) => getComputedStyle(el).borderCollapse)).toBe('collapse')
  await page.screenshot({ path: 'test-results/refinements-assignment.png', fullPage: true })
  await panel.locator('tbody tr').first().click()
  const drawer = page.getByTestId('admin-process-assignment-drawer')
  await expect(drawer).toBeVisible()
  await drawer.locator('.admin-flow-node-row').filter({ hasText: '收发入货' }).first().click()
  await expect(drawer.getByText(/已有执行人/)).toBeVisible()
  await expect(drawer.getByRole('button', { name: '安排员工', exact: true })).toBeDisabled()
  await page.screenshot({ path: 'test-results/refinements-dispatch-drawer.png', fullPage: true })
  await drawer.getByRole('button', { name: '关闭', exact: true }).click()
  await page.locator('.route-menu').getByText('入检/出检登记', { exact: true }).click()
  await expect(page.locator('.factory-scan-page h2')).toHaveText('入检/出检登记')
  await expect(page.getByText('扫码登记', { exact: true })).toHaveCount(0)
  await page.screenshot({ path: 'test-results/refinements-inspection.png', fullPage: true })
  expect(errors).toEqual([])
})
test('inspection task rows contain wrapped text without overlapping adjacent tasks', async ({ page }) => {
  await login(page, 'PRODUCTION', 'worker')
  await page.locator('.route-menu').getByText('入检/出检登记', { exact: true }).click()
  await page.getByRole('button', { name: '待出检', exact: true }).click()
  const list = page.locator('.factory-scan-task-list')
  await expect(list.locator('.doctor-order-row').first()).toContainText('已完成')
  expect(await list.locator('.doctor-order-row').count()).toBeGreaterThan(7)
  for (const width of [1728, 1280, 768]) {
    await page.setViewportSize({ width, height: 1080 })
    await expect.poll(async () => list.evaluate((el) => {
      const rows = [...el.querySelectorAll('.doctor-order-row')]
      return rows.flatMap((row, index) => {
        const bounds = row.getBoundingClientRect()
        const children = [...row.children].map((child) => child.getBoundingClientRect())
        const next = rows[index + 1]?.getBoundingClientRect()
        const contentOutside = children.some((child) => child.top < bounds.top || child.bottom > bounds.bottom - 6 || child.right > bounds.right + 1)
        const textOverlaps = children.some((child, i) => i > 0 && child.top < children[i - 1].bottom)
        return contentOutside || textOverlaps || (next && bounds.bottom > next.top + 1) ? [index] : []
      })
    }), { message: `task text stays within each row at ${width}px` }).toEqual([])
    // The long list remains scrollable and its final task can still be selected.
    await list.locator('.doctor-order-row').last().click()
    await expect(list.locator('.doctor-order-row').last()).toHaveClass(/active/)
    await page.screenshot({ path: `test-results/inspection-layout-${width}.png`, fullPage: true })
  }
})
for (const [portal, user] of [['ADMIN', 'admin'], ['CS', 'cs'], ['PRODUCTION', 'worker']]) {
  test(`${portal} lower monthly cards navigate with an explicit month filter`, async ({ page }) => {
    await login(page, portal, user)
    const card = page.locator('[title="查看本月订单相关明细"]').first()
    await expect(card).toBeVisible()
    await card.press('Enter')
    await expect(page.locator('.dashboard-scope-banner')).toContainText('本月订单')
    await page.screenshot({ path: `test-results/refinements-${user}-month.png`, fullPage: true })
    await page.locator('.dashboard-scope-banner button').click()
    await expect(page.locator('.dashboard-scope-banner')).toHaveCount(0)
  })
}
test('doctor lower summary cards and chart points are keyboard navigable', async ({ page }) => {
  await login(page, 'DOCTOR', 'doctor')
  const summaries = page.locator('.dv2-trend-summary article')
  await expect(summaries).toHaveCount(4)
  await summaries.first().press('Enter')
  await expect(page.getByTestId('doctor-page-orders')).toBeVisible()
  await page.screenshot({ path: 'test-results/refinements-doctor-month.png', fullPage: true })
})

test('production department rows navigate to the corresponding queue', async ({ page }) => {
  await login(page, 'PRODUCTION', 'worker')
  const row = page.locator('.production-department-table tbody tr[role=button]').first()
  await expect(row).toBeVisible()
  const name = await row.locator('td strong').first().innerText()
  await row.press('Enter')
  await expect(page.locator('.dashboard-scope-banner')).toContainText(name)
  await expect(page.locator('.production-board-panel')).toBeVisible()
})

test('customer shipped metric opens shipped records, not pending shipments', async ({ page }) => {
  await login(page, 'CS', 'cs')
  await page.locator('[title="查看本月已发货相关明细"]').click()
  await expect(page.locator('.cs-r-segmented button.active').filter({ hasText: '已发货' })).toBeVisible()
})

test('doctor uploads retain editable scan classification, optional records and inline preview', async ({ page }) => {
  test.setTimeout(90000)
  const errors = []
  page.on('pageerror', (e) => errors.push(e.message))
  await login(page, 'DOCTOR', 'doctor')
  await page.getByTestId('doctor-new-order').click()
  const wizard = page.getByTestId('doctor-case-group-wizard')
  await wizard.getByRole('button', { name: /固定义齿/ }).first().click()
  await wizard.getByRole('button', { name: /打印氧化锆冠/ }).first().click()
  await wizard.locator('.case-patient-autocomplete input').click()
  await wizard.locator('.case-patient-dropdown button').first().click()
  await wizard.locator('.case-wizard__footer .case-primary').click()
  await wizard.locator('.case-tooth-hit').first().click()
  for (const [name, value] of [['咬合 *', 'NORMAL'], ['邻接 *', 'NORMAL'], ['染色 *', 'NONE'], ['修复体边缘形式 *', 'PORCELAIN']]) {
    await wizard.locator('.case-field').filter({ hasText: name }).locator('select').selectOption(value)
  }
  await wizard.locator('.case-wizard__footer .case-primary').click()
  const upload = wizard.locator('.case-upload-redesign')
  await expect(upload).toBeVisible()
  const stl = 'solid test\nfacet normal 0 0 1\nouter loop\nvertex 0 0 0\nvertex 1 0 0\nvertex 0 1 0\nendloop\nendfacet\nendsolid test'
  await upload.locator('.shared input[type=file]').first().setInputFiles([
    { name: 'acceptance-upper.stl', mimeType: 'model/stl', buffer: Buffer.from(stl) },
    { name: 'acceptance-lower.stl', mimeType: 'model/stl', buffer: Buffer.from(stl) },
    { name: 'acceptance-bite.stl', mimeType: 'model/stl', buffer: Buffer.from(stl) }
  ])
  const upper = upload.locator('.case-classified-file').filter({ hasText: 'acceptance-upper.stl' }).first()
  await expect(upper.locator('select')).toHaveValue('upper_scan', { timeout: 20000 })
  await upper.locator('select').selectOption('scan_other')
  await expect(upper.locator('select')).toHaveValue('scan_other')
  await upper.locator('select').selectOption('upper_scan')
  await expect(upload.getByText('资料完整', { exact: true })).toBeVisible()
  await expect(upload.getByText('旧义齿参考', { exact: false }).first()).toBeVisible()
  await upper.getByRole('button', { name: '预览', exact: true }).click()
  await expect(page.getByRole('dialog').filter({ hasText: '3D 模型预览' })).toBeVisible()
  await expect(page.getByRole('dialog').locator('canvas')).toBeVisible()
  await page.screenshot({ path: 'test-results/refinements-scan-preview.png', fullPage: true })
  await page.getByRole('dialog').getByRole('button', { name: 'Close this dialog' }).click()
  await expect(page.getByRole('dialog')).toHaveCount(0)
  await page.screenshot({ path: 'test-results/refinements-upload.png', fullPage: true })
  expect(errors).toEqual([])
})

test('mixed fixed, flexible and aligner products show only applicable records', async ({ page }) => {
  test.setTimeout(90000)
  await login(page, 'DOCTOR', 'doctor')
  await page.getByTestId('doctor-new-order').click()
  const wizard = page.getByTestId('doctor-case-group-wizard')
  await wizard.getByRole('button', { name: /固定义齿/ }).first().click()
  await wizard.getByRole('button', { name: /打印氧化锆冠/ }).first().click()
  await wizard.getByRole('button', { name: /活动义齿/ }).first().click()
  await wizard.getByRole('button', { name: /弹性义齿/ }).first().click()
  await wizard.getByRole('button', { name: /隐形正畸/ }).first().click()
  await wizard.locator('[data-testid^="case-add-product-"]').first().click()
  await wizard.locator('.case-patient-autocomplete input').click()
  await wizard.locator('.case-patient-dropdown button').first().click()
  await wizard.locator('.case-wizard__footer .case-primary').click()
  for (const name of ['打印氧化锆冠', '弹性义齿']) {
    await wizard.locator('.case-item-tabs button').filter({ hasText: name }).first().click()
    await wizard.locator('.case-tooth-hit').first().click()
    for (const [field, value] of [['咬合 *', 'NORMAL'], ['染色 *', 'NONE'], ...(name === '打印氧化锆冠' ? [['邻接 *', 'NORMAL'], ['修复体边缘形式 *', 'PORCELAIN']] : [])]) {
      await wizard.locator('.case-field').filter({ hasText: field }).locator('select').selectOption(value)
    }
  }
  await wizard.locator('.case-item-tabs').first().locator('button').last().click()
  if (await wizard.locator('.case-tooth-hit').count()) await wizard.locator('.case-tooth-hit').first().click()
  await wizard.getByTestId('case-clear-aligner-arch').selectOption('FULL')
  await wizard.getByTestId('case-clear-aligner-mode').selectOption('REGULAR')
  await wizard.locator('.case-wizard__footer .case-primary').click()
  const upload = wizard.locator('.case-upload-redesign')
  await expect(upload).toBeVisible()
  const product = upload.locator('.upload-layout .case-upload-card')
  await expect(product.getByText('比色照片', { exact: false })).toHaveCount(0)
  await expect(product.getByText('面像照片', { exact: true })).toBeVisible()
  await upload.locator('.case-item-tabs button').filter({ hasText: '弹性义齿' }).click()
  await expect(product.getByText('面部侧面照', { exact: true })).toHaveCount(0)
  await expect(product.getByText('颌位记录', { exact: true })).toBeVisible()
  await upload.locator('.shared .case-upload-disclosure').click()
  const shade = upload.locator('.shared .case-shared-upload-slot').filter({ hasText: '比色照片' })
  await expect(shade).toContainText('打印氧化锆冠')
  await expect(shade).toContainText('弹性义齿')
  await page.screenshot({ path: 'test-results/refinements-mixed-products.png', fullPage: true })
})
