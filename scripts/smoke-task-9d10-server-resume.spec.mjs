import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { expect, test } from '@playwright/test'

const frontendUrl = process.env.TASK9D10_FRONTEND_URL ?? 'http://127.0.0.1:5173'
const username = process.env.TASK9D10_DOCTOR_USERNAME ?? 'doctor'
const password = process.env.TASK9D10_DOCTOR_PASSWORD ?? 'change-me-doctor'
const uploadSizeBytes = Number(process.env.TASK9D10_RESUME_UPLOAD_SIZE_BYTES ?? 6 * 1024 * 1024)
const timeoutMs = Number(process.env.TASK9D10_RESUME_TIMEOUT_MS ?? 180_000)
const browserChannel = process.env.TASK9D10_BROWSER_CHANNEL ?? 'chrome'
const partSize = 5 * 1024 * 1024

if (!Number.isFinite(uploadSizeBytes) || uploadSizeBytes <= partSize) {
  throw new Error('TASK9D10_RESUME_UPLOAD_SIZE_BYTES must be greater than 5242880')
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
    throw new Error(`${pathname} failed with ${response.status}`)
  }
  return response.json()
}

async function apiLogin() {
  const response = await fetch(`${frontendUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  })
  if (!response.ok) {
    throw new Error(`doctor API login failed: ${response.status}`)
  }
  return response.json()
}

async function createSparseUploadFile() {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'task9d10-server-resume-'))
  const fileName = `task9d10-server-resume-${Date.now()}.bin`
  const filePath = path.join(dir, fileName)
  const handle = await fs.open(filePath, 'w')
  try {
    const header = Buffer.from('task9d10 server resume\n')
    await handle.truncate(uploadSizeBytes)
    await handle.write(header, 0, header.length, 0)
    await handle.write(Buffer.from([10]), 0, 1, uploadSizeBytes - 1)
  } finally {
    await handle.close()
  }
  return { dir, filePath, fileName }
}

async function createDoctorOrderInBrowser(page) {
  await page.getByRole('menuitem', { name: '医生订单' }).click()
  await page.waitForSelector('text=医生订单工作台', { timeout: 30_000 })
  await page.getByRole('textbox', { name: /患者姓名/ }).fill(`Task9D10Resume-${Date.now()}`)
  await page.getByRole('textbox', { name: /牙位/ }).fill('16')
  await page.getByTestId('doctor-order-create-button').click()
  const result = page.getByTestId('doctor-order-create-result')
  await result.waitFor({ timeout: 30_000 })
  const text = await result.textContent()
  const orderNo = text?.split('/')[0]?.trim()
  if (!orderNo) {
    throw new Error(`cannot parse order_no from "${text}"`)
  }
  await page.locator('.doctor-order-detail').getByText(orderNo).waitFor({ timeout: 30_000 })
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

async function initiatePendingMultipart(orderId, fileName, token, contentType) {
  const payload = await apiFetch('/files/multipart/initiate', token, {
    method: 'POST',
    body: JSON.stringify({
      order_id: orderId,
      source_type: 'ORDER_ATTACHMENT',
      visibility: 'DOCTOR',
      original_filename: fileName,
      content_type: contentType,
      file_size: uploadSizeBytes,
      part_size: partSize
    })
  })
  return payload.data
}

async function assertPendingCandidate(orderId, pendingFileId, token) {
  const payload = await apiFetch(`/files/multipart/pending?order_id=${orderId}`, token)
  const candidate = payload.data.items.find((item) => item.file_id === pendingFileId)
  if (!candidate) {
    throw new Error(`pending multipart candidate ${pendingFileId} was not listed for order ${orderId}`)
  }
}

async function assertFileReadable(fileId, token) {
  await apiFetch(`/files/${fileId}/preview-url`, token)
}

test.use({ channel: browserChannel })

test.describe('Task 9D.10 server resume smoke', () => {
  test.setTimeout(timeoutMs + 60_000)

  test('reuses a server pending multipart upload when local resume storage is empty', async ({ page }) => {
    await assertReachable()
    const apiSession = await apiLogin()
    const token = apiSession.accessToken
    const { dir, filePath, fileName } = await createSparseUploadFile()
    page.setDefaultTimeout(timeoutMs)

    try {
      await page.goto(frontendUrl, { waitUntil: 'domcontentloaded' })
      await page.locator('input[autocomplete="username"]').fill(username)
      await page.locator('input[autocomplete="current-password"]').fill(password)
      await page.getByRole('button', { name: '登录' }).click()

      const orderNo = await createDoctorOrderInBrowser(page)
      const orderId = await loadOrderId(orderNo, token)
      await page.evaluate(() => {
        for (const key of Object.keys(localStorage)) {
          if (key.startsWith('doctor-order-upload:')) {
            localStorage.removeItem(key)
          }
        }
      })

      await page.getByTestId('doctor-upload-file-input').setInputFiles(filePath)
      await expect(page.getByTestId('doctor-upload-progress')).toContainText('已选择', { timeout: 30_000 })
      const browserFile = await page.getByTestId('doctor-upload-file-input').evaluate((input) => {
        const file = input.files?.[0]
        return {
          name: file?.name ?? '',
          size: file?.size ?? 0,
          type: file?.type || 'application/octet-stream'
        }
      })
      expect(browserFile.name).toBe(fileName)
      expect(browserFile.size).toBe(uploadSizeBytes)

      const pendingUpload = await initiatePendingMultipart(orderId, browserFile.name, token, browserFile.type)
      const pendingFileId = pendingUpload.file_id
      await assertPendingCandidate(orderId, pendingFileId, token)

      await page.getByTestId('doctor-upload-bind-button').click()

      const completedTag = page.getByTestId('doctor-upload-completed-file-id').last()
      await completedTag.waitFor({ timeout: timeoutMs })
      const completedText = await completedTag.textContent()
      const completedFileId = Number(completedText?.match(/\d+/)?.[0])
      expect(completedFileId).toBe(pendingFileId)
      await expect(page.getByTestId('doctor-upload-progress')).toContainText('上传完成')
      await assertFileReadable(pendingFileId, token)
      console.log(`task 9D.10 server resume smoke ok: file_id=${pendingFileId}, order_id=${orderId}`)
    } finally {
      await fs.rm(dir, { recursive: true, force: true })
    }
  })
})
