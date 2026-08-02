import fs from 'node:fs'

const app = fs.readFileSync('frontend/src/App.vue', 'utf8')
const csPages = fs.readFileSync('frontend/src/components/CsPortalPages.vue', 'utf8')
const styles = fs.readFileSync('frontend/src/styles.css', 'utf8')

const required = [
  [app, 'App.vue', "type CsDashboardAttentionKind = 'ORDER_REVIEW' | 'MESSAGE_REVIEW' | 'MESSAGE_MENTION'"],
  [app, 'App.vue', "order.internal_status === 'PENDING_CS_REVIEW'"],
  [app, 'App.vue', "title: requiresTranslation ? '待翻译并完成客服初审' : '待客服初审'"],
  [app, 'App.vue', "title: '翻译 / 消息待审核'"],
  [app, 'App.vue', "title: '沟通待确认'"],
  [app, 'App.vue', 'csDashboardAttentionItems.length'],
  [app, 'App.vue', 'openCsDashboardAttentionItem(item)'],
  [app, 'App.vue', ':focus-order-id="csPortalFocusOrderId"'],
  [app, 'App.vue', ':focus-task="csPortalFocusTask"'],
  [csPages, 'CsPortalPages.vue', 'focusOrderId: number | null'],
  [csPages, 'CsPortalPages.vue', "if (props.focusTask === 'MESSAGE_REVIEW') inquiryTab.value = 'REVIEW'"],
  [styles, 'styles.css', '-webkit-line-clamp: 2;']
]

const failures = required
  .filter(([content, , fragment]) => !content.includes(fragment))
  .map(([, file, fragment]) => `${file} missing: ${fragment}`)

if (app.includes('<span class="prototype-badge tone-rose">{{ customerAttentionItems.length }} 项</span>')) {
  failures.push('客服工作台仍只按沟通事项统计需要关注数量')
}

if (failures.length > 0) {
  console.error(failures.join('\n'))
  process.exit(1)
}

console.log('客服工作台即时待办检查通过')
