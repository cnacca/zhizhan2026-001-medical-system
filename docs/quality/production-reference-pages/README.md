# 生产端参考页复刻验收索引

参考视觉基线：[`factory-portal-reference-1440.png`](factory-portal-reference-1440.png)。

验收视口统一为 1440×900；截图均来自生产账号的真实本地接口数据，不补造明细或文件。

| 页面 | 实现截图 | 已对齐项 | 剩余差异与原因 |
| --- | --- | --- | --- |
| 生产订单 | [截图](production-orders-implementation-1440.png) | 筛选、表格、抽屉、选中态 | 参考数据量更大，当前仅显示真实订单。详见 `production-orders-differences.md`。 |
| 我的任务 | [截图](production-tasks-implementation-1440.png) | 工序卡、状态、操作入口 | 任务数量由当前账号权限决定。 |
| 扫码登记 | [截图](production-scan-implementation-1440.png) | 双栏登记与历史区域 | 无可定位任务时保留业务空态。 |
| 质量与返工 | [截图](production-quality-overview-implementation-1440.png) | 指标、列表、返工/终检分流 | 投诉、退货等无接口字段显示“暂无统计”。详见 `production-quality-rework-final-differences.md`。 |
| 员工管理 | [截图](production-staff-implementation-1440.png) | 搜索、员工卡、工作量表格 | 当前只有一个真实生产账号，页面不会伪造员工卡。 |
| 绩效管理 | [截图](production-performance-implementation-1440.png) | 筛选、指标卡、横向明细表 | 标准工时缺失时按真实值显示，不虚构时长。 |
| 奖惩管理 | [截图](production-reward-implementation-1440.png) | 汇总、登记与审批入口、空态 | 当前接口未返回明细时显示稳定业务空态。 |
| 设备管理 | [截图](production-device-implementation-1440.png) | 汇总、登记入口、台账空态 | 无真实设备台账时不生成设备列表。 |
| 物料管理 | [截图](production-material-implementation-1440.png) | 汇总、异常入口、台账空态 | 无真实物料明细时不生成库存记录。 |
| 安环管理 | [截图](production-safety-implementation-1440.png) | 风险提示、登记入口、整改状态区 | 无真实事件时显示业务空态。 |
| 成本管理 | [截图](production-cost-implementation-1440.png) | 汇总、成本登记、状态展示 | 成本构成只来自真实汇总。 |
| 外协成本 | [截图](production-outsourcing-implementation-1440.png) | 独立入口、外协成本登记 | 提交时固定为外协成本；未展示任何模拟合作工厂。 |
| 沟通中心 | [截图](production-message-implementation-1440.png) | 订单协同、发送区、消息上下文 | 未输入订单时不生成会话；生产端发送后仍待客服审核。 |
| 云端数据中心 | [截图](production-cloud-implementation-1440.png) | 文件列表、预览区、真实空态 | 当前账号无可访问订单附件，因此显示“暂无可查看的订单文件”。 |

## 可重复验收

```bash
npm run smoke:production-reference-pages
node scripts/check-production-reference-pages.mjs
```

浏览器冒烟覆盖生产端登录、上述菜单的真实导航、外协成本展开与分流，以及绩效页不泄漏内部规则版本。
