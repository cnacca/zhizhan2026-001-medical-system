import { spawnSync } from 'node:child_process'
import crypto from 'node:crypto'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { assertIsolatedSmokeTarget } from './assert-isolated-smoke-target.mjs'

const frontendUrl = (process.env.DEMO_FRONTEND_URL ?? 'http://127.0.0.1:15173').replace(/\/$/, '')
const archivePath = path.resolve(process.env.DEMO_STL_ARCHIVE ?? process.argv[2] ?? '')
const runtimeDir = path.resolve('.demo-runtime')
const manifestPath = path.join(runtimeDir, '1013-stl-manifest.json')
const expectedFiles = new Set([
  'Mandibular Anatomy (2)(1).stl',
  'Maxillary Anatomy (2).stl',
  'Normal Bite (2).stl'
])

const credentials = {
  DOCTOR: ['doctor', 'change-me-doctor'],
  CS: ['cs', 'change-me-cs'],
  PRODUCTION: ['worker', 'change-me-worker'],
  ADMIN: ['admin', 'change-me-admin']
}

function assert(condition, message) {
  if (!condition) throw new Error(message)
}

function sha256(buffer) {
  return crypto.createHash('sha256').update(buffer).digest('hex')
}

function runBsdtar(args) {
  const result = spawnSync('/usr/bin/bsdtar', args, { encoding: 'utf8' })
  if (result.status !== 0) throw new Error(`bsdtar failed: ${result.stderr || result.stdout}`)
  return result.stdout
}

function validateArchive() {
  assert(archivePath && archivePath !== path.parse(archivePath).root, '请通过 DEMO_STL_ARCHIVE 或命令参数提供1013.rar路径')
  assert(fs.existsSync(archivePath) && fs.statSync(archivePath).isFile(), `压缩包不存在：${archivePath}`)
  const entries = runBsdtar(['-tf', archivePath]).split(/\r?\n/).filter(Boolean)
  assert(entries.length > 0, '压缩包为空')
  for (const entry of entries) {
    assert(!path.isAbsolute(entry) && !entry.split('/').includes('..'), `压缩包包含不安全路径：${entry}`)
  }
  const stlNames = entries.filter((entry) => entry.toLowerCase().endsWith('.stl')).map((entry) => path.basename(entry))
  assert(stlNames.length === 3, `压缩包应包含3个STL，实际 ${stlNames.length} 个`)
  assert(stlNames.every((name) => expectedFiles.has(name)), `STL文件名不符合1013基线：${stlNames.join('、')}`)
}

function walkFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(directory, entry.name)
    return entry.isDirectory() ? walkFiles(entryPath) : [entryPath]
  })
}

function loadStlFiles(tempDir) {
  runBsdtar(['-xf', archivePath, '-C', tempDir])
  return walkFiles(tempDir)
    .filter((filePath) => filePath.toLowerCase().endsWith('.stl'))
    .map((filePath) => {
      const content = fs.readFileSync(filePath)
      assert(content.length >= 84, `${path.basename(filePath)} 不是有效二进制STL`)
      const triangleCount = content.readUInt32LE(80)
      assert(content.length === 84 + triangleCount * 50, `${path.basename(filePath)} 的STL长度与三角面数量不一致`)
      return {
        name: path.basename(filePath),
        content,
        size: content.length,
        sha256: sha256(content),
        triangleCount
      }
    })
    .sort((left, right) => left.name.localeCompare(right.name, 'en'))
}

async function apiFetch(pathname, token, options = {}) {
  const response = await fetch(`${frontendUrl}${pathname}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers ?? {})
    }
  })
  const text = await response.text()
  const payload = text ? JSON.parse(text) : null
  if (!response.ok) throw new Error(`${options.method ?? 'GET'} ${pathname} failed with ${response.status}: ${text}`)
  return payload
}

async function login(portal) {
  const [username, password] = credentials[portal]
  return apiFetch('/api/auth/login', null, {
    method: 'POST',
    body: JSON.stringify({ username, password, portal })
  })
}

async function findCompletedDemoOrder(adminToken) {
  const payload = await apiFetch(`/orders?page=1&size=100&keyword=${encodeURIComponent('演示-07-已完成-')}`, adminToken)
  const order = payload.data.items.find((item) =>
    item.form_data?.demo_scenario === '07-已完成'
      || item.form_data?.acceptance_marker === 'DEMO_DATA_V1:07-已完成')
  assert(order, '隔离演示库中没有找到07-已完成脱敏订单，请先运行 npm run demo:seed')
  assert(order.internal_status === 'COMPLETED' && order.external_status === 'COMPLETED', '目标演示订单不是已完成状态')
  return order
}

async function signedFileBuffer(fileId, token) {
  const signed = await apiFetch(`/files/${fileId}/download-url`, token)
  const response = await fetch(signed.data.download_url)
  assert(response.ok, `文件${fileId}签名下载失败：HTTP ${response.status}`)
  return Buffer.from(await response.arrayBuffer())
}

async function uploadFile(orderId, token, file) {
  const tokenPayload = await apiFetch('/files/upload-token', token, {
    method: 'POST',
    body: JSON.stringify({
      order_id: orderId,
      source_type: 'ORDER_ATTACHMENT',
      visibility: 'DOCTOR',
      original_filename: file.name,
      content_type: 'model/stl',
      file_size: file.size
    })
  })
  const uploadResponse = await fetch(tokenPayload.data.upload_url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'model/stl',
      'Content-Length': String(file.size)
    },
    body: file.content
  })
  assert(uploadResponse.ok, `${file.name}上传MinIO失败：HTTP ${uploadResponse.status}`)
  const completed = await apiFetch(`/files/${tokenPayload.data.file_id}/complete`, token, { method: 'POST' })
  assert(completed.data.upload_status === 'COMPLETED', `${file.name}未完成上传登记`)
  return completed.data.file_id
}

async function ensureFiles(orderId, doctorToken, stlFiles) {
  const current = (await apiFetch(`/orders/${orderId}/files`, doctorToken)).data
  const fileIds = []
  for (const stlFile of stlFiles) {
    const candidates = current.filter((item) => item.original_filename === stlFile.name && item.file_size === stlFile.size)
    let matched = null
    for (const candidate of candidates) {
      const downloaded = await signedFileBuffer(candidate.file_id, doctorToken)
      if (sha256(downloaded) === stlFile.sha256) {
        matched = candidate
        break
      }
    }
    if (matched) {
      console.log(`已存在，跳过上传：${stlFile.name}（file_id=${matched.file_id}）`)
      fileIds.push(matched.file_id)
      continue
    }
    assert(candidates.length === 0, `${stlFile.name}存在同名同大小但哈希不同的文件，停止导入以避免混淆`)
    const fileId = await uploadFile(orderId, doctorToken, stlFile)
    console.log(`上传完成：${stlFile.name}（file_id=${fileId}）`)
    fileIds.push(fileId)
  }
  return fileIds
}

async function verifyRole(portal, token, orderId, stlFiles) {
  const files = (await apiFetch(`/orders/${orderId}/files`, token)).data
  const matched = stlFiles.map((expected) => {
    const file = files.find((item) =>
      item.original_filename === expected.name
        && item.file_size === expected.size
        && item.source_type === 'ORDER_ATTACHMENT'
        && item.upload_status === 'COMPLETED')
    assert(file, `${portal}端没有读取到 ${expected.name}`)
    return file
  })
  for (const file of matched) {
    const signed = await apiFetch(`/files/${file.file_id}/preview-url`, token)
    const rangeResponse = await fetch(signed.data.preview_url, { headers: { Range: 'bytes=0-83' } })
    assert([200, 206].includes(rangeResponse.status), `${portal}端无法读取 ${file.original_filename} 的签名预览`)
    const rangeBytes = await rangeResponse.arrayBuffer()
    assert(rangeBytes.byteLength >= 84, `${portal}端预览响应不完整：${file.original_filename}`)
  }
  return matched.map((file) => file.file_id)
}

async function main() {
  assertIsolatedSmokeTarget({
    isolatedEnv: process.env.DEMO_ISOLATED_ENV,
    isolatedEnvVariable: 'DEMO_ISOLATED_ENV',
    frontendUrl,
    frontendUrlVariable: 'DEMO_FRONTEND_URL',
    taskLabel: '1013 demo STL import'
  })
  validateArchive()
  await apiFetch('/api/bootstrap/health')
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ai-order-1013-import-'))
  try {
    const stlFiles = loadStlFiles(tempDir)
    const sessions = Object.fromEntries(await Promise.all(
      Object.keys(credentials).map(async (portal) => [portal, await login(portal)])))
    const order = await findCompletedDemoOrder(sessions.ADMIN.accessToken)
    const fileIds = await ensureFiles(order.order_id, sessions.DOCTOR.accessToken, stlFiles)
    const roleVisibility = {}
    for (const portal of Object.keys(credentials)) {
      roleVisibility[portal] = await verifyRole(portal, sessions[portal].accessToken, order.order_id, stlFiles)
    }
    const doctorFiles = (await apiFetch(`/orders/${order.order_id}/files`, sessions.DOCTOR.accessToken)).data
    const verifiedFiles = []
    for (const stlFile of stlFiles) {
      const file = doctorFiles.find((item) => fileIds.includes(item.file_id) && item.original_filename === stlFile.name)
      assert(file, `导入后无法定位 ${stlFile.name}`)
      const downloaded = await signedFileBuffer(file.file_id, sessions.DOCTOR.accessToken)
      assert(sha256(downloaded) === stlFile.sha256, `${stlFile.name}从MinIO取回后的SHA-256不一致`)
      verifiedFiles.push({
        file_id: file.file_id,
        name: stlFile.name,
        size: stlFile.size,
        sha256: stlFile.sha256,
        triangle_count: stlFile.triangleCount,
        source_type: file.source_type,
        visibility: file.visibility,
        upload_status: file.upload_status
      })
    }
    fs.mkdirSync(runtimeDir, { recursive: true })
    fs.writeFileSync(manifestPath, `${JSON.stringify({
      version: 1,
      environment: frontendUrl,
      imported_at: new Date().toISOString(),
      archive_sha256: sha256(fs.readFileSync(archivePath)),
      order_id: order.order_id,
      order_no: order.order_no,
      scenario: '07-已完成',
      files: verifiedFiles,
      role_visibility: roleVisibility
    }, null, 2)}\n`)
    console.log(`1013真实STL已绑定脱敏演示订单：${order.order_no}（order_id=${order.order_id}）`)
    console.log(`四端读取与签名预览通过，清单：${manifestPath}`)
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true })
  }
}

main().catch((error) => {
  console.error(error.stack ?? error.message)
  process.exit(1)
})
