-- 设计服务是数字文件交付产品：保留通用病例资料校验，
-- 下单专项必填仅为牙位和设计要求备注；工作流只包含医生设计确认门禁。

INSERT INTO workflow_chain (
    chain_code, chain_name, product_type, version, intake_branch, status
)
VALUES (
    'DESIGN_SERVICE_ONLY', '设计服务（设计确认与文件交付）', 'DESIGN_SERVICE', 1, 'SCAN', 1
)
ON DUPLICATE KEY UPDATE
    chain_name = VALUES(chain_name),
    product_type = VALUES(product_type),
    intake_branch = VALUES(intake_branch),
    status = VALUES(status);

SET @design_service_chain_id = (
    SELECT chain_id
    FROM workflow_chain
    WHERE chain_code = 'DESIGN_SERVICE_ONLY'
      AND version = 1
    LIMIT 1
);

INSERT INTO workflow_node (
    chain_id, node_code, process_name, stage_name, step_order, is_optional,
    branch_group, branch_key, standard_duration, default_role, node_category,
    need_in_check, need_out_check
)
VALUES (
    @design_service_chain_id,
    'DESIGN_SERVICE_ONLY_DESIGN_CONFIRMATION_GATE',
    '设计稿确认',
    '设计交付',
    10,
    0,
    NULL,
    NULL,
    NULL,
    'WORKER',
    'DESIGN_GATE',
    0,
    0
)
ON DUPLICATE KEY UPDATE
    process_name = VALUES(process_name),
    stage_name = VALUES(stage_name),
    step_order = VALUES(step_order),
    is_optional = VALUES(is_optional),
    node_category = VALUES(node_category),
    need_in_check = VALUES(need_in_check),
    need_out_check = VALUES(need_out_check);

INSERT INTO catalog_rule_v2 (
    config_version_id, product_id, variant_id,
    rule_type, rule_code, rule_schema_json, sort_order, status
)
SELECT
    product.config_version_id,
    product.product_id,
    NULL,
    'FORM_SCHEMA',
    CONCAT('DESIGN_ORDER_REQUIREMENTS_', product.product_code),
    CAST('{
      "fields": [
        {
          "key": "tooth_positions",
          "label": "牙位",
          "type": "array",
          "required": true,
          "min_items": 1
        },
        {
          "key": "case_note",
          "label": "设计要求备注",
          "type": "textarea",
          "required": true,
          "min_length": 1,
          "max_length": 2000
        }
      ]
    }' AS JSON),
    10,
    'ACTIVE'
FROM catalog_product_v2 product
JOIN catalog_category_v2 category
  ON category.category_id = product.category_id
JOIN catalog_config_version version
  ON version.config_version_id = product.config_version_id
WHERE category.category_code = 'DESIGN_SERVICE'
  AND product.status = 'ACTIVE'
  AND version.publication_status = 'ACTIVE'
ON DUPLICATE KEY UPDATE
    product_id = VALUES(product_id),
    variant_id = VALUES(variant_id),
    rule_schema_json = VALUES(rule_schema_json),
    sort_order = VALUES(sort_order),
    status = VALUES(status);
