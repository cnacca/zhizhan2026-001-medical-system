package com.yuri.aiorder.auth;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.yuri.aiorder.common.BootstrapIdentity;
import com.yuri.aiorder.common.UserRole;
import com.yuri.aiorder.common.auth.BearerTokenService;
import java.util.Set;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest(properties = "app.auth.allow-role-fallback=false")
@AutoConfigureMockMvc
@Transactional
class AcceptancePortalPermissionTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private BearerTokenService tokenService;

    @Test
    void baseWorkerAndCsWithoutDedicatedPermissionsAreForbidden() throws Exception {
        String csToken = token(UserRole.CS, Set.of("order:read-internal"));
        String workerToken = token(UserRole.WORKER, Set.of("check:write", "workflow:read-internal"));

        mockMvc.perform(get("/design-tasks/internal-review-queue")
                        .header("Authorization", "Bearer " + csToken))
                .andExpect(status().isForbidden());
        mockMvc.perform(post("/orders/999999991/orthodontic-production-batches")
                        .header("Authorization", "Bearer " + workerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"plan_version_id\":999999991,\"step_from\":1,\"step_to\":2}"))
                .andExpect(status().isForbidden());
        mockMvc.perform(put("/production/equipment/approvals/999999991")
                        .header("Authorization", "Bearer " + workerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"decision\":\"APPROVED\"}"))
                .andExpect(status().isForbidden());
        mockMvc.perform(put("/production/cost-management/records/ACCEPTANCE-MISSING/status")
                        .header("Authorization", "Bearer " + workerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"status\":\"CONFIRMED\"}"))
                .andExpect(status().isForbidden());
        mockMvc.perform(post("/final-inspection-reports")
                        .header("Authorization", "Bearer " + workerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"order_id\":999999991}"))
                .andExpect(status().isForbidden());
    }

    @Test
    void dedicatedPermissionsOnAllowedPortalsReachTheServiceLayer() throws Exception {
        String csReviewToken = token(UserRole.CS, Set.of("design-draft:internal-review"));
        mockMvc.perform(get("/design-tasks/internal-review-queue")
                        .header("Authorization", "Bearer " + csReviewToken))
                .andExpect(status().isOk());

        mockMvc.perform(post("/orders/999999991/orthodontic-production-batches")
                        .header("Authorization", "Bearer " + token(
                                UserRole.WORKER, Set.of("workflow:orthodontic-batch:manage")))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"plan_version_id\":999999991,\"step_from\":1,\"step_to\":2}"))
                .andExpect(status().isNotFound());
        mockMvc.perform(put("/production/equipment/approvals/999999991")
                        .header("Authorization", "Bearer " + token(
                                UserRole.WORKER, Set.of("production:equipment:approve")))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"decision\":\"APPROVED\"}"))
                .andExpect(status().isConflict());
        mockMvc.perform(put("/production/cost-management/records/ACCEPTANCE-MISSING/status")
                        .header("Authorization", "Bearer " + token(
                                UserRole.WORKER, Set.of("production:cost:confirm")))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"status\":\"CONFIRMED\"}"))
                .andExpect(status().isNotFound());
        mockMvc.perform(post("/final-inspection-reports")
                        .header("Authorization", "Bearer " + token(
                                UserRole.WORKER, Set.of("final-inspection:manage")))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"order_id\":999999991}"))
                .andExpect(status().isNotFound());
    }

    @Test
    void dedicatedPermissionsCannotCrossPortalBoundaries() throws Exception {
        mockMvc.perform(get("/design-tasks/internal-review-queue")
                        .header("Authorization", "Bearer " + token(
                                UserRole.DOCTOR, Set.of("design-draft:internal-review"))))
                .andExpect(status().isForbidden());

        String csProductionToken = token(UserRole.CS, Set.of(
                "workflow:orthodontic-batch:manage",
                "production:equipment:approve",
                "production:cost:confirm",
                "final-inspection:manage"));
        mockMvc.perform(post("/orders/999999991/orthodontic-production-batches")
                        .header("Authorization", "Bearer " + csProductionToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"plan_version_id\":999999991,\"step_from\":1,\"step_to\":2}"))
                .andExpect(status().isForbidden());
        mockMvc.perform(put("/production/equipment/approvals/999999991")
                        .header("Authorization", "Bearer " + csProductionToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"decision\":\"APPROVED\"}"))
                .andExpect(status().isForbidden());
        mockMvc.perform(put("/production/cost-management/records/ACCEPTANCE-MISSING/status")
                        .header("Authorization", "Bearer " + csProductionToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"status\":\"CONFIRMED\"}"))
                .andExpect(status().isForbidden());
        mockMvc.perform(post("/final-inspection-reports")
                        .header("Authorization", "Bearer " + csProductionToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"order_id\":999999991}"))
                .andExpect(status().isForbidden());
    }

    private String token(UserRole role, Set<String> permissions) {
        return tokenService.issue(new BootstrapIdentity(role, 999999L, null, null, permissions, "ALL"));
    }
}
