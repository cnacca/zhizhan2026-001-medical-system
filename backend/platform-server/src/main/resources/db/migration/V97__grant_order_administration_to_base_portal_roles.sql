-- Bootstrap portal roles and legacy base roles still resolve permissions by ADMIN / CS.
INSERT IGNORE INTO system_role_permission (role_id, permission_id)
SELECT role.role_id, permission.permission_id
FROM system_role role
JOIN system_permission permission
  ON permission.permission_code IN ('order:box-no:update', 'order:delivery-date:update')
WHERE role.role_code IN ('ADMIN', 'CS');
