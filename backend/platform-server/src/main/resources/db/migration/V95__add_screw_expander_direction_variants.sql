-- D-214 / 《动态下单表最终版.docx》：螺旋扩弓器必须区分单向和双向。
-- 保留一个正式产品编码，通过产品变体表达方向；历史订单快照不回填、不改写。

INSERT INTO catalog_product_variant_v2
    (config_version_id, product_id, variant_code, display_name,
     attributes_json, sort_order, status)
SELECT product.config_version_id,
       product.product_id,
       'ORTHO_SCREW_EXPANDER_SINGLE_DIRECTION',
       '单向',
       JSON_OBJECT('direction', 'SINGLE_DIRECTION'),
       10,
       'ACTIVE'
FROM catalog_product_v2 product
WHERE product.product_code = 'ORTHO_SCREW_EXPANDER'
  AND product.status = 'ACTIVE'
ON DUPLICATE KEY UPDATE
    product_id = VALUES(product_id),
    display_name = VALUES(display_name),
    attributes_json = VALUES(attributes_json),
    sort_order = VALUES(sort_order),
    status = 'ACTIVE';

INSERT INTO catalog_product_variant_v2
    (config_version_id, product_id, variant_code, display_name,
     attributes_json, sort_order, status)
SELECT product.config_version_id,
       product.product_id,
       'ORTHO_SCREW_EXPANDER_DOUBLE_DIRECTION',
       '双向',
       JSON_OBJECT('direction', 'DOUBLE_DIRECTION'),
       20,
       'ACTIVE'
FROM catalog_product_v2 product
WHERE product.product_code = 'ORTHO_SCREW_EXPANDER'
  AND product.status = 'ACTIVE'
ON DUPLICATE KEY UPDATE
    product_id = VALUES(product_id),
    display_name = VALUES(display_name),
    attributes_json = VALUES(attributes_json),
    sort_order = VALUES(sort_order),
    status = 'ACTIVE';

-- D-211 从未获批或发布；防止开发库曾执行草稿迁移后残留错误别名。
DELETE alias
FROM catalog_alias_v2 alias
JOIN catalog_product_v2 product
  ON product.product_id = alias.canonical_id
 AND product.config_version_id = alias.config_version_id
WHERE alias.canonical_type = 'PRODUCT'
  AND alias.alias_text = '推簧'
  AND product.product_code = 'ORTHO_SPRING_APPLIANCE';
