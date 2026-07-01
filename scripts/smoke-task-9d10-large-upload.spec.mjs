import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { expect, test } from '@playwright/test'

const frontendUrl = process.env.TASK9D10_FRONTEND_URL ?? 'http://127.0.0.1:5173'
const username = process.env.TASK9D10_DOCTOR_USERNAME ?? 'doctor'
const password = process.env.TASK9D10_DOCTOR_PASSWORD ?? 'change-me-doctor'
const uploadSizeBytes = Number(process.env.TASK9D10_UPLOAD_SIZE_BYTES ?? 105 * 1024 * 1024)
const timeoutMs = Number(process.env.TASK9D10_UPLOAD_TIMEOUT_MS ?? 240_000)
const browserChannel = process.env.TASK9D10_BROWSER_CHANNEL ?? 'chrome'

if (!Number.isFinite(uploadSizeBytes) || uploadSizeBytes <= 0) {
  throw new Error('TASK9D10_UPLOAD_SIZE_BYTES must be a positive number')
}

const uploadSizeMb = uploadSizeBytes / 1024 / 1024

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

async function createSparseUploadFile() {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'task9d10-large-upload-'))
  const filePath = path.join(dir, `task9d10-100MB-smoke-${Date.now()}.stl`)
  const header = Buffer.from('solid task9d10\nendsolid task9d10\n')
  const handle = await fs.open(filePath, 'w')
  try {
    await handle.truncate(uploadSizeBytes)
    await handle.write(header, 0, header.length, 0)
    await handle.write(Buffer.from([10]), 0, 1, uploadSizeBytes - 1)
  } finally {
    await handle.close()
  }
  return { dir, filePath }
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

async function assertFileReadable(fileId, token) {
  const response = await fetch(`${frontendUrl}/files/${fileId}/preview-url`, {
    headers: { Authorization: `Bearer ${token}` }
  })
  if (!response.ok) {
    throw new Error(`uploaded file ${fileId} is not readable after browser upload: ${response.status}`)
  }
}

async function ensureDoctorOrder(page) {
  await page.getByRole('menuitem', { name: '医生订单' }).click()
  await page.waitForSelector('text=医生订单工作台', { timeout: 30_000 })
  await page.getByRole('textbox', { name: /患者姓名/ }).fill(`Task9D10-${Date.now()}`)
  await page.getByRole('textbox', { name: /牙位/ }).fill('16')
  await page.getByTestId('doctor-order-create-button').click()
  await page.getByTestId('doctor-order-create-result').waitFor({ timeout: 30_000 })
}

test.use({ channel: browserChannel })

test.describe('Task 9D.10 large browser upload smoke', () => {
  test.setTimeout(timeoutMs + 60_000)

  test('uploads a 100MB+ doctor attachment through the browser multipart path', async ({ page }) => {
    if (uploadSizeBytes < 100 * 1024 * 1024) {
      console.warn(`warning: upload size is ${uploadSizeMb.toFixed(1)}MB; formal Task 9D.10 smoke should use 100MB+`)
    }

    await assertReachable()
    const apiSession = await apiLogin()
    const { dir, filePath } = await createSparseUploadFile()
    page.setDefaultTimeout(timeoutMs)

    try {
      await page.goto(frontendUrl, { waitUntil: 'domcontentloaded' })
      await page.locator('input[autocomplete="username"]').fill(username)
      await page.locator('input[autocomplete="current-password"]').fill(password)
      await page.getByRole('button', { name: '登录' }).click()
      await ensureDoctorOrder(page)

      await page.getByTestId('doctor-upload-file-input').setInputFiles(filePath)
      await expect(page.getByTestId('doctor-upload-progress')).toContainText('已选择', { timeout: 30_000 })
      await page.getByTestId('doctor-upload-bind-button').click()

      const completedTag = page.getByTestId('doctor-upload-completed-file-id').last()
      await completedTag.waitFor({ timeout: timeoutMs })
      const completedText = await completedTag.textContent()
      const fileId = Number(completedText?.match(/\d+/)?.[0])
      expect(Number.isFinite(fileId), `cannot parse completed file_id from "${completedText}"`).toBe(true)
      await expect(page.getByTestId('doctor-upload-progress')).toContainText('上传完成')
      await assertFileReadable(fileId, apiSession.accessToken)
      console.log(`task 9D.10 100MB+ browser upload smoke ok: file_id=${fileId}, size=${uploadSizeMb.toFixed(1)}MB`)
    } finally {
      await fs.rm(dir, { recursive: true, force: true })
    }
  })
})
