-- 医生端后续需求：盒号、客服交期修改、发货七天自动确认收货。

ALTER TABLE orders
    ADD COLUMN box_no VARCHAR(64) NULL AFTER order_no,
    ADD UNIQUE KEY uk_orders_box_no (box_no);

ALTER TABLE order_logistics
    ADD COLUMN auto_confirm_due_at DATETIME(3) NULL AFTER delivered_at,
    ADD COLUMN auto_confirm_reminded_at DATETIME(3) NULL AFTER auto_confirm_due_at,
    ADD COLUMN receipt_confirmation_type VARCHAR(24) NULL AFTER auto_confirm_reminded_at,
    ADD COLUMN receipt_confirmed_by BIGINT NULL AFTER receipt_confirmation_type,
    ADD KEY idx_order_logistics_auto_confirm (logistics_status, auto_confirm_due_at);

CREATE TABLE order_business_audit (
    audit_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    order_id BIGINT NOT NULL,
    action_code VARCHAR(64) NOT NULL,
    before_value JSON NULL,
    after_value JSON NULL,
    actor_user_id BIGINT NULL,
    reason VARCHAR(500) NULL,
    created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    KEY idx_order_business_audit_order (order_id, created_at),
    CONSTRAINT fk_order_business_audit_order FOREIGN KEY (order_id) REFERENCES orders (order_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO system_permission (permission_code, permission_name, module_code, status)
VALUES
    ('order:box-no:update', '维护订单盒号', 'order', 'ACTIVE'),
    ('order:delivery-date:update', '客服修改订单要求到货日期', 'order', 'ACTIVE')
ON DUPLICATE KEY UPDATE
    permission_name = VALUES(permission_name),
    module_code = VALUES(module_code),
    status = VALUES(status);

INSERT IGNORE INTO system_role_permission (role_id, permission_id)
SELECT role.role_id, permission.permission_id
FROM system_role role
JOIN system_permission permission
  ON permission.permission_code IN ('order:box-no:update', 'order:delivery-date:update')
WHERE role.role_code IN ('CS_MANAGER', 'CS_SENIOR', 'CS_AGENT', 'ADMIN_MANAGER', 'ADMIN_SUPERVISOR');
