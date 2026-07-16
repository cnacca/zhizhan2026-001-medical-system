# 三端参考页面源文件清单

> 最近核对：2026-07-16
> 用途：锁定后续前端视觉与交互复刻的权威源文件

## 1. 使用结论

这三个 HTML 已保存在仓库内，不依赖聊天附件继续存在。后续只要文件仍在且 SHA-256 未变化，用户无需再次发送。

规范文档用于快速定位和约束实现，原始 HTML 用于核对最终细节。不能把规范文档当成对源码的完整替代，也不要把约 85 万字节的 HTML 再复制进 Markdown，避免产生两份会漂移的源码。

## 2. 锁定文件

| 端口 | 权威文件 | 页面标题 | 字节 | 行数 | SHA-256 |
| --- | --- | --- | ---: | ---: | --- |
| 医生端 | [doctor-portal.html](../../../frontend/public/reference/doctor-portal.html) | `PrecisionDental Lab — Doctor Portal` | 291,508 | 4,347 | `7405750c10c613ebe6c1b995c74da9f7b82157ae9e3c6ed59390f4c2a5a59bf2` |
| 客服端 | [cs-portal.html](../../../frontend/public/reference/cs-portal.html) | `PrecisionDental Lab — Customer Service Portal` | 264,054 | 3,547 | `035c43e735fe73badbcc0612e176c4a974057c2d1418470b0c72ac089a7f304d` |
| 生产端 | [factory-portal.html](../../../frontend/public/reference/factory-portal.html) | `PrecisionDental — Factory Production Portal` | 297,915 | 4,103 | `0f1544c41764bce5cb5017fc6c816b540c389dbe825ea76dd7285cfa5676c27e` |

核对命令：

```bash
shasum -a 256 \
  frontend/public/reference/doctor-portal.html \
  frontend/public/reference/cs-portal.html \
  frontend/public/reference/factory-portal.html
```

## 3. 权威性顺序

发生冲突时按以下顺序判断：

1. 当前锁定哈希对应的本地 HTML；
2. 固定视口下浏览器实际渲染结果与计算样式；
3. 与同一哈希、同一视口对应的参考截图；
4. 本目录中的文字规范；
5. 当前产品实现，仅用于识别真实业务差异，不能反向覆盖参考设计。

## 4. 资源与依赖

- 三个文件均为单文件原型，CSS 和 JavaScript 内联；没有外部脚本依赖。
- 三端都请求 Google Fonts：`Plus Jakarta Sans` 与 `Lora`。
- 三端没有 `<img>` 或视频资源，图形由内联 SVG、Emoji、CSS 和 JavaScript 动态绘制组成。
- 客服端包含 DHL、FedEx、UPS、EMS 的跳转链接；这些链接属于交互原型，不是页面渲染依赖。
- 网络字体不可用时，浏览器会回退到本地字体。正式实现必须补充可靠的中文系统字体回退，并单独验收字体差异。

## 5. 原型数据与跨端联动

三端通过浏览器 `localStorage` 模拟数据同步，核心键包括：

- `pdl_orders`
- `pdl_messages`
- `pdl_events`
- `pdl_ping`
- `pdl_lang`
- `pdl_clinics`
- `pdl_dr_accounts`

同时使用 `storage` 事件和约 2 秒轮询触发刷新。这些机制只表达原型中的跨端联动预期。正式系统必须使用真实 API、WebSocket、认证、授权和数据范围校验。

## 6. 文件保护与升级规则

- 默认只读使用 `frontend/public/reference/*.html`，实施页面时不要直接修改参考文件。
- 如果用户提供新版文件，先保存新版并计算哈希，再更新本清单和对应端口规范。
- 哈希变化但文档未更新时，所有文字规格自动降级为“待复核”，不得继续声称与最新版一致。
- 若需要保留多个版本，使用带日期或版本号的归档目录；不要覆盖后丢失旧基线。
- 任何截图必须记录源文件哈希、目标视口、实际 `innerWidth/innerHeight` 和图片像素尺寸。

## 7. 2026-07-16 浏览器复核摘要

固定目标视口为 `1440×900`。受浏览器滚动条影响，内容区域实际宽度为 `1435–1436px`，这是像素差异比对时必须保留的事实。

| 端口 | 复核路径 | 代表性结果 |
| --- | --- | --- |
| 医生端 | 登录页 → Demo Accounts → Dr. James Chen → My Cases → `PDL-0476` | 页面导航正常；右侧详情抽屉约 `500px` 宽 |
| 客服端 | 账号选择 → Wang Fang Manager → Order Details → `PDL-0476` | 页面导航正常；右侧详情面板 `540px` 宽 |
| 生产端 | 账号选择 → Wang Li Manager → Kanban Board → `PDL-0476` | 看板导航正常；右侧详情抽屉约 `560px` 宽 |

本次复核是代表性路径检查，不等于穷举全部内联事件和全部响应式状态。
