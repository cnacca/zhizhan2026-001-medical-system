基于提供的样式表结构和技术栈（Vue 3 + Element Plus），你的前端框架已经有了一套非常完整且细节丰富的设计语言（包括 Lora 字体强调数字、1.5px 的精致边框、多种 portal 角色主题等）。

为了在低成本下最大化提升 `App.vue` 中后台页面的视觉完成度、操作效率和信息层级，以下是视觉优化方案：

### 1. 视觉影响最大的核心问题

1.  **Element Plus 默认样式与自定义卡片风格（Prototype 风格）的割裂**：
    *   *现象与影响*：样式表中定义了高度定制的 `.prototype-queue-card`, `.prototype-stat-card`（14px 圆角，1.5px 边框，细腻阴影）。如果内部直接嵌入默认的 `el-table` 或 `el-form`，Element 默认的直角、粗边框或不同的背景色（如表头）会破坏整体的圆润感和精致感，导致页面看起来像“拼凑”的。
2.  **数据仪表盘（Dashboard）的信息密度与主次缺失**：
    *   *现象与影响*：Dashboard 包含了 Metric Grid, Attention Items, Line Chart。如果所有数字的字体和层级一致，用户在扫视时无法瞬间抓住核心异常或关键指标。
3.  **状态与标签的色彩污染**：
    *   *现象与影响*：业务页面会有大量的 `el-tag` 和状态指示。如果直接使用 Element Plus 默认的 `type="success/warning/danger"`，色彩饱和度可能与你定义的柔和体系（`--portal-accent-soft`）不匹配，造成视觉疲劳。

---

### 2. 可执行的具体修改建议

#### 建议 A：融合 `el-table` 与 `.prototype-queue-card`
*   **位置**：业务列表页（队列、安环、质量返工记录等）。
*   **重用提醒**：复用现有的 `.prototype-table-head` 和表头字体变量。
*   **修改方案**：去除 `el-table` 的外边框，将其完全包裹在 `.prototype-queue-card` 中。修改 `el-table` 表头样式，使其与样式表中定义的 `.prototype-table th` 保持一致（灰底、10px 小字、加粗、微小字间距）。
*   **伪代码片段**：
    ```css
    /* 在 App.vue 的 <style> 或全局覆盖中 */
    .prototype-queue-card .el-table {
      --el-table-border-color: #eef2f8; /* 契合现有的柔和边框 */
      --el-table-header-bg-color: #f8fafc;
      --el-table-header-text-color: #94a3b8;
    }
    .prototype-queue-card .el-table th.el-table__cell {
      font-size: 10px;
      font-weight: 900;
      letter-spacing: 0.5px;
      padding: 10px 13px;
    }
    .prototype-queue-card .el-table::before {
      display: none; /* 移除底部默认粗线 */
    }
    ```
*   **视觉收益**：表格将完美无缝地融入 14px 圆角的卡片中，消除框架嵌套的割裂感。

#### 建议 B：强化数据看板的排版层级（Typography）
*   **位置**：Dashboard 中的 `.prototype-metric-grid` 和 `.prototype-stat-card`。
*   **重用提醒**：重用样式表中的字体定义，特别是已被定义的 `Lora` （用于数字/大标题）和 `JetBrains Mono`（单行等宽，适合订单号/ID）。
*   **修改方案**：确保所有的关键业务指标数值（如产量、成本、告警数）强制使用大号、粗体的 Lora 字体；订单号或设备 ID 使用等宽字体。
*   **伪代码片段**：
    ```vue
    <!-- Dashboard 指标卡片结构约束 -->
    <article class="prototype-stat-card">
      <div class="prototype-card-accent tone-blue"></div>
      <span class="prototype-stat-label">今日排产 (PCS)</span>
      <!-- 确保数字部分使用已有的强样式 -->
      <strong style="font-family: Lora, sans-serif; font-size: 28px;">24,592</strong>
      <small class="tone-green">↑ 12% 环比</small>
    </article>
    ```
*   **视觉收益**：利用 Serif (Lora) 和 Sans-serif 的对比，让数据看板具备报表般的专业感和极高的阅读节奏感。

#### 建议 C：规范状态标签（Tags & Badges）的视觉表现
*   **位置**：列表状态列、`.prototype-attention-item`、质量/安环页面的告警。
*   **重用提醒**：强制复用现有的色调类（`.tone-blue`, `.tone-rose`, `.tone-amber`, `.tone-teal`）以及 `.prototype-badge` / `.prototype-inline-status`。
*   **修改方案**：放弃使用自带大块背景色的默认 `el-tag`，改用轻量级的点状状态或你现有的轮廓状态样式。
*   **伪代码片段**：
    ```vue
    <!-- 不要用 <el-tag type="danger">，改用现有的精细状态类 -->
    <span class="prototype-inline-status tone-rose">
      <i class="attention-dot"></i>
      返工异常
    </span>
    <!-- 或使用空心带圆角的小 Badge -->
    <span class="prototype-badge tone-teal">已排产</span>
    ```
*   **视觉收益**：减少大面积高饱和色彩对用户注意力的无意义抢夺，让页面更干净（Clean UI），重点突出真正的 Attention Items。

#### 建议 D：表单密度的控制（Form Grid）
*   **位置**：右侧 `route-panel` 中的表单区域（如 `.form-config-layout`, `.check-form`）。
*   **修改方案**：Element Plus 的默认表单间距较大。配合你的 `.compact-form-grid`（两列 grid），建议设置 `el-form` 的 `label-position="top"`，并将组件尺寸设为 `size="default"` 或 `small`，高度控制在 32px - 40px（契合 `.login-field input` 的高度），以提高后台录入效率。
*   **风险**：过于紧凑可能导致误触，确保 Input 之间的 Grid Gap 维持在现有的 `10px 14px`。

---

### 3. 请勿修改的区域（Do Not Change）

*   **全局布局框架**：切勿破坏 `.app-shell` > `.content-grid.with-nav` 的 Grid 结构。其自适应侧边栏（236px/260px）和主内容区的双轨布局目前设计非常成熟。
*   **毛玻璃顶栏**：保留 `.status-bar` 的 `backdrop-filter: blur(12px)` 和半透明白底（`rgba(255, 255, 255, 0.94)`）。它在长列表滚动时能提供很好的 Z 轴深度暗示。
*   **Portal 角色色彩令牌**：保留 `.portal-doctor`, `.portal-cs`, `.portal-production` 的 CSS 变量覆盖机制。这套机制通过改变 `--portal-accent` 和 `--portal-sidebar` 实现了低成本的“千人千面”换肤，是当前 CSS 架构中最优秀的资产。
---

## Original Prompt

```text
优化 /Users/yuri/Documents/AI智能下单平台/frontend/src/App.vue 这个前端页面。由于当前网关余额不足，不能传完整 12018 行 App.vue；请基于提供的全局样式文件、依赖信息和以下已确认结构给低成本视觉优化方案。已确认结构：Vue3 + Element Plus；登录后主结构为 app-shell / workspace / status-bar / content-grid.with-nav；左侧 nav-panel 包含 portal-brand、账号 popover、route-menu、权限 footnote；中间 health-panel 包含 route hero 和后端健康检查；右侧 route-panel 承载 dashboard、质量返工、AI治理、安环、成本、奖惩、管理菜单等业务页面；dashboard 包含 sync banner、page heading、metric grid、panel cards、attention items、SVG line chart、trend rows；大量业务页面使用 prototype-queue-card、prototype-table-head、placeholder-content-grid、placeholder-content-card、el-table、el-alert、el-tag、compact-form-grid。请只从视觉设计、信息层级、布局节奏、后台操作效率、状态可读性和整体完成度角度给出实施方案；不要输出完整代码，不要评论工程债；当前用户只要先看方案，不要改代码。
```

### Referenced Files
- /Users/yuri/Documents/AI智能下单平台/frontend/src/styles.css
- /Users/yuri/Documents/AI智能下单平台/frontend/package.json
