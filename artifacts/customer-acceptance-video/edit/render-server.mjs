import { createReadStream, createWriteStream, existsSync, statSync } from 'node:fs'
import { createServer } from 'node:http'
import { extname, join, normalize } from 'node:path'
import { pipeline } from 'node:stream/promises'

const root = new URL('.', import.meta.url).pathname
const port = Number(process.env.RENDER_PORT || 15177)
const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.png': 'image/png',
  '.mp3': 'audio/mpeg',
  '.webm': 'video/webm'
}

createServer(async (request, response) => {
  if (request.method === 'OPTIONS') {
    response.writeHead(204, {
      'Access-Control-Allow-Origin': 'http://127.0.0.1:15176',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    })
    response.end()
    return
  }

  if (request.method === 'POST' && request.url === '/upload') {
    await pipeline(request, createWriteStream(join(root, 'preview.webm')))
    response.writeHead(200, {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': 'http://127.0.0.1:15176'
    })
    response.end(JSON.stringify({ ok: true, path: 'preview.webm' }))
    return
  }

  const pathname = request.url === '/' ? '/render-sample.html' : request.url
  const safePath = normalize(pathname.split('?')[0]).replace(/^(\.\.(\/|\\|$))+/, '')
  const filePath = join(root, safePath)
  if (!filePath.startsWith(root) || !existsSync(filePath) || !statSync(filePath).isFile()) {
    response.writeHead(404)
    response.end('Not found')
    return
  }

  response.writeHead(200, {
    'Content-Type': mimeTypes[extname(filePath)] || 'application/octet-stream',
    'Cache-Control': 'no-store'
  })
  createReadStream(filePath).pipe(response)
}).listen(port, '127.0.0.1', () => {
  console.log(`Renderer ready at http://127.0.0.1:${port}`)
})
