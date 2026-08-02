#!/usr/bin/env node
// 按《动态下单表最终版》为产品配置中心导入正式材料、牙色与产品-材料绑定。
//
// 只写材料层：分类与产品由 GOAL-031 已录入，本脚本不新增、不修改、不停用任何产品。
// 走 createVersion -> 逐项 POST -> preview 的既有草稿链路，不绕过版本快照与审计。
// 默认只建草稿并输出 preview 摘要，不自动发布；发布需显式加 --publish。
//
// 用法：
//   node scripts/import-catalog-formal-values.mjs --dry-run        统计将写入的数量，不落库
//   node scripts/import-catalog-formal-values.mjs                  建草稿并导入，不发布
//   node scripts/import-catalog-formal-values.mjs --publish=4      发布已有草稿 #4，不重新导入
// 环境变量：
//   CATALOG_BASE_URL   默认 http://127.0.0.1:15173
//   CATALOG_USERNAME   默认 admin
//   CATALOG_PASSWORD   默认 change-me-admin

import fs from 'node:fs'
import path from 'node:path'

const baseUrl = process.env.CATALOG_BASE_URL ?? 'http://127.0.0.1:15173'
const username = process.env.CATALOG_USERNAME ?? 'admin'
const password = process.env.CATALOG_PASSWORD ?? 'change-me-admin'
const publishArg = process.argv.find((arg) => arg.startsWith('--publish='))
const publishVersionId = publishArg ? Number(publishArg.split('=')[1]) : null
const dryRun = process.argv.includes('--dry-run')

if (process.argv.includes('--publish')) {
  console.error('--publish 需要指定草稿号，例如 --publish=4；不带版本号会误建新草稿。')
  process.exit(1)
}

const dataPath = path.resolve('scripts/catalog-formal-values.json')
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'))

let token = ''
const stats = { materials: 0, colors: 0, bindings: 0, skipped: [] }

async function api(pathname, options = {}) {
  const response = await fetch(`${baseUrl}${pathname}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers ?? {})
    }
  })
  const text = await response.text()
  if (!response.ok) {
    throw new Error(`${options.method ?? 'GET'} ${pathname} -> ${response.status}: ${text.slice(0, 300)}`)
  }
  return text ? JSON.parse(text) : null
}

// 材料 code 必须匹配 [A-Z][A-Z0-9_]{1,95}，中文名无法直接用，按稳定序号派生。
function materialCode(prefix, index) {
  return `${prefix}_${String(index).padStart(3, '0')}`
}

// 牙色 code 允许更宽，但仍统一大写并替换非法字符，保证可读且稳定。
function colorCode(raw) {
  return raw.toUpperCase().replace(/[^A-Z0-9]+/g, '_').replace(/^_+|_+$/g, '')
}

async function main() {
  console.log(`目标环境：${baseUrl}`)
  console.log(`数据来源：${path.basename(dataPath)}（${data._source.document}）`)
  console.log(`口径：${data._source.pricing}`)

  const login = await api('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password, portal: 'ADMIN' })
  })
  token = login.accessToken

  if (publishVersionId) {
    await api(`/admin/catalog/versions/${publishVersionId}/publish`, {
      method: 'POST',
      body: JSON.stringify({ effective_at: null })
    })
    console.log(`草稿 #${publishVersionId} 已发布。`)
    return
  }

  const versions = (await api('/admin/catalog/versions')).data
  const active = versions.find((v) => v.publication_status === 'ACTIVE')
  if (!active) {
    throw new Error('未找到 ACTIVE 配置版本，无法基于其建立草稿')
  }
  console.log(`基线版本：#${active.config_version_id} ${active.version_name}`)

  if (dryRun) {
    const materialCount = data.shared_option_materials.length
      + Object.entries(data.product_materials).filter(([k]) => !k.startsWith('_')).reduce((n, [, v]) => n + v.length, 0)
      + Object.entries(data.unbound_materials).filter(([k]) => !k.startsWith('_')).reduce((n, [, v]) => n + v.length, 0)
    const colorCount = data.shared_option_materials.reduce((n, m) => n + (m.colors?.length ?? 0), 0)
    console.log(`\n[dry-run] 将创建 ${materialCount} 个材料、${colorCount} 个色号，不写入任何数据。`)
    return
  }

  const version = (await api('/admin/catalog/versions', {
    method: 'POST',
    body: JSON.stringify({
      version_name: `客户正式材料与牙色 ${new Date().toISOString().slice(0, 10)}`,
      based_on_version_id: active.config_version_id
    })
  })).data
  const versionId = version.config_version_id
  console.log(`已创建草稿版本 #${versionId}`)

  // 草稿继承基线的产品，按 display_name 建索引供绑定使用。
  const preview = (await api(`/admin/catalog/versions/${versionId}/preview`)).data
  const productByName = new Map((preview.products ?? []).map((p) => [p.display_name, p.product_id]))
  console.log(`草稿继承产品 ${productByName.size} 个`)

  const materialIdByCode = new Map()

  async function createMaterial({ code, name, family, brand, spec, sort }) {
    const created = (await api(`/admin/catalog/versions/${versionId}/materials`, {
      method: 'POST',
      body: JSON.stringify({
        material_code: code,
        display_name: name,
        material_family: family ?? null,
        brand_name: brand ?? null,
        specification: spec ?? null,
        sort_order: sort ?? null
      })
    })).data
    materialIdByCode.set(code, created.material_id)
    stats.materials += 1
    return created.material_id
  }

  // 1. 共用选项材料（牙色体系、抛光、边缘、义齿牙品牌、基台类型、螺丝开口位置）
  for (const [i, m] of data.shared_option_materials.entries()) {
    const materialId = await createMaterial({ ...m, sort: (i + 1) * 10 })
    for (const [j, raw] of (m.colors ?? []).entries()) {
      await api(`/admin/catalog/versions/${versionId}/material-colors`, {
        method: 'POST',
        body: JSON.stringify({
          material_id: materialId,
          semantic_type: 'TOOTH_SHADE',
          color_code: colorCode(raw),
          display_name: raw,
          sort_order: (j + 1) * 10
        })
      })
      stats.colors += 1
    }
  }

  // 2. 各产品的主材料，建材料并绑定到对应产品
  let seq = 0
  for (const [productName, materials] of Object.entries(data.product_materials)) {
    if (productName.startsWith('_')) continue
    const productId = productByName.get(productName)
    if (!productId) {
      stats.skipped.push(`产品未找到：${productName}`)
      continue
    }
    for (const [i, name] of materials.entries()) {
      seq += 1
      const code = materialCode('MAT', seq)
      const materialId = await createMaterial({ code, name, family: 'PRIMARY_MATERIAL', sort: (i + 1) * 10 })
      await api(`/admin/catalog/versions/${versionId}/material-bindings`, {
        method: 'POST',
        body: JSON.stringify({
          product_id: productId,
          material_id: materialId,
          selection_group_code: 'PRIMARY_MATERIAL',
          required: true,
          selection_mode: 'SINGLE',
          sort_order: (i + 1) * 10
        })
      })
      stats.bindings += 1
    }
  }

  // 3. 共用选项到产品的绑定
  for (const binding of data.shared_bindings) {
    for (const productName of binding.products) {
      const productId = productByName.get(productName)
      if (!productId) {
        stats.skipped.push(`共用绑定的产品未找到：${productName}（组 ${binding.group}）`)
        continue
      }
      for (const [i, code] of binding.materials.entries()) {
        const materialId = materialIdByCode.get(code)
        if (!materialId) {
          stats.skipped.push(`共用绑定的材料未找到：${code}`)
          continue
        }
        await api(`/admin/catalog/versions/${versionId}/material-bindings`, {
          method: 'POST',
          body: JSON.stringify({
            product_id: productId,
            material_id: materialId,
            selection_group_code: binding.group,
            required: binding.required,
            selection_mode: binding.mode,
            sort_order: (i + 1) * 10
          })
        })
        stats.bindings += 1
      }
    }
  }

  // 4. 归属待确认的材料：只建材料，不建绑定
  for (const [group, materials] of Object.entries(data.unbound_materials)) {
    if (group.startsWith('_')) continue
    for (const [i, name] of materials.entries()) {
      seq += 1
      await createMaterial({ code: materialCode('MAT', seq), name, family: `UNBOUND_${group}`, sort: (i + 1) * 10 })
    }
  }

  const after = (await api(`/admin/catalog/versions/${versionId}/preview`)).data
  console.log('\n=== 导入结果 ===')
  console.log(`材料 ${stats.materials} 个 / 色号 ${stats.colors} 个 / 绑定 ${stats.bindings} 条`)
  console.log(`草稿 #${versionId} 现有：产品 ${after.products?.length ?? 0}、材料 ${after.materials?.length ?? 0}、色号 ${after.material_colors?.length ?? 0}、材料绑定 ${after.material_bindings?.length ?? 0}`)
  if (stats.skipped.length) {
    console.log(`\n跳过 ${stats.skipped.length} 项：`)
    for (const item of [...new Set(stats.skipped)]) console.log(`  - ${item}`)
  }

  console.log(`\n草稿 #${versionId} 未发布。在管理端"下单内容设置"核对无误后发布，或执行：`)
  console.log(`  node scripts/import-catalog-formal-values.mjs --publish=${versionId}`)
}

main().catch((error) => {
  console.error(`\n导入失败：${error.message}`)
  process.exitCode = 1
})
