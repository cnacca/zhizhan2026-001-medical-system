import fs from 'node:fs'

const app = fs.readFileSync('frontend/src/App.vue', 'utf8')
const controller = fs.readFileSync('backend/platform-server/src/main/java/com/yuri/aiorder/bootstrap/BootstrapAuthController.java', 'utf8')
const service = fs.readFileSync('backend/platform-server/src/main/java/com/yuri/aiorder/common/auth/RefreshTokenService.java', 'utf8')
const migration = fs.readFileSync('backend/platform-server/src/main/resources/db/migration/V12__auth_refresh_token.sql', 'utf8')
const tests = fs.readFileSync('backend/platform-server/src/test/java/com/yuri/aiorder/auth/BearerIdentityTests.java', 'utf8')
const openapi = fs.readFileSync('docs/api/openapi.yaml', 'utf8')
const envExample = fs.readFileSync('.env.example', 'utf8')

const requiredAppFragments = [
  'refreshToken',
  'refreshSession',
  'logout',
  'auth-refresh-button',
  'auth-logout-button',
  '/api/auth/refresh',
  '/api/auth/logout'
]

const requiredBackendFragments = [
  '@PostMapping("/refresh")',
  '@PostMapping("/logout")',
  'RefreshTokenService',
  'token_hash',
  'revoked_at',
  'refreshTokenCanIssueNewAccessTokenAndLogoutRevokesIt'
]

const requiredOpenApiFragments = [
  'RefreshTokenRequest',
  'refreshToken',
  'refreshExpiresAt',
  '第一增量不轮换 refreshToken',
  '等待自然过期'
]

const missing = [
  ...requiredAppFragments.filter((fragment) => !app.includes(fragment)).map((fragment) => `frontend/src/App.vue -> ${fragment}`),
  ...requiredBackendFragments
    .filter((fragment) => !controller.includes(fragment)
      && !service.includes(fragment)
      && !migration.includes(fragment)
      && !tests.includes(fragment))
    .map((fragment) => `auth refresh backend -> ${fragment}`),
  ...requiredOpenApiFragments.filter((fragment) => !openapi.includes(fragment)).map((fragment) => `docs/api/openapi.yaml -> ${fragment}`),
  ...['APP_AUTH_REFRESH_TOKEN_TTL_SECONDS'].filter((fragment) => !envExample.includes(fragment)).map((fragment) => `.env.example -> ${fragment}`)
]

if (missing.length > 0) {
  console.error('auth refresh check failed:')
  for (const item of missing) {
    console.error(`- missing ${item}`)
  }
  process.exit(1)
}

console.log('auth refresh check ok')
