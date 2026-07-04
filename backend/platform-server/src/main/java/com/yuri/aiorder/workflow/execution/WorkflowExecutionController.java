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
import org.springframework.web.bind.annotation.PutMapping;
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
            @RequestParam(name = "order_id", required = false) Long orderId,
            @RequestParam(name = "has_impacted_nodes", required = false) Boolean hasImpactedNodes) {
        return new DataResponse<>(workflowExecutionService.getReworks(status, orderId, hasImpactedNodes, identity));
    }

    @GetMapping("/reworks/dictionaries")
    @RequirePermission(value = "check:read-internal", roles = {UserRole.ADMIN, UserRole.CS, UserRole.WORKER})
    public DataResponse<ReworkDictionariesResponse> getReworkDictionaries(BootstrapIdentity identity) {
        return new DataResponse<>(workflowExecutionService.getReworkDictionaries(identity));
    }

    @GetMapping("/reworks/dictionaries/items")
    @RequirePermission(value = "rework:dictionary:manage", roles = UserRole.ADMIN)
    public DataResponse<List<ReworkDictionaryItemResponse>> listReworkDictionaryItems(
            @RequestParam(name = "dictionary_type", required = false) String dictionaryType) {
        return new DataResponse<>(workflowExecutionService.listReworkDictionaryItems(dictionaryType));
    }

    @PostMapping("/reworks/dictionaries/items")
    @RequirePermission(value = "rework:dictionary:manage", roles = UserRole.ADMIN)
    public DataResponse<ReworkDictionaryItemResponse> createReworkDictionaryItem(
            @RequestBody CreateReworkDictionaryItemRequest request) {
        return new DataResponse<>(workflowExecutionService.createReworkDictionaryItem(request));
    }

    @PutMapping("/reworks/dictionaries/items/{itemId}")
    @RequirePermission(value = "rework:dictionary:manage", roles = UserRole.ADMIN)
    public DataResponse<ReworkDictionaryItemResponse> updateReworkDictionaryItem(
            @PathVariable long itemId,
            @RequestBody UpdateReworkDictionaryItemRequest request) {
        return new DataResponse<>(workflowExecutionService.updateReworkDictionaryItem(itemId, request));
    }

    @GetMapping("/production/quality/summary")
    @RequirePermission(value = "check:read-internal", roles = {UserRole.ADMIN, UserRole.CS, UserRole.WORKER})
    public DataResponse<ProductionQualitySummaryResponse> getProductionQualitySummary(
            BootstrapIdentity identity,
            @RequestParam(name = "product_type", required = false) String productType) {
        return new DataResponse<>(workflowExecutionService.getProductionQualitySummary(productType, identity));
    }

    @GetMapping("/production/equipment/summary")
    @RequirePermission(value = "check:read-internal", roles = {UserRole.ADMIN, UserRole.CS, UserRole.WORKER})
    public DataResponse<ProductionEquipmentSummaryResponse> getProductionEquipmentSummary(
            BootstrapIdentity identity,
            @RequestParam(name = "equipment_code_prefix", required = false) String equipmentCodePrefix) {
        return new DataResponse<>(workflowExecutionService.getProductionEquipmentSummary(equipmentCodePrefix, identity));
    }

    @GetMapping("/production/material-exceptions/summary")
    @RequirePermission(value = "check:read-internal", roles = {UserRole.ADMIN, UserRole.CS, UserRole.WORKER})
    public DataResponse<ProductionMaterialExceptionSummaryResponse> getProductionMaterialExceptionSummary(
            BootstrapIdentity identity,
            @RequestParam(name = "exception_no_prefix", required = false) String exceptionNoPrefix) {
        return new DataResponse<>(
                workflowExecutionService.getProductionMaterialExceptionSummary(exceptionNoPrefix, identity));
    }

    @GetMapping("/production/safety-environment/summary")
    @RequirePermission(value = "check:read-internal", roles = {UserRole.ADMIN, UserRole.CS, UserRole.WORKER})
    public DataResponse<ProductionSafetyEnvironmentSummaryResponse> getProductionSafetyEnvironmentSummary(
            BootstrapIdentity identity,
            @RequestParam(name = "event_no_prefix", required = false) String eventNoPrefix) {
        return new DataResponse<>(
                workflowExecutionService.getProductionSafetyEnvironmentSummary(eventNoPrefix, identity));
    }

    @GetMapping("/production/cost-management/summary")
    @RequirePermission(value = "check:read-internal", roles = {UserRole.ADMIN, UserRole.CS, UserRole.WORKER})
    public DataResponse<ProductionCostSummaryResponse> getProductionCostSummary(
            BootstrapIdentity identity,
            @RequestParam(name = "cost_no_prefix", required = false) String costNoPrefix) {
        return new DataResponse<>(workflowExecutionService.getProductionCostSummary(costNoPrefix, identity));
    }

    @GetMapping("/production/reward-penalty/summary")
    @RequirePermission(value = "check:read-internal", roles = {UserRole.ADMIN, UserRole.CS, UserRole.WORKER})
    public DataResponse<ProductionRewardPenaltySummaryResponse> getProductionRewardPenaltySummary(
            BootstrapIdentity identity,
            @RequestParam(name = "record_no_prefix", required = false) String recordNoPrefix) {
        return new DataResponse<>(
                workflowExecutionService.getProductionRewardPenaltySummary(recordNoPrefix, identity));
    }

    @PostMapping("/reworks/{reworkId}/close")
    @RequirePermission(value = "check:write", roles = {UserRole.ADMIN, UserRole.WORKER})
    public DataResponse<ReworkRecordResponse> closeRework(
            @PathVariable long reworkId,
            @RequestBody ReworkCloseRequest request,
            BootstrapIdentity identity) {
        return new DataResponse<>(workflowExecutionService.closeRework(reworkId, request, identity));
    }

    @PostMapping("/final-inspection-reports")
    @RequirePermission(value = "final-inspection:manage", roles = UserRole.ADMIN)
    public DataResponse<FinalInspectionReportResponse> createFinalInspectionReport(
            @RequestBody FinalInspectionReportRequest request,
            BootstrapIdentity identity) {
        return new DataResponse<>(workflowExecutionService.createFinalInspectionReport(request, identity));
    }

    @GetMapping("/final-inspection-reports/{orderId}")
    @RequirePermission(value = "check:read-internal", roles = {UserRole.ADMIN, UserRole.CS, UserRole.WORKER})
    public DataResponse<FinalInspectionReportResponse> getFinalInspectionReport(
            @PathVariable long orderId,
            BootstrapIdentity identity) {
        return new DataResponse<>(workflowExecutionService.getFinalInspectionReport(orderId, identity));
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

    @GetMapping("/performance/details")
    @RequirePermission(value = {"performance:read-all", "performance:read-self"}, roles = {
            UserRole.ADMIN, UserRole.WORKER})
    public DataResponse<List<PerformanceDetailResponse>> getPerformanceDetails(
            BootstrapIdentity identity,
            @RequestParam(name = "user_id", required = false) Long requestedUserId) {
        return new DataResponse<>(workflowExecutionService.getPerformanceDetails(requestedUserId, identity));
    }
}
