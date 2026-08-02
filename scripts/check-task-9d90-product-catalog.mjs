import fs from 'node:fs'

const checks = [
  ['backend/platform-server/src/main/resources/db/migration/V34__product_catalog_foundation.sql', [
    'CREATE TABLE product_catalog',
    'product:manage',
    'REGULAR_CROWN',
  ]],
  ['backend/platform-server/src/main/java/com/yuri/aiorder/product/ProductCatalogController.java', [
    '"/products"',
    '"/products/{productId}"',
    'product:manage',
    'UserRole.CS',
  ]],
  ['backend/platform-server/src/main/java/com/yuri/aiorder/product/ProductCatalogService.java', [
    'base_price_cents must be positive',
    'product management requires CS or ADMIN role',
    'product_type already exists',
  ]],
  ['backend/platform-server/src/test/java/com/yuri/aiorder/product/ProductCatalogTests.java', [
    'csCanCreateUpdateAndListProductCatalog',
    'doctorCannotReadInternalProductPrices',
    'rejectsInvalidBasePrice',
  ]],
  ['frontend/src/App.vue', [
    'product-catalog-panel',
    '/products',
    'productCatalogCreatePrice',
    'updateProductCatalogItem',
  ]],
  ['frontend/vite.config.ts', [
    "'/products'",
  ]],
  ['docs/api/openapi.yaml', [
    '"/products"',
    '"/products/{productId}"',
    'ProductCatalogItem',
    'ProductCatalogRequest',
  ]],
  ['docs/acceptance/prd-v2-gap-matrix.md', [
    '9D.90',
    '产品参数 / 价格体系一期最小后台',
  ]],
  ['STATUS.md', [
    '9D.90 产品参数 / 价格体系一期最小后台',
  ]],
  ['tasks/README.md', [
    '任务 9D.90：产品参数 / 价格体系一期最小后台',
  ]],
  ['README.md', [
    'check:task9d90',
  ]],
  ['acceptance.json', [
    'task-9d90-product-catalog-required-text',
  ]],
  ['package.json', [
    'check:task9d90',
  ]],
]

for (const [file, patterns] of checks) {
  if (!fs.existsSync(file)) {
    console.error(`${file} missing required file`)
    process.exit(1)
  }
  const text = fs.readFileSync(file, 'utf8')
  for (const pattern of patterns) {
    if (!text.includes(pattern)) {
      console.error(`${file} missing required text: ${pattern}`)
      process.exit(1)
    }
  }
}

console.log('task 9D.90 product catalog check ok')
