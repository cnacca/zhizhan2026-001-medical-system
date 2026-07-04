package com.yuri.aiorder.collaboration;

import com.yuri.aiorder.common.BootstrapIdentity;
import com.yuri.aiorder.common.DataResponse;
import com.yuri.aiorder.common.UserRole;
import com.yuri.aiorder.common.auth.RequirePermission;
import java.util.List;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
@CrossOrigin(origins = "${app.cors.allowed-origin:http://localhost:5173}")
public class CollaborationController {

    private final CollaborationService collaborationService;

    public CollaborationController(CollaborationService collaborationService) {
        this.collaborationService = collaborationService;
    }

    @GetMapping("/orders/{orderId}/messages")
    @RequirePermission(value = {"message:manage", "order:read-doctor"}, roles = {
            UserRole.ADMIN, UserRole.CS, UserRole.WORKER, UserRole.DOCTOR})
    public DataResponse<List<MessageResponse>> listMessages(
            @PathVariable long orderId,
            BootstrapIdentity identity) {
        return new DataResponse<>(collaborationService.listMessages(orderId, identity));
    }

    @PostMapping("/orders/{orderId}/messages")
    @RequirePermission(value = {"message:manage", "order:read-doctor"}, roles = {
            UserRole.ADMIN, UserRole.CS, UserRole.WORKER, UserRole.DOCTOR})
    public DataResponse<MessageResponse> sendMessage(
            @PathVariable long orderId,
            @RequestBody MessageRequest request,
            BootstrapIdentity identity) {
        return new DataResponse<>(collaborationService.sendMessage(orderId, request, identity));
    }

    @PostMapping("/messages/{msgId}/review")
    @RequirePermission(value = "message:manage", roles = {UserRole.ADMIN, UserRole.CS})
    public DataResponse<MessageResponse> reviewMessage(
            @PathVariable long msgId,
            @RequestBody MessageReviewRequest request,
            BootstrapIdentity identity) {
        return new DataResponse<>(collaborationService.reviewMessage(msgId, request, identity));
    }

    @GetMapping("/messages/pending-review")
    @RequirePermission(value = "message:manage", roles = {UserRole.ADMIN, UserRole.CS})
    public DataResponse<List<MessageResponse>> pendingMessages(
            BootstrapIdentity identity) {
        return new DataResponse<>(collaborationService.pendingMessages(identity));
    }

    @GetMapping("/orders/{orderId}/design-drafts")
    @RequirePermission(value = {"message:manage", "order:read-doctor"}, roles = {
            UserRole.ADMIN, UserRole.CS, UserRole.WORKER, UserRole.DOCTOR})
    public DataResponse<List<DesignDraftResponse>> listDesignDrafts(
            @PathVariable long orderId,
            BootstrapIdentity identity) {
        return new DataResponse<>(collaborationService.listDesignDrafts(orderId, identity));
    }

    @PostMapping("/orders/{orderId}/design-drafts")
    @RequirePermission(value = "message:manage", roles = {UserRole.ADMIN, UserRole.CS, UserRole.WORKER})
    public DataResponse<DesignDraftResponse> uploadDesignDraft(
            @PathVariable long orderId,
            @RequestBody DesignDraftRequest request,
            BootstrapIdentity identity) {
        return new DataResponse<>(collaborationService.uploadDesignDraft(orderId, request, identity));
    }

    @PostMapping("/orders/{orderId}/design-drafts/{draftId}/cs-review")
    @RequirePermission(value = "message:manage", roles = {UserRole.ADMIN, UserRole.CS})
    public DataResponse<DesignDraftResponse> reviewDesignDraft(
            @PathVariable long orderId,
            @PathVariable long draftId,
            @RequestBody DesignDraftReviewRequest request,
            BootstrapIdentity identity) {
        return new DataResponse<>(collaborationService.reviewDesignDraft(orderId, draftId, request, identity));
    }

    @PostMapping("/orders/{orderId}/design-drafts/{draftId}/doctor-confirm")
    @RequirePermission(value = "order:read-doctor", roles = UserRole.DOCTOR)
    public DataResponse<DesignDraftResponse> doctorConfirmDesignDraft(
            @PathVariable long orderId,
            @PathVariable long draftId,
            @RequestBody DoctorDraftConfirmRequest request,
            BootstrapIdentity identity) {
        return new DataResponse<>(collaborationService.doctorConfirmDesignDraft(orderId, draftId, request, identity));
    }

    @GetMapping("/orders/{orderId}/bill")
    @RequirePermission(value = {"message:manage", "order:read-doctor"}, roles = {
            UserRole.ADMIN, UserRole.CS, UserRole.DOCTOR})
    public DataResponse<BillResponse> getBill(
            @PathVariable long orderId,
            BootstrapIdentity identity) {
        return new DataResponse<>(collaborationService.getBill(orderId, identity));
    }

    @PostMapping("/orders/{orderId}/bill")
    @RequirePermission(value = "message:manage", roles = {UserRole.ADMIN, UserRole.CS})
    public DataResponse<BillResponse> uploadBill(
            @PathVariable long orderId,
            @RequestBody BillRequest request,
            BootstrapIdentity identity) {
        return new DataResponse<>(collaborationService.uploadBill(orderId, request, identity));
    }

    @PostMapping("/orders/{orderId}/bill/payment-status")
    @RequirePermission(value = "message:manage", roles = {UserRole.ADMIN, UserRole.CS})
    public DataResponse<BillResponse> updatePaymentStatus(
            @PathVariable long orderId,
            @RequestBody PaymentStatusRequest request,
            BootstrapIdentity identity) {
        return new DataResponse<>(collaborationService.updatePaymentStatus(orderId, request, identity));
    }

    @GetMapping("/orders/{orderId}/logistics")
    @RequirePermission(value = {"message:manage", "order:read-doctor"}, roles = {
            UserRole.ADMIN, UserRole.CS, UserRole.DOCTOR})
    public DataResponse<LogisticsResponse> getLogistics(
            @PathVariable long orderId,
            BootstrapIdentity identity) {
        return new DataResponse<>(collaborationService.getLogistics(orderId, identity));
    }

    @PostMapping("/orders/{orderId}/logistics")
    @RequirePermission(value = "message:manage", roles = {UserRole.ADMIN, UserRole.CS})
    public DataResponse<LogisticsResponse> shipOrder(
            @PathVariable long orderId,
            @RequestBody LogisticsRequest request,
            BootstrapIdentity identity) {
        return new DataResponse<>(collaborationService.shipOrder(orderId, request, identity));
    }
}
