import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { chromium } from '@playwright/test'

const baseUrl = (process.env.CS_BASE_URL ?? 'http://127.0.0.1:15173').replace(/\/$/, '')
const username = process.env.CS_USER ?? 'cs'
const password = process.env.CS_PASSWORD ?? 'change-me-cs'
const timeoutMs = Number(process.env.CS_TIMEOUT_MS ?? 30_000)
const artifactDir = path.resolve(
  process.env.CS_ORDER_DRAWER_ARTIFACT_DIR
    ?? 'docs/design-references/cs-portal/order-drawer-20260720'
)

function assert(condition, message) {
  if (!condition) throw new Error(message)
}

async function staticChecks() {
  const [component, styles, workflowSeed] = await Promise.all([
    readFile('frontend/src/components/CsPortalPages.vue', 'utf8'),
    readFile('frontend/src/cs-rebuilt-pages.css', 'utf8'),
    readFile('backend/platform-server/src/main/resources/db/migration/V2__seed_workflow_chains.sql', 'utf8')
  ])
  const componentMarkers = [
    'sendOrderDrawerMessage',
    "visible_to: 'DOCTOR_CS'",
    '/preview-url',
    'StlViewerDialog',
    'IMPLANT_RESTORATION',
    '制作时间线',
    '沟通信息',
    '文件与设计稿',
    '订单资料',
    '订单时间线',
    'cs-order-production-timeline',
    'cs-order-section-details',
    'cs-order-section-files',
    'cs-order-section-messages',
    'cs-order-section-history',
    '设计稿第 {{ draft.version }} 版',
    '生产创建时间',
    'MAIN_PRODUCTION_STAGES'
  ]
  const styleMarkers = [
    '.cs-r-order-drawer.el-drawer',
    'overflow-y: auto',
    'position: sticky',
    'height: 61px',
    'box-shadow: -8px 0 32px rgba(30, 27, 75, .1)',
    '.cs-r-order-production-timeline',
    '.cs-r-order-production-step',
    '.cs-r-order-production-marker',
    '.cs-r-order-production-current-note',
    '.cs-r-order-production-toggle',
    '.cs-r-order-production-sublist',
    '.cs-r-order-production-substep',
    '.cs-r-order-flow-section',
    '.cs-r-order-composer'
  ]
  for (const marker of componentMarkers) assert(component.includes(marker), `Vue 缺少抽屉标记：${marker}`)
  for (const marker of styleMarkers) assert(styles.includes(marker), `CSS 缺少抽屉标记：${marker}`)
  const seededProcessNames = [...workflowSeed.matchAll(/\(@chain_id,\s*'[^']+',\s*'([^']+)'/g)].map((match) => match[1])
  const missingProcessVisuals = [...new Set(seededProcessNames)].filter((processName) => !component.includes(`'${processName}'`))
  assert(missingProcessVisuals.length === 0, `真实工序缺少节点图形映射：${missingProcessVisuals.join('、')}`)
  assert(component.includes('PROCESS_NODE_VISUAL_GROUPS'), '节点图形必须使用显式工序映射')
  assert(!component.includes('return String(node.step_order)'), '节点图形不得回退为工序序号')
  assert(styles.includes('background: #eef2f8'), '时间线连接线颜色未对齐参考值 #eef2f8')
  assert(styles.includes('border-color: #ddd6fe'), '已完成节点边框未对齐参考值 #ddd6fe')
  assert(!component.includes('orderDrawerTab'), '抽屉不应保留页签状态')
  assert(!component.includes('aria-label="订单抽屉内容页签"'), '抽屉不应保留页签导航')
  assert(!/status\s*\?\s*labels\[status\]\s*\|\|\s*status/.test(component), '状态不得将未知英文枚举直接显示')
  return { componentMarkers, styleMarkers }
}

async function login(page) {
  await page.goto(baseUrl, { waitUntil: 'domcontentloaded', timeout: timeoutMs })
  await page.evaluate(() => {
    localStorage.clear()
    sessionStorage.clear()
  })
  await page.goto(baseUrl, { waitUntil: 'domcontentloaded', timeout: timeoutMs })
  await page.getByTestId('portal-card-CS').click()
  await page.getByRole('heading', { name: '客服端登录', exact: true }).waitFor({ state: 'visible' })
  await page.getByLabel('用户名').fill(username)
  await page.getByLabel('密码').fill(password)
  await page.getByRole('button', { name: '登录', exact: true }).click()
  await page.locator('.route-menu').waitFor({ state: 'visible', timeout: timeoutMs })
}

async function browserChecks() {
  const browser = await chromium.launch({ headless: process.env.CS_HEADLESS !== 'false' })
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 })
  const page = await context.newPage()
  const consoleErrors = []
  const pageErrors = []
  page.on('console', (message) => {
    if (message.type() === 'error' && !/favicon\.ico/i.test(message.text())) consoleErrors.push(message.text())
  })
  page.on('pageerror', (error) => pageErrors.push(error.message))

  try {
    await login(page)
    await page.locator('.route-menu').getByRole('menuitem', { name: '订单管理', exact: true }).click()
    await page.getByRole('heading', { name: '订单管理', exact: true }).waitFor({ state: 'visible' })

    const preferredRow = page.locator('[data-testid="cs-orders-table"] tbody tr').filter({ hasText: 'ORD20260715-D8645CA638' })
    const row = await preferredRow.count() ? preferredRow.first() : page.locator('[data-testid="cs-orders-table"] tbody tr').first()
    await row.waitFor({ state: 'visible', timeout: timeoutMs })
    await row.click()

    const shell = page.locator('.cs-r-order-drawer-shell')
    const drawer = page.locator('.cs-r-drawer.el-drawer').filter({ has: shell })
    await shell.waitFor({ state: 'visible', timeout: timeoutMs })
    await page.getByTestId('cs-order-section-messages').waitFor({ state: 'visible', timeout: timeoutMs })
    await page.waitForTimeout(700)

    const expectedSections = [
      ['cs-order-production-timeline', '制作时间线'],
      ['cs-order-section-details', '订单资料'],
      ['cs-order-section-files', '文件与设计稿'],
      ['cs-order-section-history', '订单时间线'],
      ['cs-order-section-messages', '沟通信息']
    ]
    for (const [testId, heading] of expectedSections) {
      assert(await page.getByTestId(testId).count() === 1, `抽屉缺少连续分节：${heading}`)
    }
    assert(await shell.getByRole('tab').count() === 0, '抽屉仍然存在页签交互')
    const productionTimeline = page.getByTestId('cs-order-production-timeline')
    const productionSteps = productionTimeline.locator('.cs-r-order-production-step')
    const productionStageCount = await productionSteps.count()
    assert(productionStageCount === 8, `当前订单应压缩为8条主流程，实际 ${productionStageCount} 条`)
    const expectedProductionStages = [
      '订单接收', '信息与数据审核', '入厂收货', '种植部件制作',
      'CAD设计与切削', '金属与瓷层加工', '上釉、抛光与质检', '账单核对与发货'
    ]
    const productionStageVisuals = await productionSteps.evaluateAll((steps) => steps.map((step) => ({
      name: step.querySelector('.cs-r-order-production-content header strong')?.textContent?.trim() ?? '',
      icon: step.querySelector('.cs-r-order-production-marker')?.textContent?.trim() ?? ''
    })))
    const allowedNodeVisuals = new Set(['✓', '📥', '🔎', '💾', '✏️', '🔍', '⚙️', '📸', '🎨', '✅', '💳', '🚀'])
    assert(JSON.stringify(productionStageVisuals.map(({ name }) => name)) === JSON.stringify(expectedProductionStages), `主流程顺序不正确：${JSON.stringify(productionStageVisuals)}`)
    const invalidStageVisuals = productionStageVisuals.filter(({ name, icon }) => !name || !allowedNodeVisuals.has(icon))
    assert(invalidStageVisuals.length === 0, `主流程存在无图形或数字节点：${JSON.stringify(invalidStageVisuals)}`)
    const waitingStepCount = await productionSteps.locator('.cs-r-order-production-marker').filter({ hasNotText: '✓' }).count()
    assert(waitingStepCount > 0, '制作时间线缺少待处理节点视觉状态')
    const productionToggles = productionTimeline.locator('.cs-r-order-production-toggle')
    assert(await productionToggles.count() === productionStageCount, '每条主流程都应提供内部工序展开入口')
    for (let index = 0; index < productionStageCount; index += 1) await productionToggles.nth(index).click()
    const productionSubsteps = productionTimeline.locator('.cs-r-order-production-substep')
    const productionNodeCount = await productionSubsteps.count()
    assert(productionNodeCount === 28, `展开后应保留28道真实工序，实际 ${productionNodeCount} 道`)
    const productionNodeVisuals = await productionSubsteps.evaluateAll((steps) => steps.map((step) => ({
      name: step.querySelector('div > strong')?.textContent?.trim() ?? '',
      icon: step.querySelector('.cs-r-order-production-submarker')?.textContent?.trim() ?? ''
    })))
    const invalidNodeVisuals = productionNodeVisuals.filter(({ name, icon }) => !name || !allowedNodeVisuals.has(icon))
    assert(invalidNodeVisuals.length === 0, `内部工序存在无图形或数字节点：${JSON.stringify(invalidNodeVisuals)}`)
    for (let index = 0; index < productionStageCount; index += 1) await productionToggles.nth(index).click()
    assert(await productionSubsteps.count() === 0, '收起后不应继续平铺内部工序')
    const timelineStyles = await productionSteps.first().evaluate((step) => {
      const marker = step.querySelector('.cs-r-order-production-marker')
      const name = step.querySelector('.cs-r-order-production-content header strong')
      if (!marker || !name) return null
      const markerStyle = getComputedStyle(marker)
      const nameStyle = getComputedStyle(name)
      const lineStyle = getComputedStyle(step, '::before')
      return {
        markerWidth: markerStyle.width,
        markerHeight: markerStyle.height,
        markerBorderColor: markerStyle.borderColor,
        markerFontSize: markerStyle.fontSize,
        lineColor: lineStyle.backgroundColor,
        nodeNameFontSize: nameStyle.fontSize,
        nodeNameFontWeight: nameStyle.fontWeight
      }
    })
    assert(timelineStyles, '无法读取制作时间线计算样式')
    assert(timelineStyles.markerWidth === '24px' && timelineStyles.markerHeight === '24px', `节点尺寸未对齐24px：${JSON.stringify(timelineStyles)}`)
    assert(timelineStyles.markerBorderColor === 'rgb(221, 214, 254)', `已完成节点边框色未对齐：${timelineStyles.markerBorderColor}`)
    assert(timelineStyles.lineColor === 'rgb(238, 242, 248)', `连接线颜色未对齐：${timelineStyles.lineColor}`)
    assert(timelineStyles.markerFontSize === '9px', `节点图形字号未对齐9px：${timelineStyles.markerFontSize}`)
    assert(timelineStyles.nodeNameFontSize === '12px' && timelineStyles.nodeNameFontWeight === '600', `节点文字规格未对齐：${JSON.stringify(timelineStyles)}`)
    const sectionOffsets = await page.evaluate(() => [
      'cs-order-production-timeline',
      'cs-order-section-details',
      'cs-order-section-files',
      'cs-order-section-history',
      'cs-order-section-messages'
    ].map((id) => document.querySelector(`[data-testid="${id}"]`)?.getBoundingClientRect().top ?? -1))
    assert(sectionOffsets.every((top, index) => index === 0 || top > sectionOffsets[index - 1]), '抽屉分节没有按单页顺序排列')
    for (const removedHeading of ['账单与物流', '关联记录', '真实工序时间线']) {
      assert(await shell.getByRole('heading', { name: removedHeading, exact: true }).count() === 0, `抽屉仍平铺旧分节：${removedHeading}`)
    }

    const geometry = await page.evaluate(() => {
      const drawerElement = document.querySelector('.cs-r-drawer.el-drawer:has(.cs-r-order-drawer-shell)')
      const body = drawerElement?.querySelector('.el-drawer__body')
      const content = drawerElement?.querySelector('.cs-r-order-drawer-body')
      const header = drawerElement?.querySelector('.cs-r-order-drawer-head')
      if (!drawerElement || !body || !content || !header) return null
      const rect = drawerElement.getBoundingClientRect()
      return {
        width: Math.round(rect.width),
        height: Math.round(rect.height),
        scrollHeight: drawerElement.scrollHeight,
        clientHeight: drawerElement.clientHeight,
        drawerOverflowY: getComputedStyle(drawerElement).overflowY,
        bodyOverflowY: getComputedStyle(body).overflowY,
        contentOverflowY: getComputedStyle(content).overflowY,
        headerPosition: getComputedStyle(header).position,
        headerTop: Math.round(header.getBoundingClientRect().top)
      }
    })
    assert(geometry, '无法读取订单抽屉几何信息')
    assert(Math.abs(geometry.width - 540) <= 1, `抽屉宽度应为 540px，实际 ${geometry.width}px`)
    assert(geometry.scrollHeight > geometry.clientHeight + 800, `抽屉没有形成连续长页：${geometry.scrollHeight}px`)
    assert(geometry.scrollHeight < geometry.clientHeight + 9000, `抽屉内容高度异常：${geometry.scrollHeight}px`)
    assert(['auto', 'scroll'].includes(geometry.drawerOverflowY), `抽屉根容器未开启滚动：${geometry.drawerOverflowY}`)
    assert(geometry.bodyOverflowY === 'visible', `Element body 不应独立滚动：${geometry.bodyOverflowY}`)
    assert(geometry.contentOverflowY === 'visible', `正文不应独立滚动：${geometry.contentOverflowY}`)
    assert(geometry.headerPosition === 'sticky', `抽屉顶部应吸顶，实际 ${geometry.headerPosition}`)

    const visibleText = await shell.innerText()
    const leakedCodes = visibleText.match(/\b(?:IMPLANT_RESTORATION|PENDING_CS_REVIEW|COMPLETED|DOCTOR_CS|DESIGN_DRAFT|ORDER_SUBMISSION)\b/g) ?? []
    assert(leakedCodes.length === 0, `抽屉泄漏英文业务枚举：${[...new Set(leakedCodes)].join('、')}`)

    await drawer.evaluate((element) => { element.scrollTop = 0 })
    await page.waitForTimeout(200)
    await drawer.screenshot({ path: path.join(artifactDir, 'after-order-drawer-production-timeline-1440x900.png'), animations: 'disabled' })

    await shell.getByRole('button', { name: '关闭订单详情', exact: true }).click()
    await shell.waitFor({ state: 'hidden' })
    const contentRow = page.locator('[data-testid="cs-orders-table"] tbody tr').filter({ hasText: 'ORD20260713-479505317C' }).first()
    await contentRow.click()
    await shell.waitFor({ state: 'visible', timeout: timeoutMs })
    await page.getByTestId('cs-order-section-messages').waitFor({ state: 'visible', timeout: timeoutMs })
    await page.waitForTimeout(500)

    const composer = page.getByLabel('订单沟通消息')
    const sendButton = shell.getByRole('button', { name: '发送', exact: true })
    assert(await sendButton.isDisabled(), '空消息时发送按钮应禁用')
    await composer.fill('抽屉沟通验收草稿')
    assert(!await sendButton.isDisabled(), '输入消息后发送按钮应可用')
    await composer.fill('')

    await page.getByTestId('cs-order-section-details').scrollIntoViewIfNeeded()
    await drawer.screenshot({ path: path.join(artifactDir, 'after-order-drawer-details-1440x900.png'), animations: 'disabled' })

    await page.getByTestId('cs-order-section-files').scrollIntoViewIfNeeded()
    await drawer.screenshot({ path: path.join(artifactDir, 'after-order-drawer-files-1440x900.png'), animations: 'disabled' })

    await page.getByTestId('cs-order-section-history').scrollIntoViewIfNeeded()
    await drawer.screenshot({ path: path.join(artifactDir, 'after-order-drawer-records-1440x900.png'), animations: 'disabled' })

    await page.getByTestId('cs-order-section-messages').scrollIntoViewIfNeeded()
    await drawer.screenshot({ path: path.join(artifactDir, 'after-order-drawer-chat-1440x900.png'), animations: 'disabled' })

    await drawer.evaluate((element) => { element.scrollTop = element.scrollHeight })
    await page.waitForTimeout(250)
    const stickyTop = await page.locator('.cs-r-order-drawer-head').evaluate((element) => Math.round(element.getBoundingClientRect().top))
    assert(Math.abs(stickyTop - geometry.headerTop) <= 1, `滚动后顶部没有保持吸顶：${stickyTop}`)
    await drawer.screenshot({ path: path.join(artifactDir, 'after-order-drawer-bottom-chat-1440x900.png'), animations: 'disabled' })

    await page.setViewportSize({ width: 390, height: 844 })
    await page.waitForTimeout(300)
    await drawer.evaluate((element) => { element.scrollTop = 0 })
    const mobileGeometry = await page.evaluate(() => {
      const drawerElement = document.querySelector('.cs-r-drawer.el-drawer:has(.cs-r-order-drawer-shell)')
      const sections = [...document.querySelectorAll('.cs-r-order-flow-section')]
      if (!drawerElement || sections.length !== 4) return null
      const rect = drawerElement.getBoundingClientRect()
      return {
        width: Math.round(rect.width),
        viewportWidth: window.innerWidth,
        scrollWidth: drawerElement.scrollWidth,
        clientWidth: drawerElement.clientWidth,
        flowSectionCount: sections.length
      }
    })
    assert(mobileGeometry, '无法读取移动端抽屉几何信息')
    assert(mobileGeometry.width === 390, `移动端抽屉应占满 390px，实际 ${mobileGeometry.width}px`)
    assert(mobileGeometry.scrollWidth <= mobileGeometry.clientWidth + 1, '移动端抽屉出现横向溢出')
    assert(mobileGeometry.flowSectionCount === 4, '移动端连续分节数量异常')
    await drawer.screenshot({ path: path.join(artifactDir, 'after-order-drawer-mobile-390x844.png'), animations: 'disabled' })

    assert(pageErrors.length === 0, `页面异常：${pageErrors.join('；')}`)
    assert(consoleErrors.length === 0, `控制台异常：${consoleErrors.join('；')}`)
    return {
      geometry,
      mobileGeometry,
      sections: expectedSections.map(([, heading]) => heading),
      productionStageCount,
      productionNodeCount,
      productionStageVisuals,
      productionNodeVisuals,
      timelineStyles,
      visibleTextLength: visibleText.length
    }
  } finally {
    await browser.close()
  }
}

async function main() {
  await mkdir(artifactDir, { recursive: true })
  const staticResult = await staticChecks()
  const browserResult = await browserChecks()
  const report = {
    status: 'passed',
    checkedAt: new Date().toISOString(),
    baseUrl,
    staticResult,
    browserResult
  }
  await writeFile(path.join(artifactDir, 'order-drawer-reference-report.json'), `${JSON.stringify(report, null, 2)}\n`, 'utf8')
  console.log(`[PASS] 客服订单抽屉参考复刻验收通过：${artifactDir}`)
}

main().catch((error) => {
  console.error(`[FAIL] ${error instanceof Error ? error.message : String(error)}`)
  process.exitCode = 1
})
