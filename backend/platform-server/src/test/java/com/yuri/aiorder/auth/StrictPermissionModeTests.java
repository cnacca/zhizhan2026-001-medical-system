package com.yuri.aiorder.auth;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.yuri.aiorder.common.BootstrapIdentity;
import com.yuri.aiorder.common.UserRole;
import com.yuri.aiorder.common.auth.BearerTokenService;
import java.util.Set;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest(properties = "app.auth.allow-role-fallback=false")
@AutoConfigureMockMvc
class StrictPermissionModeTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private BearerTokenService tokenService;

    @Test
    void strictPermissionModeRejectsRoleOnlyTokenWhenPermissionCodeIsRequired() throws Exception {
        String token = tokenService.issue(new BootstrapIdentity(
                UserRole.ADMIN,
                8001L,
                null,
                "strict-admin",
                Set.of(),
                "ALL"));

        mockMvc.perform(get("/ai/governance/summary")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isForbidden());
    }

    @Test
    void strictPermissionModeAllowsTokenWithRequiredPermissionCode() throws Exception {
        String token = tokenService.issue(new BootstrapIdentity(
                UserRole.ADMIN,
                8001L,
                null,
                "strict-admin",
                Set.of("ai:cs"),
                "ALL"));

        mockMvc.perform(get("/ai/governance/summary")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk());
    }
}
