package com.yuri.aiorder.workflow.execution;

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
public class WorkflowExecutionController {

    private final WorkflowExecutionService workflowExecutionService;

    public WorkflowExecutionController(WorkflowExecutionService workflowExecutionService) {
        this.workflowExecutionService = workflowExecutionService;
    }

    @PostMapping("/check-records")
    @RequirePermission(value = "check:write", roles = {UserRole.ADMIN, UserRole.WORKER})
    public DataResponse<CheckRecordResponse> submitCheck(
            @RequestBody CheckRecordRequest request,
            BootstrapIdentity identity) {
        return new DataResponse<>(workflowExecutionService.submitCheck(request, identity));
    }

    @GetMapping("/check-records/{nodeInstanceId}")
    @RequirePermission(value = "check:read-internal", roles = {UserRole.ADMIN, UserRole.CS, UserRole.WORKER})
    public DataResponse<List<CheckRecordResponse>> getChecks(
            @PathVariable long nodeInstanceId,
            BootstrapIdentity identity) {
        return new DataResponse<>(workflowExecutionService.getChecks(nodeInstanceId, identity));
    }

    @GetMapping("/reworks")
    @RequirePermission(value = "check:read-internal", roles = {UserRole.ADMIN, UserRole.CS, UserRole.WORKER})
    public DataResponse<List<ReworkRecordResponse>> getReworks(
            BootstrapIdentity identity,
            @RequestParam(name = "status", required = false) String status,
            @RequestParam(name = "order_id", required = false) Long orderId) {
        return new DataResponse<>(workflowExecutionService.getReworks(status, orderId, identity));
    }

    @PostMapping("/work-logs/start")
    @RequirePermission(value = "worklog:write-self", roles = {UserRole.ADMIN, UserRole.WORKER})
    public DataResponse<WorkLogResponse> startWorkLog(
            @RequestBody WorkLogStartRequest request,
            BootstrapIdentity identity) {
        return new DataResponse<>(workflowExecutionService.startWorkLog(request, identity));
    }

    @PostMapping("/work-logs/{workLogId}/pause")
    @RequirePermission(value = "worklog:write-self", roles = {UserRole.ADMIN, UserRole.WORKER})
    public DataResponse<WorkLogResponse> pauseWorkLog(
            @PathVariable long workLogId,
            BootstrapIdentity identity) {
        return new DataResponse<>(workflowExecutionService.pauseWorkLog(workLogId, identity));
    }

    @PostMapping("/work-logs/{workLogId}/resume")
    @RequirePermission(value = "worklog:write-self", roles = {UserRole.ADMIN, UserRole.WORKER})
    public DataResponse<WorkLogResponse> resumeWorkLog(
            @PathVariable long workLogId,
            BootstrapIdentity identity) {
        return new DataResponse<>(workflowExecutionService.resumeWorkLog(workLogId, identity));
    }

    @PostMapping("/work-logs/{workLogId}/finish")
    @RequirePermission(value = "worklog:write-self", roles = {UserRole.ADMIN, UserRole.WORKER})
    public DataResponse<WorkLogResponse> finishWorkLog(
            @PathVariable long workLogId,
            BootstrapIdentity identity) {
        return new DataResponse<>(workflowExecutionService.finishWorkLog(workLogId, identity));
    }

    @GetMapping("/performance")
    @RequirePermission(value = {"performance:read-all", "performance:read-self"}, roles = {
            UserRole.ADMIN, UserRole.WORKER})
    public DataResponse<PerformanceStatsResponse> getPerformance(
            BootstrapIdentity identity,
            @RequestParam(name = "user_id", required = false) Long requestedUserId) {
        return new DataResponse<>(workflowExecutionService.getPerformance(requestedUserId, identity));
    }
}
