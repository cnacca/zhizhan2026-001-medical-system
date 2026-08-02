import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const core = path.join(root, 'vendor', 'ruoyi-vue-pro-core')

const requiredFiles = [
  'UPSTREAM.lock',
  'README.md',
  'LICENSE.upstream',
  'pom.xml',
  'lombok.config',
  'yudao-dependencies/pom.xml',
  'yudao-framework/pom.xml',
  'yudao-module-infra/pom.xml',
  'yudao-module-system/pom.xml',
  'yudao-server/pom.xml',
  'yudao-server/src/main/resources/application.yaml',
  'sql/mysql/quartz.sql',
  'sql/mysql/ruoyi-vue-pro-schema-only.sql',
  'goals/GOAL-024-ruoyi-core-foundation-20260724.md',
  'tasks/TASK-025-ruoyi-core-foundation-20260724.md',
  'docs/development/ruoyi-core-adoption-boundary-20260724.md',
]

for (const file of requiredFiles) {
  const absolute = file.startsWith('vendor/')
    ? path.join(root, file)
    : file.startsWith('goals/') || file.startsWith('tasks/') || file.startsWith('docs/')
      ? path.join(root, file)
      : path.join(core, file)
  if (!fs.existsSync(absolute)) {
    throw new Error(`Missing required file: ${file}`)
  }
}

const lock = fs.readFileSync(path.join(core, 'UPSTREAM.lock'), 'utf8')
for (const expected of [
  'repository=https://github.com/YunaiV/ruoyi-vue-pro',
  'branch=master-jdk17',
  'commit=ec3f7cbf73e88514a70a6b59d365092ee470603d',
  'archive_sha256=d8deecbdc42f7680e17a072460bfee6213b25e9f3605c1b56bc182a5d9cc98e8',
  'license=MIT',
  'spring_boot_version=3.5.15',
]) {
  if (!lock.includes(expected)) {
    throw new Error(`UPSTREAM.lock is missing: ${expected}`)
  }
}

const lombokConfig = fs.readFileSync(path.join(core, 'lombok.config'), 'utf8')
for (const expected of [
  'config.stopBubbling = true',
  'lombok.accessors.chain=true',
]) {
  if (!lombokConfig.includes(expected)) {
    throw new Error(`lombok.config is missing: ${expected}`)
  }
}

const excludedModules = [
  'yudao-module-ai',
  'yudao-module-bpm',
  'yudao-module-crm',
  'yudao-module-erp',
  'yudao-module-im',
  'yudao-module-iot',
  'yudao-module-mall',
  'yudao-module-member',
  'yudao-module-mes',
  'yudao-module-mp',
  'yudao-module-pay',
  'yudao-module-report',
  'yudao-module-wms',
  'yudao-ui',
]

for (const moduleName of excludedModules) {
  if (fs.existsSync(path.join(core, moduleName))) {
    throw new Error(`Out-of-scope upstream module was imported: ${moduleName}`)
  }
}

for (const unsafeFile of [
  'yudao-server/src/main/resources/application-local.yaml',
  'yudao-server/src/main/resources/application-dev.yaml',
  'sql/mysql/ruoyi-vue-pro.sql',
]) {
  if (fs.existsSync(path.join(core, unsafeFile))) {
    throw new Error(`Unsafe upstream sample file must not be vendored: ${unsafeFile}`)
  }
}

const schema = fs.readFileSync(path.join(core, 'sql/mysql/ruoyi-vue-pro-schema-only.sql'), 'utf8')
if (/^INSERT INTO /m.test(schema)) {
  throw new Error('Schema-only SQL contains seed INSERT statements')
}

const safeConfig = fs.readFileSync(
  path.join(core, 'yudao-server/src/main/resources/application.yaml'),
  'utf8',
)
for (const expected of [
  '${RUOYI_DB_URL:}',
  '${RUOYI_DB_USERNAME:}',
  '${RUOYI_DB_PASSWORD:}',
  '${RUOYI_REDIS_PASSWORD:}',
  '${RUOYI_MYBATIS_ENCRYPTOR_PASSWORD:}',
]) {
  if (!safeConfig.includes(expected)) {
    throw new Error(`Safe application config is missing: ${expected}`)
  }
}

for (const forbidden of [
  'sk-aN6nWn3fILjrgLFT0fC4Aa60B72e4253826c77B29dC94f17',
  'AIzaSyAVoBxgoFvvte820vEQMma2LKBnC98bqMQ',
  '3TvrJ70gl2Gt6IBe7_IZT1F6i_k0iMuRtyEv4EyS',
  'i8E6iZyDvZj51JIb0tYsYfVQYOks9Cq1lgryEjFRqC79P3iJcrxEwT6Qk2QvLrLI',
]) {
  const matches = fs
    .readdirSync(core, { recursive: true })
    .filter((entry) => typeof entry === 'string')
    .filter((entry) => {
      const absolute = path.join(core, entry)
      return fs.existsSync(absolute) && fs.statSync(absolute).isFile()
    })
    .some((entry) => fs.readFileSync(path.join(core, entry), 'utf8').includes(forbidden))
  if (matches) {
    throw new Error('A known upstream example credential is present in the vendored source')
  }
}

for (const file of [
  'goals/GOAL-024-ruoyi-core-foundation-20260724.md',
  'tasks/TASK-025-ruoyi-core-foundation-20260724.md',
]) {
  const content = fs.readFileSync(path.join(root, file), 'utf8')
  if (!content.includes('Status: `completed`')) {
    throw new Error(`Expected completed GOAL-024 foundation evidence in ${file}`)
  }
}

const boundary = fs.readFileSync(
  path.join(root, 'docs/development/ruoyi-core-adoption-boundary-20260724.md'),
  'utf8',
)
for (const expected of [
  '没有改变现有业务权限结果',
  '生产审核与派工不能授予客服',
  '账号创建权限已确认由超级管理员承担',
  '逐段桥接 RuoYi 的权限、DataScope、审计和管理能力',
  '标准工时业务数据',
]) {
  if (!boundary.includes(expected)) {
    throw new Error(`Boundary document is missing: ${expected}`)
  }
}

console.log('RuoYi core foundation checks passed')
