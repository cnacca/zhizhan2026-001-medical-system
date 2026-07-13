import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { expect, test } from '@playwright/test'
import { assertIsolatedSmokeTarget } from './assert-isolated-smoke-target.mjs'

const frontendUrl = process.env.TASK9D77_FRONTEND_URL
const username = process.env.TASK9D77_DOCTOR_USERNAME ?? 'doctor'
const password = process.env.TASK9D77_DOCTOR_PASSWORD ?? 'change-me-doctor'
const uploadSizeBytes = Number(process.env.TASK9D77_CROSS_DEVICE_UPLOAD_SIZE_BYTES ?? 6 * 1024 * 1024)
const timeoutMs = Number(process.env.TASK9D77_TIMEOUT_MS ?? 180_000)
const weakNetworkDelayMs = Number(process.env.TASK9D77_WEAK_NETWORK_DELAY_MS ?? 250)
const browserChannel = process.env.TASK9D77_BROWSER_CHANNEL ?? 'chrome'
const partSize = 5 * 1024 * 1024

if (!Number.isFinite(uploadSizeBytes) || uploadSizeBytes <= partSize) {
  throw new Error('TASK9D77_CROSS_DEVICE_UPLOAD_SIZE_BYTES must be greater than 5242880')
}

function requireIsolatedTestEnvironment() {
  assertIsolatedSmokeTarget({
    isolatedEnv: process.env.TASK9D77_ISOLATED_ENV,
    isolatedEnvVariable: 'TASK9D77_ISOLATED_ENV',
    frontendUrl,
    frontendUrlVariable: 'TASK9D77_FRONTEND_URL',
    taskLabel: 'Task 9D.77 file-upload-resilience smoke'
  })
}

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

async function apiLogin() {
  const response = await fetch(`${frontendUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password, portal: 'DOCTOR' })
  })
  if (!response.ok) {
    throw new Error(`doctor API login failed: ${response.status}`)
  }
  return response.json()
}

async function apiFetch(pathname, token, options = {}) {
  const response = await fetch(`${frontendUrl}${pathname}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(options.headers ?? {})
    }
  })
  if (!response.ok) {
    const body = await response.text()
    throw new Error(`${pathname} failed with ${response.status}: ${body}`)
  }
  return response.json()
}

async function createSparseUploadFile() {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'task9d77-file-resilience-'))
  const fileName = `task9d77-cross-device-${Date.now()}.stl`
  const filePath = path.join(dir, fileName)
  const handle = await fs.open(filePath, 'w')
  try {
    const header = Buffer.from('task 9D.77 weak network cross-device resume\n')
    await handle.truncate(uploadSizeBytes)
    await handle.write(header, 0, header.length, 0)
    await handle.write(Buffer.from([10]), 0, 1, uploadSizeBytes - 1)
  } finally {
    await handle.close()
  }
  return { dir, filePath, fileName }
}

async function loginDoctor(page) {
  await page.goto(frontendUrl, { waitUntil: 'domcontentloaded' })
  await page.getByTestId('portal-card-DOCTOR').click()
  await expect(page.getByRole('heading', { name: '医生端登录' })).toBeVisible()
  await page.getByLabel('用户名').fill(username)
  await page.getByLabel('密码').fill(password)
  await page.getByRole('button', { name: '登录' }).click()
  await expect(page.getByText('医生已登录')).toBeVisible({ timeout: 10_000 })
}

async function clickMenuItem(page, label) {
  const nav = page.locator('.route-menu')
  const item = nav.getByText(label, { exact: true }).filter({ visible: true }).first()
  await expect(item, `menu item "${label}" should be visible`).toBeVisible({ timeout: 10_000 })
  await item.click()
}

async function createDoctorOrderInBrowser(page) {
  await clickMenuItem(page, '订单管理')
  await clickMenuItem(page, '新建订单')
  await page.waitForSelector('text=医生订单工作台', { timeout: 30_000 })
  await page.getByRole('textbox', { name: /患者姓名/ }).fill(`Task9D77CrossDevice-${Date.now()}`)
  await page.getByRole('textbox', { name: /牙位/ }).fill('16')
  await page.getByTestId('doctor-order-create-button').click()
  const result = page.getByTestId('doctor-order-create-result')
  await result.waitFor({ timeout: 30_000 })
  const text = await result.textContent()
  const orderNo = text?.split('/')[0]?.trim()
  if (!orderNo) {
    throw new Error(`cannot parse order_no from "${text}"`)
  }
  return orderNo
}

async function loadOrderId(orderNo, token) {
  const payload = await apiFetch(`/orders?keyword=${encodeURIComponent(orderNo)}&size=10`, token)
  const item = payload.data.items.find((order) => order.order_no === orderNo)
  if (!item) {
    throw new Error(`cannot find created order ${orderNo}`)
  }
  return item.order_id
}

async function selectExistingOrderForUpload(page, orderNo) {
  await clickMenuItem(page, '订单管理')
  await clickMenuItem(page, '我的订单')
  await page.getByPlaceholder('搜索订单号或患者').fill(orderNo)
  await page.getByRole('button', { name: '查询' }).click()
  await page.locator('.doctor-order-list').getByText(orderNo).waitFor({ timeout: 30_000 })
  await page.getByTestId('doctor-order-edit-button').click()
  await page.getByRole('tab', { name: '新建订单' }).click()
}

async function loadBrowserResumeSession(page) {
  return page.evaluate(() => {
    const entry = Object.entries(localStorage).find(([key]) => key.startsWith('doctor-order-upload:'))
    if (!entry) {
      return null
    }
    const [key, raw] = entry
    return {
      key,
      session: JSON.parse(raw)
    }
  })
}

async function assertMultipartStatus(fileId, uploadId, token) {
  const payload = await apiFetch(`/files/${fileId}/multipart/status?upload_id=${encodeURIComponent(uploadId)}`, token)
  if (payload.data.upload_status !== 'PENDING') {
    throw new Error(`expected interrupted multipart to remain PENDING, got ${payload.data.upload_status}`)
  }
  if (payload.data.completed_parts.length !== 1) {
    throw new Error(`expected exactly one uploaded part before cross-device resume, got ${payload.data.completed_parts.length}`)
  }
}

async function assertPendingCandidate(orderId, fileId, token) {
  const payload = await apiFetch(`/files/multipart/pending?order_id=${orderId}`, token)
  const candidate = payload.data.items.find((item) => item.file_id === fileId)
  if (!candidate) {
    throw new Error(`cross-device resume candidate ${fileId} was not listed for order ${orderId}`)
  }
}

async function assertFileReadable(fileId, token) {
  await apiFetch(`/files/${fileId}/preview-url`, token)
}

async function installWeakNetworkRoute(page, options = {}) {
  const { abortSecondPut = false } = options
  let putCount = 0
  await page.route('**/*', async (route) => {
    const request = route.request()
    if (request.method() === 'PUT') {
      putCount += 1
      if (weakNetworkDelayMs > 0) {
        await new Promise((resolve) => setTimeout(resolve, weakNetworkDelayMs))
      }
      if (abortSecondPut && putCount === 2) {
        await route.abort('internetdisconnected')
        return
      }
    }
    await route.continue()
  })
  return () => putCount
}

test.use({ channel: browserChannel })

test.describe('Task 9D.77 file upload resilience first increment', () => {
  test.setTimeout(timeoutMs + 90_000)

  test('resumes a weak network interrupted multipart upload from a second browser context', async ({ browser }) => {
    requireIsolatedTestEnvironment()
    await assertReachable()
    const apiSession = await apiLogin()
    const token = apiSession.accessToken
    const { dir, filePath } = await createSparseUploadFile()

    const contextA = await browser.newContext()
    const contextB = await browser.newContext()
    const deviceA = await contextA.newPage()
    const deviceB = await contextB.newPage()
    deviceA.setDefaultTimeout(timeoutMs)
    deviceB.setDefaultTimeout(timeoutMs)
    const getDeviceAPutCount = await installWeakNetworkRoute(deviceA, { abortSecondPut: true })
    const getDeviceBPutCount = await installWeakNetworkRoute(deviceB)

    try {
      await loginDoctor(deviceA)
      const orderNo = await createDoctorOrderInBrowser(deviceA)
      const orderId = await loadOrderId(orderNo, token)
      await deviceA.getByTestId('doctor-upload-file-input').setInputFiles(filePath)
      await expect(deviceA.getByTestId('doctor-upload-progress')).toContainText('已选择', { timeout: 30_000 })
      await expect(deviceA.getByTestId('doctor-upload-bind-button')).toBeEnabled({ timeout: 30_000 })
      await deviceA.getByTestId('doctor-upload-bind-button').click()
      await deviceA.getByText(/附件分片上传失败|Failed to fetch/).waitFor({ timeout: 30_000 })

      const interruptedSession = await loadBrowserResumeSession(deviceA)
      expect(interruptedSession, 'device A should keep a doctor-order-upload: localStorage session').not.toBeNull()
      const interruptedFileId = interruptedSession.session.file_id
      const interruptedUploadId = interruptedSession.session.upload_id
      expect(interruptedSession.session.completed_parts).toHaveLength(1)
      await assertMultipartStatus(interruptedFileId, interruptedUploadId, token)
      await assertPendingCandidate(orderId, interruptedFileId, token)

      await loginDoctor(deviceB)
      const deviceBSessionBefore = await loadBrowserResumeSession(deviceB)
      expect(deviceBSessionBefore, 'device B must start without device A local resume storage').toBeNull()
      await selectExistingOrderForUpload(deviceB, orderNo)
      await deviceB.getByTestId('doctor-upload-file-input').setInputFiles(filePath)
      await expect(deviceB.getByTestId('doctor-upload-progress')).toContainText('已选择', { timeout: 30_000 })
      await expect(deviceB.getByTestId('doctor-upload-bind-button')).toBeEnabled({ timeout: 30_000 })
      await deviceB.getByTestId('doctor-upload-bind-button').click()

      const completedTag = deviceB.getByTestId('doctor-upload-completed-file-id').last()
      await completedTag.waitFor({ timeout: timeoutMs })
      const completedText = await completedTag.textContent()
      const completedFileId = Number(completedText?.match(/\d+/)?.[0])
      expect(completedFileId).toBe(interruptedFileId)
      await expect(deviceB.getByTestId('doctor-upload-progress')).toContainText('上传完成')
      await assertFileReadable(interruptedFileId, token)

      console.log(
        `task 9D.77 file upload resilience first increment ok: order_id=${orderId}, file_id=${interruptedFileId}, weak network delay=${weakNetworkDelayMs}ms, device_a_puts=${getDeviceAPutCount()}, device_b_puts=${getDeviceBPutCount()}`
      )
    } finally {
      await Promise.all([
        contextA.close(),
        contextB.close(),
        fs.rm(dir, { recursive: true, force: true })
      ])
    }
  })
})
