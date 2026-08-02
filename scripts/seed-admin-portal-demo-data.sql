SET NAMES utf8mb4;

INSERT INTO clinic (clinic_name, contact_name, contact_phone, status)
VALUES
    ('晨曦口腔门诊部', '陈医生', '13800001001', 'ACTIVE'),
    ('康桥齿科中心', '林主任', '13800001002', 'ACTIVE'),
    ('海湾数字口腔', '周医生', '13800001003', 'ACTIVE'),
    ('博雅口腔诊所', '许医生', '13800001004', 'INACTIVE')
ON DUPLICATE KEY UPDATE
    contact_name = VALUES(contact_name),
    contact_phone = VALUES(contact_phone),
    status = VALUES(status);

INSERT INTO customer_preference (clinic_id, preference_key, preference_value)
SELECT clinic_id, 'shade_preference', JSON_OBJECT('value', '自然通透，颈缘轻染色')
FROM clinic WHERE clinic_name = '晨曦口腔门诊部'
ON DUPLICATE KEY UPDATE preference_value = VALUES(preference_value);
INSERT INTO customer_preference (clinic_id, preference_key, preference_value)
SELECT clinic_id, 'contact_window', JSON_OBJECT('value', '工作日 09:00-17:30')
FROM clinic WHERE clinic_name = '晨曦口腔门诊部'
ON DUPLICATE KEY UPDATE preference_value = VALUES(preference_value);
INSERT INTO customer_preference (clinic_id, preference_key, preference_value)
SELECT clinic_id, 'packing_preference', JSON_OBJECT('value', '按患者分盒并标注牙位')
FROM clinic WHERE clinic_name = '康桥齿科中心'
ON DUPLICATE KEY UPDATE preference_value = VALUES(preference_value);
INSERT INTO customer_preference (clinic_id, preference_key, preference_value)
SELECT clinic_id, 'design_preference', JSON_OBJECT('value', '种植病例优先确认穿龈轮廓')
FROM clinic WHERE clinic_name = '海湾数字口腔'
ON DUPLICATE KEY UPDATE preference_value = VALUES(preference_value);

INSERT INTO product_catalog
    (product_type, product_name, material_spec, base_price_cents, currency, status, price_note, created_by_user_id)
VALUES
    ('REGULAR_CROWN', '全瓷冠', '多层氧化锆 / 玻璃陶瓷', 128000, 'CNY', 'ACTIVE', '按客服端当前产品资料展示', 8001),
    ('IMPLANT', '种植上部修复', '钛基台 + 氧化锆', 268000, 'CNY', 'ACTIVE', '不含临床种植体费用', 8001),
    ('ORTHODONTICS', '透明保持器', '医用透明膜片', 68000, 'CNY', 'ACTIVE', '按单颌基础规格', 8001),
    ('REMOVABLE', '可摘局部义齿', '钴铬支架 + 树脂牙', 198000, 'CNY', 'ACTIVE', '特殊附件另行确认', 8001)
ON DUPLICATE KEY UPDATE
    product_name = VALUES(product_name),
    material_spec = VALUES(material_spec),
    base_price_cents = VALUES(base_price_cents),
    currency = VALUES(currency),
    status = VALUES(status),
    price_note = VALUES(price_note),
    created_by_user_id = VALUES(created_by_user_id);

INSERT INTO system_dept (dept_id, parent_id, dept_name, dept_code, sort_order, status)
VALUES
    (121, 120, 'CAD 设计组', 'demo-cad', 21, 'ACTIVE'),
    (122, 120, '切削加工组', 'demo-milling', 22, 'ACTIVE'),
    (123, 120, '上瓷质检组', 'demo-qc', 23, 'ACTIVE')
ON DUPLICATE KEY UPDATE dept_name = VALUES(dept_name), status = VALUES(status);

INSERT INTO system_user (user_id, username, password_hash, display_name, clinic_id, dept_id, user_type, status)
SELECT 9611, 'demo_cad', password_hash, '王欣', NULL, 121, 'WORKER', 'ACTIVE'
FROM system_user WHERE username = 'worker'
ON DUPLICATE KEY UPDATE display_name = VALUES(display_name), dept_id = VALUES(dept_id), status = VALUES(status);
INSERT INTO system_user (user_id, username, password_hash, display_name, clinic_id, dept_id, user_type, status)
SELECT 9612, 'demo_milling', password_hash, '李锐', NULL, 122, 'WORKER', 'ACTIVE'
FROM system_user WHERE username = 'worker'
ON DUPLICATE KEY UPDATE display_name = VALUES(display_name), dept_id = VALUES(dept_id), status = VALUES(status);
INSERT INTO system_user (user_id, username, password_hash, display_name, clinic_id, dept_id, user_type, status)
SELECT 9613, 'demo_qc', password_hash, '赵洁', NULL, 123, 'WORKER', 'ACTIVE'
FROM system_user WHERE username = 'worker'
ON DUPLICATE KEY UPDATE display_name = VALUES(display_name), dept_id = VALUES(dept_id), status = VALUES(status);

INSERT IGNORE INTO system_user_role (user_id, role_id)
SELECT u.user_id, r.role_id
FROM system_user u JOIN system_role r ON r.role_code = 'WORKER'
WHERE u.user_id IN (9611, 9612, 9613);
INSERT IGNORE INTO system_user_post (user_id, post_id)
SELECT u.user_id, p.post_id
FROM system_user u JOIN system_post p ON p.post_code = 'PRODUCTION_WORKER'
WHERE u.user_id IN (9611, 9612, 9613);

INSERT INTO orders
    (order_no, clinic_id, doctor_user_id, cs_user_id, product_type, form_data,
     internal_status, external_status, created_at, updated_at)
SELECT 'DEMO-ADMIN-CX-001', clinic_id, NULL, 8002, 'REGULAR_CROWN',
       JSON_OBJECT('item_count', 4, 'acceptance_marker', 'ADMIN_PORTAL_DEMO_V1'),
       'COMPLETED', 'COMPLETED', DATE_SUB(NOW(3), INTERVAL 2 DAY), NOW(3)
FROM clinic WHERE clinic_name = '晨曦口腔门诊部'
ON DUPLICATE KEY UPDATE form_data = VALUES(form_data), updated_at = VALUES(updated_at);
INSERT INTO orders
    (order_no, clinic_id, doctor_user_id, cs_user_id, product_type, form_data,
     internal_status, external_status, created_at, updated_at)
SELECT 'DEMO-ADMIN-CX-002', clinic_id, NULL, 8002, 'IMPLANT',
       JSON_OBJECT('item_count', 2, 'acceptance_marker', 'ADMIN_PORTAL_DEMO_V1'),
       'SHIPPED', 'SHIPPED', DATE_SUB(NOW(3), INTERVAL 5 DAY), NOW(3)
FROM clinic WHERE clinic_name = '晨曦口腔门诊部'
ON DUPLICATE KEY UPDATE form_data = VALUES(form_data), updated_at = VALUES(updated_at);
INSERT INTO orders
    (order_no, clinic_id, doctor_user_id, cs_user_id, product_type, form_data,
     internal_status, external_status, created_at, updated_at)
SELECT 'DEMO-ADMIN-KQ-001', clinic_id, NULL, 8002, 'ORTHODONTICS',
       JSON_OBJECT('item_count', 6, 'acceptance_marker', 'ADMIN_PORTAL_DEMO_V1'),
       'IN_PRODUCTION', 'PRODUCING', DATE_SUB(NOW(3), INTERVAL 7 DAY), NOW(3)
FROM clinic WHERE clinic_name = '康桥齿科中心'
ON DUPLICATE KEY UPDATE form_data = VALUES(form_data), updated_at = VALUES(updated_at);
INSERT INTO orders
    (order_no, clinic_id, doctor_user_id, cs_user_id, product_type, form_data,
     internal_status, external_status, created_at, updated_at)
SELECT 'DEMO-ADMIN-HW-001', clinic_id, NULL, 8002, 'REMOVABLE',
       JSON_OBJECT('item_count', 3, 'acceptance_marker', 'ADMIN_PORTAL_DEMO_V1'),
       'PENDING_PRODUCTION_REVIEW', 'PENDING_REVIEW', DATE_SUB(NOW(3), INTERVAL 9 DAY), NOW(3)
FROM clinic WHERE clinic_name = '海湾数字口腔'
ON DUPLICATE KEY UPDATE form_data = VALUES(form_data), updated_at = VALUES(updated_at);
INSERT INTO orders
    (order_no, clinic_id, doctor_user_id, cs_user_id, product_type, form_data,
     internal_status, external_status, created_at, updated_at)
SELECT 'DEMO-ADMIN-PREV-001', clinic_id, NULL, 8002, 'REGULAR_CROWN',
       JSON_OBJECT('item_count', 3, 'acceptance_marker', 'ADMIN_PORTAL_DEMO_V1'),
       'COMPLETED', 'COMPLETED', DATE_SUB(NOW(3), INTERVAL 1 YEAR), DATE_SUB(NOW(3), INTERVAL 1 YEAR)
FROM clinic WHERE clinic_name = '康桥齿科中心'
ON DUPLICATE KEY UPDATE form_data = VALUES(form_data);
INSERT INTO orders
    (order_no, clinic_id, doctor_user_id, cs_user_id, product_type, form_data,
     internal_status, external_status, created_at, updated_at)
-- 必须锚定到"上月 1 号"，不能用 NOW() - 1 MONTH - 7 DAY。
-- 工作台的本月/上月对比是同口径比较已过天数：上月窗口只覆盖 [上月1日, 上月1日+min(今天几号, 上月天数))。
-- 当天是 1~7 号时，减 7 天会跨到上上个月；放在月中（如 15 号）又会落在窗口之外。
-- 只有上月 1 号能保证任何日期执行都落在窗口内。
SELECT 'DEMO-ADMIN-LAST-MONTH-001', clinic_id, NULL, 8002, 'IMPLANT',
       JSON_OBJECT('item_count', 2, 'acceptance_marker', 'ADMIN_PORTAL_DEMO_V1'),
       'SHIPPED', 'SHIPPED',
       DATE_SUB(DATE_FORMAT(NOW(3), '%Y-%m-01 09:00:00'), INTERVAL 1 MONTH),
       DATE_SUB(DATE_FORMAT(NOW(3), '%Y-%m-01 09:00:00'), INTERVAL 1 MONTH)
FROM clinic WHERE clinic_name = '海湾数字口腔'
ON DUPLICATE KEY UPDATE
    form_data = VALUES(form_data),
    created_at = VALUES(created_at),
    updated_at = VALUES(updated_at);

INSERT INTO order_bill (order_id, bill_no, amount_cent, currency, bill_status, payment_status)
SELECT order_id, CONCAT('BILL-', order_no),
       CASE order_no
         WHEN 'DEMO-ADMIN-CX-001' THEN 512000
         WHEN 'DEMO-ADMIN-CX-002' THEN 536000
         WHEN 'DEMO-ADMIN-KQ-001' THEN 408000
         WHEN 'DEMO-ADMIN-HW-001' THEN 594000
         WHEN 'DEMO-ADMIN-LAST-MONTH-001' THEN 472000
         ELSE 384000
       END,
       'CNY', 'ISSUED',
       CASE WHEN order_no IN ('DEMO-ADMIN-CX-001', 'DEMO-ADMIN-CX-002', 'DEMO-ADMIN-PREV-001') THEN 'PAID' ELSE 'PENDING_PAYMENT' END
FROM orders WHERE order_no LIKE 'DEMO-ADMIN-%'
ON DUPLICATE KEY UPDATE
    amount_cent = VALUES(amount_cent), bill_status = VALUES(bill_status), payment_status = VALUES(payment_status);

INSERT INTO order_logistics
    (order_id, carrier_name, tracking_no, logistics_status, shipped_at, delivered_at)
SELECT order_id, '顺丰速运', CONCAT('SF-DEMO-', LPAD(order_id, 8, '0')),
       CASE WHEN order_no = 'DEMO-ADMIN-CX-001' OR order_no = 'DEMO-ADMIN-PREV-001' THEN 'DELIVERED' ELSE 'SHIPPED' END,
       -- 常规演示单发货时间取下单后 2 天；但"上月出货"和"去年同期出货"这两个证据单
       -- 必须与下单同日发货，否则 +2 天会越过工作台的对比窗口（窗口只覆盖已过天数）。
       CASE WHEN order_no IN ('DEMO-ADMIN-LAST-MONTH-001', 'DEMO-ADMIN-PREV-001')
            THEN created_at ELSE DATE_SUB(created_at, INTERVAL -2 DAY) END,
       CASE WHEN order_no = 'DEMO-ADMIN-CX-001' OR order_no = 'DEMO-ADMIN-PREV-001' THEN DATE_SUB(created_at, INTERVAL -4 DAY) ELSE NULL END
FROM orders WHERE order_no IN (
    'DEMO-ADMIN-CX-001',
    'DEMO-ADMIN-CX-002',
    'DEMO-ADMIN-PREV-001',
    'DEMO-ADMIN-LAST-MONTH-001'
)
ON DUPLICATE KEY UPDATE
    carrier_name = VALUES(carrier_name), tracking_no = VALUES(tracking_no),
    logistics_status = VALUES(logistics_status), shipped_at = VALUES(shipped_at), delivered_at = VALUES(delivered_at);

SET @completed_order_id := (
    SELECT order_id FROM orders
    WHERE JSON_UNQUOTE(JSON_EXTRACT(form_data, '$.demo_scenario')) = '07-已完成'
       OR JSON_UNQUOTE(JSON_EXTRACT(form_data, '$.acceptance_marker')) = 'DEMO_DATA_V1:07-已完成'
    ORDER BY order_id DESC LIMIT 1
);
SET @assigned_order_id := (
    SELECT order_id FROM orders
    WHERE JSON_UNQUOTE(JSON_EXTRACT(form_data, '$.demo_scenario')) = '03-生产待办'
       OR JSON_UNQUOTE(JSON_EXTRACT(form_data, '$.acceptance_marker')) = 'DEMO_DATA_V1:03-生产待办'
    ORDER BY order_id DESC LIMIT 1
);
SET @rework_order_id := (
    SELECT order_id FROM orders
    WHERE JSON_UNQUOTE(JSON_EXTRACT(form_data, '$.demo_scenario')) = '04-返工处理中'
       OR JSON_UNQUOTE(JSON_EXTRACT(form_data, '$.acceptance_marker')) = 'DEMO_DATA_V1:04-返工处理中'
    ORDER BY order_id DESC LIMIT 1
);

INSERT INTO order_bill (order_id, bill_no, amount_cent, currency, bill_status, payment_status)
SELECT order_id, CONCAT('BILL-', order_no),
       CASE JSON_UNQUOTE(JSON_EXTRACT(form_data, '$.demo_scenario'))
         WHEN '05-待设计确认' THEN 268000
         WHEN '06-待发货' THEN 128000
         WHEN '07-已完成' THEN 198000
         ELSE 158000
       END,
       'CNY', 'ISSUED',
       CASE JSON_UNQUOTE(JSON_EXTRACT(form_data, '$.demo_scenario'))
         WHEN '06-待发货' THEN 'PARTIALLY_PAID'
         WHEN '07-已完成' THEN 'PAID'
         ELSE 'PENDING_PAYMENT'
       END
FROM orders
WHERE JSON_UNQUOTE(JSON_EXTRACT(form_data, '$.demo_scenario')) IN ('05-待设计确认', '06-待发货', '07-已完成')
   OR JSON_UNQUOTE(JSON_EXTRACT(form_data, '$.acceptance_marker')) IN (
       'DEMO_DATA_V1:05-待设计确认', 'DEMO_DATA_V1:06-待发货', 'DEMO_DATA_V1:07-已完成'
   )
ON DUPLICATE KEY UPDATE
    amount_cent = VALUES(amount_cent), currency = VALUES(currency),
    bill_status = VALUES(bill_status), payment_status = VALUES(payment_status);

INSERT INTO order_payment_record
    (order_id, amount_cents, currency, payment_method, received_at, payment_note, created_by_user_id)
SELECT order_id,
       CASE JSON_UNQUOTE(JSON_EXTRACT(form_data, '$.demo_scenario'))
         WHEN '06-待发货' THEN 64000
         ELSE 198000
       END,
       'CNY', 'BANK_TRANSFER', DATE_SUB(NOW(3), INTERVAL 1 DAY),
       CONCAT('医生端账单演示-', JSON_UNQUOTE(JSON_EXTRACT(form_data, '$.demo_scenario'))), 8002
FROM orders source
WHERE JSON_UNQUOTE(JSON_EXTRACT(form_data, '$.demo_scenario')) IN ('06-待发货', '07-已完成')
  AND NOT EXISTS (
      SELECT 1 FROM order_payment_record existing
      WHERE existing.order_id = source.order_id
        AND existing.payment_note LIKE '医生端账单演示-%'
  );

INSERT INTO work_log
    (order_id, node_instance_id, worker_user_id, started_at, finished_at,
     pause_duration_seconds, effective_duration_seconds, status)
SELECT @completed_order_id, n.node_instance_id, staff.user_id,
       DATE_SUB(NOW(3), INTERVAL staff.offset_day DAY),
       DATE_ADD(DATE_SUB(NOW(3), INTERVAL staff.offset_day DAY), INTERVAL staff.duration_min MINUTE),
       0, staff.duration_min * 60, 'COMPLETED'
FROM (
    SELECT 9611 AS user_id, 1 AS step_no, 3 AS offset_day, 42 AS duration_min
    UNION ALL SELECT 9612, 2, 2, 58
    UNION ALL SELECT 9613, 3, 1, 35
) staff
JOIN order_process_instance i ON i.order_id = @completed_order_id
JOIN order_process_node n ON n.instance_id = i.instance_id AND n.step_order = staff.step_no
WHERE @completed_order_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM work_log existing
      WHERE existing.order_id = @completed_order_id AND existing.worker_user_id = staff.user_id
  );

INSERT INTO production_equipment
    (equipment_code, equipment_name, equipment_type, department_name, status, owner_user_id,
     utilization_rate, last_maintenance_at, next_maintenance_at)
VALUES
    ('DEMO_EQ_MILL_01', '五轴切削机 A01', 'MILLING_MACHINE', '切削加工组', 'RUNNING', 9612, 86.5, DATE_SUB(NOW(3), INTERVAL 12 DAY), DATE_ADD(NOW(3), INTERVAL 18 DAY)),
    ('DEMO_EQ_PRINT_01', '树脂 3D 打印机 P01', 'RESIN_PRINTER', 'CAD 设计组', 'IDLE', 9611, 61.0, DATE_SUB(NOW(3), INTERVAL 21 DAY), DATE_ADD(NOW(3), INTERVAL 9 DAY)),
    ('DEMO_EQ_FURNACE_01', '烧结炉 F01', 'SINTERING_FURNACE', '上瓷质检组', 'MAINTENANCE', 9613, 73.5, DATE_SUB(NOW(3), INTERVAL 35 DAY), DATE_ADD(NOW(3), INTERVAL 2 DAY)),
    ('DEMO_EQ_SCANNER_01', '桌面扫描仪 S01', 'LAB_SCANNER', 'CAD 设计组', 'FAULT', 9611, 28.0, DATE_SUB(NOW(3), INTERVAL 45 DAY), DATE_SUB(NOW(3), INTERVAL 4 DAY))
ON DUPLICATE KEY UPDATE
    equipment_name = VALUES(equipment_name), department_name = VALUES(department_name),
    status = VALUES(status), owner_user_id = VALUES(owner_user_id),
    utilization_rate = VALUES(utilization_rate), last_maintenance_at = VALUES(last_maintenance_at),
    next_maintenance_at = VALUES(next_maintenance_at);

INSERT INTO production_equipment_event
    (equipment_id, event_type, status, downtime_minutes, description, requested_by_user_id,
     approved_by_user_id, decision_note, decided_at, created_at, resolved_at)
SELECT e.equipment_id, seed.event_type, seed.status, seed.downtime_minutes, seed.description,
       seed.requested_by, seed.approved_by, seed.decision_note, seed.decided_at, seed.created_at, seed.resolved_at
FROM production_equipment e
JOIN (
    SELECT 'DEMO_EQ_MILL_01' equipment_code, 'CALIBRATION' event_type, 'DONE' status, 30 downtime_minutes,
           '季度精度校准完成，结果符合生产要求' description, 9612 requested_by, 8001 approved_by,
           '校准记录已复核' decision_note, DATE_SUB(NOW(3), INTERVAL 2 DAY) decided_at,
           DATE_SUB(NOW(3), INTERVAL 3 DAY) created_at, DATE_SUB(NOW(3), INTERVAL 2 DAY) resolved_at
    UNION ALL SELECT 'DEMO_EQ_FURNACE_01', 'REPAIR_REQUEST', 'PENDING', 120,
           '温控波动超过日常记录范围，申请停机维修', 9613, NULL, NULL, NULL,
           DATE_SUB(NOW(3), INTERVAL 6 HOUR), NULL
    UNION ALL SELECT 'DEMO_EQ_SCANNER_01', 'SCRAP_REQUEST', 'PENDING', 240,
           '核心组件停产且多次维修，申请报废评估', 9611, NULL, NULL, NULL,
           DATE_SUB(NOW(3), INTERVAL 1 DAY), NULL
    UNION ALL SELECT 'DEMO_EQ_PRINT_01', 'MAINTENANCE_PLAN', 'IN_PROGRESS', 45,
           '清洁光学组件并更换离型膜', 9611, NULL, NULL, NULL,
           DATE_SUB(NOW(3), INTERVAL 4 HOUR), NULL
) seed ON seed.equipment_code = e.equipment_code
WHERE NOT EXISTS (
    SELECT 1 FROM production_equipment_event existing
    WHERE existing.equipment_id = e.equipment_id
      AND existing.event_type = seed.event_type
      AND existing.description = seed.description
);

UPDATE production_equipment_event event
JOIN production_equipment equipment ON equipment.equipment_id = event.equipment_id
SET event.status = 'PENDING', event.approved_by_user_id = NULL,
    event.decision_note = NULL, event.decided_at = NULL, event.resolved_at = NULL
WHERE (equipment.equipment_code = 'DEMO_EQ_FURNACE_01'
       AND event.event_type = 'REPAIR_REQUEST'
       AND event.description = '温控波动超过日常记录范围，申请停机维修')
   OR (equipment.equipment_code = 'DEMO_EQ_SCANNER_01'
       AND event.event_type = 'SCRAP_REQUEST'
       AND event.description = '核心组件停产且多次维修，申请报废评估');

INSERT INTO production_material_exception
    (exception_no, material_code, material_name, order_id, node_instance_id, exception_type,
     status, responsibility_owner, loss_quantity, description, created_at, updated_at, closed_at)
VALUES
    ('DEMO_MAT_001', 'ZIR-A2-98', 'A2 多层氧化锆瓷块', @assigned_order_id, NULL, 'SHORTAGE', 'PENDING', '仓储组', 2.00, '安全库存不足，已等待补料', DATE_SUB(NOW(3), INTERVAL 4 HOUR), NOW(3), NULL),
    ('DEMO_MAT_002', 'TI-BASE-NP', '窄平台钛基台', @completed_order_id, NULL, 'WRONG_MATERIAL', 'IN_PROGRESS', '来料检验组', 1.00, '批次标签与领料单不一致，正在复核', DATE_SUB(NOW(3), INTERVAL 1 DAY), NOW(3), NULL),
    ('DEMO_MAT_003', 'RESIN-MODEL', '模型树脂', @rework_order_id, NULL, 'BATCH_ABNORMAL', 'CLOSED', '材料负责人', 0.50, '粘度异常批次已隔离并完成替换', DATE_SUB(NOW(3), INTERVAL 5 DAY), NOW(3), DATE_SUB(NOW(3), INTERVAL 3 DAY)),
    ('DEMO_MAT_004', 'CERAMIC-A3', 'A3 饰面瓷粉', @completed_order_id, NULL, 'MATERIAL_LOSS', 'CLOSED', '上瓷组', 0.30, '操作损耗已复盘并登记', DATE_SUB(NOW(3), INTERVAL 8 DAY), NOW(3), DATE_SUB(NOW(3), INTERVAL 7 DAY))
ON DUPLICATE KEY UPDATE
    order_id = VALUES(order_id), status = VALUES(status), responsibility_owner = VALUES(responsibility_owner),
    loss_quantity = VALUES(loss_quantity), description = VALUES(description), updated_at = NOW(3), closed_at = VALUES(closed_at);

INSERT INTO production_safety_rule
    (rule_code, rule_name, check_type, department_name, cycle_type, cycle_interval,
     responsible_owner, next_due_at, status)
VALUES
    ('DEMO_SAFE_RULE_01', '切削设备每日安全点检', 'SAFETY', '切削加工组', 'DAILY', 1, '李锐', DATE_ADD(CURRENT_DATE, INTERVAL 1 DAY), 'ACTIVE'),
    ('DEMO_SAFE_RULE_02', '烧结车间每周环境检查', 'ENVIRONMENT', '上瓷质检组', 'WEEKLY', 1, '赵洁', DATE_ADD(CURRENT_DATE, INTERVAL 3 DAY), 'ACTIVE'),
    ('DEMO_SAFE_RULE_03', '化学品存放月度检查', 'ENVIRONMENT', '生产中心', 'MONTHLY', 1, '安环负责人', DATE_ADD(CURRENT_DATE, INTERVAL 12 DAY), 'ACTIVE')
ON DUPLICATE KEY UPDATE
    rule_name = VALUES(rule_name), department_name = VALUES(department_name),
    responsible_owner = VALUES(responsible_owner), next_due_at = VALUES(next_due_at), status = VALUES(status);

INSERT INTO production_safety_event
    (event_no, event_type, status, department_name, responsible_owner, equipment_code,
     risk_level, due_at, description, created_at, updated_at, closed_at)
VALUES
    ('DEMO_SAFE_001', 'SAFETY_INSPECTION', 'PENDING', '切削加工组', '李锐', 'DEMO_EQ_MILL_01', 'NORMAL', DATE_ADD(NOW(3), INTERVAL 10 HOUR), '今日设备安全点检待完成', DATE_SUB(NOW(3), INTERVAL 2 HOUR), NOW(3), NULL),
    ('DEMO_SAFE_002', 'HAZARD_RECTIFICATION', 'IN_PROGRESS', '上瓷质检组', '赵洁', 'DEMO_EQ_FURNACE_01', 'HIGH', DATE_ADD(NOW(3), INTERVAL 1 DAY), '烧结炉周边临时堆放物正在整改', DATE_SUB(NOW(3), INTERVAL 1 DAY), NOW(3), NULL),
    ('DEMO_SAFE_003', 'ENVIRONMENT_RECORD', 'PENDING', '生产中心', '安环负责人', NULL, 'CRITICAL', DATE_SUB(NOW(3), INTERVAL 1 DAY), '排风记录逾期未复核', DATE_SUB(NOW(3), INTERVAL 3 DAY), NOW(3), NULL),
    ('DEMO_SAFE_004', 'PPE_DEVICE_REMINDER', 'CLOSED', 'CAD 设计组', '王欣', 'DEMO_EQ_PRINT_01', 'NORMAL', DATE_SUB(NOW(3), INTERVAL 4 DAY), '防护手套补充完成', DATE_SUB(NOW(3), INTERVAL 6 DAY), NOW(3), DATE_SUB(NOW(3), INTERVAL 4 DAY))
ON DUPLICATE KEY UPDATE
    status = VALUES(status), responsible_owner = VALUES(responsible_owner), risk_level = VALUES(risk_level),
    due_at = VALUES(due_at), description = VALUES(description), updated_at = NOW(3), closed_at = VALUES(closed_at);

INSERT INTO production_cost_record
    (cost_no, order_id, node_instance_id, cost_type, amount, status, department_name,
     supplier_name, description, created_at, updated_at, confirmed_at)
VALUES
    ('DEMO_COST_LABOR_001', @completed_order_id, NULL, 'LABOR', 380.00, 'NORMAL', 'CAD 设计组', '内部工时', '设计与复核人工成本', DATE_SUB(NOW(3), INTERVAL 6 DAY), NOW(3), NULL),
    ('DEMO_COST_MATERIAL_001', @completed_order_id, NULL, 'MATERIAL', 520.00, 'CONFIRMED', '切削加工组', '材料中心', '氧化锆瓷块与钛基台材料成本', DATE_SUB(NOW(3), INTERVAL 5 DAY), NOW(3), DATE_SUB(NOW(3), INTERVAL 2 DAY)),
    ('DEMO_COST_PROCESS_001', @assigned_order_id, NULL, 'PROCESS', 260.00, 'NORMAL', '切削加工组', '内部工序', '切削与烧结工序成本', DATE_SUB(NOW(3), INTERVAL 3 DAY), NOW(3), NULL),
    ('DEMO_COST_REWORK_001', @rework_order_id, NULL, 'REWORK', 185.00, 'WARNING', '上瓷质检组', '内部返工', '二次上瓷返工成本待责任复核', DATE_SUB(NOW(3), INTERVAL 2 DAY), NOW(3), NULL),
    ('DEMO_COST_OUT_001', @assigned_order_id, NULL, 'OUTSOURCING', 760.00, 'WARNING', '生产中心', '精工义齿协作中心', '个性化基台外协费用高于当前订单记录', DATE_SUB(NOW(3), INTERVAL 1 DAY), NOW(3), NULL)
ON DUPLICATE KEY UPDATE
    order_id = VALUES(order_id), amount = VALUES(amount), status = VALUES(status),
    department_name = VALUES(department_name), supplier_name = VALUES(supplier_name),
    description = VALUES(description), updated_at = NOW(3), confirmed_at = VALUES(confirmed_at);

INSERT INTO production_outsourcing_batch
    (batch_no, order_id, item_name, supplier_name, quantity, status, sent_at,
     expected_return_at, actual_return_at, abnormal_note)
SELECT 'DEMO_OUT_001', @assigned_order_id, '个性化钛基台', '精工义齿协作中心', 2, 'SENT',
       DATE_SUB(NOW(3), INTERVAL 2 DAY), DATE_ADD(NOW(3), INTERVAL 3 DAY), NULL, NULL
WHERE @assigned_order_id IS NOT NULL
ON DUPLICATE KEY UPDATE status = VALUES(status), expected_return_at = VALUES(expected_return_at), abnormal_note = VALUES(abnormal_note);
INSERT INTO production_outsourcing_batch
    (batch_no, order_id, item_name, supplier_name, quantity, status, sent_at,
     expected_return_at, actual_return_at, abnormal_note)
SELECT 'DEMO_OUT_002', @rework_order_id, '金属支架修整', '南方精密支架中心', 1, 'DELAYED',
       DATE_SUB(NOW(3), INTERVAL 6 DAY), DATE_SUB(NOW(3), INTERVAL 1 DAY), NULL, '供应商反馈设备检修，预计延迟两天'
WHERE @rework_order_id IS NOT NULL
ON DUPLICATE KEY UPDATE status = VALUES(status), expected_return_at = VALUES(expected_return_at), abnormal_note = VALUES(abnormal_note);
INSERT INTO production_outsourcing_batch
    (batch_no, order_id, item_name, supplier_name, quantity, status, sent_at,
     expected_return_at, actual_return_at, abnormal_note)
SELECT 'DEMO_OUT_003', @completed_order_id, '激光熔融金属冠', '华东数字制造中心', 3, 'RETURNED',
       DATE_SUB(NOW(3), INTERVAL 12 DAY), DATE_SUB(NOW(3), INTERVAL 7 DAY), DATE_SUB(NOW(3), INTERVAL 8 DAY), NULL
WHERE @completed_order_id IS NOT NULL
ON DUPLICATE KEY UPDATE status = VALUES(status), actual_return_at = VALUES(actual_return_at), abnormal_note = VALUES(abnormal_note);

INSERT INTO quality_record
    (order_id, record_type, check_result, reason_category, reason_detail, responsibility_type,
     status, status_note, created_by_user_id, status_updated_by_user_id, status_updated_at, created_at)
SELECT @completed_order_id, 'EXTERNAL_RETURN', 'FAIL', 'FIT', '客户反馈边缘适合度需复核', 'PRODUCTION',
       'PENDING', '已由客服登记，等待责任确认', 8002, 8002, NOW(3), DATE_SUB(NOW(3), INTERVAL 1 DAY)
WHERE @completed_order_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM quality_record WHERE reason_detail = '客户反馈边缘适合度需复核');

INSERT INTO ai_audit_log
    (order_id, actor_user_id, actor_role, agent_code, request_context_type, prompt_version,
     prompt_hash, model_name, input_token_count, output_token_count, estimated_cost_microusd,
     result_status, created_at)
SELECT @completed_order_id, 8001, 'ADMIN', seed.agent_code, seed.context_type, 'DEMO_ACCEPTANCE_V1',
       seed.prompt_hash, seed.model_name, seed.input_tokens, seed.output_tokens, seed.cost, seed.result_status,
       seed.created_at
FROM (
    SELECT 'ADMIN_SUMMARY' agent_code, 'ORDER_SUMMARY' context_type, 'DEMO_AI_01' prompt_hash,
           'deterministic-demo' model_name, 260 input_tokens, 90 output_tokens, 4200 cost, 'SUCCESS' result_status,
           DATE_SUB(NOW(3), INTERVAL 1 HOUR) created_at
    UNION ALL SELECT 'CS_QUERY', 'ORDER_QUERY', 'DEMO_AI_02', 'deterministic-demo', 320, 120, 5600, 'SUCCESS', DATE_SUB(NOW(3), INTERVAL 4 HOUR)
    UNION ALL SELECT 'DOCTOR_ORDER', 'ORDER_QUERY', 'DEMO_AI_03', 'deterministic-demo', 180, 70, 3100, 'SUCCESS', DATE_SUB(NOW(3), INTERVAL 8 HOUR)
    UNION ALL SELECT 'DOCTOR_ORDER', 'UNSAFE_QUERY', 'DEMO_AI_04', 'safe-guard', 80, 0, 0, 'SAFE_REFUSAL', DATE_SUB(NOW(3), INTERVAL 9 HOUR)
    UNION ALL SELECT 'CS_QUERY', 'RATE_LIMIT', 'DEMO_AI_05', 'rate-limiter', 0, 0, 0, 'AI_RATE_LIMITED', DATE_SUB(NOW(3), INTERVAL 10 HOUR)
    UNION ALL SELECT 'PRODUCTION_NOTE', 'MODEL_CALL', 'DEMO_AI_06', 'deterministic-demo', 140, 0, 0, 'AI_MODEL_FAILED', DATE_SUB(NOW(3), INTERVAL 11 HOUR)
    UNION ALL SELECT 'ADMIN_SUMMARY', 'ORDER_SUMMARY', 'DEMO_AI_DAY2', 'deterministic-demo', 210, 80, 3600, 'SUCCESS', DATE_SUB(NOW(3), INTERVAL 1 DAY)
    UNION ALL SELECT 'ADMIN_SUMMARY', 'ORDER_SUMMARY', 'DEMO_AI_DAY3', 'deterministic-demo', 190, 70, 3200, 'SUCCESS', DATE_SUB(NOW(3), INTERVAL 2 DAY)
    UNION ALL SELECT 'ADMIN_SUMMARY', 'ORDER_SUMMARY', 'DEMO_AI_DAY4', 'deterministic-demo', 230, 85, 3900, 'SUCCESS', DATE_SUB(NOW(3), INTERVAL 3 DAY)
    UNION ALL SELECT 'ADMIN_SUMMARY', 'ORDER_SUMMARY', 'DEMO_AI_DAY5', 'deterministic-demo', 170, 60, 2800, 'SUCCESS', DATE_SUB(NOW(3), INTERVAL 4 DAY)
    UNION ALL SELECT 'ADMIN_SUMMARY', 'ORDER_SUMMARY', 'DEMO_AI_DAY6', 'deterministic-demo', 200, 75, 3400, 'SUCCESS', DATE_SUB(NOW(3), INTERVAL 5 DAY)
    UNION ALL SELECT 'ADMIN_SUMMARY', 'ORDER_SUMMARY', 'DEMO_AI_DAY7', 'deterministic-demo', 160, 55, 2500, 'SUCCESS', DATE_SUB(NOW(3), INTERVAL 6 DAY)
) seed
WHERE NOT EXISTS (SELECT 1 FROM ai_audit_log existing WHERE existing.prompt_hash = seed.prompt_hash);

-- Keep idempotent demo audit rows inside the rolling dashboard windows. Without
-- refreshing these timestamps, a long-lived demo database eventually loses the
-- 24-hour refusal/failure evidence and the seven-day trend even though reseeding
-- succeeds.
UPDATE ai_audit_log
SET created_at = CASE prompt_hash
    WHEN 'DEMO_AI_01' THEN DATE_SUB(NOW(3), INTERVAL 1 HOUR)
    WHEN 'DEMO_AI_02' THEN DATE_SUB(NOW(3), INTERVAL 4 HOUR)
    WHEN 'DEMO_AI_03' THEN DATE_SUB(NOW(3), INTERVAL 8 HOUR)
    WHEN 'DEMO_AI_04' THEN DATE_SUB(NOW(3), INTERVAL 9 HOUR)
    WHEN 'DEMO_AI_05' THEN DATE_SUB(NOW(3), INTERVAL 10 HOUR)
    WHEN 'DEMO_AI_06' THEN DATE_SUB(NOW(3), INTERVAL 11 HOUR)
    WHEN 'DEMO_AI_DAY2' THEN DATE_SUB(NOW(3), INTERVAL 1 DAY)
    WHEN 'DEMO_AI_DAY3' THEN DATE_SUB(NOW(3), INTERVAL 2 DAY)
    WHEN 'DEMO_AI_DAY4' THEN DATE_SUB(NOW(3), INTERVAL 3 DAY)
    WHEN 'DEMO_AI_DAY5' THEN DATE_SUB(NOW(3), INTERVAL 4 DAY)
    WHEN 'DEMO_AI_DAY6' THEN DATE_SUB(NOW(3), INTERVAL 5 DAY)
    WHEN 'DEMO_AI_DAY7' THEN DATE_SUB(NOW(3), INTERVAL 6 DAY)
    ELSE created_at
END
WHERE prompt_hash IN (
    'DEMO_AI_01', 'DEMO_AI_02', 'DEMO_AI_03', 'DEMO_AI_04', 'DEMO_AI_05', 'DEMO_AI_06',
    'DEMO_AI_DAY2', 'DEMO_AI_DAY3', 'DEMO_AI_DAY4', 'DEMO_AI_DAY5', 'DEMO_AI_DAY6', 'DEMO_AI_DAY7'
);

INSERT INTO notification_event (order_id, event_type, audience_role, payload, delivery_status, created_at)
SELECT seed.order_id, seed.event_type, 'ADMIN',
       JSON_OBJECT('orderNo', seed.order_no, 'message', seed.message, 'demoMarker', seed.marker),
       'DELIVERED', seed.created_at
FROM (
    SELECT @assigned_order_id order_id, 'ORDER_STATUS_CHANGED' event_type,
           (SELECT order_no FROM orders WHERE order_id = @assigned_order_id) order_no,
           '演示订单已进入生产待办，请关注派工进度' message, 'ADMIN_NOTICE_01' marker,
           DATE_SUB(NOW(3), INTERVAL 20 MINUTE) created_at
    UNION ALL SELECT @rework_order_id, 'ORDER_STATUS_CHANGED',
           (SELECT order_no FROM orders WHERE order_id = @rework_order_id),
           '演示订单出现返工记录，请查看质量责任依据', 'ADMIN_NOTICE_02', DATE_SUB(NOW(3), INTERVAL 2 HOUR)
    UNION ALL SELECT @completed_order_id, 'LOGISTICS_UPDATED',
           (SELECT order_no FROM orders WHERE order_id = @completed_order_id),
           '演示订单物流状态已更新为送达', 'ADMIN_NOTICE_03', DATE_SUB(NOW(3), INTERVAL 1 DAY)
) seed
WHERE seed.order_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM notification_event existing
      WHERE JSON_UNQUOTE(JSON_EXTRACT(existing.payload, '$.demoMarker')) = seed.marker
  );

INSERT IGNORE INTO user_notification (event_id, user_id, read_at, delivered_at, created_at)
SELECT event_id, 8001,
       CASE WHEN JSON_UNQUOTE(JSON_EXTRACT(payload, '$.demoMarker')) = 'ADMIN_NOTICE_03'
            THEN DATE_SUB(NOW(3), INTERVAL 20 HOUR) ELSE NULL END,
       created_at, created_at
FROM notification_event
WHERE JSON_UNQUOTE(JSON_EXTRACT(payload, '$.demoMarker')) LIKE 'ADMIN_NOTICE_%';

UPDATE user_notification notification
JOIN notification_event event ON event.event_id = notification.event_id
SET notification.read_at = CASE
        WHEN JSON_UNQUOTE(JSON_EXTRACT(event.payload, '$.demoMarker')) = 'ADMIN_NOTICE_03'
        THEN DATE_SUB(NOW(3), INTERVAL 20 HOUR)
        ELSE NULL
    END
WHERE notification.user_id = 8001
  AND JSON_UNQUOTE(JSON_EXTRACT(event.payload, '$.demoMarker')) LIKE 'ADMIN_NOTICE_%';

-- Doctor portal patient profiles mirrored from the visual acceptance mock.
-- They belong to the built-in demo doctor so the API-backed doctor portal can
-- display them after `doctorMock=1` is removed.
UPDATE clinic
SET clinic_name = '明悦口腔诊所',
    contact_name = '陈医生'
WHERE clinic_id = (SELECT clinic_id FROM system_user WHERE user_id = 9701);

UPDATE system_user
SET display_name = '陈医生'
WHERE user_id = 9701;

INSERT INTO patient_record
    (clinic_id, doctor_user_id, patient_name, patient_age, patient_gender,
     date_of_birth, phone, email, medical_notes, patient_tags,
     treatment_status, treatment_started_at, treatment_ended_at,
     oral_description, status, created_at, updated_at)
SELECT u.clinic_id, u.user_id, seed.patient_name, seed.patient_age, seed.patient_gender,
       seed.date_of_birth, seed.phone, seed.email, seed.medical_notes, seed.patient_tags,
       seed.treatment_status, seed.treatment_started_at, seed.treatment_ended_at,
       seed.oral_description, 'ACTIVE', seed.created_at, seed.updated_at
FROM system_user u
JOIN (
    SELECT '张先生' patient_name, 42 patient_age, '男' patient_gender,
           DATE '1984-03-18' date_of_birth, '138****2026' phone,
           'zhang@example.com' email, '青霉素过敏；请避免相关用药。' medical_notes,
           'VIP,种植' patient_tags, 'IN_TREATMENT' treatment_status,
           DATE '2026-04-01' treatment_started_at, NULL treatment_ended_at,
           '右上后牙缺失，已完成种植体植入。' oral_description,
           TIMESTAMP '2026-04-01 09:00:00' created_at, TIMESTAMP '2026-07-18 09:00:00' updated_at
    UNION ALL SELECT '李女士', 35, '女', DATE '1991-06-12', '139****8812', NULL, NULL,
           '复诊', 'IN_TREATMENT', DATE '2026-05-10', NULL,
           '左下后牙牙体缺损。', TIMESTAMP '2026-05-10 09:00:00', TIMESTAMP '2026-07-17 09:00:00'
    UNION ALL SELECT '王先生', 51, '男', DATE '1975-09-03', NULL, NULL,
           '高血压病史，术前复核血压。', '新患者', 'FOLLOW_UP', DATE '2026-03-15', NULL,
           '前牙美学修复咨询。', TIMESTAMP '2026-03-15 09:00:00', TIMESTAMP '2026-07-18 09:00:00'
    UNION ALL SELECT '赵女士', 47, '女', DATE '1979-12-23', NULL, NULL, NULL, NULL,
           'TREATMENT_ENDED', DATE '2026-01-10', DATE '2026-05-05',
           '下颌后牙连续缺失。', TIMESTAMP '2026-01-10 09:00:00', TIMESTAMP '2026-07-12 09:00:00'
    UNION ALL SELECT '周先生', 39, '男', DATE '1987-02-06', NULL, NULL, NULL, 'VIP',
           'ARCHIVED', DATE '2025-10-02', DATE '2026-02-11',
           '左上第一磨牙种植修复。', TIMESTAMP '2025-10-02 09:00:00', TIMESTAMP '2026-07-08 09:00:00'
) seed
WHERE u.user_id = 9701
  AND NOT EXISTS (
      SELECT 1
      FROM patient_record existing
      WHERE existing.doctor_user_id = u.user_id
        AND existing.patient_name = seed.patient_name
  );
