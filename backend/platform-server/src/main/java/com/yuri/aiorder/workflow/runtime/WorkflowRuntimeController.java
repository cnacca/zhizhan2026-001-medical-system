package com.yuri.aiorder.workflow.runtime;

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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@CrossOrigin(origins = "${app.cors.allowed-origin:http://localhost:5173}")
public class WorkflowRuntimeController {

    private final WorkflowRuntimeService workflowRuntimeService;

    public WorkflowRuntimeController(WorkflowRuntimeService workflowRuntimeService) {
        this.workflowRuntimeService = workflowRuntimeService;
    }

    @PostMapping("/orders/{orderId}/production-review")
    @RequirePermission(value = "workflow:review-production", roles = {UserRole.ADMIN, UserRole.CS})
    public DataResponse<ProductionReviewResponse> reviewProduction(
            @PathVariable long orderId,
            @RequestBody ProductionReviewRequest request,
            BootstrapIdentity identity) {
        return new DataResponse<>(workflowRuntimeService.reviewProduction(orderId, request, identity));
    }

    @GetMapping("/orders/{orderId}/process-instance")
    @RequirePermission(value = "workflow:read-internal", roles = {UserRole.ADMIN, UserRole.CS, UserRole.WORKER})
    public DataResponse<ProcessInstanceResponse> getProcessInstance(
            @PathVariable long orderId,
            BootstrapIdentity identity) {
        return new DataResponse<>(workflowRuntimeService.getProcessInstance(orderId, identity));
    }

    @PostMapping("/orders/{orderId}/process-instance/assign")
    @RequirePermission(value = "workflow:assign", roles = {UserRole.ADMIN, UserRole.CS})
    public DataResponse<ProcessInstanceResponse> assign(
            @PathVariable long orderId,
            @RequestBody AssignmentRequest request,
            BootstrapIdentity identity) {
        workflowRuntimeService.assign(orderId, request, identity);
        return new DataResponse<>(workflowRuntimeService.getProcessInstance(orderId, identity));
    }

    @PostMapping("/orders/{orderId}/process-instance/nodes/{nodeInstanceId}/reassign")
    @RequirePermission(value = "workflow:assign", roles = {UserRole.ADMIN, UserRole.CS})
    public DataResponse<ProcessInstanceResponse> reassign(
            @PathVariable long orderId,
            @PathVariable long nodeInstanceId,
            @RequestBody ReassignRequest request,
            BootstrapIdentity identity) {
        workflowRuntimeService.reassign(orderId, nodeInstanceId, request, identity);
        return new DataResponse<>(workflowRuntimeService.getProcessInstance(orderId, identity));
    }

    @PostMapping("/process-instance/nodes/{nodeInstanceId}/start")
    @RequirePermission(value = "workflow:operate-assigned", roles = {UserRole.ADMIN, UserRole.WORKER})
    public DataResponse<NodeActionResponse> startNode(
            @PathVariable long nodeInstanceId,
            BootstrapIdentity identity) {
        return new DataResponse<>(workflowRuntimeService.startNode(nodeInstanceId, identity));
    }

    @PostMapping("/process-instance/nodes/{nodeInstanceId}/complete")
    @RequirePermission(value = "workflow:operate-assigned", roles = {UserRole.ADMIN, UserRole.WORKER})
    public DataResponse<NodeActionResponse> completeNode(
            @PathVariable long nodeInstanceId,
            BootstrapIdentity identity) {
        return new DataResponse<>(workflowRuntimeService.completeNode(nodeInstanceId, identity));
    }

    @PostMapping("/process-instance/nodes/{nodeInstanceId}/skip")
    @RequirePermission(value = "workflow:assign", roles = {UserRole.ADMIN, UserRole.CS})
    public DataResponse<NodeActionResponse> skipNode(
            @PathVariable long nodeInstanceId,
            @RequestBody(required = false) SkipNodeRequest request,
            BootstrapIdentity identity) {
        return new DataResponse<>(workflowRuntimeService.skipNode(nodeInstanceId, request, identity));
    }

    @GetMapping("/tasks/mine")
    @RequirePermission(value = "workflow:operate-assigned", roles = {UserRole.ADMIN, UserRole.WORKER})
    public DataResponse<List<MyTaskResponse>> getMyTasks(
            BootstrapIdentity identity,
            @RequestParam(name = "status", required = false) String status) {
        return new DataResponse<>(workflowRuntimeService.getMyTasks(identity, status));
    }
}
