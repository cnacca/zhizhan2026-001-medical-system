package com.yuri.aiorder.ai;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.yuri.aiorder.common.BootstrapIdentity;
import com.yuri.aiorder.common.DataResponse;
import com.yuri.aiorder.common.UserRole;
import com.yuri.aiorder.common.auth.RequirePermission;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@CrossOrigin(origins = "${app.cors.allowed-origin:http://localhost:5173}")
public class AiGatewayController {

    private final AiGatewayService aiGatewayService;
    private final AiExternalAlertReceiverService externalAlertReceiverService;

    public AiGatewayController(
            AiGatewayService aiGatewayService,
            AiExternalAlertReceiverService externalAlertReceiverService) {
        this.aiGatewayService = aiGatewayService;
        this.externalAlertReceiverService = externalAlertReceiverService;
    }

    @PostMapping("/ai/translate")
    @RequirePermission(value = "ai:cs", roles = {UserRole.ADMIN, UserRole.CS})
    public DataResponse<TranslateResponse> translate(
            @Valid @RequestBody TranslateRequest request,
            BootstrapIdentity identity) {
        return new DataResponse<>(new TranslateResponse(
                aiGatewayService.translate(request.orderId(), request.sourceText(), identity)));
    }

    @PostMapping("/ai/check-missing")
    @RequirePermission(value = {"ai:cs", "ai:doctor"}, roles = {UserRole.ADMIN, UserRole.CS, UserRole.DOCTOR})
    public DataResponse<MissingInfoResponse> checkMissing(
            @Valid @RequestBody OrderOnlyRequest request,
            BootstrapIdentity identity) {
        return new DataResponse<>(aiGatewayService.checkMissing(request.orderId(), identity));
    }

    @PostMapping("/ai/cs-query")
    @RequirePermission(value = "ai:cs", roles = {UserRole.ADMIN, UserRole.CS})
    public DataResponse<QueryResponse> csQuery(
            @Valid @RequestBody QueryRequest request,
            BootstrapIdentity identity) {
        return new DataResponse<>(new QueryResponse(
                aiGatewayService.csQuery(request.orderId(), request.question(), identity)));
    }

    @PostMapping("/ai/production-note")
    @RequirePermission(value = "ai:production", roles = {UserRole.ADMIN, UserRole.CS, UserRole.WORKER})
    public DataResponse<ProductionNoteResponse> productionNote(
            @Valid @RequestBody OrderOnlyRequest request,
            BootstrapIdentity identity) {
        return new DataResponse<>(new ProductionNoteResponse(
                aiGatewayService.productionNote(request.orderId(), identity)));
    }

    @GetMapping("/ai/governance/summary")
    @RequirePermission(value = "ai:cs", roles = {UserRole.ADMIN, UserRole.CS})
    public DataResponse<AiGovernanceSummaryResponse> governanceSummary(BootstrapIdentity identity) {
        return new DataResponse<>(aiGatewayService.governanceSummary(identity));
    }

    @GetMapping("/ai/governance/cost-trend")
    @RequirePermission(value = "ai:cs", roles = {UserRole.ADMIN, UserRole.CS})
    public DataResponse<AiGovernanceCostTrendResponse> governanceCostTrend(
            @RequestParam(defaultValue = "7") int days,
            BootstrapIdentity identity) {
        return new DataResponse<>(aiGatewayService.governanceCostTrend(identity, days));
    }

    @GetMapping("/ai/governance/external-alerts/summary")
    @RequirePermission(value = "ai:cs", roles = {UserRole.ADMIN, UserRole.CS})
    public DataResponse<AiExternalAlertSummaryResponse> externalAlertSummary(BootstrapIdentity identity) {
        return new DataResponse<>(aiGatewayService.externalAlertSummary(identity));
    }

    @GetMapping("/ai/governance/external-alerts")
    @RequirePermission(value = "ai:cs", roles = {UserRole.ADMIN, UserRole.CS})
    public DataResponse<AiExternalAlertListResponse> externalAlerts(
            @RequestParam(name = "send_status", required = false) String sendStatus,
            @RequestParam(name = "event_type", required = false) String eventType,
            @RequestParam(name = "created_at_from", required = false) String createdAtFrom,
            @RequestParam(name = "created_at_to", required = false) String createdAtTo,
            @RequestParam(defaultValue = "20") int limit,
            BootstrapIdentity identity) {
        return new DataResponse<>(aiGatewayService.externalAlerts(
                identity,
                sendStatus,
                eventType,
                createdAtFrom,
                createdAtTo,
                limit));
    }

    @PostMapping("/ai/external-alerts/receive")
    public DataResponse<AiExternalAlertReceiverResponse> receiveExternalAlert(
            @RequestBody(required = false) String payload,
            @RequestHeader(value = "X-AI-Alert-Timestamp", required = false) String timestamp,
            @RequestHeader(value = "X-AI-Alert-Nonce", required = false) String nonce,
            @RequestHeader(value = "X-AI-Alert-Signature", required = false) String signature) {
        return new DataResponse<>(externalAlertReceiverService.receive(
                payload == null ? "" : payload,
                timestamp,
                nonce,
                signature));
    }

    public record TranslateRequest(
            @JsonProperty("order_id") @NotNull Long orderId,
            @JsonProperty("source_text") @NotBlank String sourceText) {
    }

    public record OrderOnlyRequest(@JsonProperty("order_id") @NotNull Long orderId) {
    }

    public record QueryRequest(
            @JsonProperty("order_id") @NotNull Long orderId,
            @NotBlank String question) {
    }

    public record TranslateResponse(@JsonProperty("translated_text") String translatedText) {
    }

    public record QueryResponse(String answer) {
    }

    public record ProductionNoteResponse(@JsonProperty("draft_note") String draftNote) {
    }
}
