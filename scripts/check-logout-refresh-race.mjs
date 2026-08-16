import assert from 'node:assert/strict'
import { captureRefreshTokenForLogout } from '../frontend/src/utils/logoutRefreshCoordination.js'

function deferred() {
  let resolve
  let reject
  const promise = new Promise((resolvePromise, rejectPromise) => {
    resolve = resolvePromise
    reject = rejectPromise
  })
  return { promise, resolve, reject }
}

const rotation = deferred()
let currentToken = 'old-refresh-token'
const rotating = rotation.promise.then(() => { currentToken = 'rotated-refresh-token' })
let captureFinished = false
const capturedAfterRotation = captureRefreshTokenForLogout(rotating, () => currentToken, 500)
  .finally(() => { captureFinished = true })
await Promise.resolve()
assert.equal(captureFinished, false, 'logout must wait for an active refresh rotation')
rotation.resolve()
assert.equal(await capturedAfterRotation, 'rotated-refresh-token', 'logout must revoke the latest rotated token')

const timeoutStartedAt = Date.now()
const capturedAfterTimeout = await captureRefreshTokenForLogout(new Promise(() => {}), () => 'fallback-token', 20)
assert.equal(capturedAfterTimeout, 'fallback-token')
assert.ok(Date.now() - timeoutStartedAt < 500, 'a stuck refresh must not block local logout indefinitely')

const rejected = deferred()
const capturedAfterFailurePromise = captureRefreshTokenForLogout(rejected.promise, () => 'token-after-failure', 500)
rejected.reject(new Error('controlled refresh failure'))
assert.equal(await capturedAfterFailurePromise, 'token-after-failure')

console.log('logout/refresh 可控并发检查通过')
