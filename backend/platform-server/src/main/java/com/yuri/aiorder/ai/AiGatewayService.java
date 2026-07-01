package com.yuri.aiorder.ai;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.yuri.aiorder.common.BootstrapIdentity;
import com.yuri.aiorder.common.UserRole;
import com.yuri.aiorder.common.auth.AccessControlService;
import com.yuri.aiorder.order.api.DoctorOrderAssistantReadModel;
import com.yuri.aiorder.order.api.OrderProjectionQueryService;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;
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
    private static final String RATE_LIMIT_MODEL_NAME = "ai-governance-rate-limit";
    private static final String RATE_LIMIT_STATUS = "AI_RATE_LIMITED";
    private static final String MODEL_FAILURE_MODEL_NAME = "ai-governance-model-failure";
    private static final String MODEL_FAILURE_STATUS = "AI_MODEL_FAILED";
    private static final String BUDGET_EXCEEDED_MODEL_NAME = "ai-governance-budget-exceeded";
    private static final String BUDGET_EXCEEDED_STATUS = "AI_BUDGET_EXCEEDED";
    private static final Set<UserRole> CS_AND_ADMIN = EnumSet.of(UserRole.CS, UserRole.ADMIN);
    private static final Set<UserRole> CHECK_MISSING_ROLES = EnumSet.of(UserRole.DOCTOR, UserRole.CS, UserRole.ADMIN);
    private static final Set<UserRole> PRODUCTION_NOTE_ROLES = EnumSet.of(UserRole.CS, UserRole.WORKER, UserRole.ADMIN);
    private static final List<String> DOCTOR_INTERNAL_KEYWORDS = List.of(
            "工序", "员工", "技工", "谁在做", "返工", "工时", "绩效", "入检", "出检",
            "责任", "internal", "process", "work_log", "rework", "performance", "assigned");

    private final JdbcClient jdbcClient;
    private final ObjectMapper objectMapper;
    private final OrderProjectionQueryService orderProjectionQueryService;
    private final AccessControlService accessControlService;
    private final AiModelClient aiModelClient;
    private final AiGatewayProperties properties;
    private final TransactionTemplate aiGovernanceAuditTransaction;

    public AiGatewayService(
            JdbcClient jdbcClient,
            ObjectMapper objectMapper,
            OrderProjectionQueryService orderProjectionQueryService,
            AccessControlService accessControlService,
            AiModelClient aiModelClient,
            AiGatewayProperties properties,
            PlatformTransactionManager transactionManager) {
        this.jdbcClient = jdbcClient;
        this.objectMapper = objectMapper;
        this.orderProjectionQueryService = orderProjectionQueryService;
        this.accessControlService = accessControlService;
        this.aiModelClient = aiModelClient;
        this.properties = properties;
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
    public String csQuery(long orderId, String question, BootstrapIdentity identity) {
        accessControlService.requireAnyRole(identity, CS_AND_ADMIN, "AI-2 is CS/ADMIN only");
        OrderAiContext context = loadOrderContext(orderId, identity, "identity cannot access this order");
        enforceAiRateLimit(orderId, identity, "AI_CS_QUERY", "INTERNAL_ORDER_SUMMARY", question);
        AiModelResult answer = completeWithModel(
                "你是牙科工厂客服查询助手。可以辅助客服理解内部订单摘要，但输出必须提示人工确认。",
                "订单号：" + context.orderNo()
                        + "\n产品类型：" + context.productType()
                        + "\n内部状态：" + context.internalStatus()
                        + "\n外部状态：" + context.externalStatus()
                        + "\n生产备注：" + nullToBlank(context.productionNote())
                        + "\n客服问题：" + question,
                () -> deterministic("客服查询草稿：订单"
                        + context.orderNo()
                        + "内部状态为"
                        + context.internalStatus()
                        + "，外部状态为"
                        + context.externalStatus()
                        + "。对外发送前需人工确认。"),
                orderId,
                identity,
                "AI_CS_QUERY",
                "INTERNAL_ORDER_SUMMARY",
                question);
        audit(orderId, identity, "AI_CS_QUERY", "INTERNAL_ORDER_SUMMARY", question, "SUCCESS", answer);
        return answer.content();
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
    public String productionNote(long orderId, BootstrapIdentity identity) {
        accessControlService.requireAnyRole(identity, PRODUCTION_NOTE_ROLES, "AI-5 is CS/WORKER/ADMIN only");
        OrderAiContext context = loadOrderContext(orderId, identity, "identity cannot access this order");
        enforceAiRateLimit(orderId, identity, "AI_PRODUCTION_NOTE", "PRODUCTION_NOTE_DRAFT",
                "production-note:" + orderId);
        AiModelResult draft = completeWithModel(
                "你是生产备注助手。只生成草稿，不写入订单字段，不自动下发生产指令。",
                "订单号：" + context.orderNo()
                        + "\n产品类型：" + context.productType()
                        + "\n表单数据：" + nullToBlank(context.formData())
                        + "\n已有生产备注：" + nullToBlank(context.productionNote()),
                () -> deterministic("生产备注草稿（人工确认后保存）：产品类型="
                        + context.productType()
                        + "；订单号="
                        + context.orderNo()
                        + "；请按客户确认信息、设计要求和工厂规范补全。"),
                orderId,
                identity,
                "AI_PRODUCTION_NOTE",
                "PRODUCTION_NOTE_DRAFT",
                "production-note:" + orderId);
        audit(orderId, identity, "AI_PRODUCTION_NOTE", "PRODUCTION_NOTE_DRAFT", "production-note:" + orderId,
                "SUCCESS", draft);
        return draft.content();
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
        RuntimeException lastFailure = null;
        int maxAttempts = Math.max(1, properties.getMaxModelRetries() + 1);
        for (int attempt = 1; attempt <= maxAttempts; attempt++) {
            try {
                return aiModelClient.complete(systemPrompt, userPrompt);
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
                            (order_id, actor_user_id, agent_code, request_context_type,
                             prompt_hash, model_name, input_token_count, output_token_count,
                             estimated_cost_microusd, result_status)
                        VALUES
                            (:orderId, :actorUserId, :agentCode, :contextType,
                             :promptHash, :modelName, :inputTokenCount, :outputTokenCount,
                             :estimatedCostMicrousd, :resultStatus)
                        """)
                .param("orderId", orderId)
                .param("actorUserId", identity.userId())
                .param("agentCode", agentCode)
                .param("contextType", contextType)
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
        long currentWindowCost = jdbcClient.sql("""
                        SELECT COALESCE(SUM(estimated_cost_microusd), 0)
                        FROM ai_audit_log
                        WHERE result_status = 'SUCCESS'
                          AND created_at >= DATE_SUB(CURRENT_TIMESTAMP(3), INTERVAL 24 HOUR)
                        """)
                .query(Long.class)
                .single();
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
}
