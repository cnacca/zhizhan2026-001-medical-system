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
import java.util.ArrayList;
import java.util.EnumSet;
import java.util.HexFormat;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AiGatewayService {

    private static final String MODEL_NAME = "deterministic-placeholder";
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

    public AiGatewayService(
            JdbcClient jdbcClient,
            ObjectMapper objectMapper,
            OrderProjectionQueryService orderProjectionQueryService,
            AccessControlService accessControlService) {
        this.jdbcClient = jdbcClient;
        this.objectMapper = objectMapper;
        this.orderProjectionQueryService = orderProjectionQueryService;
        this.accessControlService = accessControlService;
    }

    @Transactional
    public String translate(long orderId, String sourceText, BootstrapIdentity identity) {
        accessControlService.requireAnyRole(identity, CS_AND_ADMIN, "AI-1 is CS/ADMIN only");
        OrderAiContext context = loadOrderContext(orderId, identity, "identity cannot access this order");
        String answer = "翻译草稿（需客服确认后才可写入订单）："
                + sourceText.trim()
                + "。订单号："
                + context.orderNo()
                + "。";
        audit(orderId, identity, "AI_TRANSLATE", "ORDER_TRANSLATION_DRAFT", sourceText, "SUCCESS");
        return answer;
    }

    @Transactional
    public String csQuery(long orderId, String question, BootstrapIdentity identity) {
        accessControlService.requireAnyRole(identity, CS_AND_ADMIN, "AI-2 is CS/ADMIN only");
        OrderAiContext context = loadOrderContext(orderId, identity, "identity cannot access this order");
        String answer = "客服查询草稿：订单"
                + context.orderNo()
                + "内部状态为"
                + context.internalStatus()
                + "，外部状态为"
                + context.externalStatus()
                + "。对外发送前需人工确认。";
        audit(orderId, identity, "AI_CS_QUERY", "INTERNAL_ORDER_SUMMARY", question, "SUCCESS");
        return answer;
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
        } else {
            answer = "您的订单当前状态："
                    + readModel.externalStatus()
                    + publicSuffix(readModel)
                    + "。";
            resultStatus = "SUCCESS";
        }
        audit(orderId, identity, "AI_DOCTOR_ORDER_QUERY", "DOCTOR_ORDER_ASSISTANT_READ_MODEL", question, resultStatus);
        return answer;
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
        audit(orderId, identity, "AI_CHECK_MISSING", "ORDER_FORM_REQUIRED_FIELDS", "check-missing:" + orderId, "SUCCESS");
        return new MissingInfoResponse(missingItems.isEmpty(), missingItems);
    }

    @Transactional
    public String productionNote(long orderId, BootstrapIdentity identity) {
        accessControlService.requireAnyRole(identity, PRODUCTION_NOTE_ROLES, "AI-5 is CS/WORKER/ADMIN only");
        OrderAiContext context = loadOrderContext(orderId, identity, "identity cannot access this order");
        String draft = "生产备注草稿（人工确认后保存）：产品类型="
                + context.productType()
                + "；订单号="
                + context.orderNo()
                + "；请按客户确认信息、设计要求和工厂规范补全。";
        audit(orderId, identity, "AI_PRODUCTION_NOTE", "PRODUCTION_NOTE_DRAFT", "production-note:" + orderId, "SUCCESS");
        return draft;
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
            String resultStatus) {
        jdbcClient.sql("""
                        INSERT INTO ai_audit_log
                            (order_id, actor_user_id, agent_code, request_context_type,
                             prompt_hash, model_name, input_token_count, output_token_count, result_status)
                        VALUES
                            (:orderId, :actorUserId, :agentCode, :contextType,
                             :promptHash, :modelName, :inputTokenCount, NULL, :resultStatus)
                        """)
                .param("orderId", orderId)
                .param("actorUserId", identity.userId())
                .param("agentCode", agentCode)
                .param("contextType", contextType)
                .param("promptHash", sha256(prompt))
                .param("modelName", MODEL_NAME)
                .param("inputTokenCount", estimateTokenCount(prompt))
                .param("resultStatus", resultStatus)
                .update();
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
