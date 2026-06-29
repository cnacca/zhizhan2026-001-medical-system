package com.yuri.aiorder.common;

import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

public record BootstrapIdentity(UserRole role, Long userId, Long clinicId) {

    public static BootstrapIdentity fromHeaders(String roleHeader, Long userId, Long clinicId) {
        UserRole role = roleHeader == null || roleHeader.isBlank() ? UserRole.ADMIN : UserRole.valueOf(roleHeader);
        return new BootstrapIdentity(role, userId, clinicId);
    }

    public boolean isDoctor() {
        return role == UserRole.DOCTOR;
    }

    public boolean canAccessDoctorOrder(long doctorUserId, long orderClinicId) {
        return (userId != null && userId == doctorUserId) || (clinicId != null && clinicId == orderClinicId);
    }

    public void requireDoctorScope(long doctorUserId, long orderClinicId) {
        if (!isDoctor()) {
            return;
        }
        if (!canAccessDoctorOrder(doctorUserId, orderClinicId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "doctor cannot access this order");
        }
    }
}
