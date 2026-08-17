<script setup lang="ts">
import { ElMessage, ElMessageBox } from 'element-plus'
import { computed, inject, nextTick, onMounted, reactive, ref } from 'vue'
import type { DoctorFile, DoctorGateway, DoctorProductRecommendation, PatientSummary } from './types/contracts'
import DoctorOrthodonticPrescription from './DoctorOrthodonticPrescription.vue'
import { authenticatedFetchKey } from '../utils/authenticatedFetch'
import { useDoctorI18n } from './doctorI18n'
import {
  CATEGORY_NAMES,
  CLEAR_ALIGNER_ARCH_OPTIONS,
  CLEAR_ALIGNER_PRODUCT_CODE,
  CLEAR_ALIGNER_TREATMENT_OPTIONS,
  CUSTOMER_ORDER_STEPS,
  DENTURE_BASE_SHADES,
  FIXED_PRECISION_ATTACHMENTS,
  ORTHODONTIC_ACCESSORIES,
  ORTHODONTIC_PRODUCT_GROUPS,
  PRODUCT_MATERIAL_OPTIONS,
  UPLOAD_RULES,
  VITA_16_SHADES,
  VITA_3D_SHADES,
  type SourceUploadRule
} from './customerOrderSourceSpec'

const authenticatedFetch = inject(authenticatedFetchKey, fetch)
const { t, locale } = useDoctorI18n()
const dateInputType = computed(() => locale.value === 'EN' ? 'text' : 'date')
const dateInputPlaceholder = computed(() => locale.value === 'EN' ? 'YYYY-MM-DD' : undefined)

type ApiResponse<T> = { data: T; message?: string; msg?: string }
type RestoredOrderFile = {
  file_id: number
  source_type: string
  visibility: string
  original_filename: string
  content_type: string
  file_size: number | null
  upload_status: string
  created_at: string
}
type CatalogProduct = {
  product_id: number
  product_code: string
  display_name: string
  workflow_product_type: string
  tooth_rule_code: string | null
  pricing_status: 'PENDING_QUOTE' | 'PRICED'
  base_price_cents: number | null
  currency: string
  category_code: string
  category_name: string
}
type CatalogVariant = {
  variant_id: number
  product_id: number
  variant_code: string
  display_name: string
}
type CatalogCategory = {
  category_id: number
  category_code: string
  display_name: string
  sort_order: number
}
type CatalogMaterial = {
  product_id: number
  variant_id: number | null
  material_id: number
  material_code: string
  display_name: string
  brand_name: string | null
  specification: string | null
  selection_group_code: string
  required_flag: boolean | number
  selection_mode: 'SINGLE' | 'MULTIPLE'
  default_flag: boolean | number
  min_quantity: number | null
  max_quantity: number | null
  price_increment_cents: number | null
}
type CatalogAccessory = {
  product_id: number
  variant_id: number | null
  accessory_id: number
  accessory_code: string
  display_name: string
  selection_group_code: string
  required_flag: boolean | number
  default_flag: boolean | number
  min_quantity: number | null
  max_quantity: number | null
  price_increment_cents: number | null
}
type CatalogRule = {
  rule_id: number
  product_id: number | null
  variant_id: number | null
  rule_type: 'FORM_SCHEMA' | 'TOOTH' | 'UPLOAD' | 'PRICE' | 'LEAD_TIME' | 'WORKFLOW'
  rule_code: string
  rule_schema_json: unknown
}
type CatalogConfig = {
  publication_status: string
  config_version_id?: number
  categories?: CatalogCategory[]
  products: CatalogProduct[]
  variants?: CatalogVariant[]
  materials?: CatalogMaterial[]
  accessories?: CatalogAccessory[]
  rules?: CatalogRule[]
}
type QuantitySelection = { item_id: number; quantity: number }
type CaseGroupItem = {
  order_id: number
  order_no: string
  line_no: number
  relationship_type: string
  item_client_key: string
  product_id: number
  product_code: string
  product_name: string
  variant_id: number | null
  variant_code: string | null
  variant_name: string | null
  product_type: string
  pricing_status: 'PENDING_QUOTE' | 'PRICED'
  quoted_price_cents: number | null
  quoted_price_currency: string | null
  configuration_status: 'DRAFT' | 'FROZEN'
  form_values: Record<string, unknown>
  material_selections: QuantitySelection[]
  accessory_selections: QuantitySelection[]
  file_ids: number[]
  external_status: string
}
type CaseGroup = {
  group_id: number
  group_no: string
  patient_id: number
  lifecycle_status: 'DRAFT' | 'SUBMITTED'
  external_status: string
  draft_version: number
  shared_file_ids: number[]
  items: CaseGroupItem[]
}
type FormField = {
  key: string
  label: string
  type: string
  required?: boolean
  options?: Array<string | { value: string; label: string }>
  visible_when?: { field?: string; equals?: unknown }
  min?: number
  max?: number
  minimum?: number
  maximum?: number
  min_items?: number
  max_items?: number
}

const props = defineProps<{
  token: string
  patients: PatientSummary[]
  gateway: DoctorGateway
  initialPatientId?: string
  initialGroupId?: number
  clinicName?: string
  doctorName?: string
  clinicContact?: string
}>()
const emit = defineEmits<{
  close: []
  submitted: [group: CaseGroup]
}>()

const categoryNamesEn: Record<string, string> = {
  FIXED_RESTORATION: 'Fixed Restorations', REMOVABLE_PROSTHETICS: 'Removable Prosthetics',
  IMPLANT_RESTORATION: 'Implant Restorations', CONVENTIONAL_ORTHODONTICS: 'Orthodontic Products',
  CLEAR_ALIGNER: 'Clear Aligners', DESIGN_SERVICE: 'Design Services'
}

const sourceTextEn: Record<string, string> = {
  '颌垫类产品': 'Splints & Guards', '保持器类产品': 'Retainers', '功能矫治器': 'Functional Appliances',
  '扩弓器类产品': 'Expansion Appliances', '其它正畸产品': 'Other Orthodontic Products',
  '全颌': 'Full Arch', '上颌': 'Upper Arch', '下颌': 'Lower Arch', '常规矫治': 'Standard Treatment', '联合矫治': 'Combined Treatment',
  '轻': 'Light', '正常': 'Normal', '重': 'Heavy', '空开': 'Clearance', '紧': 'Tight', '点接触': 'Point Contact', '面接触': 'Surface Contact',
  '无': 'None', '中': 'Medium', '其他': 'Other', '是 / 否': 'Yes / No',
  '金属边缘': 'Metal Margin', '包瓷边缘': 'Porcelain Margin', '3/4 金属舌侧边': '3/4 Metal Lingual Margin',
  '螺丝固位': 'Screw-retained', '粘接固位': 'Cement-retained', '外连接': 'External Connection', '内连接': 'Internal Connection',
  '恒牙': 'Permanent Dentition', '乳牙': 'Primary Dentition', '替牙': 'Mixed Dentition',
  '安氏一类': 'Angle Class I', '安氏二类': 'Angle Class II', '安氏三类': 'Angle Class III', '牙型': 'Dental', '骨性': 'Skeletal',
  '拥挤': 'Crowding', '稀疏': 'Spacing', '前突': 'Protrusion', '地包天': 'Underbite',
  '通用': 'General', '个性化': 'Personalized', '标准基台': 'Standard Abutment', '角度基台': 'Angled Abutment', '个性化基台': 'Custom Abutment',
  '颊侧': 'Buccal', '舌侧': 'Lingual', '咬合面': 'Occlusal', '龈上边缘': 'Supragingival Margin', '龈下边缘': 'Subgingival Margin', '肩台标准': 'Standard Shoulder',
  '普通抛光': 'Standard Polish', '镜面抛光': 'Mirror Polish', '必选': 'Required', '可选': 'Optional'
}

function humanizeCode(value: string): string {
  return value.toLowerCase().split(/[_-]+/).filter(Boolean).map((word) => word[0]?.toUpperCase() + word.slice(1)).join(' ')
}

function categoryName(code: string): string {
  return locale.value === 'EN' ? (categoryNamesEn[code] ?? humanizeCode(code)) : (CATEGORY_NAMES[code] ?? code)
}

function localizedSourceText(source: string, code = ''): string {
  if (locale.value !== 'EN') return source
  if (!/[\u3400-\u9fff]/.test(source)) return source
  return sourceTextEn[source] ?? (code && !/[\u3400-\u9fff]/.test(code) ? humanizeCode(code) : 'Configured Option')
}

function catalogProductName(product: Pick<CatalogProduct, 'display_name' | 'product_code'> | Pick<CaseGroupItem, 'product_name' | 'product_code'>): string {
  const source = 'display_name' in product ? product.display_name : product.product_name
  return locale.value === 'EN' && /[\u3400-\u9fff]/.test(source) ? humanizeCode(product.product_code) : source
}

function catalogVariantName(variant: CatalogVariant | null | undefined): string {
  if (!variant) return ''
  return locale.value === 'EN' && /[\u3400-\u9fff]/.test(variant.display_name) ? humanizeCode(variant.variant_code) : variant.display_name
}

function safeEnglishDynamicText(source: string, fallback: string): string {
  return locale.value === 'EN' && /[\u3400-\u9fff]/.test(source) ? fallback : source
}

function caseErrorText(cause: unknown, zh: string, en: string): string {
  const message = cause instanceof Error ? cause.message.trim() : ''
  if (locale.value === 'EN') return message && !/[\u3400-\u9fff]/.test(message) ? message : en
  return message || zh
}

function archOptionLabel(value: string, source: string): string {
  const labels: Record<string, string> = { FULL: 'Full Arch', UPPER: 'Upper Arch', LOWER: 'Lower Arch' }
  return t(source, labels[value] ?? humanizeCode(value))
}

function treatmentOptionLabel(value: string, source: string): string {
  const labels: Record<string, string> = { REGULAR: 'Standard Treatment', COMBINED: 'Combined Treatment' }
  return t(source, labels[value] ?? humanizeCode(value))
}

const steps = computed(() => CUSTOMER_ORDER_STEPS.map((label, index) => t(label, [
  'Case & Products',
  'Teeth & Requirements',
  'Materials & Process',
  'Upload Records',
  'Try-in & Confirmations',
  'Quote & Lead Time'
][index] ?? label)))
const upperTeeth = ['18', '17', '16', '15', '14', '13', '12', '11', '21', '22', '23', '24', '25', '26', '27', '28']
const lowerTeeth = ['48', '47', '46', '45', '44', '43', '42', '41', '31', '32', '33', '34', '35', '36', '37', '38']
const toothTypes = [
  'molar3', 'molar2', 'molar1', 'premolar2', 'premolar1', 'canine', 'incisor2', 'incisor1',
  'incisor1', 'incisor2', 'canine', 'premolar1', 'premolar2', 'molar1', 'molar2', 'molar3'
] as const
const toothDimensions = {
  molar3: { crownWidth: 30, crownHeight: 20, rootWidth: 22, rootHeight: 26, roots: 3 },
  molar2: { crownWidth: 32, crownHeight: 20, rootWidth: 24, rootHeight: 26, roots: 3 },
  molar1: { crownWidth: 34, crownHeight: 21, rootWidth: 26, rootHeight: 28, roots: 3 },
  premolar2: { crownWidth: 24, crownHeight: 18, rootWidth: 13, rootHeight: 26, roots: 2 },
  premolar1: { crownWidth: 25, crownHeight: 18, rootWidth: 14, rootHeight: 26, roots: 2 },
  canine: { crownWidth: 20, crownHeight: 20, rootWidth: 9, rootHeight: 36, roots: 1 },
  incisor2: { crownWidth: 20, crownHeight: 18, rootWidth: 8, rootHeight: 26, roots: 1 },
  incisor1: { crownWidth: 24, crownHeight: 18, rootWidth: 9, rootHeight: 28, roots: 1 }
} as const
type ToothType = keyof typeof toothDimensions
type ToothSvgModel = {
  number: string
  crownPath: string
  rootPaths: string[]
  junction: { x1: number; x2: number; y: number }
  numberPosition: { x: number; y: number }
  hitArea: { x: number; y: number; width: number; height: number }
}

function toothCenters() {
  const widths = toothTypes.map((type) => toothDimensions[type].crownWidth)
  const totalWidth = widths.reduce((sum, width) => sum + width, 0) + 30
  const scale = 640 / totalWidth
  const centers: number[] = []
  let x = 30
  widths.forEach((width) => {
    const scaledWidth = width * scale
    centers.push(x + scaledWidth / 2)
    x += scaledWidth + 2 * scale
  })
  return centers
}

const dentalCenters = toothCenters()

function upperCrownPath(cx: number, top: number, width: number, height: number, type: ToothType) {
  const bottom = top + height
  const half = width / 2
  const quarter = width * .27
  if (type === 'canine') return `M${cx - half} ${bottom} L${cx - half} ${top + 6} Q${cx - half * .5} ${top} ${cx} ${top} Q${cx + half * .5} ${top} ${cx + half} ${top + 6} L${cx + half} ${bottom} Z`
  if (type.startsWith('incisor')) return `M${cx - half} ${bottom} L${cx - half} ${top + 4} Q${cx} ${top - 1} ${cx + half} ${top + 4} L${cx + half} ${bottom} Z`
  if (type.startsWith('premolar')) return `M${cx - half} ${bottom} L${cx - half} ${top + 5} Q${cx - quarter} ${top - 1} ${cx} ${top + 4} Q${cx + quarter} ${top - 1} ${cx + half} ${top + 5} L${cx + half} ${bottom} Z`
  return `M${cx - half} ${bottom} L${cx - half} ${top + 5} Q${cx - width * .37} ${top - 1} ${cx - quarter} ${top + 3} Q${cx} ${top - 2} ${cx + quarter} ${top + 3} Q${cx + width * .37} ${top - 1} ${cx + half} ${top + 5} L${cx + half} ${bottom} Z`
}

function lowerCrownPath(cx: number, top: number, width: number, height: number, type: ToothType) {
  const bottom = top + height
  const half = width / 2
  const quarter = width * .27
  if (type === 'canine') return `M${cx - half} ${top} L${cx + half} ${top} L${cx + half} ${bottom - 6} Q${cx + half * .5} ${bottom} ${cx} ${bottom} Q${cx - half * .5} ${bottom} ${cx - half} ${bottom - 6} Z`
  if (type.startsWith('incisor')) return `M${cx - half} ${top} L${cx + half} ${top} L${cx + half} ${bottom - 4} Q${cx} ${bottom + 1} ${cx - half} ${bottom - 4} Z`
  if (type.startsWith('premolar')) return `M${cx - half} ${top} L${cx + half} ${top} L${cx + half} ${bottom - 5} Q${cx + quarter} ${bottom + 1} ${cx} ${bottom - 4} Q${cx - quarter} ${bottom + 1} ${cx - half} ${bottom - 5} Z`
  return `M${cx - half} ${top} L${cx + half} ${top} L${cx + half} ${bottom - 5} Q${cx + width * .37} ${bottom + 1} ${cx + quarter} ${bottom - 3} Q${cx} ${bottom + 2} ${cx - quarter} ${bottom - 3} Q${cx - width * .37} ${bottom + 1} ${cx - half} ${bottom - 5} Z`
}

function toothRootPaths(cx: number, base: number, width: number, height: number, roots: number, upper: boolean) {
  const half = width / 2
  const tip = upper ? base - height : base + height
  if (roots === 1) {
    return [upper
      ? `M${cx - half} ${base} Q${cx - half * .65} ${tip + height * .32} ${cx} ${tip} Q${cx + half * .65} ${tip + height * .32} ${cx + half} ${base} Z`
      : `M${cx - half} ${base} Q${cx - half * .65} ${tip - height * .32} ${cx} ${tip} Q${cx + half * .65} ${tip - height * .32} ${cx + half} ${base} Z`]
  }
  if (roots === 2) {
    const rootWidth = width * .44
    const rootHalf = rootWidth / 2
    const gap = width * .12
    return [-1, 1].map((side) => {
      const rootCx = cx + side * (rootHalf + gap / 2)
      return upper
        ? `M${rootCx - rootHalf} ${base} Q${rootCx - rootHalf * .6} ${tip + height * .3} ${rootCx} ${tip} Q${rootCx + rootHalf * .6} ${tip + height * .3} ${rootCx + rootHalf} ${base} Z`
        : `M${rootCx - rootHalf} ${base} Q${rootCx - rootHalf * .6} ${tip - height * .3} ${rootCx} ${tip} Q${rootCx + rootHalf * .6} ${tip - height * .3} ${rootCx + rootHalf} ${base} Z`
    })
  }
  const rootWidth = width * .37
  const rootHalf = rootWidth / 2
  return [[0, 1], [-width * .4, .83], [width * .4, .83]].map(([offset, ratio]) => {
    const rootCx = cx + offset
    const rootTip = upper ? base - height * ratio : base + height * ratio
    return upper
      ? `M${rootCx - rootHalf} ${base} Q${rootCx - rootHalf * .6} ${rootTip + height * ratio * .32} ${rootCx} ${rootTip} Q${rootCx + rootHalf * .6} ${rootTip + height * ratio * .32} ${rootCx + rootHalf} ${base} Z`
      : `M${rootCx - rootHalf} ${base} Q${rootCx - rootHalf * .6} ${rootTip - height * ratio * .32} ${rootCx} ${rootTip} Q${rootCx + rootHalf * .6} ${rootTip - height * ratio * .32} ${rootCx + rootHalf} ${base} Z`
  })
}

function createToothSvgModel(number: string, index: number, upper: boolean): ToothSvgModel {
  const type = toothTypes[index]
  const dimensions = toothDimensions[type]
  const cx = dentalCenters[index]
  const occlusionY = upper ? 158 : 238
  const crownTop = upper ? occlusionY - dimensions.crownHeight : occlusionY
  const crownBottom = crownTop + dimensions.crownHeight
  const rootBase = upper ? crownTop : crownBottom
  return {
    number,
    crownPath: upper
      ? upperCrownPath(cx, crownTop, dimensions.crownWidth, dimensions.crownHeight, type)
      : lowerCrownPath(cx, crownTop, dimensions.crownWidth, dimensions.crownHeight, type),
    rootPaths: toothRootPaths(cx, rootBase, dimensions.rootWidth, dimensions.rootHeight, dimensions.roots, upper),
    junction: { x1: cx - dimensions.crownWidth / 2, x2: cx + dimensions.crownWidth / 2, y: rootBase },
    numberPosition: { x: cx, y: upper ? occlusionY + 13 : occlusionY - 5 },
    hitArea: {
      x: cx - dimensions.crownWidth / 2 - 2,
      y: upper ? occlusionY - dimensions.crownHeight - dimensions.rootHeight - 2 : occlusionY - 2,
      width: dimensions.crownWidth + 4,
      height: dimensions.crownHeight + dimensions.rootHeight + 4
    }
  }
}

const upperToothSvg = upperTeeth.map((number, index) => createToothSvgModel(number, index, true))
const lowerToothSvg = lowerTeeth.map((number, index) => createToothSvgModel(number, index, false))
const step = ref(1)
const loading = ref(true)
const busy = ref(false)
const catalog = ref<CatalogConfig | null>(null)
const group = ref<CaseGroup | null>(null)
const patientOptions = ref<PatientSummary[]>([...props.patients])
const patientId = ref(props.initialPatientId ?? '')
const patientKeyword = ref('')
const patientSearchFocused = ref(false)
const productKeyword = ref('')
const recommendCaseNote = ref('')
const recommendLoading = ref(false)
const recommendError = ref('')
const recommendNote = ref('')
const productRecommendations = ref<DoctorProductRecommendation[]>([])
const selectedCategoryCode = ref('')
const pendingProductIds = ref<number[]>([])
const selectedOrderId = ref<number | null>(null)
const notice = ref('')
const itemFiles = reactive<Record<number, DoctorFile[]>>({})
const orthodonticPrescriptionReady = reactive<Record<number, boolean>>({})
const objectFieldDrafts = reactive<Record<string, string>>({})
const objectFieldErrors = reactive<Record<string, string>>({})
const sharedFiles = ref<DoctorFile[]>([])
const fileUploading = ref(false)
const toothDrag = ref<{
  orderId: number
  arch: 'UPPER' | 'LOWER'
  start: string
  end: string
  moved: boolean
} | null>(null)
const suppressToothClick = ref(false)
const finalConfirmations = reactive({
  quote: false,
  requirements: false,
  cycle: false
})
const caseSettings = reactive({
  priority: 'NORMAL',
  required_delivery_date: '',
  appointment_date: '',
  shipping_method: 'COURIER',
  order_type: 'ONLINE',
  inbound_tracking_no: '',
  global_notes: ''
})
const activeProductGroup = ref('')
const newPatientOpen = ref(false)
const newPatientSaving = ref(false)
const newPatient = reactive({
  name: '',
  date_of_birth: '',
  gender: '',
  phone: '',
  email: '',
  medical_notes: ''
})

const selectedPatient = computed(() => patientOptions.value.find((item) => item.patient_id === patientId.value) ?? null)
const patientRows = computed(() => {
  const keyword = patientKeyword.value.trim().toLowerCase()
  return patientOptions.value.filter((item) => !keyword || `${item.patient_name} ${item.patient_code}`.toLowerCase().includes(keyword))
})
const catalogProducts = computed(() => {
  const keyword = productKeyword.value.trim().toLowerCase()
  return (catalog.value?.products ?? [])
    .filter((item) =>
      !keyword || `${item.product_code} ${item.display_name} ${item.category_name}`.toLowerCase().includes(keyword)
    )
})
const catalogCategories = computed(() => {
  const configured = new Map(
    (catalog.value?.categories ?? []).map((category) => [category.category_code, category.display_name])
  )
  return Object.entries(CATEGORY_NAMES).map(([code, sourceName]) => ({
    code,
    name: configured.get(code) ?? sourceName
  }))
})
const selectedCategoryProducts = computed(() =>
  catalogProducts.value.filter((product) => product.category_code === selectedCategoryCode.value)
)
const pendingProducts = computed(() => pendingProductIds.value
  .map((productId) => catalog.value?.products.find((product) => product.product_id === productId))
  .filter((product): product is CatalogProduct => Boolean(product))
)
const selectedProductCount = computed(() => (group.value?.items.length ?? 0) + pendingProducts.value.length)
const selectedProductGroups = computed(() => {
  if (selectedCategoryCode.value !== 'CONVENTIONAL_ORTHODONTICS') {
    return [{ label: '', products: selectedCategoryProducts.value }]
  }
  return ORTHODONTIC_PRODUCT_GROUPS
    .map((group) => ({
      label: group.label,
      products: selectedCategoryProducts.value.filter((product) =>
        (group.codes as readonly string[]).includes(product.product_code)
      )
    }))
    .filter((group) => group.products.length)
})
const activeItem = computed(() =>
  group.value?.items.find((item) => item.order_id === selectedOrderId.value)
  ?? group.value?.items[0]
  ?? null
)
const activeProduct = computed(() =>
  catalog.value?.products.find((product) => product.product_id === activeItem.value?.product_id)
  ?? null
)
const activeVariants = computed(() =>
  (catalog.value?.variants ?? []).filter((variant) => variant.product_id === activeItem.value?.product_id)
)
const activeVariant = computed(() =>
  activeVariants.value.find((variant) => variant.variant_id === activeItem.value?.variant_id) ?? null
)
const activeMaterials = computed(() =>
  (catalog.value?.materials ?? []).filter((binding) =>
    binding.product_id === activeItem.value?.product_id
    && (binding.variant_id == null || binding.variant_id === activeItem.value?.variant_id)
  )
)
const activeMultipleMaterials = computed(() =>
  activeMaterials.value.filter((binding) => binding.selection_mode === 'MULTIPLE')
)
const activeAccessories = computed(() =>
  (catalog.value?.accessories ?? []).filter((binding) =>
    binding.product_id === activeItem.value?.product_id
    && (binding.variant_id == null || binding.variant_id === activeItem.value?.variant_id)
  )
)
function catalogFieldsForItem(item: CaseGroupItem): FormField[] {
  return (catalog.value?.rules ?? [])
    .filter((rule) =>
      rule.rule_type === 'FORM_SCHEMA'
      && (rule.product_id == null || rule.product_id === item.product_id)
      && (rule.variant_id == null || rule.variant_id === item.variant_id)
    )
    .flatMap((rule) => {
      const schema = parseRuleSchema(rule.rule_schema_json)
      return Array.isArray(schema.fields) ? schema.fields as FormField[] : []
    })
}
const stepThreeCoreFields = new Set([
  'material_option',
  'finish_margin_type',
  'shade_system',
  'shade_value',
  'cervical_shade',
  'body_shade',
  'incisal_shade',
  'polish_grade',
  'material_shade_notes',
  'implant_system',
  'implant_diameter_length',
  'connection_type',
  'retention_type',
  'abutment_type',
  'screw_access_position',
  'clasp_design',
  'denture_teeth_brand',
  'denture_base_shade',
  'orthodontic_accessories',
  'orthodontic_accessory_notes',
  'design_delivery_format',
  'design_delivery_turnaround'
])
const activeFields = computed<FormField[]>(() =>
  activeItem.value
    ? catalogFieldsForItem(activeItem.value).filter((field) =>
        field.key !== 'tooth_positions' && !stepThreeCoreFields.has(field.key)
      )
    : []
)
const incompleteItems = computed(() => (group.value?.items ?? []).filter((item) => itemErrors(item).length > 0))
const finalConfirmationComplete = computed(() =>
  finalConfirmations.quote && finalConfirmations.requirements && finalConfirmations.cycle
)

async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await authenticatedFetch(path, {
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
      detail = body.message || body.msg || body.detail || body.error || ''
    } catch {
      detail = await response.text().catch(() => '')
    }
    throw new Error(detail || t('请求失败（{status}）', 'Request failed ({status})', { status: response.status }))
  }
  const payload = await response.json() as ApiResponse<T>
  return payload.data
}

function parseRuleSchema(value: unknown): Record<string, any> {
  if (value && typeof value === 'object') return value as Record<string, any>
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value)
      return parsed && typeof parsed === 'object' ? parsed : {}
    } catch {
      return {}
    }
  }
  return {}
}

function closePatientResults() {
  window.setTimeout(() => {
    patientSearchFocused.value = false
  }, 120)
}

function caseSettingsSnapshot() {
  return {
    case_priority: caseSettings.priority,
    required_delivery_date: caseSettings.required_delivery_date,
    next_patient_appointment_date: caseSettings.appointment_date,
    shipping_method: caseSettings.shipping_method,
    order_type: caseSettings.order_type,
    inbound_tracking_no: caseSettings.inbound_tracking_no,
    global_notes: caseSettings.global_notes
  }
}

function hydrateCaseSettings(item: CaseGroupItem | undefined) {
  if (!item) return
  caseSettings.priority = String(item.form_values.case_priority ?? 'NORMAL')
  caseSettings.required_delivery_date = String(item.form_values.required_delivery_date ?? '')
  caseSettings.appointment_date = String(item.form_values.next_patient_appointment_date ?? '')
  caseSettings.shipping_method = String(item.form_values.shipping_method ?? 'COURIER')
  caseSettings.order_type = String(item.form_values.order_type ?? 'ONLINE')
  caseSettings.inbound_tracking_no = String(item.form_values.inbound_tracking_no ?? '')
  caseSettings.global_notes = String(item.form_values.global_notes ?? '')
}

function productCategory(item: CaseGroupItem) {
  return catalog.value?.products.find((product) => product.product_id === item.product_id)?.category_code ?? ''
}

function productMaterialOptions(item: CaseGroupItem) {
  return PRODUCT_MATERIAL_OPTIONS[item.product_code] ?? []
}

function materialBindingsForItem(item: CaseGroupItem) {
  return (catalog.value?.materials ?? []).filter((binding) =>
    binding.product_id === item.product_id
    && (binding.variant_id == null || binding.variant_id === item.variant_id)
  )
}

function materialBindingLabel(binding: CatalogMaterial) {
  return Array.from(new Set([
    binding.display_name,
    binding.brand_name,
    binding.specification
  ].filter(Boolean))).join(' · ')
}

function normalizedMaterialLabel(value: string) {
  return value.toLocaleLowerCase().replace(/[\s·（）()/_-]+/g, '')
}

function primaryMaterialOptions(item: CaseGroupItem) {
  const sourceOptions = productMaterialOptions(item)
  const publishedOptions = materialBindingsForItem(item)
    .filter((binding) => binding.selection_mode === 'SINGLE')
    .map(materialBindingLabel)
  const options = publishedOptions.length ? publishedOptions : sourceOptions
  const seen = new Set<string>()
  return options.filter((option) => {
    const key = normalizedMaterialLabel(option)
    if (!key || seen.has(key)) return false
    seen.add(key)
    return true
  })
}

function primaryMaterialValue(item: CaseGroupItem) {
  const stored = String(item.form_values.material_option ?? '').trim()
  if (stored) return stored
  const selectedBinding = materialBindingsForItem(item)
    .filter((binding) => binding.selection_mode === 'SINGLE')
    .find((binding) => selected(item.material_selections, binding.material_id))
  return selectedBinding ? materialBindingLabel(selectedBinding) : ''
}

function choosePrimaryMaterial(item: CaseGroupItem, value: string) {
  item.form_values.material_option = value
  const bindings = materialBindingsForItem(item).filter((binding) => binding.selection_mode === 'SINGLE')
  const bindingIds = new Set(bindings.map((binding) => binding.material_id))
  item.material_selections = item.material_selections.filter((entry) => !bindingIds.has(entry.item_id))
  if (!value) return
  const normalized = normalizedMaterialLabel(value)
  const matched = bindings.find((binding) => {
    const candidate = normalizedMaterialLabel(materialBindingLabel(binding))
    return candidate === normalized || candidate.includes(normalized) || normalized.includes(candidate)
  })
  if (matched) {
    item.material_selections.push({
      item_id: matched.material_id,
      quantity: Math.max(1, matched.min_quantity ?? 1)
    })
  }
}

function uploadRules(item: CaseGroupItem): SourceUploadRule[] {
  return UPLOAD_RULES[productCategory(item)] ?? []
}

function clearAlignerTypes(item: CaseGroupItem) {
  return [{ code: item.product_code || CLEAR_ALIGNER_PRODUCT_CODE, name: item.product_name }]
}

function relatedOrders(item: CaseGroupItem) {
  return (group.value?.items ?? [])
    .filter((candidate) => candidate.order_id !== item.order_id)
    .map((candidate) => ({
      order_id: candidate.order_id,
      order_no: candidate.order_no,
      product_name: candidate.product_name
    }))
}

function prescriptionInitialRecords(item: CaseGroupItem) {
  return Object.fromEntries([
    'facial_photos',
    'intraoral_photos',
    'panoramic',
    'cephalometric',
    'upper_model',
    'lower_model',
    'bite_model'
  ].map((slot) => [slot, uploadedSlotIds(item, slot).join(',')]))
}

function updateClearAlignerSelection(item: CaseGroupItem, selection: { treatment_arch: string; treatment_mode: string }) {
  item.form_values.treatment_arch = selection.treatment_arch
  item.form_values.treatment_mode = selection.treatment_mode
}

function uploadedSlotIds(item: CaseGroupItem, slotCode: string) {
  const value = item.form_values.upload_slot_files
  if (!value || typeof value !== 'object' || Array.isArray(value)) return []
  const ids = (value as Record<string, unknown>)[slotCode]
  return Array.isArray(ids) ? ids.map(Number).filter(Number.isFinite) : []
}

function distinctFileIds(values: Array<number | string>) {
  return [...new Set(values.map(Number).filter((value) => Number.isSafeInteger(value) && value > 0))]
}

function itemSelectedFileIds(item: CaseGroupItem) {
  return distinctFileIds([
    ...(item.file_ids ?? []),
    ...(itemFiles[item.order_id] ?? []).map((file) => file.file_id)
  ])
}

function restoredFileKind(file: Pick<RestoredOrderFile, 'original_filename' | 'content_type'>): DoctorFile['kind'] {
  const filename = file.original_filename.toLowerCase()
  const contentType = file.content_type.toLowerCase()
  if (filename.endsWith('.stl') || contentType.includes('stl')) return 'STL'
  if (filename.endsWith('.pdf') || contentType === 'application/pdf') return 'PDF'
  if (/\.(jpe?g|png|webp)$/i.test(filename) || contentType.startsWith('image/')) return 'IMAGE'
  return 'OTHER'
}

function restoredFileSizeLabel(size: number | null) {
  if (size == null || !Number.isFinite(size) || size < 0) return t('大小未记录', 'Size Not Recorded')
  if (size < 1024) return `${size} B`
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`
  return `${(size / 1024 / 1024).toFixed(1)} MB`
}

function toDoctorFile(fileId: number, metadata?: RestoredOrderFile): DoctorFile {
  return {
    file_id: String(fileId),
    name: metadata?.original_filename || t('附件 #{id}', 'Attachment #{id}', { id: fileId }),
    kind: metadata ? restoredFileKind(metadata) : 'OTHER',
    size_label: restoredFileSizeLabel(metadata?.file_size ?? null),
    status: 'READY',
    uploaded_at: metadata?.created_at || ''
  }
}

async function restoreAttachedFiles(restored: CaseGroup) {
  const metadataById = new Map<number, RestoredOrderFile>()
  const results = await Promise.allSettled(
    restored.items.map((item) => api<RestoredOrderFile[]>(`/orders/${item.order_id}/files`))
  )
  for (const result of results) {
    if (result.status !== 'fulfilled') continue
    for (const file of result.value) metadataById.set(file.file_id, file)
  }

  sharedFiles.value = distinctFileIds(restored.shared_file_ids ?? [])
    .map((fileId) => toDoctorFile(fileId, metadataById.get(fileId)))
  for (const orderId of Object.keys(itemFiles)) delete itemFiles[Number(orderId)]
  for (const item of restored.items) {
    itemFiles[item.order_id] = distinctFileIds(item.file_ids ?? [])
      .map((fileId) => toDoctorFile(fileId, metadataById.get(fileId)))
  }
}

function sourceArray(item: CaseGroupItem, key: string) {
  const value = item.form_values[key]
  return Array.isArray(value) ? value.map(String) : []
}

function toggleSourceArray(item: CaseGroupItem, key: string, value: string, checked: boolean) {
  const next = new Set(sourceArray(item, key))
  if (checked) next.add(value)
  else next.delete(value)
  item.form_values[key] = Array.from(next)
}

async function createPatientFromWizard() {
  if (!newPatient.name.trim() || newPatientSaving.value) {
    ElMessage.warning(t('请填写患者姓名', 'Enter the patient name'))
    return
  }
  newPatientSaving.value = true
  try {
    const created = await props.gateway.createPatient({
      patientName: newPatient.name.trim(),
      patientAge: null,
      patientGender: newPatient.gender || null,
      dateOfBirth: newPatient.date_of_birth || null,
      phone: newPatient.phone.trim(),
      email: newPatient.email.trim(),
      medicalNotes: newPatient.medical_notes.trim(),
      treatmentStatus: 'IN_TREATMENT',
      treatmentStartedAt: new Date().toISOString().slice(0, 10),
      treatmentEndedAt: null,
      oralDescription: '',
      tags: []
    })
    patientOptions.value.unshift(created)
    patientId.value = created.patient_id
    newPatientOpen.value = false
    Object.assign(newPatient, {
      name: '',
      date_of_birth: '',
      gender: '',
      phone: '',
      email: '',
      medical_notes: ''
    })
    ElMessage.success(t('患者已新增并选中', 'Patient created and selected'))
  } catch (cause) {
    ElMessage.error(caseErrorText(cause, '新增患者失败', 'Failed to create patient'))
  } finally {
    newPatientSaving.value = false
  }
}

async function loadCatalog() {
  catalog.value = await api<CatalogConfig>('/catalog/configuration/active')
  if (selectedCategoryCode.value && !catalogCategories.value.some((category) => category.code === selectedCategoryCode.value)) {
    selectedCategoryCode.value = ''
  }
}

async function restoreDraft() {
  const requestedGroupId = props.initialGroupId
  if (requestedGroupId == null || !Number.isSafeInteger(requestedGroupId) || requestedGroupId <= 0) return
  try {
    const restored = await api<CaseGroup>(`/order-case-groups/${requestedGroupId}`)
    if (
      restored.lifecycle_status === 'DRAFT'
      && (!props.initialPatientId || String(restored.patient_id) === props.initialPatientId)
    ) {
      group.value = restored
      patientId.value = String(restored.patient_id)
      selectedOrderId.value = restored.items[0]?.order_id ?? null
      selectedCategoryCode.value = catalog.value?.products.find((product) => product.product_id === restored.items[0]?.product_id)?.category_code ?? ''
      hydrateCaseSettings(restored.items[0])
      await restoreAttachedFiles(restored)
      step.value = 1
      notice.value = t('已恢复草稿 {group}', 'Draft {group} restored', { group: restored.group_no })
    }
  } catch {
    notice.value = t('草稿恢复失败，请返回草稿列表后重试', 'Failed to restore the draft. Return to the draft list and try again.')
  }
}

async function ensureGroup() {
  if (group.value) return group.value
  if (!patientId.value) throw new Error(t('请先选择患者', 'Select a patient first'))
  const created = await api<CaseGroup>('/order-case-groups', {
    method: 'POST',
    body: JSON.stringify({
      patient_id: Number(patientId.value),
      idempotency_key: crypto.randomUUID()
    })
  })
  group.value = created
  return created
}

async function persistPendingProductsUnlocked() {
  try {
    for (const productId of [...pendingProductIds.value]) {
      const product = catalog.value?.products.find((candidate) => candidate.product_id === productId)
      if (!product) {
        removePendingProduct(productId)
        continue
      }
      const current = await ensureGroup()
      const next = await api<CaseGroup>(`/order-case-groups/${current.group_id}/items`, {
        method: 'POST',
        body: JSON.stringify({
          product_id: product.product_id,
          item_client_key: crypto.randomUUID(),
          form_values: caseSettingsSnapshot(),
          material_selections: [],
          accessory_selections: [],
          file_ids: [],
          expected_draft_version: current.draft_version
        })
      })
      group.value = next
      selectedOrderId.value = next.items.at(-1)?.order_id ?? null
      removePendingProduct(productId)
    }
    if (!group.value?.items.length) {
      ElMessage.error(t('所选产品已不可用，请重新选择', 'The selected product is no longer available. Select another product.'))
      return false
    }
    return true
  } catch (cause) {
    ElMessage.error(caseErrorText(cause, '保存所选产品失败', 'Failed to save selected products'))
    return false
  }
}

async function copyItem(item: CaseGroupItem) {
  if (!group.value || busy.value) return
  busy.value = true
  try {
    group.value = await api<CaseGroup>(
      `/order-case-groups/${group.value.group_id}/items/${item.order_id}/copy`,
      {
        method: 'POST',
        body: JSON.stringify({
          item_client_key: crypto.randomUUID(),
          expected_draft_version: group.value.draft_version
        })
      }
    )
    selectedOrderId.value = group.value.items.at(-1)?.order_id ?? null
    ElMessage.success(t('产品已复制，原产品资料未重复添加', 'Product copied without duplicating the original product records'))
  } catch (cause) {
    ElMessage.error(caseErrorText(cause, '复制失败', 'Copy failed'))
  } finally {
    busy.value = false
  }
}

async function removeItem(item: CaseGroupItem) {
  if (!group.value || busy.value) return
  busy.value = true
  try {
    await ElMessageBox.confirm(t('移除“{product}”？专属上传会被安全停用。', 'Remove “{product}”? Product-specific uploads will be disabled securely.', { product: catalogProductName(item) }), t('移除子产品', 'Remove Product'), {
      confirmButtonText: t('确认移除', 'Remove'),
      cancelButtonText: t('取消', 'Cancel'),
      type: 'warning'
    })
    group.value = await api<CaseGroup>(
      `/order-case-groups/${group.value.group_id}/items/${item.order_id}`,
      {
        method: 'DELETE',
        body: JSON.stringify({ expected_draft_version: group.value.draft_version })
      }
    )
    delete itemFiles[item.order_id]
    selectedOrderId.value = group.value.items[0]?.order_id ?? null
    ElMessage.success(t('产品已移除', 'Product removed'))
  } catch (cause) {
    if (cause !== 'cancel' && cause !== 'close') {
      ElMessage.error(caseErrorText(cause, '移除失败', 'Remove failed'))
    }
  } finally {
    busy.value = false
  }
}

function selected(list: QuantitySelection[], itemId: number) {
  return list.some((item) => item.item_id === itemId)
}

function selectionQuantity(list: QuantitySelection[], itemId: number) {
  return list.find((item) => item.item_id === itemId)?.quantity ?? 1
}

function toggleMaterial(binding: CatalogMaterial, checked: boolean) {
  const item = activeItem.value
  if (!item) return
  if (checked && binding.selection_mode === 'SINGLE') {
    const groupIds = new Set(activeMaterials.value
      .filter((candidate) => candidate.selection_group_code === binding.selection_group_code)
      .map((candidate) => candidate.material_id))
    item.material_selections = item.material_selections.filter((entry) => !groupIds.has(entry.item_id))
  }
  item.material_selections = checked
    ? [...item.material_selections.filter((entry) => entry.item_id !== binding.material_id), {
        item_id: binding.material_id,
        quantity: Math.max(1, binding.min_quantity ?? 1)
      }]
    : item.material_selections.filter((entry) => entry.item_id !== binding.material_id)
}

function toggleAccessory(binding: CatalogAccessory, checked: boolean) {
  const item = activeItem.value
  if (!item) return
  item.accessory_selections = checked
    ? [...item.accessory_selections.filter((entry) => entry.item_id !== binding.accessory_id), {
        item_id: binding.accessory_id,
        quantity: Math.max(1, binding.min_quantity ?? 1)
      }]
    : item.accessory_selections.filter((entry) => entry.item_id !== binding.accessory_id)
}

function setSelectionQuantity(type: 'material' | 'accessory', itemId: number, value: number) {
  const item = activeItem.value
  if (!item) return
  const list = type === 'material' ? item.material_selections : item.accessory_selections
  const entry = list.find((candidate) => candidate.item_id === itemId)
  if (entry) entry.quantity = Math.max(1, Number(value) || 1)
}

function fieldVisible(field: FormField, item: CaseGroupItem) {
  const condition = field.visible_when
  return !condition?.field || !('equals' in condition) || item.form_values[condition.field] === condition.equals
}

function optionValue(option: string | { value: string; label: string }) {
  return typeof option === 'string' ? option : option.value
}

function optionLabel(option: string | { value: string; label: string }) {
  return typeof option === 'string' ? option : option.label
}

function updateArrayField(item: CaseGroupItem, key: string, value: string) {
  item.form_values[key] = value.split(/[,，]/).map((entry) => entry.trim()).filter(Boolean)
}

function updateMultiSelectField(item: CaseGroupItem, key: string, event: Event) {
  const target = event.target as HTMLSelectElement
  item.form_values[key] = Array.from(target.selectedOptions).map((option) => option.value)
}

function updateBooleanField(item: CaseGroupItem, key: string, value: boolean) {
  item.form_values[key] = value
}

function updateTextField(item: CaseGroupItem, key: string, value: string) {
  item.form_values[key] = value
}

function fieldType(field: FormField) {
  return (field.type || 'string').toLowerCase()
}

function objectFieldKey(item: CaseGroupItem, key: string) {
  return `${item.order_id}:${key}`
}

function objectFieldText(item: CaseGroupItem, key: string) {
  const draftKey = objectFieldKey(item, key)
  if (Object.prototype.hasOwnProperty.call(objectFieldDrafts, draftKey)) {
    return objectFieldDrafts[draftKey]
  }
  const value = item.form_values[key]
  return value && typeof value === 'object' && !Array.isArray(value)
    ? JSON.stringify(value, null, 2)
    : ''
}

function updateObjectFieldDraft(item: CaseGroupItem, key: string, value: string) {
  objectFieldDrafts[objectFieldKey(item, key)] = value
}

function commitObjectField(item: CaseGroupItem, key: string) {
  const draftKey = objectFieldKey(item, key)
  if (!Object.prototype.hasOwnProperty.call(objectFieldDrafts, draftKey)) return true
  const raw = objectFieldDrafts[draftKey].trim()
  if (!raw) {
    delete item.form_values[key]
    delete objectFieldErrors[draftKey]
    return true
  }
  try {
    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      throw new Error(t('补充内容格式不正确', 'Additional content has an invalid format'))
    }
    item.form_values[key] = parsed
    objectFieldDrafts[draftKey] = JSON.stringify(parsed, null, 2)
    delete objectFieldErrors[draftKey]
    return true
  } catch (cause) {
    objectFieldErrors[draftKey] = caseErrorText(cause, '补充内容格式不正确', 'Additional content has an invalid format')
    return false
  }
}

function commitItemObjectFields(item: CaseGroupItem) {
  return catalogFieldsForItem(item)
    .filter((field) => fieldType(field) === 'object')
    .every((field) => commitObjectField(item, field.key))
}

function caseStepOneErrors() {
  const errors: string[] = []
  if (!caseSettings.required_delivery_date) errors.push(t('请选择要求到货日期', 'Select a requested delivery date'))
  if (['IMPRESSION', 'REWORK', 'RETURN'].includes(caseSettings.order_type)
    && !caseSettings.inbound_tracking_no.trim()) {
    errors.push(t('请填写寄模运单号', 'Enter the inbound model tracking number'))
  }
  return errors
}

function itemStepErrors(item: CaseGroupItem, targetStep: number) {
  const errors: string[] = []
  const product = catalog.value?.products.find((candidate) => candidate.product_id === item.product_id)
  if (!product) errors.push(t('所选产品暂不可用，请重新选择', 'The selected product is unavailable. Select another product.'))
  if (targetStep === 1) {
    errors.push(...caseStepOneErrors())
  }
  if (targetStep === 2 && product?.tooth_rule_code && !selectedTeeth(item).length) {
    errors.push(t('请选择牙位', 'Select tooth positions'))
  }

  const requiredSourceFields: Record<string, Array<[string, string]>> = {
    FIXED_RESTORATION: [
      ['occlusion_level', t('请选择咬合', 'Select occlusion')],
      ['contact_level', t('请选择邻接', 'Select contact')],
      ['stain_level', t('请选择染色', 'Select staining')],
      ['margin_type', t('请选择边缘类型', 'Select a margin type')]
    ],
    REMOVABLE_PROSTHETICS: [
      ['occlusion_level', t('请选择咬合', 'Select occlusion')],
      ['stain_level', t('请选择染色', 'Select staining')]
    ],
    IMPLANT_RESTORATION: [
      ['retention_type', t('请选择固位方式', 'Select a retention type')],
      ['implant_system', t('请选择种植系统', 'Select an implant system')],
      ['implant_diameter_length', t('请填写种植直径与长度', 'Enter implant diameter and length')],
      ['connection_type', t('请选择连接方式', 'Select a connection type')]
    ],
    CONVENTIONAL_ORTHODONTICS: [
      ['dentition_stage', t('请选择牙龄', 'Select a dentition stage')],
      ['angle_class', t('请选择错颌畸形类别', 'Select a malocclusion class')],
      ['skeletal_type', t('请选择骨骼类型', 'Select a skeletal type')],
      ['orthodontic_concern', t('请选择诉求问题', 'Select the orthodontic concerns')]
    ],
    CLEAR_ALIGNER: [
      ['treatment_arch', t('请选择矫治牙颌', 'Select a treatment arch')],
      ['treatment_mode', t('请选择矫治方式', 'Select a treatment mode')]
    ],
    DESIGN_SERVICE: [
      ['delivery_format', t('请选择交付数据格式', 'Select a delivery data format')],
      ['design_standard', t('请选择设计标准', 'Select a design standard')],
      ['design_requirement_turnaround', t('请选择设计时间', 'Select a design turnaround')]
    ]
  }
  if (targetStep === 2) {
    for (const [key, message] of requiredSourceFields[product?.category_code ?? ''] ?? []) {
      const value = item.form_values[key]
      if (value == null || value === '' || (Array.isArray(value) && !value.length)) errors.push(message)
    }
  }
  if (targetStep === 3) {
    const variants = (catalog.value?.variants ?? []).filter((candidate) => candidate.product_id === item.product_id)
    if (variants.length && !item.variant_id) errors.push(t('请选择产品变体', 'Select a product variant'))
    if (productMaterialOptions(item).length && !String(item.form_values.material_option ?? '').trim()) {
      errors.push(t('请选择材料/制作项目', 'Select a material or manufacturing item'))
    }
    if (product?.category_code === 'DESIGN_SERVICE') {
      if (!String(item.form_values.design_delivery_format ?? '').trim()) errors.push(t('请选择设计交付文件格式', 'Select a design delivery file format'))
      if (!String(item.form_values.design_delivery_turnaround ?? '').trim()) errors.push(t('请选择设计交期', 'Select a design delivery time'))
    }

    const materialBindings = (catalog.value?.materials ?? []).filter((binding) =>
      binding.product_id === item.product_id
      && (binding.variant_id == null || binding.variant_id === item.variant_id)
    )
    const materialGroups = new Map<string, CatalogMaterial[]>()
    materialBindings.forEach((binding) => {
      const list = materialGroups.get(binding.selection_group_code) ?? []
      list.push(binding)
      materialGroups.set(binding.selection_group_code, list)
    })
    materialGroups.forEach((bindings) => {
      if (bindings.some((binding) => Boolean(binding.required_flag))
        && !bindings.some((binding) => selected(item.material_selections, binding.material_id))) {
        errors.push(t('请选择必选材料', 'Select all required materials'))
      }
    })
    const fields = catalogFieldsForItem(item)
    fields.filter((field) => field.required && fieldVisible(field, item)).forEach((field) => {
      const value = item.form_values[field.key]
      if (value == null || value === '' || (Array.isArray(value) && !value.length)) errors.push(t('{field}必填', '{field} is required', { field: localizedSourceText(field.label, field.key) }))
    })
    Object.entries(objectFieldErrors)
      .filter(([key]) => key.startsWith(`${item.order_id}:`))
      .forEach(([, message]) => errors.push(message))
  }

  if (targetStep === 4) {
    for (const rule of uploadRules(item).filter((rule) => rule.required)) {
      if (!uploadedSlotIds(item, rule.code).length) errors.push(t('请上传{label}', 'Upload {label}', { label: localizedSourceText(rule.label, rule.code) }))
    }
  }

  if (targetStep === 5
    && item.form_values.physical_model_shipping_required
    && !String(item.form_values.physical_model_tracking_no ?? '').trim()) {
    errors.push(t('请填写实体模型运单号或配送说明', 'Enter the physical model tracking number or delivery notes'))
  }
  if (targetStep === 5
    && product?.category_code === 'CLEAR_ALIGNER'
    && !orthodonticPrescriptionReady[item.order_id]) {
    errors.push(t('请完成并提交隐形正畸七步处方', 'Complete and submit the seven-step clear aligner prescription'))
  }

  return errors
}

function itemErrors(item: CaseGroupItem) {
  return Array.from(new Set([1, 2, 3, 4, 5].flatMap((targetStep) => itemStepErrors(item, targetStep))))
}

function selectedTeeth(item: CaseGroupItem) {
  const value = item.form_values.tooth_positions
  const entries = Array.isArray(value)
    ? value.map(String)
    : String(value ?? '').split(/[,，、\s]+/)
  return Array.from(new Set(entries.map((entry) => entry.trim()).filter(Boolean)))
}

function toothModes(item: CaseGroupItem) {
  const value = item.form_values.tooth_modes
  return value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, string>
    : {}
}

function toothModeOptions(item: CaseGroupItem) {
  const category = productCategory(item)
  if (category === 'REMOVABLE_PROSTHETICS') {
    return [
      { value: 'MISSING', label: t('缺失位', 'Missing Tooth') },
      { value: 'CLASP', label: t('卡环位', 'Clasp Tooth') }
    ]
  }
  if (category === 'CONVENTIONAL_ORTHODONTICS') {
    return [
      { value: 'ORTHO_AREA', label: t('正畸区域', 'Orthodontic Area') },
      { value: 'BAND', label: t('带环牙位', 'Band Tooth') }
    ]
  }
  if (category === 'CLEAR_ALIGNER') {
    return [{ value: 'ORTHO_AREA', label: t('目标矫治牙位', 'Target Treatment Teeth') }]
  }
  if (category === 'IMPLANT_RESTORATION') {
    return [
      { value: 'CROWN', label: t('单冠', 'Single Crown') },
      { value: 'BRIDGE', label: t('桥', 'Bridge') },
      { value: 'ABUTMENT', label: t('加基台', 'Add Abutment') },
      { value: 'FRAMEWORK', label: t('加桥架', 'Add Framework') }
    ]
  }
  return [
    { value: 'CROWN', label: t('单冠', 'Single Crown') },
    { value: 'BRIDGE', label: t('桥', 'Bridge') }
  ]
}

function currentToothMode(item: CaseGroupItem) {
  const stored = String(item.form_values.current_tooth_mode ?? '')
  const options = toothModeOptions(item)
  return options.some((option) => option.value === stored) ? stored : options[0]?.value ?? 'CROWN'
}

function toothSelected(item: CaseGroupItem, tooth: string) {
  return selectedTeeth(item).includes(tooth)
}

function setToothMode(item: CaseGroupItem, tooth: string, mode: string) {
  const modes = { ...toothModes(item) }
  if (modes[tooth] === mode) delete modes[tooth]
  else modes[tooth] = mode
  item.form_values.tooth_modes = modes
  item.form_values.tooth_positions = [...upperTeeth, ...lowerTeeth].filter((candidate) => modes[candidate]).join(',')
}

function applyToothMode(item: CaseGroupItem, targets: string[], mode: string) {
  const modes = { ...toothModes(item) }
  targets.forEach((tooth) => { modes[tooth] = mode })
  item.form_values.tooth_modes = modes
  item.form_values.tooth_positions = [...upperTeeth, ...lowerTeeth].filter((candidate) => modes[candidate]).join(',')
}

function singleClickToothMode(item: CaseGroupItem) {
  const category = productCategory(item)
  if (category === 'REMOVABLE_PROSTHETICS') return 'MISSING'
  if (['CONVENTIONAL_ORTHODONTICS', 'CLEAR_ALIGNER'].includes(category)) return 'ORTHO_AREA'
  if (category === 'IMPLANT_RESTORATION') {
    const current = currentToothMode(item)
    if (['ABUTMENT', 'FRAMEWORK'].includes(current)) return current
  }
  return 'CROWN'
}

function dragToothMode(item: CaseGroupItem) {
  const category = productCategory(item)
  if (category === 'REMOVABLE_PROSTHETICS') return 'MISSING'
  if (['CONVENTIONAL_ORTHODONTICS', 'CLEAR_ALIGNER'].includes(category)) return 'ORTHO_AREA'
  return 'BRIDGE'
}

function toothClick(item: CaseGroupItem, tooth: string) {
  if (suppressToothClick.value) {
    suppressToothClick.value = false
    return
  }
  setToothMode(item, tooth, singleClickToothMode(item))
}

function beginToothDrag(item: CaseGroupItem, tooth: string, arch: 'UPPER' | 'LOWER') {
  toothDrag.value = {
    orderId: item.order_id,
    arch,
    start: tooth,
    end: tooth,
    moved: false
  }
}

function extendToothDrag(item: CaseGroupItem, tooth: string, arch: 'UPPER' | 'LOWER') {
  const drag = toothDrag.value
  if (!drag || drag.orderId !== item.order_id || drag.arch !== arch || drag.end === tooth) return
  drag.end = tooth
  drag.moved = drag.start !== drag.end
}

function finishToothDrag(item: CaseGroupItem) {
  const drag = toothDrag.value
  toothDrag.value = null
  if (!drag || drag.orderId !== item.order_id || !drag.moved) return
  const archTeeth = drag.arch === 'UPPER' ? upperTeeth : lowerTeeth
  const start = archTeeth.indexOf(drag.start)
  const end = archTeeth.indexOf(drag.end)
  if (start < 0 || end < 0) return
  applyToothMode(item, archTeeth.slice(Math.min(start, end), Math.max(start, end) + 1), dragToothMode(item))
  suppressToothClick.value = true
  window.setTimeout(() => {
    suppressToothClick.value = false
  }, 0)
}

function doubleClickTooth(item: CaseGroupItem, tooth: string) {
  suppressToothClick.value = false
  const category = productCategory(item)
  if (category === 'REMOVABLE_PROSTHETICS') {
    setToothMode(item, tooth, 'CLASP')
    return
  }
  if (category === 'CONVENTIONAL_ORTHODONTICS') {
    setToothMode(item, tooth, 'BAND')
    return
  }
  if (category === 'CLEAR_ALIGNER') {
    const arch = String(item.form_values.treatment_arch ?? '')
    const targets = arch === 'UPPER' ? upperTeeth : arch === 'LOWER' ? lowerTeeth : [...upperTeeth, ...lowerTeeth]
    applyToothMode(item, targets, 'ORTHO_AREA')
    return
  }
  applyToothMode(item, [...upperTeeth, ...lowerTeeth], 'CROWN')
}

function toothModeLabel(item: CaseGroupItem, tooth: string) {
  const mode = toothModes(item)[tooth]
  return toothModeOptions(item).find((option) => option.value === mode)?.label ?? ''
}

function toothSelectionSummary(item: CaseGroupItem) {
  const modes = toothModes(item)
  const groups = toothModeOptions(item)
    .map((option) => ({
      label: option.label,
      teeth: [...upperTeeth, ...lowerTeeth].filter((tooth) => modes[tooth] === option.value)
    }))
    .filter((group) => group.teeth.length)
  if (!groups.length) return toothGestureHelp(item)
  return groups.map((group) => `${group.label}${locale.value === 'EN' ? ': ' : '：'}${group.teeth.join(locale.value === 'EN' ? ', ' : '、')}`).join(' | ')
}

function toothLegend(item: CaseGroupItem) {
  const category = productCategory(item)
  if (category === 'REMOVABLE_PROSTHETICS') {
    return [{ label: t('缺失位', 'Missing Tooth'), tone: 'single' }, { label: t('卡环位', 'Clasp Tooth'), tone: 'special' }]
  }
  if (category === 'CONVENTIONAL_ORTHODONTICS') {
    return [{ label: t('正畸区域', 'Orthodontic Area'), tone: 'single' }, { label: t('带环牙位', 'Band Tooth'), tone: 'special' }]
  }
  if (category === 'IMPLANT_RESTORATION') {
    return [{ label: t('单冠 / 单位', 'Single Crown / Unit'), tone: 'single' }, { label: t('桥体（连续拖拽）', 'Bridge (Drag Continuously)'), tone: 'bridge' }, { label: t('基台标记', 'Abutment Marker'), tone: 'special' }]
  }
  return [{ label: t('单冠 / 单位', 'Single Crown / Unit'), tone: 'single' }, { label: t('桥体（连续拖拽）', 'Bridge (Drag Continuously)'), tone: 'bridge' }]
}

function clearTeeth(item: CaseGroupItem) {
  item.form_values.tooth_positions = ''
  item.form_values.tooth_modes = {}
}

function toothSelectionLabel(item: CaseGroupItem) {
  const product = catalog.value?.products.find((candidate) => candidate.product_id === item.product_id)
  if (product?.category_code === 'REMOVABLE_PROSTHETICS') return t('缺失牙位', 'Missing Teeth')
  if (product?.category_code === 'IMPLANT_RESTORATION') return t('种植 / 修复牙位', 'Implant / Restoration Teeth')
  if (product?.category_code === 'CONVENTIONAL_ORTHODONTICS') return t('正畸涉及牙位', 'Orthodontic Teeth')
  if (product?.category_code === 'CLEAR_ALIGNER') return t('隐形正畸目标牙位', 'Clear Aligner Target Teeth')
  return t('修复牙位', 'Restoration Teeth')
}

function toothGestureHelp(item: CaseGroupItem) {
  const category = productCategory(item)
  if (category === 'REMOVABLE_PROSTHETICS') return t('单击标缺失位，拖拽连续选择缺失位，双击标卡环位', 'Click to mark missing teeth, drag for a continuous range, and double-click to mark a clasp tooth')
  if (category === 'CONVENTIONAL_ORTHODONTICS') return t('单击或拖拽选择正畸区域，双击标带环牙位', 'Click or drag to select the orthodontic area; double-click to mark a band tooth')
  if (category === 'CLEAR_ALIGNER') return t('单击或拖拽选择目标牙位，双击按已选牙颌快速选择', 'Click or drag to select target teeth; double-click to select the chosen arch')
  if (category === 'IMPLANT_RESTORATION') return t('单击标单冠，拖拽标桥，双击任意牙位全口选择；可切换基台/桥架后点选对应牙位', 'Click for a single crown, drag for a bridge, or double-click for a full arch. Switch to abutment or framework mode to mark related teeth.')
  return t('单击标单冠，拖拽标桥，双击任意牙位全口选择', 'Click for a single crown, drag for a bridge, or double-click for a full arch')
}

function persistedProductSelected(product: CatalogProduct) {
  return Boolean(group.value?.items.some((item) => item.product_id === product.product_id))
}

function productSelected(product: CatalogProduct) {
  return persistedProductSelected(product) || pendingProductIds.value.includes(product.product_id)
}

function removePendingProduct(productId: number) {
  const index = pendingProductIds.value.indexOf(productId)
  if (index < 0) return
  pendingProductIds.value = pendingProductIds.value.filter((_, candidateIndex) => candidateIndex !== index)
}

function copyPendingProduct(product: CatalogProduct) {
  if (busy.value) return
  pendingProductIds.value = [...pendingProductIds.value, product.product_id]
  ElMessage.success(t('已复制 {product}，点击下一步后分别创建产品订单', 'Copied {product}. Continue to create separate product orders.', { product: catalogProductName(product) }))
}

function toggleProductSelection(product: CatalogProduct) {
  if (busy.value) return
  const persistedItem = group.value?.items.find((item) => item.product_id === product.product_id)
  if (persistedItem) {
    void removeItem(persistedItem)
    return
  }
  if (pendingProductIds.value.includes(product.product_id)) {
    removePendingProduct(product.product_id)
  } else {
    pendingProductIds.value = [...pendingProductIds.value, product.product_id]
  }
}

// AI-7：推荐只作建议，必须由医生点击「采用」才加入订单，系统不自动填表。
function recommendationProduct(recommendation: DoctorProductRecommendation) {
  return (catalog.value?.products ?? []).find(
    (product) => String(product.product_id) === recommendation.productId
  )
}

function recommendationSelected(recommendation: DoctorProductRecommendation) {
  const product = recommendationProduct(recommendation)
  return Boolean(product && productSelected(product))
}

async function loadProductRecommendations() {
  recommendLoading.value = true
  recommendError.value = ''
  try {
    productRecommendations.value = await props.gateway.recommendProducts(recommendCaseNote.value.trim())
    recommendNote.value = productRecommendations.value.length
      ? t('以上为建议项，请确认后再选择；价格以正式报价为准。', 'These are suggestions only. Review before selecting; final pricing is subject to the formal quote.')
      : t('当前没有可推荐的产品。', 'No product recommendations are currently available.')
  } catch (cause) {
    productRecommendations.value = []
    recommendNote.value = ''
    recommendError.value = caseErrorText(cause, '智能推荐暂时不可用', 'Product recommendations are temporarily unavailable')
  } finally {
    recommendLoading.value = false
  }
}

async function applyRecommendation(recommendation: DoctorProductRecommendation) {
  const product = recommendationProduct(recommendation)
  if (!product) {
    ElMessage.warning(t('该推荐产品不在当前生效目录中', 'This recommended product is not in the active catalog'))
    return
  }
  if (productSelected(product)) {
    ElMessage.info(t('该产品已经在当前病例中', 'This product is already in the current case'))
    return
  }
  toggleProductSelection(product)
  selectedCategoryCode.value = product.category_code
  activeProductGroup.value = ''
  productKeyword.value = ''
  await nextTick()
  document.querySelector<HTMLElement>(`[data-testid="case-add-product-${product.product_id}"]`)
    ?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  ElMessage.success(t('已暂存 {product}，点击下一步后保存', '{product} added temporarily. Continue to save it.', { product: catalogProductName(product) }))
}

function categoryIcon(categoryCode: string) {
  return {
    FIXED_RESTORATION: '♛',
    IMPLANT_RESTORATION: '⚙',
    REMOVABLE_PROSTHETICS: '🦷',
    CONVENTIONAL_ORTHODONTICS: '△',
    CLEAR_ALIGNER: '✦',
    DESIGN_SERVICE: '◈'
  }[categoryCode] ?? '🦷'
}

async function saveItemUnlocked(item: CaseGroupItem, silent = false, fileIdsOverride?: number[]) {
  if (!group.value) return false
  if (!commitItemObjectFields(item)) {
    if (!silent) ElMessage.warning(t('请先修正补充信息', 'Correct the additional information first'))
    return false
  }
  try {
    const mainMaterial = primaryMaterialValue(item)
    if (mainMaterial) choosePrimaryMaterial(item, mainMaterial)
    item.form_values = {
      ...item.form_values,
      ...caseSettingsSnapshot()
    }
    const next = await api<CaseGroup>(
      `/order-case-groups/${group.value.group_id}/items/${item.order_id}`,
      {
        method: 'PUT',
        body: JSON.stringify({
          product_id: item.product_id,
          variant_id: item.variant_id,
          relationship_type: item.relationship_type,
          form_values: item.form_values,
          material_selections: item.material_selections,
          accessory_selections: item.accessory_selections,
          file_ids: fileIdsOverride ?? itemSelectedFileIds(item),
          expected_draft_version: group.value.draft_version
        })
      }
    )
    group.value = next
    if (!silent) ElMessage.success(t('{product} 已保存', '{product} saved', { product: catalogProductName(item) }))
    return true
  } catch (cause) {
    ElMessage.error(caseErrorText(cause, '保存配置失败', 'Failed to save configuration'))
    return false
  }
}

async function saveItem(item: CaseGroupItem, silent = false, fileIdsOverride?: number[]) {
  if (busy.value || fileUploading.value) return false
  busy.value = true
  try {
    return await saveItemUnlocked(item, silent, fileIdsOverride)
  } finally {
    busy.value = false
  }
}

async function saveAllItemsUnlocked() {
  if (!group.value) return false
  const orderIds = group.value.items.map((item) => item.order_id)
  for (const orderId of orderIds) {
    const item = group.value.items.find((candidate) => candidate.order_id === orderId)
    if (item && !(await saveItemUnlocked(item, true))) return false
  }
  notice.value = t('草稿已保存 · {time}', 'Draft saved · {time}', { time: new Date().toLocaleTimeString(locale.value === 'EN' ? 'en-US' : 'zh-CN', { hour: '2-digit', minute: '2-digit' }) })
  return true
}

async function saveAllItems() {
  if (busy.value || fileUploading.value) return false
  busy.value = true
  try {
    return await saveAllItemsUnlocked()
  } finally {
    busy.value = false
  }
}

async function changeVariant(item: CaseGroupItem) {
  item.form_values.material_option = ''
  item.material_selections = []
  item.accessory_selections = []
  await saveItem(item, true)
}

async function uploadProductFiles(event: Event, item: CaseGroupItem, slotCode = 'general') {
  const input = event.target as HTMLInputElement
  const files = Array.from(input.files ?? [])
  input.value = ''
  if (!files.length || fileUploading.value || busy.value) return
  fileUploading.value = true
  try {
    const uploaded = await props.gateway.uploadOrderFiles(String(item.order_id), files)
    itemFiles[item.order_id] = [...(itemFiles[item.order_id] ?? []), ...uploaded]
    const slotFiles = item.form_values.upload_slot_files
    const nextSlots = slotFiles && typeof slotFiles === 'object' && !Array.isArray(slotFiles)
      ? { ...(slotFiles as Record<string, unknown>) }
      : {}
    nextSlots[slotCode] = distinctFileIds([
      ...uploadedSlotIds(item, slotCode),
      ...uploaded.map((file) => Number(file.file_id))
    ])
    item.form_values.upload_slot_files = nextSlots
    await saveItemUnlocked(item, true)
    ElMessage.success(t('{count} 个专属文件已上传', '{count} product-specific file(s) uploaded', { count: uploaded.length }))
  } catch (cause) {
    ElMessage.error(caseErrorText(cause, '专属文件上传失败', 'Failed to upload product-specific files'))
  } finally {
    fileUploading.value = false
  }
}

async function uploadSharedFiles(event: Event) {
  const input = event.target as HTMLInputElement
  const files = Array.from(input.files ?? [])
  input.value = ''
  const firstItem = group.value?.items[0]
  if (!files.length || !firstItem || !group.value || fileUploading.value || busy.value) return
  fileUploading.value = true
  try {
    const uploaded = await props.gateway.uploadOrderFiles(String(firstItem.order_id), files)
    sharedFiles.value = [...sharedFiles.value, ...uploaded]
    group.value = await api<CaseGroup>(`/order-case-groups/${group.value.group_id}/shared-files`, {
      method: 'PUT',
      body: JSON.stringify({
        file_ids: distinctFileIds([
          ...(group.value.shared_file_ids ?? []),
          ...sharedFiles.value.map((file) => Number(file.file_id))
        ]),
        expected_draft_version: group.value.draft_version
      })
    })
    ElMessage.success(t('{count} 个病例共享文件已上传', '{count} case-shared file(s) uploaded', { count: uploaded.length }))
  } catch (cause) {
    ElMessage.error(caseErrorText(cause, '共享文件上传失败', 'Failed to upload shared files'))
  } finally {
    fileUploading.value = false
  }
}

async function removeProductFile(item: CaseGroupItem, file: DoctorFile) {
  if (!group.value || busy.value || fileUploading.value) return
  const fileId = Number(file.file_id)
  if (!Number.isSafeInteger(fileId) || fileId <= 0) return
  busy.value = true
  try {
    await ElMessageBox.confirm(t('移除“{file}”？该附件将停止访问，但审计记录会保留。', 'Remove “{file}”? Access will be disabled while the audit record is retained.', { file: file.name }), t('移除专属附件', 'Remove Product Attachment'), {
      confirmButtonText: t('确认移除', 'Remove'),
      cancelButtonText: t('取消', 'Cancel'),
      type: 'warning'
    })
    const previousSlots = item.form_values.upload_slot_files
    const nextSlots = previousSlots && typeof previousSlots === 'object' && !Array.isArray(previousSlots)
      ? Object.fromEntries(Object.entries(previousSlots as Record<string, unknown>).map(([slot, ids]) => [
          slot,
          Array.isArray(ids) ? distinctFileIds(ids.map(Number)).filter((id) => id !== fileId) : ids
        ]))
      : previousSlots
    item.form_values.upload_slot_files = nextSlots
    const saved = await saveItemUnlocked(item, true, itemSelectedFileIds(item).filter((id) => id !== fileId))
    if (!saved) {
      item.form_values.upload_slot_files = previousSlots
      return
    }
    itemFiles[item.order_id] = (itemFiles[item.order_id] ?? []).filter((candidate) => Number(candidate.file_id) !== fileId)
    ElMessage.success(t('专属附件已移除', 'Product attachment removed'))
  } catch (cause) {
    if (cause !== 'cancel' && cause !== 'close') {
      ElMessage.error(caseErrorText(cause, '移除附件失败', 'Failed to remove attachment'))
    }
  } finally {
    busy.value = false
  }
}

async function removeSharedFile(file: DoctorFile) {
  if (!group.value || busy.value || fileUploading.value) return
  const fileId = Number(file.file_id)
  if (!Number.isSafeInteger(fileId) || fileId <= 0) return
  busy.value = true
  try {
    await ElMessageBox.confirm(t('移除“{file}”？该附件将停止访问，但审计记录会保留。', 'Remove “{file}”? Access will be disabled while the audit record is retained.', { file: file.name }), t('移除共享附件', 'Remove Shared Attachment'), {
      confirmButtonText: t('确认移除', 'Remove'),
      cancelButtonText: t('取消', 'Cancel'),
      type: 'warning'
    })
    const remainingIds = distinctFileIds([
      ...(group.value.shared_file_ids ?? []),
      ...sharedFiles.value.map((candidate) => candidate.file_id)
    ]).filter((id) => id !== fileId)
    group.value = await api<CaseGroup>(`/order-case-groups/${group.value.group_id}/shared-files`, {
      method: 'PUT',
      body: JSON.stringify({
        file_ids: remainingIds,
        expected_draft_version: group.value.draft_version
      })
    })
    sharedFiles.value = sharedFiles.value.filter((candidate) => Number(candidate.file_id) !== fileId)
    ElMessage.success(t('共享附件已移除', 'Shared attachment removed'))
  } catch (cause) {
    if (cause !== 'cancel' && cause !== 'close') {
      ElMessage.error(caseErrorText(cause, '移除附件失败', 'Failed to remove attachment'))
    }
  } finally {
    busy.value = false
  }
}

async function nextStep() {
  if (busy.value || fileUploading.value) return
  if (step.value === 1) {
    if (!patientId.value) {
      ElMessage.warning(t('请选择患者后再进入下一步', 'Select a patient before continuing'))
      return
    }
    if (!selectedProductCount.value) {
      ElMessage.warning(t('请至少选择一个产品', 'Select at least one product'))
      return
    }
    const errors = caseStepOneErrors()
    if (errors.length) {
      ElMessage.warning(errors.join('；'))
      return
    }
  }
  busy.value = true
  try {
    if (step.value === 1 && !(await persistPendingProductsUnlocked())) return
    const currentStepErrors = group.value?.items.flatMap((item) => itemStepErrors(item, step.value)) ?? []
    if (currentStepErrors.length) {
      ElMessage.warning(Array.from(new Set(currentStepErrors)).join('；'))
      return
    }
    if (step.value <= 5 && !(await saveAllItemsUnlocked())) return
    step.value = Math.min(6, step.value + 1)
  } finally {
    busy.value = false
  }
}

function priceLabel(_item: CaseGroupItem) {
  return t('待报价', 'Quote Pending')
}

async function submitGroup() {
  if (!group.value || busy.value) return
  if (!finalConfirmationComplete.value) {
    ElMessage.warning(t('请确认报价、制作要求和制作周期口径', 'Confirm the quote, production requirements, and lead time'))
    return
  }
  busy.value = true
  try {
    group.value.items.forEach((item) => {
      item.form_values.doctor_confirmed_quote_status = true
      item.form_values.doctor_confirmed_requirements = true
      item.form_values.doctor_confirmed_cycle_status = true
    })
    if (!(await saveAllItemsUnlocked())) return
    if (incompleteItems.value.length) {
      ElMessage.warning(t('还有 {count} 个子产品配置不完整', '{count} product configuration(s) are incomplete', { count: incompleteItems.value.length }))
      return
    }
    const submitted = await api<CaseGroup>(`/order-case-groups/${group.value.group_id}/submit`, {
      method: 'POST',
      body: JSON.stringify({
        idempotency_key: crypto.randomUUID(),
        expected_draft_version: group.value.draft_version
      })
    })
    group.value = submitted
    emit('submitted', submitted)
    ElMessage.success(t('病例订单 {group} 已提交，共 {count} 个产品', 'Case order {group} submitted with {count} product(s)', { group: submitted.group_no, count: submitted.items.length }))
  } catch (cause) {
    ElMessage.error(caseErrorText(cause, '订单提交失败', 'Failed to submit order'))
  } finally {
    busy.value = false
  }
}

onMounted(async () => {
  try {
    await loadCatalog()
    await restoreDraft()
  } catch (cause) {
    notice.value = caseErrorText(cause, '产品信息加载失败，请刷新后重试', 'Failed to load product information. Refresh and try again.')
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="case-wizard" data-testid="doctor-case-group-wizard">
    <header class="case-wizard__header">
      <strong>{{ group ? t('继续编辑订单草稿', 'Continue Editing Draft') : selectedCategoryCode ? t('新建{category}订单', 'New {category} Order', { category: categoryName(selectedCategoryCode) }) : t('新建病例订单', 'New Case Order') }}</strong>
      <small>{{ notice || (selectedCategoryCode ? t('第 {step} / {total} 步 · {category}', 'Step {step} of {total} · {category}', { step, total: steps.length, category: categoryName(selectedCategoryCode) }) : t('请选择产品大类开始', 'Select a product category to begin')) }}</small>
      <button type="button" data-testid="case-wizard-close" :aria-label="t('关闭新建订单', 'Close new order')" :title="t('关闭', 'Close')" @click="emit('close')">×</button>
    </header>

    <nav class="case-wizard__steps" :aria-label="t('多产品下单步骤', 'Multi-product order steps')">
      <template v-for="(label, index) in steps" :key="label">
        <button
          v-if="selectedCategoryCode || index === 0"
          type="button"
          :class="{ active: step === index + 1, done: step > index + 1 }"
          :disabled="index + 1 > step"
          @click="step = index + 1"
        >
          <span>{{ step > index + 1 ? '✓' : index + 1 }}</span>
          <strong>{{ label }}</strong>
        </button>
      </template>
    </nav>

    <main v-loading="loading">
      <section v-if="step === 1" class="case-panel case-source-step">
        <div class="case-source-layout">
          <aside class="case-source-sidebar">
            <section class="case-sidebar-section">
              <header>{{ t('产品大类', 'Product Categories') }}</header>
              <div class="case-category-cards">
                <button
                  v-for="category in catalogCategories"
                  :key="category.code"
                  type="button"
                  :class="{ active: selectedCategoryCode === category.code }"
                  @click="selectedCategoryCode = category.code; activeProductGroup = ''; productKeyword = ''"
                >
                  <span>{{ categoryIcon(category.code) }}</span>
                  <div><strong>{{ categoryName(category.code) }}</strong><small>{{ t('{count} 项产品', '{count} product(s)', { count: catalogProducts.filter((product) => product.category_code === category.code).length }) }}</small></div>
                </button>
              </div>
            </section>

            <section v-if="selectedCategoryCode" class="case-sidebar-section case-sidebar-products">
              <header>{{ t('具体产品', 'Products') }} <b>*</b></header>
              <label class="case-sidebar-search"><span>⌕</span><input v-model="productKeyword" :placeholder="t('搜索产品', 'Search products')"></label>
              <div class="case-product-subcards">
                <template v-for="productGroup in selectedProductGroups" :key="productGroup.label || selectedCategoryCode">
                  <h4 v-if="productGroup.label">{{ localizedSourceText(productGroup.label) }}</h4>
                  <button
                    v-for="product in productGroup.products"
                    :key="product.product_id"
                    type="button"
                    :class="{ active: productSelected(product) }"
                    :disabled="busy"
                    :title="productSelected(product) ? t('取消选择{product}', 'Deselect {product}', { product: catalogProductName(product) }) : t('选择{product}', 'Select {product}', { product: catalogProductName(product) })"
                    :data-testid="`case-add-product-${product.product_id}`"
                    @click="toggleProductSelection(product)"
                  >
                    <span><strong>{{ catalogProductName(product) }}</strong><small>{{ t('待报价', 'Quote Pending') }}</small></span>
                    <i>{{ productSelected(product) ? '✓' : '＋' }}</i>
                  </button>
                </template>
                <p v-if="!selectedCategoryProducts.length">{{ t('该分类暂时没有可下单产品。', 'No products are currently available in this category.') }}</p>
              </div>
            </section>

            <section v-if="selectedPatient" class="case-sidebar-patient">
              <header>{{ t('当前患者', 'Current Patient') }}</header>
              <div><span>{{ selectedPatient.patient_name.slice(0, 1) }}</span><p><strong>{{ selectedPatient.patient_name }}</strong><small>{{ selectedPatient.patient_code }}</small></p></div>
            </section>
          </aside>

          <div class="case-source-content">
            <header class="case-source-intro">
              <h1>{{ t('开始新订单', 'Start a New Order') }}</h1>
              <p>{{ t('先从左侧选择一个或多个具体产品，再检索或新建患者；点击下一步时统一保存病例订单。', 'Select one or more products on the left, then find or create a patient. The case order is saved when you continue.') }}</p>
            </header>

            <div v-if="catalog?.publication_status !== 'ACTIVE'" class="case-alert warning">
              {{ t('当前暂时没有可下单产品，请刷新页面或联系订单支持。', 'No products are currently available. Refresh the page or contact Order Support.') }}
            </div>

            <section class="case-recommend-card">
              <header>
                <div>
                  <strong>{{ t('智能推荐', 'Smart Recommendations') }}</strong>
                  <small>{{ t('根据本诊所历史下单与病例描述给出建议，需您确认后才会加入订单', 'Suggestions use clinic order history and the case description. Products are added only after your confirmation.') }}</small>
                </div>
                <button type="button" :disabled="recommendLoading" @click="loadProductRecommendations">
                  {{ recommendLoading ? t('推荐中…', 'Generating…') : t('让 AI 推荐', 'Get AI Suggestions') }}
                </button>
              </header>
              <label class="case-recommend-input">
                <span>{{ t('病例描述（可选）', 'Case Description (Optional)') }}</span>
                <input v-model="recommendCaseNote" :placeholder="t('例如：46 缺失，咬合力较大，患者要求美观', 'For example: tooth 46 missing, high bite force, esthetic priority')">
              </label>
              <p v-if="recommendError" class="case-recommend-error">{{ recommendError }}</p>
              <p v-else-if="recommendNote" class="case-recommend-note">{{ recommendNote }}</p>
              <div v-if="productRecommendations.length" class="case-recommend-list">
                <button
                  v-for="recommendation in productRecommendations"
                  :key="recommendation.productId"
                  type="button"
                  :class="{ selected: recommendationSelected(recommendation) }"
                  :disabled="busy || !recommendationProduct(recommendation) || recommendationSelected(recommendation)"
                  @click="applyRecommendation(recommendation)"
                >
                  <span>
                    <strong>{{ safeEnglishDynamicText(recommendation.displayName, humanizeCode(recommendationProduct(recommendation)?.product_code || 'recommended_product')) }}</strong>
                    <small>{{ safeEnglishDynamicText(recommendation.categoryName, categoryName(recommendationProduct(recommendation)?.category_code || '')) }} · {{ safeEnglishDynamicText(recommendation.reason, 'Recommended based on case details and clinic order history.') }}</small>
                  </span>
                  <i>{{ !recommendationProduct(recommendation) ? t('不在当前目录', 'Not in Active Catalog') : recommendationSelected(recommendation) ? t('✓ 已采用', '✓ Added') : t('＋ 采用', '＋ Add') }}</i>
                </button>
              </div>
            </section>

            <section class="case-account-card">
              <span>{{ (props.doctorName || t('医', 'D')).slice(0, 1) }}</span>
              <div>
                <small>{{ t('当前下单账户（自动带出）', 'Current Ordering Account (Auto-filled)') }}</small>
                <strong>{{ props.doctorName || t('当前医生', 'Current Doctor') }} · {{ props.clinicName || t('当前诊所', 'Current Clinic') }}</strong>
                <p>{{ props.clinicContact || t('联系方式以账户资料为准', 'Contact details are taken from the account profile') }}</p>
              </div>
              <b>✓ {{ t('已自动填写', 'Auto-filled') }}</b>
            </section>

            <div class="case-source-grid">
              <section class="case-config-form case-patient-section">
                <header class="case-section-title">
                  <div><small>👤 {{ t('患者', 'Patient') }}</small></div>
                </header>
                <div v-if="selectedPatient" class="case-patient-selected">
                  <span>{{ selectedPatient.patient_name.slice(0, 1) }}</span>
                  <div><strong>{{ selectedPatient.patient_name }}</strong><small>{{ selectedPatient.patient_code }} · {{ selectedPatient.doctor_name }}</small></div>
                  <button v-if="!group" type="button" :aria-label="t('重新选择患者', 'Choose another patient')" @click="patientId = ''; patientKeyword = ''">×</button>
                </div>
                <div v-else class="case-patient-autocomplete">
                  <label class="case-search"><span>⌕</span><input v-model="patientKeyword" :placeholder="t('输入患者姓名或编号，搜索已有患者…', 'Enter a patient name or ID to search…')" @focus="patientSearchFocused = true" @blur="closePatientResults"></label>
                  <div v-if="patientSearchFocused || patientKeyword" class="case-patient-dropdown">
                    <button
                      v-for="patient in patientRows"
                      :key="patient.patient_id"
                      type="button"
                      @mousedown.prevent
                      @click="patientId = patient.patient_id; patientKeyword = ''; patientSearchFocused = false"
                    >
                      <strong>{{ patient.patient_name }}</strong><small>{{ patient.patient_code }} · {{ patient.doctor_name }}</small>
                    </button>
                    <p v-if="!patientRows.length">{{ t('没有匹配患者，可直接新建患者。', 'No matching patients. You can create a new patient.') }}</p>
                  </div>
                  <p class="case-patient-create-hint">{{ t('或', 'Or') }} <button type="button" @click="newPatientOpen = !newPatientOpen">{{ t('直接新建患者', 'Create a New Patient') }}</button></p>
                </div>
                <div v-if="newPatientOpen" class="case-new-patient">
                  <label><span>{{ t('患者姓名 *', 'Patient Name *') }}</span><input v-model="newPatient.name"></label>
                  <label><span>{{ t('出生日期', 'Date of Birth') }}</span><input v-model="newPatient.date_of_birth" :type="dateInputType" :placeholder="dateInputPlaceholder" inputmode="numeric" pattern="\d{4}-\d{2}-\d{2}" maxlength="10"></label>
                  <label><span>{{ t('性别', 'Gender') }}</span><select v-model="newPatient.gender"><option value="">{{ t('请选择', 'Select') }}</option><option value="MALE">{{ t('男', 'Male') }}</option><option value="FEMALE">{{ t('女', 'Female') }}</option><option value="OTHER">{{ t('其他', 'Other') }}</option></select></label>
                  <label><span>{{ t('联系电话', 'Phone') }}</span><input v-model="newPatient.phone"></label>
                  <label><span>{{ t('邮箱', 'Email') }}</span><input v-model="newPatient.email" type="email"></label>
                  <label class="full"><span>{{ t('病史/用药/过敏', 'Medical History / Medication / Allergies') }}</span><textarea v-model="newPatient.medical_notes" rows="2"></textarea></label>
                  <div class="full"><button type="button" class="case-primary" :disabled="newPatientSaving" @click="createPatientFromWizard">{{ newPatientSaving ? t('保存中…', 'Saving…') : t('保存并选中患者', 'Save and Select Patient') }}</button></div>
                </div>
              </section>

              <section class="case-config-form">
                <header class="case-section-title"><div><small>{{ t('订单要求', 'Order Requirements') }}</small><h3>{{ t('出货、到货与运输信息', 'Dispatch, Delivery & Shipping') }}</h3></div></header>
                <div class="case-field-grid">
                  <label class="case-field"><span>{{ t('订单周期 *', 'Order Priority *') }}</span><select v-model="caseSettings.priority"><option value="NORMAL">{{ t('正常出货周期', 'Standard Lead Time') }}</option><option value="RUSH_3_DAYS">{{ t('3 天加急', '3-day Rush') }}</option><option value="SAME_DAY">{{ t('当天出货', 'Same-day Dispatch') }}</option></select></label>
                  <label class="case-field"><span>{{ t('要求到货日期 *', 'Requested Delivery Date *') }}</span><input v-model="caseSettings.required_delivery_date" :type="dateInputType" :placeholder="dateInputPlaceholder" inputmode="numeric" pattern="\d{4}-\d{2}-\d{2}" maxlength="10"></label>
                  <label class="case-field"><span>{{ t('患者预约时间', 'Patient Appointment Date') }}</span><input v-model="caseSettings.appointment_date" :type="dateInputType" :placeholder="dateInputPlaceholder" inputmode="numeric" pattern="\d{4}-\d{2}-\d{2}" maxlength="10"></label>
                  <label class="case-field"><span>{{ t('运输类型 *', 'Shipping Method *') }}</span><select v-model="caseSettings.shipping_method"><option value="COURIER">{{ t('快递', 'Courier') }}</option><option value="SALES_DELIVERY">{{ t('业务员配送', 'Representative Delivery') }}</option><option value="SELF_PICKUP">{{ t('自取', 'Self Pickup') }}</option></select></label>
                  <label class="case-field"><span>{{ t('订单类型 *', 'Order Type *') }}</span><select v-model="caseSettings.order_type"><option value="ONLINE">{{ t('网络订单', 'Online Order') }}</option><option value="IMPRESSION">{{ t('印模订单', 'Impression Order') }}</option><option value="REWORK">{{ t('返工订单', 'Remake Order') }}</option><option value="RETURN">{{ t('退货订单', 'Return Order') }}</option><option value="DESIGN_ONLY">{{ t('仅设计订单', 'Design-only Order') }}</option></select></label>
                  <label v-if="['IMPRESSION', 'REWORK', 'RETURN'].includes(caseSettings.order_type)" class="case-field"><span>{{ t('寄模运单号 *', 'Inbound Model Tracking Number *') }}</span><input v-model="caseSettings.inbound_tracking_no" :placeholder="t('填写寄回模型的运单号', 'Enter the tracking number for the returned model')"></label>
                  <label class="case-field full"><span>{{ t('整单备注', 'Case Notes') }}</span><textarea v-model="caseSettings.global_notes" rows="3" :placeholder="t('病例整体要求，可使用中文或英文', 'Overall case requirements')"></textarea></label>
                </div>
                <div class="case-alert warning">{{ t('请填写期望到货日期；客服将在受理订单时确认可行的制作与配送周期。', 'Enter the requested delivery date. Order Support will confirm a feasible production and delivery schedule during review.') }}</div>
              </section>
            </div>

            <aside v-if="selectedProductCount" class="case-basket case-basket-inline">
              <header><strong>{{ t('已选产品', 'Selected Products') }}</strong><span>{{ t('{count} 项', '{count} item(s)', { count: selectedProductCount }) }}</span></header>
              <article v-for="item in group?.items ?? []" :key="item.order_id">
                <div><strong>{{ catalogProductName(item) }}</strong><small>{{ t('产品订单 {order}', 'Product Order {order}', { order: item.order_no }) }}</small></div>
                <span>{{ t('待报价', 'Quote Pending') }}</span>
                <button type="button" @click="copyItem(item)">{{ t('复制', 'Copy') }}</button>
                <button type="button" class="danger" @click="removeItem(item)">{{ t('移除', 'Remove') }}</button>
              </article>
              <article v-for="(product, index) in pendingProducts" :key="`pending-${product.product_id}-${index}`">
                <div><strong>{{ catalogProductName(product) }}</strong><small>{{ t('尚未保存，点击下一步后创建产品订单', 'Not saved yet. Continue to create the product order.') }}</small></div>
                <span>{{ t('待报价', 'Quote Pending') }}</span>
                <button type="button" :disabled="busy" @click="copyPendingProduct(product)">{{ t('复制', 'Copy') }}</button>
                <button type="button" class="danger" :disabled="busy" @click="removePendingProduct(product.product_id)">{{ t('取消选择', 'Deselect') }}</button>
              </article>
            </aside>
          </div>
        </div>
      </section>

      <section v-else-if="step === 2" class="case-panel case-config-panel">
        <header><h1>{{ t('牙位与制作要求', 'Teeth & Production Requirements') }}</h1><p>{{ t('请逐个产品选择牙位，并填写相应的临床与制作要求。', 'Select teeth and enter the clinical and production requirements for each product.') }}</p></header>
        <div class="case-config-layout">
          <aside class="case-item-tabs" :data-section-label="t('已选产品', 'Selected Products')">
            <button
              v-for="item in group?.items ?? []"
              :key="item.order_id"
              type="button"
              :class="{ active: activeItem?.order_id === item.order_id }"
              @click="selectedOrderId = item.order_id"
            >
              <span>{{ item.line_no }}</span>
              <div><strong>{{ catalogProductName(item) }}</strong><small>{{ itemStepErrors(item, 2).length ? t('{count} 项待补', '{count} item(s) incomplete', { count: itemStepErrors(item, 2).length }) : t('本阶段完整', 'Section Complete') }}</small></div>
            </button>
          </aside>
          <div v-if="activeItem" class="case-config-form">
            <div class="case-config-summary">
              <div><span>{{ t('产品订单', 'Product Order') }}</span><strong>{{ activeItem.order_no }}</strong></div>
              <div><span>{{ t('当前产品', 'Current Product') }}</span><strong>{{ catalogProductName(activeItem) }}</strong></div>
              <div><span>{{ t('价格', 'Price') }}</span><strong>{{ priceLabel(activeItem) }}</strong></div>
            </div>
            <section v-if="activeProduct?.tooth_rule_code" class="case-tooth-chart full" data-testid="case-fdi-tooth-chart">
              <header>
                <div><strong>{{ toothSelectionLabel(activeItem) }} (FDI) *</strong><small>{{ toothGestureHelp(activeItem) }}</small></div>
                <div><span>{{ t('已选：{teeth}', 'Selected: {teeth}', { teeth: selectedTeeth(activeItem).join(locale === 'EN' ? ', ' : '、') || t('暂无', 'None') }) }}</span><button type="button" :disabled="!selectedTeeth(activeItem).length" @click="clearTeeth(activeItem)">{{ t('清空', 'Clear') }}</button></div>
              </header>
              <div v-if="productCategory(activeItem) === 'IMPLANT_RESTORATION'" class="case-tooth-modes">
                <span>{{ t('额外标记：', 'Additional Markers:') }}</span>
                <button
                  v-for="option in toothModeOptions(activeItem).filter((candidate) => ['CROWN', 'ABUTMENT', 'FRAMEWORK'].includes(candidate.value))"
                  :key="option.value"
                  type="button"
                  :class="{ active: currentToothMode(activeItem) === option.value }"
                  @click="activeItem.form_values.current_tooth_mode = option.value"
                >{{ option.value === 'CROWN' ? t('普通单冠', 'Standard Single Crown') : option.label }}</button>
              </div>
              <div class="case-tooth-legend" :aria-label="t('牙位图图例', 'Tooth chart legend')">
                <span v-for="item in toothLegend(activeItem)" :key="item.label"><i :class="`is-${item.tone}`"></i>{{ item.label }}</span>
              </div>
              <svg
                class="case-dental-svg"
                viewBox="0 0 700 330"
                role="img"
                :aria-label="t('FDI 牙位选择图', 'FDI tooth selection chart')"
                @pointerup="finishToothDrag(activeItem)"
              >
                <text x="350" y="13" text-anchor="middle" class="case-dental-jaw-title">{{ t('上颌 · MAXILLA', 'UPPER ARCH · MAXILLA') }}</text>
                <text x="350" y="221" text-anchor="middle" class="case-dental-jaw-title">{{ t('下颌 · MANDIBLE', 'LOWER ARCH · MANDIBLE') }}</text>
                <line x1="350" y1="18" x2="350" y2="175" class="case-dental-midline"></line>
                <line x1="350" y1="228" x2="350" y2="318" class="case-dental-midline"></line>
                <line x1="30" y1="158" x2="670" y2="158" class="case-dental-occlusion"></line>
                <line x1="30" y1="238" x2="670" y2="238" class="case-dental-occlusion"></line>
                <text x="16" y="100" text-anchor="middle" class="case-dental-side">R</text>
                <text x="684" y="100" text-anchor="middle" class="case-dental-side">L</text>
                <text x="16" y="285" text-anchor="middle" class="case-dental-side">R</text>
                <text x="684" y="285" text-anchor="middle" class="case-dental-side">L</text>
                <g
                  v-for="tooth in upperToothSvg"
                  :key="tooth.number"
                  class="case-svg-tooth"
                  :class="[{ selected: toothSelected(activeItem, tooth.number) }, `mode-${toothModes(activeItem)[tooth.number] || 'NONE'}`]"
                >
                  <path v-for="(path, index) in tooth.rootPaths" :key="index" class="tooth-body" :d="path"></path>
                  <path class="tooth-body" :d="tooth.crownPath"></path>
                  <line class="case-tooth-junction" :x1="tooth.junction.x1" :x2="tooth.junction.x2" :y1="tooth.junction.y" :y2="tooth.junction.y"></line>
                  <text :x="tooth.numberPosition.x" :y="tooth.numberPosition.y" text-anchor="middle" class="case-tooth-number">{{ tooth.number }}</text>
                  <rect
                    class="case-tooth-hit"
                    :x="tooth.hitArea.x"
                    :y="tooth.hitArea.y"
                    :width="tooth.hitArea.width"
                    :height="tooth.hitArea.height"
                    :aria-label="t('牙位 {tooth}{mode}', 'Tooth {tooth}{mode}', { tooth: tooth.number, mode: toothSelected(activeItem, tooth.number) ? `${locale === 'EN' ? ', ' : '，'}${toothModeLabel(activeItem, tooth.number)}` : '' })"
                    @pointerdown.prevent="beginToothDrag(activeItem, tooth.number, 'UPPER')"
                    @pointerenter="extendToothDrag(activeItem, tooth.number, 'UPPER')"
                    @pointerup="finishToothDrag(activeItem)"
                    @click="toothClick(activeItem, tooth.number)"
                    @dblclick.prevent="doubleClickTooth(activeItem, tooth.number)"
                  ></rect>
                </g>
                <g
                  v-for="tooth in lowerToothSvg"
                  :key="tooth.number"
                  class="case-svg-tooth"
                  :class="[{ selected: toothSelected(activeItem, tooth.number) }, `mode-${toothModes(activeItem)[tooth.number] || 'NONE'}`]"
                >
                  <path class="tooth-body" :d="tooth.crownPath"></path>
                  <line class="case-tooth-junction" :x1="tooth.junction.x1" :x2="tooth.junction.x2" :y1="tooth.junction.y" :y2="tooth.junction.y"></line>
                  <path v-for="(path, index) in tooth.rootPaths" :key="index" class="tooth-body" :d="path"></path>
                  <text :x="tooth.numberPosition.x" :y="tooth.numberPosition.y" text-anchor="middle" class="case-tooth-number">{{ tooth.number }}</text>
                  <rect
                    class="case-tooth-hit"
                    :x="tooth.hitArea.x"
                    :y="tooth.hitArea.y"
                    :width="tooth.hitArea.width"
                    :height="tooth.hitArea.height"
                    :aria-label="t('牙位 {tooth}{mode}', 'Tooth {tooth}{mode}', { tooth: tooth.number, mode: toothSelected(activeItem, tooth.number) ? `${locale === 'EN' ? ', ' : '，'}${toothModeLabel(activeItem, tooth.number)}` : '' })"
                    @pointerdown.prevent="beginToothDrag(activeItem, tooth.number, 'LOWER')"
                    @pointerenter="extendToothDrag(activeItem, tooth.number, 'LOWER')"
                    @pointerup="finishToothDrag(activeItem)"
                    @click="toothClick(activeItem, tooth.number)"
                    @dblclick.prevent="doubleClickTooth(activeItem, tooth.number)"
                  ></rect>
                </g>
              </svg>
              <div class="case-tooth-summary">{{ toothSelectionSummary(activeItem) }}</div>
            </section>

            <section class="case-config-block">
              <header><h3>{{ t('制作要求', 'Production Requirements') }}</h3><small>{{ t('内容会根据当前产品自动调整', 'Fields adjust automatically for the current product') }}</small></header>
              <div v-if="productCategory(activeItem) === 'FIXED_RESTORATION'" class="case-field-grid">
                <label class="case-field"><span>{{ t('咬合 *', 'Occlusion *') }}</span><select v-model="activeItem.form_values.occlusion_level"><option value="">{{ t('请选择', 'Select') }}</option><option value="LIGHT">{{ t('轻', 'Light') }}</option><option value="NORMAL">{{ t('正常', 'Normal') }}</option><option value="HEAVY">{{ t('重', 'Heavy') }}</option><option value="CLEARANCE">{{ t('空开', 'Clearance') }}</option></select></label>
                <label v-if="activeItem.form_values.occlusion_level === 'CLEARANCE'" class="case-field"><span>{{ t('空开距离（mm）*', 'Clearance (mm) *') }}</span><input v-model.number="activeItem.form_values.occlusion_clearance_mm" type="number" min="0" step="0.1"></label>
                <label class="case-field"><span>{{ t('邻接 *', 'Contact *') }}</span><select v-model="activeItem.form_values.contact_level"><option value="">{{ t('请选择', 'Select') }}</option><option value="OPEN">{{ t('空开', 'Open') }}</option><option value="NORMAL">{{ t('正常', 'Normal') }}</option><option value="TIGHT">{{ t('紧', 'Tight') }}</option><option value="POINT">{{ t('点接触', 'Point Contact') }}</option><option value="SURFACE">{{ t('面接触', 'Surface Contact') }}</option></select></label>
                <label class="case-field"><span>{{ t('染色 *', 'Staining *') }}</span><select v-model="activeItem.form_values.stain_level"><option value="">{{ t('请选择', 'Select') }}</option><option value="NONE">{{ t('无', 'None') }}</option><option value="LIGHT">{{ t('轻', 'Light') }}</option><option value="MEDIUM">{{ t('中', 'Medium') }}</option><option value="HEAVY">{{ t('重', 'Heavy') }}</option></select></label>
                <label class="case-field"><span>{{ t('边缘 *', 'Margin *') }}</span><select v-model="activeItem.form_values.margin_type"><option value="">{{ t('请选择', 'Select') }}</option><option value="METAL">{{ t('金属边缘', 'Metal Margin') }}</option><option value="PORCELAIN">{{ t('包瓷边缘', 'Porcelain Margin') }}</option><option value="THREE_QUARTER_LINGUAL">{{ t('3/4 金属舌侧边', '3/4 Metal Lingual Margin') }}</option></select></label>
              </div>
              <div v-else-if="productCategory(activeItem) === 'REMOVABLE_PROSTHETICS'" class="case-field-grid">
                <label class="case-field"><span>{{ t('咬合 *', 'Occlusion *') }}</span><select v-model="activeItem.form_values.occlusion_level"><option value="">{{ t('请选择', 'Select') }}</option><option value="LIGHT">{{ t('轻', 'Light') }}</option><option value="NORMAL">{{ t('正常', 'Normal') }}</option><option value="HEAVY">{{ t('重', 'Heavy') }}</option><option value="CLEARANCE">{{ t('空开', 'Clearance') }}</option></select></label>
                <label v-if="activeItem.form_values.occlusion_level === 'CLEARANCE'" class="case-field"><span>{{ t('空开距离（mm）*', 'Clearance (mm) *') }}</span><input v-model.number="activeItem.form_values.occlusion_clearance_mm" type="number" min="0" step="0.1"></label>
                <label class="case-field"><span>{{ t('染色 *', 'Staining *') }}</span><select v-model="activeItem.form_values.stain_level"><option value="">{{ t('请选择', 'Select') }}</option><option value="NONE">{{ t('无', 'None') }}</option><option value="LIGHT">{{ t('轻', 'Light') }}</option><option value="MEDIUM">{{ t('中', 'Medium') }}</option><option value="HEAVY">{{ t('重', 'Heavy') }}</option></select></label>
                <label class="case-field"><span>{{ t('垂直高度（mm）', 'Vertical Height (mm)') }}</span><input v-model.number="activeItem.form_values.vertical_height_mm" type="number" min="0" step="0.1"></label>
              </div>
              <div v-else-if="productCategory(activeItem) === 'IMPLANT_RESTORATION'" class="case-field-grid">
                <label class="case-field"><span>{{ t('固位方式 *', 'Retention Type *') }}</span><select v-model="activeItem.form_values.retention_type"><option value="">{{ t('请选择', 'Select') }}</option><option value="SCREW">{{ t('螺丝固位', 'Screw-retained') }}</option><option value="CEMENT">{{ t('粘接固位', 'Cement-retained') }}</option></select></label>
                <label class="case-field"><span>{{ t('种植系统 *', 'Implant System *') }}</span><select v-model="activeItem.form_values.implant_system"><option value="">{{ t('请选择', 'Select') }}</option><option>Nobel Biocare</option><option>Straumann</option><option>Osstem</option><option>BioHorizons</option><option>Zimmer Biomet</option><option>Megagen</option><option>{{ t('其他', 'Other') }}</option></select></label>
                <label class="case-field"><span>{{ t('种植直径 × 长度 *', 'Implant Diameter × Length *') }}</span><input v-model="activeItem.form_values.implant_diameter_length" :placeholder="t('例如 Ø4.1 × 10mm', 'For example: Ø4.1 × 10 mm')"></label>
                <label class="case-field"><span>{{ t('穿龈高度（mm）', 'Transmucosal Height (mm)') }}</span><input v-model.number="activeItem.form_values.transmucosal_height_mm" type="number" min="0" step="0.1"></label>
                <label class="case-field"><span>{{ t('连接方式 *', 'Connection Type *') }}</span><select v-model="activeItem.form_values.connection_type"><option value="">{{ t('请选择', 'Select') }}</option><option value="EXTERNAL">{{ t('外连接', 'External Connection') }}</option><option value="INTERNAL">{{ t('内连接', 'Internal Connection') }}</option></select></label>
                <label class="case-field"><span>{{ t('咬合', 'Occlusion') }}</span><select v-model="activeItem.form_values.occlusion_level"><option value="">{{ t('请选择', 'Select') }}</option><option value="LIGHT">{{ t('轻', 'Light') }}</option><option value="NORMAL">{{ t('正常', 'Normal') }}</option><option value="HEAVY">{{ t('重', 'Heavy') }}</option><option value="CLEARANCE">{{ t('空开', 'Clearance') }}</option></select></label>
                <label class="case-field"><span>{{ t('染色', 'Staining') }}</span><select v-model="activeItem.form_values.stain_level"><option value="">{{ t('请选择', 'Select') }}</option><option value="NONE">{{ t('无', 'None') }}</option><option value="LIGHT">{{ t('轻', 'Light') }}</option><option value="MEDIUM">{{ t('中', 'Medium') }}</option><option value="HEAVY">{{ t('重', 'Heavy') }}</option></select></label>
                <label class="case-field case-switch"><input v-model="activeItem.form_values.gingival_porcelain" type="checkbox"><span>{{ t('是否加牙龈瓷', 'Add Gingival Porcelain') }}</span></label>
              </div>
              <div v-else-if="productCategory(activeItem) === 'CONVENTIONAL_ORTHODONTICS'" class="case-field-grid">
                <label class="case-field"><span>{{ t('牙龄 *', 'Dentition Stage *') }}</span><select v-model="activeItem.form_values.dentition_stage"><option value="">{{ t('请选择', 'Select') }}</option><option value="PERMANENT">{{ t('恒牙', 'Permanent Dentition') }}</option><option value="PRIMARY">{{ t('乳牙', 'Primary Dentition') }}</option><option value="MIXED">{{ t('替牙', 'Mixed Dentition') }}</option></select></label>
                <label class="case-field"><span>{{ t('错颌畸形类别 *', 'Malocclusion Class *') }}</span><select v-model="activeItem.form_values.angle_class"><option value="">{{ t('请选择', 'Select') }}</option><option value="CLASS_I">{{ t('安氏一类', 'Angle Class I') }}</option><option value="CLASS_II">{{ t('安氏二类', 'Angle Class II') }}</option><option value="CLASS_III">{{ t('安氏三类', 'Angle Class III') }}</option></select></label>
                <label class="case-field"><span>{{ t('骨骼类型 *', 'Skeletal Type *') }}</span><select v-model="activeItem.form_values.skeletal_type"><option value="">{{ t('请选择', 'Select') }}</option><option value="DENTAL">{{ t('牙型', 'Dental') }}</option><option value="SKELETAL">{{ t('骨性', 'Skeletal') }}</option></select></label>
                <div class="case-field full"><span>{{ t('诉求问题 *', 'Orthodontic Concerns *') }}</span><div class="case-check-grid"><label v-for="value in ['拥挤', '稀疏', '前突', '地包天']" :key="value"><input type="checkbox" :checked="sourceArray(activeItem, 'orthodontic_concern').includes(value)" @change="toggleSourceArray(activeItem, 'orthodontic_concern', value, ($event.target as HTMLInputElement).checked)">{{ localizedSourceText(value) }}</label></div></div>
              </div>
              <div v-else-if="productCategory(activeItem) === 'CLEAR_ALIGNER'" class="case-field-grid">
                <label class="case-field"><span>{{ t('矫治牙颌 *', 'Treatment Arch *') }}</span><select v-model="activeItem.form_values.treatment_arch" data-testid="case-clear-aligner-arch"><option value="">{{ t('请选择', 'Select') }}</option><option v-for="option in CLEAR_ALIGNER_ARCH_OPTIONS" :key="option.value" :value="option.value">{{ archOptionLabel(option.value, option.label) }}</option></select></label>
                <label class="case-field"><span>{{ t('矫治方式 *', 'Treatment Mode *') }}</span><select v-model="activeItem.form_values.treatment_mode" data-testid="case-clear-aligner-mode"><option value="">{{ t('请选择', 'Select') }}</option><option v-for="option in CLEAR_ALIGNER_TREATMENT_OPTIONS" :key="option.value" :value="option.value">{{ treatmentOptionLabel(option.value, option.label) }}</option></select></label>
                <div class="case-alert info full">{{ t('七步处方将在“试戴与过程确认”阶段填写；联合矫治时还需选择同一病例中的关联产品。', 'Complete the seven-step prescription in Try-in & Confirmations. Combined treatment also requires a related product from the same case.') }}</div>
              </div>
              <div v-else-if="productCategory(activeItem) === 'DESIGN_SERVICE'" class="case-field-grid">
                <label class="case-field"><span>{{ t('数据格式 *', 'Data Format *') }}</span><select v-model="activeItem.form_values.delivery_format"><option value="">{{ t('请选择', 'Select') }}</option><option>STL</option><option>OBJ</option><option>EXO</option><option>3SHAPE</option></select></label>
                <label class="case-field"><span>{{ t('设计标准 *', 'Design Standard *') }}</span><select v-model="activeItem.form_values.design_standard"><option value="">{{ t('请选择', 'Select') }}</option><option value="GENERAL">{{ t('通用', 'General') }}</option><option value="PERSONALIZED">{{ t('个性化', 'Personalized') }}</option></select></label>
                <label class="case-field"><span>{{ t('设计时间 *', 'Design Turnaround *') }}</span><select v-model="activeItem.form_values.design_requirement_turnaround"><option value="">{{ t('请选择', 'Select') }}</option><option value="12H">{{ t('12 小时', '12 Hours') }}</option><option value="24H">{{ t('24 小时', '24 Hours') }}</option><option value="3D">{{ t('3 天', '3 Days') }}</option></select></label>
              </div>
            </section>
            <label class="case-field full"><span>{{ t('病例说明', 'Case Notes') }}</span><textarea :value="String(activeItem.form_values.case_note ?? '')" rows="4" :placeholder="t('补充咬合、外形或其他临床要求', 'Add occlusion, contour, or other clinical requirements')" @input="updateTextField(activeItem, 'case_note', ($event.target as HTMLTextAreaElement).value)"></textarea></label>
            <button type="button" class="case-primary" :disabled="busy" @click="saveItem(activeItem)">{{ t('保存当前牙位与制作要求', 'Save Teeth & Requirements') }}</button>
          </div>
        </div>
      </section>

      <section v-else-if="step === 3" class="case-panel case-config-panel">
        <header><h1>{{ t('材料与工艺', 'Materials & Process') }}</h1><p>{{ t('请逐个产品填写对应的材料、色号和制作要求。', 'Enter materials, shades, and production requirements for each product.') }}</p></header>
        <div class="case-config-layout">
          <aside class="case-item-tabs" :data-section-label="t('已选产品', 'Selected Products')">
            <button
              v-for="item in group?.items ?? []"
              :key="item.order_id"
              type="button"
              :class="{ active: activeItem?.order_id === item.order_id }"
              @click="selectedOrderId = item.order_id"
            >
              <span>{{ item.line_no }}</span>
              <div><strong>{{ catalogProductName(item) }}</strong><small>{{ itemStepErrors(item, 3).length ? t('{count} 项待补', '{count} item(s) incomplete', { count: itemStepErrors(item, 3).length }) : t('本阶段完整', 'Section Complete') }}</small></div>
            </button>
          </aside>
          <div v-if="activeItem" class="case-config-form case-material-form" data-testid="case-material-form">
            <div class="case-current-product">
              <i>{{ categoryIcon(productCategory(activeItem)) }}</i>
              <div>
                <strong>{{ catalogProductName(activeItem) }}</strong>
                <small>{{ categoryName(productCategory(activeItem)) }}<template v-if="activeVariant"> · {{ catalogVariantName(activeVariant) }}</template></small>
              </div>
              <span>{{ priceLabel(activeItem) }}</span>
            </div>

            <section v-if="productCategory(activeItem) === 'IMPLANT_RESTORATION'" class="case-material-section">
              <header><h3>{{ t('种植参数', 'Implant Parameters') }}</h3></header>
              <div class="case-material-grid">
                <label class="case-field"><span>{{ t('种植系统 *', 'Implant System *') }}</span><select v-model="activeItem.form_values.implant_system"><option value="">{{ t('请选择', 'Select') }}</option><option>Nobel Biocare</option><option>Straumann</option><option>Osstem</option><option>BioHorizons</option><option>Zimmer Biomet</option><option>Megagen</option><option>{{ t('其他', 'Other') }}</option></select></label>
                <label class="case-field"><span>{{ t('种植直径 × 长度 *', 'Implant Diameter × Length *') }}</span><input v-model="activeItem.form_values.implant_diameter_length" :placeholder="t('例如 Ø4.1 × 10mm', 'For example: Ø4.1 × 10 mm')"></label>
                <label class="case-field"><span>{{ t('连接方式 *', 'Connection Type *') }}</span><select v-model="activeItem.form_values.connection_type"><option value="">{{ t('请选择', 'Select') }}</option><option value="INTERNAL">{{ t('内连接', 'Internal Connection') }}</option><option value="EXTERNAL">{{ t('外连接', 'External Connection') }}</option></select></label>
                <label class="case-field"><span>{{ t('基台类型', 'Abutment Type') }}</span><select v-model="activeItem.form_values.abutment_type"><option value="">{{ t('请选择', 'Select') }}</option><option value="STANDARD">{{ t('标准基台', 'Standard Abutment') }}</option><option value="ANGLED">{{ t('角度基台', 'Angled Abutment') }}</option><option value="CUSTOM">{{ t('个性化基台', 'Custom Abutment') }}</option></select></label>
                <label class="case-field"><span>{{ t('固位方式 *', 'Retention Type *') }}</span><select v-model="activeItem.form_values.retention_type"><option value="">{{ t('请选择', 'Select') }}</option><option value="SCREW">{{ t('螺丝固位', 'Screw-retained') }}</option><option value="CEMENT">{{ t('粘接固位', 'Cement-retained') }}</option></select></label>
                <label class="case-field"><span>{{ t('螺丝开口位置', 'Screw Access Position') }}</span><select v-model="activeItem.form_values.screw_access_position"><option value="">{{ t('请选择', 'Select') }}</option><option value="BUCCAL">{{ t('颊侧', 'Buccal') }}</option><option value="LINGUAL">{{ t('舌侧', 'Lingual') }}</option><option value="OCCLUSAL">{{ t('咬合面', 'Occlusal') }}</option></select></label>
              </div>
            </section>

            <section
              v-if="['FIXED_RESTORATION', 'IMPLANT_RESTORATION', 'REMOVABLE_PROSTHETICS'].includes(productCategory(activeItem)) || primaryMaterialOptions(activeItem).length || activeVariants.length"
              class="case-material-section"
            >
              <header><h3>{{ productCategory(activeItem) === 'IMPLANT_RESTORATION' ? t('修复材料', 'Restoration Material') : productCategory(activeItem) === 'REMOVABLE_PROSTHETICS' ? t('活动义齿配置', 'Removable Denture Configuration') : t('材料与工艺', 'Materials & Process') }}</h3></header>
              <div class="case-material-grid">
                <label v-if="primaryMaterialOptions(activeItem).length" class="case-field">
                  <span>{{ t('主材料 / 制作项目 *', 'Primary Material / Manufacturing Item *') }}</span>
                  <select :value="primaryMaterialValue(activeItem)" data-testid="case-primary-material" @change="choosePrimaryMaterial(activeItem, ($event.target as HTMLSelectElement).value)">
                    <option value="">{{ t('请选择', 'Select') }}</option>
                    <option v-for="(option, optionIndex) in primaryMaterialOptions(activeItem)" :key="option" :value="option">{{ safeEnglishDynamicText(option, `Material Option ${optionIndex + 1}`) }}</option>
                  </select>
                </label>
                <label v-if="activeVariants.length" class="case-field">
                  <span>{{ t('产品规格 *', 'Product Variant *') }}</span>
                  <select v-model.number="activeItem.variant_id" @change="changeVariant(activeItem)">
                    <option :value="null">{{ t('请选择', 'Select') }}</option>
                    <option v-for="variant in activeVariants" :key="variant.variant_id" :value="variant.variant_id">{{ catalogVariantName(variant) }}</option>
                  </select>
                </label>

                <template v-if="productCategory(activeItem) === 'FIXED_RESTORATION'">
                  <label class="case-field"><span>{{ t('边缘类型', 'Margin Type') }}</span><select v-model="activeItem.form_values.finish_margin_type"><option value="">{{ t('请选择', 'Select') }}</option><option value="SUPRAGINGIVAL">{{ t('龈上边缘', 'Supragingival Margin') }}</option><option value="SUBGINGIVAL">{{ t('龈下边缘', 'Subgingival Margin') }}</option><option value="SHOULDER_STANDARD">{{ t('肩台标准', 'Standard Shoulder') }}</option></select></label>
                  <label class="case-field"><span>{{ t('牙色系统', 'Shade System') }}</span><select v-model="activeItem.form_values.shade_system"><option value="">{{ t('请选择', 'Select') }}</option><option value="VITA_16">VITA 16 Classic</option><option value="3D_MASTER">3D Master</option><option value="THREE_ZONE">{{ t('颈部 / 体部 / 切端分色', 'Cervical / Body / Incisal Shades') }}</option></select></label>
                </template>
                <template v-else-if="productCategory(activeItem) === 'IMPLANT_RESTORATION'">
                  <label class="case-field"><span>{{ t('牙色系统', 'Shade System') }}</span><select v-model="activeItem.form_values.shade_system"><option value="">{{ t('请选择', 'Select') }}</option><option value="VITA_16">VITA 16 Classic</option><option value="3D_MASTER">3D Master</option><option value="THREE_ZONE">{{ t('颈部 / 体部 / 切端分色', 'Cervical / Body / Incisal Shades') }}</option></select></label>
                </template>
                <template v-else-if="productCategory(activeItem) === 'REMOVABLE_PROSTHETICS'">
                  <label class="case-field"><span>{{ t('卡环设计', 'Clasp Design') }}</span><select v-model="activeItem.form_values.clasp_design"><option value="">{{ t('无 / 请选择', 'None / Select') }}</option><option>Standard I-bar</option><option>Circumferential</option><option>Ball Clasp</option><option>Custom</option><option>Casting Wire Clasp</option><option>Clear Clasp</option><option>Valplast Clasp-clear</option><option>Cast Chrome Clasp</option><option>Wrought Wire Clasp</option><option>Valplast Clasp-pink</option></select></label>
                  <label class="case-field"><span>{{ t('义齿牙品牌', 'Denture Tooth Brand') }}</span><select v-model="activeItem.form_values.denture_teeth_brand"><option value="">{{ t('请选择', 'Select') }}</option><option>Huge</option><option>Yamahachi</option><option>Vita</option></select></label>
                  <label class="case-field"><span>{{ t('牙色系统', 'Shade System') }}</span><select v-model="activeItem.form_values.shade_system"><option value="">{{ t('请选择', 'Select') }}</option><option value="VITA_16">VITA 16 Classic</option><option value="3D_MASTER">3D Master</option></select></label>
                </template>

                <label v-if="activeItem.form_values.shade_system && activeItem.form_values.shade_system !== 'THREE_ZONE' && ['FIXED_RESTORATION', 'IMPLANT_RESTORATION', 'REMOVABLE_PROSTHETICS'].includes(productCategory(activeItem))" class="case-field"><span>{{ t('牙色', 'Shade') }}</span><select v-model="activeItem.form_values.shade_value"><option value="">{{ t('请选择', 'Select') }}</option><option v-for="shade in activeItem.form_values.shade_system === '3D_MASTER' ? VITA_3D_SHADES : VITA_16_SHADES" :key="shade">{{ shade }}</option></select></label>
                <template v-if="activeItem.form_values.shade_system === 'THREE_ZONE'">
                  <label class="case-field"><span>{{ t('颈部色', 'Cervical Shade') }}</span><select v-model="activeItem.form_values.cervical_shade"><option value="">{{ t('请选择', 'Select') }}</option><option v-for="shade in [...VITA_16_SHADES, ...VITA_3D_SHADES]" :key="`c-${shade}`">{{ shade }}</option></select></label>
                  <label class="case-field"><span>{{ t('体部色', 'Body Shade') }}</span><select v-model="activeItem.form_values.body_shade"><option value="">{{ t('请选择', 'Select') }}</option><option v-for="shade in [...VITA_16_SHADES, ...VITA_3D_SHADES]" :key="`b-${shade}`">{{ shade }}</option></select></label>
                  <label class="case-field"><span>{{ t('切端色', 'Incisal Shade') }}</span><select v-model="activeItem.form_values.incisal_shade"><option value="">{{ t('请选择', 'Select') }}</option><option v-for="shade in [...VITA_16_SHADES, ...VITA_3D_SHADES]" :key="`i-${shade}`">{{ shade }}</option></select></label>
                </template>
                <label v-if="productCategory(activeItem) === 'REMOVABLE_PROSTHETICS'" class="case-field"><span>{{ t('义齿基托颜色', 'Denture Base Shade') }}</span><select v-model="activeItem.form_values.denture_base_shade"><option value="">{{ t('请选择', 'Select') }}</option><option v-for="shade in DENTURE_BASE_SHADES" :key="shade">{{ localizedSourceText(shade, shade) }}</option></select></label>
                <label v-if="['FIXED_RESTORATION', 'IMPLANT_RESTORATION', 'REMOVABLE_PROSTHETICS'].includes(productCategory(activeItem))" class="case-field"><span>{{ t('抛光程度', 'Polish Level') }}</span><select v-model="activeItem.form_values.polish_grade"><option value="">{{ t('请选择', 'Select') }}</option><option value="STANDARD">{{ t('普通抛光', 'Standard Polish') }}</option><option value="MIRROR">{{ t('镜面抛光', 'Mirror Polish') }}</option></select></label>
                <label v-if="['FIXED_RESTORATION', 'IMPLANT_RESTORATION', 'REMOVABLE_PROSTHETICS'].includes(productCategory(activeItem))" class="case-field full"><span>{{ t('材料与色号备注', 'Material & Shade Notes') }}</span><textarea :value="String(activeItem.form_values.material_shade_notes ?? '')" rows="3" :placeholder="t('补充颜色、个性化染色或材料要求', 'Add shade, custom staining, or material requirements')" @input="updateTextField(activeItem, 'material_shade_notes', ($event.target as HTMLTextAreaElement).value)"></textarea></label>
              </div>
            </section>

            <section v-if="productCategory(activeItem) === 'FIXED_RESTORATION'" class="case-material-section">
              <header><h3>{{ t('精密附件（可选）', 'Precision Attachments (Optional)') }}</h3></header>
              <div class="case-check-grid">
                <label v-for="(attachment, attachmentIndex) in FIXED_PRECISION_ATTACHMENTS" :key="attachment">
                  <input type="checkbox" :checked="sourceArray(activeItem, 'precision_attachments').includes(attachment)" @change="toggleSourceArray(activeItem, 'precision_attachments', attachment, ($event.target as HTMLInputElement).checked)">
                  {{ safeEnglishDynamicText(attachment, `Precision Attachment ${attachmentIndex + 1}`) }}
                </label>
              </div>
            </section>

            <section v-if="productCategory(activeItem) === 'CONVENTIONAL_ORTHODONTICS'" class="case-material-section">
              <header><h3>{{ t('正畸附件', 'Orthodontic Accessories') }}</h3></header>
              <div class="case-check-grid">
                <label v-for="(accessory, accessoryIndex) in ORTHODONTIC_ACCESSORIES" :key="accessory">
                  <input type="checkbox" :checked="sourceArray(activeItem, 'orthodontic_accessories').includes(accessory)" @change="toggleSourceArray(activeItem, 'orthodontic_accessories', accessory, ($event.target as HTMLInputElement).checked)">
                  {{ safeEnglishDynamicText(accessory, `Orthodontic Accessory ${accessoryIndex + 1}`) }}
                </label>
              </div>
              <label class="case-field"><span>{{ t('附件数量及位置说明', 'Accessory Quantity & Position Notes') }}</span><textarea :value="String(activeItem.form_values.orthodontic_accessory_notes ?? '')" rows="3" :placeholder="t('例如：16、26 各加一个带环', 'For example: add one band to teeth 16 and 26')" @input="updateTextField(activeItem, 'orthodontic_accessory_notes', ($event.target as HTMLTextAreaElement).value)"></textarea></label>
            </section>

            <section v-if="productCategory(activeItem) === 'DESIGN_SERVICE'" class="case-material-section">
              <header><h3>{{ t('设计交付', 'Design Delivery') }}</h3></header>
              <div class="case-material-grid">
                <label class="case-field"><span>{{ t('交付文件格式 *', 'Delivery File Format *') }}</span><select v-model="activeItem.form_values.design_delivery_format"><option value="">{{ t('请选择', 'Select') }}</option><option>STL</option><option>OBJ</option><option>EXO</option><option>3SHAPE</option></select></label>
                <label class="case-field"><span>{{ t('交付时间 *', 'Delivery Time *') }}</span><select v-model="activeItem.form_values.design_delivery_turnaround"><option value="">{{ t('请选择', 'Select') }}</option><option value="6H">{{ t('6 小时', '6 Hours') }}</option><option value="12H">{{ t('12 小时', '12 Hours') }}</option><option value="24H">{{ t('24 小时', '24 Hours') }}</option><option value="48H">{{ t('48 小时', '48 Hours') }}</option></select></label>
              </div>
            </section>

            <section v-if="activeMultipleMaterials.length" class="case-material-section">
              <header><h3>{{ t('附加材料', 'Additional Materials') }}</h3></header>
              <label v-for="binding in activeMultipleMaterials" :key="binding.material_id" class="case-option">
                <input type="checkbox" :checked="selected(activeItem.material_selections, binding.material_id)" @change="toggleMaterial(binding, ($event.target as HTMLInputElement).checked)">
                <span><strong>{{ safeEnglishDynamicText(binding.display_name, humanizeCode(binding.material_code)) }}</strong><small>{{ safeEnglishDynamicText([binding.brand_name, binding.specification].filter(Boolean).join(' · '), t('目录规格', 'Catalog specification')) }}</small></span>
                <em>{{ binding.required_flag ? t('必选', 'Required') : t('可选', 'Optional') }}</em>
                <input v-if="selected(activeItem.material_selections, binding.material_id)" type="number" min="1" :max="binding.max_quantity ?? undefined" :value="selectionQuantity(activeItem.material_selections, binding.material_id)" @input="setSelectionQuantity('material', binding.material_id, Number(($event.target as HTMLInputElement).value))">
              </label>
            </section>

            <section v-if="activeAccessories.length" class="case-material-section">
              <header><h3>{{ t('附加选项', 'Additional Options') }}</h3></header>
              <label v-for="binding in activeAccessories" :key="binding.accessory_id" class="case-option">
                <input type="checkbox" :checked="selected(activeItem.accessory_selections, binding.accessory_id)" @change="toggleAccessory(binding, ($event.target as HTMLInputElement).checked)">
                <span><strong>{{ safeEnglishDynamicText(binding.display_name, humanizeCode(binding.accessory_code)) }}</strong></span>
                <em>{{ binding.required_flag ? t('必选', 'Required') : t('可选', 'Optional') }}</em>
                <input v-if="selected(activeItem.accessory_selections, binding.accessory_id)" type="number" min="1" :max="binding.max_quantity ?? undefined" :value="selectionQuantity(activeItem.accessory_selections, binding.accessory_id)" @input="setSelectionQuantity('accessory', binding.accessory_id, Number(($event.target as HTMLInputElement).value))">
              </label>
            </section>

            <section v-if="activeFields.length" class="case-material-section">
              <header><h3>{{ t('补充要求', 'Additional Requirements') }}</h3></header>
              <div class="case-material-grid">
                <template v-for="field in activeFields" :key="field.key">
                  <label v-if="fieldVisible(field, activeItem)" class="case-field" :class="{ full: ['textarea', 'object'].includes(fieldType(field)) }">
                    <span>{{ localizedSourceText(field.label, field.key) }}<b v-if="field.required"> *</b></span>
                    <select v-if="fieldType(field) === 'multi_select' && field.options?.length" multiple :value="Array.isArray(activeItem.form_values[field.key]) ? activeItem.form_values[field.key] : []" @change="updateMultiSelectField(activeItem, field.key, $event)">
                      <option v-for="option in field.options" :key="optionValue(option)" :value="optionValue(option)">{{ localizedSourceText(optionLabel(option), optionValue(option)) }}</option>
                    </select>
                    <select v-else-if="field.options?.length" v-model="activeItem.form_values[field.key]"><option value="">{{ t('请选择', 'Select') }}</option><option v-for="option in field.options" :key="optionValue(option)" :value="optionValue(option)">{{ localizedSourceText(optionLabel(option), optionValue(option)) }}</option></select>
                    <textarea v-else-if="fieldType(field) === 'textarea'" :value="String(activeItem.form_values[field.key] ?? '')" rows="3" @input="updateTextField(activeItem, field.key, ($event.target as HTMLTextAreaElement).value)"></textarea>
                    <input v-else-if="fieldType(field) === 'number' || fieldType(field) === 'quantity'" v-model.number="activeItem.form_values[field.key]" type="number" :step="fieldType(field) === 'quantity' ? 1 : 'any'" :min="field.minimum ?? field.min" :max="field.maximum ?? field.max">
                    <label v-else-if="fieldType(field) === 'boolean'" class="case-switch"><input type="checkbox" :checked="Boolean(activeItem.form_values[field.key])" @change="updateBooleanField(activeItem, field.key, ($event.target as HTMLInputElement).checked)"><span>{{ t('是 / 否', 'Yes / No') }}</span></label>
                    <input v-else-if="fieldType(field) === 'array' || fieldType(field) === 'multi_select'" :value="Array.isArray(activeItem.form_values[field.key]) ? (activeItem.form_values[field.key] as unknown[]).join(locale === 'EN' ? ', ' : '，') : ''" :placeholder="t('多项用逗号分隔', 'Separate multiple items with commas')" @input="updateArrayField(activeItem, field.key, ($event.target as HTMLInputElement).value)">
                    <template v-else-if="fieldType(field) === 'object'">
                      <textarea :value="objectFieldText(activeItem, field.key)" rows="5" :placeholder="t('请按示例填写补充内容', 'Enter additional content using the example format')" @input="updateObjectFieldDraft(activeItem, field.key, ($event.target as HTMLTextAreaElement).value)" @blur="commitObjectField(activeItem, field.key)"></textarea>
                      <small v-if="objectFieldErrors[objectFieldKey(activeItem, field.key)]" class="case-field-error">{{ objectFieldErrors[objectFieldKey(activeItem, field.key)] }}</small>
                    </template>
                    <input v-else v-model="activeItem.form_values[field.key]" type="text">
                  </label>
                </template>
              </div>
            </section>
            <div v-if="itemStepErrors(activeItem, 3).length" class="case-alert warning">{{ itemStepErrors(activeItem, 3).join('；') }}</div>
            <button type="button" class="case-primary" :disabled="busy" data-testid="case-save-item" @click="saveItem(activeItem)">{{ t('保存当前产品', 'Save Current Product') }}</button>
          </div>
        </div>
      </section>

      <section v-else-if="step === 4" class="case-panel">
        <header><h1>{{ t('资料上传', 'Upload Records') }}</h1><p>{{ t('请上传病例共享资料和各产品所需资料；单个文件最大 500MB。', 'Upload case-shared records and product-specific files. Maximum file size: 500 MB.') }}</p></header>
        <section class="case-upload-card shared">
          <header><div><strong>{{ t('病例共享资料', 'Case-shared Records') }}</strong><small>{{ t('同一病例多个产品共用的影像可只上传一次', 'Images shared by multiple products in the same case only need to be uploaded once') }}</small></div><span>{{ t('{count} 个', '{count} file(s)', { count: sharedFiles.length }) }}</span></header>
          <label><input type="file" multiple :disabled="fileUploading || !group?.items.length" @change="uploadSharedFiles"><b>＋ {{ t('上传共享资料', 'Upload Shared Records') }}</b><small>{{ t('共享资料仍需在下方相应资料槽位中完成分类', 'Shared records must still be assigned to the appropriate slots below') }}</small></label>
          <article v-for="file in sharedFiles" :key="file.file_id">
            <strong>{{ file.name }}</strong>
            <small>{{ file.size_label }}</small>
            <button type="button" class="case-file-remove" :disabled="busy || fileUploading" @click="removeSharedFile(file)">{{ t('移除', 'Remove') }}</button>
          </article>
        </section>
        <div class="case-config-layout upload-layout">
          <aside class="case-item-tabs" :data-section-label="t('已选产品', 'Selected Products')">
            <button v-for="item in group?.items ?? []" :key="item.order_id" type="button" :class="{ active: activeItem?.order_id === item.order_id }" @click="selectedOrderId = item.order_id">
              <span>{{ item.line_no }}</span><div><strong>{{ catalogProductName(item) }}</strong><small>{{ t('{count} 项必传待补', '{count} required upload(s) missing', { count: uploadRules(item).filter((rule) => rule.required && !uploadedSlotIds(item, rule.code).length).length }) }}</small></div>
            </button>
          </aside>
          <section v-if="activeItem" class="case-upload-card">
            <header><div><strong>{{ catalogProductName(activeItem) }}</strong><small>{{ categoryName(productCategory(activeItem)) }} · {{ activeItem.order_no }}</small></div><span>{{ t('{count} 个', '{count} file(s)', { count: itemFiles[activeItem.order_id]?.length ?? 0 }) }}</span></header>
            <div class="case-upload-slots">
              <label v-for="rule in uploadRules(activeItem)" :key="rule.code" :class="{ complete: uploadedSlotIds(activeItem, rule.code).length }">
                <div><strong>{{ localizedSourceText(rule.label, rule.code) }}</strong><small>{{ rule.required ? t('必传', 'Required') : t('选传', 'Optional') }} · {{ rule.accept }}</small></div>
                <span>{{ uploadedSlotIds(activeItem, rule.code).length ? t('已上传 {count} 个', '{count} uploaded', { count: uploadedSlotIds(activeItem, rule.code).length }) : t('尚未上传', 'Not Uploaded') }}</span>
                <b>＋ {{ t('选择文件', 'Choose Files') }}<input type="file" multiple :accept="rule.accept" :disabled="fileUploading" @change="uploadProductFiles($event, activeItem, rule.code)"></b>
              </label>
            </div>
            <div v-if="itemFiles[activeItem.order_id]?.length" class="case-uploaded-files">
              <article v-for="file in itemFiles[activeItem.order_id]" :key="file.file_id">
                <div><strong>{{ file.name }}</strong><small>{{ file.size_label }}</small></div>
                <button type="button" class="case-file-remove" :disabled="busy || fileUploading" @click="removeProductFile(activeItem, file)">{{ t('移除', 'Remove') }}</button>
              </article>
            </div>
          </section>
        </div>
      </section>

      <section v-else-if="step === 5" class="case-panel case-config-panel">
        <header><h1>{{ t('试戴与过程确认', 'Try-in & Process Confirmations') }}</h1><p>{{ t('请逐个产品选择是否试戴，以及制作过程中需要确认的内容。', 'Choose whether each product requires a try-in and which production steps require confirmation.') }}</p></header>
        <div class="case-config-layout">
          <aside class="case-item-tabs" :data-section-label="t('已选产品', 'Selected Products')">
            <button v-for="item in group?.items ?? []" :key="item.order_id" type="button" :class="{ active: activeItem?.order_id === item.order_id }" @click="selectedOrderId = item.order_id">
              <span>{{ item.line_no }}</span><div><strong>{{ catalogProductName(item) }}</strong><small>{{ item.order_no }}</small></div>
            </button>
          </aside>
          <section v-if="activeItem" class="case-config-form">
            <DoctorOrthodonticPrescription
              v-if="productCategory(activeItem) === 'CLEAR_ALIGNER'"
              :key="activeItem.order_id"
              :token="props.token"
              :order-id="activeItem.order_id"
              :aligner-types="clearAlignerTypes(activeItem)"
              :related-orders="relatedOrders(activeItem)"
              :initial-treatment-arch="String(activeItem.form_values.treatment_arch ?? '')"
              :initial-treatment-mode="String(activeItem.form_values.treatment_mode ?? '')"
              :initial-records="prescriptionInitialRecords(activeItem)"
              @ready="orthodonticPrescriptionReady[activeItem.order_id] = $event"
              @treatment-selection-change="updateClearAlignerSelection(activeItem, $event)"
            />
            <label class="case-process-option">
              <input v-model="activeItem.form_values.try_in_required" type="checkbox">
              <div><strong>{{ t('成品完成前需要试戴', 'Try-in Required Before Final Completion') }}</strong><p>{{ t('试戴后医生可在原订单继续选择完成成品；试戴费用待报价，不预填金额。', 'After the try-in, the doctor can continue selecting the final product in the same order. Try-in pricing is pending and no amount is prefilled.') }}</p></div>
            </label>
            <section class="case-config-block">
              <header><h3>{{ t('制作过程确认', 'Production Confirmations') }}</h3><small>{{ t('增加确认环节可能影响交期，客服受理时会一并确认', 'Additional confirmation steps may affect lead time and will be reviewed by Order Support') }}</small></header>
              <div class="case-process-list">
                <label v-for="option in [{ value: 'CAD_DESIGN', label: t('CAD 设计确认（制作前）', 'CAD Design Review (Before Production)') }, { value: 'POST_MILLING_PHOTOS', label: t('切削/打印后照片确认', 'Photo Review After Milling / Printing') }, { value: 'POST_GLAZING_PHOTOS', label: t('上釉后照片确认（质检前）', 'Photo Review After Glazing (Before QC)') }]" :key="option.value">
                  <input type="checkbox" :checked="sourceArray(activeItem, 'process_reviews').includes(option.value)" @change="toggleSourceArray(activeItem, 'process_reviews', option.value, ($event.target as HTMLInputElement).checked)">
                  <span>{{ option.label }}</span>
                </label>
              </div>
            </section>
            <label class="case-field"><span>{{ t('特殊要求', 'Special Requirements') }}</span><textarea :value="String(activeItem.form_values.special_requirements ?? '')" rows="5" :placeholder="t('补充当前产品的特殊制作要求', 'Add special production requirements for this product')" @input="updateTextField(activeItem, 'special_requirements', ($event.target as HTMLTextAreaElement).value)"></textarea></label>
            <section class="case-config-block">
              <header><h3>{{ t('模型寄送信息', 'Physical Model Shipping') }}</h3><small>{{ t('适用所有产品；只有需要寄送实体模型时填写', 'Applies to all products; complete only when a physical model must be shipped') }}</small></header>
              <label class="case-process-option">
                <input v-model="activeItem.form_values.physical_model_shipping_required" type="checkbox">
                <div><strong>{{ t('需要寄送实体模型', 'Physical Model Shipping Required') }}</strong><p>{{ t('勾选后填写快递/业务员配送信息，客服可据此跟踪模型到厂。', 'Enter courier or representative delivery details so Order Support can track the model to the lab.') }}</p></div>
              </label>
              <div v-if="activeItem.form_values.physical_model_shipping_required" class="case-field-grid">
                <label class="case-field"><span>{{ t('运输方式', 'Shipping Method') }}</span><select v-model="activeItem.form_values.physical_model_shipping_method"><option value="">{{ t('请选择', 'Select') }}</option><option value="COURIER">{{ t('快递', 'Courier') }}</option><option value="SALES_DELIVERY">{{ t('业务员配送', 'Representative Delivery') }}</option><option value="SELF_DELIVERY">{{ t('自行送达', 'Self Delivery') }}</option></select></label>
                <label class="case-field"><span>{{ t('运单号 / 配送说明', 'Tracking Number / Delivery Notes') }}</span><input v-model="activeItem.form_values.physical_model_tracking_no" :placeholder="t('填写运单号或配送联系人', 'Enter a tracking number or delivery contact')"></label>
              </div>
            </section>
            <button type="button" class="case-primary" :disabled="busy" @click="saveItem(activeItem)">{{ t('保存当前确认要求', 'Save Confirmation Requirements') }}</button>
          </section>
        </div>
      </section>

      <section v-else class="case-panel">
        <header><h1>{{ t('报价、要求与周期确认', 'Quote, Requirements & Lead Time') }}</h1><p>{{ t('请核对全部产品和资料；正式报价与可行交期将在客服受理后确认。', 'Review all products and records. Order Support will confirm the final quote and feasible lead time.') }}</p></header>
        <div class="case-review-head">
          <div><span>{{ t('病例订单', 'Case Order') }}</span><strong>{{ group?.group_no }}</strong></div>
          <div><span>{{ t('患者', 'Patient') }}</span><strong>{{ selectedPatient?.patient_name }}</strong></div>
          <div><span>{{ t('产品数', 'Products') }}</span><strong>{{ group?.items.length ?? 0 }}</strong></div>
          <div><span>{{ t('共享资料', 'Shared Records') }}</span><strong>{{ t('{count} 个', '{count} file(s)', { count: sharedFiles.length }) }}</strong></div>
        </div>
        <div class="case-review-list">
          <article v-for="item in group?.items ?? []" :key="item.order_id" :class="{ incomplete: itemErrors(item).length }">
            <span>{{ item.line_no }}</span>
            <div><strong>{{ catalogProductName(item) }}<em v-if="item.variant_name"> · {{ safeEnglishDynamicText(item.variant_name, humanizeCode(item.variant_code || 'variant')) }}</em></strong><small>{{ item.order_no }} · {{ categoryName(productCategory(item)) }}</small></div>
            <b>{{ priceLabel(item) }}</b>
            <i>{{ t('{count} 个专属文件', '{count} product-specific file(s)', { count: itemFiles[item.order_id]?.length ?? 0 }) }}</i>
            <em>{{ itemErrors(item).length ? itemErrors(item).join(locale === 'EN' ? '; ' : '；') : t('配置完整', 'Configuration Complete') }}</em>
          </article>
        </div>
        <section class="case-final-confirmations">
          <label><input v-model="finalConfirmations.quote" type="checkbox"><div><strong>{{ t('报价状态确认', 'Quote Status Confirmation') }}</strong><p>{{ t('当前所有产品均为“待报价”，提交后由客服核价并告知正式报价。', 'All products are currently Quote Pending. Order Support will provide the final quote after submission.') }}</p></div></label>
          <label><input v-model="finalConfirmations.requirements" type="checkbox"><div><strong>{{ t('制作要求确认', 'Production Requirements Confirmation') }}</strong><p>{{ t('我已核对牙位、材料、工艺、资料、试戴及过程确认要求。', 'I have reviewed tooth positions, materials, processes, records, try-in, and confirmation requirements.') }}</p></div></label>
          <label><input v-model="finalConfirmations.cycle" type="checkbox"><div><strong>{{ t('制作周期确认', 'Lead Time Confirmation') }}</strong><p>{{ t('要求到货日为 {date}；正式工期由客服根据产品和资料完整度确认。', 'Requested delivery date: {date}. Order Support will confirm the final lead time based on the products and record completeness.', { date: caseSettings.required_delivery_date || t('未填写', 'Not Entered') }) }}</p></div></label>
        </section>
        <div v-if="incompleteItems.length" class="case-alert warning">{{ t('还有 {count} 个子产品不完整，请返回对应阶段补齐：{products}。', '{count} product(s) are incomplete. Return to the relevant sections: {products}.', { count: incompleteItems.length, products: incompleteItems.map((item) => catalogProductName(item)).join(locale === 'EN' ? ', ' : '、') }) }}</div>
        <div v-else-if="!finalConfirmationComplete" class="case-alert warning">{{ t('请完成上面三项确认后提交。', 'Complete the three confirmations above before submitting.') }}</div>
        <div v-else class="case-alert success">{{ t('信息填写完整，可以提交订单。', 'All required information is complete. The order is ready to submit.') }}</div>
      </section>
    </main>

    <footer class="case-wizard__footer">
      <div class="case-footer-context">
        <button v-if="group" type="button" :disabled="busy || fileUploading" @click="saveAllItems()">{{ t('保存草稿', 'Save Draft') }}</button>
        <span v-if="group">{{ t('{count} 个产品 · 均为待报价', '{count} product(s) · All Quote Pending', { count: group.items.length }) }}</span>
      </div>
      <div>
        <button v-if="step > 1" type="button" :disabled="busy || fileUploading" @click="step--">{{ t('上一步', 'Previous') }}</button>
        <button v-if="step < 6" type="button" class="case-primary" :disabled="busy || fileUploading" @click="nextStep">{{ t('下一步', 'Next') }} →</button>
        <button v-else type="button" class="case-primary" data-testid="case-submit" :disabled="busy || fileUploading || incompleteItems.length > 0 || !finalConfirmationComplete" @click="submitGroup">{{ busy ? t('提交中…', 'Submitting…') : t('提交订单', 'Submit Order') }}</button>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.case-wizard{position:fixed;inset:12px;z-index:10020;display:grid;grid-template-rows:64px 76px minmax(0,1fr) 68px;overflow:hidden;border:1px solid #d9e3ef;border-radius:18px;background:#f5f8fc;box-shadow:0 24px 80px #0f274133;color:#17243a}.case-wizard__header,.case-wizard__footer{display:flex;align-items:center;justify-content:space-between;padding:0 24px;background:#fff;border-bottom:1px solid #e5ebf2}.case-wizard__header>div{display:flex;align-items:center;gap:12px}.case-wizard__header strong,.case-wizard__header small{display:block}.case-wizard__header strong{font-size:17px}.case-wizard__header small{margin-top:3px;color:#718096}.case-wizard__mark{width:36px;height:36px;display:grid;place-items:center;border-radius:11px;background:#1768e5;color:#fff;font-weight:800}.case-wizard button{cursor:pointer}.case-wizard button:disabled{cursor:not-allowed;opacity:.55}.case-wizard__header>button{border:0;background:#f1f5f9;border-radius:9px;padding:9px 13px;color:#526174}.case-wizard__steps{display:grid;grid-template-columns:repeat(5,1fr);padding:12px 8%;background:#fff;border-bottom:1px solid #e5ebf2}.case-wizard__steps button{position:relative;display:flex;align-items:center;justify-content:center;gap:8px;border:0;background:transparent;color:#94a3b8}.case-wizard__steps button:not(:last-child):after{content:"";position:absolute;right:-25%;width:50%;height:2px;background:#e2e8f0}.case-wizard__steps button.done:not(:last-child):after{background:#2e7cf6}.case-wizard__steps span{width:28px;height:28px;display:grid;place-items:center;border-radius:50%;background:#eef2f7;color:#64748b}.case-wizard__steps .active,.case-wizard__steps .done{color:#1768e5}.case-wizard__steps .active span,.case-wizard__steps .done span{background:#1768e5;color:#fff}.case-wizard>main{min-height:0;overflow:auto;padding:22px}.case-panel{max-width:1320px;margin:auto}.case-panel>header{margin-bottom:18px}.case-panel h1{margin:0;font-size:24px}.case-panel>header p{margin:6px 0 0;color:#718096}.case-search{max-width:520px;height:42px;display:flex;align-items:center;gap:9px;padding:0 12px;border:1px solid #d7e0eb;border-radius:10px;background:#fff}.case-search input{flex:1;border:0;outline:0}.case-patient-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-top:16px}.case-patient-grid button{display:grid;grid-template-columns:42px 1fr 22px;align-items:center;text-align:left;padding:13px;border:1.5px solid #dce5ef;border-radius:12px;background:#fff}.case-patient-grid button.active{border-color:#2e7cf6;background:#f1f7ff}.case-patient-grid i{width:34px;height:34px;display:grid;place-items:center;border-radius:50%;background:#ddebff;color:#1768e5;font-style:normal;font-weight:800}.case-patient-grid strong,.case-patient-grid small{display:block}.case-patient-grid small{margin-top:3px;color:#8291a7}.case-patient-grid em{color:#1768e5;font-style:normal}.case-product-layout{display:grid;grid-template-columns:minmax(0,1fr) 390px;gap:18px;margin-top:16px}.case-catalog,.case-basket,.case-config-form,.case-item-tabs,.case-upload-card,.case-review-list{border:1px solid #dce5ef;border-radius:14px;background:#fff}.case-catalog{padding:16px}.case-catalog section+section{margin-top:18px}.case-catalog h3{margin:0 0 10px}.case-catalog button{width:100%;display:grid;grid-template-columns:1fr 100px 76px;align-items:center;text-align:left;padding:12px;border:1px solid #e5ebf2;border-radius:10px;background:#fff}.case-catalog button+button{margin-top:8px}.case-catalog strong,.case-catalog small{display:block}.case-catalog small{margin-top:3px;color:#8291a7}.case-catalog span{color:#a46810}.case-catalog b{color:#1768e5;text-align:right}.case-basket{overflow:hidden}.case-basket>header{display:flex;justify-content:space-between;padding:14px;border-bottom:1px solid #e5ebf2}.case-basket article{display:grid;grid-template-columns:1fr auto auto auto;gap:8px;align-items:center;padding:12px;border-bottom:1px solid #edf1f5}.case-basket article strong,.case-basket article small{display:block}.case-basket article small{margin-top:3px;color:#8291a7}.case-basket article>span{color:#a46810}.case-basket article button{border:0;background:#edf5ff;border-radius:7px;padding:6px 8px;color:#1768e5}.case-basket article button.danger{background:#fff0f0;color:#c24141}.case-basket>p{padding:30px;text-align:center;color:#94a3b8}.case-config-layout{display:grid;grid-template-columns:270px minmax(0,1fr);gap:16px}.case-item-tabs{align-self:start;overflow:hidden}.case-item-tabs button{width:100%;display:flex;align-items:center;gap:10px;padding:12px;border:0;border-bottom:1px solid #edf1f5;background:#fff;text-align:left}.case-item-tabs button.active{background:#eef6ff;color:#1768e5}.case-item-tabs button>span{width:28px;height:28px;display:grid;place-items:center;border-radius:8px;background:#edf2f7}.case-item-tabs strong,.case-item-tabs small{display:block}.case-item-tabs small{margin-top:3px}.case-config-form{padding:18px}.case-config-summary,.case-review-head{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;padding:12px;border-radius:11px;background:#f5f8fc}.case-config-summary span,.case-config-summary strong,.case-review-head span,.case-review-head strong{display:block}.case-config-summary span,.case-review-head span{color:#8190a5;font-size:12px}.case-config-summary strong,.case-review-head strong{margin-top:4px}.case-field{display:block;margin-top:14px}.case-field>span{display:block;margin-bottom:6px;color:#526174}.case-field b{color:#dc2626}.case-field input,.case-field select,.case-field textarea{width:100%;box-sizing:border-box;border:1px solid #d6e0eb;border-radius:8px;padding:9px;background:#fff}.case-field select[multiple]{min-height:108px}.case-field-error{display:block;margin-top:5px;color:#b42318}.case-config-block{margin-top:18px;padding-top:15px;border-top:1px solid #e5ebf2}.case-config-block>header{display:flex;justify-content:space-between;align-items:end}.case-config-block h3{margin:0}.case-config-block header small{color:#8291a7}.case-option{display:grid;grid-template-columns:22px 1fr auto 80px;gap:10px;align-items:center;margin-top:9px;padding:10px;border:1px solid #e4eaf1;border-radius:9px}.case-option>span strong,.case-option>span small{display:block}.case-option>span small{margin-top:2px;color:#8291a7}.case-option em{font-style:normal;color:#7a8799}.case-option>input[type=number]{width:72px;border:1px solid #d6e0eb;border-radius:7px;padding:6px}.case-field-grid{display:grid;grid-template-columns:1fr 1fr;gap:0 14px}.case-field.full{grid-column:1/-1}.case-switch{display:flex!important;align-items:center;gap:8px}.case-switch input{width:auto}.case-alert{margin-top:14px;padding:11px 13px;border-radius:9px}.case-alert.warning{border:1px solid #f4cf84;background:#fff8e8;color:#8a5a08}.case-alert.success{border:1px solid #a9dfc3;background:#eefbf4;color:#147647}.case-primary{border:0!important;border-radius:9px!important;background:#1768e5!important;color:#fff!important;padding:10px 16px!important}.case-upload-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:14px}.case-upload-card{padding:14px}.case-upload-card>header{display:flex;justify-content:space-between}.case-upload-card header strong,.case-upload-card header small{display:block}.case-upload-card header small{margin-top:3px;color:#8291a7}.case-upload-card>label{display:block;margin-top:12px;padding:18px;border:1.5px dashed #9dbce8;border-radius:10px;background:#f4f8ff;text-align:center}.case-upload-card>label input{display:none}.case-upload-card>label b,.case-upload-card>label small{display:block}.case-upload-card>label b{color:#1768e5}.case-upload-card>label small{margin-top:5px;color:#8291a7}.case-upload-card>article{display:flex;justify-content:space-between;padding:9px 3px;border-bottom:1px solid #edf1f5}.case-upload-card article small{color:#8291a7}.case-review-head{grid-template-columns:repeat(4,1fr);margin-bottom:14px}.case-review-list{overflow:hidden}.case-review-list article{display:grid;grid-template-columns:34px 1fr 110px 110px minmax(150px,1fr);gap:10px;align-items:center;padding:13px;border-bottom:1px solid #edf1f5}.case-review-list article>span{width:28px;height:28px;display:grid;place-items:center;border-radius:8px;background:#edf5ff;color:#1768e5}.case-review-list strong,.case-review-list small{display:block}.case-review-list small{margin-top:3px;color:#8291a7}.case-review-list article>b{color:#a46810}.case-review-list article>i{font-style:normal;color:#526174}.case-review-list article>em{font-style:normal;color:#167547}.case-review-list article.incomplete>em{color:#b45309}.case-wizard__footer{border-top:1px solid #e5ebf2;border-bottom:0}.case-wizard__footer button{border:1px solid #d6e0eb;border-radius:9px;background:#fff;padding:9px 15px}.case-wizard__footer>div{display:flex;gap:9px}@media(max-width:1000px){.case-wizard{inset:0;border-radius:0}.case-patient-grid{grid-template-columns:1fr 1fr}.case-product-layout,.case-config-layout{grid-template-columns:1fr}.case-basket{order:-1}.case-upload-grid{grid-template-columns:1fr}.case-wizard__steps{padding:10px 2%}.case-wizard__steps strong{font-size:11px}.case-review-list article{grid-template-columns:30px 1fr 90px}.case-review-list article>i,.case-review-list article>em{grid-column:2/-1}.case-review-head{grid-template-columns:1fr 1fr}}@media(max-width:640px){.case-wizard{grid-template-rows:58px 64px minmax(0,1fr) 60px}.case-wizard__header{padding:0 12px}.case-wizard__header small{display:none}.case-wizard__steps strong{display:none}.case-patient-grid,.case-field-grid{grid-template-columns:1fr}.case-panel h1{font-size:20px}.case-wizard>main{padding:14px}.case-config-summary,.case-review-head{grid-template-columns:1fr}.case-catalog button{grid-template-columns:1fr}.case-catalog button>span,.case-catalog button>b{margin-top:5px;text-align:left}}
.case-tooth-chart{grid-column:1/-1;margin-top:14px;padding:14px;border:1px solid #d6e0eb;border-radius:12px;background:#f8fbff}.case-tooth-chart>header{display:flex;align-items:center;justify-content:space-between;gap:16px;margin-bottom:12px}.case-tooth-chart>header strong,.case-tooth-chart>header small{display:block}.case-tooth-chart>header small,.case-tooth-chart>small{margin-top:3px;color:#718096}.case-tooth-chart>header>div:last-child{display:flex;align-items:center;gap:9px;color:#526174}.case-tooth-chart>header button{border:1px solid #d6e0eb;border-radius:7px;background:#fff;padding:5px 9px;color:#526174}.case-tooth-row{display:grid;grid-template-columns:repeat(16,minmax(32px,1fr));gap:6px;margin:6px 0 11px}.case-tooth-row button{min-height:38px;border:1px solid #cbd7e5;border-radius:9px;background:#fff;color:#334155;font-weight:700}.case-tooth-row button:hover{border-color:#6aa5f8;background:#f0f6ff}.case-tooth-row button.selected{border-color:#1768e5;background:#1768e5;color:#fff;box-shadow:0 3px 9px #1768e533}@media(max-width:900px){.case-tooth-row{grid-template-columns:repeat(8,minmax(32px,1fr))}.case-tooth-chart>header{align-items:flex-start;flex-direction:column}.case-tooth-chart>header>div:last-child{width:100%;justify-content:space-between}}@media(max-width:520px){.case-tooth-row{grid-template-columns:repeat(4,minmax(36px,1fr))}}
.case-wizard{inset:0;border-radius:0}.case-wizard__header{background:#0d2c61;color:#fff}.case-wizard__header small{color:#c9d7ec}.case-wizard__header>button{background:transparent;color:#fff}.case-legacy-catalog{max-width:1380px}.case-legacy-catalog-layout{display:grid;grid-template-columns:270px minmax(0,1fr);min-height:650px;border:1px solid #dce5ef;border-radius:14px;background:#fff;overflow:hidden}.case-category-menu{border-right:1px solid #dce5ef;background:#fbfcfe}.case-category-menu>header{padding:22px 18px;border-bottom:1px solid #e5ebf2}.case-category-menu>header small,.case-category-menu>header strong{display:block}.case-category-menu>header small{color:#8291a7}.case-category-menu>header strong{margin-top:5px}.case-category-menu>button{width:100%;display:grid;grid-template-columns:38px 1fr 18px;gap:10px;align-items:center;padding:16px;border:0;border-bottom:1px solid #edf1f5;background:transparent;text-align:left;color:#334155}.case-category-menu>button.active{border-left:4px solid #1768e5;background:#edf5ff;color:#1768e5}.case-category-menu>button>span{font-size:22px;text-align:center}.case-category-menu>button strong,.case-category-menu>button small{display:block}.case-category-menu>button small{margin-top:3px;color:#8291a7}.case-category-menu>button i{font-style:normal}.case-legacy-catalog-main{padding:22px}.case-legacy-catalog-main>header{display:flex;align-items:center;justify-content:space-between;padding-bottom:17px;border-bottom:1px solid #e5ebf2}.case-legacy-catalog-main>header>div{display:flex;align-items:center;gap:12px}.case-legacy-catalog-main>header>div>span{width:46px;height:46px;display:grid;place-items:center;border-radius:12px;background:#edf5ff;color:#1768e5;font-size:24px}.case-legacy-catalog-main h1,.case-legacy-catalog-main p{margin:0}.case-legacy-catalog-main p,.case-legacy-catalog-main>header>small{color:#8291a7}.case-wizard-first-grid{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-top:18px}.case-wizard-first-grid h3{margin:0 0 10px}.case-wizard-first-grid .case-search{max-width:none}.case-choice-list,.case-product-choice{display:grid;gap:9px;max-height:430px;margin-top:12px;overflow:auto;padding-right:4px}.case-choice-list>button,.case-product-choice>button{display:grid;grid-template-columns:42px 1fr 22px;gap:10px;align-items:center;min-height:68px;padding:11px 13px;border:1.5px solid #dce5ef;border-radius:11px;background:#fff;text-align:left;color:#334155}.case-choice-list>button.active,.case-product-choice>button.active{border-color:#2e7cf6;background:#f1f7ff}.case-choice-list>button>i{width:34px;height:34px;display:grid;place-items:center;border-radius:50%;background:#ddebff;color:#1768e5;font-style:normal;font-weight:800}.case-choice-list strong,.case-choice-list small,.case-product-choice strong,.case-product-choice small,.case-product-choice p{display:block}.case-choice-list small,.case-product-choice small{margin-top:3px;color:#8291a7}.case-choice-list em,.case-product-choice i{color:#1768e5;font-style:normal;font-weight:800}.case-product-choice>button>span{width:36px;height:36px;display:grid;place-items:center;border-radius:9px;background:#edf5ff;color:#1768e5;font-size:18px}.case-product-choice p{margin:4px 0 0;color:#a46810}.case-basket-inline{margin-top:18px}.case-basket-inline article{grid-template-columns:1fr 90px 52px 52px}@media(max-width:1000px){.case-legacy-catalog-layout{grid-template-columns:1fr}.case-category-menu{display:grid;grid-template-columns:repeat(3,1fr);border-right:0}.case-category-menu>header{grid-column:1/-1}.case-wizard-first-grid{grid-template-columns:1fr}.case-choice-list,.case-product-choice{max-height:300px}}@media(max-width:640px){.case-category-menu{grid-template-columns:1fr 1fr}.case-legacy-catalog-main{padding:14px}}
.case-wizard__steps{grid-template-columns:repeat(6,1fr);padding-left:4%;padding-right:4%}.case-source-step{max-width:1380px}.case-account-card{display:grid;grid-template-columns:48px 1fr auto;gap:13px;align-items:center;padding:16px 18px;border:1px solid #bcd7fb;border-radius:14px;background:#edf6ff}.case-account-card>span{width:46px;height:46px;display:grid;place-items:center;border-radius:50%;background:#1768e5;color:#fff;font-weight:800}.case-account-card small,.case-account-card strong,.case-account-card p{display:block;margin:0}.case-account-card small{color:#65809f}.case-account-card strong{margin-top:3px}.case-account-card p{margin-top:3px;color:#718096}.case-account-card b{color:#16805d}.case-source-grid{display:grid;grid-template-columns:1fr 1.25fr;gap:16px;margin-top:16px}.case-section-title{display:flex;align-items:center;justify-content:space-between;margin-bottom:12px}.case-section-title small,.case-section-title h3{display:block;margin:0}.case-section-title small{color:#64748b}.case-section-title h3{margin-top:3px}.case-section-title button{border:1px solid #bdd5f5;border-radius:8px;background:#f1f7ff;padding:7px 10px;color:#1768e5}.case-choice-list.compact{max-height:270px}.case-new-patient{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:12px 0;padding:13px;border:1px solid #c9ddf7;border-radius:10px;background:#f5f9ff}.case-new-patient label span,.case-new-patient label input,.case-new-patient label select,.case-new-patient label textarea{display:block;width:100%;box-sizing:border-box}.case-new-patient label span{margin-bottom:5px;color:#526174}.case-new-patient label input,.case-new-patient label select,.case-new-patient label textarea{border:1px solid #d6e0eb;border-radius:8px;padding:8px}.case-new-patient .full{grid-column:1/-1}.case-catalog-source{margin-top:16px;padding:17px;border:1px solid #dce5ef;border-radius:14px;background:#fff}.case-catalog-source>header{display:flex;align-items:end;justify-content:space-between;gap:20px}.case-catalog-source>header small,.case-catalog-source>header h3{display:block;margin:0}.case-catalog-source>header small{color:#64748b}.case-catalog-source>header h3{margin-top:3px}.case-category-strip{display:grid;grid-template-columns:repeat(6,1fr);gap:8px;margin-top:14px}.case-category-strip button{display:grid;grid-template-columns:32px 1fr;gap:3px 8px;align-items:center;padding:11px;border:1px solid #dce5ef;border-radius:10px;background:#fff;text-align:left}.case-category-strip button.active{border-color:#1768e5;background:#edf5ff;color:#1768e5}.case-category-strip button>span{grid-row:1/3;font-size:22px}.case-category-strip button small{color:#8291a7}.case-source-products{margin-top:14px}.case-source-products section+section{margin-top:15px}.case-source-products h4{margin:0 0 8px;color:#334155}.case-source-products section>div{display:grid;grid-template-columns:repeat(3,1fr);gap:9px}.case-source-products section>div>button{display:grid;grid-template-columns:38px 1fr auto 20px;gap:9px;align-items:center;min-height:68px;padding:11px;border:1px solid #dce5ef;border-radius:10px;background:#fff;text-align:left}.case-source-products section>div>button.active{border-color:#1768e5;background:#edf5ff}.case-source-products button>span{font-size:20px}.case-source-products button small{display:block;margin-top:3px;color:#8291a7}.case-source-products button b{color:#a46810}.case-source-products button i{color:#1768e5;font-style:normal;font-weight:800}.case-radio-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:9px;margin-top:12px}.case-radio-grid label{display:flex;align-items:center;gap:9px;padding:11px;border:1px solid #dce5ef;border-radius:9px}.case-radio-grid label.active{border-color:#1768e5;background:#edf5ff}.case-radio-grid input{width:auto}.case-check-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:8px}.case-check-grid label{display:flex;align-items:center;gap:7px;padding:9px;border:1px solid #e1e8f0;border-radius:8px;background:#fff}.case-tooth-modes{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:12px}.case-tooth-modes button{border:1px solid #cbd7e5;border-radius:8px;background:#fff;padding:7px 12px}.case-tooth-modes button.active{border-color:#1768e5;background:#1768e5;color:#fff}.case-arch-label{display:block!important;width:100%;border:0!important;background:transparent!important;text-align:left;color:#526174!important}.case-tooth-row button{min-height:86px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;padding:4px 2px}.case-tooth-row button .case-tooth-shape{font-size:24px;filter:grayscale(1);opacity:.6}.case-tooth-row button small{font-size:11px}.case-tooth-row button em{font-size:9px;font-style:normal}.case-tooth-row button.selected .case-tooth-shape{filter:none;opacity:1}.case-tooth-row button.mode-BRIDGE,.case-tooth-row button.mode-FRAMEWORK{background:#f59e0b;border-color:#d97706}.case-tooth-row button.mode-CLASP,.case-tooth-row button.mode-BAND,.case-tooth-row button.mode-ABUTMENT{background:#7c3aed;border-color:#6d28d9}.case-upload-card.shared{margin-bottom:14px}.upload-layout{margin-top:14px}.case-upload-slots{display:grid;gap:9px;margin-top:12px}.case-upload-slots>label{display:grid;grid-template-columns:1fr auto auto;gap:12px;align-items:center;padding:12px;border:1px solid #e2e8f0;border-radius:10px}.case-upload-slots>label.complete{border-color:#9bd4b8;background:#f0fbf5}.case-upload-slots strong,.case-upload-slots small{display:block}.case-upload-slots small{margin-top:3px;color:#718096}.case-upload-slots>label>span{color:#a15c09}.case-upload-slots>label.complete>span{color:#147647}.case-upload-slots b{position:relative;border-radius:8px;background:#edf5ff;padding:8px 10px;color:#1768e5}.case-upload-slots b input{position:absolute;inset:0;opacity:0;cursor:pointer}.case-process-option,.case-process-list label,.case-final-confirmations label{display:flex;align-items:flex-start;gap:12px;padding:14px;border:1px solid #dce5ef;border-radius:11px;background:#fff}.case-process-option input,.case-process-list input,.case-final-confirmations input{width:auto;margin-top:4px}.case-process-option strong,.case-process-option p,.case-final-confirmations strong,.case-final-confirmations p{display:block;margin:0}.case-process-option p,.case-final-confirmations p{margin-top:4px;color:#718096}.case-process-list{display:grid;gap:9px;margin-top:10px}.case-final-confirmations{display:grid;gap:10px;margin-top:16px}.case-final-confirmations label:has(input:checked){border-color:#75c79e;background:#f0fbf5}@media(max-width:1000px){.case-source-grid{grid-template-columns:1fr}.case-category-strip{grid-template-columns:repeat(3,1fr)}.case-source-products section>div{grid-template-columns:repeat(2,1fr)}.case-check-grid{grid-template-columns:repeat(2,1fr)}}@media(max-width:640px){.case-category-strip,.case-source-products section>div,.case-radio-grid,.case-check-grid,.case-new-patient{grid-template-columns:1fr}.case-catalog-source>header{align-items:stretch;flex-direction:column}.case-upload-slots>label{grid-template-columns:1fr}.case-account-card{grid-template-columns:42px 1fr}.case-account-card b{grid-column:2}}

/* Saved doctor-portal.html visual parity layer. Keep business markup and data semantics unchanged. */
.case-wizard {
  --case-white: #fff;
  --case-off: #f7f9fc;
  --case-off-2: #eef2f8;
  --case-blue-50: #eff6ff;
  --case-blue-100: #dbeafe;
  --case-blue-200: #bfdbfe;
  --case-blue-400: #60a5fa;
  --case-blue-600: #2563eb;
  --case-blue-700: #1d4ed8;
  --case-navy: #0f2554;
  --case-text: #0f172a;
  --case-muted: #475569;
  --case-faint: #94a3b8;
  --case-border: #e2e8f0;
  --case-border-strong: #cbd5e1;
  inset: 0;
  grid-template-rows: 56px 43px minmax(0, 1fr) 60px;
  border: 0;
  border-radius: 0;
  color: var(--case-text);
  font-family: "Plus Jakarta Sans", Inter, "PingFang SC", "Microsoft YaHei", sans-serif;
  font-size: 13px;
  background: var(--case-white);
  box-shadow: none;
}

.case-wizard__header {
  padding: 0 28px;
  border: 0;
  color: #fff;
  background: var(--case-navy);
}

.case-wizard__header > div {
  gap: 0;
  min-width: 0;
}

.case-wizard__mark {
  display: none;
}

.case-wizard__header strong {
  font-family: Lora, Georgia, "Songti SC", serif;
  font-size: 15px;
  font-weight: 600;
}

.case-wizard__header small {
  margin-top: 2px;
  overflow: hidden;
  color: rgba(255, 255, 255, .5);
  font-size: 10px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.case-wizard__header > button {
  display: grid;
  width: 32px;
  height: 32px;
  padding: 0;
  place-items: center;
  border: 0;
  border-radius: 8px;
  color: #fff;
  font-size: 18px;
  line-height: 1;
  background: rgba(255, 255, 255, .1);
}

.case-wizard__header > button:hover {
  background: rgba(255, 255, 255, .18);
}

.case-wizard__steps {
  display: flex;
  align-items: stretch;
  justify-content: flex-start;
  gap: 0;
  padding: 0 28px;
  overflow-x: auto;
  border-bottom: 1.5px solid var(--case-border);
  background: var(--case-off);
}

.case-wizard__steps button {
  position: relative;
  display: flex;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  gap: 6px;
  min-width: 0;
  padding: 10px 16px 9px;
  border: 0;
  border-bottom: 2px solid transparent;
  border-radius: 0;
  color: var(--case-faint);
  font-size: 11px;
  font-weight: 600;
  white-space: nowrap;
  background: transparent;
}

.case-wizard__steps button:not(:last-child)::after {
  display: none;
}

.case-wizard__steps span {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  color: #64748b;
  font-size: 9px;
  font-weight: 700;
  background: var(--case-border);
}

.case-wizard__steps .active {
  border-bottom-color: var(--case-blue-600);
  color: var(--case-blue-600);
}

.case-wizard__steps .active span {
  color: #fff;
  background: var(--case-blue-600);
}

.case-wizard__steps .done {
  color: #059669;
}

.case-wizard__steps .done span {
  color: #fff;
  background: #059669;
}

.case-wizard > main {
  padding: 24px 32px;
  background: var(--case-white);
}

.case-panel {
  max-width: 1380px;
}

.case-panel > header {
  margin-bottom: 20px;
}

.case-panel h1 {
  font-family: Lora, Georgia, "Songti SC", serif;
  font-size: 19px;
  font-weight: 600;
  letter-spacing: -.2px;
}

.case-panel > header p {
  margin-top: 5px;
  color: var(--case-muted);
  font-size: 12px;
}

.case-config-form,
.case-catalog-source,
.case-basket,
.case-item-tabs,
.case-upload-card,
.case-review-list {
  border: 1.5px solid var(--case-border);
  border-radius: 10px;
  box-shadow: 0 1px 3px rgba(15, 37, 84, .06), 0 1px 2px rgba(15, 37, 84, .04);
}

.case-config-form {
  padding: 18px 20px;
}

.case-account-card {
  padding: 14px 18px;
  border: 1.5px solid var(--case-blue-200);
  border-radius: 10px;
  background: var(--case-blue-50);
}

.case-recommend-card {
  margin-top: 14px;
  padding: 14px 16px;
  border: 1px solid #e9d5ff;
  border-radius: 12px;
  background: linear-gradient(180deg, #fff, #faf5ff);
}

.case-recommend-card > header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.case-recommend-card > header strong,
.case-recommend-card > header small {
  display: block;
}

.case-recommend-card > header small {
  margin-top: 3px;
  color: #7c6f95;
}

.case-recommend-card > header button {
  flex: none;
  padding: 7px 12px;
  border: 1px solid #c4b5fd;
  border-radius: 8px;
  background: #f5f3ff;
  color: #6d28d9;
  font-weight: 700;
}

.case-recommend-input {
  display: block;
  margin-top: 12px;
}

.case-recommend-input span {
  display: block;
  margin-bottom: 5px;
  color: #526174;
}

.case-recommend-input input {
  width: 100%;
  box-sizing: border-box;
  padding: 8px;
  border: 1px solid #d6e0eb;
  border-radius: 8px;
}

.case-recommend-note,
.case-recommend-error {
  margin: 10px 0 0;
  font-size: 12px;
}

.case-recommend-note {
  color: #7c6f95;
}

.case-recommend-error {
  color: #dc2626;
}

.case-recommend-list {
  display: grid;
  gap: 9px;
  margin-top: 12px;
}

.case-recommend-list button {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 11px;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  background: #fff;
  text-align: left;
}

.case-recommend-list button.selected {
  border-color: #a78bfa;
  background: #f5f3ff;
}

.case-recommend-list button small {
  display: block;
  margin-top: 3px;
  color: #8291a7;
}

.case-recommend-list button i {
  flex: none;
  color: #6d28d9;
  font-style: normal;
  font-weight: 800;
}

.case-account-card > span {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: var(--case-blue-600);
}

.case-account-card b {
  padding: 3px 9px;
  border: 1px solid #a7f3d0;
  border-radius: 20px;
  color: #059669;
  font-size: 10px;
  background: #ecfdf5;
}

.case-source-grid {
  gap: 18px;
  margin-top: 18px;
}

.case-source-layout {
  display: grid;
  grid-template-columns: 260px minmax(0, 1fr);
  min-height: calc(100vh - 203px);
  overflow: hidden;
  border: 1.5px solid var(--case-border);
  border-radius: 10px;
  background: var(--case-white);
  box-shadow: 0 1px 3px rgba(15, 37, 84, .06), 0 1px 2px rgba(15, 37, 84, .04);
}

.case-source-sidebar {
  align-self: stretch;
  border-right: 1.5px solid var(--case-border);
  background: var(--case-off);
}

.case-source-sidebar > header {
  padding: 18px 16px 14px;
  border-bottom: 1.5px solid var(--case-border);
}

.case-source-sidebar > header small,
.case-source-sidebar > header strong {
  display: block;
}

.case-source-sidebar > header small {
  color: var(--case-faint);
  font-size: 9px;
  font-weight: 700;
  letter-spacing: .8px;
  text-transform: uppercase;
}

.case-source-sidebar > header strong {
  margin-top: 4px;
  font-size: 12px;
}

.case-source-sidebar > button {
  display: grid;
  width: 100%;
  grid-template-columns: 36px 1fr 16px;
  align-items: center;
  gap: 9px;
  min-height: 66px;
  padding: 11px 14px;
  border: 0;
  border-bottom: 1px solid var(--case-off-2);
  color: var(--case-muted);
  text-align: left;
  background: transparent;
  transition: color .15s, background .15s, box-shadow .15s;
}

.case-source-sidebar > button:hover {
  color: var(--case-blue-600);
  background: var(--case-blue-50);
}

.case-source-sidebar > button.active {
  color: var(--case-blue-600);
  background: var(--case-blue-50);
  box-shadow: inset 3px 0 var(--case-blue-600);
}

.case-source-sidebar > button > span {
  display: grid;
  width: 32px;
  height: 32px;
  place-items: center;
  border-radius: 8px;
  font-size: 19px;
  background: var(--case-white);
}

.case-source-sidebar > button strong,
.case-source-sidebar > button small {
  display: block;
}

.case-source-sidebar > button strong {
  font-size: 12px;
}

.case-source-sidebar > button small {
  margin-top: 3px;
  color: var(--case-faint);
  font-size: 10px;
}

.case-source-sidebar > button i {
  color: currentColor;
  font-style: normal;
  font-weight: 700;
}

.case-source-content {
  min-width: 0;
  padding: 22px 24px 24px;
}

.case-source-intro {
  margin-bottom: 18px;
}

.case-source-intro h1,
.case-source-intro p {
  margin: 0;
}

.case-source-intro p {
  margin-top: 5px;
  color: var(--case-muted);
  font-size: 12px;
}

.case-section-title {
  padding-bottom: 9px;
  border-bottom: 1.5px solid var(--case-blue-100);
}

.case-section-title small {
  color: var(--case-blue-700);
  font-size: 10px;
  font-weight: 700;
  letter-spacing: .5px;
  text-transform: uppercase;
}

.case-section-title h3,
.case-config-block h3,
.case-catalog-source h3 {
  font-size: 13px;
  font-weight: 600;
}

.case-section-title button,
.case-tooth-chart button,
.case-tooth-modes button {
  border: 1.5px solid var(--case-blue-200);
  border-radius: 7px;
  color: var(--case-blue-600);
  font-size: 11px;
  font-weight: 600;
  background: var(--case-blue-50);
}

.case-search {
  height: 38px;
  border: 1.5px solid var(--case-border);
  border-radius: 8px;
  background: var(--case-off);
}

.case-search:focus-within {
  border-color: var(--case-blue-400);
  background: var(--case-white);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, .1);
}

.case-choice-list > button,
.case-product-choice > button {
  min-height: 58px;
  padding: 9px 12px;
  border: 1.5px solid var(--case-border);
  border-radius: 8px;
}

.case-choice-list > button:hover,
.case-product-choice > button:hover,
.case-category-strip button:hover,
.case-source-products section > div > button:hover {
  border-color: var(--case-blue-400);
  background: var(--case-blue-50);
}

.case-choice-list > button.active,
.case-product-choice > button.active,
.case-category-strip button.active,
.case-source-products section > div > button.active {
  border-color: var(--case-blue-500, #3b82f6);
  background: var(--case-blue-50);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, .08);
}

.case-field > span,
.case-new-patient label > span {
  margin-bottom: 5px;
  color: var(--case-muted);
  font-size: 10px;
  font-weight: 700;
  letter-spacing: .5px;
  text-transform: uppercase;
}

.case-field input,
.case-field select,
.case-field textarea,
.case-new-patient label input,
.case-new-patient label select,
.case-new-patient label textarea {
  min-height: 36px;
  border: 1.5px solid var(--case-border);
  border-radius: 8px;
  color: var(--case-text);
  background: var(--case-off);
  outline: none;
  transition: border-color .18s, box-shadow .18s, background .18s;
}

.case-field textarea,
.case-new-patient label textarea {
  min-height: 72px;
}

.case-field input:focus,
.case-field select:focus,
.case-field textarea:focus,
.case-new-patient label input:focus,
.case-new-patient label select:focus,
.case-new-patient label textarea:focus {
  border-color: var(--case-blue-400);
  background: var(--case-white);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, .1);
}

.case-catalog-source {
  margin-top: 18px;
  padding: 18px 20px;
}

.case-catalog-source > header {
  padding-bottom: 12px;
  border-bottom: 1.5px solid var(--case-blue-100);
}

.case-category-strip {
  gap: 7px;
  margin-top: 12px;
}

.case-category-strip button,
.case-source-products section > div > button {
  border-width: 1.5px;
  border-color: var(--case-border);
  border-radius: 8px;
  transition: border-color .15s, background .15s, box-shadow .15s;
}

.case-category-strip button {
  min-height: 58px;
  padding: 9px 11px;
}

.case-source-products section > div > button {
  min-height: 60px;
  padding: 9px 11px;
}

.case-basket-inline {
  margin-top: 18px;
}

.case-basket > header {
  padding: 11px 14px;
  background: var(--case-off);
}

.case-basket article {
  padding: 10px 14px;
}

.case-alert {
  border-radius: 8px;
  font-size: 11px;
}

.case-alert.warning {
  border: 1px solid #fde68a;
  color: #b45309;
  background: #fffbeb;
}

.case-config-layout {
  grid-template-columns: 248px minmax(0, 1fr);
  gap: 18px;
}

.case-item-tabs button {
  padding: 10px 12px;
}

.case-item-tabs button.active {
  color: var(--case-blue-600);
  background: var(--case-blue-50);
  box-shadow: inset 3px 0 var(--case-blue-600);
}

.case-config-summary,
.case-review-head {
  border: 1px solid var(--case-border);
  border-radius: 8px;
  background: var(--case-off);
}

.case-config-block {
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1.5px solid var(--case-off-2);
}

.case-config-block > header {
  padding-bottom: 8px;
  border-bottom: 1.5px solid var(--case-blue-100);
}

.case-tooth-chart {
  border: 1.5px solid var(--case-border);
  border-radius: 10px;
  background: var(--case-white);
}

.case-tooth-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  margin: 2px 0 4px;
  color: var(--case-muted);
  font-size: 11px;
}

.case-tooth-legend span {
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

.case-tooth-legend i {
  width: 13px;
  height: 13px;
  box-sizing: border-box;
  border: 1.5px solid #3b82f6;
  border-radius: 3px;
  background: #dbeafe;
}

.case-tooth-legend i.is-bridge {
  border-color: #f59e0b;
  background: #fef3c7;
}

.case-tooth-legend i.is-special {
  border-color: #7c3aed;
  background: #ede9fe;
}

.case-dental-svg {
  display: block;
  width: 100%;
  min-width: 560px;
  user-select: none;
  touch-action: none;
}

.case-dental-jaw-title {
  fill: var(--case-faint);
  font-size: 10px;
  font-weight: 600;
  letter-spacing: .8px;
}

.case-dental-midline {
  stroke: var(--case-border);
  stroke-width: 1;
  stroke-dasharray: 3 3;
}

.case-dental-occlusion {
  stroke: var(--case-border);
  stroke-width: .5;
}

.case-dental-side {
  fill: var(--case-faint);
  font-size: 9px;
}

.case-svg-tooth .tooth-body {
  fill: #fff;
  stroke: #c0ccdf;
  stroke-width: 1;
  stroke-linejoin: round;
  transition: fill .15s, stroke .15s, stroke-width .15s;
}

.case-svg-tooth .case-tooth-junction {
  stroke: #c0ccdf;
  stroke-width: .5;
  opacity: .4;
}

.case-svg-tooth .case-tooth-number {
  fill: var(--case-faint);
  font-size: 9px;
  font-weight: 400;
  pointer-events: none;
}

.case-svg-tooth:hover .tooth-body {
  fill: var(--case-blue-100);
  stroke: var(--case-blue-400);
}

.case-svg-tooth.mode-CROWN .tooth-body,
.case-svg-tooth.mode-ORTHO_AREA .tooth-body {
  fill: #dbeafe;
  stroke: #3b82f6;
  stroke-width: 1.8;
}

.case-svg-tooth.mode-CROWN .case-tooth-junction,
.case-svg-tooth.mode-ORTHO_AREA .case-tooth-junction {
  stroke: #3b82f6;
}

.case-svg-tooth.mode-CROWN .case-tooth-number,
.case-svg-tooth.mode-ORTHO_AREA .case-tooth-number {
  fill: #1d4ed8;
  font-weight: 600;
}

.case-svg-tooth.mode-BRIDGE .tooth-body,
.case-svg-tooth.mode-FRAMEWORK .tooth-body {
  fill: #fef3c7;
  stroke: #f59e0b;
  stroke-width: 1.8;
}

.case-svg-tooth.mode-BRIDGE .case-tooth-junction,
.case-svg-tooth.mode-FRAMEWORK .case-tooth-junction {
  stroke: #f59e0b;
}

.case-svg-tooth.mode-BRIDGE .case-tooth-number,
.case-svg-tooth.mode-FRAMEWORK .case-tooth-number {
  fill: #92400e;
  font-weight: 600;
}

.case-svg-tooth.mode-MISSING .tooth-body {
  fill: #fff1f2;
  stroke: #e11d48;
  stroke-width: 1.8;
}

.case-svg-tooth.mode-MISSING .case-tooth-junction {
  stroke: #e11d48;
}

.case-svg-tooth.mode-MISSING .case-tooth-number {
  fill: #be123c;
  font-weight: 600;
}

.case-svg-tooth.mode-CLASP .tooth-body,
.case-svg-tooth.mode-BAND .tooth-body,
.case-svg-tooth.mode-ABUTMENT .tooth-body {
  fill: #ede9fe;
  stroke: #7c3aed;
  stroke-width: 1.8;
}

.case-svg-tooth.mode-CLASP .case-tooth-junction,
.case-svg-tooth.mode-BAND .case-tooth-junction,
.case-svg-tooth.mode-ABUTMENT .case-tooth-junction {
  stroke: #7c3aed;
}

.case-svg-tooth.mode-CLASP .case-tooth-number,
.case-svg-tooth.mode-BAND .case-tooth-number,
.case-svg-tooth.mode-ABUTMENT .case-tooth-number {
  fill: #6d28d9;
  font-weight: 600;
}

.case-tooth-hit {
  cursor: pointer;
  fill: transparent;
}

.case-tooth-summary {
  min-height: 34px;
  box-sizing: border-box;
  margin-top: 8px;
  padding: 8px 14px;
  border: 1.5px solid var(--case-blue-200);
  border-radius: 8px;
  color: var(--case-muted);
  font-size: 12px;
  background: var(--case-blue-50);
}

.case-upload-card > label {
  border: 2px dashed var(--case-blue-200);
  border-radius: 10px;
  background: var(--case-blue-50);
}

.case-upload-card > label:hover {
  border-color: var(--case-blue-400);
  background: var(--case-blue-100);
}

.case-upload-card > article {
  align-items: center;
  gap: 10px;
}

.case-upload-card > article strong {
  min-width: 0;
  flex: 1;
  overflow-wrap: anywhere;
}

.case-uploaded-files {
  display: grid;
  gap: 8px;
  margin-top: 12px;
}

.case-uploaded-files article {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 12px;
  border: 1px solid var(--case-border);
  border-radius: 8px;
  background: var(--case-off);
}

.case-uploaded-files article strong,
.case-uploaded-files article small {
  display: block;
  overflow-wrap: anywhere;
}

.case-uploaded-files article small {
  margin-top: 3px;
  color: var(--case-muted);
}

.case-file-remove {
  flex: 0 0 auto;
  border: 1px solid #fecaca;
  border-radius: 7px;
  padding: 6px 10px;
  color: #b42318;
  background: #fff7f7;
}

.case-process-option,
.case-process-list label,
.case-final-confirmations label,
.case-check-grid label,
.case-radio-grid label,
.case-option,
.case-upload-slots > label {
  border: 1.5px solid var(--case-border);
  border-radius: 8px;
}

.case-wizard__footer {
  padding: 0 28px;
  border-top: 1.5px solid var(--case-border);
  background: var(--case-white);
}

.case-wizard__footer button {
  min-height: 36px;
  padding: 8px 18px;
  border: 1.5px solid var(--case-border-strong);
  border-radius: 9px;
  color: var(--case-text);
  font-size: 12px;
  font-weight: 600;
  background: var(--case-white);
}

.case-wizard__footer .case-primary {
  border-color: var(--case-blue-600) !important;
  background: var(--case-blue-600) !important;
  box-shadow: 0 2px 8px rgba(37, 99, 235, .25);
}

.case-wizard__footer .case-primary:hover {
  background: var(--case-blue-700) !important;
  transform: translateY(-1px);
}

@media (max-width: 1000px) {
  .case-wizard > main {
    padding: 20px;
  }

  .case-wizard__steps {
    padding: 0 12px;
  }

  .case-wizard__steps button {
    padding-right: 12px;
    padding-left: 12px;
  }

  .case-source-layout {
    grid-template-columns: 1fr;
  }

  .case-source-sidebar {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    border-right: 0;
    border-bottom: 1.5px solid var(--case-border);
  }

  .case-source-sidebar > header {
    grid-column: 1 / -1;
  }
}

@media (max-width: 640px) {
  .case-wizard {
    grid-template-rows: 56px 43px minmax(0, 1fr) 60px;
  }

  .case-wizard__header {
    padding: 0 14px;
  }

  .case-wizard__steps strong {
    display: inline;
  }

  .case-wizard > main {
    padding: 14px;
  }

  .case-source-sidebar {
    grid-template-columns: repeat(2, 1fr);
  }

  .case-source-content {
    padding: 16px;
  }
}

/* Pixel-accurate new-order layout from the saved doctor portal reference. */
.case-wizard__header {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto 32px;
  align-items: center;
  gap: 16px;
}

.case-wizard__header > strong {
  overflow: hidden;
  color: #fff;
  font-family: Lora, Georgia, "Songti SC", serif;
  font-size: 15px;
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.case-wizard__header > small {
  margin: 0;
  color: rgba(255, 255, 255, .5);
  font-size: 12px;
  white-space: nowrap;
}

.case-wizard > main {
  padding: 0;
  background: #fff;
}

.case-panel:not(.case-source-step) {
  padding: 24px 32px;
}

.case-source-step {
  width: 100%;
  max-width: none;
  height: 100%;
  margin: 0;
}

.case-source-layout {
  width: 100%;
  height: 100%;
  min-height: 0;
  grid-template-columns: 260px minmax(0, 1fr);
  border: 0;
  border-radius: 0;
  box-shadow: none;
}

.case-source-sidebar {
  min-height: 0;
  overflow-y: auto;
  border-right: 1.5px solid #e2e8f0;
  background: #f7f9fc;
}

.case-sidebar-section {
  padding: 14px 12px;
  border-bottom: 1.5px solid #e2e8f0;
}

.case-sidebar-section > header,
.case-sidebar-patient > header {
  margin-bottom: 8px;
  color: #94a3b8;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: .8px;
  text-transform: uppercase;
}

.case-sidebar-section > header b {
  color: #e11d48;
}

.case-category-cards {
  display: grid;
  grid-template-columns: 1fr;
  gap: 7px;
}

.case-category-cards > button {
  display: flex;
  width: 100%;
  min-height: 56px;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  color: #0f172a;
  text-align: left;
  background: #fff;
  transition: all .15s;
}

.case-category-cards > button:hover {
  border-color: #bfdbfe;
  background: #eff6ff;
}

.case-category-cards > button.active {
  border-color: #3b82f6;
  background: #eff6ff;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, .1);
}

.case-category-cards > button > span {
  width: 24px;
  flex: 0 0 24px;
  font-size: 22px;
  text-align: center;
}

.case-category-cards strong,
.case-category-cards small {
  display: block;
}

.case-category-cards strong {
  color: #0f172a;
  font-size: 12px;
  font-weight: 700;
  line-height: 1.3;
}

.case-category-cards small {
  margin-top: 2px;
  color: #7c3aed;
  font-size: 10px;
  font-weight: 600;
}

.case-sidebar-products {
  padding-top: 12px;
}

.case-sidebar-search {
  display: flex;
  height: 34px;
  align-items: center;
  gap: 6px;
  margin-bottom: 7px;
  padding: 0 9px;
  border: 1.5px solid #e2e8f0;
  border-radius: 7px;
  background: #fff;
}

.case-sidebar-search input {
  width: 100%;
  min-width: 0;
  border: 0;
  outline: 0;
  background: transparent;
}

.case-product-subcards {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.case-product-subcards h4 {
  margin: 8px 0 2px;
  color: #64748b;
  font-size: 10px;
}

.case-product-subcards > button {
  display: grid;
  width: 100%;
  grid-template-columns: minmax(0, 1fr) 18px;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border: 1.5px solid #e2e8f0;
  border-radius: 7px;
  color: #475569;
  text-align: left;
  background: #fff;
  transition: all .14s;
}

.case-product-subcards > button:hover,
.case-product-subcards > button.active {
  border-color: #3b82f6;
  color: #2563eb;
  background: #eff6ff;
}

.case-product-subcards > button strong,
.case-product-subcards > button small {
  display: block;
}

.case-product-subcards > button strong {
  overflow: hidden;
  font-size: 11px;
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.case-product-subcards > button small {
  margin-top: 2px;
  color: #d97706;
  font-size: 9px;
}

.case-product-subcards > button i {
  color: #2563eb;
  font-style: normal;
  font-weight: 700;
  text-align: right;
}

.case-product-subcards > p,
.case-sidebar-notice {
  margin: 0;
  padding: 8px;
  border-radius: 7px;
  color: #b45309;
  font-size: 10px;
  background: #fffbeb;
}

.case-sidebar-patient {
  padding: 12px;
}

.case-sidebar-patient > div {
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 10px;
  border: 1.5px solid #a7f3d0;
  border-radius: 9px;
  background: #ecfdf5;
}

.case-sidebar-patient > div > span {
  display: grid;
  width: 30px;
  height: 30px;
  flex: 0 0 30px;
  place-items: center;
  border-radius: 50%;
  color: #fff;
  font-weight: 700;
  background: #059669;
}

.case-sidebar-patient p,
.case-sidebar-patient strong,
.case-sidebar-patient small {
  display: block;
  margin: 0;
}

.case-sidebar-patient small {
  margin-top: 2px;
  color: #475569;
  font-size: 10px;
}

.case-source-content {
  min-width: 0;
  min-height: 0;
  padding: 24px 32px;
  overflow-y: auto;
}

.case-source-content > * {
  width: 100%;
  max-width: 800px;
  margin-right: auto;
  margin-left: auto;
}

.case-source-intro {
  margin-bottom: 20px;
}

.case-source-intro h1 {
  font-family: Lora, Georgia, "Songti SC", serif;
  font-size: 18px;
  font-weight: 600;
}

.case-source-intro p {
  margin-top: 6px;
  color: #475569;
  font-size: 13px;
}

.case-account-card {
  grid-template-columns: 38px minmax(0, 1fr) auto;
  gap: 14px;
  margin-bottom: 18px;
  padding: 14px 18px;
}

.case-account-card > span {
  width: 38px;
  height: 38px;
}

.case-account-card small {
  color: #475569;
  font-size: 10px;
}

.case-account-card strong {
  color: #0f172a;
  font-size: 13px;
}

.case-account-card p {
  color: #94a3b8;
  font-size: 10px;
}

.case-source-grid {
  display: block;
  margin-top: 0;
}

.case-source-grid .case-config-form {
  margin-bottom: 22px;
  padding: 0;
  border: 0;
  border-radius: 0;
  box-shadow: none;
}

.case-source-grid .case-section-title {
  min-height: 27px;
  margin-bottom: 10px;
  padding-bottom: 7px;
  border-bottom: 1.5px solid #dbeafe;
}

.case-source-grid .case-section-title small {
  color: #1d4ed8;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: .5px;
}

.case-patient-autocomplete {
  position: relative;
}

.case-patient-autocomplete .case-search {
  width: 100%;
  max-width: none;
  height: 38px;
  padding: 0 12px;
  border: 1.5px solid #e2e8f0;
  border-radius: 8px;
  background: #f7f9fc;
}

.case-patient-autocomplete .case-search:focus-within {
  border-color: #60a5fa;
  background: #fff;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, .1);
}

.case-patient-dropdown {
  position: absolute;
  z-index: 200;
  top: 42px;
  right: 0;
  left: 0;
  max-height: 250px;
  overflow-y: auto;
  border: 1.5px solid #e2e8f0;
  border-radius: 9px;
  background: #fff;
  box-shadow: 0 8px 32px rgba(15, 37, 84, .1), 0 2px 8px rgba(15, 37, 84, .06);
}

.case-patient-dropdown > button {
  display: block;
  width: 100%;
  padding: 10px 14px;
  border: 0;
  border-bottom: 1px solid #eef2f8;
  text-align: left;
  background: #fff;
}

.case-patient-dropdown > button:hover {
  background: #eff6ff;
}

.case-patient-dropdown strong,
.case-patient-dropdown small {
  display: block;
}

.case-patient-dropdown strong {
  font-size: 13px;
}

.case-patient-dropdown small {
  margin-top: 2px;
  color: #94a3b8;
  font-size: 11px;
}

.case-patient-dropdown > p {
  margin: 0;
  padding: 12px 14px;
  color: #64748b;
}

.case-patient-create-hint {
  margin: 7px 0 0;
  color: #94a3b8;
  font-size: 11px;
}

.case-patient-create-hint > button {
  padding: 0;
  border: 0;
  color: #2563eb;
  font-weight: 600;
  text-decoration: underline;
  background: transparent;
}

.case-patient-selected {
  display: grid;
  grid-template-columns: 32px minmax(0, 1fr) 28px;
  align-items: center;
  gap: 10px;
  padding: 11px 14px;
  border: 1.5px solid #a7f3d0;
  border-radius: 9px;
  background: #ecfdf5;
}

.case-patient-selected > span {
  display: grid;
  width: 32px;
  height: 32px;
  place-items: center;
  border-radius: 50%;
  color: #fff;
  font-weight: 700;
  background: #059669;
}

.case-patient-selected strong,
.case-patient-selected small {
  display: block;
}

.case-patient-selected small {
  margin-top: 2px;
  color: #475569;
  font-size: 11px;
}

.case-patient-selected > button {
  border: 0;
  color: #94a3b8;
  background: transparent;
}

.case-source-grid .case-field-grid {
  gap: 0 14px;
}

.case-source-grid .case-field {
  margin-top: 10px;
}

.case-source-grid .case-field > span {
  margin-bottom: 5px;
  color: #475569;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: .5px;
}

.case-source-grid .case-field input,
.case-source-grid .case-field select,
.case-source-grid .case-field textarea {
  padding: 8px 11px;
  border: 1.5px solid #e2e8f0;
  border-radius: 8px;
  color: #0f172a;
  font-size: 13px;
  background: #f7f9fc;
}

.case-source-grid .case-alert.warning {
  margin-top: 8px;
  padding: 0;
  border: 0;
  color: #7c3aed;
  font-size: 10px;
  background: transparent;
}

.case-basket-inline {
  margin-top: 4px;
  border: 1.5px solid #e2e8f0;
  border-radius: 10px;
  box-shadow: none;
}

.case-basket-inline > header {
  background: #f7f9fc;
}

.case-config-panel {
  display: grid;
  width: 100%;
  max-width: none;
  min-height: 100%;
  grid-template-columns: 260px minmax(0, 1fr);
  grid-template-rows: auto minmax(0, 1fr);
  padding: 0 !important;
}

.case-config-panel > header {
  grid-column: 2;
  width: calc(100% - 64px);
  max-width: 800px;
  margin: 24px auto 18px;
}

.case-config-panel .case-config-layout {
  display: contents;
}

.case-config-panel .case-item-tabs {
  grid-row: 1 / 3;
  grid-column: 1;
  align-self: stretch;
  padding: 14px 12px;
  overflow-y: auto;
  border: 0;
  border-right: 1.5px solid #e2e8f0;
  border-radius: 0;
  background: #f7f9fc;
  box-shadow: none;
}

.case-config-panel .case-item-tabs::before {
  display: block;
  margin-bottom: 8px;
  color: #94a3b8;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: .8px;
  text-transform: uppercase;
  content: attr(data-section-label);
}

.case-config-panel .case-item-tabs button {
  margin-bottom: 5px;
  padding: 8px 12px;
  border: 1.5px solid #e2e8f0;
  border-radius: 7px;
  background: #fff;
}

.case-config-panel .case-item-tabs button.active {
  border-color: #3b82f6;
  color: #2563eb;
  background: #eff6ff;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, .1);
}

.case-config-panel .case-config-form {
  grid-row: 2;
  grid-column: 2;
  width: calc(100% - 64px);
  max-width: 800px;
  margin: 0 auto 24px;
  padding: 0;
  border: 0;
  border-radius: 0;
  box-shadow: none;
}

.case-material-form {
  max-width: 800px;
}

.case-current-product {
  display: grid;
  grid-template-columns: 42px minmax(0, 1fr) auto;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border: 1.5px solid var(--case-border);
  border-radius: 10px;
  background: var(--case-off);
}

.case-current-product > i {
  display: grid;
  width: 42px;
  height: 42px;
  place-items: center;
  border-radius: 10px;
  color: var(--case-blue-600);
  font-size: 20px;
  font-style: normal;
  background: var(--case-blue-50);
}

.case-current-product strong,
.case-current-product small {
  display: block;
}

.case-current-product strong {
  font-size: 15px;
}

.case-current-product small {
  margin-top: 3px;
  color: var(--case-muted);
  font-size: 11px;
}

.case-current-product > span {
  color: #a16207;
  font-size: 12px;
  font-weight: 700;
}

.case-material-section {
  margin-top: 22px;
}

.case-material-section > header {
  display: block;
  margin-bottom: 10px;
  padding-bottom: 7px;
  border-bottom: 1.5px solid var(--case-blue-100);
}

.case-material-section > header h3 {
  margin: 0;
  color: var(--case-blue-700);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: .5px;
}

.case-material-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.case-material-grid .case-field {
  min-width: 0;
  margin-top: 0;
}

.case-material-grid .case-field.full {
  grid-column: 1 / -1;
}

.case-material-section .case-check-grid {
  margin-top: 0;
}

.case-material-section .case-option {
  margin-top: 8px;
}

.case-material-form > .case-primary {
  margin-top: 18px;
}

.case-panel:not(.case-source-step):not(.case-config-panel) {
  width: calc(100% - 64px);
  max-width: 800px;
  margin-right: auto;
  margin-left: auto;
}

.case-footer-context {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #64748b;
  font-size: 11px;
}

.case-wizard__footer > div:last-child {
  display: flex;
  gap: 9px;
}

@media (max-width: 900px) {
  .case-source-layout {
    display: block;
    overflow-y: auto;
  }

  .case-source-sidebar {
    display: block;
    overflow: visible;
    border-right: 0;
    border-bottom: 1.5px solid #e2e8f0;
  }

  .case-category-cards {
    display: flex;
    overflow-x: auto;
  }

  .case-category-cards > button {
    min-width: 190px;
  }

  .case-product-subcards {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .case-source-content {
    overflow: visible;
  }

  .case-config-panel {
    display: block;
  }

  .case-config-panel > header,
  .case-config-panel .case-config-form {
    width: calc(100% - 40px);
  }

  .case-config-panel .case-item-tabs {
    display: flex;
    gap: 6px;
    padding: 10px 20px;
    overflow-x: auto;
    border-right: 0;
    border-bottom: 1.5px solid #e2e8f0;
  }

  .case-config-panel .case-item-tabs::before {
    display: none;
  }

  .case-config-panel .case-item-tabs button {
    min-width: 180px;
  }
}

@media (max-width: 640px) {
  .case-wizard__header {
    grid-template-columns: minmax(0, 1fr) 32px;
  }

  .case-wizard__header > small {
    display: none;
  }

  .case-product-subcards,
  .case-source-grid .case-field-grid,
  .case-material-grid {
    grid-template-columns: 1fr;
  }

  .case-current-product {
    grid-template-columns: 38px minmax(0, 1fr);
  }

  .case-current-product > i {
    width: 38px;
    height: 38px;
  }

  .case-current-product > span {
    grid-column: 2;
  }
}
</style>
