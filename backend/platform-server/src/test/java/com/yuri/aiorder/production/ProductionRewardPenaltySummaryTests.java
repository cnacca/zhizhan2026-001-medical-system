package com.yuri.aiorder.production;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.math.BigDecimal;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
class ProductionRewardPenaltySummaryTests {

    @Autowired
    private JdbcClient jdbcClient;

    @Autowired
    private MockMvc mockMvc;

    @Test
    void productionRewardPenaltySummaryAggregatesTypeStatusAmountAndRelations() throws Exception {
        String prefix = "RP_" + UUID.randomUUID().toString().replace("-", "").substring(0, 12);
        createRewardPenalty(prefix + "_REWARD_APPROVED", "REWARD", "APPROVED", 120.00, 101L, 201L, 301L);
        createRewardPenalty(prefix + "_PENALTY_PENDING", "PENALTY", "PENDING", -40.00, 102L, 202L, 302L);
        createRewardPenalty(prefix + "_REWARD_REJECTED", "REWARD", "REJECTED", 50.00, null, null, 303L);
        createRewardPenalty(prefix + "_PENALTY_EFFECTIVE", "PENALTY", "EFFECTIVE", -30.00, 104L, null, 304L);

        mockMvc.perform(get("/production/reward-penalty/summary")
                        .header("X-Bootstrap-Role", "WORKER")
                        .header("X-Bootstrap-User-Id", 990200001L)
                        .param("record_no_prefix", prefix))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.record_no_prefix").value(prefix))
                .andExpect(jsonPath("$.data.total_record_count").value(4))
                .andExpect(jsonPath("$.data.reward_count").value(2))
                .andExpect(jsonPath("$.data.penalty_count").value(2))
                .andExpect(jsonPath("$.data.pending_count").value(1))
                .andExpect(jsonPath("$.data.approved_count").value(1))
                .andExpect(jsonPath("$.data.rejected_count").value(1))
                .andExpect(jsonPath("$.data.effective_count").value(1))
                .andExpect(jsonPath("$.data.related_order_count").value(3))
                .andExpect(jsonPath("$.data.related_process_count").value(2))
                .andExpect(jsonPath("$.data.related_employee_count").value(4))
                .andExpect(jsonPath("$.data.monthly_amount").value(100.0));
    }

    @Test
    void doctorCannotReadProductionRewardPenaltySummary() throws Exception {
        mockMvc.perform(get("/production/reward-penalty/summary")
                        .header("X-Bootstrap-Role", "DOCTOR")
                        .header("X-Bootstrap-User-Id", 990100001L))
                .andExpect(status().isForbidden());
    }

    private void createRewardPenalty(
            String recordNo,
            String recordType,
            String status,
            double amount,
            Long orderId,
            Long nodeInstanceId,
            Long employeeUserId) {
        jdbcClient.sql("""
                        INSERT INTO production_reward_penalty_record
                            (record_no, record_type, reason_category, amount, status,
                             order_id, node_instance_id, employee_user_id, department_name, description)
                        VALUES
                            (:recordNo, :recordType, 'QUALITY', :amount, :status,
                             :orderId, :nodeInstanceId, :employeeUserId, '生产奖惩测试组', '奖惩汇总测试')
                        """)
                .param("recordNo", recordNo)
                .param("recordType", recordType)
                .param("amount", BigDecimal.valueOf(amount))
                .param("status", status)
                .param("orderId", orderId)
                .param("nodeInstanceId", nodeInstanceId)
                .param("employeeUserId", employeeUserId)
                .update();
    }
}
