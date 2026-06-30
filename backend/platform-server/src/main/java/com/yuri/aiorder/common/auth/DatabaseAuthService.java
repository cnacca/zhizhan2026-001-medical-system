package com.yuri.aiorder.common.auth;

import com.yuri.aiorder.common.BootstrapIdentity;
import com.yuri.aiorder.common.UserRole;
import java.util.Arrays;
import java.util.Comparator;
import java.util.List;
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
        List<String> roles = splitCsv(row.roleCodes());
        List<String> permissions = splitCsv(row.permissionCodes());
        UserRole primaryRole = primaryRole(roles);
        String dataScope = resolveDataScope(primaryRole, splitCsv(row.dataScopes()));
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
                                GROUP_CONCAT(DISTINCT r.role_code ORDER BY r.role_code SEPARATOR ',') AS role_codes,
                                GROUP_CONCAT(DISTINCT r.data_scope ORDER BY r.data_scope SEPARATOR ',') AS data_scopes,
                                GROUP_CONCAT(DISTINCT p.permission_code ORDER BY p.permission_code SEPARATOR ',') AS permission_codes
                            FROM system_user u
                            JOIN system_user_role ur ON ur.user_id = u.user_id
                            JOIN system_role r ON r.role_id = ur.role_id
                            LEFT JOIN system_role_permission rp ON rp.role_id = r.role_id
                            LEFT JOIN system_permission p ON p.permission_id = rp.permission_id
                            WHERE u.username = :username
                              AND u.status = 'ACTIVE'
                              AND r.status = 'ACTIVE'
                              AND (p.permission_id IS NULL OR p.status = 'ACTIVE')
                            GROUP BY u.user_id, u.username, u.password_hash, u.clinic_id
                            """)
                    .param("username", username)
                    .query((rs, rowNum) -> new UserAuthRow(
                            rs.getLong("user_id"),
                            rs.getString("username"),
                            rs.getString("password_hash"),
                            rs.getObject("clinic_id", Long.class),
                            rs.getString("role_codes"),
                            rs.getString("data_scopes"),
                            rs.getString("permission_codes")))
                    .single();
        } catch (EmptyResultDataAccessException ex) {
            throw unauthorized();
        }
    }

    private UserRole primaryRole(List<String> roles) {
        return roles.stream()
                .map(UserRole::valueOf)
                .min(Comparator.comparingInt(ROLE_PRIORITY::indexOf))
                .orElseThrow(this::unauthorized);
    }

    private String resolveDataScope(UserRole primaryRole, List<String> dataScopes) {
        if (dataScopes.contains("ALL") || primaryRole == UserRole.ADMIN || primaryRole == UserRole.CS) {
            return "ALL";
        }
        if (dataScopes.contains("CLINIC") || primaryRole == UserRole.DOCTOR) {
            return "CLINIC";
        }
        if (dataScopes.contains("SELF") || primaryRole == UserRole.WORKER) {
            return "SELF";
        }
        return "NONE";
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
            String roleCodes,
            String dataScopes,
            String permissionCodes) {
    }
}
