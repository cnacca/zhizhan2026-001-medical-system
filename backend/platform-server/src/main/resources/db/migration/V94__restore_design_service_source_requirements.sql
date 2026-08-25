-- 《动态下单表最终版.docx》明确要求设计服务医生下单选择：
-- 数据格式、设计标准、设计时间。V89/V90/V91 已执行过，使用追加迁移恢复
-- 三个必选字段，不修改既有牙位、通用口扫、备注选填和数字交付门禁。

UPDATE catalog_rule_v2 rule_config
JOIN catalog_product_v2 product
  ON product.product_id = rule_config.product_id
JOIN catalog_category_v2 category
  ON category.category_id = product.category_id
SET rule_config.rule_schema_json = JSON_ARRAY_APPEND(
    rule_config.rule_schema_json,
    '$.fields',
    CAST('{
      "key": "delivery_format",
      "label": "数据格式",
      "type": "single_select",
      "required": true,
      "options": ["STL", "OBJ", "EXO", "3SHAPE"]
    }' AS JSON)
)
WHERE category.category_code = 'DESIGN_SERVICE'
  AND rule_config.rule_type = 'FORM_SCHEMA'
  AND rule_config.rule_code LIKE 'DESIGN_ORDER_REQUIREMENTS_%'
  AND JSON_SEARCH(
      rule_config.rule_schema_json,
      'one',
      'delivery_format',
      NULL,
      '$.fields[*].key'
  ) IS NULL;

UPDATE catalog_rule_v2 rule_config
JOIN catalog_product_v2 product
  ON product.product_id = rule_config.product_id
JOIN catalog_category_v2 category
  ON category.category_id = product.category_id
SET rule_config.rule_schema_json = JSON_ARRAY_APPEND(
    rule_config.rule_schema_json,
    '$.fields',
    CAST('{
      "key": "design_standard",
      "label": "设计标准",
      "type": "single_select",
      "required": true,
      "options": [
        {"value": "GENERAL", "label": "通用"},
        {"value": "PERSONALIZED", "label": "个性化"}
      ]
    }' AS JSON)
)
WHERE category.category_code = 'DESIGN_SERVICE'
  AND rule_config.rule_type = 'FORM_SCHEMA'
  AND rule_config.rule_code LIKE 'DESIGN_ORDER_REQUIREMENTS_%'
  AND JSON_SEARCH(
      rule_config.rule_schema_json,
      'one',
      'design_standard',
      NULL,
      '$.fields[*].key'
  ) IS NULL;

UPDATE catalog_rule_v2 rule_config
JOIN catalog_product_v2 product
  ON product.product_id = rule_config.product_id
JOIN catalog_category_v2 category
  ON category.category_id = product.category_id
SET rule_config.rule_schema_json = JSON_ARRAY_APPEND(
    rule_config.rule_schema_json,
    '$.fields',
    CAST('{
      "key": "design_turnaround",
      "label": "设计时间",
      "type": "single_select",
      "required": true,
      "options": [
        {"value": "12H", "label": "12小时"},
        {"value": "24H", "label": "24小时"},
        {"value": "3D", "label": "3天"}
      ]
    }' AS JSON)
)
WHERE category.category_code = 'DESIGN_SERVICE'
  AND rule_config.rule_type = 'FORM_SCHEMA'
  AND rule_config.rule_code LIKE 'DESIGN_ORDER_REQUIREMENTS_%'
  AND JSON_SEARCH(
      rule_config.rule_schema_json,
      'one',
      'design_turnaround',
      NULL,
      '$.fields[*].key'
  ) IS NULL;
