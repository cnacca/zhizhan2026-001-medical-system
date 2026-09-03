package com.yuri.aiorder.order.api;

import com.yuri.aiorder.common.BootstrapIdentity;
import com.yuri.aiorder.common.DataResponse;
import com.yuri.aiorder.common.UserRole;
import com.yuri.aiorder.common.auth.RequirePermission;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
@CrossOrigin(origins = "${app.cors.allowed-origin:http://localhost:5173}")
public class OrderSupplementController {

    private final OrderSupplementService supplementService;

    public OrderSupplementController(OrderSupplementService supplementService) {
        this.supplementService = supplementService;
    }

    @PostMapping("/orders/{orderId}/supplements")
    @RequirePermission(value = "order:write-doctor", roles = {UserRole.DOCTOR})
    public DataResponse<List<OrderSupplementResponse>> create(
            @PathVariable long orderId,
            @Valid @RequestBody OrderSupplementCreateRequest request,
            BootstrapIdentity identity) {
        return new DataResponse<>(supplementService.create(orderId, request, identity));
    }

    @GetMapping("/orders/{orderId}/supplements")
    @RequirePermission(value = {"order:read-doctor", "order:read-internal"}, roles = {
            UserRole.DOCTOR, UserRole.CS, UserRole.ADMIN, UserRole.WORKER})
    public DataResponse<List<OrderSupplementResponse>> list(
            @PathVariable long orderId,
            BootstrapIdentity identity) {
        return new DataResponse<>(supplementService.list(orderId, identity));
    }

    @PostMapping("/orders/{orderId}/supplements/{supplementId}/review")
    @RequirePermission(value = "order:supplement:approve", roles = {UserRole.CS, UserRole.ADMIN})
    public DataResponse<OrderSupplementResponse> review(
            @PathVariable long orderId,
            @PathVariable long supplementId,
            @Valid @RequestBody OrderSupplementReviewRequest request,
            BootstrapIdentity identity) {
        return new DataResponse<>(supplementService.review(orderId, supplementId, request, identity));
    }
}
