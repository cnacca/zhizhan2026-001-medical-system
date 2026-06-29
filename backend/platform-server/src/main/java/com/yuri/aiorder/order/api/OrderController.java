package com.yuri.aiorder.order.api;

import com.yuri.aiorder.common.BootstrapIdentity;
import com.yuri.aiorder.common.DataResponse;
import com.yuri.aiorder.order.status.InternalOrderStatus;
import com.yuri.aiorder.order.status.OrderStatusService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@CrossOrigin(origins = "${app.cors.allowed-origin:http://localhost:5173}")
public class OrderController {

    private final OrderProjectionQueryService queryService;
    private final OrderStatusService statusService;

    public OrderController(OrderProjectionQueryService queryService, OrderStatusService statusService) {
        this.queryService = queryService;
        this.statusService = statusService;
    }

    @GetMapping("/orders/{orderId}")
    public DataResponse<?> getOrder(
            @PathVariable long orderId,
            @RequestHeader(name = "X-Bootstrap-Role", required = false) String role,
            @RequestHeader(name = "X-Bootstrap-User-Id", required = false) Long userId,
            @RequestHeader(name = "X-Bootstrap-Clinic-Id", required = false) Long clinicId) {
        BootstrapIdentity identity = BootstrapIdentity.fromHeaders(role, userId, clinicId);
        if (identity.isDoctor()) {
            return new DataResponse<>(queryService.getDoctorOrder(orderId, identity));
        }
        return new DataResponse<>(queryService.getInternalOrder(orderId));
    }

    @PostMapping("/orders/{orderId}/confirm-receipt")
    public DataResponse<ConfirmReceiptResponse> confirmReceipt(
            @PathVariable long orderId,
            @RequestHeader(name = "X-Bootstrap-Role", required = false) String role,
            @RequestHeader(name = "X-Bootstrap-User-Id", required = false) Long userId,
            @RequestHeader(name = "X-Bootstrap-Clinic-Id", required = false) Long clinicId) {
        BootstrapIdentity identity = BootstrapIdentity.fromHeaders(role, userId, clinicId);
        if (identity.isDoctor()) {
            queryService.getDoctorOrder(orderId, identity);
        }
        String externalStatus = statusService.updateOrderState(
                        orderId,
                        InternalOrderStatus.COMPLETED,
                        "DOCTOR_CONFIRM_RECEIPT",
                        userId,
                        "doctor confirmed receipt")
                .name();
        return new DataResponse<>(new ConfirmReceiptResponse(orderId, externalStatus));
    }

    @GetMapping("/orders/{orderId}/process-instance")
    public DataResponse<ProcessInstancePlaceholder> getProcessInstance(
            @PathVariable long orderId,
            @RequestHeader(name = "X-Bootstrap-Role", required = false) String role,
            @RequestHeader(name = "X-Bootstrap-User-Id", required = false) Long userId,
            @RequestHeader(name = "X-Bootstrap-Clinic-Id", required = false) Long clinicId) {
        BootstrapIdentity identity = BootstrapIdentity.fromHeaders(role, userId, clinicId);
        if (identity.isDoctor()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "doctor cannot access process instance");
        }
        throw new ResponseStatusException(HttpStatus.NOT_IMPLEMENTED, "workflow runtime is not implemented in task 3");
    }

    public record ConfirmReceiptResponse(long orderId, String externalStatus) {
    }

    public record ProcessInstancePlaceholder(long orderId) {
    }
}
