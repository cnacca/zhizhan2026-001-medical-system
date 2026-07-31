<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'

type ApiResponse<T> = { data: T; code?: number; msg?: string }
type Mode = 'catalog' | 'standard-time'
type CatalogVersion = {
  config_version_id: number
  version_no: number
  version_name: string
  publication_status: string
  effective_at: string | null
  lock_version: number
}
type CatalogMaterial = {
  material_id: number
  config_version_id: number
  material_code: string
  display_name: string
  material_family: string | null
  brand_name: string | null
  specification: string | null
  sort_order: number
  status: string
  lock_version: number
}
type CatalogPreview = {
  version: CatalogVersion
  categories: Array<Record<string, any>>
  products: Array<Record<string, any>>
  materials: CatalogMaterial[]
  material_bindings: Array<Record<string, any>>
  variants: Array<Record<string, any>>
  material_colors: Array<Record<string, any>>
  accessories: Array<Record<string, any>>
  accessory_bindings: Array<Record<string, any>>
  aliases: Array<Record<string, any>>
  rules: Array<Record<string, any>>
}
type StandardVersion = {
  standard_time_version_id: number
  version_no: number
  version_name: string
  publication_status: string
  effective_at: string | null
  lock_version: number
}
type StandardNode = {
  standard_time_item_id: number
  chain_id: number
  chain_code: string
  chain_name: string
  product_type: string
  node_id: number
  node_code: string
  process_name: string
  stage_name: string | null
  step_order: number
  standard_duration_minutes: number | null
  status: string
  lock_version: number
}

const props = defineProps<{ token: string; mode: Mode }>()

const loading = ref(false)
const saving = ref(false)
const error = ref('')
const message = ref('')
const search = ref('')
const statusFilter = ref('ALL')

const catalogVersions = ref<CatalogVersion[]>([])
const selectedCatalogVersionId = ref<number | null>(null)
const catalogPreview = ref<CatalogPreview | null>(null)
const catalogDraftName = ref('')
const categoryForm = ref({ category_code: '', display_name: '', sort_order: 0 })
const productForm = ref({ category_id: 0, product_code: '', display_name: '', workflow_product_type: 'REGULAR_CROWN', tooth_rule_code: '', sort_order: 0 })
const materialForm = ref({ material_code: '', display_name: '', material_family: '', brand_name: '', specification: '', sort_order: 0 })
const bindingForm = ref({ product_id: 0, variant_id: null as number | null, material_id: 0, selection_group_code: 'PRIMARY_MATERIAL', selection_mode: 'SINGLE', required: true, min_quantity: 1, max_quantity: 1, price_increment_cents: null as number | null, sort_order: 0 })
const variantForm = ref({ product_id: 0, variant_code: '', display_name: '', attributes: {} as Record<string, unknown>, sort_order: 0 })
const colorForm = ref({ material_id: 0, semantic_type: 'TOOTH_SHADE', color_code: '', display_name: '', sort_order: 0 })
const accessoryForm = ref({ accessory_code: '', display_name: '', quantity_supported: true, sort_order: 0 })
const accessoryBindingForm = ref({ product_id: 0, variant_id: null as number | null, accessory_id: 0, selection_group_code: 'ACCESSORIES', required: false, default: false, min_quantity: 1, max_quantity: 99, price_increment_cents: null as number | null, sort_order: 0 })
const aliasForm = ref({ canonical_type: 'PRODUCT', canonical_id: 0, alias_text: '' })
const ruleForm = ref({ product_id: null as number | null, variant_id: null as number | null, rule_type: 'FORM_SCHEMA', rule_code: '', rule_schema_text: '{\n  \"fields\": []\n}', sort_order: 0 })

const standardVersions = ref<StandardVersion[]>([])
const selectedStandardVersionId = ref<number | null>(null)
const standardNodes = ref<StandardNode[]>([])
const standardDraftName = ref('')
const standardReason = ref('维护工序节点标准分钟')
const standardBatchMinutes = ref<number | null>(null)

async function api<T>(path: string, options: RequestInit = {}) {
  const response = await fetch(path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${props.token}`,
      ...(options.headers ?? {})
    }
  })
  if (!response.ok) {
    let detail = ''
    try {
      const body = await response.json() as {
        message?: string
        msg?: string
        detail?: string
        error?: string
      }
      detail = body.message || body.msg || body.detail || ''
      if (!detail && response.status === 409) {
        detail = '操作冲突（409）：该配置仍被引用、存在关联绑定，或版本已变化，请刷新核对后再处理'
      }
      detail ||= body.error || ''
    } catch {
      detail = ''
    }
    throw new Error(detail || `请求失败（${response.status}）`)
  }
  return await response.json() as ApiResponse<T>
}

function resetFeedback() {
  error.value = ''
  message.value = ''
}

function downloadFile(filename: string, content: string, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type }))
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}

async function run(action: () => Promise<void>, success = '') {
  resetFeedback()
  saving.value = true
  try {
    await action()
    if (success) message.value = success
  } catch (reason) {
    error.value = reason instanceof Error ? reason.message : '操作失败'
  } finally {
    saving.value = false
  }
}

async function loadCatalogVersions() {
  loading.value = true
  resetFeedback()
  try {
    const response = await api<CatalogVersion[]>('/admin/catalog/versions')
    catalogVersions.value = response.data
    if (!selectedCatalogVersionId.value || !response.data.some((item) => item.config_version_id === selectedCatalogVersionId.value)) {
      selectedCatalogVersionId.value = response.data.find((item) => item.publication_status === 'DRAFT')?.config_version_id
        ?? response.data[0]?.config_version_id
        ?? null
    }
    await loadCatalogPreview()
  } catch (reason) {
    error.value = reason instanceof Error ? reason.message : '产品配置加载失败'
  } finally {
    loading.value = false
  }
}

async function loadCatalogPreview() {
  if (!selectedCatalogVersionId.value) return
  const response = await api<CatalogPreview>(`/admin/catalog/versions/${selectedCatalogVersionId.value}/preview`)
  catalogPreview.value = response.data
  productForm.value.category_id ||= Number(response.data.categories[0]?.category_id ?? 0)
  bindingForm.value.product_id ||= Number(response.data.products[0]?.product_id ?? 0)
  bindingForm.value.material_id ||= Number(response.data.materials[0]?.material_id ?? 0)
  variantForm.value.product_id ||= Number(response.data.products[0]?.product_id ?? 0)
  colorForm.value.material_id ||= Number(response.data.materials[0]?.material_id ?? 0)
  accessoryBindingForm.value.product_id ||= Number(response.data.products[0]?.product_id ?? 0)
  accessoryBindingForm.value.accessory_id ||= Number(response.data.accessories[0]?.accessory_id ?? 0)
  aliasForm.value.canonical_id ||= Number(response.data.products[0]?.product_id ?? 0)
}

const catalogIsDraft = computed(() => catalogPreview.value?.version.publication_status === 'DRAFT')
const filteredMaterials = computed(() => (catalogPreview.value?.materials ?? []).filter((item) => {
  const matchesSearch = !search.value.trim() || `${item.material_code} ${item.display_name} ${item.brand_name ?? ''}`.toLowerCase().includes(search.value.trim().toLowerCase())
  const matchesStatus = statusFilter.value === 'ALL' || item.status === statusFilter.value
  return matchesSearch && matchesStatus
}))
const catalogCompleteness = computed(() => {
  const preview = catalogPreview.value
  if (!preview) return { complete: 0, missing: 0 }
  const missing = preview.products.filter((product) => !product.workflow_product_type).length
  return { complete: preview.products.length - missing, missing }
})

async function copyCatalogVersion() {
  await run(async () => {
    const response = await api<CatalogVersion>('/admin/catalog/versions', {
      method: 'POST',
      body: JSON.stringify({
        version_name: catalogDraftName.value.trim() || `产品配置草稿 ${new Date().toLocaleDateString('zh-CN')}`,
        based_on_version_id: selectedCatalogVersionId.value
      })
    })
    selectedCatalogVersionId.value = response.data.config_version_id
    catalogDraftName.value = ''
    await loadCatalogVersions()
  }, '已复制为新草稿，原发布版本与历史订单保持不变')
}

async function downloadCatalogTemplate() {
  await run(async () => {
    const response = await api<Record<string, unknown>>('/admin/catalog/import-template')
    downloadFile('产品配置导入模板-CATALOG_V2_1.json', JSON.stringify({
      ...response.data,
      rows: [
        { entity_type: 'MATERIAL', code: 'MATERIAL_CODE', display_name: '材料名称' }
      ]
    }, null, 2), 'application/json;charset=utf-8')
  }, '已下载稳定模板；上传前必须先校验，不会直接写库')
}

function exportCatalogPreview() {
  if (!catalogPreview.value) return
  downloadFile(
    `产品配置-V${catalogPreview.value.version.version_no}.json`,
    JSON.stringify(catalogPreview.value, null, 2),
    'application/json;charset=utf-8'
  )
  message.value = '当前版本已导出'
}

async function validateCatalogImport(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file) return
  await run(async () => {
    const parsed = JSON.parse(await file.text()) as Record<string, unknown>
    const response = await api<{ valid: boolean; row_count: number; error_count: number; errors: Array<Record<string, unknown>> }>('/admin/catalog/import-validation', {
      method: 'POST',
      body: JSON.stringify(parsed)
    })
    if (!response.data.valid) {
      throw new Error(`校验未通过：${response.data.error_count} 个错误；第一个错误 ${JSON.stringify(response.data.errors[0])}`)
    }
    message.value = `校验通过：${response.data.row_count} 行；本接口只校验，不写入数据`
  })
}

async function createCategory() {
  if (!selectedCatalogVersionId.value) return
  await run(async () => {
    await api(`/admin/catalog/versions/${selectedCatalogVersionId.value}/categories`, {
      method: 'POST',
      body: JSON.stringify(categoryForm.value)
    })
    categoryForm.value = { category_code: '', display_name: '', sort_order: 0 }
    await loadCatalogPreview()
  }, '分类已保存到当前草稿')
}

async function createProduct() {
  if (!selectedCatalogVersionId.value) return
  await run(async () => {
    await api(`/admin/catalog/versions/${selectedCatalogVersionId.value}/products`, {
      method: 'POST',
      body: JSON.stringify(productForm.value)
    })
    productForm.value.product_code = ''
    productForm.value.display_name = ''
    await loadCatalogPreview()
  }, '产品已保存，未配置价格时保持待报价')
}

async function createMaterial() {
  if (!selectedCatalogVersionId.value) return
  await run(async () => {
    await api(`/admin/catalog/versions/${selectedCatalogVersionId.value}/materials`, {
      method: 'POST',
      body: JSON.stringify(materialForm.value)
    })
    materialForm.value = { material_code: '', display_name: '', material_family: '', brand_name: '', specification: '', sort_order: 0 }
    await loadCatalogPreview()
  }, '材料已保存到当前草稿')
}

async function bindMaterial() {
  if (!selectedCatalogVersionId.value) return
  await run(async () => {
    await api(`/admin/catalog/versions/${selectedCatalogVersionId.value}/material-bindings`, {
      method: 'POST',
      body: JSON.stringify({ ...bindingForm.value, default: false })
    })
    await loadCatalogPreview()
  }, '产品与材料绑定已保存')
}

async function createVariant() {
  if (!selectedCatalogVersionId.value) return
  await run(async () => {
    await api(`/admin/catalog/versions/${selectedCatalogVersionId.value}/variants`, {
      method: 'POST',
      body: JSON.stringify(variantForm.value)
    })
    variantForm.value.variant_code = ''
    variantForm.value.display_name = ''
    await loadCatalogPreview()
  }, '产品变体已保存')
}

async function createMaterialColor() {
  if (!selectedCatalogVersionId.value) return
  await run(async () => {
    await api(`/admin/catalog/versions/${selectedCatalogVersionId.value}/material-colors`, {
      method: 'POST',
      body: JSON.stringify(colorForm.value)
    })
    colorForm.value.color_code = ''
    colorForm.value.display_name = ''
    await loadCatalogPreview()
  }, '语义色号已保存')
}

async function createAccessory() {
  if (!selectedCatalogVersionId.value) return
  await run(async () => {
    await api(`/admin/catalog/versions/${selectedCatalogVersionId.value}/accessories`, {
      method: 'POST',
      body: JSON.stringify(accessoryForm.value)
    })
    accessoryForm.value.accessory_code = ''
    accessoryForm.value.display_name = ''
    await loadCatalogPreview()
  }, '配件已保存')
}

async function bindAccessory() {
  if (!selectedCatalogVersionId.value) return
  await run(async () => {
    await api(`/admin/catalog/versions/${selectedCatalogVersionId.value}/accessory-bindings`, {
      method: 'POST',
      body: JSON.stringify(accessoryBindingForm.value)
    })
    await loadCatalogPreview()
  }, '产品与配件绑定已保存')
}

function aliasOptions() {
  if (!catalogPreview.value) return []
  if (aliasForm.value.canonical_type === 'PRODUCT') {
    return catalogPreview.value.products.map((item) => ({ id: item.product_id, name: item.display_name }))
  }
  if (aliasForm.value.canonical_type === 'PRODUCT_VARIANT') {
    return catalogPreview.value.variants.map((item) => ({ id: item.variant_id, name: item.display_name }))
  }
  if (aliasForm.value.canonical_type === 'MATERIAL') {
    return catalogPreview.value.materials.map((item) => ({ id: item.material_id, name: item.display_name }))
  }
  return catalogPreview.value.accessories.map((item) => ({ id: item.accessory_id, name: item.display_name }))
}

function resetAliasTarget() {
  aliasForm.value.canonical_id = Number(aliasOptions()[0]?.id ?? 0)
}

async function createAlias() {
  if (!selectedCatalogVersionId.value) return
  await run(async () => {
    await api(`/admin/catalog/versions/${selectedCatalogVersionId.value}/aliases`, {
      method: 'POST',
      body: JSON.stringify(aliasForm.value)
    })
    aliasForm.value.alias_text = ''
    await loadCatalogPreview()
  }, '同义别名已保存，不会创建重复 SKU')
}

async function createRule() {
  if (!selectedCatalogVersionId.value) return
  await run(async () => {
    let ruleSchema: unknown
    try {
      ruleSchema = JSON.parse(ruleForm.value.rule_schema_text)
    } catch {
      throw new Error('规则 JSON 格式不正确')
    }
    await api(`/admin/catalog/versions/${selectedCatalogVersionId.value}/rules`, {
      method: 'POST',
      body: JSON.stringify({
        product_id: ruleForm.value.product_id || null,
        variant_id: ruleForm.value.variant_id || null,
        rule_type: ruleForm.value.rule_type,
        rule_code: ruleForm.value.rule_code,
        rule_schema: ruleSchema,
        sort_order: ruleForm.value.sort_order
      })
    })
    ruleForm.value.rule_code = ''
    await loadCatalogPreview()
  }, '动态字段／牙位／上传／交期规则已保存')
}

async function toggleNamedEntity(entityType: string, entity: Record<string, any>) {
  const idKey = entityType === 'CATEGORY'
    ? 'category_id'
    : entityType === 'VARIANT'
      ? 'variant_id'
      : entityType === 'ACCESSORY'
        ? 'accessory_id'
        : 'material_color_id'
  await run(async () => {
    await api(`/admin/catalog/entities/${entityType}/${entity[idKey]}`, {
      method: 'PUT',
      body: JSON.stringify({
        display_name: entity.display_name,
        sort_order: entity.sort_order ?? 0,
        status: entity.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE',
        lock_version: entity.lock_version
      })
    })
    await loadCatalogPreview()
  }, entity.status === 'ACTIVE' ? '配置项已停用，新草稿不再可选' : '配置项已恢复')
}

async function toggleProduct(product: Record<string, any>) {
  await run(async () => {
    await api(`/admin/catalog/products/${product.product_id}`, {
      method: 'PUT',
      body: JSON.stringify({
        display_name: product.display_name,
        workflow_product_type: product.workflow_product_type,
        tooth_rule_code: product.tooth_rule_code,
        pricing_status: product.pricing_status,
        base_price_cents: product.base_price_cents,
        currency: product.currency || 'CNY',
        sort_order: product.sort_order ?? 0,
        status: product.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE',
        lock_version: product.lock_version
      })
    })
    await loadCatalogPreview()
  }, product.status === 'ACTIVE' ? '产品已停用' : '产品已恢复')
}

async function saveMaterialBinding(item: Record<string, any>, toggle = false) {
  await run(async () => {
    await api(`/admin/catalog/material-bindings/${item.binding_id}`, {
      method: 'PUT',
      body: JSON.stringify({
        selection_group_code: item.selection_group_code,
        required: Boolean(item.required_flag),
        selection_mode: item.selection_mode,
        default: Boolean(item.default_flag),
        min_quantity: item.min_quantity,
        max_quantity: item.max_quantity,
        price_increment_cents: item.price_increment_cents,
        sort_order: item.sort_order ?? 0,
        status: toggle ? (item.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE') : item.status,
        lock_version: item.lock_version
      })
    })
    await loadCatalogPreview()
  }, toggle ? '材料绑定状态已更新' : '材料绑定规则已更新')
}

async function saveAccessoryBinding(item: Record<string, any>, toggle = false) {
  await run(async () => {
    await api(`/admin/catalog/accessory-bindings/${item.binding_id}`, {
      method: 'PUT',
      body: JSON.stringify({
        selection_group_code: item.selection_group_code,
        required: Boolean(item.required_flag),
        default: Boolean(item.default_flag),
        min_quantity: item.min_quantity,
        max_quantity: item.max_quantity,
        price_increment_cents: item.price_increment_cents,
        sort_order: item.sort_order ?? 0,
        status: toggle ? (item.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE') : item.status,
        lock_version: item.lock_version
      })
    })
    await loadCatalogPreview()
  }, toggle ? '配件绑定状态已更新' : '配件绑定规则已更新')
}

async function saveAlias(item: Record<string, any>, toggle = false) {
  await run(async () => {
    await api(`/admin/catalog/aliases/${item.alias_id}`, {
      method: 'PUT',
      body: JSON.stringify({
        alias_text: item.alias_text,
        status: toggle ? (item.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE') : item.status,
        lock_version: item.lock_version
      })
    })
    await loadCatalogPreview()
  }, toggle ? '别名状态已更新' : '别名已更新')
}

async function toggleRule(item: Record<string, any>) {
  await run(async () => {
    const schema = typeof item.rule_schema_json === 'string'
      ? JSON.parse(item.rule_schema_json)
      : item.rule_schema_json
    await api(`/admin/catalog/rules/${item.rule_id}`, {
      method: 'PUT',
      body: JSON.stringify({
        rule_schema: schema,
        sort_order: item.sort_order ?? 0,
        status: item.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE',
        lock_version: item.lock_version
      })
    })
    await loadCatalogPreview()
  }, item.status === 'ACTIVE' ? '规则已停用' : '规则已恢复')
}

async function toggleMaterial(material: CatalogMaterial) {
  await run(async () => {
    await api(`/admin/catalog/materials/${material.material_id}`, {
      method: 'PUT',
      body: JSON.stringify({
        display_name: material.display_name,
        material_family: material.material_family,
        brand_name: material.brand_name,
        specification: material.specification,
        sort_order: material.sort_order,
        status: material.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE',
        lock_version: material.lock_version
      })
    })
    await loadCatalogPreview()
  }, material.status === 'ACTIVE' ? '材料已停用，新草稿不再可选' : '材料已恢复')
}

async function deleteMaterial(material: CatalogMaterial) {
  await run(async () => {
    await api(`/admin/catalog/materials/${material.material_id}`, { method: 'DELETE' })
    await loadCatalogPreview()
  }, '未发布且未引用的草稿材料已删除')
}

async function publishCatalog() {
  if (!catalogPreview.value) return
  await run(async () => {
    await api(`/admin/catalog/versions/${catalogPreview.value!.version.config_version_id}/publish`, {
      method: 'POST',
      body: JSON.stringify({
        reason: '管理端预览确认后发布',
        lock_version: catalogPreview.value!.version.lock_version
      })
    })
    await loadCatalogVersions()
  }, '目录版本已冻结发布，历史订单不会随配置变化重算')
}

async function loadStandardVersions() {
  loading.value = true
  resetFeedback()
  try {
    const response = await api<StandardVersion[]>('/admin/workflow/standard-times/versions')
    standardVersions.value = response.data
    if (!selectedStandardVersionId.value || !response.data.some((item) => item.standard_time_version_id === selectedStandardVersionId.value)) {
      selectedStandardVersionId.value = response.data.find((item) => item.publication_status === 'DRAFT')?.standard_time_version_id
        ?? response.data[0]?.standard_time_version_id
        ?? null
    }
    await loadStandardNodes()
  } catch (reason) {
    error.value = reason instanceof Error ? reason.message : '标准工时加载失败'
  } finally {
    loading.value = false
  }
}

async function loadStandardNodes() {
  if (!selectedStandardVersionId.value) return
  const response = await api<StandardNode[]>(`/admin/workflow/standard-times/versions/${selectedStandardVersionId.value}/nodes`)
  standardNodes.value = response.data
}

const selectedStandardVersion = computed(() => standardVersions.value.find((item) => item.standard_time_version_id === selectedStandardVersionId.value) ?? null)
const standardIsDraft = computed(() => selectedStandardVersion.value?.publication_status === 'DRAFT')
const filteredStandardNodes = computed(() => standardNodes.value.filter((node) => {
  const matchesSearch = !search.value.trim() || `${node.chain_name} ${node.product_type} ${node.process_name}`.toLowerCase().includes(search.value.trim().toLowerCase())
  const matchesStatus = statusFilter.value === 'ALL' || node.status === statusFilter.value
  return matchesSearch && matchesStatus
}))
const standardCoverage = computed(() => {
  const configured = standardNodes.value.filter((node) => node.standard_duration_minutes !== null).length
  return { configured, missing: standardNodes.value.length - configured, total: standardNodes.value.length }
})

async function saveStandardTimes() {
  if (!selectedStandardVersionId.value) return
  await run(async () => {
    await api(`/admin/workflow/standard-times/versions/${selectedStandardVersionId.value}/nodes`, {
      method: 'PUT',
      body: JSON.stringify({
        reason: standardReason.value,
        items: standardNodes.value.map((node) => ({
          node_id: node.node_id,
          standard_duration_minutes: node.standard_duration_minutes === null || node.standard_duration_minutes === undefined || String(node.standard_duration_minutes) === ''
            ? null
            : Number(node.standard_duration_minutes),
          status: node.status,
          lock_version: node.lock_version
        }))
      })
    })
    await loadStandardNodes()
  }, '标准分钟已保存；空值继续保持未配置')
}

async function copyStandardVersion() {
  await run(async () => {
    const response = await api<StandardVersion>('/admin/workflow/standard-times/versions', {
      method: 'POST',
      body: JSON.stringify({
        source_version_id: selectedStandardVersionId.value,
        version_name: standardDraftName.value.trim() || `标准工时草稿 ${new Date().toLocaleDateString('zh-CN')}`
      })
    })
    selectedStandardVersionId.value = response.data.standard_time_version_id
    standardDraftName.value = ''
    await loadStandardVersions()
  }, '已复制为新草稿，原版本保持不变')
}

async function publishStandardTimes() {
  if (!selectedStandardVersion.value) return
  await run(async () => {
    await api(`/admin/workflow/standard-times/versions/${selectedStandardVersion.value!.standard_time_version_id}/publish`, {
      method: 'POST',
      body: JSON.stringify({
        reason: standardReason.value,
        lock_version: selectedStandardVersion.value!.lock_version
      })
    })
    await loadStandardVersions()
  }, '标准工时版本已发布；只影响之后实例化的新工序')
}

function fillStandardTimes() {
  if (standardBatchMinutes.value === null || standardBatchMinutes.value < 0 || standardBatchMinutes.value > 43200) {
    error.value = '批量分钟必须在 0～43200 之间'
    return
  }
  filteredStandardNodes.value.forEach((node) => {
    node.standard_duration_minutes = standardBatchMinutes.value
  })
  message.value = `已填入 ${filteredStandardNodes.value.length} 个当前筛选节点，尚未保存`
}

function exportStandardTimes() {
  const rows = [
    ['template_version', 'chain_code', 'product_type', 'node_code', 'process_name', 'standard_duration_minutes', 'status'],
    ...standardNodes.value.map((node) => [
      'STANDARD_TIME_V1',
      node.chain_code,
      node.product_type,
      node.node_code,
      node.process_name,
      node.standard_duration_minutes ?? '',
      node.status
    ])
  ]
  const csv = `\uFEFF${rows.map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(',')).join('\n')}`
  downloadFile(`标准工时-V${selectedStandardVersion.value?.version_no ?? 'draft'}.csv`, csv, 'text/csv;charset=utf-8')
  message.value = '标准工时模板已导出'
}

async function importStandardTimes(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file) return
  resetFeedback()
  try {
    const lines = (await file.text()).replace(/^\uFEFF/, '').split(/\r?\n/).filter(Boolean)
    if (lines.length < 2) throw new Error('CSV 没有数据行')
    const headers = parseCsvLine(lines[0]).map((value) => value.trim())
    const nodeCodeIndex = headers.indexOf('node_code')
    const durationIndex = headers.indexOf('standard_duration_minutes')
    const statusIndex = headers.indexOf('status')
    const versionIndex = headers.indexOf('template_version')
    if ([nodeCodeIndex, durationIndex, statusIndex, versionIndex].some((index) => index < 0)) {
      throw new Error('CSV 缺少稳定模板列')
    }
    const byNodeCode = new Map(standardNodes.value.map((node) => [node.node_code, node]))
    let applied = 0
    lines.slice(1).forEach((line, index) => {
      const values = parseCsvLine(line)
      if (values[versionIndex] !== 'STANDARD_TIME_V1') throw new Error(`第 ${index + 2} 行模板版本不支持`)
      const node = byNodeCode.get(values[nodeCodeIndex])
      if (!node) throw new Error(`第 ${index + 2} 行工序节点不存在`)
      const raw = values[durationIndex].trim()
      const duration = raw === '' ? null : Number(raw)
      if (duration !== null && (!Number.isInteger(duration) || duration < 0 || duration > 43200)) {
        throw new Error(`第 ${index + 2} 行标准分钟无效`)
      }
      const status = values[statusIndex]
      if (status !== 'ACTIVE' && status !== 'INACTIVE') throw new Error(`第 ${index + 2} 行状态无效`)
      node.standard_duration_minutes = duration
      node.status = status
      applied++
    })
    message.value = `已导入 ${applied} 行到当前草稿，点击“批量保存”后才会写入`
  } catch (reason) {
    error.value = reason instanceof Error ? reason.message : '标准工时导入失败'
  }
}

function parseCsvLine(line: string) {
  const values: string[] = []
  let current = ''
  let quoted = false
  for (let index = 0; index < line.length; index++) {
    const char = line[index]
    if (char === '"' && quoted && line[index + 1] === '"') {
      current += '"'
      index++
    } else if (char === '"') {
      quoted = !quoted
    } else if (char === ',' && !quoted) {
      values.push(current)
      current = ''
    } else {
      current += char
    }
  }
  values.push(current)
  return values
}

watch(() => props.mode, async () => {
  search.value = ''
  statusFilter.value = 'ALL'
  if (props.mode === 'catalog') await loadCatalogVersions()
  else await loadStandardVersions()
})
watch(selectedCatalogVersionId, () => { if (props.mode === 'catalog') void loadCatalogPreview() })
watch(selectedStandardVersionId, () => { if (props.mode === 'standard-time') void loadStandardNodes() })
onMounted(() => props.mode === 'catalog' ? loadCatalogVersions() : loadStandardVersions())
</script>

<template>
  <div class="config-center" :data-testid="mode === 'catalog' ? 'catalog-configuration-center' : 'workflow-standard-time-center'">
    <div class="config-toolbar">
      <label>
        <span>版本</span>
        <select v-if="mode === 'catalog'" v-model.number="selectedCatalogVersionId">
          <option v-for="version in catalogVersions" :key="version.config_version_id" :value="version.config_version_id">
            V{{ version.version_no }} · {{ version.version_name }} · {{ version.publication_status }}
          </option>
        </select>
        <select v-else v-model.number="selectedStandardVersionId">
          <option v-for="version in standardVersions" :key="version.standard_time_version_id" :value="version.standard_time_version_id">
            V{{ version.version_no }} · {{ version.version_name }} · {{ version.publication_status }}
          </option>
        </select>
      </label>
      <label class="config-search"><span>搜索</span><input v-model="search" placeholder="搜索编码、名称或工序"></label>
      <label><span>状态</span><select v-model="statusFilter"><option value="ALL">全部</option><option value="ACTIVE">启用</option><option value="INACTIVE">停用</option></select></label>
      <button type="button" :disabled="loading" @click="mode === 'catalog' ? loadCatalogVersions() : loadStandardVersions()">刷新</button>
    </div>

    <div v-if="error" class="config-alert error">{{ error }}</div>
    <div v-if="message" class="config-alert success">{{ message }}</div>
    <div v-if="loading" class="config-state">正在读取真实配置…</div>

    <template v-else-if="mode === 'catalog' && catalogPreview">
      <div class="config-metrics">
        <article><span>分类</span><strong>{{ catalogPreview.categories.length }}</strong><small>当前版本</small></article>
        <article><span>产品</span><strong>{{ catalogPreview.products.length }}</strong><small>完整 {{ catalogCompleteness.complete }} / 缺映射 {{ catalogCompleteness.missing }}</small></article>
        <article><span>材料</span><strong>{{ catalogPreview.materials.length }}</strong><small>停用不影响历史快照</small></article>
        <article><span>绑定</span><strong>{{ catalogPreview.material_bindings.length }}</strong><small>单选 / 多选及数量规则</small></article>
      </div>

      <section class="config-card wide version-actions">
        <header><div><span>版本治理</span><h3>复制后维护，预览后发布</h3></div><b>{{ catalogPreview.version.publication_status }}</b></header>
        <div class="standard-actions">
          <input v-model="catalogDraftName" placeholder="新草稿版本名称">
          <button :disabled="saving" data-testid="catalog-copy-version" @click="copyCatalogVersion">复制当前版本为草稿</button>
          <button :disabled="saving" @click="downloadCatalogTemplate">下载导入模板</button>
          <label class="file-button" :class="{ disabled: saving }"><input type="file" accept=".json,application/json" :disabled="saving" @change="validateCatalogImport">上传并校验</label>
          <button :disabled="saving" @click="exportCatalogPreview">导出当前版本</button>
          <span class="config-note">已发布版本不可修改。正式数据尚未确认时保留草稿或空值，不使用演示值冒充。</span>
        </div>
      </section>

      <div class="config-grid">
        <section class="config-card">
          <header><div><span>01</span><h3>分类与产品</h3></div><b :class="catalogIsDraft ? 'draft' : 'locked'">{{ catalogIsDraft ? '草稿可编辑' : '已冻结' }}</b></header>
          <div class="config-form two">
            <input v-model="categoryForm.category_code" :disabled="!catalogIsDraft" placeholder="分类 code，如 FIXED">
            <input v-model="categoryForm.display_name" :disabled="!catalogIsDraft" placeholder="分类显示名">
            <button :disabled="saving || !catalogIsDraft || !categoryForm.category_code || !categoryForm.display_name" @click="createCategory">新增分类</button>
          </div>
          <div class="config-form two">
            <select v-model.number="productForm.category_id" :disabled="!catalogIsDraft"><option :value="0">选择分类</option><option v-for="item in catalogPreview.categories" :key="item.category_id" :value="item.category_id">{{ item.display_name }}</option></select>
            <input v-model="productForm.product_code" :disabled="!catalogIsDraft" placeholder="产品稳定 code">
            <input v-model="productForm.display_name" :disabled="!catalogIsDraft" placeholder="产品名称">
            <select v-model="productForm.workflow_product_type" :disabled="!catalogIsDraft"><option v-for="value in ['REGULAR_CROWN','IMPLANT_RESTORATION','REMOVABLE_STEEL','REMOVABLE_ACRYLIC','REMOVABLE_INVISIBLE','ORTHODONTICS']" :key="value">{{ value }}</option></select>
            <button :disabled="saving || !catalogIsDraft || !productForm.category_id || !productForm.product_code || !productForm.display_name" @click="createProduct">新增产品</button>
          </div>
          <div class="config-list compact">
            <div v-for="product in catalogPreview.products" :key="product.product_id"><span><strong>{{ product.display_name }}</strong><small>{{ product.product_code }} · {{ product.workflow_product_type || '缺少工序映射' }}</small></span><b>待报价</b><i :class="String(product.status).toLowerCase()">{{ product.status }}</i><button :disabled="saving || !catalogIsDraft" @click="toggleProduct(product)">{{ product.status === 'ACTIVE' ? '停用' : '恢复' }}</button></div>
          </div>
        </section>

        <section class="config-card">
          <header><div><span>02</span><h3>材料维护</h3></div><b>语义颜色分字段维护</b></header>
          <div class="config-form two">
            <input v-model="materialForm.material_code" :disabled="!catalogIsDraft" placeholder="材料 code">
            <input v-model="materialForm.display_name" :disabled="!catalogIsDraft" placeholder="材料名称">
            <input v-model="materialForm.brand_name" :disabled="!catalogIsDraft" placeholder="品牌，如 Lucitone">
            <input v-model="materialForm.specification" :disabled="!catalogIsDraft" placeholder="规格">
            <button :disabled="saving || !catalogIsDraft || !materialForm.material_code || !materialForm.display_name" @click="createMaterial">新增材料</button>
          </div>
          <div class="config-list">
            <div v-for="material in filteredMaterials" :key="material.material_id">
              <span><strong>{{ material.display_name }}</strong><small>{{ material.material_code }} · {{ material.brand_name || '品牌未填' }} · {{ material.specification || '规格未填' }}</small></span>
              <i :class="material.status.toLowerCase()">{{ material.status === 'ACTIVE' ? '启用' : '停用' }}</i>
              <button :disabled="saving || !catalogIsDraft" @click="toggleMaterial(material)">{{ material.status === 'ACTIVE' ? '停用' : '恢复' }}</button>
              <button class="danger" :disabled="saving || !catalogIsDraft" title="只有从未发布且未引用的草稿可删除" @click="deleteMaterial(material)">删除</button>
            </div>
          </div>
        </section>

        <section class="config-card wide">
          <header><div><span>03</span><h3>产品－材料绑定</h3></div><b>服务端校验数量与适用范围</b></header>
          <div class="config-form binding">
            <select v-model.number="bindingForm.product_id" :disabled="!catalogIsDraft"><option :value="0">选择产品</option><option v-for="item in catalogPreview.products" :key="item.product_id" :value="item.product_id">{{ item.display_name }}</option></select>
            <select v-model.number="bindingForm.material_id" :disabled="!catalogIsDraft"><option :value="0">选择材料</option><option v-for="item in catalogPreview.materials" :key="item.material_id" :value="item.material_id">{{ item.display_name }}</option></select>
            <input v-model="bindingForm.selection_group_code" :disabled="!catalogIsDraft" placeholder="选择组 code">
            <select v-model="bindingForm.selection_mode" :disabled="!catalogIsDraft"><option value="SINGLE">单选</option><option value="MULTIPLE">多选</option></select>
            <input v-model.number="bindingForm.min_quantity" type="number" min="0" :disabled="!catalogIsDraft" placeholder="最小数量">
            <input v-model.number="bindingForm.max_quantity" type="number" min="0" :disabled="!catalogIsDraft" placeholder="最大数量">
            <button :disabled="saving || !catalogIsDraft || !bindingForm.product_id || !bindingForm.material_id" @click="bindMaterial">保存绑定</button>
          </div>
          <table><thead><tr><th>产品 / 材料</th><th>选择组</th><th>选择</th><th>必选</th><th>数量</th><th>报价状态</th><th>操作</th></tr></thead><tbody><tr v-for="item in catalogPreview.material_bindings" :key="item.binding_id"><td><strong>{{ catalogPreview.products.find((product) => product.product_id === item.product_id)?.display_name }}</strong><small>{{ catalogPreview.materials.find((material) => material.material_id === item.material_id)?.display_name }}</small></td><td><input v-model="item.selection_group_code" :disabled="!catalogIsDraft"></td><td><select v-model="item.selection_mode" :disabled="!catalogIsDraft"><option value="SINGLE">单选</option><option value="MULTIPLE">多选</option></select></td><td><input v-model="item.required_flag" type="checkbox" :disabled="!catalogIsDraft"></td><td><div class="table-range"><input v-model.number="item.min_quantity" type="number" min="0" :disabled="!catalogIsDraft"><span>～</span><input v-model.number="item.max_quantity" type="number" min="0" :disabled="!catalogIsDraft"></div></td><td>待报价</td><td><button :disabled="saving || !catalogIsDraft" @click="saveMaterialBinding(item)">保存</button><button :disabled="saving || !catalogIsDraft" @click="saveMaterialBinding(item, true)">{{ item.status === 'ACTIVE' ? '停用' : '恢复' }}</button></td></tr></tbody></table>
        </section>

        <section class="config-card">
          <header><div><span>04</span><h3>变体 / SKU</h3></div><b>{{ catalogPreview.variants.length }} 项</b></header>
          <div class="config-form two">
            <select v-model.number="variantForm.product_id" :disabled="!catalogIsDraft"><option :value="0">选择产品</option><option v-for="item in catalogPreview.products" :key="item.product_id" :value="item.product_id">{{ item.display_name }}</option></select>
            <input v-model="variantForm.variant_code" :disabled="!catalogIsDraft" placeholder="变体稳定 code">
            <input v-model="variantForm.display_name" :disabled="!catalogIsDraft" placeholder="变体显示名">
            <button :disabled="saving || !catalogIsDraft || !variantForm.product_id || !variantForm.variant_code || !variantForm.display_name" @click="createVariant">新增变体</button>
          </div>
          <div class="config-list"><div v-for="item in catalogPreview.variants" :key="item.variant_id"><span><strong>{{ item.display_name }}</strong><small>{{ item.variant_code }} · {{ catalogPreview.products.find((product) => product.product_id === item.product_id)?.display_name }}</small></span><i :class="String(item.status).toLowerCase()">{{ item.status }}</i><button :disabled="saving || !catalogIsDraft" @click="toggleNamedEntity('VARIANT', item)">{{ item.status === 'ACTIVE' ? '停用' : '恢复' }}</button></div></div>
        </section>

        <section class="config-card">
          <header><div><span>05</span><h3>材料语义色号</h3></div><b>牙色／牙龈／基托／矫治器</b></header>
          <div class="config-form two">
            <select v-model.number="colorForm.material_id" :disabled="!catalogIsDraft"><option :value="0">选择材料</option><option v-for="item in catalogPreview.materials" :key="item.material_id" :value="item.material_id">{{ item.display_name }}</option></select>
            <select v-model="colorForm.semantic_type" :disabled="!catalogIsDraft"><option value="TOOTH_SHADE">牙色</option><option value="GINGIVAL_SHADE">牙龈色</option><option value="DENTURE_BASE_SHADE">基托色</option><option value="ALIGNER_COLOR">矫治器色</option></select>
            <input v-model="colorForm.color_code" :disabled="!catalogIsDraft" placeholder="色号 code">
            <input v-model="colorForm.display_name" :disabled="!catalogIsDraft" placeholder="显示名称">
            <button :disabled="saving || !catalogIsDraft || !colorForm.material_id || !colorForm.color_code || !colorForm.display_name" @click="createMaterialColor">新增色号</button>
          </div>
          <div class="config-list"><div v-for="item in catalogPreview.material_colors" :key="item.material_color_id"><span><strong>{{ item.display_name }}</strong><small>{{ item.color_code }} · {{ item.semantic_type }}</small></span><i :class="String(item.status).toLowerCase()">{{ item.status }}</i><button :disabled="saving || !catalogIsDraft" @click="toggleNamedEntity('MATERIAL_COLOR', item)">{{ item.status === 'ACTIVE' ? '停用' : '恢复' }}</button></div></div>
        </section>

        <section class="config-card wide">
          <header><div><span>06</span><h3>配件与产品绑定</h3></div><b>仅维护数量规则，价格待客户确认</b></header>
          <div class="config-form binding">
            <input v-model="accessoryForm.accessory_code" :disabled="!catalogIsDraft" placeholder="配件 code">
            <input v-model="accessoryForm.display_name" :disabled="!catalogIsDraft" placeholder="配件名称">
            <select v-model="accessoryForm.quantity_supported" :disabled="!catalogIsDraft"><option :value="true">支持数量</option><option :value="false">不计数量</option></select>
            <button :disabled="saving || !catalogIsDraft || !accessoryForm.accessory_code || !accessoryForm.display_name" @click="createAccessory">新增配件</button>
          </div>
          <div class="config-form binding">
            <select v-model.number="accessoryBindingForm.product_id" :disabled="!catalogIsDraft"><option :value="0">选择产品</option><option v-for="item in catalogPreview.products" :key="item.product_id" :value="item.product_id">{{ item.display_name }}</option></select>
            <select v-model.number="accessoryBindingForm.accessory_id" :disabled="!catalogIsDraft"><option :value="0">选择配件</option><option v-for="item in catalogPreview.accessories" :key="item.accessory_id" :value="item.accessory_id">{{ item.display_name }}</option></select>
            <input v-model="accessoryBindingForm.selection_group_code" :disabled="!catalogIsDraft" placeholder="选择组 code">
            <input v-model.number="accessoryBindingForm.min_quantity" type="number" min="0" :disabled="!catalogIsDraft" placeholder="最小数量">
            <input v-model.number="accessoryBindingForm.max_quantity" type="number" min="0" :disabled="!catalogIsDraft" placeholder="最大数量">
            <button :disabled="saving || !catalogIsDraft || !accessoryBindingForm.product_id || !accessoryBindingForm.accessory_id" @click="bindAccessory">保存绑定</button>
          </div>
          <table><thead><tr><th>产品 / 配件</th><th>选择组</th><th>必选</th><th>数量</th><th>报价状态</th><th>操作</th></tr></thead><tbody><tr v-for="item in catalogPreview.accessory_bindings" :key="item.binding_id"><td><strong>{{ catalogPreview.products.find((product) => product.product_id === item.product_id)?.display_name }}</strong><small>{{ catalogPreview.accessories.find((accessory) => accessory.accessory_id === item.accessory_id)?.display_name }}</small></td><td><input v-model="item.selection_group_code" :disabled="!catalogIsDraft"></td><td><input v-model="item.required_flag" type="checkbox" :disabled="!catalogIsDraft"></td><td><div class="table-range"><input v-model.number="item.min_quantity" type="number" min="0" :disabled="!catalogIsDraft"><span>～</span><input v-model.number="item.max_quantity" type="number" min="0" :disabled="!catalogIsDraft"></div></td><td>待报价</td><td><button :disabled="saving || !catalogIsDraft" @click="saveAccessoryBinding(item)">保存</button><button :disabled="saving || !catalogIsDraft" @click="saveAccessoryBinding(item, true)">{{ item.status === 'ACTIVE' ? '停用' : '恢复' }}</button></td></tr></tbody></table>
        </section>

        <section class="config-card">
          <header><div><span>07</span><h3>同义别名</h3></div><b>去重匹配，不新增重复 SKU</b></header>
          <div class="config-form two">
            <select v-model="aliasForm.canonical_type" :disabled="!catalogIsDraft" @change="resetAliasTarget"><option value="PRODUCT">产品</option><option value="PRODUCT_VARIANT">变体</option><option value="MATERIAL">材料</option><option value="ACCESSORY">配件</option></select>
            <select v-model.number="aliasForm.canonical_id" :disabled="!catalogIsDraft"><option :value="0">选择规范项</option><option v-for="item in aliasOptions()" :key="item.id" :value="item.id">{{ item.name }}</option></select>
            <input v-model="aliasForm.alias_text" :disabled="!catalogIsDraft" placeholder="同义名称，如 Complete Denture">
            <button :disabled="saving || !catalogIsDraft || !aliasForm.canonical_id || !aliasForm.alias_text" @click="createAlias">新增别名</button>
          </div>
          <div class="config-list"><div v-for="item in catalogPreview.aliases" :key="item.alias_id"><span><input v-model="item.alias_text" :disabled="!catalogIsDraft"><small>{{ item.canonical_type }} #{{ item.canonical_id }}</small></span><i :class="String(item.status).toLowerCase()">{{ item.status }}</i><button :disabled="saving || !catalogIsDraft" @click="saveAlias(item)">保存</button><button :disabled="saving || !catalogIsDraft" @click="saveAlias(item, true)">{{ item.status === 'ACTIVE' ? '停用' : '恢复' }}</button></div></div>
        </section>

        <section class="config-card">
          <header><div><span>08</span><h3>动态与业务规则</h3></div><b>版本化 JSON Schema</b></header>
          <div class="config-form two">
            <select v-model.number="ruleForm.product_id" :disabled="!catalogIsDraft"><option :value="null">全局规则</option><option v-for="item in catalogPreview.products" :key="item.product_id" :value="item.product_id">{{ item.display_name }}</option></select>
            <select v-model="ruleForm.rule_type" :disabled="!catalogIsDraft"><option v-for="value in ['FORM_SCHEMA','TOOTH','UPLOAD','LEAD_TIME','WORKFLOW']" :key="value">{{ value }}</option></select>
            <input v-model="ruleForm.rule_code" :disabled="!catalogIsDraft" placeholder="规则稳定 code">
            <textarea v-model="ruleForm.rule_schema_text" :disabled="!catalogIsDraft" rows="7" spellcheck="false"></textarea>
            <button :disabled="saving || !catalogIsDraft || !ruleForm.rule_code" @click="createRule">校验 JSON 并保存规则</button>
          </div>
          <div class="config-list"><div v-for="item in catalogPreview.rules" :key="item.rule_id"><span><strong>{{ item.rule_code }}</strong><small>{{ item.rule_type }} · {{ item.product_id ? `产品 #${item.product_id}` : '全局' }}</small></span><i :class="String(item.status).toLowerCase()">{{ item.status }}</i><button :disabled="saving || !catalogIsDraft" @click="toggleRule(item)">{{ item.status === 'ACTIVE' ? '停用' : '恢复' }}</button></div></div>
        </section>

        <section class="config-card wide publish-card">
          <header><div><span>09</span><h3>预览与发布</h3></div><b>发布后不可变</b></header>
          <p class="config-note">医生端只读取当前生效版本。提交订单时冻结产品、材料、配件、表单、报价状态与工序映射快照，后续配置调整不改变历史订单；正式价格由客户确认后另行启用。</p>
          <footer><span>完整度：{{ catalogCompleteness.complete }} 个产品可发布，{{ catalogCompleteness.missing }} 个缺工序映射。</span><button class="primary" data-testid="catalog-publish" :disabled="saving || !catalogIsDraft || catalogCompleteness.missing > 0 || catalogPreview.products.length === 0" @click="publishCatalog">预览确认并发布</button></footer>
        </section>
      </div>
    </template>

    <template v-else-if="mode === 'standard-time' && selectedStandardVersion">
      <div class="config-metrics">
        <article><span>工序节点</span><strong>{{ standardCoverage.total }}</strong><small>来自现有工序链，只读结构</small></article>
        <article><span>已配置</span><strong>{{ standardCoverage.configured }}</strong><small>统一按分钟</small></article>
        <article><span>待补充</span><strong>{{ standardCoverage.missing }}</strong><small>允许空值，不填演示数</small></article>
        <article><span>版本状态</span><strong class="text">{{ selectedStandardVersion.publication_status }}</strong><small>发布后只影响新实例</small></article>
      </div>
      <section class="config-card wide">
        <header><div><span>工艺配置</span><h3>标准工时（分钟）</h3></div><b :class="standardIsDraft ? 'draft' : 'locked'">{{ standardIsDraft ? '草稿可编辑' : '已冻结' }}</b></header>
        <div class="standard-actions">
          <input v-model="standardDraftName" placeholder="新版本名称">
          <button :disabled="saving" @click="copyStandardVersion">复制当前版本为草稿</button>
          <input v-model="standardReason" :disabled="!standardIsDraft" placeholder="本次维护原因">
          <button :disabled="saving || !standardIsDraft" @click="saveStandardTimes">批量保存</button>
          <button class="primary" :disabled="saving || !standardIsDraft" @click="publishStandardTimes">发布版本</button>
        </div>
        <div class="standard-actions import-actions">
          <input v-model.number="standardBatchMinutes" type="number" min="0" max="43200" :disabled="!standardIsDraft" placeholder="当前筛选批量分钟">
          <button :disabled="saving || !standardIsDraft" @click="fillStandardTimes">批量填入</button>
          <button :disabled="saving" @click="exportStandardTimes">导出 CSV 模板</button>
          <label class="file-button" :class="{ disabled: saving || !standardIsDraft }"><input type="file" accept=".csv,text/csv" :disabled="saving || !standardIsDraft" @change="importStandardTimes">导入 CSV</label>
        </div>
        <p class="config-note">本页不提供节点新增、删除、排序、拖拽或 DAG 编辑。实际工时仍由员工开始／暂停／继续／完成采集。</p>
        <div class="standard-table-wrap">
          <table><thead><tr><th>产品 / 工序链</th><th>顺序</th><th>节点</th><th>阶段</th><th>标准分钟</th><th>状态</th></tr></thead><tbody><tr v-for="node in filteredStandardNodes" :key="node.standard_time_item_id"><td><strong>{{ node.product_type }}</strong><small>{{ node.chain_name }}</small></td><td>{{ node.step_order }}</td><td>{{ node.process_name }}<small>{{ node.node_code }}</small></td><td>{{ node.stage_name || '—' }}</td><td><input v-model.number="node.standard_duration_minutes" type="number" min="0" max="43200" :disabled="!standardIsDraft" placeholder="暂空"></td><td><select v-model="node.status" :disabled="!standardIsDraft"><option value="ACTIVE">启用</option><option value="INACTIVE">停用</option></select></td></tr></tbody></table>
        </div>
      </section>
    </template>
  </div>
</template>

<style scoped>
.config-center{display:grid;gap:16px;padding:0 0 28px;color:#1c2a3a}.config-toolbar{display:flex;gap:12px;align-items:end;padding:16px;background:#fff;border:1px solid #e3e9f1;border-radius:10px}.config-toolbar label{display:grid;gap:5px;font-size:12px;color:#67768a}.config-toolbar select,.config-toolbar input,.config-form input,.config-form select,.standard-actions input{height:38px;border:1px solid #d6deea;border-radius:6px;padding:0 10px;background:#fff;min-width:150px}.config-form textarea{width:100%;border:1px solid #d6deea;border-radius:6px;padding:9px 10px;background:#fff;font:12px/1.5 ui-monospace,SFMono-Regular,Menlo,monospace;resize:vertical}.config-toolbar button,.config-form button,.config-list button,.standard-actions button,.config-card footer button,.file-button{height:38px;border:1px solid #cfd9e7;border-radius:6px;padding:0 15px;background:#fff;color:#34465d;cursor:pointer}.file-button{display:flex;align-items:center;justify-content:center;font-size:13px;white-space:nowrap}.file-button input{display:none}.file-button.disabled{opacity:.45;cursor:not-allowed}.config-toolbar button:disabled,.config-form button:disabled,.config-list button:disabled,.standard-actions button:disabled,.config-card footer button:disabled{opacity:.45;cursor:not-allowed}.config-search{flex:1}.config-search input{width:100%}.config-alert{padding:12px 16px;border-radius:8px}.config-alert.error{background:#fff1f1;color:#b42318}.config-alert.success{background:#ecfdf3;color:#067647}.config-state{padding:42px;text-align:center;background:#fff;border:1px solid #e3e9f1}.config-metrics{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px}.config-metrics article{display:grid;gap:4px;padding:16px 18px;background:#fff;border:1px solid #e3e9f1;border-radius:10px}.config-metrics span,.config-metrics small{font-size:12px;color:#718096}.config-metrics strong{font-size:26px;color:#12243a}.config-metrics strong.text{font-size:17px}.config-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px}.config-card{padding:18px;background:#fff;border:1px solid #e3e9f1;border-radius:10px;min-width:0}.config-card.wide{grid-column:1/-1}.config-card>header{display:flex;align-items:center;justify-content:space-between;margin-bottom:15px}.config-card>header>div{display:flex;align-items:center;gap:9px}.config-card h3{margin:0;font-size:17px}.config-card header span{font-size:11px;color:#0d9488;font-weight:700}.config-card header b{font-size:12px;color:#667085}.config-card header b.draft{color:#b54708}.config-card header b.locked{color:#027a48}.config-form{display:grid;gap:9px;margin-bottom:12px}.config-form.two{grid-template-columns:1fr 1fr}.config-form.two button,.config-form.two textarea{grid-column:1/-1}.config-form.binding{grid-template-columns:repeat(5,minmax(120px,1fr)) auto}.config-form button,.standard-actions .primary,.config-card footer .primary{background:#0f766e;color:#fff;border-color:#0f766e}.config-list{display:grid;max-height:310px;overflow:auto;border-top:1px solid #edf0f5}.config-list>div{display:flex;align-items:center;gap:9px;padding:10px 2px;border-bottom:1px solid #edf0f5}.config-list span{display:grid;flex:1}.config-list strong{font-size:13px}.config-list small{font-size:11px;color:#7c899a}.config-list i{font-style:normal;font-size:11px;padding:3px 7px;border-radius:12px}.config-list i.active{background:#ecfdf3;color:#067647}.config-list i.inactive{background:#f2f4f7;color:#667085}.config-list button{height:30px;padding:0 9px;font-size:12px}.config-list button.danger{color:#b42318}.config-card table{width:100%;border-collapse:collapse;font-size:13px}.config-card th{text-align:left;padding:10px;background:#f7f9fc;color:#667085}.config-card td{padding:10px;border-bottom:1px solid #edf0f5}.config-card td small{display:block;color:#7c899a;margin-top:3px}.config-card td input:not([type=checkbox]),.config-card td select{box-sizing:border-box;width:100%;min-width:72px;height:30px;border:1px solid #d6deea;border-radius:5px;padding:0 6px}.config-card td button{height:28px;margin:2px;border:1px solid #cfdae7;border-radius:5px;background:#fff;color:#34465d}.table-range{display:flex;align-items:center;gap:4px}.table-range input{max-width:72px}.config-card footer{display:flex;align-items:center;justify-content:space-between;gap:15px;margin-top:15px;color:#667085;font-size:12px}.standard-actions{display:flex;flex-wrap:wrap;gap:9px;margin-bottom:12px}.standard-actions .config-note{flex:1;min-width:280px;margin:0}.config-note{padding:10px 12px;background:#fffaeb;color:#7a2e0e;border-radius:6px;font-size:12px}.standard-table-wrap{max-height:590px;overflow:auto}.standard-table-wrap input,.standard-table-wrap select{height:32px;border:1px solid #d6deea;border-radius:5px;padding:0 8px;width:110px}@media(max-width:1100px){.config-metrics{grid-template-columns:1fr 1fr}.config-grid{grid-template-columns:1fr}.config-form.binding{grid-template-columns:1fr 1fr}.config-form.binding button{grid-column:1/-1}}
</style>
