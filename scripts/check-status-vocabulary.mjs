// 静态校验状态值口径：种子 SQL 写入 orders.internal_status / external_status /
// design_draft.draft_status 的字面量，必须落在后端枚举的合法值内。
//
// 这类错误不会在运行期抛异常——数据库列是 varchar，写什么都收——只会让界面
// 悄悄少一块数据。2026-08-02 一次排查中命中三例：设计稿状态第三种错误拼写、
// 对外值写进内部列、内外值颠倒。
//
// 口径表见 docs/development/status-vocabulary.md。

import fs from 'node:fs'
import path from 'node:path'

const failures = []

const read = (file) => {
  if (!fs.existsSync(file)) {
    failures.push(`${file} missing`)
    return ''
  }
  return fs.readFileSync(file, 'utf8')
}

// 从后端枚举源码解析合法值，避免在本脚本里复制一份会过期的清单。
const parseEnum = (file) => {
  const content = read(file)
  const body = content.slice(content.indexOf('{') + 1)
  const values = new Set()
  // 枚举常量后可能跟 (、, 、; 或直接换行接 }（最后一个常量无尾逗号）。
  for (const match of body.matchAll(/^\s{4}([A-Z][A-Z0-9_]*)\s*(?:[(,;]|$)/gm)) {
    values.add(match[1])
  }
  if (values.size === 0) failures.push(`${file}: no enum constants parsed`)
  return values
}

const statusDir = 'backend/platform-server/src/main/java/com/yuri/aiorder/order/status'
const internalStatuses = parseEnum(path.join(statusDir, 'InternalOrderStatus.java'))
const externalStatuses = parseEnum(path.join(statusDir, 'ExternalOrderStatus.java'))

// 设计稿状态没有独立枚举，取自迁移与运行期实际取值；口径表同步维护。
const draftStatuses = new Set([
  'PENDING_INTERNAL_REVIEW',
  'CS_REJECTED',
  'PENDING_DOCTOR',
  'DOCTOR_CONFIRMED',
  'DOCTOR_REJECTED',
  'SUPERSEDED'
])

// 已登记的偏差：写在这里表示"已知且待产品决策"，而不是被静默放过。
// 每一条都必须在 docs/development/status-vocabulary.md 的"已知偏差"章节有对应说明。
const acceptedDeviations = new Set([
  "scripts/seed-doctor-portal-demo-data.sql:external:'NEEDS_INFO'",
  "scripts/seed-doctor-portal-demo-data.sql:external:'DRAFT'"
])

const seedFiles = fs
  .readdirSync('scripts')
  .filter((name) => name.endsWith('.sql'))
  .map((name) => path.join('scripts', name))

// orders 的两列按 INSERT 里 "'内部','外部'" 的相邻字面量成对出现，直接扫成对值。
const pairPattern = /'([A-Z][A-Z0-9_]*)'\s*,\s*'([A-Z][A-Z0-9_]*)'\s*,\s*(?:DATE_SUB|DATE_FORMAT|'\d{4}-)/g

for (const file of seedFiles) {
  const content = read(file)

  for (const match of content.matchAll(pairPattern)) {
    const [, internal, external] = match
    // 只在两个值至少有一个像订单状态时才判定，避免误伤其它成对字面量。
    const looksLikeOrderStatus = internalStatuses.has(internal) || externalStatuses.has(external)
      || internalStatuses.has(external) || externalStatuses.has(internal)
    if (!looksLikeOrderStatus) continue

    if (!internalStatuses.has(internal)) {
      const key = `${file}:internal:'${internal}'`
      if (!acceptedDeviations.has(key)) {
        failures.push(`${file}: '${internal}' is not a valid InternalOrderStatus (internal_status column)`)
      }
    }
    if (!externalStatuses.has(external)) {
      const key = `${file}:external:'${external}'`
      if (!acceptedDeviations.has(key)) {
        failures.push(`${file}: '${external}' is not a valid ExternalOrderStatus (external_status column)`)
      }
    }
    // 内外颠倒：两个值各自合法但位置互换，单看值域检查不出来。
    if (externalStatuses.has(internal) && !internalStatuses.has(internal)) {
      failures.push(`${file}: '${internal}' is an external status placed in the internal_status column`)
    }
  }

  // 设计稿状态：扫 design_draft 相关语句里的 draft_status 字面量。
  if (content.includes('design_draft')) {
    // 只认设计稿域特有的前缀，避免误伤 DOCTOR_PORTAL_MOCK 之类的种子标记；
    // CS_REJECTED 与订单内部状态同名，交由订单域检查，这里不重复判定。
    for (const match of content.matchAll(/'(PENDING_DOCTOR[A-Z_]*|DOCTOR_CONFIRMED|DOCTOR_REJECTED|SUPERSEDED)'/g)) {
      const value = match[1]
      if (!draftStatuses.has(value)) {
        failures.push(`${file}: '${value}' is not a valid design_draft.draft_status`)
      }
    }
  }
}

// 口径表必须存在且写明三层与两个域的边界，否则本检查失去参照。
const vocabulary = read('docs/development/status-vocabulary.md')
for (const fragment of [
  'InternalOrderStatus',
  'ExternalOrderStatus',
  '三个层次，不要混用',
  'PENDING_DOCTOR_CONFIRM` 在订单域仍然合法',
  'PENDING_DOCTOR_CONFIRMATION'
]) {
  if (!vocabulary.includes(fragment)) {
    failures.push(`docs/development/status-vocabulary.md missing required text: ${fragment}`)
  }
}

if (failures.length) {
  console.error('check:status-vocabulary failed:')
  for (const failure of failures) console.error(`  - ${failure}`)
  console.error('\n口径表：docs/development/status-vocabulary.md')
  process.exit(1)
}

console.log(`check:status-vocabulary passed (internal ${internalStatuses.size} / external ${externalStatuses.size} / draft ${draftStatuses.size})`)
