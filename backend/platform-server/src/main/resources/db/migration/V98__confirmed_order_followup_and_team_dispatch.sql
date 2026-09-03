-- 2026-09-02 已确认需求：唯一生产单号、可复用盒号、客服覆盖系统预计交期、
-- 医生追加资料版本留痕，以及生产组长使用本人账号派工。

ALTER TABLE orders
    DROP INDEX uk_orders_box_no,
    ADD COLUMN production_order_no VARCHAR(64) NULL AFTER order_no,
    ADD UNIQUE KEY uk_orders_production_order_no (production_order_no),
    ADD KEY idx_orders_box_no (box_no);

CREATE TABLE order_box_assignment (
    assignment_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    order_id BIGINT NOT NULL,
    box_no VARCHAR(64) NOT NULL,
    assigned_by_user_id BIGINT NULL,
    assigned_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    released_at DATETIME(3) NULL,
    released_by_user_id BIGINT NULL,
    release_reason VARCHAR(255) NULL,
    active_box_no VARCHAR(64)
        GENERATED ALWAYS AS (CASE WHEN released_at IS NULL THEN box_no ELSE NULL END) STORED,
    UNIQUE KEY uk_order_box_assignment_active (active_box_no),
    KEY idx_order_box_assignment_order (order_id, assigned_at),
    CONSTRAINT fk_order_box_assignment_order FOREIGN KEY (order_id) REFERENCES orders (order_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO order_box_assignment (order_id, box_no, release_reason)
SELECT o.order_id, o.box_no, 'MIGRATED_ACTIVE_ASSIGNMENT'
FROM orders o
LEFT JOIN order_logistics l ON l.order_id = o.order_id
WHERE o.box_no IS NOT NULL
  AND COALESCE(l.logistics_status, 'PENDING') NOT IN ('SHIPPED', 'DELIVERED', 'RECEIVED');

ALTER TABLE order_delivery_plan
    ADD COLUMN calculated_delivery_date DATE NULL AFTER computed_delivery_date,
    ADD COLUMN manual_delivery_date DATE NULL AFTER calculated_delivery_date,
    ADD COLUMN manual_override_reason VARCHAR(500) NULL AFTER manual_delivery_date,
    ADD COLUMN manual_override_by BIGINT NULL AFTER manual_override_reason,
    ADD COLUMN manual_override_at DATETIME(3) NULL AFTER manual_override_by;

UPDATE order_delivery_plan
SET calculated_delivery_date = computed_delivery_date
WHERE calculated_delivery_date IS NULL;

CREATE TABLE order_supplement_file (
    supplement_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    order_id BIGINT NOT NULL,
    file_id BIGINT NOT NULL,
    material_type VARCHAR(64) NOT NULL,
    attachment_scope VARCHAR(16) NOT NULL,
    product_order_id BIGINT NULL,
    note VARCHAR(500) NULL,
    display_note VARCHAR(500) NOT NULL,
    version_no INT NOT NULL,
    approval_status VARCHAR(32) NOT NULL,
    uploaded_by_user_id BIGINT NOT NULL,
    approved_by_user_id BIGINT NULL,
    approved_at DATETIME(3) NULL,
    created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    UNIQUE KEY uk_order_supplement_file (order_id, file_id),
    UNIQUE KEY uk_order_supplement_version (order_id, version_no),
    KEY idx_order_supplement_status (order_id, approval_status, created_at),
    CONSTRAINT fk_order_supplement_order FOREIGN KEY (order_id) REFERENCES orders (order_id),
    CONSTRAINT fk_order_supplement_file FOREIGN KEY (file_id) REFERENCES file_resource (file_id),
    CONSTRAINT fk_order_supplement_product_order FOREIGN KEY (product_order_id) REFERENCES orders (order_id),
    CONSTRAINT chk_order_supplement_scope CHECK (attachment_scope IN ('SHARED', 'PRODUCT')),
    CONSTRAINT chk_order_supplement_status CHECK (approval_status IN ('EFFECTIVE', 'PENDING_CS_APPROVAL', 'APPROVED', 'REJECTED'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO system_permission (permission_code, permission_name, module_code, status)
VALUES
    ('workflow:assign-team', '生产组内派工转派', 'workflow', 'ACTIVE'),
    ('order:production-no:update', '维护生产订单编号', 'order', 'ACTIVE'),
    ('order:supplement:approve', '审核医生补充资料', 'order', 'ACTIVE')
ON DUPLICATE KEY UPDATE
    permission_name = VALUES(permission_name),
    module_code = VALUES(module_code),
    status = VALUES(status);

INSERT IGNORE INTO system_role_permission (role_id, permission_id)
SELECT role.role_id, permission.permission_id
FROM system_role role
JOIN system_permission permission
  ON permission.permission_code IN ('workflow:assign-team', 'workflow:assign', 'order:read-internal')
WHERE role.role_code = 'PROD_TEAM_LEAD';

INSERT IGNORE INTO system_role_menu (role_id, menu_id)
SELECT role.role_id, menu.menu_id
FROM system_role role
JOIN system_menu menu ON menu.menu_code = 'workflow-assign'
WHERE role.role_code = 'PROD_TEAM_LEAD';

INSERT IGNORE INTO system_role_permission (role_id, permission_id)
SELECT role.role_id, permission.permission_id
FROM system_role role
JOIN system_permission permission
  ON permission.permission_code IN ('order:production-no:update', 'order:supplement:approve')
WHERE role.role_code IN ('CS_MANAGER', 'CS_SENIOR', 'CS_AGENT', 'ADMIN_MANAGER', 'ADMIN_SUPERVISOR');

INSERT IGNORE INTO system_role_permission (role_id, permission_id)
SELECT role.role_id, permission.permission_id
FROM system_role role
JOIN system_permission permission
  ON permission.permission_code IN ('order:production-no:update', 'order:supplement:approve')
WHERE role.role_code IN ('CS', 'ADMIN');
