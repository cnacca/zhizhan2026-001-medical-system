package com.yuri.aiorder.common.auth;

import com.yuri.aiorder.common.BootstrapIdentity;
import com.yuri.aiorder.common.UserRole;
import java.util.EnumSet;
import java.util.Locale;
import java.util.Objects;
import java.util.Set;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AccessControlService {

    private static final Set<UserRole> INTERNAL_ROLES = EnumSet.of(UserRole.ADMIN, UserRole.CS, UserRole.WORKER);
    private static final Set<UserRole> PRODUCTION_REVIEW_ROLES = EnumSet.of(UserRole.ADMIN, UserRole.CS);
    private static final Set<UserRole> PROCESS_MANAGEMENT_ROLES = EnumSet.of(UserRole.ADMIN, UserRole.CS);

    public void requireAnyRole(BootstrapIdentity identity, Set<UserRole> allowedRoles, String message) {
        if (!allowedRoles.contains(identity.role())) {
            throw forbidden(message);
        }
    }

    public void requireDoctorOnly(BootstrapIdentity identity, String message) {
        requireAnyRole(identity, EnumSet.of(UserRole.DOCTOR), message);
    }

    public void requireInternalAccess(BootstrapIdentity identity, String message) {
        requirePermissionOrRole(identity, "workflow:read-internal", INTERNAL_ROLES, message);
    }

    public void requireProductionReview(BootstrapIdentity identity) {
        requirePermissionOrRole(
                identity,
                "workflow:review-production",
                PRODUCTION_REVIEW_ROLES,
                "production review requires CS or ADMIN role");
    }

    public void requireProcessManagement(BootstrapIdentity identity) {
        requirePermissionOrRole(
                identity,
                "workflow:assign",
                PROCESS_MANAGEMENT_ROLES,
                "process assignment requires CS or ADMIN role");
    }

    public void requireCheckRecordRead(BootstrapIdentity identity) {
        requirePermissionOrRole(identity, "check:read-internal", INTERNAL_ROLES, "check records are internal only");
    }

    public void requireDoctorOrderScope(BootstrapIdentity identity, Long doctorUserId, Long clinicId, String message) {
        if (identity.role() != UserRole.DOCTOR) {
            return;
        }
        if (!doctorCanAccessOrder(identity, doctorUserId, clinicId)) {
            throw forbidden(message);
        }
    }

    public boolean doctorCanAccessOrder(BootstrapIdentity identity, Long doctorUserId, Long clinicId) {
        return (doctorUserId != null && Objects.equals(identity.userId(), doctorUserId))
                || (clinicId != null && Objects.equals(identity.clinicId(), clinicId));
    }

    public String effectiveDataScope(BootstrapIdentity identity) {
        if (identity.dataScope() != null && !identity.dataScope().isBlank()) {
            return identity.dataScope().trim().toUpperCase(Locale.ROOT);
        }
        return switch (identity.role()) {
            case ADMIN, CS -> "ALL";
            case DOCTOR -> "CLINIC";
            case WORKER -> "SELF";
        };
    }

    public void requireScopedIdentity(BootstrapIdentity identity, String dataScope) {
        if ("ALL".equals(dataScope)) {
            return;
        }
        if (identity.userId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "user id is required for scoped access");
        }
        if ("CLINIC".equals(dataScope) && identity.clinicId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "clinic id is required for clinic data scope");
        }
    }

    public void requireAssignedWorkerOrAdmin(BootstrapIdentity identity, Long assignedUserId, String message) {
        if (identity.role() == UserRole.ADMIN) {
            return;
        }
        if (identity.role() != UserRole.WORKER
                || identity.userId() == null
                || assignedUserId == null
                || !identity.userId().equals(assignedUserId)) {
            throw forbidden(message);
        }
    }

    public Long resolvePerformanceTargetUserId(BootstrapIdentity identity, Long requestedUserId) {
        if (identity.role() == UserRole.WORKER) {
            if (identity.userId() == null) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "worker user id is required");
            }
            return identity.userId();
        }
        if (identity.role() == UserRole.ADMIN) {
            if (requestedUserId == null) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "user_id is required");
            }
            return requestedUserId;
        }
        throw forbidden("performance requires WORKER self scope or ADMIN role");
    }

    private void requirePermissionOrRole(
            BootstrapIdentity identity, String permissionCode, Set<UserRole> allowedRoles, String message) {
        if (identity.hasPermission(permissionCode) || allowedRoles.contains(identity.role())) {
            return;
        }
        throw forbidden(message);
    }

    private ResponseStatusException forbidden(String message) {
        return new ResponseStatusException(HttpStatus.FORBIDDEN, message);
    }
}
