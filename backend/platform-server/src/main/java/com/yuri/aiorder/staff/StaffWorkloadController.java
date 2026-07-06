package com.yuri.aiorder.staff;

import com.yuri.aiorder.common.BootstrapIdentity;
import com.yuri.aiorder.common.DataResponse;
import com.yuri.aiorder.common.UserRole;
import com.yuri.aiorder.common.auth.RequirePermission;
import com.yuri.aiorder.order.api.OrderProjectionQueryService.OrderListResponse;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@CrossOrigin(origins = "${app.cors.allowed-origin:http://localhost:5173}")
public class StaffWorkloadController {

    private final StaffWorkloadService staffWorkloadService;

    public StaffWorkloadController(StaffWorkloadService staffWorkloadService) {
        this.staffWorkloadService = staffWorkloadService;
    }

    @GetMapping("/staff/workload")
    @RequirePermission(value = {"workflow:read-internal", "performance:read-self"}, roles = {
            UserRole.ADMIN, UserRole.CS, UserRole.WORKER})
    public DataResponse<OrderListResponse<StaffWorkloadResponse>> listStaffWorkload(
            BootstrapIdentity identity,
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size) {
        return new DataResponse<>(staffWorkloadService.listStaffWorkload(identity, keyword, page, size));
    }
}
