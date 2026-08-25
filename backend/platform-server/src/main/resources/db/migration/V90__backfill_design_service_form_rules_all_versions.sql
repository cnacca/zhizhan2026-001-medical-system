-- V89 added the design-service rule to the catalog that was active during deployment.
-- Backfill every existing catalog version as well, so an already-created draft version
-- cannot later be published without the required tooth positions and design note.

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
WHERE category.category_code = 'DESIGN_SERVICE'
  AND product.status = 'ACTIVE'
ON DUPLICATE KEY UPDATE
    product_id = VALUES(product_id),
    variant_id = VALUES(variant_id),
    rule_schema_json = VALUES(rule_schema_json),
    sort_order = VALUES(sort_order),
    status = VALUES(status);
