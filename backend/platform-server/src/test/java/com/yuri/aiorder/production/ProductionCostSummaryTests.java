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
class ProductionCostSummaryTests {

    @Autowired
    private JdbcClient jdbcClient;

    @Autowired
    private MockMvc mockMvc;

    @Test
    void productionCostSummaryAggregatesCostTypesAndWarnings() throws Exception {
        String prefix = "COST_" + UUID.randomUUID().toString().replace("-", "").substring(0, 12);
        createCostRecord(prefix + "_PROCESS", "PROCESS", "NORMAL", 120.00);
        createCostRecord(prefix + "_MATERIAL", "MATERIAL", "WARNING", 80.50);
        createCostRecord(prefix + "_LABOR", "LABOR", "NORMAL", 60.00);
        createCostRecord(prefix + "_REWORK", "REWORK", "WARNING", 30.00);
        createCostRecord(prefix + "_OUT", "OUTSOURCING", "CONFIRMED", 200.75);

        mockMvc.perform(get("/production/cost-management/summary")
                        .header("X-Bootstrap-Role", "WORKER")
                        .header("X-Bootstrap-User-Id", 990200001L)
                        .param("cost_no_prefix", prefix))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.cost_no_prefix").value(prefix))
                .andExpect(jsonPath("$.data.record_count").value(5))
                .andExpect(jsonPath("$.data.total_cost_amount").value(491.25))
                .andExpect(jsonPath("$.data.process_cost_amount").value(120.0))
                .andExpect(jsonPath("$.data.material_cost_amount").value(80.5))
                .andExpect(jsonPath("$.data.labor_cost_amount").value(60.0))
                .andExpect(jsonPath("$.data.rework_cost_amount").value(30.0))
                .andExpect(jsonPath("$.data.outsourcing_cost_amount").value(200.75))
                .andExpect(jsonPath("$.data.abnormal_warning_count").value(2));
    }

    @Test
    void doctorCannotReadProductionCostSummary() throws Exception {
        mockMvc.perform(get("/production/cost-management/summary")
                        .header("X-Bootstrap-Role", "DOCTOR")
                        .header("X-Bootstrap-User-Id", 990100001L))
                .andExpect(status().isForbidden());
    }

    private void createCostRecord(String costNo, String costType, String status, double amount) {
        jdbcClient.sql("""
                        INSERT INTO production_cost_record
                            (cost_no, cost_type, amount, status, department_name, supplier_name, description)
                        VALUES
                            (:costNo, :costType, :amount, :status, '生产成本测试组', '外协成本测试供应商', '成本汇总测试')
                        """)
                .param("costNo", costNo)
                .param("costType", costType)
                .param("amount", BigDecimal.valueOf(amount))
                .param("status", status)
                .update();
    }
}
