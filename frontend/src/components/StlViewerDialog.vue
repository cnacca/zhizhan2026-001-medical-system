<script setup lang="ts">
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { STLLoader } from 'three/addons/loaders/STLLoader.js'
import { PLYLoader } from 'three/addons/loaders/PLYLoader.js'
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js'
import { nextTick, onBeforeUnmount, ref } from 'vue'

const props = defineProps<{
  visible: boolean
  sourceUrl: string
  filename: string
}>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
}>()

const viewerContainer = ref<HTMLDivElement | null>(null)
const loading = ref(false)
const error = ref('')

let renderer: THREE.WebGLRenderer | null = null
let scene: THREE.Scene | null = null
let camera: THREE.PerspectiveCamera | null = null
let controls: OrbitControls | null = null
let modelRoot: THREE.Object3D | null = null
let resizeObserver: ResizeObserver | null = null
let abortController: AbortController | null = null

function resizeViewer() {
  const container = viewerContainer.value
  if (!container || !renderer || !camera) return
  const width = Math.max(container.clientWidth, 320)
  const height = Math.max(container.clientHeight, 360)
  renderer.setSize(width, height)
  camera.aspect = width / height
  camera.updateProjectionMatrix()
}

function disposeViewer() {
  abortController?.abort()
  abortController = null
  resizeObserver?.disconnect()
  resizeObserver = null
  controls?.dispose()
  controls = null
  if (modelRoot) {
    modelRoot.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) return
      child.geometry.dispose()
      const materials = Array.isArray(child.material) ? child.material : [child.material]
      materials.forEach((material) => material.dispose())
    })
    modelRoot = null
  }
  renderer?.setAnimationLoop(null)
  renderer?.dispose()
  renderer?.domElement.remove()
  renderer = null
  scene = null
  camera = null
}

async function mountViewer() {
  await nextTick()
  disposeViewer()
  error.value = ''
  loading.value = true
  const container = viewerContainer.value
  if (!container || !props.sourceUrl) {
    error.value = '3D 预览地址不可用'
    loading.value = false
    return
  }

  try {
    scene = new THREE.Scene()
    scene.background = new THREE.Color('#f8fafc')

    camera = new THREE.PerspectiveCamera(45, 1, 0.1, 10000)
    renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.outputColorSpace = THREE.SRGBColorSpace
    container.appendChild(renderer.domElement)

    controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.08
    controls.screenSpacePanning = true

    scene.add(new THREE.HemisphereLight('#ffffff', '#475569', 0.85))
    const keyLight = new THREE.DirectionalLight('#ffffff', 1.35)
    keyLight.position.set(1, 2, 3)
    scene.add(keyLight)
    const fillLight = new THREE.DirectionalLight('#dbeafe', 0.55)
    fillLight.position.set(-2, 1, -1)
    scene.add(fillLight)

    resizeObserver = new ResizeObserver(resizeViewer)
    resizeObserver.observe(container)
    resizeViewer()

    abortController = new AbortController()
    const response = await fetch(props.sourceUrl, { signal: abortController.signal })
    if (!response.ok) throw new Error(`3D 文件读取失败（HTTP ${response.status}）`)
    const buffer = await response.arrayBuffer()
    const material = new THREE.MeshStandardMaterial({
      color: '#62b8ad',
      metalness: 0.05,
      roughness: 0.62,
      side: THREE.DoubleSide,
    })
    const extension = props.filename.split('.').pop()?.toLowerCase() ?? 'stl'
    if (extension === 'obj') {
      const text = new TextDecoder().decode(buffer)
      modelRoot = new OBJLoader().parse(text)
      modelRoot.traverse((child) => {
        if (child instanceof THREE.Mesh) child.material = material.clone()
      })
      material.dispose()
    } else {
      const geometry = extension === 'ply'
        ? new PLYLoader().parse(buffer)
        : new STLLoader().parse(buffer)
      geometry.computeVertexNormals()
      modelRoot = new THREE.Mesh(geometry, material)
    }
    const bounds = new THREE.Box3().setFromObject(modelRoot)
    const center = bounds.getCenter(new THREE.Vector3())
    const size = bounds.getSize(new THREE.Vector3())
    modelRoot.position.sub(center)
    const radius = Math.max(size.length() / 2, 0.001)
    scene.add(modelRoot)

    camera.near = Math.max(radius / 100, 0.01)
    camera.far = Math.max(radius * 100, 1000)
    camera.position.set(radius * 1.8, radius * 1.3, radius * 2.4)
    camera.lookAt(0, 0, 0)
    camera.updateProjectionMatrix()
    controls.target.set(0, 0, 0)
    controls.update()

    renderer.render(scene, camera)
    renderer.setAnimationLoop(() => {
      controls?.update()
      if (renderer && scene && camera) renderer.render(scene, camera)
    })
  } catch (cause) {
    if (cause instanceof DOMException && cause.name === 'AbortError') return
    error.value = cause instanceof Error ? cause.message : '3D 模型解析失败'
  } finally {
    loading.value = false
  }
}

function closeViewer() {
  emit('update:visible', false)
}

onBeforeUnmount(disposeViewer)
</script>

<template>
  <el-dialog
    append-to-body
    :z-index="11030"
    :model-value="visible"
    width="min(960px, 92vw)"
    class="stl-viewer-dialog"
    destroy-on-close
    @update:model-value="emit('update:visible', $event)"
    @opened="mountViewer"
    @closed="disposeViewer"
  >
    <template #header>
      <div class="stl-viewer-heading">
        <div>
          <strong>3D 模型预览</strong>
          <span>{{ filename }}</span>
        </div>
        <small>拖动旋转 · 滚轮缩放 · 右键平移</small>
      </div>
    </template>
    <div class="stl-viewer-stage">
      <div ref="viewerContainer" class="stl-viewer-canvas" data-testid="stl-viewer-canvas" />
      <div v-if="loading" class="stl-viewer-overlay">正在读取并生成 3D 模型…</div>
      <div v-else-if="error" class="stl-viewer-overlay is-error">{{ error }}</div>
    </div>
    <template #footer>
      <el-button @click="closeViewer">关闭</el-button>
    </template>
  </el-dialog>
</template>

<style scoped>
.stl-viewer-heading {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
}

.stl-viewer-heading strong,
.stl-viewer-heading span {
  display: block;
}

.stl-viewer-heading span,
.stl-viewer-heading small {
  margin-top: 4px;
  color: #64748b;
  font-size: 12px;
}

.stl-viewer-stage {
  position: relative;
  overflow: hidden;
  min-height: 560px;
  border: 1px solid #dbe4ee;
  border-radius: 12px;
  background: #f8fafc;
}

.stl-viewer-canvas {
  width: 100%;
  height: 560px;
}

.stl-viewer-canvas :deep(canvas) {
  display: block;
  width: 100% !important;
  height: 100% !important;
}

.stl-viewer-overlay {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  color: #0f766e;
  background: rgb(248 250 252 / 82%);
  font-size: 14px;
  font-weight: 700;
}

.stl-viewer-overlay.is-error {
  color: #be123c;
}

@media (max-width: 720px) {
  .stl-viewer-heading {
    align-items: flex-start;
    flex-direction: column;
  }

  .stl-viewer-stage,
  .stl-viewer-canvas {
    min-height: 420px;
    height: 420px;
  }
}
</style>
