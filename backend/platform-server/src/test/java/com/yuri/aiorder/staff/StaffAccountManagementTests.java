package com.yuri.aiorder.staff;

import static org.hamcrest.Matchers.hasItem;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
class StaffAccountManagementTests {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void adminCreatesWorkerWithDepartmentPostAndLogin() throws Exception {
        String username = "worker-" + UUID.randomUUID().toString().replace("-", "").substring(0, 16);
        String password = "PhaseOne!2026";
        String body = """
                {"username":"%s","initial_password":"%s","display_name":"一期新增技工","dept_id":120,"post_id":1003}
                """.formatted(username, password);

        mockMvc.perform(post("/staff/accounts")
                        .header("X-Bootstrap-Role", "ADMIN")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.username").value(username))
                .andExpect(jsonPath("$.data.dept_name").value("生产中心"))
                .andExpect(jsonPath("$.data.post_name").value("生产员工"))
                .andExpect(jsonPath("$.data.role").value("WORKER"));

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"username\":\"" + username + "\",\"password\":\"" + password + "\",\"portal\":\"PRODUCTION\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.roles", hasItem("WORKER")));
    }

    @Test
    void nonAdminCannotCreateWorkerAccount() throws Exception {
        mockMvc.perform(post("/staff/accounts")
                        .header("X-Bootstrap-Role", "CS")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"username\":\"forbidden-worker\",\"initial_password\":\"PhaseOne!2026\",\"display_name\":\"禁止创建\",\"dept_id\":120,\"post_id\":1003}"))
                .andExpect(status().isForbidden());
    }

    @Test
    void adminCanUpdateWorkerDepartmentPostAndStatus() throws Exception {
        String username = "worker-update-" + UUID.randomUUID().toString().replace("-", "").substring(0, 12);
        String response = mockMvc.perform(post("/staff/accounts")
                        .header("X-Bootstrap-Role", "ADMIN")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"username\":\"" + username + "\",\"initial_password\":\"PhaseOne!2026\",\"display_name\":\"待更新技工\",\"dept_id\":120,\"post_id\":1003}"))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();
        long userId = com.fasterxml.jackson.databind.json.JsonMapper.builder().build()
                .readTree(response).path("data").path("user_id").asLong();

        mockMvc.perform(put("/staff/accounts/{userId}", userId)
                        .header("X-Bootstrap-Role", "ADMIN")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"display_name\":\"已更新技工\",\"dept_id\":130,\"post_id\":1001,\"status\":\"DISABLED\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.display_name").value("已更新技工"))
                .andExpect(jsonPath("$.data.dept_name").value("管理中心"))
                .andExpect(jsonPath("$.data.post_name").value("系统管理员"))
                .andExpect(jsonPath("$.data.status").value("DISABLED"));
    }
}
