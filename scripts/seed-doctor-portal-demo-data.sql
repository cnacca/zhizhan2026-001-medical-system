SET NAMES utf8mb4;

SET @doctor_id := 9701;
SET @clinic_id := (SELECT clinic_id FROM system_user WHERE user_id = @doctor_id);

UPDATE orders
SET production_note = NULL
WHERE production_note REGEXP '(^|[[:space:]])(task[[:space:]]*)?9D\\.[0-9]+'
   OR production_note LIKE '%固定演示数据%'
   OR production_note LIKE '%验收标记%';

UPDATE clinic SET clinic_name = '明悦口腔诊所', contact_name = '陈医生',
    contact_phone = '021-5555-8899' WHERE clinic_id = @clinic_id;
UPDATE system_user SET display_name = '陈医生', contact_email = 'doctor@mingyue.example',
    contact_phone = '021-5555-8899', shipping_address = '上海市徐汇区漕溪北路 88 号'
WHERE user_id = @doctor_id;

UPDATE patient_record SET patient_code = CASE patient_name
    WHEN '张先生' THEN 'A026' WHEN '李女士' THEN 'A031' WHEN '王先生' THEN 'B008'
    WHEN '赵女士' THEN 'B012' WHEN '周先生' THEN 'C003' ELSE patient_code END
WHERE doctor_user_id = @doctor_id;

INSERT INTO product_catalog
    (product_type, product_name, material_spec, base_price_cents, currency, status, price_note, created_by_user_id)
VALUES
    ('FIXED_CROWN', '常规牙冠', '氧化锆', 98000, 'CNY', 'ACTIVE', '医生端演示产品', 8001),
    ('IMPLANT_RESTORATION', '种植冠', '氧化锆·钛基台', 168000, 'CNY', 'ACTIVE', '医生端演示产品', 8001),
    ('FIXED_BRIDGE', '固定桥', '全瓷', 286000, 'CNY', 'ACTIVE', '医生端演示产品', 8001),
    ('REMOVABLE_DENTURE', '局部活动义齿', '钴铬支架·树脂牙', 198000, 'CNY', 'ACTIVE', '医生端演示产品', 8001),
    ('ORTHODONTIC', '正畸保持器', '透明热压膜片', 68000, 'CNY', 'ACTIVE', '医生端演示产品', 8001),
    ('CLEAR_ALIGNER', '隐形矫治方案', '多层复合膜片', 1280000, 'CNY', 'ACTIVE', '医生端演示产品', 8001),
    ('DIGITAL_DESIGN', '数字化修复设计', '数字文件交付', 38000, 'CNY', 'ACTIVE', '医生端演示产品', 8001)
ON DUPLICATE KEY UPDATE product_name = VALUES(product_name), material_spec = VALUES(material_spec),
    base_price_cents = VALUES(base_price_cents), status = 'ACTIVE', price_note = VALUES(price_note);

SET @p1 := (SELECT patient_id FROM patient_record WHERE doctor_user_id=@doctor_id AND patient_code='A026');
SET @p2 := (SELECT patient_id FROM patient_record WHERE doctor_user_id=@doctor_id AND patient_code='A031');
SET @p3 := (SELECT patient_id FROM patient_record WHERE doctor_user_id=@doctor_id AND patient_code='B008');
SET @p4 := (SELECT patient_id FROM patient_record WHERE doctor_user_id=@doctor_id AND patient_code='B012');
SET @p5 := (SELECT patient_id FROM patient_record WHERE doctor_user_id=@doctor_id AND patient_code='C003');

INSERT INTO orders
    (order_no, clinic_id, doctor_user_id, patient_id, cs_user_id, product_type,
     quoted_price_cents, quoted_price_currency, pricing_source, form_data,
     internal_status, external_status, created_at, updated_at)
VALUES
 ('ORD20260718-1001',@clinic_id,@doctor_id,@p1,8002,'IMPLANT_RESTORATION',168000,'CNY','PRODUCT',JSON_OBJECT('patient_name','张先生','patient_code','A026','product_name','种植冠','tags',JSON_ARRAY('VIP','种植'),'tooth','14','material','氧化锆·钛基台','shade','A2','due_date','2026-07-24'),'DESIGNING','DESIGNING','2026-07-15 09:20:00','2026-07-18 09:10:00'),
 ('ORD20260718-1002',@clinic_id,@doctor_id,@p2,8002,'FIXED_CROWN',NULL,NULL,NULL,JSON_OBJECT('patient_name','李女士','patient_code','A031','product_name','常规牙冠','tags',JSON_ARRAY('加急'),'tooth','26','material','氧化锆','shade','A2','due_date','2026-07-23'),'PENDING_CS_REVIEW','NEEDS_INFO','2026-07-16 14:10:00','2026-07-17 14:20:00'),
 ('ORD20260717-1003',@clinic_id,@doctor_id,@p3,8002,'FIXED_CROWN',98000,'CNY','PRODUCT',JSON_OBJECT('patient_name','王先生','patient_code','B008','product_name','常规牙冠','tags',JSON_ARRAY('新患者'),'tooth','11','material','氧化锆','shade','A2','due_date','2026-07-22'),'QC','QC','2026-07-13 11:35:00','2026-07-18 10:35:00'),
 ('ORD20260712-1004',@clinic_id,@doctor_id,@p4,8002,'FIXED_BRIDGE',286000,'CNY','PRODUCT',JSON_OBJECT('patient_name','赵女士','patient_code','B012','product_name','固定桥','tags',JSON_ARRAY(),'tooth','35-37','material','全瓷','shade','A2','due_date','2026-07-20'),'PENDING_SHIP','PENDING_SHIP','2026-07-12 10:05:00','2026-07-18 13:20:00'),
 ('ORD20260710-1005',@clinic_id,@doctor_id,@p1,8002,'FIXED_CROWN',108000,'CNY','PRODUCT',JSON_OBJECT('patient_name','张先生','patient_code','A026','product_name','常规牙冠','tags',JSON_ARRAY('复诊'),'tooth','16','material','氧化锆','shade','A2','due_date','2026-07-19'),'SHIPPED','SHIPPED','2026-07-10 08:40:00','2026-07-18 14:30:00'),
 ('ORD20260708-1006',@clinic_id,@doctor_id,@p5,8002,'IMPLANT_RESTORATION',178000,'CNY','PRODUCT',JSON_OBJECT('patient_name','周先生','patient_code','C003','product_name','种植冠','tags',JSON_ARRAY('VIP'),'tooth','26','material','氧化锆·钛基台','shade','A2','due_date','2026-07-18'),'SHIPPED','SHIPPED','2026-07-08 16:20:00','2026-07-18 11:05:00'),
 ('ORD20260702-1007',@clinic_id,@doctor_id,@p2,8002,'FIXED_CROWN',98000,'CNY','PRODUCT',JSON_OBJECT('patient_name','李女士','patient_code','A031','product_name','常规牙冠','tags',JSON_ARRAY(),'tooth','36','material','氧化锆','shade','A2','due_date','2026-07-12'),'COMPLETED','COMPLETED','2026-07-02 09:15:00','2026-07-12 16:30:00'),
 ('DRAFT-20260718-08',@clinic_id,@doctor_id,@p3,NULL,'FIXED_BRIDGE',NULL,NULL,NULL,JSON_OBJECT('patient_name','王先生','patient_code','B008','product_name','固定桥','tags',JSON_ARRAY('草稿'),'tooth','35-37','material','全瓷'),'DRAFT','DRAFT','2026-07-18 13:10:00','2026-07-18 13:10:00')
ON DUPLICATE KEY UPDATE patient_id=VALUES(patient_id), product_type=VALUES(product_type),
 quoted_price_cents=VALUES(quoted_price_cents), quoted_price_currency=VALUES(quoted_price_currency),
 form_data=VALUES(form_data), internal_status=VALUES(internal_status), external_status=VALUES(external_status), updated_at=VALUES(updated_at);

INSERT INTO order_external_projection (order_id, external_status, public_message, logistics_snapshot, bill_snapshot)
SELECT o.order_id, o.external_status,
 CASE WHEN o.order_no='ORD20260718-1002' THEN '请补充比色照片，补齐后将继续审核。' ELSE '订单正按已确认的公开进度处理。' END,
 JSON_OBJECT(), JSON_OBJECT()
FROM orders o WHERE o.order_no IN ('ORD20260718-1001','ORD20260718-1002','ORD20260717-1003','ORD20260712-1004','ORD20260710-1005','ORD20260708-1006','ORD20260702-1007','DRAFT-20260718-08')
ON DUPLICATE KEY UPDATE external_status=VALUES(external_status), public_message=VALUES(public_message);

INSERT INTO order_bill (order_id,bill_no,amount_cent,currency,bill_status,payment_status,created_at)
SELECT o.order_id,CONCAT('BILL-',o.order_no),o.quoted_price_cents,'CNY','ISSUED',
 CASE WHEN o.order_no='ORD20260712-1004' THEN 'PENDING_PAYMENT' ELSE 'PAID' END,o.created_at
FROM orders o WHERE o.order_no IN ('ORD20260718-1001','ORD20260717-1003','ORD20260712-1004','ORD20260710-1005','ORD20260708-1006','ORD20260702-1007')
ON DUPLICATE KEY UPDATE amount_cent=VALUES(amount_cent),bill_status=VALUES(bill_status),payment_status=VALUES(payment_status);

INSERT INTO order_payment_record (order_id,amount_cents,currency,payment_method,received_at,payment_note,created_by_user_id)
SELECT o.order_id,o.quoted_price_cents,'CNY','DEMO','2026-07-18 12:00:00','DOCTOR_PORTAL_MOCK_PAID',@doctor_id
FROM orders o WHERE o.order_no IN ('ORD20260718-1001','ORD20260717-1003','ORD20260710-1005','ORD20260708-1006','ORD20260702-1007')
AND NOT EXISTS (SELECT 1 FROM order_payment_record p WHERE p.order_id=o.order_id AND p.payment_note='DOCTOR_PORTAL_MOCK_PAID');

INSERT INTO order_logistics (order_id,carrier_name,tracking_no,logistics_status,shipped_at,delivered_at)
SELECT o.order_id,'顺丰速运','SF1234567890','IN_TRANSIT','2026-07-17 10:20:00',NULL FROM orders o WHERE o.order_no='ORD20260710-1005'
UNION ALL SELECT o.order_id,'顺丰速运','SF9876543210','DELIVERED_PENDING_CONFIRMATION','2026-07-16 09:10:00','2026-07-18 11:05:00' FROM orders o WHERE o.order_no='ORD20260708-1006'
ON DUPLICATE KEY UPDATE carrier_name=VALUES(carrier_name),tracking_no=VALUES(tracking_no),logistics_status=VALUES(logistics_status),shipped_at=VALUES(shipped_at),delivered_at=VALUES(delivered_at);

INSERT INTO file_resource (order_id,owner_user_id,source_type,visibility,bucket_name,object_key,original_filename,content_type,file_size,upload_status,status,created_at)
SELECT o.order_id,@doctor_id,'ORDER_ATTACHMENT','DOCTOR','ai-order-demo-private',CONCAT('doctor-demo/',o.order_no,'/scan.stl'),CONCAT(JSON_UNQUOTE(JSON_EXTRACT(o.form_data,'$.patient_code')),'-scan.stl'),'model/stl',19293798,'READY','ACTIVE',o.created_at FROM orders o WHERE o.order_no IN ('ORD20260718-1001','ORD20260718-1002','ORD20260717-1003','ORD20260712-1004','ORD20260710-1005','ORD20260708-1006','ORD20260702-1007')
UNION ALL
SELECT o.order_id,@doctor_id,'ORDER_ATTACHMENT','DOCTOR','ai-order-demo-private',CONCAT('doctor-demo/',o.order_no,'/shade.jpg'),CONCAT(JSON_UNQUOTE(JSON_EXTRACT(o.form_data,'$.patient_code')),'-shade.jpg'),'image/jpeg',2202009,'READY','ACTIVE',o.created_at FROM orders o WHERE o.order_no IN ('ORD20260718-1001','ORD20260718-1002','ORD20260717-1003','ORD20260712-1004','ORD20260710-1005','ORD20260708-1006','ORD20260702-1007')
ON DUPLICATE KEY UPDATE original_filename=VALUES(original_filename),upload_status='READY',status='ACTIVE';

INSERT INTO design_draft (order_id,file_id,version_no,draft_status,doctor_reject_reason,uploaded_by_user_id,created_at)
SELECT o.order_id,f.file_id,v.version_no,v.draft_status,v.reject_reason,8002,v.created_at
FROM orders o
JOIN (
 SELECT 1 version_no,'DOCTOR_REJECTED' draft_status,'邻接面请再调整' reject_reason,'2026-07-16 10:20:00' created_at
 UNION ALL SELECT 2,'SUPERSEDED',NULL,'2026-07-17 11:00:00'
 UNION ALL SELECT 3,'PENDING_DOCTOR_CONFIRMATION',NULL,'2026-07-18 09:10:00'
) v
JOIN file_resource f ON f.order_id=o.order_id AND f.original_filename='A026-scan.stl'
WHERE o.order_no='ORD20260718-1001'
ON DUPLICATE KEY UPDATE draft_status=VALUES(draft_status),doctor_reject_reason=VALUES(doctor_reject_reason),created_at=VALUES(created_at);

INSERT INTO design_draft (order_id,file_id,version_no,draft_status,uploaded_by_user_id,created_at)
SELECT o.order_id,f.file_id,1,'PENDING_DOCTOR_CONFIRMATION',8002,'2026-07-18 10:35:00'
FROM orders o JOIN file_resource f ON f.order_id=o.order_id AND f.original_filename='B008-shade.jpg'
WHERE o.order_no='ORD20260717-1003'
ON DUPLICATE KEY UPDATE draft_status=VALUES(draft_status),created_at=VALUES(created_at);

INSERT INTO order_message (order_id,sender_user_id,sender_role,content,visibility,review_status,created_at)
SELECT o.order_id,s.sender_user_id,s.sender_role,s.content,'DOCTOR','APPROVED',s.created_at
FROM (
 SELECT 'ORD20260718-1001' order_no,8002 sender_user_id,'CS' sender_role,'订单资料已确认，已进入制作阶段。' content,'2026-07-16 09:30:00' created_at
 UNION ALL SELECT 'ORD20260718-1001',@doctor_id,'DOCTOR','好的，请在设计稿完成后通知我。','2026-07-16 09:42:00'
 UNION ALL SELECT 'ORD20260718-1001',8002,'CS','新版设计稿已提交，请确认。','2026-07-18 09:12:00'
 UNION ALL SELECT 'ORD20260717-1003',8002,'CS','切削后照片已上传，请确认是否继续。','2026-07-18 10:36:00'
 UNION ALL SELECT 'ORD20260718-1002',8002,'CS','当前资料缺少比色照片，请在订单中补充。','2026-07-17 14:20:00'
) s JOIN orders o ON o.order_no=s.order_no
WHERE NOT EXISTS (SELECT 1 FROM order_message m WHERE m.order_id=o.order_id AND m.content=s.content);

INSERT INTO notification_event (order_id,event_type,audience_role,payload,delivery_status,created_at)
SELECT o.order_id,s.event_type,'DOCTOR',JSON_OBJECT('orderNo',o.order_no,'message',s.message,'demoMarker',s.marker),'DELIVERED',s.created_at
FROM (
 SELECT 'ORD20260718-1001' order_no,'DESIGN_REVIEW_REQUIRED' event_type,'新版设计稿已上传。' message,'DOCTOR_MOCK_N1' marker,'2026-07-18 15:10:00' created_at
 UNION ALL SELECT 'ORD20260717-1003','MESSAGE_CREATED','有新的照片确认消息。','DOCTOR_MOCK_N2','2026-07-18 14:35:00'
 UNION ALL SELECT 'ORD20260712-1004','BILL_PAYMENT_REQUIRED','待付金额 ¥2,860.00。','DOCTOR_MOCK_N3','2026-07-18 13:20:00'
 UNION ALL SELECT 'ORD20260708-1006','LOGISTICS_DELIVERED','已送达诊所，请确认收货。','DOCTOR_MOCK_N4','2026-07-18 11:20:00'
) s JOIN orders o ON o.order_no=s.order_no
WHERE NOT EXISTS (SELECT 1 FROM notification_event n WHERE JSON_UNQUOTE(JSON_EXTRACT(n.payload,'$.demoMarker'))=s.marker);

INSERT IGNORE INTO user_notification (event_id,user_id,read_at,delivered_at,created_at)
SELECT n.event_id,@doctor_id,CASE WHEN JSON_UNQUOTE(JSON_EXTRACT(n.payload,'$.demoMarker'))='DOCTOR_MOCK_N4' THEN n.created_at ELSE NULL END,n.created_at,n.created_at
FROM notification_event n WHERE JSON_UNQUOTE(JSON_EXTRACT(n.payload,'$.demoMarker')) LIKE 'DOCTOR_MOCK_N%';

INSERT INTO clinic_doctor_contact (clinic_id,doctor_name,phone,email,position_title,primary_flag,notes,status)
SELECT @clinic_id,s.doctor_name,s.phone,s.email,s.position_title,s.primary_flag,'DOCTOR_PORTAL_MOCK','ACTIVE'
FROM (
 SELECT '陈医生' doctor_name,'021-5555-8899' phone,'doctor@mingyue.example' email,'诊所管理员' position_title,1 primary_flag
 UNION ALL SELECT '林医生',NULL,'lin@mingyue.example','医生',0
 UNION ALL SELECT '张前台',NULL,'frontdesk@mingyue.example','前台',0
 UNION ALL SELECT '周护士',NULL,'nurse@mingyue.example','护士',0
) s WHERE NOT EXISTS (SELECT 1 FROM clinic_doctor_contact c WHERE c.clinic_id=@clinic_id AND c.email=s.email);
