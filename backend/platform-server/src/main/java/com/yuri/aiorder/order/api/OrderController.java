package com.yuri.aiorder.order.api;

import com.yuri.aiorder.common.BootstrapIdentity;
import com.yuri.aiorder.common.DataResponse;
import com.yuri.aiorder.common.UserRole;
import com.yuri.aiorder.common.auth.RequirePermission;
import com.yuri.aiorder.order.status.InternalOrderStatus;
import com.yuri.aiorder.order.status.OrderStatusService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@CrossOrigin(origins = "${app.cors.allowed-origin:http://localhost:5173}")
public class OrderController {

    private final OrderProjectionQueryService queryService;
    private final OrderStatusService statusService;
    private final OrderCreationService creationService;
    private final OrderReviewService reviewService;

    public OrderController(
            OrderProjectionQueryService queryService,
            OrderStatusService statusService,
            OrderCreationService creationService,
            OrderReviewService reviewService) {
        this.queryService = queryService;
        this.statusService = statusService;
        this.creationService = creationService;
        this.reviewService = reviewService;
    }

    @GetMapping("/orders")
    @RequirePermission(value = {"order:read-internal", "order:read-doctor"}, roles = {
            UserRole.ADMIN, UserRole.CS, UserRole.WORKER, UserRole.DOCTOR})
    public DataResponse<?> listOrders(
            @RequestParam(name = "external_status", required = false) String externalStatus,
            @RequestParam(name = "internal_status", required = false) String internalStatus,
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size,
            BootstrapIdentity identity) {
        return new DataResponse<>(queryService.listOrders(identity, externalStatus, internalStatus, keyword, page, size));
    }

    @PostMapping("/orders")
    @RequirePermission(value = "order:read-doctor", roles = {UserRole.DOCTOR})
    public DataResponse<CreateOrderResponse> createOrder(
            @Valid @RequestBody CreateOrderRequest request,
            BootstrapIdentity identity) {
        return new DataResponse<>(creationService.createSubmittedOrder(request, identity));
    }

    @PostMapping("/orders/{orderId}/review")
    @RequirePermission(value = "order:read-internal", roles = {UserRole.ADMIN, UserRole.CS})
    public DataResponse<OrderInternalDTO> reviewOrder(
            @PathVariable long orderId,
            @RequestBody OrderReviewRequest request,
            BootstrapIdentity identity) {
        return new DataResponse<>(reviewService.review(orderId, request, identity));
    }

    @GetMapping("/orders/{orderId}")
    @RequirePermission(value = {"order:read-internal", "order:read-doctor"}, roles = {
            UserRole.ADMIN, UserRole.CS, UserRole.WORKER, UserRole.DOCTOR})
    public DataResponse<?> getOrder(
            @PathVariable long orderId,
            BootstrapIdentity identity) {
        if (identity.isDoctor()) {
            return new DataResponse<>(queryService.getDoctorOrder(orderId, identity));
        }
        return new DataResponse<>(queryService.getInternalOrder(orderId, identity));
    }

    @PostMapping("/orders/{orderId}/confirm-receipt")
    @RequirePermission(value = "order:read-doctor", roles = {UserRole.ADMIN, UserRole.DOCTOR})
    public DataResponse<ConfirmReceiptResponse> confirmReceipt(
            @PathVariable long orderId,
            BootstrapIdentity identity) {
        if (identity.isDoctor()) {
            queryService.getDoctorOrder(orderId, identity);
        }
        String externalStatus = statusService.updateOrderState(
                        orderId,
                        InternalOrderStatus.COMPLETED,
                        "DOCTOR_CONFIRM_RECEIPT",
                        identity.userId(),
                        "doctor confirmed receipt")
                .name();
        return new DataResponse<>(new ConfirmReceiptResponse(orderId, externalStatus));
    }

    public record ConfirmReceiptResponse(long orderId, String externalStatus) {
    }
}
