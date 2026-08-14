import fs from 'node:fs'

const files = {
  helper: fs.readFileSync('frontend/src/utils/orderIdentity.ts', 'utf8'),
  cs: fs.readFileSync('frontend/src/components/CsPortalPages.vue', 'utf8'),
  app: fs.readFileSync('frontend/src/App.vue', 'utf8'),
  query: fs.readFileSync('backend/platform-server/src/main/java/com/yuri/aiorder/order/api/OrderProjectionQueryService.java', 'utf8'),
  tests: fs.readFileSync('backend/platform-server/src/test/java/com/yuri/aiorder/order/OrderStatusProjectionTests.java', 'utf8')
}

const expectations = [
  [files.helper, 'export function staffOrderIdentity', '共享订单识别格式化函数'],
  [files.helper, "primary: `${clinic} · ${patientDisplay} · ${tooth ? `牙位 ${tooth}` : '牙位待确认'}`", '客户、按端显示患者与牙位主标识'],
  [files.cs, '{ maskPatient: false }', '客服端完整患者姓名'],
  [files.app, "{ maskPatient: portalTone.value === 'production' }", '生产端患者脱敏、管理端完整姓名'],
  [files.helper, 'customerReferenceLabel', '客户病例号／委托单号标签'],
  [files.helper, '系统尾号 ${suffix}', '系统尾号辅助标识'],
  [files.cs, 'csOrderIdentity(order).primary', '客服订单队列业务主标识'],
  [files.cs, '搜索客户、患者、病例号、牙位、材料、颜色或系统单号', '客服扩展搜索提示'],
  [files.app, 'internalOrderIdentity(order).primary', '生产与管理订单队列业务主标识'],
  [files.app, '<th>订单识别</th>', '生产订单识别表头'],
  [files.query, "JSON_EXTRACT(o.form_data, '$.customer_case_no')", '客户病例号后端搜索'],
  [files.query, "JSON_EXTRACT(o.form_data, '$.tooth_position')", '牙位后端搜索'],
  [files.query, "JSON_EXTRACT(o.form_data, '$.material')", '材料后端搜索'],
  [files.query, "JSON_EXTRACT(o.form_data, '$.shade')", '色号后端搜索'],
  [files.tests, 'internalOrderListCanSearchHumanFriendlyOrderIdentityFields', '业务标识字段查询回归测试']
]

for (const [content, marker, label] of expectations) {
  if (!content.includes(marker)) {
    throw new Error(`缺少${label}: ${marker}`)
  }
}

console.log('staff order identity checks passed')
