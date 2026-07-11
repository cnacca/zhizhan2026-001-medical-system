import { expect, test } from '@playwright/test'

const frontendUrl = process.env.CUSTOMER_ATTENTION_FRONTEND_URL ?? 'http://127.0.0.1:5173'

test('客服工作台展示独立待办，并可进入沟通中心', async ({ page }) => {
  await page.goto(frontendUrl, { waitUntil: 'networkidle' })
  await page.evaluate(() => localStorage.clear())
  await page.goto(frontendUrl, { waitUntil: 'networkidle' })
  await page.getByTestId('portal-card-CS').click()
  await page.getByLabel('用户名').fill(process.env.CUSTOMER_ATTENTION_USERNAME ?? 'cs')
  await page.getByLabel('密码').fill(process.env.CUSTOMER_ATTENTION_PASSWORD ?? 'change-me-cs')
  await page.getByRole('button', { name: '登录' }).click()

  const attentionPanel = page.getByTestId('customer-attention-panel')
  await expect(attentionPanel).toBeVisible({ timeout: 10_000 })
  await expect(attentionPanel.getByText('需要关注', { exact: true })).toBeVisible()
  await expect(attentionPanel.getByText('资料初审', { exact: true })).toHaveCount(0)
  await expect(attentionPanel.getByText('翻译待审', { exact: true })).toHaveCount(0)
  await expect(page.getByTestId('customer-dashboard-pair')).toBeVisible()

  const communicationMenu = page.getByText('沟通中心', { exact: true })
  await expect(communicationMenu).toHaveCount(1)
  await communicationMenu.click()
  await expect(page.getByTestId('collaboration-composer')).toBeVisible()
})
