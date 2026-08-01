import { expect, test } from '@playwright/test'
import { assertIsolatedSmokeTarget } from './assert-isolated-smoke-target.mjs'

const frontendUrl = process.env.CLEAR_ALIGNER_FRONTEND_URL
const username = process.env.CLEAR_ALIGNER_DOCTOR_USERNAME ?? 'doctor'
const password = process.env.CLEAR_ALIGNER_DOCTOR_PASSWORD ?? 'change-me-doctor'

test('医生可添加无托槽隐形矫治器并进入七步处方', async ({ page }) => {
  test.setTimeout(60_000)
  assertIsolatedSmokeTarget({
    isolatedEnv: process.env.CLEAR_ALIGNER_ISOLATED_ENV,
    isolatedEnvVariable: 'CLEAR_ALIGNER_ISOLATED_ENV',
    frontendUrl,
    frontendUrlVariable: 'CLEAR_ALIGNER_FRONTEND_URL',
    taskLabel: 'clear-aligner doctor-ordering smoke'
  })

  const consoleErrors = []
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text())
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
  await wizard.locator('.case-new-patient label').filter({ hasText: '患者姓名' }).locator('input').fill(`隐形正畸验收-${Date.now()}`)
  await wizard.getByRole('button', { name: '保存并选中患者' }).click()
  await expect(wizard.locator('.case-patient-selected')).toBeVisible()
  await wizard.locator('.case-field').filter({ hasText: '要求到货日期' }).locator('input').fill('2026-09-15')

  await wizard.getByRole('button', { name: /隐形正畸/ }).first().click()
  await expect(wizard.getByRole('button', { name: /无托槽隐形矫治器/ })).toBeVisible()
  await expect(wizard.getByText('隐形正畸 A 型')).toHaveCount(0)
  await wizard.getByRole('button', { name: /无托槽隐形矫治器/ }).click()
  await expect(wizard.locator('.case-basket').getByText('无托槽隐形矫治器')).toBeVisible()

  await wizard.locator('.case-wizard__footer .case-primary').click()
  await expect(wizard.getByRole('heading', { name: '牙位与制作要求', exact: true })).toBeVisible()
  await wizard.getByTestId('case-clear-aligner-arch').selectOption('FULL')
  await wizard.getByTestId('case-clear-aligner-mode').selectOption('REGULAR')
  await wizard.locator('.case-tooth-hit').first().dblclick()

  await wizard.locator('.case-wizard__footer .case-primary').click()
  await expect(wizard.getByRole('heading', { name: '材料与工艺', exact: true })).toBeVisible()
  await wizard.locator('.case-wizard__footer .case-primary').click()
  await expect(wizard.getByRole('heading', { name: '资料上传', exact: true })).toBeVisible()
  await wizard.locator('.case-wizard__footer .case-primary').click()
  await expect(wizard.getByRole('heading', { name: '试戴与过程确认', exact: true })).toBeVisible()

  const prescription = wizard.getByTestId('orthodontic-seven-step')
  await expect(prescription).toBeVisible({ timeout: 10_000 })
  await prescription.getByRole('button', { name: /矫治器与联合矫治/ }).click()
  await expect(prescription.getByTestId('orthodontic-treatment-arch')).toHaveValue('FULL')
  await expect(prescription.getByTestId('orthodontic-treatment-mode')).toHaveValue('REGULAR')
  await expect(prescription.getByTestId('orthodontic-aligner-type')).toHaveValue('CLEAR_ALIGNER_BRACELESS')
  await expect(consoleErrors).toEqual([])
})
