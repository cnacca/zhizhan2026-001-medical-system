package com.yuri.aiorder.production;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest(properties = "app.auth.allow-role-fallback=false")
@AutoConfigureMockMvc
@Transactional
class ProductionFineGrainedWritePermissionTests {

    private static final long WORKER_USER_ID = 9601L;

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private JdbcClient jdbcClient;

    @Test
    void equipmentAndCostTerminalStatesRequireDedicatedApprovalEndpoints() throws Exception {
        grantRole("PROD_MANAGER");
        grantDirectPermission("production:equipment:approve");
        grantDirectPermission("production:cost:confirm");
        String token = loginWorker();
        String suffix = UUID.randomUUID().toString().replace("-", "").substring(0, 10).toUpperCase();
        String equipmentCode = "EQAP_" + suffix;

        mockMvc.perform(post("/production/equipment")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"equipment_code":"%s","equipment_name":"审批门禁设备",
                                 "equipment_type":"MILLING_MACHINE","status":"IDLE"}
                                """.formatted(equipmentCode)))
                .andExpect(status().isOk());

        mockMvc.perform(post("/production/equipment/{equipmentCode}/events", equipmentCode)
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"event_type":"REPAIR_REQUEST","status":"APPROVED",
                                 "description":"不得在创建时直接通过"}
                                """))
                .andExpect(status().isBadRequest());

        String pendingEvent = mockMvc.perform(post("/production/equipment/{equipmentCode}/events", equipmentCode)
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"event_type":"REPAIR_REQUEST","status":"PENDING",
                                 "description":"等待负责人审批"}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("PENDING"))
                .andReturn().getResponse().getContentAsString();
        long eventId = objectMapper.readTree(pendingEvent).path("data").path("event_id").asLong();
        mockMvc.perform(put("/production/equipment/approvals/{eventId}", eventId)
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"decision\":\"APPROVED\",\"decision_note\":\"负责人已复核\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("APPROVED"));

        String costNo = "COSTAP_" + suffix;
        mockMvc.perform(post("/production/cost-management/records")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"cost_no":"%s","cost_type":"LABOR","amount":10.00,
                                 "status":"CONFIRMED","description":"不得在创建时直接确认"}
                                """.formatted(costNo)))
                .andExpect(status().isBadRequest());

        mockMvc.perform(post("/production/cost-management/records")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"cost_no":"%s","cost_type":"LABOR","amount":10.00,
                                 "status":"NORMAL","description":"等待成本确认"}
                                """.formatted(costNo)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.confirmed_at").doesNotExist());
        mockMvc.perform(put("/production/cost-management/records/{costNo}/status", costNo)
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"status\":\"CONFIRMED\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("CONFIRMED"))
                .andExpect(jsonPath("$.data.confirmed_at").isNotEmpty());
    }

    private String loginWorker() throws Exception {
        var result = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"username\":\"worker\",\"password\":\"change-me-worker\",\"portal\":\"PRODUCTION\"}"))
                .andExpect(status().isOk());
        String response = result.andReturn().getResponse().getContentAsString();
        return objectMapper.readTree(response).path("accessToken").asText();
    }

    private void grantRole(String roleCode) {
        jdbcClient.sql("""
                        INSERT IGNORE INTO system_user_role (user_id, role_id)
                        SELECT :userId, role_id FROM system_role WHERE role_code = :roleCode
                        """)
                .param("userId", WORKER_USER_ID)
                .param("roleCode", roleCode)
                .update();
    }

    private void grantDirectPermission(String permissionCode) {
        jdbcClient.sql("""
                        INSERT IGNORE INTO system_user_permission (user_id, permission_id)
                        SELECT :userId, permission_id
                        FROM system_permission
                        WHERE permission_code = :permissionCode
                        """)
                .param("userId", WORKER_USER_ID)
                .param("permissionCode", permissionCode)
                .update();
    }
}
