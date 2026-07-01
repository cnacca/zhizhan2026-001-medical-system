package com.yuri.aiorder.ai;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.containsString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpServer;
import java.io.IOException;
import java.io.UncheckedIOException;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest(properties = {
        "app.ai.provider=deepseek",
        "app.ai.deepseek.enabled=true",
        "app.ai.deepseek.api-key=test-deepseek-key",
        "app.ai.deepseek.model=deepseek-chat",
        "app.ai.input-token-cost-microusd=2",
        "app.ai.output-token-cost-microusd=8"
})
@AutoConfigureMockMvc
class AiGatewayDeepSeekTests {

    private static final long DOCTOR_USER_ID = 9911L;
    private static final long CS_USER_ID = 9912L;
    private static final long WORKER_USER_ID = 9913L;
    private static DeepSeekStubServer deepSeekServer;

    @DynamicPropertySource
    static void registerDeepSeekProperties(DynamicPropertyRegistry registry) {
        registry.add("app.ai.deepseek.base-url", () -> deepSeekServer.baseUrl());
    }

    @BeforeAll
    static void startDeepSeekStub() {
        deepSeekServer = new DeepSeekStubServer();
    }

    @AfterAll
    static void stopDeepSeekStub() {
        deepSeekServer.stop();
    }

    @Autowired
    private JdbcClient jdbcClient;

    @Autowired
    private AiGatewayProperties aiGatewayProperties;

    @Autowired
    private MockMvc mockMvc;

    private long clinicId;
    private long orderId;
    private String productType;

    @BeforeEach
    void setUp() {
        deepSeekServer.reset();
        aiGatewayProperties.setMaxRequestsPerUserHour(120);
        jdbcClient.sql("""
                        DELETE FROM ai_audit_log
                        WHERE actor_user_id IN (:doctorUserId, :csUserId, :workerUserId)
                        """)
                .param("doctorUserId", DOCTOR_USER_ID)
                .param("csUserId", CS_USER_ID)
                .param("workerUserId", WORKER_USER_ID)
                .update();
        String suffix = UUID.randomUUID().toString().replace("-", "");
        productType = "AI_DEEPSEEK_" + suffix.substring(0, 10);
        jdbcClient.sql("INSERT INTO clinic (clinic_name) VALUES (:clinicName)")
                .param("clinicName", "DeepSeek测试诊所-" + suffix)
                .update();
        clinicId = jdbcClient.sql("SELECT LAST_INSERT_ID()").query(Long.class).single();

        jdbcClient.sql("""
                        INSERT INTO orders
                            (order_no, clinic_id, doctor_user_id, cs_user_id, product_type,
                             form_data, internal_status, external_status, production_note)
                        VALUES
                            (:orderNo, :clinicId, :doctorUserId, :csUserId, :productType,
                             JSON_OBJECT('patient_name', '王五', 'tooth_position', '21'),
                             'IN_PRODUCTION', 'PRODUCING', '内部工序备注：不要泄露')
                        """)
                .param("orderNo", "AIDS" + suffix.substring(0, 11))
                .param("clinicId", clinicId)
                .param("doctorUserId", DOCTOR_USER_ID)
                .param("csUserId", CS_USER_ID)
                .param("productType", productType)
                .update();
        orderId = jdbcClient.sql("SELECT LAST_INSERT_ID()").query(Long.class).single();

        jdbcClient.sql("""
                        INSERT INTO order_external_projection
                            (order_id, external_status, public_message)
                        VALUES
                            (:orderId, 'PRODUCING', '公开进度：正在制作。')
                        """)
                .param("orderId", orderId)
                .update();
    }

    @Test
    void enabledDeepSeekProviderCallsOpenAiCompatibleEndpointAndAuditsRealModel() throws Exception {
        deepSeekServer.enqueue("DeepSeek翻译草稿：Shade A2。");
        deepSeekServer.enqueue("DeepSeek客服摘要：外部状态 PRODUCING。");
        deepSeekServer.enqueue("DeepSeek医生公开答复：订单正在制作。");
        deepSeekServer.enqueue("DeepSeek生产备注草稿：按公开信息整理。");

        mockMvc.perform(post("/ai/translate")
                        .header("X-Bootstrap-Role", "CS")
                        .header("X-Bootstrap-User-Id", CS_USER_ID)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"order_id\":" + orderId + ",\"source_text\":\"Shade A2.\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.translated_text").value(containsString("DeepSeek翻译草稿")));

        mockMvc.perform(post("/ai/cs-query")
                        .header("X-Bootstrap-Role", "CS")
                        .header("X-Bootstrap-User-Id", CS_USER_ID)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"order_id\":" + orderId + ",\"question\":\"订单概况？\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.answer").value(containsString("DeepSeek客服摘要")));

        mockMvc.perform(post("/ai/order-query")
                        .header("X-Bootstrap-Role", "DOCTOR")
                        .header("X-Bootstrap-User-Id", DOCTOR_USER_ID)
                        .header("X-Bootstrap-Clinic-Id", clinicId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"order_id\":" + orderId + ",\"question\":\"我的订单状态？\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.answer").value(containsString("DeepSeek医生公开答复")));

        mockMvc.perform(post("/ai/order-query")
                        .header("X-Bootstrap-Role", "DOCTOR")
                        .header("X-Bootstrap-User-Id", DOCTOR_USER_ID)
                        .header("X-Bootstrap-Clinic-Id", clinicId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"order_id\":" + orderId + ",\"question\":\"谁在做？工时多少？\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.answer").value(containsString("只能回答公开进度")));

        mockMvc.perform(post("/ai/production-note")
                        .header("X-Bootstrap-Role", "CS")
                        .header("X-Bootstrap-User-Id", CS_USER_ID)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"order_id\":" + orderId + "}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.draft_note").value(containsString("DeepSeek生产备注草稿")));

        assertThat(deepSeekServer.requests()).hasSize(4);
        assertThat(deepSeekServer.requests()).allSatisfy(request -> {
            assertThat(request.path()).isEqualTo("/chat/completions");
            assertThat(request.authorization()).isEqualTo("Bearer test-deepseek-key");
            assertThat(request.body()).contains("\"model\":\"deepseek-chat\"");
        });
        assertThat(deepSeekServer.requests().get(2).body()).contains("公开进度：正在制作。");
        assertThat(deepSeekServer.requests().get(2).body()).doesNotContain("内部工序备注");
        assertThat(auditCountByModel("deepseek-chat")).isEqualTo(4L);
        assertThat(auditCountByStatus("SAFE_REFUSAL")).isEqualTo(1L);
    }

    @Test
    void deepSeekProviderRateLimitsRealModelCallsPerUserAndAuditsRejection() throws Exception {
        aiGatewayProperties.setMaxRequestsPerUserHour(2);
        deepSeekServer.enqueue("DeepSeek翻译草稿一。");
        deepSeekServer.enqueue("DeepSeek翻译草稿二。");

        mockMvc.perform(post("/ai/translate")
                        .header("X-Bootstrap-Role", "CS")
                        .header("X-Bootstrap-User-Id", CS_USER_ID)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"order_id\":" + orderId + ",\"source_text\":\"Shade A1.\"}"))
                .andExpect(status().isOk());

        mockMvc.perform(post("/ai/translate")
                        .header("X-Bootstrap-Role", "CS")
                        .header("X-Bootstrap-User-Id", CS_USER_ID)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"order_id\":" + orderId + ",\"source_text\":\"Shade A2.\"}"))
                .andExpect(status().isOk());

        mockMvc.perform(post("/ai/translate")
                        .header("X-Bootstrap-Role", "CS")
                        .header("X-Bootstrap-User-Id", CS_USER_ID)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"order_id\":" + orderId + ",\"source_text\":\"Shade A3.\"}"))
                .andExpect(status().isTooManyRequests());

        assertThat(deepSeekServer.requests()).hasSize(2);
        assertThat(auditCountByStatus("AI_RATE_LIMITED")).isEqualTo(1L);
    }

    @Test
    void deepSeekProviderAuditsEstimatedCostMicrousdFromTokenUsage() throws Exception {
        deepSeekServer.enqueue("DeepSeek翻译草稿：Shade A2。");

        mockMvc.perform(post("/ai/translate")
                        .header("X-Bootstrap-Role", "CS")
                        .header("X-Bootstrap-User-Id", CS_USER_ID)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"order_id\":" + orderId + ",\"source_text\":\"Shade A2.\"}"))
                .andExpect(status().isOk());

        assertThat(auditCostColumnCount()).isEqualTo(1L);
        assertThat(estimatedCostMicrousd()).isEqualTo(84L);
    }

    @Test
    void deepSeekProviderRetriesTransientServerFailureBeforeAuditingSuccess() throws Exception {
        deepSeekServer.enqueueFailure(500);
        deepSeekServer.enqueue("DeepSeek重试后翻译草稿：Shade A2。");

        mockMvc.perform(post("/ai/translate")
                        .header("X-Bootstrap-Role", "CS")
                        .header("X-Bootstrap-User-Id", CS_USER_ID)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"order_id\":" + orderId + ",\"source_text\":\"Shade A2.\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.translated_text").value(containsString("DeepSeek重试后翻译草稿")));

        assertThat(deepSeekServer.requests()).hasSize(2);
        assertThat(auditCountByModel("deepseek-chat")).isEqualTo(1L);
    }

    private long auditCountByModel(String modelName) {
        return jdbcClient.sql("""
                        SELECT COUNT(*)
                        FROM ai_audit_log
                        WHERE order_id = :orderId
                          AND model_name = :modelName
                        """)
                .param("orderId", orderId)
                .param("modelName", modelName)
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

    private long auditCostColumnCount() {
        return jdbcClient.sql("""
                        SELECT COUNT(*)
                        FROM information_schema.columns
                        WHERE table_schema = DATABASE()
                          AND table_name = 'ai_audit_log'
                          AND column_name = 'estimated_cost_microusd'
                        """)
                .query(Long.class)
                .single();
    }

    private long estimatedCostMicrousd() {
        return jdbcClient.sql("""
                        SELECT estimated_cost_microusd
                        FROM ai_audit_log
                        WHERE order_id = :orderId
                          AND result_status = 'SUCCESS'
                        ORDER BY ai_audit_id DESC
                        LIMIT 1
                        """)
                .param("orderId", orderId)
                .query(Long.class)
                .single();
    }

    private static final class DeepSeekStubServer {
        private final HttpServer server;
        private final List<CapturedRequest> requests = new ArrayList<>();
        private final List<StubResponse> responses = new ArrayList<>();

        private DeepSeekStubServer() {
            try {
                server = HttpServer.create(new InetSocketAddress("127.0.0.1", 0), 0);
                server.createContext("/chat/completions", this::handleChatCompletions);
                server.start();
            } catch (IOException ex) {
                throw new UncheckedIOException(ex);
            }
        }

        private String baseUrl() {
            return "http://127.0.0.1:" + server.getAddress().getPort();
        }

        private void enqueue(String answer) {
            responses.add(new StubResponse(200, answer));
        }

        private void enqueueFailure(int statusCode) {
            responses.add(new StubResponse(statusCode, "DeepSeek temporary failure"));
        }

        private void reset() {
            requests.clear();
            responses.clear();
        }

        private List<CapturedRequest> requests() {
            return requests;
        }

        private void stop() {
            server.stop(0);
        }

        private void handleChatCompletions(HttpExchange exchange) throws IOException {
            String body = new String(exchange.getRequestBody().readAllBytes(), StandardCharsets.UTF_8);
            requests.add(new CapturedRequest(
                    exchange.getRequestURI().getPath(),
                    exchange.getRequestHeaders().getFirst("Authorization"),
                    body));
            StubResponse stubResponse = responses.isEmpty()
                    ? new StubResponse(200, "DeepSeek默认答复")
                    : responses.remove(0);
            if (stubResponse.statusCode() >= 400) {
                byte[] response = ("{\"error\":\"" + stubResponse.answer() + "\"}")
                        .getBytes(StandardCharsets.UTF_8);
                exchange.getResponseHeaders().add("Content-Type", "application/json");
                exchange.sendResponseHeaders(stubResponse.statusCode(), response.length);
                exchange.getResponseBody().write(response);
                exchange.close();
                return;
            }
            byte[] response = ("""
                    {"choices":[{"message":{"content":%s}}],"usage":{"prompt_tokens":18,"completion_tokens":6}}
                    """.formatted(jsonString(stubResponse.answer()))).getBytes(StandardCharsets.UTF_8);
            exchange.getResponseHeaders().add("Content-Type", "application/json");
            exchange.sendResponseHeaders(200, response.length);
            exchange.getResponseBody().write(response);
            exchange.close();
        }

        private String jsonString(String value) {
            return "\"" + value.replace("\\", "\\\\").replace("\"", "\\\"") + "\"";
        }
    }

    private record CapturedRequest(String path, String authorization, String body) {
    }

    private record StubResponse(int statusCode, String answer) {
    }
}
