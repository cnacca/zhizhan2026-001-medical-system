const sharedLoopbackPorts = new Set(['5173', '8080'])
const loopbackHosts = new Set(['localhost', '127.0.0.1', '[::1]', '::1'])

export function assertIsolatedSmokeTarget({
  isolatedEnv,
  isolatedEnvVariable,
  frontendUrl,
  frontendUrlVariable,
  taskLabel
}) {
  if (isolatedEnv !== 'true') {
    throw new Error(`${taskLabel} writes orders or files. Set ${isolatedEnvVariable}=true before running it.`)
  }
  if (!frontendUrl || !frontendUrl.trim()) {
    throw new Error(`${taskLabel} requires an explicit ${frontendUrlVariable} for an isolated environment.`)
  }

  let target
  try {
    target = new URL(frontendUrl)
  } catch {
    throw new Error(`${frontendUrlVariable} must be an absolute http(s) URL for an isolated environment.`)
  }

  if (!['http:', 'https:'].includes(target.protocol)) {
    throw new Error(`${frontendUrlVariable} must use http or https.`)
  }

  if (loopbackHosts.has(target.hostname.toLowerCase()) && sharedLoopbackPorts.has(target.port)) {
    throw new Error(
      `${frontendUrlVariable} must not target shared local development ${target.hostname}:${target.port}; use a dedicated isolated environment.`
    )
  }
}
