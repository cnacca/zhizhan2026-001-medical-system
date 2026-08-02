import { expect, test } from '@playwright/test'

const frontendUrl = process.env.ADMIN_CONFIG_FRONTEND_URL
const browserChannel = process.env.ADMIN_CONFIG_BROWSER_CHANNEL ?? 'chrome'
const writeAuthorization = process.env.ADMIN_CONFIG_ALLOW_WRITES

if (!frontendUrl || writeAuthorization !== 'isolated') {
  throw new Error('该脚本会写入目录数据，只能显式设置 ADMIN_CONFIG_FRONTEND_URL 和 ADMIN_CONFIG_ALLOW_WRITES=isolated 后对隔离测试库运行')
}

const targetPort = new URL(frontendUrl).port
if (['5173', '15173', '15175'].includes(targetPort)) {
  throw new Error(`禁止对共享或演示前端端口 ${targetPort} 运行目录写入验收，请改用连接隔离测试库的独立端口`)
}

test.use({ channel: browserChannel, viewport: { width: 1440, height: 900 } })

async function rowByFirstInputValue(page, tableSelector, value) {
  const rows = page.locator(`${tableSelector} tbody tr`)
  for (let attempt = 0; attempt < 50; attempt += 1) {
    for (let index = 0; index < await rows.count(); index += 1) {
      const row = rows.nth(index)
      if (await row.locator('input').first().inputValue() === value) return row
    }
    await page.waitForTimeout(100)
  }
  throw new Error(`未找到表格内容：${value}`)
}

async function tableHasFirstInputValue(page, tableSelector, value) {
  const rows = page.locator(`${tableSelector} tbody tr`)
  for (let index = 0; index < await rows.count(); index += 1) {
    if (await rows.nth(index).locator('input').first().inputValue() === value) return true
  }
  return false
}

test('管理端可维护产品材料绑定且工时页使用统一紧凑样式', async ({ page }) => {
  const unique = Date.now().toString().slice(-8)
  const categoryName = `验收分类${unique}`
  const updatedCategoryName = `${categoryName}改`
  const productName = `验收产品${unique}`
  const updatedProductName = `${productName}改`
  const removableName = `待删产品${unique}`
  const materialName = `验收材料${unique}`
  const updatedMaterialName = `${materialName}改`

  await page.goto(frontendUrl, { waitUntil: 'domcontentloaded' })
  await page.evaluate(() => localStorage.clear())
  await page.goto(frontendUrl, { waitUntil: 'domcontentloaded' })

  await page.getByTestId('portal-card-ADMIN').click()
  await page.getByLabel('用户名').fill(process.env.ADMIN_CONFIG_USERNAME ?? 'admin')
  await page.getByLabel('密码').fill(process.env.ADMIN_CONFIG_PASSWORD ?? 'change-me-admin')
  await page.getByRole('button', { name: '登录' }).click()
  await expect(page.getByTestId('account-menu-trigger')).toContainText('admin', { timeout: 10_000 })

  const orderingMenu = page.locator('aside .el-menu-item').filter({ hasText: '下单内容设置' })
  await expect(orderingMenu).toBeVisible()
  await orderingMenu.click()
  await expect(page.getByTestId('catalog-configuration-center')).toBeVisible()

  const versionSelect = page.getByTestId('catalog-version-select')
  const selectedVersionLabel = await versionSelect.locator('option:checked').textContent()
  if (await versionSelect.locator('option', { hasText: '已发布' }).count()) {
    expect(selectedVersionLabel).toContain('已发布')
  }

  const createProductButton = page.getByTestId('catalog-product-create')
  const productCategory = page.getByTestId('catalog-product-category')
  if (await productCategory.isDisabled()) {
    await expect(page.getByTestId('catalog-start-edit')).toHaveText('开始编辑')
    await page.getByTestId('catalog-copy-version').click()
    await expect(productCategory).toBeEnabled()
  }

  await expect(productCategory).not.toHaveValue('0')
  await expect(page.getByTestId('catalog-category-create')).toBeEnabled()
  await page.getByTestId('catalog-category-create').click()
  await expect(page.getByText('请先填写分类名称')).toBeVisible()
  await expect(createProductButton).toBeEnabled()
  await createProductButton.click()
  await expect(page.getByText('请先填写产品名称')).toBeVisible()

  await page.getByTestId('catalog-category-name').fill(categoryName)
  await page.getByTestId('catalog-category-create').click()
  await expect(page.getByText('分类已添加')).toBeVisible()
  const categoryRow = await rowByFirstInputValue(page, '.category-edit-table', categoryName)
  await categoryRow.locator('input').first().fill(updatedCategoryName)
  await categoryRow.getByRole('button', { name: '保存' }).click()
  await expect(page.getByText('分类名称已更新')).toBeVisible()
  page.once('dialog', (dialog) => dialog.accept())
  await categoryRow.getByRole('button', { name: '删除' }).click()
  await expect(page.getByText('未使用的分类已删除')).toBeVisible()
  await expect.poll(() => tableHasFirstInputValue(page, '.category-edit-table', updatedCategoryName)).toBe(false)

  await productCategory.selectOption({ index: 1 })
  await page.getByTestId('catalog-product-name').fill(productName)
  await createProductButton.click()
  await expect(page.getByText('产品已保存，未配置价格时保持待报价')).toBeVisible()

  const productRow = await rowByFirstInputValue(page, '.product-edit-table', productName)
  await expect(productRow).toBeVisible()
  await productRow.locator('input').first().fill(updatedProductName)
  await productRow.getByRole('button', { name: '保存' }).click()
  await expect(page.getByText('产品内容已更新')).toBeVisible()

  await page.getByTestId('catalog-product-name').fill(removableName)
  await createProductButton.click()
  const removableRow = await rowByFirstInputValue(page, '.product-edit-table', removableName)
  await expect(removableRow).toBeVisible()
  page.once('dialog', (dialog) => dialog.accept())
  await removableRow.getByRole('button', { name: '删除' }).click()
  await expect(page.getByText('未发布且未引用的草稿产品已删除')).toBeVisible()
  await expect.poll(() => tableHasFirstInputValue(page, '.product-edit-table', removableName)).toBe(false)

  await page.getByTestId('catalog-tab-materials').click()
  await page.getByTestId('catalog-material-name').fill(materialName)
  await page.getByTestId('catalog-material-create').click()
  await expect(page.getByText('材料已添加')).toBeVisible()
  const materialRow = await rowByFirstInputValue(page, '.material-edit-table', materialName)
  await materialRow.locator('input').first().fill(updatedMaterialName)
  await materialRow.locator('input').nth(2).fill('验收品牌')
  await materialRow.getByRole('button', { name: '保存' }).click()
  await expect(page.getByText('材料内容已更新')).toBeVisible()

  await page.getByTestId('catalog-tab-bindings').click()
  await page.getByTestId('catalog-binding-product').selectOption({ label: updatedProductName })
  await page.getByTestId('catalog-binding-material').selectOption({ label: updatedMaterialName })
  await page.getByTestId('catalog-binding-create').click()
  await expect(page.getByText('产品与材料绑定已保存')).toBeVisible()
  await expect(page.getByTestId('catalog-bindings-section')).toContainText(updatedProductName)
  await expect(page.getByTestId('catalog-bindings-section')).toContainText(updatedMaterialName)

  await expect(page.locator('.config-toolbar input').first()).toHaveCSS('height', '34px')
  await expect(page.locator('.config-card h3').first()).toHaveCSS('font-size', '13px')
  await expect(page.getByTestId('catalog-configuration-center')).not.toContainText('服务端校验数量与适用范围')
  await expect(page.getByTestId('catalog-configuration-center')).not.toContainText('版本化 JSON Schema')
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBeTruthy()

  const standardTimeMenu = page.locator('aside .el-menu-item').filter({ hasText: '工序工时设置' })
  await standardTimeMenu.click()
  await expect(page.getByTestId('workflow-standard-time-center')).toBeVisible()
  await expect(page.getByTestId('standard-time-runtime-notice')).toContainText('工序工时尚未发布')
  await expect(page.getByTestId('standard-time-runtime-notice')).not.toContainText('开关')
  await expect(page.locator('.config-toolbar input').first()).toHaveCSS('height', '34px')
  await expect(page.locator('.config-card h3').first()).toHaveCSS('font-size', '13px')
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBeTruthy()
})
