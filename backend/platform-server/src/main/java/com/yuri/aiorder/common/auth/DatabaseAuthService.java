package com.yuri.aiorder.common.auth;

import com.yuri.aiorder.common.BootstrapIdentity;
import com.yuri.aiorder.common.UserRole;
import java.util.Arrays;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.stream.Collectors;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class DatabaseAuthService {

    private static final List<UserRole> ROLE_PRIORITY = List.of(
            UserRole.ADMIN, UserRole.CS, UserRole.WORKER, UserRole.DOCTOR);

    private final JdbcClient jdbcClient;
    private final PasswordHashService passwordHashService;

    public DatabaseAuthService(JdbcClient jdbcClient, PasswordHashService passwordHashService) {
        this.jdbcClient = jdbcClient;
        this.passwordHashService = passwordHashService;
    }

    public AuthenticatedUser authenticate(String username, String password) {
        UserAuthRow row = loadUser(username);
        if (!passwordHashService.matches(password, row.passwordHash())) {
            throw unauthorized();
        }
        return toAuthenticatedUser(row);
    }

    public AuthenticatedUser loadAuthenticatedUser(long userId) {
        return toAuthenticatedUser(loadUser(userId));
    }

    private AuthenticatedUser toAuthenticatedUser(UserAuthRow row) {
        List<String> roles = splitCsv(row.roleCodes());
        List<String> permissions = splitCsv(row.permissionCodes());
        UserRole primaryRole = primaryRole(roles);
        String dataScope = resolveDataScope(primaryRole, row.userDataScope(), splitCsv(row.dataScopes()));
        BootstrapIdentity identity = new BootstrapIdentity(
                primaryRole,
                row.userId(),
                row.clinicId(),
                row.username(),
                Set.copyOf(permissions),
                dataScope);
        List<AuthMenu> menus = loadMenus(row.userId());
        return new AuthenticatedUser(
                row.username(),
                row.userId(),
                row.clinicId(),
                roles,
                permissions,
                menus,
                dataScope,
                identity);
    }

    public List<AuthMenu> loadMenus(BootstrapIdentity identity) {
        if (identity.userId() == null) {
            return List.of();
        }
        return loadMenus(identity.userId());
    }

    private UserAuthRow loadUser(String username) {
        try {
            return jdbcClient.sql("""
                            SELECT
                                u.user_id,
                                u.username,
                                u.password_hash,
                                u.clinic_id,
                                u.data_scope AS user_data_scope,
                                GROUP_CONCAT(DISTINCT r.role_code ORDER BY r.role_code SEPARATOR ',') AS role_codes,
                                GROUP_CONCAT(DISTINCT r.data_scope ORDER BY r.data_scope SEPARATOR ',') AS data_scopes,
                                GROUP_CONCAT(DISTINCT p.permission_code ORDER BY p.permission_code SEPARATOR ',') AS permission_codes
                            FROM system_user u
                            JOIN system_user_role ur ON ur.user_id = u.user_id
                            JOIN system_role r ON r.role_id = ur.role_id
                            LEFT JOIN (
                                SELECT permission_user.user_id, permission_user.permission_id
                                FROM (
                                    SELECT role_user.user_id, role_permission.permission_id
                                    FROM system_user_role role_user
                                    JOIN system_role active_role
                                      ON active_role.role_id = role_user.role_id
                                     AND active_role.status = 'ACTIVE'
                                    JOIN system_role_permission role_permission
                                      ON role_permission.role_id = active_role.role_id
                                    UNION
                                    SELECT direct_permission.user_id, direct_permission.permission_id
                                    FROM system_user_permission direct_permission
                                ) permission_user
                            ) effective_permission
                              ON effective_permission.user_id = u.user_id
                            LEFT JOIN system_permission p
                              ON p.permission_id = effective_permission.permission_id
                             AND p.status = 'ACTIVE'
                            WHERE u.username = :username
                              AND u.status = 'ACTIVE'
                              AND r.status = 'ACTIVE'
                            GROUP BY u.user_id, u.username, u.password_hash, u.clinic_id, u.data_scope
                            """)
                    .param("username", username)
                    .query((rs, rowNum) -> new UserAuthRow(
                            rs.getLong("user_id"),
                            rs.getString("username"),
                            rs.getString("password_hash"),
                            rs.getObject("clinic_id", Long.class),
                            rs.getString("user_data_scope"),
                            rs.getString("role_codes"),
                            rs.getString("data_scopes"),
                            rs.getString("permission_codes")))
                    .single();
        } catch (EmptyResultDataAccessException ex) {
            throw unauthorized();
        }
    }

    private UserAuthRow loadUser(long userId) {
        try {
            return jdbcClient.sql("""
                            SELECT
                                u.user_id,
                                u.username,
                                u.password_hash,
                                u.clinic_id,
                                u.data_scope AS user_data_scope,
                                GROUP_CONCAT(DISTINCT r.role_code ORDER BY r.role_code SEPARATOR ',') AS role_codes,
                                GROUP_CONCAT(DISTINCT r.data_scope ORDER BY r.data_scope SEPARATOR ',') AS data_scopes,
                                GROUP_CONCAT(DISTINCT p.permission_code ORDER BY p.permission_code SEPARATOR ',') AS permission_codes
                            FROM system_user u
                            JOIN system_user_role ur ON ur.user_id = u.user_id
                            JOIN system_role r ON r.role_id = ur.role_id
                            LEFT JOIN (
                                SELECT permission_user.user_id, permission_user.permission_id
                                FROM (
                                    SELECT role_user.user_id, role_permission.permission_id
                                    FROM system_user_role role_user
                                    JOIN system_role active_role
                                      ON active_role.role_id = role_user.role_id
                                     AND active_role.status = 'ACTIVE'
                                    JOIN system_role_permission role_permission
                                      ON role_permission.role_id = active_role.role_id
                                    UNION
                                    SELECT direct_permission.user_id, direct_permission.permission_id
                                    FROM system_user_permission direct_permission
                                ) permission_user
                            ) effective_permission
                              ON effective_permission.user_id = u.user_id
                            LEFT JOIN system_permission p
                              ON p.permission_id = effective_permission.permission_id
                             AND p.status = 'ACTIVE'
                            WHERE u.user_id = :userId
                              AND u.status = 'ACTIVE'
                              AND r.status = 'ACTIVE'
                            GROUP BY u.user_id, u.username, u.password_hash, u.clinic_id, u.data_scope
                            """)
                    .param("userId", userId)
                    .query((rs, rowNum) -> new UserAuthRow(
                            rs.getLong("user_id"),
                            rs.getString("username"),
                            rs.getString("password_hash"),
                            rs.getObject("clinic_id", Long.class),
                            rs.getString("user_data_scope"),
                            rs.getString("role_codes"),
                            rs.getString("data_scopes"),
                            rs.getString("permission_codes")))
                    .single();
        } catch (EmptyResultDataAccessException ex) {
            throw unauthorized();
        }
    }

    /**
     * 解析入口角色（Portal）。
     *
     * <p>只有与 {@link UserRole} 同名的角色码才是入口角色；客户确认的细分角色（组长、终检员、收货人员……）
     * 是普通的 {@code system_role} 记录，会被忽略而不是让登录失败。
     * 原实现对每个角色码直接 {@code UserRole.valueOf}，一旦管理端新建一个细分角色并分配给用户，
     * 该用户就再也登录不进来——这与「新增角色不需要改 Java 代码」直接冲突。
     */
    private UserRole primaryRole(List<String> roles) {
        return roles.stream()
                .map(this::toPortalRole)
                .filter(java.util.Objects::nonNull)
                .min(Comparator.comparingInt(ROLE_PRIORITY::indexOf))
                .orElseThrow(this::unauthorized);
    }

    private UserRole toPortalRole(String roleCode) {
        try {
            return UserRole.valueOf(roleCode);
        } catch (IllegalArgumentException ex) {
            return null;
        }
    }

    /**
     * 数据范围解析顺序：用户级覆盖 &gt; 角色级配置 &gt; 入口角色默认值。
     *
     * <p>此前的实现把「入口角色是 ADMIN / CS 就返回 ALL」写在最前面，角色级 {@code system_role.data_scope}
     * 实际上永远被入口角色盖掉——客户要的「客服经理=全公司 / 普通客服=本人负责」在那种写法下无法配置出来。
     * 现在只有当该用户的所有角色都没有配置数据范围时，才回落到入口角色默认值。
     *
     * <p>用户同时拥有多个角色时取其中最宽的范围。这是过渡口径：TASK-034 B 批次落地
     * 「登录后选择当前身份」之后，这里应改为只按当前生效身份解析，届时不再存在多角色取并集的问题。
     */
    private String resolveDataScope(UserRole primaryRole, String userDataScope, List<String> dataScopes) {
        String override = normalizeDataScope(userDataScope);
        if (override != null) {
            return override;
        }
        if (dataScopes.contains("ALL")) {
            return "ALL";
        }
        if (dataScopes.contains("CLINIC")) {
            return "CLINIC";
        }
        if (dataScopes.contains("SELF")) {
            return "SELF";
        }
        if (!dataScopes.isEmpty()) {
            return "NONE";
        }
        return switch (primaryRole) {
            case ADMIN, CS -> "ALL";
            case DOCTOR -> "CLINIC";
            case WORKER -> "SELF";
        };
    }

    private String normalizeDataScope(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim().toUpperCase(Locale.ROOT);
    }

    private List<String> splitCsv(String csv) {
        if (csv == null || csv.isBlank()) {
            return List.of();
        }
        return Arrays.stream(csv.split(","))
                .map(String::trim)
                .filter(value -> !value.isBlank())
                .distinct()
                .collect(Collectors.toList());
    }

    private List<AuthMenu> loadMenus(long userId) {
        return jdbcClient.sql("""
                        SELECT DISTINCT
                            m.menu_code,
                            m.menu_name,
                            m.menu_type,
                            m.route_path,
                            m.component_path,
                            m.permission_code,
                            m.icon,
                            m.sort_order
                        FROM system_user_role ur
                        JOIN system_role r ON r.role_id = ur.role_id
                        JOIN system_role_menu rm ON rm.role_id = r.role_id
                        JOIN system_menu m ON m.menu_id = rm.menu_id
                        WHERE ur.user_id = :userId
                          AND r.status = 'ACTIVE'
                          AND m.status = 'ACTIVE'
                          AND (
                              m.permission_code IS NULL
                              OR m.permission_code = ''
                              OR EXISTS (
                                  SELECT 1
                                  FROM system_permission effective_permission
                                  WHERE effective_permission.permission_code = m.permission_code
                                    AND effective_permission.status = 'ACTIVE'
                                    AND (
                                        EXISTS (
                                            SELECT 1
                                            FROM system_user_role permission_user_role
                                            JOIN system_role permission_role
                                              ON permission_role.role_id = permission_user_role.role_id
                                             AND permission_role.status = 'ACTIVE'
                                            JOIN system_role_permission role_permission
                                              ON role_permission.role_id = permission_role.role_id
                                            WHERE permission_user_role.user_id = ur.user_id
                                              AND role_permission.permission_id = effective_permission.permission_id
                                        )
                                        OR EXISTS (
                                            SELECT 1
                                            FROM system_user_permission user_permission
                                            WHERE user_permission.user_id = ur.user_id
                                              AND user_permission.permission_id = effective_permission.permission_id
                                        )
                                    )
                              )
                          )
                        ORDER BY m.sort_order, m.menu_code
                        """)
                .param("userId", userId)
                .query((rs, rowNum) -> new AuthMenu(
                        rs.getString("menu_code"),
                        rs.getString("menu_name"),
                        rs.getString("menu_type"),
                        rs.getString("route_path"),
                        rs.getString("component_path"),
                        rs.getString("permission_code"),
                        rs.getString("icon"),
                        rs.getObject("sort_order", Integer.class)))
                .list();
    }

    private ResponseStatusException unauthorized() {
        return new ResponseStatusException(HttpStatus.UNAUTHORIZED, "invalid username or password");
    }

    private record UserAuthRow(
            long userId,
            String username,
            String passwordHash,
            Long clinicId,
            String userDataScope,
            String roleCodes,
            String dataScopes,
            String permissionCodes) {
    }
}
