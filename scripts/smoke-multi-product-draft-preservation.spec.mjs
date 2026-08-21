import { expect, test } from '@playwright/test'
import { assertIsolatedSmokeTarget } from './assert-isolated-smoke-target.mjs'

const frontendUrl = process.env.MULTI_PRODUCT_DRAFT_FRONTEND_URL
const username = process.env.MULTI_PRODUCT_DRAFT_DOCTOR_USERNAME ?? 'doctor'
const password = process.env.MULTI_PRODUCT_DRAFT_DOCTOR_PASSWORD ?? 'change-me-doctor'

async function selectField(wizard, label, value) {
  await wizard.locator('.case-field').filter({ hasText: label }).locator('select').selectOption(value)
}

async function configureFixedProduct(wizard, productName, values, toothIndex) {
  await wizard.locator('.case-item-tabs button').filter({ hasText: productName }).click()
  await wizard.locator('.case-tooth-hit').nth(toothIndex).click()
  await selectField(wizard, '咬合 *', values.occlusion)
  await selectField(wizard, '邻接 *', values.contact)
  await selectField(wizard, '染色 *', values.stain)
  await selectField(wizard, '边缘 *', values.margin)
}

async function expectFixedProductValues(wizard, productName, values) {
  await wizard.locator('.case-item-tabs button').filter({ hasText: productName }).click()
  await expect(wizard.locator('.case-field').filter({ hasText: '咬合 *' }).locator('select')).toHaveValue(values.occlusion)
  await expect(wizard.locator('.case-field').filter({ hasText: '邻接 *' }).locator('select')).toHaveValue(values.contact)
  await expect(wizard.locator('.case-field').filter({ hasText: '染色 *' }).locator('select')).toHaveValue(values.stain)
  await expect(wizard.locator('.case-field').filter({ hasText: '边缘 *' }).locator('select')).toHaveValue(values.margin)
  await expect(wizard.locator('.case-svg-tooth.selected')).toHaveCount(1)
}

test('多产品保存后返回上一步仍保留每个产品的资料', async ({ page }) => {
  test.setTimeout(60_000)
  assertIsolatedSmokeTarget({
    isolatedEnv: process.env.MULTI_PRODUCT_DRAFT_ISOLATED_ENV,
    isolatedEnvVariable: 'MULTI_PRODUCT_DRAFT_ISOLATED_ENV',
    frontendUrl,
    frontendUrlVariable: 'MULTI_PRODUCT_DRAFT_FRONTEND_URL',
    taskLabel: 'multi-product draft preservation smoke'
  })

  await page.goto(frontendUrl, { waitUntil: 'domcontentloaded' })
  await page.getByTestId('portal-card-DOCTOR').click()
  await page.getByLabel('账号').fill(username)
  await page.getByLabel('密码').fill(password)
  await page.getByRole('button', { name: '登录' }).click()
  await expect(page.getByTestId('doctor-new-order')).toBeVisible({ timeout: 10_000 })

  await page.getByTestId('doctor-new-order').click()
  const wizard = page.getByTestId('doctor-case-group-wizard')
  await expect(wizard).toBeVisible({ timeout: 15_000 })
  await wizard.getByRole('button', { name: '直接新建患者' }).click()
  await wizard.locator('.case-new-patient label').filter({ hasText: '患者姓名' }).locator('input').fill(`多产品回退验收-${Date.now()}`)
  await wizard.getByRole('button', { name: '保存并选中患者' }).click()
  await expect(wizard.locator('.case-patient-selected')).toBeVisible()
  await wizard.locator('.case-field').filter({ hasText: '要求到货日期' }).locator('input').fill('2026-09-15')

  await wizard.getByRole('button', { name: /固定义齿/ }).first().click()
  await wizard.getByRole('button', { name: /打印氧化锆冠/ }).click()
  await wizard.getByRole('button', { name: /全瓷冠/ }).click()
  await wizard.locator('.case-wizard__footer .case-primary').click()
  await expect(wizard.getByRole('heading', { name: '牙位与制作要求', exact: true })).toBeVisible()

  const firstValues = { occlusion: 'LIGHT', contact: 'OPEN', stain: 'NONE', margin: 'METAL' }
  const secondValues = { occlusion: 'HEAVY', contact: 'TIGHT', stain: 'HEAVY', margin: 'PORCELAIN' }
  await configureFixedProduct(wizard, '打印氧化锆冠', firstValues, 0)
  await configureFixedProduct(wizard, '全瓷冠', secondValues, 1)

  await wizard.locator('.case-wizard__footer .case-primary').click()
  await expect(wizard.locator('h1').filter({ hasText: '材料与工艺' })).toBeVisible()
  await wizard.getByRole('button', { name: '上一步' }).click()
  await expect(wizard.getByRole('heading', { name: '牙位与制作要求', exact: true })).toBeVisible()

  await expectFixedProductValues(wizard, '打印氧化锆冠', firstValues)
  await expectFixedProductValues(wizard, '全瓷冠', secondValues)
})
