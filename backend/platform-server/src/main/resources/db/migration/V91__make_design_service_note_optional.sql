-- 设计服务仍要求牙位和通用口扫资料；设计要求备注改为选填。
-- 使用追加迁移校准 V89 / V90，避免修改已执行迁移的校验和。

UPDATE catalog_rule_v2 rule_config
JOIN catalog_product_v2 product
  ON product.product_id = rule_config.product_id
JOIN catalog_category_v2 category
  ON category.category_id = product.category_id
SET rule_config.rule_schema_json = JSON_REMOVE(
    JSON_SET(
        rule_config.rule_schema_json,
        '$.fields[1].required',
        CAST('false' AS JSON)
    ),
    '$.fields[1].min_length'
)
WHERE category.category_code = 'DESIGN_SERVICE'
  AND rule_config.rule_type = 'FORM_SCHEMA'
  AND rule_config.rule_code LIKE 'DESIGN_ORDER_REQUIREMENTS_%'
  AND JSON_UNQUOTE(JSON_EXTRACT(rule_config.rule_schema_json, '$.fields[1].key')) = 'case_note';
