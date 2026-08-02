import { expect, test } from '@playwright/test'

const frontendUrl = process.env.STANDARD_TIME_FRONTEND_URL ?? 'http://127.0.0.1:5173'
const browserChannel = process.env.STANDARD_TIME_BROWSER_CHANNEL ?? 'chrome'

test.use({ channel: browserChannel })

test('管理员可按现有工序链填写草稿，正式发布保持关闭', async ({ page }) => {
  await page.goto(frontendUrl, { waitUntil: 'networkidle' })
  await page.evaluate(() => localStorage.clear())
  await page.goto(frontendUrl, { waitUntil: 'networkidle' })

  await page.getByTestId('portal-card-ADMIN').click()
  await page.getByLabel('用户名').fill(process.env.STANDARD_TIME_ADMIN_USERNAME ?? 'admin')
  await page.getByLabel('密码').fill(process.env.STANDARD_TIME_ADMIN_PASSWORD ?? 'change-me-admin')
  await page.getByRole('button', { name: '登录' }).click()
  await expect(page.getByTestId('account-menu-trigger')).toContainText('admin', { timeout: 10_000 })

  const menuItem = page.locator('aside .el-menu-item').filter({ hasText: '工序工时设置' })
  await expect(menuItem).toBeVisible()
  await menuItem.click()

  await expect(page.getByTestId('workflow-standard-time-center')).toBeVisible()
  await expect(page.getByTestId('standard-time-runtime-notice')).toContainText('当前正式标准工时开关未启用')
  await expect(page.getByRole('button', { name: '正式数据确认后发布' })).toBeDisabled()

  const durationInput = page.locator('.standard-table-wrap tbody input[type="number"]').first()
  await expect(durationInput).toBeVisible()
  await durationInput.fill('23')
  await page.getByRole('button', { name: '批量保存' }).click()
  await expect(page.getByText('标准分钟已保存；空值继续保持未配置')).toBeVisible()

  await page.getByRole('button', { name: '刷新' }).click()
  await expect(durationInput).toHaveValue('23')
})
