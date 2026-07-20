import { mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { chromium } from '@playwright/test'

const baseUrl = (process.env.CS_BASE_URL ?? 'http://127.0.0.1:15174').replace(/\/$/, '')
const username = process.env.CS_USER ?? 'cs'
const password = process.env.CS_PASSWORD ?? 'change-me-cs'
const artifactDir = path.resolve(process.env.CS_ARTIFACT_DIR ?? 'artifacts/cs-portal-pixel-smoke')
const timeoutMs = Number(process.env.CS_TIMEOUT_MS ?? 30_000)
const browserChannel = process.env.CS_BROWSER_CHANNEL?.trim() || undefined
const headless = process.env.CS_HEADLESS !== 'false'

const pageCases = [
  { slug: 'workbench', menu: '工作台', heading: /^(早上好|下午好|晚上好)，.+ 👋$/, interact: interactWithWorkbench },
  { slug: 'orders', menu: '订单管理', heading: '订单管理', dataRequest: /^\/orders$/, interact: interactWithOrders },
  { slug: 'information-translation', menu: '信息审核/翻译', heading: '信息审核/翻译', dataRequest: /^\/orders$/, interact: interactWithInformationTranslation },
  { slug: 'designs', menu: '设计稿管理', heading: '设计稿管理', dataRequest: /^\/orders$/, interact: interactWithDesigns },
  { slug: 'inquiries', menu: '问单沟通', heading: '问单沟通', dataRequest: /^\/orders$/, interact: interactWithInquiries },
  { slug: 'customers', menu: '客户管理', heading: '客户管理', dataRequest: /^\/clinics$/, interact: interactWithCustomers },
  { slug: 'products', menu: '产品管理', heading: '产品管理', dataRequest: /^\/products$/, interact: interactWithProducts },
  { slug: 'billing', menu: '账单管理', heading: '账单管理', dataRequest: /^\/logistics\/orders$/, interact: interactWithBilling },
  { slug: 'delivery', menu: '配送管理', heading: '配送管理', dataRequest: /^\/logistics\/orders$/, interact: interactWithDelivery },
  { slug: 'outsourcing', menu: '外协管理', heading: '外协管理', dataRequest: /^\/production\/outsourcing$/, interact: interactWithOutsourcing },
  { slug: 'settings', menu: '设置与账号', heading: '设置与账号', interact: interactWithSettings }
]

const dataReadiness = {
  orders: {
    label: '订单列表',
    dataSelector: '.cs-r-table-card tbody tr',
    emptyTexts: ['没有符合条件的订单']
  },
  informationTranslation: {
    label: '信息审核/翻译任务',
    dataSelector: '.cs-r-side-list > button',
    emptyTexts: ['当前筛选下暂无任务']
  },
  designs: {
    label: '设计订单列表',
    dataSelector: '.cs-r-table-card tbody tr',
    emptyTexts: ['没有符合条件的设计订单']
  },
  inquiries: {
    label: '问单会话列表',
    dataSelector: '.cs-r-conversations > button',
    emptyTexts: ['当前口径下没有会话']
  },
  customers: {
    label: '客户列表',
    dataSelector: '.cmp-customer-grid article',
    emptyTexts: ['没有符合当前条件的客户']
  },
  products: {
    label: '产品列表',
    dataSelector: '.cs-r-table-card tbody tr',
    emptyTexts: ['没有符合条件的已有产品']
  },
  billing: {
    label: '按单账单列表',
    dataSelector: '.cs-r-table-card tbody tr',
    emptyTexts: ['暂无账单关联记录']
  },
  delivery: {
    label: '配送订单列表',
    dataSelector: '.cs-r-table-card tbody tr',
    emptyTexts: ['当前筛选下没有配送订单']
  },
  outsourcing: {
    label: '外协批次列表',
    dataSelector: '.cs-r-table-card tbody tr',
    emptyTexts: ['当前没有外协批次']
  }
}

const report = {
  baseUrl,
  viewport: { width: 1440, height: 900 },
  startedAt: new Date().toISOString(),
  pages: [],
  auxiliaryPages: [],
  consoleErrors: [],
  pageErrors: [],
  externalResourceWarnings: [],
  blockedMutations: []
}

let currentStep = '启动'

function messageOf(error) {
  return error instanceof Error ? error.message : String(error)
}

function safeFileName(value) {
  return value.replace(/[^a-z0-9._-]+/gi, '-').replace(/^-+|-+$/g, '') || 'artifact'
}

function portableArtifactPath(target) {
  const relative = path.relative(process.cwd(), target)
  if (!relative || relative.startsWith('..')) return target
  return relative.split(path.sep).join('/')
}

async function assertReachable() {
  let response
  try {
    response = await fetch(baseUrl, { signal: AbortSignal.timeout(Math.min(timeoutMs, 10_000)) })
  } catch (error) {
    throw new Error(`无法访问客服端 ${baseUrl}：${messageOf(error)}。请先启动前后端服务。`)
  }
  if (!response.ok) {
    throw new Error(`客服端 ${baseUrl} 返回 HTTP ${response.status}，请确认 CS_BASE_URL 和本地服务状态。`)
  }
}

async function runStep(name, action) {
  currentStep = name
  try {
    return await action()
  } catch (error) {
    throw new Error(`[${name}] ${messageOf(error)}`, { cause: error })
  }
}

async function locatorIsVisible(locator) {
  return (await locator.count()) > 0 && await locator.first().isVisible()
}

async function clickButtonIfVisible(page, name, options = {}) {
  const locator = page.getByRole('button', { name, exact: options.exact ?? true })
  if (!await locatorIsVisible(locator)) return false
  await locator.first().click()
  return true
}

async function clickMatchingButtonIfVisible(page, namePattern) {
  const locator = page.getByRole('button', { name: namePattern })
  if (!await locatorIsVisible(locator)) return false
  await locator.first().click()
  return true
}

async function assertHeading(page, heading) {
  const locator = page.getByRole('heading', { name: heading, exact: true }).first()
  await locator.waitFor({ state: 'visible', timeout: timeoutMs })
}

async function assertNoHorizontalOverflow(page, label) {
  const overflow = await page.evaluate(() => {
    const scrollWidth = document.documentElement.scrollWidth
    const viewportWidth = window.innerWidth
    const offenders = [...document.querySelectorAll('body *')]
      .map((element) => {
        const rect = element.getBoundingClientRect()
        return {
          element: `${element.tagName.toLowerCase()}${element.id ? `#${element.id}` : ''}${[...element.classList].slice(0, 3).map((name) => `.${name}`).join('')}`,
          left: Math.round(rect.left),
          right: Math.round(rect.right),
          width: Math.round(rect.width)
        }
      })
      .filter((item) => item.right > viewportWidth + 1 || item.left < -1 || item.width > viewportWidth + 1)
      .sort((left, right) => right.right - left.right)
      .slice(0, 8)
    return { scrollWidth, viewportWidth, offenders }
  })
  if (overflow.scrollWidth > overflow.viewportWidth) {
    throw new Error(`${label} 存在横向溢出：document.scrollWidth=${overflow.scrollWidth}, innerWidth=${overflow.viewportWidth}, 可疑元素=${JSON.stringify(overflow.offenders)}`)
  }
  return overflow
}

async function assertContainerWidth(locator, expected, label) {
  await locator.waitFor({ state: 'visible', timeout: timeoutMs })
  const box = await locator.boundingBox()
  if (!box) throw new Error(`${label}无法读取可见尺寸`)
  if (Math.abs(box.width - expected) > 2) {
    throw new Error(`${label}宽度应为 ${expected}px，实际为 ${box.width}px`)
  }
  return Math.round(box.width)
}

async function capturePage(page, order, slug) {
  const fileName = `${String(order).padStart(2, '0')}-${safeFileName(slug)}.png`
  const target = path.join(artifactDir, fileName)
  await page.keyboard.press('Escape')
  await page.mouse.move(1430, 890)
  await page.waitForTimeout(800)
  await page.screenshot({ path: target, fullPage: false, animations: 'disabled' })
  return portableArtifactPath(target)
}

async function waitForVisibleDataOrEmpty(page, readiness) {
  const boundedTimeout = Math.min(timeoutMs, 10_000)
  const handle = await page.waitForFunction(({ dataSelector, emptyTexts }) => {
    const isVisible = (element) => {
      const style = window.getComputedStyle(element)
      const rect = element.getBoundingClientRect()
      return style.display !== 'none' && style.visibility !== 'hidden' && rect.width > 0 && rect.height > 0
    }
    const error = [...document.querySelectorAll('.cs-r-feedback.is-error, [role="alert"]')]
      .find((element) => isVisible(element))
    if (error) return { kind: 'error', text: error.textContent?.trim() || '页面显示未知错误' }
    const data = [...document.querySelectorAll(dataSelector)].find((element) => isVisible(element))
    if (data) return { kind: 'data' }
    const empty = [...document.querySelectorAll('.cs-r-state, .cmp-state')].find((element) => {
      if (!isVisible(element)) return false
      const text = element.textContent?.trim() || ''
      return emptyTexts.some((expected) => text.includes(expected))
    })
    if (empty) return { kind: 'empty', text: empty.textContent?.trim() || '' }
    return null
  }, {
    dataSelector: readiness.dataSelector,
    emptyTexts: readiness.emptyTexts
  }, { timeout: boundedTimeout })
  const result = await handle.jsonValue()
  if (result.kind === 'error') throw new Error(`${readiness.label}加载失败：${result.text}`)
  return result
}

async function openFirstRowAndClose(page, closeLabel, readiness) {
  const ready = await waitForVisibleDataOrEmpty(page, readiness)
  if (ready.kind === 'empty') return `明确空态：${ready.text}`
  const row = page.locator('.cs-r-table-card tbody tr').first()
  await row.waitFor({ state: 'visible', timeout: timeoutMs })
  await row.click()
  const close = page.getByRole('button', { name: closeLabel, exact: true }).first()
  await close.waitFor({ state: 'visible', timeout: timeoutMs })
  await close.click()
  await close.waitFor({ state: 'hidden', timeout: timeoutMs })
  return '已打开并关闭首条真实数据详情'
}

async function interactWithWorkbench() {
  return '工作台仅执行只读可见性检查'
}

async function interactWithOrders(page) {
  await waitForVisibleDataOrEmpty(page, dataReadiness.orders)
  await clickMatchingButtonIfVisible(page, /^新订单(?:\s|\d|$)/)
  await clickMatchingButtonIfVisible(page, /^全部(?:\s|\d|$)/)
  const row = page.locator('.cs-r-table-card tbody tr').first()
  await row.click()
  const drawer = page.locator('.el-drawer.cs-r-drawer')
  await assertContainerWidth(drawer, 540, '订单详情抽屉')
  for (const required of ['制作时间线', '订单资料', '文件与设计稿', '订单时间线', '沟通信息']) {
    await drawer.getByText(required, { exact: true }).waitFor({ state: 'visible', timeout: timeoutMs })
  }
  const reply = drawer.getByLabel('订单沟通消息')
  const send = drawer.getByRole('button', { name: '发送', exact: true })
  await reply.waitFor({ state: 'visible', timeout: timeoutMs })
  if (await send.isEnabled()) throw new Error('订单抽屉空消息仍允许发送')
  await reply.fill('只读验收草稿')
  if (!await send.isEnabled()) throw new Error('订单抽屉填写消息后发送按钮未启用')
  await reply.fill('')
  const text = await drawer.innerText()
  for (const forbidden of ['PENDING_CS_REVIEW', 'PENDING_PAYMENT', 'PROCESS_INSTANCE_CREATED', '[object Object]']) {
    if (text.includes(forbidden)) throw new Error(`订单详情仍显示内部值：${forbidden}`)
  }
  await page.getByRole('button', { name: '关闭订单详情', exact: true }).click()
  return '已验证 540px 连续滚动订单详情、底部内嵌回复和中文业务值；草稿已清空且未发送'
}

async function interactWithInformationTranslation(page) {
  const ready = await waitForVisibleDataOrEmpty(page, dataReadiness.informationTranslation)
  await clickMatchingButtonIfVisible(page, /^待处理(?:\s|\d|$)/)
  await clickMatchingButtonIfVisible(page, /^全部(?:\s|\d|$)/)
  if (ready.kind === 'empty') return `明确空态：${ready.text}`
  const firstTask = page.locator('.cs-r-side-list > button').first()
  await firstTask.waitFor({ state: 'visible', timeout: timeoutMs })
  await firstTask.click()
  const reviewCard = page.getByTestId('cs-information-review-card')
  await reviewCard.waitFor({ state: 'visible', timeout: timeoutMs })
  const workspaceText = await page.locator('.cs-r-workspace.is-translation').innerText()
  for (const forbiddenText of ['patient_name', 'tooth_position', 'acceptance_marker', 'demo_scenario', 'IMPLANT_RESTORATION', 'ORTHODONTICS', 'REMOVABLE']) {
    if (workspaceText.includes(forbiddenText)) {
      throw new Error(`信息审核页仍在展示内部英文键或产品代码：${forbiddenText}`)
    }
  }
  await clickButtonIfVisible(page, '翻译整理')
  await clickMatchingButtonIfVisible(page, /^附件(?:\s|\d|$)/)
  await clickButtonIfVisible(page, '信息审核')
  return '已验证中文结构化资料并切换只读页签，未生成或确认内容'
}

async function interactWithDesigns(page) {
  await waitForVisibleDataOrEmpty(page, dataReadiness.designs)
  const search = page.getByLabel('搜索设计订单')
  if (await locatorIsVisible(search)) {
    await search.fill('只读验收筛选')
    await search.fill('')
  }
  const row = page.locator('.cs-r-table-card tbody tr').first()
  await row.click()
  const drawer = page.locator('.el-drawer.cs-r-drawer')
  await assertContainerWidth(drawer, 540, '设计详情抽屉')
  await drawer.getByText('版本与审核记录', { exact: true }).waitFor({ state: 'visible', timeout: timeoutMs })
  const versionCards = drawer.locator('.cs-r-version-list article')
  for (let index = 0; index < await versionCards.count(); index += 1) {
    const card = versionCards.nth(index)
    const isReviewable = (await card.getAttribute('class') || '').split(/\s+/).includes('is-reviewable')
    const approve = card.getByRole('button', { name: '审核通过', exact: true })
    const reject = card.getByRole('button', { name: '退回修改', exact: true })
    if (isReviewable !== await locatorIsVisible(approve) || isReviewable !== await locatorIsVisible(reject)) {
      throw new Error(`设计版本 ${index + 1} 的审核按钮与真实状态不一致`)
    }
  }
  await page.getByRole('button', { name: '关闭设计稿详情', exact: true }).click()
  return '已验证 540px 版本抽屉与设计审核状态门禁'
}

async function interactWithInquiries(page) {
  const ready = await waitForVisibleDataOrEmpty(page, dataReadiness.inquiries)
  await clickMatchingButtonIfVisible(page, /^待回复(?:\s|\d|$)/)
  await clickButtonIfVisible(page, '全部会话')
  if (ready.kind === 'empty') return `明确空态：${ready.text}`
  const conversation = page.locator('.cs-r-conversations > button').first()
  await conversation.waitFor({ state: 'visible', timeout: timeoutMs })
  await conversation.click()
  const quickReply = page.getByRole('button', { name: '资料核对中', exact: true })
  const composer = page.getByLabel('问单消息')
  if (!await locatorIsVisible(quickReply) || !await locatorIsVisible(composer)) {
    return '无可操作会话，未填写或发送消息'
  }
  await quickReply.click()
  const draft = await composer.inputValue()
  if (!draft.includes('正在核对')) throw new Error(`快捷回复未正确填入输入框，实际值：${JSON.stringify(draft)}`)
  await composer.fill('')
  return '快捷回复仅填入后已清空，未点击发送'
}

async function interactWithCustomers(page) {
  const ready = await waitForVisibleDataOrEmpty(page, dataReadiness.customers)
  await clickMatchingButtonIfVisible(page, /^资料待完善(?:\s|\d|$)/)
  await clickMatchingButtonIfVisible(page, /^全部客户(?:\s|\d|$)/)
  if (ready.kind === 'empty') return `明确空态：${ready.text}`
  const card = page.locator('.cmp-customer-grid article').first()
  await card.waitFor({ state: 'visible', timeout: timeoutMs })
  await card.getByRole('button', { name: '管理档案 →', exact: true }).click()
  const dialog = page.locator('.el-dialog.cmp-detail-dialog')
  await assertContainerWidth(dialog, 960, '客户完整档案弹窗')
  for (const required of ['客户主档', '开票信息', '收货地址与发货方式', '主要医生及联系方式', '资质证件与合同管理', '客户专属产品价格', '客户单据与打印模板', '制作偏好', '黑名单与下单风险', '操作记录']) {
    await dialog.getByText(required, { exact: true }).waitFor({ state: 'visible', timeout: timeoutMs })
  }
  if (await dialog.locator('.cs-r-detail-tabs').count()) throw new Error('客户完整档案仍显示页签')
  const dialogText = await dialog.innerText()
  if (dialogText.includes('[object Object]')) throw new Error('客户完整档案仍显示 [object Object]')
  const close = dialog.getByRole('button', { name: '关闭', exact: true })
  await close.waitFor({ state: 'visible', timeout: timeoutMs })
  await close.click()
  return '已验证 960px 客户完整档案、十个连续内容区、专属价格、打印模板与黑名单状态'
}

async function interactWithProducts(page) {
  await waitForVisibleDataOrEmpty(page, dataReadiness.products)
  const search = page.getByLabel('搜索产品')
  if (await locatorIsVisible(search)) {
    await search.fill('只读验收筛选')
    await search.fill('')
  }
  const row = page.locator('.cs-r-table-card tbody tr').first()
  await row.click()
  const drawer = page.locator('.el-drawer.cs-r-drawer')
  await assertContainerWidth(drawer, 540, '产品详情抽屉')
  for (const required of ['产品资料', '医生下单要求', '变更记录']) {
    await drawer.getByText(required, { exact: true }).waitFor({ state: 'visible', timeout: timeoutMs })
  }
  if (await drawer.locator('.cs-r-detail-tabs').count()) throw new Error('产品详情仍显示页签')
  await page.getByRole('button', { name: '关闭产品详情', exact: true }).click()
  return '已验证 540px 产品抽屉及三个连续真实数据区'
}

async function interactWithBilling(page) {
  await waitForVisibleDataOrEmpty(page, dataReadiness.billing)
  await clickButtonIfVisible(page, '月结账单')
  await clickButtonIfVisible(page, '按单账单')
  const row = page.locator('.cs-r-table-card tbody tr').first()
  await row.click()
  const drawer = page.locator('.el-drawer.cs-r-drawer')
  await assertContainerWidth(drawer, 540, '账单详情抽屉')
  for (const required of ['账单金额', '关联订单', '人工收款记录', '操作记录']) {
    await drawer.getByText(required, { exact: true }).waitFor({ state: 'visible', timeout: timeoutMs })
  }
  if (await drawer.locator('.cs-r-detail-tabs').count()) throw new Error('账单详情仍显示页签')
  const paymentText = await drawer.innerText()
  if (paymentText.includes('BANK_TRANSFER')) throw new Error('账单详情仍显示英文收款方式')
  await page.getByRole('button', { name: '关闭账单详情', exact: true }).click()
  return '已验证 540px 连续账单详情与收款状态守卫'
}

async function interactWithDelivery(page) {
  await waitForVisibleDataOrEmpty(page, dataReadiness.delivery)
  await clickButtonIfVisible(page, '待发货')
  await clickButtonIfVisible(page, '全部')
  const row = page.locator('.cs-r-table-card tbody tr').first()
  await row.click()
  const drawer = page.locator('.el-drawer.cs-r-drawer')
  await assertContainerWidth(drawer, 540, '配送详情抽屉')
  for (const required of ['发货门禁', '物流时间线', '配送异常跟进', '操作记录']) {
    await drawer.getByText(required, { exact: true }).waitFor({ state: 'visible', timeout: timeoutMs })
  }
  if (await drawer.locator('.cs-r-detail-tabs').count()) throw new Error('配送详情仍显示页签')
  const statusText = await drawer.innerText()
  if (statusText.includes('SHIPPED') || statusText.includes('PENDING_PAYMENT')) throw new Error('配送详情仍显示英文状态值')
  await page.getByRole('button', { name: '关闭配送详情', exact: true }).click()
  return '已验证 540px 连续配送详情与发货门禁'
}

async function interactWithOutsourcing(page) {
  await waitForVisibleDataOrEmpty(page, dataReadiness.outsourcing)
  await clickButtonIfVisible(page, '已发出')
  await clickButtonIfVisible(page, '全部外发')
  const row = page.locator('.cs-r-table-card tbody tr').first()
  await row.click()
  const drawer = page.locator('.el-drawer.cs-r-drawer')
  await assertContainerWidth(drawer, 540, '外协详情抽屉')
  for (const required of ['外协履约进度', '异常写入能力尚未接入', '操作记录']) {
    await drawer.getByText(required, { exact: true }).waitFor({ state: 'visible', timeout: timeoutMs })
  }
  if (await drawer.locator('.cs-r-detail-tabs').count()) throw new Error('外协详情仍显示页签')
  const text = await drawer.innerText()
  if (text.includes('SENT') || text.includes('RETURNED') || text.includes('DELAYED')) throw new Error('外协详情仍显示英文状态值')
  await page.getByRole('button', { name: '关闭外协详情', exact: true }).click()
  return '已验证 540px 外协抽屉、真实进度与只读能力边界'
}

async function interactWithSettings(page) {
  for (const tab of ['客户分配', '常用回复', '通知与偏好', '当前账号']) {
    const button = page.getByRole('button', { name: tab, exact: true }).first()
    await button.waitFor({ state: 'visible', timeout: timeoutMs })
    await button.click()
    const className = await button.getAttribute('class')
    if (!className?.split(/\s+/).includes('active')) throw new Error(`设置页签“${tab}”点击后未激活`)
  }
  return '已切换全部设置页签，未执行保存'
}

async function clickSidebarPage(page, pageCase) {
  const menu = page.locator('.route-menu').getByRole('menuitem', { name: pageCase.menu, exact: true }).first()
  await menu.waitFor({ state: 'visible', timeout: timeoutMs })
  const dataResponse = pageCase.dataRequest
    ? page.waitForResponse((response) => {
      const url = new URL(response.url())
      return response.request().method() === 'GET' && url.origin === new URL(baseUrl).origin && pageCase.dataRequest.test(url.pathname)
    }, { timeout: Math.min(timeoutMs, 10_000) })
    : null
  await menu.click()
  await assertHeading(page, pageCase.heading)
  if (dataResponse) {
    const response = await dataResponse
    const responseError = await response.finished()
    if (responseError) throw new Error(`${pageCase.menu}数据请求未完整结束：${messageOf(responseError)}`)
    await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))))
  }
}

async function login(page) {
  await page.goto(baseUrl, { waitUntil: 'domcontentloaded', timeout: timeoutMs })
  await page.evaluate(() => {
    localStorage.clear()
    sessionStorage.clear()
  })
  await page.goto(baseUrl, { waitUntil: 'domcontentloaded', timeout: timeoutMs })
  const portalCard = page.getByTestId('portal-card-CS')
  await portalCard.waitFor({ state: 'visible', timeout: timeoutMs })
  await portalCard.click()
  await page.getByRole('heading', { name: '客服端登录', exact: true }).waitFor({ state: 'visible', timeout: timeoutMs })
  await page.getByLabel('用户名').fill(username)
  await page.getByLabel('密码').fill(password)
  await page.getByRole('button', { name: '登录', exact: true }).click()
  await page.locator('.route-menu').waitFor({ state: 'visible', timeout: timeoutMs })
  await assertHeading(page, /^(早上好|下午好|晚上好)，.+ 👋$/)
}

async function installReadOnlyGuard(page) {
  const appOrigin = new URL(baseUrl).origin
  await page.route('**/*', async (route) => {
    const request = route.request()
    const method = request.method().toUpperCase()
    const url = new URL(request.url())
    const sameOrigin = url.origin === appOrigin
    const tokenRefresh = /^\/(?:api\/)?auth\/refresh\/?$/.test(url.pathname)
    if (!sameOrigin || ['GET', 'HEAD', 'OPTIONS'].includes(method) || tokenRefresh) {
      await route.continue()
      return
    }
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
      report.blockedMutations.push({ step: currentStep, method, url: request.url() })
      await route.abort('blockedbyclient')
      return
    }
    await route.continue()
  })
}

async function exerciseAuxiliaryPages(page, screenshotStartIndex) {
  let screenshotIndex = screenshotStartIndex

  await runStep('顶栏通知入口', async () => {
    const button = page.locator('.cs-reference-topbar-tools').getByRole('button', { name: '通知中心', exact: true })
    await button.waitFor({ state: 'visible', timeout: timeoutMs })
    await button.click()
    const preview = page.locator('.cs-notification-preview')
    await preview.waitFor({ state: 'visible', timeout: timeoutMs })
    await preview.getByRole('button', { name: '查看全部', exact: true }).click()
    await assertHeading(page, '通知中心')
    await page.keyboard.press('Escape')
    await preview.waitFor({ state: 'hidden', timeout: timeoutMs }).catch(() => {})
    const dimensions = await assertNoHorizontalOverflow(page, '通知中心')
    const screenshot = await capturePage(page, screenshotIndex++, 'notifications')
    report.auxiliaryPages.push({ page: '通知中心', dimensions, screenshot })
  })

  await runStep('顶栏帮助入口', async () => {
    const button = page.locator('.cs-reference-topbar-tools').getByRole('button', { name: '帮助中心', exact: true })
    await button.waitFor({ state: 'visible', timeout: timeoutMs })
    await button.click()
    await assertHeading(page, '帮助中心')
    await clickButtonIfVisible(page, '订单与登记')
    const dimensions = await assertNoHorizontalOverflow(page, '帮助中心')
    const screenshot = await capturePage(page, screenshotIndex++, 'help')
    report.auxiliaryPages.push({ page: '帮助中心', dimensions, screenshot })
  })

  await runStep('顶栏全局搜索入口', async () => {
    const search = page.locator('.cs-reference-global-search input').first()
    await search.waitFor({ state: 'visible', timeout: timeoutMs })
    await search.fill('ORD')
    await search.press('Enter')
    await assertHeading(page, '全局搜索')
    await page.waitForFunction(() => {
      if (document.querySelector('.cs-r-search-results > button')) return true
      return [...document.querySelectorAll('.cs-r-state')]
        .some((element) => element.textContent?.includes('没有找到'))
    }, undefined, { timeout: Math.min(timeoutMs, 10_000) })
    const dimensions = await assertNoHorizontalOverflow(page, '全局搜索')
    const screenshot = await capturePage(page, screenshotIndex++, 'search')
    const firstResult = page.locator('.cs-r-search-results > button').first()
    let interaction = '搜索返回明确空态'
    if (await locatorIsVisible(firstResult)) {
      await firstResult.click()
      await assertHeading(page, '订单管理')
      const close = page.getByRole('button', { name: '关闭订单详情', exact: true }).first()
      await close.waitFor({ state: 'visible', timeout: timeoutMs })
      await close.click()
      await close.waitFor({ state: 'hidden', timeout: timeoutMs })
      interaction = '已从搜索结果打开并关闭对应订单详情'
    }
    report.auxiliaryPages.push({ page: '全局搜索', dimensions, interaction, screenshot })
  })
}

function assertCleanRuntime() {
  const diagnostics = []
  if (report.pageErrors.length) diagnostics.push(`pageerror=${JSON.stringify(report.pageErrors.slice(0, 10))}`)
  if (report.consoleErrors.length) diagnostics.push(`console.error=${JSON.stringify(report.consoleErrors.slice(0, 10))}`)
  if (report.blockedMutations.length) diagnostics.push(`只读保护拦截了写请求=${JSON.stringify(report.blockedMutations.slice(0, 10))}`)
  if (diagnostics.length) throw new Error(`浏览器运行期检查失败：${diagnostics.join('；')}`)
}

async function main() {
  await mkdir(artifactDir, { recursive: true })
  let browser
  let page
  try {
    await runStep('服务可达性', assertReachable)
    browser = await chromium.launch({ headless, ...(browserChannel ? { channel: browserChannel } : {}) })
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 })
    page = await context.newPage()
    page.setDefaultTimeout(timeoutMs)

    page.on('pageerror', (error) => {
      report.pageErrors.push({ step: currentStep, message: messageOf(error) })
    })
    page.on('console', (message) => {
      if (message.type() !== 'error') return
      const text = message.text()
      if (/favicon\.ico/i.test(text)) return
      const location = message.location()
      if (/^https:\/\/fonts\.(?:gstatic|googleapis)\.com\//i.test(location.url) && /Failed to load resource/i.test(text)) {
        report.externalResourceWarnings.push({ step: currentStep, text, location })
        return
      }
      report.consoleErrors.push({ step: currentStep, text, location })
    })

    await runStep('客服登录', () => login(page))
    await installReadOnlyGuard(page)

    let screenshotIndex = 1
    for (const pageCase of pageCases) {
      await runStep(`侧栏页面：${pageCase.menu}`, async () => {
        await clickSidebarPage(page, pageCase)
        const interaction = await pageCase.interact(page)
        const dimensions = await assertNoHorizontalOverflow(page, pageCase.heading)
        const screenshot = await capturePage(page, screenshotIndex++, pageCase.slug)
        report.pages.push({ menu: pageCase.menu, heading: pageCase.heading, dimensions, interaction, screenshot })
      })
    }

    await exerciseAuxiliaryPages(page, screenshotIndex)
    await page.waitForTimeout(300)
    assertCleanRuntime()

    report.finishedAt = new Date().toISOString()
    report.status = 'passed'
    await rm(path.join(artifactDir, 'failure.png'), { force: true })
    await writeFile(path.join(artifactDir, 'report.json'), `${JSON.stringify(report, null, 2)}\n`, 'utf8')
    console.log(`[PASS] 客服端只读像素冒烟验收通过：11 个侧栏页面 + 通知/帮助/搜索；截图与报告位于 ${artifactDir}`)
  } catch (error) {
    report.finishedAt = new Date().toISOString()
    report.status = 'failed'
    report.failure = { step: currentStep, message: messageOf(error) }
    if (page) {
      try {
        await page.screenshot({ path: path.join(artifactDir, 'failure.png'), fullPage: false, animations: 'disabled' })
      } catch (screenshotError) {
        report.failure.screenshotError = messageOf(screenshotError)
      }
    }
    await writeFile(path.join(artifactDir, 'report.json'), `${JSON.stringify(report, null, 2)}\n`, 'utf8')
    throw new Error(`${messageOf(error)}。失败截图和诊断报告：${artifactDir}`, { cause: error })
  } finally {
    await browser?.close()
  }
}

main().catch((error) => {
  console.error(`[FAIL] ${messageOf(error)}`)
  process.exitCode = 1
})
