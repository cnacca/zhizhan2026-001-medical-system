#!/usr/bin/env node

import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import { pathToFileURL } from 'node:url'

const documentationFiles = new Set([
  'README.md',
  'STATUS.md',
  'DECISIONS.md',
  'PROJECT.md',
  'acceptance.json'
])

const documentationPrefixes = [
  'docs/',
  'goals/',
  'tasks/'
]

function normalizeFiles(files) {
  return [...new Set(files.map((file) => String(file).trim()).filter(Boolean))]
}

function isDocumentationFile(file) {
  return documentationFiles.has(file)
    || documentationPrefixes.some((prefix) => file.startsWith(prefix))
    || (file.startsWith('frontend/') && file.endsWith('.md'))
}

function isFrontendRuntimeFile(file) {
  return file.startsWith('frontend/') && !file.endsWith('.md')
}

export function classifyProductionRelease(files) {
  const changedFiles = normalizeFiles(files)
  const frontendFiles = changedFiles.filter(isFrontendRuntimeFile)
  const unsafeFiles = changedFiles.filter((file) => {
    return !isFrontendRuntimeFile(file) && !isDocumentationFile(file)
  })

  if (changedFiles.length === 0) {
    return {
      mode: 'full',
      reason: 'no changed files were detected; falling back to the full release',
      changedFiles,
      unsafeFiles
    }
  }

  if (frontendFiles.length === 0) {
    return {
      mode: 'full',
      reason: 'the change is not a frontend runtime release',
      changedFiles,
      unsafeFiles
    }
  }

  if (unsafeFiles.length > 0) {
    return {
      mode: 'full',
      reason: `full release required by: ${unsafeFiles.join(', ')}`,
      changedFiles,
      unsafeFiles
    }
  }

  return {
    mode: 'frontend',
    reason: 'only frontend runtime files and release documentation changed',
    changedFiles,
    unsafeFiles: []
  }
}

function parseArgs(argv) {
  const result = {}
  for (let index = 0; index < argv.length; index += 1) {
    const name = argv[index]
    if (!name.startsWith('--')) continue
    const value = argv[index + 1]
    if (!value || value.startsWith('--')) {
      throw new Error(`${name} requires a value`)
    }
    result[name.slice(2)] = value
    index += 1
  }
  return result
}

function writeGithubOutput(path, result) {
  if (!path) return
  fs.appendFileSync(path, [
    `mode=${result.mode}`,
    `changed_count=${result.changedFiles.length}`,
    `reason=${result.reason}`,
    ''
  ].join('\n'))
}

function main() {
  const args = parseArgs(process.argv.slice(2))
  const base = args.base
  const head = args.head
  if (!/^[0-9a-f]{40}$/.test(base ?? '') || !/^[0-9a-f]{40}$/.test(head ?? '')) {
    throw new Error('--base and --head must be full lowercase Git SHAs')
  }

  const output = execFileSync('git', ['diff', '--name-only', base, head], {
    encoding: 'utf8'
  })
  const result = classifyProductionRelease(output.split('\n'))
  writeGithubOutput(args['github-output'], result)

  console.log(`production release mode: ${result.mode}`)
  console.log(`reason: ${result.reason}`)
  console.log(`changed files: ${result.changedFiles.length}`)
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    main()
  } catch (error) {
    console.error(`production release mode detection failed: ${error.message}`)
    process.exit(1)
  }
}
