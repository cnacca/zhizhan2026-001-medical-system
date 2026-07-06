package com.yuri.aiorder.ai;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.yuri.aiorder.common.BootstrapIdentity;
import com.yuri.aiorder.common.UserRole;
import com.yuri.aiorder.common.auth.AccessControlService;
import com.yuri.aiorder.notification.NotificationPushService;
import com.yuri.aiorder.order.api.DoctorOrderAssistantReadModel;
import com.yuri.aiorder.order.api.OrderProjectionQueryService;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.EnumSet;
import java.util.HexFormat;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.function.Supplier;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Service;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.TransactionDefinition;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionTemplate;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AiGatewayService {

    private static final String DETERMINISTIC_MODEL_NAME = "deterministic-placeholder";
    private static final String PRODUCTION_NOTE_TEMPLATE_VERSION = "PHASE_ONE_DEFAULT_V1";
    private static final String LANGCHAIN_DEEPSEEK_PROVIDER = "LANGCHAIN_DEEPSEEK";
    private static final String RATE_LIMIT_MODEL_NAME = "ai-governance-rate-limit";
    private static final String RATE_LIMIT_STATUS = "AI_RATE_LIMITED";
    private static final String MODEL_FAILURE_MODEL_NAME = "ai-governance-model-failure";
    private static final String MODEL_FAILURE_STATUS = "AI_MODEL_FAILED";
    private static final String BUDGET_EXCEEDED_MODEL_NAME = "ai-governance-budget-exceeded";
    private static final String BUDGET_EXCEEDED_STATUS = "AI_BUDGET_EXCEEDED";
    private static final String BUDGET_CIRCUIT_OPEN_MODEL_NAME = "ai-governance-budget-circuit-open";
    private static final String BUDGET_CIRCUIT_OPEN_STATUS = "AI_BUDGET_CIRCUIT_OPEN";
    private static final String BUDGET_ROLE_CIRCUIT_OPEN_MODEL_NAME = "ai-governance-budget-role-circuit-open";
    private static final String BUDGET_ROLE_CIRCUIT_OPEN_STATUS = "AI_BUDGET_ROLE_CIRCUIT_OPEN";
    private static final String BUDGET_MODEL_CIRCUIT_OPEN_MODEL_NAME = "ai-governance-budget-model-circuit-open";
    private static final String BUDGET_MODEL_CIRCUIT_OPEN_STATUS = "AI_BUDGET_MODEL_CIRCUIT_OPEN";
    private static final String OUTPUT_GUARD_MODEL_NAME = "ai-governance-output-guard";
    private static final String OUTPUT_GUARD_STATUS = "AI_OUTPUT_GUARDED";
    private static final String EXTERNAL_ALERT_CHANNEL = "EXTERNAL_ALERT";
    private static final String EXTERNAL_ALERT_PENDING_STATUS = "PENDING";
    private static final String EXTERNAL_ALERT_SENDING_STATUS = "SENDING";
    private static final String EXTERNAL_ALERT_SENT_STATUS = "SENT";
    private static final String EXTERNAL_ALERT_FAILED_STATUS = "FAILED";
    private static final String EXTERNAL_ALERT_DEAD_LETTER_STATUS = "DEAD_LETTER";
    private static final Set<UserRole> CS_AND_ADMIN = EnumSet.of(UserRole.CS, UserRole.ADMIN);
    private static final Set<UserRole> CHECK_MISSING_ROLES = EnumSet.of(UserRole.DOCTOR, UserRole.CS, UserRole.ADMIN);
    private static final Set<UserRole> PRODUCTION_NOTE_ROLES = EnumSet.of(UserRole.CS, UserRole.WORKER, UserRole.ADMIN);
    private static final List<String> OUTPUT_GUARD_PATTERNS = List.of(
            "deepseek_api_key",
            "app_auth_token_secret",
            "minio_secret_key",
            "api key",
            "secret=",
            "password=",
            "token=",
            "内部工序备注：不要泄露",
            "file_resource",
            "ai_audit_log",
            "auth_refresh_token",
            "system_user");
    private static final List<String> DOCTOR_INTERNAL_KEYWORDS = List.of(
            "工序", "员工", "技工", "谁在做", "返工", "工时", "绩效", "入检", "出检",
            "责任", "internal", "process", "work_log", "rework", "performance", "assigned");

    private final JdbcClient jdbcClient;
    private final ObjectMapper objectMapper;
    private final OrderProjectionQueryService orderProjectionQueryService;
    private final AccessControlService accessControlService;
    private final AiModelClient aiModelClient;
    private final AiGatewayProperties properties;
    private final NotificationPushService notificationPushService;
    private final TransactionTemplate aiGovernanceAuditTransaction;

    public AiGatewayService(
            JdbcClient jdbcClient,
            ObjectMapper objectMapper,
            OrderProjectionQueryService orderProjectionQueryService,
            AccessControlService accessControlService,
            AiModelClient aiModelClient,
            AiGatewayProperties properties,
            NotificationPushService notificationPushService,
            PlatformTransactionManager transactionManager) {
        this.jdbcClient = jdbcClient;
        this.objectMapper = objectMapper;
        this.orderProjectionQueryService = orderProjectionQueryService;
        this.accessControlService = accessControlService;
        this.aiModelClient = aiModelClient;
        this.properties = properties;
        this.notificationPushService = notificationPushService;
        this.aiGovernanceAuditTransaction = new TransactionTemplate(transactionManager);
        this.aiGovernanceAuditTransaction.setPropagationBehavior(TransactionDefinition.PROPAGATION_REQUIRES_NEW);
    }

    @Transactional
    public String translate(long orderId, String sourceText, BootstrapIdentity identity) {
        accessControlService.requireAnyRole(identity, CS_AND_ADMIN, "AI-1 is CS/ADMIN only");
        OrderAiContext context = loadOrderContext(orderId, identity, "identity cannot access this order");
        enforceAiRateLimit(orderId, identity, "AI_TRANSLATE", "ORDER_TRANSLATION_DRAFT", sourceText);
        AiModelResult answer = completeWithModel(
                "你是牙科工厂客服翻译助手。只输出翻译草稿，不自动审核、不自动发送。",
                "订单号：" + context.orderNo() + "\n待翻译内容：" + sourceText.trim(),
                () -> deterministic("翻译草稿（需客服确认后才可写入订单）："
                        + sourceText.trim()
                        + "。订单号："
                        + context.orderNo()
                        + "。"),
                orderId,
                identity,
                "AI_TRANSLATE",
                "ORDER_TRANSLATION_DRAFT",
                sourceText);
        audit(orderId, identity, "AI_TRANSLATE", "ORDER_TRANSLATION_DRAFT", sourceText, "SUCCESS", answer);
        return answer.content();
    }

    @Transactional
    public CsQueryResult csQuery(long orderId, String question, BootstrapIdentity identity) {
        accessControlService.requireAnyRole(identity, CS_AND_ADMIN, "AI-2 is CS/ADMIN only");
        OrderAiContext context = loadOrderContext(orderId, identity, "identity cannot access this order");
        List<String> referenceDataNotes = buildCsReferenceDataNotes(context);
        String referenceDataText = String.join("\n", referenceDataNotes);
        enforceAiRateLimit(orderId, identity, "AI_CS_QUERY", "INTERNAL_ORDER_SUMMARY", question);
        AiModelResult answer = completeWithModel(
                "你是牙科工厂客服查询助手。可以辅助客服理解内部订单摘要，但输出必须提示人工确认。",
                "订单号：" + context.orderNo()
                        + "\n产品类型：" + context.productType()
                        + "\n内部状态：" + context.internalStatus()
                        + "\n外部状态：" + context.externalStatus()
                        + "\n生产备注：" + nullToBlank(context.productionNote())
                        + "\n引用数据说明：\n" + referenceDataText
                        + "\n客服问题：" + question,
                () -> deterministic("客服查询草稿：订单"
                        + context.orderNo()
                        + "内部状态为"
                        + context.internalStatus()
                        + "，外部状态为"
                        + context.externalStatus()
                        + "。引用数据包括：" + String.join("；", referenceDataNotes)
                        + "。对外发送前需人工确认。"),
                orderId,
                identity,
                "AI_CS_QUERY",
                "INTERNAL_ORDER_SUMMARY",
                question);
        audit(orderId, identity, "AI_CS_QUERY", "INTERNAL_ORDER_SUMMARY", question, "SUCCESS", answer);
        return new CsQueryResult(answer.content(), referenceDataNotes);
    }

    @Transactional
    public String orderQuery(long orderId, String question, BootstrapIdentity identity) {
        accessControlService.requireDoctorOnly(identity, "AI-3 is doctor only");
        DoctorOrderAssistantReadModel readModel = orderProjectionQueryService.getAssistantReadModel(orderId, identity);
        boolean internalQuestion = asksForInternalData(question);
        String answer;
        String resultStatus;
        if (internalQuestion) {
            answer = "我只能回答公开进度、账单和物流信息。您的订单当前公开状态："
                    + readModel.externalStatus()
                    + publicSuffix(readModel)
                    + "。";
            resultStatus = "SAFE_REFUSAL";
            audit(orderId, identity, "AI_DOCTOR_ORDER_QUERY", "DOCTOR_ORDER_ASSISTANT_READ_MODEL", question,
                    resultStatus, deterministic(answer));
            return answer;
        } else {
            enforceAiRateLimit(orderId, identity, "AI_DOCTOR_ORDER_QUERY", "DOCTOR_ORDER_ASSISTANT_READ_MODEL", question);
            AiModelResult aiAnswer = completeWithModel(
                    "你是医生端订单助手。只能回答公开进度、账单、物流和医生可见消息；不得推测内部工序、员工、返工、工时或绩效。",
                    "公开状态：" + readModel.externalStatus()
                            + "\n公开信息：" + publicSuffix(readModel)
                            + "\n医生问题：" + question,
                    () -> deterministic("您的订单当前状态："
                            + readModel.externalStatus()
                            + publicSuffix(readModel)
                            + "。"),
                    orderId,
                    identity,
                    "AI_DOCTOR_ORDER_QUERY",
                    "DOCTOR_ORDER_ASSISTANT_READ_MODEL",
                    question);
            answer = aiAnswer.content();
            resultStatus = "SUCCESS";
            audit(orderId, identity, "AI_DOCTOR_ORDER_QUERY", "DOCTOR_ORDER_ASSISTANT_READ_MODEL", question,
                    resultStatus, aiAnswer);
            return answer;
        }
    }

    @Transactional
    public MissingInfoResponse checkMissing(long orderId, BootstrapIdentity identity) {
        accessControlService.requireAnyRole(identity, CHECK_MISSING_ROLES, "AI-4 is DOCTOR/CS/ADMIN only");
        OrderAiContext context = loadOrderContext(orderId, identity, "doctor cannot access this order");

        JsonNode formData = readFormData(context.formData());
        List<MissingInfoResponse.MissingItem> missingItems = requiredFields(context.productType()).stream()
                .filter(field -> isMissing(formData.get(field.fieldKey())))
                .map(field -> new MissingInfoResponse.MissingItem(
                        field.fieldKey(),
                        field.fieldLabel(),
                        "缺少" + field.fieldLabel() + "，请补充。"))
                .toList();
        audit(orderId, identity, "AI_CHECK_MISSING", "ORDER_FORM_REQUIRED_FIELDS", "check-missing:" + orderId,
                "SUCCESS", deterministic("missing-info-rule"));
        return new MissingInfoResponse(missingItems.isEmpty(), missingItems);
    }

    @Transactional
    public ProductionNoteDraftResult productionNote(long orderId, BootstrapIdentity identity) {
        accessControlService.requireAnyRole(identity, PRODUCTION_NOTE_ROLES, "AI-5 is CS/WORKER/ADMIN only");
        OrderAiContext context = loadOrderContext(orderId, identity, "identity cannot access this order");
        List<String> knowledgeContextNotes = buildProductionNoteKnowledgeContextNotes(context);
        enforceAiRateLimit(orderId, identity, "AI_PRODUCTION_NOTE", "PRODUCTION_NOTE_DRAFT",
                "production-note:" + orderId);
        AiModelResult draft = completeWithModel(
                "你是生产备注助手。只生成草稿，不写入订单字段，不下发生产指令。"
                        + "客户正式模板尚未确认，必须使用默认一期模板并提示人工确认。",
                "订单号：" + context.orderNo()
                        + "\n产品类型：" + context.productType()
                        + "\n表单数据：" + nullToBlank(context.formData())
                        + "\n已有生产备注：" + nullToBlank(context.productionNote())
                        + "\n模板版本：" + PRODUCTION_NOTE_TEMPLATE_VERSION
                        + "\n知识上下文：\n" + String.join("\n", knowledgeContextNotes)
                        + "\n请按默认模板输出：订单基础、医生/客户需求、生产关注点、资料/附件依据、待人工确认项。",
                () -> deterministic(defaultProductionNoteDraft(context, knowledgeContextNotes)),
                orderId,
                identity,
                "AI_PRODUCTION_NOTE",
                "PRODUCTION_NOTE_DRAFT",
                "production-note:" + orderId);
        audit(orderId, identity, "AI_PRODUCTION_NOTE", "PRODUCTION_NOTE_DRAFT", "production-note:" + orderId,
                "SUCCESS", draft);
        return new ProductionNoteDraftResult(
                draft.content(),
                PRODUCTION_NOTE_TEMPLATE_VERSION,
                knowledgeContextNotes,
                true);
    }

    @Transactional
    public ProductionNoteConfirmationResult confirmProductionNote(
            long orderId,
            String draftNote,
            String confirmationNote,
            BootstrapIdentity identity) {
        accessControlService.requireAnyRole(identity, PRODUCTION_NOTE_ROLES, "AI-5 confirmation is CS/WORKER/ADMIN only");
        OrderAiContext context = loadOrderContext(orderId, identity, "identity cannot access this order");
        String trimmedDraft = draftNote == null ? "" : draftNote.trim();
        if (trimmedDraft.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "draft_note is required");
        }
        String confirmedBlock = confirmedProductionNoteBlock(trimmedDraft, confirmationNote, identity);
        String existing = nullToBlank(context.productionNote()).trim();
        String updatedNote = existing.isBlank() ? confirmedBlock : existing + "\n\n" + confirmedBlock;
        jdbcClient.sql("""
                        UPDATE orders
                        SET production_note = :productionNote
                        WHERE order_id = :orderId
                        """)
                .param("productionNote", updatedNote)
                .param("orderId", orderId)
                .update();
        audit(orderId, identity, "AI_PRODUCTION_NOTE_CONFIRM", "PRODUCTION_NOTE_HUMAN_CONFIRMED",
                trimmedDraft, "SUCCESS", deterministic("production-note-human-confirmed"));
        return new ProductionNoteConfirmationResult(updatedNote, PRODUCTION_NOTE_TEMPLATE_VERSION, true);
    }

    @Transactional(readOnly = true)
    public AiGovernanceSummaryResponse governanceSummary(BootstrapIdentity identity) {
        accessControlService.requireAnyRole(identity, CS_AND_ADMIN, "AI governance summary is CS/ADMIN only");
        long dailyBudgetMicrousd = Math.max(0, properties.getDailyBudgetMicrousd());
        return jdbcClient.sql("""
                        SELECT
                            COALESCE(SUM(CASE WHEN result_status = 'SUCCESS' THEN 1 ELSE 0 END), 0) AS success_count,
                            COALESCE(SUM(CASE WHEN result_status = 'SAFE_REFUSAL' THEN 1 ELSE 0 END), 0) AS safe_refusal_count,
                            COALESCE(SUM(CASE WHEN result_status = :rateLimitStatus THEN 1 ELSE 0 END), 0) AS rate_limited_count,
                            COALESCE(SUM(CASE WHEN result_status = :modelFailureStatus THEN 1 ELSE 0 END), 0) AS model_failed_count,
                            COALESCE(SUM(CASE WHEN result_status = :budgetExceededStatus THEN 1 ELSE 0 END), 0) AS budget_alert_count,
                            COALESCE(SUM(estimated_cost_microusd), 0) AS estimated_cost_microusd,
                            MAX(CASE WHEN result_status = :modelFailureStatus THEN created_at ELSE NULL END) AS latest_model_failure_at,
                            MAX(CASE WHEN result_status = :budgetExceededStatus THEN created_at ELSE NULL END) AS latest_budget_alert_at
                        FROM ai_audit_log
                        WHERE created_at >= DATE_SUB(CURRENT_TIMESTAMP(3), INTERVAL 24 HOUR)
                        """)
                .param("rateLimitStatus", RATE_LIMIT_STATUS)
                .param("modelFailureStatus", MODEL_FAILURE_STATUS)
                .param("budgetExceededStatus", BUDGET_EXCEEDED_STATUS)
                .query((rs, rowNum) -> new AiGovernanceSummaryResponse(
                        24,
                        rs.getLong("success_count"),
                        rs.getLong("safe_refusal_count"),
                        rs.getLong("rate_limited_count"),
                        rs.getLong("model_failed_count"),
                        rs.getLong("estimated_cost_microusd"),
                        dailyBudgetMicrousd,
                        dailyBudgetMicrousd > 0 && rs.getLong("estimated_cost_microusd") >= dailyBudgetMicrousd,
                        rs.getLong("budget_alert_count"),
                        rs.getObject("latest_model_failure_at", LocalDateTime.class),
                        rs.getObject("latest_budget_alert_at", LocalDateTime.class)))
                .single();
    }

    @Transactional(readOnly = true)
    public AiGovernanceCostTrendResponse governanceCostTrend(BootstrapIdentity identity, int requestedDays) {
        accessControlService.requireAnyRole(identity, CS_AND_ADMIN, "AI governance cost trend is CS/ADMIN only");
        int days = Math.max(1, Math.min(31, requestedDays));
        List<AiGovernanceCostTrendResponse.Point> points = jdbcClient.sql("""
                        SELECT
                            cost_date,
                            COUNT(*) AS success_count,
                            COALESCE(SUM(estimated_cost_microusd), 0) AS estimated_cost_microusd,
                            COUNT(DISTINCT model_name) AS model_count
                        FROM (
                            SELECT
                                DATE_FORMAT(DATE(created_at), '%Y-%m-%d') AS cost_date,
                                model_name,
                                estimated_cost_microusd
                            FROM ai_audit_log
                            WHERE result_status = 'SUCCESS'
                              AND created_at >= DATE_SUB(CURRENT_DATE, INTERVAL :lookbackDays DAY)
                        ) daily_cost
                        GROUP BY cost_date
                        ORDER BY cost_date
                        """)
                .param("lookbackDays", days - 1)
                .query((rs, rowNum) -> new AiGovernanceCostTrendResponse.Point(
                        rs.getString("cost_date"),
                        rs.getLong("success_count"),
                        rs.getLong("estimated_cost_microusd"),
                        rs.getLong("model_count")))
                .list();
        long totalSuccessCount = points.stream()
                .mapToLong(AiGovernanceCostTrendResponse.Point::successCount)
                .sum();
        long totalEstimatedCostMicrousd = points.stream()
                .mapToLong(AiGovernanceCostTrendResponse.Point::estimatedCostMicrousd)
                .sum();
        return new AiGovernanceCostTrendResponse(days, points, totalSuccessCount, totalEstimatedCostMicrousd);
    }

    @Transactional(readOnly = true)
    public AiExternalAlertSummaryResponse externalAlertSummary(BootstrapIdentity identity) {
        accessControlService.requireAnyRole(identity, CS_AND_ADMIN, "AI external alert summary is CS/ADMIN only");
        List<AiExternalAlertSummaryResponse.StatusCount> statusCounts = jdbcClient.sql("""
                        SELECT send_status, COUNT(*) AS status_count
                        FROM ai_external_alert_outbox
                        GROUP BY send_status
                        ORDER BY send_status
                        """)
                .query((rs, rowNum) -> new AiExternalAlertSummaryResponse.StatusCount(
                        rs.getString("send_status"),
                        rs.getLong("status_count")))
                .list();
        AiExternalAlertSummaryResponse.Failure latestFailure = jdbcClient.sql("""
                        SELECT alert_id, alert_type, send_status, attempts, last_error, updated_at
                        FROM ai_external_alert_outbox
                        WHERE send_status IN (:failedStatus, :deadLetterStatus)
                        ORDER BY updated_at DESC, alert_id DESC
                        LIMIT 1
                        """)
                .param("failedStatus", EXTERNAL_ALERT_FAILED_STATUS)
                .param("deadLetterStatus", EXTERNAL_ALERT_DEAD_LETTER_STATUS)
                .query((rs, rowNum) -> new AiExternalAlertSummaryResponse.Failure(
                        rs.getLong("alert_id"),
                        rs.getString("alert_type"),
                        rs.getString("send_status"),
                        rs.getInt("attempts"),
                        sanitizeExternalAlertError(rs.getString("last_error")),
                        rs.getObject("updated_at", LocalDateTime.class)))
                .optional()
                .orElse(null);
        LocalDateTime oldestPendingCreatedAt = jdbcClient.sql("""
                        SELECT MIN(created_at)
                        FROM ai_external_alert_outbox
                        WHERE send_status = :pendingStatus
                        """)
                .param("pendingStatus", EXTERNAL_ALERT_PENDING_STATUS)
                .query(LocalDateTime.class)
                .optional()
                .orElse(null);
        return new AiExternalAlertSummaryResponse(
                statusCounts,
                countStatus(statusCounts, EXTERNAL_ALERT_PENDING_STATUS),
                countStatus(statusCounts, EXTERNAL_ALERT_SENDING_STATUS),
                countStatus(statusCounts, EXTERNAL_ALERT_SENT_STATUS),
                countStatus(statusCounts, EXTERNAL_ALERT_FAILED_STATUS),
                countStatus(statusCounts, EXTERNAL_ALERT_DEAD_LETTER_STATUS),
                latestFailure,
                oldestPendingCreatedAt);
    }

    @Transactional(readOnly = true)
    public AiExternalAlertListResponse externalAlerts(
            BootstrapIdentity identity,
            String sendStatus,
            String eventType,
            String createdAtFrom,
            String createdAtTo,
            int requestedLimit) {
        accessControlService.requireAnyRole(identity, CS_AND_ADMIN, "AI external alert list is CS/ADMIN only");
        int limit = Math.max(1, Math.min(100, requestedLimit));
        LocalDateTime from = parseNullableDateTime(createdAtFrom, "created_at_from");
        LocalDateTime to = parseNullableDateTime(createdAtTo, "created_at_to");
        String normalizedSendStatus = blankToNull(sendStatus);
        String normalizedEventType = blankToNull(eventType);
        List<AiExternalAlertListResponse.Record> records = jdbcClient.sql("""
                        SELECT alert_id, alert_type, send_status, attempts, last_error, created_at, updated_at
                        FROM ai_external_alert_outbox
                        WHERE (:sendStatus IS NULL OR send_status = :sendStatus)
                          AND (:eventType IS NULL OR alert_type = :eventType)
                          AND (:createdAtFrom IS NULL OR created_at >= :createdAtFrom)
                          AND (:createdAtTo IS NULL OR created_at <= :createdAtTo)
                        ORDER BY created_at DESC, alert_id DESC
                        LIMIT :limit
                        """)
                .param("sendStatus", normalizedSendStatus)
                .param("eventType", normalizedEventType)
                        .param("createdAtFrom", from)
                        .param("createdAtTo", to)
                        .param("limit", limit)
                .query((rs, rowNum) -> {
                    String rowSendStatus = rs.getString("send_status");
                    int attempts = rs.getInt("attempts");
                    LocalDateTime updatedAt = rs.getObject("updated_at", LocalDateTime.class);
                    return new AiExternalAlertListResponse.Record(
                            rs.getLong("alert_id"),
                            rs.getString("alert_type"),
                            rowSendStatus,
                            rs.getObject("created_at", LocalDateTime.class),
                            updatedAt,
                            attempts,
                            failedOrDeadLetter(rowSendStatus)
                                    ? sanitizeExternalAlertError(rs.getString("last_error"))
                                    : null,
                            attempts > 0 ? updatedAt : null);
                })
                .list();
        return new AiExternalAlertListResponse(limit, records);
    }

    private AiModelResult completeWithModel(
            String systemPrompt,
            String userPrompt,
            Supplier<AiModelResult> fallback,
            long orderId,
            BootstrapIdentity identity,
            String agentCode,
            String contextType,
            String auditPrompt) {
        if (!aiModelClient.isEnabled()) {
            return fallback.get();
        }
        if (roleBudgetCircuitBreakerOpen(identity.role())) {
            auditBudgetRoleCircuitOpen(orderId, identity, agentCode, contextType, auditPrompt);
            return fallback.get();
        }
        if (modelBudgetCircuitBreakerOpen()) {
            auditBudgetModelCircuitOpen(orderId, identity, agentCode, contextType, auditPrompt);
            return fallback.get();
        }
        if (budgetCircuitBreakerOpen()) {
            auditBudgetCircuitOpen(orderId, identity, agentCode, contextType, auditPrompt);
            return fallback.get();
        }
        RuntimeException lastFailure = null;
        int maxAttempts = Math.max(1, properties.getMaxModelRetries() + 1);
        for (int attempt = 1; attempt <= maxAttempts; attempt++) {
            try {
                AiModelResult result = aiModelClient.complete(systemPrompt, userPrompt);
                if (outputGuardTriggered(result.content())) {
                    auditOutputGuarded(orderId, identity, agentCode, contextType, auditPrompt, result);
                    return deterministic("AI 输出已触发安全保护，请人工复核后再使用。");
                }
                return result;
            } catch (RuntimeException ex) {
                lastFailure = ex;
                if (attempt == maxAttempts || !isRetryableModelFailure(ex)) {
                    auditModelFailure(orderId, identity, agentCode, contextType, auditPrompt);
                    throw new ResponseStatusException(
                            HttpStatus.SERVICE_UNAVAILABLE,
                            "AI model temporarily unavailable",
                            ex);
                }
            }
        }
        auditModelFailure(orderId, identity, agentCode, contextType, auditPrompt);
        throw new ResponseStatusException(
                HttpStatus.SERVICE_UNAVAILABLE,
                "AI model temporarily unavailable",
                lastFailure == null ? new IllegalStateException("AI model retry failed") : lastFailure);
    }

    private long countStatus(List<AiExternalAlertSummaryResponse.StatusCount> statusCounts, String sendStatus) {
        return statusCounts.stream()
                .filter(statusCount -> sendStatus.equals(statusCount.sendStatus()))
                .mapToLong(AiExternalAlertSummaryResponse.StatusCount::count)
                .findFirst()
                .orElse(0L);
    }

    private String sanitizeExternalAlertError(String error) {
        if (error == null || error.isBlank()) {
            return error;
        }
        String sanitized = error.replaceAll("(?i)(bearer\\s+)[^\\s]+", "$1[redacted]");
        sanitized = sanitized.replaceAll("(?i)sk-[a-z0-9._-]+", "[redacted-secret]");
        sanitized = sanitized.replaceAll("(?i)(token|secret|key|signature)=([^\\s&]+)", "$1=[redacted]");
        return sanitized.replaceAll("https?://\\S+", "[redacted-url]");
    }

    private boolean failedOrDeadLetter(String sendStatus) {
        return EXTERNAL_ALERT_FAILED_STATUS.equals(sendStatus)
                || EXTERNAL_ALERT_DEAD_LETTER_STATUS.equals(sendStatus);
    }

    private LocalDateTime parseNullableDateTime(String value, String fieldName) {
        String normalized = blankToNull(value);
        if (normalized == null) {
            return null;
        }
        try {
            return LocalDateTime.parse(normalized);
        } catch (DateTimeParseException ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, fieldName + " must be ISO-8601 local datetime");
        }
    }

    private String blankToNull(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
    }

    private void auditOutputGuarded(
            long orderId,
            BootstrapIdentity identity,
            String agentCode,
            String contextType,
            String prompt,
            AiModelResult modelResult) {
        aiGovernanceAuditTransaction.executeWithoutResult(status -> audit(
                orderId,
                identity,
                agentCode,
                contextType,
                prompt,
                OUTPUT_GUARD_STATUS,
                new AiModelResult(
                        "ai-output-guarded",
                        OUTPUT_GUARD_MODEL_NAME,
                        modelResult.inputTokenCount(),
                        modelResult.outputTokenCount())));
    }

    private void auditModelFailure(
            long orderId,
            BootstrapIdentity identity,
            String agentCode,
            String contextType,
            String prompt) {
        aiGovernanceAuditTransaction.executeWithoutResult(status -> audit(
                orderId,
                identity,
                agentCode,
                contextType,
                prompt,
                MODEL_FAILURE_STATUS,
                new AiModelResult("ai-model-failed", MODEL_FAILURE_MODEL_NAME, 0, null)));
    }

    private boolean budgetCircuitBreakerOpen() {
        long dailyBudgetMicrousd = Math.max(0, properties.getDailyBudgetMicrousd());
        if (!properties.isBudgetCircuitBreakerEnabled() || dailyBudgetMicrousd <= 0) {
            return false;
        }
        long currentWindowCost = currentSuccessCostMicrousd();
        return currentWindowCost >= dailyBudgetMicrousd;
    }

    private boolean roleBudgetCircuitBreakerOpen(UserRole role) {
        long roleBudgetMicrousd = Math.max(0, properties.dailyBudgetMicrousdForRole(role));
        if (!properties.isBudgetCircuitBreakerEnabled() || roleBudgetMicrousd <= 0) {
            return false;
        }
        return currentRoleSuccessCostMicrousd(role) >= roleBudgetMicrousd;
    }

    private boolean modelBudgetCircuitBreakerOpen() {
        String modelName = configuredModelName();
        long modelBudgetMicrousd = Math.max(0, properties.getDeepseek().getDailyBudgetMicrousd());
        if (!properties.isBudgetCircuitBreakerEnabled() || modelBudgetMicrousd <= 0 || modelName.isBlank()) {
            return false;
        }
        return currentModelSuccessCostMicrousd(modelName) >= modelBudgetMicrousd;
    }

    private void auditBudgetCircuitOpen(
            long orderId,
            BootstrapIdentity identity,
            String agentCode,
            String contextType,
            String prompt) {
        long currentWindowCost = currentSuccessCostMicrousd();
        long dailyBudgetMicrousd = Math.max(0, properties.getDailyBudgetMicrousd());
        aiGovernanceAuditTransaction.executeWithoutResult(status -> {
            audit(
                    orderId,
                    identity,
                    agentCode,
                    contextType,
                    prompt,
                    BUDGET_CIRCUIT_OPEN_STATUS,
                    new AiModelResult("ai-budget-circuit-open", BUDGET_CIRCUIT_OPEN_MODEL_NAME, 0, null));
            emitExternalAlertOutbox(
                    orderId,
                    BUDGET_CIRCUIT_OPEN_STATUS,
                    budgetCircuitOpenMessage(currentWindowCost, dailyBudgetMicrousd),
                    currentWindowCost,
                    dailyBudgetMicrousd);
        });
    }

    private void auditBudgetRoleCircuitOpen(
            long orderId,
            BootstrapIdentity identity,
            String agentCode,
            String contextType,
            String prompt) {
        String actorRole = identity.role().name();
        long currentWindowCost = currentRoleSuccessCostMicrousd(identity.role());
        long roleBudgetMicrousd = Math.max(0, properties.dailyBudgetMicrousdForRole(identity.role()));
        aiGovernanceAuditTransaction.executeWithoutResult(status -> {
            audit(
                    orderId,
                    identity,
                    agentCode,
                    contextType,
                    prompt,
                    BUDGET_ROLE_CIRCUIT_OPEN_STATUS,
                    new AiModelResult("ai-budget-role-circuit-open", BUDGET_ROLE_CIRCUIT_OPEN_MODEL_NAME, 0, null));
            emitExternalAlertOutbox(
                    orderId,
                    BUDGET_ROLE_CIRCUIT_OPEN_STATUS,
                    budgetRoleCircuitOpenMessage(actorRole, currentWindowCost, roleBudgetMicrousd),
                    currentWindowCost,
                    roleBudgetMicrousd,
                    actorRole);
        });
    }

    private void auditBudgetModelCircuitOpen(
            long orderId,
            BootstrapIdentity identity,
            String agentCode,
            String contextType,
            String prompt) {
        String modelName = configuredModelName();
        long currentWindowCost = currentModelSuccessCostMicrousd(modelName);
        long modelBudgetMicrousd = Math.max(0, properties.getDeepseek().getDailyBudgetMicrousd());
        aiGovernanceAuditTransaction.executeWithoutResult(status -> {
            audit(
                    orderId,
                    identity,
                    agentCode,
                    contextType,
                    prompt,
                    BUDGET_MODEL_CIRCUIT_OPEN_STATUS,
                    new AiModelResult("ai-budget-model-circuit-open", BUDGET_MODEL_CIRCUIT_OPEN_MODEL_NAME, 0, null));
            emitExternalAlertOutbox(
                    orderId,
                    BUDGET_MODEL_CIRCUIT_OPEN_STATUS,
                    budgetModelCircuitOpenMessage(modelName, currentWindowCost, modelBudgetMicrousd),
                    currentWindowCost,
                    modelBudgetMicrousd,
                    null,
                    modelName);
        });
    }

    private boolean isRetryableModelFailure(Throwable ex) {
        Throwable current = ex;
        while (current != null) {
            if (current instanceof HttpServerErrorException || current instanceof ResourceAccessException) {
                return true;
            }
            current = current.getCause();
        }
        return false;
    }

    private AiModelResult deterministic(String content) {
        return new AiModelResult(content, DETERMINISTIC_MODEL_NAME, estimateTokenCount(content), null);
    }

    private void enforceAiRateLimit(
            long orderId,
            BootstrapIdentity identity,
            String agentCode,
            String contextType,
            String prompt) {
        if (!aiModelClient.isEnabled() || properties.getMaxRequestsPerUserHour() <= 0) {
            return;
        }
        long usedRequests = jdbcClient.sql("""
                        SELECT COUNT(*)
                        FROM ai_audit_log
                        WHERE actor_user_id = :actorUserId
                          AND model_name <> :deterministicModel
                          AND result_status = 'SUCCESS'
                          AND created_at >= DATE_SUB(CURRENT_TIMESTAMP(3), INTERVAL 1 HOUR)
                        """)
                .param("actorUserId", identity.userId())
                .param("deterministicModel", DETERMINISTIC_MODEL_NAME)
                .query(Long.class)
                .single();
        if (usedRequests < properties.getMaxRequestsPerUserHour()) {
            return;
        }
        aiGovernanceAuditTransaction.executeWithoutResult(status -> audit(
                orderId,
                identity,
                agentCode,
                contextType,
                prompt,
                RATE_LIMIT_STATUS,
                new AiModelResult("ai-rate-limited", RATE_LIMIT_MODEL_NAME, 0, null)));
        throw new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS, "AI request rate limit exceeded");
    }

    private String nullToBlank(String value) {
        return value == null ? "" : value;
    }

    private OrderAiContext loadOrderContext(long orderId, BootstrapIdentity identity, String forbiddenMessage) {
        String dataScope = accessControlService.effectiveDataScope(identity);
        accessControlService.requireScopedIdentity(identity, dataScope);
        try {
            return jdbcClient.sql("""
                            SELECT order_id, order_no, clinic_id, doctor_user_id, product_type,
                                   form_data, internal_status, external_status, production_note
                            FROM orders
                            WHERE order_id = :orderId
                              AND (
                                  :dataScope = 'ALL'
                                  OR (:dataScope = 'CLINIC'
                                      AND (clinic_id = :clinicId OR doctor_user_id = :userId))
                                  OR (:dataScope = 'SELF'
                                      AND (
                                          doctor_user_id = :userId
                                          OR cs_user_id = :userId
                                          OR EXISTS (
                                              SELECT 1
                                              FROM order_process_instance scoped_i
                                              JOIN order_process_node scoped_n
                                                ON scoped_n.instance_id = scoped_i.instance_id
                                              WHERE scoped_i.order_id = orders.order_id
                                                AND scoped_n.assigned_user_id = :userId
                                          )
                                      ))
                              )
                            """)
                    .param("orderId", orderId)
                    .param("dataScope", dataScope)
                    .param("userId", identity.userId())
                    .param("clinicId", identity.clinicId())
                    .query((rs, rowNum) -> new OrderAiContext(
                            rs.getLong("order_id"),
                            rs.getString("order_no"),
                            rs.getLong("clinic_id"),
                            rs.getObject("doctor_user_id", Long.class),
                            rs.getString("product_type"),
                            rs.getString("form_data"),
                            rs.getString("internal_status"),
                            rs.getString("external_status"),
                            rs.getString("production_note")))
                    .single();
        } catch (EmptyResultDataAccessException ex) {
            if (orderExists(orderId)) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, forbiddenMessage, ex);
            }
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "order not found", ex);
        }
    }

    private List<String> buildCsReferenceDataNotes(OrderAiContext context) {
        List<String> notes = new ArrayList<>();
        notes.add("订单基础：orders.order_no、product_type、internal_status、external_status");
        notes.add("生产上下文：orders.internal_status 与 production_note，仅供客服内部理解，不自动写入生产备注");
        notes.add(messageReferenceNote(context.orderId()));
        notes.add(fileReferenceNote(context.orderId()));
        notes.add(billReferenceNote(context.orderId()));
        notes.add(logisticsReferenceNote(context.orderId()));
        return notes;
    }

    private List<String> buildProductionNoteKnowledgeContextNotes(OrderAiContext context) {
        List<String> notes = new ArrayList<>();
        notes.add("默认模板：PHASE_ONE_DEFAULT_V1；客户模板未确认，不能声明为真实客户模板");
        notes.add("订单基础：orders.order_no、product_type、external_status、internal_status");
        notes.add("表单数据：orders.form_data，用于整理医生/客户需求和资料完整性");
        notes.add("已有生产备注：orders.production_note，仅作为内部增量上下文，不覆盖历史备注");
        notes.add(messageReferenceNote(context.orderId()));
        notes.add(fileReferenceNote(context.orderId()));
        notes.add(billReferenceNote(context.orderId()));
        notes.add(logisticsReferenceNote(context.orderId()));
        notes.add("人工确认：草稿只可由 CS / WORKER / ADMIN 确认后写入生产备注");
        return notes;
    }

    private String defaultProductionNoteDraft(OrderAiContext context, List<String> knowledgeContextNotes) {
        return """
                AI-5 生产备注草稿（人工确认后保存）
                模板版本：%s（默认模板，客户模板未确认）
                1. 订单基础：订单号 %s，产品类型 %s。
                2. 医生/客户需求：请结合表单数据、公开沟通和附件补充材料、颜色、牙位、邻接、咬合等要求。
                3. 生产关注点：请生产人员复核资料完整性、设计稿版本、终检与返工风险。
                4. 知识上下文：%s。
                5. 待人工确认项：本草稿不会自行保存或外发，需确认后写入生产备注。
                """.formatted(
                PRODUCTION_NOTE_TEMPLATE_VERSION,
                context.orderNo(),
                context.productType(),
                String.join("；", knowledgeContextNotes));
    }

    private String confirmedProductionNoteBlock(String draftNote, String confirmationNote, BootstrapIdentity identity) {
        String note = confirmationNote == null || confirmationNote.isBlank()
                ? "未填写额外确认说明"
                : confirmationNote.trim();
        return """
                AI-5 生产备注（人工确认）
                模板版本：%s（默认模板，客户模板未确认）
                确认人：%s/%d
                确认时间：%s
                草稿内容：
                %s
                确认说明：%s
                """.formatted(
                PRODUCTION_NOTE_TEMPLATE_VERSION,
                identity.role(),
                identity.userId(),
                LocalDateTime.now(),
                draftNote,
                note);
    }

    private String messageReferenceNote(long orderId) {
        Long count = jdbcClient.sql("""
                        SELECT COUNT(*)
                        FROM order_message
                        WHERE order_id = :orderId
                        """)
                .param("orderId", orderId)
                .query(Long.class)
                .single();
        if (count == null || count == 0) {
            return "沟通消息：order_message 未找到当前订单消息";
        }
        List<String> samples = jdbcClient.sql("""
                        SELECT sender_role, visibility, review_status
                        FROM order_message
                        WHERE order_id = :orderId
                        ORDER BY created_at DESC, message_id DESC
                        LIMIT 3
                        """)
                .param("orderId", orderId)
                .query((rs, rowNum) -> rs.getString("sender_role")
                        + "/"
                        + rs.getString("visibility")
                        + "/"
                        + rs.getString("review_status"))
                .list();
        return "沟通消息：order_message 共 " + count + " 条，最近状态 " + String.join("、", samples);
    }

    private String fileReferenceNote(long orderId) {
        Long count = jdbcClient.sql("""
                        SELECT COUNT(*)
                        FROM file_resource
                        WHERE order_id = :orderId
                        """)
                .param("orderId", orderId)
                .query(Long.class)
                .single();
        if (count == null || count == 0) {
            return "附件：file_resource 未找到当前订单附件";
        }
        List<String> samples = jdbcClient.sql("""
                        SELECT source_type, visibility, status
                        FROM file_resource
                        WHERE order_id = :orderId
                        ORDER BY created_at DESC, file_id DESC
                        LIMIT 3
                        """)
                .param("orderId", orderId)
                .query((rs, rowNum) -> rs.getString("source_type")
                        + "/"
                        + rs.getString("visibility")
                        + "/"
                        + rs.getString("status"))
                .list();
        return "附件：file_resource 共 " + count + " 个，最近类型 " + String.join("、", samples);
    }

    private String billReferenceNote(long orderId) {
        return jdbcClient.sql("""
                        SELECT bill_status, payment_status, amount_cent, currency
                        FROM order_bill
                        WHERE order_id = :orderId
                        """)
                .param("orderId", orderId)
                .query((rs, rowNum) -> {
                    Long amountCent = rs.getObject("amount_cent", Long.class);
                    String amountText = amountCent == null ? "" : amountCent.toString();
                    return "账单：order_bill 状态 "
                            + rs.getString("bill_status")
                            + "，付款状态 "
                            + rs.getString("payment_status")
                            + "，金额 "
                            + amountText
                            + " "
                            + nullToBlank(rs.getString("currency"));
                })
                .optional()
                .orElse("账单：order_bill 未找到当前订单账单");
    }

    private String logisticsReferenceNote(long orderId) {
        return jdbcClient.sql("""
                        SELECT carrier_name, tracking_no, logistics_status
                        FROM order_logistics
                        WHERE order_id = :orderId
                        """)
                .param("orderId", orderId)
                .query((rs, rowNum) -> "物流：order_logistics 状态 "
                        + rs.getString("logistics_status")
                        + "，承运商 "
                        + nullToBlank(rs.getString("carrier_name"))
                        + "，单号 "
                        + nullToBlank(rs.getString("tracking_no")))
                .optional()
                .orElse("物流：order_logistics 未找到当前订单物流");
    }

    private boolean orderExists(long orderId) {
        return jdbcClient.sql("SELECT COUNT(*) FROM orders WHERE order_id = :orderId")
                .param("orderId", orderId)
                .query(Long.class)
                .single() > 0;
    }

    private List<RequiredField> requiredFields(String productType) {
        return jdbcClient.sql("""
                        SELECT field_key, field_label
                        FROM form_field_config
                        WHERE product_type = :productType
                          AND required_flag = 1
                          AND status = 'ACTIVE'
                        ORDER BY sort_order, field_id
                        """)
                .param("productType", productType)
                .query((rs, rowNum) -> new RequiredField(
                        rs.getString("field_key"),
                        rs.getString("field_label")))
                .list();
    }

    private JsonNode readFormData(String formData) {
        if (formData == null || formData.isBlank()) {
            return objectMapper.createObjectNode();
        }
        try {
            return objectMapper.readTree(formData);
        } catch (JsonProcessingException ex) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "invalid stored order json", ex);
        }
    }

    private boolean isMissing(JsonNode node) {
        if (node == null || node.isNull()) {
            return true;
        }
        if (node.isTextual()) {
            return node.asText().isBlank();
        }
        if (node.isArray() || node.isObject()) {
            return node.isEmpty();
        }
        return false;
    }

    private boolean asksForInternalData(String question) {
        String normalized = question == null ? "" : question.toLowerCase(Locale.ROOT);
        return DOCTOR_INTERNAL_KEYWORDS.stream().anyMatch(normalized::contains);
    }

    private boolean outputGuardTriggered(String content) {
        if (content == null || content.isBlank()) {
            return false;
        }
        String normalized = content.toLowerCase(Locale.ROOT);
        return OUTPUT_GUARD_PATTERNS.stream().anyMatch(normalized::contains);
    }

    private String publicSuffix(DoctorOrderAssistantReadModel readModel) {
        List<String> parts = new ArrayList<>();
        if (readModel.publicMessage() != null && !readModel.publicMessage().isBlank()) {
            parts.add(readModel.publicMessage());
        }
        if (readModel.visibleMessageSummary() != null && !readModel.visibleMessageSummary().isBlank()) {
            parts.add(readModel.visibleMessageSummary());
        }
        if (readModel.billStatus() != null && !readModel.billStatus().isBlank()) {
            parts.add("账单状态：" + readModel.billStatus());
        }
        if (readModel.logisticsStatus() != null && !readModel.logisticsStatus().isBlank()) {
            parts.add("物流状态：" + readModel.logisticsStatus());
        }
        if (readModel.trackingNo() != null && !readModel.trackingNo().isBlank()) {
            parts.add("物流单号：" + readModel.trackingNo());
        }
        return parts.isEmpty() ? "" : "。" + String.join("。", parts);
    }

    private void audit(
            long orderId,
            BootstrapIdentity identity,
            String agentCode,
            String contextType,
            String prompt,
            String resultStatus,
            AiModelResult modelResult) {
        long estimatedCostMicrousd = estimatedCostMicrousd(modelResult);
        jdbcClient.sql("""
                        INSERT INTO ai_audit_log
                            (order_id, actor_user_id, actor_role, agent_code, request_context_type,
                             prompt_version, prompt_hash, model_name, input_token_count, output_token_count,
                             estimated_cost_microusd, result_status)
                        VALUES
                            (:orderId, :actorUserId, :actorRole, :agentCode, :contextType,
                             :promptVersion, :promptHash, :modelName, :inputTokenCount, :outputTokenCount,
                             :estimatedCostMicrousd, :resultStatus)
                        """)
                .param("orderId", orderId)
                .param("actorUserId", identity.userId())
                .param("actorRole", identity.role().name())
                .param("agentCode", agentCode)
                .param("contextType", contextType)
                .param("promptVersion", promptVersionFor(agentCode))
                .param("promptHash", sha256(prompt))
                .param("modelName", modelResult.modelName())
                .param("inputTokenCount", modelResult.inputTokenCount())
                .param("outputTokenCount", modelResult.outputTokenCount())
                .param("estimatedCostMicrousd", estimatedCostMicrousd)
                .param("resultStatus", resultStatus)
                .update();
        auditBudgetExceededIfCrossed(orderId, identity, agentCode, contextType, prompt, resultStatus, modelResult,
                estimatedCostMicrousd);
    }

    private String promptVersionFor(String agentCode) {
        return switch (agentCode) {
            case "AI_TRANSLATE" -> "AI_TRANSLATE_V1";
            case "AI_CS_QUERY" -> "AI_CS_QUERY_V1";
            case "AI_DOCTOR_ORDER_QUERY" -> "AI_DOCTOR_ORDER_QUERY_V1";
            case "AI_CHECK_MISSING" -> "AI_CHECK_MISSING_V1";
            case "AI_PRODUCTION_NOTE" -> "AI_PRODUCTION_NOTE_V1";
            default -> agentCode + "_V1";
        };
    }

    private void auditBudgetExceededIfCrossed(
            long orderId,
            BootstrapIdentity identity,
            String agentCode,
            String contextType,
            String prompt,
            String resultStatus,
            AiModelResult modelResult,
            long estimatedCostMicrousd) {
        long dailyBudgetMicrousd = Math.max(0, properties.getDailyBudgetMicrousd());
        if (dailyBudgetMicrousd <= 0
                || estimatedCostMicrousd <= 0
                || !"SUCCESS".equals(resultStatus)
                || DETERMINISTIC_MODEL_NAME.equals(modelResult.modelName())) {
            return;
        }
        long currentWindowCost = currentSuccessCostMicrousd();
        long previousWindowCost = Math.max(0, currentWindowCost - estimatedCostMicrousd);
        if (previousWindowCost >= dailyBudgetMicrousd || currentWindowCost < dailyBudgetMicrousd) {
            return;
        }
        audit(
                orderId,
                identity,
                agentCode,
                contextType,
                prompt,
                BUDGET_EXCEEDED_STATUS,
                new AiModelResult("ai-budget-exceeded", BUDGET_EXCEEDED_MODEL_NAME, 0, null));
        emitExternalAlertOutbox(
                orderId,
                BUDGET_EXCEEDED_STATUS,
                budgetExceededMessage(currentWindowCost, dailyBudgetMicrousd),
                currentWindowCost,
                dailyBudgetMicrousd);
        if (properties.isBudgetNotificationEnabled()) {
            emitBudgetExceededNotification(orderId, currentWindowCost, dailyBudgetMicrousd);
        }
    }

    private void emitBudgetExceededNotification(long orderId, long currentWindowCost, long dailyBudgetMicrousd) {
        String orderNo = loadOrderNo(orderId);
        String message = budgetExceededMessage(currentWindowCost, dailyBudgetMicrousd);
        String payload = budgetNotificationPayload(orderId, orderNo, message, currentWindowCost, dailyBudgetMicrousd);
        jdbcClient.sql("""
                        INSERT INTO notification_event
                            (order_id, event_type, audience_role, payload, delivery_status)
                        VALUES
                            (:orderId, :eventType, 'INTERNAL', CAST(:payload AS JSON), 'PENDING')
                        """)
                .param("orderId", orderId)
                .param("eventType", BUDGET_EXCEEDED_STATUS)
                .param("payload", payload)
                .update();
        long eventId = jdbcClient.sql("SELECT LAST_INSERT_ID()").query(Long.class).single();
        List<Long> userIds = jdbcClient.sql("""
                        SELECT DISTINCT u.user_id
                        FROM system_user u
                        JOIN system_user_role ur ON ur.user_id = u.user_id
                        JOIN system_role r ON r.role_id = ur.role_id
                        WHERE u.status = 'ACTIVE'
                          AND r.status = 'ACTIVE'
                          AND r.role_code IN ('ADMIN', 'CS')
                        """)
                .query(Long.class)
                .list();
        for (Long userId : userIds) {
            jdbcClient.sql("""
                            INSERT IGNORE INTO user_notification (event_id, user_id)
                            VALUES (:eventId, :userId)
                            """)
                    .param("eventId", eventId)
                    .param("userId", userId)
                    .update();
            notificationPushService.pushToUser(userId, eventId, payload);
        }
    }

    private void emitExternalAlertOutbox(
            long orderId,
            String alertType,
            String message,
            long currentWindowCost,
            long dailyBudgetMicrousd) {
        emitExternalAlertOutbox(orderId, alertType, message, currentWindowCost, dailyBudgetMicrousd, null);
    }

    private void emitExternalAlertOutbox(
            long orderId,
            String alertType,
            String message,
            long currentWindowCost,
            long dailyBudgetMicrousd,
            String actorRole) {
        emitExternalAlertOutbox(orderId, alertType, message, currentWindowCost, dailyBudgetMicrousd, actorRole, null);
    }

    private void emitExternalAlertOutbox(
            long orderId,
            String alertType,
            String message,
            long currentWindowCost,
            long dailyBudgetMicrousd,
            String actorRole,
            String modelName) {
        String orderNo = loadOrderNo(orderId);
        String payload = externalAlertPayload(orderId, orderNo, alertType, actorRole, modelName, message, currentWindowCost,
                dailyBudgetMicrousd);
        jdbcClient.sql("""
                        INSERT INTO ai_external_alert_outbox
                            (order_id, alert_type, channel, payload, send_status, attempts)
                        VALUES
                            (:orderId, :alertType, :channel, CAST(:payload AS JSON), :sendStatus, 0)
                        """)
                .param("orderId", orderId)
                .param("alertType", alertType)
                .param("channel", EXTERNAL_ALERT_CHANNEL)
                .param("payload", payload)
                .param("sendStatus", EXTERNAL_ALERT_PENDING_STATUS)
                .update();
    }

    private long currentSuccessCostMicrousd() {
        return jdbcClient.sql("""
                        SELECT COALESCE(SUM(estimated_cost_microusd), 0)
                        FROM ai_audit_log
                        WHERE result_status = 'SUCCESS'
                          AND created_at >= DATE_SUB(CURRENT_TIMESTAMP(3), INTERVAL 24 HOUR)
                        """)
                .query(Long.class)
                .single();
    }

    private long currentRoleSuccessCostMicrousd(UserRole role) {
        if (role == null) {
            return 0;
        }
        return jdbcClient.sql("""
                        SELECT COALESCE(SUM(estimated_cost_microusd), 0)
                        FROM ai_audit_log
                        WHERE actor_role = :actorRole
                          AND result_status = 'SUCCESS'
                          AND created_at >= DATE_SUB(CURRENT_TIMESTAMP(3), INTERVAL 24 HOUR)
                        """)
                .param("actorRole", role.name())
                .query(Long.class)
                .single();
    }

    private long currentModelSuccessCostMicrousd(String modelName) {
        if (modelName == null || modelName.isBlank()) {
            return 0;
        }
        return jdbcClient.sql("""
                        SELECT COALESCE(SUM(estimated_cost_microusd), 0)
                        FROM ai_audit_log
                        WHERE model_name = :modelName
                          AND result_status = 'SUCCESS'
                          AND created_at >= DATE_SUB(CURRENT_TIMESTAMP(3), INTERVAL 24 HOUR)
                        """)
                .param("modelName", modelName)
                .query(Long.class)
                .single();
    }

    private String loadOrderNo(long orderId) {
        return jdbcClient.sql("SELECT order_no FROM orders WHERE order_id = :orderId")
                .param("orderId", orderId)
                .query(String.class)
                .single();
    }

    private String budgetExceededMessage(long currentWindowCost, long dailyBudgetMicrousd) {
        return "AI 预算已达到阈值：近 24 小时估算成本 "
                + currentWindowCost
                + " microUSD，阈值 "
                + dailyBudgetMicrousd
                + " microUSD。";
    }

    private String budgetCircuitOpenMessage(long currentWindowCost, long dailyBudgetMicrousd) {
        return "AI 预算熔断已命中：近 24 小时估算成本 "
                + currentWindowCost
                + " microUSD，阈值 "
                + dailyBudgetMicrousd
                + " microUSD。";
    }

    private String budgetRoleCircuitOpenMessage(String actorRole, long currentWindowCost, long roleBudgetMicrousd) {
        return "AI 角色预算熔断已命中：角色 "
                + actorRole
                + " 近 24 小时估算成本 "
                + currentWindowCost
                + " microUSD，角色阈值 "
                + roleBudgetMicrousd
                + " microUSD。";
    }

    private String budgetModelCircuitOpenMessage(String modelName, long currentWindowCost, long modelBudgetMicrousd) {
        return "AI 模型预算熔断已命中：模型 "
                + modelName
                + " 近 24 小时估算成本 "
                + currentWindowCost
                + " microUSD，模型阈值 "
                + modelBudgetMicrousd
                + " microUSD。";
    }

    private String budgetNotificationPayload(
            long orderId,
            String orderNo,
            String message,
            long currentWindowCost,
            long dailyBudgetMicrousd) {
        try {
            return objectMapper.writeValueAsString(new AiBudgetNotificationPayload(
                    BUDGET_EXCEEDED_STATUS,
                    orderId,
                    orderNo,
                    message,
                    currentWindowCost,
                    dailyBudgetMicrousd));
        } catch (JsonProcessingException ex) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "invalid AI budget payload", ex);
        }
    }

    private String externalAlertPayload(
            long orderId,
            String orderNo,
            String event,
            String role,
            String model,
            String message,
            long currentWindowCost,
            long dailyBudgetMicrousd) {
        try {
            return objectMapper.writeValueAsString(new AiExternalAlertPayload(
                    event,
                    role,
                    model,
                    orderId,
                    orderNo,
                    message,
                    currentWindowCost,
                    dailyBudgetMicrousd));
        } catch (JsonProcessingException ex) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "invalid AI external alert payload", ex);
        }
    }

    private String configuredModelName() {
        String modelName = properties.getDeepseek().getModel();
        return modelName == null ? "" : modelName.trim();
    }

    private long estimatedCostMicrousd(AiModelResult modelResult) {
        long inputCost = Math.max(0, properties.getInputTokenCostMicrousd());
        long outputCost = Math.max(0, properties.getOutputTokenCostMicrousd());
        long outputTokens = modelResult.outputTokenCount() == null ? 0 : modelResult.outputTokenCount();
        return modelResult.inputTokenCount() * inputCost + outputTokens * outputCost;
    }

    private String sha256(String value) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hashed = digest.digest((value == null ? "" : value).getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hashed);
        } catch (NoSuchAlgorithmException ex) {
            throw new IllegalStateException("SHA-256 unavailable", ex);
        }
    }

    private int estimateTokenCount(String value) {
        if (value == null || value.isBlank()) {
            return 0;
        }
        return Math.max(1, value.trim().length() / 2);
    }

    public record CsQueryResult(String answer, List<String> referenceDataNotes) {
    }

    public record ProductionNoteDraftResult(
            String draftNote,
            String templateVersion,
            List<String> knowledgeContextNotes,
            boolean requiresCustomerTemplateConfirmation) {
    }

    public record ProductionNoteConfirmationResult(
            String productionNote,
            String templateVersion,
            boolean requiresCustomerTemplateConfirmation) {
    }

    private record OrderAiContext(
            long orderId,
            String orderNo,
            long clinicId,
            Long doctorUserId,
            String productType,
            String formData,
            String internalStatus,
            String externalStatus,
            String productionNote) {
    }

    private record RequiredField(String fieldKey, String fieldLabel) {
    }

    private record AiBudgetNotificationPayload(
            String event,
            long orderId,
            String orderNo,
            String message,
            long estimatedCostMicrousd,
            long dailyBudgetMicrousd) {
    }

    private record AiExternalAlertPayload(
            String event,
            String role,
            String model,
            long orderId,
            String orderNo,
            String message,
            long estimatedCostMicrousd,
            long dailyBudgetMicrousd) {
    }
}
