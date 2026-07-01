package com.yuri.aiorder.auth;

import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.hasItem;
import static org.hamcrest.Matchers.not;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.yuri.aiorder.common.BootstrapIdentity;
import com.yuri.aiorder.common.UserRole;
import com.yuri.aiorder.common.auth.BearerTokenService;
import java.util.UUID;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

@SpringBootTest
@AutoConfigureMockMvc
class BearerIdentityTests {

    private static final long DOCTOR_USER_ID = 9701L;
    private static final long OTHER_DOCTOR_USER_ID = 9702L;

    @Autowired
    private JdbcClient jdbcClient;

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private BearerTokenService tokenService;

    @Autowired
    private ObjectMapper objectMapper;

    private long clinicId;
    private long orderId;

    @BeforeEach
    void setUp() {
        BootstrapIdentity.setBootstrapHeadersAllowed(true);
        String suffix = UUID.randomUUID().toString().replace("-", "");
        jdbcClient.sql("INSERT INTO clinic (clinic_name) VALUES (:clinicName)")
                .param("clinicName", "Bearer测试诊所-" + suffix)
                .update();
        clinicId = jdbcClient.sql("SELECT LAST_INSERT_ID()").query(Long.class).single();

        jdbcClient.sql("""
                        INSERT INTO orders
                            (order_no, clinic_id, doctor_user_id, cs_user_id, product_type,
                             form_data, internal_status, external_status, production_note)
                        VALUES
                            (:orderNo, :clinicId, :doctorUserId, 8001, 'REGULAR_CROWN',
                             JSON_OBJECT('patient_name', '赵六', 'tooth_position', '16'),
                             'IN_PRODUCTION', 'PRODUCING', 'Bearer内部生产备注')
                        """)
                .param("orderNo", "B" + suffix.substring(0, 12))
                .param("clinicId", clinicId)
                .param("doctorUserId", DOCTOR_USER_ID)
                .update();
        orderId = jdbcClient.sql("SELECT LAST_INSERT_ID()").query(Long.class).single();
        jdbcClient.sql("""
                        INSERT INTO order_external_projection
                            (order_id, external_status, public_message)
                        VALUES
                            (:orderId, 'PRODUCING', '订单正在制作中。')
                        """)
                .param("orderId", orderId)
                .update();
    }

    @AfterEach
    void tearDown() {
        BootstrapIdentity.setBootstrapHeadersAllowed(true);
    }

    @Test
    void bearerDoctorTokenUsesDoctorDataScopeAndDesensitizedProjection() throws Exception {
        String token = tokenService.issue(new BootstrapIdentity(UserRole.DOCTOR, DOCTOR_USER_ID, clinicId));

        mockMvc.perform(get("/orders/{orderId}", orderId)
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.order_id").value(orderId))
                .andExpect(jsonPath("$.data.external_status").value("PRODUCING"))
                .andExpect(jsonPath("$.data.internal_status").doesNotExist())
                .andExpect(jsonPath("$.data.production_note").doesNotExist())
                .andExpect(content().string(not(containsString("Bearer内部生产备注"))));
    }

    @Test
    void bearerDoctorTokenRejectsOtherDoctorOrder() throws Exception {
        String token = tokenService.issue(new BootstrapIdentity(UserRole.DOCTOR, OTHER_DOCTOR_USER_ID, 998877L));

        mockMvc.perform(get("/orders/{orderId}", orderId)
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isForbidden());
    }

    @Test
    void disabledBootstrapHeadersRequireBearerToken() throws Exception {
        BootstrapIdentity.setBootstrapHeadersAllowed(false);

        mockMvc.perform(get("/orders/{orderId}", orderId)
                        .header("X-Bootstrap-Role", "ADMIN"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void databaseLoginReturnsRbacIdentityAndMeReadsBearerClaims() throws Exception {
        MvcResult login = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"username\":\"admin\",\"password\":\"change-me-admin\",\"portal\":\"ADMIN\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value("admin"))
                .andExpect(jsonPath("$.userId").value(8001))
                .andExpect(jsonPath("$.roles", hasItem("ADMIN")))
                .andExpect(jsonPath("$.permissions", hasItem("workflow:assign")))
                .andExpect(jsonPath("$.menus[*].menuCode", hasItem("system-rbac")))
                .andExpect(jsonPath("$.menus[*].menuCode", hasItem("internal-orders")))
                .andExpect(jsonPath("$.dataScope").value("ALL"))
                .andReturn();

        JsonNode root = objectMapper.readTree(login.getResponse().getContentAsString());
        String token = root.path("accessToken").asText();

        mockMvc.perform(get("/api/auth/me")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value("admin"))
                .andExpect(jsonPath("$.userId").value(8001))
                .andExpect(jsonPath("$.roles", hasItem("ADMIN")))
                .andExpect(jsonPath("$.permissions", hasItem("workflow:assign")))
                .andExpect(jsonPath("$.menus[*].menuCode", hasItem("system-rbac")))
                .andExpect(jsonPath("$.menus[*].menuCode", hasItem("internal-orders")))
                .andExpect(jsonPath("$.dataScope").value("ALL"));
    }

    @Test
    void databaseLoginAllowsLocalhostAndLoopbackViteOrigins() throws Exception {
        mockMvc.perform(post("/api/auth/login")
                        .header("Origin", "http://localhost:5173")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"username\":\"doctor\",\"password\":\"change-me-doctor\",\"portal\":\"DOCTOR\"}"))
                .andExpect(status().isOk());

        mockMvc.perform(post("/api/auth/login")
                        .header("Origin", "http://127.0.0.1:5173")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"username\":\"doctor\",\"password\":\"change-me-doctor\",\"portal\":\"DOCTOR\"}"))
                .andExpect(status().isOk());
    }

    @Test
    void databaseDoctorLoginUsesUserDataScopeForDoctorOrder() throws Exception {
        MvcResult login = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"username\":\"doctor\",\"password\":\"change-me-doctor\",\"portal\":\"DOCTOR\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value("doctor"))
                .andExpect(jsonPath("$.userId").value(DOCTOR_USER_ID))
                .andExpect(jsonPath("$.roles", hasItem("DOCTOR")))
                .andExpect(jsonPath("$.permissions", hasItem("order:read-doctor")))
                .andExpect(jsonPath("$.menus[*].menuCode", hasItem("doctor-orders")))
                .andExpect(jsonPath("$.menus[*].menuCode", hasItem("ai-doctor")))
                .andExpect(jsonPath("$.menus[*].menuCode", not(hasItem("internal-orders"))))
                .andExpect(jsonPath("$.dataScope").value("CLINIC"))
                .andReturn();

        String token = objectMapper.readTree(login.getResponse().getContentAsString())
                .path("accessToken")
                .asText();

        mockMvc.perform(get("/orders/{orderId}", orderId)
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.order_id").value(orderId))
                .andExpect(jsonPath("$.data.internal_status").doesNotExist())
                .andExpect(content().string(not(containsString("Bearer内部生产备注"))));
    }

    @Test
    void databaseLoginRejectsBadPassword() throws Exception {
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"username\":\"admin\",\"password\":\"wrong-password\",\"portal\":\"ADMIN\"}"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void databaseLoginRequiresPortalAndMatchesRoleToPortal() throws Exception {
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"username\":\"admin\",\"password\":\"change-me-admin\"}"))
                .andExpect(status().isBadRequest());

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"username\":\"doctor\",\"password\":\"change-me-doctor\",\"portal\":\"ADMIN\"}"))
                .andExpect(status().isForbidden());

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"username\":\"worker\",\"password\":\"change-me-worker\",\"portal\":\"DOCTOR\"}"))
                .andExpect(status().isForbidden());

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"username\":\"doctor\",\"password\":\"change-me-doctor\",\"portal\":\"DOCTOR\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.roles", hasItem("DOCTOR")));

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"username\":\"cs\",\"password\":\"change-me-cs\",\"portal\":\"CS\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.roles", hasItem("CS")));

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"username\":\"worker\",\"password\":\"change-me-worker\",\"portal\":\"PRODUCTION\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.roles", hasItem("WORKER")));

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"username\":\"admin\",\"password\":\"change-me-admin\",\"portal\":\"ADMIN\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.roles", hasItem("ADMIN")));
    }

    @Test
    void refreshTokenCanIssueNewAccessTokenAndLogoutRevokesIt() throws Exception {
        MvcResult login = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"username\":\"doctor\",\"password\":\"change-me-doctor\",\"portal\":\"DOCTOR\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").isString())
                .andExpect(jsonPath("$.refreshToken").isString())
                .andExpect(jsonPath("$.refreshExpiresAt").isString())
                .andReturn();

        JsonNode loginRoot = objectMapper.readTree(login.getResponse().getContentAsString());
        String refreshToken = loginRoot.path("refreshToken").asText();

        MvcResult refreshed = mockMvc.perform(post("/api/auth/refresh")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"refresh_token\":\"" + refreshToken + "\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").isString())
                .andExpect(jsonPath("$.refreshToken").value(refreshToken))
                .andExpect(jsonPath("$.username").value("doctor"))
                .andExpect(jsonPath("$.roles", hasItem("DOCTOR")))
                .andReturn();

        String refreshedAccessToken = objectMapper.readTree(refreshed.getResponse().getContentAsString())
                .path("accessToken")
                .asText();

        mockMvc.perform(get("/orders/{orderId}", orderId)
                        .header("Authorization", "Bearer " + refreshedAccessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.order_id").value(orderId))
                .andExpect(jsonPath("$.data.internal_status").doesNotExist());

        mockMvc.perform(post("/api/auth/logout")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"refresh_token\":\"" + refreshToken + "\"}"))
                .andExpect(status().isOk());

        mockMvc.perform(post("/api/auth/refresh")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"refresh_token\":\"" + refreshToken + "\"}"))
                .andExpect(status().isUnauthorized());
    }
}
