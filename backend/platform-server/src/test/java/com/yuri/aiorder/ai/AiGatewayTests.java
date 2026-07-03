package com.yuri.aiorder.ai;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.hasItem;
import static org.hamcrest.Matchers.not;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest(properties = "app.ai.daily-budget-microusd=100")
@AutoConfigureMockMvc
class AiGatewayTests {

    private static final long DOCTOR_USER_ID = 9901L;
    private static final long CS_USER_ID = 9902L;
    private static final long WORKER_USER_ID = 9903L;
    private static final long OTHER_DOCTOR_USER_ID = 9904L;

    @Autowired
    private JdbcClient jdbcClient;

    @Autowired
    private MockMvc mockMvc;

    private long clinicId;
    private long orderId;
    private String productType;

    @BeforeEach
    void setUp() {
        String suffix = UUID.randomUUID().toString().replace("-", "");
        productType = "AI_TEST_" + suffix.substring(0, 12);
        jdbcClient.sql("INSERT INTO clinic (clinic_name) VALUES (:clinicName)")
                .param("clinicName", "AI测试诊所-" + suffix)
                .update();
        clinicId = jdbcClient.sql("SELECT LAST_INSERT_ID()").query(Long.class).single();

        jdbcClient.sql("""
                        INSERT INTO orders
                            (order_no, clinic_id, doctor_user_id, cs_user_id, product_type,
                             form_data, internal_status, external_status, production_note)
                        VALUES
                            (:orderNo, :clinicId, :doctorUserId, :csUserId, :productType,
                             JSON_OBJECT('patient_name', '李四', 'tooth_position', '11'),
                             'IN_PRODUCTION', 'PRODUCING', '内部工序备注：车瓷由7700处理')
                        """)
                .param("orderNo", "AI" + suffix.substring(0, 12))
                .param("clinicId", clinicId)
                .param("doctorUserId", DOCTOR_USER_ID)
                .param("csUserId", CS_USER_ID)
                .param("productType", productType)
                .update();
        orderId = jdbcClient.sql("SELECT LAST_INSERT_ID()").query(Long.class).single();
        assignWorkerToOrder(suffix);

        jdbcClient.sql("""
                        INSERT INTO order_external_projection
                            (order_id, external_status, public_message)
                        VALUES
                            (:orderId, 'PRODUCING', '订单正在制作中，请等待客服通知。')
                        """)
                .param("orderId", orderId)
                .update();

        jdbcClient.sql("""
                        INSERT INTO order_message
                            (order_id, sender_user_id, sender_role, content, visibility, review_status)
                        VALUES
                            (:orderId, :csUserId, 'CS', '公开消息：预计明天发货。', 'DOCTOR_CS', 'APPROVED'),
                            (:orderId, :workerUserId, 'WORKER', '内部返工责任记录', 'INTERNAL', 'DIRECT')
                        """)
                .param("orderId", orderId)
                .param("csUserId", CS_USER_ID)
                .param("workerUserId", WORKER_USER_ID)
                .update();
    }

    @Test
    void allFiveAgentsReturnDraftOnlyResultsAndWriteAuditRows() throws Exception {
        mockMvc.perform(post("/ai/translate")
                        .header("X-Bootstrap-Role", "CS")
                        .header("X-Bootstrap-User-Id", CS_USER_ID)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"order_id\":" + orderId + ",\"source_text\":\"Shade A2, urgent.\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.translated_text").value(containsString("翻译草稿")))
                .andExpect(content().string(not(containsString("内部工序备注"))));

        mockMvc.perform(post("/ai/cs-query")
                        .header("X-Bootstrap-Role", "CS")
                        .header("X-Bootstrap-User-Id", CS_USER_ID)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"order_id\":" + orderId + ",\"question\":\"内部状态是什么？\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.answer").value(containsString("IN_PRODUCTION")));

        mockMvc.perform(post("/ai/order-query")
                        .header("X-Bootstrap-Role", "DOCTOR")
                        .header("X-Bootstrap-User-Id", DOCTOR_USER_ID)
                        .header("X-Bootstrap-Clinic-Id", clinicId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"order_id\":" + orderId + ",\"question\":\"我的订单状态？\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.answer").value(containsString("PRODUCING")));

        mockMvc.perform(post("/ai/check-missing")
                        .header("X-Bootstrap-Role", "CS")
                        .header("X-Bootstrap-User-Id", CS_USER_ID)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"order_id\":" + orderId + "}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.is_complete").value(true));

        mockMvc.perform(post("/ai/production-note")
                        .header("X-Bootstrap-Role", "WORKER")
                        .header("X-Bootstrap-User-Id", WORKER_USER_ID)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"order_id\":" + orderId + "}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.draft_note").value(containsString("生产备注草稿")))
                .andExpect(content().string(not(containsString("自动发送"))));

        assertThat(auditCount()).isEqualTo(5L);
        assertThat(auditCountByContext("DOCTOR_ORDER_ASSISTANT_READ_MODEL")).isEqualTo(1L);
        assertThat(orderProductionNote()).isEqualTo("内部工序备注：车瓷由7700处理");
    }

    @Test
    void doctorOrderAssistantRefusesInternalQuestionsAndDoesNotLeakInternalData() throws Exception {
        mockMvc.perform(post("/ai/order-query")
                        .header("X-Bootstrap-Role", "DOCTOR")
                        .header("X-Bootstrap-User-Id", DOCTOR_USER_ID)
                        .header("X-Bootstrap-Clinic-Id", clinicId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"order_id\":" + orderId + ",\"question\":\"谁在做？有没有返工责任和工时绩效？\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.answer").value(containsString("只能回答公开进度")))
                .andExpect(jsonPath("$.data.answer").value(containsString("PRODUCING")))
                .andExpect(content().string(not(containsString("车瓷"))))
                .andExpect(content().string(not(containsString("7700"))))
                .andExpect(content().string(not(containsString("内部返工责任"))))
                .andExpect(content().string(not(containsString("工时绩效"))));

        assertThat(auditCountByStatus("SAFE_REFUSAL")).isEqualTo(1L);
    }

    @Test
    void missingInfoAgentUsesFormConfigAndDoctorScope() throws Exception {
        jdbcClient.sql("""
                        INSERT INTO form_field_config
                            (product_type, field_key, field_label, field_type, required_flag, sort_order)
                        VALUES
                            (:productType, 'bite_photo', '咬合照片', 'FILE', 1, 10)
                        """)
                .param("productType", productType)
                .update();

        mockMvc.perform(post("/ai/check-missing")
                        .header("X-Bootstrap-Role", "DOCTOR")
                        .header("X-Bootstrap-User-Id", DOCTOR_USER_ID)
                        .header("X-Bootstrap-Clinic-Id", clinicId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"order_id\":" + orderId + "}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.is_complete").value(false))
                .andExpect(jsonPath("$.data.missing_items[0].field_key").value("bite_photo"))
                .andExpect(jsonPath("$.data.missing_items[0].field_label").value("咬合照片"));

        mockMvc.perform(post("/ai/check-missing")
                        .header("X-Bootstrap-Role", "DOCTOR")
                        .header("X-Bootstrap-User-Id", OTHER_DOCTOR_USER_ID)
                        .header("X-Bootstrap-Clinic-Id", 7777L)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"order_id\":" + orderId + "}"))
                .andExpect(status().isForbidden());
    }

    @Test
    void aiGovernanceSummaryCountsRecentAuditOutcomesForInternalUsers() throws Exception {
        AuditSummary baseline = auditSummary();
        jdbcClient.sql("""
                        INSERT INTO ai_audit_log
                            (order_id, actor_user_id, agent_code, request_context_type,
                             prompt_hash, model_name, input_token_count, output_token_count,
                             estimated_cost_microusd, result_status)
                        VALUES
                            (NULL, :csUserId, 'AI_TRANSLATE', 'ORDER_TRANSLATION_DRAFT',
                             'hash-success', 'deepseek-chat', 18, 6, 84, 'SUCCESS'),
                            (NULL, :csUserId, 'AI_TRANSLATE', 'ORDER_TRANSLATION_DRAFT',
                             'hash-rate-limit', 'ai-governance-rate-limit', 0, NULL, 0, 'AI_RATE_LIMITED'),
                            (NULL, :csUserId, 'AI_TRANSLATE', 'ORDER_TRANSLATION_DRAFT',
                             'hash-model-failed', 'ai-governance-model-failure', 0, NULL, 0, 'AI_MODEL_FAILED')
                        """)
                .param("csUserId", CS_USER_ID)
                .update();

        mockMvc.perform(get("/ai/governance/summary")
                        .header("X-Bootstrap-Role", "ADMIN")
                        .header("X-Bootstrap-User-Id", 1L))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.window_hours").value(24))
                .andExpect(jsonPath("$.data.success_count").value(baseline.successCount() + 1))
                .andExpect(jsonPath("$.data.rate_limited_count").value(baseline.rateLimitedCount() + 1))
                .andExpect(jsonPath("$.data.model_failed_count").value(baseline.modelFailedCount() + 1))
                .andExpect(jsonPath("$.data.estimated_cost_microusd").value(baseline.estimatedCostMicrousd() + 84))
                .andExpect(jsonPath("$.data.latest_model_failure_at").exists());
    }

    @Test
    void aiGovernanceSummaryFlagsDailyBudgetThreshold() throws Exception {
        AuditSummary baseline = auditSummary();
        jdbcClient.sql("""
                        INSERT INTO ai_audit_log
                            (order_id, actor_user_id, agent_code, request_context_type,
                             prompt_hash, model_name, input_token_count, output_token_count,
                             estimated_cost_microusd, result_status)
                        VALUES
                            (NULL, :csUserId, 'AI_TRANSLATE', 'ORDER_TRANSLATION_DRAFT',
                             'hash-budget-threshold', 'deepseek-chat', 30, 20, 184, 'SUCCESS')
                        """)
                .param("csUserId", CS_USER_ID)
                .update();

        mockMvc.perform(get("/ai/governance/summary")
                        .header("X-Bootstrap-Role", "ADMIN")
                        .header("X-Bootstrap-User-Id", 1L))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.estimated_cost_microusd").value(baseline.estimatedCostMicrousd() + 184))
                .andExpect(jsonPath("$.data.daily_budget_microusd").value(100))
                .andExpect(jsonPath("$.data.budget_exceeded").value(true));
    }

    @Test
    void aiGovernanceCostTrendGroupsRecentSuccessCostByDayForInternalUsers() throws Exception {
        String today = currentDate();
        String yesterday = dateDaysAgo(1);
        String promptPrefix = "task-9d42-cost-trend-" + UUID.randomUUID();
        String modelSuffix = UUID.randomUUID().toString().replace("-", "").substring(0, 12);
        DailyCostTrend todayBaseline = dailyCostTrend(today);
        DailyCostTrend yesterdayBaseline = dailyCostTrend(yesterday);
        String modelA = "trend-a-" + modelSuffix;
        String modelB = "trend-b-" + modelSuffix;
        jdbcClient.sql("""
                        INSERT INTO ai_audit_log
                            (order_id, actor_user_id, actor_role, agent_code, request_context_type,
                             prompt_hash, model_name, input_token_count, output_token_count,
                             estimated_cost_microusd, result_status, created_at)
                        VALUES
                            (NULL, :csUserId, 'CS', 'AI_TRANSLATE', 'ORDER_TRANSLATION_DRAFT',
                             :todayHash1, :modelA, 10, 5, 40, 'SUCCESS', CURRENT_TIMESTAMP(3)),
                            (NULL, :csUserId, 'CS', 'AI_CS_QUERY', 'INTERNAL_ORDER_SUMMARY',
                             :todayHash2, :modelB, 20, 10, 100, 'SUCCESS', CURRENT_TIMESTAMP(3)),
                            (NULL, :csUserId, 'CS', 'AI_TRANSLATE', 'ORDER_TRANSLATION_DRAFT',
                             :yesterdayHash, :modelA, 15, 5, 60, 'SUCCESS',
                             DATE_SUB(CURRENT_TIMESTAMP(3), INTERVAL 1 DAY)),
                            (NULL, :csUserId, 'CS', 'AI_TRANSLATE', 'ORDER_TRANSLATION_DRAFT',
                             :failedHash, :modelA, 0, 0, 999, 'AI_MODEL_FAILED', CURRENT_TIMESTAMP(3))
                        """)
                .param("csUserId", CS_USER_ID)
                .param("todayHash1", promptPrefix + "-today-1")
                .param("todayHash2", promptPrefix + "-today-2")
                .param("yesterdayHash", promptPrefix + "-yesterday")
                .param("failedHash", promptPrefix + "-failed")
                .param("modelA", modelA)
                .param("modelB", modelB)
                .update();

        mockMvc.perform(get("/ai/governance/cost-trend")
                        .param("days", "7")
                        .header("X-Bootstrap-Role", "CS")
                        .header("X-Bootstrap-User-Id", CS_USER_ID))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.days").value(7))
                .andExpect(jsonPath("$.data.points[*].date").value(hasItem(today)))
                .andExpect(jsonPath("$.data.points[*].date").value(hasItem(yesterday)))
                .andExpect(jsonPath("$.data.points[?(@.date == '" + today
                        + "')].estimated_cost_microusd").value(hasItem((int) todayBaseline.estimatedCostMicrousd() + 140)))
                .andExpect(jsonPath("$.data.points[?(@.date == '" + today
                        + "')].success_count").value(hasItem((int) todayBaseline.successCount() + 2)))
                .andExpect(jsonPath("$.data.points[?(@.date == '" + today
                        + "')].model_count").value(hasItem((int) todayBaseline.modelCount() + 2)))
                .andExpect(jsonPath("$.data.points[?(@.date == '" + yesterday
                        + "')].estimated_cost_microusd").value(hasItem((int) yesterdayBaseline.estimatedCostMicrousd() + 60)));
    }

    @Test
    void aiGovernanceCostTrendRejectsDoctorUsers() throws Exception {
        mockMvc.perform(get("/ai/governance/cost-trend")
                        .header("X-Bootstrap-Role", "DOCTOR")
                        .header("X-Bootstrap-User-Id", DOCTOR_USER_ID)
                        .header("X-Bootstrap-Clinic-Id", clinicId))
                .andExpect(status().isForbidden());
    }

    private String currentDate() {
        return jdbcClient.sql("SELECT DATE_FORMAT(CURRENT_DATE, '%Y-%m-%d')")
                .query(String.class)
                .single();
    }

    private String dateDaysAgo(int days) {
        return jdbcClient.sql("SELECT DATE_FORMAT(DATE_SUB(CURRENT_DATE, INTERVAL :days DAY), '%Y-%m-%d')")
                .param("days", days)
                .query(String.class)
                .single();
    }

    private DailyCostTrend dailyCostTrend(String date) {
        return jdbcClient.sql("""
                        SELECT
                            COALESCE(SUM(CASE WHEN result_status = 'SUCCESS' THEN 1 ELSE 0 END), 0) AS success_count,
                            COALESCE(SUM(CASE WHEN result_status = 'SUCCESS' THEN estimated_cost_microusd ELSE 0 END), 0)
                                AS estimated_cost_microusd,
                            COUNT(DISTINCT CASE WHEN result_status = 'SUCCESS' THEN model_name ELSE NULL END) AS model_count
                        FROM ai_audit_log
                        WHERE DATE(created_at) = :date
                        """)
                .param("date", date)
                .query((rs, rowNum) -> new DailyCostTrend(
                        rs.getLong("success_count"),
                        rs.getLong("estimated_cost_microusd"),
                        rs.getLong("model_count")))
                .single();
    }

    private AuditSummary auditSummary() {
        return jdbcClient.sql("""
                        SELECT
                            COALESCE(SUM(CASE WHEN result_status = 'SUCCESS' THEN 1 ELSE 0 END), 0) AS success_count,
                            COALESCE(SUM(CASE WHEN result_status = 'AI_RATE_LIMITED' THEN 1 ELSE 0 END), 0) AS rate_limited_count,
                            COALESCE(SUM(CASE WHEN result_status = 'AI_MODEL_FAILED' THEN 1 ELSE 0 END), 0) AS model_failed_count,
                            COALESCE(SUM(estimated_cost_microusd), 0) AS estimated_cost_microusd
                        FROM ai_audit_log
                        WHERE created_at >= DATE_SUB(CURRENT_TIMESTAMP(3), INTERVAL 24 HOUR)
                        """)
                .query((rs, rowNum) -> new AuditSummary(
                        rs.getLong("success_count"),
                        rs.getLong("rate_limited_count"),
                        rs.getLong("model_failed_count"),
                        rs.getLong("estimated_cost_microusd")))
                .single();
    }

    private long auditCount() {
        return jdbcClient.sql("SELECT COUNT(*) FROM ai_audit_log WHERE order_id = :orderId")
                .param("orderId", orderId)
                .query(Long.class)
                .single();
    }

    private long auditCountByContext(String contextType) {
        return jdbcClient.sql("""
                        SELECT COUNT(*)
                        FROM ai_audit_log
                        WHERE order_id = :orderId
                          AND request_context_type = :contextType
                        """)
                .param("orderId", orderId)
                .param("contextType", contextType)
                .query(Long.class)
                .single();
    }

    private long auditCountByStatus(String status) {
        return jdbcClient.sql("""
                        SELECT COUNT(*)
                        FROM ai_audit_log
                        WHERE order_id = :orderId
                          AND result_status = :status
                        """)
                .param("orderId", orderId)
                .param("status", status)
                .query(Long.class)
                .single();
    }

    private String orderProductionNote() {
        return jdbcClient.sql("SELECT production_note FROM orders WHERE order_id = :orderId")
                .param("orderId", orderId)
                .query(String.class)
                .single();
    }

    private void assignWorkerToOrder(String suffix) {
        long chainId = jdbcClient.sql("SELECT chain_id FROM workflow_chain WHERE status = 1 ORDER BY chain_id LIMIT 1")
                .query(Long.class)
                .single();
        int chainVersion = jdbcClient.sql("SELECT version FROM workflow_chain WHERE chain_id = :chainId")
                .param("chainId", chainId)
                .query(Integer.class)
                .single();
        long sourceNodeId = jdbcClient.sql("""
                        SELECT node_id
                        FROM workflow_node
                        WHERE chain_id = :chainId
                        ORDER BY step_order, node_id
                        LIMIT 1
                        """)
                .param("chainId", chainId)
                .query(Long.class)
                .single();
        jdbcClient.sql("""
                        INSERT INTO order_process_instance
                            (order_id, chain_id, chain_version, intake_branch_used, branch_params, instance_status)
                        VALUES
                            (:orderId, :chainId, :chainVersion, 'SCAN', JSON_OBJECT(), 'ACTIVE')
                        """)
                .param("orderId", orderId)
                .param("chainId", chainId)
                .param("chainVersion", chainVersion)
                .update();
        long instanceId = jdbcClient.sql("SELECT LAST_INSERT_ID()").query(Long.class).single();
        jdbcClient.sql("""
                        INSERT INTO order_process_node
                            (instance_id, source_node_id, node_code, process_name, step_order,
                             is_optional, node_category, need_in_check, need_out_check, node_status, assigned_user_id)
                        VALUES
                            (:instanceId, :sourceNodeId, :nodeCode, 'AI DataScope节点', 1,
                             0, 'PRODUCTION', 0, 0, 'READY', :workerUserId)
                        """)
                .param("instanceId", instanceId)
                .param("sourceNodeId", sourceNodeId)
                .param("nodeCode", "ai-datascope-" + suffix.substring(0, 12))
                .param("workerUserId", WORKER_USER_ID)
                .update();
    }

    private record AuditSummary(
            long successCount,
            long rateLimitedCount,
            long modelFailedCount,
            long estimatedCostMicrousd) {
    }

    private record DailyCostTrend(
            long successCount,
            long estimatedCostMicrousd,
            long modelCount) {
    }
}
