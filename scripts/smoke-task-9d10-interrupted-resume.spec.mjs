import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { expect, test } from '@playwright/test'
import { assertIsolatedSmokeTarget } from './assert-isolated-smoke-target.mjs'

const frontendUrl = process.env.TASK9D10_FRONTEND_URL
const username = process.env.TASK9D10_DOCTOR_USERNAME ?? 'doctor'
const password = process.env.TASK9D10_DOCTOR_PASSWORD ?? 'change-me-doctor'
const uploadSizeBytes = Number(process.env.TASK9D10_INTERRUPTED_UPLOAD_SIZE_BYTES ?? 6 * 1024 * 1024)
const timeoutMs = Number(process.env.TASK9D10_INTERRUPTED_TIMEOUT_MS ?? 180_000)
const browserChannel = process.env.TASK9D10_BROWSER_CHANNEL ?? 'chrome'
const partSize = 5 * 1024 * 1024

if (!Number.isFinite(uploadSizeBytes) || uploadSizeBytes <= partSize) {
  throw new Error('TASK9D10_INTERRUPTED_UPLOAD_SIZE_BYTES must be greater than 5242880')
}

function requireIsolatedTestEnvironment() {
  assertIsolatedSmokeTarget({
    isolatedEnv: process.env.TASK9D10_ISOLATED_ENV,
    isolatedEnvVariable: 'TASK9D10_ISOLATED_ENV',
    frontendUrl,
    frontendUrlVariable: 'TASK9D10_FRONTEND_URL',
    taskLabel: 'Task 9D.10 interrupted-resume smoke'
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
    throw new Error(`${pathname} failed with ${response.status}`)
  }
  return response.json()
}

async function createSparseUploadFile() {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'task9d10-interrupted-resume-'))
  const fileName = `task9d10-interrupted-resume-${Date.now()}.bin`
  const filePath = path.join(dir, fileName)
  const handle = await fs.open(filePath, 'w')
  try {
    const header = Buffer.from('task9d10 interrupted resume\n')
    await handle.truncate(uploadSizeBytes)
    await handle.write(header, 0, header.length, 0)
    await handle.write(Buffer.from([10]), 0, 1, uploadSizeBytes - 1)
  } finally {
    await handle.close()
  }
  return { dir, filePath }
}

async function createDoctorOrderInBrowser(page) {
  await page.getByRole('menuitem', { name: '医生订单' }).click()
  await page.waitForSelector('text=医生订单工作台', { timeout: 30_000 })
  await page.getByRole('textbox', { name: /患者姓名/ }).fill(`Task9D10Interrupted-${Date.now()}`)
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
    throw new Error(`expected exactly one uploaded part before resume, got ${payload.data.completed_parts.length}`)
  }
}

async function assertFileReadable(fileId, token) {
  await apiFetch(`/files/${fileId}/preview-url`, token)
}

test.use({ channel: browserChannel })

test.describe('Task 9D.10 interrupted resume smoke', () => {
  test.setTimeout(timeoutMs + 60_000)

  test('resumes the same multipart file_id after an interrupted browser upload', async ({ page }) => {
    requireIsolatedTestEnvironment()
    await assertReachable()
    const apiSession = await apiLogin()
    const token = apiSession.accessToken
    const { dir, filePath } = await createSparseUploadFile()
    page.setDefaultTimeout(timeoutMs)

    let putCount = 0
    let abortSecondPut = true
    await page.route('**/*', async (route) => {
      const request = route.request()
      if (request.method() === 'PUT') {
        putCount += 1
        if (abortSecondPut && putCount === 2) {
          abortSecondPut = false
          await route.abort('internetdisconnected')
          return
        }
      }
      await route.continue()
    })

    try {
      await page.goto(frontendUrl, { waitUntil: 'domcontentloaded' })
      await page.locator('input[autocomplete="username"]').fill(username)
      await page.locator('input[autocomplete="current-password"]').fill(password)
      await page.getByRole('button', { name: '登录' }).click()
      await createDoctorOrderInBrowser(page)

      await page.evaluate(() => {
        for (const key of Object.keys(localStorage)) {
          if (key.startsWith('doctor-order-upload:')) {
            localStorage.removeItem(key)
          }
        }
      })
      await page.getByTestId('doctor-upload-file-input').setInputFiles(filePath)
      await expect(page.getByTestId('doctor-upload-progress')).toContainText('已选择', { timeout: 30_000 })
      await page.getByTestId('doctor-upload-bind-button').click()
      await page.getByText(/附件分片上传失败|Failed to fetch/).waitFor({ timeout: 30_000 })

      const interruptedSession = await loadBrowserResumeSession(page)
      expect(interruptedSession, 'missing doctor-order-upload: localStorage session after interrupted upload').not.toBeNull()
      const interruptedFileId = interruptedSession.session.file_id
      const interruptedUploadId = interruptedSession.session.upload_id
      expect(interruptedSession.session.completed_parts).toHaveLength(1)
      await assertMultipartStatus(interruptedFileId, interruptedUploadId, token)

      await page.getByTestId('doctor-upload-bind-button').click()
      const completedTag = page.getByTestId('doctor-upload-completed-file-id').last()
      await completedTag.waitFor({ timeout: timeoutMs })
      const completedText = await completedTag.textContent()
      const completedFileId = Number(completedText?.match(/\d+/)?.[0])
      expect(completedFileId).toBe(interruptedFileId)
      await expect(page.getByTestId('doctor-upload-progress')).toContainText('上传完成')
      await assertFileReadable(interruptedFileId, token)

      const completedSession = await loadBrowserResumeSession(page)
      expect(completedSession).toBeNull()
      console.log(`task 9D.10 interrupted resume smoke ok: file_id=${interruptedFileId}, put_count=${putCount}`)
    } finally {
      await fs.rm(dir, { recursive: true, force: true })
    }
  })
})
