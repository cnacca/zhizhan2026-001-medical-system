package com.yuri.aiorder.order.api;

import com.yuri.aiorder.common.BootstrapIdentity;
import com.yuri.aiorder.common.DataResponse;
import com.yuri.aiorder.common.UserRole;
import com.yuri.aiorder.common.auth.RequirePermission;
import com.yuri.aiorder.collaboration.CollaborationService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Size;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@CrossOrigin(origins = "${app.cors.allowed-origin:http://localhost:5173}")
public class OrderController {

    private final OrderProjectionQueryService queryService;
    private final CollaborationService collaborationService;
    private final OrderCreationService creationService;
    private final OrderReviewService reviewService;
    private final OrderAdministrationService administrationService;

    public OrderController(
            OrderProjectionQueryService queryService,
            CollaborationService collaborationService,
            OrderCreationService creationService,
            OrderReviewService reviewService,
            OrderAdministrationService administrationService) {
        this.queryService = queryService;
        this.collaborationService = collaborationService;
        this.creationService = creationService;
        this.reviewService = reviewService;
        this.administrationService = administrationService;
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
        return new DataResponse<>(creationService.createOrder(request, identity));
    }

    @PutMapping("/orders/{orderId}")
    @RequirePermission(value = "order:read-doctor", roles = {UserRole.DOCTOR})
    public DataResponse<CreateOrderResponse> updateDoctorOrder(
            @PathVariable long orderId,
            @Valid @RequestBody UpdateOrderRequest request,
            BootstrapIdentity identity) {
        return new DataResponse<>(creationService.updateDoctorOrder(orderId, request, identity));
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

    @PutMapping("/orders/{orderId}/box-no")
    @RequirePermission(value = "order:box-no:update", roles = {UserRole.ADMIN, UserRole.CS})
    public DataResponse<OrderInternalDTO> updateBoxNo(
            @PathVariable long orderId,
            @Valid @RequestBody UpdateBoxNoRequest request,
            BootstrapIdentity identity) {
        queryService.getInternalOrder(orderId, identity);
        administrationService.updateBoxNo(orderId, request.boxNo(), request.reason(), identity);
        return new DataResponse<>(queryService.getInternalOrder(orderId, identity));
    }

    @PutMapping("/orders/{orderId}/production-order-no")
    @RequirePermission(value = "order:production-no:update", roles = {UserRole.ADMIN, UserRole.CS})
    public DataResponse<OrderInternalDTO> updateProductionOrderNo(
            @PathVariable long orderId,
            @Valid @RequestBody UpdateProductionOrderNoRequest request,
            BootstrapIdentity identity) {
        queryService.getInternalOrder(orderId, identity);
        administrationService.updateProductionOrderNo(
                orderId, request.productionOrderNo(), request.reason(), identity);
        return new DataResponse<>(queryService.getInternalOrder(orderId, identity));
    }

    @PostMapping("/orders/{orderId}/confirm-receipt")
    @RequirePermission(value = "order:write-doctor", roles = {UserRole.DOCTOR})
    public DataResponse<ConfirmReceiptResponse> confirmReceipt(
            @PathVariable long orderId,
            BootstrapIdentity identity) {
        queryService.getDoctorOrder(orderId, identity);
        String externalStatus = collaborationService.confirmReceipt(orderId, identity).name();
        return new DataResponse<>(new ConfirmReceiptResponse(orderId, externalStatus));
    }

    public record ConfirmReceiptResponse(long orderId, String externalStatus) {
    }

    public record UpdateBoxNoRequest(
            @Size(max = 64) @com.fasterxml.jackson.annotation.JsonProperty("box_no") String boxNo,
            @Size(max = 500) String reason) {
    }


    public record UpdateProductionOrderNoRequest(
            @Size(max = 64) @com.fasterxml.jackson.annotation.JsonProperty("production_order_no")
                    String productionOrderNo,
            @Size(max = 500) String reason) {
    }
}
