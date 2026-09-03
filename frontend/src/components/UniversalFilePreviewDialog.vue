<script setup lang="ts">
import dicomParser from 'dicom-parser'
import { computed, nextTick, onBeforeUnmount, ref } from 'vue'
import StlViewerDialog from './StlViewerDialog.vue'

type PreviewKind = 'IMAGE' | 'PDF' | 'DICOM' | 'TEXT' | 'ARCHIVE' | 'ERROR'
type ArchiveEntry = {
  path: string
  uncompressed_size: number
  directory: boolean
  preview_supported: boolean
}

const props = defineProps<{
  visible: boolean
  fileId: string | number
  sourceUrl: string
  filename: string
  contentType?: string | null
  authenticatedFetch?: typeof fetch
}>()

const emit = defineEmits<{ 'update:visible': [value: boolean] }>()

const loading = ref(false)
const error = ref('')
const textPreview = ref('')
const textTruncated = ref(false)
const archiveEntries = ref<ArchiveEntry[]>([])
const archiveTruncated = ref(false)
const activeEntry = ref<ArchiveEntry | null>(null)
const activeEntryUrl = ref('')
const activeEntryKind = ref<PreviewKind | 'MODEL' | null>(null)
const dicomCanvas = ref<HTMLCanvasElement | null>(null)
const dicomMeta = ref<string[]>([])
const dicomWarning = ref('')

const mainExtension = computed(() => extension(props.filename))
const mainIsModel = computed(() => isModel(mainExtension.value))
const previewKind = computed<PreviewKind>(() => kindFor(props.filename, props.contentType))
const displayFilename = computed(() => activeEntry.value?.path ?? props.filename)
const displayUrl = computed(() => activeEntryUrl.value || props.sourceUrl)
const displayKind = computed(() => activeEntryKind.value ?? previewKind.value)

function extension(filename: string) {
  return filename.split('.').pop()?.toLowerCase() ?? ''
}

function isModel(value: string) {
  return ['stl', 'sla', 'ply', 'obj'].includes(value)
}

function kindFor(filename: string, contentType?: string | null): PreviewKind {
  const ext = extension(filename)
  const mime = contentType?.toLowerCase() ?? ''
  if (mime.startsWith('image/') || ['jpg', 'jpeg', 'png', 'webp'].includes(ext)) return 'IMAGE'
  if (mime === 'application/pdf' || ext === 'pdf') return 'PDF'
  if (['dcm', 'dicom'].includes(ext)) return 'DICOM'
  if (['txt', 'doc', 'docx'].includes(ext)) return 'TEXT'
  if (ext === 'zip') return 'ARCHIVE'
  return 'ERROR'
}

function apiFetch(path: string, options: RequestInit = {}) {
  return (props.authenticatedFetch ?? fetch)(path, options)
}

async function readJson<T>(path: string): Promise<T> {
  const response = await apiFetch(path, { headers: { Accept: 'application/json' } })
  if (!response.ok) throw new Error(`预览请求失败（HTTP ${response.status}）`)
  const payload = await response.json() as { data?: T }
  if (!payload.data) throw new Error('预览响应缺少数据')
  return payload.data
}

async function opened() {
  resetEntry()
  error.value = ''
  textPreview.value = ''
  archiveEntries.value = []
  dicomMeta.value = []
  dicomWarning.value = ''
  if (mainIsModel.value) return
  loading.value = true
  try {
    if (previewKind.value === 'TEXT') await loadTextPreview()
    if (previewKind.value === 'ARCHIVE') await loadArchive()
    if (previewKind.value === 'DICOM') await loadDicom(props.sourceUrl)
    if (previewKind.value === 'ERROR') throw new Error('该文件格式未纳入当前上传白名单')
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : '文件预览失败'
  } finally {
    loading.value = false
  }
}

async function loadTextPreview(path?: string) {
  const endpoint = path
    ? `/files/${encodeURIComponent(String(props.fileId))}/archive-entry-text?path=${encodeURIComponent(path)}`
    : `/files/${encodeURIComponent(String(props.fileId))}/text-preview`
  const result = await readJson<{ text: string; truncated: boolean }>(endpoint)
  textPreview.value = result.text
  textTruncated.value = result.truncated
}

async function loadArchive() {
  const result = await readJson<{ entries: ArchiveEntry[]; truncated: boolean }>(
    `/files/${encodeURIComponent(String(props.fileId))}/archive-entries`
  )
  archiveEntries.value = result.entries
  archiveTruncated.value = result.truncated
}

async function openArchiveEntry(entry: ArchiveEntry) {
  if (!entry.preview_supported || entry.directory) return
  loading.value = true
  error.value = ''
  resetEntry()
  activeEntry.value = entry
  try {
    const ext = extension(entry.path)
    if (['txt', 'doc', 'docx'].includes(ext)) {
      activeEntryKind.value = 'TEXT'
      await loadTextPreview(entry.path)
      return
    }
    const response = await apiFetch(
      `/files/${encodeURIComponent(String(props.fileId))}/archive-entry?path=${encodeURIComponent(entry.path)}`,
      { headers: { Accept: '*/*' } }
    )
    if (!response.ok) throw new Error(`压缩包文件读取失败（HTTP ${response.status}）`)
    activeEntryUrl.value = URL.createObjectURL(await response.blob())
    activeEntryKind.value = isModel(ext) ? 'MODEL' : kindFor(entry.path, response.headers.get('Content-Type'))
    if (activeEntryKind.value === 'DICOM') await loadDicom(activeEntryUrl.value)
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : '压缩包文件预览失败'
  } finally {
    loading.value = false
  }
}

function closeEntry() {
  resetEntry()
  textPreview.value = ''
  textTruncated.value = false
  dicomMeta.value = []
  dicomWarning.value = ''
}

function resetEntry() {
  if (activeEntryUrl.value) URL.revokeObjectURL(activeEntryUrl.value)
  activeEntryUrl.value = ''
  activeEntry.value = null
  activeEntryKind.value = null
}

async function loadDicom(url: string) {
  const response = await fetch(url)
  if (!response.ok) throw new Error(`DICOM读取失败（HTTP ${response.status}）`)
  const bytes = new Uint8Array(await response.arrayBuffer())
  const dataSet = dicomParser.parseDicom(bytes, { TransferSyntaxUID: '1.2.840.10008.1.2' })
  const rows = dataSet.uint16('x00280010') ?? 0
  const columns = dataSet.uint16('x00280011') ?? 0
  const bits = dataSet.uint16('x00280100') ?? 8
  const samples = dataSet.uint16('x00280002') ?? 1
  const photo = dataSet.string('x00280004') ?? 'UNKNOWN'
  const transferSyntax = dataSet.string('x00020010') ?? 'Implicit VR Little Endian'
  dicomMeta.value = [
    `尺寸：${columns || '未知'} × ${rows || '未知'}`,
    `位深：${bits}`,
    `光度解释：${photo}`,
    `传输语法：${transferSyntax}`,
  ]
  const pixel = dataSet.elements.x7fe00010
  if (!pixel || !rows || !columns || pixel.encapsulatedPixelData) {
    dicomWarning.value = '该DICOM使用压缩像素编码；当前安全预览展示影像元数据，原始文件仍可下载后由专业阅片软件打开。'
    return
  }
  await nextTick()
  const canvas = dicomCanvas.value
  if (!canvas) return
  canvas.width = columns
  canvas.height = rows
  const context = canvas.getContext('2d')
  if (!context) throw new Error('浏览器无法创建DICOM画布')
  const image = context.createImageData(columns, rows)
  const count = rows * columns
  const values = new Float64Array(count)
  const view = new DataView(bytes.buffer, bytes.byteOffset + pixel.dataOffset, pixel.length)
  let min = Number.POSITIVE_INFINITY
  let max = Number.NEGATIVE_INFINITY
  for (let index = 0; index < count; index++) {
    const value = bits <= 8 ? view.getUint8(index * samples) : view.getUint16(index * 2 * samples, true)
    values[index] = value
    min = Math.min(min, value)
    max = Math.max(max, value)
  }
  const range = Math.max(max - min, 1)
  const invert = photo.toUpperCase().includes('MONOCHROME1')
  for (let index = 0; index < count; index++) {
    let value = Math.round(((values[index] - min) / range) * 255)
    if (invert) value = 255 - value
    const offset = index * 4
    image.data[offset] = value
    image.data[offset + 1] = value
    image.data[offset + 2] = value
    image.data[offset + 3] = 255
  }
  context.putImageData(image, 0, 0)
}

function close() {
  emit('update:visible', false)
}

onBeforeUnmount(resetEntry)
</script>

<template>
  <StlViewerDialog
    v-if="mainIsModel"
    :visible="visible"
    :source-url="sourceUrl"
    :filename="filename"
    @update:visible="emit('update:visible', $event)"
  />
  <el-dialog
    v-else
    :model-value="visible"
    width="min(1000px, 94vw)"
    append-to-body
    :z-index="11030"
    destroy-on-close
    class="universal-file-preview"
    @update:model-value="emit('update:visible', $event)"
    @opened="opened"
    @closed="resetEntry"
  >
    <template #header>
      <div class="universal-file-preview__header">
        <div><strong>文件预览</strong><span>{{ displayFilename }}</span></div>
        <button v-if="activeEntry" type="button" @click="closeEntry">← 返回压缩包目录</button>
      </div>
    </template>
    <div class="universal-file-preview__stage">
      <div v-if="loading" class="universal-file-preview__state">正在生成安全预览…</div>
      <div v-else-if="error" class="universal-file-preview__state is-error"><strong>文件暂时无法预览</strong><span>{{ error }}</span></div>
      <img v-else-if="displayKind === 'IMAGE'" :src="displayUrl" :alt="displayFilename">
      <iframe v-else-if="displayKind === 'PDF'" :src="displayUrl" :title="`${displayFilename}预览`" />
      <div v-else-if="displayKind === 'DICOM'" class="universal-file-preview__dicom">
        <canvas ref="dicomCanvas" />
        <p v-if="dicomWarning">{{ dicomWarning }}</p>
        <ul><li v-for="item in dicomMeta" :key="item">{{ item }}</li></ul>
      </div>
      <div v-else-if="displayKind === 'TEXT'" class="universal-file-preview__text">
        <pre>{{ textPreview }}</pre>
        <p v-if="textTruncated">内容较长，当前只展示前20万字符；原文件保持完整。</p>
      </div>
      <div v-else-if="displayKind === 'ARCHIVE' && !activeEntry" class="universal-file-preview__archive">
        <p>压缩包目录仅展示安全路径；点击可预览的文件继续查看。</p>
        <button v-for="entry in archiveEntries" :key="entry.path" type="button" :disabled="!entry.preview_supported" @click="openArchiveEntry(entry)">
          <span>{{ entry.directory ? '📁' : '📄' }}</span><strong>{{ entry.path }}</strong><small>{{ entry.uncompressed_size ? `${entry.uncompressed_size} B` : '大小未记录' }}</small><em>{{ entry.preview_supported ? '预览' : '仅列出' }}</em>
        </button>
        <p v-if="archiveTruncated">目录超过1000项，仅展示前1000项。</p>
      </div>
      <StlViewerDialog
        v-else-if="displayKind === 'MODEL'"
        :visible="true"
        :source-url="displayUrl"
        :filename="displayFilename"
        @update:visible="closeEntry"
      />
    </div>
    <template #footer><el-button @click="close">关闭</el-button></template>
  </el-dialog>
</template>

<style scoped>
.universal-file-preview__header{display:flex;align-items:center;justify-content:space-between;gap:16px}.universal-file-preview__header strong,.universal-file-preview__header span{display:block}.universal-file-preview__header span{margin-top:4px;color:#64748b;font-size:12px}.universal-file-preview__header button{border:0;background:transparent;color:#2563eb;cursor:pointer}.universal-file-preview__stage{display:grid;min-height:min(68vh,680px);place-items:center;overflow:auto;border:1px solid #dbe4ee;border-radius:12px;background:#f8fafc}.universal-file-preview__stage>img{display:block;max-width:100%;max-height:68vh;object-fit:contain}.universal-file-preview__stage>iframe{width:100%;height:68vh;border:0;background:#fff}.universal-file-preview__state{display:grid;max-width:520px;place-items:center;gap:8px;padding:36px;color:#64748b;text-align:center}.universal-file-preview__state.is-error{color:#be123c}.universal-file-preview__text{align-self:stretch;width:100%;padding:18px}.universal-file-preview__text pre{margin:0;white-space:pre-wrap;word-break:break-word;font:13px/1.65 ui-monospace,SFMono-Regular,Menlo,monospace}.universal-file-preview__text p,.universal-file-preview__archive>p{color:#92400e}.universal-file-preview__archive{align-self:stretch;width:100%;padding:16px}.universal-file-preview__archive button{display:grid;width:100%;grid-template-columns:28px minmax(0,1fr) auto auto;align-items:center;gap:10px;padding:10px;border:0;border-bottom:1px solid #e2e8f0;background:transparent;text-align:left}.universal-file-preview__archive button:not(:disabled){cursor:pointer}.universal-file-preview__archive button:disabled{color:#94a3b8}.universal-file-preview__archive small,.universal-file-preview__archive em{font-size:12px;font-style:normal}.universal-file-preview__dicom{display:grid;max-width:100%;gap:14px;padding:16px}.universal-file-preview__dicom canvas{max-width:100%;max-height:56vh;background:#000;image-rendering:auto}.universal-file-preview__dicom ul{display:flex;flex-wrap:wrap;gap:8px;margin:0;padding:0;list-style:none}.universal-file-preview__dicom li{padding:5px 8px;border-radius:999px;background:#e2e8f0;color:#334155;font-size:12px}
</style>
